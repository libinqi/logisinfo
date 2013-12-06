var controllers = require('../app/controllers')

module.exports = function (app) {
    app.get('/', controllers.home.index);
    app.get('/message', controllers.message.list);
    app.post('/message', controllers.message.create);
    app.get('/message/:id', controllers.message.get);
    app.post('/message/:messageId/comment', controllers.comment.create);
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
    app.get('/goods/delete/:id', controllers.goods.remove);
    app.get('/goods/change_status/:id', controllers.goods.change_status);
};