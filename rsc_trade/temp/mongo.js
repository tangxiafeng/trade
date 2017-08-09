var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');
var async = require('async');
var config_server = require('../configs/config_server')
var Schema = mongoose.Schema;


var OrderClassifySchema = new Schema({
    name: {type: String, required: true},                        // 名称
    unit: {type: String, default: ''},                           // 单位
    status: {type: String, required: true},                      // 类型
    PID: {type: Array, required: true},                          // 父节点
    vary: {type: String, default: ''},                           // 增长值
    calculate: {type: Boolean, default: false}

});
mongoose.Promise = global.Promise;
var db_conn_trade = mongoose.createConnection('mongodb://rscdba:a11111@60.205.146.196:27033/rsc_trade');
var db_conn = mongoose.createConnection('mongodb://192.168.3.248:27017/rsc_trade');

var ceshi = db_conn_trade.model('ProductConfig', OrderClassifySchema);
var bendi = db_conn.model('ProductConfig', OrderClassifySchema);


async.waterfall([
    function (cb) {
        bendi.find({}, cb);
    },
    function (result, cb) {
        ceshi.create(result, cb);
    }
], function (err, result) {
    console.log(result.length);
})


// async.waterfall([
//     function (cb) {
//         bendi.find({}, cb);
//     },
//     function (result, cb) {
//         ceshi.create(result, cb);
//     }
// ], function (err, result) {
//     console.log(err, result.length);
// })
