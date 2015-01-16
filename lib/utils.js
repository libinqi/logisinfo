/**
 * Created by libinqi on 2014/10/25.
 */
var moment = require('moment');
exports.DateFormat = {
    Format: function (date, formatstr) {
        moment.lang('zh-cn');
        return moment(date).format(formatstr || 'YYYY-MM-DD HH:mm:ss');
    },
    TimeAgo: function (date) {
        moment.lang('zh-cn');
        return moment(date).fromNow();
    }
}