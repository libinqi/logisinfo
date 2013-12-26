var _ = require('lodash');
var helpers = require('./_helpers');
var orm = require('orm');
var moment = require('moment');
var settings = require('../../config/settings');
var info_dict = require('../../util/info_dict');
var ids = require("../../util/ids");

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

        req.models.trainLine.count(opt, function (err, count) {
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

        req.models.trainLine.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, trainLines) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    trainLines = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            trainLines.forEach(function (trainLine) {
                trainLine.updatedAt = moment(parseInt(trainLine.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
                trainLine.statusText = trainLine.status == "1" ? "已发布" : "未发布";

                if (trainLine.valid == 1) {
                    trainLine.valid = "永不过期";
                }
                else {
                    moment.lang('zh-cn');
                    trainLine.valid = moment(parseInt(trainLine.expiryDate)).fromNow();
                }

                if (!trainLine.image) {
                    trainLine.image = "/images/no-trainline.jpg";
                }

                if (trainLine.phone && trainLine.tel)
                    trainLine.tel = "/ " + trainLine.tel;
            });
            res.render('trainline/all', {
                trainLines: trainLines,
                current_page: page,
                list_count: limit,
                pages: pages,
                status: status,
                base: req.url
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

        opt.createrId = req.session.user.id;
        if (req.session.user.eId) {
            opt.eId = req.session.user.eId;
        }

        req.models.trainLine.count(opt, function (err, count) {
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

        req.models.trainLine.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, trainLines) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    trainLines = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            trainLines.forEach(function (trainLine) {
                trainLine.updatedAt = moment(parseInt(trainLine.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
                trainLine.statusText = trainLine.status == "1" ? "已发布" : "未发布";

                if (!trainLine.image) {
                    trainLine.image = "/images/no-trainline.jpg";
                }

                if (trainLine.phone && trainLine.tel)
                    trainLine.tel = "/ " + trainLine.tel;
            });
            res.render('trainline/index', {
                trainLines: trainLines,
                current_page: page,
                list_count: limit,
                pages: pages,
                status: status,
                base: req.url
            });
        });
    },
    add: function (req, res, next) {
        var trainLine = _.mapValues(new req.models.trainLine().serialize(), function (val) {
            if (_.isNull(val))return "";
            return val;
        });
        res.render('trainline/add', {params: req.params, trainLine: trainLine, validate_type: info_dict.validate_type});
    },
    create: function (req, res, next) {
        var trainLineEntity = _.merge(new req.models.trainLine().serialize(), req.body);
        var currentDate = new Date();
        trainLineEntity.id=ids.GenerateId('70');
        trainLineEntity.createrId = req.session.user.id;
        trainLineEntity.createdAt = currentDate.getTime();
        trainLineEntity.updaterId = req.session.user.id;
        trainLineEntity.updatedAt = currentDate.getTime();
        if (req.session.user.eId) {
            trainLineEntity.eId = req.session.user.eId;
        }

        if(!trainLineEntity.lineLength)
        {
            delete trainLineEntity.lineLength;
        }

        var day = _.find(info_dict.validate_type, {'id': trainLineEntity.valid}).day;
        trainLineEntity.expiryDate = moment().add('d', day).valueOf();
        req.models.trainLine.create(trainLineEntity, function (err, trainLine) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            res.redirect('/trainline');
        });
    },
    show: function (req, res, next) {
    },
    edit: function (req, res, next) {
        req.models.trainLine.get(req.params.id, function (err, trainLine) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            trainLine.expiryDate = moment(parseInt(trainLine.expiryDate)).format('YYYY-MM-DD HH:mm:ss');
            trainLine.createdAt = moment(parseInt(trainLine.createdAt)).format('YYYY-MM-DD HH:mm:ss');
            trainLine.updatedAt = moment(parseInt(trainLine.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
            trainLine.statusText = trainLine.status == "1" ? "已发布" : "未发布";
            if (!trainLine.image) {
                trainLine.image = "/images/no-trainline.jpg";
            }

            trainLine.telText = "";
            if (trainLine.phone && trainLine.tel) {
                trainLine.telText = "/ " + trainLine.tel;
            }
            res.render('trainline/edit', {params: req.params, trainLine: trainLine, validate_type: info_dict.validate_type});
        });
    },
    update: function (req, res, next) {
        req.models.trainLine.get(req.params.id, function (err, trainLine) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            var trainLineEntity = _.merge(trainLine, req.body);
            trainLineEntity.updaterId = req.session.user.id;
            trainLineEntity.updatedAt = new Date().getTime();

            if(!trainLineEntity.lineLength)
            {
                delete trainLineEntity.lineLength;
            }

            var day = _.find(info_dict.validate_type, {'id': trainLineEntity.valid}).day;
            trainLineEntity.expiryDate = moment().add('d', day).valueOf();
            trainLine.save(trainLineEntity, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/trainline');
            });
        });
    },
    remove: function (req, res, next) {
        req.models.trainLine.get(req.params.id, function (err, trainLine) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            trainLine.isDeleted = 1;
            trainLine.updaterId = req.session.user.id;
            trainLine.updatedAt = new Date().getTime();
            trainLine.save(trainLine, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/trainline');
            });
        });
    },
    change_status: function (req, res, next) {
        var status = Number(req.query.status) || "";
        if (_.isNumber(status)) {
            status = status - 1;
            req.models.trainLine.get(req.params.id, function (err, trainLine) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                trainLine.status = status;
                trainLine.updaterId = req.session.user.id;
                trainLine.updatedAt = new Date().getTime();

                trainLine.save(trainLine, function (err) {
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