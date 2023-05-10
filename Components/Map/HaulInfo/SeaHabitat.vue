<template>
  <div id="seaHabitat" class="wcontainer p-1">
    <!-- Row -->
    <div>
      <h6>{{$t('Sea habitats')}}</h6>
    </div>

    <!-- Row -->
    <div class="row p-3 g-0">
      <div ref="featContainer"></div>
    </div>


  </div>
</template>



<script>
export default {
  // REQUIRES WMSDataRetriever.js
  // REQUIRES OL libraries
  name: "seaHabitat",
  created(){
    // WMS source of sea habitats
    this.source = new ol.source.TileWMS({
      url: 'https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms',
      params: {
        'LAYERS': 'eusm2021_eunis2019_group',
        'TILED': 'TRUE',
      },
      attributions: "© EMODnet Seabed Habitats initiative",
      crossOrigin: 'anonymous',
    });
    // WMS Legend
    this.legendURL = 'https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=eusm2021_eunis2019_full&FORMAT=image/png&LEGEND_OPTIONS=fontAntiAliasing:true;fontColor:0x000000&TRANSPARENT=TRUE';


    // Pre-load -- Error, refs is not ready yet?
    // this.updateData([[1.3,40.5], [1.4,40.6]]);
  },
  mounted(){

  },
  unmounted(){

  },
  data(){
    return {
      selTrack: '',
    }
  },
  methods: {
    // USER HTML ACTIONS

    // PRIVATE METHODS

    // PUBLIC METHODS
    updateData: function(coordinates){ // long, lat in EPSG:4326
      // Empty info container
      this.$refs.featContainer.innerHTML = '';

      // Calculate bbox
      let bbox = [Infinity, Infinity, -Infinity, -Infinity];
      for (let i = 0; i < coordinates.length; i++){
        // Transform to EPSG:3857
        coordinates[i] = ol.proj.transform(coordinates[i], 'EPSG:4326', 'EPSG:3857');
        // Find max and min longitude and latitude
        bbox[0] = Math.min(bbox[0], coordinates[i][0]);
        bbox[1] = Math.min(bbox[1], coordinates[i][1]);
        bbox[2] = Math.max(bbox[2], coordinates[i][0]);
        bbox[3] = Math.max(bbox[3], coordinates[i][1]);
      }
      // Middle point
      let rangeBBOX = [bbox[2] - bbox[0], bbox[3] - bbox[1]];
      let middleCoord = [bbox[0] + rangeBBOX[0]/2, bbox[1] + rangeBBOX[1]/2];

      // LEGEND
      // https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=eusm2021_eunis2019_full&FORMAT=image/png&&LEGEND_OPTIONS=fontAntiAliasing:true;fontColor:0x000000


      // Get FeatureInfo url
      let url = this.source.getFeatureInfoUrl(
          middleCoord, 
          Math.max(...rangeBBOX)/10,//viewResolution, --> leads to 200m, 400m, 800m simplification
          'EPSG:3857',
          {'INFO_FORMAT': 'text/html',
          'feature_count': '50'}
        );
        
        if (url) {
          // Fetch
          this.$refs.featContainer.innerHTML = `
            <div class="spinner-border text-dark" style="width: 1rem; height: 1rem; position: relative;" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>`; // Spinner

          fetch(url)
            .then((response) => response.text())
            .then((html) => {
              // Remove style
              html = html.replaceAll(html.substring(html.indexOf('<style'), html.indexOf('</style>') + 8), `
                <style>
                </style>
              `);
              // Change title style
              html = html.replaceAll('h2', 'i');
              // Change links style
              html = html.replaceAll('<p', '<i style="color:#808080;"');
              html = html.replaceAll('</p', '</i');
              // Add links
              let htmlLinks = `
                <a href="https://www.emodnet-seabedhabitats.eu/access-data/launch-map-viewer/" title="EMODnet Seabed Habitats" target="_blank">(EMODnet Seabed Habitats)</a>
              `;
              
              html = html.replaceAll('</a>', '</a>' + htmlLinks);

              this.$refs.featContainer.innerHTML = html;
            });
        }

    }

    

  },
  components: {

  },
  computed: {

  }
}
</script>

<style scoped>
.wcontainer {
  font-size:12px;
  width: 100%;
}

table.featureInfo, table.featureInfo td, table.featureInfo th {
		border:1px solid rgb(255, 0, 0);
		border-collapse:collapse;
		margin:0;
		padding:0;
		font-size: 90%;
		padding:.2em .1em;
	}
	table.featureInfo th {
	    padding:.2em .2em;
		font-weight:bold;
		background:#eee;
	}
	table.featureInfo td{
		background:#fff;
	}
	table.featureInfo tr.odd td{
		background:#eee;
	}
	table.featureInfo caption{
		text-align:left;
		font-size:100%;
		font-weight:bold;
		padding:.2em .2em;
	}
</style>