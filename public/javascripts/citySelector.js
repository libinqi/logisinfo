/* *
 * ---------------------------------------- *
 * 城市选择组件
 * */

/*
 *   使用方法
 var city = new Vcity.CitySelector({input: 'ecity'});

 city.onSelected(function (selectValue) {
 document.getElementById('ecity').value = selectValue;
 });
 *
 *
 * */

/* *
 * 全局空间 Vcity
 * */
var Vcity = {};
/* *
 * 静态方法集
 * @name _m
 * */
Vcity._m = {
    /* 选择元素 */
    $: function (arg, context) {
        var tagAll, n, eles = [], i, sub = arg.substring(1);
        context = context || document;
        if (typeof arg == 'string') {
            switch (arg.charAt(0)) {
                case '#':
                    return document.getElementById(sub);
                    break;
                case '.':
                    if (context.getElementsByClassName) return context.getElementsByClassName(sub);
                    tagAll = Vcity._m.$('*', context);
                    n = tagAll.length;
                    for (i = 0; i < n; i++) {
                        if (tagAll[i].className.indexOf(sub) > -1) eles.push(tagAll[i]);
                    }
                    return eles;
                    break;
                default:
                    return context.getElementsByTagName(arg);
                    break;
            }
        }
    },

    /* 绑定事件 */
    on: function (node, type, handler) {
        node.addEventListener ? node.addEventListener(type, handler, false) : node.attachEvent('on' + type, handler);
    },

    /* 获取事件 */
    getEvent: function (event) {
        return event || window.event;
    },

    /* 获取事件目标 */
    getTarget: function (event) {
        return event.target || event.srcElement;
    },

    /* 获取元素位置 */
    getPos: function (node) {
        var scrollx = document.documentElement.scrollLeft || document.body.scrollLeft,
            scrollt = document.documentElement.scrollTop || document.body.scrollTop;
        var pos = node.getBoundingClientRect();
        return {top: pos.top + scrollt, right: pos.right + scrollx, bottom: pos.bottom + scrollt, left: pos.left + scrollx }
    },

    /* 添加样式名 */
    addClass: function (c, node) {
        if (!node)return;
        node.className = Vcity._m.hasClass(c, node) ? node.className : node.className + ' ' + c;
    },

    /* 移除样式名 */
    removeClass: function (c, node) {
        var reg = new RegExp("(^|\\s+)" + c + "(\\s+|$)", "g");
        if (!Vcity._m.hasClass(c, node))return;
        node.className = reg.test(node.className) ? node.className.replace(reg, '') : node.className;
    },

    /* 是否含有CLASS */
    hasClass: function (c, node) {
        if (!node || !node.className)return false;
        return node.className.indexOf(c) > -1;
    },

    /* 阻止冒泡 */
    stopPropagation: function (event) {
        event = event || window.event;
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    },
    /* 去除两端空格 */
    trim: function (str) {
        return str.replace(/^\s+|\s+$/g, '');
    }
};

/* 所有城市数据*/
if (!Vcity.allCity)Vcity.allCity = cityList;
if (!Vcity.allProvince)Vcity.allProvince = getProvinces();

/* 正则表达式 筛选中文城市名、拼音、首字母 */

Vcity.regEx = /^([\u4E00-\u9FA5\uf900-\ufa2d]+)\|(\w+)\|(\w)\w*$/i;
Vcity.regExChiese = /([\u4E00-\u9FA5\uf900-\ufa2d]+)/;

/* *
 * 格式化城市数组为对象oCity，按照热门城市省、市、县分组：
 * {HOT:{hot:[]},}
 * */

(function () {
    var citys = Vcity.allCity, match, letter,
        regEx = Vcity.regEx,
        reg2 = /^[a-h]$/i, reg3 = /^[i-p]$/i, reg4 = /^[q-z]$/i;
    if (!Vcity.oCity) {
        Vcity.oCity = {hot: {}, province: {}};

        if (!Vcity.oCity.province['province']) Vcity.oCity.province['province'] = Vcity.allProvince;
        //热门城市
        if (!Vcity.oCity.hot['hot']) Vcity.oCity.hot['hot'] = ['北京|110100', '上海|310100', '重庆|500100', '深圳|440300', '广州|440100', '杭州|330100', '南京|320100', '苏州|320500', '天津|120100', '成都|510100', '南昌|360121', '三亚|460200', '青岛|370200', '厦门|350200', '西安|610100', '长沙|430100'];
    }
})();

