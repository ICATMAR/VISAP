<template>
  <!-- Container -->
  <div id='fishingEffort' ref='fishingEffort'>

    <!-- Fishing tracks  TODO: THIS SHOULD GO ON A HIGHER LEVEL VUE (MENU-BOTTOM-RIGHT?)-->
    <div class="titleContainer" style="padding-right: 10px">
      <div class="clickable menuElement">

        <span @click="tracksLayerOnOff">{{ $t('Fishing tracks') }}</span>
        <onOffButton ref="onOffTracksButton" :checked="true" :inSize="'14px'" @change="tracksLayerOnOff($event)">
        </onOffButton>
      </div>
    </div>




    <div id="fishingEffort-container">
      <!-- Fishing effort -->
      <div class="titleContainer">
        <!-- Opacity -->
        <opacity-knob size="25px" v-show="areOptionsVisible" @change="changeOpacity"></opacity-knob>
        <!-- Title -->
        <div class="clickable menuElement">

          <span @click="effortLayerOnOff">{{ $t('Fishing effort') }}</span>
          <onOffButton ref="onOffButton" :checked="true" :inSize="'14px'" @change="effortLayerOnOff($event)">
          </onOffButton>
        </div>
      </div>

      <!-- Fishing effort options -->
      <Transition>

        <div v-show="areOptionsVisible">
          <!-- kg, euros, hours -->
          <div class="row-container">
            <span>{{ $t('Units') }}: </span>
            <button v-for="unit in units" class="clickable icon-str fa " :class="selUnit == unit ? 'selected' : ''"
              @click="effortUnitClicked(unit)" :title="$t('effortTypes.' + unit)" v-html="unitIcons[unit]">
            </button>
          </div>
          <!-- Years -->
          <div class="row-container">
            <button v-for="yy in years" class="clickable yearButton icon-str" :class="selYear == yy ? 'selected' : ''"
              @click="yearClicked(yy)">
              {{ yy }}
            </button>
          </div>

          <!-- Legend -->
          <div class="legendContainer">
            <effortLegend ref="effortLegend"></effortLegend>
          </div>

          <!-- Data source attribution -->
          <span class="wrapText">{{ $t('Data from') }}: <a title="ICATMAR" href="https://www.icatmar.cat" target="_blank"
              rel="noreferrer noopener">
              ICATMAR (Institut Català de Recerca per la Governança del Mar)</a></span>

        </div>

      </Transition>

    </div>

  </div>
</template>


<script>

// Import components
import OnOffButton from "Components/Utils/OnOffButton.vue";
import EffortLegend from "./EffortLegend.vue";
import OpacityKnob from "Components/Utils/OpacityKnob.vue";


