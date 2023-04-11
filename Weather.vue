<template>
  <div id="weather-info" class="p-4 container-fluid">
    <!-- Row -->
    <div class="row p-3">
      <h4>Weather and sea conditions</h4>
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
    <div class="row p-2 g-0">
      <ul>
        <!-- Sea surface temperature -->
        <li style="list-style-position: inside;">
          Sea surface temperature: {{seaTemp}} ºC
          <div v-show='isLoading' class="spinner-border text-dark" style="width: 1rem; height: 1rem; position: relative; margin-left: 10px" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </li>
        <!-- Sea bottom temperature -->
        <li style="list-style-position: inside;">
          Sea bottom temperature: {{seaBottomTemp}} ºC
          <div v-show='isLoading' class="spinner-border text-dark" style="width: 1rem; height: 1rem; position: relative; margin-left: 10px" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </li>

        <!-- <li style="list-style-position: inside;">
          Sea surface temperature: {{seaTemp}} ºC
          <div v-show='isLoading' class="spinner-border text-dark" style="width: 1rem; height: 1rem; position: relative; margin-left: 10px" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </li> -->

        <!-- <li style="list-style-position: inside;">
          Sea surface temperature: {{seaTemp}} ºC
          <div v-show='isLoading' class="spinner-border text-dark" style="width: 1rem; height: 1rem; position: relative; margin-left: 10px" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </li> -->
      </ul>
    </div>

  </div>
</template>




<script>
export default {
  // REQUIRES FishingTracks.js
  name: "weather-info",
  created(){
    this.selTrack = this.options[0];
    // Should be in a different .vue object?
    this.dataRetriever = new WMSDataRetriever();
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
      ],
      isLoading: true,
      seaTemp: '',
      seaBottomTemp: '',
      sal: '',
      waveSignHeight: '',
      wind: '',
      chlor: '',
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

      // Update weather
      this.getWeatherData();

      // Emit selected target
      this.$emit('selectedTrack', id);
    },

    // PRIVATE METHODS
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


    // Get weather data from WMSDataRetriever
    getWeatherData: async function(){
      // TODO
      /*
      Conceptualy, this panel should show the layers? Meaning it should be a selection of the weather layers you want to superpose?
      */
      let ff = FishingTracks.getFeatureById(this.selTrack.Id);
      let coord = ff.geometry.coordinates[0];
      let lat = coord[1];
      let long = coord[0];
      let date = ff.properties.info.Data + 'T00:00:00.000Z';
      // Reset variables while loading
      // TODO: automatize all this
      this.seaTemp = '...';
      this.seaBottomTemp = '...';
      // Set loader
      let toLoad = 2;
      let loaded = 0;
      this.isLoading = true;
      this.dataRetriever.getDataAtPoint("Sea temperature", date, lat, long, 'd')
        .then(value => {
          loaded++;
          this.seaTemp = value.toFixed(2);
          if (loaded == toLoad)
            this.isLoading = false;
        })
        .catch(error => console.error(error));

      this.dataRetriever.getDataAtPoint("Sea bottom temperature", date, lat, long, 'd')
        .then(value => {
          loaded++;
          this.seaBottomTemp = value.toFixed(2);
          if (loaded == toLoad)
            this.isLoading = false;
        })
        .catch(error => console.error(error));
        
      // this.isLoading = true;
      // // TODO: this should not be await, rather .then
      // let tempValue = await this.dataRetriever.getDataAtPoint("Sea temperature", date, lat, long, 'd');
      // let tempBottom = await this.dataRetriever.getDataAtPoint("Sea bottom temperature", date, lat, long, 'd');
      // this.isLoading = false;
      // this.seaTemp = tempValue.toFixed(2);
      // this.seaBottomTemp = tempBottom.toFixed(2);
    },




    // PUBLIC METHODS
    // Set the selected fishing track in the select html element
    // Vue automatically updates the HTML element
    setSelectedFishingTrack: function(id){
      this.options.forEach(oo =>{
        if (id == oo.Id)
          this.selTrack = oo;
      });
      // Update weather
      this.getWeatherData();
    },

    

  },
  components: {

  },
  computed: {

  }
}
</script>

<style scoped>
#weather-info {
  font-size:12px;
}
</style>