[MQTT学习笔记](https://zhuanlan.zhihu.com/p/598443934)

## 一、Introduction
发明于 1999 年，为物联网设计的轻量级 Pub/Sub 协议，基于 TCP，支持三种消息语义。

在 2019 年 3 月，公布 v5 标准。 一个趣闻是因为 MQTT 使用单字节来表示协议版本，3 代表 v3.1，4 被用于代表 v3.1.1，所以 v3 的下一版直接就是 MQTT v5 了。

服务器称为 broker，客户端连接到 broker 后，可以往 topic pub/sub 消息。 每个 client 可以申请一个 buffer queue，缓冲一定数量的消息，以防止丢失。

MQTT 规范主要包括的内容有：
- pub/sub
- QoS
- Retained Messages
- Persistent Session
- Last Will
- KeepAlive

References:

- [http://mqtt.org/](http://mqtt.org/)
- [MQTT Version 3.1.1 OASIS Standard](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
- [MQTT Version 5.0 OASIS Standard](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
- [AWS MQTT](https://docs.aws.amazon.com/iot/latest/developerguide/mqtt.html)
- [HiveMQ Essentials](https://www.hivemq.com/mqtt-essentials/)
- [HiveMQ MQTT5 Essentials](https://www.hivemq.com/mqtt-5/)
- [IBM: MQTT 简介](https://www.hivemq.com/mqtt-essentials/)
- [Differences between 3.1.1 and 5.0](https://github.com/mqtt/mqtt.org/wiki/Differences-between-3.1.1-and-5.0)

## 二、Concepts
### 1、Data Types
- Bit
- Two Byte Integer
- Four Byte Integer
- UTF-8 Encoded String
- Variable Byte Integer
- Binary Data

v5 增加的数据类型有：

- UTF-8 String Pair: 用于自定义 headers。

### 2、QoS
mqtt 中有两个通讯步骤需要设置 QoS：

- client 向 broker 发布消息时；
- client 向 broker 订阅时 topic 时，指定的是 broker 向 client 下发消息的 QoS。

```shell
ClientA -> Broker -> ClientB
```
上述过程中，就分别有两个 QoS，如果 publish with QoS 2，subscribe with QoS 1， 那么即使 ClientA 只给 broker 发送了一次消息， ClientB 也有可能收到多条。

Quality of Service。可设置为：
- 0: at most once
- 1: at least once
- 2: exactly once

#### at most once
也称为 `fire and forget`，只管发送，不需要响应。

网络条件极好，且可以接受少量数据丢失时，该方案是性能最高的方案。

#### at least once
消息发送后，依然将消息存放于本地缓存中，直到收到 PUBACK 的回执，才能确定消息已经送达。

![img](https://pic4.zhimg.com/80/v2-032c455f8b05bf8aa6483d99157efa53_720w.webp)

要求数据绝对不能丢失，但是可以接受部分重复时，可以使用该方案，性能尚可。

#### exactly once
和 `at least once` 相比，发送方不但需要接收方确认， 而且发布方还会和接收方关于“双方确认”多进行一轮交互。 所以一共有两个 RTT。

![img](https://pic3.zhimg.com/80/v2-e597a99131bdaf6b8e1c6dda7112e60e_720w.webp)

发送消息，接收方返回回执：

![img](https://pic3.zhimg.com/80/v2-72292b2e2e840df5271059d3cda6a7ca_720w.webp)

如果发送方一直没有收到 pubrec，那么就会设置消息的 DUP 字段，并重传消息。

发送方收到 pubrec 回执后，可以删除缓存的消息。 然后缓存 pubrec，并发送 pubrel，通知接收方，已收到 pubrec 包。

![img](https://pic1.zhimg.com/80/v2-ee13e0d5e8ff4724e87bf0b7d46d44c8_720w.webp)

当接收方收到 pubrel 包后，就知道发送方已经知道接收方已经成功接收了消息， 所以接收方可以删除所有和该消息相关的状态信息，这些状态信息本来是用来防止消息重传的。

然后接收方返回 pubcomp：

![img](https://pic1.zhimg.com/80/v2-2e23c34121646a512c0e5373b0f48810_720w.webp)

发送方收到 pubcomp 后，就知道本次交互的 pcketId 已经可以回收。

该方案是性能最差的方案。 负载较大时不建议使用该方案。而是改由业务逻辑层处理去重。

#### Retransmit
`v3.1.1` 中，QoS 1、2 都会尝试重传消息。

但其实 TCP 本身就有重传机制，而 MQTT 作为 7 层协议，再次重传的话只会无谓的增加 TCP 的负担。

其实 MQTT 只需要在 TCP 断开重连后再介入重传。 所以在 v5 中，只要 TCP 依然健康，QoS 1、2 就不会再重传。

### 3、Persistent Session
持久会话。

为了防止网络波动导致客户端和服务端频繁重新建立会话， client 可以选择和 broker 建立持久会话，broker 会为 client 保存如下信息：

- 会话。
- 客户端的订阅信息。
- QoS 为 1、2 的所有未消费（包含未确认和未接收）的消息。

相应的，客户端也需要保存如下信息：

- QoS 为 1、2 的所有未被服务端确认的消息。
- QoS 为 2 的，从服务端收取但是尚未完全回复确认的消息。

#### v3

![img](https://pic3.zhimg.com/80/v2-469070e165b5cad0dc1d9a797c69b796_720w.webp)

在 MQTT 3 中，client 通过 `cleanSession=False` 来建立持久会话。 服务端在响应 CONNACK 时，通过 `sessionPresent` 来告知 `client` 是否有持久会话。 持久会话的过期时间取决于操作系统的内存和具体的配置。

#### v5
但是在 MQTT 5 中，client 在连接时通过设置 `session expiry interval`（秒） 来指定 `session` 的生命周期。 如果设置为 0，则 `session` 会在 `client` 离线时被立刻删除。最大可以设置为 `UINT_MAX(4,294,967,295)`。

client 在连接时还可以设置 `clean start flag` 来标记是否需要立刻清除过去的持久会话。

![img](https://pic4.zhimg.com/80/v2-5fa76787d19b92e2fb9a2cb61110f083_720w.webp)

同理，也可以设置 broker 保存历史消息的最大时长。 client 在 publish 时可以设置消息的 `message expiry interval`(秒)，只有当该值为空或 0 时，broker 才会无限期的保存历史消息。该设置对 tained message 同样有效。

消息的自动过期让 broker 可以分别对待不同级别的消息，比如对重要的消息长期存储，而对于不太重要的通知消息则短期存储。

需要注意的是，当会话过期时，broker 为该会话保存的所有 messages queue 都会被清除。

### 4、Retained Message
保留消息。

这是一种特殊的消息，broker 会为每一个 topic 保留一个 `retained` 消息。 当订阅了该 topic 的 client 上线后，立刻就会收到该 topic 的保留消息。

client 通过 `retainFlag=1` 来发送保留消息。 可以通过发送空保留消息的方式来删除该 topic 的保留消息。

可以把保留消息理解为 topic 的最终状态。

### 5、Last Will and Testament
遗言。

因为 MQTT 常用于不稳定的网络之中，所以 client 会经常性的离线， 遗言提供了一种方式来让其他 client 鉴别某个 client 是主动离线还是意外离线。

client 在连接到 broker 时可以设立自己的遗言（LWT），详见后文 CONNECT 一节。 LWT 本质上是一条普通的消息，所以也可以设置 topic、QoS、payload 和 retain。

当 client 意外离线（ungracefully disconnected）时，broker 会将 LWT 发送给所有的订阅者。 如果 client 是主动离线，则 broker 会删除存储的 LWT。

MQTT 3.1.1 种定义了触发 LWT 的几种情形：

- broker 发现 I/O 异常或网络异常。
- client 的 keep alive 超时。
- client 的网络中断，但是没有发送 DISCONNECT 包。
- protocol error。

#### 实践
LWT 通常和 Retained 消息合用来设置 client 的状态。

比如，当 client 连接时，设置 LWT 为 `Offline(retained=1)`， 然后发送一条保留消息，对同一个 topic 设置为 `Online`。 这样 topic 的状态就被标记为 `Online`， 而当 client 意外下线时，该 topic 会被 LWT 更新为 `Offline`。

### 6、Keep Alive
MQTT 是基于 TCP 的，所以依赖于 TCP 的可靠性。

但是 TCP 存在 [half-open](https://en.wikipedia.org/wiki/TCP_half-open) 问题， 也就是有可能有一端已经挂掉了，但是另一端却没有收到任何通知，依然保持着连接。 为了避免这一问题，就需要周期性地 heartbeat。

服务端会记录 client 最近一次联系的时间，当超过一定的阈值后，就会认为 client 已经失联。 允许的最长间隔为 18h 12min 15sec。 如果 timeout 设置为 0，则关闭了 keep alive 功能。

client 如果没有向 broker 发送其他数据包（如 publish、subscribe）， 那么 client 应该向服务端发送 PINGREQ，表明自己依然活着。 client 可以在任何时候发送这个包。

![img](https://pic3.zhimg.com/80/v2-41e3b267944fdf0b71a06398c94ecbe2_720w.webp)

服务端在收到 PINGREQ 后，应该立刻答复 PINGRESP：

![img](https://pic2.zhimg.com/80/v2-63a2058ce2211c3b05b9be9cbec8a6e1_720w.webp)

#### Client Take-Over
当 client 重新连接到 broker 后，broker 很可能依然保持着之前的 half-open 连接， 此时 broker 应该识别出同一 client 的多个连接，并且关闭之前的连接。 这一过程就被称为 client take-over。

### 7、User Properties
在 v5 中，MQTT 允许用户设置自定义的消息头。 headers 的数据类型为 UTF-8 String Pair。

这一特性为 MQTT 的消息提供了近乎无限的可扩展性。

常见的使用场景包括：

- 标记 payload 的编码方式。
- 用于应用层的路由等逻辑处理。
- 分布式追踪。

### 8、Reason code
> new in v5
所有的应答中，都可以包含 `reason code` 和 `reason string`。 用于通知对方本次请求是否被接受及其原因。

包括：

- CONNACK
- PUBACK
- PUBREC
- PUBREL
- PUBCOMP
- SUBACK
- UNSUBACK
- DISCONNECT
- AUTH

（本文中关于各个包协议的图示都是 v3.1.1 的，所以其中都没有标记 reason code。）

### 9、Payload Format Indicator
> new in v5
设定消息中 payload 的编码格式，可以设置的值为：

- 0(default): 未知格式的 bytes。
- 1: UTF-8。

## 三、Connection
### 1、Client Connection
client 向 broker 发起连接请求。

![img](https://pic4.zhimg.com/80/v2-56900db4bb1be5b2f8929713fb4a1d07_720w.webp)

#### username
v3.1.1 中，如果指定了 password，那就必须同时指定 username。

v5 中，可以省略 username，只传 password。

#### clientId
用于让 broker 维持 client 的 ID。如果不需要状态，该字段可以留空， 当 ClientId 为空时，`cleanSession` 必须为 `true`。

#### Clean Session
> v3.1.1
当 `cleanSession=false` 时，broker 会持久化该会话，也就是会保留 client 的状态， 并且建立一个存储未消费信息的 buffer（具体行为依赖于 QoS 的设置）。

在 v5 中，该字段被 `clean start` 和 `session expiry` 替换。

#### Clean Start
> new in v5
client 在连接时，可以指定 `cleanStart=1` 来通知 broker 清除所有过去的持久会话数据。

#### Will Message
这是 EMQTT `Last Will and Testament(LWT)` 规范的一部分， 连接的时候通过指定 last will，在 client 非正常断开连接后，会由 broker 向其他 clients 发送 last will。

#### KeepAlive
设置 heartbeat timeout seconds。

### 2、Server Connack
broker 响应 client 的连接请求。

![img](https://pic1.zhimg.com/80/v2-c1d897ce6a9a9eda6c7f5a242d2eea0c_720w.webp)

MQTT v5 支持非完成版的 broker（也就是说可能只实现了 MQTT 的部分功能），broker 应该在 CONNACK 中使用自定义 headers 告知 client 有哪些功能没有实现：

| Pre-Defined Header                 | Data Type | Description                                                                                   |
| ---------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| Retain Available                   | Boolean   | Are retained messages available?                                                              |
| Maximum QoS                        | Number    | The maximum QoS the client is allowed to use for publishing messages or subscribing to topics |
| Wildcard available                 | Boolean   | If Wildcards can be used for topic subscriptions                                              |
| Subscription identifiers available | Boolean   | If Subscription Identifiers are available for the MQTT client                                 |
| Shared Subscriptions available     | Boolean   | If Shared Subscriptions are available for the MQTT client                                     |
| Maximum Message Size               | Number    | Defines the maximum message size a MQTT client can use                                        |
| Server Keep Alive                  | Number    | The Keep Alive Interval the server supports for the individual client                         |

client 需要根据 CONNACK 的返回来决定自己要使用的功能。

#### Session Present flag
通知客户端，服务端是否已经有以持久化的 session。

#### Connect acknowledge flag
状态码：

- 0：成功
- 1：unacceptable protocol version
- 2：identifier rejected
- 3：server unavailable
- 4：bad user name or password
- 5：not authorized

### 3、Auth
> new in v5
client 和 broker 在连接建立成功以后，可以通过 Auth 包来进行认证。

[Advanced Authentication Mechanisms - MQTT Security Fundamentals](https://www.hivemq.com/blog/mqtt-security-fundamentals-advanced-authentication-mechanisms/)

### 4、DISCONNECT
v3.1.1 中，只能有 client 通过发送 DISCONNECT 来断开连接。

v5 中，broker 也可以发送 DISCONNECT 来断开连接，而且可以选择携带 Reason Codes 来说明原因。

## 四、Pub/Sub
Pub/Sub 模式提供了端与端之间的解耦：

- Space decoupling：端与端不需要互相感知
- Time decoupling：异步响应
- Synchronization decoupling：异步处理
Pub/Sub 发生在 Connect 以后。客户端发送的每一个消息都必须带上 topic。

### 1、Publish
客户端向 broker 推送消息。

![img](https://pic3.zhimg.com/80/v2-0c564ed50180ce18e94613b3f0eafcf6_720w.webp)

#### Topic Name
以字符串表示的 topic，可以用 / 表示层级关系。形如 home/livingroot/temperature。

#### QoS
设定该消息从 client 到 broker 的 QoS。

#### Retain Flag
retain message 是一种特殊的消息，标识着一种 tag 的状态。

服务端会为每一个 topic 保留一个 retain message。 每当一个 client 订阅一个 topic 时，就会收到最新的 retain message。

#### Payload
数据负载

#### Packet Identifier
用于当 QoS 大于 0 时。

每一条消息的唯一标识，用于 QoS，一般来说应该有客户端的 SDK 来负责生成。

#### DUP flag
用于当 QoS 大于 0 时。

表明这是一条重复消息，一般由 SDK 生成。

### 2、Subscribe
客户端向 broker 发送 [SUBSCRIBE](http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718063) 消息来订阅 topic。

![img](https://pic3.zhimg.com/80/v2-34de999166a6ade11d1a4f549b96b1e2_720w.webp)

#### Packet Identifier
用来标记本次请求的唯一序号

#### List of Subscriptions
订阅 topic & QoS 的列表。如果订阅的 topic 互相之间有重叠，则以 QoS 最高的为准。

### 3、Suback
broker 回应 client 的订阅请求

![img](https://pic4.zhimg.com/80/v2-c92ba64291a1509978396ef8c9f24147_720w.webp)

#### Packet Identifier
标记答复的是哪一条请求

#### Return Code
针对每一个 topic 的订阅请求都会返回一个 return code。内容为：

- 0: 成功，QoS 0
- 1: 成功，QoS 1
- 2: 成功，QoS 2
- 128: 失败

### 4、Unsubscribe
client 告知 broker，停止对某些 topic 的订阅。

![img](https://pic4.zhimg.com/80/v2-79dd5969e1ded0158055ce79f35e4287_720w.webp)

包内容和 Subscribe 几乎一致，不过不需要指定 QoS。

### 5、Unsuback
broker 向 client 确认退订的结果。

在 v5 中，也可用于让 broker 通知 client 订阅失败。 失败的原因会用 reason code 和 string 标记。

![img](https://pic2.zhimg.com/80/v2-20f3ddea6c54f14e3dc087c7d2d9c4b1_720w.webp)


### 6、Shared Subscriptions
> new in v5
类似于 kafka 的 consumer group，用于 client 负载均衡。

一组 client 可以以组的形式订阅 topic，该 topic 内的消息会分别发送给组内的各个 client。 换句话说，组内的每一个 client 都会收到不同的消息。

共享订阅的方式为：`$share/<GROUP_ID>/<TOPIC>`。

对于 broker 而言，每一个 shared group 可以视为一个普通的 client。

**❓TODO：**如果 client 以不同的 QoS 订阅 shared topic，会发生什么？ （aws iot 尚不支持 v5，所以没法测试。）

## 五、Topics
topic 是由 / 分隔的 UTF-8 字符串。 topic 不能为空，且大小写敏感。
```shell
# 这些都是有效 topic

myhome/groundfloor/livingroom/temperature
USA/California/San Francisco/Silicon Valley
5ff4a2ce-e485-40f4-826c-b1a5d81be9b6/status
Germany/Bavaria/car/2382340923453/latitude
```

### 1、Wildcards
在订阅 topic 时，可以使用一些特殊符号来实现一次性订阅多个 topics，这些符号包括：

- +：单级匹配
- #：多级匹配
- $：标识 broker 内建的特殊 topic

#### `+`
单级匹配。`a/b/+/c` 可以匹配：

- a/b/a/c
- a/b/b/c
- a/b/c/c
- a/b/d/c

在 aws iot 上测试，并不会匹配 `a/b/c`。也不会匹配 `a/b/d/d/c`。

#### `#`
多级匹配。只能用于字符串尾部，`a/b/#` 可以匹配：

- a/b/c/d
- a/b/c/d/e
- a/b/c/a
根据在 aws iot 上的测试，`a/b/#` 并不会匹配 `a/b`。

### 2、最佳实践
关于设计 topic 名时的一些建议：

- 不要使用前置斜杠，如 \a\b。
- 不要有空格。
- topic 的名字最好易于理解。
- 只使用 ASCII 字符。
- client publish 的 topic 可以包含其 clientID。
- 不要订阅多级目录 #
- 注意扩展性（今后可能会扩充下级目录）。
- 不要当作通用队列来使用，而应该设定专用性的 topic。
