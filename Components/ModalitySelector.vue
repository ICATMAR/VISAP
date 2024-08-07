<template>

  <!-- Create line on top -->
  <div class="top-line" :class="[selectedModality == 'Trawling' ? 'bkg1' : selectedModality == 'Purse seine' ? 'bkg2' : 'bkg3']"></div>

  <!-- Dropdown section -->
  <div class="dropdown-container">

    <button @click="dropdownClick" class="dropbtn clickable" id="modalitySelectorButton"
      :class="[selectedModality == 'Trawling' ? 'bkg1' : selectedModality == 'Purse seine' ? 'bkg2' : 'bkg3']"
      :title="[$t(selectedModality + 'Info')]"
      >
      <img class="icon-big icon-str" :src="[selectedModality == 'Trawling' ? 'img/trawling.svg' : selectedModality == 'Purse seine' ? 'img/purseseine.svg' : 'img/recreational.svg']">
      <span>{{$t(selectedModality)}}</span>
      <span class="fa" :class="[isDropDownVisible ? 'rotate0' : 'rotate180']">&#xf106;</span>
    </button>
      
    <Transition>
    <div id="modalitySelectorDropdown" class="dropdown-content" v-show="isDropDownVisible">
      <div class="item" value="Trawling" @click="changeModality" :title="[$t('TrawlingInfo')]">
        <!-- <div class="dot bkg1"></div> -->
        <img class="icon-str" src="img/trawling.svg"></img>
        {{$t("Trawling")}}
      </div>
      <div class="item" value="Purse seine" @click="changeModality" :title="[$t('Purse seineInfo')]">
        <!-- <div class="dot bkg2"></div> -->
        <img class="icon-str" src="img/purseseine.svg"></img>
        {{$t("Purse seine")}}
      </div>
      <div class="item" value="Recreational" @click="changeModality" :title="[$t('RecreationalInfo')]">
        <!-- <div class="dot bkg3"></div> -->
        <img class="icon-str" src="img/recreational.svg"></img>
        {{$t("Recreational")}}
      </div>
    </div>
    </Transition>
  </div>

</template>



<script>
export default {
  name: "modality-selector",
  created(){

  
    // Close the dropdown menu if the user clicks outside of it
    document.onclick = (event) => {
      if (event.target.id == "modalitySelectorButton")
        return;
      if (this.isDropDownVisible)
        this.isDropDownVisible = false;
    }
  },
  mounted () {

  },
  data () {
    return {
      selectedModality: 'Trawling',
      isDropDownVisible: false,
    }
  },
  methods: {
    // INTERNAL EVENTS
    dropdownClick: function(){
      this.isDropDownVisible = !this.isDropDownVisible;
    },

    // Change modality
    changeModality: function(el){
      let modality = el.target.getAttribute('value');
      this.selectedModality = modality;
      this.isDropDownVisible = false;
      // Emit
      window.eventBus.emit('ModalitySelector_changedModality', modality);
    },

  },
  components: {

  },
  computed: {
  
  }
}

</script>


<style scoped>


.top-line {
  position:absolute;
  top: 0px;
  right: 0px;
  left: 0px;
  height: 5px;
  z-index: 9;
}
.bkg1 {  background-color: rgb(255 155 56);}
.bkg2 {  background-color: rgb(255, 56, 56);}
.bkg3 {  background-color: rgb(255 219 56);}

.dot {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  display: inline-block;
  border: solid 2px black;
  margin-right: 9px;
}


/* The container <div> - needed to position the dropdown content */
  .dropdown-container {
  position: absolute;
  z-index: 3;
  margin-top: 0px;

  display: flex;
  flex-direction: column;
}



/* Dropdown Button */
.dropbtn {
  color: white;
  text-decoration: none;
  font-size: 16px;
  border: none;
  cursor: pointer;

  box-shadow: 0px 0px 4px 0px black;
  border-radius: 0px 0px 20px 20px;
  border: solid white 2px;

  display: flex;
  flex-direction: row;
  align-items: center;

  transition: all 0.2s ease-in-out;
  box-shadow: inset 0 0 100px 100px rgba(255, 255, 255, 0.0);
}

/* Dropdown button on hover & focus */
.dropbtn:hover {
  box-shadow: inset 0 0 100px 100px rgba(0, 0, 0, 0.2);
}

.dropbtn > * {
  pointer-events: none;
}






/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  background-color: var(--darkBlue);
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  border-radius: 5px 5px 10px 10px;
  margin-top: 2px;

}


.item {
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

/* Links inside the dropdown */
.dropdown-content .item {
  color: white;
  padding: 4px 4px;
  text-decoration: none;
}

/* Change color of dropdown links on hover */
.dropdown-content .item:hover {
  background-color: var(--blue);
  cursor: pointer;
}




.rotate0 {
  rotate: 0deg;
  transition: all 0.3s ease-in-out;
}
.rotate180 {
  rotate: 180deg;
  transition: all 0.3s ease-in-out;
}


.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}


</style>
