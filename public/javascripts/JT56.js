(function (window) {
    var JT56 = new Object();

    JT56.arrayDistinct = function (a) {
        var arr = [],
            obj = {},
            i = 0,
            len = a.length,
            result;

        for (; i < len; i++) {
            result = a[i];
            if (obj[result] !== result) {
                arr.push(result);
                obj[result] = result;
            }
        }

        return arr;
    };

    JT56.getLocalTime = function (nS, format) {
        var localTime = new Date(parseInt(nS) * 1000);

        if (format) {
            var o =
            {
                "M+": localTime.getMonth() + 1,
                //month                 
                "d+": localTime.getDate(),
                //day                 
                "h+": localTime.getHours(),
                //hour                  
                "m+": localTime.getMinutes(),
                //minute                 
                "s+": localTime.getSeconds(),
                //second                  
                "q+": Math.floor((localTime.getMonth() + 3) / 3),
                //quarter     
                "S": localTime.getMilliseconds()
                //millisecond      
            }
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (localTime.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        } else {
            return localTime.toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
        }
    };

    JT56.DateFormat = function (date, format) {
        var localTime = date;

        if (format) {
            var o =
            {
                "M+": localTime.getMonth() + 1,
                //month                 
                "d+": localTime.getDate(),
                //day                 
                "h+": localTime.getHours(),
                //hour                  
                "m+": localTime.getMinutes(),
                //minute                 
                "s+": localTime.getSeconds(),
                //second                  
                "q+": Math.floor((localTime.getMonth() + 3) / 3),
                //quarter     
                "S": localTime.getMilliseconds()
                //millisecond      
            }
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (localTime.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        } else {
            return localTime.toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
        }
    };

    JT56.tmplFormat = function (template, json) {

        if (!json)
            return template;

        return template && template.replace(/\$\{(.+?)\}/g, function () {

            return json[arguments[1]];

        });
    };

    // 导入JT56到全局变量
    window.JT56 = JT56;

})(window);