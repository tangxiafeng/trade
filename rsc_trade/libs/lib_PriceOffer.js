/**
 * Created by Administrator on 2017/2/27.
 */

var model = require('../dbs/db_base');
model = model('PriceOffer');
var _ = require('underscore');
var async = require('async');

var lib_priceOfferCity = require('../libs/lib_priceOfferCity');
var lib_PriceOfferProducts = require('../libs/lib_PriceOfferProducts');

var mw = require('../libs/middleware');

var config_common = global.config_common;
var config_model = global.config_model;
var config_error = global.config_error;

var getCityQuery = function (req, query) {
    if (!req) return query;
    if (req.body.city) {
        query['$or'] = [
            {countries: '全国'},
            {city: req.body.city},
            {city: '', province: req.body.province}
        ];
    } else if (req.body.province) {
        query['$or'] = [
            {province: req.body.province},
            {countries: '全国'}
        ];
    }
    return query;
};

exports.getOnlyArea = function (list) {
    var newArr = [];
    for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < list[i].price_routes.length; j++) {
            if (list[i].price_routes[j].city) {
                list[i].price_routes = [list[i].price_routes[j]];
            } else if (list[i].price_routes[j].province) {
                list[i].price_routes = [list[i].price_routes[j]];
                break;
            } else if (list[i].price_routes[j].countries) {
                list[i].price_routes = [list[i].price_routes[j]];
                break;
            }
        }
        newArr.push(list[i]);
    }
    return newArr;
};

exports.add = function (data, callback) {
    model.add(data, callback);
};

exports.getAggregate = function (data, callback) {
    model.group(data, callback);
};

exports.getOne = function (data, callback) {
    async.waterfall([
        function (cb) {
            model.getOne(data, cb);
        },
        function (offer, cb) {
            offer = JSON.parse(JSON.stringify(offer));
            if (offer) {
                async.waterfall([
                    function (cbk) {
                        lib_priceOfferCity.getList({
                            find: {offer_id: offer._id}
                        }, cbk);
                    },
                    function (result, cbk) {
                        offer.price_routes = result;
                        if (result.length === 0) return cb(config_error.invalid_id);
                        lib_PriceOfferProducts.getList({
                            find: {offer_id: offer._id}
                        }, cbk);
                    },
                    function (result, cbk) {
                        offer.product_categories = result;
                        cbk(null, offer);
                    }
                ], cb);
            } else {
                cb(null, null);
            }
        }
    ], callback);
};

exports.getList = function (data, callback) {
    var offerArr = [];
    async.waterfall([
        function (cbk) {
            model.getList(data, cbk);
        },
        function (result, cbk) {
            async.eachSeries(result, function (offer, cback) {
                offer = JSON.parse(JSON.stringify(offer));
                async.waterfall([
                    function (cb) {
                        lib_priceOfferCity.getList({
                            find: {offer_id: offer._id}
                        }, cb);
                    },
                    function (result, cb) {
                        offer.price_routes = result;
                        lib_PriceOfferProducts.getList({
                            find: {offer_id: offer._id}
                        }, cb);
                    },
                    function (result, cb) {
                        offer.product_categories = result;
                        if (offer.price_routes.length > 0) {
                            offerArr.push(offer);
                        }
                        cb();
                    }
                ], cback);
            }, function (err) {
                if (err) {
                    return cbk(err);
                }
                cbk(null, offerArr);
            });
        }
    ], callback);
};


exports.update = function (cond, callback) {
    model.update(cond, callback);
};

var getCount = function (cond, callback) {
    model.getCount(cond, callback);
};

exports.getCount = getCount;

exports.getListAndCount = function (req, page, data, callback) {
    var offerArr = [];
    async.waterfall([
        function (cb) {
            model.getCount(data.find, cb);
        },
        function (count, cb) {
            async.waterfall([
                function (cbk) {
                    model.getList(data, cbk);
                },
                function (list, cbk) {
                    async.eachSeries(list, function (offer, cback) {
                        offer = JSON.parse(JSON.stringify(offer));
                        async.waterfall([
                            function (cbk) {
                                var query = {offer_id: offer._id};
                                query = getCityQuery(req, query);
                                lib_priceOfferCity.getList({
                                    find: query
                                }, cbk);
                            },
                            function (result, cbk) {
                                offer.price_routes = result;
                                lib_PriceOfferProducts.getList({
                                    find: {offer_id: offer._id}
                                }, cbk);
                            },
                            function (result, cbk) {
                                offer.product_categories = result;
                                if (offer.price_routes.length > 0) {
                                    offerArr.push(offer);
                                }
                                cbk();
                            }
                        ], cback);
                    }, function (err) {
                        if (err) {
                            return cbk(err);
                        }
                        cbk(null, {
                            exist: count > config_common.entry_per_page * page,
                            count: count,
                            list: offerArr
                        });
                    });
                }
            ], cb);

        }
    ], callback);
};

