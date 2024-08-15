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


  // Estimated files:
  // hauls (29 purse-seine and 522 trawling in 2024), ~10KB each
  // sizes ~13MB
  // biomass port/year ~2MB
  // tracks geometry ~2MB
  // effort

  constructor(){
    
    

  }





  // Load map files
  loadMapFiles = function(mod){
    // Effort maps
    // Tracks
    // Current haul
    let promises = [];
    let urls = [];

    let modURL = mod == 'trawling' ? 'trawlingData' : mod == 'purse-seine' ? 'purseSeineData' : 'recreational';
    let modCode = mod == 'trawling' ? 'trawling' : mod == 'purse-seine' ? 'ps' : 'rec';
    let baseURL = '/VISAP/data/' + modURL + '/';

    // Effort maps and legends
    // All is not shown in the app, as we separate between fishing modalities
    let effortUnits = ['euros', 'hours', 'kg'];
    let effortYears = ['2019', '2020', '2021', '2022', '2023', '2024'];

    effortUnits.forEach(eUnit => {
      effortYears.forEach(eYear => {
        urls.push(baseURL + 'effort/fishingEffort_' + eUnit + '_' + eYear + '_' + modCode + '.png');
      });
      urls.push(baseURL + 'effort/fishingEffort_' + eUnit + '_' + modCode + '_legend.png');
    });
    
    // Tracks JSON
    urls.push(baseURL + modCode + '_hauls.json')

    // Create promises
    for (let i = 0; i < urls.length; i++){
      // Check if this file was already requested
      let fileWasRequested = this.requestedFiles.indexOf(urls[i]) != -1;

      // Keep track of requested files. Skip if already requested
      if (fileWasRequested)
        continue;
      else
        this.requestedFiles.push(urls[i]);

      // Check file extension
      let extension = urls[i].split('.').pop();
      promises.push(
        fetch(urls[i])
        .then( r => {
          if (!r.ok){
            throw new Error(urls[i] + " not found.");
          }
          // Image
          if (extension == 'png')
            return r.blob();
          // JSON
          else if (extension == 'json' || extension == 'geojson')
            return r.json();
        })
        .then(res => {
          let content = undefined;
          // Image
          if (extension == 'png'){
            let img = document.createElement('img');
            img.src = URL.createObjectURL(res);
            content = img;
          }// JSON
          else if (extension == 'json' || extension == 'geojson') {
            content = res;
          }
          // Response
          let response = {
            'url': urls[i],
            'content': content,
            'extension': extension
          }
          this.loadedFilesLog.push(response);
          return response;
        })
        .catch(e => {
          //console.error("File not at " + e.stack.split('\n')[1].split('/').pop());
        })
      )
    }

    return Promise.allSettled(promises)
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