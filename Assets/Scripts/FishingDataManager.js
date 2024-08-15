// Tracks points
// Effort layer
// Call the loading?
//import '../../lib/OpenLayers/ol_v7.0.0.js'

class FishingData {

  hauls;
  haulsLayer;
  effortMaps = {};
  effortLayer;


  isLoading = false;


  constructor() {

  }


  initLoad(mod) {
    // Is in the process of being loaded
    if (this.isLoading)
      return;
    this.isLoading = true;

    // Load effort maps and hauls
    window.FileManager.loadMapFiles(mod).then((results)=>{
      for (let i = 0; i < results.length; i++){
        let res = results[i];
        // Failed to load
        if (res.value == undefined)
          continue;
        // Effort map or legend
        if (res.value.extension == 'png'){
          // Organize
          let fileName = res.value.url.split('/').pop();
          let unit = fileName.includes('_euros_') ? 'euros' : 
                      fileName.includes('_hours_') ? 'hours' :
                      fileName.includes('_kg_') ? 'kg' : undefined;
          if (unit == undefined){
            debugger;
            continue;
          }
          this.effortMaps[unit] = {};
          // Is legend
          if (fileName.includes('legend'))
            this.effortMaps[unit].legend = res.value.content;
          else {
            // Get year
            let numbers = fileName.match(/\d+/g); // Regex expression to get numbers in string
            if (numbers.length == 0){
              debugger;
            }
            let filtNum = numbers.filter(num => num >= 2018 && num <= 2029);
            if (filtNum.length != 1){
              debugger;
            }
            this.effortMaps[unit][filtNum[0]] = res.value.content;
          }
          
        }
        // GeoJSON
        else if (res.value.extension == 'geojson'){
          debugger;
        }
      }
      this.isLoading = false;
    });
  }


  // Get trawling tracks OL



}



class FishingTrawlingData extends FishingData {

  constructor(){
    super();
    this.initLoad('trawling');
  }

}



class FishingPSData extends FishingData {
  constructor(){
    super();
  }
}



export { FishingTrawlingData, FishingPSData }