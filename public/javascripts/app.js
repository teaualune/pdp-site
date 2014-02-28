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
        this.findHwid = function () {
            var hwid = /\/homework\/detail\/([0-9]+)/.exec(location.path());
            if (hwid) {
                hwid = hwid[1];
            }
            return hwid;
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
                        if (s.hws[i]._id + '' === hwid) {
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

}(angular, document));
