var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var utils = require(path.join(process.cwd(), 'lib', 'utils'));
var info_dict = require(path.join(process.cwd(), 'lib', 'info_dict'));
var session = require('express-session');
var app = express();

app.set('settings', require(path.join(process.cwd(), 'app', 'config/settings')));
app.set('env', require(path.join(process.cwd(), 'app', 'config/settings')).env);

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(partials());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'logisinfo',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

require(path.join(process.cwd(), 'app', 'config/routes'))(app);

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(500).send(err.message);
        next();
    });
}

// production error handler
// no stacktraces leaked to user
if (app.get('env') === 'production') {
    app.use('/public', express.static(path.join(__dirname, 'public')));
    app.set('view cache', true);

    app.use(function (err, req, res, next) {
        console.error(err.stack);
        console.error(err.message);
        next();
    });
}

app.locals.DateFormat = utils.DateFormat;
app.locals.info_dict = info_dict.info_dict;

var debug = require('debug')('LogisTrade');

var server = app.listen(app.get('settings').port, function() {
    debug('listening on port ' + server.address().port);
});

module.exports = app;