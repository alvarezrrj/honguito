//TO DO
//Rewrite /reset


const express = require('express');
const ws = require('ws');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const exec = require('child_process').exec;
const mongoose = require('mongoose');

const shroomSchema = new mongoose.Schema({
	id: Number,
	name: String,
	stage: String,
	temperature: Number,
	startDate: Number,
	pinningDate: Number,
	heater: Boolean,
});

//Databse config
const Shroom = mongoose.model('Shroom', shroomSchema);

var myDB = 'mongodb://localhost/shroomDB';

mongoose.connect(myDB, {
	useNewUrlParser: true,  
	useUnifiedTopology: true 
});


//Server config
var app = express();
//Set env variables from shell with: $ export myVar=value
const port = process.env.PORT || 4001;

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());

//Websocket config
var expressWs = require('express-ws')(app);

//Might be able to delete these three lines
app.ws('/', (ws, req) => {
	});

//Get websocket server
var wSs = expressWs.getWss();

//PUT data request
app.put('/store-data', (req, res, next) => {
	console.log('store-data request received');
	let data = new Shroom({
		name: req.body.name,
		stage: req.body.stage,
		temperature: req.body.temperature,
		startDate: req.body.startDate,
		pinningDate: req.body.pinningDate,
		heater: req.body.heater
	});
	//Look up colony by name and avoid storing new one if already exists.
	Shroom.findOne({name: req.body.name})
	.exec(function(err, result) {
		if (result) {
			res.status(400).send(`Colony named ${req.body.name} already exists`);
		}
		else {
			data.save((err, data) => {
				if (err) {
					console.error(err);
					res.status(500).send(err);
				}
				else {res.status(200).send(data)}
			})
		}
	});
});


//PUT pinning date request
app.put('/store-pinning-date', (req, res, next) => {
	let date = `${req.query.year}/${req.query.month}/${req.query.day}`;
	exec(`echo ${date} > ./pinning-date.txt`, (error, stdout, stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			res.status(500).send(error);
		} else if (stderr){
			console.error(`stderr: ${stderr}`)
			res.status(500).send(stderr)
		} else {
			res.type('json').send({date: date});
		}
	})
});

//PUT name request
app.put('/store-name', (req, res, next) => {
	let name = req.query.name;
	Shroom.findOne({id: req.query._id}).exec((err, result) => {
		if (err) {
			res.status(404).send(err);
		} else {
			result.name = name;
			result.save();
			res.send('Name updated');
		}	
	});
});

//PUT temperature request (from ESP8266)
app.put('/temp', (req, res, next) => {
	let data = req.query.temp;
	exec(`echo ${data} >> ./temp_log.txt`, (error, stdout, stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			res.status(500).send(error);
		} else if (stderr){
			console.error(`stderr: ${stderr}`)
			res.status(500).send(stderr)
		} else {
			res.send();
		}
	});
	wSs.clients.forEach(client => client.send(JSON.stringify({temp: data})));
});


//PUT heater state request (from ESP8266)
app.put('/heater', (req, res, next) => {
	data = {heater: req.query.heater};
	wSs.clients.forEach(client => client.send(JSON.stringify(data)));
	res.send()
});

//GET data request
app.get('/data', (req, res, next) => {
	Shroom.find()
	.exec((err, result) => {
		if (err) {
			res.status(404).send('No colonies found');
		} else {
			res.send(result[0])
		}
	});
});


//RESTART request
app.delete('/reset', (req, res, next) => {
	exec(' > start-date.txt', (error, stdout, stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			res.status(500).send();}
		if (stderr){
			console.error(`stderr: ${stderr}`)
			res.status(500).send()}
		exec(' > pinning-date.txt', (error, stdout, stderr) => {
			if (error){
				console.error(`exec error: ${error}`);
				res.status(500).send();}
			if (stderr){
				console.error(`stderr: ${stderr}`)
				res.status(500).send()}
			res.status(204).send();
		})}
)});

app.listen(port, () => console.log(`Server listening on port ${port}`));

//Websocket config
const wSServer = new ws.Server({ server: app });
wSServer.on('connection', socket => {
	socket.on('open', () => {
		console.log('Socket opened');
		socket.send('Socket opened');
	});
	socket.on('message', data => console.log(String(data)));
});
