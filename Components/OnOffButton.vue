<template>
  <!-- Container -->
  <!-- https://www.w3schools.com/howto/howto_css_switch.asp -->
  <div id='onoffButton' ref='onoffButton' @click="e => e.stopPropagation()">
    <!-- Rounded switch -->
    <label class="switch">
      <input ref="inputEl" type="checkbox" :checked="checked" @mousedown="(e) => {e.stopPropagation(); e.preventDefault(); $emit('change', $event)}">
      <span class="slider round"></span>
    </label>
  </div>
</template>


<script>

// Import components
//import Map from 'Components/Map.vue'

export default {
  name: 'onoffButton', // Caps, no -
  props: {
    checked: Boolean,
    inSize: String,
  },
  created() {
    this.size = this.inSize || '26px';
  },
  mounted() {

  },
  
  data (){
    return {
    }
  },
  methods: {
    //onclick: function(e){},
    setChecked(boolOption){
      if (this.$refs.inputEl.checked != boolOption){
        this.$refs.inputEl.click();
      }
    }
  },
  components: {
    //'map': Map,
  }
}
</script>




<style scoped>
#onoffButton {
  display:flex;
  pointer-events: all;
}


/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: calc(v-bind(size) * 2.3);
  height: calc(v-bind(size) * 1.3);
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: v-bind(size);
  width: v-bind(size);
  left: calc(v-bind(size) * 0.15);
  bottom: calc(v-bind(size) * 0.15);
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}


input:checked + .slider {
  background-color: var(--red);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--red);
}

input:checked + .slider:before {
  -webkit-transform: translateX(v-bind(size));
  -ms-transform: translateX(v-bind(size));
  transform: translateX(v-bind(size));
}

/* Rounded sliders */
.slider.round {
  border-radius: calc(v-bind(size) * 1.3);
  box-shadow: 0px 0px 4px black;
}

.slider.round:hover {
  box-shadow: 0px 0px 4px var(--lightBlue);
  transition:none;
}

.slider.round:before {
  border-radius: 50%;
}
</style>