<template>
  <!-- Container -->
  <div id="weather-widget" class="wcontainer p-1">
    <div>
      <h6>{{$t('Weather and sea conditions')}}</h6>
      {{$t('Date')}}: {{currentDateHTML}}, {{$t('Latitude')}}: {{lat}} º, {{$t('Longitude')}}: {{long}} º
    </div>
    
    
    <!-- Table -->
    <table>
      <!-- Table Head - Days -->
      <thead>
        <tr>
          <td></td>
          <!-- Col for each day -->
          <th class="wcol" style="min-width:40px" :key="dd" v-for="(dd, index) in daysString" :title="dates[index].toISOString()">
            {{$t(dd.split(' ')[0]) + ' ' + dd.split(' ')[1]}}
          </th>
        </tr>
      </thead>
      <!-- Table body - Variables -->
      <tbody>
        <!-- Row -->
        <tr :key="dR.name" v-for="(dR, index) in dataRows">
          <!-- Row name -->
          <th scope="row"><span v-if="dR.imgURL== undefined">{{$t(dR.name)}} ({{dR.units}})</span></th>
          <!-- Values -->
          <td class="wcol" :key="dd.key" v-for="dd in dataRows[index].data">
            <div v-if='dd.loading && !dR.imgURL' class="spinner-border text-light" style="width: 1rem; height: 1rem; position: relative;" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <div v-else-if='dR.direction' :style="{'transform': 'rotate('+ (-dd.value - 90) +'deg)'}" :title="dd.value + 'º'">&#10140;</div>
            <div v-else-if='dR.imgURL'><img :src=dR.defURL :alt=dR.source :style="getImageStyle(dR, dd)"></div>

            <div v-else-if='!dd.loading' :style="getStyle(dR, dd)">{{dd.value}}</div>
            
          </td>
        </tr>
      </tbody>
      
    </table>

    <div>
      <i>Generated using E.U. Copernicus Marine Service Information; </i>
      <i><a href="https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS6" target="_blank" rel="noreferrer noopener">Sea Physics Analysis and Forecast; </a></i>
      <i><a href="https://doi.org/10.25423/CMCC/MEDSEA_MULTIYEAR_PHY_006_004_E3R1" target="_blank" rel="noreferrer noopener">Sea Physics Reanalysis; </a></i>

      <i><a href="https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam3" target="_blank" rel="noreferrer noopener">Sea Waves Analysis and Forecast; </a></i>
      <i><a href="https://doi.org/10.25423/cmcc/medsea_multiyear_wav_006_012" target="_blank" rel="noreferrer noopener">Sea Waves Reanalysis; </a></i>

      <i><a href="https://doi.org/10.25423/cmcc/medsea_analysisforecast_bgc_006_014_medbfm3" target="_blank" rel="noreferrer noopener">Sea Biogeochemistry Analysis and Forecast; </a></i>
      <i><a href="https://doi.org/10.25423/cmcc/medsea_multiyear_bgc_006_008_medbfm3" target="_blank" rel="noreferrer noopener">Sea Biogechemistry Reanalysis; </a></i>

      <i><a href="https://doi.org/10.48670/moi-00184" target="_blank" rel="noreferrer noopener">Wind L4 Near real Time; </a></i>
      <i><a href="https://doi.org/10.48670/moi-00185" target="_blank" rel="noreferrer noopener">Wind L4 Reprocessed; </a></i>
    </div>

  </div>
</template>




