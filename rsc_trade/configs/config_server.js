/**
 * Created by Administrator on 2015/11/16.
 */
var server = {
    env: 'dev',                                 //开发环境
    dev: {
        env: 'dev',
        mongodb: 'mongodb://192.168.3.248:27017/rsc_trade',  //链接数据库地址
        local_server_ip: '192.168.3.100',                //本服务器实际ip

        port: 18082,                      //本服务使用端口
        port_https: 17082,                      //本服务使用端口
        traffic_server_port: 18081,                      //物流服务器端口
        trade_server_port: 18082,                      //交易服务器端口
        msg_server_port: 18083,                      //消息服务器端口
        admin_server_port: 18086,                      //后台服务器端口
        user_server_port: 18080,                      //账号服务器端口
        dynamic_server_port: 18091,                             //动态服务器端口
        statistical_server_post: 18088,

        statistical_server_ip: '192.168.3.248',
        dynamic_server_ip: '192.168.3.248',                      //动态服务器地址
        user_server_ip: '192.168.3.248',            //账号服务器地址
        trade_server_ip: '192.168.3.100',           //交易服务器地址
        msg_server_ip: '192.168.3.248',             //消息服务器地址
        log_server_ip: '192.168.3.248',             //消息服务器地址
        admin_server_ip: '192.168.3.248',             //后台服务器地址

        share_url: 'http://192.168.3.248:4000',
        is_sms: false,
        client_invite_path: '/#/tab/regBase'               //发送短信邀请注册，客户端显示界面路径

    },
    pro: {
        env: 'pro',
        mongodb: 'mongodb://rscdba:a11111@localhost:27033/rsc_trade',    //链接数据库地址

        port: 18012,          //本服务使用端口
        port_https: 17012,          //本服务使用端口
        traffic_server_port: 18011,          //物流服务器端口
        user_server_port: 18010,          //交易服务器端口
        msg_server_port: 18013,          //消息服务器端口
        admin_server_port: 18016,          //后台服务器端口
        dynamic_server_port: 18021,                             //动态服务器端口
        statistical_server_post: 18018,

        statistical_server_ip: '127.0.0.1',
        dynamic_server_ip: '127.0.0.1',                      //动态服务器地址
        wai_ip: '60.205.146.196',   //本服务外网地址
        user_server_ip: '127.0.0.1',        //后台服务器地址
        admin_server_ip: '127.0.0.1',        //后台服务器地址
        traffic_server_ip: '127.0.0.1',        //物流服务器地址
        msg_server_ip: '127.0.0.1',        //消息服务器地址
        trade_server_ip: '127.0.0.1',        //交易服务器地址

        share_url: 'http://www.rsc365.com:4000',
        is_sms: true,
        client_invite_path: '/#/tab/regBase'    //发送短信邀请注册，客户端显示界面路径
    },
    demo: {
        env: 'demo',
        mongodb: 'mongodb://rscdba:a11111@localhost:27019/rsc_trade',    //链接数据库地址
        local_server_ip: '101.200.0.53',     //本服务器实际ip

        port: 18082,          //本服务使用端口
        port_https: 17082,          //本服务使用端口
        traffic_server_port: 18081,          //物流服务器端口
        user_server_port: 18080,          //账号服务器端口
        msg_server_port: 18083,          //消息服务器端口
        admin_server_port: 18086,          //后台服务器端口
        dynamic_server_port: 18091,                             //动态服务器端口
        statistical_server_post: 18088,

        statistical_server_ip: '127.0.0.1',
        dynamic_server_ip: '127.0.0.1',                      //动态服务器地址
        wai_ip: '101.200.0.53',     //本服务外网地址
        user_server_ip: '127.0.0.1',        //后台服务器地址
        admin_server_ip: '127.0.0.1',        //后台服务器地址
        traffic_server_ip: '127.0.0.1',        //物流服务器地址
        msg_server_ip: '127.0.0.1',        //消息服务器地址
        trade_server_ip: '127.0.0.1',        //交易服务器地址

        share_url: 'http://www.rsc365.net:4000',
        is_sms: true,
        client_invite_path: '/#/tab/regBase'    //发送短信邀请注册，客户端显示界面路径
    },
    test: {
        env: 'test',
        mongodb: 'mongodb://rscdba:a11111@localhost:27017/rsc_trade',    //链接数据库地址
        local_server_ip: '101.200.0.53',     //本服务器实际ip

        port: 19082,          //本服务使用端口
        port_https: 20082,          //本服务使用端口
        traffic_server_port: 19081,          //物流服务器端口
        user_server_port: 19080,          //账号服务器端口
        msg_server_port: 19083,          //消息服务器端口
        admin_server_port: 19086,          //后台服务器端口
        dynamic_server_port: 19091,                             //动态服务器端口
        statistical_server_post: 19088,

        statistical_server_ip: '127.0.0.1',
        dynamic_server_ip: '127.0.0.1',                      //动态服务器地址
        wai_ip: '101.200.0.53',     //本服务外网地址
        user_server_ip: '127.0.0.1',        //后台服务器地址
        admin_server_ip: '127.0.0.1',        //后台服务器地址
        traffic_server_ip: '127.0.0.1',        //物流服务器地址
        msg_server_ip: '127.0.0.1',        //消息服务器地址
        trade_server_ip: '127.0.0.1',        //账号服务器地址

        share_url: 'http://www.rsc365.net:4999',
        is_sms: true,
        client_invite_path: '/#/tab/regBase'    //发送短信邀请注册，客户端显示界面路径
    }
};

module.exports = server[process.env.node_env || 'dev'];

