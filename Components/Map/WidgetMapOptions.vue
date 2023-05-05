<template>
    <!-- Container -->
    <div id='widgetMapOptions' ref='widgetMapOptions'>

      <!-- Base layer selection -->
      <div id="baseLayerSelection" class="clickable menuElement" v-show="baseLayers.length != 0" @mouseleave="isMouseOver = false">
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
      <div class="clickable menuElement">
        <onOffButton ref="weatherOnOffButton" :checked="false" :inSize="'14px'" @change="weatherLayerOnOff($event)"></onOffButton>
        <span class="visibleInMobile fa" :title="$t('Weather and sea conditions')">&#xf2c9;, C<sub>hl</sub>, ‰, &#xf72e;, &#xf773;</span>
        <span class="hiddenInMobile" @click="weatherLayerOnOff">{{$t('Weather and sea conditions')}}</span>
      </div>
      <!-- Weather Layers -->
      <Transition>
        <widgetWeatherLayers ref="widgetWeatherLayers" v-show="isWeatherMenuVisible"></widgetWeatherLayers>
      </Transition>


      <!-- Sea habitats button -->
      <div class="clickable menuElement">
        <onOffButton ref="habitatsOnOffButton" :checked="false" :inSize="'14px'" @change="habitatsLayerOnOff($event)"></onOffButton>
        <span @click="habitatsLayerOnOff">{{$t('Sea habitats')}}</span>
      </div>
      <!-- Sea habitats legend -->
      <Transition>
        <sea-habitats ref="seaHabitats" v-show="isHabitatsVisible"></sea-habitats>
      </Transition>
  

    </div>
  </template>
  
  
  <script>
  
  // Import components
  import WidgetWeatherLayers from "./WidgetWeatherLayers.vue";
  import SeaHabitats from "./SeaHabitats.vue"
  import OnOffButton from "Components/Utils/OnOffButton.vue";

  
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
        isHabitatsVisible: false,
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
          // Hide other layer
          if (this.isWeatherMenuVisible) this.$refs.habitatsOnOffButton.setChecked(false);
        } 
        // Text was clicked --> Invoke click on the element, which calls again this function
        else {
          this.$refs.weatherOnOffButton.setChecked(!this.isWeatherMenuVisible);
        }
      },

      // Sea habitats on off
      // TODO: merge weather and habitats into a single function?
      habitatsLayerOnOff: function(e){
        // OnOff Button was clicked
        if (e.target.value != undefined){ 
          this.isHabitatsVisible = e.target.checked;
          // Activate/Deactivate layer
          window.eventBus.emit('WidgetMapOptions_setLayerVisible', ['seaHabitats', this.isHabitatsVisible]);
          // Hide other layer
          if (this.isHabitatsVisible) this.$refs.weatherOnOffButton.setChecked(false);
        }
        // Text was clicked --> Invoke click on the element, which calls again this function
        else {
          this.$refs.habitatsOnOffButton.setChecked(!this.isHabitatsVisible);
        }
      }
  
    },
    components: {
      "onOffButton": OnOffButton,
      "widgetWeatherLayers": WidgetWeatherLayers,
      "sea-habitats": SeaHabitats,
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

.menuElement {
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