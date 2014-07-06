angular.module('baked-in-a-pi', [    
   'n3-line-chart',
  'templates-app',
  'templates-common',
  'btford.socket-io',
  'baked-in-a-pi.home',
  'baked-in-a-pi.about',
  'ui.router'])

.config(function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.run(function run () {
})

.controller('AppCtrl', function AppCtrl ($scope, $location) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | Baked in a Pi' ;
    }
  });
})

.factory('socket', function (socketFactory) {
    var myIoSocket = io.connect('http://192.168.1.20:80/');
    return socketFactory({
        ioSocket: myIoSocket
    });
})
  .value('version', '0.1')
;

