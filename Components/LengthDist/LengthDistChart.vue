<template>
  <!-- Container -->
  <div id='length-dist-chart' ref='length-dist-chart'>
    <!-- Plot container -->
    <div class='plot-container' ref="plot-container">
      <!-- Title -->
      <div class="title" v-show="chartTitle != undefined">{{ chartTitle }}</div>
      <div class="subtitle">{{ $t('Data from ICATMAR') }}</div>
      <div class="subtitle" v-show="subtitle != undefined && isPrinting">{{ $t(subtitle) }}</div>
      <div class="loading-circle fade-enter-from fade-enter-active" v-show="chartTitle == undefined"></div>
      <!-- Y axis and svg container -->
      <div class='ylabel-yaxis-plot-container'>
        <!-- Y label -->
        <div class='ylabel'>
          <div class='ylabel-text' :style="{width: plotHeight + 'px'}">
            {{$t(ylabelText)}}
          </div>
        </div>
        <!-- Y ticks -->
        <div class='yaxis'>
          <!-- Tick -->
          <div v-for="ytick in yticks" class="ytick" :style="{bottom: ytick.bottom + '%'}"></div>
          <!-- Text -->
          <div v-for="ytick in yticks" class="ytickText" :style="{bottom: ytick.bottom + '%'}">{{ ytick.text }}</div>
        </div>

        <!-- SVG container -->
        <div class='svgContainer'>
          <svg class='plot' viewBox='0 0 1 1' preserveAspectRatio="none">
            <!-- Path -->
            <path class="path" ref="path" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path>
            <!-- L50 -->
            <path class="L50" ref="L50" stroke-linejoin="round" vector-effect="non-scaling-stroke" stroke-dasharray="4" v-show="L50 != undefined && isL50Visible"></path>
            <!-- MCRS -->
            <path class="MCRS" ref="MCRS" stroke-linejoin="round" vector-effect="non-scaling-stroke" v-show="MCRS != undefined && isMCRSVisible"></path>
          </svg>
          <!-- Data points -->
          <div class="circlesContainer">
            <!-- Data points -->
            <div v-for="dt in dataPointsPos" class="circleBox" :style="{left: dt.leftParent + '%', width: dt.widthParent + '%'}"
              @mouseover="showTooltip($event, dt)"  
              @click="showTooltip($event, dt)"
              @mouseleave="hideTooltip($event)"
            >
              <div class="circle" :style="{left: dt.left + '%', bottom: dt.bottom + '%', border: '2px ' + dt.color + ' solid'}"></div>
            </div>
          </div>
          <!-- Legend -->
          <div class="legendContainer" v-show="isLoaded">
            <!-- N -->
            <div :title="$t('Number of measured individuals')">N = {{ N }}</div>
            <!-- L50 -->
            <div class="itemLegendContainer clickable" :title="$t('Sexual maturity') + ': ' + L50 + ' mm.'" 
              @click='isL50Visible = !isL50Visible' :class="[isL50Visible ? '':'grayedOut']"
              v-show="L50 != undefined && !(isPrinting && !isL50Visible)">
              <div class="L50LegendStroke"></div>
              <div>L50 ⚤</div>
            </div>
            <!-- MCRS -->
            <div class="itemLegendContainer clickable" :title="$t('Minimum Conservation Reference Size') + ': ' + MCRS + ' mm.'" 
              @click='isMCRSVisible = !isMCRSVisible' :class="[isMCRSVisible ? '':'grayedOut']"
              v-show="MCRS != undefined && !(isPrinting && !isMCRSVisible)">
              <div class="MCRSLegendStroke"></div>
              <div>MCRS ⚖</div>
            </div>
          </div>
          <!-- Tooltip -->
          <div class="tooltip" ref="tooltip"></div>
          <!-- Export container -->
          <div class="export-container" ref="export-container" @mouseleave="isExportOptVisible = false" v-show="isLoaded && !isPrinting">
            <button class="clickable export-button" @click="isExportOptVisible = !isExportOptVisible">
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
      <div class="xlabel">{{$t('Length')}} (mm)</div>


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

    <!-- Divide by category -->
    <div class="buttonsCategories" v-show="isLoaded && availableCategories.length != 0">
      <div>{{$t('Viewby')}}: </div>
      <button v-for="category in availableCategories" @click="categoryClicked(category)" :class="[category == selectedCategory ? 'button-active' : '']">{{ $t(category) }}</button>
    </div>

    <!-- Length distribution multiple charts -->
    <ldMultipleChart ref="ldMultipleChart" v-if="isMultipleChartVisible"></ldMultipleChart>


  </div>
</template>


<script>

import LengthDistMultipleChart from './LengthDistMultipleChart.vue';

