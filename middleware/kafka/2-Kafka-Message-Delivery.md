- [Kafka的消息传递保证和一致性](https://mp.weixin.qq.com/s/YLhglf-jFbxENGKvB-esSQ)

## 前言
通过前面的文章，相信大家对Kafka有了一定的了解了，那接下来问题就来了，Kafka既然作为一个分布式的消息队列系统，那它会不会出现消息丢失或者重复消费的情况呢？今天咱们就来一探。

## 实现机制
Kafka采用了一系列机制来实现消息传递的保证和一致性，关键点：

1. 至少一次的消息传递（At Least Once Delivery）：Kafka确保消息至少会被传递给消费者一次。生产者写入消息到Kafka时，会等待消息被持久化并复制到ISR中的副本，并返回一个确认（ack）给生产者。只有当所有ISR中的副本都完成了消息的复制后，消息才被认为是提交成功的，生产者才会收到确认。这样可以确保消息的可靠性，但也可能出现消息重复传递的情况。

2. 消费者的消费位置（Consumer Offset）：消费者在消费消息时，会记录自己的消费位置，即消费者偏移量（consumer offset）。消费者可以将偏移量提交到Kafka，以便在重启或故障恢复后继续消费。Kafka会将消息的偏移量持久化，保证在故障发生时可以对未消费的消息进行重播。

3. 消费者组的协调和重平衡（Consumer Group Coordination and Rebalance）：Kafka的消费者可以组成一个消费者组，共同消费一个或多个主题的消息。消费者组中的每个消费者负责处理一个或多个分区。当消费者组中的消费者变化时（如新加入消费者、消费者故障等），Kafka会进行消费者组的重平衡，重新分配分区给消费者。重平衡是为了保证每个分区只有一个消费者进行消费，以保证消息的顺序性和一致性。

4. 消费者的幂等性和事务性（Consumer Idempotence and Transactions）：消费者可以实现幂等性来处理重复消息。消费者可以使用消息的唯一标识符对消息进行去重，以确保消费的幂等性。此外，Kafka还提供了事务性API，使消费者能够以原子方式读取消息和写入外部系统。

## 容错性
1. 分布式复制：Kafka使用分布式复制来保证数据的可靠性和容错性。每个主题的分区可以有多个副本，这些副本分布在不同的服务器上。当一个Broker发生故障时，副本中的一个会被选举为新的Leader，继续处理读写请求，从而实现了容错。

2. ISR（In-Sync Replicas）：Kafka使用ISR机制来保证数据的可靠性和一致性。ISR是指与Leader副本保持同步的副本集合，只有ISR中的副本才被认为是“可靠”的。当Leader副本接收到消息并复制给ISR中的副本后，就会返回确认给生产者。这样，只要ISR中的副本都复制成功，就可保证消息的可靠性。

3. 高可用性：Kafka的整体设计目标之一就是保持高可用性。每个分区都有多个副本，可以在集群中的多个Broker上进行分布。当一个Broker发生故障时，副本中的其他Broker可以接管该分区并成为新的Leader，继续提供读写服务，从而实现高可用性。

## 数据一致性
1. Leader副本顺序保证：Kafka保证了在一个分区中，消息的顺序性。写入请求会被发送到Leader副本，并根据分区中的顺序写入。由于Leader副本负责消息的写入和复制，确保了消息的有序性。

2. 分区复制同步：当Leader副本从生产者那里接收到消息后，在将消息写入本地日志前，会等待ISR中的所有副本也完成了相同的写入操作。这样就保证了消息在副本间的复制同步，确保数据的一致性。

3. 分区切换机制：当一个副本成为新的Leader时，Kafka会确保新的Leader副本具有与之前的Leader相同的日志内容。这通过Leader副本与ISR中的其他副本进行同步来实现，以保证消息的一致性。

需要注意的是，Kafka提供了至少一次的消息传递语义，这意味着一旦消息被写入并得到确认，就可以确保至少会传递给消费者一次。但由于网络分区、故障恢复等原因，可能会导致消息重复传递的情况。因此，在消费者端需要进行幂等处理来保证数据一致性。

## Kafka中ISR
ISR（In-Sync Replicas）是Kafka中用于保证数据可靠性和一致性的概念。ISR是指与Leader副本保持同步的副本集合，是Kafka动态维护的一组同步副本。

在Kafka中，每个主题的分区可以有多个副本（Replica），其中有一个副本被选为Leader，负责处理读写请求，其他副本则作为Follower。当生产者发送消息到Kafka时，消息会首先被写入Leader副本的日志中，并从Leader副本复制到ISR中的其他副本。

只有ISR中的副本完成了对消息的复制，Leader副本才会向生产者返回确认（ack），表示消息已被成功接收和持久化。这样可以保证发送到ISR中的消息在多个副本之间同步，从而达到数据的可靠性和一致性。

当一个Follower副本落后于Leader副本太多（超过了配置的阈值）或发生了故障，它将被视为不再与Leader副本同步，被移出ISR。这样，新的Leader副本将在ISR中的其它副本中选举产生，并重新建立同步。这样做是为了保证数据的可靠性和一致性，不会让落后太多的副本影响读取和写入的性能。同时，当Follower副本恢复正常或者迎上了Leader副本的进度，它将再次加入ISR，并与Leader副本保持同步。

图片
看到这里是不是感觉和Zookeeper的机制非常相似？可以翻看之前的文章[Zookeeper的浅尝](https://mp.weixin.qq.com/s/ZkHq-Z7boJy0Y1SfYJ2VXA)

通过ISR机制，Kafka确保了在正常运行的情况下，每个分区的消息都被可靠地复制和复制到达。ISR中的副本数量越多，数据的复制同步需要的时间越长，但副本的可用性和数据一致性也更高。同时，通过动态调整ISR的大小，Kafka能够在面对故障或负载变化时做出适应性的响应，从而保证了高可靠性和一致性。

## 选举Leader
- Kafka采用的是法定人数选举（quorum）：主要用来通过数据冗余来保证数据一致性的投票算法。在Kafka中该算法的实现就是ISR，在ISR中就是可以被选举为Leader的法定人数。

在Leader宕机后，从ISR列表中选取新的Leader，无论哪个副本被选为新的Leader，它那里都有之前的数据，可以保证在切换了Leader后，消费者可以继续看到HW之前已经提交的数据。

- HW的截断机制：新的Leader并不能保证已经完全同步了之前Leader的所有数据，只能保证HW之前的数据是同步过的，此时所有的Follower都要将数据截断到HW的位置，再和新的Leader同步数据，来保证数据一致。当宕机的Leader恢复，发现新的Leader中的数据和自己持有的数据不一致，此时宕机的Leader会将自己的数据截断到宕机之前的HW位置，然后同步新Leader的数据。宕机的Leader活过来也像Follower一样同步数据，来保证数据的一致性。

## 结论：
Kafka通过分布式复制、ISR机制、高可用性设计以及分区复制同步等机制，确保了高容错性和数据一致性。这些特性使得Kafka成为处理高吞吐量和大规模数据的可靠分布式消息系统。