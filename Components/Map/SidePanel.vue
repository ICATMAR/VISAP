<template>
  <div id="side-panel">

    

    <!-- Panel -->
    <div class="collapse width" ref="panel" :class="{show: isPanelOpen}">

      <!-- Fixed closing button and top-right menu background -->
      <div class="bannerContainer">
        <!--Banner -->
        <div class="topBanner"></div>
      </div>
      <!-- Button -->
      <button class="closeButton icon-str" type="button" @click='closePanel'>X</button>

      <!-- Info container -->
      <div class="side-panel-content g-0">
        <!-- Haul info -->
        <haul-info ref="haul-info" v-show="selTab == 'tracks'">
        </haul-info>



        <about-panel ref="about"
          v-show="selTab === 'about'">
        </about-panel>
       
      </div>

    </div>



    

  </div>
</template>







<script>
// Import components
import HaulInfo from "Components/Map/HaulInfo.vue"
import AboutPanel from "Components/About.vue"



export default {
  name: "side-panel",
  created(){

  },
  mounted () {
    // EVENTS
    // Open/close fishing tab
    window.eventBus.on('AppMap_HaulsOptionClicked', () => {
      if (this.selTab == "tracks")
        this.closePanel();
      else
        this.openFishingTab();
    });
    // Track clicked
    window.eventBus.on('Map_HaulClicked', this.openFishingTab);
    window.eventBus.on('TracksTimeLine_HaulClicked', this.openFishingTab);
    // Close side panel
    window.eventBus.on('Map_CloseSidePanel', this.closePanel);



    // HACK Fix Force openlayers canvas to fill window -> In the previous code I am modifing the position of the tab buttons and the canvas does not
    // cover the whole window. Openlayers reacts to window resize events, therefore we can trigger the window event so that the
    // canvas fills the whole window.
    window.dispatchEvent(new Event('resize'));
  },
  data () {
    return {
      tabs: {
        "tracks": {
          id: "tracks",
          name: "Fishing tracks",
          isSelected: false
        },
        "about": {
          id: "about",
          name: "About",
          isSelected: false
        }
      },
      isPanelOpen: false,
      selTab: "",
    }
  },
  methods: {

    // INTERNAL EVENTS
    openPanel: function(){
      this.isPanelOpen = true;
      // HACK Fix Force openlayers canvas to fill window after 0.5 s
      for (let i = 10; i<500; i+=10){
        setTimeout(() => window.dispatchEvent(new Event('resize')), i);
      }

      window.eventBus.emit('SidePanel_isPanelOpen', this.isPanelOpen);
    },
    closePanel: function(){
      this.isPanelOpen = false;
      // Deselect tabs
      Object.keys(this.tabs).forEach(kk => this.tabs[kk].isSelected = false);
      this.selTab = "";

      // HACK Fix Force openlayers canvas to fill window after 0.5 s
      for (let i = 10; i<500; i+=10){
        setTimeout(() => window.dispatchEvent(new Event('resize')), i);
      }

      window.eventBus.emit('SidePanel_isPanelOpen', this.isPanelOpen);
    },


    // PUBLIC METHODS
    // Opens the fishing hauls tab with the corresponding haul id selected
    openFishingTab: function(id){
      if (id == undefined)
        id = window.GUIManager.map.currentHaul;
      // Select tab
      // Unselect all first
      Object.keys(this.tabs).forEach(kk => this.tabs[kk].isSelected = false);
      // Select tracks tab
      this.tabs.tracks.isSelected = true;
      this.selTab = 'tracks';
      // Set track id on tracks tab
      this.$refs["haul-info"].setSelectedFishingHaul(id);
      // Open panel if it is not open already
      this.openPanel();
    },

  },
  components: {
    "haul-info": HaulInfo,
    "about-panel": AboutPanel,
  },
  computed: {
  
  }
}


</script>





<style scoped>

#side-panel {
  display:flex;
  height: 100%;
  /* width: 100%; */
}

.bannerContainer {
  position: fixed;
  width: inherit;
  top: 25px;

  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;

  z-index: 1;

  pointer-events: none;
}

.closeButton {
  position: fixed;
  right: 30px;
  top: 80px;

  background-color: var(--darkBlue);
  box-shadow: 0px 0px 4px 0px black;
  border-radius: 50%;
  color: white;
  width: 36px;
  height: 36px;
  text-decoration: none;
  padding: 4px;
  margin-left: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}
.closeButton:hover{
  background-color: var(--blue);
}

.topBanner {
  background-image: url('Assets/BannerBackground.png');
  height: 56px;
  width: 125px;
  background-size: auto;
  background-repeat: round;
}

.collapse {
  overflow: auto; 
  transition: width 0.5s, min-width 0.5s;
}

.collapse.show {
  width: clamp(600px, 40vw, 900px); 
}
.collapse:not(.show){
  width: 0;
  min-width: 0;
  height: initial;
  display: block;
}

/* Small screen makes side panel complete */
@media screen and (max-width: 1000px) {
  .collapse.show {
    width: 100vw;
  }
}


.side-panel-content {
  display:flex; 
  flex-direction: column;
  align-items: center;
  background: #e3f4ff;; 
  /* height: 100%; */
}
</style>