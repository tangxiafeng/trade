/**
 * Created by Administrator on 2017/2/27.
 */

var model = require('../dbs/db_base');
model = model('DemandOrder');
var decimal = require('decimal');
var async = require('async');
var _ = require('underscore');

var config_common = global.config_common;
var lib_PriceOffer = require('../libs/lib_PriceOffer');
var lib_Demand = require('../libs/lib_Demand');

exports.add = function (data, callback) {
    model.add(data, callback);
};


exports.getOne = function (data, callback) {
    model.getOne(data, callback);
};

exports.getList = function (data, callback) {
    model.getList(data, callback);
};
exports.update = function (cond, callback) {
    model.update(cond, callback);
};
exports.getListAndCount = function (page, data, callback) {
    async.waterfall([
        function (cb) {
            model.getCount(data.find, cb);
        },
        function (count, cb) {
            model.getList(data, function (err, result) {
                if (err) {
                    return cb(err);
                }
                cb(null, {
                    exist: count > config_common.entry_per_page * page,
                    list: result,
                    count: count
                });
            })
        }
    ], callback);
};

exports.getCount = function (cond, callback) {
    model.getCount(cond, callback);
};

exports.edit = function (data, callback) {
    model.edit(data, callback)
};
exports.del = function (data, callback) {
    model.del(data, callback)
};
exports.getAggregate = function (data, callback) {
    model.group(data, callback);
};
exports.getQueryByType = function (type, id) {
    var data = {};
    if (type === 'PURCHASE') {
        data.user_demand_id = id;
    } else if (type === 'SALE') {
        data.user_supply_id = id;
    } else {
        data['$or'] = [
            {user_supply_id: id},
            {user_demand_id: id}
        ];
    }
    return data;
};
exports.getCompanyQueryByType = function (type, id) {
    var data = {};
    if (type === 'PURCHASE') {
        data.company_demand_id = id;
    } else if (type === 'SALE') {
        data.company_supply_id = id;
    } else {
        data['$or'] = [
            {company_supply_id: id},
            {company_demand_id: id}
        ];
    }
    return data;
};

exports.getUpdateCount = function (req, callback) {
    var query = this.getQueryByType(req.body.type, req.decoded.id);
    query.status = global.config_model.order_status.effective;
    async.waterfall([
        function (cb) {
            global.lib_Relationship.getOne({
                find: {
                    user_id: req.decoded.id,
                    company_id: req.decoded.company_id,
                    type: req.body.relationship_type
                }
            }, cb);
        },
        function (relationship, cb) {
            if (relationship) {
                query.time_creation = {$gte: relationship.update_time};
                cb(null, null);
            } else {
                return cb(null, 0);
            }
        },
        function (length, cb) {
            if (length === 0) {
                cb(null, 0);
            } else {
                model.getCount(query, cb);
            }
        }
    ], function (err, count) {
        if (err) return callback(err);
        callback(null, count);
    });
};

exports.addOrderEnd = function (req, order, list, callback) {
    if (!callback) callback = function () {
    };
    var pushType, pushTemplate, pushContent, pushUser, index, statisticalUser, lib_Model, has_order;
    switch (req.body.type) {
        case 'demand': {
            pushType = 'buy_confirmed';
            pushTemplate = 'demandOffer_order';
            pushUser = [order.user_supply_id];
            statisticalUser = order.user_demand_id;
            has_order = order.user_supply_id;
            lib_Model = lib_Demand;
            pushContent = [req.decoded.company_name||'', order.product_categories[0].layer_1_chn];
            index = 'demand_id';
            break;
        }
        case 'bidding': {
            pushType = 'sale_transit';
            pushTemplate = 'JJ_order';
            pushUser = [order.user_demand_id];
            statisticalUser = order.user_supply_id;
            has_order = order.user_demand_id;
            lib_Model = lib_PriceOffer;
            pushContent = [req.decoded.company_name||'', order.product_categories[0].layer_1_chn];
            index = 'offer_id';
            break;
        }
        case 'pricing': {
            pushType = 'sale_confirmed';
            pushTemplate = 'shop_order';
            pushUser = [order.user_supply_id];
            statisticalUser = order.user_supply_id;
            has_order = order.user_demand_id;
            lib_Model = lib_PriceOffer;
            pushContent = [req.decoded.company_name||'', req.decoded.user_name, order.amount, order.product_categories[0].layer_1_chn];
            index = 'offer_id';
            break;
        }
    }
    global.lib_msg.push(req, {
        title: '交易订单',
        content: global.config_msg_templates.encodeContent(pushTemplate, pushContent)
    }, {}, '', {
        params: {id: order._id, source: pushType},
        url: config_common.push_url.order
    }, pushUser);
    global.lib_Statistical.statistical_server_companyTrade_add(req, {
        companyObj: [{
            id: req.decoded.company_id,
            type: req.body.type + '_order',
            user_id: _.isArray(statisticalUser) ? statisticalUser[0] : statisticalUser
        }]
    });
    lib_Model.update({
        find: {_id: {$in: _.pluck(list, index)}},
        set: {
            $inc: {amount_remain: order.amount},
            $addToSet: {has_order: _.isArray(has_order) ? has_order[0] : has_order}
        }
    }, callback);
};

exports.assign = function (product_categories, assign, fun) {
    var newArr = [];
    if (!assign || !_.isArray(assign)) return false;
    product_categories.forEach(function (obj) {
        assign.forEach(function (assign) {
            var num = 0;
            for (var i = 0; i < _.keys(obj).length; i++) {
                var index = _.keys(obj)[i];
                if (obj[index] !== '' && (new RegExp(obj[index])).test(assign.key) && index !== 'material' && index.split('_').length === 2 && index.split('_')[0] === 'layer') num++;
            }
            var count = _.compact(assign.key.split('-')).length;
            if (_.compact(assign.key.split('-')).length === 4) count = 3;
            if (num === count) {
                obj.product_name.forEach(function (productObj) {
                    if (productObj.name) {
                        if ((new RegExp(productObj.name).test(assign.key))) productObj['number_remain'] = fun(productObj['number_remain'], assign.count);
                    } else {
                        productObj['number_remain'] = fun(productObj['number_remain'], assign.count);
                    }
                    if (productObj['number_remain'] < 0) return false;
                });
            }
        });
        newArr.push(obj);
    });
    return newArr;
};