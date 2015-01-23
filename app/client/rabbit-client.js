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
                        addOrUpdateGoods(data, 'INSERT');
                        break;
                    case 'apollo.goodsres.update':
                        addOrUpdateGoods(data, 'REPLACE');
                        break;
                    case 'apollo.goodsres.del':
                        delGoods(data.id);
                        break;
                    case 'apollo.vehicleres.new':
                        addOrUpdateVehicle(data, 'INSERT');
                        break;
                    case 'apollo.vehicleres.update':
                        addOrUpdateVehicle(data, 'REPLACE');
                        break;
                    case 'apollo.vehicleres.del':
                        delVehicle(data.id);
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
                        addOrUpdateStore(data, 'INSERT');
                        break;
                    case 'apollo.storage.update':
                        addOrUpdateStore(data, 'REPLACE');
                        break;
                    case 'apollo.storage.del':
                        delStore(data.id);
                        break;
                    case 'apollo.station.new':
                        addOrUpdateStation(data, 'INSERT');
                        break;
                    case 'apollo.station.update':
                        addOrUpdateStation(data, 'REPLACE');
                        break;
                    case 'apollo.station.del':
                        delStation(data.id);
                        break;
                    case 'apollo.wharf.new':
                        addOrUpdatePort(data, 'INSERT');
                        break;
                    case 'apollo.wharf.update':
                        addOrUpdatePort(data, 'REPLACE');
                        break;
                    case 'apollo.wharf.del':
                        delPort(data.id);
                        break;
                }
            }
        });
    });

    connection.on('error', function (e) {
        console.log("信息消息队列同步错误:", e);
    })

    var pool = mysql.createPool(settings.database);

    function addOrUpdateGoods(goods, action) {
        var goodsModel = {
            id: goods.goodsid.replace('JT56', ''),
            infoId: goods.goodsid,
            sCity: goods.initiation,
            eCity: goods.destination,
            goodsType: goods.goodstypename,
            vehicleType: '',
            vehicleLength: '',
            weight: '',
            vehicleLength32: 0,
            weight32: 0,
            infoType: goods.infotype,
            infoText: '',
            contact: '',
            phone: '',
            eId: goods.issueenterpriseid,
            createrId: goods.issuerid,
            source: 1,
            date: ''
        };

        if (goods.cartypename) {
            goodsModel.vehicleType = goods.cartypename;
        }
        if (goods.carlength) {
            goodsModel.vehicleLength = goods.carlength;

            if (goods.carlength == '17.5以上')
                goods.carlength = 17.5;
            if (goods.carlength == '6.8及以下')
                goods.carlength = 6.8;

            goodsModel.vehicleLength32 = parseInt(goods.carlength);
        }
        if (goods.goodsweight) {
            goodsModel.weight = goods.goodsweight;
            goodsModel.weight32 = parseInt(goods.goodsweight);
        }
        if (goods.infotext) {
            goodsModel.infoText = goods.infotext;
        }
        if (goods.contact) {
            goodsModel.contact = goods.contact;
        }
        if (goods.telephone) {
            goodsModel.phone = goods.telephone;
        }
        if (goods.updatetime) {
            goodsModel.date = DateFormat(goods.updatetime);
        }
        else {
            goodsModel.date = DateFormat(goods.issuedatetime);
        }

        var sql = action + " INTO `logistics_goods_list` (`id`,`infoId`, `sCity`, `eCity`, `goodsType`, `vehicleType`, `vehicleLength`, `weight`, `vehicleLength32`, `weight32`, `infoType`, `infoText`, `contact`, `phone`, `eId`, `createrId`, `source`, `date`)" +
            " VALUES (" +
            "" + goodsModel.id + "," +
            "'" + goodsModel.infoId + "'," +
            "'" + goodsModel.sCity + "', " +
            "'" + goodsModel.eCity + "'," +
            "'" + goodsModel.goodsType + "', " +
            "'" + goodsModel.vehicleType + "'," +
            "'" + goodsModel.vehicleLength + "'," +
            "'" + goodsModel.weight + "', " +
            "" + goodsModel.vehicleLength32 + ", " +
            "" + goodsModel.weight32 + "," +
            "" + goodsModel.infoType + "," +
            "'" + goodsModel.infoText + "', " +
            "'" + goodsModel.contact + "'," +
            "'" + goodsModel.phone + "'," +
            "'" + goodsModel.eId + "', " +
            "'" + goodsModel.createrId + "'," +
            "" + goodsModel.source + ", " +
            "'" + goodsModel.date + "')";
        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function delGoods(id) {
        pool.getConnection(function (err, connection) {
            connection.query('DELETE FROM `logistics_goods_list` WHERE id=' + id.replace('JT56', ''), function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function addOrUpdateVehicle(vehicle, action) {
        var vehicleModel = {
            id: vehicle.vehicleid.replace('JT56', ''),
            infoId: vehicle.vehicleid,
            sCity: vehicle.initiation,
            eCity: vehicle.destination,
            vehicleType: '',
            vehicleLength: '',
            loadWeight: '',
            vehicleLength32: 0,
            loadWeight32: 0,
            infoType: vehicle.infotype,
            infoText: '',
            contact: '',
            phone: '',
            eId: vehicle.enterpriseid,
            createrId: vehicle.issuerid,
            source: 1,
            date: ''
        };

        if (vehicle.cartypename) {
            vehicleModel.vehicleType = vehicle.cartypename;
        }
        if (vehicle.carlength) {
            vehicleModel.vehicleLength = vehicle.carlength;

            if (vehicle.carlength == '17.5以上')
                vehicle.carlength = 17.5;
            if (vehicle.carlength == '6.8及以下')
                vehicle.carlength = 6.8;

            vehicleModel.vehicleLength32 = parseInt(vehicle.carlength);
        }
        if (vehicle.carweight) {
            vehicleModel.loadWeight = vehicle.carweight;
            vehicleModel.loadWeight32 = parseInt(vehicle.carweight);
        }
        if (vehicle.infotext) {
            vehicleModel.infoText = vehicle.infotext;
        }
        if (vehicle.contact) {
            vehicleModel.contact = vehicle.contact;
        }
        if (vehicle.contactway) {
            vehicleModel.phone = vehicle.contactway;
        }
        if (vehicle.updatetime) {
            vehicleModel.date = DateFormat(vehicle.updatetime);
        }
        else {
            vehicleModel.date = DateFormat(vehicle.publishtime);
        }

        var sql = action + " INTO `logistics_vehicle_list` (`id`,`infoId`, `sCity`, `eCity`, `vehicleType`, `vehicleLength`, `loadWeight`, `vehicleLength32`, `loadWeight32`, `infoType`, `infoText`, `contact`, `phone`, `eId`, `createrId`, `source`, `date`)" +
            " VALUES (" +
            "" + vehicleModel.id + "," +
            "'" + vehicleModel.infoId + "'," +
            "'" + vehicleModel.sCity + "', " +
            "'" + vehicleModel.eCity + "'," +
            "'" + vehicleModel.vehicleType + "'," +
            "'" + vehicleModel.vehicleLength + "'," +
            "'" + vehicleModel.loadWeight + "', " +
            "" + vehicleModel.vehicleLength32 + ", " +
            "" + vehicleModel.loadWeight32 + "," +
            "" + vehicleModel.infoType + "," +
            "'" + vehicleModel.infoText + "', " +
            "'" + vehicleModel.contact + "'," +
            "'" + vehicleModel.phone + "'," +
            "'" + vehicleModel.eId + "', " +
            "'" + vehicleModel.createrId + "'," +
            "" + vehicleModel.source + ", " +
            "'" + vehicleModel.date + "')";
        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function delVehicle(id) {
        pool.getConnection(function (err, connection) {
            connection.query('DELETE FROM `logistics_vehicle_list` WHERE id=' + id.replace('JT56', ''), function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
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
        else
        {
            lineModel.transRateDay=0;
        }
        if (line.flightinfo && line.flightinfo != '其他') {
            lineModel.transRateNumber = line.flightinfo.substring(2, 3);
        }
        else
        {
            lineModel.transRateNumber=0;
        }
        if (line.contactaddr) {
            lineModel.startAddress = line.contactaddr;
        }
        if (line.updatetime) {
            lineModel.date = DateFormat(line.updatetime);
        }
        else {
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
            businessScope: store.scopebusiness,
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
        else {
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

    function addOrUpdateStation(station, action) {
        var stationModel = {
            id: station.stationid.replace('JT56', ''),
            trainStoreTypeCode: station.stationtype,
            trainStoreLevelCode: station.stationlevel,
            trainStoreArea: station.area,
            useableArea: '',
            yearThroughput: '',
            goodsTotal: '',
            city: station.location,
            eId: station.issueenterpriseid,
            infoId: station.stationid,
            trainStoreName: station.stationname,
            trainStoreType: station.stationtypename,
            trainStoreLevel: station.stationlevelname,
            address: '',
            image: '',
            phone: '',
            contact: station.contact,
            tel: station.contactway,
            freeText: '',
            description: station.issueenterprisename,
            date: ''
        };

        if (station.availableallow) {
            stationModel.useableArea = station.availableallow;
        }
        if (station.throughput) {
            stationModel.yearThroughput = station.throughput;
        }
        if (station.totalquantity) {
            stationModel.goodsTotal = station.totalquantity;
        }
        if (station.specificlocation) {
            stationModel.address = station.specificlocation;
        }
        if (station.picurl) {
            stationModel.image = station.picurl;
        }
        if (station.storageexplain) {
            stationModel.freeText = station.storageexplain;
        }
        if (station.updatetime) {
            stationModel.date = DateFormat(station.updatetime);
        }
        else {
            stationModel.date = DateFormat(station.publishtime);
        }

        var sql = action + " INTO `logistics_trainstore_list` (`id`,`infoId`, `image`,`trainStoreTypeCode`, `trainStoreLevelCode`,`trainStoreArea`, `useableArea`, `yearThroughput`, `goodsTotal`, `city`, `eId`, `trainStoreName`, `trainStoreType`, `trainStoreLevel`, `address`, `phone`, `contact`, `freeText`, `description`, `date`)" +
            " VALUES (" +
            "" + stationModel.id + "," +
            "'" + stationModel.infoId + "'," +
            "'" + stationModel.image + "', " +
            "" + stationModel.trainStoreTypeCode + ", " +
            "" + stationModel.trainStoreLevelCode + "," +
            "" + stationModel.trainStoreArea + "," +
            "'" + stationModel.useableArea + "', " +
            "'" + stationModel.yearThroughput + "'," +
            "'" + stationModel.goodsTotal + "'," +
            "'" + stationModel.city + "', " +
            "'" + stationModel.eId + "', " +
            "'" + stationModel.trainStoreName + "'," +
            "'" + stationModel.trainStoreType + "'," +
            "'" + stationModel.trainStoreLevel + "', " +
            "'" + stationModel.address + "'," +
            "'" + stationModel.phone + "'," +
            "'" + stationModel.contact + "'," +
            "'" + stationModel.freeText + "'," +
            "'" + stationModel.description + "', " +
            "'" + stationModel.date + "')";

        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function delStation(id) {
        pool.getConnection(function (err, connection) {
            connection.query('DELETE FROM `logistics_trainstore_list` WHERE id=' + id.replace('JT56', ''), function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function addOrUpdatePort(port, action) {
        var portModel = {
            id: port.wharfid.replace('JT56', ''),
            portTypeCode: port.porttype,
            portLevelCode: port.portlevel,
            berthNumber: 0,
            yearThroughput: '',
            city: port.location,
            eId: port.enterpriseid,
            infoId: port.wharfid,
            portName: port.portname,
            portType: port.porttypename,
            portLevel: port.portlevelname,
            landArea: '',
            outWaterLine: '',
            useableberthNumber: '',
            address: '',
            image: '',
            phone: '',
            contact: port.contact,
            tel: port.contactway,
            freeText: '',
            description: port.issueenterprisename,
            date: ''
        };

        if (port.brethnumber) {
            portModel.berthNumber = port.brethnumber;
        }
        if (port.puffyear) {
            portModel.yearThroughput = port.puffyear;
        }
        if (port.landarea) {
            portModel.landArea = port.landarea;
        }
        if (port.shuiyu) {
            portModel.outWaterLine = port.shuiyu;
        }
        if (port.availablebrethnumber) {
            portModel.useableberthNumber = port.availablebrethnumber;
        }
        if (port.specificlocation) {
            portModel.address = port.specificlocation;
        }
        if (port.picurl) {
            portModel.image = port.picurl;
        }
        if (port.mobile) {
            portModel.phone = port.mobile;
        }
        if (port.portexplain) {
            portModel.freeText = port.portexplain;
        }
        if (port.updatetime) {
            portModel.date = DateFormat(port.updatetime);
        }
        else {
            portModel.date = DateFormat(port.publishtime);
        }

        var sql = action + " INTO `logistics_port_list` (`id`,`infoId`, `image`,`portTypeCode`, `portLevelCode`,`berthNumber`, `yearThroughput`, `city`, `eId`, `portName`, `portType`, `portLevel`,`landArea`,`outWaterLine`,`useableberthNumber`, `address`, `phone`, `contact`, `freeText`, `description`, `date`)" +
            " VALUES (" +
            "" + portModel.id + "," +
            "'" + portModel.infoId + "'," +
            "'" + portModel.image + "', " +
            "" + portModel.portTypeCode + ", " +
            "" + portModel.portLevelCode + "," +
            "" + portModel.berthNumber + "," +
            "" + portModel.yearThroughput + ", " +
            "'" + portModel.city + "', " +
            "'" + portModel.eId + "', " +
            "'" + portModel.portName + "'," +
            "'" + portModel.portType + "'," +
            "'" + portModel.portLevel + "', " +
            "'" + portModel.landArea + "'," +
            "'" + portModel.outWaterLine + "'," +
            "'" + portModel.useableberthNumber + "'," +
            "'" + portModel.address + "'," +
            "'" + portModel.phone + "'," +
            "'" + portModel.contact + "'," +
            "'" + portModel.freeText + "'," +
            "'" + portModel.description + "', " +
            "'" + portModel.date + "')";

        pool.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
    }

    function delPort(id) {
        pool.getConnection(function (err, connection) {
            connection.query('DELETE FROM `logistics_port_list` WHERE id=' + id.replace('JT56', ''), function (err, rows, fields) {
                if (err) console.log(err.message);
                connection.release();
            })
        });
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