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
                businessscope: Number(req.query.businessscope) || '',
                storetype: Number(req.query.storetype) || '',
                sarea: Number(req.query.sarea) || '',
                earea: Number(req.query.earea) || '',
                scity: '',
                scitycode: Number(req.query.scitycode) || ''
            },
            page: {
                page_index: Number(req.query.page) || 0,
                page_size: 15
            },
            index: 'logistics_store_list',
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

        /*
         *初始化sphinx
         */
        var cl = new SphinxClient();
        cl.SetServer(settings.sphinx.host, settings.sphinx.port);
        cl.SetLimits(model.page.page_index * model.page.page_size, model.page.page_size, 100000);

        cl.SetMaxQueryTime(20);
        cl.SetMatchMode(6);
//        cl.SetRankingMode(7);
        cl.SetSortMode(4, model.sort.filed + ' ' + model.sort.sorttype);

        if (model.filter.businessscope) {
            info_dict.business_scope.forEach(function (item, index) {
                if (item.id == model.filter.businessscope) {
                    cl.SetFilterString('businessScope', item.name);
                }
            });
        }
        if (model.filter.storetype) {
            cl.SetFilter('storeTypeCode', [model.filter.storetype]);
        }
        if (model.filter.sarea && model.filter.earea) {
            cl.SetFilterRange('storeArea', model.filter.sarea, model.filter.earea);
        }
        else if (model.filter.sarea) {
            cl.SetFilterRange('storeArea', model.filter.sarea, 9999999999);
        } else if (model.filter.earea) {
            cl.SetFilterRange('storeArea', 0, model.filter.earea);
        }

        var keyword = '';
        if (model.filter.scity && model.filter.scity != '全国') {
//            keyword = 'city ' + model.filter.scity;
            cl.SetFilterString('city', model.filter.scity);
        }

        cl.Query(keyword, model.index, function (err, result) {
            if (err || !result || result.total == 0) {
                return res.render('store/index', {
                    title: '仓储信息',
                    model: model
                });
            }
            else {
                model.total = result.total;
                model.total_find = result.total_found;
                model.time = result.time;
                model.items = result.matches;

                return res.render('store/index', {
                    title: '仓储信息',
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
//                        return res.render('store/index', {
//                            title: '仓储信息',
//                            model: model
//                        });
//                    });
//                }
//                else{
//                    return res.render('store/index', {
//                        title: '仓储信息',
//                        model: model
//                    });
//                }
            }
        });
    },
    detail: function (req, res, next) {
        var model = {
            filter: {
                infoid: req.query.infoid || ''
            },
            index: 'logistics_store_list',
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
                return res.redirect('/store');
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
                    return res.render('store/detail', {
                        title: '仓库详情',
                        store: result.matches[0]
                    });
                });
            }
        });
    }
};