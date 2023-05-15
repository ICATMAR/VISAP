<template>
    <div id="app-map">
      <!-- LAYOUT -->
      <!-- OL map -->
      <div id="map" ref="OLMap" :class="isMinimized ? 'miniMap' : ''"></div>

      <!-- Time Range Bar -->
      <time-range-bar v-show="!isMinimized" ref="timeRangeBar" id="time-range-bar" 
        @changeSelDates="onTimeRangeChange($event)" 
        @changeLimits="onTimeRangeChangeLimits($event)">
      </time-range-bar>
      

      <!-- Tracks on the timeline -->
      <tracks-timeline v-show="!isMinimized" ref="tracksTimeLine" style="bottom: 120px; position: relative; z-index: 2"></tracks-timeline>


      <!-- OVERLAYS -->
      <!-- Progress bar load tiles -->
      <div v-show="!progress.isLoaded" class="position-absolute m-0 btn-dark" style="width: 100%; height: 10px; opacity: 0.8; top:0" :style="{'max-width': progress.progressPercent + '%'}">
        <div class="spinner-border text-dark" style="position: relative; margin-top: 20px; margin-left: 20px" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Progress bar load WMS tiles -->
      <div v-show="!wmsProgress.isLoaded" class="position-absolute m-0 btn-dark" style="background: var(--blue); width: 100%; height: 5px; opacity: 0.8; top:0px" :style="{'max-width': wmsProgress.progressPercent + '%'}">
        <div class="spinner-border" style="position: relative; margin-top: 20px; margin-left: 40px; color:var(--blue)" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Resize button -->
      <div class="icon-str fa" style="position: absolute; top: 10px; left: 40px" @click="maximizeMap" v-show="isMinimized">&#xf065;</div>


    </div>
</template>











<script>
import TimeRangeBar from "Components/Map/TimeRangeBar.vue";
import TracksTimeLine from "Components/Map/TracksTimeLine.vue";

