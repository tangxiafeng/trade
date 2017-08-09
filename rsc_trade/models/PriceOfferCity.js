/**
 * Created by tangxiafeng on 17/4/19.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var priceOfferCitSchema = new Schema(
    {
        user_id: {type: String, required: true},                                    // 表单发起者的用户ID。
        offer_id: {type: String, required: true},                                   // offer_id。
        type: {type: String, required: true},                                       // 定价或者竞价
        preferential_FOB: {type: Array, default: []},                               // 出厂价优惠
        preferential_CIF: {type: Array, default: []},                               // 到岸价优惠
        CIF: {type: Number},                                                        // 到岸价价格
        FOB: {type: Number},                                                        // 出厂价价格
        update_FOB: {type: Number, default: null},                                  // 出厂价最近一次调价额度
        update_CIF: {type: Number, default: null},                                  // 到岸价最近一次调价额度
        min: {type: Number, default: 0},                                            // JJ最大值
        max: {type: Number, default: 0},                                            // JJ最小值
        price: {type: Number, default: 0},                                          // JJ定价
        province: {type: String, default: ''},                                      // 省
        city: {type: String, default: ''},                                          // 城市
        countries: {type: String, default: ''}                                      // 国
    }
);

module.exports = mongoose.model('PriceOfferCity', priceOfferCitSchema);