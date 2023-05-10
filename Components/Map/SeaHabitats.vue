<template>
  <div id="seaHabitats">
    <!-- Legend sea habitats -->
    <div class="legendContainer">
      <!-- <img src="https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=eusm2021_eunis2019_full&FORMAT=image/png&LEGEND_OPTIONS=fontAntiAliasing:true;fontColor:0x000000&TRANSPARENT=TRUE"> -->
      <img src="data/SeaHabitats_legend.png">
    </div>

    <span>
      {{$t('Data from')}}: 
      <a href="https://www.emodnet-seabedhabitats.eu/access-data/launch-map-viewer/" title="EMODnet Seabed Habitats"
        target="_blank">EMODnet Seabed Habitats</a>
    </span>



  </div>
</template>



<script>


export default {
  // REQUIRES WMSDataRetriever.js
  // REQUIRES OL libraries
  name: "seaHabitat",
  created(){

  },
  mounted(){

  },
  unmounted(){

  },
  data(){
    return {
    }
  },
  methods: {

  

  },
  components: {

  },
  computed: {

  }
}
</script>

<style scoped>
#seaHabitats {
  display:flex;
  flex-direction: column;
  pointer-events: all;
}

span {
  font-size: clamp(0.6rem, 1.2vw, 0.8rem);
}
.legendContainer {
  overflow:auto;
  max-width: 350px;
  max-height: calc(100vh - 650px);
  background: #ffffffbe;
}
</style>