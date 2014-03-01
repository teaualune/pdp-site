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
        }).state('homework.new', {
            url: '/new',
            templateUrl: '/templates/a/homework-detail.html',
            controller: 'NewHWCtrl'
        }).state('homework.detail', {
            abstract: true,
            url: '/:hwid',
            templateUrl: '/templates/a/homework-menu.html',
            controller: 'DetailHWCtrl'
        }).state('homework.detail.overview', {
            url: '/overview',
            templateUrl: '/templates/a/homework-detail.html'
        }).state('homework.detail.stats', {
            url: '/stats',
            templateUrl: '/templates/a/homework-stats.html',
            controller: 'StatsHWCtrl'
        }).state('homework.detail.crossgrading', {
            url: '/cross-grading',
            templateUrl: '/templates/a/homework-crossgrading.html',
            controller: 'CrossGradingHWCtrl'
        });

        sp.state('problem', {
            url: '/problem',
            templateUrl: '/templates/a/problem.html'
        }).state('problem.new', {
            url: '/new',
            templateUrl: '/templates/a/problem-detail.html',
            controller: 'NewProblemCtrl'
        }).state('problem.detail', {
            abstract: true,
            url: '/:pid',
            templateUrl: '/templates/a/problem-menu.html',
            controller: 'DetailProblemCtrl'
        }).state('problem.detail.overview', {
            url: '/overview',
            templateUrl: '/templates/a/problem-detail.html'
        }).state('problem.detail.stats', {
            url: '/stats',
            templateUrl: '/templates/a/problem-stats.html',
            controller: 'StatsProblemCtrl'
        });

        sp.state('settings', {
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
                s.toggleListHeader();
            });
            s.save = function () {
                s.loading = true;
                HW.update(s.detailHW._id, prepareFormData(s.detailHW), function () {
                    s.loading = false;
                    state.go('homework.detail.overview', {
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

    app.controller('StatsHWCtrl', [
        '$scope',
        '$stateParams',
        'Homework',
        '$state',
        function (s, sp, HW, state) {
            s.loading = true;
            s.hwid = sp.hwid;
            s.submitsCount = 0;
            HW.showStats(sp.hwid, function (submissions) {
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
                s.toggleListHeader();
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
                s.toggleListHeader();
            });
        }
    ]);

    app.controller('NewHWCtrl', [
        '$scope',
        'Homework',
        '$state',
        function (s, HW, state) {
            s.toggleListHeader(true);
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
                s.toggleListHeader();
            });
            s.save = function () {
                s.loading = true;
                Problem.update(s.detailProblem._id, prepareFormData(s.detailProblem), function () {
                    s.loading = false;
                    state.go('problem.detail.overview', {
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
            s.toggleListHeader(true);
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

    app.controller('StatsProblemCtrl', [
        '$scope',
        '$stateParams',
        'Problem',
        '$state',
        function (s, sp, Problem, state) {
            s.loading = true;
            s.pid = sp.pid;
            s.submitsCount = 0;
            Problem.showStats(sp.pid, function (submissions) {
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
                s.toggleListHeader();
            });
        }
    ]);

}(angular, document));
