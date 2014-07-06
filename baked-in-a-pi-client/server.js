var express = require('express');
var path = require('path');

var dbConfig = require('../.pwd').db;

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(express.static(__dirname + '/build'));

app.get('/', function(req, res) {
	console.log('serving index.html');
	res.sendfile(__dirname + '/build/index.html');
});

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var connectionString = 'mongodb://' + dbConfig.username + ':' + dbConfig.password + '@' + dbConfig.connectionString;

console.log('Connectiong to :' + connectionString);
var M = mongoose.connect(connectionString);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('Successfully connected!');
	console.log(M.modelNames());
});

var ds180b20Schema = new Schema({
	sensorId: String,
	description:  String,
	reading: {},
	timestamp: { type: Date, default: Date.now }
});

app.get('/api/temperatures', function(req, res){
	console.log('GET: api/temperatures');	
	
	var T = mongoose.model('DS180B20Sensor', ds180b20Schema);
	
	T.count(function (err, count) {
		if (err) {
			console.log('ERROR: api/temperatures count');
		}
		console.log('there are %d sensor reading(s)', count);
		
		var t = new T({ sensorId: "test", description: "Canopy", reading: { "test" : 22 } });
		/* t.save(function(err) {
			console.log("saved one");
			T.count(function (err, count) {
				if (err) {
					console.log('ERROR: api/temperatures count');
				}
				console.log('there are %d sensor readings', count);
				
				T.find(function(err, readings) {
					if (err) {
						console.log('ERROR: api/temperatures');
						res.send(err);
					}		
					console.log(T.collection);
					console.log('TEMPERATURE: ' + JSON.stringify(readings));
					res.json(readings);
				});
			});
		}); */
		T.count(function (err, count) {
			if (err) {
				console.log('ERROR: api/temperatures count');
			}
			console.log('there are %d sensor readings', count);
			
			T.find(function(err, data) {
				if (err) {
					console.log('ERROR: api/temperatures');
					res.send(err);
				}
				
				console.log(data);
				
				var r = data.map(function(currentValue, index, array){
					var sensor = { x: new Date(), temp: 30 };
					console.log(currentValue);
					console.log(currentValue.reading);
					for(var key in currentValue.reading){
						if(currentValue.reading.hasOwnProperty(currentValue.sensorId)) {
							sensor.temp = currentValue.reading[currentValue.sensorId];
							console.log(key + ': ' + sensor.temp);
							break;
						}
					}
					
					console.log('TEMPERATURE: ' + JSON.stringify(sensor));	
					return sensor;					
				})
				
				res.json(r);
			});
		});
	});
});

app.listen(3000);
