/**
 * Created by Administrator on 2015/12/25.
 */
/**
 * Created by Administrator on 2017/2/27.
 */
var request = require('request');
var decimal = require('decimal');
var async = require('async');
var _ = require('underscore');

var config_common = global.config_common;
var dateNumberToString = function (num) {
    var str = '';
    if (num < 10) {
        str = '0' + num.toString();
    }
    else {
        str = num.toString();
    }
    return str;
};
module.exports =
    {
        getToday: function () {
            var date = new Date();
            return date.getFullYear() + ' ' + (date.getMonth() + 1) + ' ' + date.getDay();
        },

        getObjArr: function (data, index) {
            var users = [], uhash = {};
            for (var i = 0, length = data.length; i < length; ++i) {
                if (!uhash[data[i][index]]) {
                    uhash[data[i][index]] = true;
                    users.push(data[i]);
                }
            }
            return users;
        },

        getOrderIndex: function (my_type) {
            var index = '';
            switch (my_type) {
                case 'order': {
                    index += 'cg-';
                    break;
                }
                case 'demand': {
                    index += 'cgxq-';
                    break;
                }
            }
            var today = new Date();
            var year = today.getFullYear().toString().substr(2);
            var month = dateNumberToString(today.getMonth() + 1);
            var date = dateNumberToString(today.getDate());
            var random = '';
            for (var i = 0; i < 5; i++) {
                var s_index = Math.floor(Math.random() * config_common.index_number.length);
                random += config_common.index_number[s_index];
            }
            index += year + month + date + random;
            return index;
        },

        addCompanyVIP: function (arr, result, param) {
            var newArr = [];
            result.forEach(function (company) {
                arr.forEach(function (entry) {
                    if (company._id === entry[param]) {
                        for (var index in company) {
                            if (company.hasOwnProperty(index) && config_common.VIP[index]) {
                                entry[index] = company[index];
                            }
                        }
                    }
                    newArr.push(entry);
                });
            });
            return newArr.length === 0 ? arr : newArr;
        },

        addUser: function (arr, result, param) {
            var newArr = [];
            result.forEach(function (user) {
                arr.forEach(function (entry) {
                    if (user._id === entry[param]) {
                        for (var index in user) {
                            if (user.hasOwnProperty(index) && config_common.user[index]) {
                                entry[index] = user[index];
                            }
                        }
                    }
                    newArr.push(entry);
                });
            });
            return newArr;
        },

        toObjective: function (result) {
            var list = [];
            result.forEach(function (obj) {
                list.push(obj.toObject());
            });
            return list;
        },


        getDateByHour: function (num) {
            return new Date((new Date()).getTime() + 1000 * 60 * 60 * Number(num));
        },

        // 数组根据特定字段分组
        getGroupByParam: function (list, param) {
            var Obj = {};
            for (var i = 0; i < list.length; i++) {
                var obj = list[i];
                if (!Obj[obj[param]]) {
                    Obj[obj[param]] = {
                        name: param,
                        value: obj[param],
                        array: []
                    };
                }
                Obj[obj[param]].array.push(obj);
            }
            return Obj;
        },

        add: function (number, count) {
            return decimal(number.toString())['add'](count.toString()).toNumber();
        },
        sub: function (number, count) {
            return decimal(number.toString())['sub'](count.toString()).toNumber();
        },
        mul: function (number, count) {
            return decimal(number.toString())['mul'](count.toString()).toNumber();
        },
        div: function (number, count) {
            return decimal(number.toString())['div'](count.toString()).toNumber();
        },

        //订单用
        getMaterialList: function (product) {
            var Obj = {};
            for (var i = 0; i < product.length; i++) {
                var obj = product[i];
                if (!Obj[obj.layer_1]) {
                    Obj[obj.layer_1] = {
                        chn: obj.layer_1_chn,
                        number: 0,
                        unit: obj.unit
                    };
                }
                if (Obj[obj.layer_1]) {
                    var number = 0;
                    for (var j = 0; j < obj.product_name.length; j++) {
                        number = this.add(number, obj.product_name[j].number);
                    }
                    Obj[obj.layer_1].number = this.add(Obj[obj.layer_1].number, number);
                }
            }
            return _.values(Obj);
        }
    };