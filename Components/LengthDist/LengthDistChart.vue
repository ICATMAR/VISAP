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
          <div v-for="ytick in yticks" class="ytickText" :style="{bottom: ytick + '%'}">{{ ytick.text }}</div>
        </div>

        <!-- SVG container -->
        <div class='svgContainer'>
          <svg class='plot' viewBox='0 0 1 1' preserveAspectRatio="none"></svg>
          <!-- Circles -->
          <div class="circlesContainer"></div>
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
        <div v-for="category in categories" @click="categoryClicked(category)">{{ category }}</div>
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

    }
  },
  methods: {
    // PUBLIC
    foo: function(){

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
  bottom: 3px;
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

  border-radius: 50%;
  transform: translate(-50%, 50%)
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