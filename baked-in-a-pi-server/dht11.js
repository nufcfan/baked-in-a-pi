var sensorLib = require('node-dht-sensor');
var events = require('events');

var isRunning = false;
var interval = null;

var cnt = 0;
var temperatures = [];
var humidities = [];

var readingsMax = 20;
var loggingTemp = false;

var dht11 = function(config) {
	this.config = config || {
		pin: 7,
		pollingInterval: 1000
	};
	
	events.EventEmitter.call(this);
	
	if(!sensorLib.initialize(11, this.config.pin)){
		throw "Error initialising the dht11 sensor";
	}
};

dht11.prototype.__proto__ = events.EventEmitter.prototype;

dht11.prototype.readPin = function(pin, callback) {
	var reading = sensorLib.read();
	callback(reading);
}

dht11.prototype.start = function() {
	var self = this;
  	if(!isRunning) {
		isRunning = true;
		self.emit('started');
		interval = setInterval(function() {
			self.readPin(self.config.pin, function(reading){ 
				if(!loggingTemp && cnt > 0) {
					
					var t1 = reading.temperature.toFixed(0);
					var h1 = reading.humidity.toFixed(0);
					
					if((!isNaN(t1) && (t1 > 0 && t1 < 99)) && (!isNaN(h1) && (h1 > 0 && h1 < 99))) {
						temperatures.push(t1);
					
						if(temperatures.length > readingsMax) {
							temperatures.shift();
						}
					
						humidities.push(h1);
						
						if(humidities.length > readingsMax) {
							humidities.shift();
						}
						
						console.log("dht: " + JSON.stringify(reading));

						var t = Math.round(temperatures.reduce(function(sum, a) { return sum + a }, 0) / (temperatures.length != 0 ? temperatures.length : 1) /2);
						var h = Math.round(humidities.reduce(function(sum, a) { return sum + a }, 0) / (humidities.length != 0 ? humidities.length : 1) /2);
						
console.log("ts: " + JSON.stringify(temperatures));
						console.log('dht11: t: ' + t1  + ' h: ' + h1 + ' buffer: (' + humidities.length + '/' + readingsMax + ')');
												
						self.emit('read', { t: t1, h: h1 });
					}
				} else {
					console.log('skipping dht11 reading');
				}
				cnt++;
			});						
		}, this.config.pollingInterval);	
	}
};

dht11.prototype.stop = function() { 
	if(isRunning) {
		isRunning = false;
		this.emit('stopped');
		clearInterval(interval);
		interval = null;
	};
};

module.exports = dht11;
