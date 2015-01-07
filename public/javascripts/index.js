/**
 * Created by libinqi on 2014/10/30.
 */
// JavaScript Document
$(document).ready(function () {
//首先将#back-to-top隐藏
    $("#back-to-top").hide();
//当滚动条的位置处于距顶部100像素以下时，跳转链接出现，否则消失
    $(function () {
        $(window).scroll(function () {
            if ($(window).scrollTop() > 100) {
                $("#back-to-top").fadeIn(150);
            }
            else {
                $("#back-to-top").fadeOut(150);
            }
        });
//当点击跳转链接后，回到页面顶部位置
        $("#back-to-top").click(function () {
            $('body,html').animate({scrollTop: 0}, 100);
            return false;
        });
    });

    $(".shousuo").click(function () {
        var targetObj = $(".shaixuankuang");
        var flag = $(this).hasClass("up");
        if (flag) {
            targetObj.slideUp();
            $(this).removeClass("up").addClass("down");
            $(".city").addClass("shouqi");
        } else {
            targetObj.slideDown();
            $(this).removeClass("down").addClass("up");
            $(".city").removeClass("shouqi");
        }
    });

    $(".moreLink").click(function () {
        if ($(this).text() == "更多>>") {
            $(".item2").show();
            $(this).html("收起>>");
        }
        else {
            $(".item2").hide();
            $(this).html("更多>>");
        }
    });
//
//    $("#fankui_link").on('focus', function () {
//        if ($(this).val() === "请留下您的联系方式") {
//            $(this).val("");
//            $(this).css("color", "#000");
//        }
//    });
//    $("#fankui_link").on('blur', function () {
//        if ($(this).val() === "") {
//            $(this).css("color", "#aaaaaa");
//            $(this).val("请留下您的联系方式");
//        } else {
//            $(this).css("color", "#000");
//        }
//    });
//
//    $("#fankui_content").on('focus', function () {
//        if ($(this).val() === "请填写您的意见...") {
//            $(this).val("");
//            $(this).css("color", "#000");
//        }
//    });
//    $("#fankui_content").on('blur', function () {
//        if ($(this).val() === "") {
//            $(this).css("color", "#aaaaaa");
//            $(this).val("请填写您的意见...");
//        } else {
//            $(this).css("color", "#000");
//        }
//    });
//
//    $('#fankui').click(function () {
//        var box_html = '<input type="text" id="fankui_link" class="text" style="width:400px;height: 32px;" value="请留下您的联系方式" /><br/><textarea id="fankui_content" class="text_box" style="width:400px;height: 150px;">请填写您的意见...</textarea><div class="buttons"><a class="ok" href="javascript:;">提交</a><a class="cancel" href="javascript:;">取消</a></div>';
//        var prompt = $.prompt('反馈意见', box_html, 450, 320);
//        prompt.find('.ok').bind('click', function () {
//            if ($.trim($('#fankui_content').val()) == "" || $('#fankui_content').val() == "请填写您的意见...") {
//                shake($('#fankui_content'), 'text_red_box', 3);
//                return;
//            }
//            $.ajax({
//                url: "feedback.php",
//                type: "POST",
//                data: {url: window.location.href, link: $('#fankui_link').val(), content: $('#fankui_content').val()},
//                //dataType: "json",
//                error: function () {
//                    alert('提交建议出错，请稍后再试！');
//                },
//                success: function (data, status) {
//                    if (data == "success") {
//                        prompt.fadeOut(function () {
//                            prompt.remove();
//                            alert('谢谢您的宝贵建议，我们会继续加油！');
//                        });
//                    }
//                    else
//                        alert('提交建议出错，请稍后再试！');
//                }
//            });
//        });
//        prompt.find('.cancel').bind('click', function () {
//            prompt.fadeOut(function () {
//                prompt.remove();
//            });
//        });
//    });
    $('.shaixuankuang').mouseover(function () {
        $(this).addClass('shaixuankuang_hover');
    });
    $('.shaixuankuang').mouseout(function () {
        $(this).removeClass('shaixuankuang_hover');
    });
    $(document).click(function () {
        if (!$('.shaixuankuang').hasClass('shaixuankuang_hover')) {
            $('#btnGFilter').hide();
        }
    });
    /* document.body.addEventListener('click', function (event) {
     event = event ? event : (window.event ? window.event : null);
     var elem = event.srcElement ? event.srcElement : event.target;
     if (!(!document.getElementById('btnGFilter'))) {
     if (elem != document.getElementById('btnGFilter') && elem != document.getElementById('sw') && elem != document.getElementById('ew')) {//判断elem 是否是document.getElementById
     if (document.getElementById("btnGFilter").style.display == "inline-block")
     document.getElementById("btnGFilter").style.display = 'none';
     }
     }
     }, true);*/

//    setTimeout(function () {
//        if (window.userInfo) {
//            $.ajax({
//                url: '/sign/login',
//                type: 'POST',
//                data:window.userInfo,
//                dataType: 'json',
//                error: function (error) {
//                    console.error('用户登录失败');
//                },
//                success: function (result) {
//                    if (result.status) {
//                        console.log('用户登录成功');
//                    }
//                    else {
//                        console.error('用户登录失败');
//                    }
//                }
//            });
//        }
//        else
//        {
//            $.ajax({
//                url: '/sign/logout',
//                type: 'GET',
//                data:window.userInfo,
//                dataType: 'json',
//                error: function (error) {
//                    console.error('用户注销失败');
//                },
//                success: function (result) {
//                    if (result.status) {
//                        console.log('用户注销成功');
//                    }
//                    else {
//                        console.error('用户注销失败');
//                    }
//                }
//            });
//        }
//    }, 500);
});

