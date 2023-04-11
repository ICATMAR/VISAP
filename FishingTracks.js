// Functions that help with the management of bottom trawl fishing

class FishingTracks {

    // Variables
    selStartDate = new Date();
    selEndDate = new Date();
    limStartDate = new Date();
    limEndDate = new Date();
    
    // Static variables (singleton architecture)
    static geoJSONData = {
        'type': 'FeatureCollection',
        'features': []
    };
    static selectedTrack = undefined;

    trackLinesLayer = undefined;


    // CONSTRUCTOR
    constructor(address, staticFile, onLoadTracks){

        // Callback function for when the tracks are loaded
        this.onLoadTracks = onLoadTracks;

        // Get track lines from server or from file
        // If gotten, create track lines geojson and vector layer
        this.getTrackLines(address, staticFile);
    }


    // INTERNAL FUNCTIONS
    // Get track lines information
    // Load and create pie chart
    getTrackLines(address, staticFile){
        console.log("Getting data: " + address + ", " + staticFile + ", ");
        // Try data from server
        fetch(address)
            .then(r => r.json())
            .then(r => {
                this.createTrackLines(r);
            })
            .catch(e => {
                if (staticFile !== undefined) { // Load static file
                    console.error("Could not fetch from " + address + ". Error: " + e + ". Trying with static file.");
                    window.serverConnection = false;
                    this.getTrackLines(staticFile, undefined);
                } else {
                    console.error("Could not fetch from " + address + ". Error: " + e + ".");
                }
            })
    }



    // Create trackLines GEOJSON object and create openlayers layer
    createTrackLines(data){
        // https://github.com/cschwarz/wkx
        // There was a redifinition of require, which caused errors with ArcGIS widget
        var Buffer = require2('buffer').Buffer;
        var wkx = require2('wkx');

        // Create geojson
        let startDate = '2020-1-1';
        let endDate = '2020-12-31';
        for (let i = 0; i < data.length; i++) {
            //https://github.com/cschwarz/wkx
            //Parsing a node Buffer containing a WKB object
            if (data[i].geom === null)
                continue;

            // Find start and end dates for time slider and selecting tracks
            // Only data until end of 2020
            /*if (data[i].Data.split('-')[0] > "2020")
                continue;
            // Find earliest date
            if (startDate.split('-')[0] >= data[i].Data.split('-')[0]) {
                if (startDate.split('-')[1] >= data[i].Data.split('-')[1]) {
                    if (startDate.split('-')[2] > data[i].Data.split('-')[2]) {
                        startDate = data[i].Data;
                    }
                }
            }*/
            let year = parseInt(data[i].Data.split('-')[0]);
            let month = parseInt(data[i].Data.split('-')[1]);
            let day = parseInt(data[i].Data.split('-')[2]);
            data[i].Date = new Date(year, month-1, day);

            // Read geometry
            let wkbBuffer = new Buffer(data[i].geom, 'hex');
            let geometry = wkx.Geometry.parse(wkbBuffer);
            let gJSON = geometry.toGeoJSON();
            delete data[i].geom; // delete geom, as we do not want it in the features
            // Create geoJSON
            let feature = {
                'type': 'Feature',
                'properties': {
                    "id": data[i].Id,
                    "info": data[i],
                    "featType": "trackLine",
                    'visible': true,
                },
                'geometry': gJSON,
                
            }

            FishingTracks.geoJSONData.features.push(feature);
        }
        //console.log(JSON.stringify(geoJSONData)); // To write static file


        // Store starting and ending dates of tracks
        // Remove 1 to month! https://www.w3schools.com/js/js_dates.asp
        /*let sDate = startDate.split('-');
        let eDate = endDate.split('-');
        sDate[1] -= 1;
        eDate[1] -= 1;

        this.limStartDate = new Date(...sDate);
        this.limEndDate = new Date(...eDate);*/

        //var timeSlider = new TimeSliderArcGIS("trackLinesTimeslider", new Date(...sDate), new Date(...eDate), undefined);
        //timeSlider.createTimeSlider();



        // Create OL Layer
        // Create URL
        let dataStr = JSON.stringify(FishingTracks.geoJSONData);
        let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        // Create layer
        //let vectorTrackLines = new ol.layer.Vector({
        this.trackLinesLayer = new ol.layer.Vector({
            name: 'fishingTracks',
            source: new ol.source.Vector({
                //features: new ol.format.GeoJSON().readFeatures(geoJSONData), // This is not working??? https://openlayers.org/en/latest/examples/geojson.html
                url: dataUri,//'data/trackLines.geojson',
                format: new ol.format.GeoJSON(),
                attributions: '© ICATMAR (Institut Català de Recerca per la Governança del Mar)',
            }),
            style: this.trackStyle.bind(this),
            // style: new ol.style.Style({
            //     stroke: new ol.style.Stroke({
            //         color: 'rgba(255,0,0,0.6)', // TODO: depening on the feature port
            //         width: 2,
            //     })
            // })
        });


        // Add layer to map?
        this.onLoadTracks();
        //map.addLayer(vectorTrackLines);
    }

    // This function is called everytime the map moves. Should it be like this?
    trackStyle(feature){
        // If it is not visible
        let featDate = new Date(feature.C.info.Date);
        let visible = featDate > this.selStartDate && featDate < this.selEndDate;
        if (!visible){
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(0,0,0,0.0)',
                    width: 0,
                })
            })
        }
        
        let port = feature.C.info.Port;
        let date = new Date(feature.C.info.Date);
        let zonaPort = feature.C.info.Port;
        let colorPort = palette[port].color;

        // Check if this is the selected feature
        let isSelected = false;
        if (feature.C.info.Id == FishingTracks.selectedTrack)
            isSelected = true;

        let portStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(' + colorPort + ', 1)',
                width: isSelected ? 6 : 2,
            }),
            zIndex: isSelected ? 100 : 1,
        })
        let borderStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(0,0,0,0.6)', 
                width: isSelected ? 12 : 4,
            }),
            zIndex: isSelected ? 100 : 1,
        })
        
        return [borderStyle, portStyle]
    }





    // PUBLIC FUNCTIONS
    // Returns the openlayers layer
    getLayer() {
        return this.trackLinesLayer;
    }
    // Returns geojson
    static getGeoJSON(){
        return FishingTracks.geoJSONData;
    }
    // Set selected track
    static setSelectedTrack(id){
        FishingTracks.selectedTrack = id;
    }
    // Get selected track
    static getSelectedTrack(){
        return FishingTracks.selectedTrack;
    }
    // Get feature by id
    static getFeatureById(id){
        let feature = undefined;
        FishingTracks.geoJSONData.features.forEach(ff => {
            if (ff.properties.info.Id == id){
                feature = ff;
            }
        });
        return feature;
    }


    // Set start and ending dates and update style
    setStartEndDates(sDate, eDate){
        
        // Set starting and ending dates
        this.selStartDate.setTime(sDate.getTime());
        this.selEndDate.setTime(eDate.getTime());

        this.updateStyle();
    }

    updateStyle(){
        // Update styles
        if (this.trackLinesLayer !== undefined)
            this.trackLinesLayer.getSource().dispatchEvent('change');
    }



}
