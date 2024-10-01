<template>
  <!-- Container -->
  <div id='length-dist-chart' ref='length-dist-chart'>
    <!-- Plot container -->
    <div class='plot-container'>
      <!-- Y axis and svg container -->
      <div class='ylabel-yaxis-plot-container'>
        <!-- Y label -->
        <div class='ylabel'>
          <div class='ylabel-text'>
            {{$t('Abundance')}}
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
          </svg>
          <!-- Data points -->
          <div class="circlesContainer">
            <!-- Data points -->
            <div v-for="dt in dataPointsPos" class="circleBox" :style="{left: dt.leftParent + '%', width: dt.widthParent + '%'}">
              <div class="circle" :style="{left: dt.left + '%', bottom: dt.bottom + '%', border: '2px ' + dt.color + ' solid'}"></div>
            </div>
          </div>
          <!-- Legend -->
          <div class="legendContainer">
            <!-- N -->
            <div :title="$t('Number of individuals')">N = {{ N }}</div>
            <!-- L50 -->
            <div class="itemLegendContainer" :title="$t('Sexual maturity')">
              <div class="L50LegendStroke"></div>
              <div>L50 ⚤</div>
            </div>
            <!-- MCRS -->
            <div class="itemLegendContainer" :title="$t('Minimum Conservation Reference Size')">
              <div class="MCRSLegendStroke"></div>
              <div>MCRS ⚖</div>
            </div>
          </div>
          <!-- Tooltip -->
          <div class="tooltip">{{$t('Length')}}: {{x}}, {{$t('Abundance')}}: {{ y }}, {{$t('Number of individuals')}}: {{ N }}</div>
          <!-- Export container -->
          <div class="export-container">
            <button class="exportButton"></button>
            <div class="export-options-container">
              <button @click="exportAs('png')">{{$t('Export as')}} png</button>
              <button @click="exportAs('json')">{{$t('Export as')}} json</button>
              <button @click="exportAs('csv')">{{$t('Export as')}} csv</button>
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
      <div class="xlabel">{{$t('Length')}}</div>
      <!-- Title -->
      <div class="title">{{ chartTitle }}</div>

      <!-- Divide by category -->
      <div class="buttonsCategories">
        <div v-for="category in categories" @click="categoryClicked(category)">{{ $t(category) }}</div>
      </div>

    </div>


  </div>
</template>


<script>



export default {
  name: 'lengthDistChart', // Caps, no -
  created() {
    
  },
  mounted() {

  },
  data (){
    return {
      chartTitle: '',
      categories: ['byYear', 'bySeason', 'byMetier', 'byPortArea'],
      N: '',
      x: '',
      y: '',
      yticks: [], // [{bottom: 40, text: '200'}, ...];
      xticks: [],
      dataPointsPos: [], // [{leftParent: 50, widthParent: 10, left: 20, bottom: 80, color: 'rgba()' tooltip?}, ...]
    }
  },
  methods: {
    // PUBLIC
    generateGraph: function(specData){
      this.createYAxisTicks(specData.rangeNumInd[1] * 1.1, 400);
      
      let pathEl = this.$refs["path"];
      pathEl.setAttribute('d', this.generateSVGPath(specData.bySize, specData.rangeSize, specData.rangeNumInd));
      // Color from palette
      let colorObj = palette[specData.rawData[0]["ScientificName"]];
      let color = colorObj == undefined ? [127, 127, 127] : colorObj.color;
      pathEl.style.stroke = 'rgba('+ color[0] + ', '+ color[1] + ', '+ color[2] + ', 0.85)';
      pathEl.style.fill = 'rgba('+ color[0] + ', '+ color[1] + ', '+ color[2] + ', 0.4)';
      
      // Position data circles
      this.positionDataPoints(specData.bySize, specData.rangeSize, specData.rangeNumInd, 'rgba('+ color[0] + ', '+ color[1] + ', '+ color[2] + ', 1)');
      debugger;

      return;
      // Circles
      let circleContainer = document.createElement('div');
      // Create SVG circles
      specData.svgCircles = generateSVGCircles(specData.bySize, specData.rangeSize, specData.rangeNumInd);
      for (circleIndex in specData.svgCircles) {
        let circleBox = specData.svgCircles[circleIndex];
        circleBox.children[0].style.border = '2px ' + color + ' solid';
        circleBox.children[0].style.background = 'white';
        circleContainer.appendChild(circleBox);
      }



      // L50 and MCRS
      addL50AndMCRS(specData, svgEl, svgContainer);




      // Dialog / Tooltip
      let tooltip = document.createElement('div');
      tooltip.classList.add('tooltip');
      for (let i = 0; i < circleContainer.children.length; i++) {
        let circleBox = circleContainer.children[i];
        let showTooltip = (e) => {
          // Prevent the default touch action on mobile
          e.preventDefault();
          tooltip.innerText = circleBox.tooltipText;
          tooltip.style.bottom = circleBox.children[0].style.bottom;
          tooltip.style.left = (circleBox.style.left.split('%')[0] * 1 + circleBox.style.width.split('%')[0] / 2) + '%';
          //tooltip.style.left = circleBox.style.left;
          tooltip.style.border = '2px ' + color + ' solid';
          tooltip.style.display = 'block';
        }

        circleBox.addEventListener('mouseover', showTooltip);
        circleBox.addEventListener('click', showTooltip);
        circleBox.addEventListener('mouseleave', () => { tooltip.style.display = 'none' });
      }


      // xaxis
      // xticks
      // Get x ticks
      // Find minimum step using sort
      let step = Infinity;
      Object.keys(specData.bySize).sort((a, b) => step = Math.min(step, Math.abs(a - b)));
      let xTipsEls = createXAxisTips(specData.rangeSize[1], 600, step);
    },







    // PRIVATE
    // y axis ticks
    createYAxisTicks: function(maxValue, height){
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

      this.yticks = [];
      for (let i = 0; i < numTicks; i++) {
        let normY = i / numTicks;
        // tick
        this.yticks.push({
          bottom: 100 * normY,
          text: Math.floor((noFloatsStep * i) * 1e8) / 1e8
        })
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
        });


        // Add title
        //circleBox.tooltipText = 'x: ' + sKey + ', y: ' + (sizes[sKey].numInd).toFixed(1) + ', N = ' + sizes[sKey].N;

        if (sizes[sKey].numInd / rangeNumInd[1] > 1) { debugger }
      }
    },


  },
  components: {
  }
}
</script>






<style scoped>

#length-dist-chart {
  background: white;
  padding: 20px;
}

.plot-container {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;  
}

.ylabel-yaxis-plot-container {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  width: 90vw;
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
  pointer-events: none;
}

.legendContainer {
  position: absolute;
  padding: 8px;
  right: 0;
  top: 40px;
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



.circleBox {
  position: absolute;
  height: 100%;
  bottom: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transform: translate(0%, 50%);
}

.circle {
  position: absolute;
  width: 6px;
  height: 6px;
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
  opacity: 0.7;
  transform: translate(-50%, -10px);
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
  background: yellow;
  text-align: center;
  font-size: large
}

.buttonsCategories {
  display: flex;
  justify-content: center;
}

button {
  cursor: pointer;
}

.exportButton {
  width: 30px;
  height: 30px;
  background-color: red;
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

.export-options-container {
  background: blue;

  padding: 20px;
  display: none;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
}
</style>