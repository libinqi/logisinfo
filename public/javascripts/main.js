/**
 * Created by libinqi on 2014/12/1.
 */
$(document).ready(function () {
    //获取最新货源
    var getNewsGooods = function () {
        $.ajax({
            url: '/goods/GetGoodsList?pagesize=13',
            type: 'GET',
            dataType: 'json',
            error: function (error) {

            },
            success: function (result) {
                if (result && result.items && result.items.length > 0) {
                    var goodsListBox = $('#goodsList');
                    goodsListBox.empty();
                    $.each(result.items, function (index, goods) {
                        //初始化信息条HTML元素
                        var goodsItemElement = $('<li>');
                        var goodsItemText = $('<a>');
                        var goodsItemTime = $('<span>');
                        //填充信息文本内容
                        goodsItemText.text(goods.attrs.infotext.length > 32 ? goods.attrs.infotext.substring(0, 30) + '...' : goods.attrs.infotext);
                        goodsItemText.attr('href', '/goods/detail?infoid=' + goods.attrs.infoid);
                        goodsItemText.attr('target', '_blank');
                        goodsItemText.addClass('mess_main');
                        //填充信息发布时间
                        goodsItemTime.text($.timeago(goods.attrs.date * 1000));
                        goodsItemTime.addClass('time');
                        //生成信息条HTML
                        goodsItemElement.append(goodsItemText);
                        goodsItemElement.append(goodsItemTime);
                        goodsItemElement.addClass('mess_li');
                        if (index == result.items.length - 1) {
                            goodsItemElement.addClass('no-border');
                        }
                        goodsListBox.append(goodsItemElement);
                    });
                }
                else {
                }
            }
        });
    }();
    //获取最新车源
    var getNewsCar = function () {
        $.ajax({
            url: '/car/GetCarList?pagesize=13',
            type: 'GET',
            dataType: 'json',
            error: function (error) {

            },
            success: function (result) {
                if (result && result.items && result.items.length > 0) {
                    var carListBox = $('#carList');
                    carListBox.empty();
                    $.each(result.items, function (index, car) {
                        //初始化信息条HTML元素
                        var carItemElement = $('<li>');
                        var carItemText = $('<a>');
                        var carItemTime = $('<span>');
                        //填充信息文本内容
                        carItemText.text(car.attrs.infotext.length > 28 ? car.attrs.infotext.substring(0, 25) + '...' : car.attrs.infotext);
                        carItemText.attr('href', '/car/detail?infoid=' + car.attrs.infoid);
                        carItemText.attr('target', '_blank');
                        carItemText.addClass('mess_main');
                        //填充信息发布时间
                        carItemTime.text($.timeago(car.attrs.date * 1000));
                        carItemTime.addClass('time');
                        //生成信息条HTML
                        carItemElement.append(carItemText);
                        carItemElement.append(carItemTime);
                        carItemElement.addClass('mess_li');
                        if (index == result.items.length - 1) {
                            carItemElement.addClass('no-border');
                        }
                        carListBox.append(carItemElement);
                    });
                }
                else {
                }
            }
        });
    }();

    //获取最新专线
    var getNewsLine = function () {
        $.ajax({
            url: '/line/GetLineList?pagesize=9',
            type: 'GET',
            dataType: 'json',
            error: function (error) {

            },
            success: function (result) {
                if (result && result.items && result.items.length > 0) {
                    var lineListBox = $('#lineList');
                    lineListBox.empty();
                    $.each(result.items, function (index, line) {
                        //初始化信息条HTML元素
                        var lineItemElement = $('<div>');
                        //初始化起始地、目的地
                        var lineItemCity = $('<p>');
                        lineItemCity.addClass('line_title');
                        var lineItemType = $('<span>');
                        if (line.attrs.linetypecode == 1) {
                            lineItemType.append('<img src="images/dan_03.jpg" width="25" height="12"/>');
                        }
                        else {
                            lineItemType.append('<img src="images/kuai.jpg"  width="25" height="12"/>');
                        }
                        lineItemType.addClass('row');
                        lineItemCity.append(line.attrs.scity);
                        lineItemCity.append(lineItemType);
                        lineItemCity.append(line.attrs.ecity);
                        //初始化企业信息
                        var lineItemCompany = $('<p>');
                        lineItemCompany.addClass('line_p');
                        var lineItemCompanyName = $('<a>');
                        lineItemCompanyName.text(line.attrs.description ? line.attrs.description : line.attrs.freetext);
                        lineItemCompanyName.attr('href', '#');
                        lineItemCompanyName.attr('target', '_blank');
                        lineItemCompanyName.addClass('line_com');
                        lineItemCompany.append(lineItemCompanyName);
                        //初始化专线属性
                        var lineItemL = $('<div>');
                        lineItemL.addClass('line_l');
                        //1
                        var lineItemL_p1 = $('<p>');
                        lineItemL_p1.addClass('line_l_p');
                        lineItemL_p1.text('发班车次：');
                        lineItemL_p1.append('<span class="line_time">' + line.attrs.modetransport + '</span>');
                        //2
                        var lineItemL_p2 = $('<p>');
                        lineItemL_p2.addClass('line_l_p');
                        lineItemL_p2.text('运输时长：');
                        lineItemL_p2.append('<span class="line_time">' + line.attrs.transtime + '天</span>');
                        //3
                        var lineItemL_p3 = $('<p>');
                        lineItemL_p3.addClass('line_l_p');
                        lineItemL_p3.text('重货：');

                        if (line.attrs.heavycargoprice && line.attrs.heavycargoprice != 0) {
                            lineItemL_p3.append('<span class="p_color">' + line.attrs.heavycargoprice + '</span>元/公斤');
                        }
                        else {
                            lineItemL_p3.append('<span class="p_color">面议</span>');
                        }

                        lineItemL.append(lineItemL_p1);
                        lineItemL.append(lineItemL_p2);
                        lineItemL.append(lineItemL_p3);

                        var lineItemR = $('<div>');
                        lineItemR.addClass('line_r');
                        //1
                        var lineItemR_p1 = $('<p>');
                        lineItemR_p1.addClass('line_l_p');
                        lineItemR_p1.text('是否到达：');
                        lineItemR_p1.append('<span class="line_time">' + (line.attrs.isdirect == 1 ? '直达' : '中转') + '</span>');
                        //2
                        var lineItemR_p2 = $('<p>');
                        lineItemR_p2.addClass('line_l_p');
                        lineItemR_p2.text('运输方式：');
                        lineItemR_p2.append('<span class="line_time">公路运输</span>');
                        //3
                        var lineItemR_p3 = $('<p>');
                        lineItemR_p3.addClass('line_l_p');
                        lineItemR_p3.text('泡货：');
                        if (line.attrs.foamgoodsprice && line.attrs.foamgoodsprice != 0) {
                            lineItemR_p3.append('<span class="p_color">' + line.attrs.foamgoodsprice + '</span>元/方');
                        }
                        else {
                            lineItemR_p3.append('<span class="p_color">面议</span>');
                        }
                        lineItemR.append(lineItemR_p1);
                        lineItemR.append(lineItemR_p2);
                        lineItemR.append(lineItemR_p3);

                        //初始化查看详情
                        var lineItemDetail = $('<div class="line_btn"><a href="/line/detail?infoid=' + line.attrs.infoid + '" class="line_check" target="_blank">查看详情</a></div>');

                        //生成专线HTML
                        lineItemElement.append(lineItemCity);
                        lineItemElement.append(lineItemCompany);
                        lineItemElement.append(lineItemL);
                        lineItemElement.append(lineItemR);
                        lineItemElement.append(lineItemDetail);

                        lineItemElement.addClass('line_con');
                        if ((index + 1) % 3 != 0) {
                            lineItemElement.addClass('margin-75');
                        }
                        lineListBox.append(lineItemElement);
                    });
                }
                else {
                }
            }
        });
    }();

    //获取企业列表
    var getNewsEnterprise = function () {
        $.ajax({
            url: 'http://apollo.jt56.org/apollo/ws/enterprise/getlist?page=1&rows=12&status=1',
            type: 'GET',
            dataType: 'jsonp',
            jsonp: '_jsonp',
            error: function (error) {

            },
            success: function (result) {
                if (result && result.body && result.body.data.length > 0) {
                    var enterpriseListBox = $('#enterpriseList');
                    enterpriseListBox.addClass('en_com');
                    enterpriseListBox.empty();
                    $.each(result.body.data, function (index, enterprise) {
                            //初始化企业HTML元素
                            var enterpriseListElement = $('<li>');
                            var enterpriseItem = $('<a>');
                            enterpriseItem.addClass('en_a');
                            if (!enterprise.website && enterprise.website.indexOf('http://') < 0) {
                                enterprise.website = 'http://' + enterprise.website;
                            }
                            enterpriseItem.attr('href', enterprise.website);
                            enterpriseItem.attr('target', '_blank');
                            //初始化企业LOGO
                            var enterpriseItemImageContent = $('<p>');
                            enterpriseItemImageContent.addClass('en_img');
                            var enterpriseItemImage=$('<img>');
                            enterpriseItemImage.addClass('grayscale');
                            enterpriseItemImage.attr('src',enterprise.logourl);
                            enterpriseItemImage.width(201);
                            enterpriseItemImage.height(80);
                            enterpriseItemImage.mouseover(function(){
                                $(this).removeClass("grayscale");
                            }).mouseout(function(){
                                $(this).addClass("grayscale");
                            });
                            enterpriseItemImageContent.append(enterpriseItemImage);
                            //初始化企业名称
                            var enterpriseItemName = $('<p>');
                            enterpriseItemName.addClass('en_txt');
                            enterpriseItemName.text(enterprise.enterprisename);

                            enterpriseItem.append(enterpriseItemImageContent);
                            enterpriseItem.append(enterpriseItemName);
                            enterpriseListElement.append(enterpriseItem);
                            enterpriseListElement.addClass('en_li');
                            if ((index + 1) % 4 != 0) {
                                enterpriseListElement.addClass('margin-36');
                            }

                            enterpriseListBox.append(enterpriseListElement);
                        }
                    );

                }
            }
        });
    }();

    $('.nav_car').bind('click', function () {
        $('.nav_goods').removeClass('nav_goodsactive');
        $('.nav_car').addClass('nav_caractive');
        $('.panel_goods').removeClass('panel_active');
        $('.panel_car').addClass('panel_active');
    });

    $('.nav_goods').bind('click', function () {
        $('.nav_car').removeClass('nav_caractive');
        $('.nav_goods').addClass('nav_goodsactive');
        $('.panel_car').removeClass('panel_active');
        $('.panel_goods').addClass('panel_active');
    });

    $('#select_carlen').bind('click', function () {
        var ul_option = $('#select_carlen_ul');
        if ($(ul_option).is(':hidden')) {
            ul_option.show();
        }
        else {
            ul_option.hide();
        }
        var li_option = ul_option.find('li');
        li_option.bind('click', function () {
            $(this).addClass('selected').siblings().removeClass('selected');
            var value = $(this).text();
            $('#select_carlen').find('span').text(value);
            ul_option.hide();
        });
        li_option.bind('mouseover', function () {
            $(this).addClass('hover').siblings().removeClass('hover');
        });
        li_option.bind('mouseout', function () {
            li_option.removeClass('hover');
        });
    });

    $('#select_goodstype').bind('click', function () {
        var ul_option = $('#select_goodstype_ul');
        if ($(ul_option).is(':hidden')) {
            ul_option.show();
        }
        else {
            ul_option.hide();
        }
        var li_option = ul_option.find('li');
        li_option.bind('click', function () {
            $(this).addClass('selected').siblings().removeClass('selected');
            var value = $(this).text();
            $('#select_goodstype').find('span').text(value);
            ul_option.hide();
        });
        li_option.bind('mouseover', function () {
            $(this).addClass('hover').siblings().removeClass('hover');
        });
        li_option.bind('mouseout', function () {
            li_option.removeClass('hover');
        });
    });

    var scity_car = new Vcity.CitySelector({input: 'scity_car'});
    scity_car.onSelected(function (selectValue, selectCode) {
        if (selectValue == '' || selectValue == '全国') {
            $('#scity_car').val('');
            $('#scity_car').attr('title', '');
        }
        else {
            $('#scity_car').val(selectValue);
            $('#scity_car').attr('title', selectCode);
        }
    });

    var ecity_car = new Vcity.CitySelector({input: 'ecity_car'});
    ecity_car.onSelected(function (selectValue, selectCode) {
        if (selectValue == '' || selectValue == '全国') {
            $('#ecity_car').val('');
            $('#ecity_car').attr('title', '');
        }
        else {
            $('#ecity_car').val(selectValue);
            $('#ecity_car').attr('title', selectCode);
        }
    });

    var scity_goods = new Vcity.CitySelector({input: 'scity_goods'});
    scity_goods.onSelected(function (selectValue, selectCode) {
        if (selectValue == '' || selectValue == '全国') {
            $('#scity_goods').val('');
            $('#scity_goods').attr('title', '');
        }
        else {
            $('#scity_goods').val(selectValue);
            $('#scity_goods').attr('title', selectCode);
        }
    });

    var ecity_goods = new Vcity.CitySelector({input: 'ecity_goods'});
    ecity_goods.onSelected(function (selectValue, selectCode) {
        if (selectValue == '' || selectValue == '全国') {
            $('#ecity_goods').val('');
            $('#ecity_goods').attr('title', '');
        }
        else {
            $('#ecity_goods').val(selectValue);
            $('#ecity_goods').attr('title', selectCode);
        }
    });

    $(document).bind('click', function (event) {
        event = event || window.event
        var target = event.target || event.srcElement;
        if (target.id == 'select_carlen' || target == $('#select_carlen').find('span')[0] || target == $('#select_carlen').find('a')[0]) {
            $('#select_goodstype_ul').hide();
        }
        else if (target.id == 'select_goodstype' || target == $('#select_goodstype').find('span')[0] || target == $('#select_goodstype').find('a')[0]) {
            $('#select_carlen_ul').hide();
        }
        else {
            $('#select_goodstype_ul').hide();
            $('#select_carlen_ul').hide();
        }
    });

    $.getScript('http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js', function () {
        var city = getIpPlace();
        if (city && city.cityNum && city.cityCode) {
            $('#scity_car').val(city.cityNum);
            $('#scity_car').attr('title', city.cityCode);

            $('#scity_goods').val(city.cityNum);
            $('#scity_goods').attr('title', city.cityCode);
        }
    });

    $(".grayscale").mouseover(function(){
        $(this).removeClass("grayscale");
    }).mouseout(function(){
        $(this).addClass("grayscale");
    });
});

