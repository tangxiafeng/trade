/**
 * Created by tangxiafeng on 17/6/23.
 */
var async = require('async');

var config_common = global.config_common;

var lib_log = global.lib_log;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 上传图片
     * file  文件
     */
    api.post('/get_list', function (req, res, next) {
        lib_log.getListAndCount(req.body.page || 1, {
            find: {user_id: req.decoded.id},
            sort: {time_creation: -1},
            skip: config_common.entry_per_page * (req.body.page || 1 - 1),
            limit: config_common.entry_per_page
        }, function (err, result) {
            if (err) return next(err);
            config_common.sendData(req, result, next);
        })
    });

    return api;


};