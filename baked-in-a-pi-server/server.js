var io = require('socket.io').listen(80);
var dbConfig = require('./.pwd').db;
var ds18b20 = require('ds18x20');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://' + dbConfig.username + ':' + dbConfig.password + '@' + dbConfig.connectionString);

var ds180b20Schema = new Schema({
	sensorId: String,
	description:  String,
	reading: {},
	timestamp: { type: Date, default: Date.now }
});

var DS180B20Sensor = mongoose.model('DS180B20Sensor', ds180b20Schema);
//var address = '/sys/bus/w1/devices/28-000005cc39f1/w1_slave';

var temperatures = setInterval(function () {
	ds18b20.getAll(function (err, temp) {
		if (err) throw err;				
		for(var prop in temp) {
			var ds180b20Sensor = new DSDS180B20Sensor({ sensorId: prop, description: "Canopy", reading: temp });
			ds180b20Sensor.save(function(err) {
				console.log("Logged to DB: " + prop + ": " + temp);
			});
		}
	});
}, (1 * 60 * 1000));

var clients = io
    .of('/temperatures')
    .on('connection', function (socket) {
        var temperatures2 = setInterval(function () {
            ds18b20.getAll(function (err, temp) {
                if (err) throw err;				
                clients.emit("temperature", temp);				
            });
        }, (10 * 1000));

        socket.on('disconnect', function () {
            clearInterval(temperatures2);
        });
	});