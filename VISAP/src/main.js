// Style
import './assets/globalStyle.css'



// Translations
import { createI18n } from 'vue-i18n'
// Import translations
import ca from './assets/lang/ca.js';
import en from './assets/lang/en.js';
import es from './assets/lang/es.js';
// Import species translations
import sp_ca from './assets/lang/species_ca.js';
import sp_en from './assets/lang/species_en.js';
import sp_es from './assets/lang/species_es.js';
// Remove nulls in spanish
Object.keys(sp_es).forEach(key => {
  let el = sp_es[key];
  if (el == 'null') {
    delete sp_es[key];
  }
});

const i18n = createI18n();
// Translations
i18n.global.mergeLocaleMessage('ca', ca);
i18n.global.mergeLocaleMessage('en', en);
i18n.global.mergeLocaleMessage('es', es);
// Translations species
i18n.global.mergeLocaleMessage('ca', sp_ca);
i18n.global.mergeLocaleMessage('en', sp_en);
i18n.global.mergeLocaleMessage('es', sp_es);
// Debug
i18n.global.silentFallbackWarn = true;
i18n.global.silentTranslationWarn = true;



// Routing




// App
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App);

app.use(i18n)
app.mount('#app')
