var _ = require('lodash');
var helpers = require('./_helpers');
var orm = require('orm');
var moment = require('moment');
var settings = require('../../config/settings');
var line_type = [
    {"id": "1", "name": "单程"},
    {"id": "2", "name": "往返"}
];
var line_goods_type = [
    {"id": "1", "name": "不限"},
    {"id": "2", "name": "普通货物"},
    {"id": "3", "name": "大件货物"},
    {"id": "4", "name": "鲜活易腐"},
    {"id": "5", "name": "危险货物"},
    {"id": "6", "name": "贵重货物"},
    {"id": "7", "name": "保温冷藏"},
    {"id": "8", "name": "搬家货物"}
];
var trans_time = [
    {"id": "1", "name": "1天"},
    {"id": "2", "name": "2天"},
    {"id": "3", "name": "3天"},
    {"id": "4", "name": "4天"},
    {"id": "5", "name": "5天"},
    {"id": "6", "name": "5天以上"}
];
var mode_transport = [
    {"id": "1", "name": "公路运输"},
    {"id": "2", "name": "海上运输"},
    {"id": "3", "name": "铁路运输"},
    {"id": "4", "name": "航空运输"},
    {"id": "5", "name": "邮件运输"},
    {"id": "6", "name": "多式联运"},
    {"id": "7", "name": "固定设施运输"},
    {"id": "8", "name": "内河运输"},
    {"id": "9", "name": "其它运输"}
];
var validate_type = [
    {"id": "1", "name": "长期有效", "day": 3650},
    {"id": "2", "name": "1天", "day": 1},
    {"id": "3", "name": "7天", "day": 7},
    {"id": "4", "name": "15天", "day": 15},
    {"id": "5", "name": "1个月", "day": 30},
    {"id": "6", "name": "半年", "day": 182},
    {"id": "7", "name": "1年", "day": 365}
];