export default {
  name: 'fishingEffort', // Caps, no -
  created() {

  },
  mounted() {
    this.updateEffortParams();
    // EVENTS
    window.eventBus.on('Map_mouseMove', this.showValueAtCoord);
    window.eventBus.on('AppMap_ChangedSection', this.updateEffortParams);
    window.eventBus.on('TitleHeader_ChangedSection', this.updateEffortParams);
    window.eventBus.on('ModalitySelector_ChangedModality', this.updateEffortParams);

  },
  data() {
    return {
      areTracksVisible: true,
      areOptionsVisible: true,
      selUnit: 'kg',
      selYear: 2020,
      units: ['kg', 'euros', 'hours'],
      unitIcons: {
        'kg': '&#xf5cd;',
        'euros': '&#xf153;',//'€',
        'hours': '&#xf017;'
      },
      years: [2019, 2020, 2021],
      imageData: [],
    }
  },
  methods: {
    // USER INTERACTION
    // Layer on off
    tracksLayerOnOff: function (e) {
      // OnOff Button was clicked
      if (e.target.value != undefined) {
        this.areTracksVisible = e.target.checked;
        // Activate layer
        window.eventBus.emit('FishingEffort_setHaulsVisible', ['fishingHauls', this.areTracksVisible]);
      }
      // Text was clicked --> Invoke click on the element, which calls again this function
      else {
        this.$refs.onOffTracksButton.setChecked(!this.areTracksVisible);
      }
    },


    effortLayerOnOff: function (e) {
      // OnOff Button was clicked
      if (e.target.value != undefined) {
        this.areOptionsVisible = e.target.checked;
        // Activate layer
        window.eventBus.emit('FishingEffort_setLayerVisible', ['fishingEffort', this.areOptionsVisible]);
      }
      // Text was clicked --> Invoke click on the element, which calls again this function
      else {
        this.$refs.onOffButton.setChecked(!this.areOptionsVisible);
      }
    },

    // Layer opacity changed
    changeOpacity: function (opacity) {
      window.eventBus.emit('FishingEffort_setLayerOpacity', opacity);
    },

    // Effort unit change
    effortUnitClicked: function (unit) {
      this.selUnit = unit;
      window.GUIManager.map.currentEffortUnit = unit;
      this.effortChanged();

      let fdManager = window.DataManager.getFishingDataManager();
      // Update available years
      this.years = Object.keys(fdManager.effortMaps.kg).filter(key => key.match(/\d+/g));
      // Event received in Map
      window.eventBus.emit('FishingEffort_EffortChanged', fdManager.getEffortURI());
    },
    // Year change
    yearClicked: function (year) {
      this.selYear = year;
      window.GUIManager.map.currentEffortYear = year;
      this.effortChanged();
      // Event received in Map
      let fdManager = window.DataManager.getFishingDataManager();
      window.eventBus.emit('FishingEffort_EffortChanged', fdManager.getEffortURI());
    },



    // PRIVATE METHODS
    // Update effort map parameters
    updateEffortParams: function () {
      // Load map data
      if (window.GUIManager.currentSection == 'map') {
        window.DataManager.loadNecessaryFiles('map', window.GUIManager.currentModality)
          .then(() => {
            console.log("Promise resolved in FishingEffort.vue");
            this.selUnit = window.GUIManager.map.currentEffortUnit;
            this.selYear = window.GUIManager.map.currentEffortYear;
            // Define available years
            let fdManager = window.DataManager.getFishingDataManager();
            this.years = Object.keys(fdManager.effortMaps.kg).filter(key => key.match(/\d+/g));
            this.selYear = window.GUIManager.map.currentEffortYear;
            this.effortChanged();
          });
      }
    },

    effortChanged: function () {
      let fdManager = window.DataManager.getFishingDataManager();
      // Change units information
      this.$refs.effortLegend.setUnitsInfo(fdManager.effortUnitsInfo);
      // Effort legend
      this.$refs.effortLegend.setEffortLegend(this.selUnit);
      // Store image data for showing the value in the legend
      let img = fdManager.getEffortImg();
      this.imageData = img.imageData;
    },




    // Show value at coord
    showValueAtCoord: function (coord) {

      let fdManager = window.DataManager.getFishingDataManager();
      let color = fdManager.getEffortPixelColorAtCoord(coord, this.imageData);

      // if (this.color[3] != 0) This is done in effortLegend
      this.$refs.effortLegend.showValueAtColor(color);
    },


  },
  components: {
    "onOffButton": OnOffButton,
    "effortLegend": EffortLegend,
    "opacity-knob": OpacityKnob,
  }
}
</script>




<style scoped>
#fishingEffort {
  position: absolute;

  bottom: 130px;
  right: 0px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;

  pointer-events: none;
}

#fishingEffort-container {
  z-index: 11;
  user-select: none;

  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: flex-start;
  padding-right: 10px;

  width: 100%;

  /* background: #00000042; */
  border-radius: 0px 10px 10px 0px;
}

.titleContainer {
  display: flex;
  flex-direction: row;
  align-items: center;

  width: 100%;
  justify-content: flex-end;
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

.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

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
  cursor: default;
}

.yearButton {
  width: 100%;
  border-radius: 24px;
  margin: 0px;
}

.wrapText {
  display: block;
  inline-size: clamp(140px, 40vw, 260px);
  overflow-wrap: break-word;
}

.legendContainer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}



.otherBaseLayersContainer {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
}



#buttonsWidget>div {
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