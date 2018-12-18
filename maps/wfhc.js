//////////////////////////////////////////////////////////
//Render Initial Map
let map;

//fetch data from a url
const url =
  'http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&geometry=-118.477%2C34.01%2C-118.455%2C34.017&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json';
//alt url in similar area 'http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&outSR=4326&f=json'
//url2 is preferential parking with spatial envelope filter
const url2 =
  'http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/1/query?where=1%3D1&outFields=*&geometry=-118.477%2C34.011%2C-118.454%2C34.017&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json';
//url3 is the full preferential parking dataset
const url3 =
  'http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/1/query?where=1%3D1&outFields=*&outSR=4326&f=json';

function initMap() {
  //business location
  const wfhc = { lat: 34.012938, lng: -118.46662 };

  map = new google.maps.Map(document.getElementById('map'), {
    center: wfhc,
    zoom: 14
  });

  function addMarker(coords) {
    let marker = new google.maps.Marker({
      position: coords,
      map: map
    });
  }

  addMarker(wfhc);

  fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      //drawParkingPath(myJson, 'lime');
    });

  const filterPermits = setFilterAttributes(['IMPLEMENTD']);
  filterPermits.IMPLEMENTD = 'yes';
  console.log(filterPermits);
  fetch(url3)
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      drawParkingPath(myJson, 'orange', filterPermits, 2);
    });
}

//End Initial Render
////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
//grab some other GIS data
function testAPIsFunc() {
  // change this line -> currentPathsArr = latLngThing.geometry.paths[0];
  // to this -> currentPathsArr = latLngThing.geometry.rings[0];
  // for some datasets
  let APIurl =
    'https://csmgisweb.smgov.net/csmgis01/rest/services/environment/watersheds/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json';
  APIurl =
    'http://csmgisweb.smgov.net/public/rest/services/bike_network/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json';
  fetch(url3)
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      //watershed data
      // showFieldAliasOptions(myJson, 'WATERSHED')
      // drawParkingPath(myJson, 'blue', {WATERSHED:'San Vicente'});
      for (var key in myJson.fieldAliases) {
        showFieldAliasOptions(myJson, key);
      }
      // myJson.fieldAliases.forEach((attribute)=>{
      //   showFieldAliasOptions(myJson, attribute);
      // })
    });
}

testAPIsFunc();
////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////
//show all street sweeping DAY/TIME combinations
//use setTimeout to wait for asynchronous call
setTimeout(function() {
  showFieldAliasOptions(smArcGisData, 'TIME');
}, 3000);

/////////////////
//just testing out some attribute data
/////////////////
let permitParkingData;
fetch(url3)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    permitParking = data;
  });

setTimeout(function() {
  showFieldAliasOptions(permitParking, 'IMPLEMENTD');
}, 3000);
