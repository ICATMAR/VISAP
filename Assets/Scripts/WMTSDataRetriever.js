// import preLoadedDataTypes from "/CasablancaBuoy/Assets/Scripts/WMTSDataTypes.js";

// Scripts that obtain data from the CMEMS WMTS API
// https://help.marine.copernicus.eu/en/articles/6478168-how-to-use-wmts-to-visualize-data#h_2523403b15

// Examples
// https://wmts.marine.copernicus.eu/teroWmts/?service=WMTS&version=1.0.0&request=GetTile&tilematrixset=EPSG:4326&style=range:0/6,cmap:gray&tilematrix=5&tilerow=8&tilecol=32&layer=MEDSEA_MULTIYEAR_WAV_006_012/med-hcmr-wav-rean-h_202105/VHM0&time=2025-04-30T09:00:00.000Z
// https://wmts.marine.copernicus.eu/teroWmts/?service=WMTS&version=1.0.0&request=GetTile&tilematrixset=EPSG:3857&style=range:0/6,cmap:gray&tilematrix=6&tilerow=23&tilecol=32&layer=MEDSEA_ANALYSISFORECAST_WAV_006_017/cmems_mod_med_wav_anfc_4.2km_PT1H-i_202311/VHM0&time=2024-04-30T09:00:00.000Z

export class WMTSDataRetriever {

  // Requests - keep track of what is requested
  activeRequests = [];
  // Store GetCapabilities XML per product
  productsXML = {};

  products = {
    "Mediterranean Sea Waves Reanalysis": {
      /*
        Available datasets
        VPED, VTPK
        VHM0, VHM0_SW1, VHM0_SW2, VHM0_WW
        VMDR, VMDR_SW1, VMDR_SW2, VMDR_WW
        VSDX, VSDY
        VTM01_SW1, VTM01_SW2, VTM01_WW, VTM02
        VTM10
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_WAV_006_012/med-hcmr-wav-rean-h_202105?request=GetCapabilities&service=WMS',
      doi: "https://doi.org/10.25423/cmcc/medsea_multiyear_wav_006_012",
      timeScales: ['h'],
      dataSets: ['VHM0', 'VHM0_WW', 'VHM0_SW1', 'VHM0_SW2',
                'VTM02', 'VTM01_WW', 'VTM01_SW1', 'VTM01_SW2',
                'VMDR', 'VMDR_WW', 'VMDR_SW1', 'VMDR_SW2'],
    },
    "Mediterranean Sea Waves Analysis and Forecast": {
      // https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_WAV_006_017?request=GetCapabilities&service=WMS
      /*
      Available datasets
      VCMX, VMXL, VPED, VTPK
      VHM0, VHM0_SW1, VHM0_SW2, VHM0_WW
      VMDR, VMDR_SW1, VMDR_SW2, VMDR_WW
      VSDX, VSDY
      VTM01_SW1, VTM01_SW2 ,VTM01_WW ,VTM02
      VTM10
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_WAV_006_017?request=GetCapabilities&service=WMS',
      doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_wav_006_017_medwam4',
      timeScales: ['h'],
      dataSets: ['VHM0', 'VHM0_WW', 'VHM0_SW1', 'VHM0_SW2',
                'VTM02', 'VTM01_WW', 'VTM01_SW1', 'VTM01_SW2',
                'VMDR', 'VMDR_WW', 'VMDR_SW1', 'VMDR_SW2'],
    },
    "Mediterranean Sea Physics Reanalysis": {
      /*
      Available datasets 
        uo, vo, wo - Current
        so, - Salinity
        zos - Sea Surface Height
        thetao, bottomT - Potential temperature
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_PHY_006_004?request=GetCapabilities&service=WMS',
      doi: 'https://doi.org/10.25423/CMCC/MEDSEA_MULTIYEAR_PHY_006_004_E3R1I',
      timeScales: ['h', 'd', 'm'],
      dataSets: ['uo', 'vo', 'wo', 'so', 'thetao', 'bottomT']
    },
    "Mediterranean Sea Physics Analysis and Forecast": {
      /*
      Available datasets 
        uo, vo, wo - Current
        so, - Salinity
        zos - Sea Surface Height
        thetao, bottomT - Potential temperature
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_PHY_006_013?request=GetCapabilities&service=WMS',
      doi: 'https://doi.org/10.25423/CMCC/MEDSEA_ANALYSISFORECAST_PHY_006_013_EAS8',
      timeScales: ['h', 'd', 'm'],
      dataSets: ['uo', 'vo', 'wo', 'so', 'thetao', 'bottomT']
    },
    "Mediterranean Sea Biogechemistry Reanalysis": {
      /*
      Available datasets 
        nppv, o2 - Primary Production and Oxygen
        dissic, ph, talk - Dissolved Inorganic Carbon, pH and Alkalinity
        fpco2, spco2 - Surface CO2 flux and Surface partial pressure of CO2
        nh4, no3, po4 - Ammonium, Nitrate and Phosphate
        chl, phyc - Phytoplankton Carbon Biomass and Chlorophyll
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_MULTIYEAR_BGC_006_008?request=GetCapabilities&service=WMS',
      doi: 'https://doi.org/10.25423/cmcc/medsea_multiyear_bgc_006_008_medbfm3',
      timeScales: ['d', 'm'],
      dataSets: ['chl']
    },
    "Mediterranean Sea Biogechemistry Analysis and Forecast": {
      /*
      Available datasets
        diatoC, diatoChla - Diatoms Carbon Biomass and Diatoms Chlorophyll concentration
        dinoC, dinoChla - Dinoflagellates Carbon Biomass and Dinoflagellates Chlorophyll concentration
        nanoC, nanoChla - Nanophytoplankton Carbon Biomass  and Nanophytoplankton Chlorophyll concentration
        nppv, o2 - Primary Production and Oxygen
        dissic, ph, talk - Dissolved Inorganic Carbon, pH and Alkalinity
        fpco2, spco2 - Surface CO2 flux and Surface partial pressure of CO2
        nh4, no3, po4, si - Ammonium, Nitrate, Phosphate and Silicate
        kd490 - Diffuse attenuation coefficient of the downwelling irradiance at 490 nm
        picoC, picoChla - Picophytoplankton Carbon Biomass and Picophytoplankton Chlorophyll concentration
        zooc - Zooplankton Carbon Biomass
        phyc, chl - Phytoplankton Carbon Biomass,  and Chlorophyll
      */
      wmtsURL: 'https://wmts.marine.copernicus.eu/teroWmts/MEDSEA_ANALYSISFORECAST_BGC_006_014?request=GetCapabilities&service=WMS',
      doi: 'https://doi.org/10.25423/cmcc/medsea_analysisforecast_bgc_006_014_medbfm4',
      timeScales: ['d', 'm'],
      dataSets: ['chl']
    },
  };

