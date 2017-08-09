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
