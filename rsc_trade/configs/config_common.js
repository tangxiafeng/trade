/**
 * Created by ZHR on 2015/11/16 0016.
 */

module.exports =
    {
        status: 'dev',
        amountArr: [32, 33, 34, 35, 36],
        token_server_timeout: 100000000,           //服务器间通讯秘钥超时时间
        entry_per_page: 5,
        offer_per_page: 3,
        entry_insert_page: 3,
        total_number: 30,
        sms_templates: {
            trade_new_demand: 'trade_new_demand',      //发布需求单主动和30分钟后自动发短信
            trade_new_demand_12h: 'trade_new_demand_12h',     //需求单还有12小时失效
            trade_new_demand_3_company: 'trade_new_demand_3_company',   //需求单有三家公司报价
            trade_offer_new: 'trade_offer_new',        //发布报价主动或30分钟自动发短信
            trade_offer_update_price: 'trade_offer_update_price',   //调价
            trade_update_preferential: 'trade_update_preferential',  //优惠
            trade_update_quality_origin: 'trade_update_quality_origin',  //质检
            trade_update_inventory: 'trade_update_inventory',//库存
            trade_Invite_logistics_company: 'trade_Invite_logistics_company'//邀请成为物流伙伴
        },
        sendData: function (req, data, next) {
            req.result = data;
            next('success');
        },
        VIP: {
            province: 1,
            city: 1,
            verify_phase: 1,
            url_logo: 1
        },
        user: {
            real_name: 'real_name',
            photo_url: 'photo_url',
            role: 'role'
        },
        push_url: {
            demand: 'trade.grab_detail_offer',
            offer: 'trade.offerDetails',
            bidding:"trade.didding_left",
            order: 'trade.order_orderdetail'
        },
        secret_keys: {
            user: 'user',
            invite: 'invite',
            trade: 'trade',
            traffic: 'traffic',
            admin: 'admin',
            dynamic: 'dynamic',
            statistical: 'statistical'
        },
        user_roles: {
            'TRADE_ADMIN': 'TRADE_ADMIN',
            'TRADE_PURCHASE': 'TRADE_PURCHASE',
            'TRADE_SALE': 'TRADE_SALE',
            'TRADE_MANUFACTURE': 'TRADE_MANUFACTURE',
            'TRADE_FINANCE': 'TRADE_FINANCE',
            'TRADE_STORAGE': 'TRADE_STORAGE',
            'TRAFFIC_ADMIN': 'TRAFFIC_ADMIN',
            'TRAFFIC_DRIVER': 'TRAFFIC_DRIVER'
        },
        user_roles_for_certification_company: {
            'SALE': 'SALE',
            'PURCHASE': 'PURCHASE'
        },

        url_share: {
            demand: '/html/rushDetail.html?',
            offer: '/html/myOfferPriceList.html?',
            download: '/html/downLoad.html'
        },

        OSS: {
            access_id: 'wZ2NKdo8zRXchXpr',
            access_key: 'T9ebkKOgyLSqsZx7SnhwViNHnZjAUo',
            bucket_img_url: 'rsc-img.oss-cn-beijing.aliyuncs.com',
            bucket_img: 'rsc-img'
        },

        OSS_DEV:        // 内网测试时候使用
            {
                bucket_img_url: 'rsc-dev.oss-cn-beijing.aliyuncs.com',
                bucket_img: 'rsc-dev'
            },

        company_category: {
            'TRADE': 'TRADE',
            'TRAFFIC': 'TRAFFIC'
        },

        index_collection: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '2', '3', '4', '5', '6', '7', '8', '9'],

        index_number: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],

        file_path: '/temp/',


        file_format: {
            'jpg': 'jpg',
            'jpeg': 'jpeg',
            'png': 'png'
        },
        file_size: 5 * 1024 * 1024,


        typeCode: {
            company_des: 'company_des',                          //编辑公司简介
            traffic_line: 'traffic_line',                       //物流线路报价
            traffic_demand: 'traffic_demand',                  //物流需求单
            traffic_driver_demand: 'traffic_driver_demand',  //司机需求单
            traffic_order_confirm: 'traffic_order_confirm', //物流确认接单
            trade_order_confirm_sale: 'trade_order_confirm_sale',     //销售确认交易订单
            trade_order_confirm_purchase: 'trade_order_confirm_purchase',     //采购确认交易订单
            trade_pricing: 'trade_pricing',                   //交易报价
            trade_demand: 'trade_demand'                      //交易需求单
        }
    };