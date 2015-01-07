/**
 * Created by libinqi on 2014/10/23.
 */
var path = require('path');
var app = require(path.join(process.cwd(), 'app'));

module.exports = {
    main: function (req, res, next) {
        return res.render('index', { title: '物流信息共享平台',layout:false });
    }
}
