<template>
  <!-- Container -->
  <div id='piechartSection' ref='piechartSection'>
    
    <!-- Title Section -->
    <span class="h4">{{$t('Catch per ' + type)}}</span>

    
    <!-- Container pie charts section -->
    <div class="pieSection">
      <!-- Pie chart 1-->
      <piechart ref='portPiechart' :title="$t('Catch per ' + type)"></piechart>
      <!-- Pie chart 2-->
      <!-- Compare button-->
      <button>+ Compare</button>
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
      })
      .catch(e => console.error(e))
  },
  data (){
    return {
      
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
  /*align-items: center;*/
}
</style>