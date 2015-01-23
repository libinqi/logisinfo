/**
 * Created by libinqi on 2014/10/24.
 */
var http = require('http');
var info_dict = require('../../lib/info_dict').info_dict;
var settings = require('../config/settings');
var SphinxClient = require("sphinxapi");

module.exports = {
    index: function (req, res, next) {
        /*
         * 初始化参数
         */
        var model = {
            filter: {
                gweight: req.query.gweight || '',
                sweight: Number(req.query.sweight) || '',
                eweight: Number(req.query.eweight) || '',
                carlen: req.query.carlen || '',
                gtype: '',
                infotype: '',
                scity: '',
                ecity: ''
            },
            page: {
                page_index: Number(req.query.page) || 0,
                page_size: 15
            },
            index: 'logistics_goods_list,logistics_yclogisinfo_goodslist,logistics_zjlogisinfo_goodslist,logistics_tjlogisinfo_goodslist',
//            index: 'logistics_goods_list',
            sort: {filed: 'source', sorttype: 'ASC'},
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
        if (req.query.gtype) {
            model.filter.gtype = req.query.gtype;
        }
        if (req.query.infotype) {
            model.filter.infotype = Number(req.query.infotype);
        }

        /*
         *初始化sphinx
         */
        var cl = new SphinxClient();
        cl.SetServer(settings.sphinx.host, settings.sphinx.port);
        cl.SetLimits(model.page.page_index * 15, model.page.page_size, 100000);

        cl.SetMaxQueryTime(20);
        cl.SetMatchMode(6);
        cl.SetRankingMode(7);
        cl.SetSortMode(4, model.sort.filed + ' ' + model.sort.sorttype + ',date DESC');
        cl.SetIndexWeights({
            logistics_tjlogisinfo_goodslist: 0,
            logistics_zjlogisinfo_goodslist: 0,
            logistics_yclogisinfo_goodslist: 1,
            logistics_goods_list: 2
        });
        cl.SetIndexWeights({sCity: 100, eCity: 10, weight32: 1, vehicleLength32: 0, goodsType: 0});

        /*
         *设置查询过滤条件
         */
        if (model.filter.gweight) {
            info_dict.goods_weight.forEach(function (item, index) {
                if (item.id == model.filter.gweight && item.name != "不限") {
                    cl.SetFilterRange('weight32', item.value[0], item.value[1]);
                }
            });
        }

        if (model.filter.sweight && model.filter.eweight) {
            cl.SetFilterRange('weight32', model.filter.sweight, model.filter.eweight);
        }
        else {
            if (model.filter.sweight) {
                cl.SetFilterRange('weight32', model.filter.sweight, 9999999999);
            }
            if (model.filter.eweight) {
                cl.SetFilterRange('weight32', 0, model.filter.eweight);
            }
        }

        if (model.filter.carlen) {
            info_dict.car_length.forEach(function (item, index) {
                if (item.id == model.filter.carlen && item.name != "不限") {
                    cl.SetFilterRange('vehicleLength32', item.value[0], item.value[1]);
                }
            });
        }

        if (model.filter.gtype) {
            info_dict.goods_type.forEach(function (item, index) {
                if (item.id == model.filter.gtype) {
                    cl.SetFilterString('goodsType', item.name, true);
                }
            });
        }

        if (model.filter.infotype) {
            cl.SetFilter('infoType', [model.filter.infotype]);
        }

        if (model.filter.scity && model.filter.scity != '全国') {
            model.filter.scity = model.filter.scity.replace('省', '').replace('市', '').replace('-', '');
            cl.SetFilterString('sCity', model.filter.scity);
        }
        if (model.filter.ecity && model.filter.ecity != '全国') {
            var ecityText = model.filter.ecity.replace('-', '');
            model.filter.ecity = model.filter.ecity.replace('省', '').replace('市', '').replace('-', '');
            cl.SetFilterString('eCity', model.filter.ecity);
        }

        var keywords = '';
        if (model.filter.scity && model.filter.scity != "全国") {
            keywords += model.filter.scity + '|';
        }
        if (model.filter.ecity && model.filter.ecity != "全国") {
            keywords += model.filter.ecity + '|';
        }
        if (model.filter.gtype) {
            info_dict.goods_type.forEach(function (item, index) {
                if (item.id == model.filter.gtype) {
                    keywords += item.name + '|';
                }
            });
        }
        if (model.filter.gweight) {
            info_dict.goods_weight.forEach(function (item, index) {
                if (item.id == model.filter.gweight && item.name != "不限") {
                    keywords += item.value[0] + '吨|' + item.value[1] + '吨|';
                }
            });
        }
        if (model.filter.sweight) {
            keywords += model.filter.sweight + '吨|';
        }
        if (model.filter.eweight) {
            keywords += model.filter.eweight + '吨|';
        }

        if (model.filter.carlen) {
            info_dict.car_length.forEach(function (item, index) {
                if (item.id == model.filter.carlen && item.name != "不限") {
                    keywords += item.value[0] + '米|' + item.value[1] + '米|';
                }
            });
        }

        cl.Query('', model.index, function (err, result) {
//            if (err || result.matches.length == 0) {
//                cl.ResetFilters(); //清除过滤条件
//                cl.SetMatchMode(0);
//
//                cl.Query(keywords, model.index, function (err, result) {
//                    if (err) {
//                        console.error(err);
//                    }
//                    else {
//                        model.total = result.total;
//                        model.total_find = result.total_found;
//                        model.time = result.time;
//                        model.items = result.matches;
//
//                        model.items.forEach(function (item) {
//                            keywords.split('|').forEach(function (word) {
//                                if (word) {
//                                    item.attrs.infotext = item.attrs.infotext.replace(word, "<font color=red>" + word + "</font>");
//                                }
//                            });
//                        });
//                        return res.render('goods/index', {
//                            title: '货源信息',
//                            model: model
//                        });
//                    }
//                });
//            }
//            else {
//                model.total = result.total;
//                model.total_find = result.total_found;
//                model.time = result.time;
//                model.items = result.matches;
//
//                model.items.forEach(function (item) {
//                    keywords.split('|').forEach(function (word) {
//                        if (word) {
//                            item.attrs.infotext = item.attrs.infotext.replace(word, "<font color=red>" + word + "</font>");
//                        }
//                    });
//                });
//                return res.render('goods/index', {
//                    title: '货源信息',
//                    model: model
//                });
//            }
            if (err || !result || result.total == 0) {
                return res.render('goods/index', {
                    title: '货源信息',
                    model: model
                });
            }
            else {
                model.total = result.total;
                model.total_find = result.total_found;
                model.time = result.time;
                model.items = result.matches;

                model.items.forEach(function (item) {
                    keywords.split('|').forEach(function (word) {
                        if (word) {
                            item.attrs.infotext = item.attrs.infotext.replace(word, "<font color=red>" + word + "</font>");
                        }
                    });
                });
                return res.render('goods/index', {
                    title: '货源信息',
                    model: model
                });
            }
        });
    },
    detail: function (req, res, next) {
        var model = {
            filter: {
                infoid: req.query.infoid || ''
            },
            index: 'logistics_goods_list,logistics_yclogisinfo_goodslist,logistics_zjlogisinfo_goodslist,logistics_tjlogisinfo_goodslist',
            total_find: 0,
            total: 0,
            time: 0,
            items: []
        };

        var cl = new SphinxClient();
        cl.SetServer(settings.sphinx.host, settings.sphinx.port);
        cl.SetMaxQueryTime(20);
//        cl.SetMatchMode(1);
        cl.SetFilterString('infoId', model.filter.infoid);

        cl.Query('', model.index, function (err, result) {
            if (err || !result || result.total == 0) {
                console.error(err);
                if (req.query.format && req.query.format == 'json') {
                    res.send(JSON.stringify({}));
                }
                else {
                    return res.redirect('/goods');
                }
            }
            else {
                model.total = result.total;
                model.total_find = result.total_found;
                model.time = result.time;
                model.items = result.matches;

                if (req.query.format && req.query.format == 'json') {
                    res.send(JSON.stringify(model.items[0]));
                }
                else {
                    return res.render('goods/detail', {
                        title: '货源详情',
                        model: model
                    });
                }
            }
        });
    },
    GetGoodsList: function (req, res, next) {
        /*
         * 初始化参数
         */
        var model = {
            filter: {
                gweight: req.query.gweight || '',
                sweight: Number(req.query.sweight) || '',
                eweight: Number(req.query.eweight) || '',
                carlen: req.query.carlen || '',
                gtype: '',
                scity: '',
                ecity: ''
            },
            page: {
                page_index: Number(req.query.page) || 0,
                page_size: Number(req.query.pagesize) || 15
            },
            index: 'logistics_goods_list,logistics_yclogisinfo_goodslist,logistics_zjlogisinfo_goodslist,logistics_tjlogisinfo_goodslist',
            sort: {filed: req.query.sort || 'date', sorttype: req.query.sorttype || 'DESC'},
            total_find: 0,
            total: 0,
            time: 0,
            items: []
        };

        if (req.query.scity && req.query.scity != '全国') {
            model.filter.scity = req.query.scity;
        }
        if (req.query.ecity && req.query.ecity != '全国') {
            model.filter.ecity = req.query.ecity;
        }
        if (req.query.gtype) {
            model.filter.gtype = req.query.gtype;
        }

        /*
         *初始化sphinx
         */
        var cl = new SphinxClient();
        cl.SetServer(settings.sphinx.host, settings.sphinx.port);
        cl.SetLimits(model.page.page_index * 15, model.page.page_size, 100000);

        cl.SetMaxQueryTime(20);
        cl.SetMatchMode(6);
        cl.SetRankingMode(7);
        cl.SetSortMode(4, model.sort.filed + ' ' + model.sort.sorttype + ',date DESC');
        cl.SetIndexWeights({
            logistics_tjlogisinfo_goodslist: 0,
            logistics_yclogisinfo_goodslist: 1,
            logistics_goods_list: 2
        });

        /*
         *设置查询过滤条件
         */
        if (model.filter.gweight) {
            info_dict.goods_weight.forEach(function (item, index) {
                if (item.id == model.filter.gweight && item.name != "不限") {
                    cl.SetFilterRange('weight32', item.value[0], item.value[1]);
                }
            });
        }

        if (model.filter.sweight && model.filter.eweight) {
            cl.SetFilterRange('weight32', model.filter.sweight, model.filter.eweight);
        }
        else {
            if (model.filter.sweight) {
                cl.SetFilterRange('weight32', model.filter.sweight, 9999);
            }
            if (model.filter.eweight) {
                cl.SetFilterRange('weight32', 0, model.filter.eweight);
            }
        }

        if (model.filter.carlen) {
            info_dict.car_length.forEach(function (item, index) {
                if (item.id == model.filter.carlen && item.name != "不限") {
                    cl.SetFilterRange('vehicleLength32', item.value[0], item.value[1]);
                }
            });
        }

        if (model.filter.gtype) {
            info_dict.goods_type.forEach(function (item, index) {
                if (item.id == model.filter.gtype) {
                    cl.SetFilterString('goodsType', item.name, true);
                }
            });
        }

        if (model.filter.scity && model.filter.scity != '全国') {
            model.filter.scity = model.filter.scity.replace('省', '').replace('市', '').replace('-', '');
            cl.SetFilterString('sCity', model.filter.scity);
        }
        if (model.filter.ecity && model.filter.ecity != '全国') {
            var ecityText = model.filter.ecity.replace('-', '');
            model.filter.ecity = model.filter.ecity.replace('省', '').replace('市', '').replace('-', '');
            cl.SetFilterString('eCity', model.filter.ecity);
        }

        var keywords = '';
        if (model.filter.scity && model.filter.scity != "全国") {
            keywords += model.filter.scity + '|';
        }
        if (model.filter.ecity && model.filter.ecity != "全国") {
            keywords += model.filter.ecity + '|';
        }
        if (model.filter.gtype) {
            info_dict.goods_type.forEach(function (item, index) {
                if (item.id == model.filter.gtype) {
                    keywords += item.name + '|';
                }
            });
        }
        if (model.filter.gweight) {
            info_dict.goods_weight.forEach(function (item, index) {
                if (item.id == model.filter.gweight && item.name != "不限") {
                    keywords += item.value[0] + '吨|' + item.value[1] + '吨|';
                }
            });
        }
        if (model.filter.sweight) {
            keywords += model.filter.sweight + '吨|';
        }
        if (model.filter.eweight) {
            keywords += model.filter.eweight + '吨|';
        }

        if (model.filter.carlen) {
            info_dict.car_length.forEach(function (item, index) {
                if (item.id == model.filter.carlen && item.name != "不限") {
                    keywords += item.value[0] + '米|' + item.value[1] + '米|';
                }
            });
        }

        cl.Query('', model.index, function (err, result) {
            if (err || !result.matches || result.matches.length <= 0) {
                cl.ResetFilters(); //清除过滤条件
                cl.SetMatchMode(0);

                cl.Query(keywords, model.index, function (err, result) {
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
    applyIntentGoods: function (req, res, next) {
        var goodsId = req.body.goodsId || '';
        var userId = req.body.userId || '';
        var userType = Number(req.body.userType) || 1;
        var userName = req.body.userName || '';
        var tel = req.body.tel || '';
        var message = req.body.message || '';
        if (goodsId == '' || userId == '' || message == '') {
            res.send(JSON.stringify({status: false}));
        }
        else {
            var data = JSON.stringify({
                applicant: userId,
                appname: userName,
                apptel: tel,
                message: message,
                applyinformationid: '',
                applypersontype: userType,
                goodsid: goodsId
            });

            var options = {
                host: settings.apiUrl,
                port: 80,
                path: '/apollo/ws/goodsintent/saveorupdate',
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                }
            };

            var httpRequest = http.request(options, function (result) {
//                console.log('STATUS: ' + result.statusCode);
//                console.log('HEADERS: ' + JSON.stringify(result.headers));
                result.setEncoding('utf8');
                result.on('data', function (chunk) {
                    if (chunk) {
                        chunk = JSON.parse(chunk);
                        if (chunk.code == '000011') {
                            res.send(JSON.stringify({status: true}));
                        }
                        else {
                            res.send(JSON.stringify({status: false}));
                        }
                    } else {
                        res.send(JSON.stringify({status: false}));
                    }
                });
            });

            httpRequest.write(data + '\n');

            httpRequest.on('error', function (e) {
                res.send(JSON.stringify({status: false}));
            });
            httpRequest.end();
        }
    }
}