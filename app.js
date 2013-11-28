
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var settings    = require('./config/settings');
var environment = require('./config/environment');
var routes      = require('./config/routes');

var app = express();
app.set('port', process.env.PORT || 3000);
environment(app);
routes(app);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});