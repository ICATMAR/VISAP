
class GeoJSONWrapper {

    isVisible = true;
    opacity = 1;
    isAddedToMap = false;
    // color
    // ...

    constructor (data){
        this.rawJSON = data;
        this.fileName = data.fileName;
    }
}

export {GeoJSONWrapper}