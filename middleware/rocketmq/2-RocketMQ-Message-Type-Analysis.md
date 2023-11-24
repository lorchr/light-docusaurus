- [1.5万字 + 25张图盘点RocketMQ 11种消息类型，你知道几种？](https://mp.weixin.qq.com/s/ANdlDkPL26Hmqmjt53sSKg)
- [RocketMQ消息短暂而又精彩的一生](https://mp.weixin.qq.com/s/iRCP6hEiKOLEp8QRm_OsWQ)

> 本文是基于RocketMQ 4.9版本讲解

RocketMQ 11种消息类型
- 普通消息
- 批量消息
- 顺序消息
- 重试消息
- 死信消息
- 同步消息
- 延迟消息
- 事务消息
- 请求-应答消息
- 异步消息
- 单向消息

## 前置知识
为了帮助大家更好地理解这些消息底层的实现原理，这里我就通过三个问题来讲一讲RocketMQ最最基本的原理

如果有什么不解的，可以看看我之前写的[RocketMQ消息短暂而又精彩的一生](https://mp.weixin.qq.com/s/iRCP6hEiKOLEp8QRm_OsWQ)这篇文章

## 1、生产者如何发送消息
在RocketMQ中有两个重要的角色

- NameServer：就相当于一个注册中心
- Broker：RocketMQ服务端

当RocketMQ服务端，也就是Broker在启动的时候，会往NameServer注册自己的信息

```mermaid 
graph BT
    A[Broker];
    B[Name Server];

    A -->|注册| B;
```

这些信息其中就包括

- 当前Broker所在机器的ip和端口
- 当前Broker管理的Topic的名称以及每个Topic有几个队列

当生产者和消费者启动的时候，就会从NameServer拉取这些信息，这样生产者和消费者就可以通过NameServer中获取到Broker的ip和端口，跟Broker通信了

而Topic我们也都知道，是消息队列中一个很重要的概念，代表了一类消息的集合

> 在RocketMQ中，每个Topic默认都会有4个队列，并且每个队列都有一个id，默认从0开始，依次递增

```shell
topic
队列 id=0
队列 id=1
队列 id=2
队列 id=3
```

当**生产者发送消息**的时候，就会从消息所在Topic的队列中，根据一定的算法选择一个，然后**携带这个队列的id（queueId）**，再发送给Broker

携带的队列的id就代表了这条消息属于这个队列的

所以从更细化的来说，消息虽然是在Topic底下，但是真正是分布在不同的队列上的，每个队列会有这个Topic下的部分消息。

### 2、消息存在哪
当消息被Broker接收到的时候，Broker会将消息存到本地的磁盘文件中，保证Broker重启之后消息也不丢失

RocketMQ给这个存消息的文件起了一个高大上的名字：`CommitLog`

由于消息会很多，所以为了防止文件过大，`CommitLog`在物理磁盘文件上被分为多个磁盘文件，每个文件默认的固定大小是1G

```mermaid 
graph LR

    A[文件1];
    B[文件2];
    C[文件3];
    D[...];
    E[文件N];

    A --> B --> C--> D --> E;
```

消息在写入到文件时，除了包含消息本身的内容数据，也还会包含其它信息，比如

- 消息的Topic
- 消息所在队列的id，前面提到过
- 消息生产者的ip和端口
- ...

这些数据会和消息本身按照一定的顺序同时写到`CommitLog`文件中

> 上图中黄色排列顺序和实际的存的内容并非实际情况，我只是举个例子

### 3、消费者如何消费消息
#### 消费者是如何拉取消息的
在RocketMQ中，消息的消费单元是以队列来的

所以RocketMQ为了方便快速的查找和消费消息，会为每个Topic的每个队列也单独创建一个文件

RocketMQ给这个文件也起了一个高大上的名字：`ConsumeQueue`

当消息被存到`CommitLog`之后，其实还会往这条消息所在队列的`ConsumeQueue`文件中插一条数据

每个队列的`ConsumeQueue`也是由多个文件组成，每个文件默认是存30万条数据

插入`ConsumeQueue`中的每条数据由20个字节组成，包含3部分信息

- 消息在CommitLog的起始位置（8个字节）
- 消息在CommitLog存储的长度（8个字节）
- 消息tag的hashCode（4个字节）

每条数据也有自己的编号（offset），默认从0开始，依次递增

当消费者拉取消息的时候，会告诉服务端自己`消费哪个队列（queueId）`，`哪个位置的消息（offset）的消息`

服务端接收到消息之后，会找到`queueId`对应的`ConsumeQueue`，然后找到`offset`位置的数据，最后根据这条数据到`CommitLog`文件查找真正的消息内容

所以，从这可以看出，`ConsumeQueue`其实就相当于是一个索引文件，方便我们快速查找在`CommitLog`中的消息

所以，记住下面这个非常重要的结论，有助于后面的文章内容的理解

> 要想查找到某个Topic下的消息，那么一定是先找这个Topic队列对应的ConsumeQueue，之后再通过ConsumeQueue中的数据去CommitLog文件查找真正的消息内容

#### 消费者组和消费模式
在RocketMQ，消费者是有个消费者组的概念，在启动消费者的时候会指定该消费者属于哪个消费者组。
```java
//创建一个消费者，指定消费者组的名称为sanyouConsumer
DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("sanyouConsumer");
```

一个消费者组中可以有多个消费者，不同消费者组之间消费消息是互不干扰的

在同一个消费者组中，消息消费有两种模式
- 集群模式
- 广播模式

同一条消息在同一个消费者组底下只会被消费一次，这就叫集群模式

集群消费的实现就是将队列按照一定的算法分配给消费者，默认是按照平均分配的

图片
广播模式刚好相反，同一条消息能被同一个消费者组底下所有的消费者消费一次

图片
RocketMQ默认是集群模式，如果你想用广播模式，只需设置一下即可
```java
consumer.setMessageModel(MessageModel.BROADCASTING);
```

好了，到这就讲完了前置知识，这些前置知识后面或多或少都有提到

如果你觉得看的不过瘾，更详细的文章奉上[RocketMQ消息短暂而又精彩的一生](https://mp.weixin.qq.com/s/iRCP6hEiKOLEp8QRm_OsWQ)

## 普通消息
普通消息其实就很简单，如下面代码所示，就是发送一条普通的消息
```java
public class Producer {
    public static void main(String[] args) throws Exception {
        //创建一个生产者，指定生产者组为 sanyouProducer
        DefaultMQProducer producer = new DefaultMQProducer("sanyouProducer");
        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.200.143:9876");
        // 启动生产者
        producer.start();

        //创建一条消息 topic为 sanyouTopic 消息内容为 三友的java日记
        Message msg = new Message("sanyouTopic", "三友的java日记".getBytes(RemotingHelper.DEFAULT_CHARSET));
        // 发送消息并得到消息的发送结果，然后打印
        SendResult sendResult = producer.send(msg);
        System.out.printf("%s%n", sendResult);

        // 关闭生产者
        producer.shutdown();
    }

}
```

构建的消息的topic为`sanyouTopic`，内容为`三友的java日记`，这就是一条很普通的消息

## 批量消息
批量消息从名字也可以看出来，就是将多个消息同时发过去，减少网络请求的次数
```java
public class Producer {
    public static void main(String[] args) throws Exception {
        //创建一个生产者，指定生产者组为 sanyouProducer
        DefaultMQProducer producer = new DefaultMQProducer("sanyouProducer");
        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.200.143:9876");
        // 启动生产者
        producer.start();

        //用以及集合保存多个消息
        List<Message> messages = new ArrayList<>();
        messages.add(new Message("sanyouTopic", "三友的java日记 0".getBytes()));
        messages.add(new Message("sanyouTopic", "三友的java日记 1".getBytes()));
        messages.add(new Message("sanyouTopic", "三友的java日记 2".getBytes()));
        // 发送消息并得到消息的发送结果，然后打印
        SendResult sendResult = producer.send(messages);
        System.out.printf("%s%n", sendResult);

        // 关闭生产者
        producer.shutdown();
    }

}
```
多个普通消息同时发送，这就是批量消息

不过在使用批量消息的时候，需要注意以下两点

- 每条消息的Topic必须都得是一样的
- 不支持延迟消息和事务消息

普通消息和批量消息比较简单，没有复杂的逻辑，就是将消息发送过去，在`ConsumeQueue`和`CommitLog`存上对应的数据就可以了

## 顺序消息
所谓的顺序消息就是指

> 生产者发送消息的顺序跟消费者消费消息的顺序是一致的

RocketMQ可以保证同一个队列的消息绝对顺序，**先进入队列的消息会先被消费者拉取到**，但是无法保证一个Topic内消息的绝对顺序

所以要想通过RocketMQ实现顺序消费，需要保证两点

- 生产者将需要保证顺序的消息发送到同一个队列
- 消费者按照顺序消费拉取到的消息

那么，第一个问题，如何消息发送到同一个队列

前面有提到，RocketMQ发送消息的时候会选择一个队列进行发送

而RocketMQ默认是通过`轮询算法`来选择队列的，这就无法保证需要顺序消费的消息会存到同一个队列底下

所以，默认情况下是不行了，我们需要自定义队列的选择算法，才能保证消息都在同一个队列中

RocketMQ提供了自定义队列选择的接口`MessageQueueSelector`

比如我们可以实现这个接口，保证相同订单id的消息都选择同一个队列，在消息发送的时候指定一下就可以了
```java
SendResult sendResult = producer.send(msg, new MessageQueueSelector() {
    @Override
    public MessageQueue select(List<MessageQueue> mqs, Message msg, Object arg) {
        //可以根据业务的id从mqs中选择一个队列
        return null;
    }
}, new Object());
```

保证消息顺序发送之后，第二个问题，消费者怎么按照顺序消费拉取到的消息？

这个问题RocketMQ已经考虑到了，看看RocketMQ多么地贴心

RocketMQ在消费消息的时候，提供了两种方式：

- 并发消费
- 顺序消费

并发消费，**多个线程同时处理同一个队列拉取到的消息**

顺序消费，**同一时间只有一个线程会处理同一个队列拉取到的消息**

至于是并发消费还是顺序消费，需要我们自己去指定

对于顺序处理，只需要实现`MessageListenerOrderly`接口，处理消息就可以了
```java
public class Consumer {
    public static void main(String[] args) throws InterruptedException, MQClientException {

        // 创建一个消费者
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("sanyouConsumer");
        // 指定NameServer的地址
        consumer.setNamesrvAddr("192.168.200.143:9876");

        // 订阅sanyouTopic这个topic下的所有的消息
        consumer.subscribe("sanyouTopic", "*");
        // 注册一个消费的监听器，当有消息的时候，会回调这个监听器来消费消息
        consumer.registerMessageListener(new MessageListenerOrderly() {
            @Override
            public ConsumeOrderlyStatus consumeMessage(List<MessageExt> msgs, ConsumeOrderlyContext context) {
                for (MessageExt msg : msgs) {
                    System.out.printf("消费消息:%s", new String(msg.getBody()) + "\n");
                }

                return ConsumeOrderlyStatus.SUCCESS;
            }
        });

        // 启动消费者
        consumer.start();

        System.out.printf("Consumer Started.%n");
    }
}
```

如果想并发消费，换成实现`MessageListenerConcurrently`即可

到这你可能会有一个疑问

> 并发消费和顺序消费跟前面提到的集群消费和广播消费有什么区别？

集群消费和广播消费指的是一个消费者组里的每个消费者是去拉取全部队列的消息还是部分队列的消息，也就是选择需要拉取的队列

而并发和顺序消费的意思是，是对已经拉到的同一个队列的消息，是并发处理还是按照消息的顺序去处理

## 延迟消息
延迟消息就是指生产者发送消息之后，消息不会立马被消费，而是等待一定的时间之后再被消息

RocketMQ的延迟消息用起来非常简单，只需要在创建消息的时候指定延迟级别，之后这条消息就成为延迟消息了
```java
Message message = new Message("sanyouTopic", "三友的java日记 0".getBytes());
//延迟级别
message.setDelayTimeLevel(1);
```

虽然用起来简单，但是背后的实现原理还是有点意思，我们接着往下看

RocketMQ延迟消息的延迟时间默认有18个级别，不同的延迟级别对应的延迟时间不同
```java
private String messageDelayLevel = "1s 5s 10s 30s 1m 2m 3m 4m 5m 6m 7m 8m 9m 10m 20m 30m 1h 2h";
```

RocketMQ内部有一个Topic，专门用来表示是延迟消息的，叫`SCHEDULE_TOPIC_XXXX`，`XXXX`不是占位符，就是`XXXX`

RocketMQ会根据延迟级别的个数为`SCHEDULE_TOPIC_XXXX`这个Topic创建相对应数量的队列

比如默认延迟级别是18，那么`SCHEDULE_TOPIC_XXXX`就有18个队列，队列的id从0开始，所以延迟级别为1时，对应的队列id就是0，为2时对应的就是1，依次类推

图片
那`SCHEDULE_TOPIC_XXXX`这个Topic有什么作用呢？

这就得从消息存储时的一波**偷梁换柱**的骚操作了说起了

当服务端接收到消息的时候，判断延迟级别大于0的时候，说明是延迟消息，此时会干下面三件事：

- 将消息的Topic改成SCHEDULE_TOPIC_XXXX
- 将消息的队列id设置为延迟级别对应的队列id
- 将消息真正的Topic和队列id存到前面提到的消息存储时的额外信息中

之后消息就按照正常存储的步骤存到`CommitLog`文件中

由于消息存到的是`SCHEDULE_TOPIC_XXXX`这个Topic中，而不是消息真正的目标Topic中，所以消费者此时是消费不到消息的

举个例子，比如有条消息，Topic为`sanyou`，所在的队列`id = 1`，延迟级别 = 1，那么偷梁换柱之后的结果如下图所示

代码如下
```java
// init gueueld msg.getQueueldOr
final int tranType = MessageSysFlag.getTransactionValue(msg.getSysFlag());
if (tranType == MessageSysFlag.TRANSACTION_NOT_TYPE
    || tranType == MessageSysFlag.TRANSACTION_COMMIT_TYPE) {
        //延迟消息的处理，将延迟消息放到中转的延迟队列中保存

    if (msg.getDelayTimeLevel() > 0) { // 延迟消息
        if (msg.getDelayTimelevel() > this.defaultMessageStore.getScheduleMessageService().getMaxDelayLevel()) {
            msg.setDelayTimeLevel(this.defaultMessageStore.getScheduleMessageService().getMaxDelayLevel())
        }
        // Topic设置为 RMQ_SYS_SCHEDULE_TOPIC
        // 根据延迟级别找到对应的队列 id
        topic = TopicValidator.RMQ_SYS_SCHEDULE_TOPIC;
        int queueid = ScheduleessageService.delayLevel2QueueId(msg.getDelayTimeLevel())
        
        // Backup real topic，queueId 
        // 将真正的 Topic和队列id存到额外信息中
        MessageAccessor.putProperty(msg, MessageConst.PROPERTY_REAL_TOPIC，msg.getTopic());
        MessageAccessor.putProperty(msg, MessageConst.PROPERTY_REAL_QUEUE_ID, String.value0f(msg.getQueueId())
        msg.setPropertiesString(MessageDecoder.messageProperties2String(msg.getProperties())));

        // 真正设置
        msg.setTopic(topic);
        msg.setQueueId(queueId); 
    }
}
```

所以从上分析可以得出一个结论

> 所有RocketMQ的延迟消息，最终都会存储到`SCHEDULE_TOPIC_XXXX`这个Topic中，并且同一个延迟级别的消息在同一个队列中

在存消息**偷梁换柱**之后，**实现延迟消费的最关键的一个步骤来了**

BocketMQ在启动的时候，除了为每个延迟级别创建一个队列之后，还会为每个延迟级别创建一个**延迟任务**，也就相当于一个定时任务，每隔100ms执行一次

> 这个延迟任务会去检查这个队列中的消息有没有到达延迟时间，也就是不是可以消费了

前面的结论，每个队列都有一个`ConsumeQueue`文件，可以通过`ConsumeQueue`找到这个队列中的消息

一旦发现到达延迟时间，可以消费了，此时就会从这条消息额外存储的消息中拿到真正的`Topic`和队列`id`，重新构建一条新的消息，将新的消息的Topic和队列id设置成真正的`Topic`和队列`id`，内容还是原来消息的内容

之后再一次将新构建的消息存储到`CommitLog`中

由于新消息的Topic变成消息真正的Topic了，所以之后消费者就能够消费到这条消息了

所以，从整体来说，RocketMQ延迟消息的实现本质上就是最开始消息是存在`SCHEDULE_TOPIC_XXXX`这个中转的Topic中

然后会有一个类似定时任务的东西，不停地去找到这个Topic中的消息

一旦发现这个消息达到了延迟任务，说明可以消费了，那么就重新构建一条消息，这条消息的Topic和队列id都是实际上的Topic和队列id，然后存到CommitLog

之后消费者就能够在目标的Topic获取到消息了

## 事务消息
事务消息用起来也比较简单，如下所示：
```java
public class TransactionMessageDemo {

    public static void main(String[] args) throws Exception {
        TransactionMQProducer transactionMQProducer = new TransactionMQProducer("sanyouProducer");
        transactionMQProducer.setNamesrvAddr("192.168.200.143:9876");

        //设置事务监听器
        transactionMQProducer.setTransactionListener(new TransactionListener() {

            @Override
            public LocalTransactionState executeLocalTransaction(Message msg, Object arg) {
                //处理本次事务
                return LocalTransactionState.COMMIT_MESSAGE;
            }

            @Override
            public LocalTransactionState checkLocalTransaction(MessageExt msg) {
                //检查本地事务
                return LocalTransactionState.COMMIT_MESSAGE;
            }
        });

        transactionMQProducer.start();

        Message message = new Message("sanyouTopic", "三友的java日记".getBytes());

        //发送消息
        transactionMQProducer.sendMessageInTransaction(message, new Object());
    }

}
```
事务消息发送相对于前面的例子主要有以下不同：

- 将前面的`DefaultMQProducer`换成`TransactionMQProducer`
- 需要设置事务的监听器`TransactionListener`，来执行本地事务
- 发送方法改成 `sendMessageInTransaction`

为什么要这么改，接下来我们来讲讲背后的实现原理

上一节在说延迟消息的时候提到，RocketMQ使用到了`SCHEDULE_TOPIC_XXXX`这个中转Topic，来偷梁换柱实现延迟消息

不仅仅是延迟消息，事务消息其实也是这么干的，它也会进行偷梁换柱，将消息先存在`RMQ_SYS_TRANS_HALF_TOPIC`这个Topic下，同时也会将消息真正的Topic和队列id存到额外信息中，操作都是一样滴

由于消息不在真正目标的Topic下，所以这条消息消费者也是消费不到滴

当消息成功存储之后，服务端会向生产者响应，告诉生产者我消息存储成功了，你可以执行本地事务了

之后生产者就会执行本地执行事务，也就是执行如下方法
```java
TransactionListener#executeLocalTransaction
```

当本地事务执行完之后，会将执行的结果发送给服务端

服务端会根据事务的执行状态来执行对应的处理结果

- commit：提交事务消息，跟延迟消息一样，重新构建一条消息，Topic和队列id都设置成消息真正的Topic和队列id，然后重新存到CommitLog文件，这样消费者就可以消费到消息了
- rollback：回滚消息，其实并没有实际的操作，因为消息本身就不在真正的Topic下，所以消费者压根就消费不到，什么都不做就可以了
- unknown：本地事务执行异常时就是这个状态，这个状态下会干一些事，咱们后面再说

所以在正常情况下，事务消息整个运行流程如下图所示

既然有正常情况下，那么就有非正常情况下

比如前面提到的抛异常导致unknown，又或者什么乱七八糟的原因，导致无法正常提交本地事务的执行状态，那么此时该怎么办呢？

RocketMQ当然也想到了，他有自己的一套补偿机制

RocketMQ内部会起动一个线程，默认每隔1分钟去检查没有被commit或者rollback的事务消息

> RocketMQ内部有一套机制，可以找出哪些事务消息没有commit或者rollback，这里就不细说了

当发现这条消息超过6s没有提交事务状态，那么此时就会向生产者发送一个请求，让生产者去检查一下本地的事务执行的状态，就是执行下面这行代码
```java
TransactionListener#checkLocalTransaction
```

之后会将这个方法返回的事务状态提交给服务端，服务端就可以知道事务的执行状态了

图片
这里有一个细节需要注意，事务消息检查次数不是无限的，默认最大为15次，一旦超过15次，那么就不会再被检查了，而是会直接把这个消息存到`TRANS_CHECK_MAX_TIME_TOPIC`中

所以你可以从这个Topic读取那些无法正常提交事务的消息

这就是RocketMQ事务消息的原理

### 小总结
RocketMQ事务消息的实现主要是先将消息存到`RMQ_SYS_TRANS_HALF_TOPIC`这个中间Topic，有些资料会把这个消息称为半消息（half消息），这是因为这个消息不能被消费

之后会执行本地的事务，提交本地事务的执行状态

RocketMQ会根据事务的执行状态去判断commit或者是rollback消息，也就是是不是可以让消费者消费这条消息的意思

在一些异常情况下，生产者无法及时正确提交事务执行状态

RocketMQ会向生产者发送消息，让生产者去检查本地的事务，之后再提交事务状态

当然，这个检查次数默认不超过`15次`，如果超过15次还未成功提交事务状态，RocketMQ就会直接把这个消息存到`TRANS_CHECK_MAX_TIME_TOPIC`中

## 请求-应答消息
这个消息类型比较有意思，类似一种RPC的模式

生产者发送消息之后**可以阻塞等待**消费者消费这个消息的之后返回的结果

生产者通过过调用request方法发送消息，接收回复消息
```java
public class Producer {
    public static void main(String[] args) throws Exception {
        //创建一个生产者，指定生产者组为 sanyouProducer
        DefaultMQProducer producer = new DefaultMQProducer("sanyouProducer");
        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.200.143:9876");
        // 启动生产者
        producer.start();


        Message message = new Message("sanyouTopic", "三友的java日记".getBytes());
        
        //发送消息，拿到响应结果， 3000代表超时时间，3s内未拿到响应结果，就超时，会抛出RequestTimeoutException异常
        Message result = producer.request(message, 3000);
        System.out.println("接收到响应消息：" + result);

        // 关闭生产者
        producer.shutdown();
    }

}
```

而对于消费者来着，当消费完消息之后，也要作为生产者，将响应的消息发送出去
```java
public class Consumer {
    public static void main(String[] args) throws InterruptedException, MQClientException {

        //创建一个生产者，指定生产者组为 sanyouProducer
        DefaultMQProducer producer = new DefaultMQProducer("sanyouProducer");
        // 指定NameServer的地址
        producer.setNamesrvAddr("192.168.200.143:9876");
        // 启动生产者
        producer.start();


        // 通过push模式消费消息，指定消费者组
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("sanyouConsumer");
        // 指定NameServer的地址
        consumer.setNamesrvAddr("192.168.200.143:9876");

        // 订阅这个topic下的所有的消息
        consumer.subscribe("sanyouTopic", "*");
        // 注册一个消费的监听器，当有消息的时候，会回调这个监听器来消费消息
        consumer.registerMessageListener(new MessageListenerConcurrently() {

            @Override
            public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> msgs,
                                                            ConsumeConcurrentlyContext context) {
                for (MessageExt msg : msgs) {
                    System.out.printf("消费消息:%s", new String(msg.getBody()) + "\n");

                    try {
                        // 用RocketMQ自带的工具类创建响应消息
                        Message replyMessage = MessageUtil.createReplyMessage(msg, "这是响应消息内容".getBytes(StandardCharsets.UTF_8));
                        // 将响应消息发送出去，拿到发送结果
                        SendResult replyResult = producer.send(replyMessage, 3000);
                        System.out.println("响应消息的结果 = " + replyResult);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                }

                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });

        // 启动消费者
        consumer.start();

        System.out.printf("Consumer Started.%n");
    }
}
```

这种请求-应答消息实现原理也比较简单，如下图所示

图片
生产者和消费者，会跟RocketMQ服务端进行网络连接

所以他们都是通过这个连接来发送和拉取消息的

当服务端接收到回复消息之后，有个专门处理回复消息的类

图片
这个类就会直接找到发送消息的生产者的连接，之后会通过这个连接将回复消息发送给生产者

> RocketMQ底层是基于Netty通信的，所以如果你有用过Netty的话，应该都知道，就是通过Channel来发送的

## 重试消息
重试消息并不是我们业务中主动发送的，而是指当消费者消费消息失败之后，会**间隔一段时间**之后再次消费这条消息

重试的机制在并发消费模式和顺序消费模式下实现的原理并不相同

### 并发消费模式重试实现原理
RocetMQ会为每个消费者组创建一个重试消息所在的Topic，名字格式为

> %RETRY% + 消费者组名称

举个例子，假设消费者组为`sanyouConsumer`，那么重试Topic的名称为：`%RETRY%sanyouConsumer`

当消息消费失败后，RocketMQ会把消息存到这个Topic底下

消费者在启动的时候会主动去订阅这个Topic，那么自然而然就能消费到消费失败的消息了

图片

### 为什么要为每个消费者组创建一个重试Topic呢？

其实我前面已经说过，每个消费者组的消费是隔离的，互不影响

所以，每个消费者组消费失败的消息可能就不一样，自然要放到不同的Topic下了

### 重试消息是如何实现间隔一段时间来消费呢？

说到间隔一段时间消费，你有没有觉得似曾相识？

不错，间隔一段时间消费说白了不就是延迟消费么！

所以，并发消费模式下**间隔一段时间**底层就是使用的延迟消息来实现的

RocetMQ会为重试消息设置一个延迟级别

并且延迟级别与重试次数的关系为

> delayLevel = 3 + 已经重试次数

比如第一次消费失败，那么已经重试次数就是0，那么此时延迟级别就是3

对应的默认的延迟时间就是10s，也就是一次消息重试消费间隔时间是10s

随着重试次数越多，延迟级别也越来越高，重试的间隔也就越来越长，但是最大也是最大延迟级别的时间

> 不过需要注意的是，在并发消费模式下，只有集群消费才支持消息重试，对于广播消费模式来说，是不支持消息重试的，消费失败就失败了，不会管

### 顺序消费模式重试实现原理
顺序消费模式下重试就比较简单了

当消费失败的时候，他并不会将消息发送到服务端，而是直接在本地等1s钟之后重试

在这个等待的期间其它消息是不能被消费的

这是因为保证消息消费的顺序性，即使前面的消息消费失败了，它也需要等待前面的消息处理完毕才能处理后面的消息

> 顺序消费模式下，并发消费和集群消费均支持重试消息

## 死信消息
死信消息就是指如果消息最终无法被正常消费，那么这条消息就会成为死信消息

RocketMQ中，消息会变成死信消息有两种情况

- 第一种就是消息重试次数已经达到了最大重试次数

最大重试次数取决于并发消费还是顺序消费

顺序消费，默认最大重试次数就是 `Integer.MAX_VALUE`，基本上就是无限次重试，所以默认情况下顺序消费的消息几乎不可能成为死信消息
并发消费的话，那么最大重试次数默认就是16次
当然可以通过如下的方法来设置最大重试次数
```java
DefaultMQPushConsumer#setMaxReconsumeTimes
```

- 除了上面的情况之外，当在并发消费模式下，你可以在消息消费失败之后手动指定，直接让消息变成死信消息

在并发消费消息的模式下，处理消息的方法有这么一个参数
```java
ConsumeConcurrentlyContext
```

这个类中有这么一个属性

这个参数值有三种情况，注释也有写：

- 小于0，那么直接会把消息放到死信队列，成为死信消息。注释写的是=-1，其实只要小于0就可以成为死信消息，不一定非得是-1
- 0，默认就是0，这个代表消息重试消费，并且重试的时间间隔（也就是延迟级别）由服务端决定，也即是前面重试消息提到的 `delayLevel = 3 + 已经重试次数`
- 大于0，此时就表示客户端指定消息重试的时间间隔，是几就代表延迟级别为几，比如设置成1，那么延迟级别就为1

所以，在并发消费模式下，可以通过设置这个参数值为-1，直接让处理失败的消息成为死信消息

当消息成为死信消息之后，消息并不会丢失

RocketMQ会将死信消息保存在死信Topic底下，Topic格式为

> %DLQ% + 消费者组名称

跟重试Topic的格式有点像，只是将`%RETRY%`换成了`%DLQ%`

如果你想知道有哪些死信消息，只需要订阅这个Topic即可获得

### 小总结
所以总的来说，两种情况会让消息成为死信消息：

- 消息重试次数超过最大次数，跟消息的处理方式有关，默认情况下顺序处理最大次数是几乎是无限次，也就是几乎不可能成为死信消息；并发处理的情况下，最大重试次数默认就是16次。最大重试次数是可以设置的。
- 在并发处理的情况下，通过`ConsumeConcurrentlyContext`将`delayLevelWhenNextConsume`属性设置成`-1`，让消息直接变成死信消息
当消息成为死信消息的时候，会被存到`%DLQ% + 消费者组名称`这个Topic下

用户可以通过这个Topic获取到死信消息，手动干预处理这些消息

## 同步消息
同步消息是指，当生产者发送消息的时候，需要**阻塞等待服务端响应**消息存储的结果

同步消息跟前面提到的消息类型并不是互斥的

比如前面说的普通消息时举的例子，他就是同步发送的，那么它也是一个同步消息

这种模式用于对数据一致性要求较高的场景中，但是等待也会消耗一定的时间

## 异步消息
既然有了同步消息，那么相对应的就有异步消息

异步消息就是指生产者发送消息后，不需要阻塞等待服务端存储消息的结果

所以异步消息的好处就是可以减少等待响应过程消耗的时间

如果你想知道有没有发送成功，可以在发送消息的时候传个回调的接口`SendCallback`的实现
```java
Message message = new Message("sanyouTopic", "三友的java日记".getBytes());

//异步发送消息
producer.send(message, new SendCallback() {
            @Override
            public void onSuccess(SendResult sendResult) {
                System.out.println("消息发送结果 = " + sendResult);
            }

            @Override
            public void onException(Throwable e) {
                System.out.println("消息发送异常 = " + e.getMessage());
            }
        }
);
```
当消息发送之后收到发送结果或者出现异常的时候，RocektMQ就会回调这个`SendCallback`实现类，你就可以知道消息发送的结果了

## 单向消息
所谓的单向消息就是指，生产者发送消息给服务端之后，就直接不管了

所以对于生产者来说，他是不会去care消息发送的结果了，即使发送失败了，对于生产者来说也是无所谓的

所以这种方式的主要应用于那种能够忍受丢消息的操作场景

比如像日志收集就比较适合使用这种方式

单向消息的发送是通过sendOneway来调用的
```java
Message message = new Message("sanyouTopic", "三友的java日记".getBytes());

//发送单向消息
producer.sendOneway(message);
```

> 总的来说，同步消息、异步消息、单向消息代表的是消息的发送方式，主要是针对消息的发送方来说，对消息的存储之类是的没有任何影响的

## 最后
ok，到这本文就结束了

本文又又是一篇非常非常肝的文章，不知道你是否坚持看到这里

我在写的过程中也是不断地死磕源码，尽可能避免出现错误的内容

同时也在尝试争取把我所看到的源码以一种最简单的方式说出来

所以如果你坚持看到这里，并觉得文章内容还不错，欢迎点赞、在看、收藏、转发分享给其他需要的人

你的支持就是我更新文章最大的动力，非常地感谢！

哦，最后差点忘了，如果有对RocketMQ源码感兴趣的小伙伴可以从下面这个仓库fork一下源码，我在源码中加了中文注释，并且后面我还会持续更新注释

> https://github.com/sanyou3/rocketmq.git
