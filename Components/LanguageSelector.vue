<template>

  <div class="dropdown">
    <div class="dropbtnBackground">
      <button @click="dropdownClick" class="dropbtn" :style="{'background-image': 'url(./img/'+ $i18n.locale + '-200.png)'}"></button>
    </div>
    <div id="myDropdown" class="dropdown-content">
      <div class="lgItem cat" value='ca' @click='changeLanguage' href="#">Català</div>
      <div class="lgItem es" value='es' @click='changeLanguage' href="#">Español</div>
      <div class="lgItem en" value='en' @click='changeLanguage' href="#">English</div>
    </div>
  </div>

</template>



<script>
export default {
  name: "app-manager",
  created(){
    // Set language
    // Check if there is a language in the url
    let langURL = window.location.getHashValue('lang');
    if (langURL != undefined){
      this.$i18n.locale = langURL;
    } 
    // Use default navigator language
    else {
      this.$i18n.locale = navigator.language;
      window.location.setHashValue('lang', this.$i18n.locale);
    }
    

    
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    }
  },
  mounted () {

  },
  data () {
    return {
      
    }
  },
  methods: {
    // INTERNAL EVENTS
    dropdownClick: function(){
      document.getElementById("myDropdown").classList.toggle("show");
    },
    // Change language
    changeLanguage: function(el){
      let lang = el.target.getAttribute('value');
      this.$i18n.locale = lang;
      // Set url hash
      window.location.setHashValue('lang', this.$i18n.locale);
      
    },

  },
  components: {

  },
  computed: {
  
  }
}

</script>


<style scoped>
/* Dropdown Button */
.dropbtn {
  background-color: var(--darkBlue);
  border-radius: 50%;
  color: white;
  width:36px;
  height: 36px;
  text-decoration: none;
  padding: 4px;
  font-size: 16px;
  border: none;
  cursor: pointer;

  
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-origin: content-box;

}

.dropbtnBackground{
  background-color: #ffffff74;
  border-radius: 4px;
  padding: 3px;
}

/* Dropdown button on hover & focus */
.dropbtn:hover, .dropbtn:focus {
  background-color: var(--blue);
}

/* The container <div> - needed to position the dropdown content */
.dropdown {
  position: relative;
  display: inline-block;
  z-index: 3;
}

/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: var(--darkBlue);
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
}

/* Links inside the dropdown */
.dropdown-content .lgItem {
  color: white;
  padding: 4px 4px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.dropdown-content .lgItem:hover {
  background-color: var(--blue);
  cursor: pointer;
}

/* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
.show {
  display:block;
  right: 3%;
}

.lgItem:before {
  content: '';
  display: inline-block;
  width: 25px;
  height: 25px;
  vertical-align: middle;
  margin-right: 10px;
  margin-left: 10px;
  background-size: contain;
  background-repeat: no-repeat;
}

.es:before {
  content: '';
  background-image: url(./img/es-200.png);
}

.en:before {
  content: '';
  background-image: url(./img/en-200.png);
}
.cat:before {
  content: '';
  background-image: url(./img/ca-200.png);
}


</style>
