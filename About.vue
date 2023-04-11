<template>
  <div id="about-panel" class="p-4 container-fluid">
    <!-- Row - Title -->
    <div class="row p-3">
      <h4>{{$t('About')}}</h4>
      <!-- Text -->
      <p>{{$t('Sentence1')}} </p>
    </div>
    

    <!-- Row - Title -->
    <div class="row p-3">
      <h5>{{$t('About ICATMAR')}}</h5>
      <!-- Text -->
      <p>{{$t('Sentence2')}} </p>
      <p>{{$t('Sentence3')}} </p>
      <p>{{$t('Sentence4')}} </p>
    </div>

    <!-- Row - Title -->
    <div class="row p-3">
      <h5>{{$t('Contact')}}</h5>
      <p>{{$t('SentenceContact')}} </p>
      <a href="https://www.bluenetcat.eu" title="BlueNetCat" target="_blank">BlueNetCat</a>
      <a href="http://agricultura.gencat.cat/ca/departament/dar_plans_programes_sectorials/politica-maritima/icatmar/" title="ICATMAR" target="_blank">ICATMAR</a>
      <a href="https://github.com/BlueNetCat/VISAP2" title="Code" target="_blank">{{$t("Code repository")}}</a>

    </div>

    <!-- Row - Title -->
    <div class="row p-3">
      <h5>{{$t('Funding')}}</h5>
      <p>{{$t('SentenceFunding')}} </p>
      <img src="img/Logos.png">
    </div>


  </div>
</template>




<script>
export default {
  name: "about-panel",
}
</script>

<style scoped>
#about-panel {
   font-size: 12px
}

p {
  text-align: justify;
}


a:link { color: #808080; }
a:visited { color: #808080; }
a:hover { color: #424242; }
a:active { color: #000000; }
</style>