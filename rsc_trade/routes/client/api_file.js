/**
 * Created by tangxiafeng on 17/6/23.
 */
var async = require('async');
var fs = require('fs');
var formidable = require('formidable');
var crypto = require('crypto');
var _ = require('underscore');

var config_error = global.config_error;
var config_common = global.config_common;

var http = global.http;
var mw = global.middleware;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 上传图片
     * file  文件
     */
    api.post('/img_upload', function (req, res, next) {
        var url = '';
        var files;
        async.waterfall([
            function (cb) {
                config_error.checkRole(req.decoded.role, [config_common.user_roles.TRADE_ADMIN, config_common.user_roles.TRADE_PURCHASE, config_common.user_roles.TRADE_SALE], cb);
            },
            function (cb) {
                var form = formidable.IncomingForm();
                form.uploadDir = __dirname.replace('/routes/client', config_common.file_path);
                form.parse(req, cb);
            },
            function (fields, fileDate, cb) {
                files = fileDate;
                if (files['file'] === undefined) return next(config_error.not_file);
                var file_name = _.now();
                var file = files['file'];
                if (!config_common.file_format[file.name.split('.').pop()] || file.size > config_common.file_size) {
                    fs.unlink(file.path, function (err) {
                        if (err) {
                            return next(err);
                        }
                        else {
                            return next(config_error.file_little_bigger);
                        }
                    });
                }
                file_name += '_' + mw.getRandomString(2) + '.' + file.name.split('.').pop();
                if (process.env.node_env || process.env.node_env !== 'dev') {
                    url = 'http://' + config_common.OSS.bucket_img_url + '/' + file_name;
                } else {
                    url = 'http://' + config_common.OSS_DEV.bucket_img_url + '/' + file_name;
                }
                http.uploadImg({
                    file_name: file_name,
                    file: file,
                    url: url
                }, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    return api;


};