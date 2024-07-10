- [Java日志通关（一） - 前世今生](https://mp.weixin.qq.com/s/eIiu08fVk194E0BgGL5gow)
- [Java日志通关（二） - Slf4j+Logback 整合及排包](https://mp.weixin.qq.com/s/jABbG4MKvEiWXwdYwUk8SA)
- [Java日志通关（三） - Slf4j 介绍](https://mp.weixin.qq.com/s/Ys9LxsvmRhhwgtL4Kji_FQ)
- [Java日志通关（四） - Logback 介绍](https://mp.weixin.qq.com/s/UR30lfp_Guu9d6f0jzWfJw)
- [Java日志通关（五） - 最佳实践](https://mp.weixin.qq.com/s/KrJ1s1bCjOQLlnWeUaHJvg)
- [异步日志：性能优化的金钥匙](https://mp.weixin.qq.com/s/4GIqXc4rfX6QZtUwHZheag)

## 一、配置入口

Logback支持XML、Groovy的配置方式，以XML来说，它会默认查找resources目录下的logback-test.xml（用于测试）/logback.xml文件。
而如果你使用的Spring Boot，那么你还可以使用logback-spring.xml文件进行配置。这两者的区别是：
logback-spring.xml是由 Spring Boot 找到，插入自己的上下文信息[1]并做进一步处理后再传递给Logback的，你可以在其中使用<springProfile>区分环境配置，也可以使用<springProperty>拿到Spring上下文信息（比如spring.application.name）。

logback.xml是由Logback自己找到的，自然不会有Spring Boot相关的能力。

## 二、配置文件介绍

接下来我们以logback-spring.xml为例进行介绍。一个Logback配置文件主要有以下几个标签：

- confinuration：最外层的父标签，其中有几个属性配置，但项目中较少使用，就不啰嗦了；

- property：定义变量；

- appender：负责日志输出（一般是写到文件），我们可以通过它设置输出方案；

- logger：用来设置某个LoggerName的打印级别；

- root：logger的兜底配置，从而我们不必配置每个LoggerName；

- conversionRule：定义转换规则，参考【四、Java API】；


### 2.1 springProperty 和 property

前文提到<springProperty>用来插入Spring上下文，那<property>就是 Logback 自己定义变量的标签。直接看示例：
```xml
<springProperty scope="context" name="APP_NAME" source="spring.application.name"/>

<property name="LOG_PATH" value="${user.home}/${APP_NAME}/logs"/>
<property name="APP_LOG_FILE" value="${LOG_PATH}/application.log"/>
<property name="APP_LOG_PATTERN"
          value="%date{yyyy-MM-dd HH:mm:ss.SSS}|%-5level|%X{trace_id}|%thread|%logger{20}|%message%n%exception"/>
```

我们首先用<springProperty>插入APP_NAME这个变量来表示应用名，随后用它拼出LOG_PATH变量。示例中还用到了${user.home}这个Logback内建支持的上下文变量[2]。APP_LOG_FILE是log文件路径；APP_LOG_PATTERN是日志格式（请参考【三、占位符】节）。


### 2.2 appender

这一节涉及到的知识点很多，但一码胜千言，先直接给出示例：
```xml
<appender name="APPLICATION" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${APP_LOG_FILE}</file>
    <encoder>
        <pattern>${APP_LOG_PATTERN}</pattern>
    </encoder>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
        <fileNamePattern>${APP_LOG_FILE}.%d{yyyy-MM-dd}.%i</fileNamePattern>
        <maxHistory>30</maxHistory>
        <maxFileSize>200MB</maxFileSize>
        <totalSizeCap>10GB</totalSizeCap>
    </rollingPolicy>
</appender>
<appender name="APPLICATION-async" class="ch.qos.logback.classic.AsyncAppender">
    <queueSize>256</queueSize>
    <discardingThreshold>0</discardingThreshold>
    <neverBlock>true</neverBlock>
    <appender-ref ref="APPLICATION"/>
</appender>
```

示例中涉及的变量在上一节已经提到，这里不啰嗦了。需要关注的是以下几个点：

- `ch.qos.logback.core.rolling.RollingFileAppender`负责将日志滚动打印，避免单文件体积过大。具体的滚动策略都在<rollingPolicy>中指定，各配置项都还算好理解。

- `ch.qos.logback.classic.AsyncAppender`负责将日志异步打印，避免大量打印日志时阻塞线程。

- 除了上边这两个，还有如`ch.qos.logback.core.ConsoleAppender`是用来将日志输出到控制台，如果你用到了，建议参考【下一篇九、不要将日志输出至Console】节。

更多Appender和RollingPolicy相关的介绍，可以参考官方文档Chapter 4: Appenders[3]。


### 2.3 logger和root

<logger>用来设置某个LoggerName的打印级别。比如：
```xml
<logger level="INFO" additivity="false" name="com.foo.bar">
    <appender-ref ref="APPLICATION-async"/>
</logger>
<root level="INFO">
    <appender-ref ref="APPLICATION-async"/>
</root>
```

上面的配置指定所有LoggerName为com.foo.bar的日志以INFO级别进行打印（TRACE和DEBUG级别将不会输出），此配置绑定的输出器（appender）为APPLICATION-async。

其中LoggerName会以 . 为分隔符逐级向上匹配，比如实际LoggerName为com.foo.bar.service.ExampleService，那么它的查找过程依次为：
com.foo.bar.service.ExampleService
com.foo.bar.service
com.foo.bar（此时命中了我们示例中的<logger>，另外因为配置了additivity="false" 所以停止继续向下查找）
com.foo
com
<root>

而 <root>就是兜底配置了，当LoggerName没匹配到任何一项<logger> 时，就会使用 <root>，所以它是没有additivity和name属性的。
一般实际业务场景中，所有<logger>都建议加上additivity="false" ，否则日志就会因查找到多个<logger>（或<root>）而打印多份。


### 2.4 springProfile

Spring还提供了<springProfile>标签，用来根据Spring Profiles[4]（即 spring.profiles.active的值）动态调整日志信息，比如我们希望线上环境使用INFO级别，而预发、日常使用TRACE级别：
```xml
<springProfile name="production">
    <root level="INFO">
        <appender-ref ref="APPLICATION-async"/>
    </root>
</springProfile>
<springProfile name="staging,testing">
    <root level="TRACE">
        <appender-ref ref="APPLICATION-async"/>
    </root>
</springProfile>
```

## 三、占位符



### 3.1 Conversion Word

Logback提供了大量有用的占位符给大家使用，官方文档在Conversion Word[5]。
比如一些常用的占位符（大部分占位符都有缩写形式，比如%logger可以简写为%c，我不在这里一一列举了，具体可以查看上边给出的官方文档）：
占位符
说明
%logger
输出LoggerName（参考【第三篇：1.1 工厂函数】节）
%message
输出你实际要打印的日志信息（参考【第三篇：3.1 info方法】节）
%exception
输出异常堆栈，对应通过Slf4j传入的异常（参考【第三篇：3.1 info方法】节）
%level
输出日志级别，即TRACE/DEBUG/INFO/WARN/ERROR/FATAL。
注意这里有别于Slf4j（参考【第三篇：二、日志级别】），多了个FATAL级别，这是为了适配Log4j而存在的。
%xException
输出异常堆栈，同时包含每行堆栈所归属的JAR包名
%marker
输出通过Marker（参考【第三篇：四、Marker】节）传入的字符串
%mdc
输出MDC（参考【第三篇：五、MDC】节）中对应的值
%kvp
输出通过addKeyValue（参考【第三篇：六、Fluent API （链式调用）】节）传入的KV对
%date
输出时间，可以添加符合ISO 8601[6]的参数指定输出格式，比如我们常用的yyyy-MM-dd HH:mm:ss
%thread
输出打印日志方法所在的线程名
%n
输出一个换行符
%replace(p){r, t}
将p中的r替换为t，r为正则。请参考【第五篇：七、将堆栈合并为一行】节
%nopex
忽略传入的堆栈，不打印。请参考【第五篇：七、将堆栈合并为一行】节
Logback会判断你的日志pattern，如果没有输出堆栈，会默认追加%exception，以保证传入的异常信息不会丢。这个占位符就是明确要求不做追加。
另外，针对%logger额外做一下补充。%logger的参数中可以传一个正整数，用于指定输出长度，当LoggerName长度超过限制时，Logback会以 . 为分隔智能缩短。假设LoggerName是com.example.foo.bar.ExampleService（这个字符串长度为34），那么：

配置
输出结果
说明
[%logger]
[com.example.foo.bar.ExampleService]
原样输出
[%logger{32}]
[c.example.foo.bar.ExampleService]
实际长度32，与限制值一致
[%logger{30}]
[c.e.foo.bar.ExampleService]
实际长度26，比限制值小。因为每一级 package要么保留原样，要么只取第一个字符
[%logger{10}]
[c.e.f.b.ExampleService]
实际长度20，比限制值大。因为每一级 package至少会保留一个字符，且最后一级不会被缩短
[%logger{0}]
[ExampleService]
0比较特殊，表示只保留最后一级，且不会被缩短


### 3.2 Format modifiers

从前边我们可以看到，占位符的基本使用方式是：%占位符{参数}，但其实还有一个用于控制格式的可选配置，可以放在%与占位符之间，叫作Format modifiers[7]。一个完整的格式配置包含五个部分，比如：-10.-20，我们分别解释：
-：第一个-表示不足最小长度时在右侧填充空格，即输出内容左对齐（默认是在左侧填充空格，即右对齐）；

10：第一个数字表示输出最小长度，不足的补空格；

.：与后边两项配置的分隔符，本身没有含义；

-：第二个-表示超过最大长度时先裁剪右侧，即保留左侧字符（默认先裁剪左侧，即保留右侧字符）；

20：第二个数字表示输出最大长度，超出部分会做裁剪；

举个几个例子：
配置
文本
输出结果
说明
[%5level]
INFO
[ INFO]
最小5个字符，右对齐
[%-5level]
INFO
[INFO ]
最小5个字符，左对齐
[%.-1level]
INFO
[I]
最大1个字符，优先保留左侧字符
[%-5,-10logger]
com.foo.bar.Service
[com.foo.ba]
最大10个字符，优先保留左侧字符
[%-5,10logger]
com.foo.bar.Service
[ar.Service]
最大10个字符，优先保留右侧字符

## 四、Java API

除了使用XML配置文件外，Logback还提供了大量的Java API[8]以支持更复杂的业务诉求。我们通过三个非常实用的场景来简单介绍一下。
场景一：使用log.info("obj={}", obj) 时，如何将obj统一转JSON String后输出；

场景二：日志中涉及到的手机号、身份证号，如何脱敏后再记录日志；

场景三：Logback配置基于XML，如何不改代码不发布，也可以动态修改日志级别；

其中前两个问题都可以通过MessageConverter[9]实现，因为篇幅原因，具体介绍可关注后续文章。
第三个问题可以借助LoggerContext[10]及Logger[11]，同样因为篇幅原因，具体介绍可关注后续文章。

## 五、MDC 中的 traceId

单独拿出一节讲这个，是因为我发现有很多同学会手动记录traceId，比如：

```java
log.info("traceId={}, blah blah blah", Span.current().getSpanContext().getTraceId());
```

其实OpenTelemetry[12]已经自动将traceId加到了MDC，对应的Key是trace_id，使用%mdc{trace_id}（参考【第三篇五、MDC】节）即可打印出traceId。比如我们在【2.1 springProperty和property】一节的示例中，就使用了这个Key。

## 六、后记

以上只是简单介绍了Logback的常用功能，如需进一步了解可以参考官方文档Logback documentation[13]。特别是其中很多例子是结合Slf4j一起介绍的，非常易懂。

## 参考链接：
[1]https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.logging.logback

[2]https://logback.qos.ch/manual/configuration.html#variableSubstitution

[3]https://logback.qos.ch/manual/appenders.html

[4]https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles

[5]https://logback.qos.ch/manual/layouts.html#conversionWord

[6]https://www.iso.org/iso-8601-date-and-time-format.html

[7]https://logback.qos.ch/manual/layouts.html#formatModifiers

[8]https://logback.qos.ch/apidocs/index.html

[9]https://logback.qos.ch/apidocs/ch/qos/logback/classic/pattern/MessageConverter.html

[10]https://logback.qos.ch/apidocs/ch/qos/logback/classic/LoggerContext.html

[11]https://logback.qos.ch/apidocs/ch/qos/logback/classic/Logger.html

[12]https://www.aliyun.com/product/xtrace

[13]https://logback.qos.ch/documentation.html
