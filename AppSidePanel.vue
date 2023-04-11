<template>
  <div id="app-side" style="display:flex; height: 100%">

    

    <!-- Tabs -->
    <div class="position-relative" ref="buttonGroup" style="margin-top:50px; display:flex; flex-direction:column; height: fit-content;">
      <div  class="btn tab vertical-button" :class="{active: tab.isSelected}" type="button" :title="tab.name" :id="tab.id" @click="onTabClicked" :key="tab.name" v-for="tab in tabs">
       <!--{{tab.name}}-->
       {{ $t(tab.name)}}
      </div>
    </div>


    <!-- Panel -->
    <div class="collapse width" ref="panel" :class="{show: isPanelOpen}">

      <!-- Closing button -->
      <div class='row m-0' style='position: relative'>
        <button type="button" class="btn-close p-0" aria-label="Close" @click='closePanel' style='position: absolute; top: 16px; right: 16px'></button>
      </div>

      <!-- Info container -->
      <div class="side-panel-content g-0">
        <!-- Haul info -->
        <haul-info @selectedTrack="selectedTrack" ref="haul-info" v-show="selTab == 'tracks'">
        </haul-info>

        <!-- Fishing effort -->
        <fishing-effort ref="fishing-effort" 
          @effortParamsChange='setEffortMap' 
          @effortLayerOpacityChange='setEffortLayerOpacity' 
          v-show="selTab === 'effort'">
        </fishing-effort>

        <!-- Layers -->
        <layer-panel ref="layers" 
          @baseLayerChange='setBaseLayer' 
          @layerOpacityChange='setLayerOpacity'
          @climaLayerChange='setClimaLayer'
          v-show="selTab === 'layers'">
        </layer-panel>

        <about-panel ref="about"
          v-show="selTab === 'about'">
        </about-panel>
       
      </div>

    </div>



    

  </div>
</template>







<script>
// Import components
import HaulInfo from "HaulInfo.vue"
import FishingEffortPanel from "FishingEffortPanel.vue"
import LayerPanel from "LayerPanel.vue"
import AboutPanel from "About.vue"
//import Map from "Map.vue";
//import AnimationCanvas from "AnimationCanvas.vue";


