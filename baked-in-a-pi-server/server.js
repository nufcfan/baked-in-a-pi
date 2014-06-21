var io = require('socket.io').listen(80);
var ds18b20 = require('ds18x20');

var address = '/sys/bus/w1/devices/28-000005cc39f1/w1_slave';

io.sockets.on('connection', function (socket) {
    var temperatures = setInterval(function () {
        ds18b20.get(function (err, temp) {
            if (err) throw err;
            console.log(temp);
        });
    }, 100);

    socket.on('disconnect', function () {
        clearInterval(temperatures);
    });
});