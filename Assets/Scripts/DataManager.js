

class DataManager {

  // Trawling hauls class
  // Purse-seine hauls class
  // ...

  constructor() {


    // EVENTS
    window.eventBus.on('GUIManager_HashChanged', () => {
      let section = window.location.getHashValue('SECTION');
      let mod = window.location.getHashValue('MOD');

      if (section == 'map') {
        // Load map files
        window.FileManager.loadMapFiles(mod);
      }
    });

  }


}

export default DataManager;