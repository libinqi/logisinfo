var path = require('path');

var settings = {
    path: path.normalize(path.join(__dirname, '..')),
    port: process.env.PORT || 3000,
    database: {
        protocol: "mysql", // or "mysql"
        query: { pool: true },
        host: "127.0.0.1",
        database: "logisinfo",
        user: "root",
        password: ""
    },
    db: null,
    list_count: 10 //信息列表页-每页显示的信息的条数
};

module.exports = settings;