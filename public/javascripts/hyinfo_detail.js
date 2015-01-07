$(document).ready(function () {
    //首先将#back-to-top隐藏
    $("#back-to-top").hide();
//当滚动条的位置处于距顶部100像素以下时，跳转链接出现，否则消失
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

    $("#keyword").focus(function () {
        if ("全国最专业的物流搜索引擎" === $(this).val()) {
            $(this).val("");
        }
    }).blur(function () {
            if ($(this).val() == "") {
                $(this).val("全国最专业的物流搜索引擎");
            }
        });

    $("#keyword").keydown(function (e) {
        var curKey = e.which;
        if (curKey == 13) {
            if ($("#keyword").val() != "" && $("#keyword").val() != "全国最专业的物流搜索引擎") {
                window.open("so56.php?q=" + $("#keyword").val(), '_blank');
            }
        }
    });

    $("#search").click(function () {
        if ($("#keyword").val() != "" && $("#keyword").val() != "全国最专业的物流搜索引擎") {
            window.open("so56.php?q=" + $("#keyword").val(), '_blank');
        }
    });
    $("#fankui_link").live('focus', function () {
        if ($(this).val() === "请留下您的联系方式") {
            $(this).val("");
            $(this).css("color", "#000");
        }
    });
    $("#fankui_link").live('blur', function () {
        if ($(this).val() === "") {
            $(this).css("color", "#aaaaaa");
            $(this).val("请留下您的联系方式");
        } else {
            $(this).css("color", "#000");
        }
    });

    $("#fankui_content").live('focus', function () {
        if ($(this).val() === "请填写您的意见...") {
            $(this).val("");
            $(this).css("color", "#000");
        }
    });
    $("#fankui_content").live('blur', function () {
        if ($(this).val() === "") {
            $(this).css("color", "#aaaaaa");
            $(this).val("请填写您的意见...");
        } else {
            $(this).css("color", "#000");
        }
    });

    $('#fankui').click(function () {
        var prompt = $.prompt('<input type="text" id="fankui_link" class="text" style="width:400px;height: 32px;" value="请留下您的联系方式" /><br/><textarea id="fankui_content" class="text_box" style="width:400px;height: 150px;">请填写您的意见...</textarea>', 'success',
            function () {
                if ($.trim($('#fankui_content').val()) == "" || $('#fankui_content').val() == "请填写您的意见...") {
                    shake($('#fankui_content'), 'text_red_box', 3);
                    return;
                }
                $.ajax({
                    url: "feedback.php",
                    type: "POST",
                    data: {url: window.location.href, link: $('#fankui_link').val(), content: $('#fankui_content').val()},
                    //dataType: "json",
                    error: function () {
                        alert('提交建议出错，请稍后再试！');
                    },
                    success: function (data, status) {
                        if (data == "success") {
                            prompt.fadeOut(function () {
                                prompt.remove();
                                alert('谢谢您的宝贵建议，我们会继续加油！');
                            });
                        }
                        else
                            alert('提交建议出错，请稍后再试！');
                    }
                });
            }, function () {
                prompt.fadeOut(function () {
                    prompt.remove();
                });
            });
    });
});

function shake(ele, cls, times) {
    var i = 0, t = false , o = ele.attr("class"), c = "", times = times || 2;
    if (t) return;
    t = setInterval(function () {
        i++;
        c = i % 2 ? cls : o;
        ele.attr("class", c);
        if (i == 2 * times) {
            clearInterval(t);
            ele.removeClass(cls);
        }
    }, 400);
};