export default {
  name: "app-side",
  created(){

  },
  mounted () {
    // Move tab buttons to be inside the window
    // this.$refs.buttonGroup.style['margin-left'] = -this.$refs.buttonGroup.offsetHeight + 'px';
    let tabButtonGroup = this.$refs.buttonGroup;
    //tabButtonGroup.style['margin-left'] = - Math.max(this.$refs.buttonGroup.offsetWidth, 28) + 'px';
    tabButtonGroup.style['margin-left'] = - this.$refs.buttonGroup.offsetWidth + 'px';

    // When side panel is fully opened or closed, repeats the event onTabClicked
    this.$refs.panel.addEventListener("webkitTransitionEnd", () => this.$emit('onPanelTransitionEnd')); // Code for Chrome, Safari and Opera
    this.$refs.panel.addEventListener("transitionend", () => this.$emit('onPanelTransitionEnd')); // Standard syntax


    // HACK Fix Force openlayers canvas to fill window -> In the previous coude I am modifing the position of the tab buttons and the canvas does not
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
        "effort": {
          id: "effort",
          name: "Fishing effort",
          isSelected: false
        },
        "layers": {
          id: "layers",
          name: "Layers",
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
    // USER HTML ACTIONS
    onTabClicked: function(event){
      // Use id to get tab
      let id = event.target.id;
      let tab = this.tabs[id];
      // If tab is selected and panel is open, close panel
      if (tab.isSelected){
        this.closePanel();
      }
      // If tab is not selected, open panel
      else {
        // Unselect all first
        Object.keys(this.tabs).forEach(kk => this.tabs[kk].isSelected = false);
        // Select tab and open panel
        tab.isSelected = true;
        this.selTab = id;
        this.openPanel();
      }

      // Emit that the panel open or closes, so that the month names in TimeRangeBar.vue can be updated
      this.$emit('onTabClicked');
    },

    // INTERNAL EVENTS
    openPanel: function(){
      this.isPanelOpen = true;
      // HACK Fix Force openlayers canvas to fill window after 0.5 s
      //setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
      for (let i = 10; i<500; i+=10){
        setTimeout(() => window.dispatchEvent(new Event('resize')), i);
      }
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
      //setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
    },
    // Event coming from HaulInfo.vue, when a track is clicked in the dropdown list.
    selectedTrack: function(id){
      // Change the date on the WMS Layer panel
      this.$refs.layers.fishingTrackSelected(id);
      // Emit
      this.$emit('selectedTrack', id);
    },
    // Effort panel
    setEffortLayerOpacity: function(opacity){
      if (this.selTab == 'effort'){ // Only when the tab is open can send events
        this.$emit('setEffortLayerOpacity', opacity);
        // Connect with layers panel
        this.$refs['layers'].setFEffortOpacity(opacity);
      }
    },
    setEffortMap: function(inUrl){
      this.$emit('setEffortMap', inUrl);
    },
    // Layer panel
    setBaseLayer: function(baseLayerName){
      this.$emit('setBaseLayer', baseLayerName);
    },
    setLayerOpacity: function(params){
      if (this.selTab == 'layers'){ // Only when the tab is open can send events
        this.$emit('setLayerOpacity', params);
        // If the layer is fishing effort, connect with tab Fishing effort
        if (params[0] == 'fishingEffort'){
          this.$refs['fishing-effort'].setLayerOpacity(params[1]);
        }
      }
    },
    setClimaLayer: function(urlParams){
      this.$emit('setClimaLayer', urlParams);
    },

    // PUBLIC METHODS
    // Set fishing tracks once loaded
    // OPTIONS-TODO:
    // OPTION 1- Map is loading the tracks. When they are loaded there, an event can be passed to haul info, but the chain is
    // quite long: Map.vue - AppManager.vue - AppSidePanel.vue - HaulInfo.vue
    // OPTION 2- We consider FishingTracks class as singleton and we call it directly from HaulInfo.vue. We can make this call
    // iteratively until fishing tracks exist. Not so clean, as the tab Fishing Tracks should only exist once the fishing tracks
    // have been loaded. If there is an error with loading the fishing tracks, the tab should not exist?

    // Fishing track clicked
    fishingTrackClicked: function(id){
      this.openFishingTab(id);
      // Send event to layers panel
      this.$refs.layers.fishingTrackSelected(id);
    },

    // Opens the fishing tracks tab with the corresponding track id selected
    openFishingTab: function(id){
      // Select tab
      // Unselect all first
      Object.keys(this.tabs).forEach(kk => this.tabs[kk].isSelected = false);
      // Select tracks tab
      this.tabs.tracks.isSelected = true;
      this.selTab = 'tracks';
      // Set track id on tracks tab
      this.$refs["haul-info"].setSelectedFishingTrack(id);
      // Open panel if it is not open already
      this.openPanel();
    },

    // Set the fishing tracks once they are loaded. This event comes from Map.vue
    setFishingTracks: function(geojson){
      this.$refs["haul-info"].setFishingTracks(geojson);
    }

  },
  components: {
    "haul-info": HaulInfo,
    "fishing-effort": FishingEffortPanel,
    "layer-panel": LayerPanel,
    "about-panel": AboutPanel,
    //"ol-map": Map,
    //"animation-canvas": AnimationCanvas,
  },
  computed: {
  
  }
}


</script>





<style scoped>
.vertical-button {
  -webkit-transform: scale(-1);
  -moz-transform: scale(-1);
  -ms-transform: scale(-1);
  -o-transform: scale(-1);
  transform: scale(-1); 
  writing-mode: vertical-lr;
  text-orientation: sideways;
  padding: 8px 4px 8px 4px ;
  font-size: 12px;
  margin-top: 2px;
  

  border-radius: 0px 12px 12px 0px;
}


.collapse {
  overflow: auto; 
  transition: width 0.5s, min-width 0.5s;
}

.collapse.show {
  width: 40vw; 
  min-width: 500px;
}
.collapse:not(.show){
  width: 0;
  min-width: 0;
  height: initial;
  display: block;
}

.tab {
  color: rgb(0, 0, 0);
  background-color: #a0d7f2;
  border-color: #72b0cf;
  min-width: 18px;
  max-width: 30px;
  box-shadow: 1px 0px 2px #0a3142;
}
.tab.active {
  color: rgb(0, 0, 0);
  background-color: #7dc8e8;
  border-color: #569ab8;
  box-shadow: 2px 0px 5px #0a3142;
}


.side-panel-content {
  display:flex; 
  flex-direction: column;
  align-items: center;
  background: #e3f4ff;; 
  /* height: 100%; */
}
</style>