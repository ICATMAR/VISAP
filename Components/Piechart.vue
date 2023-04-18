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
    <!-- TODO: FILTER PER COMMERCIAL OR OTHER HIGH LEVEL POSSIBILITIES -->
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
      // Store prep data
      this.prepData = prepData;

      // HTMLcontainer, data, d3, title, measure, unit
      this.piechart.runApp(this.$refs.d3chart, prepData, d3, this.title, 'Biomass', 'kg / km2');

      // Fill filter menu with data
      this.$refs.filterMenu.setData(rawData);
    },
    // Update the pie chart with filtered or unfiltered data
    updateTrawlingChart(inDataForD3){
      // Restart pie charts (TODO: instead of runApp function, update and transition of values)
      this.$refs.d3chart.innerHTML = "";
      debugger;
      this.piechart.runApp(this.$refs.d3chart, inDataForD3, d3, this.title, 'Biomass', 'kg / km2');
      // If pie chart comparison exists
      // TODO
      if (this.pieChartCompareEl !== undefined){
        this.pieChartCompareEl.innerHTML = "";
        this.pieChart.runApp(this.pieChartCompareEl, inDataForD3, d3, this.title, 'Biomass', 'kg / km2');
      }
    },


    filterMenuClosed: function(selSpecies){
      // Array with objects containing name, commonName and color
      // Close menu
      this.isFilterMenuVisible = false;
      // Filter is active or not
      this.isFilterActive = selSpecies.length != 0 ? true : false;
      // TODO: IF NO SPECIES TO FILTER, SHOW THEM ALL?
      if (!this.isFilterActive){
        this.updateTrawlingChart(this.prepData);
        return;
      }
      // Else
      // Transform to array of names
      let selectedSpecies = [];
      selSpecies.forEach(sp => selectedSpecies.push(sp.name));
      // Filter species
	    let filteredDataForD3 = this.filterData(selectedSpecies, this.prepData);
	    // Assign to pie chart
	    this.updateTrawlingChart(filteredDataForD3);
    },

    filterData(selSpecies, dataForD3){
      let filteredData = JSON.parse(JSON.stringify(dataForD3));
      this.markItems(filteredData, selSpecies, null);
      return filteredData;
    },

     // This function is not optimal, but real-time is not requiered
    markItems(itemJSON, selectedSpecies, parentJSON){
      // Has children and its not selected (higher level than species)
      debugger;
      if (itemJSON.children && selectedSpecies.indexOf(itemJSON.species) == -1) {
        itemJSON.children.forEach((child) => this.markItems(child, selectedSpecies, itemJSON)); // Go to children
      }
      // One of the higher levels is selected
      else if (itemJSON.children && selectedSpecies.indexOf(itemJSON.species) != -1) {
        // Get the tags in the same level
        parentJSON.children.forEach((child) => {if((selectedSpecies.indexOf(child.name) == -1) || (selectedSpecies.indexOf(child.species) == -1) ) hideHigherLevel(child)})
      }
      // Lower level (species) -> transform to 0 if species does not exist in selected list
      else if (selectedSpecies.indexOf(itemJSON.species) == -1){ // If species is not in the array
        itemJSON.value = 0;
      }
    },

    // Set children values to 0
    hideHigherLevel(itemJSON){
      // Has children, continue
      if (itemJSON.children)
        itemJSON.children.forEach((child) => hideHigherLevel(child));
      else
        itemJSON.value = 0;
    },

    









    deactivateFilter: function(e){
      this.isFilterActive = false;
      this.$refs.filterMenu.deselectAll(e);
      this.updateTrawlingChart(this.prepData);
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