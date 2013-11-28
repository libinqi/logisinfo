var _ = require('lodash');
var helpers = require('./_helpers');
var orm = require('orm');

module.exports = {
    index: function (req, res, next) {
        req.models.line.all(function (err, lines) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    res.send(404, "没有任何专线信息");
                } else {
                    return next(err);
                }
            }
            res.render('line/index', { lines: lines });
        });

        //var params = _.pick(req.body, 'author', 'body');

        //req.models.line.get(req.params.messageId, function (err, message) {
        //        if (err) {
        //                if (err.code == orm.ErrorCodes.NOT_FOUND) {
        //                        res.send(404, "Message not found");
        //                } else {
        //                        return next(err);
        //                }
        //        }

        //        params.message_id = message.id;

        //        req.models.comment.create(params, function (err, message) {
        //                if(err) {
        //                        if(Array.isArray(err)) {
        //                                return res.send(200, { errors: helpers.formatErrors(err) });
        //                        } else {
        //                                return next(err);
        //                        }
        //                }

        //                return res.send(200, message.serialize());
        //        });
        //});
    },
    add: function (req, res, next) {
        res.render('line/add', {params: req.params});
    },
    create: function (req, res, next) {
    }
};