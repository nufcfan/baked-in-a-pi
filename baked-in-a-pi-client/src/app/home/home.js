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
  'ui.router'
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
.controller('HomeCtrl', function HomeController($scope, socket) {    
    socket.on('temperature', function(data) {
        console.log(JSON.stringify(data));
        var sensor = { };
        for(var key in data){
            if(data.hasOwnProperty(key)) {
                sensor.key = key;
                sensor.value = data[key];
                break;
            }
        }
        console.log(sensor.value);
        $scope.celcius = sensor.value;
    });
})

;
