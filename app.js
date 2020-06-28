const express = require('express');
const session = require('express-session');

const GeetestConfig = require('./geetest_config')
const GeetestLib = require('./sdk/geetest_lib')

const app = express()
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: GeetestLib.VERSION,
    resave: false,
    saveUninitialized: true
}));


app.get("/", function (req, res) {
    res.redirect("/index.html");
})

// 验证初始化接口，GET请求
app.get("/register", async function (req, res) {
    /*
    必传参数
        digestmod 此版本sdk可支持md5、sha256、hmac-sha256，md5之外的算法需特殊配置的账号，联系极验客服
    自定义参数,可选择添加
        user_id 客户端用户的唯一标识，确定用户的唯一性；作用于提供进阶数据分析服务，可在register和validate接口传入，不传入也不影响验证服务的使用；若担心用户信息风险，可作预处理(如哈希处理)再提供到极验
        client_type 客户端类型，web：电脑上的浏览器；h5：手机上的浏览器，包括移动应用内完全内置的web_view；native：通过原生sdk植入app应用的方式；unknown：未知
        ip_address 客户端请求sdk服务器的ip地址
     */
    const gtLib = new GeetestLib(GeetestConfig.GEETEST_ID, GeetestConfig.GEETEST_KEY);
    const digestmod = "md5";
    const userId = "test";
    const params = {"digestmod": digestmod, "user_id": userId, "client_type": "web", "ip_address": "127.0.0.1"}
    const result = await gtLib.register(digestmod, params);
    // 将结果状态写到session中，此处register接口存入session，后续validate接口会取出使用
    // 注意，此demo应用的session是单机模式，格外注意分布式环境下session的应用
    req.session[GeetestLib.GEETEST_SERVER_STATUS_SESSION_KEY] = result.status;
    req.session["userId"] = userId;
    // 注意，不要更改返回的结构和值类型
    res.set('Content-Type', 'application/json;charset=UTF-8')
    return res.send(result.data);
})

// 二次验证接口，POST请求
app.post("/validate", async function (req, res) {
    const gtLib = new GeetestLib(GeetestConfig.GEETEST_ID, GeetestConfig.GEETEST_KEY);
    const challenge = req.body[GeetestLib.GEETEST_CHALLENGE];
    const validate = req.body[GeetestLib.GEETEST_VALIDATE];
    const seccode = req.body[GeetestLib.GEETEST_SECCODE];
    // session必须取出值，若取不出值，直接当做异常退出
    const status = req.session[GeetestLib.GEETEST_SERVER_STATUS_SESSION_KEY];
    const userId = req.session["userId"];
    if (status == undefined) {
        return res.json({"result": "fail", "version": GeetestLib.VERSION, "msg": "session取key发生异常"});
    }
    let result;
    if (status === 1) {
        /*
        自定义参数,可选择添加
            user_id 客户端用户的唯一标识，确定用户的唯一性；作用于提供进阶数据分析服务，可在register和validate接口传入，不传入也不影响验证服务的使用；若担心用户信息风险，可作预处理(如哈希处理)再提供到极验
            client_type 客户端类型，web：电脑上的浏览器；h5：手机上的浏览器，包括移动应用内完全内置的web_view；native：通过原生sdk植入app应用的方式；unknown：未知
            ip_address 客户端请求sdk服务器的ip地址
        */
        const params = {"user_id": userId, "client_type": "web", "ip_address": "127.0.0.1"}
        result = await gtLib.successValidate(challenge, validate, seccode, params);
    } else {
        result = gtLib.failValidate(challenge, validate, seccode);
    }
    // 注意，不要更改返回的结构和值类型
    if (result.status === 1) {
        return res.json({"result": "success", "version": GeetestLib.VERSION});
    } else {
        return res.json({"result": "fail", "version": GeetestLib.VERSION, "msg": result.msg});
    }
})

app.listen(3333)