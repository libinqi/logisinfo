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
                ctype: '',
                infotype: '',
                scity: '',
                ecity: ''
            },
            page: {
                page_index: Number(req.query.page) || 0,
                page_size: 15
            },
            index: 'logistics_vehicle_list,logistics_yclogisinfo_carlist,logistics_zjlogisinfo_carlist,logistics_tjlogisinfo_carlist',
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
        if (req.query.ctype) {
            model.filter.ctype = req.query.ctype;
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
        cl.SetFieldWeights({
            logistics_tjlogisinfo_carlist: 0,
            logistics_zjlogisinfo_carlist: 0,
            logistics_yclogisinfo_carlist: 1,
            logistics_vehicle_list: 2
        });
        cl.SetIndexWeights({sCity: 100, eCity: 10, loadWeight32: 1, vehicleLength32: 0, vehicleType: 0});

        /*
         *设置查询过滤条件
         */
        if (model.filter.gweight) {
            info_dict.goods_weight.forEach(function (item, index) {
                if (item.id == model.filter.gweight && item.name != "不限") {
                    cl.SetFilterRange('loadWeight32', item.value[0], item.value[1]);
                }
            });
        }

        if (model.filter.sweight && model.filter.eweight) {
            cl.SetFilterRange('loadWeight32', model.filter.sweight, model.filter.eweight);
        }
        else {
            if (model.filter.sweight) {
                cl.SetFilterRange('loadWeight32', model.filter.sweight, 9999999999);
            }
            if (model.filter.eweight) {
                cl.SetFilterRange('loadWeight32', 0, model.filter.eweight);
            }
        }

        if (model.filter.carlen) {
            info_dict.car_length.forEach(function (item, index) {
                if (item.id == model.filter.carlen && item.name != "不限") {
                    cl.SetFilterRange('vehicleLength32', item.value[0], item.value[1]);
                }
            });
        }

        if (model.filter.ctype) {
            info_dict.car_type.forEach(function (item, index) {
                if (item.id == model.filter.ctype) {
                    cl.SetFilterString('vehicleType', item.name,true);
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
            var ecitynumText = model.filter.ecity.replace('-', '');
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
        if (model.filter.ctype) {
            info_dict.car_type.forEach(function (item, index) {
                if (item.id == model.filter.ctype) {
                    keywords += item.name + '|';
                }
            });
        }
        if (model.filter.gweight) {
            info_dict.goods_weight.forEach(function (item, index) {
                if (item.id == model.filter.gweight && item.name != "不限") {
                    keywords += item.value[0] + '|' + item.value[1] + '|';
                }
            });
        }
        if (model.filter.sweight) {
            keywords += model.filter.sweight + '|';
        }
        if (model.filter.eweight) {
            keywords += model.filter.eweight + '|';
        }

        if (model.filter.carlen) {
            info_dict.car_length.forEach(function (item, index) {
                if (item.id == model.filter.carlen && item.name != "不限") {
                    keywords += item.value[0] + '|' + item.value[1] + '|';
                }
            });
        }

        cl.Query('', model.index, function (err, result) {
            if (err || !result || result.total == 0) {
                return res.render('car/index', {
                    title: '车源信息',
                    model: model
                });
            }
            else {
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
//                        return res.render('car/index', {
//                            title: '车源信息',
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
//                return res.render('car/index', {
//                    title: '车源信息',
//                    model: model
//                });
//            }
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
                return res.render('car/index', {
                    title: '车源信息',
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
            index: 'logistics_vehicle_list,logistics_yclogisinfo_carlist,logistics_zjlogisinfo_carlist,logistics_tjlogisinfo_carlist',
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
                    return res.redirect('/car');
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
                    return res.render('car/detail', {
                        title: '车源详情',
                        model: model
                    });
                }
            }
        });
    },
    GetCarList: function (req, res, next) {
        /*
         * 初始化参数
         */
        var model = {
            filter: {
                gweight: req.query.gweight || '',
                sweight: Number(req.query.sweight) || '',
                eweight: Number(req.query.eweight) || '',
                carlen: req.query.carlen || '',
                ctype: '',
                scitynum: '',
                ecitynum: ''
            },
            page: {
                page_index: Number(req.query.page) || 0,
                page_size: Number(req.query.pagesize) || 15
            },
            index: 'logistics_vehicle_list,logistics_yclogisinfo_carlist,logistics_zjlogisinfo_carlist,logistics_tjlogisinfo_carlist',
            sort: {filed: req.query.sort || 'date', sorttype: req.query.sorttype || 'DESC'},
            total_find: 0,
            total: 0,
            time: 0,
            items: []
        };

        if (req.query.scitynum && req.query.scitynum != '全国') {
            model.filter.scitynum = req.query.scitynum;
        }
        if (req.query.ecitynum && req.query.ecitynum != '全国') {
            model.filter.ecitynum = req.query.ecitynum;
        }
        if (req.query.ctype) {
            model.filter.ctype = req.query.ctype;
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
            logistics_tjlogisinfo_carlist: 0,
            logistics_zjlogisinfo_carlist: 0,
            logistics_yclogisinfo_carlist: 1,
            logistics_vehicle_list: 2
        });

        /*
         *设置查询过滤条件
         */
        if (model.filter.gweight) {
            info_dict.goods_weight.forEach(function (item, index) {
                if (item.id == model.filter.gweight && item.name != "不限") {
                    cl.SetFilterRange('loadWeight32', item.value[0], item.value[1]);
                }
            });
        }

        if (model.filter.sweight && model.filter.eweight) {
            cl.SetFilterRange('loadWeight32', model.filter.sweight, model.filter.eweight);
        }
        else {
            if (model.filter.sweight) {
                cl.SetFilterRange('loadWeight32', model.filter.sweight, 9999);
            }
            if (model.filter.eweight) {
                cl.SetFilterRange('loadWeight32', 0, model.filter.eweight);
            }
        }

        if (model.filter.carlen) {
            info_dict.car_length.forEach(function (item, index) {
                if (item.id == model.filter.carlen && item.name != "不限") {
                    cl.SetFilterRange('vehicleLength32', item.value[0], item.value[1]);
                }
            });
        }

        if (model.filter.ctype) {
            info_dict.goods_type.forEach(function (item, index) {
                if (item.id == model.filter.ctype) {
                    cl.SetFilterString('vehicleType', item.name,true);
                }
            });
        }

        if (model.filter.scitynum && model.filter.scitynum != '全国') {
            model.filter.scitynum = model.filter.scitynum.replace('省', '').replace('市', '').replace('-', '');
            cl.SetFilterString('sCity', model.filter.scitynum);
        }
        if (model.filter.ecitynum && model.filter.ecitynum != '全国') {
            var ecitynumText = model.filter.ecitynum.replace('-', '');
            model.filter.ecitynum = model.filter.ecitynum.replace('省', '').replace('市', '').replace('-', '');
            cl.SetFilter('eCity', model.filter.ecitynum);
        }

        var keywords = '';
        if (model.filter.scitynum && model.filter.scitynum != "全国") {
            keywords += model.filter.scitynum + '|';
        }
        if (model.filter.ecitynum && model.filter.ecitynum != "全国") {
            keywords += model.filter.ecitynum + '|';
        }
        if (model.filter.ctype) {
            info_dict.goods_type.forEach(function (item, index) {
                if (item.id == model.filter.ctype) {
                    filterStr += item.name + '|';
                }
            });
        }
        if (model.filter.gweight) {
            info_dict.goods_weight.forEach(function (item, index) {
                if (item.id == model.filter.gweight && item.name != "不限") {
                    keywords += item.value[0] + '|' + item.value[1] + '|';
                }
            });
        }
        if (model.filter.sweight) {
            keywords += model.filter.sweight + '|';
        }
        if (model.filter.eweight) {
            keywords += model.filter.eweight + '|';
        }

        if (model.filter.carlen) {
            info_dict.car_length.forEach(function (item, index) {
                if (item.id == model.filter.carlen && item.name != "不限") {
                    keywords += item.value[0] + '|' + item.value[1] + '|';
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
    applyIntentCar: function (req, res, next) {
        var carId = req.body.carId || '';
        var userId = req.body.userId || '';
        var userType = Number(req.body.userType) || 1;
        var userName = req.body.userName || '';
        var tel = req.body.tel || '';
        var message = req.body.message || '';
        if (carId == '' || userId == '' || message == '') {
            res.send(JSON.stringify({status: false}));
        }
        else {
            var data = JSON.stringify({
                appid: userId,
                appname: userName,
                apptel: tel,
                message: message,
                applyinformationid: '',
                applypersontype: userType,
                vehicleid: carId
            });

            var options = {
                host: settings.apiUrl,
                port: 80,
                path: '/apollo/ws/vehicleintent/saveorupdate',
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