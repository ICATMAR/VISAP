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
      // Send a ga event every time data is exported clicked
      //{fileExtension: "JSON", modality: "trawling", aggregationType: this.type} // type = season or port

      console.log("Emitting GA event: download_data: " + JSON.stringify({
        method: el.modality,
        group_id: el.aggregationType,
        currency: el.fileExtension,
      }));
      gtag("event", "download_data", {
        method: el.modality,
        group_id: el.aggregationType,
        currency: el.fileExtension,
      });
    });


    
  }
}


export default GAnalyticsManager;