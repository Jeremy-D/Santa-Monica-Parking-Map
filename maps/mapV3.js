      // V3 file saves api call in a variable so map can be updated
      //get rid of old polyline method
      //get rid of labeling polyline functions
      //move addPolyline2 to global scope or figure something out
      //add polylines to an array as they are created so you can remove them later
      let map;
      let currentParkingPath;
      let drawnPathsArr;



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

        //add polyline by whole path in latlng path array (ie not just first and last)

        function addPolyline2(pathArr){
          let path = pathArr;
          currentParkingPath = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: 'cyan',
            strokeWeight: 2,
            strokeOpacity: 1
          });
          currentParkingPath.setMap(map)
          //drawnPathsArr.push

        }

        //fetch('http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&outSR=4326&f=json')
        fetch('http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&geometry=-118.477%2C34.01%2C-118.455%2C34.017&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json')
          .then(function(response){
            return response.json()
          })
          .then(function(myJson){
            console.log(myJson);
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

            for (var i = 0; i < myJson.features.length; i++){
              currentPathsArr = myJson.features[i].geometry.paths[0];
              if(myJson.features[i].attributes.DAY === 'null'){
                currentPathsArr.forEach((latLngPoint)=>{
                  latLngArr.push(createPathObj(latLngPoint));
                })
                latLngArrMaster.push(latLngArr);
                latLngArr = [];

                let firstPath = currentPathsArr[0];
                let lastPath = currentPathsArr[currentPathsArr.length - 1];

                currentPath.lng1 = firstPath[0];
                currentPath.lat1 = firstPath[1];
                currentPath.lng2 = lastPath[0];
                currentPath.lat2 = lastPath[1];

                latLngArrMaster.forEach((latLngPath)=>{
                  addPolyline2(latLngPath);
                })
              }
            }
          })
      }

//END FIRST RENDER MAP
/////////////////////////////////
//grab the data again
let smArcGisData;
fetch('http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&geometry=-118.477%2C34.01%2C-118.455%2C34.017&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json')
    .then(function(response){
      return response.json()
    }).then(function(data){
      smArcGisData = data;
    })

var logData = document.getElementById('log-data');
logData.addEventListener('click', logDataFunc);

function logDataFunc(){
  console.log(currentParkingPath)
  //currentParkingPath.setMap(null);
}

var drawMondayParkingBtn = document.getElementById('draw-new-path');
//drawMondayParkingBtn.addEventListener('click', drawParkingPath(smArcGisData));
drawMondayParkingBtn.addEventListener('click', drawParkingPath);

var eraseMondayPath = document.getElementById('erase-monday-path');
eraseMondayPath.addEventListener('click', eraseParkingPath)

function drawMondayCheck() {
  console.log('helllooooo monday');
  //console.log(smArcGisData)
}


let pathsToErase = [];

function drawParkingPath(){
  console.dir(this);
  this.draggable = true;
  function addPolyline2(pathArr){
    let path = pathArr;

    currentParkingPath = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: 'red',
      strokeWeight: 2,
      strokeOpacity: 1
    });

    pathsToErase.push(currentParkingPath);

    currentParkingPath.setMap(map);
  }

  console.log('hello');
  console.log(smArcGisData);

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

  for (var i = 0; i < smArcGisData.features.length; i++){
    currentPathsArr = smArcGisData.features[i].geometry.paths[0];
    if(smArcGisData.features[i].attributes.DAY === 'Tuesday'){
      currentPathsArr.forEach((latLngPoint)=>{
        latLngArr.push(createPathObj(latLngPoint));
      })
      latLngArrMaster.push(latLngArr);
      latLngArr = [];

      let firstPath = currentPathsArr[0];
      let lastPath = currentPathsArr[currentPathsArr.length - 1];

      currentPath.lng1 = firstPath[0];
      currentPath.lat1 = firstPath[1];
      currentPath.lng2 = lastPath[0];
      currentPath.lat2 = lastPath[1];

      latLngArrMaster.forEach((latLngPath)=>{
        addPolyline2(latLngPath);
      })
    }
  }
}

function eraseParkingPath(){
  console.log(pathsToErase)
  pathsToErase.forEach((path)=>{
    path.setMap(null);
  })

}