  // Custom dataType definitions
  // One could use standard dictionaries / vocabularies?
  // These are useful for the interface, UI
  customDefinitions = {
    'VHM0': {
      shortName: 'Wave height',
      altNames: ['Hs', 'Hm0', 'Wave significant height', 'Spectral significant wave height (Hm0)'],
      range: [0,12],
      animation: {
        layerNames: ['VHM0', 'VMDR'], // Intensity, Angle
        format: 'value_angle',
        type: 'wave'
      },
    },
    'VTM02': {
      shortName: 'Wave period',
      range: [0, 18],
    },
    'VTM01_WW': {
      shortName: 'Wave period',
      range: [0, 18],
    },
    'VTM01_SW1': {
      shortName: 'Wave period',
      range: [0, 18],
    },
    'VTM01_SW2': {
      shortName: 'Wave period',
      range: [0, 18],
    },
    'VHM0_WW': {// Wind wave height
      shortName: 'Wind wave height',
      altNames: ['Wind wave significant height', "Spectral significant wind wave height", 'Wind waves', 'WWSH'],
      range: [0,12],
      animation: {
        layerNames: ['VHM0_WW', 'VMDR_WW'], // Intensity, Angle
        format: 'value_angle',
        type: 'whiteWave'
      },
    },
    'VMDR': {
      shortName: 'Wave direction',
      altNames: ['Mean wave direction', 'MDIR'],
      unit: 'º',
      range: [0, 360],
    },

    'VHM0_SW1': { // Swell 1 wave height
      range: [0, 12],
      altNames: ["Primary swell wave significant height"],
      animation: {
        layerNames: ['VHM0_SW1', 'VMDR_SW1'], // Intensity, Angle
        format: 'value_angle',
        type: 'wave'
      },
    },
    'VHM0_SW2': { // Swell 2 wave height
      range: [0, 12],
      altNames: ["Secondary swell wave significant height"],
      animation: {
        layerNames: ['VHM0_SW2', 'VMDR_SW2'], // Intensity, Angle
        format: 'value_angle',
        type: 'wave'
      },
    },
    'uo': {
      range: [0, 2.5],
      unit: 'm/s',
    },
    'vo': {
      range: [0, 2.5],
      unit: 'm/s',
    },
    'wo': {
      range: [0, 1.5],
      unit: 'm/s',
    },
    'thetao': {
      shortName: 'Surface temperature',
      altNames: ['Sea surface temperature'],
      range: [2, 38],
      unit: 'ºC',
    },
    'bottomT': {
      range: [2, 38],
      shortName: 'Bottom temperature',
      altNames: ['Sea bottom temperature'],
      unit: 'ºC'
    },
    'so': {
      shortName: 'Salinity',
      range: [32, 41],
      unit: '‰',
    },
    'chl': {
      shortName: 'Chlorophyll',
      range: [0.01, 0.3],
      unit: 'mg/m³',
    }
  }



