class networkManager
{
    constructor(socket)
    {
        this.socket = socket;
        this.layoutManager = new layoutManager();
        
        //a dictionary of pipeframes indexed by the files they hold
        //for instance "com.java.thing" : pipeFrame;
        this.pipeFrames = {};
        
        var self = this;
        
        this.socket.on('update', function(opsChunk)
        { 
            
            Object.keys(opsChunk).forEach(function(docID)
            {
                console.log(docID + ':' + JSON.stringify(opsChunk[docID]));
                //key - the docID we're routing the ops to
                if(self.pipeFrames[docID])
                {
                    self.pipeFrames[docID].update(opsChunk[docID])
                }// if the key exists we send the ops to the update() of the pipeframe for that doc
                else
                {
                    console.error("doc doesn't exist!");
                }//we shouldn't be able to get here
            });
        });
        
        this.openNewDoc("Hello World");
        
        this.socket.emit('getRootDir',function(rootDirTree)
        {
            console.log(rootDirTree);
        });
    }

    openNewDoc(docID)
    {
        var self = this;
        this.socket.emit('docRequest',docID,function(newDocBody, ops)
        {
            //if there's an error print it and exit
            //TODO: Show User!
            if(newDocBody.err){ console.log(newDocBody.err); return; } 
            //get a pipeFrame from the layout manager and return the logical instantiation of it
            //for storage here so we can call its update
            self.pipeFrames[docID] = self.layoutManager.newPipeFrame(new docState(newDocBody),docID);
            if (ops)
            {
                self.pipeFrames[docID].update(ops);
            }//apply operations to the doc if they exist
        });

    }

}