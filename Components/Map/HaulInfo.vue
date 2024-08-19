<template>
  <div id="haul-info" class="container-fluid">
    <!-- Empty space top -->
    <div class="lightBlue" style="height: 90px;"></div>
    <!-- Title -->
    <div class="rowEl p-3 lightBlue">
      <h4>{{ $t('Fishing tracks') }}</h4>
    </div>
    <!-- Drop down -->
    <div class="rowEl p-3 g-0 lightBlue" style="flex-direction: column">

      <div class="haulSelectorContainer">
        <!-- Previous haul-->
        <button class="buttonInPanel clickable" @click="nextPrevHaul(-1)" style="transform: rotate(-90deg) scale(0.8)"
          :title="$t('PrevHaul')">
          <div class="fa">&#xf106;</div>
        </button>
        <!-- Open/Close table -->
        <button class="buttonInPanel" :title="$t('HaulTableOpen')" @click="isTableVisible = !isTableVisible">
          {{ selHaul.Port }} - {{ selHaul.Date }}
          <div class="fa" :class="[isTableVisible ? 'rotate0' : 'rotate180']" style="margin-left: 20px">&#xf106;</div>
        </button>
        <!-- Next haul -->
        <button class="buttonInPanel clickable" @click="nextPrevHaul(1)" style="transform: rotate(90deg) scale(0.8)"
          :title="$t('NextHaul')">
          <div class="fa">&#xf106;</div>
        </button>
      </div>



      <Transition>
        <div class="tableContainer" v-if="areHaulsLoaded && isTableVisible">
          <table>
            <thead>
              <!-- TABLE HEADER -->
              <tr>
                <!-- <th class="clickable tableHeader" @click="sortHauls(hauls, key)" v-for="key in Object.keys(selHaul)">{{ $t(key) }}</th> -->
                <th class="clickable tableHeader" @click="sortHauls(hauls, key)" v-for="key in Object.keys(selHaul)">
                  <div> {{$t("HaulTable." + key) }} </div> 
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- TABLE ROW -->
              <tr class="clickable tableRow" :class="[index % 2 == 0 ? ('oddRow ' + (haul.Id == selHaul.Id ? 'selectedRow' : '')) :
                ('evenRow ' + (haul.Id == selHaul.Id ? 'selectedRow' : ''))]" @click="() => onSelectHaul(haul.Id)"
                v-for="(haul, index) in hauls" :key="haul.Id">
                <!-- TABLE CELL -->
                <td class="tableCell" v-for="kk in Object.keys(selHaul)">
                  <div><!-- Container -->
                    <!-- Circle (only is visible for port and zonaport) -->
                    <div :style="setCellStyle(kk, haul[kk])"></div>
                    <!-- Text -->
                    {{ translateText((haul[kk])) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Transition>

    </div>
    <!-- Catch composition title -->
    <div class="rowEl p-3" style="background:white; justify-content: space-around !important;">
      <h4>{{ $t('Catch composition') }}</h4>
      <!-- Export buttons -->
      <!-- Export data button -->
      <div>
        <button @click="exportButtonClicked">
          <span class="fa">&#xf56d; </span>
          <span class="button-text">{{ $t('Export data') }}</span>
        </button>
        <!-- Export options buttons -->
        <div class="dropdown-content" v-show="showExportOptions">
          <button @click="exportCSV">.csv</button>
          <button @click="exportJSON">.json</button>
        </div>
      </div>


    </div>
    <!-- Pie chart -->
    <div class="rowEl p-2 g-0" style="background: white" ref="pieChart">
    </div>

    <!-- Haul info -->
    <div class="rowEl p-2 g-0 darkBlue" style="flex-wrap: wrap; justify-content:flex-start;">
      <div style="width: 50%" :key="kk.Id" v-for="kk in Object.keys(selHaul)">
        <!-- If is not a number -->
        <span v-if="isNaN(selHaul[kk])">{{ $t("HaulFeatures." + kk) }}: {{ $t(selHaul[kk]) }}</span>
        <!-- If it is a number -->
        <span v-else>{{ $tc("HaulFeatures." + kk, parseFloat(selHaul[kk])) }}</span>
      </div>
    </div>

    <!-- Weather widget -->
    <div class="rowEl p-2 g-0" style="background: var(--lightBlue); color: white; text-shadow: 0 0 4px black;">
      <weather-widget ref="weatherWidget"></weather-widget>
    </div>

    <!-- Row -->
    <div class="rowEl p-2 g-0" style="background: var(--blue); color: white; text-shadow: 0 0 4px black;">
      <sea-habitat ref="seaHabitat"></sea-habitat>
    </div>

    <!-- Empty space for mobile, as map falls on top of last element -->
    <div class="rowEl isVisibleInMobile p-2 g-0"
      style="background: var(--darkBlue); height: 200px; color: white; text-shadow: 0 0 4px black;">
    </div>
  </div>

</template>



<script>
import WeatherWidget from 'Components/Map/HaulInfo/WeatherWidget.vue';
import SeaHabitat from 'Components/Map/HaulInfo/SeaHabitat.vue';

export default {
  name: "haul-info",
  created() {
    // Default haul
    this.selHaul = this.hauls[0];
    // Default fishing haul id comes from GUIManager
    this.selHaul.id = window.GUIManager.map.currentHaul;
  },
  mounted() {
    // EVENTS
    // Hauls loaded
    window.eventBus.on('Map_HaulsLoaded', this.setFishingHauls);
    // Haul selected
    window.eventBus.on('Map_HaulClicked', this.setSelectedFishingHaul);
    window.eventBus.on('TracksTimeLine_HaulClicked', this.setSelectedFishingHaul);
    // Language change
    window.eventBus.on('LanguageSelector_LanguageChanged', () => this.setPieChart(this.selHaul.Id));
    window.eventBus.on('GUIManager_LanguageChanged', () => this.setPieChart(this.selHaul.Id));
  },
  data() {
    return {
      selHaul: {},
      // Default options
      hauls: [{
        AvgDepth: "365.2",
        Date: "2022-11-30",
        Distance: "7360.59",
        Duration: "89.68",
        Estacio: "Autumn",
        FishingGroundType: "Upper slope",
        Id: 23288,
        Port: "Barcelona",
        ZonaPort: "Center",
      },],
      showExportOptions: false,
      areHaulsLoaded: false,
      isTableVisible: false,
    }
  },
  methods: {
    // USER HTML ACTIONS
    // When a track is selected
    onSelectHaul: function (event) {
      let id = event;

      // Update HaulInfo content
      this.setSelectedFishingHaul(id);

      // Emit selected target
      window.eventBus.emit('HaulInfo_SelectedHaul', id);
    },
    // Export data
    exportButtonClicked: function (e) {
      this.showExportOptions = !this.showExportOptions;
      e.stopPropagation();
      e.preventDefault();
    },
    closeExportMenu: function (e) {
      this.showExportOptions = false;
    },
    // https://www.codevoila.com/post/30/export-json-data-to-downloadable-file-using-javascript
    exportJSON: function (event) {
      this.showExportOptions = false;
      // Data not yet loaded
      if (this.rawData === undefined)
        return;
      // Create
      let dataStr = JSON.stringify(this.rawData);
      let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      let linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      let trackFileName = this.$i18n.t('Catch composition').replaceAll(' ', '') + '_' + this.selHaul.Port.replaceAll("'", '').replaceAll(' - ', '_').replaceAll(' ', '') + '_' + this.selHaul.Date;
      linkElement.setAttribute('download', trackFileName + '_ICATMAR');
      linkElement.click();

      // Event for GAnalytics
      window.eventBus.emit("HaulInfo_Export", { fileExtension: "JSON", modality: "trawling", trackId: this.selHaul.Id });
    },


    // Export data (CSV)
    exportCSV: function (event) {
      this.showExportOptions = false;
      // Data not yet loaded
      if (this.rawData === undefined)
        return;
      // Parse JSON to CSV
      let jsonData = this.rawData;
      let keys = Object.keys(jsonData[0]);

      let columnDelimiter = ',';
      let lineDelimiter = '\n';

      let csvColumnHeader = keys.join(columnDelimiter);
      let csvStr = csvColumnHeader + lineDelimiter;

      jsonData.forEach(item => {
        keys.forEach((key, index) => {
          if ((index > 0) && (index < keys.length)) {
            csvStr += columnDelimiter;
          }
          csvStr += item[key];
        });
        csvStr += lineDelimiter;
      });

      // Now make downlodable element
      let dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvStr);
      let linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      let trackFileName = this.$i18n.t('Catch composition').replaceAll(' ', '') + '_' + this.selHaul.Port.replaceAll("'", '').replaceAll(' - ', '_').replaceAll(' ', '') + '_' + this.selHaul.Date;
      linkElement.setAttribute('download', trackFileName + '_ICATMAR');
      linkElement.click();

      // Event for GAnalytics
      window.eventBus.emit("HaulInfo_Export", { fileExtension: "CSV", modality: "trawling", trackId: this.selHaul.Id });
    },



    // PRIVATE METHODS
    // Set Fishing haul menu once they are loaded
    setFishingHauls: function (gjsonData) {
      this.areHaulsLoaded = true;
      // Reset hauls
      this.hauls = [];
      // Process features to fit into select HTML
      let features = gjsonData.features;
      features.forEach((ff, index) => {
        let info = ff.properties.info;
        //info.name = info.Port + " - " + info.Data;
        // Select info to show
        this.hauls[index] = {}
        Object.keys(info).forEach(kk => {
          if (kk != 'FishingGroundName' && kk != 'MeshType' && kk != 'Date' && kk != 'Data')
            this.hauls[index][kk] = info[kk];
          if (kk == 'Date')
            this.hauls[index][kk] = info[kk].toISOString().substring(0, 10);
        });

      });
      // Order by date
      this.hauls.sort((a, b) => {
        let dateDiff = new Date(a.Date) - new Date(b.Date);

        if (dateDiff == 0) {
          return a.Port.localeCompare(b.Port);
        } else
          return dateDiff;
      });
    },


    // Create and set pie chart
    setPieChart: function (id) {
      console.log('+++Requesting haul file ' + id);
      // Load haul from server or from file
      //this.getHaul('data/trawlingData/hauls/' + id + '.json', undefined, this.selHaul);
      window.DataManager.getHaulCatchComposition(id).then((r) => {

        let pieChart = new PieChart();
        let preparedData = pieChart.processSample(r);
        this.$refs.pieChart.innerHTML = "";

        // Translations
        if (this.$i18n) {
          this.translateData(preparedData);
        }

        let info = window.DataManager.getHaulInfo(id);
        let units = window.DataManager.getFishingDataManager().mod == 'trawling' ? 'kg/km2' : 'kg';
        pieChart.runApp(this.$refs.pieChart, preparedData, d3, info.Port + ", " + info.Data, this.$i18n.t("Biomass"), units);
      });
    },




    // Translate data using $i18n
    translateData(prepData) {
      Object.keys(prepData).forEach(key => {
        let el = prepData[key];
        if (typeof (el) == 'object') {
          this.translateData(el);
        } else if (typeof (el) == 'string') {
          prepData["translation"] = this.$i18n.t(el);
        }
      });
    },

    // HACK: for some reason this.$i18n.t(text) does not work nor $t(text) in HTML. We get the translations object and use it.
    translateText(text) {
      let translations = this.$i18n.getLocaleMessage(this.$i18n.locale);
      return translations[text] || text;
    },


    // Go to next or previous haul
    nextPrevHaul(isForward) {
      isForward = isForward == 1;

      // Find the index of the selected item
      let index = this.hauls.findIndex(haul => haul.Id === this.selHaul.Id);
      // If the selected item is not found
      if (index === -1) {
        debugger;
        return
      }
      // Find next or previous index. Wrap around
      let nextIndex;
      if (isForward) {
        nextIndex = (index + 1) % this.hauls.length; // Wrap around if at the end
      } else {
        nextIndex = (index - 1 + this.hauls.length) % this.hauls.length; // Wrap around if at the beginning
      }

      this.onSelectHaul(this.hauls[nextIndex].Id);
    },


    // Sort the hauls shown on the table
    sortHauls(hauls, key) {

      if (isNaN(this.selHaul[key])) {
        if (key == "Data" || key == "Date") {
          return hauls.sort((a, b) => new Date(a[key]) - new Date(b[key]));
        } else {
          return hauls.sort((a, b) => a[key].localeCompare(b[key]));
        }
      } else {
        return hauls.sort((a, b) => a[key] - b[key]);
      }
    },


    // PUBLIC METHODS
    // Set the selected fishing haul in the select html element
    // Vue automatically updates the HTML element
    setSelectedFishingHaul: function (id) {

      this.selHaul = {};
      this.hauls.forEach(oo => {
        if (id == oo.Id) {
          // Copy values
          Object.keys(oo).forEach(key => {
            if (key != 'catchComposition' && key != 'geometry') {
              this.selHaul[key] = oo[key]
            }
          });
        }
      });
      //this.$forceUpdate(); // Is this necessary? Remodel first the <select> into a button / table

      // Update pie chart
      // TODO: again there is a repetition of calling this event twice (sidePanel when openingPanel)
      this.setPieChart(id);
      // Update weather table
      // TODO: this is actually called twice, one from SidePanel (it requests to open it, then requesting a data update on weather widget)
      // if (this.$refs.weatherWidget) {
      //   this.$refs.weatherWidget.requestDataUpdate(id);
      // }
      // Update sea habitat table
      if (this.$refs.seaHabitat) {
        // Get lat long
        let haul = window.DataManager.getHaulInfo(id);
        let coords = haul.geometry.coordinates;
        coords = [...coords]; // copy
        // Point geometry
        if (haul.geometry.type == "Point") {
          coords = [coords];
        }
        //let middleCoordinate = coords[Math.round(coords.length/2)];
        // Update sea habitat
        this.$refs.seaHabitat.updateData(coords);
      }
    },




    // STYLE
    setCellStyle: function (columnName, cellContent) {
      if (columnName == 'Port' || columnName == 'ZonaPort') {
        let color = palette[cellContent].color;
        if (color != undefined) {
          return {
            //'background': 'radial-gradient(rgba('+ color[0] + ','+ color[1] +','+ color[2] +', 1), transparent)',
            'background': 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ', 1)',
            'border-radius': '20px',
            'width': '12px',
            'height': '12px',
            'margin': '8px',
          }
        }
      }

      return {}
    },
  },
  components: {
    "weather-widget": WeatherWidget,
    "sea-habitat": SeaHabitat,
  },
  computed: {

  }
}
</script>

<style scoped>
#haul-info {
  font-size: 12px;
}

