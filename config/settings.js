var path = require('path');

var settings = {
    path: path.normalize(path.join(__dirname, '..')),
    port: process.env.PORT || 3000,
    session_secret:"logisinfo",
    user_cookie_name:"useruuid",
    e_cookie_name:"euuid",
//    database: {
//        protocol: "mysql", // or "mysql"
//        query: { pool: true },
//        host: "192.168.0.121",
//        database: "logisinfo",
//        user: "root",
//        password: "sin30=1/2"
//    },
    database: {
        protocol: "mysql", // or "mysql"
        query: { pool: true },
        host: "127.0.0.1",
        database: "jt56_search",
        user: "root",
        password: ""
    },
    db: null,
    list_count: 10 //信息列表页-每页显示的信息的条数
};

module.exports = settings;