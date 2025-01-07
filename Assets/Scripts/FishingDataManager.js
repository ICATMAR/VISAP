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

  loadingMapFilesPromise = null;
  isLoadingMapFiles = false;
  mapFilesLoaded = false;

  catchComposition = {}

  loadingOverviewPromise = null;
  isLoadingOverviewFiles = false;
  overviewFilesLoaded = false;

  loadingLengthDistPromise = null;
  isLoadingLengthDist = false;
  lengthDistFilesLoaded = false;

  lengthDist = undefined;
  lengthDistCategories = ['byYear', 'bySeason', 'byMetier', 'byPortArea'];
  lengthDistCategoriesKeyAttr = ['Year', 'Season', 'Metier', 'PortArea'];

  constructor(mod) {
    this.mod = mod;
    this.haulsLayerName = 'fishingHauls'//mod + 'Hauls';
  }


  async loadMapFiles() {

    // Is in the process of being loaded
    if (this.isLoadingMapFiles) {
      return this.loadingMapFilesPromise; // Returns the current promise
    }
    // If already loaded
    if (this.mapFilesLoaded)
      return Promise.resolve();

    this.isLoadingMapFiles = true;

    // Load effort maps and hauls
    this.loadingMapFilesPromise = window.FileManager.loadMapFiles(this.mod).then((results) => {
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
          this.processHaulFile(res.value.content);
        }
      }

      // Status
      this.isLoadingMapFiles = false;
      this.loadingMapFilesPromise = null;
      this.mapFilesLoaded = true;
      console.log("Files for section Map and modality " + this.mod + " loaded.")
    });

    return this.loadingMapFilesPromise;
  }


  async loadOverviewFiles() {
    // Is in the process of being loaded
    if (this.isLoadingOverviewFiles) {
      return this.loadingOverviewPromise; // Returns the current promise
    }
    // If already loaded
    if (this.overviewFilesLoaded)
      return Promise.resolve();

    this.isLoadingOverviewFiles = true;

    // Load effort maps and hauls
    this.loadingOverviewPromise = window.FileManager.loadOverviewFiles(this.mod).then((results) => {

      for (let i = 0; i < results.length; i++) {
        let res = results[i];
        // Failed to load
        if (res.value == undefined)
          continue;
        // Catch composition
        if (res.value.extension == 'json') {
          // Season or Port catch composition
          if (res.value.url.split('/').pop().includes('port'))
            this.catchComposition.byPort = res.value.content;
          else if (res.value.url.split('/').pop().includes('season'))
            this.catchComposition.bySeason = res.value.content;

        }
      }

      // Status
      this.isLoadingOverviewFiles = false;
      this.loadingOverviewPromise = null;
      this.overviewFilesLoaded = true;
      console.log("Files for section overview and modality " + this.mod + " loaded.")
    });

    return this.loadingOverviewPromise;
  }


  // Load length distribution (only one file)
  async loadLengthDistFile() {
    // Is in the process of being loaded
    if (this.isLoadingLengthDist)
      return this.loadingLengthDistPromise;

    // If already loaded
    if (this.lengthDistFilesLoaded)
      return Promise.resolve();

    this.isLoadingLengthDist = true;

    // Load length-distribution file
    return this.loadingLengthDistPromise = window.FileManager.loadLengthDistFile(this.mod).then((result) => {
      if (result != undefined) {

        this.lengthDist = this.processLengthDist(result.content);
      }
      // Status
      this.isLoadingLengthDist = false;
      this.loadingLengthDistPromise = null;
      this.lengthDistFilesLoaded = true;
      console.log("Files for section length-distribution and modality " + this.mod + " loaded.")
    });
  }



  // Process Haul file
  // Creates geoJSON object and OL Layer
  processHaulFile(jsonFile) {
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


  // Process length distribution data for the creation of plots
  processLengthDist(rawJSON) {
    // This code does almost the same as fillDataStruct and findSizeAndNum..., but for the highest level
    let speciesData = {};

    rawJSON.forEach(item => {
      // Create object per species
      if (speciesData[item.ScientificName] == undefined) {
        speciesData[item.ScientificName] = {
          'rawData': [],
          'byYear': {},
          'bySeason': {},
          'byMetier': {}, // Should not be here in Purse Seine, but it is not essential to fix it
          'byPortArea': {},
          'bySize': {},
          'breadcrumb': '',
          'rangeSize': [Infinity, -Infinity],
          'rangeNumInd': [Infinity, -Infinity],
          // Mininum size, Maturity size
          'L50': item.L50,
          'MCRS': item.MCRS,
        };
      }
      // Raw data
      speciesData[item.ScientificName].rawData.push(item);
      // Species > Size
      if (speciesData[item.ScientificName].bySize[item.Size] == undefined) {
        speciesData[item.ScientificName].bySize[item.Size] = {
          'rawData': [],
          'numInd': 0,
          'N': 0,
        }
      }
      // bySize
      speciesData[item.ScientificName].bySize[item.Size].rawData.push(item);
      speciesData[item.ScientificName].bySize[item.Size].numInd += parseFloat(item.Abundance_NSpecimen_Km2 || item.Abundance_NSpecimen);
      speciesData[item.ScientificName].bySize[item.Size].N += parseInt(item.N) || 0;
    });


    // Sort by year, season and metier
    Object.keys(speciesData).forEach(sName => {
      let specData = speciesData[sName];

      // Find X Y ranges per species
      this.findSizeAndNumIndRanges(specData, sName);
      // L50 and MCRS defined previously

      // Iterate raw data
      specData.rawData.forEach(item => {
        // Fill data for the different categories
        for (let i = 0; i < this.lengthDistCategories.length; i++) {
          // Species > Year, Season, Metier...
          this.fillDataStruct(specData, item, this.lengthDistCategories[i], this.lengthDistCategoriesKeyAttr[i]); // fillDataStruct(specData, item, 'byYear', 'Year');
        }
      });
      // Find X Y ranges per species and categories
      for (let i = 0; i < this.lengthDistCategories.length; i++) {
        Object.keys(specData[this.lengthDistCategories[i]]).forEach(key => {
          this.findSizeAndNumIndRanges(specData[this.lengthDistCategories[i]][key], sName);
          specData[this.lengthDistCategories[i]][key].L50 = specData.L50;
          specData[this.lengthDistCategories[i]][key].MCRS = specData.MCRS;
          specData[this.lengthDistCategories[i]][key].key = (specData.key || '') + key + '_';
        });
      }
    });

    return speciesData;
  }

  // Process length dist for categories
  processLengthDistPerCategory(specData, keyClassName) {
    if (specData[keyClassName] == undefined) {
      specData[keyClassName] = {};
      specData.rawData.forEach(item => {
        this.fillDataStruct(specData, item, keyClassName, this.lengthDistCategoriesKeyAttr[this.lengthDistCategories.indexOf(keyClassName)]);
      });
      // Find ranges
      Object.keys(specData[keyClassName]).forEach(key => {
        this.findSizeAndNumIndRanges(specData[keyClassName][key]);
        // Heritage
        specData[keyClassName][key].L50 = specData.L50;
        specData[keyClassName][key].MCRS = specData.MCRS;
        specData[keyClassName][key].key = (specData.key || '') + key + '_';
      });
    }
    
    return specData;
  }

  // Fill data structure function
  fillDataStruct(specData, item, keyClassName, attrName) {
    if (specData[keyClassName] == undefined) { debugger; }
    if (specData[keyClassName][item[attrName]] == undefined) {
      specData[keyClassName][item[attrName]] = {
        'rawData': [],
        'bySize': {},
        'breadcrumb': specData.breadcrumb + '>' + keyClassName,
      }
    }
    specData[keyClassName][item[attrName]].rawData.push(item);
    // Species > Year/Season/Metier/Port > Size
    if (specData[keyClassName][item[attrName]].bySize[item.Size] == undefined) {
      specData[keyClassName][item[attrName]].bySize[item.Size] = {
        'rawData': [],
        'numInd': 0,
        'N': 0,
      }
    }
    specData[keyClassName][item[attrName]].bySize[item.Size].rawData.push(item);
    specData[keyClassName][item[attrName]].bySize[item.Size].numInd += parseFloat(item.Abundance_NSpecimen_Km2 || item.Abundance_NSpecimen);
    specData[keyClassName][item[attrName]].bySize[item.Size].N += parseInt(item.N) || 0;
  };
  // Find ranges of sizes
  findSizeAndNumIndRanges(specData, sName) {
    sName = sName || specData.rawData[0].ScientificName;
    // Reset
    specData.rangeSize = [Infinity, -Infinity];
    specData.rangeNumInd = [Infinity, -Infinity];
    if (specData.bySize == undefined) { debugger }

    // Find X Y ranges per species
    Object.keys(specData.bySize).forEach(sKey => {
      // Ranges
      specData.rangeSize[0] = Math.min(specData.rangeSize[0], sKey);
      specData.rangeSize[1] = Math.max(specData.rangeSize[1], sKey);
      specData.rangeNumInd[0] = Math.min(specData.rangeNumInd[0], specData.bySize[sKey].numInd);
      specData.rangeNumInd[1] = Math.max(specData.rangeNumInd[1], specData.bySize[sKey].numInd);
    });
    if (specData.rangeNumInd[1] == 0) {
      console.warn('Maximum abundance for ' + sName + ' is zero, but ' + specData.rawData.length + ' entries are present.');
      specData.rangeNumInd[1] = 1;
    }
    // Calculate N
    specData.N = 0;
    specData.numInd = 0;
    specData.rawData.forEach(item => {
      specData.N += parseInt(item.N);
      specData.numInd += parseFloat(item.Abundance_NSpecimen || item.Abundance_NSpecimen_Km2);
    });
    specData.numInd = specData.numInd || 1;
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







  // Load haul file
  getHaulCatchComposition(id) {
    // Is loading haul file
    if (this.isLoadingHaulFile) {
      debugger;
      return this.loadingHaulPromise;
    }
    // If is already loaded
    if (this.hauls[id].catchComposition != undefined) {
      return Promise.resolve(this.hauls[id].catchComposition);
    }

    this.isLoadingHaulFile = true;

    // Load file
    this.loadingHaulPromise = window.FileManager.loadHaulCatchCompositionFile(id, this.mod)
      .then((res) => {
        this.hauls[id].catchComposition = res;
        this.isLoadingHaulFile = false;
        this.loadingHaulPromise = null;
        console.log("Haul catch composition loaded: " + id);
        return res;
      });

    return this.loadingHaulPromise;
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

  lengthDistCategories = ['byYear', 'bySeason', 'byMetier', 'byPortArea'];
  lengthDistCategoriesKeyAttr = ['Year', 'Season', 'Metier', 'PortArea'];

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

  lengthDistCategories = ['byYear', 'bySeason', 'byPortArea'];
  lengthDistCategoriesKeyAttr = ['Year', 'Season', 'PortArea'];

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
          color: 'rgba(' + colorPort + ', 0.8)',
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(0,0,0, 0.8)',
          width: isSelected ? 3 : 2,
        })
      }),
      zIndex: isSelected ? 100 : 1,
    })


    return portStyle
  }
}


export { TrawlingData, PurseSeineData }