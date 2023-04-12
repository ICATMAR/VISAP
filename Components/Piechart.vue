<template>
  <!-- Container -->
  <div id='piechart' ref='piechart'>

    <!-- D3 chart -->
    <div style="width: 600px; height: 600px; background: red">

    </div>
    <!-- Filter per species button -->
    <button>{{ $t('Filter per species') }}</button>
    <!-- Export data button -->
    <button>{{ $t('Export data') }}</button>

  </div>
</template>


<script>

// Import components
//import Map from 'Components/Map.vue'

export default {
  name: 'piechart', // Caps, no -
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
  }
}
</script>




<style scoped>
#piechart {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>