/**
 * Created by Administrator on 2017/2/13.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pushSchema = new Schema({
    type: {type: String, required: true},                     // 类型。

    user_id: {type: String, required: true},                  // 表单发起者的用户ID。
    material_chn: {type: String, default: ''},                // 产品大类
    layer_1_chn: {type: Array, default: []},                  // 产品名称
    layer_2_chn: {type: Array, default: []},                  // 产品名称
    content: {type: Schema.Types.Mixed, default: []},         // 内容{area:1,FOB:1,CIF:1,update_FOB,update_CIF}
    time_creation: {
        type: Date, default: function () {
            return new Date();
        }
    }
});

module.exports = mongoose.model('Log', pushSchema);