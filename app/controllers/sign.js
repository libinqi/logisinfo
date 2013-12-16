/**
 * Company jt56.org
 * Created by libinqi on 13-12-9.
 */

var settings = require('../../config/settings');

exports.auth_user = function (req, res, next) {
    if (req.url.indexOf("/api") >= 0) {
        return   next();
    }
//        var user = {id: '20131214-1438198d-4b69-a9aa-245b768cb5fb', eId: '20131214-14594877-4f5f-b79e-753477f3651a', name: 'oshine'};
    var user = {eId: '20131215-09484639-495e-866f-7fed3d114e16', id: '20131214-144753e5-4924-ac83-cefdfd524a2e', name: 'hnftwl'};
    //获取cookie
//    var user_cookie = req.cookies[settings.user_cookie_name];
//    if (!user_cookie) {
//        return  res.redirect('http://luc.jt56.org/uc?redirectURL=logisinfo.jt56.org');
//    }
//    var user = {id: user_cookie};
//    if (req.cookies["username"])
//        user.name = req.cookies["username"];
//    if (req.cookies[settings.e_cookie_name])
//        user.eId = req.cookies[settings.e_cookie_name];

    //写入session
    req.session.user = user;
    res.locals.current_user = req.session.user;
    return next();
}