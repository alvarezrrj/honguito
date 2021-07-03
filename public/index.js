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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var host = '192.168.0.35';
var port = '4001';
var startDate = new Date();
var pinningDate;

var stages = ["incubation", "pinning", "fruiting"];

//led styles
var led = {
	on: {
		backgroundColor: "crimson",
		boxShadow: "1px 1px 0.3em red,	-1px -1px 0.3em red"
	},
	off: {
		backgroundColor: "grey"
	}
};

function dateFormatter(date) {
	return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
};

function Temperature(props) {
	return React.createElement(
		'div',
		{ id: 'thermometer' },
		React.createElement('div', { className: props.temp, id: 'gauge-div' }),
		React.createElement('div', {
			id: 'led',
			style: led[props.led ? "on" : "off"] })
	);
};

var App = function (_React$Component) {
	_inherits(App, _React$Component);

	function App(props) {
		_classCallCheck(this, App);

		var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

		_this.state = {
			name: "Name",
			stage: stages[0],
			temperature: 0,
			startDate: null,
			pinningDate: null,
			heater: false
		};
		return _this;
	}

	//Retreive heater status every 2"


	_createClass(App, [{
		key: 'getLedStatus',
		value: function getLedStatus() {
			var _this2 = this;

			fetch('http://' + host + ':' + port + '/get-led').then(function (response) {
				return response.json();
			}).then(function (data) {
				return _this2.setState({ heater: data.state == 1 ? true : false });
			});
		}
	}, {
		key: 'handleName',
		value: function handleName() {
			var name = prompt('Do you want to rename your shrooms?');
			name && this.setState({ name: name });
			var encodedName = encodeURI(name);
			fetch('http://' + host + ':' + port + '/store-name?name=' + encodedName, { method: 'PUT' }).then(function (response) {
				return response.json();
			}).then(function (data) {
				return console.log('Name: ' + data.name + ' stored successfully');
			}).catch(function (error) {
				return console.error(error);
			});
		}
	}, {
		key: 'handleStart',
		value: function handleStart() {
			var today = dateFormatter(new Date());
			var date = prompt('Select starting date (yyyy/mm/dd).', '' + today);
			var re = /^\d{4}(\/)([1-9]|((0)[1-9])|((1)[0-2]))(\/)([1-9]|[0-2][1-9]|20|10|(3)[0-1])$/;
			if (date == null) {
				return;
			}
			if (date != today) {
				//check date format
				if (re.test(date)) {
					date = dateFormatter(new Date(date));
				}
				//date is different than today but format not good
				else {
						alert('Invalid date.');
						return;
					}
			}
			//		this.putDate(host, port,'store-starting-date', date);
			this.setState({ startDate: date });
			this.putData();
		}
	}, {
		key: 'handleNext',
		value: function handleNext() {
			var currentStage = this.state.stage;
			switch (currentStage) {
				case stages[0]:
					var date = dateFormatter(new Date());
					this.putDate(host, port, 'store-pinning-date', date);
					this.setState({ stage: stages[1] });
					break;
				case stages[1]:
					this.setState({ stage: stages[2] });break;
				case stages[2]:
					break;
			}
		}
	}, {
		key: 'handleReset',
		value: function handleReset() {
			fetch('http://' + host + ':' + port + '/reset', { method: 'DELETE' }).then(function (response) {
				if (response.status == 204) {
					console.log('All good broh');
				} else {
					console.log('Error: ' + jsonR);
				}
			});
			this.setState({ age: 0, lightExposure: 0, stage: stages[0] });
			startDate = null;
			pinningDate = null;
		}
	}, {
		key: 'putDate',
		value: function putDate(host, port, endpoint, date) {
			var dateArray = date.split('/');
			fetch('http://' + host + ':' + port + '/' + endpoint + '?year=' + dateArray[0] + '&month=' + dateArray[1] + '&day=' + dateArray[2], { method: 'PUT' }).then(function (response) {
				return response.json();
			}).then(function (jsonR) {
				if (jsonR.status >= 400) {
					console.log('Something went wrong. Response status: ' + jsonR.status);
				} else {
					console.log('Start date ' + jsonR.date + ' logged successfuly');
					alert('Date logged');
				}
			});
		}
	}, {
		key: 'putData',
		value: function putData() {
			fetch('http://' + host + ':' + port + '/store-data', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(this.state)
			});
		}
	}, {
		key: 'getDates',
		value: function getDates() {
			var _this3 = this;

			fetch('http://' + host + ':' + port + '/start-date').then(function (response) {
				return response.json();
			}).then(function (data) {
				startDate = data.startDate ? new Date(data.startDate) : null;
				pinningDate = data.pinningDate ? new Date(data.pinningDate) : null;
			}).then(function () {
				_this3.setState({
					startDate: startDate,
					pinningDate: pinningDate });
				return;
			}).catch(function (error) {
				alert('Something went wrong');console.error(error);
			});
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this4 = this;

			//Retrieve heater status every 2"
			setInterval(function () {
				return _this4.getLedStatus();
			}, 2000);
			this.getDates();
		}
	}, {
		key: 'render',
		value: function render() {
			var _this5 = this;

			return React.createElement(
				'div',
				{ id: 'container' },
				React.createElement(
					'h1',
					{
						id: 'h00',
						onClick: function onClick() {
							return _this5.handleName();
						} },
					this.state.name
				),
				React.createElement(
					'h1',
					{ id: 'h01' },
					React.createElement(
						'span',
						{ className: 'phantom' },
						this.state.name
					)
				),
				React.createElement(
					'div',
					{ id: 'main' },
					React.createElement(
						'h2',
						null,
						this.state.stage
					),
					React.createElement(
						'div',
						{ id: 'times' },
						React.createElement(
							'div',
							{ id: 'age' },
							React.createElement(
								'p',
								null,
								React.createElement('img', { src: 'syringe.png', alt: 'culture time', height: '30px' })
							),
							React.createElement(
								'p',
								null,
								this.state.startDate ? Math.floor((new Date() - this.state.startDate) / 1000 / 3600 / 24) : 0,
								'day',
								Math.floor((new Date() - this.state.startDate) / 1000 / 3600 / 24) != 1 ? "s" : ""
							)
						),
						React.createElement(
							'div',
							{ id: 'light-exposure' },
							React.createElement(
								'p',
								null,
								React.createElement('img', { src: 'light-bulb.png', alt: 'light exposure', height: '30px' })
							),
							React.createElement(
								'p',
								null,
								this.state.pinningDate ? Math.floor((new Date() - this.state.pinningDate) / 1000 / 3600 / 24) : 0,
								'day',
								Math.floor((new Date() - this.state.pinningDate) / 1000 / 3600 / 24) != 1 ? "s" : ""
							)
						)
					),
					React.createElement(Temperature, {
						temp: this.state.temperature,
						led: this.state.heater
					}),
					React.createElement(
						'div',
						{ id: 'buttons' },
						React.createElement(
							'div',
							{ onClick: function onClick() {
									return _this5.handleStart();
								}, className: 'button', id: 'start-button' },
							React.createElement(
								'p',
								null,
								'start'
							)
						),
						React.createElement(
							'div',
							{ onClick: function onClick() {
									return _this5.handleNext();
								}, className: 'button', id: 'next-stage-button' },
							React.createElement(
								'p',
								null,
								'next'
							)
						),
						React.createElement(
							'div',
							{ onClick: function onClick() {
									return _this5.handleReset();
								}, className: 'button', id: 'reset-button' },
							React.createElement(
								'p',
								null,
								'reset'
							)
						)
					),
					React.createElement(
						'div',
						{ id: 'buttons-phantom' },
						React.createElement(
							'div',
							{ className: 'button', id: 'sb-phantom' },
							React.createElement(
								'p',
								{ id: 'phantom' },
								'start'
							)
						),
						React.createElement(
							'div',
							{ className: 'button', id: 'ns-phantom' },
							React.createElement(
								'p',
								{ id: 'phantom' },
								'next'
							)
						),
						React.createElement(
							'div',
							{ className: 'button', id: 'rb-phantom' },
							React.createElement(
								'p',
								{ id: 'phantom' },
								'reset'
							)
						)
					)
				)
			);
		}
	}]);

	return App;
}(React.Component);

;

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));
