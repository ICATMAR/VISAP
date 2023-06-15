<template>
  <!-- Div container with mouse events -->
  <div id="wms-legend" @click.prevent="legendClicked($event)" @contextmenu="legendClicked($event)">

      <!-- Canvas with legend and interactivity -->
      <canvas @mouseover="mouseIsOver = true" @mouseleave="mouseLeftLegend()" @mousemove="updateMousePosition($event)" :width="canvasWidth" :height="canvasHeight" 
          id="wmsLegendCanvas" ref="wmsLegendCanvas" class="img-fluid rounded legendCanvas" title="Click to change the colormap"></canvas>
      <!-- Tooltip -->
      <div v-if=mouseIsOver class="tooltip fade show bs-tooltip-start" ref="legendTooltip"
          style="position: absolute; white-space: nowrap; inset: 0px 0px auto auto; margin: 0px; transform: translate(-30px, 125px);">
        <div class="tooltip-arrow" v-show="!horizontal" style="position: absolute; top: 0px; transform: translate(0px, 8px); white-space: nowrap;"></div>
        <div class="tipText tooltip-inner">{{legendValue}} {{legendUnits}}</div>
      </div>

      <!-- Tooltip mouse moving on map -->
      <div v-else-if=showValueMap class="tooltip fade show bs-tooltip-start" ref="legendTooltipMapValue"
          style="position: absolute; white-space: nowrap; inset: 0px 0px auto auto; margin: 0px; transform: translate(-120px, 30px);">
        <!-- <div class="tooltip-arrow" v-show="!horizontal" style="position: absolute; top: 0px; transform: translate(0px, 8px); white-space: nowrap;"></div> -->
        <div class="tipText tooltip-inner">{{legendValue}} {{legendUnits}}</div>
      </div>

  </div>
</template>






<script>
// Receives a WMS URL and we get the legend?
// // LEGEND
// ADD LEGEND. style is then transfered to legend.
// https://nrt.cmems-du.eu/thredds/wms/med-cmcc-cur-an-fc-qm?REQUEST=GetLegendGraphic&LAYER=sea_water_velocity&PALETTE=rainbow&COLORSCALERANGE=-0.5354787%2C0.92136043
// WMS Parameters
// REQUEST
// LAYER
// PALETTE (STYLE)
// COLORSCALERANGE

// Functionalities
// When click, change style? --> propagate to Map.vue and to ForecastBar.vue
// Change range? --> bootstrap modal --> propagate to Map.vue and ForecastBar.vue
// When on map, show tooltip on legend with value? --> function called from outside, with RGB as input?

