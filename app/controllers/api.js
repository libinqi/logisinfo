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
        if (eId) {
            opt.eId = eId;
        }

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
        if (_.isEmpty(lineId) && _.isEmpty(eId)) {
            res.send(JSON.stringify({}));
        }

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;

        if (eId) {
            opt.eId = eId;
        }

        req.models.line.get(lineId, function (err, line) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    line = {};
                } else {
                    return next(err);
                }
            }
            line.updatedAt = moment(parseInt(line.updatedAt)).format('YYYY-MM-DD HH:mm');
            line.status = line.status == "1" ? "已发布" : "未发布";
            line.transTimeText = _.find(info_dict.trans_time, {'id': line.transTime}).name;
            line.valid = _.find(info_dict.validate_type, {'id': line.valid}).name;
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
        if (eId) {
            opt.eId = eId;
        }

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
    goods: function (req, res, next) {

    },
    vehicle: function (req, res, next) {

    }
}