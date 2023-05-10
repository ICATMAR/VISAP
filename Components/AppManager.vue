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


</style>