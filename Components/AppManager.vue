<template>
<!-- Container -->
  <div id="app-manager">

    <!-- Language selector -->
    <language-selector style='position:absolute; top:33px; right:3px;'></language-selector>

    <!-- APP MAP -->
    <app-map v-show="app=='map'"></app-map>

    <!-- APP OVERVIEW -->
    <app-overview v-show="app=='overview'"></app-overview>

    <!-- APP LENGTH FREQ -->
    <app-lengthfreq v-show="app=='length-freq'"></app-lengthfreq>

    <!-- ICONS -->
    <a href="https://icatmar.cat/">
      <img class="logo clickable icatmar-logo" src="img/icatmar-mini-logo.svg">
    </a>
    <a href="https://icatmar.cat/visors/visor-pesquer/">
      <img class="logo clickable visap-logo" src="img/visor-pesquer-mini.svg">
    </a>
    <!-- Repository -->
    <a href="https://github.com/ICATMAR/VISAP" target="_blank">
      <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true" class="logo clickable github-logo">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
      </svg>
    </a>

  </div>
  
</template>
<!-- How to organize translations -->
<!-- https://www.codeandweb.com/babeledit/tutorials/how-to-translate-your-vue-app-with-vue-i18n -->




<script>



// Import components
import AppOverview from "Components/AppOverview.vue";
import AppLengthFreq from "Components/AppLengthFreq.vue";
import AppMap from "Components/AppMap.vue";


import LanguageSelector from "Components/Utils/LanguageSelector.vue";

export default {
  name: "app-manager",
  created(){
    
  },
  mounted () {
    // Get app from window location hash
    let appType = window.location.getHashValue('app');
    // Set default
    if (appType == undefined){
      appType = 'map';
      window.location.setHashValue('app', appType);
    }
    // Store
    this.app = appType;


    // EVENTS
    // Manual hash change
    window.onhashchange= (event) => {
      // event.newURL, event.oldURL
      let appType = window.location.getHashValue('app');
      this.app = appType;
      // When using the other apps, if the window is resized, map does not load. Force it here with a window resize event.
      if (appType == 'map'){
        // HACK Fix Force openlayers canvas to fill window after 0.5 s
        setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
        
      }
    }

  },
  data () {
    return {
      app: 'map'
    }
  },
  methods: {
  },
  components: {
    "app-overview": AppOverview,
    "app-lengthfreq": AppLengthFreq,
    "app-map": AppMap,

    "language-selector": LanguageSelector
    
  },
  computed: {
  
  }
}


</script>





<style scoped>

#app-manager {
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  position: absolute;
  overflow: hidden;
}


.logo {
  width: 70px;
  height: 70px;
  position: fixed;
  top: 10px;
  padding: 0px;
  margin: 0px;
  z-index: 10;
}

.icatmar-logo {
  left: 50px;
}

.visap-logo {
  left: 100px;
}

.github-logo {
  background: white;
  border-radius: 50%;
  border-color: black !important;
  border-width: thick;
  border: double;
  width: 28px;
  height: 28px;

  right: 35px;
  top: 6px;
}

</style>