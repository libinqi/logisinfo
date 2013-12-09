var path = require('path');
var express = require('express');
var settings = require('./settings');
var models = require('../app/models/');
var partials = require('express-partials');

module.exports = function (app) {
    app.configure(function () {
        app.set('views', path.join(__dirname, '../app/views'));
        app.set('view engine', 'ejs');
        app.use(partials());
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.json());
        app.use(express.urlencoded());
        app.use(express.methodOverride());
        app.use(express.static(path.join(__dirname, '../public')));
        app.use(express.cookieParser());
        app.use(express.session({
            secret: settings.session_secret
        }));
        app.use(require('../app/controllers/sign').auth_user);

        app.use(function (req, res, next) {
            models(function (err, db) {
                if (err) return next(err);

                req.models = db.models;
                req.db = db;
//                db.drop(function (err) {
//                    if (err) {
//                        console.log(err);
//                    }
//                    else {
//                        db.sync(function (err) {
//                            if (err)
//                                console.log(err);
//                            else
//                                console.log('创建数据库表成功');
//                        });
//                    }
//                });
                next();
            });
        }),
            app.use(app.router);
    });
};