<template>
  <!-- Container -->
  <div id='widgetWeatherLayers' ref='widgetWeatherLayers'>

    <div>
      <div class="clickable cLayerContainer" :key="cLayer" v-for="cLayer in climaLayers">
        <button :class="[selClimaLayer == cLayer ? 'btn-active' : '']"
          @click='climaLayerClicked(cLayer)'>
        </button>
        <span>{{$t(cLayer)}}</span>
      </div>
    </div>


  </div>
  </template>
  
  
  <script>
  
  // Import components

  export default {
    name: 'widgetWeatherLayers', // Caps, no -
    created() {
      // Create data retreiver
      this.dataRetriever = new WMSDataRetriever();
    },
    mounted() {
      // EVENTS
      window.eventBus.on('fishingTrackSelected', id => {
        this.updateClimaLayer();
      })
      
    },
    data (){
      return {
        climaLayers: ['Sea Surface Temperature', 'Sea Temperature Anomaly', 'Sea Bottom Temperature', 'Chlorophyll', 'Salinity', 'Wind', 'Wave Significant Height', 'Current'],
        selClimaLayer: 'Sea Surface Temperature',
        climaOpacity: 1,

      }
    },
    methods: {
      // USER INTERACTION
      climaLayerClicked: function(cLayer){
        this.selClimaLayer = cLayer;
        // Update clima layer
        this.updateClimaLayer();
      },


      // PRIVATE METHODS
      updateClimaLayer: function(){
        // Get date
        let ff = FishingTracks.getFeatureById(FishingTracks.getSelectedTrack());
        this.currentDate = ff.properties.info.Data;
        let date = ff.properties.info.Data + 'T12:00:00.000Z';
        // Get clima URL
        let source = this.dataRetriever.getDataTypeURL(this.selClimaLayer, date, 'd');
        this.sourceDoi = source == undefined ? 'https://resources.marine.copernicus.eu/products' : source.doi;
        // If source is not found, it will send undefined
        window.eventBus.emit('WidgetWeatherLayers_climaLayerChange', source);
      }
  
    },
    components: {
    }
  }
  </script>
  
  
  
  
  <style scoped>
  #widgetWeatherLayers {
    z-index: 11;
    user-select: none;

    padding-top: 0px !important;
    margin-top: -8px !important;
  }

  @media screen and (max-width: 770px) {
    /* TODO: ELEMENTS IN A ROW, AS IN WINDY */
  }

  #widgetWeatherLayers > div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 8px;
  }

  .cLayerContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px;
  }
  
  
  </style>