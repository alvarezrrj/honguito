google.charts.load('current', {'packages':['gauge']});
google.charts.setOnLoadCallback(drawChart);

var chart;
var chartData;
var chartOptions;

function drawChart() {
	var chartTemp = Number(document.getElementById('gauge-div').className);

	chartData = google.visualization.arrayToDataTable([
		['Label', 'Value'],
		['temp (°C)', chartTemp],
	]);

	chartOptions = {
		min: 15, max: 35,
		yellowFrom: 20, yellowTo: 26.5,
		greenFrom: 25.5, greenTo: 28.5,
		redFrom: 28.5, redTo: 35,
		majorTicks:["15", "20", "25", "30", "35",],
		minorTicks: 5,
	};

	chart = new google.visualization.Gauge(document.getElementById('gauge-div'));
	chart.draw(chartData, chartOptions);
};