  dataSets = [];
  




  // CONSTRUCTOR
  constructor(onLoadCallback, verbose){
    // Verbose
    if (verbose){
      this.printLog = this.printLogConsole;
      this.printWarn = this.printWarnConsole;
    } else { // Empty callable function
      this.printLog = ()=> {};
      this.printWarn = ()=> {};
    }
    

    // Load WMTS
    // Loading control
    let loading = 0;
    let loaded = 0;
    // Iterate data types
    Object.keys(this.products).forEach(productKey => {
      let product = this.products[productKey];
      product.name = productKey;

      // Get Capabilities
      loading++;
      this.loadWMTSProduct(product)
        .then(() => {
          this.printLog(this.dataSets);
          // Callback when all capabilities have been loaded
          loaded++;
          this.printLog("Total left to load: " + (loading - loaded));

          // All products loaded
          if (loading - loaded == 0){
            if (onLoadCallback)
              onLoadCallback()
          }
        });
    });

  }






  // Fetch the WMS capabilities and assign to dataSet
  loadWMTSProduct = async function(product){
    
    // Fetch
    let rawText = await fetch(product.wmtsURL).then(r => r.text());
    let parser = new DOMParser();
    let rawXML = parser.parseFromString(rawText, 'application/xml');
    product.xml = rawXML;
    // Show available layers
    this.printLog('------------- New product loaded-----------\nAvailable products:');
    rawXML.querySelectorAll('Layer').forEach(ll => {
      this.printLog(ll.querySelector('Name').textContent);
    });

    // Iterate available datasets and compare to selected datasets from product
    rawXML.querySelectorAll('Layer').forEach(ll => {
      let id = ll.querySelector('Id').textContent;
      // Get custom dataSet definitions
      let custDef = this.customDefinitions[id] || {};
      // Copy properties to dataSet object
      let dataSet = JSON.parse(JSON.stringify(custDef));
      // Assign properties from WMTS or from custom definitions
      dataSet.id = id;
      if (!product.dataSets.includes(dataSet.id)) {
        return;
      }
      dataSet.name = ll.querySelector('Name').textContent;
      dataSet.unit = dataSet.unit || ll.querySelector('Unit').textContent;
      if (dataSet.unit == 'degree'){ dataSet.unit = 'º'; dataSet.range = [0, 360]; }
      // Assign product properties
      dataSet.doi = product.doi;
      dataSet.productName = product.name;
      dataSet.productProvider = product.xml.getElementsByTagNameNS("http://www.opengis.net/ows/1.1", "ProviderName")[0].textContent;
      // Dataset template
      dataSet.template = ll.querySelector('ResourceURL').attributes.template.textContent;
      if (dataSet.template.includes('http://')){
        dataSet.template = dataSet.template.replace('http://', 'https://'); // WARN: BUG FROM WMTS?
      }
      // Add date to template
      dataSet.template += '&time={Time}';
      // Add style range and color map
      if (dataSet.range == undefined)
        debugger;
      dataSet.template = dataSet.template.replace('{Style}', 'range:'+ dataSet.range[0] +'/'+ dataSet.range[1] +',cmap:gray');

      // Find if the product belongs to a time scale
      // Iterate through Dimensions (elevation, time)
      ll.querySelectorAll("Dimension").forEach(dd => {
        // Elevation
        if (dd.getElementsByTagName("ows:Identifier")[0].textContent == "elevation") {
          // Get elevation values
          let values = dd.querySelectorAll("Value");
          if (values.length > 1) {
            let elevationArray = [];
            values.forEach(vv => {
              elevationArray.push(vv.textContent);
            });
            dataSet.elevation = elevationArray;
          } else if (values[0].textContent != '0'){
            debugger;
          }          
        }
        // Time dimension
        if (dd.getElementsByTagName("ows:Identifier")[0].textContent == "time") {
          // Text content example: '1993-01-01T00:00:00Z/2022-07-31T23:00:00Z/PT1H'
          let values =  dd.querySelectorAll("Value");
          if (values.length == 1){
            let timeStr = values[0].textContent;
            dataSet.startTmst = timeStr.split('/')[0];
            // Only store end time if it is not forecast
            let endTmst = timeStr.split('/')[1];
            if (new Date(endTmst) < new Date())
              dataSet.endTmst = endTmst;
            let timeInterval = timeStr.split('/')[2];
            dataSet.timeScale = timeInterval == 'PT1H' ? 'h' : timeInterval == 'P1D' ? 'd' : '';
            if (dataSet.timeScale == ''){
              this.printLog("Skipped " + dataSet.name + " at " + timeInterval)
            } else {
              // TODO Time scale corrections
              // Hourly (min correction)
              if (dataSet.timeScale == 'h' && endTmst.substring(14, 16) != '00'){
                debugger;
              } else if (dataSet.timeScale == 'd' && (endTmst.substring(14, 16) != '00' || endTmst.substring(11, 13) != '00')){
                debugger;
              }
            }
          } else {
            // Calculate time interval
            let timeDiff = Math.abs(new Date(values[0].textContent).getTime() - new Date(values[1].textContent).getTime()) / (1000*60*60*24);
            // Monthly
            if (timeDiff > 25 && timeDiff < 32)
              dataSet.timeScale = 'm';
            else {
              dataSet.timeScale = '';
              this.printLog("Skipped " + dataSet.name + " at " + timeDiff + " days")
            }
            // Store dates
            dataSet.dates = [];
            values.forEach(vv => {
              dataSet.dates.push(vv.textContent);
            });
            // Sort dates
            dataSet.dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            // Store start and end dates
            dataSet.startTmst = dataSet.dates[0];
            // Only store end time if it is not forecast
            let endTmst = dataSet.dates[dataSet.dates.length - 1];
            if (new Date(endTmst) < new Date())
              dataSet.endTmst = endTmst;
          }
          
        }
      });

      // Store selected dataSets (defined in products variable);
      if (dataSet.timeScale != ''){
        if (product.dataSets.includes(dataSet.id)){
          this.dataSets.push(dataSet);
          this.printLog(dataSet.name +  " at " + dataSet.timeScale);
        }
      }
      
      
    });

  }



