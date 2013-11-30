var _ = require('lodash');
var helpers = require('./_helpers');
var orm = require('orm');
var moment = require('moment');

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
        res.render('line/add', {params: line});
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
            res.render('line/edit', {params: req.params, line: line});
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