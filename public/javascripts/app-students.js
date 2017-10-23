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
        },
        toUTCDeadline = function (deadline) {
            return deadline.replace(' ', 'T') + ':00';
        };
    app.config(['$stateProvider', '$urlRouterProvider', function (sp, urp) {
        urp.otherwise('/homework');

        sp.state('homework', {
            url: '/homework',
            templateUrl: '/templates/homework-list.html'
        }).state('homework.detail', {
            abstract: true,
            url: '/:hwid',
            templateUrl: '/templates/s/homework-menu.html',
            controller: 'DetailHWCtrl'
        }).state('homework.detail.overview', {
            url: '/overview',
            templateUrl: '/templates/s/homework-detail.html'
        }).state('homework.detail.submission', {
            url: '/submission',
            templateUrl: '/templates/s/homework-submission.html'
        }).state('homework.detail.grades', {
            url: '/grades',
            templateUrl: '/templates/s/homework-grades.html'
        });

        sp.state('problem', {
            url: '/problem',
            templateUrl: '/templates/problem-list.html'
        }).state('problem.detail', {
            abstract: true,
            url: '/:pid',
            templateUrl: '/templates/s/problem-menu.html',
            controller: 'DetailProblemCtrl'
        }).state('problem.detail.overview', {
            url: '/overview',
            templateUrl: '/templates/s/problem-detail.html'
        }).state('problem.detail.submission', {
            url: '/submission',
            templateUrl: '/templates/s/problem-submission.html'
        }).state('problem.detail.grades', {
            url: '/grades',
            templateUrl: '/templates/s/problem-grades.html'
        });

        sp.state('crossgradings', {
            url: '/cross-gradings',
            templateUrl: '/templates/s/cross-gradings.html'
        }).state('crossgradings.detail', {
            url: '/cross-gradings/:id',
            templateUrl: '/templates/s/cg-detail.html',
            controller: 'CGDetailCtrl'
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
        'Global',
        function (s, sp, HW, state, Global) {
            s.loading = true;
            s.hwid = sp.hwid;
            HW.showSubmission(Global.me._id, sp.hwid, function (hw) {
                var utcDeadline = toUTCDeadline(hw.deadline);
                s.detailHW = hw;
                s.deadline = hw.deadline;
                s.expired = (new Date(utcDeadline)).getTime() < (new Date()).getTime();
                s.submission = hw.submission;
                s.loading = false;
                s.toggleListHeader();
            }, function () {
                s.loading = false;
                s.toggleListHeader();
            });
            s.upload = function () {
                var data = uploadData('hwid', s.detailHW._id);
                if (data) {
                    s.loading = true;
                    HW.uploadSubmission(Global.me._id, data, function () {
                        s.loading = false;
                        state.go('homework.detail.submission', { hwid: s.detailHW._id }, { reload: true });
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
            s.pid = sp.pid;
            s.wrongRandSrc = 'images/39310850.png';
            s.correctRandSrc = 'images/39310850.png';
            var wrongImageArray = ['39310850.png', '39333364.png', '39354170.png', '39377812.png',
                                   '39395742.png', '39413634.png', '58162933_p0_master1200.jpg',
                                   '58162933_p1_master1200.jpg', '58997710_p0.png', '59291932_p0.png',
                                   '59466612_p0_master1200.jpg', '59661271_p0.png', '59871341_p0.png'];
            var correctImageArray = ['42190217.png', '34831923.jpg', '36792055.jpg', '36810710.jpg',
                                     '38276020.png', '38356719.png', '38818557.png', '38858485.png',
                                     '60062408_p0.png', '62494394_p0.png', '62773158_p0.png',
                                     '63096478_p0.png', '53398704_p0.png', '50488807_p0.png',
                                     '50216515_p0.png', '48263756_p0.png', '45354816_p0.png'];
 
            Problem.showSubmission(Global.me._id, sp.pid, function (problem) {
                var utcDeadline = toUTCDeadline(problem.deadline);
                s.detailProblem = problem;
                s.deadline = problem.deadline;
                s.expired = (new Date(utcDeadline)).getTime() < (new Date()).getTime();
                s.submission = problem.submission;
                s.loading = false;
                s.wrongImageSrc = getRandomImage(wrongImageArray);
                s.correctImageSrc = getRandomImage(correctImageArray);
                s.toggleListHeader();
            }, function () {
                s.loading = false;
                s.toggleListHeader();
            });
            s.upload = function () {
                var data = uploadData('pid', s.detailProblem._id);
                if (data) {
                    s.loading = true;
                    s.wrongImageSrc = getRandomImage(wrongImageArray);
                    s.correctImageSrc = getRandomImage(correctImageArray);
                    Problem.uploadSubmission(Global.me._id, data, function () {
                        s.loading = false;
                        state.go('problem.detail.submission', { pid: s.detailProblem._id }, { reload: true });
                    });
                } else {
                    alert('Please choose file to upload.');
                }
            };
            
            function getRandomImage(imgArray) {
                var r = Math.floor(Math.random() * imgArray.length);
                return '/images/' + imgArray[r];
            }
        }
    ]);

    app.controller('CGCtrl', [
        '$scope',
        '$stateParams',
        'CrossGrading',
        '$state',
        'Global',
        'LocationIDExtracter',
        function (s, sp, CG, state, Global, lie) {
            CG.index(Global.me._id, function (cgs) {
                s.cgs = cgs;
                Global.cgs = cgs;
            });
            s.toggleListHeader = function () {
                var id = lie.findCgid(),
                    i = 0,
                    cg;
                if (s.cgs) {
                    for (i; i < s.cgs.length; i = i + 1) {
                        s.cgs[i].active = false;
                        if (s.cgs[i]._id + '' === id) {
                            cg = s.cgs[i];
                        }
                    }
                    if (cg) {
                        cg.active = true;
                    }
                }
            };
        }
    ]);

    app.controller('CGDetailCtrl', [
        '$scope',
        '$stateParams',
        'CrossGrading',
        '$state',
        'Global',
        function (s, sp, CG, state, Global) {
            s.loading = true;
            CG.show(sp.id, function (cg) {
                s.loading = false;
                s.cg = cg;
            }, function () {
                s.loading = false;
            });
            s.save = function () {
                CG.save(s.cg, Global.me._id, function () {
                    state.go('crossgradings');
                });
            }
        }
    ]);

}(angular, document));
