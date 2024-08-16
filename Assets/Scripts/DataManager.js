import { TrawlingData, PurseSeineData } from './FishingDataManager.js'


class DataManager {

  // Trawling hauls class
  // Purse-seine hauls class
  // ...

  constructor() {

    this.TrawlingData = new TrawlingData();
    this.PSData = new PurseSeineData();

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