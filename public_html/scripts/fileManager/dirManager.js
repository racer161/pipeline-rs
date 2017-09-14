class dirManager
{
    constructor(socket)
    {
        this.socket = socket;
    }
    
    getRootDir()
    {
        socket.emit("getRootDir",{});
    }
    
    socket.on("update_dir",function(data)
    {
        
    });
}