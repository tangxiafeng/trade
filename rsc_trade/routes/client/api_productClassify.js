/**
 * Created by tangxiafeng on 17/4/16.
 */
var async = require('async');

var config_error = global.config_error;
var config_common = global.config_common;

var lib_ProductConfig = global.lib_ProductConfig;
var lib_ProductClassify = global.lib_ProductClassify;
var lib_Tonnage = global.lib_Tonnage;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 添加配置
     * PID   父级id
     * eng   英文字段
     * chn   中文字段
     */
    api.post('/add', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['eng', 'chn'], cb);
            },
            function (cb) {
                lib_ProductClassify.getOne({
                    find: {PID: req.body.PID || 0, eng: req.body.eng, chn: req.body.chn}
                }, cb);
            },
            function (entry, cb) {
                if (!entry) {
                    async.waterfall([
                        function (cbk) {
                            lib_ProductClassify.getOne({
                                find: req.body.PID ? {_id: req.body.PID} : {asd: ''},
                                select: 'lev'
                            }, cbk);
                        },
                        function (result, cbk) {
                            lib_ProductClassify.add({
                                PID: req.body.PID || 0,
                                lev: result ? ++result.lev : 0,
                                chn: req.body.chn,
                                eng: req.body.eng
                            }, cbk);
                        }
                    ], cb);

                } else {
                    cb(null, entry);
                }
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        })
    });

    /**
     * 获取配置
     * PID  父类id
     */
    api.post('/get', function (req, res, next) {
        var query = {PID: req.body.PID || 0};
        if (req.body.material) query.eng = {$in: req.body.material};
        async.waterfall([
            function (cb) {
                lib_ProductClassify.getList({
                    find: query,
                    select: 'eng chn file'
                }, cb);
            },
            function (result, cb) {
                if (result.length !== 0) {
                    cb(null, result);
                } else {
                    if (req.body.material) {
                        cb(null, []);
                    } else {
                        async.parallel({
                            attribute: function (cbk) {
                                lib_ProductConfig.getList({
                                    find: {PID: req.body.PID, status: global.config_model.config_status.attribute},
                                    select: 'name unit vary calculate read'
                                }, cbk);
                            },
                            product_name: function (cbk) {
                                lib_ProductConfig.getList({
                                    find: {PID: req.body.PID, status: global.config_model.config_status.product_name},
                                    select: 'name'
                                }, cbk);
                            },
                            unit: function (cbk) {
                                lib_ProductConfig.getList({
                                    find: {PID: req.body.PID, status: global.config_model.config_status.unit},
                                    select: 'name unit'
                                }, cbk);
                            },
                            other: function (cbk) {
                                lib_ProductConfig.getList({
                                    find: {PID: req.body.PID, status: global.config_model.config_status.other},
                                    select: 'name unit vary'
                                }, cbk);
                            },
                            calculate: function (cbk) {
                                lib_Tonnage.getList({
                                    find: {PID: req.body.PID}
                                }, cbk);
                            }
                        }, cb);
                    }
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