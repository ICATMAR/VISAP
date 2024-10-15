<template>
  
  <div class="logo-information icon-str clickable" @click="isVisible = !isVisible" v-if="!isVisible" title="Info">
    <span>i</span>
    <div class="warning-circle" v-if="isWarningOn"></div>
  </div>
  


  <Transition>
    <div class="overlay" @click="isVisible = false" v-if="isVisible">
      <div class="container">

        <!-- Informació -->
        <div class="banner-title">
          <span>{{$t('Information')}}</span>
        </div>
        <div class="banner-text">
          <span>{{ $t('info-sampling') }}</span>
          <button><a href="https://www.icatmar.cat/pesca/">{{ $t('LinkToSampling') }}</a></button>
          <span>{{ $t('info-team') }}</span>
          <button><a href="https://www.icatmar.cat/qui-som/equip-icatmar/">{{ $t('LinkToTeam') }}</a></button>
          <span>{{ $t('info-science') }}</span>
          <button><a href="https://doi.org/10.1093/database/baad067">{{ $t('LinkToArticle') }}</a></button>
        </div>

        <!-- Title -->
        <div class="warning-container" v-if="isWarningOn">
          <div class="banner-title-warning">
            <span>Warning!</span>
          </div>
          <!-- Text -->
          <div class="banner-text-warning">
            <span>Real-time data might be unavailable from the 4th to the {{ lastDay }}th of October 2024 due to manteinance. Sorry for the inconvenience.
            </span>
          </div>
        </div>

        
        <!-- Authorship and contact -->
        <div class="banner-title">
          <span>{{ $t('Contact') }}</span>
        </div>
        <div class="banner-text">
          <span>
            {{$t('author-info-gerard')}}
            <a :href="mailtoGerard" v-text="gerardEmail"></a>.
            {{$t('contact-github-issues')}}
            <a href="https://github.com/ICATMAR/HFRadar" target="_blank">github</a>.
            {{$t('author-info-jordi')}}
            <a :href="mailToJordi" v-text="jordiEmail"></a>.
            {{$t('contact-icatmar') }}
            <a :href="mailtoIcatmar" v-text="icatmarEmail"></a>.
            </span>
        </div>

        <!-- Funding -->
        <!-- Authorship and contact -->
        <!-- <div class="banner-title">
          <span>{{ $t('Funding') }}</span>
        </div>
        <div class="banner-text">
          <span>
            {{$t('funding-agencies')}}
          </span>
        </div> -->

        <!-- Map attributions -->
        
        

        <!-- Funding agencies icons-->
        <div class="attributions-container">
          <div class="logos-container">
            <img src="img/logos/ICATMAR512_white.png">
            <img src="img/logos/Generalitat_white.png">
            <img src="img/logos/ICM_white.png">
            <img src="img/logos/CSIC_white.png">
          </div>
        </div>
        
        <!-- Accept button -->
        <div class="buttons-container">
          <!-- Accept -->
          <button class="btn-accept" @click="acceptClicked">Close</button>
        </div>
      </div>
    </div>
  </Transition>
</template>


<script>

export default {
  name: "Information",
  created(){
    const domainCsic = "csic.es";
    const domainIcatmar = "icatmar.cat";

    this.gerardEmail = "gerard.llorach" + "@" + domainCsic;
    this.jordiEmail = "jribera" + "@" + "icm.csic.es"
    this.mailtoGerard = "mailto:" + this.gerardEmail;
    this.mailToJordi = "mailto:" + this.jordiEmail;

    this.icatmarEmail = "info" + "@" + domainIcatmar;
    this.mailtoIcatmar = "mailto:" + this.icatmarEmail;
  },
  mounted(){
    this.isWarningOn = false; // Define condition (like an ending date) new Date() < new Date(2024, 10 - 1, this.lastDay);
    this.isVisible = true//this.isWarningOn;
  },
  data() {
    return {
      isVisible: false,
      isWarningOn: false,
      lastDay: 11,
      gerardEmail: "", 
      mailtoGerard: "",
      icatmarEmail: "",
      mailtoIcatmar: "",
    }
  },
  methods: {
    // USER INTERACTION
    // Information about cookies settings is in index.html
    acceptClicked: function(e){
      this.isVisible = false;
    },
  }
}

</script>



<style scoped>

.logo-information{
  position: absolute;
  right: 1px;
  top: 6px;  
}

.overlay {
  position: absolute;
  margin: 0;
  background: rgb(175 230 250 / 77%);
  width: 100%;
  height: 100%;
  align-content: center;
  z-index: 3;
}

.container {
  max-width: 800px;
  width: 80%;
  display: flex;
  flex-direction: column;
  background: rgb(20 120 167 / 90%);
  padding: clamp(20px, 8vw, 50px);
  border-radius: 20px;
  user-select: none;
  max-height: 90%;
  overflow-y: auto;
}

.banner-title {
  border-bottom: 2px solid white;
  margin-bottom: 5px;
}
.banner-title > span {
  font-size: large;
}

.banner-text {
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
}
.banner-text > span {
  font-size: small;
}
.banner-text > button {
  font-size: small;
  margin: auto;
}

.buttons-container {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}




.attributions-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logos-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  
}
.logos-container > img {
  width: 25%;
  object-fit: contain;
  padding-left: 2%;
  padding-right: 2%;
  max-width: 150px;
}


.banner-title-warning > span {
  font-size: large;
}

.warning-container {
  background: #c16500;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 0 4px black;
  margin-bottom: 20px;
  margin-top: 20px;
}



a {
  color: white;
}

button > a {
  text-decoration: none;
}

.warning-circle {
  width: 12px;
  height: 12px;
  box-shadow: 0 0 4px black;
  background: #ff8500;
  border-radius: 50%;
  position: absolute;
  bottom: 0px;
  right: 0px;
  animation: colorChange 1s infinite;
}
@keyframes colorChange {
  0% {
    background: #ff8500;; /* Starting color */
  }
  50% {
    background: #ffc281;; /* Middle color */
  }
  100% {
    background: #ff8500;; /* End color (same as starting) */
  }
}





/* Transitions for elements */
.v-enter-active,
.v-leave-active {
  transition: all 0.8s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translate(50vw, -70vh) scale(0.1);
}

</style>