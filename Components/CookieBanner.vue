<template>
  
  <div class="logo-cookie-banner icon-str clickable" @click="isVisible = !isVisible" v-if="!isVisible">
    <span class="fa">&#xf563</span>
  </div>
  


  <Transition>
    <div class="container" v-show="isVisible">

      <!-- Title -->
      <div class="banner-title">
        <span>{{$t('Cookies title')}}</span>
      </div>
      <!-- Text -->
      <div class="banner-text">
        <span>{{$t('Cookies text')}}
        </span>
      </div>
      
      <!-- Accept and deny buttons -->
      <div class="buttons-container">
        <!-- Accept -->
        <button class="btn-accept" @click="acceptClicked">{{$t('Cookies accept')}}</button>
        <button class="btn-deny" @click="denyClicked">{{$t('Cookies deny')}}</button>
      </div>
    </div>
  </Transition>
</template>


<script>

export default {
  name: "CookieBanner",
  mounted(){
    this.isVisible = true;
    // If cookies are set, hide banner
    if (localStorage.getItem('cookie-analytics')){
      let paramsStr = localStorage.getItem('cookie-analytics');
      let params = JSON.parse(paramsStr);
      if (params.analytics_storage == 'granted')
        this.isVisible = false;
    }
  },
  data() {
    return {
      isVisible: false,
    }
  },
  methods: {
    // USER INTERACTION
    // Information about cookies settings is in index.html
    acceptClicked: function(e){
      this.isVisible = false;
      // Google analytics and cookies
      let params = {
        ad_storage: 'denied',
        ads_data_redaction: 'false',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'granted',
      }
      gtag('consent', 'update', params);
      // Store cookies
      localStorage.setItem('cookie-analytics', JSON.stringify(params));
    },
    // Deny cookies (update ga and delete cookies)
    denyClicked: function(e){
      this.isVisible = false;
      // Google analytics and delete cookies
      let params = {
        ad_storage: 'denied',
        ads_data_redaction: 'false',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      }
      gtag('consent', 'update', params);
      // Remove cookies if they exist
      localStorage.clear();
    },

  }
}

</script>



<style scoped>

.logo-cookie-banner{
  width: 28px;
  height: 28px;
  position: fixed;
  top: 6px;
  padding: 0px;
  margin: 0px;
  z-index: 10;

  right: 70px
}
.container {
  position: absolute;
  bottom: 100px;
  left: 20px;
  right: 20px;

  max-width: 500px;
  width: 80%;

  display: flex;
  flex-direction: column;
  background: rgb(20 120 167 / 80%);
  padding: 20px;
  border-radius: 20px;

  user-select: none;
}

.banner-title > span {
  font-size: large;
}

.banner-text {
  padding-bottom: 20px;
  font-size: small;
}

.buttons-container {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.btn-deny {
  background-color: rgb(136, 136, 136);
  border: 2px solid gray;
  cursor: auto;
}
.btn-deny:hover {
  background-color: rgb(136, 136, 136);
  border: 2px solid gray;
  cursor: auto;
}



/* Transitions for elements */
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translate(40vw, -70vh) scale(0.5);
}

</style>