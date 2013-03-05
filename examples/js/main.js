var $controllersModule = angular.module('$controllersModule', []);

var app = angular.module('myApp', ['$controllersModule'])
    .config([
      '$routeProvider',
      function (r) {
          r.when('/', { templateUrl: './views/home.html' });
          //r.when('/docs', { templateUrl: './views/docs.html' });
          r.when('/docs', { templateUrl: './views/docs.html', reloadOnSearch: false, controller: 'docsController' });
          r.when('/examples', { templateUrl: './views/examples.html' });
          r.when('/examples/:exNum', { templateUrl: './views/examples.html', reloadOnSearch: false });
          r.when('/plugins', { templateUrl: './views/plugins.html' });
          r.when('/about', { templateUrl: './views/about.html' });
          r.otherwise({ redirectTo: '/' });
      }
    ])
    .controller('mainController', ['$scope', '$location', '$window', function (scope, location, $window) {
        scope.$watch(function () {
            return location.$$search['e'];
        }, function (searchVal) {
            var obj = angular.element('#' + searchVal);
            if (obj.length > 0) {
                offset = obj.offset();;
                console.log(JSON.stringify(offset));
                $($window).scrollTop(obj[0].scrollHeight);
            }
            
        })
    }]);