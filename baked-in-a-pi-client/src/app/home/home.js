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
		$scope.sensor = "Canopy";
		$scope.data = [];
		$scope.options = {
			axes: {
				x: {key: "x", labelFunction: function (v) { 
						return moment(v).format("HH:mm");					
					}},
				y: {min: 18, max: 33}
			},
			series: [{
				y: "temp",
				label: "Canopy",
				color: "#d62728",
				axis: "y",
				type: "line",
				thickness: "1px"
			}],
			lineMode: "linear",
			tension: 0.7,
			tooltipMode: "scrubber",
			drawLegend: true,
			drawDots: true
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
			
			console.log(sensor.value);
			console.log(JSON.stringify(data));

			$scope.celcius_now = $scope.sensor + " : " + sensor.value;
			if(sensor.value && sensor.value > 0) {
				$scope.data.push({x: new Date() , temp: sensor.value });
			}
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
