<template>
  <div id="haul-info" class="container-fluid">
    <!-- Empty space top -->
    <div class="lightBlue" style="height: 90px;"></div>
    <!-- Title -->
    <div class="rowEl p-3 lightBlue">
      <h4>{{$t('Fishing tracks')}}</h4>
    </div>
    <!-- Drop down -->
    <div class="rowEl p-3 g-0 lightBlue">
      <!-- TODO: This should be a modal with a table where you could sort by date and port. -->
      <select v-model="selTrack" @change="onSelectTrack">
        <option :id="option.Id" :key="option.Id" :value="option" v-for="option in options" >
          {{ option.Port + " - " + option.Date }}
        </option>
      </select>
    </div>
    <!-- Catch composition title -->
    <div class="rowEl p-3" style="background:white; justify-content: space-around !important;">
      <h4>{{$t('Catch composition')}}</h4>
      <!-- Export buttons -->
      <!-- Export data button -->
      <div>
        <button @click="exportButtonClicked">
          <span class="fa">&#xf56d; </span>
          <span class="button-text">{{ $t('Export data') }}</span>
        </button>
        <!-- Export options buttons -->
        <div class="dropdown-content" v-show="showExportOptions">
          <button @click="exportCSV">.csv</button>
          <button @click="exportJSON">.json</button>
        </div>
      </div>


    </div>
    <!-- Pie chart -->
    <div class="rowEl p-2 g-0" style="background: white" ref="pieChart">
    </div>
    
    <!-- Haul info -->
    <div class="rowEl p-2 g-0 darkBlue" style="flex-wrap: wrap; justify-content:flex-start;">
      <div style="width: 50%" :key="kk.Id" v-for="kk in Object.keys(selTrack)">
        <!-- If is not a number -->
        <span v-if="isNaN(selTrack[kk])">{{$tc("TrackFeatures." + kk)}}: {{$t(selTrack[kk])}}</span>
        <!-- If it is a number -->
        <span v-else>{{$tc("TrackFeatures." + kk, parseFloat(selTrack[kk]))}}</span>
      </div>
    </div>

    <!-- Weather widget -->
    <div class="rowEl p-2 g-0" style="background: var(--lightBlue); color: white; text-shadow: 0 0 4px black;">
      <weather-widget ref="weatherWidget"></weather-widget>
    </div>

    <!-- Row -->
    <div class="rowEl p-2 g-0" style="background: var(--blue); color: white; text-shadow: 0 0 4px black;">
      <sea-habitat ref="seaHabitat"></sea-habitat>
    </div>

    <!-- Empty space for mobile, as map falls on top of last element -->
    <div class="rowEl isVisibleInMobile p-2 g-0" style="background: var(--darkBlue); height: 200px; color: white; text-shadow: 0 0 4px black;">
    </div>
  </div>
  
</template>



<script>
import WeatherWidget from 'Components/Map/HaulInfo/WeatherWidget.vue';
import SeaHabitat from 'Components/Map/HaulInfo/SeaHabitat.vue';