function removeFilter(filterText, filterText2) {
    if (filterText)document.getElementById(filterText).value = '';
    if (filterText2)document.getElementById(filterText2).value = '';
    form1.submit();
}

//获取企业信息
function getEnterpriseByUserId(userId, callback) {
    if (!userId && callback)callback(null);
    var enterprise = null;
    $.ajax({
        url: 'http://apollo.jt56.org/apollo/ws/enterprise/getenterprisewithlicsbyuserid/' + userId,
        type: 'GET',
        dataType: 'jsonp',
        jsonp: '_jsonp',
        error: function (error) {
            if (callback)callback(null);
        },
        success: function (result) {
            if (result && result.body) {
                callback(result.body);
            }
        }
    });
};

//获取企业信息
function getEnterprise(enterpriseId, callback) {
    if (!enterpriseId && callback)callback(null);
    $.ajax({
        url: 'http://apollo.jt56.org/apollo/ws/enterprise/getenterprisewithlics/' + enterpriseId,
        type: 'GET',
        dataType: 'jsonp',
        jsonp: '_jsonp',
        error: function (error) {
            if (callback)callback(null);
        },
        success: function (result) {
            if (result && result.body) {
                callback(result.body);
            }
        }
    });
};

//获取司机/个人信息
function getDriver(driverId, callback) {
    if (!driverId && callback)callback(null);
    $.ajax({
        url: 'http://apollo.jt56.org/apollo/ws/driver/getdriverwithlics/' + driverId,
        type: 'GET',
        dataType: 'jsonp',
        jsonp: '_jsonp',
        error: function (error) {
            if (callback)callback(null);
        },
        success: function (result) {
            if (result && result.body) {
                callback(result.body);
            }
        }
    });
};

function getIpPlace() {
    var province = remote_ip_info["province"];
    var city = remote_ip_info["city"];
    var cityNum = '';
    var cityCode = '';

    if (province && city) {
        cityNum = province + city;
        cityCode = getCityCode(city);
    } else if (province) {
        cityNum = province;
        cityCode = getCityCode(province);
    }
    else if (city) {
        cityNum = city;
        cityCode = getCityCode(city);
    }
    else {
        return null;
    }
    return {cityNum: cityNum, cityCode: cityCode};
}