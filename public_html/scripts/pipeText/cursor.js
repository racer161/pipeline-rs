class cursor
{
    constructor(height,parentDiv){
        this.cursorDiv = document.createElement('div');
        this.cursorDiv.className ="pipeText-cursor";
        this.cursorDiv.style.height = height + "px";
        
        //coordinate variables
        this.x = 0.0;
        this.y = 0.0;
        this.index = 0;
        
        //highlight coordinate variable
        this.hIndex = 0;
        
        this.width = 1;
        this.height = height;
        parentDiv.appendChild(this.cursorDiv);
        
        this.isHighlighting = false;
    }
    
    place(x,y,index){
        this.cursorDiv.style.height = this.height + "px"; 
        //set cursor position
        this.cursorDiv.style.top = y + "px";
        this.cursorDiv.style.left = x + "px";
        this.x = x;
        this.y = y;
        this.index = index;
        this.hIndex = 0;
        this.isHighlighting = false;
    }//actually sets the position of the cursor to the given x and y
    
    highlight(startIndex, endIndex){
        this.cursorDiv.style.height = 0 + "px"; 
        this.index = startIndex;
        this.hIndex = endIndex;
        this.isHighlighting = true;
    }
    
    setHeight(height){
        this.cursorDiv.style.height = height + "px"; 
        this.height = height;
    }    
}