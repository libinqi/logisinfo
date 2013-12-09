/**
 * Company jt56.org
 * Created by libinqi on 13-12-9.
 */

var settings = require('../../config/settings');

exports.auth_user = function (req, res, next) {
    if (req.session.user) {
        next();
    }
    else {
        //获取cookie
        var user_cookie = req.cookies[settings.user_cookie_name];
        if (!user_cookie) {
            res.redirect('http://ec.jt56.org/ec/');
        }
        var user = {id: user_cookie};
        if (req.cookies["username"])
            user.name = req.cookies["username"];
        if (req.cookies[settings.e_cookie_name])
            user.eId = req.cookies[settings.e_cookie_name];

        //写入session
        req.session.user = user;
        res.locals('current_user', req.session.user);
        return next();
    }
}