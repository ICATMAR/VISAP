class GUIManager {

  currentFishingTrack = '';
  currentModality = 'trawling';
  currentSection = 'map';
  currentLanguage = 'en';
  currentHaul = 23288;

  // CONSTRUCTOR
  constructor() {
    window.location.isInternalChange = false;

    // Set defaults if undefined
    this.setDefaults();

    // Load necessary files for that specific menu
    // TODO / WARN: should this be here? Vue loads all the sections at once, because v-show and not v-if
    // Maybe this should be controlled from vue? I don't know
    window.eventBus.emit('GUIManager_HashChanged', window.location.hash);

    // EVENTS
    // Hash changes
    // event.newURL, event.oldURL
    window.onhashchange = (event) => {
      // Internal change (app changed hash)
      if (window.location.isInternalChange)
        window.location.isInternalChange = false;
      // User changed hash
      else {
        // Section
        // Get app from window location hash
        let section = window.location.getHashValue('SECTION');
        // Set default
        if (section == undefined){
          window.location.setHashValue('SECTION', this.currentSection);
        }
        // Check if section changed
        else if (section.toLowerCase() != this.currentSection) {
          this.setSection(section.toLowerCase());
          window.eventBus.emit('GUIManager_SectionChanged', this.currentSection);
        }
        // Modality
        let mod = window.location.getHashValue('MOD');
        if (mod == undefined)
          window.location.setHashValue('MOD', this.currentModality);
        else if (mod.toLowerCase() != this.currentModality){
          this.setModality(mod.toLowerCase());
          window.eventBus.emit('GUIManager_ModalityChanged', this.currentModality);
        }
        // Language
        let lang = window.location.getHashValue('LANG');
        if (lang == undefined)
          window.location.setHashValue('LANG', this.currentLanguage);
        else if (lang.toLowerCase() != this.currentLanguage){
          this.setLanguage(lang.toLowerCase());
          window.eventBus.emit('GUIManager_LanguageChanged', this.currentLanguage);
        }
      }

      window.location.isInternalChange = false; 
    }


    // APP EVENTS
    // Section changes
    window.eventBus.on('AppMap_ChangedSection', (section) => this.setSection(section));
    window.eventBus.on('TitleHeader_ChangedSection', (section) => this.setSection(section));
    // Modality changes
    window.eventBus.on('ModalitySelector_ChangedModality', (mod) => this.setModality(mod));
    // Language changes
    window.eventBus.on('LanguageSelector_LanguageChanged', lang => this.setLanguage(lang));
  }




  // FUNCTIONS
  // Set defaults
  setDefaults(){
    // Set default section if undefined
    let section = window.location.getHashValue('SECTION');
    if (section == undefined){
      this.setSection(this.currentSection);
    }
    // Set default modality if undefined
    let mod = window.location.getHashValue('MOD');
    if (mod == undefined){
      this.setModality(this.currentModality);
    }
    // Set language
    // Check if there is a language in the url
    let langURL = window.location.getHashValue('LANG');
    if (langURL != undefined){
      this.currentLanguage = langURL.substring(0,2);
    } 
    // Use default navigator language if available
    else if (navigator.language.includes('es') || navigator.language.includes('en') || navigator.language.includes('ca')){
      this.setLanguage(navigator.language.substring(0,2));
    } 
    // Default is english
    else {
      this.setLanguage('en');
    }
  }


  // Section
  setSection(section){
    let isValid = section == 'map' || section == 'length-dist' || section == 'overview';
    if (!isValid)
      section = 'map'
    this.currentSection = section;
    window.location.setHashValue('SECTION', section);
    if (!isValid)
      console.warn('Wrong hash introduced in the URL');
  }
  // Modality
  setModality(mod){
    let isValid = mod == 'trawling' || mod == 'purse-seine';
    if (!isValid)
      mod = 'trawling';
    this.currentModality = mod;
    window.location.setHashValue('MOD', this.currentModality);
    if (!isValid)
      console.warn('Wrong hash introduced in the URL');
  }
  // Language
  setLanguage(lang){
    let isValid = lang == 'ca' || lang == 'es' || lang == 'en';
    if (!isValid)
      lang = 'en'
    this.currentLanguage = lang;
    window.location.setHashValue('LANG', this.currentLanguage);
    if (!isValid)
      console.warn('Wrong hash introduced in the URL');
  }

}

export default GUIManager;