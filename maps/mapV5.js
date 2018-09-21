      //now to add 
      // - user can select a day to see parking paths
      // - user can select a time to see parking paths
      // - refactor code to make easier to work with
      // - use oop principles to abstract functions with data injection
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
            let currentPath = {};
            let latLngArr = [];
            let latLngArrMaster = [];
            var currentPnt = {lat: 0, lng: 0};

            function createPathObj(pointArr){
              let pointObj = {lat:0, lng:0};
              pointObj.lat = pointArr[1];
              pointObj.lng = pointArr[0];
              return pointObj;
            }

            // 1 grab latLng paths - filter
            currentDay = 'Wednesday';
            let filterLatLngPaths = smArcGisData.features.filter((singlePathData)=>{
                return singlePathData.attributes.DAY === currentDay;
              }
            );
            console.log(filterLatLngPaths);

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
              addPolyline2(latLngPath, 'violet');
            })
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
drawMondayParkingBtn.addEventListener('click', drawParkingPath);

var eraseMondayPath = document.getElementById('erase-monday-path');
eraseMondayPath.addEventListener('click', eraseParkingPath)
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

function drawParkingPath(){
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

  const datasetLength = smArcGisData.features.length;

  //loop through data to
  // 1 - grab latLng paths - filter
  // 2 - convert latLng paths to be accepted to google maps polyline API - forEach/callback
  // 3 - draw polylines on google map - forEach

  // 1 grab latLng paths - filter
  currentDay = 'Tuesday';
  let filterLatLngPaths = smArcGisData.features.filter((singlePathData)=>{
      return singlePathData.attributes.DAY === currentDay;
    }
  );
  console.log(filterLatLngPaths);

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
    addPolyline2(latLngPath, 'lime');
  })
  
}

function eraseParkingPath(){
  pathsToErase.forEach((path)=>{
    path.setMap(null);
  })
}
