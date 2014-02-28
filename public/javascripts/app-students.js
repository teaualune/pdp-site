(function (A, D) {
    var app = A.module('app'),
        uploadData = function (key, id) {
            var data = null,
                file = D.getElementById('file').files[0];
            if (file) {
                data = new FormData();
                data.append(key, id);
                data.append('file', file);
            }
            return data;
        };

    app.config(['$stateProvider', '$urlRouterProvider', function (sp, urp) {
        urp.otherwise('/homework');
        sp.state('homework', {
            url: '/homework',
            templateUrl: '/templates/s/homework.html'
        }).state('homework.detail', {
            url: '/detail/:hwid',
            templateUrl: '/templates/s/homework-detail.html',
            controller: 'DetailHWCtrl'
        }).state('problem', {
            url: '/problem',
            templateUrl: '/templates/s/problem.html'
        }).state('problem.detail', {
            url: '/detail/:pid',
            templateUrl: '/templates/s/problem-detail.html',
            controller: 'DetailProblemCtrl'
        }).state('crossgradings', {
            url: '/cross-gradings',
            templateUrl: '/templates/s/cross-gradings.html'
        }).state('settings', {
            url: '/settings',
            templateUrl: '/templates/settings.html'
        });
    }]);

    app.controller('DetailHWCtrl', [
        '$scope',
        '$stateParams',
        'Homework',
        '$state',
        'Global',
        function (s, sp, HW, state, Global) {
            s.loading = true;
            HW.show(sp.hwid, function (hw) {
                s.detailHW = hw;
                HW.showSubmission(Global.me._id, sp.hwid, function (submission) {
                    s.submission = submission;
                    s.loading = false;
                    s.toggleHeader();
                }, function () {
                    s.loading = false;
                    s.toggleHeader();
                });
            });
            s.upload = function () {
                var data = uploadData('hwid', s.detailHW._id);
                if (data) {
                    s.loading = true;
                    HW.uploadSubmission(Global.me._id, data, function () {
                        s.loading = false;
                        state.go('homework.detail', {
                            hwid: s.detailHW._id
                        }, {
                            reload: true
                        });
                    });
                } else {
                    alert('Please choose file to upload.');
                }
            };
        }
    ]);

    app.controller('DetailProblemCtrl', [
        '$scope',
        '$stateParams',
        'Problem',
        '$state',
        'Global',
        function (s, sp, Problem, state, Global) {
            s.loading = true;
            Problem.show(sp.pid, function (problem) {
                s.detailProblem = problem;
                Problem.showSubmission(Global.me._id, sp.pid, function (submission) {
                    s.submission = submission;
                    s.loading = false;
                    s.toggleHeader();
                }, function () {
                    s.loading = false;
                    s.toggleHeader();
                });
            });
            s.upload = function () {
                var data = uploadData('pid', s.detailProblem._id);
                if (data) {
                    s.loading = true;
                    Problem.uploadSubmission(Global.me._id, data, function () {
                        s.loading = false;
                        state.go('problem.detail', {
                            pid: s.detailProblem._id
                        }, {
                            reload: true
                        });
                    });
                } else {
                    alert('Please choose file to upload.');
                }
            };
        }
    ]);

}(angular, document));
