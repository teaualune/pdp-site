var LocalStrategy = require('passport-local').Strategy,
    mongoose = require('mongoose'),
    User = require('../model/user'),
    emailValidation = require('./email-validation'),
    errorMessages = require('../settings.json').errorMessages,
    strategyConfig = {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    };

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, done);
    });

    passport.use('local-signup', new LocalStrategy(strategyConfig, function (req, email, password, done) {
        User.findByEmail(email, function (err, user) {
            var newUser;
            if (err) {
                return done(err);
            } else if (user) {
                return done(null, false, req.flash('errorMessage', errorMessages.emailExists));
            } else if (!emailValidation.validate(email)) {
                return done(null, false, req.flash('errorMessage', errorMessages.notNTUEmail));
            } else {
                newUser = new User();
                newUser._id = new mongoose.Types.ObjectId;
                newUser.email = email;
                newUser.nickname = req.body.nickname || null;
                newUser.password = newUser.generateHash(password);
                newUser.save(function (err) {
                    if (err) {
                        throw err;
                    }
                    return done(null, newUser);
                });
            }
        });
    }));

    passport.use('local-login', new LocalStrategy(strategyConfig, function (req, email, password, done) {
        User.findByEmail(email, function (err, user) {
            if (err) {
                return done(err);
            } else if (!user) {
                return done(null, false, req.flash('errorMessage', errorMessages.userNotFound));
            } else if (!user.validPassword(password)) {
                return done(null, false, req.flash('errorMessage', errorMessages.passwordIncorrect));
            } else {
                return done(null, user);
            }
        });
    }));
};
