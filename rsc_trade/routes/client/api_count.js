/**
 * Created by tangxiafeng on 17/4/15.
 */
var async = require('async');
var _ = require('underscore');

var config_common = global.config_common;
var config_model = global.config_model;

var lib_shop = global.lib_shop;
var lib_PriceOffer = global.lib_PriceOffer;

module.exports = function (app, express) {

    var api = express.Router();

    // 拦截非授权请求
    api.use(require('../../middlewares/mid_verify_user')());


    return api;
};

