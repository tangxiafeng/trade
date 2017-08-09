/**
 * Created by Administrator on 2016/12/13.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shopSchema = new Schema({
    order_id: {type: String, default: ''},                                      // 生成的订单
    offer_id: {type: String, required: true},                                   // 主动报价单ID
    user_demand_id: {type: String, required: true},                             // 买方user_id
    user_supply_id: {type: String, required: true},                             // 报价方用户id
    company_demand_id: {type: String, default: ""},                             // 买方公司id
    company_demand_name: {type: String, default: ""},                           // 买方公司名称
    company_supply_name: {type: String, default: ""},                           // 报价方公司名称
    company_supply_id: {type: String, default: ""},                             // 报价方公司id

    payment_style: {type: String, required: true},                              // 报价类型

    product_categories: {type: Schema.Types.Mixed, required: true},             // 产品相关

    att_quality: {type: String, required: true},                                // 质检归属
    att_payment: {type: String, required: true},                                // 付款类型（现金，银行兑票，商业兑票）
    att_traffic: {type: String, required: true},                                // 物流细则
    att_settlement: {type: String, required: true},                             // 付款方式
    path_loss: {type: Schema.Types.Mixed, default: {}},                         // 路耗

    price: {type: Number, required: true},                                      // 价格
    amount: {type: Number, required: true},                                                             // 吨数

    location_storage: {type: String, required: true},                           // 地址

    delay_day: {type: Number, default: 0},                                      // 最终支付可延期天数
    delay_type: {type: String, default: ""},                                    // 延期计算标准（确认订单时、货到后）
    percent_advance: {type: Number, default: 0},                                // 分期付款时首款百分比

    time_creation: {
        type: Date, default: function () {
            return new Date();
        }
    }                                                                           // 单据发布时间
});

module.exports = mongoose.model('shop', shopSchema);