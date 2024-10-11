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
  import FilterMenu from 'Components/Utils/FilterMenu.vue'
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
      // When language changes, update language of the highchart
      window.eventBus.on('LanguageSelector_LanguageChanged', this.languageChanged);
      window.eventBus.on('GUIManager_LanguageChanged', this.languageChanged);


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

        return;
        
        // If chart is not yet created
        if (this.myChart == undefined)
          return;
        // Remove all species
        if (this.myChart.series.length != 0){
          let totLength = this.myChart.series.length;
          for (let i = 0; i < totLength; i++)
            this.myChart.series[this.myChart.series.length-1].remove();
        }
        // Add selected species
        selSpecies.forEach(sp => {
          let dataSpeciesForGraph = this.prepareDataForHighChart(this.rawData, sp.name);
          this.myChart.addSeries(dataSpeciesForGraph);
        });
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
              if (hashSpecies != undefined && fdManager.lengthDist[hashSpecies] != undefined){
                hashSpecies = hashSpecies.replaceAll('%20', ' ');
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


      createGraph: function(data){
        
        // // Create search list
        // let species = this.getUnique(data, "ScientificName"); // Useful to create species selector


        // // Get data for a specific species for first chart
        // let randomIndex = Math.floor(Math.random()*species.length);
        // let dataSpeciesForGraph = this.prepareDataForHighChart(data, species[randomIndex])
        // this.$refs.filterMenu.addSelected(species[randomIndex]); // Add species to selected
        // // Create Highchart
        // this.myChart = this.createChart(dataSpeciesForGraph);

      },
      
      
      



      // For the filter list
      onSpeciesSelected: function(e){
        // Get species name
        // let speciesName = e.currentTarget.innerText.split("● ")[1];
        // // Unselect all others


        // // Add data series
        // let dataSpeciesForGraph = getDataForSpecieX(inData, speciesName)
        // myChart.addSeries(dataSpeciesForGraph);
        // // Hide element
        // listEl.remove();

        // Remove data series
        // if (myChart.series.length > 0)
        //   myChart.series[myChart.series.length-1].remove()
        // if (listEl.parentElement !== null) // Remove
        //   listEl.remove();
      },





      // Create HighCharts
      // Create Highchart
      createChart: function(serieSpecies) {
        return;
        // Translation not possible inside context of Highcharts. Doing hack?
        window.i18n = this.$i18n;

        // Translation
        this.translateHighcharts();
        

        const hChart = Highcharts.chart('tamanyContainer', {
          chart: {
              type: 'area'
          },
          accessibility: {
              description: 'Image description: blabla'
          },
          title: {
              text:'' //'Freqüència de talles '
          },
          subtitle: {
              text: ''//'per espècie'
          },
          legend: {
              align: 'left',
              verticalAlign: 'top'
              //x: 0,
              //y: 100
          },
          credits: {
              enabled: false
          },
          xAxis: {
              type: 'number'
              //categories: inCategories,
              //tickmarkPlacement: 'on',
              //title: {
              //    enabled: false
              //}
          },
          xAxis: {
              title: {
                text: this.$i18n.t('Length') + ' (cm)'
              },
              allowDecimals: false,
              labels: {
                  formatter: function () {
                      return this.value/10; // clean, unformatted number for year
                  }
              },
              /*accessibility: {
                  rangeDescription: 'Range: 1cm to 10cm'//'Range: 1940 to 2017.'
              }*/
          },
          yAxis: {
              title: {
                  text: this.$i18n.t('Abundance (Number of individuals per km2)')//'Nuclear weapon states'
              },
              labels: {
                  formatter: function () {
                      return this.value;//this.value / 1000 + 'k';
                  }
              }
          },
          tooltip: {
              //pointFormat: 'Hi ha {point.y} que fan {point.x} cm de l\'espècie {series.name}'//'{series.name} had stockpiled <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
              formatter: function() {
                // THIS FUNCTION FORCES window.i18n, as it is not possible to access this.$i18n
                return window.i18n.t('Abundance') + ": " + parseInt(this.y) + window.i18n.t('individuals of') + this.x/10 + " cm " + window.i18n.t("per") +" km2."//  + 'individus de ' + this.x + ' cm d\'un total de '  + ' ' + series.name;
              }
          },
          loading: {
            hideDuration: 500,
            showDuration: 500
          },
          series: [
            serieSpecies
            ],
          plotOptions: {
              area: {
                  fillOpacity: 0.2,
                  pointStart: 1,//1940,
                  marker: {
                      enabled: false,
                      symbol: 'circle',
                      radius: 2,
                      states: {
                          hover: {
                              enabled: true
                          }
                      }
                  }
              }
          }
        });

        return hChart;
      },


      languageChanged: function(){
        debugger;
        // // Translate menu options
        // this.translateHighcharts();
        // // Reset graph
        // if (this.rawData){
        //   // Fill filter menu with data
        //   this.$refs.filterMenu.setData(this.rawData);
        //   this.createGraph(this.rawData);
        // }
      },

      // Translate high charts options
      translateHighcharts: function(){
        // let lang = Highcharts.getOptions().lang;
        // Object.keys(lang).forEach(key => {
        //   if (this.$i18n.te(key) && typeof(lang[key]) == "string"){
        //     lang[key] = this.$i18n.t(key);
        //   }
        // })
      },








      // UTILS
      // Get unique keys
      getUnique: function(inData, inKey){
        // let uniqueKeys = [];
        // // Iterate
        // for (let i = 0; i < inData.length; i++){
        //   let value = inData[i][inKey];
        //   if (value !== undefined && uniqueKeys.findIndex((item) => item == value) == -1)
        //     uniqueKeys.push(value);
        // }
        // return uniqueKeys;
      },

      // Prepares the data for the highchart (getDataForSpecieX was the name before)
      prepareDataForHighChart: function(inData, inSpecies) {
        // // Select the data from a species
        // let dataSelSpecies = inData.filter((item) => item.ScientificName == inSpecies);
        // // Categories (sizes)
        // let categories = this.getUnique(dataSelSpecies, "Size"); // Important to create X axis
        // categories.forEach((cat, index) => categories[index] = parseFloat(cat)); // Transform into numbers
        // categories.sort((a, b) => a - b); // Sort
        // // Abundance per size
        // let abundance = this.getAbundancePerCategories(dataSelSpecies, categories);
        // //let numInd = getNumIndPerCategories(dataSelSpecies, categories); // How to include number of individuals?
        // // Prepare for highcharts
        // let dataHC = [];
        // //categories.forEach((catItem, index) => dataHC[index] = [catItem, abundance[index]]); // Make an array as [categoryA,abundanceInA], [categoryB,abundanceInB],...
        // categories.forEach((catItem, index) => dataHC[index] = [catItem, abundance[index]]); // Make an array as [categoryA,abundanceInA], [categoryB,abundanceInB],...
        // // https://www.highcharts.com/demo/spline-irregular-time

        // // Add translation name if exists  
        // let seriesName = this.$i18n.t(inSpecies) == undefined ? inSpecies : (inSpecies + " ("+ this.$i18n.t(inSpecies) +")")
        // let seriesColor = palette[inSpecies] === undefined ? "rgb(" + palette.Other.color + ")" : "rgb(" + palette[inSpecies].color + ")";
        // let graphSpecies = {name: seriesName, data: dataHC, color: seriesColor };
        // return graphSpecies;
      },

      // Get abundance given the categories
      getAbundancePerCategories: function(inData, categories) {
        // let numInd = [];
        // inData.forEach(item => {
        //   // Find the category index
        //   let catIndex = categories.findIndex((catItem) => catItem == item.Size);
        //   numInd[catIndex] = numInd[catIndex] === undefined ? parseFloat(item.Abundance_NSpecimen_Km2) : numInd[catIndex] + parseFloat(item.Abundance_NSpecimen_Km2);
        // })
        // return numInd;
      },






      // NEEDED?
      // removeSerieBtnEl.addEventListener('click', () => {
      //   if (myChart.series.length > 0)
      //     myChart.series[myChart.series.length-1].remove()
      //   if (listEl.parentElement !== null) // Remove
      //     listEl.remove();
      // });
      // Translate data using $i18n
      translateData(prepData){
        // Object.keys(prepData).forEach(key => {
        //   let el = prepData[key];
        //   if (typeof(el) == 'object'){
        //     this.translateData(el);
        //   } else if (typeof(el) == 'string') {
        //     prepData["translation"] = this.$i18n.t(el);
        //   }
        // });
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