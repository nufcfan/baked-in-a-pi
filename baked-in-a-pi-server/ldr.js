var wpi = require('wiring-pi');
var events = require('events');

var isRunning = false;
var interval = null;
 
wpi.wiringPiSetupGpio();

var ldr = function(config) {
	this.config = config || {
		pin: 3,
		pollingInterval: 1000,
		lightSwitchThreshold: 150
	};
	events.EventEmitter.call(this);
};

ldr.prototype.__proto__ = events.EventEmitter.prototype;

ldr.prototype.readPin = function(pin, callback) { 
	//console.log('reading pin ' + pin);

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
			//console.log('calling readPin');
			self.readPin(self.config.pin, function(reading){ 
				self.emit('read', reading);
				if(reading > self.config.lightSwitchThreshold) {
					// TODO: state change events
				} else 
				if(reading < self.config.lightSwitchThreshold) {
					// TODO: state change events
				}
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
