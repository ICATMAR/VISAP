// https://github.com/FranckFreiburger/vue3-sfc-loader
// https://github.com/FranckFreiburger/vue3-sfc-loader/blob/main/docs/examples.md#use-sfc-custom-blocks-for-i18n
import ca from './lang/ca.js';
import en from './lang/en.js';
import es from './lang/es.js';
// Import species translations
import sp_ca from './lang/species_ca.js';
import sp_en from './lang/species_en.js';
import sp_es from './lang/species_es.js';
// Remove nulls in spanish
Object.keys(sp_es).forEach(key=> {
  let el = sp_es[key];
  if (el == 'null'){
    delete sp_es[key];
  }
})


// Utils for hash and routing
import {setHashValue, getHashValue} from './Assets/Scripts/utils.js';
window.location.setHashValue = setHashValue;
window.location.getHashValue = getHashValue;


// Declare event emitter
// https://github.com/developit/mitt
window.eventBus = window.mitt();


// Import WMTSDataRetriever
import WMTSDataRetriever from './Assets/Scripts/WMTSDataRetriever.js';
window.WMTSDataRetriever = new WMTSDataRetriever();


// Import scripts
// Import file manager
import FileManager from './Assets/Scripts/FileManager.js';
import GAnalyticsManager from './Assets/Scripts/GAnalyticsManager.js';

window.FileManager = new FileManager();
let gaManager = new GAnalyticsManager();




const i18n = VueI18n.createI18n();

const options = {
  moduleCache: { vue: Vue },
  async getFile(url) {
    const res = await fetch(url);
    if (!res.ok)
      throw Object.assign(new Error(res.statusText + ' ' + url), { res });
    return {
      getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
    }
  },
  addStyle: (textContent) => {
    const style = Object.assign(document.createElement('style'), { textContent });
    const ref = document.head.getElementsByTagName('style')[0] || null;
    document.head.insertBefore(style, ref);
  },
  customBlockHandler(block, filename, options) {

    if (block.type !== 'i18n')
      return

    const messages = JSON.parse(block.content);
    for (let locale in messages)
      i18n.global.mergeLocaleMessage(locale, messages[locale]);
  }
}


const { loadModule } = window['vue3-sfc-loader'];

const app = Vue.createApp({
  components: {
    'app-manager': Vue.defineAsyncComponent(() => loadModule('./Components/AppManager.vue', options)),
  },
  template: '<app-manager></app-manager>'
});

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

app.use(i18n);

app.mount(document.body);