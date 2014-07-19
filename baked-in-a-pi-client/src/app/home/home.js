/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module('baked-in-a-pi.home', [
  'ui.router',
  'angular-momentjs'
])
.config(function config( $stateProvider ) {
  $stateProvider.state( 'home', {
    url: '/home',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    data:{ pageTitle: 'Home' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller('HomeCtrl', ['$scope', 'socket', '$http', 
	function HomeController($scope, socket, $http) {    
		$scope.log = [];
		$scope.sensor = "Flowering Tent";
		$scope.data = [];
		$scope.options = {
			axes: {
				x: { key: "x", labelFunction: function (v) { 
						return moment(v).format("HH:mm");					
					}},
				y: { min: 20, max: 30 }, 
				y2: { min: 40, max: 95 }
			},
			series: [{
				y: "temp",
				label: "Floor temp",
				color: "#d62728",
				axis: "y",
				type: "line",
				thickness: "1px"
			}, {
				y: "temp2",
				label: "Canopy temp",
				color: "#d6ff28",
				axis: "y",
				type: "line",
				thickness: "1px"
			}, {
				y: "humidity",
				label: "Canopy humidity",
				color: "#d60028",
				axis: "y2",
				type: "line",
				thickness: "1px"
			}, {
				y: "light",
				label: "Canopy light",
				color: "#d627ff",
				axis: "y2",
				type: "line",
				thickness: "1px"
			}],
			lineMode: "linear",
			tension: 0.7,
			tooltipMode: "scrubber",
			drawLegend: true,
			drawDots: false
		};
		
		var lastTemp, lastLight, lastTemp2, lastHumidity = 0;
				
		function RefreshData() {		
			$scope.data.push({x: new Date(), temp: lastTemp, light: lastLight, temp2: lastTemp2, humidity: lastHumidity });
		};		
				
		socket.on('temperature', function(data) {
			var sensor = { };
			for(var key in data){
				if(data.hasOwnProperty(key)) {
					sensor.key = key;
					sensor.value = data[key];
					break;
				}
			}	
			
			lastTemp = sensor.value;
			
			console.log(lastTemp);
			console.log(JSON.stringify(data));

			$scope.celcius_now = $scope.sensor + " : Temperature " + lastTemp + " Light level " + lastLight;
			
			if(lastTemp && lastTemp > 0) {
				$scope.data.push({x: new Date(), temp: lastTemp, light: lastLight });
			}
		});
		
		socket.on('dht11-read', function(reading) {	
			lastHumidity = reading.h;
			lastTemp2 = reading.t;
			RefreshData();
			console.log('dht11: ' + JSON.stringify(reading));			
		});
		
		socket.on('light-level', function(reading) {	
			lastLight = reading;
			RefreshData();
			console.log('ldr: ' + reading);			
		});
		
		socket.on('lights-on', function(reading) {	
			var now = moment();
			$scope.log.push(now.format("HH:mm") + ": Lights switched on");
			RefreshData();
			console.log('ldr: ' + reading);			
		});
		
		socket.on('lights-off', function(reading) {	
			var now = moment();
			$scope.log.push(now.format("HH:mm") + ": Lights switched off");
			RefreshData();
			console.log('ldr: ' + reading);			
		});
		
		$http.get('/api/temperatures').success(function(data) {
			console.log('successful response from temperatures api');
			console.log(JSON.stringify(data));
			$scope.data2 = data.map(function(currentValue) {
				console.log(JSON.stringify(currentValue));
				return { x : new Date(currentValue.x), temp: currentValue.temp };
			});
		});	
	}	
]);
