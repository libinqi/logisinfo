var _ = require('lodash');
var helpers = require('./_helpers');
var orm = require('orm');
var moment = require('moment');
var settings = require('../../config/settings');
var info_dict = require('../../util/info_dict');

module.exports = {
    all: function (req, res, next) {
        var status = Number(req.query.status) || "";
        var page = Number(req.query.page) || 1;
        var limit = settings.list_count;
        var pages = 0;

        var opt = {};
        opt.isDeleted = 0;
        opt.status = 1;
        opt.expiryDate = orm.gt(new Date().getTime());

        if (!_.isEmpty(req.query.storeType))
            opt.storeTypeCode = req.query.storeType;
        if (!_.isEmpty(req.query.businessScope))
            opt.businessScopeCode = req.query.businessScope;

        req.models.store.count(opt, function (err, count) {
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

        req.models.store.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, stores) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
//                    res.send(404, "没有任何专线信息");
                    stores = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            stores.forEach(function (store) {
                store.updatedAt = moment(parseInt(store.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
                store.statusText = store.status == "1" ? "已发布" : "未发布";

                if (store.valid == 1) {
                    store.valid = "永不过期";
                }
                else {
                    moment.lang('zh-cn');
                    store.valid = moment(parseInt(store.expiryDate)).fromNow();
                }

                if (!store.image) {
                    store.image = "/images/no-store.jpg";
                }
                if (store.referPrice == "" || store.referPrice == "0") {
                    store.referPrice = "面议";
                }
                else {
                    store.referPrice = store.referPrice + (store.referPriceFlag == 0 ? "元/平方/年" : "元/平方/月");
                }

                if (store.phone && store.tel)
                    store.tel = "/ " + store.tel;
            });
            res.render('store/all', {
                stores: stores,
                current_page: page,
                list_count: limit,
                pages: pages,
                status: status,
                base: req.url,
                store_type: info_dict.store_type,
                business_scope: info_dict.business_scope,
                storeTypeCode: req.query.storeType,
                businessScopeCode: req.query.businessScope
            });
        });
    },
    index: function (req, res, next) {
        var status = Number(req.query.status) || "";
        var page = Number(req.query.page) || 1;
        var limit = settings.list_count;
        var pages = 0;

        var opt = {};
        opt.isDeleted = 0;
        if (_.isNumber(status))
            opt.status = status - 1;

        if (!_.isEmpty(req.query.storeType))
            opt.storeTypeCode = req.query.storeType;
        if (!_.isEmpty(req.query.businessScope))
            opt.businessScopeCode = req.query.businessScope;

//        if (!_.isEmpty(req.query.sProvince))
//            opt.sProvinceCode = req.query.sProvince;
//        if (!_.isEmpty(req.query.sCity))
//            opt.sCityCode = req.query.sCity;
//        if (!_.isEmpty(req.query.eProvince))
//            opt.eProvinceCode = req.query.eProvince;
//        if (!_.isEmpty(req.query.eCity))
//            opt.eCityCode = req.query.eCity;
        opt.createrId = req.session.user.id;
        if (req.session.user.eId) {
            opt.eId = req.session.user.eId;
        }

        req.models.store.count(opt, function (err, count) {
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

        req.models.store.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, stores) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
//                    res.send(404, "没有任何专线信息");
                    stores = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            stores.forEach(function (store) {
                store.updatedAt = moment(parseInt(store.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
                store.statusText = store.status == "1" ? "已发布" : "未发布";

                if (!store.image) {
                    store.image = "/images/no-store.jpg";
                }
                if (store.referPrice == "" || store.referPrice == "0") {
                    store.referPrice = "面议";
                }
                else {
                    store.referPrice = store.referPrice + (store.referPriceFlag == 0 ? "元/平方/年" : "元/平方/月");
                }

                if (store.phone && store.tel)
                    store.tel = "/ " + store.tel;
            });
            res.render('store/index', {
                stores: stores,
                current_page: page,
                list_count: limit,
                pages: pages,
                status: status,
                base: req.url,
                store_type: info_dict.store_type,
                business_scope: info_dict.business_scope,
                storeTypeCode: req.query.storeType,
                businessScopeCode: req.query.businessScope
            });
        });
    },
    add: function (req, res, next) {
        var store = _.mapValues(new req.models.store().serialize(), function (val) {
            if (_.isNull(val))return "";
            return val;
        });
        res.render('store/add', {params: req.params, store: store, store_type: info_dict.store_type, business_scope: info_dict.business_scope, validate_type: info_dict.validate_type});
    },
    create: function (req, res, next) {
        var storeEntity = _.merge(new req.models.store().serialize(), req.body);
        var currentDate = new Date();
        storeEntity.createrId = req.session.user.id;
        storeEntity.createdAt = currentDate.getTime();
        storeEntity.updaterId = req.session.user.id;
        storeEntity.updatedAt = currentDate.getTime();
        if (req.session.user.eId) {
            storeEntity.eId = req.session.user.eId;
        }
        storeEntity.storeType = _.find(info_dict.store_type, {'id': storeEntity.storeTypeCode}).name;
        storeEntity.businessScope = _.find(info_dict.business_scope, {'id': storeEntity.businessScopeCode}).name;

        if (!storeEntity.useArea) {
            delete storeEntity.useArea;
        }

        if (!storeEntity.referPrice) {
            storeEntity.referPrice = 0;
        }

        var day = _.find(info_dict.validate_type, {'id': storeEntity.valid}).day;
        storeEntity.expiryDate = moment().add('d', day).valueOf();
        req.models.store.create(storeEntity, function (err, store) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            res.redirect('/store');
        });
    },
    show: function (req, res, next) {
    },
    edit: function (req, res, next) {
        req.models.store.get(req.params.id, function (err, store) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            store.expiryDate = moment(parseInt(store.expiryDate)).format('YYYY-MM-DD HH:mm:ss');
            store.createdAt = moment(parseInt(store.createdAt)).format('YYYY-MM-DD HH:mm:ss');
            store.updatedAt = moment(parseInt(store.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
            store.statusText = store.status == "1" ? "已发布" : "未发布";
            if (!store.image) {
                store.image = "/images/no-store.jpg";
            }

            store.telText = "";
            if (store.phone && store.tel) {
                store.telText = "/ " + store.tel;
            }
            res.render('store/edit', {params: req.params, store: store, store_type: info_dict.store_type, business_scope: info_dict.business_scope, validate_type: info_dict.validate_type});
        });
    },
    update: function (req, res, next) {
        req.models.store.get(req.params.id, function (err, store) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            var storeEntity = _.merge(store, req.body);
            storeEntity.updaterId = req.session.user.id;
            storeEntity.updatedAt = new Date().getTime();
            storeEntity.storeType = _.find(info_dict.store_type, {'id': storeEntity.storeTypeCode}).name;
            storeEntity.businessScope = _.find(info_dict.business_scope, {'id': storeEntity.businessScopeCode}).name;

            if (!storeEntity.useArea) {
                delete storeEntity.useArea;
            }
            if (!storeEntity.referPrice) {
                storeEntity.referPrice = 0;
            }

            var day = _.find(info_dict.validate_type, {'id': storeEntity.valid}).day;
            storeEntity.expiryDate = moment().add('d', day).valueOf();
            store.save(storeEntity, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/store');
            });
        });
    },
    remove: function (req, res, next) {
        req.models.store.get(req.params.id, function (err, store) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            store.isDeleted = 1;
            store.updaterId = req.session.user.id;
            store.updatedAt = new Date().getTime();
            store.save(store, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/store');
            });
        });
    },
    change_status: function (req, res, next) {
        var status = Number(req.query.status) || "";
        if (_.isNumber(status)) {
            status = status - 1;
            req.models.store.get(req.params.id, function (err, store) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                store.status = status;
                store.updaterId = req.session.user.id;
                store.updatedAt = new Date().getTime();

                store.save(store, function (err) {
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