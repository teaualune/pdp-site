var mongoose = require('mongoose'),
    utils = require('./routes-utils'),
    User = require('../model/user');

module.exports = function (app) {

    // GET /api/user 
    // get all users
    app.get('/api/user', utils.auth.admin, function (req, res) {
        User.find({}, function (err, users) {
            if (err) {
                res.send(500);
            } else if (users) {
                res.send(User.stripUsers(users));
            } else {
                res.send(404);
            }
        });
    });

    // GET /api/user/me
    // prior to /api/user/:uid
    app.get('/api/user/me', utils.auth.basic, function (req, res) {
        res.send(req.user.strip());
    });

    // GET /api/user/:uid
    // get user by id
    app.get('/api/user/:uid', utils.auth.basic, function (req, res) {
        var uid = utils.toObjectId(req.params.uid);
        User.findById(uid, function (err, user) {
            if (err) {
                res.send(500);
            } else if (user) {
                res.send(user.strip());
            } else {
                res.send(404);
            }
        });
    });

    // PUT /api/user/:uid
    // update user
    app.put('/api/user/:uid', utils.auth.self, function (req, res) {
        var uid = utils.toObjectId(req.params.uid);
        User.findById(uid, function (err, user) {
            if (err) {
                res.send(500);
            } else if (user) {
                user.nickname = req.body.nickname;
                user.save(function (err, user) {
                    if (err || !user) {
                        res.send(500);
                    } else {
                        res.send(user.strip());
                    }
                })
            } else {
                res.send(404);
            }
        });
    });

    // DELETE /api/user/:uid
    // delete user
    app.delete('/api/user/:uid', utils.auth.admin, function (req, res) {
        var uid = utils.toObjectId(req.params.uid);
        User.findByIdAndRemove(uid, utils.destroyHandler(res));
    });

};
