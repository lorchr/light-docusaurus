## 1. 开放的端点

| 序号  | 配置类                                                 | 端点过滤器                                           | 功能          | 备注                             |
|-----|-----------------------------------------------------|-------------------------------------------------|-------------|--------------------------------|
| 1   | OAuth2AuthorizationEndpointConfigurer               | OAuth2AuthorizationEndpointFilter               | 获取授权码       | 使用浏览器                          |
| 2   | OAuth2TokenEndpointConfigurer                       | OAuth2TokenEndpointFilter                       | 获取token     | 注意redirect_uri scope需要一致       |
| 3   | OAuth2TokenEndpointConfigurer                       | OAuth2TokenEndpointFilter                       | 刷新token     | 使用refresh_token 获取一个新的token    |
| 4   | OAuth2TokenRevocationEndpointConfigurer             | OAuth2TokenRevocationEndpointFilter             | 撤销token     | 使Token失效                       |
| 5   | OAuth2AuthorizationServerMetadataEndpointConfigurer | OAuth2AuthorizationServerMetadataEndpointFilter | 获取授权服务器信息   | 获取授权服务器的端点接口地址等                |
| 6   | OAuth2TokenIntrospectionEndpointConfigurer          | OAuth2TokenIntrospectionEndpointFilter          | 校验token状态   | 校验token是否可用                    |
| 7   | OAuth2AuthorizationServerConfigurer                 | NimbusJwkSetEndpointFilter                      | JWK Set     | 获取JWK Set 加密密钥                 |
| 8   | OidcProviderConfigurationEndpointConfigurer         | OidcProviderConfigurationEndpointFilter         | OIDC服务器信息   | OIDC服务器信息，类似 5                 |
| 9   | OidcUserInfoEndpointConfigurer                      | OidcUserInfoEndpointFilter                      | OIDC用户信息    | 获取token对应的用户信息 scope需包含 openid |
| 10  | OidcClientRegistrationEndpointConfigurer            | OidcClientRegistrationEndpointFilter            | OIDC客户端注册读取 | OIDC客户端注册读取                    |
| 11  | OidcLogoutEndpointConfigurer                        | OidcLogoutEndpointFilter                        | OIDC登出      | OIDC客户端注册读取                    |
| 12  | OAuth2DeviceAuthorizationEndpointConfigurer         | OAuth2DeviceAuthorizationEndpointFilter         | 设备授权        | 获取 device_code 及 user_code     |
| 13  | OAuth2DeviceVerificationEndpointConfigurer          | OAuth2DeviceVerificationEndpointFilter          | 设备认证        | 通过 user_code 进行认证              |

## 2. 访问流程示例

1. 获取授权码 OAuth2AuthorizationEndpointConfigurer

    - 浏览器请求
       ```shell
       http://127.0.0.1:8080/oauth2/authorize?response_type=code&client_id=messaging-client&scope=openid&redirect_uri=http://127.0.0.1:8080/authorized
       ```
    - 登录账号并授权后，浏览器自动回调到
       ```shell
       http://127.0.0.1:8080/authorized?code=CSp513BO4bW1L6qcJknUKCca1FXns-1ri54ZHqZUGbOGEauTd0x-rn8p4DOBlmu2ER8mPb6jZfNogNljGtblRl2wvG5gWTsUPiFSxjIzyDMXlQ5S3ooS0JxvGSNL3L5D
       ```

2. 获取token OAuth2TokenEndpointConfigurer

   ```shell
   curl -X  POST "http://127.0.0.1:8080/oauth2/token?grant_type=authorization_code&redirect_uri=http://127.0.0.1:8080/authorized&code=ZOJZ" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
   ```

3. 刷新token OAuth2TokenEndpointConfigurer

   ```shell
   curl -XPOST "http://127.0.0.1:8080/oauth2/token?grant_type=refresh_token&refresh_token=jgIeE" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
   ```

4. 撤销token OAuth2TokenRevocationEndpointConfigurer

    - 撤销access_token
       ```shell
       curl -X POST "http://127.0.0.1:8080/oauth2/revoke?token_type_hint=access_token&token=eyJra" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
       ```
    - 撤销refresh_token
       ```shell
       curl -X POST "http://127.0.0.1:8080/oauth2/revoke?token_type_hint=refresh_token&token=jgIeE" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
       ```

