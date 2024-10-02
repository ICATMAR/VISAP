<template>
  <!-- Container -->
  <div id='length-dist-multiple-chart' ref='length-dist-multiple-chart'>
    <!-- Plot container -->
    <div class='plot-container' ref="plot-container">
      <!-- Title -->
      <div class="title" v-show="chartTitle != undefined">{{ chartTitle }}</div>
      <div class="loading-circle fade-enter-from fade-enter-active" v-show="chartTitle == undefined"></div>
      <!-- Y axis and svg container -->
      <div class='ylabel-yaxis-plot-container'>
        <!-- Y label -->
        <div class='ylabel'>
          <div class='ylabel-text' :style="{width: plotHeight + 'px'}">
            {{$t('Abundance (Number of individuals per km2)')}}
          </div>
        </div>
        <!-- Y ticks -->
        <div class='yaxis'>
          <!-- Tick -->
          <div v-for="ytick in yticks" class="ytick" :style="{bottom: ytick.bottom + '%'}"></div>
          <!-- Text -->
          <div v-for="ytick in yticks" class="ytickInsideText" :style="{bottom: ytick.bottom + '%'}">{{ ytick.text }}</div>
        </div>

        <!-- SVG container -->
        <div class='svgContainer'>
          <svg class='plot' viewBox='0 0 1 1' preserveAspectRatio="none">
            <!-- Path -->
            <path v-for="path in paths" class="path" ref="path" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path>
            <!-- L50 -->
            <path class="L50" ref="L50" stroke-linejoin="round" vector-effect="non-scaling-stroke" stroke-dasharray="4" v-show="L50 != undefined"></path>
            <!-- MCRS -->
            <path class="MCRS" ref="MCRS" stroke-linejoin="round" vector-effect="non-scaling-stroke" v-show="MCRS != undefined"></path>
          </svg>

          <!-- Legend -->
          <div class="legendContainer">
            <!-- N -->
            <div :title="$t('Number of individuals')">N = {{ N }}</div>
            <!-- L50 -->
            <div class="itemLegendContainer" :title="$t('Sexual maturity')" v-show="L50 != undefined">
              <div class="L50LegendStroke"></div>
              <div>L50 ⚤</div>
            </div>
            <!-- MCRS -->
            <div class="itemLegendContainer" :title="$t('Minimum Conservation Reference Size')" v-show="MCRS != undefined">
              <div class="MCRSLegendStroke"></div>
              <div>MCRS ⚖</div>
            </div>
          </div>

          <!-- Export container -->
          <div class="export-container" ref="export-container" @mouseleave="isExportOptVisible = false">
            <button class="clickable export-button" @click="isExportOptVisible = true">
              <span class="fa">&#xf56d;</span>
              <span class="button-text">{{ $t('Export data') }}</span>
            </button>
            <div class="dropdown-content" v-show="isExportOptVisible">
              <button @click="exportAs('png')">.png</button>
              <button @click="exportAs('json')">.json</button>
              <button @click="exportAs('csv')">.csv</button>
            </div>
          </div>
        </div>
      </div>

      <!-- X axis container -->
      <div class="xaxis-container">
        <!-- Padding -->
        <div class="ylabel"></div>
        <div class="yaxis"></div>
        <!-- X axis -->
        <div class="xaxis">
          <!-- X tick -->
          <div v-for="xtick in xticks" class="xtick" :style="{left: xtick.left + '%'}"></div>
          <!-- X tick text -->
          <div v-for="xtick in xticks" class="xtickText" :style="{left: xtick.left + '%', top: '10px'}">{{xtick.text}}</div>
        </div>
      </div>
      <!-- X label -->
      <div class="xlabel">{{$t('Length')}} (cm)</div>

    </div>


  </div>
</template>


<script>


