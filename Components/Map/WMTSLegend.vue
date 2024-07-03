<template>
  <!-- Container -->
  <div id='WMTSLegend' ref='WMTSLegend' @mouseleave="isMouseOver = false">

    <div v-show="legendsLoaded" :class="isMouseOver ? 'hidden': ''">
      <!-- Tooltip -->
      <div id="toolTipContainer" v-show="!isMouseOver && currentValue !=''">
        <div class="tooltipLegend" ref="tooltipLegend">
          {{transformFunc(currentValue)}} {{units}}
          <span class="fa" :style="{transform: 'rotate('+ (currentDirection-45) +'deg)' }" v-if="currentDirection != undefined">&#xf124;</span>
        </div>
        
        <div class="tooltipLegendBar" ref="tooltipLegendBar">|</div>
      </div>

      <!-- Legend -->
      <img class="selLegend" :src="legendSrc" @click="isMouseOver = true">
      <div class="rangeValuesBox">
        <div class="leftRange" @click=rangeClicked()>{{transformFunc(legendRange[0])}}</div>
        <div class="middleRange" @click=unitsClicked()>{{ units }}</div>
        <div class="rightRange" @click=rangeClicked()>{{transformFunc(legendRange[1])}}</div>
      </div>
    </div>

    <!-- Drop-down with other legends -->
    <span v-show="isMouseOver">
      <div v-for="legend,index in dataSetLegends" >
        <img :src="legend.img.src" @click="legendClicked($event, index)">
      </div>
    </span>
  </div>
  
</template>


<script>
// TODO: THIS WAS JUST COPIED FROM HFRadar repository. 
// CONNECT WITH FileManager.js AND WMTSTileManager.js AND WidgetWeatherLayers.vue AND WMTSCustomDefinitions
// WidgetWeater... contains this component
// When the component is loaded, load the .png legends and get the colors
// WMTSCustomDefinitions contains the default legend (if not present use another).
// This component changes the range of the legend according to? also the units should be shown here. Maybe define 3-4 different ranges for each dataType?


// Import components
//import Map from 'Components/Map.vue'

