<template>
    <!-- Container -->
    <div id='widgetMapOptions' ref='widgetMapOptions'>

      <!-- Base layer selection -->
      <div id="baseLayerSelection" v-show="baseLayers.length != 0" @mouseleave="isMouseOver = false">
        <!-- Selected -->
        <img class="icon-str icon-img" :src="baseLayerIconSrc" @click="isMouseOver=true" v-show="!isMouseOver">
        <!-- Other base layers -->
        <div class="otherBaseLayersContainer" v-show="isMouseOver">
          <div v-for="baseLayer, index in baseLayers">
            <img class="icon-str icon-img" :src="baseLayer.img.src" @click="baseLayerClicked($event, index)" :title="baseLayer.name">
          </div>
        </div>
        <!-- Text -->
        <span>Base layer</span>
      </div>

      <!-- Iso bars -->
      <div id="isobathsContainer" v-show="false">
        <onOffButton :checked="false" :inSize="'18px'" @change="isoOnOffChange($event)"></onOffButton>
        <span>Isobaths</span>
      </div>
  

    </div>
  </template>
  
  
  <script>
  
  // Import components
  import OnOffButton from "./OnOffButton.vue";

  
  export default {
    name: 'widgetMapOptions', // Caps, no -
    created() {
  
    },
    mounted() {
      window.FileManager.loadBaseLayerIcons().then((values) => {
        for (let i = 0; i< values.length; i++){
          this.baseLayers.push(values[i].value);
        }
      })
      
    },
    data (){
      return {
        selBaseLayer: '',
        baseLayerIconSrc: './Assets/BaseLayer/Imagery.png',
        baseLayers: [],
        isMouseOver: false,
      }
    },
    methods: {
      // USER INTERACTION
      baseLayerClicked: function(e, index){
        this.isMouseOver = false;
        this.baseLayerIconSrc = this.baseLayers[index].img.src;
        window.eventBus.emit("WidgetMapOptions_BaseLayerClicked", this.baseLayers[index].name);
      },

  
    },
    components: {
      "onOffButton": OnOffButton,
    }
  }
  </script>
  
  
  
  
  <style scoped>
  #widgetMapOptions {
    z-index: 11;
    /* position: absolute;
    top: 150px;
    left: 2px; */
  }

  @media screen and (max-width: 770px) {
    #widgetMapOptions {
      top: 120px;
    }
  }
  
  #baseLayerSelection {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 8px;
  }

  .otherBaseLayersContainer{
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    align-items: center;
  }
  
  #isobathsContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px;
  }
  
  #buttonsWidget > div {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }
  
  </style>