  // Get the best dataSet according to the id, timeScale and timestamp
  getDataSet = function(id, timeScale, tmst){
    // No data sets loaded
    if (this.dataSets.length == 0){
      this.printLog("*** --- No dataSets have been loaded");
      return;
    }
    // Get dataSets with the id
    let selDataSets = this.dataSets.filter((dataSet) => dataSet.id == id);
    if (selDataSets.length == 0){
      this.printLog("There are no dataSets with id: " + id);
      return;
    }
    // Get dataSets in the timeScale
    let tScaleDataSets = selDataSets.filter((dataSet) => dataSet.timeScale == timeScale);
    if (tScaleDataSets.length == 0){
      this.printLog("DataSet does not have the timeScale of " + timeScale);
      console.log("DataSet for "+ id + " does not have timeScale of " + timeScale + ". Using alternatives."); //return;
      tScaleDataSets = selDataSets; // Take other timeScales?
    }
    // Select oldest first if possible (usually reanalysis)
    // Sort by date (oldest first)
    tScaleDataSets.sort( (dataSetA, dataSetB) => new Date(dataSetA.startTmst) - new Date(dataSetB.startTmst));
    // Check if tmst is inside range
    let selectedDataSet;
    for (let i = 0; i < tScaleDataSets.length; i++){
      // If no endTmst, it is forecast
      if (tScaleDataSets[i].endTmst == undefined){
        selectedDataSet = tScaleDataSets[i];
        break;
      }
      // tmst is inside range
      if (new Date(tScaleDataSets[i].startTmst) < new Date(tmst) && new Date(tScaleDataSets[i].endTmst) > new Date(tmst)){
        selectedDataSet = tScaleDataSets[i];
        break;
      }
    }
    if (selectedDataSet == undefined){
      this.printLog("No dataSet with id="+ id +" contains the selected timestamp: " + tmst + " at a timeScale of " + timeScale);
    }

    return selectedDataSet;    
  }




  

