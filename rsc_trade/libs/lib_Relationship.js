/**
 * Created by Administrator on 2017/3/15.
 */
var model = require('../dbs/db_base');
model = model('Relationship');

var async = require('async');
var config_model = global.config_model;
/**
 * 报价查询自己与某公司的列表更新时间
 * @param req
 * @param query
 * @param callback
 * @param isRemain
 */
exports.offerCheck = function (req, query, callback, isRemain) {
    async.waterfall([
        function (cb) {
            model.getOne({
                find: {
                    user_id: req.decoded.id,
                    company_id: req.body.company_id,
                    type: config_model.relationship_type.trade_offer
                }
            }, cb);
        },
        function (relationship, cb) {
            if (relationship) {
                if (req.body.update) {
                    relationship.update_time = new Date();
                    model.edit(relationship, cb);
                } else if (isRemain) {
                    query.time_update = {$gte: relationship.update_time};
                    cb();
                } else {
                    query.time_update = {$lte: relationship.update_time};
                    cb();
                }
            } else {
                model.add({
                    user_id: req.decoded.id,
                    company_id: req.body.company_id,
                    update_time: new Date(),
                    type: config_model.relationship_type.trade_offer
                }, cb);
            }
        }
    ], function (err) {
        if (err) return callback(err);
        callback();
    });
};
exports.relationCheck = function (req, data, query, callback) {
    async.waterfall([
        function (cb) {
            model.getOne({
                find: {
                    user_id: req.decoded.id,
                    company_id: req.body.company_id,
                    type: data.type
                }
            }, cb);
        },
        function (relationship, cb) {
            if (relationship) {
                query[data.param] = {$gte: relationship.update_time};
                cb(null, null);
            } else {
                cb(null, 0);
            }
        }
    ], callback);
};

/**
 * 抢单查询自己与某公司的列表更新时间
 * @param req
 * @param query
 * @param callback
 * @param isRemain
 */
exports.demandCheck = function (req, query, callback, isRemain) {
    async.waterfall([
        function (cb) {
            model.getOne({
                find: {
                    user_id: req.decoded.id,
                    company_id: req.body.company_id,
                    type: config_model.relationship_type.trade_demand
                }
            }, cb);
        },
        function (relationship, cb) {
            if (relationship) {
                if (req.body.update) {
                    relationship.update_time = new Date();
                    model.edit(relationship, cb);
                } else if (isRemain) {
                    query.time_creation = {$gte: relationship.update_time};
                    cb();
                } else {
                    query.time_creation = {$lte: relationship.update_time};
                    cb();
                }
            } else {
                model.add({
                    user_id: req.decoded.id,
                    company_id: req.body.company_id,
                    update_time: new Date(),
                    type: config_model.relationship_type.trade_demand
                }, cb);
            }
        }
    ], function (err) {
        if (err) return callback(err);
        callback();
    });
};

/**
 * 订单查询自己与某公司的列表更新时间
 * @param req
 * @param query
 * @param callback
 * @param isRemain
 */
exports.orderCheck = function (req, query, callback, isRemain) {
    if (req.body.status !== global.config_model.order_status.effective&&!isRemain) return callback();
    async.waterfall([
        function (cb) {
            model.getOne({
                find: {
                    user_id: req.decoded.id,
                    company_id: req.decoded.company_id,
                    type: req.body.relationship_type
                }
            }, cb);
        },
        function (relationship, cb) {
            if (relationship) {
                if (req.body.update) {
                    relationship.update_time = new Date();
                    model.edit(relationship, cb);
                } else if (isRemain) {
                    query.time_update_step = {$gte: relationship.update_time};
                    cb();
                } else {
                    query.time_creation = {$lte: relationship.update_time};
                    cb();
                }
            } else {
                model.add({
                    user_id: req.decoded.id,
                    company_id: req.decoded.company_id,
                    update_time: new Date(),
                    type: req.body.relationship_type
                }, cb);
            }
        }
    ], function (err) {
        if (err) return callback(err);
        callback();
    });
};

/**
 * 订单查询自己与某公司的列表更新时间
 * @param req
 * @param query
 * @param callback
 */
exports.planCheck = function (req, query, callback) {
    if (!callback) {
        callback = function () {
        };
        query = {};
        req.body.update = true;
    }
    async.waterfall([
        function (cb) {
            model.getOne({
                find: {
                    user_id: req.decoded.id,
                    type: config_model.relationship_type.plan
                }
            }, cb);
        },
        function (relationship, cb) {
            if (relationship) {
                if (req.body.update) {
                    relationship.update_time = new Date();
                    model.edit(relationship, cb);
                } else {
                    query.time_creation = {$gte: relationship.update_time};
                    cb();
                }
            } else {
                model.add({
                    user_id: req.decoded.id,
                    update_time: new Date(),
                    type: config_model.relationship_type.plan
                }, cb);
            }
        }
    ], function (err) {
        if (err) return callback(err);
        callback();
    });
};


exports.getOne = function (data, callback) {
    model.getOne(data, callback);
};