function carCityChange() {
    var scity_car = $('#scity_car').val();
    var scity_car_title = $('#scity_car').attr('title');
    var ecity_car = $('#ecity_car').val();
    var ecity_car_title = $('#ecity_car').attr('title');

    if (scity_car == ecity_car)return;

    $('#scity_car').val(ecity_car);
    $('#scity_car').attr('title', ecity_car_title);
    $('#ecity_car').val(scity_car);
    $('#ecity_car').attr('title', scity_car_title);
}

function goodsCityChange() {
    var scity_goods = $('#scity_goods').val();
    var scity_goods_title = $('#scity_goods').attr('title');
    var ecity_goods = $('#ecity_goods').val();
    var ecity_goodstitle = $('#ecity_goods').attr('title');

    if (scity_goods == ecity_goods)return;

    $('#scity_goods').val(ecity_goods);
    $('#scity_goods').attr('title', ecity_goodstitle);
    $('#ecity_goods').val(scity_goods);
    $('#ecity_goods').attr('title', scity_goods_title);
}

var car_length = [
    {"id": "3", "name": "3-6米"},
    {"id": "4", "name": "6-10米"},
    {"id": "5", "name": "10-13米"},
    {"id": "6", "name": "13-16米"},
    {"id": "7", "name": "16米以上"}
];

