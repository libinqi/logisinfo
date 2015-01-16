module.exports = {
    login: function (req, res, next) {
        var user = {
            userid: req.body.userid || '',
            username: req.body.username || '',
            usertype: req.body.usertype || '',
            status: Number(req.body.status) || 0,
            mobile: req.body.mobile || ''
        };

        if (user.userid == '' && user.username == '') {
            res.send(JSON.stringify({status: false}));
        }

        req.session.user = user;
        res.locals.current_user = req.session.user;

        res.send(JSON.stringify({status: true}));
    },
    logout: function (req, res, next) {
        req.session.user = null;
        res.locals.current_user =null;
        res.send(JSON.stringify({status: true}));
    }
};