export default {
  // REQUIRES FishingTracks.js
  name: "haul-info",
  created(){
    // Default options
    this.selTrack = this.options[0];
    // Default fishing track id comes from GUIManager
    this.selTrack.id = window.GUIManager.currentHaul;
    // Set selected fishing track
    FishingTracks.setSelectedTrack(this.selTrack.Id);
  },
  mounted(){    
    this.getSelectedFishingTrack();
    // EVENTS
    // Tracks loaded
    window.eventBus.on('Map_TracksLoaded', this.setFishingTracks);
    // Track selected
    window.eventBus.on('Map_trackClicked', this.setSelectedFishingTrack);
    window.eventBus.on('TracksTimeLine_trackClicked', this.setSelectedFishingTrack);
    // Language change
    window.eventBus.on('LanguageSelector_LanguageChanged', ()=> this.setPieChart(this.selTrack.Id));
    window.eventBus.on('GUIManager_LanguageChanged', ()=> this.setPieChart(this.selTrack.Id));
  },
  data(){
    return {
      selTrack: {},
      // Default options
      options: [{
        AvgDepth : "365.2",
        Date : "2022-11-30",
        Distance : "7360.59",
        Duration : "89.68",
        Estacio : "Autumn",
        FishingGroundType : "Upper slope",
        Id : 23288,
        Port : "Barcelona",
        ZonaPort : "Center",
      },],
      showExportOptions: false,

    }
  },
  methods: {
    // USER HTML ACTIONS
    // When a track is selected
    onSelectTrack: function(event){
      let selectValue = event.target.value;
      let id = event.target.selectedOptions[0].id;

      // Set on FishingTracks 
      FishingTracks.setSelectedTrack(id);

      // Update HaulInfo content
      this.setSelectedFishingTrack(id);

      // Emit selected target
      window.eventBus.emit('HaulInfo_SelectedTrack', id);
    },
    // Export data
    exportButtonClicked: function(e){
      this.showExportOptions = !this.showExportOptions;
      e.stopPropagation();
      e.preventDefault();
    },
    closeExportMenu: function(e){
      this.showExportOptions = false;
    },
    // https://www.codevoila.com/post/30/export-json-data-to-downloadable-file-using-javascript
    exportJSON: function(event){
      this.showExportOptions = false;
      // Data not yet loaded
      if (this.rawData === undefined)
        return;
      // Create
      let dataStr = JSON.stringify(this.rawData);
      let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      let linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      let trackFileName = this.$i18n.t('Catch composition').replaceAll(' ', '') + '_' + this.selTrack.Port.replaceAll("'", '').replaceAll(' - ', '_').replaceAll(' ', '') + '_' + this.selTrack.Date;
      linkElement.setAttribute('download', trackFileName + '_ICATMAR');
      linkElement.click();

      // Event for GAnalytics
      window.eventBus.emit("HaulInfo_Export", {fileExtension: "JSON", modality: "trawling", trackId: this.selTrack.Id});
    },


    // Export data (CSV)
    exportCSV: function(event){
      this.showExportOptions = false;
      // Data not yet loaded
      if (this.rawData === undefined)
        return;
      // Parse JSON to CSV
      let jsonData = this.rawData;
      let keys = Object.keys(jsonData[0]);

      let columnDelimiter = ',';
      let lineDelimiter = '\n';

      let csvColumnHeader = keys.join(columnDelimiter);
      let csvStr = csvColumnHeader + lineDelimiter;

      jsonData.forEach(item => {
          keys.forEach((key, index) => {
              if( (index > 0) && (index < keys.length) ) {
                  csvStr += columnDelimiter;
              }
              csvStr += item[key];
          });
          csvStr += lineDelimiter;
      });

      // Now make downlodable element
      let dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvStr);
      let linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      let trackFileName = this.$i18n.t('Catch composition').replaceAll(' ', '') + '_' + this.selTrack.Port.replaceAll("'", '').replaceAll(' - ', '_').replaceAll(' ', '') + '_' + this.selTrack.Date;
      linkElement.setAttribute('download', trackFileName + '_ICATMAR');
      linkElement.click();

      // Event for GAnalytics
      window.eventBus.emit("HaulInfo_Export", {fileExtension: "CSV", modality: "trawling", trackId: this.selTrack.Id});
    },
  


    // PRIVATE METHODS
    // Set Fishing track menu once they are loaded
    setFishingTracks: function(gjsonData){
      // Process features to fit into select HTML
      let features = gjsonData.features;
      features.forEach((ff, index) => {
        let info = ff.properties.info;
        //info.name = info.Port + " - " + info.Data;
        // Select info to show
        this.options[index] = {}
        Object.keys(info).forEach( kk => {
          if (kk != 'FishingGroundName' && kk!= 'MeshType' && kk!='Date' && kk!='Data')
            this.options[index][kk] = info[kk];
          if (kk == 'Date')
            this.options[index][kk] = info[kk].toISOString().substring(0,10);
        });
        
      });
      // Order by date
      this.options.sort((a, b) => {
          let dateDiff = new Date(a.Date) - new Date(b.Date);
          
          if (dateDiff == 0){
            return a.Port.localeCompare(b.Port);
          }else 
            return dateDiff;
      });
    },

    getSelectedFishingTrack: function(){
      let selId = FishingTracks.getSelectedTrack(); // This is a general application state. Maybe it should not be stored there
      this.options.forEach(oo =>{
        if (selId == oo.Id)
          this.selTrack = oo;
      });
    },


    // Create and set pie chart
    setPieChart: function(id){
      // Load haul from server or from file
      this.getHaul('data/trawlingData/hauls/' + id + '.json', undefined, this.selTrack);
    },


    // Fetch haul data from server of static file
    getHaul: function(address, staticFile, info) {
      fetch(address).then(r => r.json()).then(r => {
        this.rawData = r;
        // Create PieChart
        let pieChart = new PieChart();
        let preparedData = pieChart.processSample(r);
        this.$refs.pieChart.innerHTML = "";
        
        // Translations
        if (this.$i18n){
          this.translateData(preparedData);
        }
        
        pieChart.runApp(this.$refs.pieChart, preparedData, d3, info.Port + ", " + info.Date, this.$i18n.t("Biomass"), "kg / km2");

      }).catch(e => {
        if (staticFile !== undefined){ // Load static file
          console.error("Could not fetch from " + address + ". Error: " + e + ".");
          window.serverConnection = false;
          getHaul(staticFile, undefined, info);
        } else {
          console.error("Could not fetch from " + address + ". Error: " + e + ".");
        }
      })
    },



    // Translate data using $i18n
    translateData(prepData){
      Object.keys(prepData).forEach(key => {
        let el = prepData[key];
        if (typeof(el) == 'object'){
          this.translateData(el);
        } else if (typeof(el) == 'string') {
          prepData["translation"] = this.$i18n.t(el);
        }
      });
    },


    // PUBLIC METHODS
    // Set the selected fishing track in the select html element
    // Vue automatically updates the HTML element
    setSelectedFishingTrack: function(id){
      if (id == this.selTrack.id)
        return;

      this.options.forEach(oo =>{
        if (id == oo.Id)
          this.selTrack = oo;
      });
      // Update pie chart
      this.setPieChart(id);
      // Update weather table
      if (this.$refs.weatherWidget){
        this.$refs.weatherWidget.requestDataUpdate(id);
        // Get date, long, and lat
        // let coords = FishingTracks.getFeatureById(id).geometry.coordinates;
        // let middleCoordinate = [...coords[Math.round(coords.length/2)]]; // copy
        // this.$refs.weatherWidget.updateTable(new Date(this.selTrack.Date), middleCoordinate[0], middleCoordinate[1]);
      }
      // Update sea habitat table
      if (this.$refs.seaHabitat){
        // Get lat long
        let coords = FishingTracks.getFeatureById(id).geometry.coordinates;
        coords = [...coords]; // copy
        //let middleCoordinate = coords[Math.round(coords.length/2)];
        // Update sea habitat
        this.$refs.seaHabitat.updateData(coords);
      }
    },

    

  },
  components: {
    "weather-widget": WeatherWidget,
    "sea-habitat": SeaHabitat,
  },
  computed: {

  }
}
</script>

<style scoped>
#haul-info {
  font-size:12px;
}

#haul-info > div {
  padding: 1.5rem !important;
}

.rowEl {
  display:flex;
  flex-direction: row;
  justify-content: center;
}
.lightBlue {
  background: var(--lightBlue);
  color: white;
  text-shadow: 0 0 4px black;
}
.darkBlue {
  background: var(--darkBlue);
  color: white;
  text-shadow: 0 0 4px black;
}

select {
  border-radius: 10px;
  width: 350px;
  text-align: center;
  font-size: 0.95rem;
}

.dropdown-content {
  background-color: var(--darkBlue);
  min-width: 60px;
  width: fit-content;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.5);
  border-radius: 20%;

  display: flex;
  flex-direction: column;
}

.dropdown-content > button {
  text-decoration: none;
  display: block;
  margin: 0px;
}

.isVisibleInMobile {
  display: none;
}

@media screen and (max-width: 770px) {
  .isVisibleInMobile {
    display: block;
  }
}
</style>