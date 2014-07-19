var sensorLib = require('node-dht-sensor');
var events = require('events');

var isRunning = false;
var interval = null;

var min, max, cnt = 0;
var readings = [];
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
					min = min < reading ? min : reading;
					max = max > reading ? max : reading;
					readings.push(reading);
					if(readings.length > readingsMax) {
						readings.shift();
					}

					var t = Math.round(readings.reduce(function(sum, a) { return sum + a.temperature.toFixed(2) }, 0) / (readings.length != 0 ? readings.length : 1) / 2);
					var h = Math.round(readings.reduce(function(sum, a) { return sum + a.hunidity.toFixed(2) }, 0) / (readings.length != 0 ? readings.length : 1) / 2);
					
					console.log('dht11: t: ' + t  + ' h: ' + h + ' buffer: (' + readings.length + '/' + readingsMax + ')');
											
					self.emit('read', { t: t, h: h });
										
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