(function (A, D) {
    var app = A.module('app'),
        prepareFormData = function (hw) {
            var data = new FormData(),
                file = D.getElementById('file').files[0];
            data.append('title', hw.title);
            data.append('description', hw.description);
            data.append('file', file);
            return data;
        };

    app.config(['$stateProvider', '$urlRouterProvider', function (sp, urp) {
        urp.otherwise('/homework');
        sp.state('homework', {
            url: '/homework',
            templateUrl: '/templates/a/homework.html'
        }).state('homework.detail', {
            url: '/detail/:hwid',
            templateUrl: '/templates/a/homework-detail.html',
            controller: 'DetailHWCtrl'
        }).state('homework.new', {
            url: '/new',
            templateUrl: '/templates/a/homework-detail.html',
            controller: 'NewHWCtrl'
        }).state('problems', {
            url: '/problems',
            templateUrl: '/templates/a/problems.html'
        }).state('crossgradings', {
            url: '/cross-gradings',
            templateUrl: '/templates/a/cross-gradings.html'
        }).state('settings', {
            url: '/settings',
            templateUrl: '/templates/settings.html'
        });
    }]);

    app.controller('HomeworkCtrl', [
        '$scope',
        'Homework',
        'Global',
        '$state',
        function (s, HW, Global, state) {
            HW.index(function (homeworks) {
                s.hws = homeworks;
                state.go('homework.detail', {
                    hwid: s.hws[0]._id
                });
            });
        }
    ]);

    app.controller('DetailHWCtrl', [
        '$scope',
        '$stateParams',
        'Homework',
        '$state',
        function (s, sp, HW, state) {
            HW.show(sp.hwid, function (hw) {
                s.detailHW = hw;
            });
            s.loading = false;
            s.save = function () {
                s.loading = true;
                HW.update(s.detailHW._id, prepareFormData(s.detailHW), function () {
                    s.loading = false;
                });
            };
        }
    ]);

    app.controller('NewHWCtrl', [
        '$scope',
        'Homework',
        '$state',
        function (s, HW, state) {
            s.detailHW = {
                title: '',
                description: ''
            };
            s.loading = false;
            s.save = function () {
                s.loading = true;
                HW.create(prepareFormData(s.detailHW), function (hw) {
                    s.hws.push(hw);
                    s.loading = false;
                    state.go('homework.detail', {
                        hwid: hw._id
                    });
                });
            };
        }
    ]);

}(angular, document));
