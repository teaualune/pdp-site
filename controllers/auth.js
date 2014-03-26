var path = require('path'),
    _ = require('underscore'),
    emailValidation = require('../config/email-validation'),
    settings = require('../settings.json'),
    CrossGrading = require('../model/cross-grading'),
    auth;

auth = {
    app: function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            if (req.isAPI) {
                res.send(401);
            } else {
                res.render('login', {
                    title: settings.pageTitles.login,
                    errorMessage: req.flash('errorMessage')[0]
                });
            }
        }
    },
    api: function (req, res, next) {
        req.isAPI = true;
        next();
    },
    admin: function (req, res, next) {
        if (req.user && req.user.admin) {
            next();
        } else {
            res.send(401);
        }
    },
    self: function (req, res, next) {
        if (!req.user) {
            res.send(401);
        } else if (req.user._id == req.params.uid) {
            next();
        } else if (req.user.admin) {
            next();
        } else {
            res.send(401);
        }
    },
    uploadDir: function (req, res, next) {
        var url;
        if (req.isAuthenticated() && req.user) {
            if (req.user.admin) {
                // admin
                next();
            } else {
                // student
                url = req.originalUrl;
                if (url.indexOf(emailValidation.getStudentID(req.user.email)) > 0 || url.indexOf('team' + req.user.team) > 0) {
                    next();
                } else {
                    CrossGrading.findByAuthor(req.user._id).populate('submission').exec(function (err, cgs) {
                        var found = false;
                        if (err) {
                            res.send(500);
                        } else if (cgs) {
                            _.each(cgs, function (cg) {
                                var fileName = _.last(cg.submission.filePath.split(path.sep));
                                if (url.indexOf(fileName) > 0) {
                                    found = true;
                                }
                            });
                            if (found) {
                                next();
                            } else {
                                res.send(401);
                            }
                        } else {
                            res.send(404);
                        }
                    });
                }
            }
        } else {
            // not logged in
            res.send(401);
        }
    }
};

module.exports = auth;