module.exports = {
    index: function (req, res, next) {
        var status = Number(req.query.status) || "";
        var page = Number(req.query.page) || 1;
        var limit = settings.list_count;
        var pages = 0;

        var opt = {};
        opt.isDeleted = 0;
        if (_.isNumber(status))
            opt.status = status - 1;

        if (!_.isEmpty(req.query.sProvince))
            opt.sProvinceCode = req.query.sProvince;
        if (!_.isEmpty(req.query.sCity))
            opt.sCityCode = req.query.sCity;
        if (!_.isEmpty(req.query.eProvince))
            opt.eProvinceCode = req.query.eProvince;
        if (!_.isEmpty(req.query.eCity))
            opt.eCityCode = req.query.eCity;

        req.models.line.count(opt, function (error, count) {
            pages = Math.ceil(count / limit);
        });

        req.models.line.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, lines) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    res.send(404, "没有任何专线信息");
                } else {
                    return next(err);
                }
            }
            lines.forEach(function (line) {
                line.updatedAt = moment(line.updatedAt).format('YYYY-MM-DD HH:mm:ss');
                line.statusText = line.status == "1" ? "已发布" : "未发布";
                line.transTimeText = _.find(trans_time, {'id': line.transTime}).name;
                if (!line.image) {
                    line.image = "/images/no-line.jpg";
                }
                if (line.heavyCargoPrice == "" || line.heavyCargoPrice == "0") {
                    line.heavyCargoPrice = "面议";
                }
                else {
                    line.heavyCargoPrice = line.heavyCargoPrice + "元/吨";
                }
                if (line.foamGoodsPrice == "" || line.foamGoodsPrice == "0") {
                    line.foamGoodsPrice = "面议";
                }
                else {
                    line.foamGoodsPrice = line.foamGoodsPrice + "元/公斤"
                }
                if (line.isFrozen == "1") {
                    line.transRate = "不固定";
                }
                else {
                    line.transRate = "每" + line.transRateDay + "天" + line.transRateNumber + "班";
                }
                if (line.startPhone&&line.startTel)
                    line.startTel = "/ " + line.startTel;
                if (line.endPhone&&line.endTel)
                    line.endTel = "/ " + line.endTel;
            });
            res.render('line/index', {
                lines: lines,
                current_page: page,
                list_line_count: limit,
                pages: pages,
                status: status,
                base: req.url,
                sProvince: req.query.sProvince,
                sCity: req.query.sCity,
                eProvince: req.query.eProvince,
                eCity: req.query.eCity
            });
        });
    },
    add: function (req, res, next) {
        var line = _.mapValues(new req.models.line().serialize(), function (val) {
            if (_.isNull(val))return "";
            return val;
        });
        res.render('line/add', {params: req.params, line: line, line_type: line_type, line_goods_type: line_goods_type, trans_time: trans_time, mode_transport: mode_transport, validate_type: validate_type});
    },
    create: function (req, res, next) {
        var lineEntity = _.merge(new req.models.line().serialize(), req.body);
        lineEntity.createrId = "123456";
        lineEntity.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
        lineEntity.updaterId = "123456";
        lineEntity.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
        lineEntity.eId = "123";
        lineEntity.lineType = _.find(line_type, {'id': lineEntity.lineTypeCode}).name;
        lineEntity.modeTransport = _.find(mode_transport, {'id': lineEntity.modeTransportCode}).name;
        if (_.isArray(lineEntity.lineGoodsType))lineEntity.lineGoodsType = lineEntity.lineGoodsType.join(",");

        if (_.isEmpty(lineEntity.endContact) && _.isEmpty(lineEntity.endAddress) && _.isEmpty(lineEntity.endPhone) && _.isEmpty(lineEntity.endTel)) {
            lineEntity.endContact = lineEntity.startContact;
            lineEntity.endAddress = lineEntity.startAddress;
            lineEntity.endPhone = lineEntity.startPhone;
            lineEntity.endTel = lineEntity.startTel;
        }

        var day = _.find(validate_type, {'id': lineEntity.valid}).day;
        lineEntity.expiryDate = moment().add('d', day).format('YYYY-MM-DD HH:mm:ss');
        req.models.line.create(lineEntity, function (err, line) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            res.redirect('/line');
        });
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
            line.statusText = line.status == "1" ? "已发布" : "未发布";
            line.transTimeText = _.find(trans_time, {'id': line.transTime}).name;
            if (!line.image) {
                line.image = "/images/no-line.jpg";
            }
            if (line.heavyCargoPrice == "" || line.heavyCargoPrice == "0") {
                line.heavyCargoPriceText = "面议";
            }
            else {
                line.heavyCargoPriceText = line.heavyCargoPrice + "元/吨";
            }
            if (line.foamGoodsPrice == "" || line.foamGoodsPrice == "0") {
                line.foamGoodsPriceText = "面议";
            }
            else {
                line.foamGoodsPriceText = line.foamGoodsPrice + "元/公斤"
            }
            if (line.isFrozen == "1") {
                line.transRate = "不固定";
            }
            else {
                line.transRate = "每" + line.transRateDay + "天" + line.transRateNumber + "班";
            }

            line.startTelText = "";
            if (line.startPhone&&line.startTel) {
                line.startTelText = "/ " + line.startTel;
            }
            line.endTelText = "";
            if (line.endPhone&&line.endTel) {
                line.endTelText = "/ " + line.endTel;
            }

            res.render('line/edit', {params: req.params, line: line, line_type: line_type, line_goods_type: line_goods_type, trans_time: trans_time, mode_transport: mode_transport, validate_type: validate_type});
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
            var lineEntity = _.merge(line, req.body);
            lineEntity.updaterId = "123456";
            lineEntity.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            lineEntity.lineType = _.find(line_type, {'id': lineEntity.lineTypeCode}).name;
            lineEntity.modeTransport = _.find(mode_transport, {'id': lineEntity.modeTransportCode}).name;
            if (_.isArray(lineEntity.lineGoodsType))lineEntity.lineGoodsType = lineEntity.lineGoodsType.join(",");

            if (_.isEmpty(lineEntity.endContact) && _.isEmpty(lineEntity.endAddress) && _.isEmpty(lineEntity.endPhone) && _.isEmpty(lineEntity.endTel)) {
                lineEntity.endContact = lineEntity.startContact;
                lineEntity.endAddress = lineEntity.startAddress;
                lineEntity.endPhone = lineEntity.startPhone;
                lineEntity.endTel = lineEntity.startTel;
            }

            var day = _.find(validate_type, {'id': lineEntity.valid}).day;
            lineEntity.expiryDate = moment().add('d', day).format('YYYY-MM-DD HH:mm:ss');
            line.save(lineEntity, function (err) {
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
    },
    remove: function (req, res, next) {
        req.models.line.get(req.params.id, function (err, line) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            line.isDeleted = 1;
            line.save(line, function (err) {
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
    },
    change_status: function (req, res, next) {
        var status = Number(req.query.status) || "";
        if (_.isNumber(status)) {
            status = status - 1;
            req.models.line.get(req.params.id, function (err, line) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                line.status = status;
                line.updaterId = "123456";
                line.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');

                line.save(line, function (err) {
                    if (err) {
                        if (Array.isArray(err)) {
                            return res.send(200, { errors: helpers.formatErrors(err) });
                        } else {
                            return next(err);
                        }
                    }
                    res.redirect(req.headers.referer);
                });
            });
        }
        else {
            res.redirect(req.headers.referer);
        }
    }
};