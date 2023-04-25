<template>
  <!-- Container -->
  <div id="titleHeader">
      <!-- Title -->
        <div class="h3">
            <!-- Text -->
            {{$t(title)}}
        </div>

        <!-- App buttons -->
        <div class="switchPanels">
            <!-- Buttons -->
            <button :class="{selected: title=='Catch composition'}"  @click="changeHash('overview')">{{ $t('Catch composition') }}</button>
            <button :class="{selected: title=='Length frequency'}" @click="changeHash('length-freq')">{{ $t('Length frequency') }}</button>
            <button @click="changeHash('map')">{{ $t('Sampling map') }}</button>
        </div>

        <!-- White background-->
        <div class="tiltedBackground"></div>
  </div>
  
</template>
 
    


<script>


// Import components

export default {
  name: "titleHeader",
  props: {
    title: String
  },
  created(){

  },
  mounted () {

  },
  data () {
    return {

    }
  },
  methods: {
    changeHash: function(appType){
      window.location.setHashValue('app', appType);
    }
  },
  components: {
  },
  computed: {

  }
}


</script>





<style scoped>


#titleHeader {
  width:100%;
  position: relative;
}


.h3 {
  position: relative;
  text-align: center;
  padding-top: 60px;

  color: var(--darkBlue);
  font-family: "Poppins", Sans-serif;
  font-size: 30px;
  font-weight: 400;
  font-weight: bold;
  text-transform: none;
  line-height: 35px;

  z-index:2;
}

.switchPanels {
  position:relative;
  padding-bottom:60px;
  
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  z-index:2;
}

.selected {
  background: var(--red);
  pointer-events: none;
  cursor:default;
}

.tiltedBackground {
  background:white;
  transform:rotate(-3deg);
  position:absolute;
  width:150%;
  height: 130%;
  top:-50%;
  left:-10px;
  z-index:0;
  overflow:hidden;
}

button {
  user-select: none;
}

@media (max-width: 800px) {
  .h3 {
    padding: 40px;
    font-size: max(4vw, 1rem);
    padding-left: 40%;
  }

  button {
    font-size: 0.8rem;
  }
}

</style>