(function (A) {

    var p = A.module('pdpResource', ['restangular']);

    p.config(['RestangularProvider', function (rp) {
        rp.setBaseUrl('/api');
        rp.setRestangularFields({
            id: '_id'
        });
    }]);

    p.factory('User', ['Restangular', function (R) {
        return {
            index: function (callback) {
                return R.all('user').getList().then(callback);
            },
            me: function (callback) {
                return R.all('user').customGET('me').then(callback);
            }
        }
    }]);

    p.factory('Homework', ['Restangular', function (R) {
        var _uploadHW = function (method, hwid, data, callback) {
                var request = new XMLHttpRequest(),
                    path = '/api/hw' + (hwid ? '/' + hwid : '');
                request.open(method, path);
                request.onload = function (e) {
                    var hw = JSON.parse(e.currentTarget.response);
                    callback(hw);
                };
                request.send(data);
            };
        return {
            index: function (callback) {
                return R.all('hw').getList().then(callback);
            },
            create: function (data, callback) {
                _uploadHW('POST', null, data, callback);
            },
            update: function (hwid, data, callback) {
                _uploadHW('PUT', hwid, data, callback);
            },
            show: function (hwid, callback) {
                return R.one('hw', hwid).get().then(callback);
            },
            studentIndex: function (uid, callback) {
                return R.one('user', uid).customGET('hw').then(callback);
            },
            showSubmission: function (uid, hwid, callback) {
                return R.one('user', uid).one('hw', hwid).get().then(callback);
            },
            uploadSubmission: function (uid, data, callback) {
                var request = new XMLHttpRequest(),
                    path = '/api/user/' + uid + '/hw';
                request.open('POST', path);
                request.onload = function (e) {
                    callback();
                };
                request.send(data);
            }
        }
    }]);

    p.factory('Global', [function () {
        return {};
    }]);

    p.run(['Global', 'User', function (Global, User) {
        User.me(function (me) {
            Global.me = me;
        });
    }]);

    p.factory('DestroyAlert', function () {
        return [
            'Are you sure you want to delete it?',
            'Are you really sure you want to delete it?',
            'Are you really really sure you want to delete it?'
        ];
    });

}(angular));
