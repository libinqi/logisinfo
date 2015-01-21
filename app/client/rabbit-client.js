/**
 * Created by Administrator on 2015/1/16.
 */
var amqp = require('amqp');
var mysql = require('mysql');
var moment = require('moment');
var settings = require('../config/settings');

module.exports = function (app) {
    var exchangeName = 'ApolloExchange'; //exhange 名称
    var exchOption = {
        type: 'topic'
        , durable: true
        , autoDelete: false
        , confirm: false
    };
    var connection = amqp.createConnection(settings.amqp);

    connection.addListener('ready', function () {
        var exchange = connection.exchange(exchangeName, exchOption);
        // 新增队列
        var queue = connection.queue("ApolloQueue", {durable: true, autoDelete: false});
        console.log('created queue:' + queue.name);
        queue.bind(exchange, 'apollo.#.*');
        queue.subscribe(function (message, headers, deliveryInfo) {
            if (message && message.data && message.data.length > 0) {
                var data = JSON.parse(message.data.toString('utf8'));
                switch (deliveryInfo.routingKey) {
                    case 'apollo.goodsres.new':
                        break;
                    case 'apollo.goodsres.update':
                        break;
                    case 'apollo.goodsres.del':
                        break;
                    case 'aollo.vehicleres.new':
                        break;
                    case 'apollo.vehicleres.update':
                        break;
                    case 'apollo.vehicleres.del':
                        break;
                    case 'apollo.line.new':
                        addOrUpdateLine(data, 'INSERT');
                        break;
                    case 'apollo.line.update':
                        addOrUpdateLine(data, 'REPLACE');
                        break;
                    case 'apollo.line.del':
                        delLine(data.id);
                        break;
                    case 'apollo.storage.new':
                        addOrUpdateStore(data,'INSERT');
                        break;
                    case 'apollo.storage.update':
                        addOrUpdateStore(data,'REPLACE');
                        break;
                    case 'apollo.storage.del':
                        delStore(data.id);
                        break;
                    case 'apollo.station.new':
                        break;
                    case 'apollo.station.update':
                        break;
                    case 'apollo.station.del':
                        break;
                    case 'apollo.wharf.new':
                        break;
                    case 'apollo.wharf.update':
                        break;
                    case 'apollo.wharf.del':
                        break;
                }
            }
        });
    });

    connection.on('error', function (e) {
        console.log("connection error...", e);
    })

    var pool = mysql.createPool(settings.database);

    function newGoods(goods) {

    }

    function updateGoods(goods) {

    }

    function delGoods(id) {

    }

    function newVehicle(vehicle) {

    }

    function updateVehicle(vehicle) {

    }

    function delVehicle(id) {

    }

    function addOrUpdateLine(line, action) {
        var lineModel = {
            id: line.lineid.replace('JT56', ''),
            infoId: line.lineid,
            image: '',
            sCity: line.initiation,
            eCity: line.destination,
            heavyCargoPrice: '0',
            foamGoodsPrice: '0',
            lineTypeCode: line.linetype,
            lineType: line.linetypename,
            modeTransport: line.flightinfo,
            isDirect: line.isnonstop,
            transRateDay: 0,
            transRateNumber: 0,
            transTime: 1,
            startContact: line.contact,
            startAddress: '',
            startPhone: line.contactway,
            freeText: line.issuername,
            description: line.issueenterprisename,
            eId: line.issueenterpriseid,
            date: ''
        };

        if (line.picurl) {
            lineModel.image = line.picurl;
        }
        if (line.flightinfo && line.flightinfo != '其他') {
            lineModel.transRateDay = line.flightinfo.substring(0, 1);
        }
        if (line.flightinfo && line.flightinfo != '其他') {
            lineModel.transRateNumber = line.flightinfo.substring(2, 3);
        }
        if (line.contactaddr) {
            lineModel.startAddress = line.contactaddr;
        }
        if (line.updatetime) {
            lineModel.date = DateFormat(line.updatetime);
        }
        else{
            lineModel.date = DateFormat(line.issuerdatetime);
        }

        var sql = action + " INTO `logistics_line_list` (`id`,`infoId`, `image`,`sCity`, `eCity`, `heavyCargoPrice`, `foamGoodsPrice`, `lineTypeCode`, `lineType`, `modeTransport`, `isDirect`, `transRateDay`, `transRateNumber`, `transTime`, `startContact`, `startAddress`, `startPhone`, `freeText`, `description`, `eId`, `date`)" +
            " VALUES (" +
            "" + lineModel.id + "," +
            "'" + lineModel.infoId + "'," +
            "'" + lineModel.image + "', " +
            "'" + lineModel.sCity + "', " +
            "'" + lineModel.eCity + "'," +
            "'" + lineModel.heavyCargoPrice + "', " +
            "'" + lineModel.foamGoodsPrice + "'," +
            "" + lineModel.lineTypeCode + "," +
            "'" + lineModel.lineType + "', " +
            "'" + lineModel.modeTransport + "', " +
            "" + lineModel.isDirect + "," +
            "" + lineModel.transRateDay + "," +
            "" + lineModel.transRateNumber + ", " +
            "" + lineModel.transTime + "," +
            "'" + lineModel.startContact + "'," +
            "'" + lineModel.startAddress + "', " +
            "'" + lineModel.startPhone + "'," +
            "'" + lineModel.freeText + "'," +
            "'" + lineModel.description + "'," +
            "'" + lineModel.eId + "', " +
            "'" + lineModel.date + "')";
        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function delLine(id) {
        pool.getConnection(function (err, connection) {
            connection.query('DELETE FROM `logistics_line_list` WHERE id=' + id.replace('JT56', ''), function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function addOrUpdateStore(store, action) {
        var storeModel = {
            id: store.storageid.replace('JT56', ''),
            storeTypeCode: store.storagetype,
            businessScopeCode: '',
            businessScope:store.scopebusiness,
            storeArea: store.area,
            city: store.location,
            eId: store.issueenterpriseid,
            infoId: store.storageid,
            referPrice: '',
            storeName: store.storagename,
            storeType: store.storagetypename,
            useArea: '',
            image: '',
            phone: '',
            contact: store.contact,
            tel: store.contactway,
            address: '',
            freeText: '',
            description: store.issueenterprisename,
            date: ''
        };

        if (store.referPrice) {
            storeModel.referPrice = store.referPrice;
        }
        if (store.availablearea) {
            storeModel.useArea = store.availablearea;
        }
        if (store.picurl) {
            storeModel.image = store.picurl;
        }
        if (store.mobile) {
            storeModel.phone = store.mobile;
        }
        if (store.specificlocation) {
            storeModel.address = store.specificlocation;
        }
        if (store.storageexplain) {
            storeModel.freeText = store.storageexplain;
        }
        if (store.updatetime) {
            storeModel.date = DateFormat(store.updatetime);
        }
        else
        {
            storeModel.date = DateFormat(store.publishtime);
        }

        var sql = action + " INTO `logistics_store_list` (`id`,`infoId`, `image`,`storeTypeCode`, `businessScopeCode`,`businessScope`, `storeArea`, `city`, `referPrice`, `storeName`, `storeType`, `useArea`, `phone`, `contact`, `tel`, `address`, `freeText`, `description`, `eId`, `date`)" +
            " VALUES (" +
            "" + storeModel.id + "," +
            "'" + storeModel.infoId + "'," +
            "'" + storeModel.image + "', " +
            "" + storeModel.storeTypeCode + ", " +
            "'" + storeModel.businessScopeCode + "'," +
            "'" + storeModel.businessScope + "'," +
            "" + storeModel.storeArea + ", " +
            "'" + storeModel.city + "'," +
            "'" + storeModel.referPrice + "'," +
            "'" + storeModel.storeName + "', " +
            "'" + storeModel.storeType + "', " +
            "'" + storeModel.useArea + "'," +
            "'" + storeModel.phone + "'," +
            "'" + storeModel.contact + "', " +
            "'" + storeModel.tel + "'," +
            "'" + storeModel.address + "'," +
            "'" + storeModel.freeText + "'," +
            "'" + storeModel.description + "'," +
            "'" + storeModel.eId + "', " +
            "'" + storeModel.date + "')";
        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function delStore(id) {
        pool.getConnection(function (err, connection) {
            connection.query('DELETE FROM `logistics_store_list` WHERE id=' + id.replace('JT56', ''), function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function addOrUpdateStation(station) {

    }

    function delStation(id) {

    }

    function addOrUpdatePort(port) {

    }

    function delPort(id) {

    }

    function DateFormat(date) {
        try {
            var localdate = date;
            var year = date.substring(0, 4);
            var month = date.substring(4, 6);
            var day = date.substring(6, 8);

            var hours = date.substring(8, 10);
            var minutes = date.substring(10, 12);
            var seconds = date.substring(12, 14);

            localdate = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
            return parseInt(moment(localdate).valueOf() / 1000);
        }
        catch (ex) {
            return '';
        }
    };
};