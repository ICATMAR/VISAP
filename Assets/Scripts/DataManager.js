import { FishingData } from './FishingDataManager.js'


class DataManager {

  // Trawling hauls class
  // Purse-seine hauls class
  // ...

  constructor() {

    this.TrawlingData = new FishingData('trawling');
    this.PSData = new FishingData('purse-seine');


    // EVENTS
    window.eventBus.on('GUIManager_InitialLoad', () => {
      let section = window.location.getHashValue('SECTION');
      let mod = window.location.getHashValue('MOD');
      
      if (section == 'map') {
        
        // Load map files
        if (mod == 'trawling'){
          this.TrawlingData.initMapFilesLoad()
        } else if (mod == 'purse-seine')
          this.PSData.initMapFilesLoad()

      }
    });

  }


}

export default DataManager;