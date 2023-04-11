<template>
  <div id="layer-panel" class="p-4 container-fluid">
    <!-- Row - Title -->
    <div class="row p-3">
      <h4>{{$t('Layers')}}</h4>
    </div>

    <!-- Row - Base layers-->
    <div class="row p-3" style='justify-content: center;'>
      <!-- Column - Title -->
      <div class="col-md-auto centered">
        {{$t('Base layer')}}
      </div>
      <div class="col-md-auto centered">
        <!-- Button group - Base layers-->
        <div class="btn-group" role="group">
          <button type="button" class="btn" :class="[selBaseLayer == bLayer ? 'btn-active' : '']"
            @click='baseLayerClicked(bLayer)' :key="bLayer" v-for="bLayer in baseLayers">
            {{$t(bLayer)}}
          </button>
        </div>
      </div>
    </div>

    <!-- Row - Fishing Tracks-->
    <div class="row p-1">
      <div class="d-flex flex-row justify-content-center align-self-center">
        <button class="btn m-2" :class="[fTracksOpacity > 0 ? '' : 'btn-active']" @click='fTracksClicked'>
          {{$t('Fishing tracks')}}
        </button>
        <input class='slider m-2' type="range" min="0" max="1" step="0.01" v-model="fTracksOpacity" id="fTracksOpacity">
      </div>
    </div>

    <!-- Row - Fishing Effort -->
    <div class="row p-1">
      <div class="d-flex flex-row justify-content-center align-self-center">
        <button class="btn m-2" :class="[fEffortOpacity > 0 ? '' : 'btn-active']" @click='fEffortClicked'>
          {{$t('Fishing effort')}}
        </button>
        <input class='slider m-2' type="range" min="0" max="1" step="0.01" v-model="fEffortOpacity" id="fEffortOpacity">
      </div>
    </div>



    <!-- Row - Weather layers-->
    <div class="row p-3" style='justify-content: center; flex-wrap: nowrap'>
      <!-- Column - Title -->
      <div class="col-md-auto centered" style='flex-direction:column'>
        <div class='row'> {{$t('Climatological layer')}} </div>
        <div class='row'> {{$t('Date')}}: {{currentDate}} </div>
        <!-- <div class='row'> {{timeScale}} </div> -->
        <input class='row slider m-2' type="range" min="0" max="1" step="0.01" v-model="climaOpacity"
          id="fEffortOpacity">
        <div class='row'> {{$t('Data from')}}: <a title="Weather data source" :href="sourceDoi" target="_blank">E.U.
            Copernicus Marine Service Information</a> </div>
      </div>
      <div class="col-md-auto centered">
        <!-- Button group - Base layers-->
        <div class="btn-group" role="group" style='flex-direction: column;'>
          <button type="button" class="btn" :class="[selClimaLayer == cLayer ? 'btn-active' : '']"
            @click='climaLayerClicked(cLayer)' :key="cLayer" v-for="cLayer in climaLayers">
            {{$t(cLayer)}}
          </button>
        </div>
      </div>
    </div>



    <!-- Row - Sea habitats -->
    <div class="row p-1">
      <div class="d-flex flex-row justify-content-center align-self-center">
        <button class="btn m-2" :class="[seaHabOpacity > 0 ? '' : 'btn-active']" @click='seaHabClicked'>
          {{$t('Sea habitats')}}
        </button>
        <input class='slider m-2' type="range" min="0" max="1" step="0.01" v-model="seaHabOpacity" id="seaHabOpacity">
      </div>
    </div>

    <!-- Row - Legend sea habitats -->
    <div class="row p-1" v-if="seaHabOpacity != 0">
      <div>
        <a href="https://www.emodnet-seabedhabitats.eu/access-data/launch-map-viewer/" title="EMODnet Seabed Habitats"
          target="_blank">EMODnet Seabed Habitats</a>
      </div>
      <div style="overflow: auto">
        <!-- <img src="https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=eusm2021_eunis2019_full&FORMAT=image/png&LEGEND_OPTIONS=fontAntiAliasing:true;fontColor:0x000000&TRANSPARENT=TRUE"> -->
        <img src="data/SeaHabitats_legend.png">
      </div>
    </div>

  </div>
</template>



<script>
export default {
  name: "layer-panel",
  created(){
    // TODO: WMSDataRetriever could return a openlayers source or similar
    // LayerPanel > WMSDataRetriever: give me parameters for that data type and date
    // LayerPanel > Map: send parameters. Map can create layer from a dataset (and also animation layer)

    // Create data retreiver
    this.dataRetriever = new WMSDataRetriever(); // TODO: change data retriever constructor to getInstance static method

  },
  mounted(){

  },
  unmounted(){

  },
  data(){
    return {
      fTracksOpacity: 1,
      fEffortOpacity: 1,
      seaHabOpacity: 0,
      climaOpacity: 1,
      baseLayers: ['Bathymetry', 'OSM', 'Imagery', 'Ocean'], // TODO: get layers from map when created
      selBaseLayer: 'Bathymetry',
      climaLayers: ['None', 'Sea Surface Temperature', 'Sea Temperature Anomaly', 'Sea Bottom Temperature', 'Chlorophyll', 'Salinity', 'Wind', 'Wave Significant Height', 'Current'],
      selClimaLayer: 'None',

      currentDate: '13 April 2019',
      sourceDoi: 'https://resources.marine.copernicus.eu/products',
      // timeScale: 'Daily mean',
      
    }
  },
  watch: {
    fTracksOpacity(vv){
      // Callback to change layer opacity
      this.$emit('layerOpacityChange', ['fishingTracks', vv]);
    },
    fEffortOpacity(vv){
      this.$emit('layerOpacityChange', ['fishingEffort', vv]);
    },
    seaHabOpacity(vv){
      this.$emit('layerOpacityChange', ['seaHabitats', vv]);
    },
    climaOpacity(vv){
      this.$emit('layerOpacityChange', ['data', vv]);
    }
  },
  methods: {
    // USER HTML ACTIONS
    baseLayerClicked: function(bLayer){
      this.selBaseLayer = bLayer;
      this.$emit('baseLayerChange', this.selBaseLayer);
    },
    // Fishing tracks layer opacity
    fTracksClicked: function(e){
      this.fTracksOpacity = this.fTracksOpacity == 0 ? 1 : 0;
    },
    fEffortClicked: function(e){
      this.fEffortOpacity = this.fEffortOpacity == 0 ? 0.8 : 0;
    },
    seaHabClicked: function(e){
      this.seaHabOpacity = this.seaHabOpacity == 0 ? 0.8 : 0;
    },
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
      this.$emit('climaLayerChange', source);
    },
    


    // PUBLIC METHODS
    // Connected to Fishing Effort panel
    setFEffortOpacity: function(opacity){
      this.fEffortOpacity = opacity;
    },
    // Event coming from Map.vue, when a fishing track is clicked there
    fishingTrackSelected: function(id){
      this.updateClimaLayer();
    },

    

  },
  components: {

  },
  computed: {

  }
}
</script>

<style scoped>
#layer-panel {
   font-size: 12px
}

.btn {
  background: rgba(198, 239, 255, 0.8);
  border: 2px solid #02488e33;
  font-size: 12px
}

.btn-active {
  background: rgb(125 200 232);
}

.btn:hover {
  background: rgba(169, 231, 255, 0.8);
  box-shadow: 0 0 4px #02488e33;
}

.centered {
    display: flex;
    align-items: center;
    justify-content: center;
}

a:link { color: #808080; }
a:visited { color: #808080; }
a:hover { color: #424242; }
a:active { color: #000000; }
</style>