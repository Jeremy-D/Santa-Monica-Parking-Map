      //this version introduces an improved algorithm from the previous first and last
      //path point iteration
      
      let map;
      function initMap() {
        const wfhc = {lat: 34.012938, lng: -118.46662};
        map = new google.maps.Map(document.getElementById('map'), {
          center: wfhc,
          zoom: 14
        });

        function addMarker(coords){
          let marker = new google.maps.Marker({
            position:coords,
            map:map,
          });
        }


        addMarker(wfhc);
        addMarker({lat: 34.012900, lng: -118.46600});
        
        //add polyline by first and last item in latlng path array
        function addPolyline(coords){
          let path = [
            {lat: coords.lat1, lng:coords.lng1},
            {lat: coords.lat2, lng:coords.lng2}
          ]
          let polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#58D68D',
            strokeWeight: 2,
            strokeOpacity: 1
          })

          polyline.setMap(map)
        }

        //add polyline by whole path in latlng path array (ie not just first and last)
        function addPolyline2(pathArr){
          let path = pathArr;
          let polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: 'cyan',
            strokeWeight: 2,
            strokeOpacity: 1
          });
          polyline.setMap(map)
        }

        //fetch('http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&outSR=4326&f=json')
        fetch('http://csmgisweb.smgov.net/public/rest/services/planning_update/MapServer/3/query?where=1%3D1&outFields=*&geometry=-118.477%2C34.01%2C-118.455%2C34.017&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outSR=4326&f=json')
          .then(function(response){
            return response.json()
          })
          .then(function(myJson){
            console.log(myJson);
            console.log('^^^^')
            //console.log(myJson.features[0].geometry.paths[0])
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
              //console.log(myJson.features[i].geometry.paths[0][0])
              //console.log(myJson.features[i].attributes.OBJECTID);
              currentPathsArr = myJson.features[i].geometry.paths[0];

              if(myJson.features[i].attributes.DAY === 'Thursday'){
                currentPathsArr.forEach((latLngPoint)=>{
                  // currentPnt.lat = latLngPoint[1];
                  // currentPnt.lng = latLngPoint[0];
                  // latLngArr.push(currentPnt);

                  latLngArr.push(createPathObj(latLngPoint));
                  //console.log(latLngArr); 
                })
                console.log(latLngArr);
                latLngArrMaster.push(latLngArr);
                latLngArr = [];

                let firstPath = currentPathsArr[0];
                let lastPath = currentPathsArr[currentPathsArr.length - 1];
                //console.log(firstPath);

                //let lastItemInPath = geometry.paths[0];

                //currentPath.lng1 = myJson.features[i].geometry.paths[0][0][0];
                //currentPath.lat1 = myJson.features[i].geometry.paths[0][0][1];
                //currentPath.lng2 = myJson.features[i].geometry.paths[0][1][0];
                //currentPath.lat2 = myJson.features[i].geometry.paths[0][1][1];

                currentPath.lng1 = firstPath[0];
                currentPath.lat1 = firstPath[1];
                currentPath.lng2 = lastPath[0];
                currentPath.lat2 = lastPath[1];
    
                addPolyline(currentPath);

                console.log(latLngArrMaster);
                latLngArrMaster.forEach((latLngPath)=>{
                  addPolyline2(latLngPath);
                })
                //addPolyline2(latLngArr);
              }
              //console.log(latLngArr);
            }
          })

        //polyline robson to wellesley coords
        //addMarker({lat: 34.009426, lng: -118.463848});
        //addMarker({lat: 34.007302, lng: -118.464329})

        //create an invisible marker
        labelMarker = new google.maps.Marker({
          position: {lat: 34.009426, lng: -118.463848},
          map: map
        })

        //let myLabel = newLabel();

        let robsonToWellesley = [
          {lat: 34.009426, lng: -118.463848},
          {lat: 34.007302, lng: -118.464329}
        ];

        let roadPath = new google.maps.Polyline({
          path: robsonToWellesley,
          geodesic: true,
          strokeColor: 'orange',
          strokeWeight: 2
        })

        roadPath.setMap(map);
        // let marker = new google.maps.Marker({
        //   position: wfhc,
        //   map: map
        // })
      }

      