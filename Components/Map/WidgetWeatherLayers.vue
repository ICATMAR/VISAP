<template>
  <!-- Container -->
  <div id='widgetWeatherLayers' ref='widgetWeatherLayers'>

    <!-- Desktop -->
    <template class="isHiddenInMobile">
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
    </template>

    <!-- Mobile -->
    <template class="isShownInMobile">
      <div class="vertical-container">
        <!-- Selected clima layer -->
        <div class="cLayerContainer">
          <button class='button-active'
            :title="$t(selClimaLayer)">
            <span class="fa" v-html="climaIcons[climaLayers.indexOf(selClimaLayer)]"></span>
          </button>
          <span>{{$t(selClimaLayer)}}</span>
        </div>
        <!-- Other clima layers-->
        <div class="horizontal-container">
          <div class="clickable cLayerContainer cLayerIconOnly" :key="cLayer" v-for="(cLayer, index) in climaLayers">
            <button :class="[selClimaLayer == cLayer ? 'button-active' : 'clickable']"
              @click='climaLayerClicked(cLayer)'
              :title="$t(cLayer)">
              <span class="fa" v-html="climaIcons[index]"></span>
            </button>
          </div>
        </div>
      </div>
      
    </template>

    <!-- WMS graphic legend -->
    <!-- <img v-if="WMSLegendURL != ''" id='wmsLegend' :src="WMSLegendURL"> -->
    <wms-legend ref="wmsLegend"></wms-legend>

    <!-- Current date -->
    <span>{{$t('Date')}}: {{ currentDate }}</span>

    <!-- Data source attribution -->
    <span class="wrapText">{{$t('Data from')}}: <a title="Weather data source" :href="sourceDoi" target="_blank">E.U.
            Copernicus Marine Service Information</a></span>
    


  </div>
  </template>
  
  
  <script>
  
  // Import components
  import WMSLegend from './WMSLegend.vue';

  export default {
    name: 'widgetWeatherLayers', // Caps, no -
    created() {
      // Create data retreiver
      this.dataRetriever = window.WMTSDataRetriever;
    },
    mounted() {
      // EVENTS
      // Fishing track clicked
      window.eventBus.on('TracksTimeLine_trackClicked', this.updateClimaLayer);
      window.eventBus.on('Map_trackClicked', this.updateClimaLayer);
      
    },
    data (){
      return {
        climaLayers: ['Sea Surface Temperature', 'Sea Temperature Anomaly', 'Sea Bottom Temperature', 'Chlorophyll', 'Salinity', 'Wind', 'Wave Significant Height', 'Current'],
        // https://origin.fontawesome.com/search?o=r&m=free&f=classic
        climaIcons: ['&#xf2c9;<sub>~</sub>', '&#x2206; &#xf2c9;', '&#xf2c9;<sup>~</sup>', 'C<sub>hl</sub>', '‰', '&#xf72e;', '&#xe515;', '&#xf773;'],
        selClimaLayer: '',
        isClimaLayerVisible: false,
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
        if (this.selClimaLayer == undefined || this.selClimaLayer == '')
          return
        if (!this.isClimaLayerVisible)
          return
        // Get date
        let ff = FishingTracks.getFeatureById(FishingTracks.getSelectedTrack());
        if (ff == undefined){
          setTimeout(this.updateClimaLayer, 1000);
          console.log("Fishing track not found. Trying again in 1s.");
          return;
        }
        this.currentDate = ff.properties.info.Data;
        let date = ff.properties.info.Data + 'T12:00:00.000Z';
        // Get clima URL
        debugger;
      
        let infoWMS = {};//this.dataRetriever.getDataTypeURL(this.selClimaLayer, date, 'd');
        //   url: url, 
        // params: params,
        // name: dataType.name, // not necessary?
        // doi: dataType.doi,
        // attributions: '© CMEMS', // TODO
        this.sourceDoi = infoWMS == undefined ? 'https://resources.marine.copernicus.eu/products' : infoWMS.doi;
        // If source is not found, it will send undefined
        window.eventBus.emit('WidgetWeatherLayers_ClimaLayerChange', infoWMS);
        // Set legend
        this.$refs.wmsLegend.setWMSLegend(infoWMS);
      },


      // PUBLIC METHODS
      setVisible: function(isVisible){
        this.isClimaLayerVisible = isVisible;
        if (isVisible){
          // Default clima layer if not defined
          this.selClimaLayer = this.selClimaLayer == '' ? 'Sea Surface Temperature' : this.selClimaLayer;
          this.updateClimaLayer();
        } else {
          window.eventBus.emit('WidgetWeatherLayers_ClimaLayerChange', undefined);
        }
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

    max-height: 100%;

    display: flex;
    flex-direction: column !important;
    align-items: flex-start !important;
  }


  .vertical-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 8px;
  }

  .isShownInMobile {
    display: none;
  }
  .isHiddenInMobile {
    display: block;
  }


  .cLayerContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 2px;
    background: #0000003b;
    padding-right: 4px;
    border-radius: 30px;

    height: clamp(10px, 3vh, 30px);
  }

  span {
    font-size: clamp(0.6rem, 1.2vw, 0.8rem);
  }

  .wrapText {
    inline-size: 190px;
    overflow-wrap: break-word;
    pointer-events: all;
  }



  @media screen and (max-width: 500px), screen and (max-height: 850px) {
    /* TODO: ELEMENTS IN A ROW, AS IN WINDY */
    .cLayerIconOnly {
      background: none;
      padding: 0px;
      margin: 1px;
    }

    .horizontal-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      padding: 8px;
    }

    .isShownInMobile{
      display: block;
    }

    .isHiddenInMobile {
      display: none;
    }
    
  }
  
  
  </style>