/**
 * Created by ZHR on 2015/11/16 0016.
 */

module.exports = {
    token_server_timeout: 100000000,           //服务器间通讯秘钥超时时间
    sendData: function (req, data, next) {
        req.result = data;
        next('success');
    }
};