/**
 * Created by tangxiafeng on 17/6/23.
 */
var async = require('async');

var config_error = global.config_error;
var config_common = global.config_common;

var lib_OrderClassify = global.lib_OrderClassify;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 添加新的下单类型
     * element   产品名称
     */
    api.post('/add', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['element'], cb);
            },
            function (cb) {
                lib_OrderClassify.add({
                    arr: [req.body['element']]
                }, cb);
            }
        ], function (err, result) {
            if (err) return (err);
            config_common.sendData(req, result, next);
        })
    });

    /**
     * 根据已有的产品名称添加可以一起下单的新的产品
     * element  已有的产品
     * new_element  新的产品
     */
    api.post('/set', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['element', 'new_element'], cb);
            },
            function (cb) {
                lib_OrderClassify.update({
                    find: {arr: req.body['element']},
                    set: {$addToSet: {arr: req.body['new_element']}}
                }, cb);
            }
        ], function (err, result) {
            if (err) return (err);
            config_common.sendData(req, result, next);
        });
    });

    return api;
};