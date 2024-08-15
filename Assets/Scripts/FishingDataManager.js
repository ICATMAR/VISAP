// Tracks points
// Effort layer
// Call the loading?
//import '../../lib/OpenLayers/ol_v7.0.0.js'

class FishingData {

  hauls = {};
  haulsGeoJSON = {
    'type': 'FeatureCollection',
    'features': []
  }
  haulsLayer;
  effortMaps = {};

  effortDataResolution = 500; // Image is around 4kx4k pixels
  effortBbox = [-1, 39, 6, 44]; // HARDCODED-> DEPENDS ON THE FISHING EFFORT IMAGE
  effortTmpColor = [];

  loadingPromise = null;
  isLoading = false;
  mapFilesLoaded = false;


  constructor(mod) {
    this.mod = mod;
    this.haulsLayerName = 'fishingHauls'//mod + 'Hauls';
  }


  async initMapFilesLoad() {

    // Is in the process of being loaded
    if (this.isLoading) {
      return this.loadingPromise; // Returns the current promise
    }
    // If already loaded
    if (this.mapFilesLoaded)
      return Promise.resolve();

    this.isLoading = true;

    // Load effort maps and hauls
    this.loadingPromise = window.FileManager.loadMapFiles(this.mod).then((results) => {
      for (let i = 0; i < results.length; i++) {
        let res = results[i];
        // Failed to load
        if (res.value == undefined)
          continue;
        // Effort map or legend
        if (res.value.extension == 'png') {
          // Organize
          let fileName = res.value.url.split('/').pop();
          let unit = fileName.includes('_euros_') ? 'euros' :
            fileName.includes('_hours_') ? 'hours' :
              fileName.includes('_kg_') ? 'kg' : undefined;
          if (unit == undefined) {
            debugger;
            continue;
          }
          if (this.effortMaps[unit] == undefined)
            this.effortMaps[unit] = {};
          // Legend
          if (fileName.includes('legend'))
            this.effortMaps[unit].legend = res.value.content;
          // Effort map
          else {
            // Get year
            let numbers = fileName.match(/\d+/g); // Regex expression to get numbers in string
            if (numbers.length == 0) {
              debugger;
            }
            let filtNum = numbers.filter(num => num >= 2018 && num <= 2029);
            if (filtNum.length != 1) {
              debugger;
            }
            let img = res.value.content;
            this.effortMaps[unit][filtNum[0]] = img;
          }
        }
        // Hauls
        else if (res.value.extension == 'json') {
          this.processJSONFile(res.value.content);
        }
      }

      // Status
      this.isLoading = false;
      this.loadingPromise = null;
      this.mapFilesLoaded = true;
      console.log("Files for section Map and modality " + this.mod + " loaded.")
    });

    return this.loadingPromise;
  }


