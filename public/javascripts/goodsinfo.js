// JavaScript Document
$(document).ready(function () {
    $("#changeAreaBtn").click(function () {
        var scity = $("input[name=scity]").val();
        var ecity = $("input[name=ecity]").val();
        var scityCode = $("input[name=scity]").attr('title');
        var ecityCode = $("input[name=ecity]").attr('title');

        $("input[name=scity]").val(ecity);
        $("input[name=ecity]").val(scity);

        $("input[name=scity]").attr('title', ecityCode);
        $("input[name=ecity]").attr('title', scityCode);

        form1.submit();
    });

    var city = new Vcity.CitySelector({input: 'scity'});

    city.onSelect(function (selectValue, selectCode) {
        if (selectValue && selectCode) {
            document.getElementById('scity').value = selectValue;
            document.getElementById('scity').title = selectCode;
        }
//        document.getElementById('gweight').value = '';
//        document.getElementById('sweight').value = '';
//        document.getElementById('eweight').value = '';
//        document.getElementById('carlen').value = '';
//        document.getElementById('gtype').value = '';
    });

    var cityNum = new Vcity.CitySelector({input: 'ecity'});

    cityNum.onSelect(function (selectValue, selectCode) {
        if (selectValue && selectCode) {
            document.getElementById('ecity').value = selectValue;
            document.getElementById('ecity').title = selectCode;
        }
    });

    $('#chaxun').click(function () {
        form1.submit();
    });

    $("#sw").bind('focus', function () {
        $("#btnGFilter").show();
    });
    $("#sw").bind('blur', function () {
        if (isNaN($(this).val()))
            $("#sw").val('');
    });
    $("#ew").bind('focus', function () {
        $("#btnGFilter").show();
    });
    $("#ew").bind('blur', function () {
        if (isNaN($(this).val()))
            $("#ew").val('');
    });
});

function gweightFilter() {
    var start = $("#sw").val();
    var end = $("#ew").val();
    if (start == "" && end == "") {
        return;
    }
    else if (start != "" && end != "") {
        start = parseInt(start);
        end = parseInt(end);
        if (start > end) {
            alert("起始吨位不能大于结束吨位!");
            return;
        }
        document.getElementById('sweight').value = start;
        document.getElementById('eweight').value = end;
        form1.submit();
    }
    else {
        if ($.isNumeric(start)) {
            document.getElementById('sweight').value = parseInt(start);
        }
        else {
            document.getElementById('sweight').value = '';
        }
        if ($.isNumeric(end)) {
            document.getElementById('eweight').value = parseInt(end);
        }
        else {
            document.getElementById('eweight').value = '';
        }
        form1.submit();
    }
}

function getGoodsInfo(goodsId) {
    var goodsInfo = null;
    $.ajax({
        async: false,
        url: '/goods/detail?format=json&infoid=' + goodsId,
        type: 'GET',
        dataType: 'json',
        error: function (error) {
            goodsInfo = null;
        },
        success: function (result) {
            if (result) {
                goodsInfo = result;
            }
            else {
                goodsInfo = null;
            }
        }
    });
    return goodsInfo;
}

