var main = require('./main'),
    auth = require('./auth');

module.exports = function (app, passport) {

    app.get('/', auth.app, main.index);

    app.post('/login', main.login(passport));

    app.post('/signup', main.signup(passport));

    app.get('/logout', main.logout);

};
