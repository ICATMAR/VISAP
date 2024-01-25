// Google analytics event manager class
class GAnalyticsManager {

  constructor(){
    // EVENTS
    //https://developers.google.com/analytics/devguides/collection/ga4/events?client_type=gtag
    //https://developers.google.com/analytics/devguides/collection/ga4/event-parameters?client_type=gtag
    //https://support.google.com/analytics/answer/9267568#mark

    //gtag("event", "advanced_interface", {
      // "file_type": "csv",
      // "aggregation_type": "port",
      // "myCustomVariable": "gerard",
    //});

    // If user clicks on advanced interface, send the event once per page load
    // window.eventBus.on('AdvancedInterfaceOnOff', (state) => {
    //   if (state){
    //     if(this.eventAdvancedInterfaceOnce == undefined){
    //       gtag("event", "advanced_interface", {});
    //       this.eventAdvancedInterfaceOnce = true;
    //     }
    //   }
    // });



    
  }
}


export default GAnalyticsManager;