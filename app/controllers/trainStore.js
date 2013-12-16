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

        if (!_.isEmpty(req.query.trainStoreType))
            opt.trainStoreTypeCode = req.query.trainStoreType;
        if (!_.isEmpty(req.query.trainStoreLevel))
            opt.trainStoreLevelCode = req.query.trainStoreLevelCode;

        req.models.trainStore.count(opt, function (err, count) {
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

        req.models.trainStore.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, trainStores) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    trainStores = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            trainStores.forEach(function (trainStore) {
                trainStore.updatedAt = moment(parseInt(trainStore.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
                trainStore.statusText = trainStore.status == "1" ? "已发布" : "未发布";

                if (trainStore.valid == 1) {
                    trainStore.valid = "永不过期";
                }
                else {
                    moment.lang('zh-cn');
                    trainStore.valid = moment(parseInt(trainStore.expiryDate)).fromNow();
                }

                if (!trainStore.image) {
                    trainStore.image = "/images/no-trainstore.jpg";
                }

                if (trainStore.phone && trainStore.tel)
                    trainStore.tel = "/ " + trainStore.tel;
            });
            res.render('trainstore/all', {
                trainStores: trainStores,
                current_page: page,
                list_count: limit,
                pages: pages,
                status: status,
                base: req.url,
                train_store_type: info_dict.train_store_type,
                train_store_level: info_dict.train_store_level,
                trainStoreTypeCode: req.query.trainStoreType,
                trainStoreLevelCode: req.query.trainStoreLevelCode
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

        if (!_.isEmpty(req.query.trainStoreType))
            opt.trainStoreTypeCode = req.query.trainStoreType;
        if (!_.isEmpty(req.query.trainStoreLevel))
            opt.trainStoreLevelCode = req.query.trainStoreLevelCode;

        opt.createrId = req.session.user.id;
        if (req.session.user.eId) {
            opt.eId = req.session.user.eId;
        }

        req.models.trainStore.count(opt, function (err, count) {
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

        req.models.trainStore.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, trainStores) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    trainStores = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            trainStores.forEach(function (trainStore) {
                trainStore.updatedAt = moment(parseInt(trainStore.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
                trainStore.statusText = trainStore.status == "1" ? "已发布" : "未发布";

                if (!trainStore.image) {
                    trainStore.image = "/images/no-trainstore.jpg";
                }

                if (trainStore.phone && trainStore.tel)
                    trainStore.tel = "/ " + trainStore.tel;
            });
            res.render('trainstore/index', {
                trainStores: trainStores,
                current_page: page,
                list_count: limit,
                pages: pages,
                status: status,
                base: req.url,
                train_store_type: info_dict.train_store_type,
                train_store_level: info_dict.train_store_level,
                trainStoreTypeCode: req.query.trainStoreType,
                trainStoreLevelCode: req.query.trainStoreLevelCode
            });
        });
    },
    add: function (req, res, next) {
        var trainStore = _.mapValues(new req.models.trainStore().serialize(), function (val) {
            if (_.isNull(val))return "";
            return val;
        });
        res.render('trainstore/add', {params: req.params, trainStore: trainStore, train_store_type: info_dict.train_store_type, train_store_level: info_dict.train_store_level, validate_type: info_dict.validate_type});
    },
    create: function (req, res, next) {
        var trainStoreEntity = _.merge(new req.models.trainStore().serialize(), req.body);
        var currentDate = new Date();
        trainStoreEntity.createrId = req.session.user.id;
        trainStoreEntity.createdAt = currentDate.getTime();
        trainStoreEntity.updaterId = req.session.user.id;
        trainStoreEntity.updatedAt = currentDate.getTime();
        if (req.session.user.eId) {
            trainStoreEntity.eId = req.session.user.eId;
        }
        trainStoreEntity.trainStoreType = _.find(info_dict.train_store_type, {'id': trainStoreEntity.trainStoreTypeCode}).name;
        trainStoreEntity.trainStoreLevel = _.find(info_dict.train_store_level, {'id': trainStoreEntity.trainStoreLevelCode}).name;

        var day = _.find(info_dict.validate_type, {'id': trainStoreEntity.valid}).day;
        trainStoreEntity.expiryDate = moment().add('d', day).valueOf();
        req.models.trainStore.create(trainStoreEntity, function (err, trainStore) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            res.redirect('/trainstore');
        });
    },
    show: function (req, res, next) {
    },
    edit: function (req, res, next) {
        req.models.trainStore.get(req.params.id, function (err, trainStore) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            trainStore.expiryDate = moment(parseInt(trainStore.expiryDate)).format('YYYY-MM-DD HH:mm:ss');
            trainStore.createdAt = moment(parseInt(trainStore.createdAt)).format('YYYY-MM-DD HH:mm:ss');
            trainStore.updatedAt = moment(parseInt(trainStore.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
            trainStore.statusText = trainStore.status == "1" ? "已发布" : "未发布";
            if (!trainStore.image) {
                trainStore.image = "/images/no-trainstore.jpg";
            }

            trainStore.telText = "";
            if (trainStore.phone && trainStore.tel) {
                trainStore.telText = "/ " + trainStore.tel;
            }
            res.render('trainstore/edit', {params: req.params, trainStore: trainStore, train_store_type: info_dict.train_store_type, train_store_level: info_dict.train_store_level, validate_type: info_dict.validate_type});
        });
    },
    update: function (req, res, next) {
        req.models.trainStore.get(req.params.id, function (err, trainStore) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            var trainStoreEntity = _.merge(trainStore, req.body);
            trainStoreEntity.updaterId = req.session.user.id;
            trainStoreEntity.updatedAt = new Date().getTime();
            trainStoreEntity.trainStoreType = _.find(info_dict.train_store_type, {'id': trainStoreEntity.trainStoreTypeCode}).name;
            trainStoreEntity.trainStoreLevel = _.find(info_dict.train_store_level, {'id': trainStoreEntity.trainStoreLevelCode}).name;

            var day = _.find(info_dict.validate_type, {'id': trainStoreEntity.valid}).day;
            trainStoreEntity.expiryDate = moment().add('d', day).valueOf();
            trainStore.save(trainStoreEntity, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/trainstore');
            });
        });
    },
    remove: function (req, res, next) {
        req.models.trainStore.get(req.params.id, function (err, trainStore) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            trainStore.isDeleted = 1;
            trainStore.updaterId = req.session.user.id;
            trainStore.updatedAt = new Date().getTime();
            trainStore.save(trainStore, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/trainstore');
            });
        });
    },
    change_status: function (req, res, next) {
        var status = Number(req.query.status) || "";
        if (_.isNumber(status)) {
            status = status - 1;
            req.models.trainStore.get(req.params.id, function (err, trainStore) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                trainStore.status = status;
                trainStore.updaterId = req.session.user.id;
                trainStore.updatedAt = new Date().getTime();

                trainStore.save(trainStore, function (err) {
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