<template>
  <!-- Div container with mouse events -->
  <div id="effort-legend">

      <!-- Canvas with legend and interactivity -->
      <canvas @mouseover="mouseIsOver = true" @mouseleave="mouseLeftLegend()" @mousemove="updateMousePosition($event)" :width="canvasWidth" :height="canvasHeight" 
          id="effortLegendCanvas" ref="effortLegendCanvas" class="img-fluid rounded"></canvas>
      <!-- Tooltip -->
      <div v-if=mouseIsOver class="tooltip fade show bs-tooltip-start" id="legendTooltip"
          style="position: absolute; white-space: nowrap; inset: 0px 0px auto auto; margin: 0px; transform: translate(-30px, 125px);">
        <div class="tipText tooltip-inner" v-html="legendValue + ' ' + legendUnits"></div>
      </div>

      <!-- TODO -->
      <!-- Tooltip mouse moving on map -->
      <div v-else-if=showValueMap class="tooltip fade show bs-tooltip-start" id="legendTooltipMapValue"
          style="position: absolute; white-space: nowrap; inset: 0px 0px auto auto; margin: 0px; transform: translate(-120px, 30px);">
        <!-- <div class="tooltip-arrow" v-show="!horizontal" style="position: absolute; top: 0px; transform: translate(0px, 8px); white-space: nowrap;"></div> -->
        <div class="tipText tooltip-inner">{{legendValue}} {{legendUnits}}</div>
      </div>

  </div>
</template>






<script>