export default {
  name: 'lengthDistChart', // Caps, no -
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
      availableCategories: ['byYear', 'bySeason', 'byMetier', 'byPortArea'],
      selectedCategory: '',
      N: '',
      ylabelText: '',
      yticks: [], // [{bottom: 40, text: '200'}, ...];
      xticks: [],
      dataPointsPos: [], // [{leftParent: 50, widthParent: 10, left: 20, bottom: 80, color: 'rgba()', x: 23, y: 53, N: 123}, ...]
      L50: undefined,
      MCRS: undefined,
      isL50Visible: true,
      isMCRSVisible: true,
      isLoaded: false,
      isExportOptVisible: false,
      isMultipleChartVisible: false,

      isPrinting: false,
    }
  },
  methods: {
    // PUBLIC
    generateGraph: function(specData){
      this.isLoaded = true;
      this.isMultipleChartVisible = false; // Hide if open
      this.selectedCategory = '';
      this.specData = specData;

      // Chart title
      let title = specData.rawData[0]["ScientificName"];
      // Add levels
      if (specData.key != undefined){
        let keys = specData.key.split('_');
        keys.pop(); // Remove last empty element
        keys = keys.map(kk => this.$i18n.t(kk)); // Translate keys
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
        title += ' (' + minYear + '-' + maxYear + ')';
        title = title.replaceAll(') (', ', ');
      }

      this.chartTitle = title;

      // Subtitle (fishing modality)
      let mod = window.DataManager.getFishingDataManager().mod;
      let modNaming = mod == 'trawling' ? 'TrawlingInfo' : mod == 'purse-seine' ? 'Purse seineInfo': '';
      this.subtitle = modNaming;

      // Y label text
      if (mod == 'trawling')
        this.ylabelText = 'Abundance (Number of individuals per km2)';
      else if (mod == 'purse-seine')
        this.ylabelText = 'Distribution percentage';
      else {
        debugger;
      }
      
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
        let normPosition = specData.L50 / (specData.rangeSize[1] * 1.1);
        this.$refs["L50"].setAttribute('d', 'M ' + normPosition + ' 0.05 L ' + normPosition + ' 1');
      }
      if (specData.MCRS){
        let normPosition = specData.MCRS / (specData.rangeSize[1] * 1.1);
        this.$refs["MCRS"].setAttribute('d', 'M ' + normPosition + ' 0.05 L ' + normPosition + ' 1');
      }
      

      // X ticks
      this.createXAxisTicks(specData.rangeSize[1] * 1.1, window.innerWidth, specData);
      // Y ticks
      this.createYAxisTicks(specData.rangeNumInd[1] * 1.1, this.plotHeight, specData.numInd);
      // Xticks window resize
      window.addEventListener('resize', this.onWindowResize);

      // Categories to divide data by
      let fdManager = window.DataManager.getFishingDataManager();
      let categories = fdManager.lengthDistCategories;
      this.availableCategories = [];
      for (let i = 0; i < categories.length; i++) {
        if (!specData.breadcrumb.includes(categories[i])) {
          this.availableCategories.push(categories[i]);
        }
      }
    },





    // USER INTERACTION
    // Category clicked
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
          this.$refs['ldMultipleChart'].generateGraph(this.specData, category);
        });
        
      }

      window.eventBus.emit('LengthDistChart_categoryClicked', this.specData.breadcrumb);
      
    },
    // Export
    exportAs: function(format){
      let specData = this.specData;
      // PNG
      if (format == 'png'){
        this.isPrinting = true;
        // https://github.com/niklasvh/html2canvas/
        this.$nextTick(() => {
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
        // Replace MCRS, L50 and Size for MCRS_mm, L50_mm, Size_mm
        csvStr = csvStr.replace('MCRS', 'MCRS_mm').replace('L50', 'L50_mm').replace('Size', 'Size_mm');

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
        linkEl.setAttribute('download', 'ICATMAR_' + window.GUIManager.currentModality + '_' + specData.rawData[0].ScientificName + '_' + (specData.key || '') + '.csv');
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
        // Replace MCRS, L50 and Size for MCRS_mm, L50_mm, Size_mm
        exportObj.data.forEach(item => {
          item['MCRS_mm'] = item['MCRS'];
          item['L50_mm'] = item['L50'];
          item['Size_mm'] = item['Size'];
          delete item['MCRS'];
          delete item['L50'];
          delete item['Size'];
        });
        let dataStr = JSON.stringify(exportObj);
        let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        let linkEl = document.createElement('a');
        linkEl.setAttribute('href', dataUri);
        linkEl.setAttribute('download', 'ICATMAR_' + window.GUIManager.currentModality + '_' + specData.rawData[0].ScientificName + '_' + (specData.key || '') + '.json');
        linkEl.click();
      }


      // Event for GAnalytics
      window.eventBus.emit("LengthDistChart_Export", { fileExtension: format.toUpperCase(), modality: window.GUIManager.currentModality, species: specData.rawData[0].ScientificName });

    },






    // PRIVATE
    // y axis ticks
    createYAxisTicks: function(maxValue, height, numInd){
      // Pixel separation between ticks
      let pixelSeparation = 50;
      // Number of ticks
      let maxNumTicks = (height / pixelSeparation);
      let step = maxValue / maxNumTicks;
      // Find round step
      let exp = Math.floor(Math.log10(step));
      let noFloatsStep = Math.round(step / Math.pow(10, exp)) * Math.pow(10, exp);
      // Num ticks
      let numTicks = Math.floor(maxValue / noFloatsStep);
      
      // Ticks
      this.yticks = [];
      for (let i = 0; i <= numTicks; i++) {
        // Position
        let normY = i / (maxValue / noFloatsStep);
        // Text tick
        let textContent = ''
        let fdManager = window.DataManager.getFishingDataManager();
        if (fdManager.mod == 'trawling'){
          textContent = (noFloatsStep * i).toFixed(Math.max(0,noFloatsStep.toExponential().split('e')[1]*-1));
        } else if (fdManager.mod == 'purse-seine'){
          textContent = (100 *(noFloatsStep * i) / numInd).toFixed(1) + '%';
        }else {
          debugger;
        }
        this.yticks.push({
          bottom: 100 * normY,
          text: textContent,
        })
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



    // Positions of data points
    positionDataPoints: function(sizes, rangeSize, rangeNumInd, color) {
      rangeSize = [...rangeSize]; // Copy
      rangeNumInd = [...rangeNumInd]; // Copy
      rangeSize[1] *= 1.1;
      rangeNumInd[1] *= 1.1;

      this.dataPointsPos = [];

      let sizesKeys = Object.keys(sizes);
      // Data points
      for (let i = 0; i < sizesKeys.length; i++) {
        //for (const sKey of sizesKeys) {
        let sKey = sizesKeys[i];
        let x = sKey / rangeSize[1];
        let y = sizes[sKey].numInd / rangeNumInd[1];

        let prevX = i == 0 ? 0 : sizesKeys[i - 1] / rangeSize[1];
        let nextX = i == (sizesKeys.length - 1) ? 1 : sizesKeys[i + 1] / rangeSize[1];
        let betweenXAndNextX = x + (nextX - x) / 2;
        let betweenPrevXAndX = prevX + (x - prevX) / 2;

        this.dataPointsPos.push({
          // Circle box
          leftParent: 100 * betweenPrevXAndX,
          widthParent: 100 * (betweenXAndNextX - betweenPrevXAndX),
          // Circle
          left: 100 * (x - betweenPrevXAndX) / (betweenXAndNextX - betweenPrevXAndX),
          bottom: 100 * y,
          color: color,
          // Data
          x: sKey,
          y: sizes[sKey].numInd,
          N: sizes[sKey].N
        });

        if (sizes[sKey].numInd / rangeNumInd[1] > 1) { debugger }
      }
    },


    // Tooltip
    showTooltip: function(e, dataPoint){
      // Prevent the default touch action on mobile
      e.preventDefault();
      // Tooltip
      let tooltip = this.$refs["tooltip"];
      // Text
      let tootTipText = '';
      let fdManager = window.DataManager.getFishingDataManager();
      if (fdManager.mod == 'trawling')
        tootTipText = this.$i18n.t('Abundance') + ': ' + dataPoint.y.toFixed(2) + this.$i18n.t('individuals of') + dataPoint.x + ' mm ' + this.$i18n.t('per') + ' km² (N = '+ dataPoint.N +')';
      else if (fdManager.mod == 'purse-seine'){
        tootTipText = (100*dataPoint.y / this.specData.numInd).toFixed(1) + '% ' + this.$i18n.t('individuals of') + dataPoint.x + ' mm (N = '+ dataPoint.N +')';
      }else {
        debugger;
      }
      tooltip.innerText = tootTipText;
      
      
      tooltip.style.bottom = dataPoint.bottom + '%';
      tooltip.style.left = Math.max(0 , (dataPoint.leftParent + dataPoint.widthParent / 2)) + '%';
      let colorStr = 'rgb(' + this.color[0] + ', ' + this.color[1] + ', ' + this.color[2] + ')'
      tooltip.style.border = '2px ' + colorStr + ' solid';
      tooltip.style.display = 'block';
    },
    hideTooltip: function(e) {
      let tooltip = this.$refs["tooltip"];
      tooltip.style.display = 'none';
    },


    // Window resize callback
    onWindowResize: function() {
      if (this.specData == undefined){debugger}
      this.createXAxisTicks(this.specData.rangeSize[1] * 1.1, window.innerWidth, this.specData);
    },


  },
  components: {
    ldMultipleChart: LengthDistMultipleChart
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
  width: 70px;
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



.circleBox {
  position: absolute;
  height: 100%;
  bottom: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  transform: translate(0%, 50%);
}

.circle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;

  border-radius: 50%;
  transform: translate(-50%, 50%);  
}


.tooltip {
  position: absolute;
  display: none;
  padding: 8px;
  background: white;
  border-radius: 5px;
  pointer-events: none;
  opacity: 0.85;
  transform: translate(0%, -10px);
  transition: all 0.1s ease-in-out !important;
}

.circleBox:hover .circle {
  border-width: 4px !important;
  width: 10px;
  height: 10px;
  transition: all 0.1s ease-in-out !important;
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
  margin-bottom: 40px;
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