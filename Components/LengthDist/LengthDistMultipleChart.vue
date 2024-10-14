<template>
  <!-- Container -->
  <div id='length-dist-multiple-chart' ref='length-dist-multiple-chart'>
    <!-- Plot container -->
    <div class='plot-container' ref="plot-container">
      <!-- Title -->
      <div class="title" v-show="chartTitle != undefined">{{ chartTitle }}</div>
      <div class="subtitle" v-show="subtitle != undefined">{{ $t(subtitle) }}</div>
      <div class="loading-circle fade-enter-from fade-enter-active" v-show="chartTitle == undefined"></div>
      <!-- Y axis and svg container -->
      <div class='ylabel-yaxis-plot-container'>
        <!-- Y label -->
        <div class='ylabel'>
          <div class='ylabel-text' :style="{width: plotHeight + 'px'}">
            {{$t(category)}}
          </div>
        </div>
        <!-- Y ticks -->
        <div class='yaxis'>
          <!-- Tick -->
          <div v-for="ytick in yticks" class="ytick" :style="{bottom: ytick.bottom + '%'}"></div>
          <!-- Text -->
          <button v-for="ytick in yticks" class="ytickInsideText" 
            :class="[ytick.key == selectedKey ? 'button-active' : '']" 
            :style="{bottom: ytick.bottom + '%'}"
            @click="keyClicked(ytick.key)">
            {{ $t(ytick.text) }}
          </button>
        </div>

        <!-- SVG container -->
        <div class='svgContainer'>
          <svg class='plot' viewBox='0 0 1 1' preserveAspectRatio="none">
            <!-- Path -->
            <!-- <g v-for="(path, index) in paths" class="path" ref="path" :transform="['translate(0, -' + ( index / ( paths.length + 2)) + ')']"> -->
            <g v-for="(path, index) in paths" class="path" ref="path" :transform="path.gTransform">

              <path class="path multipath" stroke-linejoin="round" vector-effect="non-scaling-stroke"
                :class="[path.key == selectedKey ? 'selectedPath' : '']"
                :d="path.svg" 
                :style="{stroke: path.colorStroke, fill: path.colorFill, transform: path.transform}"
                @click="keyClicked(path.key)">
              </path>

            </g>
            <!-- L50 -->
            <path class="L50" ref="L50" stroke-linejoin="round" vector-effect="non-scaling-stroke" stroke-dasharray="4" 
              v-show="L50 != undefined && isL50Visible"></path>
            <!-- MCRS -->
            <path class="MCRS" ref="MCRS" stroke-linejoin="round" vector-effect="non-scaling-stroke" 
              v-show="MCRS != undefined && isMCRSVisible"></path>
          </svg>

          <!-- Legend -->
          <div class="legendContainer">
            <!-- N -->
            <div :title="$t('Number of individuals')">N = {{ N }}</div>
            <!-- L50 -->
            <div class="itemLegendContainer clickable" :title="$t('Sexual maturity')" 
              @click='isL50Visible = !isL50Visible' :class="[isL50Visible ? '':'grayedOut']"
              v-show="L50 != undefined && !(isPrinting && !isL50Visible)">
              <div class="L50LegendStroke"></div>
              <div>L50 ⚤</div>
            </div>
            <!-- MCRS -->
            <div class="itemLegendContainer clickable" :title="$t('Minimum Conservation Reference Size')" 
              @click='isMCRSVisible = !isMCRSVisible' :class="[isMCRSVisible ? '':'grayedOut']"
              v-show="MCRS != undefined && !(isPrinting && !isMCRSVisible)">
              <div class="MCRSLegendStroke"></div>
              <div>MCRS ⚖</div>
            </div>
          </div>

          <!-- Export container -->
          <div class="export-container" ref="export-container" @mouseleave="isExportOptVisible = false" v-show="!isPrinting">
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


      <!-- Attributions -->
      <div class="attributions-container" v-show="isPrinting">
        <div class="logos-container">
          <img src="img/logos/ICATMAR512.png">
          <img src="img/logos/Generalitat.png">
          <img src="img/logos/icm.png">
          <img src="img/logos/CSIC.png">
        </div>
        <span>{{$t('Attributions')}}: ICATMAR (Institut Català de Recerca per a la Governança del Mar). {{$t('Source')}}: https://www.icatmar.cat/</span>
      </div>

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
      subtitle: '',
      selectedKey: '',
      category: '',
      yticks: [], // [{bottom: 40, text: '200'}, ...];
      xticks: [],
      paths: [],
      N: '',
      L50: undefined,
      MCRS: undefined,
      isExportOptVisible: false,
      isL50Visible: true,
      isMCRSVisible: true,
      isPrinting: false,
    }
  },
  methods: {
    // PUBLIC
    generateGraph: function(specData, category){
      
      this.specData = specData;
      this.category = category;

      // Generate data (if necessary)
      let fdManager = window.DataManager.getFishingDataManager();
      specData = fdManager.processLengthDistPerCategory(specData, category);

      
      // Chart title
      let title = specData.rawData[0]["ScientificName"];
      // Add levels
      if (specData.key != undefined){
        let keys = specData.key.split('_');
        keys.pop(); // Remove last empty element
        keys = keys.map(kk => this.$i18n.t(kk));
        title += ' (' + keys.join(',') + ')';
        title = title.replaceAll(',', ', ');
      }
      // Add years
      if (!specData.breadcrumb.includes('byYear')){
        // Find min and max year
        let minYear = 9999;
        let maxYear = 0;
        for (let i = 0; i < specData.rawData.length; i++){
          minYear = Math.min(specData.rawData[i].Year, minYear);
          maxYear = Math.max(specData.rawData[i].Year, maxYear);
        }
        title += '(' + minYear + '-' + maxYear + ')';
        title = title.replaceAll(')(', ', ');
      }

      title += ' - ' + this.$i18n.t('per') + ' ' + this.$i18n.t(category);
      
      this.chartTitle = title;

      // Subtitle (fishing modality)
      let mod = window.GUIManager.currentModality;
      let modNaming = mod == 'trawling' ? 'TrawlingInfo' : mod == 'purse-seine' ? 'Purse seineInfo': '';
      this.subtitle = modNaming;

      // Y ticks
      this.createYAxisCategoryTicks(Object.keys(specData[category]));

      // Subplots
      // Color path from palette
      let colorObj = palette[specData.rawData[0]["ScientificName"]];
      let color = this.color = colorObj == undefined ? [127, 127, 127] : colorObj.color;
      this.paths = [];
      Object.keys(specData[category]).forEach((key, index) => {
        this.paths.push({
          svg: this.generateSVGPath(specData[category][key].bySize, specData.rangeSize, specData.rangeNumInd),
          colorStroke: 'rgba('+ color[0] + ', '+ color[1] + ', '+ color[2] + ', 0.85)',
          colorFill: 'rgba('+ color[0] + ', '+ color[1] + ', '+ color[2] + ', 0.4)',
          transform: '',
          key: key,
        });
      });
      // Transform (Vue hack)
      this.$nextTick(() => {
        this.paths.forEach((path, index) => {
          path.transform = 'translateY(1px) scaleY(-1)';
          path.gTransform = 'translate(0, -' + ( index / ( this.paths.length + 2)) + ')';
        });
      });
      
      
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

    },





    // USER INTERACTION
    // Category clicked
    // MUST CHANGE
    keyClicked: function(key){
      // Hide below
      if (key == this.selectedKey){
        // EMIT TO HIDE NEXT CHART
        this.selectedKey = '';
        window.eventBus.emit('LengthDistMultipleChart_hideKeyClicked', this.specData.breadcrumb); // TODO: this will have to be more specific (several ldChart, ldMultChart present)
      } 
      // Show next chart
      else {
        this.selectedKey = key;
        // EMIT TO SHOW NEXT CHART
        // this.specData[this.category][key]
        window.eventBus.emit('LengthDistMultipleChart_showChart', this.specData[this.category][key]);
      }
      
    },
    // Export
    exportAs: function(format){
      let specData = this.specData;
      // PNG
      if (format == 'png'){
        this.isPrinting = true;
        this.$nextTick(() => {
          // https://github.com/niklasvh/html2canvas/
          html2canvas(this.$refs['plot-container']).then((canvas) => {
            let imgURL = canvas.toDataURL();
            const linkEl = document.createElement('a');
            linkEl.href = imgURL;
            linkEl.download = 'ICATMAR_' + window.GUIManager.currentModality + '_' + specData.rawData[0].ScientificName + '_' + (specData.key || '') + '.png';
            linkEl.click();
            this.isPrinting = false;
          });
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
          text: keys[i],
          key: keys[i]
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
  min-height: 325px;
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
  font-size: 0.8rem;
  z-index: 1;
  opacity: 0.75;
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
  transition: all 0.2s ease-in-out;
  /* transform: translateY(1px) scaleY(-1); */
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

.grayedOut {
  opacity: 0.4;
}

.legendContainer {
  position: absolute;
  padding: 8px;
  right: 15px;
  top: 50px;
  border: 2px solid black;
  border-radius: 5px;

  background: rgba(255, 255, 255, 0.8);

  display: flex;
  flex-direction: column;
  align-items: center;

  user-select: none;
}

.itemLegendContainer {
  display: flex;
  align-items: center;
  cursor: pointer;
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

.subtitle {
  text-align: center;
  font-style: italic;
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

.attributions-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logos-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  
}
.logos-container > img {
  width: 25%;
  object-fit: contain;
  padding-left: 2%;
  padding-right: 2%;
  max-width: 150px;
}

.attributions-container > span {
  color: gray;
  text-shadow: none;
  font-size: x-small;
  font-style: italic;
}
</style>