exports.edit = function (data, callback) {
    model.edit(data, callback)
};

exports.del = function (data, callback) {
    async.waterfall([
        function (cb) {
            model.del(data, cb);
        },
        function (result, cb) {
            lib_priceOfferCity.del({offer_id: data._id}, cb);
        }
    ], callback);
};

exports.addNewOffer = function (req, callback) {
    var entry;
    async.waterfall([
        function (cb) {
            var dateObj = {};
            if (req.body['time_validity']) dateObj['time_validity'] = global.util.getDateByHour(req.body['time_validity']);
            model.add(_.extend({
                ownType: req.body.type === global.config_model.offer_type.DJ ? global.config_model.offer_ownType.pricing : global.config_model.offer_ownType.bidding,
                user_id: req.decoded.id,
                company_id: req.decoded.company_id,
                company_name: req.decoded.company_name,

                att_quality: req.body.att_quality,
                att_payment: req.body.att_payment,
                att_traffic: req.body.att_traffic,
                att_settlement: req.body.att_settlement,
                path_loss: req.body.path_loss,

                CIF: {
                    max: _.max(_.pluck(req.body.price_routes, 'CIF')) || 0,
                    min: _.min(_.pluck(req.body.price_routes, 'CIF')) || 0
                },
                FOB: {
                    max: _.max(_.pluck(req.body.price_routes, 'FOB')) || 0,
                    min: _.min(_.pluck(req.body.price_routes, 'FOB')) || 0
                },

                location_storage: req.body.location_storage,    //提货地址
                quality_img: req.body.quality_img,
                status: config_model.offer_status.published,
                type: req.body.type,
                role: req.decoded.role,
                appendix: req.body.appendix,

                delay_day: !isNaN(parseInt(req.body.delay_day)) ? parseInt(req.body.delay_day) : undefined,
                delay_type: req.body.delay_type ? req.body.delay_type : undefined,
                percent_advance: req.body.percent_advance || 0,

                amount: req.body.amount || 0
            }, dateObj), cb);
        },
        function (offer, count, cb) {
            entry = offer.toObject();
            var priceOfferCity = [];
            if (req.body.price_routes.length === 0) {
                req.body.price_routes = [{
                    price: req.body.price || 0,
                    min: req.body['price_min'] || 0,
                    max: req.body['price_max'] || 0,
                    countries: '全国'
                }]
            }
            req.body.price_routes.forEach(function (offerCity) {
                offerCity['offer_id'] = offer._id;
                offerCity['user_id'] = req.decoded.id;
                offerCity['type'] = req.body.type;
                if (offerCity._id) delete offerCity._id;
                priceOfferCity.push(offerCity);
            });
            lib_priceOfferCity.addList(priceOfferCity, cb);
        },
        function (result, cb) {
            entry.price_routes = result;
            global.lib_ProductClassify.checkProduct(req.body.product_categories, entry._id, cb);
        },
        function (result, cb) {
            lib_PriceOfferProducts.addList(result, cb);
        }
    ], function (err, result) {
        if (err) return callback(err);
        var type, other_type, statistical_type, title, url;
        entry.product_categories = result;
        global.lib_User.addCompanyDynamic({
            company_id: req.decoded.company_id,
            user_id: req.decoded.id,
            type: config_common.typeCode.trade_pricing,
            data: JSON.stringify(entry)
        });
        if (entry.type === config_model.offer_type.DJ) {
            type = 'offer';
            title = '交易报价';
            statistical_type = config_model.statistical_type.sale_pricing;
            other_type = config_model.statistical_type.purchase_pricing;
            url = config_common.push_url.offer;
        } else {
            type = 'JJ_offer';
            title = '交易竞价';
            statistical_type = config_model.statistical_type.sale_bidding;
            other_type = config_model.statistical_type.purchase_bidding;
            url = config_common.push_url.bidding;

        }

        global.lib_User.getCompanyRelationList({
            find: {other_id: req.decoded.company_id},
            select: 'self_id'
        }, function (err, list) {
            global.lib_Statistical.statistical_server_companyTrade_add(req, {
                companyObj: [{
                    id: req.decoded.company_id,
                    type: statistical_type,
                    category: result[0].layer_1
                }].concat(_.reduce(_.pluck(list, 'self_id'), function (list, id) {
                    list.push({
                        id: id,
                        type: other_type
                    });
                    return list;
                }, []))
            });
        });
        async.waterfall([
            function (cbk) {
                global.lib_msg.push(req, {
                    title: title,
                    content: global.config_msg_templates.encodeContent(type, [req.decoded.company_name || '', req.decoded.user_name, result[0].layer_1_chn])
                }, {}, '', {
                    params: {id: entry._id, deal: 'buy', type: 'quan'}, url: url
                }, null, global.config_model.company_type.PURCHASE, cbk);
            },
            function (list, cbk) {
                cbk(null, _.extend({id: entry._id}, list));
            }
        ], callback);
    });
};

