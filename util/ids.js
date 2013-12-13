/**
 * Created by libinqi on 13-12-12.
 */

var crypto = require('crypto');

exports.GenerateId = function (_prefix) {
    var date = new Date();
    var seed = date.getTime();

    if (_prefix)
        return _prefix + seed;
    else
        return seed;
}

exports.GenerateKey = function () {
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
};