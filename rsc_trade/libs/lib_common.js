/**
 * Created by tangxiafeng on 17/5/19.
 */
var async = require('async');
var _ = require('underscore');

var config_error = global.config_error;
var lib_User = require('../libs/lib_User');
var lib_push = require('../libs/lib_push');
var util = require('../libs/util');

var paramObj = {
    _id: 1,
    id: 1,
    change_remain: 1,
    quality_img: 1
};
exports.edit = function (req, libModel, callback) {
    async.waterfall([
        function (cb) {
            config_error.checkBody(req.body, ['id'].concat(_.allKeys(req.body)), cb);
        },
        function (cb) {
            libModel.getOne({
                find: {_id: req.body.id}
            }, cb);
        },
        function (entry, cb) {
            if (!entry) return cb(config_error.invalid_id);
            for (var index in req.body) {
                if (req.body.hasOwnProperty(index) && _.allKeys(entry).indexOf(index) >= 0 && !paramObj[index]) {
                    entry[index] = req.body[index];
                }
            }
            if (entry.change_remain || entry.change_remain === 0) {
                if (entry.change_remain === 0) {
                    return cb(config_error.no_number);
                }
                entry.change_remain = entry.change_remain - 1;
            }
            if (req.body.quality_img) {
                entry.time_update_quality_img = new Date();
                entry.quality_img = req.body.quality_img;
                var original_file = entry.quality_img.split('/').pop();
                if (original_file !== undefined && original_file !== '') {
                    global.middleware.deleteImgFromAliyun(original_file);
                }
            }
            libModel.edit(entry, function (err, obj) {
                if (err) return cb(err);
                cb(null, obj._id);
            });
        }
    ], callback);
};
exports.detail = function (req, libModel, callback) {
    var entry;
    async.waterfall([
        function (cb) {
            config_error.checkBody(req.body, ['id'], cb);
        },
        function (cb) {
            libModel.getOne({
                find: {
                    $or: [
                        {_id: req.body.id},
                        {user_demand_id: req.decoded.id, offer_id: req.body.id}
                    ]
                }
            }, cb);
        },
        function (result, cb) {
            entry = result;
            libModel.update({
                find: {
                    $or: [
                        {_id: req.body.id},
                        {user_demand_id: req.decoded.id, offer_id: req.body.id}
                    ]
                },
                set: req.decoded.id === result.user_id ? {} : {$addToSet: {browse_offer:  req.decoded.id}}
            }, cb);
        }
    ], function (err) {
        if (err) return callback(err);
        global.lib_Statistical.statistical_server_companyTrade_add(req, {
            companyObj: _.reduce(_.keys(entry), function (list, param) {
                if ((new RegExp('id')).test(param) && (new RegExp('company')).test(param)) {
                    list.push({
                        id: entry[param],
                        type: entry.ownType + '_browse',
                        user_id: req.decoded.id
                    });
                }
                return list;
            }, [])
        });
        callback(null, entry);
    });
};
exports.del = function (req, libModel, callback) {
    async.waterfall([
        function (cb) {
            config_error.checkBody(req.body, ['ids'], cb);
        },
        function (cb) {
            if (_.isArray(libModel)) {
                var query = {
                    $or: [{
                        offer_id: {$in: req.body.ids},
                        user_demand_id: req.decoded.id
                    }, {
                        demand_id: {$in: req.body.ids},
                        user_supply_id: req.decoded.id
                    }, {
                        _id: {$in: req.body.ids}
                    }]
                };
                async.waterfall([
                    function (cback) {
                        libModel[1].update({
                            find: query,
                            set: {$inc: {count_offer: -1}, $pull: {list_offer: req.decoded.id}}
                        }, cback);
                    },
                    function (entry, cback) {
                        libModel[0].del(query, cback);
                    }
                ], cb);
            } else {
                libModel.del({_id: req.body.ids}, cb);
            }
        }
    ], callback);
};
var addUserAndCompany = function (req, result, callback, type, userParam, companyParam) {
    var query = {};
    var cond = {};
    if ((result.list.length > 0 && result.list[0].user_demand_id && result.list[0].user_demand_id !== req.decoded.id && type === 'supply') ||
        (result.list.length > 0 && result.list[0].user_supply_id && result.list[0].user_supply_id !== req.decoded.id && type === 'demand')) {
        query._id = req.decoded.id;
        if (req.decoded.company_id) {
            cond._id = req.decoded.company_id;
        }
    } else {
        query._id = {$in: _.pluck(result.list, userParam || 'user_id')};
        cond._id = {$in: _.compact(_.pluck(result.list, companyParam || 'company_id'))};
    }
    async.waterfall([
        function (cb) {
            lib_User.getUserList({
                find: query
            }, cb);
        },
        function (userArr, cb) {
            result.list = util.addUser(result.list, userArr, userParam || 'user_id');
            lib_User.getCompanyList({
                find: cond
            }, cb);
        },
        function (companyArr, cb) {
            result.list = util.getObjArr(util.addCompanyVIP(result.list, companyArr, companyParam || 'company_id'), '_id');
            cb(null, result);
        }
    ], callback);
};
exports.addUserAndCompany = addUserAndCompany;
exports.get_change_remain = function (req, libModel, callback) {
    async.waterfall([
        function (cb) {
            config_error.checkBody(req.body, ['id'], cb);
        },
        function (cb) {
            libModel.getOne({
                find: {
                    $or: [{
                        demand_id: req.body.id,
                        user_supply_id: req.decoded.id
                    }, {
                        offer_id: req.body.id,
                        user_supply_id: req.decoded.id
                    }]
                }
            }, cb);
        },
        function (entry, cb) {
            cb(null, entry);
        }
    ], callback);
};
exports.circle_of_friends = function (req, libModel, fun, callback, type, isReq) {
    var page_num = req.body.page || 1;
    async.waterfall([
        function (cb) {
            lib_User.get_trade_circle({
                user_id: req.decoded.id,
                type: type
            }, cb);
        },
        function (result, cb) {
            var query = {
                find: {
                    user_id: {$in: result},
                    status: global.config_model.offer_status.published
                },
                skip: global.config_common.entry_per_page * (page_num - 1),
                limit: global.config_common.entry_per_page,
                sort: {time_creation: -1}
            };
            if (isReq) {
                libModel.getListAndCount(req, page_num, query, cb);
            } else {
                libModel.getListAndCount(page_num, query, cb);
            }
        },
        function (result, cb) {
            fun(result, cb);
        },
        function (result, cb) {
            addUserAndCompany(req, result, cb);
        }
    ], callback);
};
exports.get_push = function (req, libModel, param, fun, callback, isReq) {
    var page_num = req.body.page || 1;
    async.waterfall([
        function (cb) {
            lib_push.getOne({
                find: {user_id: req.decoded.id}
            }, cb);
        },
        function (result, cb) {
            if (!result) return cb(global.config_error.invalid_format.not_found);
            var query = {
                find: {_id: result[param], status: global.config_model.offer_status.published},
                skip: global.config_common.entry_per_page * (page_num - 1),
                limit: global.config_common.entry_per_page,
                sort: {time_creation: -1}
            };
            if (isReq) {
                libModel.getListAndCount(req, page_num, query, cb);
            } else {
                libModel.getListAndCount(page_num, query, cb);
            }
        },
        function (result, cb) {
            fun(result, cb);
        },
        function (result, cb) {
            addUserAndCompany(req, result, cb);
        }
    ], callback);
};
