import { TrawlingData, PurseSeineData } from './FishingDataManager.js'
import { GeoJSONWrapper } from './GeoJSONWrapperClass.js';


class DataManager {

  // Trawling hauls class
  // Purse-seine hauls class
  // ...
  geoJSONWrappers = {};

  constructor() {

    this.TrawlingData = new TrawlingData();
    this.PSData = new PurseSeineData();


    // File drop processing
    // TODO: should be dependant on the section/html container
    document.addEventListener('dragover', this.onDragOver);
    document.addEventListener('drop', this.onDropFiles.bind(this));

  }



  // USER ACTIONS
  // DRAG & DROP FILES
  onDragOver = function(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  // On drop event
  onDropFiles = function(event) {
    event.preventDefault();
    event.stopPropagation();
    this.onDragAndDropFiles(event.dataTransfer.files);
  }
  // Drag and drop
  // For now only geojson
  onDragAndDropFiles = function(files) {
    console.log(files.length + " files dropped.");
    let promises = [];
    // Iterate files
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let fileExtension = file.name.split('.').pop().toLowerCase();
      // Read files
      // For the moment only geoJSON files
      if (fileExtension == 'geojson')
        promises.push(window.FileManager.readFile(file, fileExtension))
    }

    // Resolve promises
    Promise.all(promises).then(values => {
      if (values.length == 0)
        return;
      let lastReceived;
      for (let i = 0; i < values.length; i++) {
        lastReceived = new GeoJSONWrapper(values[i]);
        let fileName = lastReceived.fileName;
        //  File alredy exists, add a count at the end
        if (this.geoJSONWrappers[fileName]) {
          let count = 0;
          let tmpFileName = fileName + '_' + count;
          while (this.geoJSONWrappers[tmpFileName] || count > 20) {
            count++;
            tmpFileName = fileName + '_' + count;
          }
          fileName = tmpFileName;
          lastReceived.fileName = tmpFileName;
        }
        // Assign to DataManager
        this.geoJSONWrappers[fileName] = lastReceived;
      }
      window.eventBus.emit('DataManager_geoJSONDataLoaded', lastReceived);
    })
  }




  // PUBLIC
  // Get FishingDataManager according to modality
  getFishingDataManager(mod) {
    if (mod == undefined)
      mod = window.GUIManager.currentModality;
    if (mod == 'trawling')
      return this.TrawlingData;
    else if (mod == 'purse-seine')
      return this.PSData;
  }

  // Get haul catch composition
  getHaulCatchComposition(id){
    id = id || window.GUIManager.map.currentHaul;
    // Get current fishing data manager
    let fdManager = this.getFishingDataManager();
    // Check if haul exists in fdManager
    if (fdManager.hauls[id] == undefined){
      id = Object.keys(fdManager.hauls)[0];
      console.error("Requested haul does not exists in fishing modality.")
      debugger;
    }
    // Load .json file
    return fdManager.getHaulCatchComposition(id);
  }

  // Get haul info
  getHaulInfo(id){
    id = id || window.GUIManager.map.currentHaul;
    // Get current fishing data manager
    let fdManager = this.getFishingDataManager();
    if (fdManager.hauls[id] == undefined){
      id = Object.keys(fdManager.hauls)[0];
      console.error("Requested haul does not exists in fishing modality.")
      debugger;
    }
    return fdManager.hauls[id];
  }

  // Get haul middle coordinates
  getHaulMiddleCoordinates(id){
    id = id || window.GUIManager.map.currentHaul;
    let fdManager = this.getFishingDataManager();
    if (fdManager.hauls[id] == undefined){
      id = Object.keys(fdManager.hauls)[0];
      console.error("Requested haul does not exists in fishing modality.")
      debugger;
    }
    let haul = fdManager.hauls[id];
    let coords = haul.geometry.coordinates;
    coords = [...coords]; // copy
    // Point geometry
    if (haul.geometry.type == "Point") {
      coords = [coords];
    }
    // Calculate bbox
    let bbox = [Infinity, Infinity, -Infinity, -Infinity];
    for (let i = 0; i < coords.length; i++){
      // Transform to EPSG:3857
      coords[i] = ol.proj.transform(coords[i], 'EPSG:4326', 'EPSG:3857');
      // Find max and min longitude and latitude
      bbox[0] = Math.min(bbox[0], coords[i][0]);
      bbox[1] = Math.min(bbox[1], coords[i][1]);
      bbox[2] = Math.max(bbox[2], coords[i][0]);
      bbox[3] = Math.max(bbox[3], coords[i][1]);
    }
    // Middle point
    let rangeBBOX = [bbox[2] - bbox[0], bbox[3] - bbox[1]];
    let middleCoord = [bbox[0] + rangeBBOX[0]/2, bbox[1] + rangeBBOX[1]/2];
    // Transform to EPSG:4326
    return ol.proj.transform(middleCoord, 'EPSG:3857', 'EPSG:4326');
  }


  // Get the range of years of the catch composition pie chart
  getCatchCompositionRangeYears(){
    // Get current fishing data manager
    let fdManager = this.getFishingDataManager();
    // Get season catch composition
    let data = fdManager.catchComposition.bySeason;
    // Find range
    let minYear = new Date().getUTCFullYear();
    let maxYear = 2018;
    data.forEach(el => {
      minYear = el.Year < minYear ? el.Year : minYear;
      maxYear = el.Year > maxYear ? el.Year : maxYear;
    })
    return minYear + "-" + maxYear;
  }


  // Load necessary files
  async loadNecessaryFiles(section, mod) {
    // Map
    if (section == 'map') {
      // Load map files
      if (mod == 'trawling') {
        await this.TrawlingData.loadMapFiles();
        return;
      } else if (mod == 'purse-seine') {
        await this.PSData.loadMapFiles();
        return;
      }
    }
    // Overview
    else if (section == 'overview'){
      if (mod == 'trawling'){
        await this.TrawlingData.loadOverviewFiles();
        return;
      } else if (mod == 'purse-seine'){
        await this.PSData.loadOverviewFiles();
        return;
      }
    }
  }
}

export default DataManager;