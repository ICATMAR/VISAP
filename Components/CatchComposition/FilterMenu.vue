<template>
  <!-- Container -->
  <div id='filterMenu' ref='filterMenu'>

    <!-- Wrapper -->
    <div class="wrapper">

      <!-- Filter per category -->
      <div class="center-buttons top-buttons">
        <span>{{ $t('Filter per categories') }}</span>
      </div>

      <!-- Categories list -->
      <div ref="categories" class="categories-container">
        <button v-for="cat in categories" :class="[cat.isActive ? 'button-active': '']" @click="categoryClicked($event, cat)">{{$t(cat.name)}}</button>
      </div>


      <!-- Filter per species -->
      <div class="center-buttons" style="padding: 20px">
        <span>{{ $t('Filter per species') }}</span>
      </div>


      <!-- Sel/Deselect all buttons -->
      <div class="center-buttons allOnOrOff" ref="controlButtons">
        <button ref="selectAll" onclick="event.stopPropagation();">&#x25C6; {{$t('Select all')}} </button>
        <button ref="deselectAll" onclick="event.stopPropagation();">&#x25C7; {{$t('Deselect all')}} </button>
      </div>
      

      <!-- Selected species -->
      <div ref="selSpecies" class="listSpeciesContainer selSpeciesContainer" v-show="hasSelectedSpecies">
        <input type="search" class="search form-control" onclick="event.stopPropagation();" :placeholder="$t('Search')" v-show="showSearchBarSelSpecies"/>
        <div class="list listSel"></div>
      </div>

      <!-- Species list -->
      <div ref="availableSpecies" class="listSpeciesContainer">
        <input type="search" class="search form-control" onclick="event.stopPropagation();" :placeholder="$t('Search')" v-show="showSearchBarSpecies"/>
        <div class="list"></div>
      </div>

      <!-- User buttons -->
      <div class="center-buttons apply-cancel-container" ref="controlButtons" @click="deselectAll($event); closeGUI()">
        <button ref="closeGUIApply" onclick="event.stopPropagation();"><span class="fa">&#xf0b0;</span> {{$t('Apply filter')}} </button>
        <button ref="closeGUIClear" onclick="event.stopPropagation();"><span class="fa">&#xe17b;</span> {{$t('Clear filter')}} </button>
      </div>


    <!-- Species -->
    <!-- <button v-for="sp in species">
      <span :style="{color: 'rgb(' + sp.color +')'}" > ■ </span> {{sp.name}}
    </button> -->


    </div>

  </div>
</template>


<script>

// Import components
// palette.js is required

