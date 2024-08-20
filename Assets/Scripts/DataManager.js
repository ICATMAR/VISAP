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
    // Get current fishing data manager
    let fdManager = this.getFishingDataManager();
    if (fdManager.hauls[id] == undefined){
      id = Object.keys(fdManager.hauls)[0];
      console.error("Requested haul does not exists in fishing modality.")
      debugger;
    }
    return fdManager.hauls[id];
  }


  // Load necessary files
  async loadNecessaryFiles(section, mod) {
    if (section == 'map') {
      // Load map files
      if (mod == 'trawling') {
        await this.TrawlingData.initMapFilesLoad();
        return;
      } else if (mod == 'purse-seine') {
        await this.PSData.initMapFilesLoad();
        return;
      }
    }
  }
}

export default DataManager;