  // Get the tmst for the WMTS call. Returns undefined if the dataSet does not contain the date
  getFormattedTmst = function(dataSet, tmst){
    // Tmst is before starting date
    // WAITING ON CMEMS RESPONSE --> THE DATES FROM GETCAPABILITIES ARE NOT RIGHT
    if (new Date(tmst) < new Date(dataSet.startTmst)) {
      return;
    }
    let formattedTmst = undefined;
    // Time scale
    let timeScale = dataSet.timeScale;

    // Hourly
    if (timeScale == 'h'){
      formattedTmst = tmst.substring(0,14) + '00:00.000Z';
      // TODO timeScaleCorrection if they exist
    } 
    // Daily
    else if (timeScale == 'd'){
      formattedTmst = tmst.substring(0,11) + '00:00:00.000Z';
    }
    // Monthly
    else if (timeScale == 'm'){
      // Check if the current month is in the dataSet
      for (let i = 0; i < dataSet.dates.length; i++){
        if (dataSet.dates[i].substring(0, 7) == tmst.substring(0,7)){
          formattedTmst = dataSet.dates[i];
          break;
        }
      }
    }

    // Tmst is after end date (forecast does not have an endTmst)
    // WAITING ON CMEMS RESPONSE --> THE DATES FROM GETCAPABILITIES ARE NOT RIGHT
    if (dataSet.endTmst) {
      if (new Date(formattedTmst) > new Date(dataSet.endTmst))
        return;
    }

    return formattedTmst;
  }
  





  // Load image given a dataSet and a timestamp
  getImageAt = function(dataSet, tmst){
    
    // Get formatted timestamp of dataSet and check if it has data available on that tmst
    let formattedTmst = this.getFormattedTmst(dataSet, tmst);

    if (formattedTmst == undefined){
      this.printLog(dataSet.id + " at " + dataSet.timeScale + " does not contain the timespan with timestamp " + tmst);
      return; //document.createElement('span').innerHTML = 'No data for--';
    }

    let templateURL = dataSet.template.replace('{Time}', formattedTmst);

    templateURL = templateURL.replace('{TileMatrixSet}', 'EPSG:3857'); //EPSG:4326, 3857
    templateURL = templateURL.replace('{TileMatrix}', '6');
    templateURL = templateURL.replace('{TileRow}', '23');
    templateURL = templateURL.replace('{TileCol}', '32');

    let img = document.createElement('img');
    img.src = templateURL;
    return img;
  }



  // DataSets can have different names (Hs, Hm0, Significant Wave Height, VHM0...)
  // This helper permits to ask for the dataSet without knowing the specific id
  getDataSetIdFromDataName = function(dataName){
    for (let i = 0; i < this.dataSets.length; i++){
      let dataSet = this.dataSets[i];
      if (dataSet.shortName == dataName)
        return dataSet.id;
      else if (dataSet.id == dataName)
        return dataSet.id;
      else if (dataSet.altNames)
        if (dataSet.altNames.includes(dataName))
          return dataSet.id;
      else if (dataSet.name == dataName)
        return dataSet.id;
    }
  }

