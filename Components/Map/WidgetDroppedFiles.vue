<template>
  <!-- Container -->
  <div id='widgetDroppedFile' ref='widgetDroppedFile'>
    <!-- White line -->
    <div class="whiteLine"></div>
    <!-- Files -->
    <div class="fileListContainer" v-for="(content, key) in droppedFiles">
      <div class="clickable menuElement">
        <onOffButton :ref="key + 'OnOff'" :checked="content.isVisible" :inSize="'14px'" @change="fileOnOff($event, key)"></onOffButton>
        <span @click="fileOnOff($event, key)">{{key}}</span>
      </div>
      <!-- Info --> <!-- some files do not have any info. Some have timestamp, generator, copyright, attribution, name, source... -->
      <!-- Change opacity -->
      <opacity-knob size="25px" @change="changeFileOpacity($event, key)"></opacity-knob>
      <!-- Remove -->
      <span class="clickable fa" @click="fileRemove(key)">&#xf2ed;</span>
    </div>


  </div>
</template>


<script>

// Import components
import OnOffButton from "../Utils/OnOffButton.vue";
import OpacityKnob from "../Utils/OpacityKnob.vue";


export default {
  name: 'widgetDroppedFile', // Caps, no -
  created() {

  },
  mounted() {

    // EVENTS
    // Advanced interface
    window.eventBus.on("DataManager_geoJSONDataLoaded", lastReceived => {
      // WARN: vue is connected to DataManager
      this.droppedFiles = window.DataManager.geoJSONWrappers;
      this.$forceUpdate();
    });
  },
  data (){
    return {
      droppedFiles: {},
    }
  },
  methods: {
    // USER INTERACTION
    fileOnOff: function(e, fileName){
      // OnOff Button was clicked
      if (e.target.value != undefined){
        this.droppedFiles[fileName].isVisible = e.target.checked;
        // Emit
        window.eventBus.emit("WidgetDroppedFiles_FileVisibilityChanged", fileName);
      } 
      // Text was clicked --> Invoke click on the element, which calls again this function
      else {
        // Modify On/Off button
        this.$refs[fileName + "OnOff"].setChecked(!this.droppedFiles[fileName].isVisible);
      }
    },
    // Remove file
    fileRemove: function(fileName){
      delete window.DataManager.geoJSONWrappers[fileName];
      this.$forceUpdate();
      // Emit
      window.eventBus.emit("WidgetDroppedFiles_FileRemoved", fileName);
    },
    changeFileOpacity: function(opacity, fileName){
      this.droppedFiles[fileName].opacity = opacity;
      // Emit
      window.eventBus.emit("WidgetDroppedFiles_FileOpacityChanged", fileName);
    },



  },
  components: {
    "onOffButton": OnOffButton,
    "opacity-knob": OpacityKnob,
  }
}
</script>




<style scoped>
#widgetDroppedFile {
  z-index: 11;
  user-select: none;

  max-height: 100%;

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
  padding-left: 10px;

  /* background: #00000042; */
  border-radius: 0px 10px 10px 0px;
}

@media screen and (max-width: 770px) {
  #widgetDroppedFile {
    top: 120px;
  }
}

.whiteLine {
  width: 100%;
  height: 2px;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 0 4px black;
  margin-top: 10px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.fileListContainer{
  display:flex;
  align-items: center;
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

.titleContainer {
  display: flex;
  flex-direction: row;
  align-items: center;
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