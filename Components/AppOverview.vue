<template>
  <!-- Container -->
  <div id='appOverivew' ref='appOverivew'>

    <!--Header -->
    <div class="titleHeader">

      <!-- Title -->
      <div class="h3">
        <!-- White background-->
        <div class="tiltedBackground"></div>
        <!-- Text -->
        <div>
        {{$t('fishingGears.Bottom trawling')}}
        </div>
        
      </div>
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
    //onclick: function(e){},
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
  padding: 60px;

  color: var(--darkBlue);
  font-family: "Poppins", Sans-serif;
  font-size: 30px;
  font-weight: 400;
  font-weight: bold;
  text-transform: none;
  line-height: 35px;
  
  z-index:2;
}

.tiltedBackground {
  background:white;
  transform:rotate(-3deg);
  position:absolute;
  width:150%;
  height: 130%;
  top:-50%;
  left:-10px;
  z-index:-1;
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
  }

  svg {
    top:-90px;
  }
}


</style>