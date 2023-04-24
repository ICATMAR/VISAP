<template>
  <!-- Container -->
  <div id='appOverivew' ref='appOverivew'>

    <!--Header -->
    <div class="titleHeader">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 264" fill="none">
        <path d="M0 0H1440V195L0 264V0Z" fill="white"></path>
      </svg>
        
      <!-- Title -->
      <div class="h3">
        {{$t('fishingGears.Bottom trawling')}}
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
  /* overflow-x: hidden; */
  width: 100%;
  background:var(--darkBlue);
}

.titleHeader {
  width:100%;
  position: relative;
}

div.piechart {
  width: 100%;
  max-width: 600px;
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

svg {
  position: absolute;
  width: 100vw;
  min-height: 300px;
  top: -80px;
  left: 0px;

  z-index:1;
}


</style>