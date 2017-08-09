/**
 * Created by ZHR on 2015/11/26 0026.
 */

var request = require('request');
var _ = require('underscore');
var crypto = require('crypto');
var config_common = global.config_common;
var http;
try {
    http = require('https');
} catch (err) {
    http = require('http');
}

module.exports =
    {
        // 返回若干位随机码
        getRandomString: function (count) {
            if (isNaN(count)) return '';
            var random = '';
            for (var i = 0; i < count; i++) {
                var s_index = Math.floor(Math.random() * config_common.index_collection.length);
                random += config_common.index_collection[s_index];
            }
            return random;
        },

        // 从阿里云上删除一个文件
        deleteImgFromAliyun: function (file_name) {
            var OSSHeaders = '';
            var Resource = '/' + config_common.OSS.bucket_img + '/' + file_name;
            var requestDate = new Date().toUTCString();
            var VERB = 'DELETE';
            var signature_content = VERB + '\n\n' + 'application/octet-stream\n' + requestDate + '\n' + OSSHeaders + Resource;
            var signature = crypto.createHmac('sha1', config_common.OSS.access_key).update(signature_content).digest().toString('base64');
            var header_authorization = 'OSS ' + config_common.OSS.access_id + ':' + signature;
            var headers = {
                'Authorization': header_authorization,
                'Cache-Control': 'no-cache',
                'Content-Length': 0,
                'Content-Type': 'application/octet-stream',
                'Date': requestDate,
                'Host': config_common.OSS.bucket_img_url
            };

            var option = {
                'method': 'DELETE',
                'headers': headers,
                'url': 'http://' + config_common.OSS.bucket_img_url + '/' + file_name
            };
            request(option, function () {
            });
        },

        getLayerQuery: function (body, query) {
            if (body.material) query.material = body.material;
            if (body.layer_1) query.layer_1 = body.layer_1;
            if (body.layer_2) query.layer_2 = body.layer_2;
            if (body.layer_3) query.layer_3 = body.layer_3;
            if (body.layer_4) query.layer_4 = body.layer_4;
            if (body.material_chn) query.material_chn = body.material_chn;
            if (body.layer_1_chn) query.layer_1_chn = body.layer_1_chn;
            if (body.layer_2_chn) query.layer_2_chn = body.layer_2_chn;
            if (body.layer_3_chn) query.layer_3_chn = body.layer_3_chn;
            if (body.layer_4_chn) query.layer_4_chn = body.layer_4_chn;
            if (_.isArray(body.material)) query.material = {$in: body.material};
            if (_.isArray(body.layer_1)) query.layer_1 = {$in: body.layer_1};
            if (_.isArray(body.layer_2)) query.layer_2 = {$in: body.layer_2};
            if (_.isArray(body.layer_3)) query.layer_3 = {$in: body.layer_3};
            if (_.isArray(body.layer_4)) query.layer_4 = {$in: body.layer_4};
            if (_.isArray(body.material_chn)) query.material_chn = {$in: body.material_chn};
            if (_.isArray(body.layer_1_chn)) query.layer_1_chn = {$in: body.layer_1_chn};
            if (_.isArray(body.layer_2_chn)) query.layer_2_chn = {$in: body.layer_2_chn};
            if (_.isArray(body.layer_3_chn)) query.layer_3_chn = {$in: body.layer_3_chn};
            if (_.isArray(body.layer_4_chn)) query.layer_4_chn = {$in: body.layer_4_chn};
            return query;
        },

        getDoubleLayerQuery: function (body, query) {
            if (body.material) query['product_categories.material'] = body.material;
            if (body.layer_1) query['product_categories.layer_1'] = body.layer_1;
            if (body.layer_2) query['product_categories.layer_2'] = body.layer_2;
            if (body.layer_3) query['product_categories.layer_3'] = body.layer_3;
            if (body.layer_4) query['product_categories.layer_4'] = body.layer_4;
            if (body.material_chn) query['product_categories.material_chn'] = body.material_chn;
            if (body.layer_1_chn) query['product_categories.layer_1_chn'] = body.layer_1_chn;
            if (body.layer_2_chn) query['product_categories.layer_2_chn'] = body.layer_2_chn;
            if (body.layer_3_chn) query['product_categories.layer_3_chn'] = body.layer_3_chn;
            if (body.layer_4_chn) query['product_categories.layer_4_chn'] = body.layer_4_chn;
            if (_.isArray(body.material)) query['product_categories.material'] = {$in: body.material};
            if (_.isArray(body.layer_1)) query['product_categories.layer_1'] = {$in: body.layer_1};
            if (_.isArray(body.layer_2)) query['product_categories.layer_2'] = {$in: body.layer_2};
            if (_.isArray(body.layer_3)) query['product_categories.layer_3'] = {$in: body.layer_3};
            if (_.isArray(body.layer_4)) query['product_categories.layer_4'] = {$in: body.layer_4};
            if (_.isArray(body.material_chn)) query['product_categories.material_chn'] = {$in: body.material_chn};
            if (_.isArray(body.layer_1_chn)) query['product_categories.layer_1_chn'] = {$in: body.layer_1_chn};
            if (_.isArray(body.layer_2_chn)) query['product_categories.layer_2_chn'] = {$in: body.layer_2_chn};
            if (_.isArray(body.layer_3_chn)) query['product_categories.layer_3_chn'] = {$in: body.layer_3_chn};
            if (_.isArray(body.layer_4_chn)) query['product_categories.layer_4_chn'] = {$in: body.layer_4_chn};
            return query;
        },

        getCityQuery: function (req, cond) {
            if (req.body.city) {
                cond['$or'] = [
                    {countries: '全国'},
                    {city: req.body.city},
                    {city: '', province: req.body.province}
                ];
            } else if (req.body.province) {
                cond['$or'] = [
                    {province: req.body.province},
                    {countries: '全国'}
                ];
            } else if (req.body['countries']) {
                cond.countries = '全国';
            }
            if (_.isArray(req.body['city'])) {
                cond['$or'] = [
                    {countries: '全国'},
                    {city: {$in: req.body['city']}},
                    {city: '', province: req.body.province}
                ];
            } else if (_.isArray(req.body['province'])) {
                cond['$or'] = [
                    {countries: '全国'},
                    {province: {$in: req.body.province}}
                ];
            }
            return cond;
        },

        getOnlyProvinceQuery: function (req, cond) {
            if (req.body.city) {
                cond['$or'] = [
                    {countries: '全国'},
                    {city: req.body.city},
                    {city: '', province: req.body.province}
                ];
            } else if (req.body.province) {
                cond['$or'] = [
                    {city: '', province: req.body.province},
                    {countries: '全国'}
                ];
            } else if (req.body['countries']) {
                cond.countries = '全国';
            }
            if (_.isArray(req.body['city'])) {
                cond['$or'] = [
                    {countries: '全国'},
                    {city: {$in: req.body['city']}},
                    {city: '', province: req.body.province}
                ];
            } else if (_.isArray(req.body['province'])) {
                cond['$or'] = [
                    {countries: '全国'},
                    {city: '', province: {$in: req.body.province}}
                ];
            }
            return cond;
        },


        getProductByCompany: function (body, query) {
            if (body.PID) query.PID = body.PID;
            if (body.name) query.name = body.name;
            return query;
        },

        getUserQueryByType: function (type, id, query) {
            if (type) {
                query['user_' + type + '_id'] = id;
            } else {
                query['$or'] = [
                    {user_supply_id: id},
                    {user_demand_id: id}
                ];
            }
            return query;
        },

        getOtherCompanyQueryByType: function (type, id) {
            var data = {};
            if (type === 'SALE') {
                data.company_demand_id = id;
            } else if (type === 'PURCHASE') {
                data.company_supply_id = id;
            } else {
                data['$or'] = [
                    {company_supply_id: id},
                    {company_demand_id: id}
                ];
            }
            return data;
        },

        getIdQuery: function (req, query, decoded, type) {
            if (!req.body.user_id && !req.body.company_id && decoded) query.user_id = decoded.id;
            if (req.body.user_id) query.user_id = req.body.user_id;
            if (req.body.company_id) query.company_id = req.body.company_id;
            if (type && req.body.user_id) query['user_' + type + '_id'] = req.body.user_id;
            if (type && req.body.company_id) query['company_' + type + '_id'] = req.body.company_id;
            return query;
        },

        getOfferType: function (body, query) {
            if (!body.type) query.type = {$in: ['DJ', 'JJ', 'QjJJ', 'DjJJ']};
            if (body.type === 'DJ') query.type = 'DJ';
            if (body.type === 'JJ') query.type = {$in: ['JJ', 'DjJJ']};
            return query;
        }
    };