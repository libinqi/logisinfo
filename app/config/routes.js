/**
 * Created by libinqi on 2014/10/23.
 */
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var express = require('express');
var router = express.Router();

var controllers = {};
var files = glob.sync(path.join(process.cwd(), 'app', 'controllers', '**', '*.js'));
files.forEach(function (file) {
    var temp = controllers;
    var parts = path.relative(path.join(process.cwd(), 'app', 'controllers'), file).slice(0, -3).split(path.sep);

    while (parts.length) {
        if (parts.length === 1) {
            temp[parts[0]] = require(file);
        } else {
            temp[parts[0]] = temp[parts[0]] || {};
        }
        temp = temp[parts.shift()];
    }
});

module.exports = function (app) {
    router.get('/',controllers.index.main);
    router.get('/goods',controllers.goods.index);
    router.get('/goods/detail',controllers.goods.detail);
    router.get('/goods/GetGoodsList',controllers.goods.GetGoodsList);
    router.post('/goods/applyIntentGoods',controllers.goods.applyIntentGoods);
    router.get('/car',controllers.car.index);
    router.get('/car/detail',controllers.car.detail);
    router.get('/car/GetCarList',controllers.car.GetCarList);
    router.post('/car/applyIntentCar',controllers.car.applyIntentCar);
    router.get('/line',controllers.line.index);
    router.get('/line/detail',controllers.line.detail);
    router.get('/line/add',controllers.line.add);
    router.get('/line/GetLineList',controllers.line.GetLineList);
    router.get('/store',controllers.store.index);
    router.get('/store/detail',controllers.store.detail);
    router.get('/port',controllers.port.index);
    router.get('/port/detail',controllers.port.detail);
    router.get('/trainstore',controllers.trainstore.index);
    router.get('/trainstore/detail',controllers.trainstore.detail);
    router.post('/sign/login',controllers.sign.login);
    router.get('/sign/logout',controllers.sign.logout);
    app.use('/',router);
}