exports.offerEdit = function (req, cond, callback) {
    var entry;
    var obj;
    async.waterfall([
        function (cb) {
            model.getOne({
                find: cond
            }, cb);
        },
        function (offer, cb) {
            if (!offer) return cb(config_error.invalid_id);
            entry = offer;
            for (var index in req.body) {
                if (req.body.hasOwnProperty(index) && _.allKeys(offer).indexOf(index) >= 0 && !edit[index]) {
                    offer[index] = req.body[index];
                }
            }
            if (req.body.price_routes) {
                entry.CIF = {
                    max: Number(_.max(_.pluck(req.body.price_routes, 'CIF'))),
                    min: Number(_.min(_.pluck(req.body.price_routes, 'CIF')))
                };
                entry.FOB = {
                    max: Number(_.max(_.pluck(req.body.price_routes, 'FOB'))),
                    min: Number(_.min(_.pluck(req.body.price_routes, 'FOB')))
                };
            }
            entry.is_sms = false;
            if (req.body.quality_img) {
                entry.time_update_quality_img = new Date();
                entry.is_sms = true;
            }
            entry.time_update = new Date();
            model.edit(entry, cb);
        },
        function (offer, count, cb) {
            obj = offer;
            if (req.body.price_routes) {
                lib_priceOfferCity.del({offer_id: req.body.id}, function (err) {
                    if (err) return cb(err);
                });
            }
            if (req.body.product_categories) {
                lib_PriceOfferProducts.del({offer_id: req.body.id}, function (err) {
                    if (err) return cb(err);
                });
            }
            cb(null, null);
        },
        function (offer, cb) {
            if (req.body.price_routes) {
                var priceOfferCity = [];
                req.body.price_routes.forEach(function (offerCity) {
                    offerCity['offer_id'] = obj._id;
                    offerCity['user_id'] = req.decoded.id;
                    offerCity['type'] = entry.type;
                    priceOfferCity.push(offerCity);
                });
                lib_priceOfferCity.addList(priceOfferCity, function (err) {
                    if (err) return cb(err);
                });
            }
            if (req.body.product_categories) {
                global.lib_ProductClassify.checkProduct(req.body.product_categories, entry._id, function (err, result) {
                    lib_PriceOfferProducts.addList(result, cb);
                });
            }
            cb();

        }
    ], function (err) {
        if (err)return callback(err);
        callback(null, obj);
    });
};

exports.insertTypeCount = function (entry, callback) {
    var list = [];
    async.waterfall([
        function (cb) {
            async.eachSeries(entry.list, function (offer, cbk) {
                async.parallel({
                    DJ: function (cback) {
                        model.getCount({
                            user_id: offer.user_id,
                            type: config_model.offer_type.DJ,
                            status: config_model.offer_status.published
                        }, cback);
                    },
                    JJ: function (cback) {
                        model.getCount({
                            user_id: offer.user_id,
                            type: {$in: [config_model.offer_type.JJ, config_model.offer_type.DjJJ]},
                            status: config_model.offer_status.published
                        }, cback);
                    }
                }, function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    offer.typeCount = result;
                    list.push(offer);
                    cbk();
                });
            }, cb);
        }
    ], function (err) {
        if (err) {
            return callback(err);
        }
        entry.list = list;
        callback(null, entry);
    });
};

exports.getUpdateCount = function (req, callback) {
    var query = {
        status: global.config_model.demand_status.published
    };
    async.waterfall([
        function (cb) {
            //查询自己与某公司的列表更新时间
            query.company_id = req.body.company_id;
            global.lib_Relationship.relationCheck(req, {
                param: 'time_update',
                type: global.config_model.relationship_type.trade_offer
            }, query, cb);
        },
        function (length, cb) {
            if (length === 0) {
                cb(null, null);
            } else {
                global.lib_User.getWorkRelationList(req, global.config_model.company_type.SALE, cb);
            }
        },
        function (result, cb) {
            if (!result) {
                cb(null, 0);
            } else {
                getCountByParam(req, {find: query}, mw.getCityQuery(req, {user_id: {$in: result}}), cb);
            }
        }
    ], callback);
};

