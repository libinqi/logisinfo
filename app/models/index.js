var orm = require('orm');
var settings = require('../../config/settings');

var connection = null;

function setup(db, cb) {
    require('./message')(orm, db);
    require('./comment')(orm, db);
    require('./line')(orm, db);
    require('./goods')(orm, db);
    require('./vehicle')(orm, db);
    require('./store')(orm, db);

    return cb(null, db);
}

module.exports = function (cb) {
    if (connection) return cb(null, connection);
    if (settings.db) {
        setup(settings.db, cb);
    }
    else {
        orm.connect(settings.database, function (err, db) {
            if (err) return cb(err);

            db.settings.set("connection.pool", true);
            db.settings.set("connection.debug", true);
            db.settings.set('instance.returnAllErrors', true);

            settings.db = db;
            setup(db, cb);
        });
    }
};