export default {
  name: 'lengthDistMultipleChart', // Caps, no -
  created() {
    
  },
  mounted() {

  },
  unmounted(){
    // Window resize remove listener
    window.removeEventListener('resize', this.onWindowResize);
  },
  data (){
    return {
      plotHeight: 400,
      chartTitle: undefined,
      availableCategories: ['byYear', 'bySeason', 'byMetier', 'byPortArea'], // MUST CHANGE
      selectedCategory: '', // MUST CHANGE
      yticks: [], // [{bottom: 40, text: '200'}, ...];
      xticks: [],
      paths: [],
      N: '',
      L50: undefined,
      MCRS: undefined,
      isExportOptVisible: false,
    }
  },
  methods: {
    // PUBLIC
    generateGraph: function(specData, category){
      
      this.specData = specData;

      // Generate data (if necessary)
      let fdManager = window.DataManager.getFishingDataManager();
      specData = fdManager.processLengthDistPerCategory(specData, category);

      
      // MUST CHANGE
      // Chart title
      this.chartTitle = specData.rawData[0]["ScientificName"] + ' - ' + this.$i18n.t('per') + ' ' + this.$i18n.t(category);
      if (specData.byYear) this.chartTitle += ' (' + Object.keys(specData.byYear)[0] + '-' + Object.keys(specData.byYear).pop() +')';


      // Y ticks
      this.createYAxisCategoryTicks(Object.keys(specData[category]));
      return
      
      // Generate SVG path
      let pathEl = this.$refs["path"];
      pathEl.setAttribute('d', this.generateSVGPath(specData.bySize, specData.rangeSize, specData.rangeNumInd));
      // Color path from palette
      let colorObj = palette[specData.rawData[0]["ScientificName"]];
      let color = this.color = colorObj == undefined ? [127, 127, 127] : colorObj.color;
      pathEl.style.stroke = 'rgba('+ color[0] + ', '+ color[1] + ', '+ color[2] + ', 0.85)';
      pathEl.style.fill = 'rgba('+ color[0] + ', '+ color[1] + ', '+ color[2] + ', 0.4)';
      
      // Position data circles
      this.positionDataPoints(specData.bySize, specData.rangeSize, specData.rangeNumInd, 'rgba('+ color[0] + ', '+ color[1] + ', '+ color[2] + ', 1)');

      // N, L50, MCRS
      this.N = specData.N;
      this.L50 = specData.L50;
      this.MCRS = specData.MCRS;
      // Graph L50 and MCRS lines
      if (specData.L50){
        let normPosition = specData.L50 / specData.rangeSize[1] * 1.1;
        this.$refs["L50"].setAttribute('d', 'M ' + normPosition + ' 0.05 L ' + normPosition + ' 1');
      }
      if (specData.MCRS){
        let normPosition = specData.MCRS / specData.rangeSize[1] * 1.1;
        this.$refs["MCRS"].setAttribute('d', 'M ' + normPosition + ' 0.05 L ' + normPosition + ' 1');
      }
      

      // X ticks
      this.createXAxisTicks(specData.rangeSize[1] * 1.1, window.innerWidth, specData);
      
      // Xticks window resize
      window.addEventListener('resize', this.onWindowResize);

      // Categories to divide data by
      let categories = ['byYear', 'bySeason', 'byMetier', 'byPortArea'];
      this.availableCategories = [];
      for (let i = 0; i < categories.length; i++) {
        if (!specData.breadcrumb.includes(categories[i])) {
          this.availableCategories.push(categories[i]);
        }
      }
    },





    // USER INTERACTION
    // Category clicked
    // MUST CHANGE
    categoryClicked: function(category){
      // Hide below
      if (category == this.selectedCategory){
        this.isMultipleChartVisible = false;
        this.selectedCategory = '';
      } 
      // Show multiple chart
      else {
        this.isMultipleChartVisible = true;
        this.selectedCategory = category;
        this.$nextTick(() => {
          this.$refs['ldMultipleChart'].$el.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
          //this.$refs['ldMultipleChart'].generateGraph(specData, category);
        });
        
      }
      
    },
    // Export
    exportAs: function(format){
      let specData = this.specData;
      // PNG
      if (format == 'png'){
        this.$refs['export-container'].style.display = 'none';
        // https://github.com/niklasvh/html2canvas/
        html2canvas(this.$refs['plot-container']).then((canvas) => {
          let imgURL = canvas.toDataURL();
          const linkEl = document.createElement('a');
          linkEl.href = imgURL;
          linkEl.download = 'ICATMAR_' + window.GUIManager.currentModality + '_' + specData.rawData[0].ScientificName + '_' + (specData.key || '') + '.png';
          linkEl.click();
        });
      }
      // CSV
      else if (format == 'csv') {
        let jsonData = specData.rawData;
        let keys = Object.keys(jsonData[0]);

        let columnDelimiter = ',';
        let lineDelimiter = '\n';

        let csvColumnHeader = 'Attribution,Source,'
        csvColumnHeader += keys.join(columnDelimiter);
        let csvStr = csvColumnHeader + lineDelimiter;

        jsonData.forEach(item => {
          // Add attribution and source
          csvStr += 'ICATMAR (Institut Català de Recerca per a la Governança del Mar),https://www.icatmar.cat,'
          // Iterate items
          keys.forEach((key, index) => {
            if ((index > 0) && (index < keys.length)) {
              csvStr += columnDelimiter;
            }
            csvStr += item[key];
          });
          csvStr += lineDelimiter;
        });
        let dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvStr);
        let linkEl = document.createElement('a');
        linkEl.setAttribute('href', dataUri);
        linkEl.setAttribute('download', 'ICATMAR_' + window.GUIManager.currentModality + + specData.rawData[0].ScientificName + '_' + (specData.key || '') + '.csv');
        linkEl.click();
      }
      // JSON
      else if (format == 'json'){
        let exportObj = {
          // Add attribution, source and modality
          attribution: 'ICATMAR (Institut Català de Recerca per a la Governança del Mar)',
          source: 'https://www.icatmar.cat',
          data: specData.rawData,
        }
        let dataStr = JSON.stringify(exportObj);
        let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        let linkEl = document.createElement('a');
        linkEl.setAttribute('href', dataUri);
        linkEl.setAttribute('download', 'ICATMAR_' + window.GUIManager.currentModality + + specData.rawData[0].ScientificName + '_' + (specData.key || '') + '.json');
      }


      // Event for GAnalytics
      window.eventBus.emit("LengthDistChart_Export", { fileExtension: format.toUpperCase(), modality: window.GUIManager.currentModality, species: specData.rawData[0].ScientificName });

    },






    // PRIVATE
    // y axis ticks
    createYAxisCategoryTicks: function(keys){
      // Num ticks
      let numTicks = keys.length;
      this.yticks = [];
      for (let i = 0; i < numTicks; i++) {
        let normY = (i + 0.5) / (numTicks + 2);

        // tick
        this.yticks.push({
          bottom: 100 * normY,
          text: keys[i]
        });
      }
    },
    // x axis ticks
    createXAxisTicks: function(maxValue, width, specData){
      // Find minimum step using sort
      let step = Infinity;
      Object.keys(specData.bySize).sort((a, b) => step = Math.min(step, Math.abs(a - b)));
      // Pixel separation between ticks
      let pixelSeparation = 100;
      // Number of ticks
      let maxNumTicks = (width / pixelSeparation);
      // Number of possible steps
      let maxNumSteps = (maxValue / step);
      // Skip step when iterating steps
      let skipStep = Math.ceil(maxNumSteps / maxNumTicks);

      this.xticks = [];
      for (let i = 0; i < Math.floor(maxNumSteps); i += skipStep) {
        let normX = i / maxNumSteps;
        this.xticks.push ({
          left: 100 * normX,
          text: step * i
        });
      }
    },




    // Generate SVG path
    generateSVGPath: function (sizes, rangeSize, rangeNumInd) {
      let path = '';
      rangeSize = [...rangeSize]; // Copy
      rangeNumInd = [...rangeNumInd]; // Copy
      rangeSize[1] *= 1.1;
      rangeNumInd[1] *= 1.1;

      let sizesKeys = Object.keys(sizes);
      // If there is no data
      if (sizesKeys[1] == undefined) {
        let xPos = sizesKeys[0] / rangeSize[1];
        path = 'M ' + (xPos - 0.01) + ' 0 L ' + xPos + ' ' + sizes[sizesKeys[0]].numInd / rangeNumInd[1] + ' L ' + (xPos + 0.01) + ' 0'
        if (path.includes('NaN')) { debugger }
        return path; // One peak
      }
      // First two points
      let step = sizesKeys[0] - (sizesKeys[1] - sizesKeys[0]);
      if (isNaN(step / rangeSize[1])) { debugger; }
      path += 'M 0 0 L ' + step / rangeSize[1] + ' 0 ';
      // Data points
      for (const sKey of sizesKeys) {
        path += 'L ' + sKey / rangeSize[1] + ' ' + sizes[sKey].numInd / rangeNumInd[1] + ' ';
        if (sizes[sKey].numInd / rangeNumInd[1] > 1) { debugger }
      }
      // End point
      path += 'L 1 0';
      if (path.includes('NaN')) { debugger }
      return path;
    },




    // Window resize callback
    onWindowResize: function() {
      if (this.specData == undefined){debugger}
      this.createXAxisTicks(this.specData.rangeSize[1] * 1.1, window.innerWidth, this.specData);
    },


  },
  components: {
  }
}
</script>