<script>
export default {
  // REQUIRES WMSDataRetriever.js
  name: "weather-info",
  created(){
    // Create data retreiver
    this.dataRetriever = new WMSDataRetriever();
    
    // Create data array inside dataRows
    this.dataRows.forEach(dr => {
      dr.data = [];
      for (let i = 0; i < this.numDays; i++)
        dr.data[i] = {value: '', loading: true, key: dr.name ? dr.name + i : dr.key + i};
    });
  },
  mounted(){
    // EVENTS
    // Panel open
    window.eventBus.on('SidePanel_isPanelOpen', this.panelStateChanged)
  },
  unmounted(){

  },
  data(){
    return {
      // Check https://es.wisuki.com/spot/2617/barceloneta for inspiration
      dataRows: [
        { // Wind icon
          key: 'windicon',
          imgURL: 'icons.png',
          position: 0,
          defURL: 'data/emptyPixel.png',
          source: 'Wind',
          signRange: [5,15],
          color: '#6164ff',
        },
        { 
          name: "Wind direction",
          abbr: "Dir",
          units: "º",
          direction: true, 
          layer: "Wind",
        },
        { 
          name: "Wind",
          abbr: "Wind",
          icon: true,
          units: "m/s", 
          range: [0, 30],
          signRange: [5,15],
          color: '#6164ff',//'#71c3eb',
          colorScale: 'boxfill/sst_36'
        },
        
        { // Wave icon
          key: 'waveicon',
          imgURL: 'icons.png',
          position: 1,
          defURL: 'https://es.wisuki.com/images/px.png',
          source: 'Wave significant height',
          signRange: [1, 4],
          color: '#6164ff',
        },
        {
          name: "Wave direction",
          abbr: "Dir",
          units: "º", 
          direction: true, 
          layer: "Wave significant height",
        },
        {
          name: "Wave significant height",
          abbr: "Waves",
          icon: true,
          units: "m", 
          range: [0, 8],
          signRange: [0.2,4],
          color: '#6164ff',//'#71c3eb',
          colorScale: 'boxfill/alg',
        },
        {
          name: "Wave period",
          abbr: "T",
          units: "s", 
          range: [0,25],
          signRange: [6,15],
          color: '#6164ff' // TODO: color or colorScale. If color, go from transparent to the specified color.
        },
        { // Current icon
          key: 'currenticon',
          imgURL: 'icons.png',
          position: 2,
          defURL: 'https://es.wisuki.com/images/px.png',
          source: 'Sea surface velocity',
          signRange: [0.25, 1],
          color: '#6164ff',
        },
        {
          name: "Sea current direction",
          abbr: "Dir",
          units: "m/s",
          direction: true,
          layer: "Sea surface velocity",
          color: '#6164ff',//'#71c3eb',
        },        {
          name: "Sea surface velocity",
          abbr: "Current",
          icon: true,
          units: "m/s",
          range: [0, 3],
          signRange: [0.25, 1],
          color: '#6164ff',//'#71c3eb',
        },
        {
          name: "Chlorophyll",
          abbr: "Chl",
          units: "mg/m3", 
          range: [0, 2.5],
          signRange: [0.5,1],
          color: '#6164ff'
        },
        {
          name: "Salinity",
          abbr: "Sal",
          units: "‰", 
          range: [30, 45],
          signRange: [38, 40],
          color: '#6164ff'
        },
        {
          name: "Sea surface temperature",
          abbr: "SST",
          units: 'ºC',
          elevation: true, // TODO: ALLOWS 2D PLOT IF CLICKED ON THE VARIABLE NAME ▼?
          range: [10, 25],
          colorScale: 'boxfill/sst_36',
        },
        {
          name: "Sea bottom temperature",
          abbr: "Bottom t",
          units: 'ºC',
          range: [10, 25],
          colorScale: 'boxfill/sst_36'
        },
      ],
      numDays: 7,
      daysString: [],
      currentDateHTML: '',
      lat: '',
      long: '',
      selTrackId: undefined,

    }
  },
  methods: {
    // USER HTML ACTIONS
    onClick: function(event){

    },

    // PRIVATE METHODS
    panelStateChanged: function(isPanelOpen){
      if (isPanelOpen){
        // Get selected track id
        let selId = FishingTracks.getSelectedTrack();
        this.requestDataUpdate(selId);
      }
    },


    getData: function(lat, long){
      // Get data
      this.dataRows.forEach((rr, rIndex) => {
        this.dates.forEach((date, dIndex) => {
          let layerName = rr.direction ? rr.layer : rr.name;
          // Icon row does not load data
          if (layerName !== undefined){
            this.dataRetriever.getDataAtPoint(layerName, date.toISOString(), lat, long, 'd', rr.direction)
              .then(value => {
                if (value == undefined){
                  rr.data[dIndex].value = 'x';
                  rr.data[dIndex].loading = false;
                  return;
                }
                rr.data[dIndex].value = value.toFixed(2);
                rr.data[dIndex].loading = false;
                // Icon
                if (rr.icon){
                  // Find dataRow with source
                  let iconRow = this.dataRows.filter(e => e.source == rr.name)[0];
                  if (iconRow == undefined) {console.error('Icon is not found for ' + rr.name); return};
                  iconRow.data[dIndex].value = rr.data[dIndex].value;
                  iconRow.data[dIndex].loading = false;
                }
              })
              .catch(error => {
                console.error("Can't get CMEMS-WMS " + layerName + " on " + date.getUTCFullYear() + "/" + (date.getMonth()+1));
                rr.data[dIndex].value = 'x';
                rr.data[dIndex].loading = false;
              });
          } // end of if
        

        });
      })
      
      
    },



    getStyle: function(dR, dd){
      let color = dR.color;
      let range = dR.signRange ? dR.signRange : dR.range; // Significant range
      let value = dd.value;
      
      let alpha = value == 'x' ? 0 : 255*(value - range[0]) / (range[1] - range[0]);
      alpha = Math.max(Math.min(alpha, 255), 0); // Clamp for HEX conversion

      let textWeight = 'normal';
      if (dR.signRange){
        if (value > (range[0] + 0.33*(range[1]-range[0])))
          textWeight = 'bold';
        else if (value > (range[0] + 0.66*(range[1]-range[0])))
          textWeight = 'bolder';
      }

      return {
        'background-color': color + alpha.toString(16).split('.')[0],
        'font-weight': textWeight,
        'border-radius': '4px',
      }
    },


    // Create image style
    getImageStyle: function(dR, dd){
      let color = dR.color;
      let range = dR.signRange ? dR.signRange : dR.range; // Significant range
      let value = dd.value;
      
      let alpha = value == 'x' ? 0 : (value - range[0]) / (range[1] - range[0]);
      alpha = Math.max(Math.min(alpha, 1), 0); // Clamp for HEX conversion
      //alpha *= 255;

      let colorFactor = 0;
      if (alpha == 0)
        colorFactor = 0;
      else if (alpha < 0.33)
        colorFactor = 1;
      else if (alpha < 0.66)
        colorFactor = 2;
      else
        colorFactor = 3;

      let cssPosition = -dR.position*32 - colorFactor * 32*3;

      // if (alpha/255 == 0){
      //   color = '#9cc6c8';
      // } else if (alpha/255 < 0.33){
      //   color = '#1fcf02';
      // } else if (alpha/255 < 0.66){
      //   color = '#da9000';
      // } else {
      //   color = '#e03636';
      // }

      // // Create linear gradient
      // let linGrad = 'linear-gradient(0deg, ' + color + '66 0%, ' + color + 'ff 100%)'

      return {
        //'background': color + alpha.toString(16).split('.')[0],
        'background-image': 'url('+ dR.imgURL +')',
        'background-position': cssPosition + 'px 0',
        // transform: 'scale(1)',
      }
    },

    // Create dates
    createDates: function(inputDate) {
      // If dates does not exists (initialization)
      this.dates = this.dates == undefined ? this.dates = [] : this.dates;
      let tempDate = new Date(inputDate.getTime());

      for (let i = 0; i < this.numDays; i++){
        this.daysString[this.numDays-1 - i] = tempDate.toDateString().substring(0,2) + ' ' + tempDate.getDate();
        this.dates[this.numDays-1 - i] = new Date(tempDate.getTime());
        tempDate.setDate(tempDate.getDate() - 1);
      }

      
    },


    updateTable: async function(inputDate, long, lat){
      this.lat = lat.toFixed(2);
      this.long = long.toFixed(2);
      let str = inputDate.toString().substring(0,15);
      // Translate
      this.currentDateHTML = this.$i18n.t(str.split(" ")[0]) + " " + this.$i18n.t(str.split(" ")[1]) + " " + str.split(" ")[2] + " " + str.split(" ")[3];

      // Cancel active requests
      this.dataRetriever.cancelActiveRequests();
      // Pause execution so the requests are aborted and the img error events are triggered (img.src=''; img.onerror)
      await new Promise((resolve) => setTimeout(resolve, 200));
      // Reset loading
      this.dataRows.forEach(dr => {
        for (let i = 0; i < this.numDays; i++){
          dr.data[i].value = '';
          dr.data[i].loading = true;
        }
      });
      // Create dates
      this.createDates(inputDate);
      // Update data
      this.getData(lat, long);
    },






    // PUBLIC METHODS
    requestDataUpdate(id){
      // Is selected track different from previously loaded?
      if (id != this.selTrackId){
        // If so, load new data
        this.selTrack = FishingTracks.getFeatureById(id);
        this.selTrackId = id;
        let coords = this.selTrack.geometry.coordinates;
        let middleCoordinate = [...coords[Math.round(coords.length/2)]]; // copy
        this.updateTable(this.selTrack.properties.info.Date, middleCoordinate[0], middleCoordinate[1]);
      }
    },

    
    

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
  /* display: flex; 
  flex-direction: column; */
  width: 100%;
  /* border:black;
  border-style: solid; */
}

table {
  margin-bottom: 30px;
}

.wrow {
  /* display: flex;
  flex-direction: row; */
  /* border:rgb(95, 95, 95);
  border-style: solid; */
  text-align: center;
}

.wcol {
  /* border:rgb(252, 252, 252);
  border-style: solid; */
  border-style:none;
  /* flex-grow: 1; */
  text-align: center;
  align-items: center;
  padding: 2px;
}


img {
  border-radius: 9px;
  width: 32px;
  height: 32px;
  background-repeat: no-repeat;
}
</style>