exports.getListByParam = function (req, query, cond, callback, page_num, is_DJ) {
    async.waterfall([
        function (cb) {
            lib_priceOfferCity.getList({
                find: cond
            }, cb);
        },
        function (result, cb) {
            query.find._id = _.pluck(result, 'offer_id');
            global.lib_PriceOfferProducts.getList({
                find: mw.getLayerQuery(req.body, mw.getLayerQuery(req, {offer_id: {$in: _.pluck(result, 'offer_id')}}))
            }, cb);
        },
        function (result, cb) {
            if (is_DJ) query.find.type = config_model.offer_type.DJ;
            query.find._id = {$in: _.uniq(_.intersection(query.find._id, _.pluck(result, 'offer_id')))};
            this['lib_PriceOffer'].getListAndCount(req, page_num || 1, query, cb);
        }
    ], callback)
};


var getCountByParam = function (req, query, cond, callback) {
    async.waterfall([
        function (cb) {
            lib_priceOfferCity.getList({
                find: cond
            }, cb);
        },
        function (result, cb) {
            query.find._id = _.pluck(result, 'offer_id');
            global.lib_PriceOfferProducts.getList({
                find: mw.getLayerQuery(req.body, mw.getLayerQuery(req, {offer_id: {$in: _.pluck(result, 'offer_id')}}))
            }, cb);
        },
        function (result, cb) {
            query.find._id = {$in: _.uniq(_.intersection(query.find._id, _.pluck(result, 'offer_id')))};
            this['lib_PriceOffer'].getCount(query.find, cb);
        }
    ], callback)
};
exports.getCountByParam = getCountByParam;

exports.getParam = function (body, result, callback) {
    var paramObj = {
        obj: function (cbk) {
            cbk(null, result);
        },
        price_routes: function (cbk) {
            cbk(null, _.flatten(_.pluck(result.list, 'price_routes')));
        },
        product_categories: function (cbk) {
            cbk(null, _.flatten(_.pluck(result.list, 'product_categories')));
        },
        id: function (cbk) {
            cbk(null, _.compact(_.uniq(_.pluck(_.flatten(_.pluck(result.list, 'price_routes')), '_id'))));
        },
        countries: function (cbk) {
            cbk(null, _.compact(_.uniq(_.pluck(_.flatten(_.pluck(result.list, 'price_routes')), 'countries'))));
        },
        province: function (cbk) {
            cbk(null, _.compact(_.uniq(_.pluck(_.flatten(_.pluck(result.list, 'price_routes')), 'province'))));
        },
        city: function (cbk) {
            cbk(null, _.compact(_.uniq(_.pluck(_.flatten(_.pluck(result.list, 'price_routes')), 'city'))));
        },
        material: function (cbk) {
            cbk(null, _.compact(_.uniq(_.pluck(_.flatten(_.pluck(result.list, 'product_categories')), 'material_chn'))));
        },
        layer_1_chn: function (cbk) {
            cbk(null, _.compact(_.uniq(_.pluck(_.flatten(_.pluck(result.list, 'product_categories')), 'layer_1_chn'))));
        },
        layer_2_chn: function (cbk) {
            cbk(null, _.compact(_.uniq(_.pluck(_.flatten(_.pluck(result.list, 'product_categories')), 'layer_2_chn'))));
        },
        layer_3_chn: function (cbk) {
            cbk(null, _.compact(_.uniq(_.pluck(_.flatten(_.pluck(result.list, 'product_categories')), 'layer_3_chn'))));
        },
        payment_style: function (cbk) {
            cbk(null, _.reduce(_.flatten(_.pluck(result.list, 'price_routes')), function (list, obj) {
                if (obj && obj.FOB) list.push('FOB');
                if (obj && obj.CIF) list.push('CIF');
                return _.uniq(list);
            }, []));
        }
    };
    async.parallel(_.extend(_.reduce(body.params, function (obj, param) {
        obj[param] = paramObj[param];
        return obj;
    }, {}), {id: paramObj.id}), callback);
};

var edit = {
    id: 'id',
    _id: '_id',
    price_routes: 'price_routes',
    product_categories: 'product_categories'
};