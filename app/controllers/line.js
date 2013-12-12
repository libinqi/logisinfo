var _ = require('lodash');
var helpers = require('./_helpers');
var orm = require('orm');
var moment = require('moment');
var settings = require('../../config/settings');
var info_dict = require('../../util/info_dict');

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

        opt.createrId = req.session.user.id;
        if (req.session.user.eId) {
            opt.eId = req.session.user.eId;
        }

        console.log(req.session.user.id);
        console.log(req.session.user.eId);

        req.models.line.count(opt, function (err, count) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            else {
                pages = Math.ceil(count / limit);
            }
        });

        req.models.line.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, lines) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
//                    res.send(404, "没有任何专线信息");
                    lines = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            lines.forEach(function (line) {
                line.updatedAt = moment(parseInt(line.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
                line.statusText = line.status == "1" ? "已发布" : "未发布";
                line.transTimeText = _.find(info_dict.trans_time, {'id': line.transTime}).name;
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
                if (line.isFrozen == "0") {
                    line.transRate = "不固定";
                }
                else {
                    line.transRate = "每" + line.transRateDay + "天" + line.transRateNumber + "班";
                }
                if (line.startPhone && line.startTel)
                    line.startTel = "/ " + line.startTel;
                if (line.endPhone && line.endTel)
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
        res.render('line/add', {params: req.params, line: line, line_type: info_dict.line_type, line_goods_type: info_dict.line_goods_type, trans_time: info_dict.trans_time, mode_transport: info_dict.mode_transport, validate_type: info_dict.validate_type});
    },
    create: function (req, res, next) {
        var lineEntity = _.merge(new req.models.line().serialize(), req.body);
        var currentDate = new Date();
        lineEntity.createrId = req.session.user.id;
        lineEntity.createdAt = currentDate.getTime();
        lineEntity.updaterId = req.session.user.id;
        lineEntity.updatedAt = currentDate.getTime();
        if (req.session.user.eId) {
            lineEntity.eId = req.session.user.eId;
        }
        lineEntity.lineType = _.find(info_dict.line_type, {'id': lineEntity.lineTypeCode}).name;
        lineEntity.modeTransport = _.find(info_dict.mode_transport, {'id': lineEntity.modeTransportCode}).name;
        if (_.isArray(lineEntity.lineGoodsType))lineEntity.lineGoodsType = lineEntity.lineGoodsType.join(",");

        if (_.isEmpty(lineEntity.endContact) && _.isEmpty(lineEntity.endAddress) && _.isEmpty(lineEntity.endPhone) && _.isEmpty(lineEntity.endTel)) {
            lineEntity.endContact = lineEntity.startContact;
            lineEntity.endAddress = lineEntity.startAddress;
            lineEntity.endPhone = lineEntity.startPhone;
            lineEntity.endTel = lineEntity.startTel;
        }

        var day = _.find(info_dict.validate_type, {'id': lineEntity.valid}).day;
        lineEntity.expiryDate = moment().add('d', day).valueOf();
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
            line.expiryDate = moment(parseInt(line.expiryDate)).format('YYYY-MM-DD HH:mm:ss');
            line.createdAt = moment(parseInt(line.createdAt)).format('YYYY-MM-DD HH:mm:ss');
            line.updatedAt = moment(parseInt(line.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
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
            line.expiryDate = moment(parseInt(line.expiryDate)).format('YYYY-MM-DD HH:mm:ss');
            line.createdAt = moment(parseInt(line.createdAt)).format('YYYY-MM-DD HH:mm:ss');
            line.updatedAt = moment(parseInt(line.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
            line.statusText = line.status == "1" ? "已发布" : "未发布";
            line.transTimeText = _.find(info_dict.trans_time, {'id': line.transTime}).name;
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
            if (line.isFrozen == "0") {
                line.transRate = "不固定";
            }
            else {
                line.transRate = "每" + line.transRateDay + "天" + line.transRateNumber + "班";
            }

            line.startTelText = "";
            if (line.startPhone && line.startTel) {
                line.startTelText = "/ " + line.startTel;
            }
            line.endTelText = "";
            if (line.endPhone && line.endTel) {
                line.endTelText = "/ " + line.endTel;
            }

            res.render('line/edit', {params: req.params, line: line, line_type: info_dict.line_type, line_goods_type: info_dict.line_goods_type, trans_time: info_dict.trans_time, mode_transport: info_dict.mode_transport, validate_type: info_dict.validate_type});
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
            lineEntity.updaterId = req.session.user.id;
            lineEntity.updatedAt = new Date().getTime();
            lineEntity.lineType = _.find(info_dict.line_type, {'id': lineEntity.lineTypeCode}).name;
            lineEntity.modeTransport = _.find(info_dict.mode_transport, {'id': lineEntity.modeTransportCode}).name;
            if (_.isArray(lineEntity.lineGoodsType))lineEntity.lineGoodsType = lineEntity.lineGoodsType.join(",");

            if (_.isEmpty(lineEntity.endContact) && _.isEmpty(lineEntity.endAddress) && _.isEmpty(lineEntity.endPhone) && _.isEmpty(lineEntity.endTel)) {
                lineEntity.endContact = lineEntity.startContact;
                lineEntity.endAddress = lineEntity.startAddress;
                lineEntity.endPhone = lineEntity.startPhone;
                lineEntity.endTel = lineEntity.startTel;
            }

            var day = _.find(info_dict.validate_type, {'id': lineEntity.valid}).day;
            lineEntity.expiryDate = moment().add('d', day).valueOf();
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
            line.updaterId = req.session.user.id;
            line.updatedAt = new Date().getTime();
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
                line.updaterId = req.session.user.id;
                line.updatedAt = new Date().getTime();

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