export default {
  name: "wms-legend",
  created(){
    // Switch canvas size if horizontal
    if (this.horizontal){
      let prevWidth = this.canvasWidth;
      this.canvasWidth = this.canvasHeight;
      this.canvasHeight = prevWidth;
    }

  },
  mounted () {
    //this.setWMSLegend('');
    // EVENTS
    window.eventBus.on('Map_MouseOnData_WMSColor', this.showValueAtColor);
  },
  data () {
    return {
      baseWMSLegendURL: "{SOURCEURL}?REQUEST=GetLegendGraphic&LAYER={LAYER}&PALETTE={PALETTE}&COLORSCALERANGE={COLORRANGE}",
      baseGetCapabilitiesURL: "{SOURCEURL}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities",
      mouseIsOver: false,
      mousePosition: {mouseX: 0, mouseY: 0},
      imgEl: undefined,
      legendLoaded: false, // When imgEl is loaded becomes true
      legendValue: '',
      legendUnits: 'm/s',
      range: [0,1],
      styles: [],
      currentURL: "",
      legendColorRef: undefined,
      showValueMap: false,
      // Horizontal legend
      horizontal: true,
      canvasWidth: 15,
      canvasHeight: 200,
    }
  },
  methods: {

    // USER HTML ACTIONS
    // Legend clicked --> change style
    legendClicked: function(event){
      event.preventDefault();
      event.stopPropagation();
      if (this.styles.length == 0)
        return;
      // Circular shift
      if (event.type == 'contextmenu'){ // Right 
        this.styles.unshift(this.styles[this.styles.length-1]);
        this.styles.pop()
      } // Shift to the other direction
      else
        this.styles.push(this.styles.shift(1));

      // Replace in url
      this.currentURL = WMSDataRetriever.setWMSParameter(this.currentURL, 'PALETTE', this.styles[0].split('/')[1]);
      this.imgEl.src = 'Assets/LegendsWMS/' + this.styles[0].split('/')[1] + '.png';//this.currentURL;

      // Emit for changing styles
      //this.$emit('legendClicked', this.styles[0])
      window.eventBus.emit('WMSLegend_LegendClicked', this.styles[0]);
    },




    // PRIVATE METHODS
    // Get WMS styles
    getWMSStyles: function(infoWMS){
      let capabilitiesURL = this.baseGetCapabilitiesURL.replace('{SOURCEURL}', infoWMS.url);
      this.styles = [];
      // fetch
      fetch(capabilitiesURL).then(response => response.text())
        .then(data => {
          const parser = new DOMParser();
          let xml = parser.parseFromString(data, "application/xml");
          let layers = xml.querySelectorAll('Layer');
          // Iterate through layers
          layers.forEach(ll => {
            // Get layer by its name
            //console.log(ll.firstElementChild.innerHTML);
            if (ll.querySelector("Name").innerHTML == infoWMS.params.LAYERS){
              let layerStyles = ll.querySelectorAll("Style");
              // Store style names
              layerStyles.forEach(ss => {
                if (ss.querySelector("Name").innerHTML.includes("boxfill")) // Only boxfill styles
                  this.styles.push(ss.querySelector("Name").innerHTML)
              });
              // console.log(this.styles);
            }
          })
        })
        .catch(console.error);
    },



    // Draw legend and cursor
    draw: function(canvas){
      if (!this.legendLoaded)
        return;
      // Context
      let ctx = canvas.getContext("2d");
      // Global composite
      // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
      ctx.globalCompositeOperation = "source-destination";
      
      if (!this.horizontal){
      // Top-left: 5 height, 2 width
      // Bottom-rigth: 257 height, 25
      // Size: 24x253
        ctx.drawImage(this.imgEl, 2, 5, 24, 253, 0, 0, canvas.width, canvas.height);
      } else {
        // Draw rotated image
        // For testing use https://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_canvas_drawimage2 and
        // https://my.cmems-du.eu/thredds/wms/med-cmcc-tem-rean-d?REQUEST=GetLegendGraphic&LAYER=thetao&PALETTE=occam&COLORSCALERANGE=1,40
        ctx.setTransform(1, 0, 0, 1, 2, 253); // scale, 0, 0, scale, originX, originY
        ctx.rotate(90*Math.PI/180);
        ctx.translate(-this.imgEl.height,-canvas.width);
        ctx.drawImage(this.imgEl, 5, 5, 20, 257, // crop
                          0, 0, canvas.height*10, canvas.width*1.1); // position and resize
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      
      
      // 25%, 50%, 75% lines
      ctx.strokeStyle = 'rgba(0,0,0,255)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      if (!this.horizontal){
        ctx.moveTo(0, canvas.height*0.25);
        ctx.lineTo(canvas.width, canvas.height*0.25);
        ctx.moveTo(0, canvas.height*0.5);
        ctx.lineTo(canvas.width, canvas.height*0.5);
        ctx.moveTo(0, canvas.height*0.75);
        ctx.lineTo(canvas.width, canvas.height*0.75);
      } 
      // Horizontal
      else {
        ctx.moveTo(canvas.width*0.25, 0);
        ctx.lineTo(canvas.width*0.25, canvas.height);
        ctx.moveTo(canvas.width*0.5, 0);
        ctx.lineTo(canvas.width*0.5, canvas.height);
        ctx.moveTo(canvas.width*0.75, 0);
        ctx.lineTo(canvas.width*0.75, canvas.height);
      }
      ctx.stroke();



      // Show line at value
      if (this.showValueMap || this.mouseIsOver){
        let value = this.legendValue;
        let normValue = (value - this.range[0]) / (this.range[1] - this.range[0]);
        
        ctx.strokeStyle = 'rgba(0,0,0,255)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Vertical legend
        if (!this.horizontal){
          ctx.moveTo(0, normValue*canvas.height);
          ctx.lineTo(canvas.width, normValue*canvas.height);
        }
        // Horizontal legend
        else {
          ctx.moveTo(normValue*canvas.width, 0);
          ctx.lineTo(normValue*canvas.width, canvas.height);
        }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,255)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Vertical legend
        if (!this.horizontal){
          ctx.moveTo(0, normValue*canvas.height);
          ctx.lineTo(canvas.width, normValue*canvas.height);
          ctx.lineTo(0, normValue*canvas.height);
          ctx.lineTo(canvas.width, normValue*canvas.height);
        }
        // Horizontal legend
        else {
          ctx.moveTo(normValue*canvas.width, 0);
          ctx.lineTo(normValue*canvas.width, canvas.height);
          ctx.lineTo(normValue*canvas.width, 0);
          ctx.lineTo(normValue*canvas.width, canvas.height);
        }
        ctx.stroke();

      }

    },

    // Draw for transforming img into pixel data
    drawToLegendColorReference(){
      // Create canvas
      let tmpCnv = document.createElement('canvas');
      tmpCnv.width=1;
      tmpCnv.height=100; // Resolution
      // Paint image to canvas
      let ctx = tmpCnv.getContext("2d");
      ctx.globalCompositeOperation = "source-destination";
      ctx.drawImage(this.imgEl, 2, 5, 24, 253, 0, 0, tmpCnv.width, tmpCnv.height);
      // Get image data
      this.legendColorRef = tmpCnv.getContext("2d").getImageData(0,0,tmpCnv.width,tmpCnv.height).data;
    },


    // Update mouse Position (only happens when inside the legend canvas)
    updateMousePosition: function(event){
      this.mousePosition.mouseX = event.offsetX;
      this.mousePosition.mouseY = event.offsetY;

      let canvas = this.$refs.wmsLegendCanvas;
      // Calculate legend value
      let normValue;
      if (!this.horizontal) // Vertical legend
        normValue = (canvas.height - event.offsetY)/canvas.height;
      else // Horizontal legend
        normValue = 1 - (canvas.width - event.offsetX)/canvas.width;
      this.legendValue = (normValue * (this.range[1] - this.range[0]) + this.range[0]).toFixed(2);

      let legendTooltipEl = this.$refs.legendTooltip;
      // Vertical legend
      if (!this.horizontal)
        legendTooltipEl.style.transform = "translate(-"+ canvas.width*1.2 +"px, "+ (event.offsetY-6) +"px)";
      // Horizontal legend
      else 
        legendTooltipEl.style.transform = "translate("+ (event.offsetX - canvas.width) +"px, "+ (canvas.height + 10) +"px)";

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
      let legendTooltipEl = this.$refs.legendTooltipMapValue;
      if (legendTooltipEl == null){
        return;
      }
      let canvas = this.$refs.wmsLegendCanvas;

      // Vertical legend
      if (!this.horizontal)
        legendTooltipEl.style.transform = "translate(-"+ canvas.width +"px, "+ ((normValue*-1+1)*canvas.height - 12) +"px)";
      // Horizontal legend
      else
        legendTooltipEl.style.transform = "translate("+ (canvas.offsetLeft + normValue*canvas.width - canvas.width) +"px, "+ (canvas.height + 5) +"px)";

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
      this.draw(this.$refs.wmsLegendCanvas);
    },





    // PUBLIC METHODS
    setWMSLegend: function(infoWMS){
      if (infoWMS == undefined)
        return;
      // Define Legend WMS URL
      let wmsURL = this.baseWMSLegendURL.replace('{SOURCEURL}', infoWMS.url);
      wmsURL = wmsURL.replace('{LAYER}', infoWMS.params.LAYERS);
      wmsURL = wmsURL.replace('{PALETTE}', infoWMS.params.STYLES.split('/')[1]);
      wmsURL = wmsURL.replace('{COLORRANGE}', infoWMS.params.COLORSCALERANGE);
      this.currentURL = wmsURL;

      // Define range
      this.range[0] = 1*infoWMS.params.COLORSCALERANGE.split(",")[0];
      this.range[1] = 1*infoWMS.params.COLORSCALERANGE.split(",")[1];

      // Define units
      this.legendUnits = infoWMS.params.UNITS;

      // Style
      let style = infoWMS.params.STYLES.split('/')[1];

      // Get styles from WMS service
      // TODO: SHOULD BE ALREADY LOADED IN WMSDATATYPES.JS
      this.styles = [];
      this.getWMSStyles(infoWMS);

      // Create image element to paint the legend graphic
      let canvas = this.$refs.wmsLegendCanvas;
      let ctx = canvas.getContext("2d");
      this.imgEl = document.createElement("img");
      this.imgEl.src = 'Assets/LegendsWMS/'+ style +'.png';//wmsURL;
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

#wms-legend {
  position: relative;
  display: flex;
  justify-content: center;
  
  width: 100%;
  margin-bottom: 10px;

  pointer-events: all;
}


#wmsLegendCanvas:hover {
  border: 1px solid #000000!important;
  cursor: pointer;
}

.legendCanvas {
  pointer-events: all;
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