5. 获取授权服务器信息 OAuth2AuthorizationServerMetadataEndpointConfigurer

   ```shell
   curl -X GET "http://127.0.0.1:8080/.well-known/oauth-authorization-server"
   ```

6. 校验token状态 OAuth2TokenIntrospectionEndpointConfigurer

    - 校验 token
   ```shell
   curl -X POST "http://127.0.0.1:8080/oauth2/introspect?token_type_hint=access_token&token=eyJra" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
   ```
    - 校验 refresh token
   ```shell
   curl -X POST "http://127.0.0.1:8080/oauth2/introspect?token_type_hint=refresh_token&token=eyJra" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
   ```

7. 获取JWK Set OAuth2AuthorizationServerConfigurer

   ```shell
   curl -X GET "http://127.0.0.1:8080/oauth2/jwks"
   ```

8. OIDC Provider的信息端点 OidcProviderConfigurationEndpointConfigurer

   ```shell
   curl -X GET "http://127.0.0.1:8080/.well-known/openid-configuration"
   ```

9. OIDC用户信息 OidcUserInfoEndpointConfigurer scope需为 openid

   ```shell
   curl -X GET "http://127.0.0.1:8080/userinfo" -H "Authorization: Bearer eyJra"
   
   curl -X POST "http://127.0.0.1:8080/userinfo" -H "Authorization: Bearer eyJra"
   ```

10. OIDC客户端注册读取 OidcClientRegistrationEndpointConfigurer

    - 客户端注册 scope只能为 client.create
      ```shell
      curl -X POST "http://127.0.0.1:8080/connect/register" -H "Authorization: Bearer eyJra"
      ```
    - 读取客户端 scope只能为 client.read 且只能读取token所属客户端信息
      ```shell
      curl -X GET "http://127.0.0.1:8080/connect/register?client_id=shadosa" -H "Authorization: Bearer eyJra"
      ```

11. OIDC登出 OidcLogoutEndpointConfigurer

    ```shell
    curl -X GET "http://127.0.0.1:8080/connect/logout" -H "Authorization: Bearer eyJra"

    curl -X POST "http://127.0.0.1:8080/connect/logout" -H "Authorization: Bearer eyJra"
    ```

