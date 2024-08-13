class GUIManager {

  currentFishingTrack = '';
  currentModality = 'trawling';
  currentSection = 'map';

  constructor() {
    window.location.isInternalChange = false;

    // Set section if undefined
    let section = window.location.getHashValue('SECTION');
    if (section == undefined){
      this.setSection(this.currentSection);
    }


    // EVENTS
    // Hash changes
    // event.newURL, event.oldURL
    window.onhashchange = (event) => {
      // Internal change (app changed hash)
      if (window.location.isInternalChange)
        window.location.isInternalChange = false;
      // User changed hash
      else {
        // Get app from window location hash
        let section = window.location.getHashValue('SECTION');
        // Set default
        if (section == undefined){
          section = this.currentSection;
          window.location.setHashValue('SECTION', section);
        }
        // Check if section changed
        else if (section.toLowerCase() != this.currentSection) {
          this.setSection(section.toLowerCase());
          window.eventBus.emit('GUIManager_SectionChanged', this.currentSection);
        }
      }

      window.location.isInternalChange = false; 
    }


    // APP EVENTS
    // Section changes
    window.eventBus.on('AppMap_ChangedSection', (section) => this.setSection(section));
    window.eventBus.on('TitleHeader_ChangedSection', (section) => this.setSection(section));
    // Modality changes
    window.eventBus.on('ModalitySelector_ChangedModality', this.setModality);
  }





  // Section
  setSection(section){
    let isValid = section == 'map' || section == 'length-dist' || section == 'overview';
    if (!isValid)
      section = 'map'
    this.currentSection = section;
    window.location.setHashValue('SECTION', section);
  }
  // Modality
  setModality(mod){
    let isValid = mod == 'trawling' || mod == 'purse-seine';
    if (!isValid)
      mod = 'trawling';
    this.currentModality = mod;
    window.location.setHashValue('MOD', this.currentModality);
  }

}

export default GUIManager;