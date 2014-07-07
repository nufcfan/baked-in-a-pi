var wpi = require('wiring-pi');
var events = require('events');

var isRunning = false;
var interval = null;

var lightStates = {
	UNKNOWN : 0,
	ON: 1,
	OFF: 2
};

var min, max, cnt = 0;
var readings = [];
var readingsMax = 20;
var loggingTemp = false;
 
var lightState = lightStates.UNKOWN;
 
wpi.wiringPiSetupGpio();

var ldr = function(config) {
	this.config = config || {
		pin: 3,
		pollingInterval: 1000,
		lightSwitchThreshold: 88
	};
	events.EventEmitter.call(this);
};

ldr.prototype.__proto__ = events.EventEmitter.prototype;

ldr.prototype.readPin = function(pin, callback) { 
	var reading = 0;
	
	wpi.pinMode(pin, wpi.modes.OUTPUT);		
	wpi.pullUpDnControl(pin, wpi.PUD_OFF);
	wpi.digitalWrite(pin, wpi.LOW);

	setTimeout(function() {
		wpi.pinMode(pin, wpi.modes.INPUT);
		while(wpi.digitalRead(pin) == 0) {			
			reading++;
		};				
		callback(reading);
	}, 100);
};
 
ldr.prototype.start = function() {
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

					var r = Math.round(readings.reduce(function(sum, a) { return sum + a }, 0) / (readings.length != 0 ? readings.length : 1) / 2);
					console.log('ldr: ' + r + ' buffer: (' + readings.length + '/' + readingsMax + ')');
						
					self.emit('read', r);
						
					if(reading > self.config.lightSwitchThreshold) {
						if(lightState == lightStates.UNKOWN || lightState == lightStates.ON) {
							lightState = lightStates.OFF;
							self.emit('lights-off');						
						}
					} else 
					if(reading < self.config.lightSwitchThreshold) {
						if(lightState == lightStates.UNKOWN || lightState == lightStates.OFF) {
							lightState = lightStates.ON;
							self.emit('lights-on');						
						}
					}
				} else {
					console.log('skipping ldr reading');
				}
				cnt++;
			});						
		}, this.config.pollingInterval);	
	}
};

ldr.prototype.stop = function() { 
	if(isRunning) {
		isRunning = false;
		this.emit('stopped');
		clearInterval(interval);
		interval = null;
		wpi.pinMode(pin, wpi.modes.OUTPUT);		
		wpi.pullUpDnControl(pin, wpi.PUD_OFF);
		wpi.digitalWrite(pin, wpi.LOW);
	};
};

module.exports = ldr;
