(function (A, D) {
    var app = A.module('app'),
        uploadData = function (hwid) {
            var data = null,
                file = D.getElementById('file').files[0];
            if (file) {
                data = new FormData();
                data.append('hwid', hwid);
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
                    console.log(hw);
                    console.log(submission);
                    s.loading = false;
                    s.toggleHeader();
                });
            })
            s.upload = function () {
                var data = uploadData(s.detailHW._id);
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

}(angular, document));
