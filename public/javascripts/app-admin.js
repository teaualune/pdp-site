(function (A, D) {
    var app = A.module('app'),
        prepareFormData = function (object) {
            var data = new FormData(),
                file = D.getElementById('file').files[0];
            data.append('title', object.title);
            data.append('description', object.description);
            if (object.sampleInput) {
                data.append('sampleInput', object.sampleInput);
            }
            if (object.sampleOutput) {
                data.append('sampleOutput', object.sampleOutput);
            }
            if (file) {
                data.append('file', file);
            }
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
        }).state('homework.stat', {
            url: '/stat/:hwid',
            templateUrl: '/templates/a/homework-status.html',
            controller: 'StatHWCtrl'
        }).state('homework.crossgrading', {
            url: '/cross-grading/:hwid',
            templateUrl: '/templates/a/homework-crossgrading.html',
            controller: 'CrossGradingHWCtrl'
        }).state('problem', {
            url: '/problem',
            templateUrl: '/templates/a/problem.html'
        }).state('problem.detail', {
            url: '/detail/:pid',
            templateUrl: '/templates/a/problem-detail.html',
            controller: 'DetailProblemCtrl'
        }).state('problem.new', {
            url: '/new',
            templateUrl: '/templates/a/problem-detail.html',
            controller: 'NewProblemCtrl'
        }).state('problem.stat', {
            url: '/stat/:pid',
            templateUrl: '/templates/a/problem-status.html',
            controller: 'StatProblemCtrl'
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
        'DestroyAlert',
        function (s, sp, HW, state, da) {
            s.editing = false;
            s.loading = true;
            s.hwid = sp.hwid;
            HW.show(sp.hwid, function (hw) {
                s.loading = false;
                s.detailHW = hw;
                s.toggleHeader();
            });
            s.save = function () {
                s.loading = true;
                HW.update(s.detailHW._id, prepareFormData(s.detailHW), function () {
                    s.loading = false;
                    state.go('homework.detail', {
                        hwid: s.detailHW._id
                    }, {
                        reload: true
                    });
                });
            };
            s.edit = function () {
                s.editing = !s.editing;
            };
            s.destroy = function () {
                if (confirm(da[0]) && confirm(da[1]) && confirm(da[2])) {
                    s.detailHW.remove();
                    state.go('homework', {}, {
                        reload: true
                    });
                }
            };
        }
    ]);

    app.controller('StatHWCtrl', [
        '$scope',
        '$stateParams',
        'Homework',
        '$state',
        function (s, sp, HW, state) {
            s.loading = true;
            s.hwid = sp.hwid;
            s.submitsCount = 0;
            HW.showStatus(sp.hwid, function (submissions) {
                s.loading = false;
                s.submissions = submissions;
                s.submitsCount = (function (submissions) {
                    var n = 0, i;
                    if (submissions) {
                        for (i = 0; i < submissions.length; i = i + 1) {
                            if (submissions[i].submission) {
                                n = n + 1;
                            }
                        }
                    }
                    return n;
                }(s.submissions));
                s.toggleHeader();
            });
        }
    ]);

    app.controller('CrossGradingHWCtrl', [
        '$scope',
        '$stateParams',
        'Homework',
        '$state',
        function (s, sp, HW, state) {
            s.loading = true;
            s.hwid = sp.hwid;
            HW.show(sp.hwid, function (hw) {
                s.loading = false;
                s.detailHW = hw;
                s.toggleHeader();
            });
        }
    ]);

    app.controller('NewHWCtrl', [
        '$scope',
        'Homework',
        '$state',
        function (s, HW, state) {
            s.toggleHeader();
            s.editing = s.editingNew = true;
            s.detailHW = {
                title: '',
                description: ''
            };
            s.loading = false;
            s.save = function () {
                s.loading = true;
                HW.create(prepareFormData(s.detailHW), function () {
                    state.go('homework', {}, {
                        reload: true
                    });
                });
            };
        }
    ]);

    app.controller('DetailProblemCtrl', [
        '$scope',
        '$stateParams',
        'Problem',
        '$state',
        'DestroyAlert',
        function (s, sp, Problem, state, da) {
            s.editing = false;
            s.loading = true;
            s.pid = sp.pid;
            Problem.show(sp.pid, function (problem) {
                s.loading = false;
                s.detailProblem = problem;
                s.toggleHeader();
            });
            s.save = function () {
                s.loading = true;
                Problem.update(s.detailProblem._id, prepareFormData(s.detailProblem), function () {
                    s.loading = false;
                    state.go('problem.detail', {
                        pid: s.detailProblem._id
                    }, {
                        reload: true
                    });
                });
            };
            s.edit = function () {
                s.editing = !s.editing;
            };
            s.destroy = function () {
                if (confirm(da[0]) && confirm(da[1]) && confirm(da[2])) {
                    s.detailProblem.remove();
                    state.go('problem', {}, {
                        reload: true
                    });
                }
            };
        }
    ]);

    app.controller('NewProblemCtrl', [
        '$scope',
        'Problem',
        '$state',
        function (s, Problem, state) {
            s.toggleHeader();
            s.editing = s.editingNew = true;
            s.detailProblem = {
                title: '',
                description: ''
            };
            s.loading = false;
            s.save = function () {
                s.loading = true;
                Problem.create(prepareFormData(s.detailProblem), function () {
                    state.go('problem', {}, {
                        reload: true
                    });
                });
            };
        }
    ]);

    app.controller('StatProblemCtrl', [
        '$scope',
        '$stateParams',
        'Problem',
        '$state',
        function (s, sp, Problem, state) {
            s.loading = true;
            s.pid = sp.pid;
            s.submitsCount = 0;
            Problem.showStatus(sp.pid, function (submissions) {
                s.loading = false;
                s.submissions = submissions;
                s.submitsCount = (function (submissions) {
                    var n = 0, i;
                    if (submissions) {
                        for (i = 0; i < submissions.length; i = i + 1) {
                            if (submissions[i].submission) {
                                n = n + 1;
                            }
                        }
                    }
                    return n;
                }(s.submissions));
                s.toggleHeader();
            });
        }
    ]);

}(angular, document));
