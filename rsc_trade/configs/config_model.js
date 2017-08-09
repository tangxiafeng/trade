/**
 * Created by tangxiafeng on 17/5/14.
 */
module.exports = {
    /**
     * 公用
     */

    order_origin: {
        'demand': 'demand',
        'DJ': 'DJ',
        'JJ': 'JJ'
    },
    payment_style: {
        'CIF': 'CIF',                             // 到岸价
        'FOB': 'FOB'                              // 出厂价
    },


    att_quality: {//质检归属
        'demand': 'demand',
        'supply': 'supply',
        'other': 'other'
    },
    att_payment: {//付款类型
        cash: 'cash',                             // 使用现金
        bill_bank: 'bill_bank',                   // 银行承兑
        bill_com: 'bill_com'                      // 商业承兑
    },
    att_settlement: {//付款方式
        'all_cash': 'all_cash',                   // 全款-款到发货
        'all_goods': 'all_goods',                 // 全款-货到付款
        'partition': 'partition',                 // 分期，有预付款尾款
        'credit': 'credit'                        // 信用额度
    },
    att_traffic: {//物流细则
        pick_up: 'pick_up',                       // 提货
        arrival: 'arrival',                       // 到货
        path_loss: 'path_loss'                    // 路耗
    },

    delay_type: {//延期计算标准
        'order': 'order',                         // 从确认订单开始计时付款时间
        'goods': 'goods'                          // 从货物到货开始计时付款时间
    },

    relationship_type: {
        trade_offer: 'trade_offer',               // 报价
        trade_demand: 'trade_demand',             // 抢单
        trade_sale: 'trade_sale',                 // 销售订单
        trade_pruchase: 'trade_pruchase',         // 采购订单
        plan: 'plan'                              // 计划
    },
    /**
     * status
     */
    shop_status: {
        'ineffective': 'ineffective',             // 未生效
        'effective': 'effective',                 // 已生效
        'complete': 'complete',                   // 完成
        'cancelled': 'cancelled'                  // 取消
    },
    offer_status: {
        'published': 'published',                 // 已发布
        'expired': 'expired',                     // 已过期
        'to_be_announced': 'to_be_announced'      // 待发布
    },
    demand_status: {
        'published': 'published',                 // 已发布
        'expired': 'expired'                      // 已过期
    },
    order_status: {
        'ineffective': 'ineffective',             // 待确认
        'effective': 'effective',                 // 运输中
        'complete': 'complete',                   // 完成
        'cancelled': 'cancelled'                  // 取消
    },
    config_status: {
        attribute: 'attribute',                   // 属性
        product_name: 'product_name',             // 产品名称
        unit: 'unit',                             // 产品单位
        unit_traffic: 'unit_traffic',             // 运输单位
        other: 'other'                            // 其他
    },
    /**
     * type
     */
    offerAgain_type: {},
    company_type: {//公司类型
        SALE: 'SALE',                             // 销售
        PURCHASE: 'PURCHASE',                     // 采购
        TRAFFIC: 'TRAFFIC'                        // 物流
    },
    offer_type: {
        'DJ': 'DJ',                               // 定价
        'DjJJ': 'DjJJ',                           // 定价竞价
        'JJ': 'JJ'                                // 区间竞价
    },
    demand_type: {
        'QjJJ': 'QjJJ',                           // 区间
        'DjJJ': 'DjJJ'                            // 固定价格
    },
    offer_ownType: {
        pricing: 'pricing',                       // 报价
        bidding: 'bidding',                       // 竞价
        demand: 'demand'                          // 采购
    },
    statistical_type: {
        sale_pricing: 'sale_pricing',//定价
        sale_pricing_order: 'sale_pricing_order', //定价订单
        sale_bidding: 'sale_bidding',//竞价
        sale_bidding_order: 'sale_bidding_order',//竞价订单
        sale_demandOffer: 'sale_demandOffer',//销售方抢采购的需求单
        sale_demandOffer_order: 'sale_demandOffer_order', //销售方抢采购需求单生成的订单数量
        purchase_pricing_order: 'purchase_pricing_order',//定价订单
        purchase_offerAgain: 'purchase_offerAgain',//竞价
        purchase_offerAgain_order: 'purchase_offerAgain_order',//竞价订单
        purchase_demand: 'purchase_demand',//抢单
        purchase_demand_order: 'purchase_demand_order',//抢单订单
        assign: 'assign',//指派数量
        assign_order: 'assign_order', //指派生成的订单
        purchase_plan: 'purchase_plan',   //生成采购计划
        sale_demand: 'sale_demand',   //
        purchase_bidding: 'purchase_bidding',   //
        purchase_pricing: 'purchase_pricing',   //
        pricing_browse: 'pricing_browse',   //
        bidding_browse: 'bidding_browse',   //
        demand_browse: 'demand_browse',   //
        bidding_bid:'bidding_bid',
        demand_bid:'demand_bid'
    },
    /**
     * server用
     */
    getsObj: {
        method: 'sd',
        models: [
            {
                model: 'qwe',
                cond: 'xzc'
            }
        ]
    },
    method: {
        getOne: 'getOne',
        getCount: 'getCount',
        getList: 'getList'
    },

    /**
     * 纯检验参数
     */
    steel_weigh_liji: {
        steel_gaoxian: 2.08,
        steel_puxian: 2.08,
        steel_panluo: 2.08,
        steel_luowengang: {
            Φ12: {9: 2.078, 12: 2.771},
            Φ14: {9: 2.178, 12: 2.904},
            Φ16: {9: 2.275, 12: 3.034},
            Φ18: {9: 2.520, 12: 3.360},
            Φ20: {9: 2.668, 12: 3.557},
            Φ22: {9: 2.682, 12: 3.576},
            Φ25: {9: 2.772, 12: 3.696},
            Φ28: {9: 2.608, 12: 3.478},
            Φ32: {9: 2.840, 12: 3.786}
        }
    }


};