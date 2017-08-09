/**
 * Created by tangxiafeng on 17/6/20.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductClassifySchema = new Schema({
    PID: {type: String, required: true},                       // 父节点
    chn: {type: String, required: true},                       // 中文
    eng: {type: String, required: true},                       // 英文
    lev: {type: Number, default: 0}                            // 层级数
});

module.exports = mongoose.model('ProductClassify', ProductClassifySchema);