12. 设备授权

    - 设备授权请求 OAuth2DeviceAuthorizationEndpointConfigurer
        ```shell
        # 对于 ClientAuthenticationMethod.NONE 的客户端 需要将client_id以参数的形式就行传递
        curl -X POST "http://127.0.0.1:8080/oauth2/device_authorization?scope=message.read+message.write&client_id=device-messaging-client"
        # 对于 ClientAuthenticationMethod.CLIENT_SECRET_BASIC 的客户端 需要将client_id以及密码以 BasicAuth的方式传递
        curl -X POST "http://127.0.0.1:8080/oauth2/device_authorization?client_id=messaging-client&scope=message.read+message.write" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
        ```

      得到设备授权校验链接及`user_code` `device_code`
        ```json
        {
            "user_code": "HDLV-ZFJV",
            "device_code": "1VRSI_19b-yLBTOeVp_5GrnMEGdrLR9E-DoSR8I4vjYbh-E48MFRftEwO-YuFzSAuzVEIs8sjoQ0RN5ggbbY_DxnqRsobc8qzA4G6j_3NAftn1b5kEn2SJ3vV2dKeCGD",
            "verification_uri_complete": "http://127.0.0.1:8080/oauth2/device_verification?user_code=HDLV-ZFJV",
            "verification_uri": "http://127.0.0.1:8080/oauth2/device_verification",
            "expires_in": 300
        }
        ```

    - 获取Token OAuth2DeviceVerificationEndpointConfigurer
        ```shell
        curl -X  POST "http://127.0.0.1:8080/oauth2/token?grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=1VRSI" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
        ```

      因为链接生成还没有通过设备进行登录，没有绑定用户到user_code，device_code获取不到关联用户信息，会处于pending状态
        ```json
        {
           "error": "authorization_pending",
           "error_uri": "https://datatracker.ietf.org/doc/html/rfc8628#section-3.5"
        }
        ```

    - 浏览器访问设备校验链接，登录账号即表示授权
        ```shell
        http://127.0.0.1:8080/oauth2/device_verification?user_code=HDLV-ZFJV
        ```

    - 再次请求Token
        ```shell
        curl -X  POST "http://127.0.0.1:8080/oauth2/token?grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=1VRSI" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
        ```

      正常返回token信息
        ```json
        {
           "access_token": "eyJjdXN0b21lckhlYWRlciI6IkhlYWRlciIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNDc1OGU4MmYtNDhiMS00OWM0LWFlNzAtNzUwMDRkNWNkZjUyIn0.eyJzdWIiOiJ1c2VyIiwiYXVkIjoibWVzc2FnaW5nLWNsaWVudCIsImN1c3RvbWVyQ2xhaW0iOiJDbGFpbSIsIm5iZiI6MTY4NTE2MzQ1OCwic2NvcGUiOlsibWVzc2FnZS5yZWFkIiwibWVzc2FnZS53cml0ZSJdLCJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwODAiLCJleHAiOjE2ODUxNjcwNTgsImlhdCI6MTY4NTE2MzQ1OH0.jWg1MQAJvBH6b4WNQnNMZEhjjU-1USPDHBCNjNcUsJR8v39pI-iISYOeWCqzwP3CK8FPBvUof4NVeMAl5a-cU9DcofKMTTj3BLPPv8__QNXRFxX8LFayBe2YEZP3AtTYymUqpLanGoORTYawSmuPvjwOBh4I7ye2t5bJBlAuyvhr5JsvScxPEBqXpaybzWxpaT4Kc4kWmUX2piE6bEqgQnWkWu3zByMwlquR6YBfAmYW7d_70jYB5Zu3ioSvlVw1gEOSriom8hf0-wU2JjphiNLXcbnXzj4aSsmGR6_ZsOUFBugdLKFt6rHvr8lBj2KQ_K2Zbtt3nc-jM8d-hnb6dA",
           "refresh_token": "LU73YtbC1bqWcw8srWVbmHLutzc0TaNoj_s57sqE0LOfdvwFyeXDr-b8MDQ9LJlmAPTUNSz7CCcFEqEFfogx8SzjADPcBj9vE4A6f7o1d5kJvxwrz9ugPKJgbh9YTU9b",
           "scope": "message.read message.write",
           "token_type": "Bearer",
           "expires_in": 3599
        }
        ```

手机扫码登录流程（非第三方）

1. 打开客户端时，向服务端发送设备授权请求，展示返回的 `verification_uri_complete` 链接二维码
2. 手机扫描二维码，拿到二维码携带的 `user_code` 信息
3. 用户点击确认后，将本地的认证信息与此 `user_code` 发送到服务端，服务端对此 `user_code` 合法性进行校验
4. 校验通过后，服务端通过 `user_code` 找到对应 `device_code`(`user_code` 与 `device_code`是一起生成的，天然一体)
5. 根据 `device_code` 找到对应的客户端，通过长链接向客户端推送`device_code` 认证信息 用户信息
6. 客户端根据本地缓存的`device_code`与服务端返回的进行匹配(防止二维码更新后本地`device_code`发送变化)，匹配上则登录成功

- [WeChat登录二维码](http://weixin.qq.com/x/IdpqLWT4ZSF54icCxX0O)
- [WeCom登录二维码](https://wx.work.weixin.qq.com/cgi-bin/crtx_auth?key=F391FFDC1FD94F0C77CC0F757198D909&wx=1)

## 3. 注意事项

1. OIDC访问用户信息端点的时候，所使用的token必须授权scope为openid的权限

2. 请求多个scope时，使用+拼接，如 scope=openid+profile+message.read+message.write
   e.g.
   ```shell
   http://127.0.0.1:8080/oauth2/authorize?response_type=code&client_id=messaging-client&scope=openid+profile+message.read+message.write&redirect_uri=http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc

   curl -X POST "http://127.0.0.1:8080/oauth2/token?grant_type=authorization_code&redirect_uri=http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc&code=GjeGeOwaU2Thm4msrnPLaWlSF6wYdvaWIKWHxduj5dvJsizU3MW3LZ3lPIX7JmhX92SZSWgtreDjwobLyVMOfQn19aRHGdrKeF5dAaCTqwbCV9kKvpWuNS6odtbDMoqW" -H "Authorization: Basic bWVzc2FnaW5nLWNsaWVudDpzZWNyZXQ="
   ```
