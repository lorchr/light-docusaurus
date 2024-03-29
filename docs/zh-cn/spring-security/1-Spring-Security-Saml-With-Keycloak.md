
- [keycloak官网](https://www.keycloak.org/)
- [Keycloak基于smal2.0实现sso登陆操作](https://blog.csdn.net/weixin_46909938/article/details/134717672)
- [smal协议](https://blog.csdn.net/qq_38658567/article/details/130751505)
- [https://blog.csdn.net/qq_43437874/article/details/131198433](https://gitee.com/pearl-organization/study-spring-security-demo)
- [https://download.csdn.net/download/weixin_42101641/14960558](https://github.com/vdenotaris/spring-boot-security-saml-sample/network)

- [Springboot、React集成Okta SAML2单点登录](https://blog.csdn.net/qq_43169127/article/details/127772766)
- [Get Started with Spring Boot and SAML](https://developer.okta.com/blog/2022/08/05/spring-boot-saml)
- [Okta Spring Boot SAML Example Github](https://github.com/oktadev/okta-spring-boot-saml-example)

## 一、安装Keycloak

### 1. 运行Keycloak服务端
- [KeyCloak Container](https://quay.io/repository/keycloak/keycloak)
- [KeyCloak Container文档](https://www.keycloak.org/server/containers)
- [KeyCloak 修改端口](https://www.keycloak.org/server/hostname)

```shell
docker run --detach \
  --publish 8880:8080 \
  --env KEYCLOAK_ADMIN=admin \
  --env KEYCLOAK_ADMIN_PASSWORD=admin \
  --env KC_HOSTNAME_PORT=8880 \
  --ip 172.18.0.99 \
  --hostname idp.light.local \
  --add-host sp.light.local:10.106.136.62 \
  --network dev \
  --restart=no \
  --name keycloak \
  quay.io/keycloak/keycloak:24.0 start-dev

docker exec -it -u root keycloak /bin/bash

# 查看域名解析
cat /etc/hosts
# idp的ip为容器虚拟ip，用于自身识别
# sp的ip为物理机的ip，用于访问sp
172.18.0.99     idp.light.local
10.106.136.62   sp.light.local
```

- [Dashboard](http://idp.light.local:8880)
  - admin / admin

### 2. 创建一个Oidc客户端，测试Oidc登录

```shell
curl --include --location 'http://idp.light.local:8880/realms/Test/protocol/openid-connect/token' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'username=light' \
  --data-urlencode 'password=light' \
  --data-urlencode 'grant_type=password' \
  --data-urlencode 'client_id=oidc_client' \
  --data-urlencode 'client_secret=BnFwExLLBNtYPIq4E1aQbsvHKohOPKwg' \
  --data-urlencode 'scope=openid'

```


### 3. 配置本地Hosts

```shell
# idp和sp都在本地，直接使用 本地地址即可
127.0.0.1       idp.light.local
127.0.0.1       sp.light.local
```

### 4. 生成证书
```shell
openssl req -newkey rsa:2048 -nodes -keyout sp-private.key -x509 -days 365 -out sp-certificate.crt

```

## 二、配置Keycloak

### 1. 创建 Realm
1. 访问管理员控制台，进行管理员账号登陆，点击上图的Administration Console即可进入下面的页面

2. 进入页面后我们看到的是Master的Realm界面，我们需要创建自己的Realm

3. 创建Realm，填写Realm的名称

![img](./img/1/1-1.png)

![img](./img/1/1-2.png)

- Clients: 客户端管理
- Users: 用户管理
- Realm Setting: 查看SAML OIDC配置项

### 2. 创建 Clients

1. 创建客户端 Clients

![img](./img/1/1-3.png)

- Client type: SAML
- Client ID *: saml_client

2. 配置Service Provider的信息

![img](./img/1/1-4.png)

| 参数名                          | 参数值                                               | 描述                             |
| ------------------------------- | ---------------------------------------------------- | -------------------------------- |
| Root URL                        | http://sp.light.local:18080                          | 应用首页，前后端分离的填前端地址 |
| Home URL                        | /                                                    | 首页地址                         |
| Valid redirect URIs             | http://sp.light.local:18080/login/saml2/sso/keycloak | 白名单URL，设置回调URL即可       |
| Valid post logout redirect URIs | http://sp.light.local:18080/logout/saml2/slo         | 注销登录回调页                   |
| IDP-Initiated SSO URL name      |                                                      |                                  |
| IDP Initiated SSO Relay State   |                                                      |                                  |
| Master SAML Processing URL      | http://sp.light.local:18080/login/saml2/sso/keycloak | 回调URL，必填                    |

3. General settings

![img](./img/1/1-5.png)

4. Access settings

![img](./img/1/1-6.png)

5. SAML capabilities

![img](./img/1/1-7.png)

6. Signature and Encryption

![img](./img/1/1-8.png)

- Sign documents : Off 不需要校验文档内容
- Sign assertions: Off 校验 assertions 即可
- Signature algorithm : RSA_SHA256
- SAML signature key name : KEY_ID
- Canonicalization method : EXCLUSIVE_WITH_COMMENTS

7. Login settings & Logout settings

![img](./img/1/1-9.png)

8. 生成客户端的证书并导入到Keycloak

```shell
openssl req -newkey rsa:2048 -nodes -keyout sp-private.key -x509 -days 365 -out sp-certificate.crt

```

切换到客户端的Keys页面，点击 `Import Key` 导入 `sp-certificate.crt` 文件

![img](./img/1/1-10.png)

![img](./img/1/1-11.png)

9. 也可以使用Keycloak生成的jks作为秘钥配置到Spring Boot应用中

在keys界面导出一个`keycloak.jks`的文件，SpringBoot和keycloak交互时需要根据这个去生成请求参数

![img](./img/1/1-12.png)

这里设置的属性都需要配置到Spring Boot中，分别是keyEntryId keyPassword keystorePassword，此处设置均为keycloak

### 3. 创建 Users

1. 创建用户 Users，账号密码: light / light

![img](./img/1/1-13.png)

![img](./img/1/1-14.png)

![img](./img/1/1-15.png)

![img](./img/1/1-16.png)

### 4. 查看 Realm 的 SAML2 的元数据 metadata.xml 文件

1. 进入 `Realm Settings` 在 `General` 页签中

![img](./img/1/1-17.png)

2. 点击 `Endpoints` - `SAML 2.0 Identity Provider Metadata` 访问元数据页面 `http://idp.light.local:8880/realms/Test/protocol/saml/descriptor`

![img](./img/1/1-18.png)

3. 讲 `X509Certificate` 的值导出来，作为idp的证书文件 `keycloak.crt`

### 5. 最后
1. 配置完成后将得到两个文件 `keycloak.jks` 和 `keycloak.crt`，存下后面备用

2. 如果 `Service Provider` 使用本地生成的 `sp-private.key` 和 `sp-certificate.crt` ，则不需要使用 `keycloak.jks` 文件，但是需要将 `sp-certificate.crt` 导入到Client中

3. 如果 `Service Provider` 使用 `keycloak.jks` 作为私钥和证书，则需要将 `keycloak.jks` 配置到应用中

4. 服务端证书文件 `keycloak.crt` 是可选的，一般通过服务端的元数据端点可以直接获取到

## 三、配置Okta

### 1. 注册一个自己的域okta账号 [okta账户创建](https://developer.okta.com/signup)
1. 选择 `Workforce Identity Cloud` - `Okta Developer Edition Service`
2. 使用github登录
3. https://dev-70304605-admin.okta.com/admin/getting-started

### 2. 登录刚刚创建的okta-admin域，创建一个Application
1. 点击创建应用 Create App Integration

![](./img/1/1-19.png)

2. 选择SAML 并点击next

![](./img/1/1-20.png)

3. 填写必要参数填写参数

![](./img/1/1-21.png)

![](./img/1/1-22.png)

- Single Sign On URL: http://sp.light.local:8080/saml2/authenticate/okta
- Audience Restriction: http://sp.light.local:8080/saml2/service-provider-metadata/okta

![](./img/1/1-23.png)

注意：Single sign on URL表示登录成功后回调的地址，一般为后端的某个接口地址，后续会有用到

4. 选择创建内部应用程序、应用创建完毕

![](./img/1/1-24.png)

5. 打开应用，查看SAML2登录证书、提取onelogin必要参数，后续java配置需要用到

![](./img/1/1-25.png)

https://dev-70304605.okta.com/app/exkg3seq7hh0uUigL5d7/sso/saml/metadata

### 3. 通过上一步可以打开一个saml的配置页面，提取图中相关参数

![](./img/1/1-26.png)

```xml
<md:EntityDescriptor
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="http://www.okta.com/exkg3seq7hh0uUigL5d7">
    <SCRIPT id="allow-copy_script">(function agent() { let unlock = false document.addEventListener('allow_copy', (event) => { unlock = event.detail.unlock }) const copyEvents = [ 'copy', 'cut', 'contextmenu', 'selectstart', 'mousedown', 'mouseup', 'mousemove', 'keydown', 'keypress', 'keyup', ] const rejectOtherHandlers = (e) => { if (unlock) { e.stopPropagation() if (e.stopImmediatePropagation) e.stopImmediatePropagation() } } copyEvents.forEach((evt) => { document.documentElement.addEventListener(evt, rejectOtherHandlers, { capture: true, }) }) })()</SCRIPT>
    <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo
                xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>MIIDqDCCApCgAwIBAgIGAY6IWEGpMA0GCSqGSIb3DQEBCwUAMIGUMQswCQYDVQQGEwJVUzETMBEG A1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsGA1UECgwET2t0YTEU MBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi03MDMwNDYwNTEcMBoGCSqGSIb3DQEJ ARYNaW5mb0Bva3RhLmNvbTAeFw0yNDAzMjkwMzUzMjlaFw0zNDAzMjkwMzU0MjhaMIGUMQswCQYD VQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsG A1UECgwET2t0YTEUMBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi03MDMwNDYwNTEc MBoGCSqGSIb3DQEJARYNaW5mb0Bva3RhLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC ggEBAM7NL8KfCPW7KPDp8hFFM2d8ToORvy9XlyoqXlhLwxU46ZQdaTeKhrPSVJIjf89YFY0OrUSK qBsSGSHaOOKDBvSe9CzgAGW434WzeWf+I9QqMgYf3aCxYF5O5aoL+DjWxb+jFc+zr6sbUkB2hNJm AVl0FNADSt6bE3v3blIyJeTg0qQWyFwLSL+Fnr3CTW3obVfRYq3cdykkArSpAk/NlY47dsMsPSu3 fb7Ph5tcaqKvuo0QIyKAex+7Myp74K7feQWMH/7Ue9/UP+LcIkzmNCFruDuJ+PkPXqhLcnNEYzYI BGJkl1YvMMJMUI2GVaN2Pvqlv9jwUResGf4faj/J2AMCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEA kBUznn8pmZgEiTg0paQJWqPtNsQqxjgUniDlpN994OMyWR6+k6zTySmsBfTNPKcEq1ytROXtz7Rm iZRMJF+svpGRCXTVNcDfkxITK7h4Wgonb7l9MdKlB5+ai+ICqxBZezLYwhVvVqk7e3n+0ZDhDc1I VH/sQwPchHS0VGoI63S6zW3ElM7vGU6tPMkub6+uGMzy1Njwk4xT78S+RJLtu21jPE/1p62gry9A c10WY+vJcjrRBKryWfPgrcA6KoltgXwN8xp/O6vRpWbgtnZmF0A/BCkRaVzPFO9zyUO28TUawIry cThB5sT0DHiJsaSwH3P4fmGuiLaIbaNlg0t2OQ==</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://dev-70304605.okta.com/app/dev-70304605_springbootsaml_1/exkg3seq7hh0uUigL5d7/slo/saml"/>
        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://dev-70304605.okta.com/app/dev-70304605_springbootsaml_1/exkg3seq7hh0uUigL5d7/slo/saml"/>
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</md:NameIDFormat>
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://dev-70304605.okta.com/app/dev-70304605_springbootsaml_1/exkg3seq7hh0uUigL5d7/sso/saml"/>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://dev-70304605.okta.com/app/dev-70304605_springbootsaml_1/exkg3seq7hh0uUigL5d7/sso/saml"/>
    </md:IDPSSODescriptor>
</md:EntityDescriptor>

```

- idp_entityid: http://www.okta.com/exkg3seq7hh0uUigL5d7
- single_sign_on_service_url: https://dev-70304605.okta.com/app/dev-70304605_springbootsaml_1/exkg3seq7hh0uUigL5d7/sso/saml
- x509cert: MIIDqDCCApCgAwIBAgIGAY6IWEGpMA0GCSqGSIb3DQEBCwUAMIGUMQswCQYDVQQGEwJVUzETMBEG A1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsGA1UECgwET2t0YTEU MBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi03MDMwNDYwNTEcMBoGCSqGSIb3DQEJ ARYNaW5mb0Bva3RhLmNvbTAeFw0yNDAzMjkwMzUzMjlaFw0zNDAzMjkwMzU0MjhaMIGUMQswCQYD VQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsG A1UECgwET2t0YTEUMBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi03MDMwNDYwNTEc MBoGCSqGSIb3DQEJARYNaW5mb0Bva3RhLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC ggEBAM7NL8KfCPW7KPDp8hFFM2d8ToORvy9XlyoqXlhLwxU46ZQdaTeKhrPSVJIjf89YFY0OrUSK qBsSGSHaOOKDBvSe9CzgAGW434WzeWf+I9QqMgYf3aCxYF5O5aoL+DjWxb+jFc+zr6sbUkB2hNJm AVl0FNADSt6bE3v3blIyJeTg0qQWyFwLSL+Fnr3CTW3obVfRYq3cdykkArSpAk/NlY47dsMsPSu3 fb7Ph5tcaqKvuo0QIyKAex+7Myp74K7feQWMH/7Ue9/UP+LcIkzmNCFruDuJ+PkPXqhLcnNEYzYI BGJkl1YvMMJMUI2GVaN2Pvqlv9jwUResGf4faj/J2AMCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEA kBUznn8pmZgEiTg0paQJWqPtNsQqxjgUniDlpN994OMyWR6+k6zTySmsBfTNPKcEq1ytROXtz7Rm iZRMJF+svpGRCXTVNcDfkxITK7h4Wgonb7l9MdKlB5+ai+ICqxBZezLYwhVvVqk7e3n+0ZDhDc1I VH/sQwPchHS0VGoI63S6zW3ElM7vGU6tPMkub6+uGMzy1Njwk4xT78S+RJLtu21jPE/1p62gry9A c10WY+vJcjrRBKryWfPgrcA6KoltgXwN8xp/O6vRpWbgtnZmF0A/BCkRaVzPFO9zyUO28TUawIry cThB5sT0DHiJsaSwH3P4fmGuiLaIbaNlg0t2OQ==

### 4. 配置Logout

1. 生成证书
```shell
openssl req -newkey rsa:2048 -nodes -keyout rp-private.key -x509 -days 365 -out rp-certificate.crt
```

2. 导入证书，并填入logout地址

![](./img/1/1-27.png)

- Single Logout URL: http://sp.light.local:8080/logout/saml2/slo
- SP Issuer : http://sp.light.local:8080/saml2/service-provider-metadata/okta

## 四、配置AD FS

## 五、Spring应用编码

### 1. 首页Html
```html
<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:th="https://www.thymeleaf.org" xmlns:sec="https://www.thymeleaf.org/thymeleaf-extras-springsecurity5">
<head>
    <title>Spring Security - SAML 2.0 Login & Logout</title>
    <meta charset="utf-8" />
    <style>
        span, dt {
            font-weight: bold;
        }
    </style>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
</head>
<body>
<div class="container">
    <ul class="nav">
        <li class="nav-item">
            <form th:action="@{/logout}" method="post">
                <button class="btn btn-primary" id="rp_logout_button" type="submit">
                    RP-initiated Logout
                </button>
            </form>
        </li>
    </ul>
    </div>
    <main role="main" class="container">
        <h1 class="mt-5">SAML 2.0 Login & Single Logout with Spring Security</h1>
        <p class="lead">You are successfully logged in as <span sec:authentication="name"></span></p>
        <p class="lead">You're email address is <span th:text="${emailAddress}"></span></p>
        <h2 class="mt-2">All Your Attributes</h2>
        <dl th:each="userAttribute : ${userAttributes}">
            <dt th:text="${userAttribute.key}"></dt>
            <dd th:text="${userAttribute.value}"></dd>
        </dl>

        <h6>Visit the <a href="https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-saml2" target="_blank">SAML 2.0 Login & Logout</a> documentation for more details.</h6>
    </main>
</div>
</body>
</html>

```

### 2. 导入相关依赖
```xml
<dependencies>
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-thymeleaf</artifactId>
  </dependency>

  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
  </dependency>

  <dependency>
      <groupId>org.springframework.security</groupId>
      <artifactId>spring-security-saml2-service-provider</artifactId>
  </dependency>

  <dependency>
      <groupId>org.thymeleaf.extras</groupId>
      <artifactId>thymeleaf-extras-springsecurity6</artifactId>
  </dependency>

  <dependency>
      <groupId>org.projectlombok</groupId>
      <artifactId>lombok</artifactId>
      <optional>true</optional>
  </dependency>

  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
      <scope>test</scope>
  </dependency>
  <dependency>
      <groupId>org.springframework.security</groupId>
      <artifactId>spring-security-test</artifactId>
      <scope>test</scope>
  </dependency>
</dependencies>
```

### 3. 配置 application.yaml

```yaml
spring:
  profiles:
#    active: azure-ad
    active: keycloak

```

keycloak配置文件`application-keycloak.yaml`
```yaml
server:
  port: 8080

logging.level:
  org.springframework.security: TRACE

spring:
  security:
    filter:
      dispatcher-types: async, error, request, forward
    saml2:
      relyingparty:
        registration:
          # 依赖方的实体ID，任意的值，你可以选择它来区分不同的注册
          # SP元数据：http://sp.light.local:18080/saml2/service-provider-metadata/keycloak
          keycloak:
            # entity-id 需要和clientid保持一致，否则会认证失败
#            entity-id: "{baseUrl}"
            entity-id: "saml_client"
            # 用于构建签名和解密的 Saml2X509Credential
            signing:
              credentials:
                - private-key-location: classpath:credentials/rp-private.key
                  # 证书文件需要导入到Client中 
                  certificate-location: classpath:credentials/rp-certificate.crt
            acs:
               # 登录的回调地址，即客户端的 Master SAML Processing URL
               location: "{baseUrl}/login/saml2/sso/{registrationId}"
            # 登出配置
            singlelogout:
              binding: POST
              # 退出登录的回调地址 Valid post logout redirect URIs
              url: "{baseUrl}/logout/saml2/slo"
              responseUrl: "{baseUrl}/logout/saml2/slo"
            assertingparty:
              entity-id: http://idp.light.local:8880/realms/Test
              # IDP的 元数据访问地址
              metadata-uri: http://idp.light.local:8880/realms/Test/protocol/saml/descriptor
              singlesignon:
               # 登录认证的地址，从元数据中获取 
                url: http://idp.light.local:8880/auth/realms/Test/protocol/saml
                sign-request: false
#              verification:
#                credentials:
#                  # IDP 的证书，从元数据中获取
#                  - certificate-location: classpath:keycloak/keycloak.crt

```

### 4. Spring Security 配置类，启用SAML2认证

```java
package com.light.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.security.saml2.Saml2RelyingPartyProperties;
import org.springframework.boot.autoconfigure.security.saml2.Saml2RelyingPartyProperties.Registration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.saml2.core.Saml2X509Credential;
import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrations;
import org.springframework.security.web.SecurityFilterChain;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.interfaces.RSAPrivateKey;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    /**
     * Auzre-AD配置类，使用的别人的客户端账号，地址需要和设置保持一致
     */
    @Bean
    @Profile("azure-ad")
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
        // @formatter:off
		http
			.authorizeHttpRequests((authorize) -> authorize
				.requestMatchers("/error", "/saml/metadata").permitAll()
				.anyRequest().authenticated()
			)
			.saml2Login((saml2) -> saml2.loginProcessingUrl("/saml/SSO"))
			.saml2Logout((saml2) -> saml2.logoutRequest((request) -> request.logoutUrl("/saml/logout")))
			.saml2Logout((saml2) -> saml2.logoutResponse((response) -> response.logoutUrl("/saml/SingleLogout")))
			.saml2Metadata((saml2) -> saml2.metadataUrl("/saml/metadata"));
		// @formatter:on
        return http.build();
    }

    /**
     * 通用配置类
     */
    @Bean
    // @Profile("keycloak")
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // @formatter:off
        http
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/error", "/saml/metadata").permitAll()
                        .anyRequest().authenticated()
                )
                // /login/saml2/sso/{registrationId}
                .saml2Login(Customizer.withDefaults())
                // /logout/saml2/slo
                .saml2Logout(Customizer.withDefaults())
                // /saml2/service-provider-metadata/{registrationId}
                .saml2Metadata(Customizer.withDefaults());
        // @formatter:on
        return http.build();
    }


    // @Bean
    public InMemoryRelyingPartyRegistrationRepository repository(Saml2RelyingPartyProperties properties,
            @Value("classpath:credentials/rp-private.key") RSAPrivateKey key,
            @Value("classpath:credentials/rp-certificate.crt") File cert) {
        Saml2X509Credential credential = Saml2X509Credential.signing(key, x509Certificate(cert));
        Registration registration = properties.getRegistration().values().iterator().next();
        return new InMemoryRelyingPartyRegistrationRepository(RelyingPartyRegistrations
                .collectionFromMetadataLocation(registration.getAssertingparty().getMetadataUri()).stream()
                .map((builder) -> builder.registrationId(UUID.randomUUID().toString())
                        .entityId(registration.getEntityId())
                        .assertionConsumerServiceLocation(registration.getAcs().getLocation())
                        .singleLogoutServiceLocation(registration.getSinglelogout().getUrl())
                        .singleLogoutServiceResponseLocation(registration.getSinglelogout().getResponseUrl())
                        .signingX509Credentials((credentials) -> credentials.add(credential)).build())
                .collect(Collectors.toList()));
    }


    @Bean
    public InMemoryRelyingPartyRegistrationRepository repositorys(Saml2RelyingPartyProperties properties,
            @Value("classpath:credentials/rp-private.key") RSAPrivateKey key,
            @Value("classpath:credentials/rp-certificate.crt") File cert) {
        List<RelyingPartyRegistration> registrationList = new ArrayList<>();

        Saml2X509Credential credential = Saml2X509Credential.signing(key, x509Certificate(cert));

        Map<String, Registration> registrationMap = properties.getRegistration();
        for (Map.Entry<String, Registration> entry : registrationMap.entrySet()) {
            String registrationId = entry.getKey();
            Registration registration = entry.getValue();
            List<RelyingPartyRegistration> registrations = RelyingPartyRegistrations
                    .collectionFromMetadataLocation(registration.getAssertingparty().getMetadataUri())
                    .stream().map((builder) -> builder.registrationId(registrationId)
                            .entityId(registration.getEntityId())
                            .assertionConsumerServiceLocation(registration.getAcs().getLocation())
                            .singleLogoutServiceLocation(registration.getSinglelogout().getUrl())
                            .singleLogoutServiceResponseLocation(registration.getSinglelogout().getResponseUrl())
                            .signingX509Credentials((credentials) -> credentials.add(credential)).build()
                    ).collect(Collectors.toList());

            registrationList.addAll(registrations);
        }
        return new InMemoryRelyingPartyRegistrationRepository(registrationList);
    }

    public X509Certificate x509Certificate(File location) {
        try (InputStream source = new FileInputStream(location)) {
            return (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(source);
        } catch (CertificateException | IOException ex) {
            throw new IllegalArgumentException(ex);
        }
    }

}

```

### 5. 测试接口

```java
package com.light.auth.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.saml2.provider.service.authentication.Saml2AuthenticatedPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

	@GetMapping("/")
	public String index(Model model, @AuthenticationPrincipal Saml2AuthenticatedPrincipal principal) {
		String emailAddress = principal.getFirstAttribute("email");
		model.addAttribute("emailAddress", emailAddress);
		model.addAttribute("userAttributes", principal.getAttributes());
		return "index";
	}

}

```

### 6. 启动类
```java
package com.light.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SamlApplication {

    public static void main(String[] args) {
        SpringApplication.run(SamlApplication.class, args);
    }

}

```

### 7. 其他文件

1. SP证书 `rp-certificate.crt`

```pem
-----BEGIN CERTIFICATE-----
MIICgTCCAeoCCQCuVzyqFgMSyDANBgkqhkiG9w0BAQsFADCBhDELMAkGA1UEBhMC
VVMxEzARBgNVBAgMCldhc2hpbmd0b24xEjAQBgNVBAcMCVZhbmNvdXZlcjEdMBsG
A1UECgwUU3ByaW5nIFNlY3VyaXR5IFNBTUwxCzAJBgNVBAsMAnNwMSAwHgYDVQQD
DBdzcC5zcHJpbmcuc2VjdXJpdHkuc2FtbDAeFw0xODA1MTQxNDMwNDRaFw0yODA1
MTExNDMwNDRaMIGEMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3RvbjES
MBAGA1UEBwwJVmFuY291dmVyMR0wGwYDVQQKDBRTcHJpbmcgU2VjdXJpdHkgU0FN
TDELMAkGA1UECwwCc3AxIDAeBgNVBAMMF3NwLnNwcmluZy5zZWN1cml0eS5zYW1s
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRu7/EI0BlNzMEBFVAcbx+lLos
vzIWU+01dGTY8gBdhMQNYKZ92lMceo2CuVJ66cUURPym3i7nGGzoSnAxAre+0YIM
+U0razrWtAUE735bkcqELZkOTZLelaoOztmWqRbe5OuEmpewH7cx+kNgcVjdctOG
y3Q6x+I4qakY/9qhBQIDAQABMA0GCSqGSIb3DQEBCwUAA4GBAAeViTvHOyQopWEi
XOfI2Z9eukwrSknDwq/zscR0YxwwqDBMt/QdAODfSwAfnciiYLkmEjlozWRtOeN+
qK7UFgP1bRl5qksrYX5S0z2iGJh0GvonLUt3e20Ssfl5tTEDDnAEUMLfBkyaxEHD
RZ/nbTJ7VTeZOSyRoVn5XHhpuJ0B
-----END CERTIFICATE-----

```

2. SP私钥 `rp-private.key`

```pem
-----BEGIN PRIVATE KEY-----
MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBANG7v8QjQGU3MwQE
VUBxvH6Uuiy/MhZT7TV0ZNjyAF2ExA1gpn3aUxx6jYK5UnrpxRRE/KbeLucYbOhK
cDECt77Rggz5TStrOta0BQTvfluRyoQtmQ5Nkt6Vqg7O2ZapFt7k64Sal7AftzH6
Q2BxWN1y04bLdDrH4jipqRj/2qEFAgMBAAECgYEAj4ExY1jjdN3iEDuOwXuRB+Nn
x7pC4TgntE2huzdKvLJdGvIouTArce8A6JM5NlTBvm69mMepvAHgcsiMH1zGr5J5
wJz23mGOyhM1veON41/DJTVG+cxq4soUZhdYy3bpOuXGMAaJ8QLMbQQoivllNihd
vwH0rNSK8LTYWWPZYIECQQDxct+TFX1VsQ1eo41K0T4fu2rWUaxlvjUGhK6HxTmY
8OMJptunGRJL1CUjIb45Uz7SP8TPz5FwhXWsLfS182kRAkEA3l+Qd9C9gdpUh1uX
oPSNIxn5hFUrSTW1EwP9QH9vhwb5Vr8Jrd5ei678WYDLjUcx648RjkjhU9jSMzIx
EGvYtQJBAMm/i9NR7IVyyNIgZUpz5q4LI21rl1r4gUQuD8vA36zM81i4ROeuCly0
KkfdxR4PUfnKcQCX11YnHjk9uTFj75ECQEFY/gBnxDjzqyF35hAzrYIiMPQVfznt
YX/sDTE2AdVBVGaMj1Cb51bPHnNC6Q5kXKQnj/YrLqRQND09Q7ParX0CQQC5NxZr
9jKqhHj8yQD6PlXTsY4Occ7DH6/IoDenfdEVD5qlet0zmd50HatN2Jiqm5ubN7CM
INrtuLp4YHbgk1mi
-----END PRIVATE KEY-----
```

3. keycloak证书 `keycloak.crt`

```pem
-----BEGIN CERTIFICATE-----
MIIClzCCAX8CBgGOXx1fDTANBgkqhkiG9w0BAQsFADAPMQ0wCwYDVQQDDARUZXN0
MB4XDTI0MDMyMTAzNDQwNFoXDTM0MDMyMTAzNDU0NFowDzENMAsGA1UEAwwEVGVz
dDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANTO3f8YGE20Ori88Cf9
AEivwGJ1THJw930a0kIXtqpWHaPtYjvUkoSKB/2TaisHQGLF8M6WSpVOWHyP/KNr
mdLWJBXRrUVUN1uWu+zY30+sfgG7ScN8Fih8uoopBEJ7SHddkE07fI1uJl8jyoTD
XSfj64M0nVTmu1akgYDVgT6kvsIK9kJAL8KrnHqFR+lidBtn19TVp+elvFfIGOD8
CgozUmZ89crMrbncLpDT2P0nd+PMM5RGVB5jR3LfFcG3KxwnG0FRP7OWeR7f9qOH
jA8Nz1YiWisRX7YLVzzKT7zr0D4/NJrzPLQTCYWJ8KV/B2aKoaI4WKAp4CjJoQlM
aXsCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAVsed5AMVwGbu0HIj7DJ3H3Gil+97
3nm+zHHxYVNd5vBxWwHuKkrqpV5y2sf2xtx2cOcZN41NnqvOXU8s0y0MkSwxdbcb
xg5ooznKNcL9T6qn85MjGlw6Ei8cZZs97GHnQ8QQAqjEZDgHvNLDu72P7XJmksA7
E4kfSCK60Ok+jVEGYvx3XXAt4qT3xKUwYHqrnwAWO0P1+ylz+RrFX1SGZ9+HBXA8
7EntJbJQfdvLbTAgVMBd/6nxRNM7y07AZCAscfQ00BtNiQDBj54sfEV2qza29Ba2
CObN+bAfgzWZYu1jFb8j7Hkl94/JplgcSZTKJjWzAQtTR5Mxe1mjbgGt2Q==
-----END CERTIFICATE-----

```

## 六、测试

### 1. Keycloak登录
1. 浏览器访问 `http://sp.light.local:8080/`

2. 请求未认证，跳转到认证端点  `http://sp.light.local:8080/saml2/authenticate/keycloak`

3. 认证端点构建请求XML并跳转到 IDP 进行认证 `http://idp.light.local:8880/realms/Test/protocol/saml`

```shell
SAMLRequest: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c2FtbDJwOkF1dGhuUmVxdWVzdCB4bWxuczpzYW1sMnA9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpwcm90b2NvbCIgQXNzZXJ0aW9uQ29uc3VtZXJTZXJ2aWNlVVJMPSJodHRwOi8vc3AubGlnaHQubG9jYWw6ODA4MC9sb2dpbi9zYW1sMi9zc28va2V5Y2xvYWsiIERlc3RpbmF0aW9uPSJodHRwOi8vaWRwLmxpZ2h0LmxvY2FsOjg4ODAvcmVhbG1zL1Rlc3QvcHJvdG9jb2wvc2FtbCIgRm9yY2VBdXRobj0iZmFsc2UiIElEPSJBUlFlMDA3ZTU5LTBlOTYtNDUxMC04YWE5LTlkYjQwMTIwNDRiYSIgSXNQYXNzaXZlPSJmYWxzZSIgSXNzdWVJbnN0YW50PSIyMDI0LTAzLTI3VDExOjA4OjI1LjMzNFoiIFByb3RvY29sQmluZGluZz0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmJpbmRpbmdzOkhUVFAtUE9TVCIgVmVyc2lvbj0iMi4wIj48c2FtbDI6SXNzdWVyIHhtbG5zOnNhbWwyPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5zYW1sX2NsaWVudDwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz4KPGRzOlJlZmVyZW5jZSBVUkk9IiNBUlFlMDA3ZTU5LTBlOTYtNDUxMC04YWE5LTlkYjQwMTIwNDRiYSI+CjxkczpUcmFuc2Zvcm1zPgo8ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnI2VudmVsb3BlZC1zaWduYXR1cmUiLz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPlUvZHBGREd6WENZajhwbU94QVluUlNCWExKdUMzblhONmdWZjJ2eFVKaHc9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgpTWkNSbnZ4RWc4UXZWbEN5T3JpMlRSSVBLSm9qMWtlWVY1TFlSellESzlTeGZjc2dFWUY3SXRZUVQ5QXJDeXRlT25HQk5FTmt6bUxzJiMxMzsKdjVjeXVqeERzcXJNd1FHUFJ1WTkwNUoweVpNcUY3b0tvM0prTnNzajBNMlNUMkV1QzVqZVlOTmFUdGdXRWw1L0JyK1RxR1RRaGhmWSYjMTM7ClJHNlV2OCthMjRQdjZ4bDRmVU09CjwvZHM6U2lnbmF0dXJlVmFsdWU+CjxkczpLZXlJbmZvPjxkczpYNTA5RGF0YT48ZHM6WDUwOUNlcnRpZmljYXRlPk1JSUNnVENDQWVvQ0NRQ3VWenlxRmdNU3lEQU5CZ2txaGtpRzl3MEJBUXNGQURDQmhERUxNQWtHQTFVRUJoTUNWVk14RXpBUkJnTlYKQkFnTUNsZGhjMmhwYm1kMGIyNHhFakFRQmdOVkJBY01DVlpoYm1OdmRYWmxjakVkTUJzR0ExVUVDZ3dVVTNCeWFXNW5JRk5sWTNWeQphWFI1SUZOQlRVd3hDekFKQmdOVkJBc01Bbk53TVNBd0hnWURWUVFEREJkemNDNXpjSEpwYm1jdWMyVmpkWEpwZEhrdWMyRnRiREFlCkZ3MHhPREExTVRReE5ETXdORFJhRncweU9EQTFNVEV4TkRNd05EUmFNSUdFTVFzd0NRWURWUVFHRXdKVlV6RVRNQkVHQTFVRUNBd0sKVjJGemFHbHVaM1J2YmpFU01CQUdBMVVFQnd3SlZtRnVZMjkxZG1WeU1SMHdHd1lEVlFRS0RCUlRjSEpwYm1jZ1UyVmpkWEpwZEhrZwpVMEZOVERFTE1Ba0dBMVVFQ3d3Q2MzQXhJREFlQmdOVkJBTU1GM053TG5Od2NtbHVaeTV6WldOMWNtbDBlUzV6WVcxc01JR2ZNQTBHCkNTcUdTSWIzRFFFQkFRVUFBNEdOQURDQmlRS0JnUURSdTcvRUkwQmxOek1FQkZWQWNieCtsTG9zdnpJV1UrMDFkR1RZOGdCZGhNUU4KWUtaOTJsTWNlbzJDdVZKNjZjVVVSUHltM2k3bkdHem9TbkF4QXJlKzBZSU0rVTByYXpyV3RBVUU3MzVia2NxRUxaa09UWkxlbGFvTwp6dG1XcVJiZTVPdUVtcGV3SDdjeCtrTmdjVmpkY3RPR3kzUTZ4K0k0cWFrWS85cWhCUUlEQVFBQk1BMEdDU3FHU0liM0RRRUJDd1VBCkE0R0JBQWVWaVR2SE95UW9wV0VpWE9mSTJaOWV1a3dyU2tuRHdxL3pzY1IwWXh3d3FEQk10L1FkQU9EZlN3QWZuY2lpWUxrbUVqbG8KeldSdE9lTitxSzdVRmdQMWJSbDVxa3NyWVg1UzB6MmlHSmgwR3ZvbkxVdDNlMjBTc2ZsNXRURUREbkFFVU1MZkJreWF4RUhEUlovbgpiVEo3VlRlWk9TeVJvVm41WEhocHVKMEI8L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48L3NhbWwycDpBdXRoblJlcXVlc3Q+
RelayState: 16dbd5be-6446-419c-b6f6-7a7bf8c30f1c

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:AuthnRequest
    xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" AssertionConsumerServiceURL="http://sp.light.local:8080/login/saml2/sso/keycloak" Destination="http://idp.light.local:8880/realms/Test/protocol/saml" ForceAuthn="false" ID="ARQe007e59-0e96-4510-8aa9-9db4012044ba" IsPassive="false" IssueInstant="2024-03-27T11:08:25.334Z" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Version="2.0">
    <saml2:Issuer
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">saml_client
    </saml2:Issuer>
    <ds:Signature
        xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:SignedInfo>
            <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
            <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
            <ds:Reference URI="#ARQe007e59-0e96-4510-8aa9-9db4012044ba">
                <ds:Transforms>
                    <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                    <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                </ds:Transforms>
                <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                <ds:DigestValue>U/dpFDGzXCYj8pmOxAYnRSBXLJuC3nXN6gVf2vxUJhw=</ds:DigestValue>
            </ds:Reference>
        </ds:SignedInfo>
        <ds:SignatureValue>
SZCRnvxEg8QvVlCyOri2TRIPKJoj1keYV5LYRzYDK9SxfcsgEYF7ItYQT9ArCyteOnGBNENkzmLs&#13;
v5cyujxDsqrMwQGPRuY905J0yZMqF7oKo3JkNssj0M2ST2EuC5jeYNNaTtgWEl5/Br+TqGTQhhfY&#13;
RG6Uv8+a24Pv6xl4fUM=
</ds:SignatureValue>
        <ds:KeyInfo>
            <ds:X509Data>
                <ds:X509Certificate>MIICgTCCAeoCCQCuVzyqFgMSyDANBgkqhkiG9w0BAQsFADCBhDELMAkGA1UEBhMCVVMxEzARBgNV
BAgMCldhc2hpbmd0b24xEjAQBgNVBAcMCVZhbmNvdXZlcjEdMBsGA1UECgwUU3ByaW5nIFNlY3Vy
aXR5IFNBTUwxCzAJBgNVBAsMAnNwMSAwHgYDVQQDDBdzcC5zcHJpbmcuc2VjdXJpdHkuc2FtbDAe
Fw0xODA1MTQxNDMwNDRaFw0yODA1MTExNDMwNDRaMIGEMQswCQYDVQQGEwJVUzETMBEGA1UECAwK
V2FzaGluZ3RvbjESMBAGA1UEBwwJVmFuY291dmVyMR0wGwYDVQQKDBRTcHJpbmcgU2VjdXJpdHkg
U0FNTDELMAkGA1UECwwCc3AxIDAeBgNVBAMMF3NwLnNwcmluZy5zZWN1cml0eS5zYW1sMIGfMA0G
CSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRu7/EI0BlNzMEBFVAcbx+lLosvzIWU+01dGTY8gBdhMQN
YKZ92lMceo2CuVJ66cUURPym3i7nGGzoSnAxAre+0YIM+U0razrWtAUE735bkcqELZkOTZLelaoO
ztmWqRbe5OuEmpewH7cx+kNgcVjdctOGy3Q6x+I4qakY/9qhBQIDAQABMA0GCSqGSIb3DQEBCwUA
A4GBAAeViTvHOyQopWEiXOfI2Z9eukwrSknDwq/zscR0YxwwqDBMt/QdAODfSwAfnciiYLkmEjlo
zWRtOeN+qK7UFgP1bRl5qksrYX5S0z2iGJh0GvonLUt3e20Ssfl5tTEDDnAEUMLfBkyaxEHDRZ/n
bTJ7VTeZOSyRoVn5XHhpuJ0B</ds:X509Certificate>
            </ds:X509Data>
        </ds:KeyInfo>
    </ds:Signature>
</saml2p:AuthnRequest>
```

4. 跳转到IDP的登录页面 `http://idp.light.local:8880/realms/Test/login-actions/authenticate?client_id=saml_client&tab_id=RVN4eRYh270`

5. 输入账号密码登录，参数地址 `http://idp.light.local:8880/realms/Test/login-actions/authenticate?session_code=MvMW4bA0BC3Bupw7JKv1CNAqGoT9NGisn7OCuOTiYXo&execution=aafd808a-c8f5-43e9-86f9-b8b972bcef00&client_id=saml_client&tab_id=RVN4eRYh270` 携带的Form表单参数为 `username=light&password=light&credentialId=`

6. 认证成功，回调到SP的认证端点 `http://sp.light.local:8080/login/saml2/sso/keycloak`

```shell
SAMLResponse: PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIHhtbG5zOnNhbWw9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iIERlc3RpbmF0aW9uPSJodHRwOi8vc3AubGlnaHQubG9jYWw6ODA4MC9sb2dpbi9zYW1sMi9zc28va2V5Y2xvYWsiIElEPSJJRF85NGNjZGY0Mi01YzFmLTRlOGItYTJiMi00OTEyZmVlNjllMzgiIEluUmVzcG9uc2VUbz0iQVJRZTAwN2U1OS0wZTk2LTQ1MTAtOGFhOS05ZGI0MDEyMDQ0YmEiIElzc3VlSW5zdGFudD0iMjAyNC0wMy0yN1QxMTowODozOS4xOTBaIiBWZXJzaW9uPSIyLjAiPjxzYW1sOklzc3Vlcj5odHRwOi8vaWRwLmxpZ2h0LmxvY2FsOjg4ODAvcmVhbG1zL1Rlc3Q8L3NhbWw6SXNzdWVyPjxzYW1scDpTdGF0dXM+PHNhbWxwOlN0YXR1c0NvZGUgVmFsdWU9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpzdGF0dXM6U3VjY2VzcyIvPjwvc2FtbHA6U3RhdHVzPjxzYW1sOkFzc2VydGlvbiB4bWxucz0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgSUQ9IklEXzA1NmMxNmZiLTA2MjAtNGUxMy1iMGM0LTA0ZDM4NjdiYTliOSIgSXNzdWVJbnN0YW50PSIyMDI0LTAzLTI3VDExOjA4OjM5LjE4NFoiIFZlcnNpb249IjIuMCI+PHNhbWw6SXNzdWVyPmh0dHA6Ly9pZHAubGlnaHQubG9jYWw6ODg4MC9yZWFsbXMvVGVzdDwvc2FtbDpJc3N1ZXI+PGRzaWc6U2lnbmF0dXJlIHhtbG5zOmRzaWc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPjxkc2lnOlNpZ25lZEluZm8+PGRzaWc6Q2Fub25pY2FsaXphdGlvbk1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuI1dpdGhDb21tZW50cyIvPjxkc2lnOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz48ZHNpZzpSZWZlcmVuY2UgVVJJPSIjSURfMDU2YzE2ZmItMDYyMC00ZTEzLWIwYzQtMDRkMzg2N2JhOWI5Ij48ZHNpZzpUcmFuc2Zvcm1zPjxkc2lnOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+PGRzaWc6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PC9kc2lnOlRyYW5zZm9ybXM+PGRzaWc6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzaWc6RGlnZXN0VmFsdWU+ZzZ5VnU3OExUVElXNGFXS2lLVVp0NWNCQTcxdkNQU1BGV1dvVTl2T1lrMD08L2RzaWc6RGlnZXN0VmFsdWU+PC9kc2lnOlJlZmVyZW5jZT48L2RzaWc6U2lnbmVkSW5mbz48ZHNpZzpTaWduYXR1cmVWYWx1ZT5xelFIUy9COTVFNktFblVWT1d1bUo5RWhGc2szdmxTcDZhNnFmTC96Vm9FV2w4OEg1MEpxdEthTHYydS9ESnJrZXNFcDBqYXFYMHpjS1NXK2RENXR2M25TY2lLVnh0aXlQUGROSTNZU2RqanBuMXJhdFNmWE15RnJEVWJHRWU4RVhPcUdLeEd4WkI2NGpkRFNUVFQwTUU4Y2RRbDNQL3E4QWdUNE00OVQrcnpzWGh6bHM5WGdOeHE5YkxCVGRvcWk1WmNLS3pHZmJYaWRNTTZrdWhjKzlsd01KSVRHQkt5OHlHbHRJSTN4UTVmT3IxQUxkZUN1NFZCeE02S2dKWHphU1hKT0xlS0kwODBRQTd6ZG9DZFdGT1REK2RGYi9xcEs5eUlZbVdFd3NXZDcyMU5iL2tlbHNNdklOWnExQktNZGFJRkNzaFFocDZZNkh5andkU0taZUE9PTwvZHNpZzpTaWduYXR1cmVWYWx1ZT48ZHNpZzpLZXlJbmZvPjxkc2lnOktleU5hbWU+bHdsRi13TnY3OVVSUTNxeVoxRG1salVzSGNWcjlBMkF0YzNBV3dfLWRiVTwvZHNpZzpLZXlOYW1lPjxkc2lnOlg1MDlEYXRhPjxkc2lnOlg1MDlDZXJ0aWZpY2F0ZT5NSUlDbHpDQ0FYOENCZ0dPZjVUb3dEQU5CZ2txaGtpRzl3MEJBUXNGQURBUE1RMHdDd1lEVlFRRERBUlVaWE4wTUI0WERUSTBNRE15TnpFeE1ESXlPVm9YRFRNME1ETXlOekV4TURRd09Wb3dEekVOTUFzR0ExVUVBd3dFVkdWemREQ0NBU0l3RFFZSktvWklodmNOQVFFQkJRQURnZ0VQQURDQ0FRb0NnZ0VCQU1RdngwTWR1R1JOM0JVOHRwMlFjRDRVTlorY2FLOGpyRGNzUTRVQjVCNkFHWTN2TEVwd1ZXMjNOUnMzYjN6KzU2NFlRQU53cmZVVUpvODd2ZXE0V0U3UkZWNHhCT0gxVjlMdEtjdGc2QnNqMStZOWtkbEthZEtyeEl0YXg3OXhBRFp3TDdSdTk1ZytIM0NuZkc3YUk1cHZFWGcyZmxHZlM5MHVCc2dkTG9PQnFCRHBnTkpiVmVTcHpKOERwakFGRmMzVUFHYUdOdGJlUWlFUGo5TjVXcTBtenlkbG5TeE5HdHo1ejQ3eXo1MHo2Y05BdERFbTNXM09iaGJjVzRvTEtWZUQwdWZMVkZjL0dxVFJIbUNzbGhPaHc2RFQ5bkVIRC9XY2VpaS92NkxQQmhCdXRkVEZjbHVOTmI3Y3B2cDA0bGsyN1JEQ2F6Yi8wM1pxOEpGckVrVUNBd0VBQVRBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQUJDR043ZEZPYjV3b1NZQzRqWlpSenhHc2c3Ni9iZWd0SUYwdFVXZHlrWDZKT3g0T1Z6S3owbmxTRUp6MjA5bjdNWUxBS1lXRFlOVlhFYnVxd0NIRG5GTEdJNW13RDl4OE8vT0dFTlRCcm10SDJCWmc4V2trc281aDBJekU1dW4rUHJ1VnR4alBJRlRqeTB2SzFNTndJWGxFQ1RxakFhRHd4Z0lJcjJ1NHdEb0NWYTVXMktDZDJlaXRmYVBwVWpZTkZEMnVaSi94YVl2VU1DR3UrVjU3WEgyQUhNZjBSZzh1UWFEbTZTcnJSU0ZETk5hWHFPYWdSV24xRFBPYTVZSTZwVVQ4RVRTNjA4ZTJVZy9IMlBoY3VBRXJXUjcwdEx6TDhSdkFhamVWVjlXZER4UEFFcVhoaFhSNXRuZTI3LzU1QnZhYnZtUkJnTGZLU3JzcU1Ib0FQUT09PC9kc2lnOlg1MDlDZXJ0aWZpY2F0ZT48L2RzaWc6WDUwOURhdGE+PC9kc2lnOktleUluZm8+PC9kc2lnOlNpZ25hdHVyZT48c2FtbDpTdWJqZWN0PjxzYW1sOk5hbWVJRCBGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjEuMTpuYW1laWQtZm9ybWF0OnVuc3BlY2lmaWVkIj5saWdodDwvc2FtbDpOYW1lSUQ+PHNhbWw6U3ViamVjdENvbmZpcm1hdGlvbiBNZXRob2Q9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpjbTpiZWFyZXIiPjxzYW1sOlN1YmplY3RDb25maXJtYXRpb25EYXRhIEluUmVzcG9uc2VUbz0iQVJRZTAwN2U1OS0wZTk2LTQ1MTAtOGFhOS05ZGI0MDEyMDQ0YmEiIE5vdE9uT3JBZnRlcj0iMjAyNC0wMy0yN1QxMToxMzozNy4xODRaIiBSZWNpcGllbnQ9Imh0dHA6Ly9zcC5saWdodC5sb2NhbDo4MDgwL2xvZ2luL3NhbWwyL3Nzby9rZXljbG9hayIvPjwvc2FtbDpTdWJqZWN0Q29uZmlybWF0aW9uPjwvc2FtbDpTdWJqZWN0PjxzYW1sOkNvbmRpdGlvbnMgTm90QmVmb3JlPSIyMDI0LTAzLTI3VDExOjA4OjM3LjE4NFoiIE5vdE9uT3JBZnRlcj0iMjAyNC0wMy0yN1QxMTowOTozNy4xODRaIj48c2FtbDpBdWRpZW5jZVJlc3RyaWN0aW9uPjxzYW1sOkF1ZGllbmNlPnNhbWxfY2xpZW50PC9zYW1sOkF1ZGllbmNlPjwvc2FtbDpBdWRpZW5jZVJlc3RyaWN0aW9uPjwvc2FtbDpDb25kaXRpb25zPjxzYW1sOkF0dHJpYnV0ZVN0YXRlbWVudD48c2FtbDpBdHRyaWJ1dGUgTmFtZT0iUm9sZSIgTmFtZUZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmF0dHJuYW1lLWZvcm1hdDpiYXNpYyI+PHNhbWw6QXR0cmlidXRlVmFsdWUgeG1sbnM6eHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHM6c3RyaW5nIj5vZmZsaW5lX2FjY2Vzczwvc2FtbDpBdHRyaWJ1dGVWYWx1ZT48L3NhbWw6QXR0cmlidXRlPjxzYW1sOkF0dHJpYnV0ZSBOYW1lPSJSb2xlIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OmJhc2ljIj48c2FtbDpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4czpzdHJpbmciPm1hbmFnZS1hY2NvdW50LWxpbmtzPC9zYW1sOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDpBdHRyaWJ1dGU+PHNhbWw6QXR0cmlidXRlIE5hbWU9IlJvbGUiIE5hbWVGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphdHRybmFtZS1mb3JtYXQ6YmFzaWMiPjxzYW1sOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgeHNpOnR5cGU9InhzOnN0cmluZyI+ZGVmYXVsdC1yb2xlcy10ZXN0PC9zYW1sOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDpBdHRyaWJ1dGU+PHNhbWw6QXR0cmlidXRlIE5hbWU9IlJvbGUiIE5hbWVGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphdHRybmFtZS1mb3JtYXQ6YmFzaWMiPjxzYW1sOkF0dHJpYnV0ZVZhbHVlIHhtbG5zOnhzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYSIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgeHNpOnR5cGU9InhzOnN0cmluZyI+dW1hX2F1dGhvcml6YXRpb248L3NhbWw6QXR0cmlidXRlVmFsdWU+PC9zYW1sOkF0dHJpYnV0ZT48c2FtbDpBdHRyaWJ1dGUgTmFtZT0iUm9sZSIgTmFtZUZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmF0dHJuYW1lLWZvcm1hdDpiYXNpYyI+PHNhbWw6QXR0cmlidXRlVmFsdWUgeG1sbnM6eHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHM6c3RyaW5nIj5tYW5hZ2UtYWNjb3VudDwvc2FtbDpBdHRyaWJ1dGVWYWx1ZT48L3NhbWw6QXR0cmlidXRlPjxzYW1sOkF0dHJpYnV0ZSBOYW1lPSJSb2xlIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OmJhc2ljIj48c2FtbDpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4czpzdHJpbmciPnZpZXctcHJvZmlsZTwvc2FtbDpBdHRyaWJ1dGVWYWx1ZT48L3NhbWw6QXR0cmlidXRlPjwvc2FtbDpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PC9zYW1sOkFzc2VydGlvbj48L3NhbWxwOlJlc3BvbnNlPg==
RelayState: 16dbd5be-6446-419c-b6f6-7a7bf8c30f1c

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml

<samlp:Response
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Destination="http://sp.light.local:8080/login/saml2/sso/keycloak" ID="ID_94ccdf42-5c1f-4e8b-a2b2-4912fee69e38" InResponseTo="ARQe007e59-0e96-4510-8aa9-9db4012044ba" IssueInstant="2024-03-27T11:08:39.190Z" Version="2.0">
    <saml:Issuer>http://idp.light.local:8880/realms/Test</saml:Issuer>
    <samlp:Status>
        <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
    <saml:Assertion
        xmlns="urn:oasis:names:tc:SAML:2.0:assertion" ID="ID_056c16fb-0620-4e13-b0c4-04d3867ba9b9" IssueInstant="2024-03-27T11:08:39.184Z" Version="2.0">
        <saml:Issuer>http://idp.light.local:8880/realms/Test</saml:Issuer>
        <dsig:Signature
            xmlns:dsig="http://www.w3.org/2000/09/xmldsig#">
            <dsig:SignedInfo>
                <dsig:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#WithComments"/>
                <dsig:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
                <dsig:Reference URI="#ID_056c16fb-0620-4e13-b0c4-04d3867ba9b9">
                    <dsig:Transforms>
                        <dsig:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                        <dsig:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                    </dsig:Transforms>
                    <dsig:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                    <dsig:DigestValue>g6yVu78LTTIW4aWKiKUZt5cBA71vCPSPFWWoU9vOYk0=</dsig:DigestValue>
                </dsig:Reference>
            </dsig:SignedInfo>
            <dsig:SignatureValue>qzQHS/B95E6KEnUVOWumJ9EhFsk3vlSp6a6qfL/zVoEWl88H50JqtKaLv2u/DJrkesEp0jaqX0zcKSW+dD5tv3nSciKVxtiyPPdNI3YSdjjpn1ratSfXMyFrDUbGEe8EXOqGKxGxZB64jdDSTTT0ME8cdQl3P/q8AgT4M49T+rzsXhzls9XgNxq9bLBTdoqi5ZcKKzGfbXidMM6kuhc+9lwMJITGBKy8yGltII3xQ5fOr1ALdeCu4VBxM6KgJXzaSXJOLeKI080QA7zdoCdWFOTD+dFb/qpK9yIYmWEwsWd721Nb/kelsMvINZq1BKMdaIFCshQhp6Y6HyjwdSKZeA==</dsig:SignatureValue>
            <dsig:KeyInfo>
                <dsig:KeyName>lwlF-wNv79URQ3qyZ1DmljUsHcVr9A2Atc3AWw_-dbU</dsig:KeyName>
                <dsig:X509Data>
                    <dsig:X509Certificate>MIIClzCCAX8CBgGOf5TowDANBgkqhkiG9w0BAQsFADAPMQ0wCwYDVQQDDARUZXN0MB4XDTI0MDMyNzExMDIyOVoXDTM0MDMyNzExMDQwOVowDzENMAsGA1UEAwwEVGVzdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMQvx0MduGRN3BU8tp2QcD4UNZ+caK8jrDcsQ4UB5B6AGY3vLEpwVW23NRs3b3z+564YQANwrfUUJo87veq4WE7RFV4xBOH1V9LtKctg6Bsj1+Y9kdlKadKrxItax79xADZwL7Ru95g+H3CnfG7aI5pvEXg2flGfS90uBsgdLoOBqBDpgNJbVeSpzJ8DpjAFFc3UAGaGNtbeQiEPj9N5Wq0mzydlnSxNGtz5z47yz50z6cNAtDEm3W3ObhbcW4oLKVeD0ufLVFc/GqTRHmCslhOhw6DT9nEHD/Wceii/v6LPBhButdTFcluNNb7cpvp04lk27RDCazb/03Zq8JFrEkUCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEABCGN7dFOb5woSYC4jZZRzxGsg76/begtIF0tUWdykX6JOx4OVzKz0nlSEJz209n7MYLAKYWDYNVXEbuqwCHDnFLGI5mwD9x8O/OGENTBrmtH2BZg8Wkkso5h0IzE5un+PruVtxjPIFTjy0vK1MNwIXlECTqjAaDwxgIIr2u4wDoCVa5W2KCd2eitfaPpUjYNFD2uZJ/xaYvUMCGu+V57XH2AHMf0Rg8uQaDm6SrrRSFDNNaXqOagRWn1DPOa5YI6pUT8ETS608e2Ug/H2PhcuAErWR70tLzL8RvAajeVV9WdDxPAEqXhhXR5tne27/55BvabvmRBgLfKSrsqMHoAPQ==</dsig:X509Certificate>
                </dsig:X509Data>
            </dsig:KeyInfo>
        </dsig:Signature>
        <saml:Subject>
            <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">light</saml:NameID>
            <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <saml:SubjectConfirmationData InResponseTo="ARQe007e59-0e96-4510-8aa9-9db4012044ba" NotOnOrAfter="2024-03-27T11:13:37.184Z" Recipient="http://sp.light.local:8080/login/saml2/sso/keycloak"/>
            </saml:SubjectConfirmation>
        </saml:Subject>
        <saml:Conditions NotBefore="2024-03-27T11:08:37.184Z" NotOnOrAfter="2024-03-27T11:09:37.184Z">
            <saml:AudienceRestriction>
                <saml:Audience>saml_client</saml:Audience>
            </saml:AudienceRestriction>
        </saml:Conditions>
        <saml:AttributeStatement>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">offline_access
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">manage-account-links
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">default-roles-test
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">uma_authorization
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">manage-account
                </saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="Role" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue
                    xmlns:xs="http://www.w3.org/2001/XMLSchema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">view-profile
                </saml:AttributeValue>
            </saml:Attribute>
        </saml:AttributeStatement>
    </saml:Assertion>
</samlp:Response>

```

7. 认证成功，跳转到登录前页面 `http://sp.light.local:8080/?continue`

```shell

SAML 2.0 Login & Single Logout with Spring Security
You are successfully logged in as light

You're email address is

All Your Attributes
Role
[default-roles-test, manage-account-links, offline_access, manage-account, uma_authorization, view-profile]
Visit the [SAML 2.0 Login & Logout](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-saml2) documentation for more details.

```

### 2. Keycloak登出
1. 点击页面的 `RP-initiated Logout` 

2. 访问 `http://sp.light.local:8080/logout`

3. 跳转 `http://idp.light.local:8880/realms/Test/protocol/saml`

```shell
SAMLRequest: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c2FtbDJwOkxvZ291dFJlcXVlc3QgeG1sbnM6c2FtbDJwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIERlc3RpbmF0aW9uPSJodHRwOi8vaWRwLmxpZ2h0LmxvY2FsOjg4ODAvcmVhbG1zL1Rlc3QvcHJvdG9jb2wvc2FtbCIgSUQ9IkxSYjMyY2M0YzgtNDI4Yy00YzJiLWJjYjEtY2I2ODY4OWIzYWUzIiBJc3N1ZUluc3RhbnQ9IjIwMjQtMDMtMjdUMTE6MTM6NDYuNjc1WiIgVmVyc2lvbj0iMi4wIj48c2FtbDI6SXNzdWVyIHhtbG5zOnNhbWwyPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5zYW1sX2NsaWVudDwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPgo8ZHM6U2lnbmVkSW5mbz4KPGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz4KPGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz4KPGRzOlJlZmVyZW5jZSBVUkk9IiNMUmIzMmNjNGM4LTQyOGMtNGMyYi1iY2IxLWNiNjg2ODliM2FlMyI+CjxkczpUcmFuc2Zvcm1zPgo8ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnI2VudmVsb3BlZC1zaWduYXR1cmUiLz4KPGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPgo8L2RzOlRyYW5zZm9ybXM+CjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz4KPGRzOkRpZ2VzdFZhbHVlPnZ6ZUlCcS8rUnVTK0Jzc0hKZi8xZ0drb2M3NmViOEF5SmNNZUNxbW5qdXM9PC9kczpEaWdlc3RWYWx1ZT4KPC9kczpSZWZlcmVuY2U+CjwvZHM6U2lnbmVkSW5mbz4KPGRzOlNpZ25hdHVyZVZhbHVlPgp0d0E1YmdabmJHMDZsaGxkSENzYXdUNjVGUHJNcVVjbkVDU0hMeGpFK20vemx3OHA3c3pzWk1tOEI0TFlXU01wRWtCWEJFNkdIS0xqJiMxMzsKcjg4ZFNkcTBVWGhCOVpzZnk4dkloeUUrRytQTnVHUjRZNFFsV3dnR2FXWEtTLzZZZmorTXQ5eU5ZUE5MZVlyZnNDbmNTeVJsUk03TSYjMTM7ClVaSlRPbzJsRlFTWjFSM2ZmM289CjwvZHM6U2lnbmF0dXJlVmFsdWU+CjxkczpLZXlJbmZvPjxkczpYNTA5RGF0YT48ZHM6WDUwOUNlcnRpZmljYXRlPk1JSUNnVENDQWVvQ0NRQ3VWenlxRmdNU3lEQU5CZ2txaGtpRzl3MEJBUXNGQURDQmhERUxNQWtHQTFVRUJoTUNWVk14RXpBUkJnTlYKQkFnTUNsZGhjMmhwYm1kMGIyNHhFakFRQmdOVkJBY01DVlpoYm1OdmRYWmxjakVkTUJzR0ExVUVDZ3dVVTNCeWFXNW5JRk5sWTNWeQphWFI1SUZOQlRVd3hDekFKQmdOVkJBc01Bbk53TVNBd0hnWURWUVFEREJkemNDNXpjSEpwYm1jdWMyVmpkWEpwZEhrdWMyRnRiREFlCkZ3MHhPREExTVRReE5ETXdORFJhRncweU9EQTFNVEV4TkRNd05EUmFNSUdFTVFzd0NRWURWUVFHRXdKVlV6RVRNQkVHQTFVRUNBd0sKVjJGemFHbHVaM1J2YmpFU01CQUdBMVVFQnd3SlZtRnVZMjkxZG1WeU1SMHdHd1lEVlFRS0RCUlRjSEpwYm1jZ1UyVmpkWEpwZEhrZwpVMEZOVERFTE1Ba0dBMVVFQ3d3Q2MzQXhJREFlQmdOVkJBTU1GM053TG5Od2NtbHVaeTV6WldOMWNtbDBlUzV6WVcxc01JR2ZNQTBHCkNTcUdTSWIzRFFFQkFRVUFBNEdOQURDQmlRS0JnUURSdTcvRUkwQmxOek1FQkZWQWNieCtsTG9zdnpJV1UrMDFkR1RZOGdCZGhNUU4KWUtaOTJsTWNlbzJDdVZKNjZjVVVSUHltM2k3bkdHem9TbkF4QXJlKzBZSU0rVTByYXpyV3RBVUU3MzVia2NxRUxaa09UWkxlbGFvTwp6dG1XcVJiZTVPdUVtcGV3SDdjeCtrTmdjVmpkY3RPR3kzUTZ4K0k0cWFrWS85cWhCUUlEQVFBQk1BMEdDU3FHU0liM0RRRUJDd1VBCkE0R0JBQWVWaVR2SE95UW9wV0VpWE9mSTJaOWV1a3dyU2tuRHdxL3pzY1IwWXh3d3FEQk10L1FkQU9EZlN3QWZuY2lpWUxrbUVqbG8KeldSdE9lTitxSzdVRmdQMWJSbDVxa3NyWVg1UzB6MmlHSmgwR3ZvbkxVdDNlMjBTc2ZsNXRURUREbkFFVU1MZkJreWF4RUhEUlovbgpiVEo3VlRlWk9TeVJvVm41WEhocHVKMEI8L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48c2FtbDI6TmFtZUlEIHhtbG5zOnNhbWwyPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5saWdodDwvc2FtbDI6TmFtZUlEPjwvc2FtbDJwOkxvZ291dFJlcXVlc3Q+
RelayState: 0cc7f2d3-ccf9-4d94-939c-7d061b969b17
```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:LogoutRequest
    xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" Destination="http://idp.light.local:8880/realms/Test/protocol/saml" ID="LRb32cc4c8-428c-4c2b-bcb1-cb68689b3ae3" IssueInstant="2024-03-27T11:13:46.675Z" Version="2.0">
    <saml2:Issuer
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">saml_client
    </saml2:Issuer>
    <ds:Signature
        xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:SignedInfo>
            <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
            <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
            <ds:Reference URI="#LRb32cc4c8-428c-4c2b-bcb1-cb68689b3ae3">
                <ds:Transforms>
                    <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                    <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                </ds:Transforms>
                <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                <ds:DigestValue>vzeIBq/+RuS+BssHJf/1gGkoc76eb8AyJcMeCqmnjus=</ds:DigestValue>
            </ds:Reference>
        </ds:SignedInfo>
        <ds:SignatureValue>
twA5bgZnbG06lhldHCsawT65FPrMqUcnECSHLxjE+m/zlw8p7szsZMm8B4LYWSMpEkBXBE6GHKLj&#13;
r88dSdq0UXhB9Zsfy8vIhyE+G+PNuGR4Y4QlWwgGaWXKS/6Yfj+Mt9yNYPNLeYrfsCncSyRlRM7M&#13;
UZJTOo2lFQSZ1R3ff3o=
</ds:SignatureValue>
        <ds:KeyInfo>
            <ds:X509Data>
                <ds:X509Certificate>MIICgTCCAeoCCQCuVzyqFgMSyDANBgkqhkiG9w0BAQsFADCBhDELMAkGA1UEBhMCVVMxEzARBgNV
BAgMCldhc2hpbmd0b24xEjAQBgNVBAcMCVZhbmNvdXZlcjEdMBsGA1UECgwUU3ByaW5nIFNlY3Vy
aXR5IFNBTUwxCzAJBgNVBAsMAnNwMSAwHgYDVQQDDBdzcC5zcHJpbmcuc2VjdXJpdHkuc2FtbDAe
Fw0xODA1MTQxNDMwNDRaFw0yODA1MTExNDMwNDRaMIGEMQswCQYDVQQGEwJVUzETMBEGA1UECAwK
V2FzaGluZ3RvbjESMBAGA1UEBwwJVmFuY291dmVyMR0wGwYDVQQKDBRTcHJpbmcgU2VjdXJpdHkg
U0FNTDELMAkGA1UECwwCc3AxIDAeBgNVBAMMF3NwLnNwcmluZy5zZWN1cml0eS5zYW1sMIGfMA0G
CSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRu7/EI0BlNzMEBFVAcbx+lLosvzIWU+01dGTY8gBdhMQN
YKZ92lMceo2CuVJ66cUURPym3i7nGGzoSnAxAre+0YIM+U0razrWtAUE735bkcqELZkOTZLelaoO
ztmWqRbe5OuEmpewH7cx+kNgcVjdctOGy3Q6x+I4qakY/9qhBQIDAQABMA0GCSqGSIb3DQEBCwUA
A4GBAAeViTvHOyQopWEiXOfI2Z9eukwrSknDwq/zscR0YxwwqDBMt/QdAODfSwAfnciiYLkmEjlo
zWRtOeN+qK7UFgP1bRl5qksrYX5S0z2iGJh0GvonLUt3e20Ssfl5tTEDDnAEUMLfBkyaxEHDRZ/n
bTJ7VTeZOSyRoVn5XHhpuJ0B</ds:X509Certificate>
            </ds:X509Data>
        </ds:KeyInfo>
    </ds:Signature>
    <saml2:NameID
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">light
    </saml2:NameID>
</saml2p:LogoutRequest>

```

4. 退出响应 `http://sp.light.local:8080/login/saml2/sso/keycloak`

```shell
SAMLResponse: PHNhbWxwOkxvZ291dFJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIHhtbG5zPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIiB4bWxuczpzYW1sPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIiBEZXN0aW5hdGlvbj0iaHR0cDovL3NwLmxpZ2h0LmxvY2FsOjgwODAvbG9naW4vc2FtbDIvc3NvL2tleWNsb2FrIiBJRD0iSURfYzc2NWU0MGMtNTQzYS00NmQxLWExNTktNGFhMzNkNWE3NjkzIiBJblJlc3BvbnNlVG89IkxSYjMyY2M0YzgtNDI4Yy00YzJiLWJjYjEtY2I2ODY4OWIzYWUzIiBJc3N1ZUluc3RhbnQ9IjIwMjQtMDMtMjdUMTE6MTM6NDYuNzM1WiIgVmVyc2lvbj0iMi4wIj48SXNzdWVyPmh0dHA6Ly9pZHAubGlnaHQubG9jYWw6ODg4MC9yZWFsbXMvVGVzdDwvSXNzdWVyPjxzYW1scDpTdGF0dXM+PHNhbWxwOlN0YXR1c0NvZGUgVmFsdWU9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpzdGF0dXM6U3VjY2VzcyIvPjwvc2FtbHA6U3RhdHVzPjwvc2FtbHA6TG9nb3V0UmVzcG9uc2U+
RelayState: 0cc7f2d3-ccf9-4d94-939c-7d061b969b17

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<samlp:LogoutResponse
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns="urn:oasis:names:tc:SAML:2.0:assertion"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Destination="http://sp.light.local:8080/login/saml2/sso/keycloak" ID="ID_c765e40c-543a-46d1-a159-4aa33d5a7693" InResponseTo="LRb32cc4c8-428c-4c2b-bcb1-cb68689b3ae3" IssueInstant="2024-03-27T11:13:46.735Z" Version="2.0">
    <Issuer>http://idp.light.local:8880/realms/Test</Issuer>
    <samlp:Status>
        <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
</samlp:LogoutResponse>

```

### 3. Auzre-AD登录

```yaml
spring:
  profiles:
    active: azure-ad
#    active: keycloak

```

添加一个配置文件 `application-auzre-ad.yaml`，其他不需要改动
```yaml
server:
  port: 8080

logging.level:
  org.springframework.security: TRACE

spring:
  security:
    filter:
      dispatcher-types: async, error, request, forward
    saml2:
      relyingparty:
        registration:
          # 使用此仓库账号的配置 https://github.com/Kahen/spring-security-saml2-azure-ad-example
          azure-ad:
            entity-id: "spn:95210223-1471-47de-8f76-c0f420c1738f"
            singlelogout:
              binding: POST
              url: "{baseUrl}/saml/logout"
              responseUrl: "{baseUrl}/saml/SingleLogout"
            acs:
              location: "{baseUrl}/saml/SSO"
            assertingparty:
              metadata-uri: https://login.microsoftonline.com/603e9946-79fd-42bc-bae2-2abda19cb695/federationmetadata/2007-06/federationmetadata.xml
          # 通用配置，需要自己注册auzre账号 获取证书
#          azure-ad:
#            entity-id: "spn:95210223-1471-47de-8f76-c0f420c1738f"
#            singlelogout:
#              binding: POST
#              url: "{baseUrl}/logout/saml2/slo"
#              responseUrl: "{baseUrl}/logout/saml2/slo"
#            acs:
#              location: "{baseUrl}/login/saml2/sso/{registrationId}"
#            assertingparty:
#              metadata-uri: https://login.microsoftonline.com/603e9946-79fd-42bc-bae2-2abda19cb695/federationmetadata/2007-06/federationmetadata.xml

```

1. 浏览器访问 `http://localhost:8080/`

2. 请求未认证，跳转到认证端点  `http://localhost:8080/saml2/authenticate/azure-ad`

3. 认证端点构建请求XML并跳转到 IDP 进行认证 `https://login.microsoftonline.com/603e9946-79fd-42bc-bae2-2abda19cb695/saml2?SAMLRequest=fZLNbtswEIRfReCdEknJ%2BiEsB26DoAFSxLWUHnojqVVMQCJdLWX08avIDppeciT47Qx3htu7P%2BMQXWBC611NeMxIBM74zrrXmry0D7Qkd7stqnEQZ7mfw8kd4fcMGKJl0KG83tRknpz0Ci1Kp0ZAGYxs9t%2BfpIiZPE8%2BeOMHEu0RYQqL1VfvcB5hamC6WAMvx6eanEI4yyQZvFHDyWOQJStZ8maQNM0zie4XV%2BtUWF%2F6BuNKv1oXj9ZMHn0fvBusg9j4MclZClWV5bSo%2Bo5mQhuqFQgqlO4Ur4zOq82qLkj04CcD63Y16dWAQKLH%2B5rsjz%2BAia7QBVUmXUQ066jWvKC52WTQp5qVPV9YPChEe4F%2F04gzPDoMyoWaCCYyylIqeMuF3BSSpXGVZ79IdLhF88W6a%2BSf5aivEMpvbXugh%2BemJdHP9%2BoWgNyKkqv79LGhz4XVey1kh2cnq43gTIiU8qzgNCs6oGVf5NSwPhPM8CIt%2B23y0Wp3O%2F7%2FRXZ%2FAQ%3D%3D&RelayState=a16f9b47-2543-41db-946a-0e93731d3aed`

```shell
SAMLRequest: fZLNbtswEIRfReCdEknJ+iEsB26DoAFSxLWUHnojqVVMQCJdLWX08avIDppeciT47Qx3htu7P+MQXWBC611NeMxIBM74zrrXmry0D7Qkd7stqnEQZ7mfw8kd4fcMGKJl0KG83tRknpz0Ci1Kp0ZAGYxs9t+fpIiZPE8+eOMHEu0RYQqL1VfvcB5hamC6WAMvx6eanEI4yyQZvFHDyWOQJStZ8maQNM0zie4XV+tUWF/6BuNKv1oXj9ZMHn0fvBusg9j4MclZClWV5bSo+o5mQhuqFQgqlO4Ur4zOq82qLkj04CcD63Y16dWAQKLH+5rsjz+Aia7QBVUmXUQ066jWvKC52WTQp5qVPV9YPChEe4F/04gzPDoMyoWaCCYyylIqeMuF3BSSpXGVZ79IdLhF88W6a+Sf5aivEMpvbXugh+emJdHP9+oWgNyKkqv79LGhz4XVey1kh2cnq43gTIiU8qzgNCs6oGVf5NSwPhPM8CIt+23y0Wp3O/7/RXZ/AQ==
RelayState: a16f9b47-2543-41db-946a-0e93731d3aed

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:AuthnRequest
    xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" AssertionConsumerServiceURL="http://localhost:8080/saml/SSO" Destination="https://login.microsoftonline.com/603e9946-79fd-42bc-bae2-2abda19cb695/saml2" ForceAuthn="false" ID="ARQe02d7b7-ac3d-4b0d-bb17-6c54ef3b08f1" IsPassive="false" IssueInstant="2024-03-21T12:57:03.964Z" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Version="2.0">
    <saml2:Issuer
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">spn:95210223-1471-47de-8f76-c0f420c1738f
    </saml2:Issuer>
</saml2p:AuthnRequest>
```

4. 在页面输入账号密码登录，参数地址 `https://login.microsoftonline.com/603e9946-79fd-42bc-bae2-2abda19cb695/login` 携带的Form表单参数为 `i13=0&login=test%40aloisospeltoutlook.onmicrosoft.com&loginfmt=test%40aloisospeltoutlook.onmicrosoft.com&type=11&LoginOptions=3&lrt=&lrtPartition=&hisRegion=&hisScaleUnit=&passwd=sCGtNC%3FEmGW4%2BT-&ps=2&psRNGCDefaultType=&psRNGCEntropy=&psRNGCSLK=&canary=1rsv5nyG54Mj6f2bdqSbME6xXOS0VQR87YEZd%2BAV2QI%3D1%3A1%3ACANARY%3AroMBdBp1B9KsK9AgvPto5bGUSOKg5bqNal9F%2F1Bh7es%3D&ctx=rQQIARAAhZBNSxtBAIZnmg81aBs8VQQRlFJoh52v3dlZEElA0xJijEul7W1mZ8coqRuzQdp_IEKheBE8evQgUgoF7aHVmyDk7MVbWz0Uj4IX8w96fnkeeN4CCJ6n7fVAupRgShkiXBDEhYmRb4WHImw5xRERzLed0ULx3o6vzl5_Xzj5lYNJtHt4ACea3W47cJxWEqlWM0m7gY997KTqQ8sJw_opfFZaasSYGqEFUhEziGtskNZEIC9yeWyZxr4lPQj_Qnj5KBf2SbqXmVbEs1JzgajLGeLEaCS5pxCOJROMGKZi8zUz7WEWy_6AhLR9N9UR0iqmiCptFJGR9qTbyw7fZIdxJhgcLBTBUzAJ7rJwP9fvuT0ba8ye9eZ_fK5s4z9T4DznkE666a5_qri8tuZZqs1GqGtz3se39RAvN5Z88W7uvXlRWqaN1zMkIF_yI-d5cJuHWwNgbwAcD_3nkJ8j4O7x1cX16e9vO_9e3Tx52UlqZVNuk7KsplVZWtlc7CaurrwJ69UVV28sqJacd0i5KeJ05qgIHgA1&hpgrequestid=5119c3f0-c33f-46d0-bc8d-478a30e72300&flowToken=AQABIQEAAADnfolhJpSnRYB1SVj-Hgd8nOkMhwZuQACu6DYwKendCmRP5hSOfhUJjPyREgQGT8u3aFahO9XLJbIoaGgERcnEcgIjiQJ3vADcjKqeniTaq0oWcS_IlgPBzRqFttgjJnFV79kGdZUR8fMQa90MQx0ubgdxkmric3m8lGknCcKQgdVq_fFDuGFFx9DVPhvr5Dp4QIcdMAO8m_daWjkEVu-g0GjUA3M9lS1P2byiebd1P9Fvyng8K6d0I2cMJfrNJQeACTRKr9188oWqt0pNhOtxjRveMUX1od5bJGmW-_7MfCFOiDlTwq1pqb2NU-E5wd69-UkCqWKZpsrYc_oZ7Hg46rLC_JPtNz6ZlbyvSEC_frOFtSR4s1o0C-aoruhdZ7BbVVfuUhf6-IrC2GTSJ9w_VPSgrd08UpPIWCGEjScTpgY0qmSjar9QeLbojG08me5nhAjR1J3L4QUXr0uSM1n_klYBUiXT2Klo07FaiC4bsD1h-4okSo3CryAa0q95fw0gAA&PPSX=&NewUser=1&FoundMSAs=&fspost=0&i21=0&CookieDisclosure=0&IsFidoSupported=1&isSignupPost=0&i19=13996`

- User: test@aloisospeltoutlook.onmicrosoft.com
- Password: sCGtNC?EmGW4+T-

5. 认证成功 `https://login.microsoftonline.com/kmsi` form参数为 `LoginOptions=3&type=28&ctx=rQQIARAAhZBNaxNBAIZnm4_W0GrwpAgiWFSI052Znd3ZXSg1avohjWG7JdTeZmZ3TOwmE3fXUP-BCIJ4EXr06EFEBEE92PZWEHL2InhQ24P0WPBi_oHnl-eB560A_1o26PueTTAixIKYMgwpi2LoKuZAiRQlSGJmuSo9W6n-VRe6C4cf7n7aLRlavnzz2rjYyfOBb5qJljzp6Cz3XeQiM-O9xAzD1p5xpb4WxIhETDDIpRVBKlAEhcAMOtKmsbIEchUeGcZvw_g2UQrHJNkpzHLsKE9QBolNLUhxJKBHHQ5R7FnMwpHF4-hdYdZBVuyNB8g8NXYTIaHgMYGEi4hjTwrHs38UruZxlt_gie5mOhvESa4f5YnWW3O63-vKVGda5XNS90bF6aPiNCr4U1OVKjgHLoGTovGqNC4_3j8fLOyPFj8_W3qKfl0GByUTp9nQ7j9esmnzgaOIiB6GotlwtjdaIWoHay6719iMavU2CVbmsY-fl2cOyuC4PPFkEuxMgo-n_nPdlxlwcvr718O9n-9f_Fk-OnPdYenw5nqtJ-80W015u7ZZH6Z2n6y6nVsDtYjTLbp6f6PRWG5vB_Nvq-Af0&hpgrequestid=c2756b4a-25ce-45f4-bd28-9c6bb9a72000&flowToken=AQABIQEAAADnfolhJpSnRYB1SVj-Hgd8Ijv59xIttOE1JJ6KsuKRQMfAy0N7-4K2X5AqQ-g4r9SPHHN1xlCV6dTuBroS1t8NcAHctIoGsQZvkdnYCD4fgvrGWxez4I2WroWofcsF5pC8C12HFX7w-gkwXvW2K0Wgdd9iz-GVhN5sdqGt9O58b0ZpV6x4KBiTBDmU6NStH8fsJPRipYhIu6Ej3YU-dlZNnk9ekEoU7lxaAWu2IFYEahOl1hVjhyVKY4jTQdQxrg5rDy7G1NHXQE2Sr-_wok_h4IjOYw3A8Nyyv2NKC0J6RaZQKWo_VaewYbmo8heAm40PLZoC2jqZW8B1uRnwL8691S9jwcZuw56xXjobRmnMGhgjHAY85vjYwRl5yDRSjP0x2Y8c6TXVkHipGDVkXep8YMoodi_clPeq4OVo616dpIuIqXfeWVjjTXLdiZ1q7Xmqw2Bld-LA1IYzatYlvmIPlOhsmgoGJy3IxsITuOVIV73uqkQm6qXlxxdDGr5rqh_gIqWQSetIV9TAIxPqc6x9c0cm8GaSU8gnV6zN8vy9Ntouco_C7BtSZQriWMF70q6hALXVTqgveFFSLUD6LZAZeMMG4f72-D-IGrGn0igZ8Amzd2mcp9PZaaOI-uE9X_0gAA&canary=1rsv5nyG54Mj6f2bdqSbME6xXOS0VQR87YEZd%2BAV2QI%3D9%3A1%3ACANARY%3A67rvBT%2BmcJMOMcD%2BZAvr5n2L8hCpfF1rk4LgXEEHVxQ%3D&i19=1444`

6. 认证成功，回调到SP的认证端点 `http://localhost:8080/saml/SSO`

```shell
SAMLResponse: PHNhbWxwOlJlc3BvbnNlIElEPSJfMjIzZjZmNDQtNGUyNy00ZmQ2LWJiN2MtNGRhYjU5OTI3NmNkIiBWZXJzaW9uPSIyLjAiIElzc3VlSW5zdGFudD0iMjAyNC0wMy0yMVQxMjo1NzoyOC4wMzFaIiBEZXN0aW5hdGlvbj0iaHR0cDovL2xvY2FsaG9zdDo4MDgwL3NhbWwvU1NPIiBJblJlc3BvbnNlVG89IkFSUWUwMmQ3YjctYWMzZC00YjBkLWJiMTctNmM1NGVmM2IwOGYxIiB4bWxuczpzYW1scD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOnByb3RvY29sIj48SXNzdWVyIHhtbG5zPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5odHRwczovL3N0cy53aW5kb3dzLm5ldC82MDNlOTk0Ni03OWZkLTQyYmMtYmFlMi0yYWJkYTE5Y2I2OTUvPC9Jc3N1ZXI+PHNhbWxwOlN0YXR1cz48c2FtbHA6U3RhdHVzQ29kZSBWYWx1ZT0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOnN0YXR1czpTdWNjZXNzIi8+PC9zYW1scDpTdGF0dXM+PEFzc2VydGlvbiBJRD0iX2MyNzU2YjRhLTI1Y2UtNDVmNC1iZDI4LTljNmI0NmE4MjAwMCIgSXNzdWVJbnN0YW50PSIyMDI0LTAzLTIxVDEyOjU3OjI4LjAyN1oiIFZlcnNpb249IjIuMCIgeG1sbnM9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iPjxJc3N1ZXI+aHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNjAzZTk5NDYtNzlmZC00MmJjLWJhZTItMmFiZGExOWNiNjk1LzwvSXNzdWVyPjxTaWduYXR1cmUgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPjxTaWduZWRJbmZvPjxDYW5vbmljYWxpemF0aW9uTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PFNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz48UmVmZXJlbmNlIFVSST0iI19jMjc1NmI0YS0yNWNlLTQ1ZjQtYmQyOC05YzZiNDZhODIwMDAiPjxUcmFuc2Zvcm1zPjxUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjZW52ZWxvcGVkLXNpZ25hdHVyZSIvPjxUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz48L1RyYW5zZm9ybXM+PERpZ2VzdE1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZW5jI3NoYTI1NiIvPjxEaWdlc3RWYWx1ZT4zUU9iVzhEWll6S1RQLzU0SWxTaUcxeFVZMG8zamthakFxZkozSk1ZSFY4PTwvRGlnZXN0VmFsdWU+PC9SZWZlcmVuY2U+PC9TaWduZWRJbmZvPjxTaWduYXR1cmVWYWx1ZT5TR3g1QkgxV3ozQ3l0R0dIUXdOZkM3OWhucGhOOGEzVXFXWjlwU1BtZHc1U2grU29NOCtpRkRZZE1RYmZOWC90SVdOQWJVazN3Y0x2K214THlJVW1RZkhJZ2hiV3NXL2d2N2hSNTgyci9STnJuR3FpcTJhemR4WXNIVW5zbElSdVBRWXNiVzJVWVJ4SE94RmVBYmkxb1cyZFZhWHBlY3hRL21IbENyLzdBNmVUaE9wWGx3T2RVb2FMdkhyYU9FbGZqdHg2M0tndm9wako3VGZsRlZsZ0d0MjZaOGUzRlAxMjV2WXY2OWVQTm1EeWM5SytRZWRBeDErRE1XdU1BNXk4TVgwdlVMNWdxQ0hCaXkxV1EwUTI1aVI1VXBnYm10K2VYNmdpVWszM1FMZXlLcHJPMWVQajFZd2RMKytQTFErdHpzTlZJNXdFc0s4ak5WOXcxTWJsRkE9PTwvU2lnbmF0dXJlVmFsdWU+PEtleUluZm8+PFg1MDlEYXRhPjxYNTA5Q2VydGlmaWNhdGU+TUlJQy9qQ0NBZWFnQXdJQkFnSUpBS3lzb25saUZaTElNQTBHQ1NxR1NJYjNEUUVCQ3dVQU1DMHhLekFwQmdOVkJBTVRJbUZqWTI5MWJuUnpMbUZqWTJWemMyTnZiblJ5YjJ3dWQybHVaRzkzY3k1dVpYUXdIaGNOTWpRd01qQTRNVGN3TWpVeldoY05Namt3TWpBNE1UY3dNalV6V2pBdE1Tc3dLUVlEVlFRREV5SmhZMk52ZFc1MGN5NWhZMk5sYzNOamIyNTBjbTlzTG5kcGJtUnZkM011Ym1WME1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBdlJJTDNhWnQreFZxT1pnTU9yNzFsdFdlOVlZMldmL0IyOEM0SmwybkJTVEVjRm5mL2VxT0haOHl6VUJiTGM0TnRpMi9FVGNDc1RVTnV6UzM2OEJXa1NneGM0NUpCSDF3RlNvV05GVVNYYVB0OG1Sd0pZVEYwSDMyaU5ody90QmI5bXZkUVZnVnM0Q2kwZFZKUllpeitpbGszUGVPOHd6bHdSdXdXSXNhS0ZZbE15T0tHOURWRmJnOTNEbVA1VGpxM0Mzb0psQVR5aEFpSkpjMVQydHJFUDg5NjBhbjMzZERFYVd3VkFIaDNjLzM0bWVBTzRSNmtMeklxMEpuU3NaTVlCOU8vNmJNeUlsenhtZFo4RjQ0MlN5bkNVSHhobkloM3laZXcreERkZUhyNk9mbDdLZVZVY3ZTaVpQOVg0NENhVkp2a25YUWJCWU5sK0g3WUY1UmdRSURBUUFCb3lFd0h6QWRCZ05WSFE0RUZnUVU4U3FtcmYwVUZwWmJHdGw1eTFDalVkUXE1eWN3RFFZSktvWklodmNOQVFFTEJRQURnZ0VCQUE1N0ZpSU9VczV5eUxENmE2cldDYlE0WjJYSlRmUWIrVE0vdFo2VjZRcU5oU1MrUTk4S0ZPSVdlOVNpdDBpQXlEc0NDS3VBOGYwOFBZblVpSG1IcThkRy83WVJUU2hFLzN6Q1pYSFlLSmdNYUJoWWZTNzg4elF1cS9oWERkVlZjNVgwcFp3TTRpYmM2KzJYcGNwZURIeHBNT0x3bzJBd3VqRGRIVkx6ZWRBa0lhVEN6d1BJaXpQNExCNmw2SXhSK3hSWHNILzFmMDM0R2szUmVBRUdnSFcxMk5rYWp0WG1DM0RLbDZ2R0lIdngxUGdBTVdRYnhxM0YyT29wTng2YVpFSUlaV2NNcFFaNi82MmYzcHhSSkh6WmlKWk4ra2hWOGhwTmpKdkNOZjYvaE5ieGtMY2pMQXljalc4QXR0Y0NSU1RNNEYrMDJTM1R5SG1vRTRwWXl3QT08L1g1MDlDZXJ0aWZpY2F0ZT48L1g1MDlEYXRhPjwvS2V5SW5mbz48L1NpZ25hdHVyZT48U3ViamVjdD48TmFtZUlEIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6cGVyc2lzdGVudCI+VjZuQ1AzblV5RVBCLU1qQm5ZNUk4aHVjamxsN2hKOUlZaHNKNXpOZGtjczwvTmFtZUlEPjxTdWJqZWN0Q29uZmlybWF0aW9uIE1ldGhvZD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmNtOmJlYXJlciI+PFN1YmplY3RDb25maXJtYXRpb25EYXRhIEluUmVzcG9uc2VUbz0iQVJRZTAyZDdiNy1hYzNkLTRiMGQtYmIxNy02YzU0ZWYzYjA4ZjEiIE5vdE9uT3JBZnRlcj0iMjAyNC0wMy0yMVQxMzo1NzoyNy45NjJaIiBSZWNpcGllbnQ9Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9zYW1sL1NTTyIvPjwvU3ViamVjdENvbmZpcm1hdGlvbj48L1N1YmplY3Q+PENvbmRpdGlvbnMgTm90QmVmb3JlPSIyMDI0LTAzLTIxVDEyOjUyOjI3Ljk2MloiIE5vdE9uT3JBZnRlcj0iMjAyNC0wMy0yMVQxMzo1NzoyNy45NjJaIj48QXVkaWVuY2VSZXN0cmljdGlvbj48QXVkaWVuY2U+c3BuOjk1MjEwMjIzLTE0NzEtNDdkZS04Zjc2LWMwZjQyMGMxNzM4ZjwvQXVkaWVuY2U+PC9BdWRpZW5jZVJlc3RyaWN0aW9uPjwvQ29uZGl0aW9ucz48QXR0cmlidXRlU3RhdGVtZW50PjxBdHRyaWJ1dGUgTmFtZT0iaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS9pZGVudGl0eS9jbGFpbXMvdGVuYW50aWQiPjxBdHRyaWJ1dGVWYWx1ZT42MDNlOTk0Ni03OWZkLTQyYmMtYmFlMi0yYWJkYTE5Y2I2OTU8L0F0dHJpYnV0ZVZhbHVlPjwvQXR0cmlidXRlPjxBdHRyaWJ1dGUgTmFtZT0iaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS9pZGVudGl0eS9jbGFpbXMvb2JqZWN0aWRlbnRpZmllciI+PEF0dHJpYnV0ZVZhbHVlPjhiODZiNDEyLTk0NzYtNGUyMy1iMTMxLTM3OTc3ODJiY2JlNDwvQXR0cmlidXRlVmFsdWU+PC9BdHRyaWJ1dGU+PEF0dHJpYnV0ZSBOYW1lPSJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIj48QXR0cmlidXRlVmFsdWU+dGVzdEBhbG9pc29zcGVsdG91dGxvb2sub25taWNyb3NvZnQuY29tPC9BdHRyaWJ1dGVWYWx1ZT48L0F0dHJpYnV0ZT48QXR0cmlidXRlIE5hbWU9Imh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vaWRlbnRpdHkvY2xhaW1zL2Rpc3BsYXluYW1lIj48QXR0cmlidXRlVmFsdWU+dGVzdDwvQXR0cmlidXRlVmFsdWU+PC9BdHRyaWJ1dGU+PEF0dHJpYnV0ZSBOYW1lPSJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL2lkZW50aXR5L2NsYWltcy9pZGVudGl0eXByb3ZpZGVyIj48QXR0cmlidXRlVmFsdWU+aHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNjAzZTk5NDYtNzlmZC00MmJjLWJhZTItMmFiZGExOWNiNjk1LzwvQXR0cmlidXRlVmFsdWU+PC9BdHRyaWJ1dGU+PEF0dHJpYnV0ZSBOYW1lPSJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL2NsYWltcy9hdXRobm1ldGhvZHNyZWZlcmVuY2VzIj48QXR0cmlidXRlVmFsdWU+aHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2F1dGhlbnRpY2F0aW9ubWV0aG9kL3Bhc3N3b3JkPC9BdHRyaWJ1dGVWYWx1ZT48L0F0dHJpYnV0ZT48L0F0dHJpYnV0ZVN0YXRlbWVudD48QXV0aG5TdGF0ZW1lbnQgQXV0aG5JbnN0YW50PSIyMDI0LTAzLTIxVDEyOjU3OjIzLjEwOVoiIFNlc3Npb25JbmRleD0iX2MyNzU2YjRhLTI1Y2UtNDVmNC1iZDI4LTljNmI0NmE4MjAwMCI+PEF1dGhuQ29udGV4dD48QXV0aG5Db250ZXh0Q2xhc3NSZWY+dXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFjOmNsYXNzZXM6UGFzc3dvcmQ8L0F1dGhuQ29udGV4dENsYXNzUmVmPjwvQXV0aG5Db250ZXh0PjwvQXV0aG5TdGF0ZW1lbnQ+PC9Bc3NlcnRpb24+PC9zYW1scDpSZXNwb25zZT4=
RelayState: a16f9b47-2543-41db-946a-0e93731d3aed

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml

<samlp:Response ID="_223f6f44-4e27-4fd6-bb7c-4dab599276cd" Version="2.0" IssueInstant="2024-03-21T12:57:28.031Z" Destination="http://localhost:8080/saml/SSO" InResponseTo="ARQe02d7b7-ac3d-4b0d-bb17-6c54ef3b08f1"
    xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">
    <Issuer
        xmlns="urn:oasis:names:tc:SAML:2.0:assertion">https://sts.windows.net/603e9946-79fd-42bc-bae2-2abda19cb695/
    </Issuer>
    <samlp:Status>
        <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
    <Assertion ID="_c2756b4a-25ce-45f4-bd28-9c6b46a82000" IssueInstant="2024-03-21T12:57:28.027Z" Version="2.0"
        xmlns="urn:oasis:names:tc:SAML:2.0:assertion">
        <Issuer>https://sts.windows.net/603e9946-79fd-42bc-bae2-2abda19cb695/</Issuer>
        <Signature
            xmlns="http://www.w3.org/2000/09/xmldsig#">
            <SignedInfo>
                <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
                <Reference URI="#_c2756b4a-25ce-45f4-bd28-9c6b46a82000">
                    <Transforms>
                        <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                        <Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                    </Transforms>
                    <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                    <DigestValue>3QObW8DZYzKTP/54IlSiG1xUY0o3jkajAqfJ3JMYHV8=</DigestValue>
                </Reference>
            </SignedInfo>
            <SignatureValue>SGx5BH1Wz3CytGGHQwNfC79hnphN8a3UqWZ9pSPmdw5Sh+SoM8+iFDYdMQbfNX/tIWNAbUk3wcLv+mxLyIUmQfHIghbWsW/gv7hR582r/RNrnGqiq2azdxYsHUnslIRuPQYsbW2UYRxHOxFeAbi1oW2dVaXpecxQ/mHlCr/7A6eThOpXlwOdUoaLvHraOElfjtx63KgvopjJ7TflFVlgGt26Z8e3FP125vYv69ePNmDyc9K+QedAx1+DMWuMA5y8MX0vUL5gqCHBiy1WQ0Q25iR5Upgbmt+eX6giUk33QLeyKprO1ePj1YwdL++PLQ+tzsNVI5wEsK8jNV9w1MblFA==</SignatureValue>
            <KeyInfo>
                <X509Data>
                    <X509Certificate>MIIC/jCCAeagAwIBAgIJAKysonliFZLIMA0GCSqGSIb3DQEBCwUAMC0xKzApBgNVBAMTImFjY291bnRzLmFjY2Vzc2NvbnRyb2wud2luZG93cy5uZXQwHhcNMjQwMjA4MTcwMjUzWhcNMjkwMjA4MTcwMjUzWjAtMSswKQYDVQQDEyJhY2NvdW50cy5hY2Nlc3Njb250cm9sLndpbmRvd3MubmV0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvRIL3aZt+xVqOZgMOr71ltWe9YY2Wf/B28C4Jl2nBSTEcFnf/eqOHZ8yzUBbLc4Nti2/ETcCsTUNuzS368BWkSgxc45JBH1wFSoWNFUSXaPt8mRwJYTF0H32iNhw/tBb9mvdQVgVs4Ci0dVJRYiz+ilk3PeO8wzlwRuwWIsaKFYlMyOKG9DVFbg93DmP5Tjq3C3oJlATyhAiJJc1T2trEP8960an33dDEaWwVAHh3c/34meAO4R6kLzIq0JnSsZMYB9O/6bMyIlzxmdZ8F442SynCUHxhnIh3yZew+xDdeHr6Ofl7KeVUcvSiZP9X44CaVJvknXQbBYNl+H7YF5RgQIDAQABoyEwHzAdBgNVHQ4EFgQU8Sqmrf0UFpZbGtl5y1CjUdQq5ycwDQYJKoZIhvcNAQELBQADggEBAA57FiIOUs5yyLD6a6rWCbQ4Z2XJTfQb+TM/tZ6V6QqNhSS+Q98KFOIWe9Sit0iAyDsCCKuA8f08PYnUiHmHq8dG/7YRTShE/3zCZXHYKJgMaBhYfS788zQuq/hXDdVVc5X0pZwM4ibc6+2XpcpeDHxpMOLwo2AwujDdHVLzedAkIaTCzwPIizP4LB6l6IxR+xRXsH/1f034Gk3ReAEGgHW12NkajtXmC3DKl6vGIHvx1PgAMWQbxq3F2OopNx6aZEIIZWcMpQZ6/62f3pxRJHzZiJZN+khV8hpNjJvCNf6/hNbxkLcjLAycjW8AttcCRSTM4F+02S3TyHmoE4pYywA=</X509Certificate>
                </X509Data>
            </KeyInfo>
        </Signature>
        <Subject>
            <NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">V6nCP3nUyEPB-MjBnY5I8hucjll7hJ9IYhsJ5zNdkcs</NameID>
            <SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <SubjectConfirmationData InResponseTo="ARQe02d7b7-ac3d-4b0d-bb17-6c54ef3b08f1" NotOnOrAfter="2024-03-21T13:57:27.962Z" Recipient="http://localhost:8080/saml/SSO"/>
            </SubjectConfirmation>
        </Subject>
        <Conditions NotBefore="2024-03-21T12:52:27.962Z" NotOnOrAfter="2024-03-21T13:57:27.962Z">
            <AudienceRestriction>
                <Audience>spn:95210223-1471-47de-8f76-c0f420c1738f</Audience>
            </AudienceRestriction>
        </Conditions>
        <AttributeStatement>
            <Attribute Name="http://schemas.microsoft.com/identity/claims/tenantid">
                <AttributeValue>603e9946-79fd-42bc-bae2-2abda19cb695</AttributeValue>
            </Attribute>
            <Attribute Name="http://schemas.microsoft.com/identity/claims/objectidentifier">
                <AttributeValue>8b86b412-9476-4e23-b131-3797782bcbe4</AttributeValue>
            </Attribute>
            <Attribute Name="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name">
                <AttributeValue>test@aloisospeltoutlook.onmicrosoft.com</AttributeValue>
            </Attribute>
            <Attribute Name="http://schemas.microsoft.com/identity/claims/displayname">
                <AttributeValue>test</AttributeValue>
            </Attribute>
            <Attribute Name="http://schemas.microsoft.com/identity/claims/identityprovider">
                <AttributeValue>https://sts.windows.net/603e9946-79fd-42bc-bae2-2abda19cb695/</AttributeValue>
            </Attribute>
            <Attribute Name="http://schemas.microsoft.com/claims/authnmethodsreferences">
                <AttributeValue>http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password</AttributeValue>
            </Attribute>
        </AttributeStatement>
        <AuthnStatement AuthnInstant="2024-03-21T12:57:23.109Z" SessionIndex="_c2756b4a-25ce-45f4-bd28-9c6b46a82000">
            <AuthnContext>
                <AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:Password</AuthnContextClassRef>
            </AuthnContext>
        </AuthnStatement>
    </Assertion>
</samlp:Response>

```

7. 认证成功，跳转到登录前页面 `http://localhost:8080/?continue`

```shell

SAML 2.0 Login & Single Logout with Spring Security
You are successfully logged in as V6nCP3nUyEPB-MjBnY5I8hucjll7hJ9IYhsJ5zNdkcs

You're email address is

All Your Attributes
http://schemas.microsoft.com/identity/claims/tenantid
[603e9946-79fd-42bc-bae2-2abda19cb695]
http://schemas.microsoft.com/identity/claims/objectidentifier
[8b86b412-9476-4e23-b131-3797782bcbe4]
http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name
[test@aloisospeltoutlook.onmicrosoft.com]
http://schemas.microsoft.com/identity/claims/displayname
[test]
http://schemas.microsoft.com/identity/claims/identityprovider
[https://sts.windows.net/603e9946-79fd-42bc-bae2-2abda19cb695/]
http://schemas.microsoft.com/claims/authnmethodsreferences
[http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/password]
Visit the [SAML 2.0 Login & Logout](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-saml2) documentation for more details.

```

### 4. Auzre-AD登出

1. 点击页面的 `RP-initiated Logout` 

2. 访问 `http://localhost:8080/logout`

3. 跳转 `https://login.microsoftonline.com/603e9946-79fd-42bc-bae2-2abda19cb695/saml2?SAMLRequest=nZJfT%2BQgFMW%2FSsM7LVBogUzHqLOb1IzG%2BC9xXwxQOlNtYbbQjbuffuvoGNcHH%2FaNXO65v3sOLI6ehz75ZcfQeVcBnCKQWGd807lNBW5vvkMOjpaLoIae7OTab%2FwUr%2BzPyYaYzEoX5OtVBabRSa9CF6RTgw0yGnl9fL6WJEVyN%2Froje9BspqFnVNxT9vGuAsyy3q%2F6Vw6dGb0wbfRu75zNjV%2ByAqUWyFoAUvRNpASbaBWlkCidKOwMLoQLNtvAJJ6VYH1ldbMlE1LIRcth1QXGHJeFvPJaGWwagXlc28Ik61diMrFChBEKEQ5JPgG5xIhyVDKkfgBkrtDMLML8BaD3IvHj%2Fa%2Fdq9CsOOLY7AMOycFIxgRkkNMSwxp2VjI23lDg1pKkMFlzttF9hF1AF%2FMo%2BvVf4HvCnd6mbvb398uT%2BD544m7ZzXfTuax78vtmajvt%2BGM%2Fblonkw4sF9p729%2FbcNLFLVr7PPywZCSFZoqSJixkLI5cN0QDoWZq4XiBCH0NuiT9L36z2da%2FgU%3D&RelayState=204cbfee-e882-4cc3-ad08-6339e7c9b8a0&SigAlg=http%3A%2F%2Fwww.w3.org%2F2001%2F04%2Fxmldsig-more%23rsa-sha256&Signature=H%2BtZIhIJL34ItNmxFU0Z19wD8QFevT5uldNpQvUIDSEMUjiGqAeaieWd9%2BPsGqAcZgM77pARHfmBGWMvZFhULgWT5d5p%2FYiNCjqc4h7WTwIAUVNVHFAG3M4HaNvZBpaLBcgT8OxngzMLWBAiYTxupNj38r3rT9nx%2FALKs6Tbxaw%3D`

```shell
SAMLRequest: nZJfT+QgFMW/SsM7LVBogUzHqLOb1IzG+C9xXwxQOlNtYbbQjbuffuvoGNcHH/aNXO65v3sOLI6ehz75ZcfQeVcBnCKQWGd807lNBW5vvkMOjpaLoIae7OTab/wUr+zPyYaYzEoX5OtVBabRSa9CF6RTgw0yGnl9fL6WJEVyN/roje9BspqFnVNxT9vGuAsyy3q/6Vw6dGb0wbfRu75zNjV+yAqUWyFoAUvRNpASbaBWlkCidKOwMLoQLNtvAJJ6VYH1ldbMlE1LIRcth1QXGHJeFvPJaGWwagXlc28Ik61diMrFChBEKEQ5JPgG5xIhyVDKkfgBkrtDMLML8BaD3IvHj/a/dq9CsOOLY7AMOycFIxgRkkNMSwxp2VjI23lDg1pKkMFlzttF9hF1AF/Mo+vVf4HvCnd6mbvb398uT+D544m7ZzXfTuax78vtmajvt+GM/blonkw4sF9p729/bcNLFLVr7PPywZCSFZoqSJixkLI5cN0QDoWZq4XiBCH0NuiT9L36z2da/gU=
RelayState: 204cbfee-e882-4cc3-ad08-6339e7c9b8a0
SigAlg: http://www.w3.org/2001/04/xmldsig-more#rsa-sha256
Signature: H+tZIhIJL34ItNmxFU0Z19wD8QFevT5uldNpQvUIDSEMUjiGqAeaieWd9+PsGqAcZgM77pARHfmBGWMvZFhULgWT5d5p/YiNCjqc4h7WTwIAUVNVHFAG3M4HaNvZBpaLBcgT8OxngzMLWBAiYTxupNj38r3rT9nx/ALKs6Tbxaw=
```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:LogoutRequest
    xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" Destination="https://login.microsoftonline.com/603e9946-79fd-42bc-bae2-2abda19cb695/saml2" ID="LRbb5c7df4-89f8-4b61-8876-4bcbac1af948" IssueInstant="2024-03-21T13:00:50.809Z" Version="2.0">
    <saml2:Issuer
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">spn:95210223-1471-47de-8f76-c0f420c1738f
    </saml2:Issuer>
    <saml2:NameID
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">V6nCP3nUyEPB-MjBnY5I8hucjll7hJ9IYhsJ5zNdkcs
    </saml2:NameID>
    <saml2p:SessionIndex>_c2756b4a-25ce-45f4-bd28-9c6b46a82000</saml2p:SessionIndex>
</saml2p:LogoutRequest>
```

### 5. Okta登录
```java
http.csrf().disable()

```

```yaml
spring:
  profiles:
   active: okta
#    active: azure-ad
#    active: keycloak

```

添加一个配置文件 `application-okta.yaml`，其他不需要改动
```yaml
server:
  port: 8080

logging.level:
  org.springframework.security: TRACE

spring:
  security:
    filter:
      dispatcher-types: async, error, request, forward
    saml2:
      relyingparty:
        registration:
          okta:
            signing:
              credentials:
                - private-key-location: classpath:credentials/rp-private.key
                  certificate-location: classpath:credentials/rp-certificate.crt
            singlelogout:
              binding: POST
              response-url: "{baseUrl}/logout/saml2/slo"
            assertingparty:
              # metadata-uri: https://${yourOktaDomain}/app/<random-characters>/sso/saml/metadata
              metadata-uri: https://dev-70304605.okta.com/app/exkg3seq7hh0uUigL5d7/sso/saml/metadata

```

1. 浏览器访问 `http://sp.light.local:8080/login`

2. 请求未认证，跳转到认证端点  `http://sp.light.local:8080/saml2/authenticate/okta`

3. 认证端点构建请求XML并跳转到 IDP 进行认证 `https://dev-70304605.okta.com/app/dev-70304605_springbootsaml_1/exkg3seq7hh0uUigL5d7/sso/saml`

```shell
SAMLRequest: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c2FtbDJwOkF1dGhuUmVxdWVzdCB4bWxuczpzYW1sMnA9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpwcm90b2NvbCIgQXNzZXJ0aW9uQ29uc3VtZXJTZXJ2aWNlVVJMPSJodHRwOi8vc3AubGlnaHQubG9jYWw6ODA4MC9sb2dpbi9zYW1sMi9zc28vb2t0YSIgRGVzdGluYXRpb249Imh0dHBzOi8vZGV2LTcwMzA0NjA1Lm9rdGEuY29tL2FwcC9kZXYtNzAzMDQ2MDVfc3ByaW5nYm9vdHNhbWxfMS9leGtnM3NlcTdoaDB1VWlnTDVkNy9zc28vc2FtbCIgRm9yY2VBdXRobj0iZmFsc2UiIElEPSJBUlFlMWY3Y2ZhLWE3OTctNDMxMC1iNjc3LWVjYjc2NTAwNjkwOSIgSXNQYXNzaXZlPSJmYWxzZSIgSXNzdWVJbnN0YW50PSIyMDI0LTAzLTI5VDA3OjQyOjE5LjUwM1oiIFByb3RvY29sQmluZGluZz0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmJpbmRpbmdzOkhUVFAtUE9TVCIgVmVyc2lvbj0iMi4wIj48c2FtbDI6SXNzdWVyIHhtbG5zOnNhbWwyPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXNzZXJ0aW9uIj5odHRwOi8vc3AubGlnaHQubG9jYWw6ODA4MC9zYW1sMi9zZXJ2aWNlLXByb3ZpZGVyLW1ldGFkYXRhL29rdGE8L3NhbWwyOklzc3Vlcj48L3NhbWwycDpBdXRoblJlcXVlc3Q+
RelayState: ebb22902-ecf2-4c9b-83a5-157ab938bd77

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:AuthnRequest
    xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" AssertionConsumerServiceURL="http://sp.light.local:8080/login/saml2/sso/okta" Destination="https://dev-70304605.okta.com/app/dev-70304605_springbootsaml_1/exkg3seq7hh0uUigL5d7/sso/saml" ForceAuthn="false" ID="ARQe1f7cfa-a797-4310-b677-ecb765006909" IsPassive="false" IssueInstant="2024-03-29T07:42:19.503Z" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Version="2.0">
    <saml2:Issuer
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://sp.light.local:8080/saml2/service-provider-metadata/okta
    </saml2:Issuer>
</saml2p:AuthnRequest>
```
Since your browser does not support JavaScript,
                you must press the Continue button once to proceed.
4. 跳转到IDP的登录页面 `https://okta-devok12.okta.com/sso/idps/0oayfl0lW6xetjKjD5d5`

5. 输入账号密码登录，参数地址 `http://idp.light.local:8880/realms/Test/login-actions/authenticate?session_code=MvMW4bA0BC3Bupw7JKv1CNAqGoT9NGisn7OCuOTiYXo&execution=aafd808a-c8f5-43e9-86f9-b8b972bcef00&client_id=saml_client&tab_id=RVN4eRYh270` 携带的Form表单参数为 `username=light&password=light&credentialId=`

6. 认证成功，回调到SP的认证端点 `http://sp.light.local:8080/login/saml2/sso/okta`

```shell
SAMLResponse: PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c2FtbDJwOlJlc3BvbnNlIERlc3RpbmF0aW9uPSJodHRwOi8vc3AubGlnaHQubG9jYWw6ODA4MC9zYW1sMi9hdXRoZW50aWNhdGUvb2t0YSIgSUQ9ImlkMjk3NTU5MTk2MDgyNTk1MzE5MTY1ODcwIiBJblJlc3BvbnNlVG89IkFSUWUxZjdjZmEtYTc5Ny00MzEwLWI2NzctZWNiNzY1MDA2OTA5IiBJc3N1ZUluc3RhbnQ9IjIwMjQtMDMtMjlUMDc6NDI6MjIuMTM2WiIgVmVyc2lvbj0iMi4wIiB4bWxuczpzYW1sMnA9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpwcm90b2NvbCIgeG1sbnM6eHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hIj48c2FtbDI6SXNzdWVyIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6ZW50aXR5IiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiI+aHR0cDovL3d3dy5va3RhLmNvbS9leGtnM3NlcTdoaDB1VWlnTDVkNzwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPjxkczpTaWduZWRJbmZvPjxkczpDYW5vbmljYWxpemF0aW9uTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz48ZHM6UmVmZXJlbmNlIFVSST0iI2lkMjk3NTU5MTk2MDgyNTk1MzE5MTY1ODcwIj48ZHM6VHJhbnNmb3Jtcz48ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnI2VudmVsb3BlZC1zaWduYXR1cmUiLz48ZHM6VHJhbnNmb3JtIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIj48ZWM6SW5jbHVzaXZlTmFtZXNwYWNlcyBQcmVmaXhMaXN0PSJ4cyIgeG1sbnM6ZWM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyIvPjwvZHM6VHJhbnNmb3JtPjwvZHM6VHJhbnNmb3Jtcz48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzOkRpZ2VzdFZhbHVlPnM4b3ZrU1NwN2RFQjI5bC9ZMENTL3hzL2RqdnZCd0poT1N2RzRRWjVKSG89PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48L2RzOlNpZ25lZEluZm8+PGRzOlNpZ25hdHVyZVZhbHVlPkJyUzNFVzgxeHNQNUxwc2FlWHBUSkpqWlNxdjNpNFUvbVdaNWoydnluYjNoOGc2S3o5UEphNWlxMjN1RU8ydGxUaVZTNlpGQ0ZqWkhFcytBNDhlUUlHbXNiamZuR09IT2JTZE9vNDJ0VzRJYis2RFRNN3h0c1UxSUdZRlc5RU5KWFR0OFNBWjVsZktWV1d5Q2VycDBCbkxIZ1pQa3RvQy9tQ0Zzc09qSTRKMzkra3lXOUxFRDVBdFhnTkVTcmlxUFZLeTR4RytGZ2dJSDhkQ3UxNCtDQWduTDk2M1QrOTV0cEtzV3habDdGcS9DencxZVlOeUVIZmVMK3NNWEpIcEh1bitDcFYxY2JxV2xlbHRQUWh0eVNORk1zanlrbStaM0JyVHpodlF5d05mY1lieXhwS1krMEU4SlFGV3BBd1NDcWtValQ3NzlFZWFvalBJL2Jac2M3QT09PC9kczpTaWduYXR1cmVWYWx1ZT48ZHM6S2V5SW5mbz48ZHM6WDUwOURhdGE+PGRzOlg1MDlDZXJ0aWZpY2F0ZT5NSUlEcURDQ0FwQ2dBd0lCQWdJR0FZNklXRUdwTUEwR0NTcUdTSWIzRFFFQkN3VUFNSUdVTVFzd0NRWURWUVFHRXdKVlV6RVRNQkVHCkExVUVDQXdLUTJGc2FXWnZjbTVwWVRFV01CUUdBMVVFQnd3TlUyRnVJRVp5WVc1amFYTmpiekVOTUFzR0ExVUVDZ3dFVDJ0MFlURVUKTUJJR0ExVUVDd3dMVTFOUFVISnZkbWxrWlhJeEZUQVRCZ05WQkFNTURHUmxkaTAzTURNd05EWXdOVEVjTUJvR0NTcUdTSWIzRFFFSgpBUllOYVc1bWIwQnZhM1JoTG1OdmJUQWVGdzB5TkRBek1qa3dNelV6TWpsYUZ3MHpOREF6TWprd016VTBNamhhTUlHVU1Rc3dDUVlEClZRUUdFd0pWVXpFVE1CRUdBMVVFQ0F3S1EyRnNhV1p2Y201cFlURVdNQlFHQTFVRUJ3d05VMkZ1SUVaeVlXNWphWE5qYnpFTk1Bc0cKQTFVRUNnd0VUMnQwWVRFVU1CSUdBMVVFQ3d3TFUxTlBVSEp2ZG1sa1pYSXhGVEFUQmdOVkJBTU1ER1JsZGkwM01ETXdORFl3TlRFYwpNQm9HQ1NxR1NJYjNEUUVKQVJZTmFXNW1iMEJ2YTNSaExtTnZiVENDQVNJd0RRWUpLb1pJaHZjTkFRRUJCUUFEZ2dFUEFEQ0NBUW9DCmdnRUJBTTdOTDhLZkNQVzdLUERwOGhGRk0yZDhUb09Sdnk5WGx5b3FYbGhMd3hVNDZaUWRhVGVLaHJQU1ZKSWpmODlZRlkwT3JVU0sKcUJzU0dTSGFPT0tEQnZTZTlDemdBR1c0MzRXemVXZitJOVFxTWdZZjNhQ3hZRjVPNWFvTCtEald4YitqRmMrenI2c2JVa0IyaE5KbQpBVmwwRk5BRFN0NmJFM3YzYmxJeUplVGcwcVFXeUZ3TFNMK0ZucjNDVFczb2JWZlJZcTNjZHlra0FyU3BBay9ObFk0N2RzTXNQU3UzCmZiN1BoNXRjYXFLdnVvMFFJeUtBZXgrN015cDc0SzdmZVFXTUgvN1VlOS9VUCtMY0lrem1OQ0ZydUR1SitQa1BYcWhMY25ORVl6WUkKQkdKa2wxWXZNTUpNVUkyR1ZhTjJQdnFsdjlqd1VSZXNHZjRmYWovSjJBTUNBd0VBQVRBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQQprQlV6bm44cG1aZ0VpVGcwcGFRSldxUHROc1FxeGpnVW5pRGxwTjk5NE9NeVdSNitrNnpUeVNtc0JmVE5QS2NFcTF5dFJPWHR6N1JtCmlaUk1KRitzdnBHUkNYVFZOY0Rma3hJVEs3aDRXZ29uYjdsOU1kS2xCNSthaStJQ3F4QlplekxZd2hWdlZxazdlM24rMFpEaERjMUkKVkgvc1F3UGNoSFMwVkdvSTYzUzZ6VzNFbE03dkdVNnRQTWt1YjYrdUdNenkxTmp3azR4VDc4UytSSkx0dTIxalBFLzFwNjJncnk5QQpjMTBXWSt2SmNqclJCS3J5V2ZQZ3JjQTZLb2x0Z1h3Tjh4cC9PNnZScFdiZ3RuWm1GMEEvQkNrUmFWelBGTzl6eVVPMjhUVWF3SXJ5CmNUaEI1c1QwREhpSnNhU3dIM1A0Zm1HdWlMYUliYU5sZzB0Mk9RPT08L2RzOlg1MDlDZXJ0aWZpY2F0ZT48L2RzOlg1MDlEYXRhPjwvZHM6S2V5SW5mbz48L2RzOlNpZ25hdHVyZT48c2FtbDJwOlN0YXR1cyB4bWxuczpzYW1sMnA9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDpwcm90b2NvbCI+PHNhbWwycDpTdGF0dXNDb2RlIFZhbHVlPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6c3RhdHVzOlN1Y2Nlc3MiLz48L3NhbWwycDpTdGF0dXM+PHNhbWwyOkFzc2VydGlvbiBJRD0iaWQyOTc1NTkxOTYyMzkyMTgxMDcyMjQ5MjMyIiBJc3N1ZUluc3RhbnQ9IjIwMjQtMDMtMjlUMDc6NDI6MjIuMTM2WiIgVmVyc2lvbj0iMi4wIiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiIgeG1sbnM6eHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hIj48c2FtbDI6SXNzdWVyIEZvcm1hdD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOm5hbWVpZC1mb3JtYXQ6ZW50aXR5IiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiI+aHR0cDovL3d3dy5va3RhLmNvbS9leGtnM3NlcTdoaDB1VWlnTDVkNzwvc2FtbDI6SXNzdWVyPjxkczpTaWduYXR1cmUgeG1sbnM6ZHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiPjxkczpTaWduZWRJbmZvPjxkczpDYW5vbmljYWxpemF0aW9uTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8xMC94bWwtZXhjLWMxNG4jIi8+PGRzOlNpZ25hdHVyZU1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZHNpZy1tb3JlI3JzYS1zaGEyNTYiLz48ZHM6UmVmZXJlbmNlIFVSST0iI2lkMjk3NTU5MTk2MjM5MjE4MTA3MjI0OTIzMiI+PGRzOlRyYW5zZm9ybXM+PGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyNlbnZlbG9wZWQtc2lnbmF0dXJlIi8+PGRzOlRyYW5zZm9ybSBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMTAveG1sLWV4Yy1jMTRuIyI+PGVjOkluY2x1c2l2ZU5hbWVzcGFjZXMgUHJlZml4TGlzdD0ieHMiIHhtbG5zOmVjPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz48L2RzOlRyYW5zZm9ybT48L2RzOlRyYW5zZm9ybXM+PGRzOkRpZ2VzdE1ldGhvZCBBbGdvcml0aG09Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvMDQveG1sZW5jI3NoYTI1NiIvPjxkczpEaWdlc3RWYWx1ZT5Yc25iVkRRTnJpaFVzSVB1aTdaeEdYZm1JVFp0OHJaenc1bFZuODVGSGRjPTwvZHM6RGlnZXN0VmFsdWU+PC9kczpSZWZlcmVuY2U+PC9kczpTaWduZWRJbmZvPjxkczpTaWduYXR1cmVWYWx1ZT54c1Z2UFhMRVF5R0xEVmliYXRXNzF4ZTRGNDEzeGhRR24vdVRjb3FjdlRpSlVWcDBNRFF0amJ3L3NJZTBXeUJ2S0N3dndjcm1uZTFhMFdNM01ZRWRJR0hGMDFycWU4UjJFK2cxa08yYkZJUkdKRlJFMTJjSUlHNlBMbFovbjdQRWlPUWJzbytDT3RSblpzRHpCQWczN2kra09OcnZkdGdHdjRWLzJ6T3NDWWZ6cWZ2NXY3WXJtUVJtWVVUZm5DWVZoZWZCbzBiUVFnWTIzK2VtMStncmF6N1ZWZVJZTCtCdFFxa25Bck0xSCtzN3UwRWFIMXp0MlUwdG81QkJpamdzWW0xNzVUazlmVHdGQS9USTBjbmZPMjM0cmk4VEhidS9TZWJncjVURDJ1QXFLK0lLRkM2N1crbGhxeFlqQkZOSmEvOXV4U1poVlROZVZ4aUJJcEFySmc9PTwvZHM6U2lnbmF0dXJlVmFsdWU+PGRzOktleUluZm8+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJRHFEQ0NBcENnQXdJQkFnSUdBWTZJV0VHcE1BMEdDU3FHU0liM0RRRUJDd1VBTUlHVU1Rc3dDUVlEVlFRR0V3SlZVekVUTUJFRwpBMVVFQ0F3S1EyRnNhV1p2Y201cFlURVdNQlFHQTFVRUJ3d05VMkZ1SUVaeVlXNWphWE5qYnpFTk1Bc0dBMVVFQ2d3RVQydDBZVEVVCk1CSUdBMVVFQ3d3TFUxTlBVSEp2ZG1sa1pYSXhGVEFUQmdOVkJBTU1ER1JsZGkwM01ETXdORFl3TlRFY01Cb0dDU3FHU0liM0RRRUoKQVJZTmFXNW1iMEJ2YTNSaExtTnZiVEFlRncweU5EQXpNamt3TXpVek1qbGFGdzB6TkRBek1qa3dNelUwTWpoYU1JR1VNUXN3Q1FZRApWUVFHRXdKVlV6RVRNQkVHQTFVRUNBd0tRMkZzYVdadmNtNXBZVEVXTUJRR0ExVUVCd3dOVTJGdUlFWnlZVzVqYVhOamJ6RU5NQXNHCkExVUVDZ3dFVDJ0MFlURVVNQklHQTFVRUN3d0xVMU5QVUhKdmRtbGtaWEl4RlRBVEJnTlZCQU1NREdSbGRpMDNNRE13TkRZd05URWMKTUJvR0NTcUdTSWIzRFFFSkFSWU5hVzVtYjBCdmEzUmhMbU52YlRDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQwpnZ0VCQU03Tkw4S2ZDUFc3S1BEcDhoRkZNMmQ4VG9PUnZ5OVhseW9xWGxoTHd4VTQ2WlFkYVRlS2hyUFNWSklqZjg5WUZZME9yVVNLCnFCc1NHU0hhT09LREJ2U2U5Q3pnQUdXNDM0V3plV2YrSTlRcU1nWWYzYUN4WUY1TzVhb0wrRGpXeGIrakZjK3pyNnNiVWtCMmhOSm0KQVZsMEZOQURTdDZiRTN2M2JsSXlKZVRnMHFRV3lGd0xTTCtGbnIzQ1RXM29iVmZSWXEzY2R5a2tBclNwQWsvTmxZNDdkc01zUFN1MwpmYjdQaDV0Y2FxS3Z1bzBRSXlLQWV4KzdNeXA3NEs3ZmVRV01ILzdVZTkvVVArTGNJa3ptTkNGcnVEdUorUGtQWHFoTGNuTkVZellJCkJHSmtsMVl2TU1KTVVJMkdWYU4yUHZxbHY5andVUmVzR2Y0ZmFqL0oyQU1DQXdFQUFUQU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FRRUEKa0JVem5uOHBtWmdFaVRnMHBhUUpXcVB0TnNRcXhqZ1VuaURscE45OTRPTXlXUjYrazZ6VHlTbXNCZlROUEtjRXExeXRST1h0ejdSbQppWlJNSkYrc3ZwR1JDWFRWTmNEZmt4SVRLN2g0V2dvbmI3bDlNZEtsQjUrYWkrSUNxeEJaZXpMWXdoVnZWcWs3ZTNuKzBaRGhEYzFJClZIL3NRd1BjaEhTMFZHb0k2M1M2elczRWxNN3ZHVTZ0UE1rdWI2K3VHTXp5MU5qd2s0eFQ3OFMrUkpMdHUyMWpQRS8xcDYyZ3J5OUEKYzEwV1krdkpjanJSQktyeVdmUGdyY0E2S29sdGdYd044eHAvTzZ2UnBXYmd0blptRjBBL0JDa1JhVnpQRk85enlVTzI4VFVhd0lyeQpjVGhCNXNUMERIaUpzYVN3SDNQNGZtR3VpTGFJYmFObGcwdDJPUT09PC9kczpYNTA5Q2VydGlmaWNhdGU+PC9kczpYNTA5RGF0YT48L2RzOktleUluZm8+PC9kczpTaWduYXR1cmU+PHNhbWwyOlN1YmplY3QgeG1sbnM6c2FtbDI9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iPjxzYW1sMjpOYW1lSUQgRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoxLjE6bmFtZWlkLWZvcm1hdDp1bnNwZWNpZmllZCI+bG9yY2hyQGdpdGh1Yi5va3RhaWRwPC9zYW1sMjpOYW1lSUQ+PHNhbWwyOlN1YmplY3RDb25maXJtYXRpb24gTWV0aG9kPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6Y206YmVhcmVyIj48c2FtbDI6U3ViamVjdENvbmZpcm1hdGlvbkRhdGEgSW5SZXNwb25zZVRvPSJBUlFlMWY3Y2ZhLWE3OTctNDMxMC1iNjc3LWVjYjc2NTAwNjkwOSIgTm90T25PckFmdGVyPSIyMDI0LTAzLTI5VDA3OjQ3OjIyLjEzN1oiIFJlY2lwaWVudD0iaHR0cDovL3NwLmxpZ2h0LmxvY2FsOjgwODAvc2FtbDIvYXV0aGVudGljYXRlL29rdGEiLz48L3NhbWwyOlN1YmplY3RDb25maXJtYXRpb24+PC9zYW1sMjpTdWJqZWN0PjxzYW1sMjpDb25kaXRpb25zIE5vdEJlZm9yZT0iMjAyNC0wMy0yOVQwNzozNzoyMi4xMzdaIiBOb3RPbk9yQWZ0ZXI9IjIwMjQtMDMtMjlUMDc6NDc6MjIuMTM3WiIgeG1sbnM6c2FtbDI9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iPjxzYW1sMjpBdWRpZW5jZVJlc3RyaWN0aW9uPjxzYW1sMjpBdWRpZW5jZT5odHRwOi8vc3AubGlnaHQubG9jYWw6ODA4MC9zYW1sMi9zZXJ2aWNlLXByb3ZpZGVyLW1ldGFkYXRhL29rdGE8L3NhbWwyOkF1ZGllbmNlPjwvc2FtbDI6QXVkaWVuY2VSZXN0cmljdGlvbj48L3NhbWwyOkNvbmRpdGlvbnM+PHNhbWwyOkF1dGhuU3RhdGVtZW50IEF1dGhuSW5zdGFudD0iMjAyNC0wMy0yOVQwNzo0MjoyMi4xMzZaIiBTZXNzaW9uSW5kZXg9IkFSUWUxZjdjZmEtYTc5Ny00MzEwLWI2NzctZWNiNzY1MDA2OTA5IiB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiI+PHNhbWwyOkF1dGhuQ29udGV4dD48c2FtbDI6QXV0aG5Db250ZXh0Q2xhc3NSZWY+dXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFjOmNsYXNzZXM6UGFzc3dvcmRQcm90ZWN0ZWRUcmFuc3BvcnQ8L3NhbWwyOkF1dGhuQ29udGV4dENsYXNzUmVmPjwvc2FtbDI6QXV0aG5Db250ZXh0Pjwvc2FtbDI6QXV0aG5TdGF0ZW1lbnQ+PHNhbWwyOkF0dHJpYnV0ZVN0YXRlbWVudCB4bWxuczpzYW1sMj0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOmFzc2VydGlvbiI+PHNhbWwyOkF0dHJpYnV0ZSBOYW1lPSJmaXJzdE5hbWUiIE5hbWVGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphdHRybmFtZS1mb3JtYXQ6dW5zcGVjaWZpZWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4czpzdHJpbmciPmxvcmNoPC9zYW1sMjpBdHRyaWJ1dGVWYWx1ZT48L3NhbWwyOkF0dHJpYnV0ZT48c2FtbDI6QXR0cmlidXRlIE5hbWU9Imxhc3ROYW1lIiBOYW1lRm9ybWF0PSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6YXR0cm5hbWUtZm9ybWF0OnVuc3BlY2lmaWVkIj48c2FtbDI6QXR0cmlidXRlVmFsdWUgeG1sbnM6eHM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hIiB4bWxuczp4c2k9Imh0dHA6Ly93d3cudzMub3JnLzIwMDEvWE1MU2NoZW1hLWluc3RhbmNlIiB4c2k6dHlwZT0ieHM6c3RyaW5nIj5sb3JjaHI8L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjxzYW1sMjpBdHRyaWJ1dGUgTmFtZT0iZW1haWwiIE5hbWVGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphdHRybmFtZS1mb3JtYXQ6dW5zcGVjaWZpZWQiPjxzYW1sMjpBdHRyaWJ1dGVWYWx1ZSB4bWxuczp4cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhzaTp0eXBlPSJ4czpzdHJpbmciPndoaXRldHVsaXBzQDE2My5jb208L3NhbWwyOkF0dHJpYnV0ZVZhbHVlPjwvc2FtbDI6QXR0cmlidXRlPjwvc2FtbDI6QXR0cmlidXRlU3RhdGVtZW50Pjwvc2FtbDI6QXNzZXJ0aW9uPjwvc2FtbDJwOlJlc3BvbnNlPg==
RelayState: ebb22902-ecf2-4c9b-83a5-157ab938bd77
```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:Response Destination="http://sp.light.local:8080/saml2/authenticate/okta" ID="id297559196082595319165870" InResponseTo="ARQe1f7cfa-a797-4310-b677-ecb765006909" IssueInstant="2024-03-29T07:42:22.136Z" Version="2.0"
    xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
    xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <saml2:Issuer Format="urn:oasis:names:tc:SAML:2.0:nameid-format:entity"
        xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://www.okta.com/exkg3seq7hh0uUigL5d7
    </saml2:Issuer>
    <ds:Signature
        xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:SignedInfo>
            <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
            <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
            <ds:Reference URI="#id297559196082595319165870">
                <ds:Transforms>
                    <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                    <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#">
                        <ec:InclusiveNamespaces PrefixList="xs"
                            xmlns:ec="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                        </ds:Transform>
                    </ds:Transforms>
                    <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                    <ds:DigestValue>s8ovkSSp7dEB29l/Y0CS/xs/djvvBwJhOSvG4QZ5JHo=</ds:DigestValue>
                </ds:Reference>
            </ds:SignedInfo>
            <ds:SignatureValue>BrS3EW81xsP5LpsaeXpTJJjZSqv3i4U/mWZ5j2vynb3h8g6Kz9PJa5iq23uEO2tlTiVS6ZFCFjZHEs+A48eQIGmsbjfnGOHObSdOo42tW4Ib+6DTM7xtsU1IGYFW9ENJXTt8SAZ5lfKVWWyCerp0BnLHgZPktoC/mCFssOjI4J39+kyW9LED5AtXgNESriqPVKy4xG+FggIH8dCu14+CAgnL963T+95tpKsWxZl7Fq/Czw1eYNyEHfeL+sMXJHpHun+CpV1cbqWleltPQhtySNFMsjykm+Z3BrTzhvQywNfcYbyxpKY+0E8JQFWpAwSCqkUjT779EeaojPI/bZsc7A==</ds:SignatureValue>
            <ds:KeyInfo>
                <ds:X509Data>
                    <ds:X509Certificate>MIIDqDCCApCgAwIBAgIGAY6IWEGpMA0GCSqGSIb3DQEBCwUAMIGUMQswCQYDVQQGEwJVUzETMBEG
A1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsGA1UECgwET2t0YTEU
MBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi03MDMwNDYwNTEcMBoGCSqGSIb3DQEJ
ARYNaW5mb0Bva3RhLmNvbTAeFw0yNDAzMjkwMzUzMjlaFw0zNDAzMjkwMzU0MjhaMIGUMQswCQYD
VQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsG
A1UECgwET2t0YTEUMBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi03MDMwNDYwNTEc
MBoGCSqGSIb3DQEJARYNaW5mb0Bva3RhLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAM7NL8KfCPW7KPDp8hFFM2d8ToORvy9XlyoqXlhLwxU46ZQdaTeKhrPSVJIjf89YFY0OrUSK
qBsSGSHaOOKDBvSe9CzgAGW434WzeWf+I9QqMgYf3aCxYF5O5aoL+DjWxb+jFc+zr6sbUkB2hNJm
AVl0FNADSt6bE3v3blIyJeTg0qQWyFwLSL+Fnr3CTW3obVfRYq3cdykkArSpAk/NlY47dsMsPSu3
fb7Ph5tcaqKvuo0QIyKAex+7Myp74K7feQWMH/7Ue9/UP+LcIkzmNCFruDuJ+PkPXqhLcnNEYzYI
BGJkl1YvMMJMUI2GVaN2Pvqlv9jwUResGf4faj/J2AMCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEA
kBUznn8pmZgEiTg0paQJWqPtNsQqxjgUniDlpN994OMyWR6+k6zTySmsBfTNPKcEq1ytROXtz7Rm
iZRMJF+svpGRCXTVNcDfkxITK7h4Wgonb7l9MdKlB5+ai+ICqxBZezLYwhVvVqk7e3n+0ZDhDc1I
VH/sQwPchHS0VGoI63S6zW3ElM7vGU6tPMkub6+uGMzy1Njwk4xT78S+RJLtu21jPE/1p62gry9A
c10WY+vJcjrRBKryWfPgrcA6KoltgXwN8xp/O6vRpWbgtnZmF0A/BCkRaVzPFO9zyUO28TUawIry
cThB5sT0DHiJsaSwH3P4fmGuiLaIbaNlg0t2OQ==</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </ds:Signature>
        <saml2p:Status
            xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol">
            <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
        </saml2p:Status>
        <saml2:Assertion ID="id2975591962392181072249232" IssueInstant="2024-03-29T07:42:22.136Z" Version="2.0"
            xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion"
            xmlns:xs="http://www.w3.org/2001/XMLSchema">
            <saml2:Issuer Format="urn:oasis:names:tc:SAML:2.0:nameid-format:entity"
                xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">http://www.okta.com/exkg3seq7hh0uUigL5d7
            </saml2:Issuer>
            <ds:Signature
                xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:SignedInfo>
                    <ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                    <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
                    <ds:Reference URI="#id2975591962392181072249232">
                        <ds:Transforms>
                            <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
                            <ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#">
                                <ec:InclusiveNamespaces PrefixList="xs"
                                    xmlns:ec="http://www.w3.org/2001/10/xml-exc-c14n#"/>
                                </ds:Transform>
                            </ds:Transforms>
                            <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
                            <ds:DigestValue>XsnbVDQNrihUsIPui7ZxGXfmITZt8rZzw5lVn85FHdc=</ds:DigestValue>
                        </ds:Reference>
                    </ds:SignedInfo>
                    <ds:SignatureValue>xsVvPXLEQyGLDVibatW71xe4F413xhQGn/uTcoqcvTiJUVp0MDQtjbw/sIe0WyBvKCwvwcrmne1a0WM3MYEdIGHF01rqe8R2E+g1kO2bFIRGJFRE12cIIG6PLlZ/n7PEiOQbso+COtRnZsDzBAg37i+kONrvdtgGv4V/2zOsCYfzqfv5v7YrmQRmYUTfnCYVhefBo0bQQgY23+em1+graz7VVeRYL+BtQqknArM1H+s7u0EaH1zt2U0to5BBijgsYm175Tk9fTwFA/TI0cnfO234ri8THbu/Sebgr5TD2uAqK+IKFC67W+lhqxYjBFNJa/9uxSZhVTNeVxiBIpArJg==</ds:SignatureValue>
                    <ds:KeyInfo>
                        <ds:X509Data>
                            <ds:X509Certificate>MIIDqDCCApCgAwIBAgIGAY6IWEGpMA0GCSqGSIb3DQEBCwUAMIGUMQswCQYDVQQGEwJVUzETMBEG
A1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsGA1UECgwET2t0YTEU
MBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi03MDMwNDYwNTEcMBoGCSqGSIb3DQEJ
ARYNaW5mb0Bva3RhLmNvbTAeFw0yNDAzMjkwMzUzMjlaFw0zNDAzMjkwMzU0MjhaMIGUMQswCQYD
VQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzENMAsG
A1UECgwET2t0YTEUMBIGA1UECwwLU1NPUHJvdmlkZXIxFTATBgNVBAMMDGRldi03MDMwNDYwNTEc
MBoGCSqGSIb3DQEJARYNaW5mb0Bva3RhLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAM7NL8KfCPW7KPDp8hFFM2d8ToORvy9XlyoqXlhLwxU46ZQdaTeKhrPSVJIjf89YFY0OrUSK
qBsSGSHaOOKDBvSe9CzgAGW434WzeWf+I9QqMgYf3aCxYF5O5aoL+DjWxb+jFc+zr6sbUkB2hNJm
AVl0FNADSt6bE3v3blIyJeTg0qQWyFwLSL+Fnr3CTW3obVfRYq3cdykkArSpAk/NlY47dsMsPSu3
fb7Ph5tcaqKvuo0QIyKAex+7Myp74K7feQWMH/7Ue9/UP+LcIkzmNCFruDuJ+PkPXqhLcnNEYzYI
BGJkl1YvMMJMUI2GVaN2Pvqlv9jwUResGf4faj/J2AMCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEA
kBUznn8pmZgEiTg0paQJWqPtNsQqxjgUniDlpN994OMyWR6+k6zTySmsBfTNPKcEq1ytROXtz7Rm
iZRMJF+svpGRCXTVNcDfkxITK7h4Wgonb7l9MdKlB5+ai+ICqxBZezLYwhVvVqk7e3n+0ZDhDc1I
VH/sQwPchHS0VGoI63S6zW3ElM7vGU6tPMkub6+uGMzy1Njwk4xT78S+RJLtu21jPE/1p62gry9A
c10WY+vJcjrRBKryWfPgrcA6KoltgXwN8xp/O6vRpWbgtnZmF0A/BCkRaVzPFO9zyUO28TUawIry
cThB5sT0DHiJsaSwH3P4fmGuiLaIbaNlg0t2OQ==</ds:X509Certificate>
                        </ds:X509Data>
                    </ds:KeyInfo>
                </ds:Signature>
                <saml2:Subject
                    xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
                    <saml2:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">lorchr@github.oktaidp</saml2:NameID>
                    <saml2:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                        <saml2:SubjectConfirmationData InResponseTo="ARQe1f7cfa-a797-4310-b677-ecb765006909" NotOnOrAfter="2024-03-29T07:47:22.137Z" Recipient="http://sp.light.local:8080/saml2/authenticate/okta"/>
                    </saml2:SubjectConfirmation>
                </saml2:Subject>
                <saml2:Conditions NotBefore="2024-03-29T07:37:22.137Z" NotOnOrAfter="2024-03-29T07:47:22.137Z"
                    xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
                    <saml2:AudienceRestriction>
                        <saml2:Audience>http://sp.light.local:8080/saml2/service-provider-metadata/okta</saml2:Audience>
                    </saml2:AudienceRestriction>
                </saml2:Conditions>
                <saml2:AuthnStatement AuthnInstant="2024-03-29T07:42:22.136Z" SessionIndex="ARQe1f7cfa-a797-4310-b677-ecb765006909"
                    xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
                    <saml2:AuthnContext>
                        <saml2:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml2:AuthnContextClassRef>
                    </saml2:AuthnContext>
                </saml2:AuthnStatement>
                <saml2:AttributeStatement
                    xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
                    <saml2:Attribute Name="firstName" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified">
                        <saml2:AttributeValue
                            xmlns:xs="http://www.w3.org/2001/XMLSchema"
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">lorch
                        </saml2:AttributeValue>
                    </saml2:Attribute>
                    <saml2:Attribute Name="lastName" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified">
                        <saml2:AttributeValue
                            xmlns:xs="http://www.w3.org/2001/XMLSchema"
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">lorchr
                        </saml2:AttributeValue>
                    </saml2:Attribute>
                    <saml2:Attribute Name="email" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:unspecified">
                        <saml2:AttributeValue
                            xmlns:xs="http://www.w3.org/2001/XMLSchema"
                            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="xs:string">whitetulips@163.com
                        </saml2:AttributeValue>
                    </saml2:Attribute>
                </saml2:AttributeStatement>
            </saml2:Assertion>
        </saml2p:Response>
```

7. 认证成功，跳转到登录前页面 `http://sp.light.local:8080/?continue`

```shell

SAML 2.0 Login & Single Logout with Spring Security
You are successfully logged in as light

You're email address is

All Your Attributes
Role
[default-roles-test, manage-account-links, offline_access, manage-account, uma_authorization, view-profile]
Visit the [SAML 2.0 Login & Logout](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#servlet-saml2) documentation for more details.

```

### 6. Okta登出
1. 点击页面的 `RP-initiated Logout` 

2. 访问 `http://sp.light.local:8080/logout`

3. 跳转 `https://dev-70304605.okta.com/app/dev-70304605_springbootsaml_1/exkg3seq7hh0uUigL5d7/sso/saml`

```shell

```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml

```

4. 退出响应 `http://sp.light.local:8080/login/saml2/sso/keycloak`

```shell


```

使用[SamlTool](https://www.samltool.com)的[Base64 Decode + Inflate](https://www.samltool.com/decode.php)解析并[格式化](https://www.sojson.com/xml.html)后得到请求的XML信息

```xml

```
