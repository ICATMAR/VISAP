<template>
    <div id="menuLeft" class="menuLeft">

      <widgetMapOptions></widgetMapOptions>
  
    </div>
  </template>
  


  
  
  <script>
  import WidgetMapOptions from "Components/WidgetMapOptions.vue"

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
      "widgetMapOptions": WidgetMapOptions
    },
    computed: {
  
    }
  }
  </script>
  
  <style scoped>
  #menuLeft {
    position: absolute;
    background: red;

    top: 300px;
    bottom: 130px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;

  }

  </style>