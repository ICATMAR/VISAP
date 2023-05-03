<template>
    <!-- Container -->
    <div id='widgetMapOptions' ref='widgetMapOptions'>

      <!-- Base layer selection -->
      <div id="baseLayerSelection" class="clickable" v-show="baseLayers.length != 0" @mouseleave="isMouseOver = false">
        <!-- Selected -->
        <img class="icon-str icon-img" :src="baseLayerIconSrc" @click="isMouseOver=true" v-show="!isMouseOver">
        <!-- Other base layers -->
        <div class="otherBaseLayersContainer" v-show="isMouseOver">
          <div v-for="baseLayer, index in baseLayers">
            <img class="icon-str icon-img" :src="baseLayer.img.src" @click="baseLayerClicked($event, index)" :title="baseLayer.name">
          </div>
        </div>
        <!-- Text -->
        <span @click="isMouseOver=!isMouseOver">{{$t('Base layer')}}</span>
      </div>

      <!-- Iso bars TODO -->
      <div id="isobathsContainer" v-show="false">
        <onOffButton :checked="false" :inSize="'18px'" @change="isoOnOffChange($event)"></onOffButton>
        <span>Isobaths</span>
      </div>

      <!-- Weather and sea -->
      <div class=clickable>
        <onOffButton ref="weatherOnOffButton" :checked="false" :inSize="'14px'" @change="weatherLayerOnOff($event)"></onOffButton>
        <span @click="weatherLayerOnOff">{{$t('Weather and sea conditions')}}</span>
      </div>

      <!-- Weather Layers -->
      <Transition>
        <widgetWeatherLayers ref="widgetWeatherLayers" v-show="isWeatherMenuVisible"></widgetWeatherLayers>
      </Transition>
  

    </div>
  </template>
  
  
  <script>
  
  // Import components
  import WidgetWeatherLayers from "./WidgetWeatherLayers.vue";
  import OnOffButton from "./OnOffButton.vue";

  
  export default {
    name: 'widgetMapOptions', // Caps, no -
    created() {
  
    },
    mounted() {
      // Load base layer icons
      window.FileManager.loadBaseLayerIcons().then((values) => {
        for (let i = 0; i< values.length; i++){
          this.baseLayers.push(values[i].value);
        }
      });
      
    },
    data (){
      return {
        selBaseLayer: '',
        baseLayerIconSrc: './Assets/BaseLayer/Imagery.png',
        baseLayers: [],
        isMouseOver: false,
        isWeatherMenuVisible: false,
      }
    },
    methods: {
      // USER INTERACTION
      baseLayerClicked: function(e, index){
        this.isMouseOver = false;
        this.baseLayerIconSrc = this.baseLayers[index].img.src;
        window.eventBus.emit("WidgetMapOptions_BaseLayerClicked", this.baseLayers[index].name);
      },

      // Weather sea on off
      weatherLayerOnOff: function(e){
        // OnOff Button was clicked
        if (e.target.value != undefined){ 
          this.isWeatherMenuVisible = e.target.checked;
          // Activate weather layer
          this.$refs.widgetWeatherLayers.setVisible(this.isWeatherMenuVisible);
        } 


        // Text was clicked --> Invoke click on the element, which calls again this function
        else {
          this.$refs.weatherOnOffButton.setChecked(!this.isWeatherMenuVisible);
        }
        
      }
  
    },
    components: {
      "onOffButton": OnOffButton,
      "widgetWeatherLayers": WidgetWeatherLayers,
    }
  }
  </script>
  
  
  
  
  <style scoped>
  #widgetMapOptions {
    z-index: 11;
    user-select: none;

    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: flex-start;
    padding-left: 10px;

    background: #00000042;
    border-radius: 0px 10px 10px 0px;
  }

  @media screen and (max-width: 770px) {
    #widgetMapOptions {
      top: 120px;
    }
  }

  #widgetMapOptions > div {
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
  

  
  #buttonsWidget > div {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  span {
    font-size: clamp(0.6rem, 1.2vw, 0.8rem);
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