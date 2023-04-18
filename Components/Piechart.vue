<template>
  <!-- Container -->
  <div id='piechart' ref='piechart'>

    <!-- D3 chart -->
    <div ref="d3chart" style="width: 600px; height: 600px;">

    </div>

    <!-- Buttons -->
    <div class="centered-rows">
      <!-- Filter per species button -->
      <button @click="isFilterMenuVisible = true">{{ $t('Filter per species') }}</button>
      <!-- Deactivate filter -->
      <button v-show="isFilterActive" @click="deactivateFilter($event)"> <span style="color:red"> ✖ </span> {{ $t('Deactivate filter') }}</button>
      <!-- Export data button -->
      <button>{{ $t('Export data') }}</button>
    </div>

    <!-- Filter menu -->
    <filter-menu ref="filterMenu" @onclose="filterMenuClosed" v-show="isFilterMenuVisible"></filter-menu>

  </div>
</template>


<script>

// Import components
import FilterMenu from 'Components/FilterMenu.vue'

export default {
  name: 'piechart', // Caps, no -
  props: {
    title: String,
  },
  created() {
    
  },
  mounted() {
    this.piechart = new PieChart();
  },
  data (){
    return {
      isFilterActive: false,
      isFilterMenuVisible: false,
    }
  },
  methods: {
    //onclick: function(e){},
    setPieData: function(prepData, rawData){
      // HTMLcontainer, data, d3, title, measure, unit
      this.piechart.runApp(this.$refs.d3chart, prepData, d3, this.title, 'Biomass', 'kg / km<sup>2</sup>');

      // Fill filter menu with data
      this.$refs.filterMenu.setData(rawData);
    },


    filterMenuClosed: function(e){
      // Array with objects containing name, commonName and color
      // Close menu
      this.isFilterMenuVisible = false;
      // Filter is active or not
      this.isFilterActive = e.length != 0 ? true : false;
      // Filter species

    },


    deactivateFilter: function(e){
      this.isFilterActive = false;
      this.$refs.filterMenu.deselectAll(e);
    },
  },
  components: {
    'filter-menu': FilterMenu,
  }
}
</script>




<style scoped>
#piechart {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.centered-rows{
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>