  // Get data at a specific point
    // Input variables
    // var dataName = "Sea temperature";
    // var lat = 41;
    // var long = 2.9;
    // var date = '2010-01-12T12:00:00.000Z';
    // var timeScale = 'd';
    //TODO: This will change to GetFeatureInfo in July 2024
  getDataAtPoint = async function(dataName, tmst, lat, long, timeScale, direction){
  
    let id = this.getDataSetIdFromDataName(dataName);
    let dataSet = this.getDataSet(id, timeScale, tmst);
    
    if (dataSet == undefined){
      console.log(dataName);
      console.log(this.dataSets.filter(dt => dt.id == id));
      return; //document.createElement('span').innerHTML = 'No data for ' + dataName + " at " + timeScale + " - req: ";
    }

    // If we want the direction
    if (direction) {
      // Check if direction exists (animation)
      if (dataSet.animation == undefined) {
        console.error("Data set " + dataName + " does not have direction information.");
        return;
      }
    }

    // Get formatted timestamp of dataSet and check if it has data available on that tmst
    let formattedTmst = this.getFormattedTmst(dataSet, tmst);
    if (formattedTmst == undefined){
      console.error(dataSet.id + " at " + dataSet.timeScale + " does not contain the timespan with timestamp " + tmst);
      return;//document.createElement('span').innerHTML = 'No data for--';
    }
    // Construct WMTS url
    let templateURL = dataSet.template.replace('{Time}', formattedTmst);
    // Projection
    templateURL = templateURL.replace('{TileMatrixSet}', 'EPSG:4326'); //EPSG:4326, 3857
    // Tile matrix
    let tileMatrix = 6;
    templateURL = templateURL.replace('{TileMatrix}', tileMatrix);
    // Find tile
    let tileCol = this.lon2tile4326(long, tileMatrix);
    let tileRow = this.lat2tile4326(lat, tileMatrix);
    templateURL = templateURL.replace('{TileCol}', tileCol);
    templateURL = templateURL.replace('{TileRow}', tileRow);


    // If no direction is requested
    if (direction == undefined){
      // Get value from URL
      return await this.getValueAtPointFromURL(templateURL, dataSet.range, long, lat, tileMatrix);//this.getPreciseValueFromURL(templateURL, dataInfo.range);
    }


    // If direction is requested
    let animData = dataSet.animation;
    // Angle format
    if (animData.format == 'value_angle'){
      // Prepare url. Template uses the dataSet id in the layer info
      templateURL = templateURL.replace('/' + dataSet.id + '&', '/' + animData.layerNames[1] + '&');  //url = WMTSDataRetriever.setWMSParameter(url, 'LAYERS', animData.layerNames[1]);
      templateURL = WMTSDataRetriever.setWMTSParameter(templateURL, 'style', 'range:0/360,cmap:gray'); // url = WMTSDataRetriever.setWMSParameter(url, 'COLORSCALERANGE', String([-360,360]));

      // Get value from URL // WARN, could it happen that it has to go from -360 to 360?
      let value = await this.getValueAtPointFromURL(templateURL, [0, 360], long, lat, tileMatrix);//this.getPreciseValueFromURL(url, [-360, 360]);
      //value = 360 - value; // Inverted colormap! Darker is 0, white is 1 ?
      return value;
    } 
    // East-North format
    else if (animData.format == 'east_north'){
      debugger;

      // Calculate angle
      // TODO: could call an async function where east and north are requested at the same time
      return await this.getEastNorthValues(url, animData.layerNames, dataSet.range);
    }

  }



  // Calculate tile row and column
  lon2tile4326 = function(lon, tileMatrix){
    return Math.floor((lon + 180) / 180 * Math.pow(2, tileMatrix));
  }
  lat2tile4326 = function(lat, tileMatrix){
    return Math.floor((90 - lat)/180 * Math.pow(2, tileMatrix));  
  }






