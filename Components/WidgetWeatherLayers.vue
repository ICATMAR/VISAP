<template>
  <!-- Container -->
  <div id='widgetWeatherLayers' ref='widgetWeatherLayers'>

    <div class="vertical-container">
      <div class="clickable cLayerContainer" :key="cLayer" v-for="(cLayer, index) in climaLayers">
        <button :class="[selClimaLayer == cLayer ? 'button-active' : 'clickable']"
          @click='climaLayerClicked(cLayer)'
          :title="$t(cLayer)">
          <span class="fa" v-html="climaIcons[index]"></span>
        </button>
        <span @click='climaLayerClicked(cLayer)'>{{$t(cLayer)}}</span>
      </div>
    </div>

    <!-- WMS graphic legend -->
    <!-- <img v-if="WMSLegendURL != ''" id='wmsLegend' :src="WMSLegendURL"> -->
    <wms-legend ref="wmsLegend"></wms-legend>

    <span class="wrapText">{{$t('Data from')}}: <a title="Weather data source" :href="sourceDoi" target="_blank">E.U.
            Copernicus Marine Service Information</a></span>
    <span>{{$t('Date')}}: {{ currentDate }}</span>


  </div>
  </template>
  
  
  <script>
  
  // Import components
  import WMSLegend from './WMSLegend.vue';

  export default {
    name: 'widgetWeatherLayers', // Caps, no -
    created() {
      // Create data retreiver
      this.dataRetriever = new WMSDataRetriever();
    },
    mounted() {
      // EVENTS
      // Fishing track clicked
      window.eventBus.on('fishingTrackSelected', id => {
        this.updateClimaLayer();
      });
    },
    data (){
      return {
        climaLayers: ['Sea Surface Temperature', 'Sea Temperature Anomaly', 'Sea Bottom Temperature', 'Chlorophyll', 'Salinity', 'Wind', 'Wave Significant Height', 'Current'],
        // https://origin.fontawesome.com/search?o=r&m=free&f=classic
        climaIcons: ['&#xf2c9;<sub>~</sub>', '&#x2206; &#xf2c9;', '&#xf2c9;<sup>~</sup>', 'C<sub>hl</sub>', '‰', '&#xf72e;', '&#xe515;', '&#xf773;'],
        selClimaLayer: '',
        climaOpacity: 1,
        // Defaults
        WMSLegendURL: '',
        sourceDoi: '',
        currentDate: '',

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
        let infoWMS = this.dataRetriever.getDataTypeURL(this.selClimaLayer, date, 'd');
        this.sourceDoi = infoWMS == undefined ? 'https://resources.marine.copernicus.eu/products' : infoWMS.doi;
        // If source is not found, it will send undefined
        window.eventBus.emit('WidgetWeatherLayers_ClimaLayerChange', infoWMS);
        // Set legend
        this.$refs.wmsLegend.setWMSLegend(infoWMS);
      }
  
    },
    components: {
      'wms-legend': WMSLegend,
    }
  }
  </script>
  
  
  
  
  <style scoped>
  #widgetWeatherLayers {
    z-index: 11;
    user-select: none;

    padding-top: 0px !important;
    margin-top: -8px !important;

    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;

  }

  @media screen and (max-width: 770px) {
    /* TODO: ELEMENTS IN A ROW, AS IN WINDY */
  }


  .vertical-container {
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

  span {
    font-size: clamp(0.6rem, 1.2vw, 0.8rem);
  }

  .wrapText {
    inline-size: 190px;
    overflow-wrap: break-word;
  }
  
  
  </style>