export default {
  name: 'WMTSLegend', // Caps, no -
  props: {
    'dataSetName': {default: 'SST', type: String},
  //   'legendName': {default: 'absModifiedOccam', type: String},
  //   'legendRange':{default: [0, 100], type: Array},
  //   'defaultUnits': {default: 'cm/s', type: String},
  //   'selectedLegends': {default: ['absModifiedOccam.png', 'absColdOccam.png', 'white.png', 'black.png' ], type: Array},
  },
  created() {
    //this.units = this.defaultUnits;
  },
  mounted() {

    // Load legends
    let steps = 256;
    FileManager.loadLegends(steps).then((loadedLegends) => {
      this.availableLegends = {};
      loadedLegends.forEach(ll => {
        if (ll.status == 'fulfilled'){
          this.availableLegends[ll.value.legendName] = ll.value;
        }
      });
      this.legendsLoaded = true;

      // Get legends associated with dataSet from WMTSCustomDefintions.js
      this.selectLegendsAssociatedWithDataSet(this.dataSetName);
    });


    
    
  },
  data (){
    return {
      legendsLoaded: false,

      availableLegends: [],
      dataSetLegends: [],
      customDef: {},
      
      legendIndex: 0, // Is ovewritten by widget data type
      legendSrc: '',

      units: '',
      legendRangeIndex: 0,
      legendRange: [],

      isMouseOver: false,
      // Tooltip
      currentValue: '',
      currentDirection: '',
      transformFunc: (value) => {return value},

    }
  },
  methods: {
    // USER INTERACTION
    // Legend clicked
    legendClicked: function(e, index){
      this.legendIndex = index;
      this.legendSrc = this.dataSetLegends[index].img.src;
      // Define current legend in WMTSTileManager
      WMTSTileManager.currentLegend = this.dataSetLegends[this.legendIndex];

      // Reprocess tile with WMTSTileManager
      // Forces refresh on openlayers wmts source and therefore TileManager processes new tile
      window.eventBus.emit('WMTSLegend_LegendChange');
    },


    unitsClicked: function(e){
      // TODO Optional: write functions to change the units in custom definitions (WMTSCustomDefinitions.js)
      debugger;
      //this.$emit('unitsClicked');
    },
    rangeClicked: function(e){
      // Range
      this.legendRangeIndex = (this.legendRangeIndex + 1) % this.customDef.legendRanges.length;
      this.legendRange = this.customDef.legendRanges[this.legendRangeIndex];
      // Set current range to WMTSRange
      WMTSTileManager.currentRangeTransformFunc = this.calculateRangeTransformFunc(this.customDef.range, this.legendRange);

      // Forces refresh on openlayers wmts source and therefore TileManager processes new tile
      window.eventBus.emit('WMTSLegend_LegendChange');

      //this.$emit('rangeClicked');
    },



    // EVENT EMITTER
    // emitLegendChanged(legend){
    //   // TODO: FIX DATA STRUCTURE: legend contains colors and img, range is dependent on the data type
    //   //window.eventBus.emit('WMTSLegend_legendChanged', {legend, "legendRange": this.legendRange});
    //   // TODO: EMIT ON WIDGET, NOT ON LEGEND
    //   let legendObj =  {legend, "legendRange": this.legendRange};
    //   this.$emit('legendChanged', legendObj);
    // },


    // PUBLIC FUNCTIONS
    // Set range
    // setRange: function(range){
    //   this.legendRange[0] = range[0];
    //   this.legendRange[1] = range[1];
      
    //   this.emitLegendChanged(this.legends[this.legendIndex]);
    // },
    // Set units and transformation function
    setUnits: function(units, transformFunc){
      this.units = units;
      this.transformFunc = transformFunc;
    },
    // Show current value
    setCurrentValue: function(magnitude, direction){
      this.currentValue = magnitude;
      this.currentDirection = direction;

      // TODO: To test
      debugger;
      this.$refs.tooltipLegendBar.style.left = (100 * Math.min(Math.max((this.currentValue - this.legendRange[0]) / (this.legendRange[1] - this.legendRange[0])), 0), 100) + '%';
    },
    // Set legend color
    // setLegendColorScale: function(legendName){
    //   let index = undefined;
    //   // Find index according to default legend name     
    //   for (let i = 0; i < this.legends.length; i++){
    //     if (this.legends[i].img.src.includes('/' + legendName)){
    //       index = i;
    //       i = this.legends.length; // Exit loop
    //     }
    //   }
    //   // Legend is found
    //   if (index != undefined){
    //     this.legendIndex = index;
    //     this.legendSrc = this.legends[this.legendIndex].img.src;
    //     this.emitLegendChanged(this.legends[this.legendIndex]);
    //   }

      
    // },


    // Selects the legends that are pre-defined for that dataSet
    // Also called from the widget weather layers when clima layer is changed
    selectLegendsAssociatedWithDataSet: function(dataSetName){
      // If clima layer is clicked before legends are loaded, try again in 500ms
      if (this.legendsLoaded == false){
        setTimeout(() => this.selectLegendsAssociatedWithDataSet(dataSetName),
        500);
        return;
      }
      // Legends
      this.dataSetLegends = [];
      let dataSetId = WMTSDataRetriever.getDataSetIdFromDataName(dataSetName);
      let customDef = this.customDef = WMTSDataRetriever.customDefinitions[dataSetId];
      let availableLegendKeys = Object.keys(this.availableLegends);
      
      customDef.legends.forEach( lKey => {
        if (availableLegendKeys.includes(lKey)){
          this.dataSetLegends.push(this.availableLegends[lKey]);
        }
      });

      if (this.dataSetLegends.length == 0){
        debugger
      }

      this.legendIndex = 0;
      this.legendSrc = this.dataSetLegends[this.legendIndex].img.src;
      //this.emitLegendChanged(this.legends[this.legendIndex]);
      // Define current legend in WMTSTileManager
      WMTSTileManager.currentLegend = this.dataSetLegends[this.legendIndex];
      

      // Units
      this.units = customDef.unit;

      // Range
      this.legendRangeIndex = 0;
      this.legendRange = customDef.legendRanges[this.legendRangeIndex];
      // Define range transformation (range of tile is not the same as range of legend)
      WMTSTileManager.currentRangeTransformFunc = this.calculateRangeTransformFunc(customDef.range, this.legendRange);
    },


    // Calculates the transformation function of the range of the tile to the range of the legend
    calculateRangeTransformFunc: function(tileRange, legendRange){
      let transFunc = (value) => {
        let tMin = tileRange[0];
        let tMax = tileRange[1]
        let lMin = legendRange[0];
        let lMax = legendRange[1];
        // Calculate
        let value1 = value * (tMax-tMin) + tMin;
        let value2 = (value1 - lMin) / (lMax - lMin);
        // Clamp
        let value3 = Math.min(Math.max(value2, 0), 1);
        return value3;
      }
      return transFunc;
    }
    
  },
  components: {
    
  }
}
</script>




<style scoped>
#WMTSLegend {
  /* position: absolute; */
  /* width: 80%; */
  bottom: 90px;
  right: 10%;
  z-index: 10;
  pointer-events: all;

  align-items: center;
  display: flex;
  flex-direction: column-reverse;
  
}

.hidden {
  opacity: 0;
  display: none;
}

img {
  width:200px; 
  height:20px;
  border-radius: 5px;
}


#toolTipContainer {
  position: relative;
  display: flex;
  justify-content: center;
}
.tooltipLegend {
  position:absolute;
  top: -8px;
  color:white;
  font-size: small;
  text-shadow: 0px 0px 4px black;
  white-space: nowrap;
}
.tooltipLegendBar {
  position:absolute;
  top: 6px;
  font-size:large;
  text-shadow: 0px 0px 5px black;
  color:white;
  transform: translateX(-50%);
  -ms-transform: translateX(-50%);
}
.selLegend {
  margin-top: 10px;
  margin-bottom: 10px;
  border: 2px solid rgba(255, 255, 255, 0.185);
}

.selLegend:hover, img:hover {
  border-radius: 5px;
  border: 2px solid var(--lightBlue);
  cursor:pointer;
}

.rangeValuesBox {
  display: flex;
  justify-content: space-between;
  color: white;
  text-shadow: 0px 0px 4px black;
  font-size: clamp(0.6rem, 1.2vw, 0.8rem);
  margin-top: -10px;
}

.rangeValuesBox > *:hover {
  background-color: rgba(255, 255, 255, 0.281);
  border-radius: 10px;
}

.rangeValuesBox > * {
  padding-left: 10px;
  padding-right: 10px;
  cursor: pointer;
}

.leftRange {
  transform: translateX(-50%);
  -ms-transform: translateX(-50%);
}

/* .middleRange {
  transform: translateX(-50%);
  -ms-transform: translateX(-50%);
} */

.rightRange {
  transform: translateX(50%);
  -ms-transform: translateX(50%);
}
</style>