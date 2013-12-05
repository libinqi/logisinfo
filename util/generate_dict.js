/**
 * Company jt56.org
 * Created by libinqi on 13-11-23.
 */
var http = require('http'),
    events = require("events"),
    fs = require('fs'),
    path = require('path');

var emitter = new events.EventEmitter();
var city_array;
var line_dict_str;

/*
 *创建字典js文件
 */
exports.generateDict = function () {
    // dictType: city
    city_array = [];
    line_dict_str = "";

    get_citys();
    get_line_dict();
};
//获取城市
function get_citys() {
    var listener = emitter.once("shen", function (citys) {
        get_shi(build_city(citys, "100"));
    });
    var listener2 = emitter.on("shi", function (citys) {
        var shi_array = build_city(citys, "1000");
        if (shi_array)get_xian(shi_array);
    });
    var listener3 = emitter.on("xian", function (citys) {
        build_city(citys, "10000");
        writeJS("city.js", "var citys=" + JSON.stringify(city_array) + ";");
    });
    get_shen();
}
function build_city(citys, level) {
    var jsondata = JSON.parse(citys);
    if (jsondata.records) {
        var new_city_array = [];
        for (var i = 0; i < jsondata.records.length; i++) {
            var city = jsondata.records[i];
            var new_city = {
                code: city.colentity.coluuid,
                name: city.coldata.colname,
                verb: city.coldata.colabbre,
                pinyin: city.coldata.colpinyin,
                level: level
            };

            if(level=="100")
            {
                new_city.parentcode="00";
            }
            else if(level=="1000")
            {
                new_city.parentcode=new_city.code.substr(0,2)+"0000";
            }
            else if(level=="10000")
            {
                new_city.parentcode=new_city.code.substr(0,4)+"00";
            }

            new_city_array.push(new_city);
            city_array.push(new_city);
        }
        return new_city_array;
    }
    return null;
}
function get_shen() {
    var options = {
        host: 'data.jt56.org',//主机：切记不可在前面加上HTTP:
        port: 80,//端口号
        path: '/dict/area',//路径
        method: 'GET'//提交方式
    };

    var req = http.request(options, function (res) {
        var body = "";
        res.setEncoding('utf8');
        res.on('data', function (data) {
            body += data;
        });
        res.on("end", function () {
            if (body.length > 0) {
                console.log('获取省数据 \n');
                emitter.emit("shen", body);
            }
        });
    });
    req.on('error', function (e) {
        console.log("获取省数据错误: " + e.message);
    });
    req.end();
}
function get_shi(shen_array) {
    for (var i = 0; i < shen_array.length; i++) {
        var shen = shen_array[i];
        var options = {
            host: 'data.jt56.org',//主机：切记不可在前面加上HTTP:
            port: 80,//端口号
            path: '/dict/area/' + shen.code.substr(0, 2),//路径
            method: 'GET'//提交方式
        };

        var req = http.request(options, function (res) {
            var body = "";
            res.setEncoding('utf8');
            res.on('data', function (data) {
                body += data;
            });
            res.on("end", function () {
                if (body.length > 0) {
                    console.log('获取市数据 \n');
                    emitter.emit("shi", body);
                }
            });
        });
        req.on('error', function (e) {
            console.log("获取市数据错误: " + e.message);
        });
        req.end();
    }
}
function get_xian(shi_array) {
    for (var i = 0; i < shi_array.length; i++) {
        var shi = shi_array[i];
        var options = {
            host: 'data.jt56.org',//主机：切记不可在前面加上HTTP:
            port: 80,//端口号
            path: '/dict/area/' + shi.code.substr(0, 2) + '/' + shi.code.substr(2, 2),//路径
            method: 'GET'//提交方式
        };

        var req = http.request(options, function (res) {
            var body = "";
            res.setEncoding('utf8');
            res.on('data', function (data) {
                body += data;
            });
            res.on("end", function () {
                if (body.length > 0) {
                    console.log('获取县数据 \n');
                    emitter.emit("xian", body);
                }
            });
        });
        req.on('error', function (e) {
            console.log("获取县数据错误: " + e.message);
        });
        req.end();
    }
}
//获取专线字典
function get_line_dict() {
    var line_dict_array = ['line_type', 'mode_transport', 'line_goods_type', 'trans_time', 'validate_type'];
    var listener = emitter.on("line_dict", function (data, line_dict_type) {
        build_line_dict(data, line_dict_type);
        //console.log(line_dict_str);
        writeJS("line_dict.js", line_dict_str);
    });
    for (var i = 0; i < line_dict_array.length; i++) {
        var line_dict = line_dict_array[i];
        get_line_dict2(line_dict);
    }
}

function get_line_dict2(line_dict) {
//    var line_dict_array = ['line_type', 'mode_transport', 'line_goods_type', 'trans_time', 'validate_type'];
//    for (var i = 0; i < line_dict_array.length; i++) {
//        var line_dict = line_dict_array[i];
        var options = {
            host: 'data.jt56.org',//主机：切记不可在前面加上HTTP:
            port: 80,//端口号
            path: '/dict/' + line_dict + '/10',//路径
            method: 'GET'//提交方式
        };

        var req = http.request(options, function (res) {
            var body = "";
            res.setEncoding('utf8');
            res.on('data', function (data) {
                body += data;
            });
            res.on("end", function () {
                if (body.length > 0) {
                    console.log("获取专线字典" + line_dict + "数据 \n");
                    emitter.emit("line_dict", body, line_dict);
                }
            });
        });
        req.on('error', function (e) {
            console.log("获取专线字典'+line_dict+'数据错误: " + e.message);
        });
        req.end();
//    }
}
function build_line_dict(data, line_dict_type) {
    var jsondata = JSON.parse(data);
    if (jsondata.records) {
        var line_dict_array = [];
        for (var i = 0; i < jsondata.records.length; i++) {
            var line_dict = jsondata.records[i];
            line_dict_array.push({
                id: line_dict.colentity.coluuid,
                code: line_dict.coldata[line_dict_type + 'code'],
                name: line_dict.coldata[line_dict_type]
            });
        }
        line_dict_str += "var " + line_dict_type + "=" + JSON.stringify(line_dict_array) + ";";
    }
}
//写入文件
function writeJS(filename, data) {
    var filepath = path.join("./public", "js", filename);
    fs.open(filepath, "w", 0644, function (e, fd) {
        if (e) throw e;
        fs.write(fd, data, 0, 'utf8', function (e) {
            if (e) throw e;
            fs.closeSync(fd);
        })
    });
}
