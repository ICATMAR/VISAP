<template>
  <div id="appMap" class="appMap">

    <!-- App container (map and side panel)-->
    <div class="appContainer">
     
      <!-- Map container-->
      <div ref="mapContainer" class="mapContainer" :class="isMapMinimized ? 'miniMap' : ''">
        <ol-map id="ol-map" ref="map"></ol-map>
        <!-- <animation-canvas ref="animcanvas"></animation-canvas> SHOULD BE ON MAP-->
        
        <!-- Buttons to switch from app -->
        <div class="switchPanels" v-show="!isMapMinimized">
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
        <menu-left v-show="!isMapMinimized"></menu-left>

        <!-- (Menu right bottom) Fishing effort map -->
        <fishing-effort v-show="!isMapMinimized"></fishing-effort>

        <!-- Menu right top -->
        <!-- Buttons -->
        <div class="menuTopRight" v-show="!isMapMinimized">
          <!-- Fishing tracks -->
          <div class="menuElement clickable" @click="tracksMenuClicked">
            <!-- FA icon -->
            <span class="fa">&#xf200;</span>
            <!-- Text -->
            <span class="tracksTitle">{{ $t('Fishing tracks') }}</span>
            <!-- Icon -->
            <img class="icon-str tracksIcon" src="Assets/TracksIcon.png">
            
          </div>

          <!-- Info ¿?-->
        </div>
      </div>

      <!-- Side panel -->
      <Transition>
        <side-panel ref="sidePanel" v-show="isSidePanelOpen"></side-panel>
      </Transition>
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
      // Resize map event
      window.onresize = () => {
        
        let ww = this.$refs.mapContainer.offsetWidth;
        let windowWidth = window.innerWidth;
        // Window resize and open/close panel
        if (ww < 400 && this.isSidePanelOpen) // If side panel is open minimize map
          this.isMapMinimized = true;
        else
          this.isMapMinimized = false;
        // Window resize
        if (this.isSidePanelOpen && windowWidth > 1000)
          this.isMapMinimized = false;
        
        window.eventBus.emit('AppMap_isMapMinimized', this.isMapMinimized);

        
      }
      // Event
      window.eventBus.on('SidePanel_isPanelOpen', (isOpen)=> {
        this.isSidePanelOpen = isOpen;
      });
    },
    unmounted(){
  
    },
    data(){
      return {
        isMapMinimized: false,
        isSidePanelOpen: false,
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

/* Small screen makes side panel complete */
.miniMap {
  width: 300px;
  height: 300px;
  position: absolute;
  bottom: 0px;
  right: 0px;
  z-index: 1;
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
  top: 90px;
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




.v-enter-active {
  transition: all 0.3s ease-out;
}
.v-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.v-enter-from,
.v-leave-to {
  transform: translateX(20px);
  opacity: 0;
}


  </style>