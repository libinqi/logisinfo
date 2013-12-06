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

        req.models.goods.count(opt, function (err, count) {
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

        req.models.goods.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, goodsList) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    goodsList = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            goodsList.forEach(function (goods) {
                goods.updatedAt = moment(line.updatedAt).format('YYYY-MM-DD HH:mm:ss').fromNow();
                if (!goods.image) {
                    goods.image = "/images/no-line.jpg";
                }
                if (goods.phone && goods.tel)
                    goods.tel = "/ " + goods.tel;

                //货物描述
                goods.infoText = goods.sProvince + goods.sCity + "→" + goods.eProvince + goods.eCity;
                if (goods.weight) {
                    goods.infoText += ",有" + goods.weight + (goods.unit == 0 ? "方" : "吨");
                    goods.infoText += _.find(info_dict.goods_type, {'id': goods.goodsTypeCode}).name;
                }

                //车辆需求
                goods.infoText += ",求" + goods.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': goods.vehicleTypeCode}).name;
                if (goods.vehicleCount > 0)
                    goods.infoText += goods.vehicleCount + "辆";

                //补充说明
                if (goods.freeText)
                    goods.infoText += "," + goods.freeText;
            });
            res.render('goods/index', {
                goodsList: goodsList,
                current_page: page,
                list_count: limit,
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
        var goods = _.mapValues(new req.models.goods().serialize(), function (val) {
            if (_.isNull(val))return "";
            return val;
        });
        res.render('goods/add', {params: req.params, goods: goods, goods_type: info_dict.goods_type, vehicle_type: info_dict.vehicle_type, loading_time: info_dict.loading_time,validate_type: info_dict.validate_type});
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
            if (line.startPhone && line.startTel) {
                line.startTelText = "/ " + line.startTel;
            }
            line.endTelText = "";
            if (line.endPhone && line.endTel) {
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