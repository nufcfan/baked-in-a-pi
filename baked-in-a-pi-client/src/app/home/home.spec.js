/**
 * Tests sit right alongside the file they are testing, which is more intuitive
 * and portable than separating `src` and `test` directories. Additionally, the
 * build process will exclude all `.spec.js` files from the build
 * automatically.
 */
describe('Home Controller', function() {

	var scope, ctrl, $httpBackend;

    // Load our app module definition before each test.
	beforeEach(module('baked-in-a-pi.home'));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service in order to avoid a name conflict.
    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
		$httpBackend = _$httpBackend_;
		$httpBackend.expectGET('api/temperatures').
			respond([
				{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
				{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
				{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
				{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
				{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
				{"x":"2014-07-06T17:45:01.372Z","temp":23.3}
			]);

		scope = $rootScope.$new();
		ctrl = $controller('HomeCtrl', { $scope: scope, socket: { on: function() {} } });
    }));
	
	xit('should create "data2" model with 6 readings fetched from xhr', function() {
		expect(scope.data2).toBeUndefined();
		$httpBackend.flush();
		expect(scope.data2).toEqual([
			{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
			{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
			{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
			{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
			{"x":"2014-07-06T17:45:01.372Z","temp":23.3},
			{"x":"2014-07-06T17:45:01.372Z","temp":23.3}
		]);
    });
});
    

