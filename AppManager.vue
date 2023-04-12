<template>
<!-- Container -->
  <div id="app-manager">

    <!-- Language selector -->
    <language-selector style='position: absolute;margin-top: 4.5rem;margin-left:0.5rem;'></language-selector>

      <!-- APP MAP -->
      <!-- Map  container-->
      <ol-map id="ol-map" ref="map" v-show="app=='map'"
        @onTrackClicked="trackClicked" 
        @onFishingTracksLoad="fishingTracksLoad"
      ></ol-map>
      <!-- <animation-canvas ref="animcanvas"></animation-canvas> SHOULD BE ON MAP-->
      
      <!-- Side panel -->
      <app-side-panel ref="sidePanel" v-show="app=='map'"
        @selectedTrack='selectedTrack' 
        @onTabClicked='sidePanelTabClicked' 
        @onPanelTransitionEnd='sidePanelTabClicked'
        @setEffortLayerOpacity='setEffortLayerOpacity'
        @setEffortMap='setEffortMap'
        @setBaseLayer='setBaseLayer'
        @setLayerOpacity='setLayerOpacity'
        @setClimaLayer='setClimaLayer'
      ></app-side-panel>



      <!-- APP OVERVIEW -->
      <app-overview v-show="app=='overview'">

      </app-overview>


    <!-- <weather-widget></weather-widget> -->
  </div>
  
</template>
<!-- How to organize translations -->
<!-- https://www.codeandweb.com/babeledit/tutorials/how-to-translate-your-vue-app-with-vue-i18n -->




<script>
/*
APP STRUCTURE

                                        APP MANAGER
              /                             |                            \
        OL-MAP                          APP-SIDE-PANEL                    LANGUAGE-SELECTOR
        /                     /        |          |           \    
    TIME-RANGE-BAR   HAUL-INFO   FISHING-EFFORT   LAYER-PANEL   ABOUT 
      /                   |          
  RANGE-SLIDER      WEATHER-WIDGET

Right now the comunication is done via the paths shown before. It might be useful to create some kind of
whiteboard or event manager. For example, one could send and event like (from, to who, funcion name, parameters)

*/


// Import components
import Map from "Map.vue";
import AnimationCanvas from "AnimationCanvas.vue";
import AppSidePanel from "AppSidePanel.vue"

import AppOverview from "AppOverview.vue"

import WeatherWidget from "WeatherWidget.vue"

import LanguageSelector from "LanguageSelector.vue"

export default {
  name: "app-manager",
  created(){
    // Get app from window location hash
    let appType = window.location.getHashValue('app');
    this.app = appType;
  },
  mounted () {
    // EVENTS
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
    "ol-map": Map,
    "animation-canvas": AnimationCanvas,
    "app-side-panel": AppSidePanel,
    "app-overview": AppOverview,

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


#ol-map {
  /* background: red; */
  width: 100%; 
  height: 100%;
}

#animationCanvas {
  background: none;
}

</style>