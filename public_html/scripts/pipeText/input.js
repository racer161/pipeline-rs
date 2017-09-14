class inputListener
{
    constructor(cursor,parentDiv,parent)
    {
        this.cursor = cursor;
        this.parentDiv = parentDiv;
        this.parent = parent;
        var self = this;
      
        
        //TODO : Make this assignable when I create a global input manager
        document.addEventListener('selectionchange', function(event)
        {
            if(window.activePipeFrame === self)
            {
                var selection = document.getSelection();
                if(selection.type === "Range")
                {
                    self.setSelectionRange(selection.anchorOffset,selection.focusOffset);
                }else 
                {
                    var index = selection.anchorOffset;
                    //if we land on a new line put the cursor at the end of the last line
                    if(self.parent.newLines.indexOf(index) > -1)
                    {
                        index-=2;
                    } 
                    else if(self.parent.newLines.indexOf(index+1) > -1) 
                    {
                        index-=1;
                    }//if we're on iOS safari
                    self.placeCursorAtIndex(index);
                }//Something is Highlighted
            }
        },{passive:true});
        
        //TODO : Make this assignable when I create a global input manager
        this.parentDiv.addEventListener('keydown', function(event)
        {
            if(!event.ctrlKey)
            {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                self.keyDownListener(event);
            }
        });
        
        this.parent.highlightPre.addEventListener('focus', function(event)
        {
            window.activePipeFrame = self;
            //console.log("focusing!!!");
        });
        
        this.parent.highlightPre.addEventListener('blur', function(event)
        {
            window.activePipeFrame = undefined;
            //console.log("blurring!!!");
        });
    }
    
    keyDownListener(event){
        this.cursor.cursorDiv.classList.remove("pipeText-cursor");
  
        void this.cursor.cursorDiv.offsetWidth;//triggers reflow forcing cursor update
        // -> and re-adding the class
        this.cursor.cursorDiv.classList.add("pipeText-cursor");
        if (event.key == "Backspace")
        {  
            if(this.cursor.index == 0){ return; }//if we're at the first index do nothing
            if(this.parent.currenString[this.cursor.index-1] == "\n"){
                this.delete(this.cursor.index-2,this.cursor.index);
            }//If its a newline then delete both the \r and \n
            else if(this.cursor.isHighlighting){ 
                this.delete(this.cursor.index,this.cursor.hIndex);  
            }//if the highlighter is active then delete the highlighted area
            else{
                this.delete(this.cursor.index-1,this.cursor.index);
            }//regular behavior

        }//Backspace
        else if (event.key == "ArrowLeft")
        {
            if(this.parent.currenString[this.cursor.index-1] == "\n") {
                if(this.parent.currenString[this.cursor.index-3] == "\n")
                {
                    this.placeCursorAtIndex(this.cursor.index-2); 
                }//double new line
                else{
                    this.placeCursorAtIndex(this.cursor.index-3); 
                }//single new line
                //this comment is more for me than other devs
                //If you get this far and want to understand, email me at ethan@spurlock.io.

            }//If its a newline then we skip it
            else{
                this.placeCursorAtIndex(this.cursor.index-1);
            }//regular behavior
        }
        else if (event.key == "ArrowUp")
        {
            this.moveVertical(true);
        }
        else if (event.key == "ArrowRight")
        {
            if(this.parent.currenString[this.cursor.index] == "\r"){
                this.placeCursorAtIndex(this.cursor.index+2); 
            }//If its a newline then we skip it
            else{
            this.placeCursorAtIndex(this.cursor.index+1);
            }//regular behavior
        }
        else if (event.key == "ArrowDown")
        {
            this.moveVertical(false);
        }
        else if (event.key == "Enter")
        {
            this.insert("\r\n",this.cursor.index);
        }
        else if (event.key == "Tab")
        {
            this.insert("\t",this.cursor.index);
        }
        else if (event.key.length > 1)
        {
            console.log(event.key);
        }
        else
        {
            this.insert(event.key,this.cursor.index);
        }
    }
   
    insert(string,index){
        var ops = [];
        for(var i = index; i < index + string.length; i++)
        {
            ops.push({pri: pri, ty: 'ins', ix: this.parent.docState.xform_ix(i), id: getid(), ch: string.charAt(i-index)});
        }//generate insert operations with the docstate adjusted index
        this.parent.localUpdate(ops);
        this.placeCursorAtIndex(index + string.length);
    }
    
    delete(startRange,endRange){
        var ops = [];
        for(var i = startRange; i < endRange; i++)
        {
            ops.push({pri: pri, ty: 'del', ix: this.parent.docState.xform_ix(i), id: getid()});
        }//generate delete operations with the docstate adjusted index
        this.parent.localUpdate(ops);
        this.placeCursorAtIndex(startRange);
    }
    
    processEvent(X,Y, type)
    {
        var loc = this.getLocation(X,Y);
        this.router(loc,type);
    }
    
    getLocation(X,Y)
    {
        var lineInfo = this.getRow(Y),
            endOffset = this.parent.newLines[lineInfo.num+1]-2,
            pageOffsetX = X - this.parentDiv.offsetLeft,
            measuredOffset = 0.0,
            lastCharHalf = 0.0,
            i = this.parent.newLines[lineInfo.num]; //if we aren't on the first line then the starting offset is the last newLine index
        
        
        while(i <= endOffset)
        {
            //we're on the i-1 character so we just add the other half
            if(measuredOffset >= pageOffsetX && pageOffsetX != 0){   
                measuredOffset -= lastCharHalf;
                //this.place(event.type,measuredOffset,target.offsetTop,i,target);
                return { x : measuredOffset, y : lineInfo.height, index : i-1};
            }//then set the cursor to the measuredOffset
            else {
                var half = (this.parent.fontMetrics.getWidth(this.parent.currenString[i]))/2;//we find half the char width and add it to measure offset
                measuredOffset += (half+lastCharHalf);
                lastCharHalf = half;
            }//we haven't found the char index yet
            i++;
        }
        
        //place the cursor at the end of the line
        measuredOffset+=lastCharHalf;
        return { x : measuredOffset, y : lineInfo.height, index : i-1};
    }
    
    getRow(Y)
    {
        var lineHeight = this.parent.fontMetrics.getHeight("ABC"); 
        var num = parseInt(Y/lineHeight);
        return {num : num, height : lineHeight*num };
    }
    
    router(loc,type)
    {
        if(type == "mousedown") 
        { 
            this.cursor.place(loc.x,loc.y,loc.index); 
        }
        else if( type == "touchstart") 
        { 
            this.cursor.place(loc.x,loc.y,loc.index);
        }
        else if( type == "touchmove") 
        { 
            this.cursor.place(loc.x,loc.y,loc.index);
        }
                
    }

    placeCursorAtIndex(index){
        var selectedDiv = this.parent.currentFrame.firstChild;
        var line = 0;
        while (this.parent.newLines[line]-2 < index){ line++ };
        line -=1; //if we're on the first line no need to subtract
        
        var measuredOffset = this.parent.fontMetrics.getWidth(this.parent.currenString.substring(this.parent.newLines[line],index));
        this.cursor.place(this.parentDiv.offsetLeft+measuredOffset,line*this.parent.fontMetrics.getHeight("ABC"),index); 
    }
    
    moveVertical(up)
    {
        if(up){
            var loc = this.getLocation(this.cursor.x, (this.cursor.y-this.parentDiv.offsetTop)-this.parent.lineHeight);
            
        }
        else{
            var loc = this.getLocation(this.cursor.x, (this.cursor.y-this.parentDiv.offsetTop)+this.parent.lineHeight);
        }//down
        
        this.cursor.place(loc.x,loc.y,loc.index,loc.target);   
    }
    
    setSelectionRange(start, end)
    {
        //flip the coords if start is > end
        if(start > end)
        {
            var temp = start;
            start = end;
            end = temp;
        }
        this.cursor.highlight(start,end);
    }
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function stringAsArray(string)
{
    var arr = [];
    for(var i=0;i<string.length;i++)
    {
        arr.push(string.charCodeAt(i));
    }
    return arr;
}