#haul-info>div {
  padding: 1.5rem !important;
}

.rowEl {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.lightBlue {
  background: var(--lightBlue);
  color: white;
  text-shadow: 0 0 4px black;
}

.darkBlue {
  background: var(--darkBlue);
  color: white;
  text-shadow: 0 0 4px black;
}

.haulSelectorContainer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.buttonInPanel:hover {
  background-color: var(--blue);
}

.rotate0 {
  rotate: 0deg;
  transition: all 0.7s ease-in-out;
}

.rotate180 {
  rotate: 180deg;
  transition: all 0.7s ease-in-out;
}

.tableContainer {
  margin: 20px;
  padding: 20px;
  background: var(--blue);
  border-radius: 20px;

  max-height: 500px;
  overflow: auto;

  direction: rtl;
  /* Switches the scroll-bar to the right*/
}

table {
  width: 100%;
}

.tableHeader {
  text-align: center;
}

.tableRow {
  text-align: center;
  text-wrap: none;
}

.oddRow {
  background: linear-gradient(to right, transparent 0%, rgb(40 139 186) 10%, rgb(40 139 186) 90%, transparent 100%);
}

/* .evenRow {

} */

.tableCell>div {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-wrap: nowrap;
}

.selectedRow {
  background: var(--red);
}

select {
  border-radius: 10px;
  width: 350px;
  text-align: center;
  font-size: 0.95rem;
}

.dropdown-content {
  background-color: var(--darkBlue);
  min-width: 60px;
  width: fit-content;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.5);
  border-radius: 20%;

  display: flex;
  flex-direction: column;
}

.dropdown-content>button {
  text-decoration: none;
  display: block;
  margin: 0px;
}

.isVisibleInMobile {
  display: none;
}

@media screen and (max-width: 770px) {
  .isVisibleInMobile {
    display: block;
  }
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