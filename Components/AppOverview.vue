<template>
  <!-- Container -->
  <div id='appOverivew' ref='appOverivew'>

      
    <!-- Title -->
    <div class="h3">
      {{$t('Bottom trawling')}}
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
}

div.piechart {
  width: 100%;
  max-width: 600px;
}

</style>