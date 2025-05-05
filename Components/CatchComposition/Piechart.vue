<template>
  <!-- Container -->
  <div id='piechart' ref='piechart'>

    <!-- D3 chart -->
    <div ref="d3chart" class="svgContainer" style="width: 600px; height: 600px;">

    </div>

    <!-- Buttons -->
    <div class="centered-rows">
      <!-- Filter per species button -->
      <button @click="isFilterMenuVisible = true">
        <span class="fa">&#xf0b0; </span>
        <span class="button-text">{{ $t('Filter per species') }}</span>
      </button>
      <!-- Deactivate filter -->
      <button v-show="isFilterActive" @click="deactivateFilter($event)"> <span style="color:red"> ✖ </span> {{ $t('Deactivate filter') }}</button>
    </div>

    <!-- Filter menu -->
    <!-- TODO: FILTER PER COMMERCIAL OR OTHER HIGH LEVEL POSSIBILITIES -->
    <filter-menu ref="filterMenu" @onclose="filterMenuClosed" v-show="isFilterMenuVisible"></filter-menu>

  </div>
</template>


<script>

// Import components
import FilterMenu from 'Components/CatchComposition/FilterMenu.vue'

export default {
  name: 'piechart', // Caps, no -
  props: {
    titleIn: String,
  },
  created() {
    
  },
  mounted() {
    this.piechart = new PieChart();
    this.title = this.titleIn;
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
      // Remove existing graph
      this.$refs.d3chart.innerHTML = '';

      // Store prep data
      this.prepData = prepData;

      // Translations
      if (this.$i18n){
        this.translateData(prepData);
      }


      // HTMLcontainer, data, d3, title, measure, unit
      let unit = window.DataManager.getFishingDataManager().mod == 'trawling' ? 'kg / km²' : this.$i18n.t('kg / haul');
      this.piechart.runApp(this.$refs.d3chart, prepData, d3, this.title, this.$i18n.t('Biomass'), unit);

      // Fill filter menu with data
      this.isFilterActive = false;
      this.$refs.filterMenu.setData(rawData);
    },
    // Update the pie chart with filtered or unfiltered data
    updateTrawlingChart(inDataForD3){
      // Translations (not necessary?)
      // if (this.$i18n){
      //   this.translateData(inDataForD3);
      // }
      // Restart pie charts (TODO: instead of runApp function, update and transition of values)
      this.$refs.d3chart.innerHTML = "";
      let unit = window.DataManager.getFishingDataManager().mod == 'trawling' ? 'kg / km²' : this.$i18n.t('kg / haul');
      this.piechart.runApp(this.$refs.d3chart, inDataForD3, d3, this.title, this.$i18n.t('Biomass'), unit);
    },


    filterMenuClosed: function(selSpecies, categories){
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
	    let filteredDataForD3 = this.filterData(selectedSpecies, categories, this.prepData);
	    // Assign to pie chart
	    this.updateTrawlingChart(filteredDataForD3);
    },

    filterData(selSpecies, categories, dataForD3){
      let filteredData = JSON.parse(JSON.stringify(dataForD3));
      this.markItems(filteredData, categories, selSpecies, null);
      return filteredData;
    },

     // This function is not optimal, but real-time is not requiered
    markItems(itemJSON, categories, selectedSpecies, parentJSON){
      // Has children and its not selected (higher level than species)
      if (itemJSON.children && selectedSpecies.indexOf(itemJSON.species) == -1) {
        // Hide children if it is a category and the category is not active (only when one of the categories is active)
        let mustHide = categories.findIndex((cat)=> !cat.isActive && cat.name == itemJSON.name) != -1;
        let areAllCategoriesInactive = categories.findIndex(cat => cat.isActive) == -1;
        if (mustHide && !areAllCategoriesInactive){
          itemJSON.children.forEach(this.hideHigherLevel);
        } 
        // Keep processing the children
        else {
          itemJSON.children.forEach((child) => this.markItems(child, categories, selectedSpecies, itemJSON)); // Go to children
        }        
      }
      // One of the higher levels is selected
      else if (itemJSON.children && selectedSpecies.indexOf(itemJSON.species) != -1) {
        debugger;
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
        itemJSON.children.forEach(this.hideHigherLevel);
      else
        itemJSON.value = 0;
    },

    


    // Translate data using $i18n
    translateData(prepData){

      Object.keys(prepData).forEach(key => {
        // Skip translation of the key "translation"
        if (key == "translation"){
          return;
        }
        let el = prepData[key];
        if (typeof(el) == 'object'){
          this.translateData(el);
        } else if (typeof(el) == 'string') {
          prepData["translation"] = this.$i18n.t(el);
        }
      });

    },







    deactivateFilter: function(e){
      this.isFilterActive = false;
      this.$refs.filterMenu.deselectAll(e);
      this.updateTrawlingChart(this.prepData);
    },


    // PUBLIC
    // For translations
    setTitle: function(title){
      this.title=title;
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
  margin:10px;
}

.centered-rows{
  display: flex;
  flex-direction: row;
  justify-content: center;
}

@media (max-width: 800px) {
  .svgContainer{
    width: 90vw !important;
    height: 90vw !important;
  }
}
</style>