/**
 * Created by tangxiafeng on 17/6/19.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductConfigSchema = new Schema({
    name: {type: String, required: true},                        // 名称
    unit: {type: String, default: ''},                           // 单位
    status: {type: String, required: true},                      // 类型
    PID: {type: Array, required: true},                          // 父节点
    vary: {type: String, default: ''},                           // 增长值
    calculate: {type: Boolean, default: false}                   // 增长值
});

module.exports = mongoose.model('ProductConfig', ProductConfigSchema);

