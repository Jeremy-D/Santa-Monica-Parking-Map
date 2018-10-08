      //now to add 
      // extract reusable functions from drawParkingPath()
      // refactor ux so that map draws available parking places first
      // think of how to implement location ranking
      let map;
      let currentParkingPath;
      let drawnPathsArr;
      let url = 'http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&geometry=-118.477%2C34.01%2C-118.455%2C34.017&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json'
      //alt url in similar area 'http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&outSR=4326&f=json'

      /////////////////////////////////////////////////
      function initMap() {
        //business location
        const wfhc = {lat: 34.012938, lng: -118.46662};

        map = new google.maps.Map(document.getElementById('map'), {
          center: wfhc,
          zoom: 14
        });

        function addMarker(coords){
          let marker = new google.maps.Marker({
            position:coords,
            map:map
          });
        }

        addMarker(wfhc);

        fetch(url)
          .then(function(response){
            return response.json()
          })
          .then(function(myJson){
            drawParkingPath(myJson, 'red', {'DAY':'Friday'})
            drawParkingPath(myJson, 'violet', {'DAY':'Wednesday'})
          })
          
      }

//END FIRST RENDER MAP
/////////////////////////////////


//////////////////////////////////////////////////////////////////
// EVENT LISTENERS
var logData = document.getElementById('log-data');
logData.addEventListener('click', logDataFunc);

function logDataFunc(){
  console.log('gotta give me somethin to log! ¯\\_(ツ)_/¯')
  //console.log(currentParkingPath)
  //currentParkingPath.setMap(null);
}

var drawMondayParkingBtn = document.getElementById('draw-new-path');
//drawMondayParkingBtn.addEventListener('click', drawParkingPath(smArcGisData));
drawMondayParkingBtn.addEventListener('click', function(){drawParkingPath(smArcGisData, 'lime')});

var eraseMondayPath = document.getElementById('erase-monday-path');
eraseMondayPath.addEventListener('click', eraseParkingPath);

const daySelect = document.getElementById('day-select');
//daySelect.addEventListener('change', function(){drawParkingPath(`${this.value}`, smArcGisData, 'blue')})
daySelect.addEventListener('change', function(){updateFilterAttributes(setupFilterAttributes, 'DAY', this.value)})

const timeSelect = document.getElementById('time-select');
timeSelect.addEventListener('change', function(){updateFilterAttributes(setupFilterAttributes, 'TIME', this.value)})

const filterThingy = document.getElementById('filter-thingy');

let filterObject = {DAY: 'Wednesday', TIME:'3-5'};
filterObject = {DAY: 'null'};
filterThingy.addEventListener('click', function(){filterDataSet(smArcGisData, filterObject)});

const testAPIs = document.getElementById('test-APIs');
testAPIs.addEventListener('click', testAPIsFunc)

let setupFilterAttributes = setFilterAttributes(['DAY', 'TIME']);

const drawPathDopeFunc = document.getElementById('draw-path-dope-func');
drawPathDopeFunc.addEventListener('click', function(){
  drawParkingPath(smArcGisData, 'purple', setupFilterAttributes);
});
// END EVENT LISTENERS
//////////////////////////////////////////////////////////////////


//Global Variables--------------------------------------------
let smArcGisData;
let pathsToErase = [];


//FETCH DATA---------------------------------------------------
fetch('http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&geometry=-118.477%2C34.01%2C-118.455%2C34.017&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json')
    .then(function(response){
      return response.json()
    }).then(function(data){
      //data is an object
      smArcGisData = data;
    })
//=======================================================================
//addPolyline2()----------------------------------------
//second iteration of drawing polylines
//possibly can update with options for getting information when hovering 
//over already drawn paths
//=======================================================================
function addPolyline2(pathArr, color){
  currentParkingPath = new google.maps.Polyline({
    path: pathArr,
    geodesic: true,
    strokeColor: color,
    strokeWeight: 2,
    strokeOpacity: 1
  });
  // add path to an array so it can be erased later
  pathsToErase.push(currentParkingPath);
  //actually draw polyline
  currentParkingPath.setMap(map);
}
//=======================================================================
//CONVERT LAT LNG data------------------------------------------
//lat long data from the Santa Monica GIS is an array of two
//lat long points, this data needs to be converted into an object
//so that google maps polyline API can read the data 
//this function is used in the drawParkingPath() function
//=======================================================================
function createPathObj(pointArr){
  let pointObj = {lat:0, lng:0};
  pointObj.lat = pointArr[1];
  pointObj.lng = pointArr[0];
  return pointObj;
}
//=======================================================================
//drawParkingPath()------------------------------------------------------
//drawParkingPath 
// -sorts the data based on 1 feature attribute, 
// -parses the lat lng data into google maps friendly format
// - draws the polylines on the map & stores the data to erase the paths
//
//=======================================================================
function drawParkingPath(dataSet, color, filterAttributes){
  //set variables with future types
  //
  //latLngArr - holds the smaller paths for each day,
  //it is destroyed after the data has been converted to object
  //that google maps polyline API needs

  //latLngArrMaster -  holds all of the paths for the selected day
  //to be drawn
  let currentPath = {};
  let currentPathsArr;
  let latLngArr = [];
  let latLngArrMaster = [];

  let currentPnt = {lat: 0, lng: 0};
  let currentDay = '';

  //loop through data to
  // 1 - grab latLng paths - filter
  // 2 - convert latLng paths to be accepted to google maps polyline API - forEach/callback
  // 3 - draw polylines on google map - forEach

  // 1 grab latLng paths - filter
  filterLatLngPaths = filterDataSet(dataSet, filterAttributes);

  // 2 convert latLng paths to be accepted to google maps polylineAPI - forEach, createPathObj()
  filterLatLngPaths.forEach(function(latLngThing){
    currentPathsArr = latLngThing.geometry.paths[0];

    currentPathsArr.forEach((latLngPoint)=>{
        latLngArr.push(createPathObj(latLngPoint));
      })

    latLngArrMaster.push(latLngArr);
    latLngArr = [];
  })

  // 3 draw polylines on google map
  latLngArrMaster.forEach((latLngPath)=>{
    addPolyline2(latLngPath, color);
  })
}
//=======================================================================
//setFilterAttributes()--------------------------------------------------
//creates an object to be passed as filterAttributes to the filterDataSet()
//function
//
//when the object is created the values for keys are empty strings
//the object keys are updated with the updateFilterAttributes() function
//=======================================================================
function setFilterAttributes(attributesArr){
  let initialAttributesObj = attributesArr.reduce((filterAttributes, currentAttribute)=>{
    filterAttributes[currentAttribute] = '';
    return filterAttributes;
  }, {})
  return initialAttributesObj;
}

