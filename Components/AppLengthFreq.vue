<template>
    <!-- Container -->
    <div id='appLengthFreq' ref='appLengthFreq'>
  
      <!--Header -->
      <title-header title="Length frequency"></title-header>

    </div>
  </template>
  
  
  <script>
  
  // Import components
  //import Map from 'Components/Map.vue'
  import TitleHeader from 'Components/TitleHeader.vue'
  
  export default {
    name: 'appLengthFreq', // Caps, no -
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
      titleHeader: TitleHeader,
    }
  }
  </script>
  
  
  
  
  <style scoped>
  #appLengthFreq {
    font-family: "Poppins", Sans-serif;
    scroll-behavior: auto;
    overflow: auto;
    overflow-x: hidden;
    width: 100%;
    background:var(--darkBlue);
  }
  
  @media (max-width: 800px) {
    #appLengthFreq {
      overflow-x:auto;
    }
  }
  
  
  </style>