/**
 * Created by Administrator on 2017/2/13.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pushSchema = new Schema({
    user_id: {type: String, required: true},                  // 表单发起者的用户ID。
    offer_id: {type: Array, default: []},                     // 推送报价id
    demand_id: {type: Array, default: []}                     // 推送需求单id
});

module.exports = mongoose.model('push', pushSchema);