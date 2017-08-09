/**
 * Created by tangxiafeng on 17/6/19.
 */
var model = require('../dbs/db_base');
model = model('ProductClassify');
var _ = require('underscore');
var async = require('async');
var lib_PriceOfferProducts = require('../libs/lib_PriceOfferProducts');
var lib_ProductConfig = require('../libs/lib_ProductConfig');
exports.add = function (data, callback) {
    model.add(data, callback);
};

exports.getOne = function (data, callback) {
    model.getOne(data, callback);
};

exports.getList = function (data, callback) {
    model.getList(data, callback);
};

exports.getCount = function (data, callback) {
    model.getCount(data, callback);
};

exports.update = function (cond, callback) {
    model.update(cond, callback);
};

var checkObj = {
    unit: 1,
    material: 1
};

var checkCategory = {
    material: 1
};

/**
 * 检验产品分类是否正确并存储   自动填补中文部分
 * @param data       [{},{}]
 * @param entry_id   单子的id
 * @param callback
 */
exports.checkProduct = function (data, entry_id, callback) {
    var obj = {};
    var list = [];
    for (var index in checkObj) {
        if (checkObj.hasOwnProperty(index)) if (_.uniq(_.values(_.pluck(_.clone(data), index))).length !== 1) {
            return callback(global.config_error.invalid_format + ':' + index);
        }
    }
    var PID = [];
    async.eachSeries(data, function (dataObj, cbk) {
        obj = {};
        if (dataObj._id) delete dataObj._id;
        async.eachSeries(_.allKeys(dataObj), function (index, cb) {
            if ((index.split('_').length === 2 && index.split('_')[0] === 'layer' || checkCategory[index])) {
                model.getOne({
                    find: {eng: dataObj[index]}
                }, function (err, result) {
                    if (err) return cb(err);
                    if (result) {
                        obj[index + '_chn'] = result['chn'];
                        PID.push(result._id.toString());
                    }
                    cb();
                });
            } else {
                cb();
            }
        }, function (err) {
            if (err) return cbk(err);
            async.waterfall([
                function (cback) {
                    async.parallel({
                        replenish: function (cb) {
                            lib_ProductConfig.getCount({
                                name: '补货',
                                PID: {$in: PID},
                                status: 'other'
                            }, cb);
                        },
                        modify_amount: function (cb) {
                            lib_ProductConfig.getCount({
                                name: '补货吨数',
                                PID: {$in: PID},
                                status: 'other'
                            }, cb);
                        }
                    }, cback);
                },
                function (result, cback) {
                    result.replenish = !!result.replenish;
                    result.modify_amount = !!result.modify_amount;
                    list.push(_.extend(obj, dataObj, {offer_id: entry_id}, result));
                    cback();
                }
            ], cbk);
        });
    }, function (err) {
        if (err) return callback(err);
        callback(null, list);
    });

};