// Google analytics event manager class
class GAnalyticsManager {

  constructor(){
    // EVENTS
    //https://developers.google.com/analytics/devguides/collection/ga4/events?client_type=gtag
    //https://developers.google.com/analytics/devguides/collection/ga4/event-parameters?client_type=gtag
    //https://support.google.com/analytics/answer/9267568#mark
    // https://docs.google.com/document/d/1SKqwH7yr4IRHOrqa9qPUrqknYUPoXASAKtQWJR9bnu0/edit

    //gtag("event", "advanced_interface", {
      // "file_type": "csv",
      // "aggregation_type": "port",
      // "myCustomVariable": "gerard",
    //});


    window.eventBus.on("PieChartSection_Export", el => {
      // Exit if in localhost
      if (window.location.href.includes('127.0.0.1'))
        return;
      // Send a ga event every time data is exported clicked
      //{fileExtension: "JSON", modality: "trawling", aggregationType: this.type} // type = season or port

      let gaEl = {
        method: el.modality,
        group_id: el.aggregationType,
        currency: el.fileExtension,
      };

      let eventName = "visap_download_catch_data";
      console.log("Emitting GA event: "+ eventName + ", " + JSON.stringify(gaEl));
      gtag("event", eventName, gaEl);

      // Test ecommerce analytics - array items
      // https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag#implementation
      // https://developers.google.com/analytics/devguides/collection/ga4/set-up-ecommerce
      gtag("event", "purchase", {
        value: 1,
        currency: el.fileExtension,
        items : [{
          item_id: "visap_catch_composition_" + el.modality + "_" + el.aggregationType + "_" + el.fileExtension,
          item_name: "VISAP catch composition of "+  el.modality +" per " + el.aggregationType + " as " + el.fileExtension,
          item_category: el.modality,
          item_category2: "catch_composition",
          item_category3: el.aggregationType,
          item_variant: el.fileExtension,
          price: 1,
          quantity: 1,
        }]
      });

    });



    window.eventBus.on("HaulInfo_Export", el => {
      // Exit if in localhost
      if (window.location.href.includes('127.0.0.1'))
        return;
      // Send a ga event every time data is exported clicked
      //{fileExtension: "JSON", modality: "trawling", trackId: <number such as 154357>}
      // Change keys to GA keys
      let gaEl = {
        method: el.modality,
        value: el.trackId,
        currency: el.fileExtension
      }

      let eventName = "visap_download_haul_data";

      console.log("Emitting GA event: "+ eventName + ", " + JSON.stringify(gaEl));
      gtag("event", eventName, gaEl);


      // Test ecommerce analytics - array items
      // https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag#implementation
      // https://developers.google.com/analytics/devguides/collection/ga4/set-up-ecommerce
      gtag("event", "purchase", {
        value: 1,
        currency: el.fileExtension,
        items : [{
          item_id: el.trackId,
          item_name: "VISAP haul composition of "+  el.modality +", haul id " + el.trackId + " as " + el.fileExtension,
          item_category: el.modality,
          item_category2: "haul_composition",
          item_variant: el.fileExtension,
          price: 1,
          quantity: 1,
        }]
      });
    });


    // Length distribution
    window.eventBus.on("LengthDistChart_Export", el => {
      // Exit if in localhost
      if (window.location.href.includes('127.0.0.1'))
        return;
      // Send a ga event every time data is exported clicked
      //{fileExtension: "JSON", modality: "trawling", species: <name such as Merluccius merluccius>}
      // Change keys to GA keys
      let gaEl = {
        method: el.modality,
        value: el.species,
        currency: el.fileExtension
      }

      let eventName = "visap_download_lengthdist_data";

      console.log("Emitting GA event: "+ eventName + ", " + JSON.stringify(gaEl));
      gtag("event", eventName, gaEl);


      // Test ecommerce analytics - array items
      // https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtag#implementation
      // https://developers.google.com/analytics/devguides/collection/ga4/set-up-ecommerce
      gtag("event", "purchase", {
        value: 1,
        currency: el.fileExtension,
        items : [{
          item_id: el.species,
          item_name: "VISAP haul composition of "+  el.modality +", species " + el.species + " as " + el.fileExtension,
          item_category: el.modality,
          item_category2: "length_distribution",
          item_variant: el.fileExtension,
          price: 1,
          quantity: 1,
        }]
      });
    });

    
    
  }
}


export default GAnalyticsManager;