


class WMTSTileManager {

  // Store loaded tiles based on URL
  // Store grayscale image (and colored image? --> this may change on user input for legend type)
  loadedTiles = {};

  constructor(){

  }


  // Tile processing
  loadProcessStoreTile = (imageTile, src) => {
    // Tile image that will be finally used by OpenLayers
    const tileImg = imageTile.getImage();
    tileImg.crossOrigin = 'anonymous';

    // If src was already loaded
    if (this.loadedTiles[src] != undefined){
      this.processTile(this.loadedTiles[src].grayImage, tileImg);
    } else {
      // Clone the image to avoid the event source.on('tileloadend') linked to tileImg.onload
      const grayImage = tileImg.cloneNode(true);
      grayImage.onload = () => {
        this.loadedTiles[src] = {'grayImage': grayImage}
        this.processTile(grayImage, tileImg); // Triggers source.on('tileloadend')
      }
      // Work with the grayImage.onload event instead of the tileImg.load event that is linked to the tile
      grayImage.src = src;
  }
  }


  processTile = (grayImage, tileImg) => {
    // Create a canvas, paint it, get pixels, modify pixels, get pixels from canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = grayImage.width;
    canvas.height = grayImage.height;
    context.drawImage(grayImage, 0, 0);
    const imageData = context.getImageData(0, 0, grayImage.width, grayImage.height);
    const modifiedImageData = this.processTileColors(imageData);
    context.putImageData(modifiedImageData, 0, 0);
    tileImg.src = canvas.toDataURL(); // Triggers source.on('tileloadend')
  }


  // TODO: Use legends
  processTileColors = (imageData) => {
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Example: red colors
      data[i] = data[i];     // Red
      data[i + 1] = 0; // Green
      data[i + 2] = 0; // Blue
    }
    return imageData;
  }


}


export default WMTSTileManager;