  // Process JSON file
  // Creates geoJSON object and OL Layer
  processJSONFile(jsonFile) {
    this.rawJSON = JSON.parse(JSON.stringify(jsonFile));

    // Fill GeoJSON
    // https://github.com/cschwarz/wkx
    // There was a redifinition of require, which caused errors with ArcGIS widget
    var Buffer = require2('buffer').Buffer;
    var wkx = require2('wkx');

    for (let i = 0; i < jsonFile.length; i++) {
      //https://github.com/cschwarz/wkx
      //Parsing a node Buffer containing a WKB object
      if (jsonFile[i].geom === null) {
        debugger;
        continue;
      }

      // Define date internally
      let year = parseInt(jsonFile[i].Data.split('-')[0]);
      let month = parseInt(jsonFile[i].Data.split('-')[1]);
      let day = parseInt(jsonFile[i].Data.split('-')[2]);
      jsonFile[i].Date = new Date(year, month - 1, day, 12);

      // Read geometry
      let wkbBuffer = new Buffer(jsonFile[i].geom, 'hex');
      let geometry = wkx.Geometry.parse(wkbBuffer);
      let gJSON = geometry.toGeoJSON();
      delete jsonFile[i].geom; // delete geom, as we do not want it in the features
      jsonFile[i].geometry = gJSON; // Add geometry to haul info

      // Create geoJSON
      let feature = {
        'type': 'Feature',
        'properties': {
          "id": jsonFile[i].Id,
          "featType": 'haul',
          "info": jsonFile[i],
          'visible': true,
        },
        'geometry': gJSON,
      }
      this.haulsGeoJSON.features.push(feature);
      this.hauls[jsonFile[i].Id] = jsonFile[i];
    }


    // Create OL layer
    // Create URI
    let jsonSTR = JSON.stringify(this.haulsGeoJSON);
    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonSTR);
    // Create layer
    this.haulsLayer = new ol.layer.Vector({
      name: this.haulsLayerName,
      source: new ol.source.Vector({
        url: dataUri,
        format: new ol.format.GeoJSON(),
        attributions: '© ICATMAR (Institut Català de Recerca per la Governança del Mar)',
      }),
      style: this.haulsLayerStyle.bind(this),
    })
  }


  // Reactive style
  haulsLayerStyle(feature) {
    // If it is not visible
    let featDate = new Date(feature.C.info.Date);
    let visible = featDate > window.GUIManager.map.selStartDate && featDate < window.GUIManager.map.selEndDate;
    if (!visible) {
      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0,0,0,0.0)',
          width: 0,
        })
      })
    }

    let port = feature.C.info.Port;
    let colorPort = palette[port].color;

    // Check if this is the selected haul
    let isSelected = false;
    if (feature.C.info.Id * 1 == window.GUIManager.map.currentHaul)
      isSelected = true;

    let portStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(' + colorPort + ', 1)',
        width: isSelected ? 6 : 2,
      }),
      zIndex: isSelected ? 100 : 1,
    })
    let borderStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(0,0,0,0.6)',
        width: isSelected ? 12 : 4,
      }),
      zIndex: isSelected ? 100 : 1,
    })

    return [borderStyle, portStyle]
  }


  updateStyle() {
    // Update styles
    if (this.haulsLayer !== undefined)
      this.haulsLayer.getSource().dispatchEvent('change');
  }





  // Get effort map URI
  getEffortURI(unit, year) {
    let img = this.getEffortImg(unit, year);
    return img.src;
  }

  // Get effort image data
  getEffortImageData(inImg) {
    let img = inImg || this.getEffortImg();
    // Check if already processed
    if (img.imageData != undefined)
      return img.imageData;
    // Create canvas
    let tmpCnv = document.createElement('canvas');
    tmpCnv.width = this.effortDataResolution;
    tmpCnv.height = this.effortDataResolution;
    // Paint image to canvas
    let ctx = tmpCnv.getContext("2d");
    ctx.globalCompositeOperation = "source-destination";

    ctx.drawImage(img, 0, 0, tmpCnv.width, tmpCnv.height);
    // Get image data
    let imageData = tmpCnv.getContext("2d").getImageData(0, 0, tmpCnv.width, tmpCnv.height).data;

    // Add image data to img element
    img.imageData = imageData;
    return imageData;
  }

  // Get effort image
  getEffortImg(unit, year) {
    unit = unit || window.GUIManager.map.currentEffortUnit;
    year = year || window.GUIManager.map.currentEffortYear;
    let eMapsUnit = this.effortMaps[unit];
    if (!eMapsUnit[year]) {
      year = Object.keys(eMapsUnit).shift();
      window.GUIManager.map.currentEffortYear = year; // WARN: should this be an event? Or is the vue effort widget reactive? This only happens once
      console.warn('Requested year does not exists for this modality and unit');
    }
    return this.effortMaps[unit][year]
  }

  // Get the pixel color at given coordinates
  getEffortPixelColorAtCoord(coord, inImageData) {
    // Use input img or find the current one
    let imageData = inImageData || this.getEffortImageData();
    // Normalize coord
    let lon = coord[0];
    let lat = coord[1];

    let normX = (lon - this.effortBbox[0]) / (this.effortBbox[2] - this.effortBbox[0]);
    let normY = (lat - this.effortBbox[1]) / (this.effortBbox[3] - this.effortBbox[1]);
    // Flip normY
    normY = 1 - normY;

    let insideBbox = normX > 0 && normX < 1 && normY > 0 && normY < 1;
    if (!insideBbox) {
      this.effortTmpColor[3] = 0; // Force transparent pixel
      return this.effortTmpColor;
    }

    // Get color
    let row = Math.round(normY * this.effortDataResolution);
    let col = Math.round(normX * this.effortDataResolution);
    let index = row * this.effortDataResolution + col;

    this.effortTmpColor[0] = imageData[index * 4];
    this.effortTmpColor[1] = imageData[index * 4 + 1];
    this.effortTmpColor[2] = imageData[index * 4 + 2];
    this.effortTmpColor[3] = imageData[index * 4 + 3];

    return this.effortTmpColor;
  }





  // Get haul feature by id
  getHaulById(id) {
    return this.hauls[id];
  }

} // End of class







class TrawlingData extends FishingData {

  // Structure to fit with EffortLegend.vue
  effortUnitsInfo = {
    kg: {
      units: 'kg/km<sup>2</sup>',
      range: [0, 6850]
    },
    euros: {
      units: 'K €/km<sup>2</sup>',
      range: [0, 132]
    },
    hours: {
      units: 'h/km<sup>2</sup>',
      range: [0, 400]
    }
  }

  constructor() {
    super('trawling');
  }
}





class PurseSeineData extends FishingData {

  // Structure to fit with EffortLegend.vue
  effortUnitsInfo = {
    kg: {
      units: 't/km<sup>2</sup>',
      range: [0, 78]
    },
    euros: {
      units: 'K €/km<sup>2</sup>',
      range: [0, 79]
    },
    hours: {
      units: 'h/km<sup>2</sup>',
      range: [0, 230]
    }
  }

  constructor() {
    super('purse-seine');
  }


  // Overwritte Reactive style
  haulsLayerStyle(feature) {
    // If it is not visible
    let featDate = new Date(feature.C.info.Date);
    let visible = featDate > window.GUIManager.map.selStartDate && featDate < window.GUIManager.map.selEndDate;
    if (!visible) {
      return new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'rgba(0,0,0,0.0)',
          width: 0,
        })
      })
    }

    let port = feature.C.info.Port;
    let colorPort = palette[port].color;

    // Check if this is the selected haul
    let isSelected = false;
    if (feature.C.info.Id * 1 == window.GUIManager.map.currentHaul)
      isSelected = true;

    let portStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: isSelected ? 9 : 5,
        fill: new ol.style.Fill({
          color: 'rgba(' + colorPort + ', 1)',
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(0,0,0, 0.8)',
          width: isSelected ? 6 : 2,
        })
      }),
      zIndex: isSelected ? 100 : 1,
    })


    return portStyle
  }
}


export { TrawlingData, PurseSeineData }