/* *
 * 城市控件构造函数
 * @CitySelector
 * */

Vcity.CitySelector = function () {
    this.initialize.apply(this, arguments);
};

Vcity.CitySelector.prototype = {

    constructor: Vcity.CitySelector,

    /* 初始化 */

    initialize: function (options) {
        var input = options.input;
        this.input = Vcity._m.$('#' + input);
        this.floatRight=options.floatRight;
        this.inputEvent();
    },

    /* *
     * @createWarp
     * 创建城市BOX HTML 框架
     * */

    createWarp: function () {
        var inputPos = Vcity._m.getPos(this.input);
        var div = this.rootDiv = document.createElement('div');
        var that = this;

        // 设置DIV阻止冒泡
        Vcity._m.on(this.rootDiv, 'click', function (event) {
            Vcity._m.stopPropagation(event);
        });

        // 设置点击文档隐藏弹出的城市选择框
        Vcity._m.on(document, 'click', function (event) {
            event = Vcity._m.getEvent(event);
            var target = Vcity._m.getTarget(event);
            if (target == that.input) return false;
            //console.log(target.className);
            if (that.cityBox)Vcity._m.addClass('hide', that.cityBox);
            if (that.ul)Vcity._m.addClass('hide', that.ul);
            if (that.myIframe)Vcity._m.addClass('hide', that.myIframe);
            that.closeFrame();
        });
        div.className = 'citySelector';
        div.style.position = 'absolute';
        if(this.floatRight)
        {
            div.style.right = this.floatRight + 'px';
        }
        else
        {
            div.style.left = inputPos.left + 'px';
        }
        div.style.top = inputPos.bottom + 'px';
        div.style.zIndex = 999999;

        // 判断是否IE6，如果是IE6需要添加iframe才能遮住SELECT框
        var isIe = (document.all) ? true : false;
        var isIE6 = this.isIE6 = isIe && !window.XMLHttpRequest;
        if (isIE6) {
            var myIframe = this.myIframe = document.createElement('iframe');
            myIframe.frameborder = '0';
            myIframe.src = 'about:blank';
            myIframe.style.position = 'absolute';
            myIframe.style.zIndex = '-1';
            this.rootDiv.appendChild(this.myIframe);
        }

        var childdiv = this.cityBox = document.createElement('div');
        childdiv.className = 'cityBox';
        childdiv.id = 'cityBox';

        var tip = document.createElement("p");
        Vcity._m.addClass('tip', tip);
        tip.innerHTML = "热门城市(支持汉字/拼音)";
        var pclose = document.createElement("a");
        pclose.item = "close";
        pclose.innerHTML = "关闭";
        pclose.onclick = function () {
            that.closeFrame();
        };
        Vcity._m.addClass('ico btn_close thRight', pclose);
        tip.appendChild(pclose);
        childdiv.appendChild(tip);
        var tabNav = document.createElement("ul");
        var tabItem = document.createElement("li");
        tabItem.innerHTML = "热门城市";
        Vcity._m.addClass('on', tabItem);
        tabNav.appendChild(tabItem);
        tabItem = document.createElement("li");
        tabItem.innerHTML = "省";
        tabNav.appendChild(tabItem);
        tabItem = document.createElement("li");
        tabItem.innerHTML = "市";
        tabNav.appendChild(tabItem);
        tabItem = document.createElement("li");
        tabItem.innerHTML = "县";
        tabNav.appendChild(tabItem);
        childdiv.appendChild(tabNav);

        var hotCity = this.hotCity = document.createElement('div');
        hotCity.className = 'hotCity';
        childdiv.appendChild(hotCity);
        div.appendChild(childdiv);
        this.createHotCity();
    },

    /* *
     * @createHotCity
     **/
    createHotCity: function () {
        var odiv, odl, odt, odd, odda = [],
            oCity = Vcity.oCity,
            that = this;

        //创建热门城市
        odiv = this['hot'] = document.createElement('div');
        odiv.id = "hot";
        // 先设置全部隐藏hide
        odiv.className = 'cityTab hide';
        odl = document.createElement('dl');
        odt = document.createElement('dt');
        odd = document.createElement('dd');
        odt.innerHTML = '&nbsp;';
        for (var i = 0, n = oCity.hot['hot'].length; i < n; i++) {
            var a = document.createElement("a");
            a.innerHTML = oCity.hot['hot'][i].split('|')[0];
            a.id = oCity.hot['hot'][i].split('|')[1];
            a.href = "#";
            a.onclick = function () {
                var links = Vcity._m.$('a', this['province']);
                for (var i = 0, n = links.length; i < n; i++) {
                    Vcity._m.removeClass('select', links[i]);
                }
                var obj2 = document.getElementById("city_2");
                if (obj2) {
                    obj2.parentNode.removeChild(obj2);
                }
                var obj3 = document.getElementById("city_3");
                if (obj3)
                    obj3.parentNode.removeChild(obj3);

                that.input.value = getAllCityText(this.innerHTML);
                Vcity._m.addClass('hide', that.cityBox);
                /* 点击城市名的时候隐藏myIframe */
                Vcity._m.addClass('hide', that.myIframe);
                if (that.selectEvent)
                    that.selectEvent(that.input.value, this.id);
            };
            odd.appendChild(a);
        }
        odl.appendChild(odt);
        odl.appendChild(odd);
        odiv.appendChild(odl);
        this.hotCity.appendChild(odiv);

        //创建省
        odiv = this['province'] = document.createElement('div');
        odiv.id = "province";
        // 先设置全部隐藏hide
        odiv.className = 'cityTab hide';
        odl = document.createElement('dl');
        odt = document.createElement('dt');
        odd = document.createElement('dd');
        odt.innerHTML = '&nbsp;';
        odda = [];
        for (var i = 0, n = oCity.province['province'].length; i < n; i++) {
            var ap = document.createElement("a");
            ap.innerHTML = oCity.province['province'][i].name;
            ap.href = "#";
            ap.id = oCity.province['province'][i].code;
            ap.onclick = function () {
                that.input.value = getAllCityText(this.innerHTML);
                var citys = getCitiesByParentCode(this.id);
                if (citys && citys.length > 0) {
                    that.createCity(citys);
                }
                else {
                    Vcity._m.addClass('hide', that.cityBox);
                    /* 点击城市名的时候隐藏myIframe */
                    Vcity._m.addClass('hide', that.myIframe);
                }

                if (that.selectEvent) {
                    that.selectEvent(that.input.value, this.id);
                }

                var links = Vcity._m.$('a', this['province']);
                for (var i = 0, n = links.length; i < n; i++) {
                    Vcity._m.removeClass('select', links[i]);
                }
                Vcity._m.addClass('select', this);
            }
            odd.appendChild(ap);
        }
        odl.appendChild(odt);
        odl.appendChild(odd);
        odiv.appendChild(odl);
        this.hotCity.appendChild(odiv);

// 移除热门城市的隐藏CSS
        Vcity._m.removeClass('hide', this.hot);

        document.body.appendChild(this.rootDiv);
        /* IE6 */
        this.changeIframe();

        this.tabChange();
//        this.linkEvent();
    },
    createCity: function (citys) {
        var odiv, odl, odt, odd, odda = [],
            that = this;
        var obj2 = document.getElementById("city_2");
        if (obj2) {
            obj2.parentNode.removeChild(obj2); 
        }
        var obj3 = document.getElementById("city_3");
        if (obj3)
            obj3.parentNode.removeChild(obj3);

        odiv = that['city'] = document.createElement('div');
        odiv.id = "city_2";
        // 先设置全部隐藏hide
        odiv.className = 'cityTab hide';

        odl = document.createElement('dl');
        odt = document.createElement('dt');
        odd = document.createElement('dd');
        odt.innerHTML = '&nbsp;';
        for (var i = 0, n = citys.length; i < n; i++) {
            var ac = document.createElement("a");
            ac.innerHTML = citys[i].name;
            ac.href = "#";
            ac.id = citys[i].code;
            ac.onclick = function () {
                that.input.value = getAllCityText(this.innerHTML);
                var areas = getAreasByParentCode(this.id);
                if (areas && areas.length > 0) {
                    that.createArea(areas);
                }
                else {
                    Vcity._m.addClass('hide', that.cityBox);
                    /* 点击城市名的时候隐藏myIframe */
                    Vcity._m.addClass('hide', that.myIframe);
                }

                if (that.selectEvent) {
                    that.selectEvent(that.input.value, this.id);
                }

                var links = Vcity._m.$('a', that['city']);
                for (var i = 0, n = links.length; i < n; i++) {
                    Vcity._m.removeClass('select', links[i]);
                }
                Vcity._m.addClass('select', this);
            }

            odd.appendChild(ac);
        }
        odl.appendChild(odt);
        odl.appendChild(odd);
        odiv.appendChild(odl);

        that.hotCity.appendChild(odiv);

        var lis = Vcity._m.$('li', that.cityBox);
        var divs = Vcity._m.$('div', that.hotCity);

        for (var j = 0; j < lis.length; j++) {
            Vcity._m.removeClass('on', lis[j]);
            Vcity._m.addClass('hide', divs[j]);
        }
        Vcity._m.addClass('on', lis[2]);
        Vcity._m.removeClass('hide', odiv);
        that.changeIframe();
    },
    createArea: function (areas) {
        var odiv, odl, odt, odd, odda = [],
            that = this;
        var obj3 = document.getElementById("city_3");
        if (obj3)
            obj3.parentNode.removeChild(obj3);

        odiv = that['area'] = document.createElement('div');
        odiv.id = "city_3";
        // 先设置全部隐藏hide
        odiv.className = 'cityTab hide';

        odl = document.createElement('dl');
        odt = document.createElement('dt');
        odd = document.createElement('dd');
        odt.innerHTML = '&nbsp;';
        for (var i = 0, n = areas.length; i < n; i++) {
            var ac = document.createElement("a");
            ac.innerHTML = areas[i].name;
            ac.href = "#";
            ac.id = areas[i].code;
            ac.onclick = function () {
                that.input.value = getAllCityText(this.innerHTML);
                Vcity._m.addClass('hide', that.cityBox);
                /* 点击城市名的时候隐藏myIframe */
                Vcity._m.addClass('hide', that.myIframe);
                if (that.selectEvent)
                    that.selectEvent(that.input.value, this.id);

                var links = Vcity._m.$('a', that['area']);
                for (var i = 0, n = links.length; i < n; i++) {
                    Vcity._m.removeClass('select', links[i]);
                }
                Vcity._m.addClass('select', this);
                that.closeFrame();
            }
            odd.appendChild(ac);
        }
        odl.appendChild(odt);
        odl.appendChild(odd);
        odiv.appendChild(odl);

        that.hotCity.appendChild(odiv);

        var lis = Vcity._m.$('li', that.cityBox);
        var divs = Vcity._m.$('div', that.hotCity);

        for (var j = 0; j < lis.length; j++) {
            Vcity._m.removeClass('on', lis[j]);
            Vcity._m.addClass('hide', divs[j]);
        }
        Vcity._m.addClass('on', lis[3]);
        Vcity._m.removeClass('hide', odiv);
        that.changeIframe();
    },
    /* *
     *  tab按字母顺序切换
     *  @ tabChange
     * */

    tabChange: function () {
        var lis = Vcity._m.$('li', this.cityBox);
        var divs = Vcity._m.$('div', this.hotCity);
        var that = this;
        for (var i = 0, n = lis.length; i < n; i++) {
            lis[i].index = i;
            lis[i].onclick = function () {
                for (var j = 0; j < n; j++) {
                    Vcity._m.removeClass('on', lis[j]);
                    Vcity._m.addClass('hide', divs[j]);
                }
                Vcity._m.addClass('on', this);
                Vcity._m.removeClass('hide', divs[this.index]);
                /* IE6 改变TAB的时候 改变Iframe 大小*/
                that.changeIframe();
            };
        }
    },

    /* *
     * 城市LINK事件
     *  @linkEvent
     * */

    linkEvent: function () {
        var links = Vcity._m.$('a', this.hotCity);
        var that = this;
        for (var i = 0, n = links.length; i < n; i++) {
            links[i].onclick = function () {
                that.input.value = this.innerHTML;
                Vcity._m.addClass('hide', that.cityBox);
                /* 点击城市名的时候隐藏myIframe */
                Vcity._m.addClass('hide', that.myIframe);
                if (that.selectEvent)
                    that.selectEvent(that.input.value, this.id);
            }
        }
    },

    /* *
     * INPUT城市输入框事件
     * @inputEvent
     * */

    inputEvent: function () {
        var that = this;
        Vcity._m.on(this.input, 'click', function (event) {
            event = event || window.event;
            if (!that.cityBox) {
                that.createWarp();
            } else if (!!that.cityBox && Vcity._m.hasClass('hide', that.cityBox)) {
                // slideul 不存在或者 slideul存在但是是隐藏的时候 两者不能共存
                if (!that.ul || (that.ul && Vcity._m.hasClass('hide', that.ul))) {
                    Vcity._m.removeClass('hide', that.cityBox);

                    /* IE6 移除iframe 的hide 样式 */
                    //alert('click');
                    Vcity._m.removeClass('hide', that.myIframe);
                    that.changeIframe();
                }
            }
        });
        Vcity._m.on(this.input, 'focus', function () {
            that.input.select();
//            if (that.input.value == '简拼/全拼/汉字') that.input.value = '';
        });
        Vcity._m.on(this.input, 'blur', function () {
//            that.input.value = '';
//            that.input.title = '';
//            if (that.input.value == '') {
//                that.input.value = '全国';
//            }
        });
        Vcity._m.on(this.input, 'keyup', function (event) {
            event = event || window.event;
            var keycode = event.keyCode;
            Vcity._m.addClass('hide', that.cityBox);
            that.createUl();

            /* 移除iframe 的hide 样式 */
            Vcity._m.removeClass('hide', that.myIframe);

            // 下拉菜单显示的时候捕捉按键事件
            if (that.ul && !Vcity._m.hasClass('hide', that.ul) && !that.isEmpty) {
                that.KeyboardEvent(event, keycode);
            }
        });
    },

    /* *
     * 生成下拉选择列表
     * @ createUl
     * */

    createUl: function () {
        //console.log('createUL');
        var str;
        var value = Vcity._m.trim(this.input.value);
        // 当value不等于空的时候执行
        if (value !== '') {
            var reg = new RegExp("^" + value + "|\\|" + value, 'gi');
            // 此处需设置中文输入法也可用onpropertychange
            var searchResult = [];
            for (var i = 0, n = Vcity.allCity.length; i < n; i++) {
                if (Vcity.allCity[i].level != '100') {
                    if (reg.test(Vcity.allCity[i].name) || reg.test(Vcity.allCity[i].verb) || reg.test(Vcity.allCity[i].pinyin)) {
                        if (searchResult.length !== 0) {
                            str = '<li id="' + Vcity.allCity[i].code + '"><b class="cityname">' + Vcity.allCity[i].name + '</b><b class="cityspell">' + Vcity.allCity[i].pinyin + '</b></li>';
                        } else {
                            str = '<li id="' + Vcity.allCity[i].code + '" class="on"><b class="cityname">' + Vcity.allCity[i].name + '</b><b class="cityspell">' + Vcity.allCity[i].pinyin + '</b></li>';
                        }
                        searchResult.push(str);
                    }
                }
            }
            this.isEmpty = false;
            // 如果搜索数据为空
            if (searchResult.length == 0) {
                this.isEmpty = true;
                str = '<li class="empty">对不起，没有找到数据 "<em>' + value + '</em>"</li>';
                searchResult.push(str);
            }
            // 如果slideul不存在则添加ul
            if (!this.ul) {
                var ul = this.ul = document.createElement('ul');
                ul.className = 'cityslide';
                this.rootDiv && this.rootDiv.appendChild(ul);
                // 记录按键次数，方向键
                this.count = 0;
            } else if (this.ul && Vcity._m.hasClass('hide', this.ul)) {
                this.count = 0;
                Vcity._m.removeClass('hide', this.ul);
            }
            this.ul.innerHTML = searchResult.join('');

            /* IE6 */
            this.changeIframe();

            // 绑定Li事件
            this.liEvent();

            var links = Vcity._m.$('a', this['province']);
            for (var i = 0, n = links.length; i < n; i++) {
                Vcity._m.removeClass('select', links[i]);
            }
            var obj2 = document.getElementById("city_2");
            var obj3 = document.getElementById("city_3");
            if (obj2)
                obj2.parentNode.removeChild(obj2);
            if (obj3)
                obj3.parentNode.removeChild(obj3);
        } else {
            Vcity._m.addClass('hide', this.ul);
            Vcity._m.removeClass('hide', this.cityBox);

            Vcity._m.removeClass('hide', this.myIframe);

            this.changeIframe();
        }
    },

    /* IE6的改变遮罩SELECT 的 IFRAME尺寸大小 */
    changeIframe: function () {
        if (!this.isIE6)return;
        this.myIframe.style.width = this.rootDiv.offsetWidth + 'px';
        this.myIframe.style.height = this.rootDiv.offsetHeight + 'px';
    },

    /* *
     * 特定键盘事件，上、下、Enter键
     * @ KeyboardEvent
     * */

    KeyboardEvent: function (event, keycode) {
        var lis = Vcity._m.$('li', this.ul);
        var len = lis.length;
        switch (keycode) {
            case 40: //向下箭头↓
                this.count++;
                if (this.count > len - 1) this.count = 0;
                for (var i = 0; i < len; i++) {
                    Vcity._m.removeClass('on', lis[i]);
                }
                Vcity._m.addClass('on', lis[this.count]);
                break;
            case 38: //向上箭头↑
                this.count--;
                if (this.count < 0) this.count = len - 1;
                for (i = 0; i < len; i++) {
                    Vcity._m.removeClass('on', lis[i]);
                }
                Vcity._m.addClass('on', lis[this.count]);
                break;
            case 13: // enter键
                this.input.value = Vcity.regExChiese.exec(lis[this.count].innerHTML)[0];
                Vcity._m.addClass('hide', this.ul);
                Vcity._m.addClass('hide', this.ul);
                /* IE6 */
                Vcity._m.addClass('hide', this.myIframe);

                var links = Vcity._m.$('a', this['province']);
                for (var i = 0, n = links.length; i < n; i++) {
                    Vcity._m.removeClass('select', links[i]);
                }
                var obj2 = document.getElementById("city_2");
                if (obj2) {
                    obj2.parentNode.removeChild(obj2);
                }
                var obj3 = document.getElementById("city_3");
                if (obj3)
                    obj3.parentNode.removeChild(obj3);
                break;
            default:
                break;
        }
    },

    /* *
     * 下拉列表的li事件
     * @ liEvent
     * */

    liEvent: function () {
        var that = this;
        var lis = Vcity._m.$('li', this.ul);
        for (var i = 0, n = lis.length; i < n; i++) {
            Vcity._m.on(lis[i], 'click', function (event) {
                event = Vcity._m.getEvent(event);
                var target = Vcity._m.getTarget(event);
                that.input.value = getAllCityText(Vcity.regExChiese.exec(target.innerHTML)[0]);
                Vcity._m.addClass('hide', that.ul);
                /* IE6 下拉菜单点击事件 */
                Vcity._m.addClass('hide', that.myIframe);
                if (that.selectEvent)
                    that.selectEvent(that.input.value, this.id);

                var lis = Vcity._m.$('li', that.cityBox);
                var divs = Vcity._m.$('div', that.hotCity);

                for (var j = 0; j < lis.length; j++) {
                    Vcity._m.removeClass('on', lis[j]);
                    Vcity._m.addClass('hide', divs[j]);
                }
                Vcity._m.addClass('on', lis[0]);
                Vcity._m.removeClass('hide', divs[0]);
            });
            Vcity._m.on(lis[i], 'mouseover', function (event) {
                event = Vcity._m.getEvent(event);
                var target = Vcity._m.getTarget(event);
                Vcity._m.addClass('on', target);
            });
            Vcity._m.on(lis[i], 'mouseout', function (event) {
                event = Vcity._m.getEvent(event);
                var target = Vcity._m.getTarget(event);
                Vcity._m.removeClass('on', target);
            })
        }
    },
    selectEvent: null,
    selectedEvent: null,
    onSelect: function (event) {
        var that = this;
        that.selectEvent = event;
    },
    onSelected: function (event) {
        var that = this;
        that.selectedEvent = event;
    },
    closeFrame: function () {
        var that = this;
        Vcity._m.addClass('hide', that.cityBox);
        /* 点击城市名的时候隐藏myIframe */
        Vcity._m.addClass('hide', that.myIframe);
        if (that.selectedEvent)
            that.selectedEvent(that.input.value, this.id);
    }
};