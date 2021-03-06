(function (A, D) {
    var app = A.module('app'),
        prepareFormData = function (object) {
            var data = new FormData(),
                file = D.getElementById('file').files[0];
            data.append('title', object.title);
            data.append('description', object.description);
            data.append('deadline', object.deadline);
            data.append('isGroup', object.isGroup);
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
        },
        defaultQuesion = function () {
            return {
                question: 'Please give some comments for this submission.',
                type: 'comment'
            };
        };

    app.config(['$stateProvider', '$urlRouterProvider', function (sp, urp) {
        urp.otherwise('/homework');

        sp.state('homework', {
            url: '/homework',
            templateUrl: '/templates/homework-list.html'
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
        }).state('homework.detail.stats.grading', {
            url: '/grading/:id',
            templateUrl: '/templates/a/grading.html',
            controller: 'GradingHWCtrl'
        }).state('homework.detail.crossgrading', {
            url: '/cross-grading',
            templateUrl: '/templates/a/homework-crossgrading.html',
            controller: 'CrossGradingHWCtrl'
        });

        sp.state('problem', {
            url: '/problem',
            templateUrl: '/templates/problem-list.html'
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
        }).state('problem.detail.stats.grading', {
            url: '/grading/:id',
            templateUrl: '/templates/a/grading.html',
            controller: 'GradingProblemCtrl'
        });

        sp.state('settings', {
            url: '/settings',
            templateUrl: '/templates/settings.html'
        }).state('team', {
            url: '/team',
            templateUrl: '/templates/a/team.html',
            controller: 'TeamCtrl'
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
                    state.go('homework.detail.overview', { hwid: s.detailHW._id }, { reload: true });
                });
            };
            s.edit = function () {
                s.editing = !s.editing;
            };
            s.destroy = function () {
                if (confirm(da[0]) && confirm(da[1]) && confirm(da[2])) {
                    s.detailHW.remove();
                    state.go('homework', {}, { reload: true });
                }
            };
        }
    ]);

    app.controller('StatsHWCtrl', [
        '$scope',
        '$stateParams',
        'Homework',
        function (s, sp, HW) {
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

    app.controller('GradingHWCtrl', [
        '$scope',
        '$stateParams',
        'Homework',
        'Global',
        '$state',
        function (s, sp, HW, Global,state) {
            s.loading = true;
            HW.adminShowSubmission(sp.id, function (submission) {
                s.loading = false;
                s.submission = submission;
            });
            s.save = function () {
                s.submission.grading.author = Global.me._id;
                HW.saveGrading(s.submission, function () {
                    s.cancel();
                });
            };
            s.cancel = function () {
                state.go('^', {}, { reload: true });
            };
        }
    ]);

    app.controller('CrossGradingHWCtrl', [
        '$scope',
        '$stateParams',
        '$state',
        'Homework',
        'CrossGrading',
        'DestroyAlert',
        function (s, sp, state, HW, CG, da) {
            s.loading = true;
            s.hwid = sp.hwid;
            s.questions = [];
            CG.showByHw(s.hwid, function (cgs) {
                if (cgs && cgs.length !== 0) {
                    s.cgs = cgs;
                }
                s.loading = false;
            }, function () {
                s.loading = false;
            });
            s.start = function () {
                CG.start({
                    hwid: s.hwid,
                    questions: CG.toQuestionObject(s.questions),
                    count: s.replicaCount
                }, function () {
                    state.go('homework.detail.crossgrading', {}, { reload: true });
                }, function (err) {
                    alert(err.data);
                });
            };
            s.reset = function () {
                if (confirm(da[0]) && confirm(da[1]) && confirm(da[2])) {
                    CG.reset(s.hwid, function () {
                        state.go('homework.detail.crossgrading', {}, { reload: true });
                    });
                }
            }
            s.add = function () {
                s.questions.push(defaultQuesion());
            };
            s.remove = function (index) {
                s.questions.splice(index, 1);
            };
        }
    ]);

    app.controller('NewHWCtrl', [
        '$scope',
        'Homework',
        '$state',
        function (s, HW, state) {
            s.toggleListHeader();
            s.editing = s.editingNew = true;
            s.detailHW = {
                title: '',
                description: ''
            };
            s.loading = false;
            s.save = function () {
                s.loading = true;
                s.detailHW.isGroup = s.isGroup;
                HW.create(prepareFormData(s.detailHW), function () {
                    state.go('homework', {}, { reload: true });
                }, function (err) {
                    alert(err.data);
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
                    state.go('problem.detail.overview', { pid: s.detailProblem._id }, { reload: true });
                });
            };
            s.edit = function () {
                s.editing = !s.editing;
            };
            s.destroy = function () {
                if (confirm(da[0]) && confirm(da[1]) && confirm(da[2])) {
                    s.detailProblem.remove();
                    state.go('problem', {}, { reload: true });
                }
            };
        }
    ]);

    app.controller('NewProblemCtrl', [
        '$scope',
        'Problem',
        '$state',
        function (s, Problem, state) {
            s.toggleListHeader();
            s.editing = s.editingNew = true;
            s.detailProblem = {
                title: '',
                description: ''
            };
            s.loading = false;
            s.save = function () {
                s.loading = true;
                s.detailProblem.isGroup = s.isGroup;
                Problem.create(prepareFormData(s.detailProblem), function () {
                    state.go('problem', {}, { reload: true });
                }, function (err) {
                    alert(err.data);
                });
            };
        }
    ]);

    app.controller('StatsProblemCtrl', [
        '$scope',
        '$stateParams',
        'Problem',
        function (s, sp, Problem) {
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

    app.controller('GradingProblemCtrl', [
        '$scope',
        '$stateParams',
        'Problem',
        'Global',
        '$state',
        function (s, sp, Problem, Global, state) {
            s.loading = true;
            Problem.adminShowSubmission(sp.id, function (submission) {
                s.loading = false;
                s.submission = submission;
            });
            s.save = function () {
                s.submission.grading.author = Global.me._id;
                Problem.saveGrading(s.submission, function () {
                    s.cancel();
                });
            };
            s.cancel = function () {
                state.go('^', {}, { reload: true });
            }
        }
    ]);

    app.controller('TeamCtrl', [
        '$scope',
        'User',
        '$state',
        function (s, User, state) {
            var tempStudent;
            s.loading = true;
            User.students(function (students) {
                User.teams(function(teams) {
                    var i;
                    s.teams = {};
                    s.noTeamStudents = [];
                    for (i = 0; i < teams.length; i = i + 1) {
                        s.teams[teams[i]._id] = teams[i];
                        s.teams[teams[i]._id].students = [];
                    }
                    for (i = 0; i < students.length; i = i + 1) {
                        if (students[i].team) {
                            s.teams[students[i].team._id].students.push(students[i]);
                        } else {
                            s.noTeamStudents.push(students[i]);
                        }
                    }
                    s.loading = false;
                });
            });
            s.onDropToTeam = function ($data, tid) {
                User.assignTeam($data, tid, function () {
                    s.teams[tid].students.push(tempStudent);
                    tempStudent = null;
                });
            };
            s.dropSuccess = function ($event, $index, student, students) {
                tempStudent = students.splice($index, 1)[0];
            };
            s.newTeam = function () {
                User.newTeam(s.newTeamName, function () {
                    state.go('team', {}, { reload: true });
                });
            };
        }
    ]);

}(angular, document));
