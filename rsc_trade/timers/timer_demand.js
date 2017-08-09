/**
 * Created by tangxiafeng on 17/4/15.
 */
var scheduler = require('node-schedule');
var async = require('async');
var _ = require('underscore');

var config_model = require('../configs/config_model');

var lib_Demand = require('../libs/lib_Demand');

exports.timer = function () {
    // 每小时一次
    var schedule_rule = new scheduler.RecurrenceRule();
    schedule_rule.minute = 0;
    scheduler.scheduleJob(schedule_rule, function () {

    });
    // 每10分进行一次
    var schedule_rule_10 = new scheduler.RecurrenceRule();
    schedule_rule_10.minute = [0, 10, 20, 30, 40, 50];
    scheduler.scheduleJob(schedule_rule_10, function () {
        demandDenyGeneration();
    });

    // 每天10点一次
    var hours_10 = new scheduler.RecurrenceRule();
    hours_10.minute = 55;
    hours_10.hour = 9;
    scheduler.scheduleJob(hours_10, function () {
        push();
    });
};


// 修改采购单状态
var demandDenyGeneration = function () {
    var today = new Date();
    async.waterfall([
        function (cb) {
            lib_Demand.update({
                find: {time_validity: {'$lt': today}},
                set: {status: config_model.demand_status.expired}
            }, cb);
        }
    ], function (err) {
        if (err) {
            console.log('Demand Can_Generate Update ERROR at ' + new Date().toString());
        }
        else {
            console.log('Demand Can_Generate Update SUCCESS at ' + new Date().toString());
        }
    });
};

var push = function () {
    async.waterfall([
        function (cb) {
            global.lib_User.getUserList({find: {}}, cb);
        },
        function (list, cb) {
            var arr = [];
            async.eachSeries(list, function (user, cbk) {
                var offer;
                async.waterfall([
                    function (callback) {
                        global.lib_User.getWorkRelationListAll({body: {user_id: user._id.toString()}}, global.config_model.company_type.SALE, callback);
                    },
                    function (result, callback) {
                        lib_Demand.getOne({
                            find: {
                                '$or': [{'product_categories.material': {$in: user['sell']}}, {'product_categories.material_chn': {$in: user['sell']}}],
                                user_id: {$nin: result},
                                status: config_model.offer_status.published
                            }
                        }, callback);
                    },
                    function (result, callback) {
                        if (!result) {
                            callback(null, null);
                        } else {
                            offer = result;
                            global.lib_push.update({
                                find: {user_id: user._id.toString()},
                                set: {$addToSet: {demand_id: result._id.toString()}}
                            }, callback);
                        }
                    },
                    function (result, callback) {
                        if (result && result.n === 0) {
                            arr.push({
                                demand_id: offer._id.toString(),
                                user_id: user._id
                            });
                        }
                        callback();
                    }
                ], cbk);
            }, function () {
                global.lib_push.addList(arr, cb);
            });
        }
    ], function (err) {
        if (err) {
            console.log('push  Demand ERROR at ' + new Date().toString());
        }
        else {
            console.log('push  Demand SUCCESS at ' + new Date().toString());
        }
    });
};
exports.demandDenyGeneration = demandDenyGeneration;

