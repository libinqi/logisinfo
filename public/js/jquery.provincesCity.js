/**
 * jQuery :  城市联动插件
 * @author  libinqi <libinqi@jt56.org>
 *             http://jt56.org
 * @example  $.ProvinceCity(province_id,city_id,area_id);
 * @params   province_id(省下拉控件Id),city_id(市下拉控件Id),area_id(区、县下拉控件Id)
 */
(function ($) {
    $.extend({
        ProvinceCity: function (province_id, city_id, area_id, callback) {
            var _self = this;
            //定义3个默认值
//            _self.data("province", ["请选择省", "请选择省"]);
//            _self.data("city1", ["请选择市", "请选择市"]);
//            _self.data("city2", ["请选择区/县", "请选择区/县"]);
            //分别获取3个下拉框
            var $sel1 = $("#" + province_id);
            var $sel2 = $("#" + city_id);
            var $sel3 = $("#" + area_id);
            //默认省级下拉
            $sel1.append("<option value=''>请选择省</option>");
            $.each(getProvinces(), function (index, data) {
                $sel1.append("<option value='" + data.code + "'>" + data.name + "</option>");
            });
            $sel2.append("<option value=''>请选择市</option>");
            //默认的2级城市下拉
            $sel3.append("<option value=''>请选择区/县</option>");
            //省级联动 控制
            var index1 = "";
            $sel1.change(function () {
                //清空其它2个下拉框
                $sel2[0].options.length = 0;
                $sel3[0].options.length = 0;
                index1 = this.selectedIndex;
                if (index1 == 0) {	//当选择的为 “请选择” 时
                    $sel2.append("<option value=''>请选择市</option>");
                    $sel3.append("<option value=''>请选择区/县</option>");

                    if (callback)callback('', '', '');
                } else {
                    $sel3.append("<option value=''>请选择区/县</option>");
                    var cities = getCitiesByParentCode($($sel1).val());
                    $.each(cities, function (index, data) {
                        $sel2.append("<option value='" + data.code + "'>" + data.name + "</option>");
                    });
                    $.each(getAreasByParentCode(cities[0].code), function (index, data) {
                        $sel3.append("<option value='" + data.code + "'>" + data.name + "</option>");
                    });
                }
            }).change(function () {
                    if (callback)callback($($sel1).find("option:selected").text(), $($sel2).find("option:selected").text(), $($sel3).find("option:selected").text());
                });
            //1级城市联动 控制
            var index2 = "";
            $sel2.change(function () {
                $sel3[0].options.length = 0;
                index2 = this.selectedIndex;
                $sel3.append("<option value=''>请选择区/县</option>");
                var cities = getAreasByParentCode($($sel2).val());
                $.each(cities, function (index, data) {
                    $sel3.append("<option value='" + data.code + "'>" + data.name + "</option>");
                })
            }).change(function () {
                    if (callback)callback($($sel1).find("option:selected").text(), $($sel2).find("option:selected").text(), $($sel3).find("option:selected").text());
                });
            $sel3.change(function () {
                if (callback)callback($($sel1).find("option:selected").text(), $($sel2).find("option:selected").text(), $($sel3).find("option:selected").text());
            });
        }
    });
})(jQuery);