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
  effortLayer;

  isLoading = false;
  mapFilesLoaded = false;


  constructor(mod) {
    this.mod = mod;
    this.haulsLayerName = mod + 'Hauls';
    this.effortLayerName = mod + 'Effort';
  }


  async initMapFilesLoad() {

    // Is in the process of being loaded
    if (this.isLoading || this.mapFilesLoaded)
      return;
    this.isLoading = true;

    // Load effort maps and hauls
    await window.FileManager.loadMapFiles(this.mod).then((results) => {
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
          // Is legend
          if (fileName.includes('legend'))
            this.effortMaps[unit].legend = res.value.content;
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
            this.effortMaps[unit][filtNum[0]] = res.value.content;
          }
        }
        // Hauls
        else if (res.value.extension == 'json') {
          this.processJSONFile(res.value.content);
        }
      }
      // Create effort layer
      this.createEffortLayer();
      // Status
      this.isLoading = false;
      this.mapFilesLoaded = true;
      console.log("Files for section Map and modality " + this.mod + " loaded.")
    });
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

      // Create geoJSON
      let feature = {
        'type': 'Feature',
        'properties': {
          "id": jsonFile[i].Id,
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
    this.haulsLayer = new ol.source.Vector({
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




  // Create effort OL layer
  createEffortLayer() {
    let unit = window.GUIManager.map.currentEffortUnit;
    let year = window.GUIManager.map.currentEffortYear;
    let eMapsUnit = this.effortMaps[unit];
    if (!eMapsUnit[year]){
      year = Object.keys(eMapsUnit).shift();
      window.GUIManager.map.currentEffortYear = year; // WARN: should this be an event? Or is the vue effort widget reactive? This only happens once
    }

    this.effortLayer = new ol.layer.Image({
      name: this.effortLayerName,
      source: new ol.source.ImageStatic({
        url: '',
        imageExtent: [-1, 39, 6, 44],
        projection: 'EPSG:4326'
      }),
      zIndex: -1,
      opacity: 0.8,
    });
  }

} // End of class




export { FishingData }