(function (A) {
    var app = A.module('app');

    app.config(['$routeProvider', function (rp) {
        rp.when('/', {
            controller: 'DashboardCtrl',
            templateUrl: '/templates/dashboard-students.html'
        }).when('/homework/:hwID', {
            controller: 'HomeworkCtrl',
            templateUrl: '/templates/hw-detail.html'
        }).when('/problems/:pID', {
            controller: 'ProblemCtrl',
            templateUrl: '/templates/problem-detail.html'
        }).when('/settings', {
            controller: 'SettingsCtrl',
            templateUrl: '/templates/settings-students.html'
        }).otherwise({
            redirectTo: '/'
        });
    }]);
}(angular));
