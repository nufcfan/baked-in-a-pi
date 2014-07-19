var io = require('socket.io').listen(80);
var dbConfig = require('./.pwd').db;
var ds18b20 = require('ds18x20');
var ldr = require('./ldr.js');
var dht11 = require('./dht11.js');

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

var ldrSensor = new ldr();

ldrSensor.on('started', function(reading){
	console.log('ldr sensor started');
});

ldrSensor.on('stopped', function(reading){
	console.log('ldr sensor stopped');
});

var min, max, cnt = 0;
var readings = [];
var readingsMax = 20;
var loggingTemp = false;

ldrSensor.on('read', function(reading){
	clients.emit('light-level', reading);
});

ldrSensor.on('lights-on', function(reading){
	clients.emit('lights-on', reading);
});

ldrSensor.on('lights-off', function(reading){
	clients.emit('lights-off', reading);
});

ldrSensor.start();

var dht11Sensor = new dht11();

dht11Sensor.on('started', function(reading){
	console.log('dht11 sensor started');
});

dht11Sensor.on('stopped', function(reading){
	console.log('dht11 sensor stopped');
});

dht11Sensor.on('read', function(reading){
	clients.emit('dht11-reading', reading);
});

dht11Sensor.start();

var ds180b20Schema = new Schema({
	sensorId: String,
	description:  String,
	reading: {},
	timestamp: { type: Date, default: Date.now }
});

var DS180B20Sensor = mongoose.model('DS180B20Sensor', ds180b20Schema);

var temperatures = setInterval(function () {
	console.log('Reading temperarure sensors ...');
	loggingTemp = true;
	ds18b20.getAll(function (err, temp) {
		if (err) throw err;				
		for(var prop in temp) {
			var ds180b20Sensor = new DS180B20Sensor({ sensorId: prop, description: "Canopy", reading: temp });
			console.log('Saving ...');
			ds180b20Sensor.save(function(err) {
				console.log("Logged to DB: " + prop + ": " + JSON.stringify(ds180b20Sensor));
				loggingTemp = false;
			});
		}
	});
}, (1 * 60 * 1000));

var temperatures2 = null;

var clients = io
    .on('connection', function (socket) {
        console.log('socket connected ...');
		temperatures2 = temperatures2 || setInterval(function () {
            ds18b20.getAll(function (err, temp) {
                if (err) throw err;				
                clients.emit("temperature", temp);				
            });
        }, (10 * 1000));

        socket.on('disconnect', function () {
            clearInterval(temperatures2);
			temperatures2 = null;
        });
	});
