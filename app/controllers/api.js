/**
 * Company jt56.org
 * Created by libinqi on 13-12-11.
 */

var _ = require('lodash');
var helpers = require('./_helpers');
var orm = require('orm');
var moment = require('moment');
var settings = require('../../config/settings');
var info_dict = require('../../util/info_dict');

module.exports = {
    line: function (req, res, next) {
        var userId = req.query.userId || "";
        var eId = req.query.eId || "";
        var page = Number(req.query.page) || 1;
        var pagesize = Number(req.query.pagesize) || 10;
        var pages = 0;
        var total = 0;

        if (_.isEmpty(userId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({
                rows: [],
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        if (userId) {
            opt.createrId = userId;
        }
//        if (eId) {
//            opt.eId = eId;
//        }

        if (!_.isEmpty(req.query.sProvince))
            opt.sProvinceCode = req.query.sProvince;
        if (!_.isEmpty(req.query.sCity))
            opt.sCityCode = req.query.sCity;
        if (!_.isEmpty(req.query.eProvince))
            opt.eProvinceCode = req.query.eProvince;
        if (!_.isEmpty(req.query.eCity))
            opt.eCityCode = req.query.eCity;

        req.models.line.count(opt, function (err, count) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            else {
                total = count;
                pages = Math.ceil(count / pagesize);
            }
        });

        req.models.line.find(opt).offset((page - 1) * pagesize).limit(pagesize).order('-updatedAt').all(function (err, lines) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    lines = [];
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            lines.forEach(function (line) {
                line.updatedAt = moment(parseInt(line.updatedAt)).format('YYYY-MM-DD HH:mm');
                line.status = line.status == "1" ? "已发布" : "未发布";
                line.transTimeText = _.find(info_dict.trans_time, {'id': line.transTime}).name;
                line.valid = _.find(info_dict.validate_type, {'id': line.valid}).name;

                if(!line.image)
                {
                    line.image="http://img1.jt56.org/uploads/line/no-line.jpg";
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
                if (line.lineGoodsType) {
                    var lineGoodsTypes = line.lineGoodsType.split(',');
                    if (lineGoodsTypes && lineGoodsTypes.length > 0) {
                        line.lineGoodsType = "";
                        for (var i = 0; i < lineGoodsTypes.length; i++) {
                            if (i == 0)
                                line.lineGoodsType += _.find(info_dict.line_goods_type, {'id': lineGoodsTypes[i]}).name;
                            else
                                line.lineGoodsType += "," + _.find(info_dict.line_goods_type, {'id': lineGoodsTypes[i]}).name;
                        }
                    }
                }
            });
            res.send(JSON.stringify({
                rows: lines,
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        });
    },
    getLine: function (req, res, next) {
        var lineId = req.params.id || "";
        var eId = req.query.eId || "";
        if (_.isEmpty(lineId) || _.isEmpty(eId)) {
            res.send(JSON.stringify({}));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        opt.id = lineId;
//        opt.eId = eId;

        req.models.line.find(opt, function (err, lines) {
            var line = {};
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    line = {};
                } else {
                    return next(err);
                }
            }
            if (lines && lines.length > 0) {
                line = lines[0];
                line.updatedAt = moment(parseInt(line.updatedAt)).format('YYYY-MM-DD HH:mm');
                line.status = line.status == "1" ? "已发布" : "未发布";
                line.transTimeText = _.find(info_dict.trans_time, {'id': line.transTime}).name;
                line.valid = _.find(info_dict.validate_type, {'id': line.valid}).name;
                if(!line.image)
                {
                    line.image="http://img1.jt56.org/uploads/line/no-line.jpg";
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
                if (line.lineGoodsType) {
                    var lineGoodsTypes = line.lineGoodsType.split(',');
                    if (lineGoodsTypes && lineGoodsTypes.length > 0) {
                        line.lineGoodsType = "";
                        for (var i = 0; i < lineGoodsTypes.length; i++) {
                            if (i == 0)
                                line.lineGoodsType += _.find(info_dict.line_goods_type, {'id': lineGoodsTypes[i]}).name;
                            else
                                line.lineGoodsType += "," + _.find(info_dict.line_goods_type, {'id': lineGoodsTypes[i]}).name;
                        }
                    }
                }
            }
            res.send(JSON.stringify(line));
        });
    },
    store: function (req, res, next) {
        var userId = req.query.userId || "";
        var eId = req.query.eId || "";
        var page = Number(req.query.page) || 1;
        var pagesize = Number(req.query.pagesize) || 10;
        var pages = 0;
        var total = 0;

        if (_.isEmpty(userId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({
                rows: [],
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        if (userId) {
            opt.createrId = userId;
        }
//        if (eId) {
//            opt.eId = eId;
//        }

        if (!_.isEmpty(req.query.storeType))
            opt.storeTypeCode = req.query.storeType;
        if (!_.isEmpty(req.query.businessScope))
            opt.businessScopeCode = req.query.businessScope;

        req.models.store.count(opt, function (err, count) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            else {
                pages = Math.ceil(count / pagesize);
                total = count;
            }
        });

        req.models.store.find(opt).offset((page - 1) * pagesize).limit(pagesize).order('-updatedAt').all(function (err, stores) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    stores = [];
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            stores.forEach(function (store) {
                store.updatedAt = moment(parseInt(store.updatedAt)).format('YYYY-MM-DD HH:mm');
                store.status = store.status == "1" ? "已发布" : "未发布";
                store.valid = _.find(info_dict.validate_type, {'id': store.valid}).name;

                if(!store.image)
                {
                    store.image="http://img1.jt56.org/uploads/store/no-store.jpg";
                }
                if (store.referPrice == "" || store.referPrice == "0") {
                    store.referPrice = "面议";
                }
                else {
                    store.referPrice = store.referPrice + (store.referPriceFlag == 0 ? "元/平方/年" : "元/平方/月");
                }
            });
            res.send(JSON.stringify({
                rows: stores,
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        });
    },
    getStore: function (req, res, next) {
        var storeId = req.params.id || "";
        var eId = req.query.eId || "";
        if (_.isEmpty(storeId) || _.isEmpty(eId)) {
            res.send(JSON.stringify({}));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        opt.id = storeId;
//        opt.eId = eId;

        req.models.store.find(opt, function (err, stores) {
            var store = {};
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    store = {};
                } else {
                    return next(err);
                }
            }
            if (stores && stores.length > 0) {
                store = stores[0];
                store.updatedAt = moment(parseInt(store.updatedAt)).format('YYYY-MM-DD HH:mm');
                store.status = store.status == "1" ? "已发布" : "未发布";
                store.valid = _.find(info_dict.validate_type, {'id': store.valid}).name;

                if(!store.image)
                {
                    store.image="http://img1.jt56.org/uploads/store/no-store.jpg";
                }
                if (store.referPrice == "" || store.referPrice == "0") {
                    store.referPrice = "面议";
                }
                else {
                    store.referPrice = store.referPrice + (store.referPriceFlag == 0 ? "元/平方/年" : "元/平方/月");
                }
            }
            res.send(JSON.stringify(store));
        });
    },
    goods: function (req, res, next) {
        var userId = req.query.userId || "";
        var eId = req.query.eId || "";
        var page = Number(req.query.page) || 1;
        var pagesize = Number(req.query.pagesize) || 10;
        var pages = 0;
        var total = 0;

        if (_.isEmpty(userId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({
                rows: [],
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        if (userId) {
            opt.createrId = userId;
        }
//        if (eId) {
//            opt.eId = eId;
//        }

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
                    total = 0;
                } else {
                    return next(err);
                }
            }
            else {
                pages = Math.ceil(count / pagesize);
                total = count;
            }
        });

        req.models.goods.find(opt).offset((page - 1) * pagesize).limit(pagesize).order('-updatedAt').all(function (err, goodsList) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    goodsList = [];
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            goodsList.forEach(function (goods) {
                moment.lang('zh-cn');
                goods.updatedAt = moment(parseInt(goods.updatedAt)).fromNow();

                if(!goods.image)
                {
                    goods.image="http://img1.jt56.org/uploads/goods/no-goods.jpg";
                }

                goods.vehicle = "";
                goods.weight = goods.weight + (goods.unit == 0 ? "方" : "吨");
                goods.vehicle += goods.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': goods.vehicleTypeCode}).name;
                if (goods.vehicleCount > 0)
                    goods.vehicle += goods.vehicleCount + "辆";

                goods.loadingTime = _.find(info_dict.loading_time, {'id': goods.loadingTime}).name;
            });
            res.send(JSON.stringify({
                rows: goodsList,
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        });
    },
    getGoods: function (req, res, next) {
        var goodsId = req.params.id || "";
        var eId = req.query.eId || "";
        if (_.isEmpty(goodsId) || _.isEmpty(eId)) {
            res.send(JSON.stringify({}));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        opt.id = goodsId;
//        opt.eId = eId;

        req.models.goods.find(opt, function (err, goodsList) {
            var goods = {};
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    goods = {};
                } else {
                    return next(err);
                }
            }
            if (goodsList && goodsList.length > 0) {
                goods = goodsList[0];
                moment.lang('zh-cn');
                goods.updatedAt = moment(parseInt(goods.updatedAt)).fromNow();
                if(!goods.image)
                {
                    goods.image="http://img1.jt56.org/uploads/goods/no-goods.jpg";
                }
                if (goods.phone && goods.tel)
                    goods.tel = "/ " + goods.tel;

                goods.vehicle = "";
                goods.weight = goods.weight + (goods.unit == 0 ? "方" : "吨");
                goods.vehicle += goods.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': goods.vehicleTypeCode}).name;
                if (goods.vehicleCount > 0)
                    goods.vehicle += goods.vehicleCount + "辆";

                goods.loadingTime = _.find(info_dict.loading_time, {'id': goods.loadingTime}).name;
            }
            res.send(JSON.stringify(goods));
        });
    },
    vehicle: function (req, res, next) {
        var userId = req.query.userId || "";
        var eId = req.query.eId || "";
        var page = Number(req.query.page) || 1;
        var pagesize = Number(req.query.pagesize) || 10;
        var pages = 0;
        var total = 0;

        if (_.isEmpty(userId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({
                rows: [],
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        if (userId) {
            opt.createrId = userId;
        }
//        if (eId) {
//            opt.eId = eId;
//        }

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
                    total = 0;
                } else {
                    return next(err);
                }
            }
            else {
                pages = Math.ceil(count / pagesize);
                total = count;
            }
        });

        req.models.vehicle.find(opt).offset((page - 1) * pagesize).limit(pagesize).order('-updatedAt').all(function (err, vehicles) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    vehicles = [];
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            vehicles.forEach(function (vehicle) {
                moment.lang('zh-cn');
                vehicle.updatedAt = moment(parseInt(vehicle.updatedAt)).fromNow();

                if(!vehicle.image)
                {
                    vehicle.image="http://img1.jt56.org/uploads/vehicle/no-vehicle.jpg";
                }
                vehicle.vehicle = "";
                vehicle.vehicle += vehicle.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': vehicle.vehicleTypeCode}).name;
                if (vehicle.vehicleNumber)
                    vehicle.vehicle += ",车牌号" + vehicle.vehicleNumber;

                if (vehicle.loadWeight) {
                    vehicle.loadWeight = vehicle.loadWeight + (vehicle.unit == 0 ? "方" : "吨");
                }

                vehicle.loadingTime = _.find(info_dict.loading_time, {'id': vehicle.loadingTime}).name;
                if (vehicle.referPrice && vehicle.referPrice != 0) {
                    vehicle.referPrice += vehicle.referPriceFlag == 0 ? "元/方" : "元/吨";
                }
                else {
                    vehicle.referPrice = "面议";
                }
            });
            res.send(JSON.stringify({
                rows: vehicles,
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        });
    },
    getVehicle: function (req, res, next) {
        var vehicleId = req.params.id || "";
        var eId = req.query.eId || "";
        if (_.isEmpty(vehicleId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({}));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        opt.id = vehicleId;
//        opt.eId = eId;

        req.models.vehicle.find(opt, function (err, vehicles) {
            var vehicle = {};
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    vehicle = {};
                } else {
                    return next(err);
                }
            }
            if (vehicles && vehicles.length > 0) {
                vehicle = vehicles[0];
                moment.lang('zh-cn');
                vehicle.updatedAt = moment(parseInt(vehicle.updatedAt)).fromNow();

                if(!vehicle.image)
                {
                    vehicle.image="http://img1.jt56.org/uploads/vehicle/no-vehicle.jpg";
                }
                vehicle.vehicle = "";
                vehicle.vehicle += vehicle.vehicleLength + "米" + _.find(info_dict.vehicle_type, {'id': vehicle.vehicleTypeCode}).name;
                if (vehicle.vehicleNumber)
                    vehicle.vehicle += ",车牌号" + vehicle.vehicleNumber;

                if (vehicle.loadWeight) {
                    vehicle.loadWeight = vehicle.loadWeight + (vehicle.unit == 0 ? "方" : "吨");
                }

                vehicle.loadingTime = _.find(info_dict.loading_time, {'id': vehicle.loadingTime}).name;
                if (vehicle.referPrice && vehicle.referPrice != 0) {
                    vehicle.referPrice += vehicle.referPriceFlag == 0 ? "元/方" : "元/吨";
                }
                else {
                    vehicle.referPrice = "面议";
                }
            }
            res.send(JSON.stringify(vehicle));
        });
    },
    port: function (req, res, next) {
        var userId = req.query.userId || "";
        var eId = req.query.eId || "";
        var page = Number(req.query.page) || 1;
        var pagesize = Number(req.query.pagesize) || 10;
        var pages = 0;
        var total = 0;

        if (_.isEmpty(userId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({
                rows: [],
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        if (userId) {
            opt.createrId = userId;
        }
//        if (eId) {
//            opt.eId = eId;
//        }

        if (!_.isEmpty(req.query.portType))
            opt.portTypeCode = req.query.portType;
        if (!_.isEmpty(req.query.portLevel))
            opt.portLevelCode = req.query.portLevelCode;

        req.models.port.count(opt, function (err, count) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            else {
                pages = Math.ceil(count / pagesize);
                total = count;
            }
        });

        req.models.port.find(opt).offset((page - 1) * pagesize).limit(pagesize).order('-updatedAt').all(function (err, ports) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    ports = [];
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            ports.forEach(function (port) {
                port.updatedAt = moment(parseInt(port.updatedAt)).format('YYYY-MM-DD HH:mm');
                port.statusText = port.status == "1" ? "已发布" : "未发布";

                if(!port.image)
                {
                    port.image="http://img1.jt56.org/uploads/port/no-port.jpg";
                }
            });
            res.send(JSON.stringify({
                rows: ports,
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        });
    },
    getPort: function (req, res, next) {
        var portId = req.params.id || "";
        var eId = req.query.eId || "";
        if (_.isEmpty(portId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({}));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        opt.id = portId;
//        opt.eId = eId;

        req.models.port.find(opt, function (err, ports) {
            var port = {};
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    port = {};
                } else {
                    return next(err);
                }
            }
            if (ports && ports.length > 0) {
                port = ports[0];
                port.updatedAt = moment(parseInt(port.updatedAt)).format('YYYY-MM-DD HH:mm');
                port.statusText = port.status == "1" ? "已发布" : "未发布";

                if(!port.image)
                {
                    port.image="http://img1.jt56.org/uploads/port/no-port.jpg";
                }
            }
            res.send(JSON.stringify(port));
        });
    },
    trainStore: function (req, res, next) {
        var userId = req.query.userId || "";
        var eId = req.query.eId || "";
        var page = Number(req.query.page) || 1;
        var pagesize = Number(req.query.pagesize) || 10;
        var pages = 0;
        var total = 0;

        if (_.isEmpty(userId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({
                rows: [],
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        if (userId) {
            opt.createrId = userId;
        }
//        if (eId) {
//            opt.eId = eId;
//        }

        req.models.trainStore.count(opt, function (err, count) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            else {
                pages = Math.ceil(count / pagesize);
                total = count;
            }
        });

        req.models.trainStore.find(opt).offset((page - 1) * pagesize).limit(pagesize).order('-updatedAt').all(function (err, trainStores) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    trainStores = [];
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            trainStores.forEach(function (trainStore) {
                trainStore.updatedAt = moment(parseInt(trainStore.updatedAt)).format('YYYY-MM-DD HH:mm');
                trainStore.statusText = trainStore.status == "1" ? "已发布" : "未发布";

                if(!trainStore.image)
                {
                    trainStore.image="http://img1.jt56.org/uploads/trainstore/no-trainstore.jpg";
                }
            });
            res.send(JSON.stringify({
                rows: trainStores,
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        });
    },
    getTrainStore: function (req, res, next) {
        var trainStoreId = req.params.id || "";
        var eId = req.query.eId || "";
        if (_.isEmpty(trainStoreId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({}));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        opt.id = trainStoreId;
//        opt.eId = eId;

        req.models.port.find(opt, function (err, trainStores) {
            var trainStore = {};
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    trainStore = {};
                } else {
                    return next(err);
                }
            }
            if (trainStores && trainStores.length > 0) {
                trainStore = trainStores[0];
                trainStore.updatedAt = moment(parseInt(trainStore.updatedAt)).format('YYYY-MM-DD HH:mm');
                trainStore.statusText = trainStore.status == "1" ? "已发布" : "未发布";

                if(!trainStore.image)
                {
                    trainStore.image="http://img1.jt56.org/uploads/trainstore/no-trainstore.jpg";
                }
            }
            res.send(JSON.stringify(trainStore));
        });
    },
    trainLine: function (req, res, next) {
        var userId = req.query.userId || "";
        var eId = req.query.eId || "";
        var page = Number(req.query.page) || 1;
        var pagesize = Number(req.query.pagesize) || 10;
        var pages = 0;
        var total = 0;

        if (_.isEmpty(userId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({
                rows: [],
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        if (userId) {
            opt.createrId = userId;
        }
//        if (eId) {
//            opt.eId = eId;
//        }

        req.models.trainLine.count(opt, function (err, count) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            else {
                pages = Math.ceil(count / pagesize);
                total = count;
            }
        });

        req.models.trainLine.find(opt).offset((page - 1) * pagesize).limit(pagesize).order('-updatedAt').all(function (err, trainLines) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    trainLines = [];
                    pages = 0;
                    total = 0;
                } else {
                    return next(err);
                }
            }
            trainLines.forEach(function (trainLine) {
                trainLine.updatedAt = moment(parseInt(trainLine.updatedAt)).format('YYYY-MM-DD HH:mm');
                trainLine.statusText = trainLine.status == "1" ? "已发布" : "未发布";

                if(!trainLine.image)
                {
                    trainLine.image="http://img1.jt56.org/uploads/trainline/no-trainline.jpg";
                }
            });
            res.send(JSON.stringify({
                rows: trainLines,
                current_page: page,
                pagesize: pagesize,
                pages: pages,
                total: total
            }));
        });
    },
    getTrainLine: function (req, res, next) {
        var trainLineId = req.params.id || "";
        var eId = req.query.eId || "";
        if (_.isEmpty(trainLineId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({}));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        opt.id = trainLineId;
//        opt.eId = eId;

        req.models.trainLine.find(opt, function (err, trainLines) {
            var trainLine = {};
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    trainLine = {};
                } else {
                    return next(err);
                }
            }
            if (trainLines && trainLines.length > 0) {
                trainLine = trainLines[0];
                trainLine.updatedAt = moment(parseInt(trainLine.updatedAt)).format('YYYY-MM-DD HH:mm');
                trainLine.statusText = trainLine.status == "1" ? "已发布" : "未发布";

                if(!trainLine.image)
                {
                    trainLine.image="http://img1.jt56.org/uploads/trainline/no-trainline.jpg";
                }
            }
            res.send(JSON.stringify(trainLine));
        });
    }

}