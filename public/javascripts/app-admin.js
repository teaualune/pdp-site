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
        'LocationIDExtracter',
        function (s, HW, Global, state, lie) {
            HW.index(function (homeworks) {
                s.hws = homeworks;
                if (s.hws.length > 0) {
                    state.go('homework.detail', {
                        hwid: s.hws[0]._id
                    });
                }
            });
            s.toggleHeader = function () {
                var hwid = lie.findHwid(),
                    i = 0,
                    hw;
                if (s.hws) {
                    for (i; i < s.hws.length; i = i + 1) {
                        s.hws[i].active = false;
                        if (s.hws[i]._id === hwid) {
                            hw = s.hws[i];
                        }
                    }
                    if (hw) {
                        hw.active = true;
                    }
                }
            };
        }
    ]);

    app.controller('DetailHWCtrl', [
        '$scope',
        '$stateParams',
        'Homework',
        '$state',
        'DestroyAlert',
        function (s, sp, HW, state, da) {
            s.editing = false;
            HW.show(sp.hwid, function (hw) {
                s.detailHW = hw;
                s.toggleHeader();
            });
            s.loading = false;
            s.save = function () {
                s.loading = true;
                HW.update(s.detailHW._id, prepareFormData(s.detailHW), function () {
                    s.loading = false;
                    state.go('homework.detail', {
                        hwid: s.detailHW._id
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

}(angular, document));
