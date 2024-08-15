import { FishingData } from './FishingDataManager.js'


class DataManager {

  // Trawling hauls class
  // Purse-seine hauls class
  // ...

  constructor() {

    this.TrawlingData = new FishingData('trawling');
    this.PSData = new FishingData('purse-seine');


    // EVENTS
    // Initial page load
    // window.eventBus.on('GUIManager_InitialLoad', (GUIManager) => {
    //   let section = GUIManager.currentSection;
    //   let mod = GUIManager.currentModality;

    //   //this.loadNecessaryFiles(section, mod)
    // });
    // Section changes
    //window.eventBus.on('AppMap_ChangedSection', (section) => { this.sectionChanged(section) });
    //window.eventBus.on('TitleHeader_ChangedSection', (section) => this.sectionChanged(section));
    // Modality changes
    //window.eventBus.on('ModalitySelector_ChangedModality', (mod) => this.modalityChanged(mod));

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