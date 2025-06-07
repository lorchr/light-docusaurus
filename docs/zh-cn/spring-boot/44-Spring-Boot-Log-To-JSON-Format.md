**参考链接：**

*   [以 JSON 格式获取日志输出](https://www.baeldung.com/java-log-json-output)
*   [Logback官网 - 输出日志格式](https://logback.qos.ch/manual/layouts.html)
*   [Log4j 官网 - 输出日志格式](https://logging.apache.org/log4j/2.x/manual/layouts.html#JSONLayout)
*   [Log4j 官网 - Pattern 属性说明](https://logging.apache.org/log4j/2.x/manual/pattern-layout.html#converters)
*   [通过 logstash-logback-encoder 设置 logback 输出 json 格式日志](https://www.haibakeji.com/archives/931.html)
*   [在 Spring Boot 中配置 logback 输出 json 格式日志](https://blog.csdn.net/qq_38046739/article/details/120324838)
*   [设置 logback 打印日志为 json 串](https://blog.csdn.net/u010953880/article/details/113736340)
*   [关于 log4j2 生成 json 格式日志](https://blog.csdn.net/caolist/article/details/89330735)
*   [如何让 promtail 解析 JSON 日志到标签和时间戳](https://stackoverflow.com/questions/58564836/how-to-promtail-parse-json-to-label-and-timestamp)

## 1. 简介
如今，大多数 Java 日志库都提供不同的布局（layout）选项来格式化日志——以精确满足每个项目的需求。

在本快速教程中，我们希望将日志条目格式化为 JSON 并输出。我们将了解如何在两个最广泛使用的日志库中实现这一点：[Log4j2](https://www.baeldung.com/log4j2-appenders-layouts-filters) 和 [Logback](https://www.baeldung.com/custom-logback-appender)。

两者在内部都使用 [Jackson](https://www.baeldung.com/java-json#jackson) 库以 JSON 格式表示日志。

有关这些库的介绍，请参阅我们的 [Java 日志介绍文章](https://www.baeldung.com/java-logging-intro)。

## 2. Log4j2
Log4j2 是 Java 最流行的日志库 Log4j 的直接继任者。

作为 Java 项目的新标准，我们将展示如何配置它以输出 JSON。

### 2.1. Maven 依赖
首先，我们需要在 `pom.xml` 文件中包含以下依赖项：

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-core</artifactId>
        <version>2.19.0</version>
    </dependency>
    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-api</artifactId>
        <version>2.19.0</version>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.17.2</version>
    </dependency>
</dependencies>
```

上述依赖项的最新版本可以在 Maven Central 找到：[log4j-api](https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-api), [log4j-core](https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-core), [jackson-databind](https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind)。

### 2.2. 使用 JsonLayout
然后，在我们的 `log4j2.xml` 文件中，**我们可以创建一个使用 `JsonLayout` 的新 Appender（附加器），以及一个使用此 Appender 的新 Logger（记录器）：**

```xml
<Appenders>
    <Console name="ConsoleJSONAppender" target="SYSTEM_OUT">
        <JsonLayout complete="false" compact="false">
            <KeyValuePair key="myCustomField" value="myCustomValue"/>
        </JsonLayout>
    </Console>
</Appenders>

<Logger name="CONSOLE_JSON_APPENDER" level="TRACE" additivity="false">
    <AppenderRef ref="ConsoleJSONAppender"/>
</Logger>
```

如示例配置所示，可以使用 `KeyValuePair` 将自己的值添加到日志中，它甚至支持查看日志上下文。

将 `compact` 参数设置为 `false` 会增加输出的大小并使其更易于人类阅读。

现在，让我们测试我们的配置。在我们的代码中，可以实例化新的 JSON 记录器并进行新的调试级别跟踪：

```java
Logger logger = LogManager.getLogger("CONSOLE_JSON_APPENDER");
logger.debug("Debug message");
```

上述代码的调试输出消息将是：

```json
{
  "instant" : {
    "epochSecond" : 1696419692,
    "nanoOfSecond" : 479118362
  },
  "thread" : "main",
  "level" : "DEBUG",
  "loggerName" : "CONSOLE_JSON_APPENDER",
  "message" : "Debug message",
  "endOfBatch" : false,
  "loggerFqcn" : "org.apache.logging.log4j.spi.AbstractLogger",
  "threadId" : 1,
  "threadPriority" : 5,
  "myCustomField" : "myCustomValue"
}
```

### 2.3. 使用 JsonTemplateLayout
在上一节中，我们看到了如何使用 `JsonLayout` 属性。从版本 2.14.0 开始，该属性已被弃用，并由 `JsonTemplateLayout` 取代。

**`JsonTemplateLayout` 提供了增强的功能和更高的效率，因为默认情况下它经过优化，可以尽可能快地编码日志事件。**

此外，它支持无垃圾（garbage-free）日志记录，这带来了一些性能优势，因为垃圾收集器停顿可能会影响性能。要启用无垃圾日志记录，我们需要将 `log4j2.garbagefreeThreadContextMap` 和 `log4j2.enableThreadLocals` 属性设置为 `true`：

```shell
-Dlog4j2.garbagefreeThreadContextMap=true
-Dlog4j2.enableThreadlocals=true
```

要使用 `JsonTemplateLayout`，让我们将 [log4j-layout-template-json](https://mvnrepository.com/artifact/org.apache.logging.log4j/log4j-layout-template-json) 依赖项添加到 `pom.xml`：

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-layout-template-json</artifactId>
    <version>2.24.3</version>
</dependency>
```

接下来，让我们修改我们的 Appender 以使用 `JsonTemplateLayout`：

```xml
<Appenders>
    <Console name="ConsoleJSONAppender" target="SYSTEM_OUT">
        <JsonTemplateLayout eventTemplateUri="classpath:JsonLayout.json">
            <EventTemplateAdditionalField key="myCustomField" value="myCustomValue"/>
        </JsonTemplateLayout>
    </Console>
</Appenders>
```

在这里，我们使用 `JsonTemplateLayout` 并通过 `eventTemplateUri` 指定 JSON 布局格式。 `eventTemplateUri` 定义了 JSON 输出的格式。当未指定 `eventTemplateUri` 时，默认使用 Elastic Common Schema (ECS) 格式 (`classpath:EcsLayout.json`)。

其他支持的模板包括 [Graylog 扩展日志格式 (GELF)](https://www.baeldung.com/graylog-with-spring-boot) ，其值为 `classpath:GelfLayout.json`。

`JsonLayout.json` 模板旨在轻松地从 `JsonLayout` 过渡到 `JsonTemplateLayout`。在我们的例子中，我们使用 `JsonLayout.json` 来保持上一节示例中的初始格式：

```json
{
  "instant": {
    "epochSecond": 1736320992,
    "nanoOfSecond": 804274875
  },
  "thread": "main",
  "level": "DEBUG",
  "loggerName": "CONSOLE_JSON_APPENDER",
  "message": "Debug message",
  "endOfBatch": false,
  "loggerFqcn": "org.apache.logging.log4j.spi.AbstractLogger",
  "threadId": 1,
  "threadPriority": 5,
  "myCustomField": "myCustomValue"
}
```

与使用 `KeyValuePair` 属性添加自定义键值对的 `JsonLayout` 不同，我们使用名为 `EventTemplateAdditionalField` 的属性来添加键和值。

## 3. Logback
Logback 可以被视为 Log4j 的另一个继任者。它由相同的开发人员编写，并声称比其前身更高效、更快。

那么，让我们看看如何配置它以 JSON 格式输出日志。

### 3.1. Maven 依赖

让我们在 `pom.xml` 中包含以下依赖项：

```xml
<dependencies>
    <dependency>
        <groupId>ch.qos.logback</groupId>
        <artifactId>logback-classic</artifactId>
        <version>1.4.8</version>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback.contrib</groupId>
        <artifactId>logback-json-classic</artifactId>
        <version>0.1.5</version>
    </dependency>
    <dependency>
        <groupId>ch.qos.logback.contrib</groupId>
        <artifactId>logback-jackson</artifactId>
        <version>0.1.5</version>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.15.2</version>
    </dependency>
</dependencies>
```

我们可以在这里检查这些依赖项的最新版本：[logback-classic](https://mvnrepository.com/artifact/ch.qos.logback/logback-classic), [logback-json-classic](https://mvnrepository.com/artifact/ch.qos.logback.contrib/logback-json-classic), [logback-jackson](https://mvnrepository.com/artifact/ch.qos.logback.contrib/logback-jackson), [jackson-databind](https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind)。

### 3.2. 使用 JsonLayout

首先，**我们在 `logback-test.xml` 中创建一个新的 appender（附加器），它使用 `JsonLayout` 和 `JacksonJsonFormatter`。**

之后，我们可以创建一个使用此 appender 的新 logger（记录器）：

```xml
<appender name="json" class="ch.qos.logback.core.ConsoleAppender">
    <layout class="ch.qos.logback.contrib.json.classic.JsonLayout">
        <jsonFormatter
            class="ch.qos.logback.contrib.jackson.JacksonJsonFormatter">
            <prettyPrint>true</prettyPrint>
        </jsonFormatter>
        <timestampFormat>yyyy-MM-dd' 'HH:mm:ss.SSS</timestampFormat>
    </layout>
</appender>

<logger name="jsonLogger" level="TRACE">
    <appender-ref ref="json" />
</logger>
```

如我们所见，启用了 `prettyPrint` 参数以获得人类可读的 JSON。

为了测试我们的配置，让我们在代码中实例化记录器并记录一条调试消息：

```java
Logger logger = LoggerFactory.getLogger("jsonLogger");
logger.debug("Debug message");
```

执行后，我们将获得以下输出：

```json
{
    "timestamp":"2017-12-14 23:36:22.305",
    "level":"DEBUG",
    "thread":"main",
    "logger":"jsonLogger",
    "message":"Debug message",
    "context":"default"
}
```

### 3.3. 使用 JsonEncoder
另一种以 JSON 格式记录输出的方法是使用 [JsonEncoder](https://logback.qos.ch/manual/encoders.html#JsonEncoder)。它将日志记录事件转换为有效的 JSON 文本。

让我们添加一个使用 `JsonEncoder` 的新 appender，以及一个使用此 appender 的新 logger：

```xml
<appender name="jsonEncoder" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="ch.qos.logback.classic.encoder.JsonEncoder"/>
</appender>

<logger name="jsonEncoderLogger" level="TRACE">
    <appender-ref ref="jsonEncoder" />
</logger>
```

现在，让我们实例化记录器并调用 `debug()` 来生成日志消息：

```java
Logger logger = LoggerFactory.getLogger("jsonEncoderLogger");
logger.debug("Debug message");
```

执行此代码后，我们得到以下输出：
```json
{
    "sequenceNumber":0,
    "timestamp":1696689301574,
    "nanoseconds":574716015,
    "level":"DEBUG",
    "threadName":"main",
    "loggerName":"jsonEncoderLogger",
    "context":
        {
            "name":"default",
            "birthdate":1696689301038,
            "properties":{}
        },
    "mdc": {},
    "message":"Debug message",
    "throwable":null
}
```

这里，`message` 字段代表日志消息。此外，`context` 字段显示日志记录上下文。通常为 `default`，除非我们设置了多个日志记录上下文。

## 4. 使用 Logstash 的 Logback

这个库是 Logstash 生态系统的一部分，功能更强大，支持 ELK、结构化日志等。

> **需要注意：logstash-logback-encoder 7.4 仅适配 logback 1.3.x，暂不支持 logback 1.2.x。如果您的项目使用的是 logback 1.2.x，需要使用 logstash-logback-encoder 6.6 版本或者将 logback 升级到 1.3.x 版本。**
详情参考以下文章：[https://www.haibakeji.com/archives/932.html](https://www.haibakeji.com/archives/932.html)

### 4.1 添加 Maven 依赖

```xml
<dependency>
    <groupId>net.logstash.logback</groupId>
    <artifactId>logstash-logback-encoder</artifactId>
    <version>7.4</version>
</dependency>
```

### 4.2 配置 logback.xml

```xml
<configuration>
    <appender name="JSON_CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>

    <appender name="JSON_FILE" class="ch.qos.logback.core.FileAppender">
        <file>logs/app.json</file>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>

    <root level="info">
        <appender-ref ref="JSON_CONSOLE"/>
        <appender-ref ref="JSON_FILE"/>
    </root>
</configuration>
```

### 4.3 示例 JSON 日志输出

日志会以 JSON 格式打印：

```json
{
  "@timestamp": "2024-02-11T12:34:56.789Z",
  "@version": "1",
  "message": "User logged in",
  "logger_name": "com.example.MyService",
  "thread_name": "main",
  "level": "INFO",
  "level_value": 20000
}
```

### 4.4 方法对比

| 方法                     | 适用场景                 | 依赖复杂度 | 特点                     |
|--------------------------|--------------------------|------------|--------------------------|
| `logback-json-classic`   | 适用于基本 JSON 结构日志 | 轻量级     | 适合本地日志存储         |
| `logstash-logback-encoder` | 适用于 ELK、结构化日志   | 功能更强大 | 支持更多 JSON 格式化功能 |

**总结：** 如果你只是想要 JSON 格式日志，可以用 `logback-json-classic`；如果你的日志要对接 ELK 栈，建议用 `logstash-logback-encoder`。

## 5. 结论
在本文中，我们了解了如何轻松配置 Log4j2 和 Logback 以获得 JSON 输出格式。我们将解析的所有复杂性委托给了日志记录库，因此我们无需更改任何现有的日志记录器调用。

支持本文的代码可在 GitHub 上找到。一旦您以 [Baeldung Pro 会员](https://www.baeldung.com/members/)身份登录，即可开始在项目上学习和编码。
