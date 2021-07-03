const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const exec = require('child_process').exec;
const mongoose = require('mongoose');

const shroomSchema = new mongoose.Schema({
	name: String,
	stage: String,
	temperature: Number,
	startDate: Date,
	pinningDate: Date,
	heater: Boolean,
});

const Shroom = mongoose.model('Shroom', shroomSchema);

var app = express();
const port = process.env.PORT || 4001;

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());


//PUT starting date request
app.put('/store-starting-date', (req, res, next) => {
	let date = `${req.query.year}/${req.query.month}/${req.query.day}`;
	exec(`echo ${date} > ./start-date.txt`, (error, stdout, stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			res.status(500).send();}
		if (stderr){
			console.error(`stderr: ${stderr}`)
			res.status(500).send()}
		res.type('json').send({date: date});
	})
  }
);

//PUT data request
app.put('/store-data', (req, res, next) => {
	let data = new Shroom({
		name: req.body.name,
		stage: req.body.stage,
		temperature: req.body.temperature,
		startDate: req.body.startDate,
		pinningDate: req.body.pinningDate,
		heater: req.body.heater
	});
	data.save((err, data) => {
			if (err) {console.error(err)}
			else {res.status(200).send()}
		})

});


//PUT pinning date request
app.put('/store-pinning-date', (req, res, next) => {
	let date = `${req.query.year}/${req.query.month}/${req.query.day}`;
	exec(`echo ${date} > ./pinning-date.txt`, (error, stdout, stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			res.status(500).send();}
		if (stderr){
			console.error(`stderr: ${stderr}`)
			res.status(500).send()}
		res.type('json').send({date: date});
	})
});

//PUT name request
app.put('/store-name', (req, res, next) => {
	let name = req.query.name;
	exec(`echo ${name} > ./name.txt`, (error, stdout, stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			res.status(500).send();}
		if (stderr){
			console.error(`stderr: ${stderr}`)
			res.status(500).send()}
		res.type('json').send({name: name});
	})
})

//GET starting date request
app.get('/start-date', (req, res, next) => {
	fs.readFile('./start-date.txt', 'utf8', (err, data) => {
		if(err) {
				res.status(500).send(err.mesage);
		};
		let startDate = data;
		fs.readFile('./pinning-date.txt', 'utf8', (err, data) => {
			if(err) {
					res.status(500).send(err.message);
			};
			let pinningDate = data;
			res.type('json').send({startDate: startDate, pinningDate: pinningDate})
			});
	})
});

//GET temperature request
app.get('/temperature', (req, res, next) => {
	exec('tail -n1 temp_log.txt', (error, stdout, stderr) => {
		if (error){
			console.error(`exec error: ${error}`);
			res.status(500).send();}
		if (stderr){
			console.error(`stderr: ${stderr}`)
			res.status(500).send()}
		res.send({temp: stdout})
	})
});

//GET heater status request
app.get('/get-led', (req, res, next) => {
	fs.readFile('heater-status', 'utf8', (err, data) => {
		if (err) {res.status(500).send(err.message)}
		res.type('json').send({state: data})
	})
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

