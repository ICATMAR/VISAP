<template>
  <div id="appMap" class="appMap">

    <!-- Map  container-->
    <div class="appContainer">

      <div class="mapContainer">
        <ol-map id="ol-map" ref="map"></ol-map>
        <!-- <animation-canvas ref="animcanvas"></animation-canvas> SHOULD BE ON MAP-->
        
        <!-- Buttons to switch from app -->
        <div class="switchPanels">
          <!-- Buttons -->
          <button @click="changeHash('overview')" >
            <span class="fa">&#xf13d; </span>
            <span class="button-text hiddenInMobile">{{ $t('Catch composition') }}</span>
          </button>
          <button @click="changeHash('length-freq')">
            <span class="fa">&#xe0e3; </span>
            <span class="button-text hiddenInMobile">{{ $t('Length frequency') }}</span>
          </button>
          <button class="selected">
            <span class="fa">&#xf276; </span>
            <span class="button-text hiddenInMobile">{{ $t('Sampling map') }}</span>
          </button>
        </div>

        <!-- Menu left -->
        <menu-left></menu-left>

        <!-- (Menu right bottom) Fishing effort map -->
        <fishing-effort></fishing-effort>

        <!-- Menu right top -->
        <!-- Buttons -->
        <div class="menuTopRight">
          <!-- Fishing tracks -->
          <div class="menuElement clickable" @click="tracksMenuClicked">
            <!-- Text -->
            <span class="tracksTitle">{{ $t('Fishing tracks') }}</span>
            <!-- Icon -->
            <img class="icon-str tracksIcon" src="Assets/TracksIcon.png">
            
          </div>

          <!-- Info ¿?-->
        </div>
      </div>


      <!-- Side panel -->
      <side-panel ref="sidePanel"></side-panel>
    </div>




    

  </div>
</template>
  


  
  
  <script>

  // Import scripts
  import Map from "Components/Map/Map.vue";
  import AnimationCanvas from "Components/Map/AnimationCanvas.vue";
  import SidePanel from "Components/Map/SidePanel.vue"
  import MenuLeft from "Components/MenuLeft.vue"
  import FishingEffort from "Components/Map/FishingEffort.vue";

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

      // USER ACTIONS
      tracksMenuClicked: function(e){
        window.eventBus.emit('AppMap_tracksOptionClicked');
      }

    },
    components: {
      "ol-map": Map,
      "animation-canvas": AnimationCanvas,
      "side-panel": SidePanel,
      "menuLeft": MenuLeft,
      "fishing-effort": FishingEffort,
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

.appContainer {
  width:100%;
  height:100%;
  position:fixed;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.mapContainer {
  width: 100%;
  height: 100%;
  position: relative;
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
@media screen and  (max-width: 770px) {
  .switchPanels{
    flex-direction: row;
  }
  .switchPanels>button{
    width: 35px;
    height: 35px;
  }
  
}
.selected {
  background: var(--red);
  pointer-events: none;
  cursor:default;
}


.menuTopRight {
  position: absolute;
  top: 80px;
  right: 0px;
}

.menuElement {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  height: 50px;
  
  padding: 4px;
  background: #00000040;
  border-radius: 20px 0px 0px 20px;
}

.tracksIcon {
  width: 60px;
  height: 60px;
}

.tracksTitle {
  display: inline-block;
  width: 10em;
  text-align: center;
  font-size: clamp(0.8rem, 1.4vw, 1rem);
}

  </style>