(function ($) {

    $.extend({
        prompt: function (title,text,width,height) {

            $('.prompt').remove();

            var prompt = $('<div class="prompt"><div class="box_top">'+title+'<a href="javascript:void(0)" class="box_close"></a></div><div class="inner">' + text + '</div></div>').appendTo('body');

            prompt.css({
                width:width+'px',
                height:height+'px',
                left: ($(window).width() - prompt.width()) / 2,
                top: ($(window).height() - prompt.height() + 80) / 2

            }).show();

            prompt.find('.box_close').bind('click', function () {
                prompt.fadeOut(function () {
                    prompt.remove();
                });
            });

            return prompt;
        }

    });

})(jQuery);

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