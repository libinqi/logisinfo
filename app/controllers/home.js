/*
 * GET home page.
 */

exports.index = function (req, res) {
//  res.render('main/index', { title: 'Express' });
    if (locals.current_user && current_user.eId) {
        res.redirect("/line/all");
    }
    else {
        res.redirect("/goods/all");
    }
};