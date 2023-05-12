<template>
  <!-- Container -->
  <div id='appOverview' ref='appOverview'>

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
import PiechartSection from 'Components/CatchComposition/PiechartSection.vue'
import TitleHeader from 'Components/TitleHeader.vue'

export default {
  name: 'appOverview', // Caps, no -
  created() {
    
  },
  mounted() {
    // EVENTS
    window.eventBus.on('PieChartSection_ShowPie', this.scrollToChart);
  },
  data (){
    return {
      
    }
  },
  methods: {
    scrollToChart: function(){
      // Smooth scroll
      for (let i = 0; i<500; i++) {
        setTimeout(() => this.$refs.appOverview.scrollTop = (this.$refs.appOverview.scrollHeight)*i/500, i*2);
      }
    }
  },
  components: {
    piechartSection: PiechartSection,
    titleHeader: TitleHeader,
  }
}
</script>




<style scoped>
#appOverview {
  font-family: "Poppins", Sans-serif;
  scroll-behavior: auto;
  overflow: auto;
  overflow-x: hidden;
  width: 100%;
  background:var(--darkBlue);
}

@media (max-width: 800px) {
  /* #appOverview {
    overflow-x:auto;
  } */
}


</style>