class layoutManager
{
    constructor()
    {
        this.pipeContainer = document.createElement('div');
        this.pipeContainer.className = "pipeText-container";
        document.body.appendChild(this.pipeContainer);
        
        this.sideBar = document.createElement('div');
        this.sideBar.className = "pipeText-sideBar";
        this.pipeContainer.appendChild(this.sideBar);
        
        this.dirTree = document.createElement('div');
        this.dirTree.className = "pipeText-sideBar-dirTree-1";
        this.sideBar.appendChild(this.dirTree);
        
        this.mainScroll = document.createElement('div');
        this.mainScroll.className = "pipeText-mainScroll";
        this.pipeContainer.appendChild(this.mainScroll);
        
        this.pipeFrames = {};
        //TODO: Save user defined proportions
        var self = this;
        
        document.addEventListener('mousewheel',function(e) 
        {
            if (e.deltaX < 0) {
                self.sideBar.style.left = "-200px";
            }
            if (e.deltaX >0) {
                
                self.sideBar.style.left = "0px";
            }
        },{passive:true});
        
    }
    
    newPipeFrame(docState,docID)
    {
        this.pipeFrames[docID] = document.createElement('div');//actual div
        this.pipeFrames[docID].className = "pipeText-content";
        this.mainScroll.appendChild(this.pipeFrames[docID]);
        return new pipeFrame(this.pipeFrames[docID],docState,docID);//logical pipeframe instantiation 
    }
    
    displayDir(dirTree)
    {
        while (this.sideBar.hasChildNodes()) 
        {
          this.sideBar.removeChild(node.lastChild);
        }
    }
}