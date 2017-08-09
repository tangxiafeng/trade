/**
 * Created by tangxiafeng on 17/4/14.
 */
var async = require('async');
var _ = require('underscore');

var config_common = global.config_common;
var config_error = global.config_error;
var config_model = global.config_model;
var config_msg_templates = global.config_msg_templates;

var lib_Relationship = global.lib_Relationship;
var lib_PriceOffer = global.lib_PriceOffer;
var lib_priceOfferCity = global.lib_priceOfferCity;
var lib_msg = global.lib_msg;
var http = global.http;
var mw = global.middleware;

var timer_priceoffer = global.timer_priceoffer;

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
                config_error.checkRole(req.decoded.role, [config_common.user_roles.TRADE_ADMIN, config_common.user_roles.TRADE_SALE, config_common.user_roles.TRADE_PURCHASE], cb);
            },
            function (cb) {
                config_error.checkBody(req.body, ['product_categories', 'att_quality', 'att_payment', 'att_traffic',
                    'att_settlement', 'type'], cb, [[{type: 'JJ'}, ['amount']], [{type: 'DjJJ'}, ['amount']]], 'offer');
            },
            function (cb) {
                lib_PriceOffer.addNewOffer(req, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });
    api.post('/del', function (req, res, next) {
        global.lib_common.del(req, lib_PriceOffer, function (err) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, {}, next);
        });
    });
    api.post('/edit', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['id'].concat(_.allKeys(req.body)), cb);
            },
            function (cb) {
                lib_PriceOffer.offerEdit(req, {_id: req.body.id}, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            http.sendUserServerNotToken(req, {
                company_id: req.decoded.company_id,
                user_id: req.decoded.id,
                type: 'trade_pricing',
                data: JSON.stringify(result)
            }, '/api/company_dynamic/add');
            config_common.sendData(req, result, next);
        });
    });
    api.post('/detail', function (req, res, next) {
        global.lib_common.detail(req, lib_PriceOffer, function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    /**
     * 根据状态获取自己发布的报价列表
     * status  默认有效
     * user_id   默认decoded
     * type  默认全部
     */
    api.post('/get_list', function (req, res, next) {
        var page_num = req.body.page || 1;
        async.waterfall([
            function (cb) {
                config_error.checkRole(req.decoded.role, [config_common.user_roles.TRADE_ADMIN, config_common.user_roles.TRADE_SALE, config_common.user_roles.TRADE_PURCHASE], cb);
            },
            function (cb) {
                lib_PriceOffer.getListAndCount(req, page_num, {
                    find: mw.getOfferType(req.body, mw.getIdQuery(req, {status: req.body.status || config_model.offer_status.published}, req.decoded)),
                    skip: config_common.entry_per_page * (page_num - 1),
                    limit: config_common.entry_per_page,
                    sort: {time_creation: -1}
                }, cb);
            },
            function (result, cb) {
                global.lib_common.addUserAndCompany(req, result, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    /**
     * PK列表
     * page 页码
     */
    api.post('/get_JJ_list', function (req, res, next) {
        var page_num = req.body.page || 1;
        async.waterfall([
            function (cb) {
                lib_PriceOffer.getListAndCount(req, page_num, {
                    find: {list_offer: req.decoded.id, status: config_model.demand_status.published},
                    skip: config_common.entry_per_page * (page_num - 1),
                    limit: config_common.entry_per_page,
                    sort: {time_creation: -1}
                }, cb);
            },
            function (result, cb) {
                global.lib_common.addUserAndCompany(req, result, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, result, next);
        });
    });

    /**
     * 根据状态获取自己发布的报价列表
     * company_id 公司id
     * page  页码
     * province  省
     * update  是否刷新
     * material   大类i
     * layer_1   分类第一层
     * city  选传
     */
    api.post('/get_certification_list', function (req, res, next) {
        var page_num = req.body.page || 1;
        var query = {status: config_model.offer_status.published};
        var count = 0;
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['company_id', 'page'], cb);
            },
            function (cb) {
                lib_PriceOffer.getUpdateCount(req, cb);
            },
            function (length, cb) {
                count = length;
                lib_Relationship.offerCheck(req, query, cb);
            },
            function (cb) {
                global.lib_User.getWorkRelationList(req, global.config_model.company_type.SALE, cb);
            },
            function (result, cb) {
                lib_PriceOffer.getListByParam(req, {
                    find: query,
                    skip: config_common.entry_per_page * (page_num - 1),
                    limit: config_common.entry_per_page,
                    sort: {time_creation: -1}
                }, mw.getCityQuery(req, {user_id: {$in: result}}), cb, page_num);
            },
            function (result, cb) {
                lib_PriceOffer.insertTypeCount(result, cb);
            },
            function (result, cb) {
                global.lib_common.addUserAndCompany(req, result, cb);
            }
        ], function (err, result) {
            if (err) return next(err);
            result.update_count = count;
            config_common.sendData(req, result, next);
        });
    });

    /**
     * 朋友圈
     */
    api.post('/circle_of_friends', function (req, res, next) {
        global.lib_common.circle_of_friends(req, lib_PriceOffer, lib_PriceOffer.insertTypeCount, function (err, result) {
            if (err) return next(err);
            config_common.sendData(req, result, next);
        }, global.config_model.company_type.SALE, true);
    });

    /**
     * 获取推送的报价
     */
    api.post('/get_push', function (req, res, next) {
        global.lib_common.get_push(req, lib_PriceOffer, 'offer_id', lib_PriceOffer.insertTypeCount, function (err, result) {
            if (err) return next(err);
            config_common.sendData(req, result, next);
        }, true)
    });

    /**
     * 红点提示条数
     * companies  [{id:公司id,city:城市，province：省,material}]
     */
    api.post('/get_remind', function (req, res, next) {
        var query = {status: config_model.offer_status.published}, obj = {};
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['companies'], cb);
            },
            function (cb) {
                async.eachSeries(req.body['companies'], function (company, callback) {
                    async.waterfall([
                        function (cb) {
                            req.body.company_id = company.id;
                            if (company.city) req.body.city = company.city;
                            if (company.province) req.body.province = company.province;
                            if (company.material) req.body.material = company.material;
                            lib_Relationship.offerCheck(req, query, cb, true);
                        },
                        function (cb) {
                            global.lib_User.getWorkRelationList(req, global.config_model.company_type.SALE, cb, true);
                        },
                        function (result, cb) {
                            lib_PriceOffer.getCountByParam(req, {find: query}, mw.getCityQuery(req, {user_id: {$in: result}}), cb);
                        }
                    ], function (err, result) {
                        obj[company.id] = result;
                        callback();
                    });
                }, cb);
            }
        ], function (err) {
            if (err) return next(err);
            config_common.sendData(req, obj, next);
        });
    });

    /**
     * 获取自己各个状态报价列表数量
     */
    api.post('/get_oneself_count', function (req, res, next) {
        async.waterfall([
            function (callback) {
                lib_PriceOffer.getAggregate({
                    match: {user_id: req.decoded.id},
                    group: {_id: '$status', num: {$sum: 1}}
                }, callback);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            var Status = {
                published: 0,
                expired: 0
            };
            _.each(result, function (status) {
                Status[status._id] = status.num;
            });
            config_common.sendData(req, Status, next);
        });
    });

    /**
     * 复制报价
     * ids 需要重新发布的报价id
     */
    api.post('/add_another_list', function (req, res, next) {
        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['ids'], cb);
            },
            function (cb) {
                lib_PriceOffer.getList({
                    find: {_id: {$in: req.body.ids}}
                }, cb)
            },
            function (result, cb) {
                async.eachSeries(result, function (offer, callback) {
                    offer = JSON.parse(JSON.stringify(offer));
                    var new_offerId;
                    async.waterfall([
                        function (cbk) {
                            global.lib_User.getAddressOne({
                                find: {user_id: req.decoded.id, differentiate: 'Pick_up_the_goods'}
                            }, cbk);
                        },
                        function (address, cbk) {
                            offer.user_id = req.decoded.id;
                            offer.company_id = req.decoded.company_id;
                            offer.company_name = req.decoded.company_name;
                            offer.update_time = new Date();
                            offer.time_creation = new Date();
                            offer.status = config_model.offer_status.published;
                            offer.location_storage = address ? address._id : '';
                            offer.role = req.decoded.role;
                            delete offer._id;
                            lib_PriceOffer.add(offer, cbk);
                        },
                        function (new_offer, count, cbk) {
                            new_offerId = new_offer._id;
                            var list = [];
                            offer.price_routes.forEach(function (route) {
                                route['user_id'] = req.decoded.id;
                                route['time_creation'] = new Date();
                                route['offer_id'] = new_offer._id;
                                delete route._id;
                                list.push(route);
                            });
                            lib_priceOfferCity.addList(list, cbk);
                        },
                        function (arr, cbk) {
                            var list = [];
                            offer.product_categories.forEach(function (product) {
                                product['offer_id'] = new_offerId;
                                delete product._id;
                                list.push(product)
                            });
                            global.lib_PriceOfferProducts.addList(list, cbk);
                        }
                    ], callback);
                }, cb);
            }
        ], function (err) {
            if (err) {
                return next(err);
            }
            config_common.sendData(req, {}, next);
        })
    });

    /**
     * 获取优惠列表
     */
    api.post('/get_preferential', function (req, res, next) {
        var obj = {};
        var checkParam = {
            full_name: 1,
            nick_name: 1,
            url_logo: 1,
            province: 1,
            city: 1,
            company_id: 1,
            verify_phase: 1
        };
        async.waterfall([
            function (cb) {
                global.lib_User.getCompanyRelationList({
                    find: {other_id: req.decoded.company_id},
                    select: 'self_id'
                }, cb);
            },
            function (relations, cb) {
                async.eachSeries(_.pluck(relations, 'self_id'), function (id, callback) {
                    async.waterfall([
                        function (cbk) {
                            lib_PriceOffer.getList({
                                find: {user_id: req.decoded.id, status: global.config_model.offer_status.published}
                            }, cbk);
                        },
                        function (result, cbk) {
                            async.waterfall([
                                function (callBack) {
                                    global.lib_User.getCompanyOne({
                                        find: {_id: id}
                                    }, callBack);
                                },
                                function (companyData, callBack) {
                                    if (!obj[id]) obj[id] = {company_id: id};
                                    for (var index in checkParam) {
                                        if (checkParam.hasOwnProperty(index)) {
                                            if (!obj[id][index]) obj[id][index] = companyData[index];
                                        }
                                    }
                                    async.eachSeries(result, function (offer, cback) {
                                        async.eachSeries(_.flatten(_.pluck(offer.price_routes, 'preferential_FOB')).concat(_.flatten(_.pluck(offer.price_routes, 'preferential_CIF'))), function (preferentialObj, eachcbk) {
                                            if (id === preferentialObj.company_id) {
                                                if (!obj[id][offer.product_categories[0].layer_1_chn]) {
                                                    obj[id][offer.product_categories[0].layer_1_chn] = [];
                                                }
                                                obj[id][offer.product_categories[0].layer_1_chn].push(preferentialObj.price);
                                            }
                                            eachcbk();
                                        }, cback);
                                    }, callBack);
                                }
                            ], cbk)
                        }
                    ], callback);
                }, cb);
            }
        ], function (err) {
            if (err) {
                return next(err);
            }
            var objArr = [];
            for (var index in obj) {
                if (obj.hasOwnProperty(index)) {
                    var categoryArr = [];
                    for (var index1 in obj[index]) {
                        var priceObj = {};
                        if (obj[index].hasOwnProperty(index1) && !checkParam[index1]) {
                            priceObj.category_chn = index1;
                            priceObj.min = _.min(obj[index][index1]);
                            priceObj.max = _.max(obj[index][index1]);
                            categoryArr.push(priceObj);
                            delete obj[index][index1];
                        }
                    }
                    obj[index]['categoryArr'] = categoryArr;
                    objArr.push(obj[index]);
                }
            }
            config_common.sendData(req, objArr, next);
        });
    });

    /**
     * 根据条件返回相应的数据
     *
     * 必传
     * param
     * 选传
     * page   页码
     * payment_style   类型
     * province  省
     * city  市
     * material  大类
     * layer_1_chn  小类
     *
     */
    api.post('/get_readjust_param', function (req, res, next) {
        var query = {
            find: _.extend({
                user_id: req.decoded.id,
                status: config_model.offer_status.published
            }, mw.getIdQuery(req, {}))
        };
        if (req.body.page) {
            query.skip = config_common.entry_per_page * (req.body.page - 1);
            query.limit = config_common.entry_per_page;
            query.sort = {time_creation: -1};
        }

        async.waterfall([
            function (cb) {
                config_error.checkBody(req.body, ['params'], cb);
            },
            function (cb) {
                var cond = {};
                if (req.body.payment_style) {
                    cond[req.body.payment_style] = {$gt: 0};
                }
                lib_PriceOffer.getListByParam(req, query, _.extend(req.body['hasCity'] ? mw.getOnlyProvinceQuery(req, {user_id: req.decoded.id}) : mw.getCityQuery(req, {user_id: req.decoded.id}), cond), cb, null, true);
            },
            function (result, cb) {
                lib_PriceOffer.getParam(req.body, result, cb);
            }
        ], function (err, result) {
            if (err) return next(err);
            config_common.sendData(req, result, next);
        })
    });

    /**
     * 获取补货参数
     *
     * 参数
     * location_storage  地址
     * user_id  默认为自己
     * payment_style  报价类型
     */
    api.post('/get_replenish', function (req, res, next) {
        async.waterfall([
            function (cb) {
                global.lib_PriceOfferProducts.getList({
                    find: {material: 'steel'}
                }, cb);
            },
            function (result, cb) {
                lib_PriceOffer.getList({
                    find: {
                        location_storage: req.body.location_storage,
                        user_id: req.body.user_id || req.decoded.id,
                        status: config_model.offer_status.published,
                        _id: {$in: _.pluck(result, 'offer_id')}
                    }
                }, cb);
            }
        ], function (err, result) {
            if (err) {
                return next(err);
            }
            var arr = [];
            result.forEach(function (offer) {
                offer.price_routes.forEach(function (route) {
                    if (route[req.body.payment_style] && (route.countries || req.body.city && req.body.city === route['city'] || req.body.province && req.body.province === route['province'])) {
                        arr.push({
                            preferential: route['preferential_' + req.body.payment_style],
                            price: route[req.body.payment_style],
                            product_categories: offer.product_categories
                        });
                    }
                });
            });
            config_common.sendData(req, arr, next);
        });
    });

    /**
     * 发短信
     * phone_list  手机号数组
     */
    api.post('/send_sms', function (req, res, next) {
        var query = {user_id: req.decoded.id, type: 'DJ'};
        var type = 'pricing';
        if (req.body.id) {
            type = 'bidding';
            query = {_id: req.body.id};
        }
        async.waterfall([
            function (cb) {
                lib_PriceOffer.getList({
                    find: query
                }, cb);
            },
            function (result, cb) {
                var sms = [req.decoded.company_name || '', req.decoded['user_name'], _.first(_.uniq(_.pluck(_.flatten(_.pluck(result, 'product_categories')), 'layer_1_chn')), 2).join('、')
                    , _.min(_.pluck(_.pluck(result, 'FOB').concat(_.pluck(result, 'CIF')), 'min'))];
                if (req.body.id) {
                    sms = [req.decoded.company_name || '', req.decoded['user_name'], _.uniq(_.pluck(_.flatten(_.pluck(result, 'product_categories')), 'layer_1_chn'))[0]];
                }
                lib_msg.send_sms(sms, type, req.body.phone_list || ['15713101361', '15713101362'], cb);
            }
        ], function (err, result) {
            if (err) return next(err);
            config_common.sendData(req, result, next);
        });
    });

    return api;
};