'use strict';
//NOTES
//Ensure dates are in YYYY/MM/DD, Safari does not suport YYYY-MM-DD.
//Remember months are 0-indexed in JavaScript

//TO DO
//Fix handleName() (sends null to server after pressign 'cancel' on change name prompt)
//Rewrite put pinning date on server side to make it update database
//Make a favicon.ico
//Review all fetches (some are written in weird ways)

var host = '192.168.0.241';
var port = '4002';
var startDate = new Date;

//Initialize websocket connection
const socket = new WebSocket(`ws://${host}:${port}`);

const stages = ["incubation", "pinning", "fruiting"];

//led styles
const led = {
	on: {
		backgroundColor: "crimson",
		boxShadow: "1px 1px 0.3em red,	-1px -1px 0.3em red",
	},
	off: {
		backgroundColor: "grey"
	}
};


$(window).on('load', () => {
	$(`<svg
		 class="bi svgs"
		 width="22"
		 height="22"
		 role="img"
		 aria-label="New colony">
		<use xlink:href="/libraries/bootstrap-icons/bootstrap-icons.svg#plus-lg"/>
	     </svg>`).appendTo($('#plus-btn')).clone().appendTo($('#pb-phantom'));

});

function Temperature(props){
	return (
		<div id="thermometer">
			<div className={props.temp} id="gauge-div">
			</div>
			<div 
				id="led" 
				style={led[props.led ? "on" : "off"]}>
			</div>
		</div>
	)
};

function Header(props) {
	return (
		<div id="header">
			<select id="h00">
			</select>
			<select id="h01" className="phantom">
				<option></option>
			</select>
			<div className="button-container">
				<div 
					className="button"
					id="plus-btn"
					data-toggle="modal"
					data-target="#new-colony-modal">
				</div>
				<div 
					className="button"
					id="pb-phantom">
				</div>
			</div>
		
		</div>
	);
};

class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			id: '',
			name: 'Name',
			stage: stages[0],
			temperature: 0,
			startDate: null,	//int in ms from epoch
			pinningDate: null,	//int in ms from epoch
			heater: false,
		};
	}

	age(v){
		return this.state[v] ? Math.floor((new Date() - new Date(this.state[v])) / 1000 / 3600 / 24) : "0";
	}
	
	handleName(){
		let	name = prompt('Do you want to rename your shrooms?');
		name && this.setState({name:name});
		let encodedName = encodeURI(name);
		fetch(`http://${host}:${port}/store-name?name=${encodedName}&id=${this.state._id}`, {method: 'PUT'})
		.catch(error => console.error(error))
	}
	
	handleStart(){
		let today = dateFormatter(new Date);
		let date = prompt('Select starting date (yyyy/mm/dd).', today);
		const re = /^\d{4}(\/)([1-9]|((0)[1-9])|((1)[0-2]))(\/)([1-9]|[0-2][1-9]|20|10|(3)[0-1])$/;
		//check date format
		if (re.test(date)){ 
			date = new Date(date);
			this.setState({ startDate: date }, function () {
				this.putData();
			});
		}
		//date is different than today but format not good
		else {
			alert('Invalid date.');
			return
		}
	}

	handleNext(){
		let currentStage = this.state.stage;
		switch(currentStage){
			case stages[0]:
				let date = dateFormatter(new Date);
				this.putDate(host, port, 'store-pinning-date', date); 
				this.setState({stage: stages[1]});
				break;
			case stages[1]: this.setState({stage: stages[2]}); break;
			case stages[2]: break;
		}
	}

	handleReset(){
		fetch(`http://${host}:${port}/reset`, {method: 'DELETE'})
		.then(response => {
			if (response.status == 204){console.log(`All good broh`)}
			else {console.log(`Error: ${jsonR}`)}
		});
		this.setState({age: 0, lightExposure: 0, stage: stages[0]});
		startDate = null;
		pinningDate = null;
	}

	putDate(host, port, endpoint, date){
		let dateArray = date.split('/');
		fetch(`http://${host}:${port}/${endpoint}?year=${dateArray[0]}&month=${dateArray[1]}&day=${dateArray[2]}`, {method: 'PUT'})
		.then(response =>	response.json())
		.then(jsonR => {
			if (jsonR.status >= 400){
				console.log(`Something went wrong. Response status: ${jsonR.status}`)}
			else{
			console.log(`Start date ${jsonR.date} logged successfuly`);
			alert('Date logged');
			}})
}

	putData(){
		fetch(`http://${host}:${port}/store-data`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.state)
		})
		.catch(e => alert(e));
	}

	

	componentDidMount(){
		socket.onmessage = e => {
			let data = JSON.parse(e.data);
			if (data.heater){
				this.setState({heater: Number(data.heater) == 1});
			} else if (data.temp) {
				this.setState(
					{temperature: Number(data.temp.slice(0, 4))}, 
					function() {
						chartData.setValue(0, 1, this.state.temperature);
						chart.draw(chartData, chartOptions);
					}
				);
			}
		}
		$.ajax(`http://${host}:${port}/getAll`, {
			success: r => {
				console.log(r);
				r.forEach(e => {
					$('<option></option>')
					.html(e.name)
					.attr('value', e.name)
					.insertBefore($('#new'));
				});
			},
		});
	}

	render(){
		return (
			<div id="container">
			<Header handleNew={() => this.handleNew} />

			<div id="main">
			<h2>Stage: {this.state.stage}</h2>
			<div id="times">
			<div id="age">
			<p><img src="syringe.png" alt="culture time" height="30px"/></p>
			<p>{this.age('startDate')} 
			&nbsp;day
			{this.age('startDate') != 1 ? "s" : ""}</p>
			</div>
			<div id="light-exposure">
			<p><img src="light-bulb.png" alt="light exposure" height="30px"/></p>
			<p>{this.age('pinningDate')}
			&nbsp;day
			{this.age('pinningDate') != 1 ? "s" : ""}</p>
			</div>
			</div>
			<Temperature 
			temp={this.state.temperature} 
			led={this.state.heater}
			/>
			<div id="buttons">
			<div onClick={() => this.handleStart()} className="button" id="start-button">
			<p>start</p>
			</div>
			<div onClick={() => this.handleNext()} className="button" id="next-stage-button">
			<p>next</p>
			</div>
			<div onClick={() => this.handleReset()} className="button" id="reset-button">
			<p>reset</p>
			</div>
			</div>

			<div id="buttons-phantom">		
			<div className="button" id="sb-phantom">
			<p id="phantom">start</p>
			</div>
			<div className="button" id="ns-phantom">
			<p id="phantom">next</p>
			</div>
			<div className="button" id="rb-phantom">
			<p id="phantom">reset</p>
			</div>
			</div>
			</div>
			</div>
		);
	}
	};


ReactDOM.render(<App />, document.getElementById('app'));
