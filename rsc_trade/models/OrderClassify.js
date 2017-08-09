/**
 * Created by tangxiafeng on 17/6/26.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderClassifySchema = new Schema({
    arr: {type: Array, default: []}  //产品分类数组
});

module.exports = mongoose.model('OrderClassify', OrderClassifySchema);