export default {
  name: 'app-map',
  created (){
    // Declare non-reactive variables
    this.map= undefined;
    this.baseLayerSources = {
      'Bathymetry' : new ol.source.XYZ ({ // https://openlayers.org/en/latest/examples/xyz.html
        url: 'https://tiles.emodnet-bathymetry.eu/2020/baselayer/web_mercator/{z}/{x}/{y}.png', // https://tiles.emodnet-bathymetry.eu/
        attributions: "© EMODnet Bathymetry Consortium",
        cacheSize: 500,
        crossOrigin: 'anonymous',
      }),
      'OSM': new ol.source.OSM ({ // https://openlayers.org/en/latest/examples/canvas-tiles.html
        cacheSize: 500,
        crossOrigin: 'anonymous',
      }),
      'Imagery': new ol.source.XYZ ({ // https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/0
        url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
        attributions: '© Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
        cacheSize: 500,
        crossOrigin: 'anonymous',
      }),
      'Ocean': new ol.source.XYZ ({ // https://openlayers.org/en/latest/examples/canvas-tiles.html
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}.png',
        attributions: '© Esri, Garmin, GEBCO, NOAA NGDC, and other contributors',
        cacheSize: 500,
        crossOrigin: 'anonymous',
      }),
    },
    this.layers = {
        // Base layers
        baseLayer: new ol.layer.Tile({
          name: 'baseLayer',
          source: this.baseLayerSources['Bathymetry'],
          zIndex: -3,
        }),

        graticule: new ol.layer.Graticule({
          name: 'graticule',
          showLabels: true,
          wrapX: false,
          lonLabelPosition: 1,
          strokeStyle: new ol.style.Stroke({
            color: 'rgba(0,0,0,0.2)',
            width: 2,
            lineDash: [0.5, 4],
          }),
          lonLabelStyle: new ol.style.Text({
            font: '12px Calibri,sans-serif',
            textAlign: 'center',
            textBaseline: 'top',
            fill: new ol.style.Fill({
              color: 'rgba(0,0,0,0.9)',
            }),
            stroke: new ol.style.Stroke({
              color: 'rgba(255,255,255,0.5)',
              width: 3
            })
          }),
          latLabelStyle: new ol.style.Text({
            font: '12px Calibri,sans-serif',
            textAlign: 'end',
            textBaseline: 'top',
            fill: new ol.style.Fill({
              color: 'rgba(0,0,0,0.9)',
            }),
            stroke: new ol.style.Stroke({
              color: 'rgba(255,255,255,0.5)',
              width: 3
            })
          }),
        }),
        shoreline: new ol.layer.VectorTile({
          name: 'shoreline',
          maxZoom: 22,
          source: new ol.source.VectorTile({
            attributions: '© European Environment Agency',
            format: new ol.format.MVT(),
            url: 'data/shoreline-tiles/{z}/{x}/{y}.pbf',
            maxZoom: 10, // Defined in MVT folders
            zDirection: -1
          }),
          style: new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(0,0,0,0.7)',
              width: 1
            })
          }),
        }),
        eez12nm: new ol.layer.VectorTile({
          name: '12nauticmiles',
          maxZoom: 22,
          source: new ol.source.VectorTile({
            attributions: '© Flanders Marine Institute',
            format: new ol.format.MVT(),
            url: 'data/eez_12nm/{z}/{x}/{y}.pbf',
            maxZoom: 9, // Defined in MVT folders
            zDirection: -1
          }),
          style: new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(240,150,150,0.6)',
              width: 1
            })
          }),
        }),

        // Ports
        portsLayer: new ol.layer.Vector({
          source: new ol.source.Vector({
            url: 'data/ports.geojson',
            format: new ol.format.GeoJSON()
          }),
          minZoom: 3,
          //declutter: true,
          style: function(feature, resolution) {
            let name = feature.get('name');
            let paletteColor = palette[name].color || [255,255,255];

            // Text size computation using resolution
            // Min text size: 9
            // Max text size: 16
            let textSize = Math.min(Math.max(16*(1200 - resolution)/900, 9), 16);
              
            
            return new ol.style.Style({
              text: new ol.style.Text({
                text: name,
                font: textSize + 'px Arial, Helvetica, sans-serif',
                textAlign: 'right',
                offsetX: -10,
                fill: new ol.style.Fill({
                  color: 'rgba(0,0,0,0.9)',
                }),
                stroke: new ol.style.Stroke({
                  color: 'rgba('+paletteColor.toString()+', 0.3)',//'rgba(255,255,255,0.5)',
                  width: 3
                })
              }),
              image: new ol.style.Circle({
                radius: 5,
                //fill: new ol.style.Fill({color: 'rgba(255,255,255,0.6)'}),
                fill: new ol.style.Fill({color: 'rgba('+paletteColor.toString()+', 0.6)'}),
                stroke: new ol.style.Stroke({color: 'rgba(0,0,0,0.8)', width: 1})
              })
            })


          },
        }),

        // Clima data (weather and sea)
        data: new ol.layer.Tile({
          name: 'data',
          zIndex: -2,
        }),
        // Fishing effort
        fishingEffort: new ol.layer.Image({
          name: 'fishingEffort',
          source: new ol.source.ImageStatic({
            url: 'data/fishingEffort/fishingEffortExample_m1_39_6_44.png',
            imageExtent: [-1, 39, 6, 44],
            projection: 'EPSG:4326'
          }),
          zIndex: -1,
          opacity: 0.8,
        }),
        // Sea habitats
        //seaHabitats: new ol.layer.Tile({
        seaHabitats: new ol.layer.Image({
          name: 'seaHabitats',
          // source: new ol.source.TileWMS({
          //   url: 'https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms',
          //   params: {
          //     'LAYERS': 'eusm2021_eunis2019_group',
          //     'TILED': 'TRUE',
          //   },
          //   crossOrigin: 'anonymous',
          // }),
          
          source: new ol.source.ImageStatic({
            // https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fpng8&TRANSPARENT=true&LAYERS=eusm2021_eunis2019_group&TILED=TRUE&WIDTH=2048&HEIGHT=2048&CRS=EPSG%3A3857&STYLES=&BBOX=0.0%2C4836921.25%2C556597.45%2C5311971.85
            url: 'data/SeaHabitats_0_39.8_5_43.png',
            //imageExtent: [0, 39.8, 5, 43],
            //projection: 'EPSG:4326'
            imageExtent: [0.0, 4836921.25, 556597.45, 5311971.85],
            projection: 'EPSG:3857'
          }),
          zIndex: -2,
          opacity: 0.0
        }),
    };


    this.layerData = undefined;
    this.pixelColor = [0, 0, 0, 0];

    // Load fishing tracks
    // if (window.serverConnection)
    // getTrackLines('http://localhost:8080/trackLines', 'data/trackLines.json');
    // getTrackLines('data/trackLines.json', undefined);
    this.fishingTracks = new FishingTracks('data/trackLines.json', undefined, this.onLoadTracks);//new TrackLines(address, staticFile, onLoadTracks)
  },
  mounted () {
    this.initMap();
    this.$refs.OLMap.addEventListener('mousemove', this.onMouseMove);

    // EVENTS
    // Base layer
    window.eventBus.on("WidgetMapOptions_BaseLayerClicked", baseLayerName => {
      this.setBaseLayer(baseLayerName);
    });
    // Clima layer
    window.eventBus.on('WidgetWeatherLayers_ClimaLayerChange', infoWMS => {
      this.setClimaLayer(infoWMS);
    });
    // Change clima layer style
    window.eventBus.on('WMSLegend_LegendClicked', style => {
      this.changeStyle(style);
    });
    // Click on track
    window.eventBus.on('TracksTimeLine_trackClicked', this.setSelectedTrack);
    window.eventBus.on('HaulInfo_SelectedTrack', this.setSelectedTrack);
    // Set fishing effort map
    window.eventBus.on('FishingEffort_EffortChanged', this.setEffortMap);
    // Layer visibility
    window.eventBus.on('WidgetMapOptions_setLayerVisible', this.setLayerOpacity);
    window.eventBus.on('FishingEffort_setLayerVisible', this.setLayerOpacity);
    window.eventBus.on('FishingEffort_setTracksVisible', this.setLayerOpacity);
    // Layer opacity
    window.eventBus.on('FishingEffort_setLayerOpacity', this.setEffortLayerOpacity);
    window.eventBus.on('WidgetMapOptions_setLayerOpacity', this.setLayerOpacity);
    // Reactive interface. Map is shown on a corner
    window.eventBus.on('AppMap_isMapMinimized', (isMinimized) => {
      this.isMinimized = isMinimized;
    });
  },
  umounted () {
    this.$refs.OLMap.removeEventListener('mousemove', this.onMouseMove);
    this.map.un('moveend', this.onMapMoveEnd);
    this.map.un('movestart', this.onMapMoveStart); 
  },
  data () {
    return {
      progress: {
        loading: 0,
        loaded: 1
      },
      isLayerDataReady: false,
      // WMS Data layer
      wmsProgress: {
        loading: 0,
        loaded: 1,
        isLoaded: true,
      },
      WMSLegendURL: '',
      isMinimized: false,
    }
  },
  methods: {

    // PRIVATE METHODS
    // Figure clicked (TODO: emit)
    initMap: function () {
      //debugger;
      // Initialize map
      this.map = new ol.Map({
        layers : [
          // Data layer
          this.layers.data,
          // Base layer
          this.layers.baseLayer,
          //this.layers.bathymetry,
          // Graticule layer
          this.layers.graticule,
          // 12 nm
          this.layers.eez12nm,
          // Shoreline
          this.layers.shoreline,
          
          // Ports
          this.layers.portsLayer,
          // Fishing effort
          this.layers.fishingEffort,
          // Sea habitats
          this.layers.seaHabitats
        ],
        target: 'map',
        //controls: ol.control.defaults({ attributionOptions: { collapsible: true } }),
        view: new ol.View({
          center: ol.proj.fromLonLat([3,41.5]),
          zoom: 7.5,
          maxZoom: 22,
          extent: ol.proj.fromLonLat([-28,20]).concat(ol.proj.fromLonLat([40, 50]))
        }),
      });
      // Set css
      document.getElementsByClassName('ol-attribution')[0].style.bottom = 'auto';
      document.getElementsByClassName('ol-attribution')[0].style.top = '.5em';

      // Declare onmapmove events
      this.map.on('moveend', this.onMapMoveEnd);
      this.map.on('movestart', this.onMapMoveStart);

      // Declare interactions
      // Interaction (tracks clicked)
      const selectInteraction = new ol.interaction.Select({style: null});
      selectInteraction.on('select', (e) => {
        // Nothing clicked
        if (e.selected[0] === undefined)
          return false;
        // Track line is cliked
        if (e.selected[0].getProperties().featType == "trackLine"){
          let id = e.selected[0].getProperties().id;
          this.setSelectedTrack(id);
          // Emit event
          window.eventBus.emit('Map_trackClicked', id);
        }
        // Port is clicked
        // else if (e.selected[0].getProperties().featType == "port") {
        //   portClicked(e);
        // }
      });

      // Add interaction to map
      this.map.addInteraction(selectInteraction);

      // Map single click
      // this.map.on('singleclick',  (evt) => {
      //   //document.getElementById('info').innerHTML = '';
      //   debugger;
      //   let view = this.map.getView();
      //   const viewResolution = view.getResolution();
      //   const url = this.layers.seaHabitats.getSource().getFeatureInfoUrl(
      //     evt.coordinate,
      //     viewResolution,
      //     'EPSG:3857',
      //     {'INFO_FORMAT': 'text/html'}
      //   );
      //   if (url) {
      //     fetch(url)
      //       .then((response) => response.text())
      //       .then((html) => {
      //         console.log(html);
      //         //document.getElementById('info').innerHTML = html;
      //       });
      //   }
      // });
      
      // Register tile load progress
      Object.keys(this.baseLayerSources).forEach(key => {
        let blSource = this.baseLayerSources[key];
        this.registerLoadTilesEvents(blSource);
      });
      // Tile load for sea habitats
      this.registerLoadTilesEvents(this.layers.seaHabitats);
    },


    // Get layer function
    getMapLayer: function(layerName){
      let selLayer = undefined;
      this.map.getLayers().forEach(layerItem => {
        //console.log(layerItem.get('name'));
        if (layerItem.get('name') == layerName)
          selLayer = layerItem;
      })
      return selLayer;
    },
  




    // INTERNAL EVENTS
    // Change the styles (WMSLegend.vue emit)
    changeStyle: function(newStyle){
      // Get params
      let params = this.getMapLayer('data').getSource().getParams();
      // Check if the new style is the current
      if (params.STYLES == newStyle)
        return;
      // If style is different, update source
      params.STYLES = newStyle;
      // Set params
      this.getMapLayer('data').getSource().updateParams(params);
      // Source needs to reload
      this.isLayerDataReady = false;
      // Update ForecastBar if it exists
      // this.$emit('changeWMSStyle', newStyle);
    },

    // Mouse move on map
    onMouseMove: function(event){
      // Return if map is moving
      if (this.isMapMoving)
        return;
      // Get lat long coordinates
      let coord = this.map.getCoordinateFromPixel([event.clientX, event.clientY]);
      coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
      // Emit
      window.eventBus.emit('Map_mouseMove', coord);
      // Change legend tooltip value
      if (this.isLayerDataReady){
        let color = this.getDataAtPixel(event.clientX, event.clientY);
        window.eventBus.emit('Map_MouseOnData_WMSColor', color);
      }
      
    },

    // Map moves
    onMapMoveEnd: function(){
      // If data is loaded, update the pixel information once the map move finishes
      // TODO: this could be optimized --> get a canvas with all data and relate lat-long to that canvas 
      if (this.isLayerDataReady && this.isMapMoving){
        this.isMapMoving = false;
        this.updateSourceData();
      }
      this.isMapMoving = false;
    },
    onMapMoveStart: function(){
      this.isMapMoving = true;
    },


    // Declare loading tile events
    registerLoadTilesEvents: function(source, progress){
      // Source is a ol.source
      progress = progress || this.progress;
      progress.loading = 0;
      progress.loaded = 0;
      progress.isLoaded = false;
      progress.progressPercent = 0;

      source.on('tileloadstart',() => {
        progress.loading += 1;
        progress.isLoaded = false;
      });
      source.on('tileloadend', (s) => {
        progress.loaded += 1;
        progress.progressPercent = 100*progress.loaded/progress.loading;
        if (progress.loading == progress.loaded){
          this.onTilesLoaded(s); // TODO: could reference the isLayerDataReady to source, so we control if a source is ready
          progress.isLoaded = true;
        }
      });
      source.on('tileloaderror', () => {
        progress.loaded += 1;
        progress.progressPercent = 100*progress.loaded/progress.loading;
        if (progress.loading == progress.loaded){
          this.onTilesLoaded(); // TODO: could reference the isLayerDataReady to source, so we control if a source is ready
          progress.isLoaded = true;
        }
      });
    },


    // Store pixel information once tiles are loaded
    onTilesLoaded: function(e){
      if (e.target.name == 'wmsSource'){
        this.isLayerDataReady = true;
        this.updateSourceData();
      }
    },

    // Update the data pixels
    // This function can be called consecutively and as it is async, it can happen that all the layers are hidden.
    // To solve it, we need to keep the state when it is being rendered.
    updateSourceData: async function(){
      
      let map = this.map;

      // Reset array if it was rendered and store visible layers
      if (!this.isRendering){
        this.isRendering = true;

        this.visibilityArray = [];
        // Store visible layers state
        map.getLayers().forEach(ll => {
          this.visibilityArray.push(ll.getVisible());
        });
      }

      // Wait 800 ms
      await new Promise(res => setTimeout(res, 800));

      this.isRendering = true;

      // Hide all layers but the data layer
      map.getLayers().forEach(ll => {
          if (ll.C.name != "data")
            ll.setVisible(false);
        });
      
      // Force map render
      map.renderSync();

      // Get ol layer
      let layer = this.getMapLayer('data');
      // If layer was hidden by the user during the delay
      if (layer == undefined){
        this.isRendering = false;
        this.isLayerDataReady = false;
        // Restore map
        map.getLayers().forEach((ll, i) => {
          ll.setVisible(this.visibilityArray[i]);
        });
        return;
      }
      // Get canvas
      let tmpCnv = layer.getRenderer().getImage();
      // document.body.appendChild(tmpCnv); // Debug, Test the data
      
      // Get data
      this.layerData = tmpCnv.getContext("2d").getImageData(0,0,tmpCnv.width,tmpCnv.height);
      // Store width to access pixels
      this.layerDataWidth = tmpCnv.width;

      // Restore map
      map.getLayers().forEach((ll, i) => {
        ll.setVisible(this.visibilityArray[i]);
      });
      map.renderSync();
      
      this.isRendering = false;

    },


    // Get pixel data
    getDataAtPixel: function(x , y){
      let imgArrayPos = (x + y * this.layerDataWidth) * 4; // + 1,2,3 if you want (R)GBA
      let imgData = this.layerData.data;
      let color = this.pixelColor;
      color[0] = imgData[imgArrayPos]
      color[1] = imgData[imgArrayPos+1]
      color[2] = imgData[imgArrayPos+2]
      color[3] = imgData[imgArrayPos+3];
      return color;
    },


    // The time range has changed. Update the track lines
    onTimeRangeChange: function(dates){
      // Set starting and ending dates in fishing tracks
      this.fishingTracks.setStartEndDates(dates[0], dates[1]);
    },
     // The timeline has changed. Update the track lines
    onTimeRangeChangeLimits: function(dates){
      // Set starting and ending dates of tracks-timeline
      if (this.$refs.tracksTimeLine)
        this.$refs.tracksTimeLine.setStartEndDates(dates[0], dates[1]);
    },
    
    // Maximize map (only when map is minimized)
    maximizeMap: function(e){
      this.isMinimized = false;
      window.eventBus.emit('Map_CloseSidePanel');
    },







    // PUBLIC METHODS
    // Update WMS data source. This function is called from AppManager.vue
    updateSourceWMS: function (infoWMS){
      // Create tile grid for faster rendering for low resolution WMS
      let extent = ol.proj.get('EPSG:3857').getExtent();
      let tileSize = 512;
      let maxResolution = ol.extent.getWidth(extent) / tileSize;
      let resolutions = new Array(6);
      for (let i = 0; i < resolutions.length; i++){
        resolutions[i] = maxResolution / Math.pow(2,i);
      }
      // Assign to openlayers WMS tile source
      infoWMS.tileGrid = new ol.tilegrid.TileGrid({
        extent: extent,
        resolutions: resolutions,
        tileSize: tileSize
      });
      
      // Avoid cross origin problems when getting pixel data (The canvas has been tainted by cross-origin data.)
      infoWMS.crossOrigin='anonymous';
      infoWMS.cacheSize = 500;

      // Create OL source from ForecastBar.vue object
      let source = new ol.source.TileWMS(infoWMS);
      source.name="wmsSource";
      this.getMapLayer('data').setSource(source);
      // Tracking the load progress
      this.isLayerDataReady = false;
      this.registerLoadTilesEvents(source, this.wmsProgress);
      
      // Update legend
      // if (this.$refs.legendWMS)
      //   this.$refs.legendWMS.setWMSLegend(infoWMS);
      // if (this.WMSLegendURL != undefined){
      //   let url = source.getLegendUrl(this.map.getView().getResolution()) + '&TRANSPARENT=TRUE';
      //   url += '&PALETTE=' + infoWMS.params.STYLES.split('/')[1];
      //   url += '&COLORSCALERANGE=' + infoWMS.params.COLORSCALERANGE;
      //   this.WMSLegendURL = url;

        

      //   //https://nrt.cmems-du.eu/thredds/wms/med-cmcc-sal-an-fc-d?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&LAYER=so&SCALE=2544411.053285503&TRANSPARENT=TRUE
      // }
    },

    
    // HIDDEN BECAUSE: it is not as simple as updating the date. Each data type has two WMS services associated sometimes (reanalysis and forecast).
    //                 Depending on the date one or the other service will be used. Additionally, the date in Layers panel need to change, thus the connection
    //                  between Map.vue and LayerPanel.vue has to be made anyway.
    // Update the date of the WMS source
    // updateWMSDate: function(date){ // yyyy-mm-dd
    //   // Get data layer
    //   let dataLayer = this.getMapLayer('data');
    //   if (dataLayer == undefined) // No data layer is present
    //     return;
        
    //   let wmsSource = dataLayer.getSource();
    //   if (wmsSource == null) // No source yet
    //     return;
    //   // Get parameters and modify them
    //   debugger;
    //   let params = wmsSource.getParams();
    //   // TODO: We are adding yyyy-mm-dd with Thh:mm:ss:mmm. It can be that the hours/minutes change depending on the WMS service and the date. Be careful
    //   params.TIME = date + params.TIME.substring(10);
    //   // Use params.TIME to change from reanalysis to forecast and viceversa
    //   let dataTypes = preLoadedDataTypes;
    //   debugger;
      
    //   wmsSource.updateParams(params);
    //   // TODO: not as simple as that, because it can switch from reanalysis to forecast.

    // },

    
    // Get OL map object
    getOLMap: function(){
      return this.map;
    },

    // Receive selected track and show it
    // This event can come from HaulInfo.vue or TracksTimeLine
    setSelectedTrack: function(id){
      
      // If id is undefined, it hides the selected mark
      if (this.$refs.tracksTimeLine){
        if (id == undefined)
          this.$refs.tracksTimeLine.hideSelectedTrack(id);
        else{
          this.$refs.tracksTimeLine.showSelectedTrack(id);
        }
      }

      // Center timeline
      let feature = FishingTracks.getFeatureById(id);
      if (this.$refs['timeRangeBar']){
        let trackDate = new Date(feature.properties.info.Date);
        this.$refs['timeRangeBar'].centerOnDate(trackDate);
      }

      // Center map to track
      let view = this.map.getView();
      let coord = [...feature.geometry.coordinates[0]];
      let currentZoom = view.getZoom();
      let longCorrection = 0;//currentZoom > 11 ? 0.1 : 0.3;
      view.animate({
        center: ol.proj.fromLonLat([coord[0] + longCorrection, coord[1]]),
        zoom: Math.max(9.5, currentZoom),
        duration: 1000,
      });

      // Update map style
      FishingTracks.setSelectedTrack(id);
      this.fishingTracks.updateStyle();
      
    },

    setEffortLayerOpacity: function(opacity){
      let effortLayer = this.getMapLayer('fishingEffort');
      effortLayer.setOpacity(parseFloat(opacity));
    },
    setEffortMap: function(inUrl){
      let effortLayer = this.getMapLayer('fishingEffort');
      // let olSource = effortLayer.getSource(); // setUrl does not exists for ol.Layer.Image
      let source = new ol.source.ImageStatic({
        url: inUrl, // 'data/fishingEffort/fishingEffort_<effortType>_<year>_<gear>'
        imageExtent: [-1, 39, 6, 44],
        projection: 'EPSG:4326'
      });
      // Assign new source to layer
      effortLayer.setSource(source);
    },

    setBaseLayer: function(baseLayerName){
      let source = this.baseLayerSources[baseLayerName];
      if (source == undefined){
        console.error('Base layer name does not exist in array of base layers: ' + baseLayerName);
        return;
      }

      let baseLayer = this.getMapLayer('baseLayer');
      baseLayer.setSource(source);
    },
    setLayerOpacity: function(params){
      let layerName = params[0];
      let opacity = params[1] * 1; // (* 1 turns boolean into a number)
      // Get layer
      let layer = this.getMapLayer(layerName);
      if (layer == undefined){
        console.log(layerName + ' does not exist. Wrong layer name. Cannot set opacity.');
        return;
      }
      // Set opacity
      layer.setOpacity(parseFloat(opacity));
    },
    setClimaLayer: function(urlParams){
      let climaLayer = this.getMapLayer('data');
      if (urlParams == undefined){
        // Remove clima layer
        if (climaLayer != undefined)
          this.map.removeLayer(climaLayer);
        // Remove legend url
        this.WMSLegendURL = '';
        
        return;
      }
      // Add layer if it is not included
      if (climaLayer == undefined)
        this.map.addLayer(this.layers.data);
      // Update parameters
      this.updateSourceWMS(urlParams);
      
    },




    // Panel was open or closed by clicking a tab
    onTabClicked: function(){
      if (this.$refs['timeRangeBar']){
        this.$refs['timeRangeBar'].onTabOpenClose();
      }
    },




    // CALLBACKS
    // Once the fishing tracks have been loaded
    onLoadTracks: function(){
      // Add to layer
      this.map.addLayer(this.fishingTracks.getLayer());
      // TODO;
      // Update start and end dates
      // Get start and end from timerange
      //this.fishingTracks.setStartEndDates(); // Set starting and ending dates in fishing tracks
      
      // Track lines overlay
      //let gjson = this.fishingTracks.getGeoJSON();
      let gjson = FishingTracks.getGeoJSON();
      if (this.$refs.tracksTimeLine){
        this.$refs.tracksTimeLine.setFeatures(gjson.features);
      }

      // Emit geojson loaded
      window.eventBus.emit('Map_TracksLoaded', gjson);
      
      // OPTIONS:
      // PAINT IN A CANVAS -> TRANSFORM TO IMAGE -> MAKE IMAGE AS BACKGROUND OF TIMERANGE
      // OVERLAY, BUT BELOW TIMERANGE?
      // CREATE A VUE OVERLAY INSIDE TIMERANGE?
    },


  },
  components: {
    "time-range-bar": TimeRangeBar,
    "tracks-timeline": TracksTimeLine,
    //"wms-legend": WMSLegend
  },
  computed: {
      //foo: function () {}
  }
}
</script>











<style scoped>

#map {
  background: #a0d7f2;
  width: 100%;
  height: calc(100% - 90px);
  height: -webkit-calc(100% - 90px); 
  height:    -moz-calc(100% - 90px); 
  height:      -o-calc(100% - 90px);
}

.miniMap {
  width: 100%;
  height: 100% !important;
  box-shadow: 0px 0px 4px black;
}


#time-range-bar {
  background:white;
  bottom: 0; 
  height: 90px; 
  width: 100%;
}

#wmsLegend {
  top: 300px; 
  left: 15px;
  position: absolute; 
  z-index: 2;
  box-shadow: 0 0 4px black;
  background: #527db3cf;
  padding: 10px;
  max-height: 200px;
}

</style>