var io = require('socket.io').listen(80);
var ds18b20 = require('ds18x20');

var address = '/sys/bus/w1/devices/28-000005cc39f1/w1_slave';
var sensor = new ds18b20(address);

io.sockets.on('connection', function (socket) {
    var temperatures = setInterval(function () {
        sensor.read(function (data) {
            console.log(data);
        });
    }, 100);

    socket.on('disconnect', function () {
        clearInterval(temperatures);
    });
});