export default {
  name: 'filterMenu', // Caps, no -
  created() {
    
  },
  mounted() {
    this.palette = palette;

  },
  data (){
    return {
      showSearchBarSelSpecies: false,
      showSearchBarSpecies: true,
      hasSelectedSpecies: false,
      categories: []
    }
  },
  methods: {
    // USER INTERACTION
    // Category clicked
    categoryClicked: function(e, cat){
      e.stopPropagation();
      cat.isActive = !cat.isActive;
      // Set to selected the species that have that classification
      // Check if all are inactive
      let areAllInactive = true;
      this.categories.forEach(cc => {if (cc.isActive) areAllInactive = false; });
      // Use raw data if categories do not filter the data
      if (areAllInactive){
        this.createLists(this.rawData);
        return;
      }
      // Filter data
      let filteredData = [];
      this.rawData.forEach(item => {
        // Check if the item's category is in one of the active categories
        let isItemInActiveCategory = false;
        this.categories.forEach(cc => {
          if (cc.name == item.Classification) {
            if (cc.isActive)
              isItemInActiveCategory = true;
          }
        });
        // Add to filtered data raw
        if (isItemInActiveCategory)
          filteredData.push(item);
      });

      // Create lists
      this.createLists(filteredData);
      // Pie chart data changes with emit on closeGUI

    },
    // Select item
    selectItem: function(e){
      e.stopPropagation();
      //console.log(e.srcElement.innerText.split("■ ")[1]);
      let speciesName = this.extractSpeciesName(e);
      this.switchFromList(speciesName, this.speciesList, this.selSpeciesList, this.deselectItem);
    },

    // Deselect item
    deselectItem: function(e){
      e.stopPropagation();
      let speciesName = this.extractSpeciesName(e);
      this.switchFromList(speciesName, this.selSpeciesList, this.speciesList, this.selectItem);
    },

    selectAll: function(e){
      e.stopPropagation();
      for (var i = 0; i<this.speciesList.items.length; i++){
        this.switchFromList(this.speciesList.items[i]._values.name, this.speciesList, this.selSpeciesList, this.deselectItem)
        i--;
      }
    },

    deselectAll: function(e){
      e.stopPropagation();
      for (var i = 0; i<this.selSpeciesList.items.length; i++){
        this.switchFromList(this.selSpeciesList.items[i]._values.name, this.selSpeciesList, this.speciesList, this.selectItem)
        i--;
      }
    },

    // Close filter menu
    closeGUI: function(e){
      this.$emit('onclose', this.selSpeciesList.toJSON(), this.categories);
    },

    // Separate icon from species name
    extractSpeciesName: function(e){
      return e.currentTarget.title;
      // If the button contains the speciesName, not the translation
      let text = e.currentTarget.innerText;
      return text.split("■\n")[1];
    },





    // PUBLIC METHODS
    // setData is also internal, as categories affect the data
    setData: function(data){
      this.rawData = data;

      // Create categories object and buttons
      // Get categories
      let categoriesList = this.getUnique(data, 'Classification');
      this.categories = [];
      categoriesList.forEach(cat => {
        this.categories.push({
          name: cat,
          color: palette[cat] != undefined ? palette[cat].color : [127, 127, 127],
          isActive: false
        });
      });

      // Create lists
      this.createLists(data);
      
    },



    // INTERNAL METHODS
    // Create lists
    createLists(data){
      // Get species keys
      let species = this.getUnique(data, "ScientificName");
      if (species.length == 0) // Legacy
        species = this.getUnique(data, "NomEspecie");
      
      let spObj = [];
      let selSpObj = [];
      // Order alphabethically
      species.sort();
      // Get color
      species.forEach((sp, i) => {
        spObj.push({
          'name': sp,
          'commonName': this.$i18n.t(sp), // TODO: check if this is made every time the filter is cliked. maybe yes?
          'color': palette[sp] != undefined ? palette[sp].color : [127, 127, 127],
        });
      });

      // https://listjs.com/api/
      let options = {
        item: (sp) =>
          `<button class="speciesItem" title="${sp.name}">
            <span style="color: rgb(${sp.color.toString()})" > ■ </span> ${sp.commonName}
          </button>
          `
      }
      let optionsSel = {
        item: (sp) =>
          `<button class="selSpeciesItem button-active" title="${sp.name}">
            <span style="color: rgb(${sp.color.toString()})" > ■ </span> ${sp.commonName}
          </button>
          `
      }

      // If list exists, reindex as HTML changed
      if (this.speciesList != undefined) {
        // Update list
        this.speciesList.clear();
        this.speciesList.update();
        this.selSpeciesList.clear();
        this.selSpeciesList.update();
      }

      // Create list      
      this.speciesList = new List(this.$refs.availableSpecies, options, spObj);
      this.selSpeciesList = new List(this.$refs.selSpecies, optionsSel);

      // Add button events
      this.speciesList.list.childNodes.forEach((el)=>el.addEventListener("click", (e)=>this.selectItem(e)));
      this.selSpeciesList.list.childNodes.forEach((el)=>el.addEventListener("click", (e)=> this.deselectItem(e)));
      this.$refs.selectAll.addEventListener("click", (e)=>this.selectAll(e));
      this.$refs.deselectAll.addEventListener("click", (e)=>this.deselectAll(e));
      this.$refs.closeGUIApply.addEventListener("click", (e) => this.closeGUI(e));
      this.$refs.closeGUIClear.addEventListener("click", (e) => {this.deselectAll(e); this.closeGUI(e)});

      // Turn on/off the search bar for unselected species
      this.showSearchBarSpecies = this.speciesList.size() > 20 ? true : false;
    },





    // Set selected
    addSelected(speciesName){
      this.switchFromList(speciesName, this.speciesList, this.selSpeciesList, this.deselectItem);
    }, 


    // Switch values from one list to the other
    switchFromList(speciesName, removeFromList, insertToList, callbackFuncBtn){
      let item = removeFromList.get("name", speciesName)[0];
      removeFromList.remove("name", speciesName);

      let itNew = insertToList.add({
        "name": speciesName,
        'commonName': this.$i18n.t(speciesName), // TODO: check if this is made every time the filter is cliked. maybe yes?
        "color":  item._values.color
      });
      // Add event listener
      callbackFuncBtn = callbackFuncBtn.bind(this); // bind callback with this
      itNew[0].elm.addEventListener("click", (e)=>callbackFuncBtn(e));

      // Turon on/off selected species container
      this.hasSelectedSpecies = this.selSpeciesList.size() > 0;
      // Turn on/off the search bar for selected species
      this.showSearchBarSelSpecies = this.selSpeciesList.size() > 20 ? true : false;
      // Turn on/off the search bar for unselected species
      this.showSearchBarSpecies = this.speciesList.size() > 20 ? true : false;
      
    },







    // Get unique values in an array of objects
    getUnique: function(data, key){
      let uniqueKeys = [];
      // Iterate
      for (let i = 0; i < data.length; i++){
        let value = data[i][key];
        if (value !== undefined && uniqueKeys.findIndex((item) => item == value) == -1)
          uniqueKeys.push(value);
      }
      return uniqueKeys;
    }
  },
  components: {
    //'map': Map,
  }
}
</script>




<style scoped>
#filterMenu {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 10;

  background: rgba(133, 133, 133, 0.623);
}

.wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.center-buttons {
  display:flex;
  flex-direction: row;
  justify-content: center;
  padding: 20px;
  background: rgb(20 120 167 / 70%);;
}

.top-buttons {
  padding-top: 50px;
}

.allOnOrOff{
  font-size: x-small;
  padding: 5px;
}
.allOnOrOff > button {
  padding: 5px;
}

.categories-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  font-size: small;
  padding: 20px;
  background: #bfbfbf94;
  margin-right: 20px;
  margin-left: 20px;
  border-radius: 10px;
}

.listSpeciesContainer {
  display: flex;
  flex-flow: column;
  /* flex: 1 1 auto; */
  overflow-y: auto;

  align-items: center;

  padding: 20px;
}

.selSpeciesContainer {
  flex: 0 0 auto;
  padding: 20px;
}

input {
  width: clamp(300px, 50%, 900px);
}



.list {
  background: rgba(255, 255, 255, 0.247);

  width: 100%;
  overflow-y: auto;

  padding: 10px;
  border-radius: 10px;
  text-align: center;
  font-size: small;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.listSel {
  max-height: 30vh;
}

.speciesItem {
  margin: 2px;
}

.selSpeciesItem{
  font-size: medium;
}

.apply-cancel-container {
  flex: 1;
  align-items: center;
}
.apply-cancel-container > button {
  padding: 40px;
  border-radius: 40px;
  margin: 5px;
}
</style>