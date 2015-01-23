/**
 * Created by libinqi on 2014/10/27.
 */
var mysql = require('mysql');
var info_dict = require('../../lib/info_dict').info_dict;
var settings = require('../config/settings');
var SphinxClient = require("sphinxapi");
var request = require('request');
var async = require('async');

module.exports = {
    index: function (req, res, next) {
        /*
         * 初始化参数
         */
        var model = {
            filter: {
                transrate: Number(req.query.transrate) || '',
                transtime: Number(req.query.transtime) || '',
                linetype: Number(req.query.linetype) || '',
                listtype: Number(req.query.listtype) || 1,
                scity: '',
                scitycode: Number(req.query.scitycode) || '',
                ecity: '',
                ecitycode: Number(req.query.ecitycode) || ''
            },
            page: {
                page_index: Number(req.query.page) || 0,
                page_size: req.query.listtype == 1 ? 12 : 15
            },
            index: 'logistics_line_list',
            sort: {filed: 'date', sorttype: 'DESC'},
            total_find: 0,
            total: 0,
            time: 0,
            items: []
        };

        if (req.query.scity && req.query.scity != '全国') {
            model.filter.scity = req.query.scity;
        }
        else {
            model.filter.scity = '全国';
        }
        if (req.query.ecity && req.query.ecity != '全国') {
            model.filter.ecity = req.query.ecity;
        }
        else {
            model.filter.ecity = '全国';
        }

        /*
         *初始化sphinx
         */
        var cl = new SphinxClient();
        cl.SetServer(settings.sphinx.host, settings.sphinx.port);
        cl.SetLimits(model.page.page_index * model.page.page_size, model.page.page_size, 100000);

        cl.SetMaxQueryTime(20);
        cl.SetMatchMode(6);
        cl.SetSortMode(4, model.sort.filed + ' ' + model.sort.sorttype);

        if (model.filter.transrate) {
            info_dict.trans_rate.forEach(function (item, index) {
                if (item.id == model.filter.transrate) {
                    cl.SetFilter('transRateDay', [item.value[0]]);
                    cl.SetFilter('transRateNumber', [item.value[1]]);
                }
            });
        }
        if (model.filter.transtime) {
            cl.SetFilter('transTime', [model.filter.transtime]);
        }
        if (model.filter.linetype) {
            cl.SetFilter('lineTypeCode', [model.filter.linetype]);
        }
        if (model.filter.scity && model.filter.scity != '全国') {
            cl.SetFilterString('sCity', model.filter.scity);
        }
        if (model.filter.ecity && model.filter.ecity != '全国') {
            cl.SetFilterString('eCity', model.filter.ecity);
        }

        cl.Query('', model.index, function (err, result) {
            if (err || !result || result.total == 0) {
                return res.render('line/index', {
                    title: '专线信息',
                    model: model
                });
            }
            else {
                model.total = result.total;
                model.total_find = result.total_found;
                model.time = result.time;
                model.items = result.matches;

                return res.render('line/index', {
                    title: '专线信息',
                    model: model
                });
//                if (model.items && model.items.length > 0) {
//                    var connection = mysql.createConnection(settings.database);
//
//                    connection.connect();
//
//                    model.items.forEach(function (item, index) {
//                        var query = connection.query('SELECT * FROM company WHERE eId=?', item.attrs.eid, function (err, rows, fields) {
//                            if (!err && rows && rows.length > 0) {
//                                item.attrs.company = rows[0];
//                            }
//                        });
//                    });
//
//                    connection.end(function (err) {
//                        return res.render('line/index', {
//                            title: '专线信息',
//                            model: model
//                        });
//                    });
//                }
//                else {
//                    return res.render('line/index', {
//                        title: '专线信息',
//                        model: model
//                    });
//                }
            }
        });
    },
    GetLineList: function (req, res, next) {
        /*
         * 初始化参数
         */
        var model = {
            filter: {
                transrate: Number(req.query.transrate) || '',
                transtime: Number(req.query.transtime) || '',
                linetype: Number(req.query.linetype) || '',
                scity: '',
                ecity: ''
            },
            page: {
                page_index: Number(req.query.page) || 0,
                page_size: Number(req.query.pagesize) || 15
            },
            index: 'logistics_line_list',
            sort: {filed: 'date', sorttype: 'DESC'},
            total_find: 0,
            total: 0,
            time: 0,
            items: []
        };

        if (req.query.scity && req.query.scity != '全国') {
            model.filter.scity = req.query.scity;
        }
        else {
            model.filter.scity = '全国';
        }
        if (req.query.ecity && req.query.ecity != '全国') {
            model.filter.ecity = req.query.ecity;
        }
        else {
            model.filter.ecity = '全国';
        }

        /*
         *初始化sphinx
         */
        var cl = new SphinxClient();
        cl.SetServer(settings.sphinx.host, settings.sphinx.port);
        cl.SetLimits(model.page.page_index * model.page.page_size, model.page.page_size, 100000);

        cl.SetMaxQueryTime(20);
        cl.SetMatchMode(6);
        cl.SetSortMode(4, model.sort.filed + ' ' + model.sort.sorttype);

        if (model.filter.transrate) {
            info_dict.trans_rate.forEach(function (item, index) {
                if (item.id == model.filter.transrate) {
                    cl.SetFilter('transRateDay', [item.value[0]]);
                    cl.SetFilter('transRateNumber', [item.value[1]]);
                }
            });
        }
        if (model.filter.transtime) {
            cl.SetFilter('transTime', [model.filter.transtime]);
        }
        if (model.filter.linetype) {
            cl.SetFilter('lineTypeCode', [model.filter.linetype]);
        }
        if (model.filter.scity && model.filter.scity != '全国') {
            cl.SetFilterString('sCity', model.filter.scity);
        }
        if (model.filter.ecity && model.filter.ecity != '全国') {
            cl.SetFilterString('eCity', model.filter.ecity);
        }

        cl.Query('', model.index, function (err, result) {
            if (err || !result.matches || result.matches.length <= 0) {
                res.send(JSON.stringify({}));
            }
            else {
                model.total = result.total;
                model.total_find = result.total_found;
                model.time = result.time;
                model.items = result.matches;

                res.send(JSON.stringify(model));
            }
        });
    },
    detail: function (req, res, next) {
        var model = {
            filter: {
                infoid: req.query.infoid || ''
            },
            index: 'logistics_line_list',
            total_find: 0,
            total: 0,
            time: 0,
            items: []
        };

        var cl = new SphinxClient();
        cl.SetServer(settings.sphinx.host, settings.sphinx.port);
        cl.SetMaxQueryTime(20);
        cl.SetFilterString('infoId', model.filter.infoid);

        cl.Query('', model.index, function (err, result) {
            if (err || result.matches.length == 0) {
                return res.redirect('/line');
            }
            else {
                async.series([function (callback) {
                    request(settings.enterpriseApiUrl + '/' + result.matches[0].attrs.eid, function (error, response, body) {
                        if (!error && response.statusCode == 200 && body) {
                            result.matches[0].attrs.enterprise = JSON.parse(body).body;
                        }
                        else {
                            result.matches[0].attrs.enterprise = null;
                        }
                        callback();
                    });
                }], function () {
                    return res.render('line/detail', {
                        title: '专线详情',
                        line: result.matches[0]
                    });
                });
            }
        });
    },
    add: function (req, res, next) {
        var connection = mysql.createConnection({
            host: '192.168.2.110',
            port: 9306,
            user: 'root',
            password: 'sin30=1/2'
        });

        connection.connect();

        connection.query("INSERT INTO `logistics_line_list` (`id`,`infoId`, `sCity`, `eCity`, `heavyCargoPrice`, `foamGoodsPrice`, `lineTypeCode`, `lineType`, `modeTransport`, `isDirect`, `transRateDay`, `transRateNumber`, `transTime`, `startContact`, `startAddress`, `startPhone`, `freeText`, `description`, `eId`, `date`) VALUES (40, 'JT56201412161924020019', '湖南长沙', '上海', '0', '0', '1', '单程', '1天1班', 1, 1, 1, '5', '销售部', '尖山路39号', '15388948865', '活动招商', '彬彬物流', 'JT56201412161853560004', 1418729042)", function (err, rows, fields) {
            if (err) return res.send('新增专线出错:' + err.message);

            return res.send('新增专线成功: ' + rows.length);
        });

        connection.end();
    }
};