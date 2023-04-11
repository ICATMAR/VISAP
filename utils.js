const separator = '&';


// Set hash value on window.location.hash
const setHashValue = function(id, value){
  let hash = window.location.hash;
 
  // Check if hash exists
  // Get start index
  let indexId = hash.indexOf(id + '=');
  if (indexId != -1){
    // Get previous content to replace
    let hashSection = hash.substring(indexId, hash.length);
    let indexSeparator = hashSection.indexOf(separator);
    // If separator does not exist in section
    let contentLength = 0;
    if (indexSeparator == -1){
      contentLength = hashSection.length - id.length - 1;
    } else {
      let hashSubSection = hashSection.substring(0, indexSeparator);
      contentLength = hashSubSection.length - id.lenght - 1;
    }
    
    
    let content = hash.substring(indexId + id.length + 1, indexId + id.length + 1 + contentLength);
    // console.log("Value: " + content);

    hashSection = hashSection.replace(content, value);

    window.location.hash = hash.substring(0, indexId) + hashSection;


  } else {
    // Add value to hash
    if (hash.substring(hash.length -2, hash.length -1) == '&' || hash.substring(hash.length -2, hash.length -1) == '#' || hash.length == 0){
      window.location.hash += id + '=' + value;
    } else {
      window.location.hash += '&' + id + '=' + value;
    }
  }
  
};


// Get has value
const getHashValue = function(id){
  let hash = window.location.hash;
  // Check if hash exists
  // Get start index
  let indexId = hash.indexOf(id + '=');
  if (indexId != -1){
    // Get previous content to replace
    let hashSection = hash.substring(indexId, hash.length);
    let indexSeparator = hashSection.indexOf(separator);
    // If separator does not exist in section
    let contentLength = 0;
    if (indexSeparator == -1){
      contentLength = hashSection.length - id.length - 1;
    } else {
      let hashSubSection = hashSection.substring(0, indexSeparator);
      contentLength = hashSubSection.length - id.lenght - 1;
    }
    
    let content = hash.substring(indexId + id.length + 1, indexId + id.length + 1 + contentLength);
    return content;
  }
  else 
    return undefined;

}

export {setHashValue, getHashValue};