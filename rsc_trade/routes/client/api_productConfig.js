/**
 * Created by tangxiafeng on 17/4/16.
 */
var async = require('async');

var config_error = global.config_error;
var config_common = global.config_common;

var lib_ProductConfig = global.lib_ProductConfig;
var lib_ProductClassify = global.lib_ProductClassify;
module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 添加配置
     * name   父级id
     * status   英文字段
     * PID   中文字段
     */
    api.post('/add', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['name', 'status', 'PID'], cb, null, 'config');
            },
            function (cb) {
                lib_ProductConfig.getCount({
                    name: req.body.name,
                    status: req.body.status,
                    unit: req.body.unit
                }, cb);
            },
            function (count, cb) {
                if (count) {
                    lib_ProductConfig.update({
                        find: {
                            name: req.body.name,
                            status: req.body.status,
                            unit: req.body.unit
                        },
                        set: {$addToSet: {PID: req.body.PID}}
                    }, cb);
                } else {
                    lib_ProductConfig.add({
                        name: req.body.name,
                        unit: req.body.unit,
                        status: req.body.status,
                        PID: req.body.PID
                    }, cb);
                }
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