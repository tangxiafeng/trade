/**
 * Created by tangxiafeng on 17/4/27.
 */
var async = require('async');
var config_common = global.config_common;
var config_error = global.config_error;

module.exports = function (app, express) {

    var api = express.Router();
    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_server')());

    /**
     * 服务器间访问通用接口 只允许获取信息 不能修改或天啊家
     * method  方法名
     * cond    条件
     * model   表名
     */
    api.post('/get', function (req, res, next) {
        var model = require('../../dbs/db_base');
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['method', 'cond', 'model'], cb);
            },
            function (cb) {
                model(req.body.model, cb);
            },
            function (cbModel, cb) {
                if (!cbModel[req.body.method]) return next(config_error.invalid_method);
                cbModel[req.body.method](req.body.cond, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    /**
     * 同上  多个
     * method
     * models {model cond}
     */
    api.post('/gets', function (req, res, next) {
        var model = require('../../dbs/db_base');
        var result = [];
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['method', 'models'], cb);
            },
            function (cb) {
                async.eachSeries(req.body.models, function (models, callback) {
                    async.waterfall([
                        function (cbk) {
                            model(models.model, cbk);
                        },
                        function (cbModel, cbk) {
                            if (!cbModel[req.body.method]) return next(config_error.invalid_method);
                            cbModel[req.body.method](models.cond, cbk);
                        },
                        function (list, cbk) {
                            result.push({
                                model: models.model,
                                data: list
                            });
                            cbk();
                        }
                    ], callback);
                }, cb);
            }
        ], function (err) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });

    });

    return api;
};
