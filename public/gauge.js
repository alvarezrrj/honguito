google.charts.load('current', {'packages':['gauge']});
google.charts.setOnLoadCallback(drawChart);

const host = '192.168.0.35';
const port = '4001';
var chart;
var chartData;
var chartOptions;

function getTemperature(){
		fetch(`http://${host}:${port}/temperature`)
		.then(response => response.json())
		.then(jsonResponse => {
			if (jsonResponse.status >= 400)
				{console.log(`Error: ${jsonResponse.body}`)}
			else{
				var rawTemp = Number(jsonResponse.temp.slice(0, 3));
				chartTemp = rawTemp/10;
				chartData.setValue(0, 1, chartTemp);
				chart.draw(chartData, chartOptions);
			}
		})
	};
				
function drawChart() {
				var chartTemp = Number(document.getElementById('gauge-div').className);

        chartData = google.visualization.arrayToDataTable([
          ['Label', 'Value'],
          ['temp (°C)', chartTemp],
          ]);

     		 chartOptions = {
          min: 15, max: 35,
          yellowFrom:20 , yellowTo: 25.5,
          greenFrom: 25.5, greenTo: 28.5,
          redFrom: 28.5, redTo: 35,
          majorTicks:["15", "20", "25", "30", "35",],
          minorTicks: 5,
        };

        chart = new google.visualization.Gauge(document.getElementById('gauge-div'));
				//Draw chart at T=0 and redraw half a second later.
				chart.draw(chartData, chartOptions);
				setTimeout(getTemperature(), 500);
				

				//Call setInterval to retreive temperature every 15s.
				var intervalID = setInterval(getTemperature, 15000);
				//To clear interval:
				//clearInterval(intervalID);

      };