function applyIntentGoods(goodsId) {
    var userInfo = window.userInfo;
    if (!userInfo) {
        var current = window.location.href;
        window.location.href = topurl.login + "?service=" + current;
        return;
    }
    var enterprise = null;
    var user = null;
    var goodsInfo = getGoodsInfo(goodsId);
    if (userInfo.usertype == 1) {
        getEnterpriseByUserId(userInfo.userid, function (result) {
            enterprise = result;
            if (enterprise == null) {
                alert('您还没有完善个人资料,不能发送承运意向！');
            }
            else if (!enterprise || !goodsInfo || goodsInfo.attrs.eid == enterprise.enterpriseid) {
                alert('对不起,您不能给自己发送承运意向！');
            }
            else {
                var box_html = '<textarea id="yixiang_content" class="text_box" style="width:400px;height: 150px;">请填写您的意向...</textarea><div class="box_btn"><a href="javascript:void(0)" class="box_send">发送</a></div></div>';
                var prompt = $.prompt('发送承运意向', box_html, 450, 300);
                prompt.find('.box_send').bind('click', function () {
                    if ($.trim($('#yixiang_content').val()) == "" || $('#yixiang_content').val() == "请填写您的意向...") {
                        shake($('#yixiang_content'), 'text_red_box', 3);
                        return;
                    }
                    else {
                        var messageText = $('#yixiang_content').val();
                        $('.prompt').remove();

                        try {
                            $.ajax({
                                url: '/goods/applyIntentGoods',
                                type: 'POST',
                                data: {
                                    goodsId: goodsId,
                                    userId: enterprise.enterpriseid,
                                    userName: enterprise.enterprisename,
                                    userType: 2,
                                    tel: enterprise.telephonenumber,
                                    message: messageText
                                },
                                dataType: 'json',
                                error: function (error) {
                                    alert('申请失败,请稍后再试！');
                                },
                                success: function (result) {
                                    if (result.status) {
                                        alert('申请成功！');
                                    }
                                    else {
                                        alert('申请失败,请稍后再试！');
                                    }
                                }
                            });
                        }
                        catch (ex) {
                            alert('申请失败,请稍后再试！');
                        }
                    }
                });
            }
        });
    }
    else {
        getDriver(userInfo.userid, function (result) {
            user = result.user;
            if (user == null) {
                alert('您还没有完善个人资料,不能发送承运意向！');
            }
            else if (!goodsInfo || goodsInfo.attrs.createrid == user.userid) {
                alert('对不起,您不能给自己发送承运意向！');
            }
            else {
                var box_html = '<textarea id="yixiang_content" class="text_box" style="width:400px;height: 150px;">请填写您的意向...</textarea><div class="box_btn"><a href="javascript:void(0)" class="box_send">发送</a></div></div>';
                var prompt = $.prompt('发送承运意向', box_html, 450, 300);
                prompt.find('.box_send').bind('click', function () {
                    if ($.trim($('#yixiang_content').val()) == "" || $('#yixiang_content').val() == "请填写您的意向...") {
                        shake($('#yixiang_content'), 'text_red_box', 3);
                        return;
                    }
                    else {
                        var messageText = $('#yixiang_content').val();
                        $('.prompt').remove();

                        $.ajax({
                            url: '/goods/applyIntentGoods',
                            type: 'POST',
                            data: {
                                goodsId: goodsId,
                                userId: user.userid,
                                userName: user.realname,
                                userType: 1,
                                tel: user.mobile,
                                message: messageText
                            },
                            dataType: 'json',
                            error: function (error) {
                                alert('申请失败,请稍后再试！');
                            },
                            success: function (result) {
                                if (result.status) {
                                    alert('申请成功！');
                                }
                                else {
                                    alert('申请失败,请稍后再试！');
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    $("#yixiang_content").bind('focus', function () {
        if ($(this).val() === "请填写您的意向...") {
            $(this).val("");
            $(this).css("color", "#000");
        }
    });
    $("#yixiang_content").bind('blur', function () {
        if ($(this).val() === "") {
            $(this).css("color", "#aaaaaa");
            $(this).val("请填写您的意向...");
        } else {
            $(this).css("color", "#000");
        }
    });
    return false;
}

function viewConcatInfo() {
    var userInfo = window.userInfo;
    if (!userInfo) {
        var current = window.location.href;
        window.location.href = topurl.login + "?service=" + current;
        return;
    }
    var box_html = ' <div class="box_con">';
    box_html += ' <p class="box_p"><span class="box_tel">公司名称：</span><span class="box_addr">衡阳雁城物流园</p>';
    box_html += '   <p class="box_p"><span class="box_tel">联系电话：</span><span class="center_tel1">0734-2999999</p>';
    box_html += ' <p class="box_p"><span class="box_tel">地址：</span><span class="box_addr">湖南省衡阳市石鼓区松木经济开发区</p>';
    box_html += '   <div class="box_map">';
    box_html += '    <img src="/images/map.jpg" width="550" height="250">';
    box_html += '      </div>';
    box_html += '   </div>';
    var prompt = $.prompt('湖南省衡阳市雁城物流园', box_html, 650, 475);
}

//绑定企业基本信息和资质信息
function bindEnterpriseInfo(enterpriseId, docId) {
    var licenseinfo = $('<p class="martop-27"></p>');
    var userinfo = $('<div class="center_whole2"></div>');
    var bizlic = '<img src="/images/center_com1.png" title="营业执照" width="32" height="23"/>';
    var orgcodelic = '<img src="/images/center_com2.png" title="组织机构代码证" width="32" height="23"/>';
    var taxlic = '<img src="/images/center_com3.png" title="税务登记证" width="32" height="23"/>';
    var transbizlic = '<img src="/images/center_com4.png" title="企业道路运输营业许可证" width="32" height="23"/>';
    getEnterprise(enterpriseId, function (enterprise) {
        if (enterprise) {
            if (enterprise.bizlic && enterprise.bizlic.status == 1) {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(bizlic)));
            }
            else {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(bizlic).addClass('grayscale')));
            }
            if (enterprise.orgcodelic && enterprise.orgcodelic.status == 1) {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(orgcodelic)));
            }
            else {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(orgcodelic).addClass('grayscale')));
            }
            if (enterprise.taxlic && enterprise.taxlic.status == 1) {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(taxlic)));
            }
            else {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(taxlic).addClass('grayscale')));
            }
            if (enterprise.transbizlic && enterprise.transbizlic.status == 1) {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(transbizlic)));
            }
            else {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(transbizlic).addClass('grayscale')));
            }

            if (enterprise.telephonenumber) {
                userinfo.append('<p class="center_tel1 martop-22">' + enterprise.telephonenumber + '</p>');
            }
            if (enterprise.enterprisename) {
                userinfo.append('<p class="center_length1">' + enterprise.enterprisename + '</p>');
            }
        }
        else {
            userinfo.append('<p class="center_tel1 martop-22"></p>');
            userinfo.append('<p class="center_length1"></p>');

            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(bizlic).addClass('grayscale')));
            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(orgcodelic).addClass('grayscale')));
            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(taxlic).addClass('grayscale')));
            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(transbizlic).addClass('grayscale')));
        }

        $('#' + docId).append(userinfo);
        $('#' + docId).append($('<div class="center_car3"></div>').append(licenseinfo));
    });
}
//绑定司机/个人基本信息和资质信息
function bindDriverInfo(driverId, docId) {
    var licenseinfo = $('<p class="martop-27"></p>');
    var userinfo = $('<div class="center_whole2"></div>');
    var user = '<img src="/images/center_driver3.png" title="身份证" width="32" height="23"/>';
    var translic = '<img src="/images/center_driver2.png" title="道路运输从业资格证" width="32" height="23"/>';
    var drivelic = '<img src="/images/center_driver1.png" title="驾驶证" width="32" height="23"/>';
    var travellics = '<img src="/images/center_driver4.png" title="行驶证" width="32" height="23"/>';
    getDriver(driverId, function (driver) {
        if (driver) {
            if (driver.user) {
                if (driver.user.mobile) {
                    userinfo.append('<p class="center_tel1 martop-22">' + driver.user.mobile + '</p>');
                }
                if (driver.user.realname) {
                    userinfo.append('<p class="center_length1">' + driver.user.realname + '</p>');
                }
                if (driver.user.status == 1) {
                    licenseinfo.append($('<span class="com_img margin-5"></span>').append($(user)));
                }
                else {
                    licenseinfo.append($('<span class="com_img margin-5"></span>').append($(user).addClass('grayscale')));
                }
            }
            if (driver.translic && driver.translic.status == 1) {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(translic)));
            }
            else {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(translic).addClass('grayscale')));
            }
            if (driver.drivelic && driver.drivelic.status == 1) {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(drivelic)));
            }
            else {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(drivelic).addClass('grayscale')));
            }
            if (driver.travellics && driver.travellics.length > 0) {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(travellics)));
            }
            else {
                licenseinfo.append($('<span class="com_img margin-5"></span>').append($(travellics).addClass('grayscale')));
            }
        }
        else {
            userinfo.append('<p class="center_tel1 martop-22"></p>');
            userinfo.append('<p class="center_length1"></p>');

            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(user).addClass('grayscale')));
            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(translic).addClass('grayscale')));
            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(drivelic).addClass('grayscale')));
            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(travellics).addClass('grayscale')));
        }

        $('#' + docId).append(userinfo);
        $('#' + docId).append($('<div class="center_car3"></div>').append(licenseinfo));
    });
}