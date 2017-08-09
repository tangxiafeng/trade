/**
 * Created by tangxiafeng on 17/6/15.
 */
var model = require('../dbs/db_base');
model = model('PriceOfferProducts');
var async = require('async');

exports.add = function (data, callback) {
    model.add(data, callback);
};
exports.addList = function (data, callback) {
    model.addList(data, callback);
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
exports.del = function (cond, callback) {
    model.del(cond, callback);
};
