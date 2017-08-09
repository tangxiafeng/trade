/**
 * Created by tangxiafeng on 17/4/15.
 */
var async = require('async');

var config_error = global.config_error;
var config_common = global.config_common;

var lib_Tonnage = global.lib_Tonnage;
var lib_ProductClassify = global.lib_ProductClassify;


module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 用户输入理记重量
     *
     * product   理记参数
     * company_id  公司id
     */
    api.post('/set', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['product', 'company_id'], cb);
            },
            function (cb) {
                async.eachSeries(req.body.product, function (product, callback) {
                    async.waterfall([
                        function (cbk) {
                            lib_Tonnage.update({
                                find: {company_id: req.body.company_id},
                                set: {PID: product.PID, name: product.name, value: product.value}
                            }, cbk);
                        },
                        function (result, cbk) {
                            if (result.n === 0) {
                                lib_Tonnage.add({
                                    company_id: req.body.company_id,
                                    PID: product.PID,
                                    name: product.name,
                                    value: product.value
                                }, cbk);
                            } else {
                                cbk(null, {});
                            }
                        }
                    ], callback);
                }, cb);
            }
        ], function (err) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, {}, next);
        });
    });

    /**
     * 用户获取该公司理记重量
     *
     * company_id  公司id
     * name 属性名称
     * PID 父类id
     */
    api.post('/get', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['company_id'], cb);
            },
            function (cb) {
                lib_Tonnage.getOne({
                    find: global.middleware.getProductByCompany(req.body, {company_id: req.body.company_id})
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

