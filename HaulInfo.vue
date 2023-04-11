<template>
  <div id="haul-info" class="p-4 container-fluid">
    <!-- Row -->
    <div class="row p-3">
      <h4>{{$t('Fishing tracks')}}</h4>
    </div>
    <!-- Row -->
    <div class="row p-3 g-0">
      <!-- TODO: This should be a modal with a table where you could sort by date and port. -->
      <select v-model="selTrack" @change="onSelectTrack">
        <option :id="option.Id" :key="option.Id" :value="option" v-for="option in options" >
          {{ option.name }}
        </option>
      </select>
    </div>
    <!-- Row -->
    <div class="row p-2 g-0" ref="pieChart">
    </div>
    
    <!-- Row -->
    <div class="row p-2 g-0">
      <ul>
        <li style="list-style-position: inside;" :key="kk.Id" v-for="kk in Object.keys(selTrack)">
          <!-- {{$tc("TrackFeatures." + kk)}}: {{selTrack[kk]}} -->
          <!-- If is not a number -->
          <span v-if="isNaN(selTrack[kk])">{{$tc("TrackFeatures." + kk)}}: {{$t(selTrack[kk])}}</span>
          <!-- If it is a number -->
          <span v-else>{{$tc("TrackFeatures." + kk, parseFloat(selTrack[kk]))}}</span>
        </li>
      </ul>
    </div>

    <!-- Row -->
    <div class="row p-2 g-0">
      <weather-widget ref="weatherWidget"></weather-widget>
    </div>

    <!-- Row -->
    <div class="row p-2 g-0">
      <sea-habitat ref="seaHabitat"></sea-habitat>
    </div>
  </div>
  
</template>



<script>
import WeatherWidget from './WeatherWidget.vue';
import SeaHabitat from './SeaHabitat.vue';

export default {
  // REQUIRES FishingTracks.js
  name: "haul-info",
  created(){
    this.selTrack = this.options[0];
    // Set selected fishing track
    FishingTracks.setSelectedTrack(this.selTrack.Id);
  },
  mounted(){
    //this.getFishingTracks();
    this.getSelectedFishingTrack();
  },
  unmounted(){
    // Deselect fishing track
    FishingTracks.setSelectedTrack(undefined);
    // Emit undefined id
    this.$emit('selectedTrack', undefined);
  },
  data(){
    return {
      selTrack: '',
      options: [
        { AvgDepth: "402.6",
        Data: "2020-11-12",
        Date: new Date("Thu Nov 12 2020 00:00:00 GMT-0800 (Pacific Standard Time)"),
        Distance: "15449.04",
        Duration: "128.17",
        Estacio: "Tardor",
        FishingGroundName: "clot de valldepins",
        FishingGroundType: "TALÚS INFERIOR",
        Id: 15699,
        MeshType: "Square",
        Port: "L'Ametlla de Mar",
        ZonaPort: "Sud",
        name: "L'Ametlla de Mar - 2020-11-12"},
      ]
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

      // Emit selected target
      this.$emit('selectedTrack', id);
    },

    // PRIVATE METHODS
    // Get Fishing Tracks from FishingTracks.js
    // getFishingTracks: function(){
    //   // Get geojson from FishingTracks
    //   let gjsonData= FishingTracks.getGeoJSON();
    //   // If data is not loaded yet --> DIRTY HACK. THIS SHOULD BE A SET FROM CALLBACK INSIDE FISHING TRACKS?
    //   if (gjsonData.features.length === 0){
    //     // Set timeout and try again
    //     setTimeout(this.getFishingTracks, 1000);
    //   } else {
    //     console.log("Fishing tracks loaded.");
    //   }
    //   // Process features to fit into select HTML
    //   let features = gjsonData.features;
    //   features.forEach((ff, index) => {
    //     let info = ff.properties.info;
    //     info.name = info.Port + " - " + info.Data;
    //     this.options[index] = info;
    //   });
    //   // Order by date
    //   this.options.sort((a, b) => {
    //       return a.Date - b.Date;
    //   });
    // },

    // Set Fishing tracks once they are loaded
    setFishingTracks: function(gjsonData){
      // Process features to fit into select HTML
      let features = gjsonData.features;
      features.forEach((ff, index) => {
        let info = ff.properties.info;
        info.name = info.Port + " - " + info.Data;
        this.options[index] = info;
      });
      // Order by date
      this.options.sort((a, b) => {
          return a.Date - b.Date;
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
      if (window.serverConnection)
        this.getHaul("http://localhost:8080/haulSpecies?HaulId=" + id, 'data/hauls/' + id + '.json', this.selTrack);
      else
        this.getHaul('data/hauls/' + id + '.json', undefined, this.selTrack);
      
    },


    // Fetch haul data from server of static file
    getHaul: function(address, staticFile, info) {
      fetch(address).then(r => r.json()).then(r => {
        //console.log(r)
        // Create PieChart
        let pieChart = new PieChart();
        let preparedData = pieChart.processSample(r);
        this.$refs.pieChart.innerHTML = "";
        pieChart.runApp(this.$refs.pieChart, preparedData, d3, info.Port + ", " + info.Data, "Biomassa", "kg / km2");

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


    // PUBLIC METHODS
    // Set the selected fishing track in the select html element
    // Vue automatically updates the HTML element
    setSelectedFishingTrack: function(id){
      this.options.forEach(oo =>{
        if (id == oo.Id)
          this.selTrack = oo;
      });
      // Update pie chart
      this.setPieChart(id);
      // Update weather table
      if (this.$refs.weatherWidget){
        // Get date, lat, and long
        let coords = FishingTracks.getFeatureById(id).geometry.coordinates;
        let middleCoordinate = [...coords[Math.round(coords.length/2)]]; // copy
        this.$refs.weatherWidget.updateTable(new Date(this.selTrack.Date), middleCoordinate[1], middleCoordinate[0]);
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
</style>