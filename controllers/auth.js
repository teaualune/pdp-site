var settings = require('../settings.json');

module.exports = {
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
        } else if (req.user._id == req.params.uid) {
            next();
        } else if (req.user.admin) {
            next();
        } else {
            res.send(401);
        }
    }
};
