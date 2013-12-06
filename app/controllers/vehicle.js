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

        req.models.vehicle.count(opt, function (err, count) {
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

        req.models.vehicle.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, vehicles) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    vehicles = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            vehicles.forEach(function (vehicle) {
                moment.lang('zh-cn');
                vehicle.updatedAt = moment(vehicle.updatedAt).fromNow();
                if (!vehicle.image) {
                    vehicle.image = "/images/no-line.jpg";
                }
                if (vehicle.phone && vehicle.tel)
                    vehicle.tel = "/ " + vehicle.tel;

                //车辆描述
                vehicle.infoText = "";
                vehicle.vehicleText = "";
                vehicle.vehicleText += vehicle.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': vehicle.vehicleTypeCode}).name;
                if (vehicle.vehicleNumber)
                    vehicle.vehicleText += ",车牌号" + vehicle.vehicleNumber;

                vehicle.vehicle = vehicle.vehicleText;
                vehicle.vehicleText = ",有" + vehicle.vehicleText;
                vehicle.vehicleText = vehicle.sProvince + vehicle.sCity + "→" + vehicle.eProvince + vehicle.eCity + vehicle.vehicleText;

                //货物需求
                vehicle.goodsText = "";
                if (vehicle.loadWeight) {
                    vehicle.goodsText += vehicle.loadWeight = vehicle.loadWeight + (vehicle.unit == 0 ? "方" : "吨");
                    vehicle.goodsText = ",求" + vehicle.goodsText + "货";
                }

                vehicle.infoText = vehicle.vehicleText + vehicle.goodsText;

                //补充说明
                if (vehicle.freeText) {
                    if (vehicle.freeText > 20)vehicle.freeText = vehicle.freeText.substr(0, 19);
                    vehicle.infoText += "," + vehicle.freeText;
                }
                vehicle.loadingTime = _.find(info_dict.loading_time, {'id': vehicle.loadingTime}).name;
                if (vehicle.referPrice && vehicle.referPrice != 0) {
                    vehicle.referPrice += vehicle.referPriceFlag == 0 ? "元/方" : "元/吨";
                }
                else {
                    vehicle.referPrice = "面议";
                }
            });
            res.render('vehicle/index', {
                vehicles: vehicles,
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
        var vehicle = _.mapValues(new req.models.vehicle().serialize(), function (val) {
            if (_.isNull(val))return "";
            return val;
        });
        res.render('vehicle/add', {params: req.params, vehicle: vehicle, vehicle_type: info_dict.vehicle_type, loading_time: info_dict.loading_time, validate_type: info_dict.validate_type});
    },
    create: function (req, res, next) {
        var vehicleEntity = _.merge(new req.models.vehicle().serialize(), req.body);
        vehicleEntity.createrId = "123456";
        vehicleEntity.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
        vehicleEntity.updaterId = "123456";
        vehicleEntity.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
        vehicleEntity.eId = "123";
        vehicleEntity.vehicleType = _.find(info_dict.vehicle_type, {'id': vehicleEntity.vehicleTypeCode}).name;

        var day = _.find(info_dict.validate_type, {'id': vehicleEntity.valid}).day;
        vehicleEntity.expiryDate = moment().add('d', day).format('YYYY-MM-DD HH:mm:ss');
        req.models.vehicle.create(vehicleEntity, function (err, vehicle) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            res.redirect('/vehicle');
        });
    },
    show: function (req, res, next) {
    },
    edit: function (req, res, next) {
        req.models.vehicle.get(req.params.id, function (err, vehicle) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            if (!vehicle.image) {
                vehicle.image = "/images/no-line.jpg";
            }

            //车辆描述
            vehicle.vehicleText = "";
            vehicle.vehicleText += vehicle.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': vehicle.vehicleTypeCode}).name;
            vehicle.vehicleNumberText = "";
            if (vehicle.vehicleNumber)
                vehicle.vehicleNumberText = ",车牌号" + vehicle.vehicleNumber;

            vehicle.vehicle = vehicle.vehicleText;
            vehicle.vehicleText = ",有" + vehicle.vehicleText;

            //货物需求
            vehicle.goodsText = "";
            if (vehicle.loadWeight) {
                vehicle.goodsText += vehicle.loadWeightText = vehicle.loadWeight + (vehicle.unit == 0 ? "方" : "吨");
                vehicle.goodsText = ",求" + vehicle.goodsText + "货";
            }

            //补充说明
            vehicle.freeText2 = "";
            if (vehicle.freeText) {
                if (vehicle.freeText > 20)vehicle.freeText = vehicle.freeText.substr(0, 19);
                vehicle.freeText = vehicle.freeText;
                vehicle.freeText2 += "," + vehicle.freeText;
            }

            vehicle.telText = "";
            if (vehicle.phone && vehicle.tel) {
                vehicle.telText = "/ " + vehicle.tel;
            }

            vehicle.loadingTimeText = _.find(info_dict.loading_time, {'id': vehicle.loadingTime}).name;
            vehicle.referPriceText = "";
            if (vehicle.referPrice && vehicle.referPrice != 0) {
                vehicle.referPriceText += vehicle.referPrice + (vehicle.referPriceFlag == 0 ? "元/方" : "元/吨");
            }
            else {
                vehicle.referPriceText = "面议";
            }
            res.render('vehicle/edit', {params: req.params, vehicle: vehicle, vehicle_type: info_dict.vehicle_type, loading_time: info_dict.loading_time, validate_type: info_dict.validate_type});
        });
    },
    update: function (req, res, next) {
        req.models.vehicle.get(req.params.id, function (err, vehicle) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            var vehicleEntity = _.merge(vehicle, req.body);
            vehicleEntity.updaterId = "123456";
            vehicleEntity.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            vehicleEntity.vehicleType = _.find(info_dict.vehicle_type, {'id': vehicleEntity.vehicleTypeCode}).name;

            var day = _.find(info_dict.validate_type, {'id': vehicleEntity.valid}).day;
            vehicleEntity.expiryDate = moment().add('d', day).format('YYYY-MM-DD HH:mm:ss');
            vehicle.save(vehicleEntity, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/vehicle');
            });
        });
    }
};