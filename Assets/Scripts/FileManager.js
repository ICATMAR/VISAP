// Loads and stores the urls of the loaded files for later download









class FileManager {

  legendsFilePath = './Assets/Legends/'

  LEGENDNAMES = [
    'Alg2',
    'Green',
    'Inferno',
    'Occam',
    'OccamCold',
    'OccamPastel',
    'TwoSidedBlueWhiteRed',
    'TwoSidedDarkScaleColors',
    'TwoSidedGreenBlueWhiteOrangeRed',
    'TwoSidedOccam',
    'Zebra'
  ];

  BASELAYERURLS = [
    './Assets/BaseLayer/Imagery.png',
    './Assets/BaseLayer/Bathymetry.png',
    // './Assets/BaseLayer/Ocean.png',
    // './Assets/BaseLayer/OSM.png'
  ];

  requestedFiles = [];
  loadedFilesLog = [];



  constructor(){
    
  }




  // LEGENDS
  // Load legends
  loadLegends = function(steps){
    let promises = [];
    steps = steps || 50;
    
    for (let i = 0; i < this.LEGENDNAMES.length; i++){
      promises.push(this.getLegend(this.LEGENDNAMES[i], steps));
    }

    return new Promise(resolve => resolve(Promise.allSettled(promises)));
  }

  // Get legends
  getLegend = function(legendName, steps){

    return new Promise ((resolve, reject) => {

      let img = new Image();
      img.src = this.legendsFilePath + legendName + '.png';
      

      img.onload = () => {
        console.log('Legend loaded')
        // Create canvas
        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext("2d");
        // Paint image and get image data
        ctx.drawImage(img, 0,0);
        let imgData = ctx.getImageData(0, Math.floor(canvas.height/2), canvas.width, 1); // one line in the middle
        let pixels = imgData.data;
        
        //img.style.position = "absolute";
        //img.style.top = "0px";
        //document.body.append(img);

        // Store the color according to the number of steps
        // WARN: Alpha is not considered
        steps = steps || 10;
        let colorsStr = [];
        let colorsRGB = [];
        let colorsFloat32 = new Float32Array(steps*3);
        for (let i = 0; i< steps; i++){
          let tmp = i * canvas.width / steps;
          let pixelPosition = Math.floor((canvas.width / steps) / 2 + tmp); // Pixel index + Half step (take the middle of the area, not the start)
          // RGB as string
          colorsStr[i] = 'rgb(' + pixels[pixelPosition*4] + ',' + pixels[pixelPosition*4 + 1] + ',' + pixels[pixelPosition*4+2] + ')';
          // RBG as array
          colorsRGB[i] = [pixels[pixelPosition*4], pixels[pixelPosition*4+1], pixels[pixelPosition*4+2]];
          // RGB as typed array (runs 5x faster in Animation.js)
          colorsFloat32[i*3] = pixels[pixelPosition*4];
          colorsFloat32[i*3 + 1] = pixels[pixelPosition*4 + 1];
          colorsFloat32[i*3 + 2] = pixels[pixelPosition*4 + 2];
        }
        debugger
        resolve({colorsStr, colorsRGB, colorsFloat32, img, legendName});
      }
      img.onerror = () => {
        console.error('Legend not found with url: ' + img.src);
        reject()
      };
      
    });

  }





  // Base layer
  loadBaseLayerIcons = function(){
    let promises = [];

    for (let i = 0; i < this.BASELAYERURLS.length; i++){
      promises.push(this.loadImage(this.BASELAYERURLS[i]));
    }

    return new Promise(resolve => resolve(Promise.allSettled(promises)));
  }
  // Load image
  loadImage = function(url){

    return new Promise ((resolve, reject) => {
      let img = new Image();
      img.src = url;
      let name = url.split('/').reverse()[0].replace('.png', '');
        
      img.onload = () => {
        
        resolve({name, img});
      }
      img.onerror = (e) => console.error(e);
    });

  }

}


export default FileManager;