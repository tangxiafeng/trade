/**
 * Created by tangxiafeng on 17/6/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PriceOfferProducesSchema = new Schema({
    offer_id: {type: String, required: true},       // 报价id
    material: {type: String, required: true},       // 行业大类
    material_chn: {type: String, required: true},   // 行业大类
    unit: {type: String, required: true},           // 单位
    pass_unit: {type: String, required: true},   // 运输单位
    layer_1: {type: String, required: true},        // 行业第1类
    layer_1_chn: {type: String, required: true},    // 行业第1类中文
    layer_2: {type: String, default: ''},           // 行业第2类
    layer_2_chn: {type: String, default: ''},       // 行业第2类中文
    layer_3: {type: String, default: ''},           // 行业第3类
    layer_3_chn: {type: String, default: ''},       // 行业第3类中文
    layer_4: {type: String, default: ''},           // 行业第4类
    layer_4_chn: {type: String, default: ''},       // 行业第4类中文
    product_name: {type: Array, default: ''},       // 产品名称
    attribute: {type: Schema.Types.Mixed},          // 属性
    replenish: {type: Boolean, default: false},     // 是否允许补货
    path_loss: {type: Boolean, default: false},     // 是够计算路耗
    modify_amount: {type: Boolean, default: false}  // 指派物流时是否允许修改吨数
});

module.exports = mongoose.model('PriceOfferProduces', PriceOfferProducesSchema);