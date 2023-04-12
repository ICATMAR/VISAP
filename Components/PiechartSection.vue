<template>
  <!-- Container -->
  <div id='piechartSection' ref='piechartSection'>
    
    <!-- Title Section -->
    <div>
      <!-- Subtitle -->
      <span class="h4">{{$t('Catch per ' + type)}}</span>

      <!-- Maybe filter and export button should go together with the pie chart? -->
      <!-- Filter button -->
      
      <!-- Export button -->
      
      <!-- TODO: ADD GOOGLE TAG?-->

      
    </div>
    
    <!-- Container pie charts section -->
    <div class="pieSection">
      <!-- Pie chart 1-->
      <piechart></piechart>
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
  
}

.pieSection {
  background: black;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  /*align-items: center;*/
}
</style>