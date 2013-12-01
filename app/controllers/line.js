var _ = require('lodash');
var helpers = require('./_helpers');
var orm = require('orm');
var moment = require('moment');
require('../../public/js/core/line_dict');
var line_type=[{"id":"1","name":"单程"},{"id":"2","name":"往返"}];var line_goods_type=[{"id":"1","name":"不限"},{"id":"2","name":"普通货物"},{"id":"3","name":"大件货物"},{"id":"4","name":"鲜活易腐"},{"id":"5","name":"危险货物"},{"id":"6","name":"贵重货物"},{"id":"7","name":"保温冷藏"},{"id":"8","name":"搬家货物"}];
var trans_time=[{"id":"1","name":"1天"},{"id":"2","name":"2天"},{"id":"3","name":"3天"},{"id":"4","name":"4天"},{"id":"5","name":"5天"},{"id":"6","name":"5天以上"}];
var mode_transport=[{"id":"1","name":"公路运输"},{"id":"2","name":"海上运输"},{"id":"3","name":"铁路运输"},{"id":"4","name":"航空运输"},{"id":"5","name":"邮件运输"},{"id":"6","name":"多式联运"},{"id":"7","name":"固定设施运输"},{"id":"8","name":"内河运输"},{"id":"9","name":"其它运输"}];
var validate_type=[{"id":"1","name":"长期有效"},{"id":"2","name":"1天"},{"id":"3","name":"7天"},{"id":"4","name":"15天"},{"id":"5","name":"1个月"},{"id":"6","name":"半年"},{"id":"7","name":"1年"}];

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
    },
    add: function (req, res, next) {
        var line = _.mapValues(new req.models.line().serialize(), function (val) {
            if (_.isNull(val))return "";
            return val;
        });
        res.render('line/add', {params: req.params,line: line,line_type:line_type,trans_time:trans_time,mode_transport:mode_transport,validate_type:validate_type});
    },
    create: function (req, res, next) {
        // req.body.createdAt = new Date();
//        req.models.line.create(req.body, function (err, line) {
//            if (err) {
//                if (Array.isArray(err)) {
//                    return res.send(200, { errors: helpers.formatErrors(err) });
//                } else {
//                    return next(err);
//                }
//            }
//            res.redirect('/line/' + line.id);
//        });

        res.send(req.body);

    },
    show: function (req, res, next) {
        req.models.line.get(req.params.id, function (err, line) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            line.expiryDate = moment(line.expiryDate).format('YYYY-MM-DD HH:mm:ss');
            line.createdAt = moment(line.createdAt).format('YYYY-MM-DD HH:mm:ss');
            line.updatedAt = moment(line.updatedAt).format('YYYY-MM-DD HH:mm:ss');
            res.render('line/show', {line: line});
        });
    },
    edit: function (req, res, next) {
        req.models.line.get(req.params.id, function (err, line) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            line.expiryDate = moment(line.expiryDate).format('YYYY-MM-DD HH:mm:ss');
            line.createdAt = moment(line.createdAt).format('YYYY-MM-DD HH:mm:ss');
            line.updatedAt = moment(line.updatedAt).format('YYYY-MM-DD HH:mm:ss');
            res.render('line/edit', {params: req.params, line: line,line_type:line_type,trans_time:trans_time,mode_transport:mode_transport,validate_type:validate_type});
        });
    },
    update: function (req, res, next) {
        req.models.line.get(req.params.id, function (err, line) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            req.body.updatedAt = new Date();
            line.save(req.body, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/line/' + line.id);
            });
        });
    },
    remove: function (req, res, next) {
        console.log('deleted');
        req.models.line.get(req.params.id, function (err, line) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            line.remove(function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/line');
            });
        });
    }
};