//=======================================================================
//updateFilterAttributes()-----------------------------------------------
//will run when html select dropdown is changed in order to create
//the filterAttributes array needed for the setFilterAttributes() function
// - takes an object{}, 
// - takes an attribute as a string, convention with this dataset seems to be a string 
//   in all caps for attribute names
// - takes a value, currently string but could possibly be something else for other
//   datasets, use case as this.value
//=======================================================================
function updateFilterAttributes(attributesObj, attribute, value) {
  attributesObj[attribute] = value;
  console.log(attributesObj);
}

//=======================================================================
//filterDataSet()---------------------------------------------------------------
//filters dataSet based on multiple feature attributes
//not sure if you'd ever use more than two for SM open gis data sets
//=======================================================================
function filterDataSet(dataSet, filterAttributes){
  //filterAtributes needs to be an object
  //we'll do a -> features.filter(filterAtributes)
  //filter multiple attributes in the object
  //else throw error 

  //sanitize filterAtributes... kinda
  function cleanFilterAttributes(filterAttributes){
    for(var attribute in filterAttributes){
      if(filterAttributes[attribute]==false){
        delete filterAttributes[attribute];
      }
    }
    return filterAttributes;
  }

  let sanitizeAttributes = cleanFilterAttributes(filterAttributes);
  
  let attributesValid = true;
  let fieldAliases = dataSet.fieldAliases;
  let features = dataSet.features;

  if(attributesValid === true){
    features = features.filter(function(feature){
        for(var key in filterAttributes){
          if (feature.attributes[key] == undefined || feature.attributes[key] != filterAttributes[key])
            return false;
        }
        return true;
      });
    return features;
  }
}

//=======================================================================
//processLatLngData()----------------------------------------------------
//filters dataSet based on multiple feature attributes
//not sure if you'd ever use more than two for SM open gis data sets
//=======================================================================
function processLatLngData(dataSubset){

}


//=======================================================================
//showFieldAliasOptions()------------------------------------------------
//showFieldAliasOptions() allows the developer to see the combination of field
//aliases that can be used in the filterDataSet() function
//a simple example is seeing all of the options for DAY and TIME
//but other insights can be gained by comparing various field aliases 
//from the database
//=======================================================================
function showFieldAliasOptions(dataSet, alias, comparedAlias){
  features = dataSet.features;

  let daysAndTimes = {};
  features.forEach((feature)=>{
    attributes = feature.attributes;

    if (daysAndTimes[attributes[alias]] == undefined){
      daysAndTimes[attributes[alias]] = [];
      daysAndTimes[attributes[alias]].push(attributes[comparedAlias]); 
    } 

    if (daysAndTimes[attributes[alias]].indexOf(attributes[comparedAlias]) === -1){
      daysAndTimes[attributes[alias]].push(attributes[comparedAlias])
    } 
  })

  console.log('you crazy kids!');
  console.log(daysAndTimes);
};

//show all street sweeping DAY/TIME combinations
//use setTimeout to wait for asynchronous call
setTimeout(function(){showFieldAliasOptions(smArcGisData,'TIME');}, 3000);

  
//=======================================================================
//eraseParkingPath()------------------------------------------------
//the pathsToErase array is created when polylines are drawn in the
//addPolyline2() function, eraseParkingPath() references that array in 
//order to erase polylines by setting the Map of the path to null
//
//need to rename for general use
//=======================================================================
function eraseParkingPath(){
  pathsToErase.forEach((path)=>{
    path.setMap(null);
  })
}

function testAPIsFunc(){
  // change this line -> currentPathsArr = latLngThing.geometry.paths[0];
  // to this -> currentPathsArr = latLngThing.geometry.rings[0];
  // for some datasets
  let APIurl = "https://csmgisweb.smgov.net/csmgis01/rest/services/environment/watersheds/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
  APIurl = "http://csmgisweb.smgov.net/public/rest/services/bike_network/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
  fetch(APIurl)
    .then(function(response){
      return response.json()
    })
    .then(function(myJson){
      //watershed data
      // showFieldAliasOptions(myJson, 'WATERSHED')
      // drawParkingPath(myJson, 'blue', {WATERSHED:'San Vicente'});
      console.log(myJson)
      for (var key in myJson.fieldAliases){
        console.log(key);
        showFieldAliasOptions(myJson, key);
      }
      // myJson.fieldAliases.forEach((attribute)=>{
      //   showFieldAliasOptions(myJson, attribute);
      // })
    })
}
