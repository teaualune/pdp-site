var mongoose = require('mongoose'),
    utils = require('./routes-utils'),
    User = require('../model/user'),
    putHandler = function (res) {
        return function (err, user) {
            if (err || !user) {
                res.send(500);
            } else {
                res.send(user.strip());
            }
        };
    };

module.exports = function (app) {

    // GET /api/user
    // get all users
    // GET /api/user?admin=0
    // get all students
    // GET /api/user/admin=1
    // get all admins
    app.get('/api/user', utils.auth.admin, function (req, res) {
        var query;
        if (req.query.admin === '0') {
            query = User.find({ admin: false }).populate('team');
        } else if (req.query.admin === '1') {
            query = User.find({ admin: true });
        } else {
            query = User.find({});
        }
        query.exec(utils.defaultHandler(res, function (users) {
            return User.stripUsers(users);
        }));
    });

    // GET /api/user/me
    // prior to /api/user/:uid
    app.get('/api/user/me', utils.auth.basic, function (req, res) {
        if (('number' === typeof req.user.team) && !req.user.admin) {
            User.findById(req.user._id).populate('team').exec(utils.defaultHandler(res, function (user) {
                return user.strip();
            }));
        } else {
            res.send(req.user.strip());
        }
    });

    // GET /api/team/:tid/users
    // get all students in a team
    app.get('/api/team/:tid/users', utils.auth.basic, function (req, res) {
        User.find({ team: req.params.tid }, utils.defaultHandler(res, function (users) {
            return User.stripUsers(users);
        }));
    });

    // GET /api/user/:uid
    // get user by id
    app.get('/api/user/:uid', utils.auth.basic, function (req, res) {
        var query = User.findById(req.params.uid);
        if (('number' === typeof req.user.team) && !req.user.admin) {
            query = query.populate('team');
        }
        query.exec(utils.defaultHandler(res, function (user) {
            return user.strip();
        }));
    });

    // PUT /api/user/:uid
    // update user
    app.put('/api/user/:uid', utils.auth.self, function (req, res) {
        User.findById(req.params.uid, function (err, user) {
            if (err) {
                res.send(500);
            } else if (user) {
                user.nickname = req.body.nickname;
                user.save(putHandler(res));
            } else {
                res.send(404);
            }
        });
    });

    // PUT /api/user/:uid/team
    // assign a user to a team
    app.put('/api/user/:uid/team', utils.auth.admin, function (req, res) {
        User.findById(req.params.uid, function (err, user) {
            if (err) {
                res.send(500);
            } else if (user) {
                user.team = req.body.tid;
                user.save(putHandler(res));
            } else {
                res.send(404);
            }
        });
    });

    // DELETE /api/user/:uid
    // delete user
    app.delete('/api/user/:uid', utils.auth.admin, function (req, res) {
        User.findByIdAndRemove(req.params.uid, utils.emptyHandler(res));
    });

};
