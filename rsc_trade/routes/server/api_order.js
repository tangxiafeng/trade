/**
 * Created by tangxiafeng on 17/4/25.
 */
var async = require('async');
var _ = require('underscore');

var config_common = global.config_common;
var config_error = global.config_error;

var lib_DemandOrder = global.lib_DemandOrder;
var config_model = global.config_model;

var util = global.util;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_server')());

    /**
     * 发布物流需求单 取消物流需求单 或 指派物流 的时候修改交易订单数据
     * id 或 index   单子的唯一标示
     * is_true true  发布物流需求单  false  删除物流需求单 或者 需求单获取
     * amount        吨数
     */
    api.post('/edit', function (req, res, next) {
        async.waterfall([
            function (cb) {
                lib_DemandOrder.getOne({
                    find: {$or: [{_id: req.body.id}, {index: req.body.index}]}
                }, cb);
            },
            function (order, cb) {
                if (!order) return next(config_error.invalid_id);
                if (_['isString'](req.body['products_remain'])) req.body['products_remain'] = JSON.parse(req.body['products_remain']);
                if (req.body['is_true']) {
                    if (util.add(order.amount_been_demand, req.body.amount) > order.amount) return next(config_error.not_amount);
                    order.step = 3;
                    order.amount_been_demand = util.add(order.amount_been_demand, req.body.amount);
                    order.product_categories = lib_DemandOrder.assign(order.product_categories, req.body['products_remain'], util.sub);
                    if (!order.product_categories) return cb(config_error.invalid_product);
                    if (order.amount_been_demand > order.amount) return cb(config_error.invalid_amount);
                } else {
                    order.amount_been_demand = util.sub(order.amount_been_demand, req.body.amount);
                    order.product_categories = lib_DemandOrder.assign(order.product_categories, req.body['products_remain'], util.add);
                    if (!order.product_categories) return cb(config_error.invalid_product);
                    order.step = order.amount_been_demand === 0 ? 3 : 2
                }
                order.att_traffic = config_model.att_traffic.pick_up;
                order.markModified('product_categories');
                lib_DemandOrder.edit(order, cb);
            }
        ], function (err) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, {}, next);
        });
    });

    /**
     * 补货修改交易订单
     * id  单子id
     * replenishCar  司机补货信息
     */
    api.post('/replenish', function (req, res, next) {
        lib_DemandOrder.update({
            find: {$or: [{_id: req.body.id}, {index: req.body.index}]},
            set: {
                $addToSet: {
                    replenishCar: req.body.replenishCar
                },
                $inc: {
                    price_replenish: _.reduce(req.body.replenishCar.product_name, function (memo, num) {
                        return util.mul(num.price, num.amount);
                    }, 0),
                    amount: req.body.amount,
                    price: _.reduce(req.body.replenishCar.product_name, function (memo, num) {
                        return util.mul(num.price, num.amount);
                    }, 0)
                }
            }
        }, function (err) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, {}, next);
        });
    });

    return api;
};