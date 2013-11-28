var path       = require('path');

var settings = {
        path       : path.normalize(path.join(__dirname, '..')),
        port       : process.env.PORT || 3000,
        database   : {
                protocol : "mysql", // or "mysql"
                query    : { pool: true },
                host     : "127.0.0.1",
                database : "logisinfo",
                user     : "root",
                password : ""
        },
        db:null
};

module.exports = settings;