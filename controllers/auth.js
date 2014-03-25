var emailValidation = require('../config/email-validation'),
    settings = require('../settings.json'),
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
        if (req.isAuthenticated() && req.user) {
            if (req.user.admin) {
                // admin
                next();
            } else {
                // student
                if (req.originalUrl.indexOf(emailValidation.getStudentID(req.user.email)) > 0 || req.originalUrl.indexOf('team' + req.user.team) > 0) {
                    next();
                } else {
                    res.send(401);
                }
            }
        } else {
            // not logged in
            res.send(401);
        }
    }
};

module.exports = auth;
