<template>
  <!-- Container -->
  <div id='piechartSection' ref='piechartSection'>
    
    <!-- Title Section -->
    <div class="titleContainer">
      <span class="h4">{{$t('Catch per ' + type)}}</span>

      <!-- Export data button -->
      <button>&#x21E9; {{ $t('Export data') }}</button>
    </div>

    
    <!-- Container pie charts section -->
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
    }
  },
  methods: {
    //onclick: function(e){},
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
  }
}
</style>