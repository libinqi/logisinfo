/**
 * Created by libinqi on 2014/10/23.
 */
module.exports = {
    name: '物流共享中心',
    description: '物流信息共享中心.',
    domain: 'jt56.org',
    url: 'http://logisinfo.jt56.org',
    session_secret:"logisinfo",
    env: 'production',
    port: process.env.PORT || 80,
    sphinx: {
        host: "searchsrv.jt56.org",
        port: 9312,
        limit: 15
    },
    checkLoginUrl:'http://talos.jt56.org/talos/userservice',
    apiUrl:'apollo.jt56.org',
    enterpriseApiUrl:'http://apollo.jt56.org/apollo/ws/enterprise/getenterprisewithlics',
    driverApiUrl:'http://apollo.jt56.org/apollo/ws/driver/getdriverwithlics'
}