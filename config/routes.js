var controllers = require('../app/controllers')

module.exports = function (app) {
    app.get('/', controllers.home.index);
    app.get('/line', controllers.line.index);
    app.get('/line/add', controllers.line.add);
    app.post('/line', controllers.line.create);
    app.get('/line/:id', controllers.line.show);
    app.get('/line/edit/:id', controllers.line.edit);
    app.post('/line/:id', controllers.line.update);
    app.get('/line/delete/:id', controllers.line.remove);
    app.get('/line/change_status/:id', controllers.line.change_status);

    app.get('/goods', controllers.goods.index);
    app.get('/goods/add', controllers.goods.add);
    app.post('/goods', controllers.goods.create);
    app.get('/goods/:id', controllers.goods.show);
    app.get('/goods/edit/:id', controllers.goods.edit);
    app.post('/goods/:id', controllers.goods.update);

    app.get('/vehicle', controllers.vehicle.index);
    app.get('/vehicle/add', controllers.vehicle.add);
    app.post('/vehicle', controllers.vehicle.create);
    app.get('/vehicle/:id', controllers.vehicle.show);
    app.get('/vehicle/edit/:id', controllers.vehicle.edit);
    app.post('/vehicle/:id', controllers.vehicle.update);
};