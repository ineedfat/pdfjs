$controllersModule.controller('docsController', ['$scope', '$location',
    function (scope, location) {
        var baseURL = './views/doc/';
        scope.link = 'index.html';

        scope.$watch(function() {
            return location.$$search['link'];
        }, function(searchVal) {
            if (searchVal) {
                scope.link = baseURL + searchVal;
            } else {
                scope.link = baseURL + 'index.html';
            }
        });
    }]);