var settings = require('../settings.json'),
    options = {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    };

exports.index = function (req, res) {
    res.render('index', {
        title: settings.pageTitles.index,
        user: req.user
    });
};

exports.login = function (passport) {
    return passport.authenticate('local-login', options);
};

exports.signup = function (passport) {
    return passport.authenticate('local-signup', options);
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};
