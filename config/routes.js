﻿var controllers = require('../app/controllers')

module.exports = function (app) {
    app.get('/', controllers.home.index);
    app.get('/line', controllers.line.index);
    app.get('/line/all', controllers.line.all);
    app.get('/line/add', controllers.line.add);
    app.post('/line', controllers.line.create);
    app.get('/line/:id', controllers.line.show);
    app.get('/line/edit/:id', controllers.line.edit);
    app.post('/line/:id', controllers.line.update);
    app.get('/line/delete/:id', controllers.line.remove);
    app.get('/line/change_status/:id', controllers.line.change_status);

    app.get('/store', controllers.store.index);
    app.get('/store/all', controllers.store.all);
    app.get('/store/add', controllers.store.add);
    app.post('/store', controllers.store.create);
    app.get('/store/:id', controllers.store.show);
    app.get('/store/edit/:id', controllers.store.edit);
    app.post('/store/:id', controllers.store.update);
    app.get('/store/delete/:id', controllers.store.remove);
    app.get('/store/change_status/:id', controllers.store.change_status);

    app.get('/port', controllers.port.index);
    app.get('/port/all', controllers.port.all);
    app.get('/port/add', controllers.port.add);
    app.post('/port', controllers.port.create);
    app.get('/port/:id', controllers.port.show);
    app.get('/port/edit/:id', controllers.port.edit);
    app.post('/port/:id', controllers.port.update);
    app.get('/port/delete/:id', controllers.port.remove);
    app.get('/port/change_status/:id', controllers.port.change_status);

    app.get('/trainstore', controllers.trainStore.index);
    app.get('/trainstore/all', controllers.trainStore.all);
    app.get('/trainstore/add', controllers.trainStore.add);
    app.post('/trainstore', controllers.trainStore.create);
    app.get('/trainstore/:id', controllers.trainStore.show);
    app.get('/trainstore/edit/:id', controllers.trainStore.edit);
    app.post('/trainstore/:id', controllers.trainStore.update);
    app.get('/trainstore/delete/:id', controllers.trainStore.remove);
    app.get('/trainstore/change_status/:id', controllers.trainStore.change_status);

    app.get('/trainline', controllers.trainLine.index);
    app.get('/trainline/all', controllers.trainLine.all);
    app.get('/trainline/add', controllers.trainLine.add);
    app.post('/trainline', controllers.trainLine.create);
    app.get('/trainline/:id', controllers.trainLine.show);
    app.get('/trainline/edit/:id', controllers.trainLine.edit);
    app.post('/trainline/:id', controllers.trainLine.update);
    app.get('/trainline/delete/:id', controllers.trainLine.remove);
    app.get('/trainline/change_status/:id', controllers.trainLine.change_status);

    app.get('/goods', controllers.goods.index);
    app.get('/goods/all', controllers.goods.all);
    app.get('/goods/add', controllers.goods.add);
    app.post('/goods', controllers.goods.create);
    app.get('/goods/:id', controllers.goods.show);
    app.get('/goods/edit/:id', controllers.goods.edit);
    app.post('/goods/:id', controllers.goods.update);

    app.get('/vehicle', controllers.vehicle.index);
    app.get('/vehicle/all', controllers.vehicle.all);
    app.get('/vehicle/add', controllers.vehicle.add);
    app.post('/vehicle', controllers.vehicle.create);
    app.get('/vehicle/:id', controllers.vehicle.show);
    app.get('/vehicle/edit/:id', controllers.vehicle.edit);
    app.post('/vehicle/:id', controllers.vehicle.update);

    app.get('/api/line', controllers.api.line);
    app.get('/api/line/:id', controllers.api.getLine);
    app.get('/api/store', controllers.api.store);
    app.get('/api/store/:id', controllers.api.getStore);
    app.get('/api/port', controllers.api.port);
    app.get('/api/port/:id', controllers.api.getPort);
    app.get('/api/trainstore', controllers.api.trainStore);
    app.get('/api/trainstore/:id', controllers.api.getTrainStore);
    app.get('/api/trainline', controllers.api.trainLine);
    app.get('/api/trainline/:id', controllers.api.getTrainLine);
    app.get('/api/goods', controllers.api.goods);
    app.get('/api/goods/:id', controllers.api.getGoods);
    app.get('/api/vehicle', controllers.api.vehicle);
    app.get('/api/vehicle/:id', controllers.api.getVehicle);
};