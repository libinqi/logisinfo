/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var settings = require('./config/settings');
var environment = require('./config/environment');
var routes = require('./config/routes');
var Ids = require('./util/Ids');

var app = express();
app.set('port', process.env.PORT || 3000);
environment(app);
routes(app);

var staticDir = path.join(__dirname, 'public');
app.configure('development', function () {
    app.use('/public', express.static(staticDir));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use('/public', express.static(staticDir, { maxAge: maxAge }));
    app.use(express.errorHandler());
    app.set('view cache', true);
});

http.createServer(app).listen(app.get('port'), function () {
//生成数据字典js文件
//    var generate_dict = require('./util/generate_dict');
//    generate_dict.generateDict();
    console.log('Express server listening on port ' + app.get('port'));
});