/**
 * Created by tangxiafeng on 17/5/20.
 */
var async = require('async');
var _ = require('underscore');

var http = require('../libs/http');


var lib_User = require('../libs/lib_User');
var obj = {
    msg_server_push: '/api/push/push',//推送
    msg_server_send_sms1: '/msg/send_sms1'//发送手机短信
};
exports.push = function (req, data, cond, index, clientDate, user_ids, type, callback) {
    if (!callback) callback = function () {
    };
    var ids, users;
    async.waterfall([
        function (cb) {
            if (!user_ids) {
                lib_User.get_push_user({user_id: req.decoded.id, type: type}, cb);
            } else {
                cb(null, null);
            }
        },
        function (result, cb) {
            users = result;
            ids = result ? _.pluck(_.flatten(_.values(result)), '_id') : user_ids;
            data.data = JSON.stringify(clientDate);
            data.user_ids = ids && ids.length > 0 ? JSON.stringify(_.flatten(_.filter(ids))) : JSON.stringify(_.compact(_.flatten(ids)) || []);
            http.sendMsgServerNotToken(req, data, obj.msg_server_push, cb);
        }
    ], function () {
        callback(null, users);
    });
};


exports.send_sms = function (sms, template_id, phone_list, callback) {
    if (!callback) callback = function () {
    };
    if (!global.config_server.is_sms) {
        return callback();
    }
    var url = 'http://www.rsc365.com:4000/html/downLoad.html';
    async.waterfall([
        function (cb) {
            http.short_url(url, cb);
        },
        function (short_url, cb) {
            url = short_url;
            sms.push(url);
            http.sendMsgServerNotToken(null, {
                content: JSON.stringify(sms),
                phone_list: phone_list,
                template_id: template_id
            }, obj.msg_server_send_sms1 + '/template' + '/' + 'GBK', cb);
        }
    ], callback);
};

