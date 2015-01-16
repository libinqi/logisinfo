/**
 * Created by Administrator on 2015/1/16.
 */
var amqp = require('amqp');
var exchName = 'ApolloExchange'; //exhange 名称
var routeKey = ''; // 路由键

module.exports = function (app) {
    var connOptions = {
        host: '192.168.2.106'
        , port: 5672
        , login: 'guest'
        , password: 'guest'
        , authMechanism: 'AMQPLAIN'
        , vhost: '/'
        , ssl: {
            enabled: false
        }
    };

    var exchOption = {
        type: 'topic'
        , durable: true
        , autoDelete: false
        , confirm: false
    };

    var connection = amqp.createConnection(connOptions);

    connection.on('ready', function () {
        connection.exchange(exchName, exchOption, function (exchange) {
            console.log('opend!');
            // 新增专线
            connection.queue("apollo.line.new", function(queue){
                console.log('created queue')
                queue.bind(exchange, '');
                queue.subscribe(function (message) {
                    console.log(message);
                })
            });
        });
    });

    //connection.on('ready', function () {
    //    // 新增货源
    //    connection.queue('apollo.goodsres.new', function (q) {
    //        q.bind(exchName,'apollo.goodsres.new',function(message){
    //            console.log(message);
    //        });
    //        q.subscribe(function (message) {
    //            console.log(message);
    //        });
    //    });
    //    // 新增车源
    //    connection.queue('aollo.vehicleres.new', function (q) {
    //        q.bind(exchName,'aollo.vehicleres.new',function(message){
    //            console.log(message);
    //        });
    //        q.subscribe(function (message) {
    //            console.log(message);
    //        });
    //    });
    //    // 新增专线
    //    connection.queue('apollo.line.new', function (q) {
    //        q.subscribe(function (message) {
    //            console.log(message);
    //        });
    //    });
    //});
};