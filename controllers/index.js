var main = require('./main'),
    auth = require('./auth'),
    userRoutes = require('./user-routes'),
    homeworkRoutes = require('./homework-routes'),
    problemRoutes = require('./problem-routes'),
    crossGradingRoutes = require('./crossGrading-routes');

module.exports = function (app, passport) {

    app.get('/', auth.app, main.index);

    app.post('/login', main.login(passport));

    app.post('/signup', main.signup(passport));

    app.get('/logout', main.logout);

    userRoutes(app);

    homeworkRoutes(app);

    problemRoutes(app);

    crossGradingRoutes(app);

};
