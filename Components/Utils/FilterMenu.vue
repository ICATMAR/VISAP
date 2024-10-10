<template>
  <!-- Container -->
  <div id='filterMenu' ref='filterMenu'>

    <!-- Target species -->
    <div class="target-container">
      <!-- Species -->
      <button v-for="sp in targetSpecies" @click="clickedSpecies(sp)">
        <span :style="{color: 'rgb(' + sp.color +')'}" > ■ </span> {{sp.commonName}} ({{sp.name}})
      </button>
    </div>

    <!-- More species -->
    <button @click="isFilterMenuVisible = true">&#x25BD; {{ $t('More species') }}</button>

    <div class="overlay" v-show="false">
      <!-- Wrapper -->
      <div class="wrapper">

        <!-- User buttons -->
        <!-- <div class="center-buttons" ref="controlButtons">
          <button ref="selectAll" onclick="event.stopPropagation();">&#x25C6; {{$t('Select all')}} </button>
          <button ref="deselectAll" onclick="event.stopPropagation();">&#x25C7; {{$t('Deselect all')}} </button>
          <button ref="closeGUIApply" onclick="event.stopPropagation();"><span class="fa">&#xf0b0;</span> {{$t('Apply filter')}} </button>
          <button ref="closeGUIClear" onclick="event.stopPropagation();"><span class="fa">&#xe17b;</span> {{$t('Clear filter')}} </button>
        </div> -->

        <!-- Selected species -->
        <!-- <div ref="selSpecies" class="listSpeciesContainer selSpeciesContainer">
          <input type="search" class="search form-control" onclick="event.stopPropagation();" :placeholder="$t('Search')" v-show="showSearchBarSelSpecies"/>
          <div class="list listSel"></div>
        </div> -->

        <!-- Species list -->
        <div ref="availableSpecies" class="listSpeciesContainer">
          <input type="search" class="search form-control" onclick="event.stopPropagation();" :placeholder="$t('Search')" />
          <div class="list"></div>
        </div>


      <!-- Species -->
      <!-- <button v-for="sp in species">
        <span :style="{color: 'rgb(' + sp.color +')'}" > ■ </span> {{sp.name}}
      </button> -->


      </div>
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
      targetSpecies: [],
      species: []
    }
  },
  methods: {
    // USER INTERACTION
    // Clicked on species
    clickedSpecies: function(sp){
      window.eventBus.emit('FilterMenu_SelectedSpecies', sp.name);
    },


    // Select item
    selectItem: function(e){
      e.stopPropagation();
      //console.log(e.srcElement.innerText.split("■ ")[1]);
      let speciesName = this.extractSpeciesName(e.currentTarget.innerText);
      this.switchFromList(speciesName, this.speciesList, this.selSpeciesList, this.deselectItem);
    },

    // Deselect item
    deselectItem: function(e){
      e.stopPropagation();
      let speciesName = this.extractSpeciesName(e.currentTarget.innerText);
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
      this.$emit('onclose', this.selSpeciesList.toJSON());
    },

    // Separate icon from species name
    extractSpeciesName: function(text){
      return text.split("■\n")[1];
    },





    // PUBLIC METHODS
    setData: function(data){
      let species = Object.keys(data);
      // Order alphabethically
      species.sort();

      let spObj = [];
      this.targetSpecies = [];
      let selSpObj = [];
      
      // Get color
      species.forEach((sp, i) => {
        let el = {
          'name': sp,
          'commonName': this.$i18n.t(sp), // TODO: check if this is made every time the filter is cliked. maybe yes?
          'color': palette[sp] != undefined ? palette[sp].color : [127, 127, 127],
        }
        let isTarget = data[sp].rawData[0].TargetSpecies;
        if (isTarget) {
          this.targetSpecies.push(el);
        }
        else {
          spObj.push(el);
        }
      });

      // https://listjs.com/api/
      let options = {
        item: (sp) =>
          `<button class="speciesItem" title="${sp.commonName}">
            <span style="color: rgb(${sp.color.toString()})" > ■ </span> ${sp.name}
          </button>
          `
      }
      let optionsSel = {
        item: (sp) =>
          `<button class="selSpeciesItem" title="${sp.commonName}">
            <span style='color:red'> ✖ </span>
            <span style="color: rgb(${sp.color.toString()})" > ■ </span> ${sp.name}
          </button>
          `
      }

      // If list exists, reindex as HTML changed
      // if (this.speciesList != undefined) {
      //   // Update list
      //   this.speciesList.clear();
      //   this.speciesList.update();
      //   this.selSpeciesList.clear();
      //   this.selSpeciesList.update();
      // }

      // // Create list      
      this.speciesList = new List(this.$refs.availableSpecies, options, spObj);
      // this.selSpeciesList = new List(this.$refs.selSpecies, optionsSel);

      // // Add button events
      // this.speciesList.list.childNodes.forEach((el)=>el.addEventListener("click", (e)=>this.selectItem(e)));
      // this.selSpeciesList.list.childNodes.forEach((el)=>el.addEventListener("click", (e)=> this.deselectItem(e)));
      // this.$refs.selectAll.addEventListener("click", (e)=>this.selectAll(e));
      // this.$refs.deselectAll.addEventListener("click", (e)=>this.deselectAll(e));
      // this.$refs.closeGUIApply.addEventListener("click", (e) => this.closeGUI(e));
      // this.$refs.closeGUIClear.addEventListener("click", (e) => {this.deselectAll(e); this.closeGUI(e)});
  
    },


    // Set selected
    addSelected(speciesName){
      this.switchFromList(speciesName, this.speciesList, this.selSpeciesList, this.deselectItem);
    },







    // INTERNAL METHODS
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

      // Turn on/off the search bar for selected species
      this.showSearchBarSelSpecies = this.selSpeciesList.size() > 20 ? true : false;
      
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.target-container {
  display:flex;
  flex-direction: row;
  justify-content: center;
  padding: 20px;
  flex-wrap: wrap;
  font-size: small;
}

.target-container > button {
  margin: 2px;
  border: solid 1px;
}

.overlay {
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
}

.listSpeciesContainer {
  display: flex;
  flex-flow: column;
  flex: 1 1 auto;
  overflow-y: auto;

  align-items: center;

  padding: 20px;
}

.selSpeciesContainer {
  background-color: var(--red);
  flex: 0 0 auto;
  padding: 20px;
}

input {
  width: 50%;
  margin-top: 20px;
}



.list {
  background: rgba(255, 255, 255, 0.247);

  overflow-y: auto;

  padding: 10px;
  text-align: center;
  font-size: small;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.listSel {
  background-color: var(--red);
  max-height: 30vh;
}

.speciesItem {
  margin: 2px;
}

.selSpeciesItem{
  font-size: medium;
}
</style>