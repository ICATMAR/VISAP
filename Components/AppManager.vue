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


    <!-- <weather-widget></weather-widget> -->
  </div>
  
</template>
<!-- How to organize translations -->
<!-- https://www.codeandweb.com/babeledit/tutorials/how-to-translate-your-vue-app-with-vue-i18n -->




<script>



// Import components
import AppOverview from "Components/AppOverview.vue";
import AppLengthFreq from "Components/AppLengthFreq.vue";
import AppMap from "Components/AppMap.vue";


import WeatherWidget from "Components/WeatherWidget.vue";

import LanguageSelector from "Components/LanguageSelector.vue";

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
    // INTERNAL EVENTS
    // Event coming from side panel HaulInfo.vue
    selectedTrack: function(id){
      // Send this message to map
      if (this.$refs.map)
        this.$refs.map.setSelectedTrack(id);
    },
    // When a track is clicked on the map (Map.vue / TracksTimeLine.vue)
    trackClicked: function(id){
      // Send the id to side panel
      this.$refs.sidePanel.fishingTrackClicked(id);
    },
    // Fishing tracks have been loaded
    fishingTracksLoad: function(geojson){
      // Send data to HaulInfo.vue
      this.$refs.sidePanel.setFishingTracks(geojson);
    },
    // When the user clicks on a tab (AppSidePanel.vue), update the month names in TimeRangeBar
    sidePanelTabClicked: function(){
      // Send event to map
      this.$refs.map.onTabClicked();
    },
    // When the opacity of the fishing effort layer is changed. Event coming from FishingEffortPanel.vue
    setEffortLayerOpacity: function(opacity){
      this.$refs.map.setEffortLayerOpacity(opacity);
    },
    // When the parameters in the fishing effort panel change. Event coming from FishingEffortPanel.vue
    setEffortMap: function(inUrl){
      this.$refs.map.setEffortMap(inUrl);
    },
    // Base layer changed in LayerPanel.vue
    setBaseLayer: function(baseLayerName){
      this.$refs.map.setBaseLayer(baseLayerName);
    },
    // Change the opacity of a layer. Event coming from LayerPanel.vue. params = [layerName, opacity]
    setLayerOpacity: function(params){
      this.$refs.map.setLayerOpacity(params);
    },
    // Change the layer with weather and oceanographic data. Event from LayerPanel.vue. urlParams = {url: '', params: {}}
    setClimaLayer: function(urlParams){
      this.$refs.map.setClimaLayer(urlParams);//this.$refs.map.updateSourceWMS(urlParams);
    },
    // Clima layer should change the date when a different track is clicked. Map.vue can change the track. HaulInfo.vue can also.
    setWMSDate: function(date){

    },
  },
  components: {
    "app-overview": AppOverview,
    "app-lengthfreq": AppLengthFreq,
    "app-map": AppMap,

    "weather-widget": WeatherWidget,

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