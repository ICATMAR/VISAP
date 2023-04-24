<template>
  <!-- Container -->
  <div id='appOverivew' ref='appOverivew'>

    <!--Header -->
    <div class="titleHeader">

      <!-- Title -->
      <div class="h3">
        <!-- Text -->
        {{$t('fishingGears.Bottom trawling')}}
      </div>

      <!-- App buttons -->
      <div class="switchPanels">
        <!-- Buttons -->
        <button class="selected">{{ $t('Catch composition') }}</button>
        <button @click="changeHash('length-freq')">{{ $t('Length frequency') }}</button>
        <button @click="changeHash('map')">{{ $t('Sampling map') }}</button>
      </div>

      <!-- White background-->
      <div class="tiltedBackground"></div>
      
    </div>
    
    <!-- Pie chart section -->
    <piechart-section type="port"></piechart-section>

    <!-- Pie chart section -->
    <piechart-section type="season"></piechart-section>


  </div>
</template>


<script>

// Import components
//import Map from 'Components/Map.vue'
import PiechartSection from 'Components/PiechartSection.vue'

export default {
  name: 'appOverivew', // Caps, no -
  created() {
    
  },
  mounted() {
    
  },
  data (){
    return {
      
    }
  },
  methods: {
    changeHash: function(appType){
      window.location.setHashValue('app', appType);
    }
  },
  components: {
    //'map': Map,
    piechartSection: PiechartSection,
  }
}
</script>




<style scoped>
#appOverivew {
  font-family: "Poppins", Sans-serif;
  scroll-behavior: auto;
  overflow: auto;
  overflow-x: hidden;
  width: 100%;
  background:var(--darkBlue);
}

@media (max-width: 800px) {
  #appOverivew {
    overflow-x:auto;
  }
}

.titleHeader {
  width:100%;
  position: relative;
}


.h3 {
  position: relative;
  text-align: center;
  padding-top: 60px;

  color: var(--darkBlue);
  font-family: "Poppins", Sans-serif;
  font-size: 30px;
  font-weight: 400;
  font-weight: bold;
  text-transform: none;
  line-height: 35px;
  
  z-index:2;
}

.switchPanels {
  position:relative;
  padding-bottom:60px;
  
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  z-index:2;
}
.selected {
  background: var(--red);
  pointer-events: none;
  cursor:default;
}

.tiltedBackground {
  background:white;
  transform:rotate(-3deg);
  position:absolute;
  width:150%;
  height: 130%;
  top:-50%;
  left:-10px;
  z-index:0;
  overflow:hidden;
}

svg {
  position: absolute;
  width: 100vw;
  min-height: 300px;
  top: -80px;
  left: 0px;

  z-index:1;
}

@media (max-width: 800px) {
  .h3 {
    padding: 40px;
    font-size: 25px;
    padding-left: 40%;
  }

  svg {
    top:-90px;
  }
}


</style>