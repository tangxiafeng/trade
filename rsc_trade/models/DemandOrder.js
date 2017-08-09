/**
 * Created by ZHR on 2015/11/25 0025.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DemandOrderSchema = new Schema({
    demandOffer_id: {type: String, default: ""},                                // 抢单的报价id
    offerAgain_id: {type: String, default: ""},                                 // 报价的抢单id
    offer_id: {type: Array, default: []},                                       // 采购计划id数组

    index: {type: String, required: true, index: {unique: true}},               // 订单号
    user_demand_id: {type: String, required: true},                             // 买方user_id
    user_supply_id: {type: Array, required: true},                              // 报价方用户id
    company_demand_id: {type: String, default: ""},                             // 买方公司id
    company_demand_name: {type: String, default: ""},                           // 买方公司名称
    company_supply_name: {type: String, default: ""},                           // 报价方公司名称
    company_supply_id: {type: String, default: ""},                             // 报价方公司id

    order_origin: {type: String, required: true},                               // 订单是来自需求抢单还是来自于实时报价
    payment_style: {type: String, required: true},                              // 报价类型

    product_categories: {type: Schema.Types.Mixed, required: true},             // 产品分类

    att_quality: {type: Array, required: true},                                 // 质检归属
    att_payment: {type: Array, required: true},                                 // 付款类型（现金，银行兑票，商业兑票）
    att_traffic: {type: Array, required: true},                                 // 物流细则
    att_settlement: {type: Array, required: true},                              // 付款方式
    path_loss: {type: [Schema.Types.Mixed], default: {}},                       // 路耗

    amount: {type: Number, required: true},                                     // 采购的吨数--来自抢单
    amount_been_demand: {type: Number, default: 0},                             // 已发三方需求单物流的吨数
    price: {type: Number, required: true},                                      // 货物总价 -- 单价乘以采购重量获得
    preferential: {type: Number, default: 0},                                   // 优惠价格
    price_replenish: {type: Number, default: 0},                                // 补货价格


    step: {type: Number, default: 1},                                           // 订单现在所属步骤
    status: {type: String, default: 'effective'},                               // 状态
    replenish: [Schema.Types.Mixed],                                            // 可补货内容
    replenishCar: [Schema.Types.Mixed],                                         // 司机补货内容
    appendix: {type: String, default: ""},                                      // 备注

    browse_offer: {type: Array, default: []},                                   // 浏览用户id数组

    delay_day: {type: Array, default: 0},                                       // 最终支付可延期天数
    delay_type: {type: Array, default: ""},                                     // 延期计算标准（确认订单时、货到后）
    percent_advance: {type: Array, default: 0},                                 // 分期付款时首款百分比


    time_depart_end: Date,                                                      // 取消时间 生成12小时后
    time_creation: {
        type: Date, required: true, default: function () {
            return new Date();
        }
    },                                                                          // 单据发布时间
    time_update_step: {
        type: Date, required: true, default: function () {
            return new Date();
        }
    },                                                                          // 跳转步骤时的日期

    //提货地址
    send_province: {type: String, default: ""},                                 // 省
    send_city: {type: String, default: ""},                                     // 市
    send_district: {type: String, default: ""},                                 // 区
    send_addr: {type: String, default: ""},                                     // 详细
    send_name: {type: String, default: ""},                                     // 详细
    send_phone: {type: String, default: ""},                                    // 详细
    send_location: {type: Array, default: [0, 0]},                              // 经纬度

    //交货地址
    receive_province: {type: String, default: ""},                              // 省
    receive_city: {type: String, default: ""},                                  // 市
    receive_district: {type: String, default: ""},                              // 区
    receive_addr: {type: String, default: ""},                                  // 详细
    receive_name: {type: String, default: ""},                                  // 详细
    receive_phone: {type: String, default: ""},                                 // 详细
    receive_location: {type: Array, default: [0, 0]}                            // 经纬度
});


module.exports = mongoose.model('DemandOrder', DemandOrderSchema);