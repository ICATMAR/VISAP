<template>
  <!-- Container -->
  <div id='filterMenu' ref='filterMenu'>

    <!-- Target species -->
    <div class="target-container">
      <!-- Species -->
      <button v-for="sp in targetSpecies" :class="[sp.name == selSpecies ? 'button-active' : '']" @click="clickedSpecies(sp)">
        <span :style="{color: 'rgb(' + sp.color +')'}" > ■ </span> {{$t(sp.name)}} ({{sp.name}})
      </button>

      <!-- Species not target but selected -->
      <Transition>
        <button :class="[selButNotTarget.name == selSpecies ? 'button-active' : '']" @click="clickedSpecies(selButNotTarget)" v-show="selButNotTarget.isVisible">
          <span :style="{color: 'rgb(' + selButNotTarget.color +')'}" > ■ </span> {{$t(selButNotTarget.name)}} ({{selButNotTarget.name}})
        </button>
      </Transition>
    </div>

    <!-- More species -->
    <button style="border: 1px solid" @click="isAllSpeciesMenuVisible = true">&#x25BD; {{ $t('More species') }}</button>

    <div class="overlay" @click="isAllSpeciesMenuVisible = false" v-show="isAllSpeciesMenuVisible">
      <!-- Wrapper -->
      <div class="wrapper">

        <!-- Species list -->
        <div ref="availableSpecies" class="listSpeciesContainer">
          <input type="search" class="search form-control" onclick="event.stopPropagation();" :placeholder="$t('Search')" />
          <div class="list"></div>
        </div>

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
      isAllSpeciesMenuVisible: false,
      targetSpecies: [],
      species: [],
      selSpecies: '',
      selButNotTarget: {
        name: '',
        color: [127, 127, 127],
        isVisible: false,
      }
    }
  },
  methods: {
    // USER INTERACTION
    // Clicked on species
    clickedSpecies: function(sp){
      this.selSpecies = sp.name;
      window.eventBus.emit('FilterMenu_SelectedSpecies', sp.name);
    },

    clickedSpeciesFromOverlay: function(e){
      e.stopPropagation();
      let speciesName = this.extractSpeciesName(e.currentTarget.innerText);
      this.selButNotTarget.name = speciesName;
      this.selButNotTarget.isVisible = true;
      this.selButNotTarget.color = palette[speciesName] != undefined ? palette[speciesName].color : [127, 127, 127];
      // Close GUI
      this.isAllSpeciesMenuVisible = false;
      // Trigger click event
      this.clickedSpecies(this.selButNotTarget);
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
      if (this.speciesList != undefined) {
        // Update list
        this.speciesList.clear();
      }

      // // Create list      
      this.speciesList = new List(this.$refs.availableSpecies, options, spObj);
      // this.selSpeciesList = new List(this.$refs.selSpecies, optionsSel);

      // // Add button events
      this.speciesList.list.childNodes.forEach((el)=>el.addEventListener("click", (e)=>this.clickedSpeciesFromOverlay(e)));
      // this.selSpeciesList.list.childNodes.forEach((el)=>el.addEventListener("click", (e)=> this.deselectItem(e)));
      // this.$refs.selectAll.addEventListener("click", (e)=>this.selectAll(e));
      // this.$refs.deselectAll.addEventListener("click", (e)=>this.deselectAll(e));
      // this.$refs.closeGUIApply.addEventListener("click", (e) => this.closeGUI(e));
      // this.$refs.closeGUIClear.addEventListener("click", (e) => {this.deselectAll(e); this.closeGUI(e)});
  
    },


    selectRandomTargetSpecies(){
      let randIndex = Math.floor(Math.random()*this.targetSpecies.length);
      this.selSpecies = this.targetSpecies[randIndex].name;
      window.eventBus.emit('FilterMenu_SelectedSpecies', this.targetSpecies[randIndex].name);
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