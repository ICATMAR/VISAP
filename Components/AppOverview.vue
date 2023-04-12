<template>
  <!-- Container -->
  <div id='appOverivew' ref='appOverivew'>
    <div class="container">
      
      <!-- Title -->
      <div class="h3">
        {{$t('Bottom trawling')}}
      </div>
      
      <!-- Pie chart section -->
      <piechart-section type="port"></piechart-section>

    </div>
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
}

div.piechart {
  width: 100%;
  max-width: 600px;
}

</style>