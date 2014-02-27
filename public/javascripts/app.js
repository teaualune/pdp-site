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

}(angular, document));
