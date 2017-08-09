/**
 * Created by Administrator on 2015/11/16.
 */
var server = {
    dev: {},
    pro: {},
    demo: {},
    test: {}
};

module.exports = server[process.env.node_env || 'dev'];

