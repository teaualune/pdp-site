var express = require('express'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    settings = require('./settings.json'),

    app = express(),
    publicPath = path.join(__dirname, 'public');

require('./model/NumberId');
require('./config/passport')(passport);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon(path.join(publicPath, 'images', 'favicon.ico')));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(settings.cookieKey));
app.use(express.session({
    secret: settings.sessionKey
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('connect-flash')());
app.use(app.router);
app.use(require('less-middleware')({
    src: publicPath
}));
app.use(express.static(publicPath));
app.use('/' + settings.uploadDir.root, express.static(path.join(__dirname, settings.uploadDir.root)));

if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

mongoose.connect('mongodb://' + settings.dbhost);
autoIncrement.initialize(mongoose.connection);

require('./controllers')(app, passport);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
