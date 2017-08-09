/**
 * Created by tangxiafeng on 17/4/15.
 */
var async = require('async');
var _ = require('underscore');

var config_common = global.config_common;
var config_model = global.config_model;

var lib_shop = global.lib_shop;
var lib_PriceOffer = global.lib_PriceOffer;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 获取推送的条数
     * other_type  采购或者销售
     */
    api.post('/get', function (req, res, next) {
        async.waterfall([
            function (cb) {
                global.lib_User.getWorkRelationListAll(req, cb);
            }
        ], function (err, result) {
            if (err) return next(err);
            config_common.sendData(req, result.length, next);
        });
    });

    /**
     * 获取计划和竞价的个数
     */
    api.post('/get_offerAgain', function (req, res, next) {
        async.parallel({
            pricing: function (cb) {
                lib_shop.getCount({
                    user_demand_id: req.decoded.id,
                    order_id: ''
                }, cb);
            },
            bidding: function (cb) {
                lib_PriceOffer.getCount({list_offer: req.decoded.id, status: config_model.offer_status.published}, cb);
            }
        }, function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    /**
     * 获取单人据上次刷新前添加的条数
     */
    api.post('/get_plan_count', function (req, res, next) {
        var query = {};
        async.waterfall([
            function (cb) {
                global.lib_Relationship.planCheck(req, query, cb);
            },
            function (cb) {
                async.parallel({
                    pricing: function (cbk) {
                        lib_shop.getCount(_.extend({
                            user_demand_id: req.decoded.id,
                            order_id: ''
                        }, query), cbk);
                    },
                    bidding: function (cbk) {
                        lib_PriceOffer.getCount(_.extend({
                            list_offer: req.decoded.id,
                            status: config_model.offer_status.published
                        }, query), cbk);
                    }
                }, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, eval(_.values(result).join('+')), next);
        });

    });


    return api;
};