var goods_type = [
    {"id": "1", "name": "普货"},
    {"id": "2", "name": "重货"},
    {"id": "3", "name": "泡货"}
];

function queryInfo() {
    if ($('.panel_goods').hasClass('panel_active')) {
        var scity_goods = $('#scity_goods').val();
        var ecity_goods = $('#ecity_goods').val();
        var goodstype = $('#select_goodstype').find('span').text();

        if (!scity_goods && !ecity_goods && goodstype == '货型')return;

        var queryUrl = '/goods?';
        if (scity_goods) {
            queryUrl += 'scity=' + scity_goods + '&';
        }
        if (ecity_goods) {
            queryUrl += 'ecity=' + ecity_goods + '&';
        }
        if (goodstype != '货型') {
            $.each(goods_type, function (index, item) {
                if (goodstype == item.name) {
                    queryUrl += 'gtype=' + item.id + '&';
                }
            });
        }

        window.location.href = queryUrl;
    }
    if ($('.panel_car').hasClass('panel_active')) {
        var scity_car = $('#scity_car').val();
        var ecity_car = $('#ecity_car').val();
        var car_len = $('#select_carlen').find('span').text();

        if (!scity_car && !ecity_car && car_len == '车长')return;

        var queryUrl = '/car?';
        if (scity_car) {
            queryUrl += 'scity=' + scity_car + '&';
        }
        if (ecity_car) {
            queryUrl += 'ecity=' + ecity_car + '&';
        }
        if (car_len != '车长') {
            $.each(car_length, function (index, item) {
                if (car_len == item.name) {
                    queryUrl += 'carlen=' + item.id + '&';
                }
            });
        }

        window.location.href = queryUrl;
    }
}