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
            drawParkingPath('Friday', myJson, 'red')
            drawParkingPath('Wednesday', myJson, 'violet')
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
drawMondayParkingBtn.addEventListener('click', function(){drawParkingPath('Tuesday', smArcGisData, 'lime')});

var eraseMondayPath = document.getElementById('erase-monday-path');
eraseMondayPath.addEventListener('click', eraseParkingPath)

const daySelect = document.getElementById('day-select');
daySelect.addEventListener('change', function(){drawParkingPath(`${this.value}`, smArcGisData, 'blue')})

const filterThingy = document.getElementById('filter-thingy');

let filterObject = {DAY: 'Wednesday', TIME:'3-5'};
filterThingy.addEventListener('click', function(){filterDataSet(smArcGisData, filterObject)});

const testAPIs = document.getElementById('test-APIs');
testAPIs.addEventListener('click', testAPIsFunc)
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

//draw polylines method----------------------------------------
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
//CONVERT LAT LNG data------------------------------------------
//lat long data from the Santa Monica GIS is an array of two
//lat long points, this data needs to be converted into an object
//so that google maps polyline API can read the data 
function createPathObj(pointArr){
  let pointObj = {lat:0, lng:0};
  pointObj.lat = pointArr[1];
  pointObj.lng = pointArr[0];
  return pointObj;
}

//drawParkingPath needs a data set and a day parameter
//in order to be more dynamic
function drawParkingPath(day, dataSet, color){
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
  currentDay = day;

  if (day === "Null"){
    currentDay = "null"
  }
  
    let filterLatLngPaths = dataSet.features.filter((singlePathData)=>{
        return singlePathData.attributes.DAY === currentDay;
      }
    );

  // 2 convert latLng paths to be accepted to google maps polylineAPI - reduce
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

function filterDataSet(dataSet, filterAttributes){
  //filterAtributes needs to be an object
  //we'll do a -> features.filter(filterAtributes)
  //filter multiple attributes in the object
  //else throw error 



  //remember to validate filterAtributes
  let attributesValid = true;
  console.log(dataSet);

  let fieldAliases = dataSet.fieldAliases;
  console.log(filterAttributes)
  console.log(fieldAliases);

 
//---------------------------------------------------------------------------------
  

  let features = dataSet.features;
  //console.log(features);

  //show all streetsweeping combinations
  let attributes;
  //showFieldAliasOptions allows the developer to see the combination of field
  //aliases that can be used in the filterDataSet() function
  //a simple example is seeing all of the options for DAY and TIME
  //but other insights can be gained by comparing various field aliases 
  //from the database
  //
  //need to take this function out of filterDataSet() function
  //i was being lazy ¯\_(ツ)_/¯
  function showFieldAliasOptions(alias, comparedAlias){
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
  showFieldAliasOptions('DAY', 'TIME');
  showFieldAliasOptions('SWEEP0_ID', 'DAY');
  //showFieldAliasOptions('TIME', 'DAY');
  //showFieldAliasOptions('DAY', 'LENGTH');
  //showFieldAliasOptions('TIME');

  if(attributesValid === true){
    features = features.filter(function(feature){
        for(var key in filterAttributes){
          if (feature.attributes[key] == undefined || feature.attributes[key] != filterAttributes[key])
            return false;
        }
        return true;
      });
    console.log(features);
  }

  


  // console.log(features);
  // dataSet.features.filter((singlePathData)=>{
  //   console.log(singlePathData.attributes.filterAtribute)
  // })
}

function eraseParkingPath(){
  pathsToErase.forEach((path)=>{
    path.setMap(null);
  })
}

function testAPIsFunc(){
  let APIurl = "https://csmgisweb.smgov.net/csmgis01/rest/services/environment/watersheds/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
  fetch(APIurl)
    .then(function(response){
      return response.json()
    })
    .then(function(myJson){
      console.log(myJson);
    })
}
