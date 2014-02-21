(function (A, D) {

    var app = A.module('app', ['pdpResource', 'ngRoute']);

    A.element(D.getElementById('settings-toggle')).on('click', function () {
        A.element(D.getElementById('settings-menu')).toggleClass('on');
    });

}(angular, document));
