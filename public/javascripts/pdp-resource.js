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
                return R.all('user').then(callback);
            },
            show: function (uid, callback) {
                return R.one('user', uid).then(callback);
            }
        }
    }]);

    p.factory('Homework', ['Restangular', function (R) {
        return {
            index: function (callback) {
                return R.all('hw').then(callback);
            },
            create: function (hw, callback) {
                return R.all('hw').post(hw, {
                    'Content-Type': 'multiple/form-data'
                }).then(callback);
            }
        }
    }]);

}(angular));
