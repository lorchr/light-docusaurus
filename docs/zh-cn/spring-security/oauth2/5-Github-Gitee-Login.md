
## 一、准备工作

### 1. 注册一个Github应用
1. 登录Github并[注册应用](https://github.com/settings/developers)
   - Application name:             Torch
   - Homepage URL:                 http://localhost:10010/home
   - Authorization callback URL:   http://localhost:10010/login/oauth2/code/github

2. 生成秘钥并保存
   - Client ID:                    701a063664c42f669d7b
   - Client secrets:               68cf372920e6ea6ded19d44a36fc4f2afe5aaec6

### 2. 注册一个Gitee 应用
1. 登录Gitee并[注册应用](https://gitee.com/oauth/applications)
   - Application name:             Torch
   - Homepage URL:                 http://localhost:10010/home
   - Authorization callback URL:   http://localhost:10010/login/oauth2/code/gitee

2. 生成秘钥并保存
   - Client ID:                    701a063664c42f669d7b
   - Client secrets:               68cf372920e6ea6ded19d44a36fc4f2afe5aaec6

### 3. 登录页面
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }
        html {
            height: 100%;
        }
        body {
            height: 100%;
        }
        .container {
            height: 100%;
            background-image: linear-gradient(to right, #fbc2eb, #a6c1ee);
        }
        .login-wrapper {
            background-color: #fff;
            width: 358px;
            height: 588px;
            border-radius: 15px;
            padding: 0 50px;
            position: relative;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
        .header {
            font-size: 38px;
            font-weight: bold;
            text-align: center;
            line-height: 200px;
        }
        .input-item {
            display: block;
            width: 100%;
            margin-bottom: 20px;
            border: 0;
            padding: 10px;
            border-bottom: 1px solid rgb(128, 125, 125);
            font-size: 15px;
            outline: none;
        }
        .input-item:placeholder {
            text-transform: uppercase;
        }
        .btn {
            text-align: center;
            padding: 10px;
            width: 100%;
            margin-top: 40px;
            background-image: linear-gradient(to right, #a6c1ee, #fbc2eb);
            color: #fff;
        }
        .msg {
            text-align: center;
            line-height: 88px;
        }
        a {
            text-decoration-line: none;
            color: #abc1ee;
        }
        /* 提示文字 */
        .text-placeholder {
            display: flex;
            font-size: 80%;
            color: #909399;
            justify-content: center;
        }
        /* 三方登录图标 */
        .third-box {
            text-align: center;
            margin-bottom: 0 !important;
        }
        .third-box img {
            position: relative;
            top: 3px;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="login-wrapper">
        <div class="header">Login</div>
        <div class="form-wrapper">
            <input type="text" name="username" placeholder="username" class="input-item">
            <input type="password" name="password" placeholder="password" class="input-item">
            <div class="btn">Login</div>
        </div>
        <div class="msg">
            Don't have account?
            <a href="#">Sign up</a>
        </div>
        <div class="text-placeholder">
            第三方登录
        </div>
        <!-- <a class="btn btn-light btn-block bg-white" href="/oauth2/authorization/gitee" role="link"
            style="text-transform: none;">
            Sign in with Gitee
        </a>
        <div>
            <a class="btn btn-light bg-white" href="/oauth2/authorization/github" role="link"
                style="text-transform: none;">
                <img width="24" style="margin-right: 5px;" alt="Sign in with GitHub"
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
                Github
            </a>
        </div> -->
        <div class="third-box">
            <a href="/oauth2/authorization/gitee" title="Gitee登录">
                <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" name="zi_tmGitee"
                     viewBox="0 0 2000 2000">
                     <path fill="red"
                          d="M898 1992q183 0 344-69.5t283-191.5q122-122 191.5-283t69.5-344q0-183-69.5-344T1525 477q-122-122-283-191.5T898 216q-184 0-345 69.5T270 477Q148 599 78.5 760T9 1104q0 183 69.5 344T270 1731q122 122 283 191.5t345 69.5zm199-400H448q-17 0-30.5-14t-13.5-30V932q0-89 43.5-163.5T565 649q74-45 166-45h616q17 0 30.5 14t13.5 31v111q0 16-13.5 30t-30.5 14H731q-54 0-93.5 39.5T598 937v422q0 17 14 30.5t30 13.5h416q55 0 94.5-39.5t39.5-93.5v-22q0-17-14-30.5t-31-13.5H842q-17 0-30.5-14t-13.5-31v-111q0-16 13.5-30t30.5-14h505q17 0 30.5 14t13.5 30v250q0 121-86.5 207.5T1097 1592z" />
                </svg>
            </a>

            <a href="/oauth2/authorization/github" title="GitHub登录">
                <img width="36" style="margin-right: 5px;" alt="Sign in with GitHub"
                     src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"/>
            </a>
        </div>
    </div>
</div>
</body>
</html>
```

## 二、开发应用
### 1. 配置文件

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          # https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
          github:
            provider: github
            client-name: Torch
            client-id: 701a063664c42f669d7b
            client-secret: 68cf372920e6ea6ded19d44a36fc4f2afe5aaec6
            # 回调地址 {baseUrl}/login/oauth2/code/{registrationId}
            redirect-uri: http://localhost:10010/login/oauth2/code/github
            # 授权范围
            scope:
              - user.email
              - read.user

          # https://gitee.com/api/v5/oauth_doc#/
          gitee:
            provider: gitee
            client-name: Torch
            client-id: 701a063664c42f669d7b
            client-secret: 68cf372920e6ea6ded19d44a36fc4f2afe5aaec6
            authorization-grant-type: authorization_code
            # 回调地址 {baseUrl}/login/oauth2/code/{registrationId}
            redirect-uri: http://localhost:10010/login/oauth2/code/gitee
            # 授权范围
            scope:
              - emails
              - user_info

        provider:
          github:
            user-name-attribute: login
            token-uri: https://api.github.com/oauth/access_token
            user-info-uri: https://api.github.com/user
            authorization-uri: https://api.github.com/login/oauth/authorize
            jwk-set-uri: https://api.github.com/login/oauth/

          gitee:
            # 用户名信息对应的字段属性
            user-name-attribute: login
            # 获取token的地址
            token-uri: https://gitee.com/oauth/token
            # 获取用户信息的地址
            user-info-uri: https://gitee.com/api/v5/user
            # 获取授权码的地址
            authorization-uri: https://gitee.com/oauth/authorize
```

### 2. Spring Security配置
```java

```

### 3. Spring Authenorization Server配置
```java


```

## 五、参考文档
- https://blog.csdn.net/weixin_43356507/article/details/131872353
- https://blog.csdn.net/u013810234/article/details/112911491
- https://backend.devrank.cn/traffic-information/7280119371463149605

- [官方Demo](https://github.com/spring-projects/spring-authorization-server/tree/main/samples/demo-authorizationserver/src/main/java/sample/federation)
- [Spring Security Client](https://docs.spring.io/spring-security/reference/servlet/oauth2/index.html)
- [Gitee OAuth2](https://gitee.com/api/v5/oauth_doc#/list-item-2)
- [Github Oauth2](https://docs.github.com/zh/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#1-request-a-users-github-identity)
- [JWT Token解析](https://jwt.io)
