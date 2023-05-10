<template>
  <div id="app-animation" ref="app-animation">

    <!-- Current Animations -->
    <!--div style="position: absolute; margin: 0px; font-size: .875rem">
      <button type="button" class="btn btn-dark rounded-pill"
        style="font-size: smaller"
          :class="anim.class" :key="anim.id" :id="anim.id" :title=anim.tooltip @click.prevent="animClicked" v-for="anim in animHTML">
          {{anim.name}}
          <button type="button" class="btn-close btn-close-white" style="font-size: smaller" aria-label="Close" @click.stop ="closeAnimClicked"></button>
      </button>
    </div-->


    <div class="container" style="position: absolute; margin: 70px 0px 0px 0px; font-size: .875rem">
      <div class="row row-cols-auto p-1" :key="anim.id" v-for="anim in animHTML">
        <button type="button" class="col-sm-auto btn btn-dark rounded-pill"
          style="font-size: smaller"
            :class="anim.class"  :id="anim.id" :title=anim.tooltip @click.prevent="animClicked">
            {{anim.name}}
            <button type="button" class="btn-close btn-close-white" style="font-size: smaller" aria-label="Close" @click.stop ="closeAnimClicked"></button>
        </button>
      </div>
    </div>

    <!-- Animation Canvas will be appended by code -->

  </div>
</template>






<script>


export default {
  name: "app-animation",
  // https://github.com/vuejs/vue/issues/1988
  created(){
    // Non-reactive variables
    this.$options.animations = [];
    this.$options.OLMap = undefined;
  },
  mounted () {

  },
  data () {
    return {
      animHTML: [],
    }
  },
  methods: {
    // USER HTML ACTIONS
    // Animation HTML EL clicked
    // Hides/unhides canvas element
    animClicked: function(event) {
      // Get animObj id
      let id = event.currentTarget.id;
      // Find animEl
      let animSel;
      this.$options.animations.forEach(a => {if (id == a.id) animSel = a;});
      animSel.canvas.hidden = !animSel.canvas.hidden;
      // Change button class
      if (animSel.canvas.hidden){ // Add opacity class
        this.animHTML.forEach(item => {if (id == item.id) item.class = 'opacity-75'});
      } else // Remove class
        this.animHTML.forEach(item => {if (id == item.id) item.class = ''});
    },
    // Closed animation clicked. Destroys the animation
    closeAnimClicked: function(event) {
      // Get id
      let id = event.currentTarget.parentElement.id;
      // Destroy animation
      this.destroyAnim(id);
      // Update visibility of remaining buttons
      let delIdx;
      this.animHTML.forEach((el, idx) => {if (el.id == id) delIdx = idx});
      this.animHTML.splice(delIdx, 1);
    },





    // PRIVATE METHODS
    start: function(infoWMS, animation, OLMap){
      
      // Declare OLMap
      this.$options.OLMap = OLMap;

      // Create canvas
      let canvas = document.createElement("canvas");
      canvas.className = "position-absolute pe-none vh-100 vw-100";
      canvas.id = infoWMS.name;

      // Append to HTML DOM
      this.$refs["app-animation"].appendChild(canvas);

      // Create animation engine
      let animEngine = new AnimationEngine(canvas, this.$options.OLMap, infoWMS.exampleWMSURL, animation);

      // Define map events for animation
      // Update canvas and positions
      this.$options.OLMap.on('moveend', animEngine.onMapMoveEnd);
      // Clear canvas
      this.$options.OLMap.on('movestart', animEngine.onMapMoveStart);

      // Store animation in array
      this.$options.animations.push({
        id: infoWMS.name,
        name: infoWMS.name,
        infoWMS: infoWMS,
        animEngine: animEngine,
        canvas: canvas
      });

      // Create reactive data
      this.animHTML.push({
        id: infoWMS.name,
        name: infoWMS.name,
        tooltip: infoWMS.tooltip,
        class: ''
      })

    },


    // Destroys the animation clicked
    destroyAnim: function(id){
      // Find selected animation and index
      let animSel;
      let idxSel;
      this.$options.animations.forEach((a, idx) => {if (id == a.id) {animSel = a; idxSel = idx}});
      // Destroy animation item
      let animObj = this.$options.animations.splice(idxSel, 1)[0]; // The animation will stop because the canvas has no parent element
      // TODO: GC (reuse anim object?)
      // Remove canvas from HTML DOM
      animObj.canvas.remove();
      // Remove event listeners
      let animEng = animObj.animEngine;
      //console.log("Deleted "+ animObj.id + ". Canvas parent element: " + animEng.canvasParticles.parentElement)
      animEng.map.un('movestart', animEng.onMapMoveStart);
      animEng.map.un('moveend', animEng.onMapMoveEnd);
      // Call destroy function
      animEng.destroyer();
      animEng = null;
    },





    // PUBLIC METHODS
    // Defines the new source to use
    defineWMSSource: function(infoWMS, animation, OLMap){ // Called from AppManager.vue
      // Check if an animation of the same type exists
      let animExists = false;
      let animObj;
      this.$options.animations.forEach(a => {if (infoWMS.name == a.name) {animExists = true; animObj = a;}});

      if (!animExists){
        // Create new animation
        this.start(infoWMS, animation, OLMap);
      } else {
        // Update WMS source
        animObj.animEngine.setSource(infoWMS.exampleWMSURL, animation);
      }
    },

  },
  components: {

  },
  computed: {

  }
}


</script>





<style scoped>
#animationCanvas {
  background: none;
}

.opacity-75{
  opacity: 0.75;
}

</style>