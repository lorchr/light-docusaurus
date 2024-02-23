- [Spring Authorization Server优化篇：添加Redis缓存支持和统一响应类](https://juejin.cn/post/7253331974050299963)

## 一、前言
今天为大家展示一下如何使用Spring data redis来缓存项目中数据，在项目使用人数少的情况下使用`HttpSession`问题不大，但是当并发多了就顶不住了，基本都会选择一些NoSQL来做缓存，本人就选择了比较常用的redis来做缓存；关于统一响应类这个东西就是为了规范项目的响应值，方便前端对接接口，其它人对接接口时更轻松。

## 二、添加统一响应类
### 1. 在model包下添加`Result.java`类
```java
package com.example.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.io.Serializable;

/**
 * 公共响应类
 *
 * @author vains
 * @date 2021/3/10 14:10
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> implements Serializable {

    /**
     * 响应状态码
     */
    private Integer code;

    /**
     * 响应信息
     */
    private String message;

    /**
     * 接口是否处理成功
     */
    private Boolean success;

    /**
     * 接口响应时携带的数据
     */
    private T data;

    /**
     * 操作成功携带数据
     * @param data 数据
     * @param <T> 类型
     * @return 返回统一响应
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(HttpStatus.OK.value(), ("操作成功."),Boolean.TRUE, data);
    }

    /**
     * 操作成功不带数据
     * @return 返回统一响应
     */
    public static Result<String> success() {
        return new Result<>(HttpStatus.OK.value(), ("操作成功."), Boolean.TRUE, (null));
    }

    /**
     * 操作成功携带数据
     * @param message 成功提示消息
     * @param data 成功携带数据
     * @param <T> 类型
     * @return 返回统一响应
     */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(HttpStatus.OK.value(), message, Boolean.TRUE, data);
    }

    /**
     * 操作失败返回
     * @param message 成功提示消息
     * @param <T> 类型
     * @return 返回统一响应
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), message, Boolean.FALSE, (null));
    }

    /**
     * 操作失败返回
     * @param code 错误码
     * @param message 成功提示消息
     * @param <T> 类型
     * @return 返回统一响应
     */
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, Boolean.FALSE, (null));
    }

    /**
     * oauth2 问题
     * @param message 失败提示消息
     * @param data 具体的错误信息
     * @param <T> 类型
     * @return 返回统一响应
     */
    public static <T> Result<T> oauth2Error(Integer code, String message, T data) {
        return new Result<>(code, message, Boolean.FALSE, data);
    }

    /**
     * oauth2 问题
     * @param message 失败提示消息
     * @param data 具体的错误信息
     * @param <T> 类型
     * @return 返回统一响应
     */
    public static <T> Result<T> oauth2Error(String message, T data) {
        return new Result<>(HttpStatus.UNAUTHORIZED.value(), message, Boolean.FALSE, data);
    }

}
```

## 三、优化项目
### 1. 在controller包下添加LoginController类
该类中的接口是原`AuthorizationController`接口中的，现在挪到该类中，并使用Redis来替换`HttpSession`存储验证码信息，编写一个`CaptchaResult`来将redis中的key返回给前端，前端登录时携带这个key来获取缓存数据,`CaptchaResult`类在后边
```java
package com.example.controller;

import cn.hutool.captcha.CaptchaUtil;
import cn.hutool.captcha.ShearCaptcha;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.example.model.Result;
import com.example.model.response.CaptchaResult;
import com.example.support.RedisOperator;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.example.constant.RedisConstants.*;

/**
 * 登录接口，登录使用的接口
 *
 * @author vains
 */
@RestController
@RequiredArgsConstructor
public class LoginController {

    private final RedisOperator<String> redisOperator;

    @GetMapping("/getSmsCaptcha")
    public Result<String> getSmsCaptcha(String phone) {
        // 示例项目，固定1234
        String smsCaptcha = "1234";
        // 存入缓存中，5分钟后过期
        redisOperator.set((SMS_CAPTCHA_PREFIX_KEY + phone), smsCaptcha, CAPTCHA_TIMEOUT_SECONDS);
        return Result.success("获取短信验证码成功.", smsCaptcha);
    }

    @GetMapping("/getCaptcha")
    public Result<CaptchaResult> getCaptcha() {
        // 使用huTool-captcha生成图形验证码
        // 定义图形验证码的长、宽、验证码字符数、干扰线宽度
        ShearCaptcha captcha = CaptchaUtil.createShearCaptcha(150, 40, 4, 2);
        // 生成一个唯一id
        long id = IdWorker.getId();
        // 存入缓存中，5分钟后过期
        redisOperator.set((IMAGE_CAPTCHA_PREFIX_KEY + id), captcha.getCode(), CAPTCHA_TIMEOUT_SECONDS);
        return Result.success("获取验证码成功.", new CaptchaResult(String.valueOf(id), captcha.getCode(), captcha.getImageBase64Data()));
    }

}
```

### 2. `CaptchaResult`
生成的key是long，类使用String是因为前端对于long类型的大数据会有精度丢失问题，所以使用String
```java
package com.example.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 获取验证码返回
 *
 * @author vains
 */
@Data
@AllArgsConstructor
public class CaptchaResult {

    /**
     * 验证码id
     */
    private String captchaId;

    /**
     * 验证码的值
     */
    private String code;

    /**
     * 图片验证码的base64值
     */
    private String imageData;

}
```

### 3. 优化登录页面
页面修改不大，这里只放关键代码，如果有需要的可以去gitee查看完整代码：[代码地址](https://gitee.com/vains-Sofia/authorization-example)
页面登录表单添加隐藏域，存储redis存储验证码的key
```html
<input type="hidden" id="captchaId" name="captchaId" value=""/>
```

获取验证码并设置值的地方修改
```js
function getVerifyCode() {
    let requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch(`${window.location.origin}/getCaptcha`, requestOptions)
        .then(response => response.text())
        .then(r => {
            if (r) {
                let result = JSON.parse(r);
                document.getElementById('captchaId').value = result.data.captchaId
                document.getElementById('code-image').src = result.data.imageData
            }
        })
        .catch(error => console.log('error', error));
}
```

### 4. 修改`CaptchaAuthenticationProvider`从redis中获取验证码
```java
package com.example.authorization.captcha;

import com.example.constant.SecurityConstants;
import com.example.exception.InvalidCaptchaException;
import com.example.support.RedisOperator;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

import static com.example.constant.RedisConstants.IMAGE_CAPTCHA_PREFIX_KEY;

/**
 * 验证码校验
 * 注入ioc中替换原先的DaoAuthenticationProvider
 * 在authenticate方法中添加校验验证码的逻辑
 * 最后调用父类的authenticate方法并返回
 *
 * @author vains
 */
@Slf4j
public class CaptchaAuthenticationProvider extends DaoAuthenticationProvider {

    private final RedisOperator<String> redisOperator;

    /**
     * 利用构造方法在通过{@link Component}注解初始化时
     * 注入UserDetailsService和passwordEncoder，然后
     * 设置调用父类关于这两个属性的set方法设置进去
     *
     * @param userDetailsService 用户服务，给框架提供用户信息
     * @param passwordEncoder    密码解析器，用于加密和校验密码
     */
    public CaptchaAuthenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder, RedisOperator<String> redisOperator) {
        this.redisOperator = redisOperator;
        super.setPasswordEncoder(passwordEncoder);
        super.setUserDetailsService(userDetailsService);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        log.info("Authenticate captcha...");

        // 获取当前request
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes == null) {
            throw new InvalidCaptchaException("Failed to get the current request.");
        }
        HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();

        // 获取当前登录方式
        String loginType = request.getParameter(SecurityConstants.LOGIN_TYPE_NAME);
        if (!Objects.equals(loginType, SecurityConstants.PASSWORD_LOGIN_TYPE)) {
            // 只要不是密码登录都不需要校验图形验证码
            log.info("It isn't necessary captcha authenticate.");
            return super.authenticate(authentication);
        }

        // 获取参数中的验证码
        String code = request.getParameter(SecurityConstants.CAPTCHA_CODE_NAME);
        if (ObjectUtils.isEmpty(code)) {
            throw new InvalidCaptchaException("The captcha cannot be empty.");
        }

        String captchaId = request.getParameter(SecurityConstants.CAPTCHA_ID_NAME);
        // 获取缓存中存储的验证码
        String captchaCode = redisOperator.getAndDelete((IMAGE_CAPTCHA_PREFIX_KEY + captchaId));
        if (!ObjectUtils.isEmpty(captchaCode)) {
            if (!captchaCode.equalsIgnoreCase(code)) {
                throw new InvalidCaptchaException("The captcha is incorrect.");
            }
        } else {
            throw new InvalidCaptchaException("The captcha is abnormal. Obtain it again.");
        }

        log.info("Captcha authenticated.");
        return super.authenticate(authentication);
    }
}
```

### 5. 修改`SmsCaptchaLoginAuthenticationProvider`从redis中获取短信验证码
```java
package com.example.authorization.sms;

import com.example.authorization.captcha.CaptchaAuthenticationProvider;
import com.example.constant.SecurityConstants;
import com.example.exception.InvalidCaptchaException;
import com.example.support.RedisOperator;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

import static com.example.constant.RedisConstants.SMS_CAPTCHA_PREFIX_KEY;

/**
 * 短信验证码校验实现
 *
 * @author vains
 */
@Slf4j
@Component
public class SmsCaptchaLoginAuthenticationProvider extends CaptchaAuthenticationProvider {

    private final RedisOperator<String> redisOperator;

    /**
     * 利用构造方法在通过{@link Component}注解初始化时
     * 注入UserDetailsService和passwordEncoder，然后
     * 设置调用父类关于这两个属性的set方法设置进去
     *
     * @param userDetailsService 用户服务，给框架提供用户信息
     * @param passwordEncoder    密码解析器，用于加密和校验密码
     */
    public SmsCaptchaLoginAuthenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder, RedisOperator<String> redisOperator) {
        super(userDetailsService, passwordEncoder, redisOperator);
        this.redisOperator = redisOperator;
    }

    @Override
    protected void additionalAuthenticationChecks(UserDetails userDetails, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
        log.info("Authenticate sms captcha...");

        if (authentication.getCredentials() == null) {
            this.logger.debug("Failed to authenticate since no credentials provided");
            throw new BadCredentialsException("The sms captcha cannot be empty.");
        }

        // 获取当前request
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (requestAttributes == null) {
            throw new InvalidCaptchaException("Failed to get the current request.");
        }
        HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();

        // 获取当前登录方式
        String loginType = request.getParameter(SecurityConstants.LOGIN_TYPE_NAME);
        // 获取grant_type
        String grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE);
        // 短信登录和自定义短信认证grant type会走下方认证
        // 如果是自定义密码模式则下方的认证判断只要判断下loginType即可
        // if (Objects.equals(loginType, SecurityConstants.SMS_LOGIN_TYPE)) {}
        if (Objects.equals(loginType, SecurityConstants.SMS_LOGIN_TYPE)
                || Objects.equals(grantType, SecurityConstants.GRANT_TYPE_SMS_CODE)) {
            // 获取存入缓存中的验证码(UsernamePasswordAuthenticationToken的principal中现在存入的是手机号)
            String smsCaptcha = redisOperator.getAndDelete((SMS_CAPTCHA_PREFIX_KEY + authentication.getPrincipal()));
            // 校验输入的验证码是否正确(UsernamePasswordAuthenticationToken的credentials中现在存入的是输入的验证码)
            if (!Objects.equals(smsCaptcha, authentication.getCredentials())) {
                throw new BadCredentialsException("The sms captcha is incorrect.");
            }
            // 在这里也可以拓展其它登录方式，比如邮箱登录什么的
        } else {
            log.info("Not sms captcha loginType, exit.");
            // 其它调用父类默认实现的密码方式登录
            super.additionalAuthenticationChecks(userDetails, authentication);
        }

        log.info("Authenticated sms captcha.");
    }
}
```

### 6. 修改`Oauth2BasicUser`的`authorities`属性，以防序列化失败
上一篇文章中最开始没有添加`@JsonSerialize`与`@JsonIgnoreProperties(ignoreUnknown = true)`注解，导致授权确认时框架获取用户信息反序列化时失败，会导致`JsonMixin`异常，`@JsonSerialize`注解就是解决这个问题，另一个是忽略未知属性的。
```java
package com.example.entity;

import com.baomidou.mybatisplus.annotation.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collection;

import com.example.model.security.CustomGrantedAuthority;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * <p>
 * 基础用户信息表
 * </p>
 *
 * @author vains
 */
@Data
@JsonSerialize
@TableName("oauth2_basic_user")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Oauth2BasicUser implements UserDetails, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 自增id
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 用户名、昵称
     */
    private String name;

    /**
     * 账号
     */
    private String account;

    /**
     * 密码
     */
    private String password;

    /**
     * 手机号
     */
    private String mobile;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 头像地址
     */
    private String avatarUrl;

    /**
     * 是否已删除
     */
    private Boolean deleted;

    /**
     * 用户来源
     */
    private String sourceFrom;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 修改时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 权限信息
     *  非数据库字段
     */
    @TableField(exist = false)
    private Collection<CustomGrantedAuthority> authorities;

    @Override
    public Collection<CustomGrantedAuthority> getAuthorities() {
        return this.authorities;
    }

    @Override
    public String getUsername() {
        return this.account;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !this.deleted;
    }
}
```

#### 1. `CustomGrantedAuthority`
该类中添加`@JsonSerialize`也是为了解决`JsonMixin`问题
```java
package com.example.model.security;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;

/**
 * 自定义权限类
 *
 * @author vains
 */
@Data
@JsonSerialize
@NoArgsConstructor
@AllArgsConstructor
public class CustomGrantedAuthority implements GrantedAuthority {

    private String authority;

    @Override
    public String getAuthority() {
        return this.authority;
    }
}
```

### 7. Redis常量类`RedisConstants`
```java
package com.example.constant;

/**
 * Redis相关常量
 *
 * @author vains
 */
public class RedisConstants {

    /**
     * 短信验证码前缀
     */
    public static final String SMS_CAPTCHA_PREFIX_KEY = "mobile_phone:";

    /**
     * 图形验证码前缀
     */
    public static final String IMAGE_CAPTCHA_PREFIX_KEY = "image_captcha:";

    /**
     * 验证码过期时间，默认五分钟
     */
    public static final long CAPTCHA_TIMEOUT_SECONDS = 60L * 5;

}
```

### 8. `SecurityConstants`添加常量
```java
/**
 * 登录方式入参名
 */
public static final String LOGIN_TYPE_NAME = "loginType";

/**
 * 验证码id入参名
 */
public static final String CAPTCHA_ID_NAME = "captchaId";

/**
 * 验证码值入参名
 */
public static final String CAPTCHA_CODE_NAME = "code";
```

## 四、整合Spring data redis的步骤

- 引入starter
- 编写redis配置类(可选)
- 编写redis操作类(可选)

### 1. 引入starer
Spring boot项目中直接引入starter即可
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

引入`jackson-datatype-jsr310`提供对Java8的特性与Java8时间相关序列化支持
```xml
<dependency>
    <groupId>com.fasterxml.jackson.datatype</groupId>
    <artifactId>jackson-datatype-jsr310</artifactId>
</dependency>
```

```java
// 方式一: 手动指定序列化方式
@JsonSerialize(using = LocalDateTimeSerializer.class)
@JsonDeserialize(using = LocalDateTimeDeserializer.class)
private LocalDateTime createTime;

// 方式二: 注册JDK8Module，全局解析 LocalDateTime
ObjectMapper objectMapper = new ObjectMapper();
objectMapper.registerModule(new Jdk8Module());
objectMapper.registerModule(new JavaTimeModule());
```

### 2. 编写Redis配置文件
这个是可选的，但是如果不加这些序列化器会使用jdk的序列化器，导致使用redis客户端查看时与元数据有差异

> 2023-07-10更新：去除值序列化器，移除内容如下
```java
// 设置值序列化器(该内容已移除)
redisTemplate.setValueSerializer(valueSerializer);
```

> 2023-09-23更新：添加`Security`提供的`Json Mixin`，支持`Jackson`的值序列化器
```java
package com.example.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.security.jackson2.CoreJackson2Module;

/**
 * Redis的key序列化配置类
 *
 * @author vains
 */
@Configuration
@RequiredArgsConstructor
public class RedisConfig {

    private final Jackson2ObjectMapperBuilder builder;

    /**
     * 默认情况下使用
     *
     * @param connectionFactory redis链接工厂
     * @return RedisTemplate
     */
    @Bean
    public RedisTemplate<Object, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        // 字符串序列化器
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();

        // 创建ObjectMapper并添加默认配置
        ObjectMapper objectMapper = builder.createXmlMapper(false).build();

        // 序列化所有字段
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);

        // 此项必须配置，否则如果序列化的对象里边还有对象，会报如下错误：
        //     java.lang.ClassCastException: java.util.LinkedHashMap cannot be cast to XXX
        objectMapper.activateDefaultTyping(
                objectMapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY);

        // 添加Security提供的Jackson Mixin
        objectMapper.registerModule(new CoreJackson2Module());

        // 存入redis时序列化值的序列化器
        Jackson2JsonRedisSerializer<Object> valueSerializer =
                new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);

        RedisTemplate<Object, Object> redisTemplate = new RedisTemplate<>();

        // 设置值序列化
        redisTemplate.setValueSerializer(valueSerializer);
        // 设置hash格式数据值的序列化器
        redisTemplate.setHashValueSerializer(valueSerializer);
        // 默认的Key序列化器为：JdkSerializationRedisSerializer
        redisTemplate.setKeySerializer(stringRedisSerializer);
        // 设置字符串序列化器
        redisTemplate.setStringSerializer(stringRedisSerializer);
        // 设置hash结构的key的序列化器
        redisTemplate.setHashKeySerializer(stringRedisSerializer);

        // 设置连接工厂
        redisTemplate.setConnectionFactory(connectionFactory);

        return redisTemplate;
    }

    /**
     * 操作hash的情况下使用
     *
     * @param connectionFactory redis链接工厂
     * @return RedisTemplate
     */
    @Bean
    public RedisTemplate<Object, Object> redisHashTemplate(RedisConnectionFactory connectionFactory) {

        return redisTemplate(connectionFactory);
    }

}
```

### 3. 编写redis操作类
可选，框架提供了`RedisTemplate`来操作redis
```java
package com.example.support;

import com.example.util.JsonUtils;
import jakarta.annotation.Resource;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Redis操作类
 *
 * @param <V> value的类型
 * @author vains
 */
@Component
public class RedisOperator<V> {

    /**
     * 这里使用 @Resource 注解是因为在配置文件中注入ioc的泛型是<Object, Object>，所以类型匹配不上，
     * resource是会先根据名字去匹配的，所以使用Resource注解可以成功注入
     */
    @Resource
    private RedisTemplate<String, V> redisTemplate;

    @Resource
    private RedisTemplate<String, Object> redisHashTemplate;

    /**
     * 设置key的过期时间
     *
     * @param key     缓存key
     * @param timeout 存活时间
     * @param unit    时间单位
     */
    public void setExpire(String key, long timeout, TimeUnit unit) {
        redisHashTemplate.expire(key, timeout, unit);
    }

    /**
     * 根据key删除缓存
     *
     * @param keys 要删除的key，可变参数列表
     * @return 删除的缓存数量
     */
    public Long delete(String... keys) {
        if (ObjectUtils.isEmpty(keys)) {
            return 0L;
        }
        return redisTemplate.delete(Arrays.asList(keys));
    }

    /**
     * 存入值
     *
     * @param key   缓存中的key
     * @param value 存入的value
     */
    public void set(String key, V value) {
        valueOperations().set(key, value);
    }

    /**
     * 根据key取值
     *
     * @param key 缓存中的key
     * @return 返回键值对应缓存
     */
    public V get(String key) {
        return valueOperations().get(key);
    }

    /**
     * 设置键值并设置过期时间
     *
     * @param key     键
     * @param value   值
     * @param timeout 过期时间
     * @param unit    过期时间的单位
     */
    public void set(String key, V value, long timeout, TimeUnit unit) {
        valueOperations().set(key, value, timeout, unit);
    }

    /**
     * 设置键值并设置过期时间（单位秒）
     *
     * @param key     键
     * @param value   值
     * @param timeout 过期时间,单位：秒
     */
    public void set(String key, V value, long timeout) {
        this.set(key, value, timeout, TimeUnit.SECONDS);
    }

    /**
     * 根据key获取缓存并删除缓存
     *
     * @param key 要获取缓存的key
     * @return key对应的缓存
     */
    public V getAndDelete(String key) {
        if (ObjectUtils.isEmpty(key)) {
            return null;
        }
        V value = valueOperations().get(key);
        this.delete(key);
        return value;
    }

    /**
     * 往hash类型的数据中存值
     *
     * @param key   缓存中的key
     * @param field hash结构的key
     * @param value 存入的value
     */
    public void setHash(String key, String field, V value) {
        hashOperations().put(key, field, value);
    }

    /**
     * 根据key取值
     *
     * @param key 缓存中的key
     * @return 缓存key对应的hash数据中field属性的值
     */
    public Object getHash(String key, String field) {
        return hashOperations().hasKey(key, field) ? hashOperations().get(key, field) : null;
    }

    /**
     * 以hash格式存入redis
     *
     * @param key   缓存中的key
     * @param value 存入的对象
     */
    public void setHashAll(String key, Object value) {
        Map<String, Object> map = JsonUtils.objectCovertToObject(value, Map.class, String.class, Object.class);
        hashOperations().putAll(key, map);
    }

    /**
     * 设置键值并设置过期时间
     *
     * @param key     键
     * @param value   值
     * @param timeout 过期时间
     * @param unit    过期时间的单位
     */
    public void setHashAll(String key, Object value, long timeout, TimeUnit unit) {
        this.setHashAll(key, value);
        this.setExpire(key, timeout, unit);
    }

    /**
     * 设置键值并设置过期时间（单位秒）
     *
     * @param key     键
     * @param value   值
     * @param timeout 过期时间,单位：秒
     */
    public void setHashAll(String key, Object value, long timeout) {
        this.setHashAll(key, value, timeout, TimeUnit.SECONDS);
    }

    /**
     * 从redis中获取hash类型数据
     *
     * @param key 缓存中的key
     * @return redis 中hash数据
     */
    public Map<String, Object> getMapHashAll(String key) {
        return hashOperations().entries(key);
    }

    /**
     * 根据指定clazz类型从redis中获取对应的实例
     *
     * @param key   缓存key
     * @param clazz hash对应java类的class
     * @param <T>   redis中hash对应的java类型
     * @return clazz实例
     */
    public <T> T getHashAll(String key, Class<T> clazz) {
        Map<String, Object> entries = hashOperations().entries(key);
        if (ObjectUtils.isEmpty(entries)) {
            return null;
        }
        return JsonUtils.objectCovertToObject(entries, clazz);
    }

    /**
     * 根据key删除缓存
     *
     * @param key    要删除的key
     * @param fields key对应的hash数据的键值(HashKey)，可变参数列表
     * @return hash删除的属性数量
     */
    public Long deleteHashField(String key, String... fields) {
        if (ObjectUtils.isEmpty(key) || ObjectUtils.isEmpty(fields)) {
            return 0L;
        }
        return hashOperations().delete(key, (Object[]) fields);
    }

    /**
     * 将value添加至key对应的列表中
     *
     * @param key   缓存key
     * @param value 值
     */
    public void listPush(String key, V value) {
        listOperations().rightPush(key, value);
    }

    /**
     * 将value添加至key对应的列表中，并添加过期时间
     *
     * @param key     缓存key
     * @param value   值
     * @param timeout key的存活时间
     * @param unit    时间单位
     */
    public void listPush(String key, V value, long timeout, TimeUnit unit) {
        listOperations().rightPush(key, value);
        this.setExpire(key, timeout, unit);
    }

    /**
     * 将value添加至key对应的列表中，并添加过期时间
     * 默认单位是秒(s)
     *
     * @param key     缓存key
     * @param value   值
     * @param timeout key的存活时间
     */
    public void listPush(String key, V value, long timeout) {
        this.listPush(key, value, timeout, TimeUnit.SECONDS);
    }

    /**
     * 将传入的参数列表添加至key的列表中
     *
     * @param key    缓存key
     * @param values 值列表
     * @return 存入数据的长度
     */
    public Long listPushAll(String key, Collection<V> values) {
        return listOperations().rightPushAll(key, values);
    }

    /**
     * 将传入的参数列表添加至key的列表中，并设置key的存活时间
     *
     * @param key     缓存key
     * @param values  值列表
     * @param timeout key的存活时间
     * @param unit    时间单位
     * @return 存入数据的长度
     */
    public Long listPushAll(String key, Collection<V> values, long timeout, TimeUnit unit) {
        Long count = listOperations().rightPushAll(key, values);
        this.setExpire(key, timeout, unit);
        return count;
    }

    /**
     * 将传入的参数列表添加至key的列表中，并设置key的存活时间
     *  默认单位是秒(s)
     *
     * @param key     缓存key
     * @param values  值列表
     * @param timeout key的存活时间
     * @return 存入数据的长度
     */
    public Long listPushAll(String key, Collection<V> values, long timeout) {
        return this.listPushAll(key, values, timeout, TimeUnit.SECONDS);
    }

    /**
     * 根据key获取list列表
     *
     * @param key 缓存key
     * @return key对应的list列表
     */
    public Collection<V> getList(String key) {
        Long size = listOperations().size(key);
        if (size == null || size == 0) {
            return null;
        }
        return listOperations().range(key, 0, (size - 1));
    }

    /**
     * value操作集
     *
     * @return ValueOperations
     */
    private ValueOperations<String, V> valueOperations() {
        return redisTemplate.opsForValue();
    }

    /**
     * hash操作集
     *
     * @return ValueOperations
     */
    private HashOperations<String, String, Object> hashOperations() {
        return redisHashTemplate.opsForHash();
    }

    /**
     * hash操作集
     *
     * @return ValueOperations
     */
    private ListOperations<String, V> listOperations() {
        return redisTemplate.opsForList();
    }

}
```

暂时只提供了string、list、hash的操作，其它的后续在加吧

### 4. 编写一个测试类测试这个工具类
test目录下
```java
package com.example;

import com.example.entity.Oauth2BasicUser;
import com.example.support.RedisOperator;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * redis工具类测试
 *
 * @author vains
 */
@Slf4j
@SpringBootTest
public class RedisOperatorTests {

    @Autowired
    private RedisOperator<String> redisOperator;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private RedisOperator<Oauth2BasicUser> userRedisOperator;

    @Test
    @SneakyThrows
    void contextLoads() {
        // 默认key
        String defaultKey = "testKey";
        // 默认缓存值
        String defaultValue = "123456";
        // key的存活时间
        long timeout = 3;
        // 操作hash的属性声明
        String name = "name";

        // 清除key
        redisOperator.delete(defaultKey);

        // 获取用户信息
        Oauth2BasicUser userDetails = (Oauth2BasicUser) userDetailsService.loadUserByUsername("admin");

        redisOperator.set(defaultKey, defaultValue);
        log.info("根据key：{}存入值{}", defaultKey, defaultValue);

        String valueByKey = redisOperator.get(defaultKey);
        log.info("根据key：{}获取到值：{}", defaultKey, valueByKey);

        String valueByKeyAndDelete = redisOperator.getAndDelete(defaultKey);
        log.info("根据key：{}获取到值：{},删除key.", defaultKey, valueByKeyAndDelete);

        Long delete = redisOperator.delete(defaultKey);
        log.info("删除key：{}，删除数量：{}.", defaultKey, delete);

        valueByKey = redisOperator.get(defaultKey);
        log.info("根据key：{}获取到值：{}", defaultKey, valueByKey);

        redisOperator.set(defaultKey, defaultValue, timeout);
        log.info("根据key：{}存入值{}，存活时长为：{}", defaultKey, defaultValue, timeout);
        valueByKey = redisOperator.get(defaultKey);
        log.info("根据key：{}获取到值：{}", defaultKey, valueByKey);

        // 睡眠，让key失效
        TimeUnit.SECONDS.sleep((timeout + 1));

        // 重复获取
        valueByKey = redisOperator.get(defaultKey);
        log.info("线程睡眠后根据失效的key：{}获取到值：{}", defaultKey, valueByKey);

        redisOperator.setHashAll(defaultKey, userDetails, timeout);
        log.info("根据key：{}存入hash类型值{},存活时间：{}", defaultKey, userDetails, timeout);

        Oauth2BasicUser basicUser = redisOperator.getHashAll(defaultKey, Oauth2BasicUser.class);
        log.info("根据key：{}获取到hash类型值：{}", defaultKey, basicUser);

        // 睡眠，让key失效
        TimeUnit.SECONDS.sleep((timeout + 1));
        // 重复获取
        basicUser = redisOperator.getHashAll(defaultKey, Oauth2BasicUser.class);
        log.info("线程睡眠后根据失效的key：{}获取到hash类型值：{}", defaultKey, basicUser);

        redisOperator.setHashAll(defaultKey, userDetails, timeout);
        log.info("根据key：{}存入hash类型值{},存活时间：{}", defaultKey, userDetails, timeout);

        Map<String, Object> mapHashAll = redisOperator.getMapHashAll(defaultKey);
        log.info("根据key：{}获取到hash类型值：{}", defaultKey, mapHashAll);

        Object field = redisOperator.getHash(defaultKey, name);
        log.info("根据key：{}获取到hash类型属性：{}的值：{}", defaultKey, name, field);

        Long deleteHashField = redisOperator.deleteHashField(defaultKey, name);
        log.info("根据key：{}删除hash类型的{}属性，删除数量：{}", defaultKey, name, deleteHashField);

        // 重复获取验证删除
        field = redisOperator.getHash(defaultKey, name);
        log.info("根据key：{}获取到hash类型属性：{}的值：{}", defaultKey, name, field);
        basicUser = redisOperator.getHashAll(defaultKey, Oauth2BasicUser.class);
        log.info("根据key：{}获取到hash类型值：{}", defaultKey, basicUser);

        redisOperator.setHash(defaultKey, name, userDetails.getName());
        log.info("根据key：{}设置hash类型的{}属性，属性值为：{}", defaultKey, name, userDetails.getName());

        // 重复获取验证删除
        field = redisOperator.getHash(defaultKey, name);
        log.info("根据key：{}获取到hash类型属性：{}的值：{}", defaultKey, name, field);
        basicUser = redisOperator.getHashAll(defaultKey, Oauth2BasicUser.class);
        log.info("根据key：{}获取到hash类型值：{}", defaultKey, basicUser);

        // 清除key
        redisOperator.delete(defaultKey);

        userRedisOperator.listPush(defaultKey, userDetails);
        log.info("根据key：{}往list类型数据中添加数据：{}", defaultKey, userDetails);

        Collection<Oauth2BasicUser> users = userRedisOperator.getList(defaultKey);
        log.info("根据key：{}获取list数据：{}", defaultKey, users);

        Long listPushAll = userRedisOperator.listPushAll(defaultKey, List.of(userDetails));
        log.info("根据key：{}往list类型数据中添加数据：{}，成功添加{}条数据", defaultKey, List.of(userDetails), listPushAll);

        users = userRedisOperator.getList(defaultKey);
        log.info("根据key：{}获取list数据：{}", defaultKey, users);

        userRedisOperator.listPush(defaultKey, userDetails, timeout);
        log.info("根据key：{}往list类型数据中添加数据：{}，key的存活时间为：{}", defaultKey, userDetails, timeout);
        // 睡眠，让key失效
        TimeUnit.SECONDS.sleep((timeout + 1));
        // 重复获取
        users = userRedisOperator.getList(defaultKey);
        log.info("线程睡眠后根据失效的key：{}获取到list类型值：{}", defaultKey, users);

        Long aLong = userRedisOperator.listPushAll(defaultKey, List.of(userDetails), timeout);
        log.info("根据key：{}往list类型数据中添加数据：{}，成功添加{}条数据，设置过期时间：{}", defaultKey, List.of(userDetails), aLong, timeout);
    }

}
```

## 五、测试
组装url发起授权请求
```shell
http://127.0.0.1:8080/oauth2/authorize?client_id=messaging-client&response_type=code&scope=message.read&redirect_uri=http://127.0.0.1:8000/login/oauth2/code/messaging-client-oidc
```

重定向到登录页面

![img](./img/101/101-1.awebp)

查看redis

![img](./img/101/101-2.awebp)

登录后重定向至授权确认页面

![img](./img/101/101-3.awebp)

确认后重定向至回调页面

![img](./img/101/101-4.awebp)

如果有什么问题请在评论区指出，如果我看到会尽快处理的，谢谢

代码已提交至Gitee：[仓库地址](https://gitee.com/vains-Sofia/authorization-example)
