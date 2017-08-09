/**
 * Created by Administrator on 2017/4/9.
 */
var async = require('async');
var decimal = require('decimal');
var _ = require('underscore');

var config_error = global.config_error;
var config_common = global.config_common;
var config_model = global.config_model;

var lib_shop = global.lib_shop;
var lib_PriceOffer = global.lib_PriceOffer;
var lib_DemandOrder = global.lib_DemandOrder;
var lib_common = global.lib_common;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 增删改查
     */
    api.post('/add', function (req, res, next) {
        var shop;
        var Arr = [];
        async.waterfall([
            function (cb) {
                config_error.checkRole(req.decoded.role, [config_common.user_roles.TRADE_ADMIN, config_common.user_roles.TRADE_SALE, config_common.user_roles.TRADE_PURCHASE], cb);
            },
            function (cb) {
                config_error.checkBody(req.body, ['offer_id', 'product_categories', 'payment_style', 'price', 'amount'], cb);
            },
            function (cb) {
                lib_PriceOffer.getOne({
                    find: {_id: req.body.offer_id}
                }, cb);
            },
            function (offer, cb) {
                if (!offer) return next(config_error.invalid_id);
                async.eachSeries(req.body.product_categories, function (obj, callback) {
                    async.eachSeries(obj.product_name, function (nameObj, cback) {
                        if(!nameObj.amount) return cb(config_error.invalid_amount);
                        async.waterfall([
                            function (cbk) {
                                var query = {payment_style: req.body.payment_style};
                                query.offer_id = req.body.offer_id;
                                query.user_demand_id = req.decoded.id;
                                query['product_categories.product_name.name'] = nameObj.name;
                                query['product_categories.product_name.price'] = nameObj.price;
                                query['product_categories.product_name.preferential'] = nameObj.preferential;
                                if (obj.layer_1) query['product_categories.layer_1'] = obj.layer_1;
                                if (obj.layer_2) query['product_categories.layer_2'] = obj.layer_2;
                                if (obj.layer_3) query['product_categories.layer_3'] = obj.layer_3;
                                var set = {$inc: {}};
                                set['$inc']['product_categories.product_name.number'] = Number(nameObj.number);
                                set['$inc']['product_categories.product_name.amount'] = Number(nameObj.amount);
                                set['$inc']['amount'] = Number(nameObj.amount);
                                lib_shop.update({
                                    find: query,
                                    set: set
                                }, cbk);
                            }
                        ], function (err, result) {
                            if (err) return next(err);
                            if (result.n === 0) {
                                var productObj = JSON.parse(JSON.stringify(obj));
                                productObj.product_name = nameObj;
                                Arr.push({
                                    offer_id: req.body.offer_id,
                                    user_demand_id: req.decoded.id,
                                    user_supply_id: offer.user_id,
                                    company_supply_id: offer.company_id,
                                    company_supply_name: offer.company_name,
                                    company_demand_id: req.decoded.company_id,
                                    company_demand_name: req.decoded.company_name,

                                    product_categories: productObj,

                                    att_quality: offer.att_quality,
                                    att_payment: offer.att_payment,
                                    att_traffic: offer.att_traffic,
                                    att_settlement: offer.att_settlement,
                                    path_loss: offer.path_loss,

                                    delay_day: offer.delay_day,
                                    delay_type: offer.delay_type,
                                    percent_advance: offer.percent_advance,

                                    price: req.body.price,
                                    amount: Number(nameObj.amount),

                                    payment_style: req.body.payment_style,
                                    location_storage: offer.location_storage
                                });
                            }
                            cback();
                        });
                    }, callback);
                }, cb);
            },
            function (cb) {
                if (Arr.length) {
                    lib_shop.addList(Arr, cb);
                } else {
                    cb(null, null);
                }
            },
            function (result, cb) {
                shop = result;
                lib_shop.getCount({
                    find: {offer_id: req.body.offer_id}
                }, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            global.lib_Statistical.statistical_server_companyTrade_add(req, {
                companyObj: [{
                    id: req.decoded.company_id,
                    type: global.config_model.statistical_type.purchase_plan,
                    count: result === Arr.length ? 1 : 0,
                    shop_count: Arr.length,
                    category: Arr.length ? Arr[0].product_categories.layer_1 : ''
                }]
            });
            config_common.sendData(req, shop ? _.pluck(shop, '_id') : [], next);
        });
    });
    api.post('/del', function (req, res, next) {
        lib_common.del(req, lib_shop, function (err) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, {}, next);
        });
    });
    api.post('/edit', function (req, res, next) {
        lib_common.edit(req, lib_shop, function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });
    api.post('/detail', function (req, res, next) {
        lib_common.detail(req, lib_shop, function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    /**
     * 采购计划列表3.0.0
     */
    api.post('/get_list', function (req, res, next) {
        var query = {
            user_demand_id: req.decoded.id,
            order_id: ''
        };
        var companyArr = [];
        var count;
        var shop_list;
        async.waterfall([
            function (cb) {
                lib_shop.getList({
                    find: query
                }, cb);
            },
            function (result, cb) {
                shop_list = result;
                if (shop_list.length > 0) {
                    lib_PriceOffer.getList({
                        find: {_id: {$in: _.pluck(shop_list, 'offer_id')}}
                    }, cb);
                } else {
                    cb(null, null);
                }
            },
            function (list, cb) {
                count = shop_list.length;
                async.eachSeries(_.uniq(_.pluck(shop_list, 'user_supply_id')), function (user_id, callback) {
                    query.user_supply_id = user_id;
                    async.parallel({
                        CIF: function (cback) {
                            query.payment_style = config_model.payment_style.CIF;
                            lib_shop.getList({
                                find: query
                            }, cback);
                        },
                        FOB: function (cback) {
                            query.payment_style = config_model.payment_style.FOB;
                            lib_shop.getList({
                                find: query
                            }, cback);
                        }
                    }, function (err, result) {
                        if (err) return next(err);
                        result.user_id = user_id;
                        shop_list.forEach(function (shop) {
                            if (shop.user_supply_id === user_id) {
                                result.company_id = shop.company_supply_id;
                            }
                            list.forEach(function (obj) {
                                if (shop.offer_id === obj._id.toString()) {
                                    result.offer_role = obj.role;
                                }
                            });
                        });
                        companyArr.push(result);
                        callback();
                    });
                }, cb);
            }
        ], function (err) {
            if (err) {
                return next(err);
            }
            global.lib_Relationship.planCheck(req);
            config_common.sendData(req, {
                list: companyArr,
                count: count
            }, next);
        });
    });

    return api;

};
