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

        var opt = {isDeleted:0};

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
                moment.lang('zh-cn');
                goods.updatedAt = moment(goods.updatedAt).fromNow();
                if (!goods.image) {
                    goods.image = "/images/no-line.jpg";
                }
                if (goods.phone && goods.tel)
                    goods.tel = "/ " + goods.tel;

                //货物描述
                goods.infoText = "";
                goods.goodsWeightText = "";
                if (goods.weight) {
                    goods.goodsWeightText += goods.weight = goods.weight + (goods.unit == 0 ? "方" : "吨");
                    goods.goodsWeightText += _.find(info_dict.goods_type, {'id': goods.goodsTypeCode}).name;
                    goods.goodsWeightText = ",有" + goods.goodsWeightText;
                }
                goods.goodsWeightText = goods.sProvince + goods.sCity + "→" + goods.eProvince + goods.eCity + goods.goodsWeightText;

                //车辆需求
                goods.goodsVehicleText = "";
                goods.goodsVehicleText += goods.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': goods.vehicleTypeCode}).name;
                if (goods.vehicleCount > 0)
                    goods.goodsVehicleText += goods.vehicleCount + "辆";

                goods.vehicle = goods.goodsVehicleText;
                goods.goodsVehicleText = ",求" + goods.goodsVehicleText;

                goods.infoText = goods.goodsWeightText + goods.goodsVehicleText;

                goods.loadingTime = _.find(info_dict.loading_time, {'id': goods.loadingTime}).name;

                //补充说明
                if (goods.freeText) {
                    if (goods.freeText > 20)goods.freeText = goods.freeText.substr(0, 19);
                    goods.infoText += "," + goods.freeText;
                }
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
    add: function (req, res, next) {
        var goods = _.mapValues(new req.models.goods().serialize(), function (val) {
            if (_.isNull(val))return "";
            return val;
        });
        res.render('goods/add', {params: req.params, goods: goods, goods_type: info_dict.goods_type, vehicle_type: info_dict.vehicle_type, loading_time: info_dict.loading_time, validate_type: info_dict.validate_type});
    },
    create: function (req, res, next) {
        var goodsEntity = _.merge(new req.models.goods().serialize(), req.body);
        goodsEntity.createrId = "123456";
        goodsEntity.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
        goodsEntity.updaterId = "123456";
        goodsEntity.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
        goodsEntity.eId = "123";
        goodsEntity.goodsType = _.find(info_dict.goods_type, {'id': goodsEntity.goodsTypeCode}).name;
        goodsEntity.vehicleType = _.find(info_dict.vehicle_type, {'id': goodsEntity.vehicleTypeCode}).name;

        var day = _.find(info_dict.validate_type, {'id': goodsEntity.valid}).day;
        goodsEntity.expiryDate = moment().add('d', day).format('YYYY-MM-DD HH:mm:ss');
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
                goods.image = "/images/no-line.jpg";
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
            goodsEntity.updaterId = "123456";
            goodsEntity.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            goodsEntity.goodsType = _.find(info_dict.goods_type, {'id': goodsEntity.goodsTypeCode}).name;
            goodsEntity.vehicleType = _.find(info_dict.vehicle_type, {'id': goodsEntity.vehicleTypeCode}).name;

            var day = _.find(info_dict.validate_type, {'id': goodsEntity.valid}).day;
            goodsEntity.expiryDate = moment().add('d', day).format('YYYY-MM-DD HH:mm:ss');
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