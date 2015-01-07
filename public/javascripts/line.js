$(document).ready(function () {
    var city = new Vcity.CitySelector({input: 'scity'});

    city.onSelect(function (selectValue, selectCode) {
        if (selectValue && selectCode) {
            document.getElementById('scity').value = selectValue;
            document.getElementById('scity').title = selectCode;
        }
    });

    var cityNum = new Vcity.CitySelector({input: 'ecity'});

    cityNum.onSelect(function (selectValue, selectCode) {
        if (selectValue && selectCode) {
            document.getElementById('ecity').value = selectValue;
            document.getElementById('ecity').title = selectCode;
        }
    });

    $('#chaxun').click(function(){
        form1.submit();
    });

    //板块切换
    function kapian() {
        $('.quehuan ul li').click(function () {
            var inde = $(this).index();
            $(this).parent().find('li').removeClass('quehuan_hover');
            $(this).addClass('quehuan_hover');
            $('#top .NEWS_w.line_content').hide();
            $('#top .NEWS_w.line_content').eq(inde).show();
        });
    }

    kapian();
});

//绑定企业基本信息和资质信息
function bindEnterpriseInfo(enterpriseId, docId) {
    var licenseinfo = $('<p class="martop-10"></p>');
    var userinfo = $('<p class="driver_name"></p>');
    var address = $('<p class="martop-10"></p>');
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
            if (enterprise.enterprisename) {
                userinfo.text(enterprise.enterprisename);
            }
            if (enterprise.location) {
                address.text(enterprise.location);
            }
        }
        else {
            userinfo.text();
            address.text();

            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(bizlic).addClass('grayscale')));
            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(orgcodelic).addClass('grayscale')));
            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(taxlic).addClass('grayscale')));
            licenseinfo.append($('<span class="com_img margin-5"></span>').append($(transbizlic).addClass('grayscale')));
        }

        $('#' + docId).append(userinfo)
            .append(licenseinfo);
            //.append(address);
    });
}
