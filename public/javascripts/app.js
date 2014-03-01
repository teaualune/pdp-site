(function (A, D) {

    var app = A.module('app', ['pdpResource', 'ui.router']);

    A.element(D.getElementById('menu-toggle')).on('click', function () {
        A.element(D.getElementById('menu')).toggleClass('on');
    });

    app.controller('SettingsCtrl', ['$scope', 'Global', function (s, Global) {
        s.user = Global.me;
        s.editing = false;
        s.nickname = s.user.nickname;
        s.edit = function () {
            s.editing = !s.editing;
        };
        s.submit = function () {
            Global.me.nickname = s.nickname;
            Global.me.put().then(function () {
                s.editing = false;
            });
        };
    }]);

    app.service('LocationIDExtracter', ['$location', function (location) {
        var hwExp = /\/homework\/([0-9]+)(\/([a-z]+))?/,
            problemExp = /\/problem\/([0-9]+)(\/([a-z]+))?/;
        this.findHwid = function () {
            var hwid = hwExp.exec(location.path());
            if (hwid) {
                hwid = hwid[1];
            }
            return hwid;
        };
        this.findPid = function () {
            var pid = problemExp.exec(location.path());
            if (pid) {
                pid = pid[1];
            }
            return pid;
        };
    }]);

    app.controller('HomeworkCtrl', [
        '$scope',
        'Homework',
        'Global',
        '$state',
        'LocationIDExtracter',
        function (s, HW, Global, state, lie) {
            HW.index(function (homeworks) {
                s.hws = homeworks;
                if (s.hws.length > 0) {
                    state.go('homework.detail.overview', {
                        hwid: s.hws[0]._id
                    });
                }
            });
            s.toggleListHeader = function (skip) {
                var hwid = lie.findHwid(),
                    i = 0,
                    hw;
                if (s.hws) {
                    for (i; i < s.hws.length; i = i + 1) {
                        s.hws[i].active = false;
                        if (!skip && s.hws[i]._id + '' === hwid) {
                            hw = s.hws[i];
                            break;
                        }
                    }
                    if (hw) {
                        hw.active = true;
                    }
                }
            };
        }
    ]);

    app.controller('ProblemCtrl', [
        '$scope',
        'Problem',
        'Global',
        '$state',
        'LocationIDExtracter',
        function (s, Problem, Global, state, lie) {
            Problem.index(function (problems) {
                s.problems = problems;
                if (s.problems.length > 0) {
                    state.go('problem.detail.overview', {
                        pid: s.problems[0]._id
                    });
                }
            });
            s.toggleListHeader = function (skip) {
                var pid = lie.findPid(),
                    i = 0,
                    problem;
                if (s.problems) {
                    for (i; i < s.problems.length; i = i + 1) {
                        s.problems[i].active = false;
                        if (!skip && s.problems[i]._id + '' === pid) {
                            problem = s.problems[i];
                            break;
                        }
                    }
                    if (problem) {
                        problem.active = true;
                    }
                }
            };
        }
    ]);

}(angular, document));
