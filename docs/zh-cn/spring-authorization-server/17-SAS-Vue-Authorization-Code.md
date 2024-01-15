- [Spring Authorization Server入门 (十七) Vue项目使用授权码模式对接认证服务](https://juejin.cn/post/7279052777888890921)

## 一、Vue单页面项目使用授权码模式对接流程说明
以下流程摘抄自官网

在本例中为授权代码流程。 授权码流程的步骤如下：

1. 客户端通过重定向到授权端点来发起 OAuth2 请求。

2. 如果用户未通过身份验证，授权服务器将重定向到登录页面。 身份验证后，用户将再次重定向回授权端点。

3. 如果用户未同意所请求的范围并且需要同意，则会显示同意页面。

4. 一旦用户同意，授权服务器会生成一个`authorization_code`并通过`redirect_uri`重定向回客户端。

5. 客户端通过查询参数获取`authorization_code`并向[Token Endpoint](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oauth2-token-endpoint)发起请求。


## 二、Vue项目中修改内容
### 1. 安装`crypto-js`依赖
已安装可以忽略，该依赖是为了计算`Code Challenge`和`base64`加密使用
```shell
npm install crypto-js
```

### 2. TypeScript下额外添加`@types/crypto-js`依赖
```shell
npm install @types/crypto-js
```

### 3. 编写公共方法
#### 1. 生成随机字符串
generateCodeVerifier 函数主要是为了给PKCE流程使用，下篇文章中会说明，这里借用一下生成state，因为本质上是生成随机字符串
```js
/**
 * 生成 CodeVerifier
 *
 * return CodeVerifier
 */
export function generateCodeVerifier() {
    return generateRandomString(32)
}

/**
 * 生成随机字符串
 * @param length 随机字符串的长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}
```

#### 2. 编写base64加密方法
```js
/**
 * 将字符串加密为Base64格式的
 * @param str 将要转为base64的字符串
 * @returns 返回base64格式的字符串
 */
export function base64Str(str: string) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
}
```

#### 3. 编写获取地址栏参数方法
```js
/**
 * 根据参数name获取地址栏的参数
 * @param name 地址栏参数的key
 * @returns key对用的值
 */
export function getQueryString(name: string) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')

    const r = window.location.search.substr(1).match(reg)

    if (r != null) {
        return decodeURIComponent(r[2])
    }

    return null
}
```

#### 4. 编写请求Token方法
```js
/**
 * 从认证服务获取AccessToken
 * @param data 获取token入参
 * @returns 返回AccessToken对象
 */
export function getToken(data: any) {
    const headers: any = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    // 这里这么写是为了兼容PKCE与授权码模式
    if (data.client_secret) {
        // 设置客户端的basic认证
        headers.Authorization = `Basic ${base64Str(`${data.client_id}:${data.client_secret}`)}`
        // 移除入参中的key
        delete data.client_id
        delete data.client_secret
    }
    // 可以设置为AccessToken的类型
    return loginRequest.post<any>({
        url: '/oauth2/token',
        data,
        headers
    })
}
```

#### 5. 在环境变量配置文件中添加配置
```js
# 认证服务地址(token签发地址)
VITE_OAUTH_ISSUER=http://127.0.0.1:8080
# 授权码流程使用的客户端Id
VITE_OAUTH_CLIENT_ID=messaging-client
# 授权码流程使用的客户端秘钥
VITE_OAUTH_CLIENT_SECRET=123456
# 授权码模式使用的回调地址
VITE_OAUTH_REDIRECT_URI=http://127.0.0.1:5173/OAuth2Redirect
```

### 4. 创建处理回调的页面`OAuthRedirect.vue`
页面加载时会尝试从地址栏获取参数code，如果能获取到说明是从认证服务回调过来的，执行换取token流程，如果没有获取到code说明需要发起授权申请。

#### 1. 我这里是将获取到的token直接存储在`localStorage`中了，如果有需要也可以更换存储位置、存储格式等
```js
<script setup lang="ts">
import router from '../../router'
import { getToken } from '@/api/Login'
import { createDiscreteApi } from 'naive-ui'
import { generateCodeVerifier } from '@/util/pkce'
import { getQueryString } from '@/util/GlobalUtils'

const { message } = createDiscreteApi(['message'])

// 生成state
let state: string = generateCodeVerifier()

// 获取地址栏授权码
const code = getQueryString('code')

if (code) {
  // 从缓存中获取 codeVerifier
  const state = localStorage.getItem('state')
  // 校验state，防止cors
  const urlState = getQueryString('state')
  if (urlState !== state) {
    message.warning('state校验失败.')
  } else {
    // 从缓存中获取 codeVerifier
    getToken({
      grant_type: 'authorization_code',
      client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
      client_secret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
      redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
      code,
      state
    })
      .then((res: any) => {
        localStorage.setItem('accessToken', JSON.stringify(res))
        router.push({ path: '/' })
      })
      .catch((e) => {
        message.warning(`请求token失败：${e.data.error || e.message || e.statusText}`)
      })
  }
} else {
  // 缓存state
  localStorage.setItem('state', state)
  window.location.href = `${import.meta.env.VITE_OAUTH_ISSUER}/oauth2/authorize?client_id=${
    import.meta.env.VITE_OAUTH_CLIENT_ID
  }&response_type=code&scope=openid%20profile%20message.read%20message.write&redirect_uri=${
    import.meta.env.VITE_OAUTH_REDIRECT_URI
  }&state=${state}`
}
</script>
<template>加载中...</template>
```

#### 2. 添加路由
```js
{
    path: '/OAuth2Redirect',
    name: 'OAuth2Redirect',
    component: () => import('../views/login/OAuthRedirect.vue')
}
```

## 三、认证服务修改内容
### 1. 在数据库中添加对应客户端的回调地址
- 重要：例如文中的就需要给客户端messaging-client添加一个回调地址http://127.0.0.1:5173/OAuth2Redirect
- 重要：例如文中的就需要给客户端messaging-client添加一个回调地址http://127.0.0.1:5173/OAuth2Redirect
- 重要：例如文中的就需要给客户端messaging-client添加一个回调地址http://127.0.0.1:5173/OAuth2Redirect

经过以上配置授权码模式的对接就完成了，接下来就可以测试了，在首页或者需要触发登录的地方添加一个按钮，点击跳转到/OAuth2Redirect之后会自动引导发起授权申请流程。

## 四、测试

![img](./img/17/17-1.awebp)

点击后跳转至回调页面

![img](./img/17/17-2.awebp)

回调页面发现地址栏没有`code`引导发起授权申请

![img](./img/17/17-3.awebp)

认证服务检测到没有登录，跳转至登录页

![img](./img/17/17-4.awebp)

登录成功后发现需要授权确认，跳转至授权确认页面

![img](./img/17/17-5.awebp)

授权成功后携带`token`重定向至回调地址，回调页根据`code`换取`token`，获取`token`成功后存储并返回首页

## 五、最后
实际上真正对接要写的代码并不多，逻辑也不复杂，我这里写的比较简单，并且客户端id和秘钥都是放在前端的，读者可以存放在一些更安全的地方，或加密，或从后端获取密文等，如果大家发现有什么问题可以在评论指正，谢谢

## 六、附录
代码仓库地址：[Gitee](https://gitee.com/vains-Sofia/authorization-example)