export default {
  name: "effort-legend",
  created(){

  },
  mounted () {
 
  },
  data () {
    return {

      mouseIsOver: false,
      mousePosition: {mouseX: 0, mouseY: 0},
      imgEl: undefined,
      legendLoaded: false, // When imgEl is loaded becomes true
      legendValue: '',
      legendUnits: 'm/s',
      range: [0,1],

      legendColorRef: undefined,
      showValueMap: false,

      canvasWidth: 200,
      canvasHeight: 30,

      // Units
      unitsInfo: {
        kg: {
          units: 'kg/km<sup>2</sup>',
          range: [0, 6850]
        },
        euros: {
          units: 'K €/km<sup>2</sup>',
          range: [0, 132]
        },
        hours: {
          units: 'h/km<sup>2</sup>',
          range: [0, 400]
        }
      }
    }
  },
  methods: {

    // USER HTML ACTIONS




    // PRIVATE METHODS
    // Draw legend and cursor
    draw: function(canvas){
      if (!this.legendLoaded)
        return;
      // Context
      let ctx = canvas.getContext("2d");
      // Global composite
      // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
      ctx.globalCompositeOperation = "source-destination";
      

      ctx.drawImage(this.imgEl, 0, 0, canvas.width, canvas.height);

      
      // 25%, 50%, 75% lines
      ctx.strokeStyle = 'rgba(0,0,0,255)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      // Horizontal
      ctx.moveTo(canvas.width*0.25, 0);
      ctx.lineTo(canvas.width*0.25, canvas.height);
      ctx.moveTo(canvas.width*0.5, 0);
      ctx.lineTo(canvas.width*0.5, canvas.height);
      ctx.moveTo(canvas.width*0.75, 0);
      ctx.lineTo(canvas.width*0.75, canvas.height);
      
      ctx.stroke();



      // Show line at value
      if (this.showValueMap || this.mouseIsOver){
        let value = this.legendValue;
        let normValue = (value - this.range[0]) / (this.range[1] - this.range[0]);
        
        ctx.strokeStyle = 'rgba(0,0,0,255)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Horizontal legend     
        ctx.moveTo(normValue*canvas.width, 0);
        ctx.lineTo(normValue*canvas.width, canvas.height);
        
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,255)';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Horizontal legend
        ctx.moveTo(normValue*canvas.width, 0);
        ctx.lineTo(normValue*canvas.width, canvas.height);
        ctx.lineTo(normValue*canvas.width, 0);
        ctx.lineTo(normValue*canvas.width, canvas.height);
      
        ctx.stroke();

      }

    },

    // Draw for transforming img into pixel data
    drawToLegendColorReference(){
      // Create canvas
      let tmpCnv = document.createElement('canvas');
      tmpCnv.width=100;
      tmpCnv.height=100; // Resolution
      // Paint image to canvas
      let ctx = tmpCnv.getContext("2d");
      ctx.globalCompositeOperation = "source-destination";

      ctx.drawImage(this.imgEl, 0, 0, tmpCnv.width, tmpCnv.height);
      // Get image data
      this.legendColorRef = tmpCnv.getContext("2d").getImageData(0,0,tmpCnv.width,tmpCnv.height).data;
    },


    // Update mouse Position (only happens when inside the legend canvas)
    updateMousePosition: function(event){
      this.mousePosition.mouseX = event.offsetX;
      this.mousePosition.mouseY = event.offsetY;

      let canvas = this.$refs.effortLegendCanvas;
      // Calculate legend value
      let normValue;
      // Horizontal legend
      normValue = 1 - (canvas.width - event.offsetX)/canvas.width;
      this.legendValue = (normValue * (this.range[1] - this.range[0]) + this.range[0]).toFixed(2);

      let legendTooltipEl = document.getElementById("legendTooltip");
      // Vertical legend
      legendTooltipEl.style.transform = "translate("+ (event.offsetX - canvas.width + 40) +"px, "+ canvas.height*1.2 +"px)";

      this.draw(canvas);
    },

    // TODO:
    // Receives a color value (RGB) and maps it in the legend.
    showValueAtColor: function(color){
      
      // If outside the land (alpha = 0), do not show
      this.showValueMap = true;
      if (color[3] == 0 || this.mouseIsOver){
        this.showValueMap = false;
        return;
      }

      // Find the value that corresponds to a color
      let normValue = this.getValueFromColor(color);
      if (normValue == undefined){
        this.showValueMap = false;
        return;
      }

      // Calculate value according to index
      let value = normValue * (this.range[1] - this.range[0]) + this.range[0];
      // Show in legend
      this.legendValue = value.toFixed(2);
      // Position legend
      let legendTooltipEl = document.getElementById("legendTooltipMapValue");
      if (legendTooltipEl == null){
        return;
      }
      let canvas = this.$refs.effortLegendCanvas;


      // Horizontal legend
      legendTooltipEl.style.transform = "translate("+ (normValue*canvas.width - canvas.width + 40) +"px, "+ canvas.height*1.2 +"px)";

      this.draw(canvas);
    },

    // Get value from color
    getValueFromColor: function(color){
      // Find the color that is more similar to the legend color reference
      let normValue = undefined;
      let minDiff = 10;
      // Iterate over legend reference
      for (let i = 0; i < this.legendColorRef.length/4; i++){
        let el1 = color[0]-this.legendColorRef[i*4];
        let el2 = color[1]-this.legendColorRef[i*4 + 1];
        let el3 = color[2]-this.legendColorRef[i*4 + 2];
        // Euclidean distance
        let diff = Math.sqrt( (el1)*(el1) + (el2)*(el2) + (el3)*(el3) );
        // Store min diff
        if (diff < minDiff){
          minDiff = diff;
          normValue = i / (this.legendColorRef.length/4); // normValue goes from 0 to 1
        }
      }
      if (normValue == undefined)
        return undefined
      else
        return normValue*-1 + 1;
    },

    // When the mouse is moving on the map, the legend should show the value.
    mouseLeftLegend: function(){
      this.mouseIsOver = false;
      this.draw(this.$refs.effortLegendCanvas);
    },





    // PUBLIC METHODS
    setEffortLegend: function(unit){
      let selGear = 'bottomtrawling';
      let url = 'Assets/LegendsFishingEffort/' + unit + '_' + selGear + '.png';

      // Change range and legend units
      this.range = this.unitsInfo[unit].range;
      this.legendUnits = this.unitsInfo[unit].units;

      // Create image element to paint the legend graphic
      let canvas = this.$refs.effortLegendCanvas;
      let ctx = canvas.getContext("2d");
      this.imgEl = document.createElement("img");
      this.imgEl.src = url;
      this.imgEl.crossOrigin = "Anonymous";
      // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
      this.imgEl.onload = () =>{
        this.legendLoaded = true;
        this.draw(canvas);
        this.drawToLegendColorReference();
      };
    },



  },
  components: {

  },
  computed: {
  
  }
}


</script>





<style scoped>

#effort-legend {
  position: relative;
  display: flex;
  justify-content: center;
  
  width: 100%;

  margin-bottom: 40px;
}


#effortLegendCanvas:hover {
  border: 1px solid #000000!important;
  cursor: pointer
}

.tooltip {
  /* transition: all 0.05s ease-in-out; */
  user-select: none;
}

.tipText {
  max-width: 130px;
  font-family: "Poppins", "Sans-serif";
  font-size: clamp(0.6rem, 1.2vw, 0.8rem);

  background: var(--darkBlue);
}

</style>