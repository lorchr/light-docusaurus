- [spring-authorization-server Github](https://github.com/spring-projects/spring-authorization-server)
- [spring-authorization-server Document](https://spring.io/projects/spring-authorization-server/)
- 
- [教程源码 Gitee ](https://gitee.com/vains-Sofia/authorization-example)
- [教程源码 Github](https://github.com/vains-Sofia/authorization-example)
- 
- [教程专栏 掘金](https://juejin.cn/column/7239953874950684732)
- [Spring Authorization Server入门 (一) 初识SpringAuthorizationServer和OAuth2.1协议](https://juejin.cn/post/7239953874950733884)
- [Spring Authorization Server入门 (二) Spring Boot整合Spring Authorization Server](https://juejin.cn/post/7239953874950815804)
- [Spring Authorization Server入门 (三) 集成流程说明、细节补充和各种方式获取token测试](https://juejin.cn/post/7241058098974720037)
- [Spring Authorization Server入门 (四) 自定义设备码授权](https://juejin.cn/post/7241101553712283707)
- [Spring Authorization Server入门 (五) 自定义异常响应配置](https://juejin.cn/post/7241439405970063416)
- [Spring Authorization Server入门 (六) 自定义JWT中携带的Claims与资源服务JWT解析器](https://juejin.cn/post/7241762957570097213)
- [Spring Authorization Server入门 (七) 登录添加图形验证码](https://juejin.cn/post/7242476048005709879)
- [Spring Authorization Server入门 (八) Spring Boot引入Security OAuth2 Client对接认证服务](https://juejin.cn/post/7243725197911834683)
- [Spring Authorization Server入门 (九) Spring Boot引入Resource Server对接认证服务](https://juejin.cn/post/7244043482772029498)
- [Spring Authorization Server入门 (十) 添加短信验证码方式登录](https://juejin.cn/post/7245538214114492474)
- [Spring Authorization Server入门 (十一) 自定义grant_type(短信认证登录)获取token](https://juejin.cn/post/7246409673565372475)
- [Spring Authorization Server入门 (十二) 实现授权码模式使用前后端分离的登录页面](https://juejin.cn/post/7254096495184134181)
- [Spring Authorization Server入门 (十三) 实现联合身份认证，集成Github与Gitee的OAuth登录](https://juejin.cn/post/7258466145653096504)
- [Spring Authorization Server入门 (十四) 联合身份认证添加微信登录](https://juejin.cn/post/7261098261142208568)
- [Spring Authorization Server入门 (十五) 分离授权确认与设备码校验页面](https://juejin.cn/post/7262317630307205176)
- [Spring Authorization Server入门 (十六) Spring Cloud Gateway对接认证服务](https://juejin.cn/post/7271496874942890024)
- [Spring Authorization Server入门 (十七) Vue项目使用授权码模式对接认证服务](https://juejin.cn/post/7279052777888890921)
- [Spring Authorization Server入门 (十八) Vue项目使用PKCE模式对接认证服务](https://juejin.cn/post/7279265985912225828)
- [Spring Authorization Server入门 (十九) 基于Redis的Token、客户端信息和授权确认信息存储](https://juejin.cn/post/7294853623849254946)
- [Spring Authorization Server入门 (二十) 实现二维码扫码登录](https://juejin.cn/post/7326546769981603866)
- 
- [Spring Authorization Server优化篇：自定义UserDetailsService实现从数据库获取用户信息](https://juejin.cn/post/7252251628090294309)
- [Spring Authorization Server优化篇：添加Redis缓存支持和统一响应类](https://juejin.cn/post/7253331974050299963)
- [Spring Authorization Server优化篇：持久化JWKSource，解决重启后无法解析AccessToken问题](https://juejin.cn/post/7254836247290216503)
- [Spring Authorization Server优化篇：Redis值序列化器添加Jackson Mixin，解决Redis反序列化失败问题](https://juejin.cn/post/7281849496983076879)
- 
- [Spring Authorization Server常见问题解答(FAQ)](https://juejin.cn/post/7279242389000208438)

## 项目开发环境说明
### 认证服务
#### 开发软件
| 软件          | 版本     |
| ------------- | -------- |
| Java          | 17       |
| Maven         | 3.6.3    |
| MySQL         | 5.7.17   |
| Redis         | 5.0.14   |
| IntelliJ IDEA | 2023.1.3 |
| Navicat       | 16       |

#### 框架版本
| 框架                               | 版本号  |
| ---------------------------------- | ------- |
| Spring Boot                        | 3.1.0   |
| Spring Security                    | 6.1.0   |
| Spring OAuth2 Authorization Server | 1.1.0   |
| Spring OAuth2 Client               | 6.1.0   |
| Spring OAuth2 Resource Server      | 6.1.0   |
| Mybatis Plus                       | 3.5.3.1 |
| hutool                             | 5.8.18  |

### 前端项目
#### 开发软件
| 软件     | 版本     |
| -------- | -------- |
| NodeJs   | v14.18.2 |
| @vue/cli | 5.0.8    |
| npm      | 9.6.5    |
| VS Code  | 1.81.1   |

#### 框架版本
| 框架       | 版本    |
| ---------- | ------- |
| vue        | ^3.3.4  |
| vue-router | ^4.2.4  |
| vite       | ^4.3.9  |
| axios      | ^1.4.0  |
| naive-ui   | ^2.34.4 |
| crypto-js  | ^4.1.1  |
| typescript | ~5.0.4  |

## 本地开发指南
### 后端
#### 初始化环境
1. 从代码仓库拉取代码

```shell
git clone https://gitee.com/vains-Sofia/authorization-example.git
```

2. idea导入项目，配置maven、jdk，等待maven下载完依赖

3. 目前项目中依赖的客户端信息、授权信息和授权确认信息都是基于Redis的，必须的客户端信息在项目启动时会自动初始化，如果需要自定义可以在`./authorization-server/src/main/java/com/example/repository/RedisRegisteredClientRepository.java`中查看`initClients`方法并自定义初始化内容。

4. 在MySQL数据库中创建数据库`authorization-example`，导入`./authorization-server/sql/authorization-example-rbac.sql`和`./authorization-server/sql/oauth2_third_account.sql` SQL文件，初始化RBAC所需数据库表和三方登录用户信息表。

#### 修改配置
1. 修改认证服务配置文件`authorization-server/src/main/resources/application.yml`，将地址、客户端信息等改为自己的

2. 修改`spring.security.oauth2.client.registration.gitee.client-id`配置，将此配置修改为自己在`gitee`注册的三方登录应用`client id`。

3. 修改`spring.security.oauth2.client.registration.gitee.client-secret`配置，将此配置修改为自己在`gitee`注册的三方登录应用的`client secret`。

4. 在`gitee`中添加三方登录应用的回调地址：`http://127.0.0.1:8080/login/oauth2/code/gitee`，否则在使用`gitee`登录时会发起授权申请失败。

5. 修改`spring.security.oauth2.client.registration.github.client-id`配置，将此配置修改为自己在`github`注册的OAuth App的`client id`。

6. 修改`spring.security.oauth2.client.registration.github.client-secret`配置，将此配置修改为自己在github注册的OAuth App的`client secret`。

7. 在`github`中添加OAuth App的回调地址：`http://127.0.0.1:8080/login/oauth2/code/github`，否则在使用github登录时会发起授权申请失败。

8. 修改`spring.security.oauth2.client.registration.wechat.client-id`配置，将此配置修改为自己在微信公众平台申请的测试号的`client id`。

9. 修改`spring.security.oauth2.client.registration.wechat.client-secret`配置，将此配置修改为自己在微信公众平台申请的测试号的`client secret`。

10. 在微信公众平台的测试号管理中配置回调域名，入口在 [网页授权获取用户基本信息] 后的 [修改] 按钮：`127.0.0.1:8080`，否则在使用wechat登录时会发起授权申请失败。

11. 修改认证服务自定义配置`custom.scurity`下的相关配置

    - 修改`login-url`、`consent-page-uri`、`device-activate-uri`和`device-activated-uri`的域名全部改为`http://127.0.0.1:5173`，如下所示
    - 修改`issuer-url`为 `http://127.0.0.1:8080`

```yaml
custom:
  # 自定义认证配置
  security:
    # 登录页面路径
    login-url: http://127.0.0.1:5173/login
    # 授权确认页面路径
    consent-page-uri: http://127.0.0.1:5173/consent
    # 设备码验证页面
    device-activate-uri: http://127.0.0.1:5173/activate
    # 设备码验证成功页面
    device-activated-uri: http://127.0.0.1:5173/activated
```

12. 修改`server.servlet.session.cookie.domain`配置为`127.0.0.1`

完整配置展示，可自己决定配置，但是建议先按示例跑起来后再修改

```yaml
spring:
 datasource:
   driver-class-name: com.mysql.cj.jdbc.Driver
   url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/authorization-example?serverTimezone=Asia/Shanghai&userUnicode=true&characterEncoding=utf-8&ssl-mode=REQUIRED
   username: ${DB_USER:root}
   password: ${DB_PASSWORD:root}
 security:
   oauth2:
     client:
       registration:
         # 这个'gitee'就是registrationId
         gitee:
           # 指定oauth登录提供者，该oauth登录由provider中的gitee来处理
           provider: gitee
           # 客户端名字
           client-name: Sign in with Gitee
           # 认证方式
           authorization-grant-type: authorization_code
           # 客户端id，使用自己的gitee的客户端id
           client-id: dd8de6dfa9674cc307e18ca75616a0ded06126ddc4f95098da36e1fbfa141d0a
           # 客户端秘钥，使用自己的gitee的客户端秘钥
           client-secret: 59b069e525b84cac8fcb854148b623743eefd6bbe9d54433c006ec0c2f785c4d
           # 回调地址
           redirect-uri: ${custom.security.issuer-url}/login/oauth2/code/gitee
           # 申请scope列表
           scope:
             - emails
             - projects
         github:
           # security client默认实现了GitHub提供的oauth2登录
           provider: github
           client-id: 88c69e87b2e50d2dab4d
           client-secret: 350b351e8287fc142d01082bcf0dc5c6df7c21ae
           # 回调地址
           redirect-uri: ${custom.security.issuer-url}/login/oauth2/code/github
         wechat:
           # 微信登录配置
           provider: wechat
           # 客户端名字
           client-name: Sign in with WeChat
           # 认证方式
           authorization-grant-type: authorization_code
           # 客户端id，使用自己的微信的appid
           client-id: wx946ad2f955901214
           # 客户端秘钥，使用自己的微信的app secret
           client-secret: e4635ff2ed22c83294394ac818cf75a7
           # 回调地址
           redirect-uri: ${custom.security.issuer-url}/login/oauth2/code/wechat
           # 申请scope列表
           scope: snsapi_userinfo

       # oauth登录提供商
       provider:
         # 微信的OAuth2端点配置
         wechat:
           # 设置用户信息响应体中账号的字段
           user-name-attribute: nickname
           # 获取token的地址
           token-uri: https://api.weixin.qq.com/sns/oauth2/access_token
           # 获取用户信息的地址
           user-info-uri: https://api.weixin.qq.com/sns/userinfo
           # 发起授权申请的地址
           authorization-uri: https://open.weixin.qq.com/connect/oauth2/authorize
         # gitee的OAuth2端点配置
         gitee:
           # 设置用户信息响应体中账号的字段
           user-name-attribute: login
           # 获取token的地址
           token-uri: https://gitee.com/oauth/token
           # 获取用户信息的地址
           user-info-uri: https://gitee.com/api/v5/user
           # 发起授权申请的地址
           authorization-uri: https://gitee.com/oauth/authorize
         github:
           user-name-attribute: login
 jackson:
   default-property-inclusion: non_null
 data:
   redis:
     url: ${REDIS_URL:redis://127.0.0.1:6379}

# Mybatis-Plus 配置
mybatis-plus:
 # 扫描mapper文件
 mapper-locations:
   - classpath:com/example/mapper/xml/*Mapper.xml

custom:
 # 自定义认证配置
 security:
   # 登录页面路径
   login-url: http://127.0.0.1:5173/login
   # 授权确认页面路径
   consent-page-uri: http://127.0.0.1:5173/consent
   # 设备码验证页面
   device-activate-uri: http://127.0.0.1:5173/activate
   # 设备码验证成功页面
   device-activated-uri: http://127.0.0.1:5173/activated
   # 不需要认证的地址
   ignore-uri-list: assets/**, /webjars/**, /login, /getCaptcha, /getSmsCaptcha, /error, /oauth2/consent/parameters, /test03, /favicon.ico, /qrCode/login/**
   # 当前认证服务访问的路径
   issuer-url: http://127.0.0.1:8080

server:
 servlet:
   session:
     cookie:
       domain: 127.0.0.1
```

修改完成后即可启动认证服务了。

### 前端
#### 初始化环境
1. 修改`./vue-login-page-example/.env.dev`文件，修改`VITE_OAUTH_CLIENT_ID`属性为`messaging-client`，仓库代码中是匿名token的客户端，这一步是可选的。

2. 在`./vue-login-page-example/`文件夹下打开cmd命令窗口。

3. 执行`npm install`命令安装依赖。

4. 依赖安装完成后执行`npm run dev`命令。

5. 浏览器打开 `http://127.0.0.1:5173` 即可看到与示例项目一致的页面。

## 部署指南
### 认证服务Docker部署
1. 从代码仓库拉取代码

```shell
git clone https://gitee.com/vains-Sofia/authorization-example.git
```

2. 目前项目中依赖的客户端信息、授权信息和授权确认信息都是基于Redis的，必须的客户端信息在项目启动时会自动初始化，如果需要自定义可以在`./authorization-server/src/main/java/com/example/repository/RedisRegisteredClientRepository.java`中查看`initClients`方法并自定义初始化内容。

3. 在MySQL数据库中创建数据库`authorization-example`，导入`./authorization-server/sql/authorization-example-rbac.sql`和`./authorization-server/sql/oauth2_third_account.sql` SQL文件，初始化RBAC所需数据库表和三方登录用户信息表。

4. 在认证服务根目录(Dockerfile所在目录)执行docker通过Dockerfile文件打包镜像命令

```shell
docker build -t authorization-server:1.0 .
```

5. 执行容器制作命令，自动启动
```shell
docker run -d -v  /usr/local/docker-temp/application/application.yml:/application/BOOT-INF/classes/application.yml --restart=always --name authorization-server --privileged=true -p 5000:5000 authorization-server:1.0
```

`/usr/local/docker-temp/application/application.yml`是服务器中的yml配置文件，`/application/BOOT-INF/classes/application.yml`是镜像内的配置文件，这里是指容器启动时挂载外部的配置文件，使用外部配置文件替换容器内配置文件，这样可更加方便的修改配置文件；无需每次更新配置建都要重新打包、制作容器等操作，重启即可。内容如下

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://${DB_HOST:192.168.72.88}:${DB_PORT:3306}/authorization-example?serverTimezone=Asia/Shanghai&userUnicode=true&characterEncoding=utf-8&ssl-mode=REQUIRED&serverTimezone=GMT%2B8
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:root}
  security:
    oauth2:
      client:
        registration:
          # 这个'gitee'就是registrationId
          gitee:
            # 指定oauth登录提供者，该oauth登录由provider中的gitee来处理
            provider: gitee
            # 客户端名字
            client-name: Sign in with Gitee
            # 认证方式
            authorization-grant-type: authorization_code
            # 客户端id，使用自己的gitee的客户端id
            client-id: dd8de6dfa9674cc307e18ca75616a0ded06126ddc4f95098da36e1fbfa141d0a
            # 客户端秘钥，使用自己的gitee的客户端秘钥
            client-secret: 59b069e525b84cac8fcb854148b623743eefd6bbe9d54433c006ec0c2f785c4d
            # 回调地址
            redirect-uri: ${custom.security.issuer-url}/login/oauth2/code/gitee
            # 申请scope列表
            scope:
              - emails
              - projects
          github:
            # security client默认实现了GitHub提供的oauth2登录
            provider: github
            client-id: da2bae230dd9838468d8
            client-secret: 507ab8690a935ed2cf278249d4f8290c9c48b025
            # 回调地址
            redirect-uri: ${custom.security.issuer-url}/login/oauth2/code/github
          wechat:
            # 微信登录配置
            provider: wechat
            # 客户端名字
            client-name: Sign in with WeChat
            # 认证方式
            authorization-grant-type: authorization_code
            # 客户端id，使用自己的微信的appid
            client-id: wx946ad2f955901214
            # 客户端秘钥，使用自己的微信的app secret
            client-secret: e4635ff2ed22c83294394ac818cf75a7
            # 回调地址
            redirect-uri: ${custom.security.issuer-url}/login/oauth2/code/wechat
            # 申请scope列表
            scope: snsapi_userinfo

        # oauth登录提供商
        provider:
          # 微信的OAuth2端点配置
          wechat:
            # 设置用户信息响应体中账号的字段
            user-name-attribute: nickname
            # 获取token的地址
            token-uri: https://api.weixin.qq.com/sns/oauth2/access_token
            # 获取用户信息的地址
            user-info-uri: https://api.weixin.qq.com/sns/userinfo
            # 发起授权申请的地址
            authorization-uri: https://open.weixin.qq.com/connect/oauth2/authorize
          # gitee的OAuth2端点配置
          gitee:
            # 设置用户信息响应体中账号的字段
            user-name-attribute: login
            # 获取token的地址
            token-uri: https://gitee.com/oauth/token
            # 获取用户信息的地址
            user-info-uri: https://gitee.com/api/v5/user
            # 发起授权申请的地址
            authorization-uri: https://gitee.com/oauth/authorize
          github:
            user-name-attribute: login
  jackson:
    default-property-inclusion: non_null
  data:
    redis:
      url: ${REDIS_URL:redis://192.168.72.88:6379}

# Mybatis-Plus 配置
mybatis-plus:
  # 扫描mapper文件
  mapper-locations:
    - classpath:com/example/mapper/xml/*Mapper.xml

custom:
  # 自定义认证配置
  security:
    # 登录页面路径
    login-url: http://k7fsqkhtbx.cdhttp.cn/login
    # 授权确认页面路径
    consent-page-uri: http://k7fsqkhtbx.cdhttp.cn/consent
    # 设备码验证页面
    device-activate-uri: http://k7fsqkhtbx.cdhttp.cn/activate
    # 设备码验证成功页面
    device-activated-uri: http://k7fsqkhtbx.cdhttp.cn/activated
    # 不需要认证的地址
    ignore-uri-list: assets/**, /webjars/**, /login, /getCaptcha, /getSmsCaptcha, /error, /oauth2/consent/parameters, /test03, /favicon.ico, /qrCode/login/**
    # 当前认证服务访问的路径
    issuer-url: http://kwqqr48rgo.cdhttp.cn

server:
  port: 5000
  servlet:
    session:
      cookie:
        domain: cdhttp.cn
```

### 前端项目nginx部署
1. 在服务器/Windows中打包都可以，看自己选择

2. 使用命令进入前端项目根目录

```shell
cd ./authorization-example/vue-login-page-example
```

3. 在`./vue-login-page-example/`下执行`npm install`命令安装依赖。

4. 依赖安装完成后执行`npm run build-only:prod`命令对项目进行打包。

5. 打包后在项目根目录生成一个`dist`目录，所有打包文件都在该目录中。

6. 将`dist`目录下的`assets`文件夹、`favicon.ico`和`index.html`文件放入`nginx`的`html`文件夹下。

7. `nginx`的`nginx.conf`配置文件中添加配置

```conf
location / {
    root   html;
    index  index.html index.htm;
			
    # 防止刷新404问题
    try_files $uri $uri/ /index.html;
}
```

8. 启动或刷新`nginx`配置

```shell
nginx -s reload
```
