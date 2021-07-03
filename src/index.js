'use strict';
//NOTES
//Ensure dates are in YYYY/MM/DD, Safari does not suport YYYY-MM-DD.
//Remember months are 0-indexed in JavaScript
//TO DO
//Make led functional (add toggleHeater() method)
//Store app.state in a single file as json instead of multiple files
//store stage in a file
//store name in a file
//retreive all data on page load (component did mount?)
var host = '192.168.0.35';
var port = '4001';
var startDate = new Date;
var pinningDate;

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

		

function dateFormatter(date){
	return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
};


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

class App extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			name: "Name",
			stage: stages[0],
			temperature: 0,
			startDate: null,
			pinningDate: null,
			heater: false,
		};
	}
	
	//Retreive heater status every 2"
	getLedStatus(){
		fetch(`http://${host}:${port}/get-led`)
		.then(response => response.json())
		.then(data =>	this.setState({heater: data.state == 1 ? true : false}))	
	}

	handleName(){
		let	name = prompt('Do you want to rename your shrooms?');
		name && this.setState({name:name});
		let encodedName = encodeURI(name);
		fetch(`http://${host}:${port}/store-name?name=${encodedName}`, {method: 'PUT'})
		.then(response => response.json())
		.then(data => console.log(`Name: ${data.name} stored successfully`))
		.catch(error => console.error(error))
	}
	
	handleStart(){
		let today = dateFormatter(new Date);
		let date = prompt('Select starting date (yyyy/mm/dd).', `${today}`);
		const re = /^\d{4}(\/)([1-9]|((0)[1-9])|((1)[0-2]))(\/)([1-9]|[0-2][1-9]|20|10|(3)[0-1])$/;
		if (date == null){return}
		if (date != today){
			//check date format
			if (re.test(date)){ 
				date = dateFormatter(new Date(date));}
			//date is different than today but format not good
		  else {
				alert('Invalid date.');
				return}
		}
//		this.putDate(host, port,'store-starting-date', date);
		this.setState({startDate: date});
		this.putData();
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
	}

	getDates(){
 	  fetch(`http://${host}:${port}/start-date`)
		.then(response => response.json())
		.then(data =>	{
			startDate = data.startDate ? new Date(data.startDate) : null;
			pinningDate = data.pinningDate ? new Date(data.pinningDate) : null ;})
		.then(() => {
			this.setState({
				startDate: startDate,
				pinningDate: pinningDate});
			return
            ;q
		})
		.catch(error => {alert('Something went wrong'); console.error(error)})
	}
							
	componentDidMount(){
		//Retrieve heater status every 2"
		setInterval(() => this.getLedStatus(), 2000);
		this.getDates();
	}
	render(){
		return (
			<div id="container">
				<h1
						id="h00" 
						onClick={() => this.handleName()}>
						{this.state.name}</h1>
				<h1 id="h01"><span className="phantom">{this.state.name}</span></h1>

				<div id="main">
					<h2>{this.state.stage}</h2>
					<div id="times">
						<div id="age">
							<p><img src="syringe.png" alt="culture time" height="30px"/></p>
							<p>{this.state.startDate ? Math.floor((new Date - this.state.startDate)/1000/3600/24) : 0 } 
									day
									{Math.floor((new Date - this.state.startDate)/1000/3600/24)!= 1 ? "s" : ""}</p>
						</div>
						<div id="light-exposure">
							<p><img src="light-bulb.png" alt="light exposure" height="30px"/></p>
							<p>{this.state.pinningDate ? Math.floor((new Date - this.state.pinningDate)/1000/3600/24) : 0 }
								 day
								 {Math.floor((new Date - this.state.pinningDate)/1000/3600/24)!= 1 ? "s" : ""}</p>
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
