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
      <img class="logo icatmar-logo" src="img/icatmar-mini-logo.svg">
    </a>
    <a href="https://icatmar.cat/visors/visor-pesquer/">
      <img class="logo visap-logo" src="img/visor-pesquer-mini.svg">
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


    // HACK icatmar.cat WIDGETS
    // Icon menu widget
    setTimeout(this.modifyICATMARsIcons, 1000);
    setTimeout(this.modifyICATMARsIcons, 5000);
    


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
    modifyICATMARsIcons: function(){
      let els = document.getElementsByClassName('elementor-icon');
      if (els.length != 0){
        let el = els[0];
        el.style = `position: fixed; right: 45px; box-shadow: 0 0 4px black;`;
      } else {
        console.log("Did not find icatmar.cat top-right menu button.");
      }
      // ICATMAR and VISOR icons
      els = document.getElementsByClassName('attachment-large size-large');
      for(let i = 0; i < els.length; i++) {
        let el = els[i];
        el.style = `width: 70px;
                    height: 70px;
                    position: fixed;
                    top: 10px;
                    left: clamp(${30 + 40*i}px, ${5 + i*4}vw, ${50 + 50*i}px);
                    padding: 0px;
                    margin: 0px;`;
      };
    },

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
}

.icatmar-logo {
  left: 50px;
}

.visap-logo {
  left: 100px;
}

</style>