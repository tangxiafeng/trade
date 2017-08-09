/**
 * Created by Administrator on 2017/3/28.
 */
var async = require('async');
var _ = require('underscore');

var config_error = global.config_error;
var config_common = global.config_common;

var lib_DemandOrder = global.lib_DemandOrder;
var lib_PriceOffer = global.lib_PriceOffer;
var lib_Statistical = global.lib_Statistical;
var lib_Relationship = global.lib_Relationship;
var lib_Demand = global.lib_Demand;

var lib_DemandOffer = global.lib_DemandOffer;
var lib_shop = global.lib_shop;
var lib_OfferAgain = global.lib_OfferAgain;

var util = global.util;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 增删改查
     * 流程
     * 1 发布订单
     * 2 线上找车
     * 3 发布物流需求单
     * 4 线下找车
     * 5 完成订单
     */
    api.post('/add', function (req, res, next) {
        var libModel, list;
        var idObj = {};
        switch (req.body.type) {
            case 'demand': {
                libModel = lib_DemandOffer;
                idObj = {
                    demandOffer_id: req.body.ids,
                    step: 2,
                    status: global.config_model.order_status.effective,
                    order_origin: global.config_model.order_origin.demand
                };
                break;
            }
            case 'bidding': {
                libModel = lib_OfferAgain;
                idObj = {
                    offerAgain_id: req.body.ids,
                    step: 2,
                    status: global.config_model.order_status.effective,
                    order_origin: global.config_model.order_origin.JJ
                };
                break;
            }
            case 'pricing': {
                libModel = lib_shop;
                idObj = {
                    step: 1,
                    status: global.config_model.order_status.ineffective,
                    order_origin: global.config_model.order_origin.DJ
                };
                break;
            }
        }
        async.waterfall([
            function (cb) {
                config_error.checkRole(req.decoded.role, [config_common.user_roles.TRADE_ADMIN, config_common.user_roles.TRADE_SALE, config_common.user_roles.TRADE_PURCHASE], cb);
            },
            function (cb) {
                config_error.checkBody(req.body, ['type', 'ids'], cb,
                    [[{payment_style: 'CIF'}, ['send_province', 'send_city', 'send_district', 'send_addr', 'send_phone', 'send_name', 'send_location']]
                        , [{payment_style: 'FOB'}, ['send_province', 'send_city', 'send_district', 'send_addr', 'send_phone', 'send_name', 'send_location',
                        'receive_province', 'receive_city', 'receive_district', 'receive_addr', 'receive_phone', 'receive_name', 'receive_location']]]);
            },
            function (cb) {
                libModel.getList({
                    find: {_id: {$in: req.body.ids}, order_id: ''}
                }, cb);
            },
            function (result, cb) {
                list = result;
                if (result.length === 0) return next(config_error.invalid_id);
                var checkArr = ['company_supply_id', 'payment_style'];
                for (var i = 0; i < checkArr.length; i++) {
                    if (_.uniq(_.pluck(result, checkArr[i])).length !== 1) return cb(config_error['order_' + checkArr[i] + '_onlyOne']);
                }
                var checkProductArr = ['material'];
                for (var j = 0; j < checkProductArr.length; j++) {
                    if (_.uniq(_.pluck(_.flatten(_.pluck(result, 'product_categories')), checkArr[j])).length !== 1) return cb(config_error['order_' + checkProductArr[i] + '_onlyOne']);
                }
                var price_total = 0;
                var amount_total = 0;
                var preferential = 0;
                if (req.body.product_categories) {
                    req.body.product_categories.forEach(function (product) {
                        product.product_name.forEach(function (nameObj) {
                            amount_total = global.util.add(amount_total, nameObj.amount);
                            price_total = global.util.add(price_total, global.util.mul(nameObj.price, nameObj.amount));
                            preferential = global.util.mul(nameObj.preferential || 0, nameObj.amount);
                        })
                    })
                } else {
                    result.forEach(function (entry) {
                        _.flatten(_.pluck(result, 'product_categories')).forEach(function (obj) {
                            obj.product_name.forEach(function (nameObj) {
                                amount_total = global.util.add(amount_total, nameObj.amount);
                                price_total = global.util.add(price_total, global.util.mul(nameObj.price || entry.price, nameObj.amount));
                                preferential = global.util.mul(nameObj.preferential || 0, nameObj.amount);
                            });
                        });
                    });
                }
                lib_DemandOrder.add(_.extend({
                    offer_id: _.uniq(_.pluck(result, 'offer_id')) || [],

                    index: util.getOrderIndex('order'),
                    user_demand_id: _.uniq(_.pluck(result, 'user_demand_id'))[0],
                    company_demand_id: _.uniq(_.pluck(result, 'company_demand_id'))[0],
                    company_demand_name: _.uniq(_.pluck(result, 'company_demand_name'))[0],
                    company_supply_id: _.uniq(_.pluck(result, 'company_supply_id'))[0],
                    company_supply_name: _.uniq(_.pluck(result, 'company_supply_name'))[0],
                    user_supply_id: _.uniq(_.pluck(result, 'user_supply_id')),

                    payment_style: _.uniq(_.pluck(result, 'payment_style'))[0] || 'CIF',

                    product_categories: _.reduce(req.body.product_categories || _.flatten(_.pluck(result, 'product_categories')), function (list, product) {
                        var product_name = [];
                        product.product_name.forEach(function (obj) {
                            obj['number'] = Number(obj.number);
                            obj['number_remain'] = obj.number;
                            product_name.push(obj);
                        });
                        product.product_name = product_name;
                        list.push(product);
                        return list;
                    }, []),

                    att_quality: _.uniq(_.pluck(result, 'att_quality')),
                    att_payment: _.uniq(_.pluck(result, 'att_payment')),
                    att_traffic: _.uniq(_.pluck(result, 'att_traffic')),
                    att_settlement: _.uniq(_.pluck(result, 'att_settlement')),
                    path_loss: _.uniq(_.pluck(result, 'att_settlement')),

                    amount: amount_total,
                    price: price_total,
                    preferential: preferential,

                    delay_day: _.compact(_.uniq(_.pluck(result, 'delay_day'))),
                    delay_type: _.compact(_.uniq(_.pluck(result, 'delay_type'))),
                    percent_advance: _.compact(_.uniq(_.pluck(result, 'percent_advance'))),

                    time_depart_end: global.util.getDateByHour(12),

                    send_province: req.body.send_province,
                    send_city: req.body.send_city,
                    send_district: req.body.send_district,
                    send_addr: req.body.send_addr,
                    send_phone: req.body.send_phone,
                    send_name: req.body.send_name,
                    send_location: req.body.send_location,
                    receive_province: req.body.receive_province,
                    receive_city: req.body.receive_city,
                    receive_district: req.body.receive_district,
                    receive_addr: req.body.receive_addr,
                    receive_phone: req.body.receive_phone,
                    receive_name: req.body.receive_name,
                    receive_location: req.body.receive_location,

                    replenish: req.body.replenish || _.compact(_.flatten(_.pluck(result, 'replenish'))),
                    appendix: req.body.appendix
                }, idObj), cb);
            },
            function (result, count, cb) {
                lib_DemandOrder.addOrderEnd(req, result, list);
                if (req.body.type === 'pricing') {
                    libModel.del({_id: {$in: req.body.ids}}, cb);
                } else {
                    libModel.update({
                        find: {_id: {$in: req.body.ids}},
                        set: {order_id: result._id}
                    }, cb);
                }
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result._id, next);
        });
    });
    api.post('/del', function (req, res, next) {
        global.lib_common.del(req, lib_DemandOrder, function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });
    api.post('/edit', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['id', 'step'], cb);
            },
            function (cb) {
                lib_DemandOrder.update({
                    find: {_id: req.body.id},
                    set: {step: req.body.step, time_update_step: new Date()}
                }, cb);
            },
            function (result, cb) {
                lib_DemandOrder.getOne({
                    find: {_id: req.body.id}
                }, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            var type;
            if (result.payment_style === 'CIF') {
                type = 'buy_transit';
            } else {
                type = 'sale_transit';
            }
            if (req.body.step === 4) {
                global.lib_msg.push(req, {
                    title: '交易订单',
                    content: global.config_msg_templates.encodeContent('order_car', [req.decoded.company_name || '', req.decoded['user_name'], result.product_categories[0].layer_1_chn])
                }, {}, '', {
                    params: {id: result._id, source: type},
                    url: config_common.push_url.order
                }, req.decoded.id === result.user_demand_id ? [result.user_supply_id] : [result.user_demand_id]);
            }
            config_common.sendData(req, result, next);
        })
    });
    api.post('/detail', function (req, res, next) {
        global.lib_common.detail(req, lib_DemandOrder, function (err, result) {
            if (err) {
                return next(err);
            }
            if (result) {
                result = result.toObject();
                result.categories = global.util.getMaterialList(result.product_categories);
            }
            config_common.sendData(req, result || {}, next);
        });
    });

    /**
     * 检验能不能同时下单
     * arr   需要检查的第一层分类数组
     */
    api.post('/check', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['arr'], cb);
            },
            function (cb) {
                global.lib_OrderClassify.getCount({
                    arr: {$in: req.body.arr}
                }, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result > 0 ? !(result - 1) : config_error.no_product, next);
        });
    });

    /**
     * 订单列表
     * status 列表类型
     */
    api.post('/get_list', function (req, res, next) {
        var page_num = req.body.page || 1;
        var query = lib_DemandOrder.getQueryByType(req.body.type, req.decoded.id);
        query.status = req.body.status;
        if (req.body.company_id) query = _.extend(global.middleware.getOtherCompanyQueryByType(req.body.type, req.body.company_id), query);
        var Obj;
        var Arr = [];
        var length;
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['status', 'type'], cb);
            },
            function (cb) {
                global.lib_DemandOrder.getUpdateCount(req, cb);
            },
            function (count, cb) {
                length = count;
                lib_Relationship.orderCheck(req, query, cb);
            },
            function (cb) {
                lib_DemandOrder.getListAndCount(page_num, {
                    find: query,
                    skip: config_common.entry_per_page * (page_num - 1),
                    limit: config_common.entry_per_page,
                    sort: {time_creation: -1}
                }, cb);
            },
            function (result, cb) {
                Obj = result;
                async.eachSeries(result.list, function (entry, callback) {
                    entry = entry.toObject();
                    entry.quality_img_update = false;
                    async.waterfall([
                        function (cbk) {
                            lib_PriceOffer.getCount({
                                _id: {$in: entry.offer_id},
                                time_update_quality_img: {
                                    $gte: util.getToday(),
                                    $lte: new Date(new Date(util.getToday()).getTime() + 1000 * 60 * 60 * 24)
                                }
                            }, cbk);
                        },
                        function (count, cbk) {
                            if (count) {
                                entry.quality_img_update = true;
                            }
                            Arr.push(entry);
                            cbk();
                        }
                    ], callback);
                }, cb);
            },
            function (cb) {
                Obj.list = Arr;
                Obj.update_count = length;
                var company_id, user_id;
                if (req.body.type === 'SALE') {
                    company_id = 'company_demand_id';
                    user_id = 'user_demand_id';
                } else {
                    company_id = 'company_supply_id';
                    user_id = 'user_supply_id';
                }
                global.lib_common.addUserAndCompany(req, Obj, cb, null, user_id, company_id);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    /**
     * 提示条数
     * type
     *
     */
    api.post('/get_remind', function (req, res, next) {
        var query = global.middleware.getUserQueryByType(req.body.type, req.decoded.id, {});
        if (req.body.company_id) query = _.extend(global.middleware.getOtherCompanyQueryByType(req.body.type, req.body.company_id), query);
        var obj = {};
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['type'], cb);
            },
            function (cb) {
                global.lib_Relationship.orderCheck(req, query, cb, true);
            },
            function (cb) {
                console.log(query);
                lib_DemandOrder.getList({find: query}, cb);
            },
            function (result, cb) {
                obj.all = result.length;
                lib_DemandOrder.getAggregate({
                    match: {_id: {$in: _.pluck(result, '_id')}},
                    group: {_id: '$status', num: {$sum: 1}}
                }, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            var Status = {
                ineffective: 0,
                effective: 0,
                complete: 0,
                cancelled: 0
            };
            _.each(result, function (status) {
                Status[status._id] = status.num;
            });
            config_common.sendData(req, _.extend(Status, obj), next);
        });
    });


    /**
     * 获取各个状态订单的个数
     * type  采购或者销售
     */
    api.post('/get_oneself_count', function (req, res, next) {
        var query = lib_DemandOrder.getQueryByType(req.body.type, req.decoded.id);
        if (req.body.company_id) query = _.extend(global.middleware.getOtherCompanyQueryByType(req.body.type, req.body.company_id), query);
        var Status = {
            ineffective: 0,
            effective: 0,
            complete: 0,
            cancelled: 0
        };
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['type'], cb);
            },
            function (cb) {
                lib_DemandOrder.getAggregate({
                    match: query,
                    group: {_id: '$status', num: {$sum: 1}}
                }, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            _.each(result, function (status) {
                Status[status._id] = status.num;
            });
            config_common.sendData(req, Status, next);
        });
    });

    /**
     * 确认订单
     * id  订单id
     */
    api.post('/confirm', function (req, res, next) {
        async.waterfall([
            function (cb) {
                lib_DemandOrder.update({
                    find: {_id: req.body.id},
                    set: {status: global.config_model.order_status.effective, step: 2}
                }, cb);
            },
            function (result, cb) {
                lib_DemandOrder.getOne({
                    find: {_id: req.body.id}
                }, cb);
            }
        ], function (err, result) {
            if (err) return next(err);
            global.lib_msg.push(req, {
                title: '交易订单',
                content: global.config_msg_templates.encodeContent(req.decoded.id === result.user_demand_id ? 'SALE_order' : 'PURCHASE_order', [req.decoded.company_name || '', req.decoded['user_name'], result.amount, result.product_categories[0].layer_1_chn])
            }, {}, '', {
                params: {
                    id: result._id,
                    source: req.decoded.id === result.user_demand_id ? 'sale_transit' : 'buy_transit'
                },
                url: config_common.push_url.order
            }, req.decoded.id === result.user_demand_id ? [result.user_supply_id] : [result.user_demand_id]);
            config_common.sendData(req, {}, next);
        });
    });

    /**  需要改推送模板
     * 推送短信信息
     * type   buy  sell
     * id  订单id
     * user_id  要推送给谁
     * layer_1_chn 订单的产品一级
     */
    api.post('/push', function (req, res, next) {
        global.lib_msg.push(req, {
            title: '交易订单',
            content: global.config_msg_templates.encodeContent('inform_SALE', [req.decoded.company_name || '', req.decoded['user_name'], req.body.amount, req.body.layer_1_chn])
        }, {}, '', {
            params: {id: req.body.id, source: req.body.type},
            url: config_common.push_url.order
        }, [req.body.user_id], '', function (err) {
            if (err) return next('no_reg_ids');
            config_common.sendData(req, {}, next);
        });
    });


    /**
     * 订单结束
     *
     * id  单子id
     */
    api.post('/over', function (req, res, next) {
        // 权限检查--弱
        if (req.decoded.role !== config_common.user_roles.TRADE_ADMIN &&
            req.decoded.role !== config_common.user_roles.TRADE_PURCHASE) {
            return next(config_error.invalid_role);
        }
        async.waterfall([
            function (cb) {
                config_error.checkRole(req.decoded.role, [config_common.user_roles.TRADE_ADMIN, config_common.user_roles.TRADE_SALE, config_common.user_roles.TRADE_PURCHASE], cb);
            },
            function (cb) {
                config_error.checkBody(req.body, ['id'], cb);
            },
            function (cb) {
                lib_DemandOrder.getOne({
                    find: {_id: req.body.id}
                }, cb);
            },
            function (entry, cb) {
                if (!entry) return next(config_error.not_found);
                // 权限检查--强
                if (req.decoded.id !== entry.user_demand_id &&
                    (req.decoded.role === config_common.user_roles.TRADE_ADMIN &&
                    req.decoded.company_id !== entry.company_demand_id)) {
                    return next(config_error.invalid_role);
                }
                entry.status = global.config_model.order_status.complete;
                entry.step = 5;
                entry.time_update_step = new Date();
                lib_DemandOrder.edit(entry, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            global.lib_User.addCompanyDynamic({
                company_id: result.company_demand_id,
                user_id: result.user_demand_id,
                type: config_common.typeCode.trade_order_confirm_purchase,
                data: JSON.stringify(result)
            });
            global.lib_User.addCompanyDynamic({
                company_id: result.company_supply_id,
                user_id: result.user_supply_id,
                type: config_common.typeCode.trade_order_confirm_sale,
                data: JSON.stringify(result)
            });
            var type;
            var other_type;
            if (result.order_origin === global.config_model.order_origin.JJ) {
                type = global.config_model.statistical_type.sale_bidding_order;
                other_type = global.config_model.statistical_type.purchase_offerAgain_order;
            } else if (result.order_origin === global.config_model.order_origin.DJ) {
                type = global.config_model.statistical_type.sale_pricing_order;
                other_type = global.config_model.statistical_type.purchase_pricing_order;
            } else {
                type = global.config_model.statistical_type.sale_demandOffer_order;
                other_type = global.config_model.statistical_type.purchase_demand_order;
            }
            global.lib_Statistical.statistical_server_companyTrade_add(req, {
                companyObj: [{
                    type: type,
                    amount: result.amount,
                    price: result.price,
                    id: result.company_supply_id,
                    material: result.product_categories.material,
                    payment_choice: result.att_payment
                }, {
                    type: other_type,
                    amount: result.amount,
                    price: result.price,
                    id: result.company_demand_id,
                    material: result.product_categories.material,
                    payment_choice: result.att_payment
                }]
            });
            lib_Statistical.add({
                data: {
                    order_id: result._id,
                    type: 'trade',
                    company_supply_id: result.company_supply_id,
                    company_demand_id: result.company_demand_id,
                    company_traffic_id: '',
                    time_final_payment: result.time_update_step
                }
            });
            config_common.sendData(req, result, next);
        });
    });

    return api;
};