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