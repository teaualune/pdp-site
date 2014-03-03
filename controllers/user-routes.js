var mongoose = require('mongoose'),
    utils = require('./routes-utils'),
    User = require('../model/user');

module.exports = function (app) {

    // GET /api/user 
    // get all users
    app.get('/api/user', utils.auth.admin, function (req, res) {
        User.find({}, utils.defaultHandler(res, function (users) {
            return User.stripUsers(users);
        }));
    });

    // GET /api/user/me
    // prior to /api/user/:uid
    app.get('/api/user/me', utils.auth.basic, function (req, res) {
        res.send(req.user.strip());
    });

    // GET /api/user/:uid
    // get user by id
    app.get('/api/user/:uid', utils.auth.basic, function (req, res) {
        User.findById(req.params.uid, utils.defaultHandler(res, function (user) {
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
        User.findByIdAndRemove(req.params.uid, utils.emptyHandler(res));
    });

};
