<template>
  <!-- Container -->
  <div id='fishingEffort' ref='fishingEffort'>

    <div id="fishingEffort-container">
      <!-- Fishing effort -->
      <div class="clickable menuElement">
        <onOffButton ref="onOffButton" :checked="true" :inSize="'14px'" @change="effortLayerOnOff($event)"></onOffButton>
        <span class="hiddenInMobile" @click="effortLayerOnOff">{{$t('Fishing effort')}}</span>
      </div>
      <!-- Fishing effort options -->
      <Transition>
        
      <div v-show="areOptionsVisible" style="min-width:100%">
        <!-- kg, euros, hours -->
        <div class="row-container">
          <span>{{ $t('Units') }}: </span>
          <button v-for="unit in units" class="clickable icon-str fa " 
            :class="selUnit==unit ? 'selected' : ''" 
            @click="effortUnitClicked(unit)" 
            :title="$t('effortTypes.' + unit)"
            v-html="unitIcons[unit]">
          </button>
        </div>
        <!-- Years -->
        <div class="row-container">
          <button v-for="yy in years" class="clickable yearButton icon-str" 
            :class="selYear==yy ? 'selected' : ''" 
            @click="yearClicked(yy)" >
            {{ yy }}
          </button>
        </div>

        <!-- Legend -->
      </div>

      </Transition>

    </div>

  </div>
</template>


<script>

// Import components
import OnOffButton from "Components/Utils/OnOffButton.vue";


export default {
  name: 'fishingEffort', // Caps, no -
  created() {

  },
  mounted() {
    
  },
  data (){
    return {
      areOptionsVisible: true,
      selUnit: 'kg',
      selYear: 2020,
      units: ['kg','euros', 'hours'],
      unitIcons: {
        'kg': '&#xf5cd;',
        'euros': '&#xf153;',//'€',
        'hours': '&#xf017;'
      },
      years: [2019, 2020, 2021, 2022],
    }
  },
  methods: {
    // USER INTERACTION
    // Layer on off
    effortLayerOnOff: function(e){
      // OnOff Button was clicked
      if (e.target.value != undefined){ 
        this.areOptionsVisible = e.target.checked;
        // Activate layer
        window.eventBus.emit('fishingEffort_setLayerVisible', ['fishingEffort', this.areOptionsVisible]);      } 
      // Text was clicked --> Invoke click on the element, which calls again this function
      else {
        this.$refs.onOffButton.setChecked(!this.areOptionsVisible);
      }
    },
    
    // Effort unit type
    effortUnitClicked: function(type){
      this.selUnit = type;
      // More   
    },


  },
  components: {
    "onOffButton": OnOffButton,
  }
}
</script>




<style scoped>
#fishingEffort{
  position: absolute;

  bottom: 130px;
  right: 0px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

}

#fishingEffort-container {
  z-index: 11;
  user-select: none;

  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: flex-start;
  padding-left: 10px;

  /* background: #00000042; */
  border-radius: 0px 10px 10px 0px;
}

@media screen and (max-width: 770px) {
  #fishingEffort {
    top: 120px;
  }
}

.menuElement {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: 4px;
  padding: 4px;
  background: #00000040;
  border-radius: 40px;
}

.row-container{
  display:flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  min-width:100%;

  background: #0000003d;
  border-radius: 30px;
  padding-left: 4px;
  padding-right: 4px;

  margin: 5px;

  font-size: clamp(0.6rem, 1.2vw, 0.8rem);
}


.selected {
  background: var(--red);
  pointer-events: none;
  cursor:default;
}

.yearButton {
  width: 100%;
  border-radius: 24px;
  margin:0px;
}



.otherBaseLayersContainer{
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
}



#buttonsWidget > div {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
}

span {
  font-size: clamp(0.6rem, 1.2vw, 0.8rem);
}


.v-enter-active {
  transition: all 0.3s ease-out;
}

.v-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.v-enter-from,
.v-leave-to {
  transform: translateX(20px);
  opacity: 0;
}



</style>