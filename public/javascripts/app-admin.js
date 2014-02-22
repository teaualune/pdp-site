(function (A) {
    var app = A.module('app');

    app.config(['$routeProvider', function (rp) {
        rp.when('/', {
            controller: 'DashboardCtrl',
            templateUrl: '/templates/dashboard-admin.html'
        }).when('/new', {
            controller: 'CreateCtrl',
            templateUrl: '/templates/detail.html'
        }).when('/edit/:udid', {
            controller: 'EditCtrl',
            templateUrl: '/templates/detail.html'
        }).otherwise({
            redirectTo: '/'
        });
    }]);
}(angular));
