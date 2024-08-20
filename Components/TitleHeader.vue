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
            <button :class="{selected: title=='Catch composition'}"  @click="changeSection('overview')">
              <span class="fa">&#xf13d; </span>
              <span class="button-text">{{ $t('Catch composition') }}</span>
            </button>
            <button :class="{selected: title=='Length frequency'}" @click="changeSection('length-dist')">
              <span class="fa">&#xe0e3; </span>
              <span class="button-text">{{ $t('Length frequency') }}</span>
            </button>
            <button @click="changeSection('map')">
              <span class="fa">&#xf276; </span>
              <span class="button-text">{{ $t('Sampling map') }}</span>
            </button>
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
    changeSection: function(section){
      window.eventBus.emit('TitleHeader_ChangedSection', section)
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
  margin-top: 30px;

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
    font-size: max(4vw, 1rem);
    margin-right: 85px;
    margin-left: 141px;
  }

  button {
    font-size: 0.8rem;
  }
}

</style>