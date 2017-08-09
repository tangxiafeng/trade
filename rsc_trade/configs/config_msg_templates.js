/**
 * Created by chenyuan on 2017/3/14.
 */

module.exports =
    {
        offer: {
            content: '##发布#产品报价，赶快查看属于你的优惠价!',
            element_count: 3
        },
        JJ_offer: {
            content: '##发布#产品竞价，尽早参与可能获得更优惠的采购价格!',
            element_count: 3
        },
        add_JJ: {
            content: '##参与了您发布的#产品竞价，请点击查看',
            element_count: 3
        },
        JJ_ranking: {
            content: '您参与的##产品竞价，排名已被超过，请尽快修改竞价，提升排名',
            element_count: 2
        },
        no_offer: {
            content: '##提醒您发布产品报价!',
            element_count: 2
        },

        demand: {
            content: '##发布#产品抢单，尽早参与可能达成更大量的采购订单',
            element_count: 3
        },
        add_demandOffer: {
            content: '##参与了您发布的#产品抢单，请点击查看',
            element_count: 3
        },
        demand_ranking: {
            content: '您参与的##产品抢单，排名已被超过，请尽快修改价格，提升排名',
            element_count: 2
        },

        demandOffer_order: {
            content: '您参与的##产品抢单，已被采购方下单，请点击查看',
            element_count: 2
        },
        shop_order: {
            content: '##已下单##等，请立即确认订单，12小时未确认，订单自动取消',
            element_count: 4
        },
        FOB_shop_order: {
            content: '##已下单#吨#等，请点击查看',
            element_count: 4
        },
        CIF_shop_order: {
            content: '##已下单#吨#等，请尽快通过平台找车，完成运输!',
            element_count: 4
        },
        JJ_order: {
            content: '您参与的##产品竞拍，已被供应商下单，请点击查看',
            element_count: 2
        },
        SALE_order:{
            content: '##已确认##产品订单，请尽快组织运输',
            element_count: 4
        },
        PURCHASE_order:{
            content: '##已确认##产品订单，请点击查看',
            element_count: 4
        },
        order_car: {
            content: '您与##达成的#等产品的交易订单，对方已线下找车，请点击查看',
            element_count: 3
        },
        inform_SALE: {
            content: '##提醒您及时确认##产品订单，请立即查看',
            element_count: 4
        },

        encodeContent: function (template_id, content) {
            var result = '';
            var msg_array = this[template_id]['content'].split('#');
            for (var i = 0; i < msg_array.length - 1; i++) {
                result += msg_array[i];
                result += content[i];
            }
            result += msg_array.pop();
            return result;
        },
        offer_sms: {
            content: '##发布#产品报价，赶快查看属于你的优惠价!#',
            element_count: 4
        }
    };