[SpringBoot 服务接口限流，搞定！](blog.csdn.net/qq_34217386/article/details/122100904)
[SpringBoot 项目使用 Redis 对用户 IP 进行接口限流](https://mp.weixin.qq.com/s/062xXsIEaOuen_4wwYTUow)

## 前言
在开发高并发系统时有三把利器用来保护系统：缓存、降级和限流。限流可以认为服务降级的一种，限流通过限制请求的流量以达到保护系统的目的。

一般来说，系统的吞吐量是可以计算出一个阈值的，为了保证系统的稳定运行，一旦达到这个阈值，就需要限制流量并采取一些措施以完成限制流量的目的。比如：延迟处理，拒绝处理，或者部分拒绝处理等等。否则，很容易导致服务器的宕机。

## 常见限流算法


### 计数器限流
计数器限流算法是最为简单粗暴的解决方案，主要用来限制总并发数，比如数据库连接池大小、线程池大小、接口访问并发数等都是使用计数器算法。

如：使用 AomicInteger 来进行统计当前正在并发执行的次数，如果超过域值就直接拒绝请求，提示系统繁忙。

### 漏桶算法
图片
漏桶算法思路很简单，我们把水比作是 请求，漏桶比作是 系统处理能力极限，水先进入到漏桶里，漏桶里的水按一定速率流出，当流出的速率小于流入的速率时，由于漏桶容量有限，后续进入的水直接溢出（拒绝请求），以此实现限流。

### 令牌桶算法
图片


令牌桶算法的原理也比较简单，我们可以理解成医院的挂号看病，只有拿到号以后才可以进行诊病。

系统会维护一个令牌（token）桶，以一个恒定的速度往桶里放入令牌（token），这时如果有请求进来想要被处理，则需要先从桶里获取一个令牌（token），当桶里没有令牌（token）可取时，则该请求将被拒绝服务。令牌桶算法通过控制桶的容量、发放令牌的速率，来达到对请求的限制。

## 单机模式
Google 开源工具包 Guava 提供了限流工具类 RateLimiter，该类基于令牌桶算法实现流量限制，使用十分方便，而且十分高效

### 引入依赖 pom
```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>30.1-jre</version>
</dependency>
```

### 创建注解 Limit
```java
package com.example.demo.common.annotation;

import java.lang.annotation.*;
import java.util.concurrent.TimeUnit;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
@Documented
public @interface Limit {

    // 资源key
    String key() default "";
    
    // 最多访问次数
    double permitsPerSecond();

    // 时间
    long timeout();
    
    // 时间类型
    TimeUnit timeunit() default TimeUnit.MILLISECONDS;

    // 提示信息
    String msg() default "系统繁忙,请稍后再试";

}
```

### 注解 aop 实现
```java
package com.example.demo.common.aspect;

import com.example.demo.common.annotation.Limit;
import com.example.demo.common.dto.R;
import com.example.demo.common.exception.LimitException;
import com.google.common.collect.Maps;
import com.google.common.util.concurrent.RateLimiter;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import java.lang.reflect.Method;
import java.util.Map;

@Slf4j
@Aspect
@Component
public class LimitAspect {

    private final Map<String, RateLimiter> limitMap = Maps.newConcurrentMap();

    @Around("@annotation(com.example.demo.common.annotation.Limit)")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature signature = (MethodSignature)pjp.getSignature();
        Method method = signature.getMethod();
        //拿limit的注解
        Limit limit = method.getAnnotation(Limit.class);
        if (limit != null) {
            //key作用：不同的接口，不同的流量控制
            String key=limit.key();
            RateLimiter rateLimiter;
            //验证缓存是否有命中key
            if (!limitMap.containsKey(key)) {
                // 创建令牌桶
                rateLimiter = RateLimiter.create(limit.permitsPerSecond());
                limitMap.put(key, rateLimiter);
                log.info("新建了令牌桶={}，容量={}",key,limit.permitsPerSecond());
            }
            rateLimiter = limitMap.get(key);
            // 拿令牌
            boolean acquire = rateLimiter.tryAcquire(limit.timeout(), limit.timeunit());
            // 拿不到命令，直接返回异常提示
            if (!acquire) {
                log.debug("令牌桶={}，获取令牌失败",key);
                throw new LimitException(limit.msg());
            }
        }
        return pjp.proceed();
    }

}
```

### 注解使用

- permitsPerSecond 代表请求总数量
- timeout 代表限制时间 

即 timeout 时间内，只允许有 permitsPerSecond 个请求总数量访问，超过的将被限制不能访问

```java
package com.example.demo.module.test;

import com.example.demo.common.annotation.Limit;
import com.example.demo.common.dto.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
public class TestController {

    @Limit(key = "cachingTest", permitsPerSecond = 1, timeout = 500, msg = "当前排队人数较多，请稍后再试！")
    @GetMapping("cachingTest")
    public R cachingTest(){
        log.info("------读取本地------");
        List<String> list = new ArrayList<>();
        list.add("蜡笔小新");
        list.add("哆啦A梦");
        list.add("四驱兄弟");

        return R.ok(list);
    }

}
```

测试



启动项目，快读刷新访问 /cachingTest 请求



图片


可以看到访问已经有被成功限制



该种方式属于应用级限流，假设将应用部署到多台机器，应用级限流方式只是单应用内的请求限流，不能进行全局限流。因此我们需要分布式限流和接入层限流来解决这个问题。


## 分布式模式
基于 redis + lua 脚本的分布式限流

分布式限流最关键的是要将限流服务做成原子化，而解决方案可以使用 redis+lua 或者 nginx+lua 技术进行实现，通过这两种技术可以实现的高并发和高性能。

首先我们来使用 redis+lua 实现时间窗内某个接口的请求数限流，实现了该功能后可以改造为限流总并发/请求数和限制总资源数。lua 本身就是一种编程语言，也可以使用它实现复杂的令牌桶或漏桶算法。 因操作是在一个 lua 脚本中（相当于原子操作），又因 redis 是单线程模型，因此是线程安全的。

相比 redis 事务来说，lua 脚本有以下优点

- 减少网络开销：不使用 lua 的代码需要向 redis 发送多次请求，而脚本只需一次即可，减少网络传输；
- 原子操作：redis 将整个脚本作为一个原子执行，无需担心并发，也就无需事务；
- 复用：脚本会永久保存 redis 中，其他客户端可继续使用。


### 创建注解 RedisLimit
```java
package com.example.demo.common.annotation;

import com.example.demo.common.enums.LimitType;

import java.lang.annotation.*;

@Target({ElementType.METHOD,ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface RedisLimit {

    // 资源名称
    String name() default "";

    // 资源key
    String key() default "";

    // 前缀
    String prefix() default "";

    // 时间
    int period();

    // 最多访问次数
    int count();

    // 类型
    LimitType limitType() default LimitType.CUSTOMER;

    // 提示信息
    String msg() default "系统繁忙,请稍后再试";

}
```

### 注解 aop 实现
```java
package com.example.demo.common.aspect;

import com.example.demo.common.annotation.RedisLimit;
import com.example.demo.common.enums.LimitType;
import com.example.demo.common.exception.LimitException;
import com.google.common.collect.ImmutableList;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.util.Objects;

@Slf4j
@Aspect
@Configuration
public class RedisLimitAspect {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisLimitAspect(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Around("@annotation(com.example.demo.common.annotation.RedisLimit)")
    public Object around(ProceedingJoinPoint pjp){
        MethodSignature methodSignature = (MethodSignature)pjp.getSignature();
        Method method = methodSignature.getMethod();
        RedisLimit annotation = method.getAnnotation(RedisLimit.class);
        LimitType limitType = annotation.limitType();

        String name = annotation.name();
        String key;

        int period = annotation.period();
        int count = annotation.count();

        switch (limitType){
            case IP:
                key = getIpAddress();
                break;
            case CUSTOMER:
                key = annotation.key();
                break;
            default:
                key = StringUtils.upperCase(method.getName());
        }
        ImmutableList<String> keys = ImmutableList.of(StringUtils.join(annotation.prefix(), key));
        try {
            String luaScript = buildLuaScript();
            DefaultRedisScript<Number> redisScript = new DefaultRedisScript<>(luaScript, Number.class);
            Number number = redisTemplate.execute(redisScript, keys, count, period);
            log.info("Access try count is {} for name = {} and key = {}", number, name, key);
            if(number != null && number.intValue() == 1){
                return pjp.proceed();
            }
            throw new LimitException(annotation.msg());
        }catch (Throwable e){
            if(e instanceof LimitException){
                log.debug("令牌桶={}，获取令牌失败",key);
                throw new LimitException(e.getLocalizedMessage());
            }
            e.printStackTrace();
            throw new RuntimeException("服务器异常");
        }
    }

    public String buildLuaScript(){
        return "redis.replicate_commands(); local listLen,time" +
                "\nlistLen = redis.call('LLEN', KEYS[1])" +
                // 不超过最大值，则直接写入时间
                "\nif listLen and tonumber(listLen) < tonumber(ARGV[1]) then" +
                "\nlocal a = redis.call('TIME');" +
                "\nredis.call('LPUSH', KEYS[1], a[1]*1000000+a[2])" +
                "\nelse" +
                // 取出现存的最早的那个时间，和当前时间比较，看是小于时间间隔
                "\ntime = redis.call('LINDEX', KEYS[1], -1)" +
                "\nlocal a = redis.call('TIME');" +
                "\nif a[1]*1000000+a[2] - time < tonumber(ARGV[2])*1000000 then" +
                // 访问频率超过了限制，返回0表示失败
                "\nreturn 0;" +
                "\nelse" +
                "\nredis.call('LPUSH', KEYS[1], a[1]*1000000+a[2])" +
                "\nredis.call('LTRIM', KEYS[1], 0, tonumber(ARGV[1])-1)" +
                "\nend" +
                "\nend" +
                "\nreturn 1;";
    }

    public String getIpAddress(){
        HttpServletRequest request = ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
        String ip = request.getHeader("x-forwarded-for");
        if(ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)){
            ip = request.getHeader("Proxy-Client-IP");
        }
        if(ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)){
            ip = request.getHeader("WL-Client-IP");
        }
        if(ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)){
            ip = request.getRemoteAddr();
        }
        return ip;
    }

}
```

### 注解使用



- count 代表请求总数量
- period 代表限制时间

即 period 时间内，只允许有 count 个请求总数量访问，超过的将被限制不能访问

```java
package com.example.demo.module.test;

import com.example.demo.common.annotation.Limit;
import com.example.demo.common.annotation.RedisLimit;
import com.example.demo.common.dto.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
public class TestController {

    @RedisLimit(key = "cachingTest", count = 2, period = 2, msg = "当前排队人数较多，请稍后再试！")
//    @Limit(key = "cachingTest", permitsPerSecond = 1, timeout = 500, msg = "当前排队人数较多，请稍后再试！")
    @GetMapping("cachingTest")
    public R cachingTest(){
        log.info("------读取本地------");
        List<String> list = new ArrayList<>();
        list.add("蜡笔小新");
        list.add("哆啦A梦");
        list.add("四驱兄弟");

        return R.ok(list);
    }

}
```

测试

启动项目，快读刷新访问 /cachingTest 请求

图片

可以看到访问已经有被成功限制

这只是其中一种实现方式，尚有许多实现方案，经供参考
