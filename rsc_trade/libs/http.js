/**
 * Created by Administrator on 2015/12/7.
 */
var jwt = require('jsonwebtoken');
var request = require('request');
var querystring = require('querystring');
var config_common = global.config_common;
var config_server = global.config_server;
var mw = require('../libs/middleware');
var fs = require('fs');
var crypto = require('crypto');

exports.sendUserServerNotToken = function (req, data, url, cb) {
    if (!cb) {
        cb = function () {
        };
    }
    data = querystring.stringify(data);
    var headers;
    if (req) {
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': req.headers['x-access-token']
        }
    } else {
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    var option = {
        body: data,
        url: 'http://' + config_server.user_server_ip + ':' + config_server.user_server_port + url,
        method: 'POST',
        headers: headers
    };
    request(option, function (err, http_res, http_req) {
        if (err) return cb(err);
        if (JSON.parse(http_req).status === 'success') {
            cb(null, JSON.parse(http_req).data)
        } else {
            cb(JSON.parse(http_req).msg);
        }
    });
};
exports.sendAdminServerNotToken = function (data, url, cb) {
    if (!cb) {
        cb = function () {
        };
    }
    data = querystring.stringify(data);
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    var option = {
        body: {
            token: data
        },
        url: 'http://' + config_server.admin_server_ip + ':' + config_server.admin_server_port + url,
        method: 'POST',
        headers: headers
    };
    request(option, function (err, http_res, http_req) {
        if (err) return cb(err);
        if (JSON.parse(http_req).status === 'success') {
            cb(null, JSON.parse(http_req).data)
        } else {
            cb(JSON.parse(http_req).msg);
        }
    });
};
exports.sendMsgServerNotToken = function (req, data, url, cb) {
    if (!cb) {
        cb = function () {
        };
    }
    data = querystring.stringify(data);
    var headers;
    if (req) {
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': req.headers['x-access-token']
        }
    } else {
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    var option = {
        body: data,
        url: 'http://' + config_server.msg_server_ip + ':' + config_server.msg_server_port + url,
        method: 'POST',
        headers: headers
    };
    request(option, function (err, http_res, http_req) {
        if (err) return cb(err);
        if (JSON.parse(http_req).status === 'success') {
            cb(null, JSON.parse(http_req).data);

        } else {
            cb(JSON.parse(http_req).status);
        }
    });
};


exports.sendUserServer = function (data, url, cb) {
    if (!cb) {
        cb = function () {
        };
    }
    request({
        body: querystring.stringify({token: jwt.sign(data, config_common.secret_keys.user, {expiresIn: config_common.token_server_timeout})}),
        url: 'http://' + config_server.user_server_ip + ':' + config_server.user_server_port + url,
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }, function (err, http_res, http_req) {
        if (err) return cb(err);
        if (JSON.parse(http_req).status === 'success') {
            cb(null, JSON.parse(http_req).data)
        } else {
            cb(JSON.parse(http_req).msg);
        }
    });
};
exports.sendAdminServer = function (data, url, cb) {
    if (!cb) {
        cb = function () {
        };
    }
    request({
        body: querystring.stringify({token: jwt.sign(data, config_common.secret_keys.admin, {expiresIn: config_common.token_server_timeout})}),
        url: 'http://' + config_server.admin_server_ip + ':' + config_server.admin_server_port + url,
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }, function (err, http_res, http_req) {
        if (err) return cb(err);
        if (JSON.parse(http_req).status === 'success') {
            cb(null, JSON.parse(http_req).data)
        } else {
            cb(JSON.parse(http_req).msg);
        }
    });
};
exports.sendTrafficServer = function (data, url, cb) {
    if (!cb) {
        cb = function () {
        };
    }
    request({
        body: querystring.stringify({token: jwt.sign(data, config_common.secret_keys.traffic, {expiresIn: config_common.token_server_timeout})}),
        url: 'http://' + config_server.traffic_server_ip + ':' + config_server.traffic_server_port + url,
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }, function (err, http_res, http_req) {
        if (err) return cb(err);
        if (JSON.parse(http_req).status === 'success') {
            cb(null, JSON.parse(http_req).data)
        } else {
            cb(JSON.parse(http_req).msg);
        }
    });
};
exports.sendMsgServer = function (data, url, cb) {
    if (!cb) {
        cb = function () {
        };
    }
    var option = {
        body: querystring.stringify({token: jwt.sign(data, config_common.secret_keys.msg, {expiresIn: config_common.token_server_timeout})}),
        url: 'http://' + config_server.msg_server_ip + ':' + config_server.msg_server_port + url,
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    };
    request(option, function (err, http_res, http_req) {
        if (err) return cb(err);
        if (JSON.parse(http_req).status === 'success') {
            cb(null, JSON.parse(http_req).data)

        } else {
            cb(JSON.parse(http_req).status);
        }
    });
};
exports.sendTradeServerClient = function (req, data, url, cb) {
    if (!cb) cb = function () {
    };
    request({
        body: querystring.stringify(data),
        url: 'http://' + config_server.trade_server_ip + ':' + config_server.port + url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-access-token': req.headers['x-access-token']
        }
    }, function (err, http_res, http_req) {
        if (err) return cb(err);
        if (JSON.parse(http_req).status === 'success') {
            cb(null, JSON.parse(http_req).data)
        } else {
            cb(JSON.parse(http_req).msg);
        }
    });
};


exports.short_url = function (url, cb) {
    var option = {
        'method': 'GET',
        'headers': {'Content-Type': 'application/x-www-form-urlencoded'},
        'url': 'https://api.weibo.com/2/short_url/shorten.json?access_token=2.00OzYsiGQhK49C8318ab514486GjLD&&url_long=' + url
    };
    request(option, function (err, http_res, http_req) {
        if (err) return cb(err);
        var data = JSON.parse(http_req)['urls'];
        if (!data[0] || !data[0]['url_short']) {
            data = url;
        } else {
            data = data[0]['url_short'];
        }
        cb(null, data);
    });
};


exports.uploadImg = function (data, cb) {
    // 上传至阿里云OSS，并删除本地文件
    var file_data = fs.readFileSync(data.file.path);
    fs.unlinkSync(data.file.path);
    var OSSHeaders = '';
    var Resource = '/' + (config_common.status !== 'dev' ? config_common.OSS.bucket_img : config_common.OSS_DEV.bucket_img) + '/' + data.file_name;
    var requestDate = new Date().toUTCString();
    var VERB = 'PUT';
    var signature_content = VERB + '\n\n' + 'application/octet-stream\n' + requestDate + '\n' + OSSHeaders + Resource;
    var signature = crypto.createHmac('sha1', config_common.OSS.access_key).update(signature_content).digest().toString('base64');
    var header_authorization = 'OSS ' + config_common.OSS.access_id + ':' + signature;
    var headers = {
        'Authorization': header_authorization,
        'Cache-Control': 'no-cache',
        'Content-Disposition': 'attachment;filename=' + data.file_name,
        'Content-Length': file_data.length,
        'Content-Type': 'application/octet-stream',
        'Date': requestDate,
        'Host': config_common.status !== 'dev' ? config_common.OSS.bucket_img_url : config_common.OSS_DEV.bucket_img_url
    };
    var option = {
        'method': 'PUT',
        'headers': headers,
        'url': 'http://' + (config_common.status !== 'dev' ? config_common.OSS.bucket_img_url : config_common.OSS_DEV.bucket_img_url) + '/' + data.file_name,
        'body': file_data
    };
    request(option, function (err) {
        if (err) return cb(err);
        cb(null, data.url);
    });
};
