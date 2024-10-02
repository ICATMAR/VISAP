<template>
    <!-- Container -->
    <div id='appLengthDist' ref='appLengthDist'>
  
      <!--Header -->
      <title-header title='Length distribution'></title-header>

      <!-- Buttons to add and remove species -->
      <div class="centered-rows" style="margin-top:40px">
        <!-- Filter per species button -->
        <button @click="isFilterMenuVisible = true">&#x25BD; {{ $t('Select species') }}</button>
      </div>

      <!-- Filter menu -->
      <filter-menu ref="filterMenu" @onclose="filterMenuClosed" v-show="isFilterMenuVisible"></filter-menu>

      <!-- Length distribution chart -->
      <div class="lengthDistChart-container">
        <lenghtDistChart ref="lengthDistChart"></lenghtDistChart>
      </div>
      <div class="lengthDistChart-container">
        <lenghtDistChart ref="lengthDistChart2"></lenghtDistChart>
      </div>

      <!-- High Chart -->
      <figure class="highcharts-figure">
        <div id="tamanyContainer"></div>
        <p class="highcharts-description">

        </p>
      </figure>

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
      // TODO
        //this.getDataFile('data/trawlingData/trawling_sizes.json');
        // Fill filter menu with data
        // this.$refs.filterMenu.setData(result);
        // Create graph
        // this.createGraph(result);
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
        this.$refs["lengthDistChart2"].generateGraph(specData);
      });
      window.eventBus.on('LengthDistMultipleChart_hideKeyClicked', );

    },
    data (){
      return {
        isFilterMenuVisible: false,
      }
    },
    methods: {
      // USER INTERACTION
      // Close the overlay filter menu
      filterMenuClosed: function(selSpecies){
        this.isFilterMenuVisible = false;
        
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
              this.$refs['lengthDistChart'].generateGraph(fdManager.lengthDist['Merluccius merluccius']);
            })
            .catch(e => {debugger})
        }
      },


      createGraph: function(data){
        
        // Create search list
        let species = this.getUnique(data, "ScientificName"); // Useful to create species selector


        // Get data for a specific species for first chart
        let randomIndex = Math.floor(Math.random()*species.length);
        let dataSpeciesForGraph = this.prepareDataForHighChart(data, species[randomIndex])
        this.$refs.filterMenu.addSelected(species[randomIndex]); // Add species to selected
        // Create Highchart
        this.myChart = this.createChart(dataSpeciesForGraph);

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
        // Translate menu options
        this.translateHighcharts();
        // Reset graph
        if (this.rawData){
          // Fill filter menu with data
          this.$refs.filterMenu.setData(this.rawData);
          this.createGraph(this.rawData);
        }
      },

      // Translate high charts options
      translateHighcharts: function(){
        let lang = Highcharts.getOptions().lang;
        Object.keys(lang).forEach(key => {
          if (this.$i18n.te(key) && typeof(lang[key]) == "string"){
            lang[key] = this.$i18n.t(key);
          }
        })
      },








      // UTILS
      // Get unique keys
      getUnique: function(inData, inKey){
        let uniqueKeys = [];
        // Iterate
        for (let i = 0; i < inData.length; i++){
          let value = inData[i][inKey];
          if (value !== undefined && uniqueKeys.findIndex((item) => item == value) == -1)
            uniqueKeys.push(value);
        }
        return uniqueKeys;
      },

      // Prepares the data for the highchart (getDataForSpecieX was the name before)
      prepareDataForHighChart: function(inData, inSpecies) {
        // Select the data from a species
        let dataSelSpecies = inData.filter((item) => item.ScientificName == inSpecies);
        // Categories (sizes)
        let categories = this.getUnique(dataSelSpecies, "Size"); // Important to create X axis
        categories.forEach((cat, index) => categories[index] = parseFloat(cat)); // Transform into numbers
        categories.sort((a, b) => a - b); // Sort
        // Abundance per size
        let abundance = this.getAbundancePerCategories(dataSelSpecies, categories);
        //let numInd = getNumIndPerCategories(dataSelSpecies, categories); // How to include number of individuals?
        // Prepare for highcharts
        let dataHC = [];
        //categories.forEach((catItem, index) => dataHC[index] = [catItem, abundance[index]]); // Make an array as [categoryA,abundanceInA], [categoryB,abundanceInB],...
        categories.forEach((catItem, index) => dataHC[index] = [catItem, abundance[index]]); // Make an array as [categoryA,abundanceInA], [categoryB,abundanceInB],...
        // https://www.highcharts.com/demo/spline-irregular-time

        // Add translation name if exists  
        let seriesName = this.$i18n.t(inSpecies) == undefined ? inSpecies : (inSpecies + " ("+ this.$i18n.t(inSpecies) +")")
        let seriesColor = palette[inSpecies] === undefined ? "rgb(" + palette.Other.color + ")" : "rgb(" + palette[inSpecies].color + ")";
        let graphSpecies = {name: seriesName, data: dataHC, color: seriesColor };
        return graphSpecies;
      },

      // Get abundance given the categories
      getAbundancePerCategories: function(inData, categories) {
        let numInd = [];
        inData.forEach(item => {
          // Find the category index
          let catIndex = categories.findIndex((catItem) => catItem == item.Size);
          numInd[catIndex] = numInd[catIndex] === undefined ? parseFloat(item.Abundance_NSpecimen_Km2) : numInd[catIndex] + parseFloat(item.Abundance_NSpecimen_Km2);
        })
        return numInd;
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
        Object.keys(prepData).forEach(key => {
          let el = prepData[key];
          if (typeof(el) == 'object'){
            this.translateData(el);
          } else if (typeof(el) == 'string') {
            prepData["translation"] = this.$i18n.t(el);
          }
        });
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