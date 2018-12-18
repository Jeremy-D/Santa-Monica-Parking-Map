var drawMondayParkingBtn = document.getElementById('draw-new-path');
//drawMondayParkingBtn.addEventListener('click', drawParkingPath(smArcGisData));
drawMondayParkingBtn.addEventListener('click', function() {
	drawParkingPath(smArcGisData, 'lime');
});

var eraseMondayPath = document.getElementById('erase-monday-path');
eraseMondayPath.addEventListener('click', eraseParkingPath);

const daySelect = document.getElementById('day-select');
//daySelect.addEventListener('change', function(){drawParkingPath(`${this.value}`, smArcGisData, 'blue')})
daySelect.addEventListener('change', function() {
	updateFilterAttributes(setupFilterAttributes, 'DAY', this.value);
});

const timeSelect = document.getElementById('time-select');
timeSelect.addEventListener('change', function() {
	updateFilterAttributes(setupFilterAttributes, 'TIME', this.value);
});

let setupFilterAttributes = setFilterAttributes(['DAY', 'TIME']);

const drawPathDopeFunc = document.getElementById('draw-path-dope-func');
drawPathDopeFunc.addEventListener('click', function() {
	drawParkingPath(smArcGisData, 'red', setupFilterAttributes, 2);
});
