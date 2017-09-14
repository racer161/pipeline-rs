class fontMetrics
{
    constructor(fontSize, fontFamily,parentDiv){
        this.measureDiv = document.createElement('pre');
        this.parentDiv = parentDiv;
        this.parentDiv.appendChild(this.measureDiv);
        this.measureDiv.className = "pipeText-fontMetric";
        
        this.setFontFamily(fontFamily);
        this.setFontSize(fontSize);
    }
    
    getWidth(string){
        this.measureDiv.textContent = string;
        return this.measureDiv.offsetWidth;
    }
    
    setFontSize(fontSize){ 
        this.fontSize = fontSize; 
        this.measureDiv.style.fontSize = this.fontSize + "pt";
        this.lineHeight = this.getHeight("ABC");
    }
    
    setFontFamily(fontFamily){
        this.fontFamily = fontFamily; 
        this.measureDiv.style.fontFamily = fontFamily;
        this.lineHeight = this.getHeight("ABC");
    }
    
    getHeight(string)
    {
        this.measureDiv.textContent = string;
        return this.measureDiv.offsetHeight;
    }
    
    fitInWidth(string,width)
    {
        var currentSize = this.fontSize;
        this.setFontSize(1);
        while(this.getWidth(string) < width)
        {
            this.setFontSize(this.fontSize+1);
        }
        var finalSize = this.fontSize;
        this.fontSize = currentSize;
        return finalSize;
    }
}