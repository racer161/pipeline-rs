class pipeFrame
{
    constructor(pipeFrame,state,docID)
    {
        if(docID)
        {
            this.docID = docID;
        }//if we have an id then we're part of pipelineIDE
        this.docState = state;
        this.peer = new Peer();
        this.localStyleSheet = new pipeSheet();
        this.pipeFrame = pipeFrame;
        this.newLines = [];
        
        this.nextString = this.docState.get_str();// get the docstate string for the first time
        this.currenString = this.nextString;
        
        this.fontMetrics = new fontMetrics(12,"Inconsolata",this.pipeFrame);
        
        this.cursor = new cursor(this.fontMetrics.lineHeight,this.pipeFrame);
        
        //this is the pre that will be invisible and highlight friendly
        this.highlightPre = document.createElement('pre');
        this.highlightPre.className = "pipeText-frame-highlight";
        this.highlightPre.contentEditable = true;''
        this.pipeFrame.append(this.highlightPre);
        
        
        this.input = new inputListener(this.cursor,this.pipeFrame,this);
        
        this.currentFrame = document.createElement('pre');
        this.pipeFrame.appendChild(this.currentFrame);
        
        var t0 = performance.now();
        this.renderNextFrame();
        this.blit();
        var t1 = performance.now();
        console.log("Call to render took " + (t1 - t0) + " milliseconds.");
    }
    
    renderNextFrame()
    {
        var newFrame = document.createElement('div');
        newFrame.className = "pipeText-frame-visible";
        var newString = this.docState.get_str();
        newString += "\r\n";//add an ending newline character just in case
        var match = 0;
        
        this.newLines = []
        this.newLines.push(0);
        while(match < newString.length-1) 
        {
            match = newString.indexOf("\r\n",match);
            if(match == -1){ break; }else{ match+=2; }//if we don't find a match break else
                                                      //increment the match index past this current match
            this.newLines.push(match);  
        }
        
        
        var finalDOM = "";
        if(this.localStyleSheet.endIndices.length > 0)
        {
            var beginningIndex = 0;
            var lastStartIndex = 0;
            var lastEndingIndex = 0;
            while (lastEndingIndex < this.localStyleSheet.endIndices.length)
            {
                if(this.localStyleSheet.startIndices[lastStartIndex] < this.localStyleSheet.endIndices[lastEndingIndex])
                {
                    finalDOM += newString.substring(beginningIndex,this.localStyleSheet.startIndices[lastStartIndex]) 
                    + '<span style="' + this.localStyleSheet.styles[lastStartIndex] + '">';
                    beginningIndex = this.localStyleSheet.startIndices[lastStartIndex];
                    lastStartIndex += 1;
                }//an opening span comes next
                else
                {
                    finalDOM += newString.substring(beginningIndex,this.localStyleSheet.endIndices[lastEndingIndex]) + '</span>';
                    beginningIndex = this.localStyleSheet.endIndices[lastEndingIndex];
                    lastEndingIndex += 1;
                }//a closing span comes next
            }
        }else
        {
            finalDOM = newString;
        }
        
        //visible pre
        var coloredPre = document.createElement('pre');
        coloredPre.className = "pipeText-frame";
        
        //set font
        coloredPre.style.fontSize = this.fontMetrics.fontSize + "pt";
        coloredPre.style.fontFamily = this.fontMetrics.fontFamily;
        
        //fill and append the final pre
        coloredPre.innerHTML = finalDOM;
        newFrame.appendChild(coloredPre);
        
        //load the next round of variables for blitting
        this.nextString = newString;
        this.nextFrame = newFrame;
    }
    
    blit(){
        //set highlightable pre font size
        this.highlightPre.style.fontSize = this.fontMetrics.fontSize + "pt";
        this.highlightPre.style.fontFamily = this.fontMetrics.fontFamily;
        this.highlightPre.textContent = this.nextString;
        
        this.pipeFrame.removeChild(this.currentFrame);
        this.currentFrame = this.nextFrame;
        this.currenString = this.nextString;
        this.pipeFrame.appendChild(this.currentFrame); 
    }//blits the nextFrameDiv to the parentDiv
    
    setFont(size,family)
    {
        this.fontMetrics.setFontSize(size);
        this.fontMetrics.setFontFamily(family);
    }
    
    update(ops)
    {
        var rev = this.docState.ops.length;
        for (var i = 0; i < ops.length; i++) {
            this.peer.merge_op(this.docState, ops[i]); // for all the new revisions merge them into our docstate
        }

        if (rev < this.docState.ops.length) {
            var updateObject = {};
            updateObject[this.docID] = this.docState.ops.slice(rev);
            socket.emit('update', updateObject);//send revisions we have that others don't
        }
        
        this.renderNextFrame();
        this.blit();
    }//this will only be called by an event handler in pipeLineIDE
    
    localUpdate(ops)
    {
        // apply ops locally
        for (var i = 0; i < ops.length; i++) {
            this.docState.add(ops[i]);
        }
        if(this.docID)
        {
            var updateObject = {};
            updateObject[this.docID] = ops;
            socket.emit('update', updateObject);
            console.log('ops:' + JSON.stringify(ops));
            console.log('docstate: ' + this.docState.get_str());
        }//only send ops if we have a docID and are in pipelineIDE
        this.renderNextFrame();
        this.blit();
    }
    
    getRawText()
    {
        return this.docState.get_str();
    }
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
} 