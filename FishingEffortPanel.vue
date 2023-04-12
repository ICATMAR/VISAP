<template>
  <div id="fishing-effort" class="p-4 container-fluid">
    <!-- Row -->
    <div class="row p-3">
      <h4>{{$t('Fishing effort')}}</h4>
    </div>
    
    <!-- Button group -->
    <div class="row p-3">
      <div class="btn-group" role="group">
        <button type="button" class="btn" :class="[selEffortType == eType ? 'btn-active' : '']" @click='effortClicked(eType)' :key="eType" v-for="eType in effortTypes">
          {{ $t('effortTypes.'+ eType)}}
        </button>
      </div>
    </div>

    <!-- Button group -->
    <div class="row p-3">
      <div class="btn-group" role="group">
        <button type="button" class="btn" :class="[selYear == yy ? 'btn-active' : '']" @click='yearClicked' :key="yy" v-for="yy in years">{{yy}}</button>
      </div>
    </div>

    <!-- Button group -->
    <div class="row p-3">
      <div class="btn-group" role="group">
        <button type="button" class="btn" :class="[selGear == fg ? 'btn-active' : '']" @click='gearClicked(fg)' :key="fg" v-for="fg in fishingGears">
          {{ $t('fishingGears.' + fg)}}
        </button>
      </div>
    </div>

    <!-- Layer visibility -->
    <div class="row p-3">
      <div class="d-flex flex-row justify-content-center align-self-center">
        <button class="btn m-2" :class="[layerOpacity > 0 ? '' : 'btn-active']" @click='layerVisClicked'>
          {{ $t('Layer visibility')}}
          
        </button>
        <input class='slider m-2' type="range" min="0" max="1" step="0.01" v-model="layerOpacity" id="layerOpacity">
        <!-- <div class=''>{{layerOpacity}}</div> -->
      </div>
    </div>

    <!-- Effort example -->
    <div class="row p-3 justify-content-md-center" style='flex-flow: nowrap;'>
      
      <div v-show='loading' class='col' style='justify-content: center; display: flex;'>
        <div class="spinner-border text-dark" style="width: 3rem; height: 3rem; position: relative;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-show='!loading' class="col-md-auto" style='display:flex; justify-content: right'>
        <img class='effortMap' ref='effortImg' :src='exampleImgURL' @load="onImageLoad()" @error="onImageNotFound($event)">
      </div>
      <div v-show='!loading' class="col-md-auto" style='display:flex; justify-content: left'>
        <img class='effortMapLegend' ref='effortLegend' :src='exampleLegendURL' @error="onLegendNotFound($event)">
      </div>
    </div>

    <div class="row p-3">
      <i v-if='selGear == "All"' style='text-align: center;'>{{$t('Data from')}} <a href="https://www.emodnet-humanactivities.eu/search-results.php?dataname=Vessel+Density+" target="_blank" rel="noreferrer noopener">EMODnet Human Activities, Vessel Density Map (Collecte Localisation Satellites (CLS)) </a></i>
      <i v-else style='text-align: center;'>{{$t('Data from')}} <a href="http://agricultura.gencat.cat/ca/departament/dar_plans_programes_sectorials/politica-maritima/icatmar/" target="_blank" rel="noreferrer noopener">ICATMAR (Institut Català de Recerca per la Governança del Mar) </a></i>
    </div>


  </div>
</template>


<script>
export default {
  name: "fishing-effort",
  created(){

  },
  mounted(){

  },
  unmounted(){

  },
  data(){
    return {
      effortTypes: ['hours', 'kg', 'euros'],
      years: [2018, 2019, 2020, 2021],
      fishingGears: ['All', 'Bottom trawling', 'Purse seine'],
      layerOpacity: 0.8,

      loading: true,

      selEffortType: 'hours',
      selYear: 2020,
      selGear: 'All',

      // https://www.emodnet-humanactivities.eu/view-data.php
      // https://ows.emodnet-humanactivities.eu/wms?LAYERS=2020_st_01_avg&FORMAT=image%2Fpng&TRANSPARENT=TRUE&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A4326&BBOX=-1,39,6,44&WIDTH=1024&HEIGHT=1024
      exampleImgURL: 'data/fishingEffort/fishingEffortExample_m1_39_6_44.png',
      exampleLegendURL: 'data/fishingEffort/fishingEffort_hours_2020_all_legend.png',
    }
  },
  watch: {
    layerOpacity(vv){
      this.$refs['effortImg'].style.opacity = vv*100 + '%';
      // Callback to change layer opacity. vv is the opacity (from 0 to 1)
      this.$emit('effortLayerOpacityChange', vv);
    },
    selEffortType(et){
      this.effortParamsChange();
    },
    selYear(et){
      this.effortParamsChange();
    },
    selGear(et){
      this.effortParamsChange();
    },
  },
  methods: {
    // USER HTML ACTIONS
    effortClicked: function(value){
      this.selEffortType = value;
    },

    yearClicked: function(e){
      this.selYear = e.target.innerText;
    },

    gearClicked: function(value){
      this.selGear = value;
    },

    layerVisClicked: function(e){
      this.layerOpacity = this.layerOpacity == 0 ? 0.8 : 0;
    },

    

    // PRIVATE METHODS
    effortParamsChange: function(){
      let selGear = this.selGear.toLowerCase();
      selGear = selGear.replace(' ', '');
      let outUrl = 'data/fishingEffort/fishingEffort_' + this.selEffortType + '_' +  this.selYear + '_' + selGear + '.png';
      this.$refs['effortImg'].src = outUrl;
      this.$emit('effortParamsChange', outUrl);
      // Legend
      let legUrl = 'data/fishingEffort/fishingEffort_' + this.selEffortType + '_' + selGear + '_legend.png';
      this.$refs['effortLegend'].src = legUrl;
      this.loading = true;
    },

    onImageLoad: function(){
      this.loading = false;
    },

    onImageNotFound: function(e){
      let imgEl = e.currentTarget;
      imgEl.src = 'https://bluenetcat.github.io/img/noData.png';
      this.loading = false;
    },

    onLegendNotFound: function(e){
      let imgEl = e.currentTarget;
      imgEl.src = 'data/emptyPixel.png';
    },




    // PUBLIC METHODS
    setLayerOpacity: function(opacity){ // Event coming from LayerPanel.vue
      this.layerOpacity = opacity;
    }

    

  },
  components: {

  },
  computed: {

  }
}
</script>

<style scoped>
.btn, #fishing-effort {
   font-size: 12px;
   
   border: 2px solid #02488e33;
}

.btn {
  background: rgba(198, 239, 255, 0.8);
  border: 2px solid #02488e33;
}

.btn-active {
  background: rgb(125 200 232);
}

.effortMap{
  border: 2px solid #02488e33;
  width: 200px;
  height: 200px;
  padding: 0px;
  border-radius: 9px;
}

.effortMapLegend {
  max-width: 200px;
  max-height: 200px;
  padding: 0px;
}

/* unvisited link */
a:link { color: #808080; }

/* visited link */
a:visited { color: #808080; }

/* mouse over link */
a:hover { color: #424242; }

/* selected link */
a:active { color: #000000; }
</style>