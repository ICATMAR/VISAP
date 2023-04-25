<template>
  <!-- Container -->
  <div id='appOverivew' ref='appOverivew'>

    <!--Header -->
    <title-header title="Catch composition"></title-header>
    
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
import TitleHeader from 'Components/TitleHeader.vue'

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
    
  },
  components: {
    piechartSection: PiechartSection,
    titleHeader: TitleHeader,
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


</style>