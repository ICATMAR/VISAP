


class WMTSTileManager {

  // Store loaded tiles based on URL
  // Store grayscale image (and colored image? --> this may change on user input for legend type)
  loadedTiles = {};

  // Current legend
  // Legends are loaded in FileManager, triggered by WMTSLegend.vue. This component sets the currentLegend
  // As loadProcessStoreTile is called from Map.vue when defining the wmts source, it is hard to make the 
  // data connection from Map.vue and WMTSLegend.vue so better store the information here
  currentLegend = {};
  currentRangeTransformFunc = undefined;

  constructor(){

  }


  // Tile processing
  // Legend structure can be seen in FileManager.js
  loadProcessStoreTile = (imageTile, src, inLegend) => {
    let legend = inLegend || this.currentLegend;
    // Tile image that will be finally used by OpenLayers
    const tileImg = imageTile.getImage();
    tileImg.crossOrigin = 'anonymous';

    // If src was already loaded
    if (this.loadedTiles[src] != undefined){
      this.processTile(this.loadedTiles[src].grayImage, tileImg, legend);
    } else {
      // Clone the image to avoid the event source.on('tileloadend') linked to tileImg.onload
      const grayImage = tileImg.cloneNode(true);
      grayImage.onload = () => {
        this.loadedTiles[src] = {'grayImage': grayImage}
        this.processTile(grayImage, tileImg, legend); // Triggers source.on('tileloadend')
      }
      // Work with the grayImage.onload event instead of the tileImg.load event that is linked to the tile
      grayImage.src = src;
  }
  }


  processTile = (grayImage, tileImg, legend) => {
    // Create a canvas, paint it, get pixels, modify pixels, get pixels from canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = grayImage.width;
    canvas.height = grayImage.height;
    context.drawImage(grayImage, 0, 0);
    const imageData = context.getImageData(0, 0, grayImage.width, grayImage.height);
    const modifiedImageData = this.processTileColors(imageData, legend);
    context.putImageData(modifiedImageData, 0, 0);
    tileImg.src = canvas.toDataURL(); // Triggers source.on('tileloadend')
  }


  // TODO: Use legends
  processTileColors = (imageData, legend) => {
    let data = imageData.data;
    debugger;
    for (let i = 0; i < data.length; i += 4) {
      let value = this.currentRangeTransformFunc(data[i]/255);
      let colorIndex = Math.floor(value * (legend.colorsRGB.length-1));
      // Assing colors
      data[i] = legend.colorsRGB[colorIndex][0];
      data[i + 1] = legend.colorsRGB[colorIndex][1];
      data[i + 2] = legend.colorsRGB[colorIndex][2];
    }
    return imageData;
  }


}


export default WMTSTileManager;