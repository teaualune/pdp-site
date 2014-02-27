(function (A) {
    var app = A.module('app');

    app.config(['$stateProvider', '$urlRouterProvider', function (sp, urp) {
        urp.otherwise('/homework');
        sp.state('homework', {
            url: '/homework',
            templateUrl: '/templates/s/homework.html',
        }).state('problems', {
            url: '/problems',
            templateUrl: '/templates/s/problems.html'
        }).state('crossgradings', {
            url: '/cross-gradings',
            templateUrl: '/templates/s/cross-gradings.html'
        }).state('settings', {
            url: '/settings',
            templateUrl: '/templates/settings.html'
        });
    }]);

}(angular));