  // Returns the value from a WMTS URL
  getValueAtPointFromURL = async function(url, range, lon, lat, tileMatrix, mustBePrecise){
    let img = await this.getTileFromURL(url);
    // Remove image from active requests
    this.activeRequests = this.activeRequests.filter( el => el.src != url); // Memory garbage? TODO?

    // Get normalized value from image according to lat long and tileMatrix
    let value = await this.getNormValueFromImage(img, lon, lat, tileMatrix);
    if (value == undefined) {
      this.printWarn("No data at " + url);
      return;
    }
    // Put in range of the data type (normValue * (max-min) + min)
    value = value * (range[1] - range[0]) + range[0];

    // Get precise value
    if (mustBePrecise){
      let quantStep = (range[1] - range[0]) / 255;
      url = WMTSDataRetriever.setWMTSParameter(url, 'style', 'range:'+ (value - quantStep)+'/'+ (value + quantStep) +',cmap:gray');
      // Get image with very small range
      let imgPrec = await this.getTileFromURL(url);
      // Remove image from active requests
      this.activeRequests = this.activeRequests.filter( el => el.src != url); // Memory garbage? TODO?
      // Get pixel value from small-range image
      let valuePrec = await this.getNormValueFromImage(imgPrec, lon, lat, tileMatrix);
      // Put in range (normValue * (max-min) + min)
      valuePrec = valuePrec * (quantStep * 2) + value - quantStep;
      // Return value
      return valuePrec;
    } 
    // Get quantized value (255 steps of range)
    else {
      return value;
    }
  }



  // Create a canvas with size 1 and extract the pixel value
  getNormValueFromImage = function(img, lon, lat, tileMatrix){
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    // TODO: canvas must have image width and height
    // TODO: get image data should target the pixel index
    
    // TODO: getting the column and row decimals would probably help. There is a smarter way to do this
    let tileCol = this.lon2tile4326(lon, tileMatrix);
    let tileRow = this.lat2tile4326(lat, tileMatrix);
    let tileSize = 180 / Math.pow(2 , tileMatrix);
    // Get index columns
    let lonLeft = tileCol * tileSize - 180;
    let indexCol = ((lon - lonLeft) / tileSize) * canvas.width;
    // Get index rows
    let latTop = 90 - tileRow * tileSize;
    let indexRow = ((latTop - lat) / tileSize) * canvas.height;
    
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0); // Instead of painting the whole image, maybe paint just a pixel?
    let pixels = ctx.getImageData(Math.floor(indexCol), Math.floor(indexRow), 1, 1);
    let pixel = pixels.data[0];
    // Alpha
    let alpha = pixels.data[3];
    if (alpha == 0)
      return undefined;
    return pixel/255;
  }


  
  // Create an image element and load the image
  // HACK: errors are not catched when fetching image urls. If errors are catched, the data does not load
  getTileFromURL = function(url){
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', reject); // If reject(img), image does not load
      img.src = url;
      this.activeRequests.push(img);
      //this.printLog(url);
    })
  }






  // Cancels active requests
  cancelActiveRequests = function(){
    this.activeRequests.forEach(el => el.src = "");
    this.activeRequests = [];
  }




   // Set WMTS parameter
   static setWMTSParameter(wmtsURL, paramName, paramContent) {
    // If parameter does not exist
    if (wmtsURL.indexOf(paramName + "=") == -1) {
      //console.log("Parameter ", paramName, " does not exist in WMS URL");
      return wmtsURL + '&' + paramName + '=' + paramContent;
    }
    let currentContent = WMTSDataRetriever.getWMTSParameter(wmtsURL, paramName);
    return wmtsURL.replace(paramName + '=' + currentContent, paramName + '=' + paramContent);
  }

  // Get WMTS parameter
  static getWMTSParameter(wmtsURL, paramName) {
    // If parameter does not exist
    if (wmtsURL.indexOf(paramName + "=") == -1) {
      console.log("Parameter ", paramName, " does not exist in WMS URL");
      return '';
    }
    let tmpSTR = wmtsURL.substr(wmtsURL.indexOf(paramName + "="));
    let endOfContent = tmpSTR.indexOf('&') == -1 ? tmpSTR.length : tmpSTR.indexOf('&');
    return tmpSTR.substring(paramName.length + 1, endOfContent);
  }


  // Verbose
  printWarnConsole = function(message){
    console.warn(message);
  }
  printLogConsole = function(message){
    console.log(message);
  }

}



export default WMTSDataRetriever;