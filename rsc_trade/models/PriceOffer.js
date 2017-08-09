/**
 * Created by Haoran Z on 2016/5/18 0018.
 * 主动报价单
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PriceOfferSchema = new Schema({
    ownType: {type: String, default: 'offer'},                                  // 自己。

    admin_id: {type: String, default: ""},                                      // 表单发起者的用户ID。
    user_id: {type: String, required: true},                                    // 表单发起者的用户ID。
    company_id: {type: String, default: ""},                                    // 表单发起者所属公司的ID。
    company_name: {type: String, default: ""},                                  // 发起公司的名称

    att_quality: {type: String, required: true},                                // 质检归属
    att_payment: {type: String, required: true},                                // 付款类型（现金，银行兑票，商业兑票）
    att_traffic: {type: String, required: true},                                // 物流细则
    att_settlement: {type: String, required: true},                             // 付款方式
    path_loss: {type: Schema.Types.Mixed, default: {}},                         // 路耗

    //金额区间
    FOB: {type: Schema.Types.Mixed, default: {}},                               // FOB区间
    CIF: {type: Schema.Types.Mixed, default: {}},                               // CIF区间
    amount: {type: Number, default: 0},                                         // 竞价吨数
    amount_remain: {type: Number, default: 0},                                  // 下单了多少吨

    //其他参数
    location_storage: {type: String, default: ""},                              // 提货地址
    quality_img: {type: String, default: ""},                                   // 质检图片
    status: {type: String, default: "expired"},                                 // 状态
    type: {type: String, default: ""},                                          // 定价或者竞价分类
    role: {type: String, default: ""},                                          // 发单人角色
    appendix: {type: String, default: ""},                                      // 备注

    list_offer: {type: Array, default: []},                                     // 已抢单表单
    count_offer: {type: Number, default: 0},                                    // 已抢单个数
    browse_offer: {type: Array, default: []},                                   // 浏览用户id数组
    has_order: {type: Array, default: []},                                      // 已下单用户

    //付款方式对应
    delay_day: {type: Number, default: 0},                                      // 最终支付可延期天数
    delay_type: {type: String, default: ""},                                    // 延期计算标准（确认订单时、货到后）
    percent_advance: {type: Number, default: 0},                                // 分期付款时首款百分比

    //时间相关
    time_validity: Date,                                                        // 失效时间
    time_creation: {
        type: Date, required: true, default: function () {
            return new Date();
        }
    },                                                                         // 单据发布时间
    time_update: {
        type: Date, required: true, default: function () {
            return new Date();
        }
    },                                                                         // 单据修改时间
    time_update_quality_img: {
        type: Date, required: true, default: function () {
            return new Date();
        }
    },                                                                         // 质检图片更新时间
    time_update_price: {type: Date},                                           // 调价时间  调过价才有
    time_preferential: {type: Date}                                            // 优惠价格  同上

});

module.exports = mongoose.model('PriceOffer', PriceOfferSchema);