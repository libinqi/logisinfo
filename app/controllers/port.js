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

        if (!_.isEmpty(req.query.portType))
            opt.portTypeCode = req.query.portType;
        if (!_.isEmpty(req.query.portLevel))
            opt.portLevelCode = req.query.portLevelCode;

        opt.createrId = req.session.user.id;
        if (req.session.user.eId) {
            opt.eId = req.session.user.eId;
        }

        req.models.port.count(opt, function (err, count) {
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

        req.models.port.find(opt).offset((page - 1) * limit).limit(limit).order('-updatedAt').all(function (err, ports) {
            if (err) {
                if (err.code == orm.ErrorCodes.NOT_FOUND) {
                    ports = [];
                    pages = 0;
                } else {
                    return next(err);
                }
            }
            ports.forEach(function (port) {
                port.updatedAt = moment(parseInt(port.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
                port.statusText = port.status == "1" ? "已发布" : "未发布";

                if (!port.image) {
                    port.image = "/images/no-port.jpg";
                }

                if (port.phone && port.tel)
                    port.tel = "/ " + port.tel;
            });
            res.render('port/index', {
                ports: ports,
                current_page: page,
                list_count: limit,
                pages: pages,
                status: status,
                base: req.url,
                port_type: info_dict.port_type,
                port_level: info_dict.port_level,
                portTypeCode:req.query.portType,
                portLevelCode:req.query.portLevelCode
            });
        });
    },
    add: function (req, res, next) {
        var port = _.mapValues(new req.models.port().serialize(), function (val) {
            if (_.isNull(val))return "";
            return val;
        });
        res.render('port/add', {params: req.params, port: port, port_type: info_dict.port_type, port_level: info_dict.port_level, validate_type: info_dict.validate_type});
    },
    create: function (req, res, next) {
        var portEntity = _.merge(new req.models.port().serialize(), req.body);
        var currentDate = new Date();
        portEntity.createrId = req.session.user.id;
        portEntity.createdAt = currentDate.getTime();
        portEntity.updaterId = req.session.user.id;
        portEntity.updatedAt = currentDate.getTime();
        if (req.session.user.eId) {
            portEntity.eId = req.session.user.eId;
        }
        portEntity.portType = _.find(info_dict.port_type, {'id': portEntity.portTypeCode}).name;
        portEntity.portLevel = _.find(info_dict.port_level, {'id': portEntity.portLevelCode}).name;

        var day = _.find(info_dict.validate_type, {'id': portEntity.valid}).day;
        portEntity.expiryDate = moment().add('d', day).valueOf();
        req.models.port.create(portEntity, function (err, port) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            res.redirect('/port');
        });
    },
    show: function (req, res, next) {
    },
    edit: function (req, res, next) {
        req.models.port.get(req.params.id, function (err, port) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            port.expiryDate = moment(parseInt(port.expiryDate)).format('YYYY-MM-DD HH:mm:ss');
            port.createdAt = moment(parseInt(port.createdAt)).format('YYYY-MM-DD HH:mm:ss');
            port.updatedAt = moment(parseInt(port.updatedAt)).format('YYYY-MM-DD HH:mm:ss');
            port.statusText = port.status == "1" ? "已发布" : "未发布";
            if (!port.image) {
                port.image = "/images/no-port.jpg";
            }

            port.telText = "";
            if (port.phone && port.tel) {
                port.telText = "/ " + port.tel;
            }
            res.render('port/edit', {params: req.params, port: port, port_type: info_dict.port_type, port_level: info_dict.port_level, validate_type: info_dict.validate_type});
        });
    },
    update: function (req, res, next) {
        req.models.port.get(req.params.id, function (err, port) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            var portEntity = _.merge(port, req.body);
            portEntity.updaterId = req.session.user.id;
            portEntity.updatedAt = new Date().getTime();
            portEntity.portType = _.find(info_dict.port_type, {'id': portEntity.portTypeCode}).name;
            portEntity.portLevel = _.find(info_dict.port_level, {'id': portEntity.portLevelCode}).name;

            var day = _.find(info_dict.validate_type, {'id': portEntity.valid}).day;
            portEntity.expiryDate = moment().add('d', day).valueOf();
            port.save(portEntity, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/port');
            });
        });
    },
    remove: function (req, res, next) {
        req.models.port.get(req.params.id, function (err, port) {
            if (err) {
                if (Array.isArray(err)) {
                    return res.send(200, { errors: helpers.formatErrors(err) });
                } else {
                    return next(err);
                }
            }
            port.isDeleted = 1;
            port.updaterId = req.session.user.id;
            port.updatedAt = new Date().getTime();
            port.save(port, function (err) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                res.redirect('/port');
            });
        });
    },
    change_status: function (req, res, next) {
        var status = Number(req.query.status) || "";
        if (_.isNumber(status)) {
            status = status - 1;
            req.models.port.get(req.params.id, function (err, port) {
                if (err) {
                    if (Array.isArray(err)) {
                        return res.send(200, { errors: helpers.formatErrors(err) });
                    } else {
                        return next(err);
                    }
                }
                port.status = status;
                port.updaterId = req.session.user.id;
                port.updatedAt = new Date().getTime();

                port.save(port, function (err) {
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