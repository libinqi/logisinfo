var controllers = require('../app/controllers')

module.exports = function (app) {
        app.get( '/'                           , controllers.home.index);
        app.get( '/message'                   , controllers.message.list);
        app.post('/message'                   , controllers.message.create);
        app.get( '/message/:id'                , controllers.message.get);
        app.post('/message/:messageId/comment', controllers.comment.create);
        app.get('/line', controllers.line.index);
        app.get('/line/add', controllers.line.add);
};