<template>
    <!-- Container -->
    <div id='appLengthDist' ref='appLengthDist'>
  
      <!--Header -->
      <title-header title='Length distribution'></title-header>

      <!-- Filter menu -->
      <filter-menu ref="filterMenu"></filter-menu>



      <!-- Length distribution chart -->
       <!-- HACK: REFS DO NOT WORK WELL WITH V-FOR -->
      <div class="lengthDistChart-container">
        <lenghtDistChart ref="base"></lenghtDistChart>
      </div>
      <!-- Length distribution chart L1 -->
      <div class="lengthDistChart-container" v-if="areLevelsVisible[0]">
        <lenghtDistChart ref="level1"></lenghtDistChart>
      </div>
      <!-- Length distribution chart L2 -->
      <div class="lengthDistChart-container" v-if="areLevelsVisible[1]">
        <lenghtDistChart ref="level2"></lenghtDistChart>
      </div>
      <!-- Length distribution chart L3 -->
      <div class="lengthDistChart-container" v-if="areLevelsVisible[2]">
        <lenghtDistChart ref="level3"></lenghtDistChart>
      </div>
      <!-- Length distribution chart L4 -->
      <div class="lengthDistChart-container" v-if="areLevelsVisible[3]">
        <lenghtDistChart ref="level4"></lenghtDistChart>
      </div>
      <!-- Length distribution chart L5 -->
      <div class="lengthDistChart-container" v-if="areLevelsVisible[4]">
        <lenghtDistChart ref="level5"></lenghtDistChart>
      </div>



    </div>
  </template>
  
  
  <script>
  
  // Import components
  import TitleHeader from 'Components/TitleHeader.vue'
  import FilterMenu from 'Components/LengthDist/FilterMenu.vue'
  import LengthDistChart from './LengthDist/LengthDistChart.vue';
  
  export default {
    name: 'appLengthDist', // Caps, no -
    created() {
      
    },
    mounted() {

      // Updates if necessary
      this.updateLengthDistribution();
      // EVENTS
      // Section
      window.eventBus.on('AppMap_ChangedSection', this.updateLengthDistribution);
      window.eventBus.on('TitleHeader_ChangedSection', this.updateLengthDistribution);
      window.eventBus.on('ModalitySelector_ChangedModality', this.updateLengthDistribution);

      // LengthDist events
      window.eventBus.on('LengthDistMultipleChart_showChart', (specData) => {
        this.updateVisibleLevels(specData.breadcrumb);
        let numberOfLevels = specData.breadcrumb.split('>').length - 1;
        this.$nextTick(() => {
          this.$refs["level" + numberOfLevels].generateGraph(specData);
          this.$refs["level" + numberOfLevels].$el.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        });
      });
      window.eventBus.on('LengthDistMultipleChart_hideKeyClicked', this.updateVisibleLevels);
      window.eventBus.on('LengthDistChart_categoryClicked', this.updateVisibleLevels);

      // Filter menu events
      window.eventBus.on('FilterMenu_SelectedSpecies', this.filterSelectedSpecies);

    },
    data (){
      return {
        areLevelsVisible: [false, false, false, false, false],
      }
    },
    methods: {
      // USER INTERACTION
      // Close the overlay filter menu
      filterSelectedSpecies: function(selSpecies){
        this.updateVisibleLevels('');
        let fdManager = window.DataManager.getFishingDataManager();
        this.$refs['base'].generateGraph(fdManager.lengthDist[selSpecies]);
        this.$refs['base'].$el.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
      },






      // INTERNAL METHODS
      // Get the data
      updateLengthDistribution: function() {
        if (window.GUIManager.currentSection == 'length-dist') {
          window.DataManager.loadNecessaryFiles('length-dist', window.GUIManager.currentModality)
            .then(() => {
              let fdManager = window.DataManager.getFishingDataManager();
              this.$refs.filterMenu.setData(fdManager.lengthDist);
              // Check if a species is present in the URL
              let hashSpecies = window.GUIManager.lengthDist.species;
              if (hashSpecies != undefined)
                hashSpecies = hashSpecies.replaceAll('%20', ' ');
              if (hashSpecies != undefined && fdManager.lengthDist[hashSpecies] != undefined){
                this.$refs['base'].generateGraph(fdManager.lengthDist[hashSpecies]);
                this.$refs['filterMenu'].selSpecies = hashSpecies;
              } else
                this.$refs['filterMenu'].selectRandomTargetSpecies(); // Triggers event that generates graph
              
            })
            .catch(e => {debugger})
        }
      },

      // Update visible levels
      updateVisibleLevels: function(breadcrumb){
        let numberOfLevels = breadcrumb.split('>').length - 1;
        for (let i = 0; i < this.areLevelsVisible.length; i++){
          this.areLevelsVisible[i] = numberOfLevels > i;
        }
      },


 


    },
    components: {
      titleHeader: TitleHeader,
      filterMenu: FilterMenu,
      lenghtDistChart: LengthDistChart,
    }
  }
  </script>
  
  
  
  
  <style scoped>
  #appLengthDist {
    font-family: "Poppins", Sans-serif;
    scroll-behavior: auto;
    overflow: auto;
    overflow-x: hidden;
    width: 100%;
    background:var(--darkBlue);
  }
  
  @media (max-width: 800px) {
    #appLengthDist {
      overflow-x:auto;
    }
  }

  .lengthDistChart-container{
    background: white;
    padding: 20px;
    padding-right: clamp(40px, 7%, 200px);
    padding-left: clamp(20px, 4%, 200px);
  }
  
  
  </style>