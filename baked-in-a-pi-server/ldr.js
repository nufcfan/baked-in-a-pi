var wpi = require('wiring-pi');
var events = require('events');

var isRunning = false;
var interval = null;
 
wpi.setup('gpio');
wpi.wiringPisetup();

var ldr = function(config) {
	this.config = config || {
		pin: 9,
		pollingInterval: 1000,
		lightSwitchThreshold = 500
	};
 	events.EventEmitter.call(this);
};

ldr.prototype.__proto__ = events.EventEmitter.prototype;

ldr.prototype.readPin = function(pin) { 
	//reading = 0
	var reading = 0;

	//GPIO.setup(RCpin, GPIO.OUT)        
	wpi.pinMode(pin, wpi.modes.OUTPUT);
		
	//GPIO.output(RCpin, GPIO.LOW)
	wpi.pullUpDnControl(pin, PUD_DOWN)

	//time.sleep(.1)
	setTimeout(function() {
		//GPIO.setup(RCpin, GPIO.IN)
		wpi.pinMode(pin, wpi.modes.INPUT);
		
		//# This takes about 1 millisecond per loop cycle
        //while (GPIO.input(RCpin) == GPIO.LOW):
        //        reading += 1		
		while(wpi.digitalRead(pin) == 0) {
			reading++;
		};
		return reading;
		
	}, 100);
 };
 
ldr.prototype.start = function() {
  	if(!isRunning) {
		isRunning = true;
		this.emit('started');
		interval = setInterval(function() {
			var reading = this.readPin(this.config.pin);
			this.emit('read', reading);
			if(reading > this.config.lightSwitchThreshold) {
				// TODO: state change events
			} else 
			if(reading < this.config.lightSwitchThreshold) {
				// TODO: state change events
			} 			
		}, this.config.pollingInterval);	
	}
};

ldr.prototype.stop = function() { 
	if(isRunning) {
		isRunning = false;
		this.emit('stopped');
		clearInterval(interval);
		interval = null;
	};
};

module.exports = ldr;