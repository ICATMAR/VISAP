<template>
  <!-- Container -->
  <div id='piechartSection' ref='piechartSection'>
    
    <!-- Title Section -->
    <div class="titleContainer">
      <span class="h4">{{$t('Catch per ' + type)}}</span>

      <!-- Show / Hide button -->
      <button @click="showPie = !showPie"> {{ showPie ? $t('Hide chart') : $t('Show chart') }}</button>

      
      <!-- Export data button -->
      <div>
        <button @click="exportButtonClicked">&#x21E9; {{ $t('Export data') }}</button>
        <!-- Export options buttons -->
        <div class="dropdown-content" v-show="showExportOptions">
          <button @click="exportCSV">.CSV</button>
          <button @click="exportJSON">.JSON</button>
        </div>
      </div>

      <!-- Export options buttons -->
      <!-- <div class="dropdown-content" v-show="showExportOptions">
        <button @click="exportCSV">.CSV</button>>
        <button @click="exportJSON">.JSON</button>
      </div> -->

    </div>

    
    <!-- Container pie charts section -->
    <div class="chartContainer" v-show="showPie">
      <div class="pieSection">
        <!-- Pie chart 1-->
        <piechart ref='portPiechart' :title="$t('Catch per ' + type)"></piechart>
        <!-- Pie chart 2-->
        <piechart ref='comparePortPiechart' :title="$t('Catch per ' + type)" v-show="showComparison"></piechart>
      </div>
      <!-- Compare button-->
      <div class="compareButtons">
        <button @click="showComparison = true" v-show="!showComparison">+ {{$t('Compare')}}</button>
        <button @click="showComparison = false" v-show="showComparison"><span style="color:red"> ✖ </span> {{$t('Close comparison')}}</button>
      </div>
    </div>
  </div>
</template>


<script>

// Import components
import Piechart from 'Components/Piechart.vue'

export default {
  name: 'piechartSection', // Caps, no -
  props: {
    type: String
  },
  created() {
    // Click outside event
    // WARN: this is a permanent event
    window.addEventListener("click", this.closeExportMenu.bind(this));
  },
  mounted() {
    
    // TEST, ORGANIZE BETTER
    // Load test data
    let url = 'data/';
    if (this.type == 'port')
      url += 'pesca_arrossegament_port_biomassa.json';
    else if (this.type == 'season')
      url += 'pesca_arrossegament_any_biomassa.json';
    // Fetch
    fetch(url)
      .then(r => r.json())
      .then(data => {
        this.rawData = data;
        let procData = undefined;
        if (this.type == 'port')
          procData = PieChart.prepDataPortBiomass(data);
        else if (this.type == 'season')
          procData = PieChart.prepDataYearBiomass(data);
        // Set data to pie chart
        this.$refs.portPiechart.setPieData(procData, data);
        this.$refs.comparePortPiechart.setPieData(procData, data);
      })
      .catch(e => console.error(e))
  },
  data (){
    return {
      showComparison: false,
      showPie: false,
      showExportOptions: false,
    }
  },
  methods: {
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
      linkElement.setAttribute('download', this.$i18n.t('Catch composition') + ' (' + this.$i18n.t(this.type) + ')_ICATMAR');
      linkElement.click();
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
      linkElement.setAttribute('download', this.$i18n.t('Catch composition') + ' (' + this.$i18n.t(this.type) + ')_ICATMAR');
      linkElement.click();
    },
  },
  components: {
    'piechart': Piechart,
  }
}
</script>




<style scoped>
#piechartSection {
  width: 100%;
  background: white;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;

}

.pieSection {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  align-items: center;
  justify-content: center;

  margin-bottom: 20px;
}

.pieSection > button {
  display: flex;
  align-items: center;
  max-height: 60px;
}

.titleContainer {
  width: 100%;
  background: var(--darkBlue);
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  align-items: center;
}

button {
  max-height: -webkit-fill-available;
}

.chartContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.h4 {
  position: relative;
  text-align: center;
  padding: 60px;
  color:white;

  background: var(--darkBlue);
  font-family: "Poppins", Sans-serif;
  font-size: 28px;
  font-weight: 400;
  text-transform: none;
  line-height: 35px;
}

.compareButtons {
  margin-bottom: 20px;
  margin-top: -20px;
}

@media (max-width: 800px) {
  .h4 {
    padding: 20px;
    font-size: 20px;
  }
}


.dropdown-content {
  background-color: var(--darkBlue);
  min-width: 60px;
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
</style>