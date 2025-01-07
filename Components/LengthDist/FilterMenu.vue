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
    <button style="border: 1px solid" @click="isAllSpeciesMenuVisible = true">+ {{ $t('More species') }}</button>

    <div class="overlay" @click="isAllSpeciesMenuVisible = false" v-show="isAllSpeciesMenuVisible">
      <!-- Wrapper -->
      <div class="wrapper">

        <!-- Species list -->
        <div ref="availableSpecies" class="listSpeciesContainer">
          <div class="search-bar-container">
            <input type="search" class="search form-control" onclick="event.stopPropagation();" :placeholder="$t('Search')" />
            <button class="icon-str button-active clickable">x</button>
          </div>
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

      // If list exists, reindex as HTML changed
      if (this.speciesList != undefined) {
        // Update list
        this.speciesList.clear();
      }

      // // Create list      
      this.speciesList = new List(this.$refs.availableSpecies, options, spObj);

      // // Add button events
      this.speciesList.list.childNodes.forEach((el)=>el.addEventListener("click", (e)=>this.clickedSpeciesFromOverlay(e)));
  
    },


    selectRandomTargetSpecies(){
      let randIndex = Math.floor(Math.random()*this.targetSpecies.length);
      this.selSpecies = this.targetSpecies[randIndex].name;
      window.eventBus.emit('FilterMenu_SelectedSpecies', this.targetSpecies[randIndex].name);
    },



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



.listSpeciesContainer {
  display: flex;
  flex-flow: column;
  flex: 1 1 auto;
  overflow-y: auto;

  align-items: center;

  padding: 20px;
}




.search-bar-container{
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: center;
  margin-top: 20px;
}

input {
  width: 50%;
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


.speciesItem {
  margin: 2px;
}

.selSpeciesItem{
  font-size: medium;
}
</style>