<style scoped>


.plot-container {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.ylabel-yaxis-plot-container {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  width: 100%;
  height: 50vh;
}

.ylabel {
  width: 20px;
  height: 100%;
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.ylabel-text {
  top: 50%;
  left: 50%;
  position: absolute;
  transform-origin: center;
  transform: translate(-50%, -50%) rotate(-90deg);
}

.yaxis {
  width: 50px;
  height: 100%;
  position: relative;
}

.ytick {
  background: black;
  width: 5px;
  height: 2px;
  position: absolute;
  right: 0;
}

.ytickText {
  position: absolute;
  right: 10px;
  transform: translate(0, 50%);
}

.ytickInsideText {
  position: absolute;
  transform: translate(60px, 50%);
  text-wrap: nowrap;
  z-index: 1;
}

.svgContainer {
  width: 100%;
  height: 100%;
  position: relative;
  border-bottom: black solid;
  border-left: black solid;
}

.plot {
  position: absolute;
  width: 100%;
  height: 100%;
}

.path {
  stroke-width: 0.2rem;
  transform: translateY(1px) scaleY(-1);
  transition: all 0.2s ease-in-out;
}

.multipath {
  cursor: pointer;
}

.multipath:hover {
  stroke-width: 0.3rem;
}

.multipath-selected {
  stroke-width: 0.4rem;
}

.selectedPath {
  stroke-width: 0.8rem;
}

.selectedPath:hover {
  stroke-width: 0.9rem;
}

.L50,
.MCRS {
  stroke-width: 0.1rem;
  stroke: red;
  pointer-events: none;
}

.legendContainer {
  position: absolute;
  padding: 8px;
  right: 15px;
  top: 50px;
  border: 2px solid black;
  border-radius: 5px;

  display: flex;
  flex-direction: column;
  align-items: center;

  user-select: none;
}

.itemLegendContainer {
  display: flex;
  align-items: center;
}

.L50LegendStroke {
  width: 20px;
  border: dashed 2px red;
  margin: 5px;
}

.MCRSLegendStroke {
  width: 20px;
  height: 2px;
  background: red;
  margin: 5px;
}




.xaxis-container {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
}

.xtick {
  background: black;
  width: 2px;
  height: 5px;
  position: absolute;
}

.xtickText {
  position: absolute;
  text-align: center;
  transform: translate(-50%);
}

.xaxis {
  height: 30px;
  width: 100%;
  position: relative;
}

.xlabel {
  height: 20px;
  text-align: center;
}

.title {
  font-weight: bold;
  text-align: center;
  font-size: large
}

.buttonsCategories {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 20px;
}
.buttonsCategories > div {
  margin-right: 10px;
}
.buttonsCategories > button {
  font-size: 0.8rem;
}



.export-container {
  top: 0;
  right: 0;
  position: absolute;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
}

.export-button {
  font-size: 0.8rem;
}

.dropdown-content {
  background-color: var(--darkBlue);
  min-width: 60px;
  width: fit-content;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.5);
  border-radius: 20%;

  display: flex;
  flex-direction: column;
  width: 100%;
}

.dropdown-content>button {
  text-decoration: none;
  display: block;
  margin: 0px;
  font-size: 0.8rem;
}
</style>