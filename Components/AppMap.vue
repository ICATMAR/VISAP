<template>
  <div id="appMap" class="appMap">

    <!-- Map  container-->
    <div class="mapContainer">
      <ol-map id="ol-map" ref="map"
        @onTrackClicked="trackClicked" 
        @onFishingTracksLoad="fishingTracksLoad"
      ></ol-map>
      <!-- <animation-canvas ref="animcanvas"></animation-canvas> SHOULD BE ON MAP-->
      
      <!-- Side panel -->
      <app-side-panel ref="sidePanel"
        @selectedTrack='selectedTrack' 
        @onTabClicked='sidePanelTabClicked' 
        @onPanelTransitionEnd='sidePanelTabClicked'
        @setEffortLayerOpacity='setEffortLayerOpacity'
        @setEffortMap='setEffortMap'
        @setBaseLayer='setBaseLayer'
        @setLayerOpacity='setLayerOpacity'
        @setClimaLayer='setClimaLayer'
      ></app-side-panel>

      <!-- Buttons to switch from app -->
      <div class="switchPanels">
        <!-- Buttons -->
        <button @click="changeHash('overview')" >
          <span class="fa">&#xf13d; </span>
          <span class="button-text">{{ $t('Catch composition') }}</span>
        </button>
        <button @click="changeHash('length-freq')">
          <span class="fa">&#xe0e3; </span>
          <span class="button-text">{{ $t('Length frequency') }}</span>
        </button>
        <button class="selected">
          <span class="fa">&#xf276; </span>
          <span class="button-text">{{ $t('Sampling map') }}</span>
        </button>
      </div>
    </div>




    <!-- Menu left -->
    <menu-left></menu-left>

  </div>
</template>
  


  
  
  <script>

  // Import scripts
  import Map from "Components/Map/Map.vue";
  import AnimationCanvas from "Components/Map/AnimationCanvas.vue";
  import AppSidePanel from "Components/AppSidePanel.vue"
  import MenuLeft from "Components/MenuLeft.vue"

  export default {
    name: "appMap",
    created(){

    },
    mounted(){

    },
    unmounted(){
  
    },
    data(){
      return {

      }
    },
    methods: {
      // INTERNAL EVENTS
      // Change hash from application
      changeHash: function(appType){
        window.location.setHashValue('app', appType);
      },

    },
    components: {
      "ol-map": Map,
      "animation-canvas": AnimationCanvas,
      "app-side-panel": AppSidePanel,
      "menuLeft": MenuLeft
    },
    computed: {
  
    }
  }
  </script>
  
  <style scoped>
  #appMap {
    position: fixed;
    width: 100vw;
    height: 100vh;
  }

  #ol-map {
  /* background: red; */
  width: 100%; 
  height: 100%;
}

#animationCanvas {
  background: none;
}

.mapContainer {
  width:100%;
  height:100%;
  position:fixed;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.switchPanels {
  position:absolute;
  margin-top: 150px;
  top: 0px;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items:start;

  z-index:2;
}

.switchPanels>button {
  font-size: 11px;
  margin: 3px;
}
.selected {
  background: var(--red);
  pointer-events: none;
  cursor:default;
}


  </style>