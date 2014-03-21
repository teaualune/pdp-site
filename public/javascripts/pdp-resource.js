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
            },
            assignTeam: function (user, tid, callback) {
                return R.one('user', user._id).customPUT({ tid: tid }, 'team').then(callback);
            },
            students: function (callback) {
                return R.all('user').getList({ admin: 0 }).then(callback);
            },
            teamMembers: function (tid, callback) {
                return R.one('team', tid).customGET('users').then(callback);
            },
            teams: function (callback) {
                return R.all('team').getList().then(callback);
            },
            newTeam: function (name, callback) {
                return R.all('team').customPOST({ name: name }, '').then(callback);
            }
        };
    }]);

    p.factory('Homework', ['Restangular', function (R) {
        var _uploadHW = function (method, hwid, data, done, fail) {
                var request = new XMLHttpRequest(),
                    path = '/api/hw' + (hwid ? '/' + hwid : '');
                request.open(method, path);
                request.onload = function (e) {
                    var hw = JSON.parse(e.currentTarget.response);
                    done(hw);
                };
                request.onerror = fail;
                request.send(data);
            };
        return {
            index: function (done, fail) {
                return R.all('hw').getList().then(done, fail);
            },
            create: function (data, done, fail) {
                _uploadHW('POST', null, data, done, fail);
            },
            update: function (hwid, data, done, fail) {
                _uploadHW('PUT', hwid, data, done, fail);
            },
            show: function (hwid, done, fail) {
                return R.one('hw', hwid).get().then(done, fail);
            },
            studentIndex: function (uid, done, fail) {
                return R.one('user', uid).customGET('hw').then(done, fail);
            },
            showSubmission: function (uid, hwid, done, fail) {
                return R.one('user', uid).one('hw', hwid).get().then(done, fail);
            },
            showStats: function (hwid, done, fail) {
                return R.one('hw', hwid).customGET('hws').then(done, fail);
            },
            adminShowSubmission: function (hwsid, done, fail) {
                return R.one('hws', hwsid).get().then(done, fail);
            },
            saveGrading: function (hws, done, fail) {
                return hws.put().then(done, fail);
            },
            uploadSubmission: function (uid, data, done, fail) {
                var request = new XMLHttpRequest(),
                    path = '/api/user/' + uid + '/hw';
                request.open('POST', path);
                request.onload = done;
                request.onerror = fail;
                request.send(data);
            }
        };
    }]);

    p.factory('Problem', ['Restangular', function (R) {
        var _uploadProblem = function (method, pid, data, done, fail) {
                var request = new XMLHttpRequest(),
                    path = '/api/problem' + (pid ? '/' + pid : '');
                request.open(method, path);
                request.onload = function (e) {
                    var problem = JSON.parse(e.currentTarget.response);
                    done(problem);
                };
                request.onerror = fail;
                request.send(data);
            };
        return {
            index: function (done, fail) {
                return R.all('problem').getList().then(done, fail);
            },
            create: function (data, done, fail) {
                _uploadProblem('POST', null, data, done, fail);
            },
            update: function (pid, data, done, fail) {
                _uploadProblem('PUT', pid, data, done, fail);
            },
            show: function (pid, done, fail) {
                return R.one('problem', pid).get().then(done, fail);
            },
            studentIndex: function (uid, done, fail) {
                return R.one('user', uid).customGET('problem').then(done, fail);
            },
            showSubmission: function (uid, pid, done, fail) {
                return R.one('user', uid).one('problem', pid).get().then(done, fail);
            },
            showStats: function (pid, done, fail) {
                return R.one('problem', pid).customGET('ps').then(done, fail);
            },
            adminShowSubmission: function (psid, done, fail) {
                return R.one('ps', psid).get().then(done, fail);
            },
            saveGrading: function (ps, done, fail) {
                return ps.put().then(done, fail);
            },
            uploadSubmission: function (uid, data, done, fail) {
                var request = new XMLHttpRequest(),
                    path = '/api/user/' + uid + '/problem';
                request.open('POST', path);
                request.onload = function (e) {
                    done();
                };
                request.onerror = fail;
                request.send(data);
            }
        };
    }]);

    p.factory('Global', [function () {
        return {};
    }]);

    p.run(['Global', 'User', function (Global, User) {
        User.me(function (me) {
            Global.me = me;
        });
    }]);

    p.factory('CrossGrading', ['Restangular', function (R) {
        return {
            index: function (uid, done) {
                return R.one('cgs/author', uid).get().then(done);
            },
            showByHw: function (hwid, done, fail) {
                return R.one('cgs/hw', hwid).get().then(done, fail);
            },
            start: function (data, done, fail) {
                R.all('cgs').customPOST(data, '').then(done, fail);
            },
            reset: function (hwid, done) {
                R.all('cgs').customDELETE('', { hwid: hwid }).then(done, done);
            },
            show: function (id, done, fail) {
                R.one('cgs', id).get().then(done, fail);
            },
            save: function (cg, uid, done) {
                R.one('cgs', cg._id).one('author', uid).customPUT(cg, '').then(done, done);
            },
            toQuestionObject: function (questionArray) {
                var qo = {}, i = 0;
                for (i; i < questionArray.length; i = i + 1) {
                    qo['q' + i] = questionArray[i];
                }
                return qo;
            }
        };
    }]);

    p.factory('DestroyAlert', function () {
        return [
            'Are you sure?',
            'Are you really sure?',
            'Are you really really sure?'
        ];
    });

}(angular));
