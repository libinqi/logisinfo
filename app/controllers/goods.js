var _ = require('lodash');
var helpers = require('./_helpers');
var orm = require('orm');
var moment = require('moment');
var settings = require('../../config/settings');
var info_dict = require('../../util/info_dict');

module.exports = {
    index: function (req, res, next) {
        var page = Number(req.query.page) || 1;
        var limit = settings.list_count;
        var pages = 0;

        var opt = {isDeleted: 0};

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
                moment.lang('zh-cn');
                goods.updatedAt = moment(parseInt(goods.updatedAt)).fromNow();
                if (!goods.image) {
                    goods.image = "/images/no-goods.jpg";
                }
                if (goods.phone && goods.tel)
                    goods.tel = "/ " + goods.tel;

                goods.vehicle = "";
                goods.weight = goods.weight + (goods.unit == 0 ? "方" : "吨");
                goods.vehicle += goods.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': goods.vehicleTypeCode}).name;
                if (goods.vehicleCount > 0)
                    goods.vehicle += goods.vehicleCount + "辆";

                goods.loadingTime = _.find(info_dict.loading_time, {'id': goods.loadingTime}).name;

                if (goods.infoText > 50)goods.infoText = goods.infoText.substr(0, 49);
            });
            res.render('goods/index', {
                goodsList: goodsList,
                current_page: page,
                list_count: limit,
                pages: pages,
                base: req.url,
                sProvince: req.query.sProvince,
                sCity: req.query.sCity,
                eProvince: req.query.eProvince,
                eCity: req.query.eCity
            });
        });
    },
    all: function (req, res, next) {
        var page = Number(req.query.page) || 1;
        var limit = settings.list_count;
        var pages = 0;

        var opt = {isDeleted: 0};

        if (!_.isEmpty(req.query.sProvince))
            opt.sProvinceCode = req.query.sProvince;
        if (!_.isEmpty(req.query.sCity))
            opt.sCityCode = req.query.sCity;
        if (!_.isEmpty(req.query.eProvince))
            opt.eProvinceCode = req.query.eProvince;
        if (!_.isEmpty(req.query.eCity))
            opt.eCityCode = req.query.eCity;

        var createrId = req.session.user.id;
        var eId="";
        if (req.session.user.eId) {
            eId = req.session.user.eId;
        }

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

        req.models.goods.find(opt).where("createrId!=? and updaterId!=? and eId!=?",[createrId,createrId,eId]).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, goodsList) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    goodsList = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            goodsList.forEach(function (goods) {
                moment.lang('zh-cn');
                goods.updatedAt = moment(parseInt(goods.updatedAt)).fromNow();
                if (!goods.image) {
                    goods.image = "/images/no-goods.jpg";
                }
                if (goods.phone && goods.tel)
                    goods.tel = "/ " + goods.tel;

                goods.vehicle = "";
                goods.weight = goods.weight + (goods.unit == 0 ? "方" : "吨");
                goods.vehicle += goods.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': goods.vehicleTypeCode}).name;
                if (goods.vehicleCount > 0)
                    goods.vehicle += goods.vehicleCount + "辆";

                goods.loadingTime = _.find(info_dict.loading_time, {'id': goods.loadingTime}).name;

                if (goods.infoText > 50)goods.infoText = goods.infoText.substr(0, 49);
            });
            res.render('goods/all', {
                goodsList: goodsList,
                current_page: page,
                list_count: limit,
                pages: pages,
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
        res.render('goods/add', {params: req.params, goods: goods, goods_type: info_dict.goods_type, vehicle_type: info_dict.vehicle_type, loading_time: info_dict.loading_time, validate_type: info_dict.validate_type});
    },
    create: function (req, res, next) {
        var goodsEntity = _.merge(new req.models.goods().serialize(), req.body);
        var currentDate = new Date();
        goodsEntity.createrId = req.session.user.id;
        goodsEntity.createdAt = currentDate.getTime();
        goodsEntity.updaterId = req.session.user.id;
        goodsEntity.updatedAt = currentDate.getTime();
        if (req.session.user.eId) {
            goodsEntity.eId = req.session.user.eId;
        }
        goodsEntity.goodsType = _.find(info_dict.goods_type, {'id': goodsEntity.goodsTypeCode}).name;
        goodsEntity.vehicleType = _.find(info_dict.vehicle_type, {'id': goodsEntity.vehicleTypeCode}).name;

        //货物描述
        goodsEntity.goodsWeightText = "";
        if (goodsEntity.weight) {
            goodsEntity.goodsWeightText += goodsEntity.weight + (goodsEntity.unit == 0 ? "方" : "吨");
            goodsEntity.goodsWeightText += _.find(info_dict.goods_type, {'id': goodsEntity.goodsTypeCode}).name;
            goodsEntity.goodsWeightText = ",有" + goodsEntity.goodsWeightText;
        }
        goodsEntity.goodsWeightText = goodsEntity.sProvince + goodsEntity.sCity + goodsEntity.sArea + "→" + goodsEntity.eProvince + goodsEntity.eCity + goodsEntity.eArea + goodsEntity.goodsWeightText;

        //车辆需求
        goodsEntity.goodsVehicleText = "";
        goodsEntity.goodsVehicleText += goodsEntity.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': goodsEntity.vehicleTypeCode}).name;
        if (goodsEntity.vehicleCount > 0)
            goodsEntity.goodsVehicleText += goodsEntity.vehicleCount + "辆";

        goodsEntity.vehicle = goodsEntity.goodsVehicleText;
        goodsEntity.goodsVehicleText = ",求" + goodsEntity.goodsVehicleText;

        goodsEntity.infoText = goodsEntity.goodsWeightText + goodsEntity.goodsVehicleText;

        //补充说明
        if (goodsEntity.freeText) {
            goodsEntity.infoText += "," + goodsEntity.freeText;
        }

        var day = _.find(info_dict.validate_type, {'id': goodsEntity.valid}).day;
        goodsEntity.expiryDate = moment().add('d', day).valueOf();
        req.models.goods.create(goodsEntity, function (err, goods) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            res.redirect('/goods');
        });
    },
    show: function (req, res, next) {
    },
    edit: function (req, res, next) {
        req.models.goods.get(req.params.id, function (err, goods) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            if (!goods.image) {
                goods.image = "/images/no-goods.jpg";
            }

            //货物描述
            goods.goodsWeightText = "";
            goods.goodsWeight = "";
            if (goods.weight) {
                goods.goodsWeightText += goods.goodsWeight = goods.weight + (goods.unit == 0 ? "方" : "吨");
                goods.goodsWeightText += _.find(info_dict.goods_type, {'id': goods.goodsTypeCode}).name;
                goods.goodsWeightText = ",有" + goods.goodsWeightText;
            }

            //车辆需求
            goods.goodsVehicleText = "";
            goods.goodsVehicleText += goods.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': goods.vehicleTypeCode}).name;
            if (goods.vehicleCount > 0)
                goods.goodsVehicleText += goods.vehicleCount + "辆";

            goods.goodsVehicle = goods.goodsVehicleText;
            goods.goodsVehicleText = ",求" + goods.goodsVehicleText;

            goods.loadingTimeText = _.find(info_dict.loading_time, {'id': goods.loadingTime}).name;

            //补充说明
            goods.freeText2 = "";
            if (goods.freeText) {
                if (goods.freeText > 20)goods.freeText = goods.freeText.substr(0, 19);
                goods.freeText = goods.freeText;
                goods.freeText2 += "," + goods.freeText;
            }

            goods.telText = "";
            if (goods.phone && goods.tel) {
                goods.telText = "/ " + goods.tel;
            }

            res.render('goods/edit', {params: req.params, goods: goods, goods_type: info_dict.goods_type, vehicle_type: info_dict.vehicle_type, loading_time: info_dict.loading_time, validate_type: info_dict.validate_type});
        });
    },
    update: function (req, res, next) {
        req.models.goods.get(req.params.id, function (err, goods) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            var goodsEntity = _.merge(goods, req.body);
            goodsEntity.updaterId = req.session.user.id;
            goodsEntity.updatedAt = new Date().getTime();
            goodsEntity.goodsType = _.find(info_dict.goods_type, {'id': goodsEntity.goodsTypeCode}).name;
            goodsEntity.vehicleType = _.find(info_dict.vehicle_type, {'id': goodsEntity.vehicleTypeCode}).name;

            //货物描述
            goodsEntity.goodsWeightText = "";
            if (goodsEntity.weight) {
                goodsEntity.goodsWeightText += goodsEntity.weight + (goodsEntity.unit == 0 ? "方" : "吨");
                goodsEntity.goodsWeightText += _.find(info_dict.goods_type, {'id': goodsEntity.goodsTypeCode}).name;
                goodsEntity.goodsWeightText = ",有" + goods.goodsWeightText;
            }
            goodsEntity.goodsWeightText = goodsEntity.sProvince + goodsEntity.sCity + goodsEntity.sArea + "→" + goodsEntity.eProvince + goodsEntity.eCity + goodsEntity.eArea + goodsEntity.goodsWeightText;

            //车辆需求
            goodsEntity.goodsVehicleText = "";
            goodsEntity.goodsVehicleText += goodsEntity.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': goodsEntity.vehicleTypeCode}).name;
            if (goodsEntity.vehicleCount > 0)
                goodsEntity.goodsVehicleText += goodsEntity.vehicleCount + "辆";

            goodsEntity.vehicle = goodsEntity.goodsVehicleText;
            goodsEntity.goodsVehicleText = ",求" + goodsEntity.goodsVehicleText;

            goodsEntity.infoText = goodsEntity.goodsWeightText + goodsEntity.goodsVehicleText;

            //补充说明
            if (goodsEntity.freeText) {
                goodsEntity.infoText += "," + goodsEntity.freeText;
            }

            var day = _.find(info_dict.validate_type, {'id': goodsEntity.valid}).day;
            goodsEntity.expiryDate = moment().add('d', day).valueOf();
            goods.save(goodsEntity, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/goods');
            });
        });
    }
};