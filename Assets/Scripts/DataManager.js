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
    window.eventBus.on('GUIManager_InitialLoad', (GUIManager) => {
      let section = GUIManager.currentSection;
      let mod = GUIManager.currentModality;

      this.loadNecessaryFiles(section, mod)
    });
    // Section changes
    window.eventBus.on('AppMap_ChangedSection', (section) => {this.sectionChanged(section)});
    window.eventBus.on('TitleHeader_ChangedSection', (section) => this.sectionChanged(section));
    // Modality changes
    window.eventBus.on('ModalitySelector_ChangedModality', (mod) => this.modalityChanged(mod));

  }

  sectionChanged(section) {
    let mod = window.GUIManager.currentModality;
    this.loadNecessaryFiles(section, mod);
  }
  modalityChanged(mod){
    let section = window.GUIManager.currentSection;
    this.loadNecessaryFiles(section, mod);
  }

  // Load necessary files
  loadNecessaryFiles(section, mod){
    if (section == 'map') {
      // Load map files
      if (mod == 'trawling') {
        if (!this.TrawlingData.mapFilesLoaded) {
          this.TrawlingData.initMapFilesLoad().then(() => {
            window.eventBus.emit('DataManager_MapDataLoaded');
          });
        }
      } else if (mod == 'purse-seine')
        if (!this.PSData.mapFilesLoaded) {
          this.PSData.initMapFilesLoad().then(() => {
            window.eventBus.emit('DataManager_MapDataLoaded');
          });
        }
    }
  }
}

export default DataManager;