/**
 * Created by tangxiafeng on 17/4/15.
 */
var scheduler = require('node-schedule');
var async = require('async');
var _ = require('underscore');

var config_model = global.config_model;

var lib_PriceOffer = global.lib_PriceOffer;
var lib_PriceOfferProducts = global.lib_PriceOfferProducts;
exports.timer = function () {
    // 每20分进行一次
    var schedule_rule_20 = new scheduler.RecurrenceRule();
    schedule_rule_20.minute = [0, 20, 40];
    scheduler.scheduleJob(schedule_rule_20, function () {
        update_status();
    });
    // 每20分进行一次
    var schedule_rule_0 = new scheduler.RecurrenceRule();
    schedule_rule_0.minute = [10, 30, 50];
    scheduler.scheduleJob(schedule_rule_0, function () {
        update_status();
    });
    // 每天10点一次
    var hours_10 = new scheduler.RecurrenceRule();
    hours_10.minute = 50;
    hours_10.hour = 9;
    scheduler.scheduleJob(hours_10, function () {
        push();
    });
};


var update_status = function () {
    var date = new Date();
    lib_PriceOffer.update({
        find: {type: {$in: ['JJ', 'DjJJ']}, time_validity: {$lt: new Date(date.getTime() + 60 * 60 * 10)}},
        set: {status: config_model.offer_status.expired}
    }, function (err) {
        if (err) {
            console.log('update expired offer ERROR at ' + new Date().toString());
        }
        else {
            console.log('update expired offer SUCCESS at ' + new Date().toString());
        }
    })
};

var push = function () {
    async.waterfall([
        function (cb) {
            global.lib_User.getUserList({find: {}}, cb);
        },
        function (list, cb) {
            var arr = [];
            async.eachSeries(list, function (user, cbk) {
                var offer, userArr;
                async.waterfall([
                    function (callback) {
                        global.lib_User.getWorkRelationListAll({body: {user_id: user._id.toString()}}, global.config_model.company_type.PURCHASE, callback);
                    },
                    function (result, cb) {
                        userArr = result;
                        lib_PriceOfferProducts.getList({
                            find: {$or: [{material: {$in: user['buy']}}, {material_chn: {$in: user['buy']}}]}
                        }, cb);
                    },
                    function (result, callback) {
                        lib_PriceOffer.getOne({
                            find: {
                                _id: {$in: _.pluck(result, 'offer_id')},
                                user_id: {$nin: userArr},
                                status: config_model.offer_status.published
                            }
                        }, callback);
                    },
                    function (result, callback) {
                        offer = result;
                        if (!result) {
                            callback(null, null);
                        } else {
                            global.lib_push.update({
                                find: {user_id: user._id.toString()},
                                set: {$addToSet: {offer_id: result._id.toString()}}
                            }, callback);
                        }
                    },
                    function (result, callback) {
                        if (result && result.n === 0) {
                            arr.push({
                                offer_id: offer._id.toString(),
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
            console.log('push  Offer ERROR at ' + new Date().toString());
        }
        else {
            console.log('push  Offer SUCCESS at ' + new Date().toString());
        }
    });
};



