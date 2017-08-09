/**
 * Created by tangxiafeng on 17/5/15.
 */
var async = require('async');
var decimal = require('decimal');

var config_common = global.config_common;
var config_error = global.config_error;

var lib_priceOfferCity = global.lib_priceOfferCity;
var lib_PriceOffer = global.lib_PriceOffer;
var lib_OfferAgain = global.lib_OfferAgain;
var lib_DemandOrder = global.lib_DemandOrder;
var lib_common = global.lib_common;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());

    /**
     * 增删改查
     */
    api.post('/add', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['id', 'product_categories', 'price', 'amount'], cb);
            },
            function (cb) {
                lib_PriceOffer.getOne({
                    find: {_id: req.body.id}
                }, cb);
            },
            function (offer, cb) {
                if (!offer) return next(config_error.invalid_id);
                if (offer.list_offer.indexOf(req.decoded.id) >= 0) return next(config_error.JJ_ERROR);
                var offerAgain = {
                    offer_id: req.body.id,
                    user_demand_id: req.decoded.id,
                    user_supply_id: offer.user_id,
                    company_demand_id: req.decoded.company_id,
                    company_demand_name: req.decoded.company_name,
                    company_supply_id: offer.company_id,
                    company_supply_name: offer.company_name,

                    product_categories: req.body.product_categories,

                    att_quality: offer.att_quality,
                    att_payment: offer.att_payment,
                    att_traffic: offer.att_traffic,
                    att_settlement: offer.att_settlement,
                    path_loss: offer.path_loss,

                    price: req.body.price,
                    amount: req.body.amount,

                    location_storage: offer.location_storage,
                    location_depart: req.body.location_depart,
                    quality_img: offer.quality_img,
                    role: req.decoded.role,
                    type: offer.type,
                    replenish: req.body.replenish || [],
                    payment_style: req.body.payment_style || 'FOB',

                    time_validity: offer.time_validity,
                    time_creation: new Date(),

                    delay_day: offer.delay_day,
                    delay_type: offer.delay_type,
                    percent_advance: offer.percent_advance
                };
                lib_OfferAgain.add(req, offerAgain, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            global.lib_msg.push(req, {
                title: '交易竞价',
                content: global.config_msg_templates.encodeContent('add_JJ', [req.decoded.company_name || '', req.decoded['user_name'], result.product_categories[0].layer_1_chn])
            }, {}, '', {
                params: {id: result._id},
                url: config_common.push_url.bidding
            }, [result.user_supply_id]);
            config_common.sendData(req, result, next);
        });
    });
    api.post('/del', function (req, res, next) {
        lib_common.del(req, [lib_OfferAgain, lib_PriceOffer], function (err) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, {}, next);
        }, 'offer_id', true);
    });
    api.post('/edit', function (req, res, next) {
        lib_common.edit(req, lib_OfferAgain, function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });
    api.post('/detail', function (req, res, next) {
        lib_common.detail(req, lib_OfferAgain, function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    /**
     * 剩余修改次数
     * id   抢单id
     */
    api.post('/get_change_remain', function (req, res, next) {
        lib_common.get_change_remain(req, lib_OfferAgain, function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    /**
     * 获取竞价排行榜
     * id 报价id
     * page
     */
    api.post('/get_list', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['id', 'page'], cb);
            },
            function (cb) {
                var page_num = req.body.page || 1;
                lib_OfferAgain.getListAndCount(page_num, {
                    find: {offer_id: req.body.id},
                    sort: req.body.sort || {time_creation: -1},
                    skip: config_common.entry_per_page * (page_num - 1),
                    limit: config_common.entry_per_page
                }, cb);
            },
            function (result, cb) {
                result.list = global.util.toObjective(result.list);
                global.lib_common.addUserAndCompany(req, result, cb, 'demand', 'user_demand_id', 'company_demand_id');
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    return api;
};