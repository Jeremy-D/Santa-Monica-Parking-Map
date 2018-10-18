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
//test processLatLngData()
const processLatLngDataTest = document.getElementById('process-lat-lng-data');
processLatLngDataTest.addEventListener('click', function(){
  processLatLngData(smArcGisData);
})