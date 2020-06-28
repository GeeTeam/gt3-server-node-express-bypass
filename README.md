# gt3-server-node-express-sdk

## 示例部署环境
条目|说明
----|----
操作系统|ubuntu 16.04.6 lts
node版本|12.18.0
express版本|4.17.1

> **注意**，必须支持ES6标准

## 部署流程

### 下载sdk demo
```
git clone https://github.com/GeeTeam/gt3-server-node-express-sdk.git
```

### 配置密钥，修改请求参数
> 配置密钥

从[极验管理后台](https://auth.geetest.com/login/)获取公钥（id）和私钥（key）, 并在代码中配置。配置文件的相对路径如下：
```
geetest_config.js
```

> 修改请求参数（可选）

名称|说明
----|------
user_id|客户端用户的唯一标识，作用于提供进阶数据分析服务，可在register和validate接口传入，不传入也不影响验证服务的使用；若担心用户信息风险，可作预处理(如哈希处理)再提供到极验
client_type|客户端类型，web：电脑上的浏览器；h5：手机上的浏览器，包括移动应用内完全内置的web_view；native：通过原生sdk植入app应用的方式；unknown：未知
ip_address|客户端请求sdk服务器的ip地址

### 关键文件说明
条目|说明|相对路径
----|----|----
app.js|项目启动入口和接口请求控制器，主要处理验证初始化和二次验证接口请求|
geetest_config.js|配置id和key|
geetest_lib.js|核心sdk，处理各种业务|sdk/
geetest_lib_result.js|核心sdk返回数据的包装对象|sdk/
index.html|demo示例首页|public/
package.json|依赖管理配置文件|

### 运行demo
```
cd gt3-server-node-express-sdk
sudo npm install
sudo node app.js
```
在浏览器中访问`http://localhost:3333`即可看到demo界面。

## 发布日志

### tag：20200701
- 统一各语言sdk标准
- 版本：node-express:3.1.0

