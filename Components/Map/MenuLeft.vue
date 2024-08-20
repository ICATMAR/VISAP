<template>
    <div id="menuLeft" class="menuLeft">

      <widgetMapOptions></widgetMapOptions>

      <widgetDroppedFiles></widgetDroppedFiles>
  
    </div>
  </template>
  


  
  
  <script>
  import WidgetDroppedFiles from "Components/Map/WidgetDroppedFiles.vue"
  import WidgetMapOptions from "Components/Map/WidgetMapOptions.vue"

  export default {
    name: "menuLeft",
    created(){

    },
    mounted(){
  
    },
    unmounted(){
  
    },
    data(){
      return {

      }
    },
    methods: {

  
    },
    components: {
      "widgetDroppedFiles": WidgetDroppedFiles,
      "widgetMapOptions": WidgetMapOptions
    },
    computed: {
  
    }
  }
  </script>
  
  <style scoped>
  #menuLeft {
    position: absolute;

    top: 250px;
    bottom: 130px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

    pointer-events: none;

  }

  @media screen and  (max-width: 770px) {
    #menuLeft {
      top: 150px;
    }
  }

  </style>