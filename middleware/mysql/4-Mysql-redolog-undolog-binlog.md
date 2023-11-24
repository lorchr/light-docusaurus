## 前言

MySQL 日志包含了错误日志、查询日志、慢查询日志、事务日志、二进制日志等，如果存储引擎使用的是 InnoDB ，二进制日志(binlog)和事务日志(包括redo log和undo log) 是肯定绕不过去的，本篇接下来详细为大家介绍这三种日志。

## redo log

为什么要有 redo log ？

我们都清楚，事务的四大特性其中有一个是持久性，简单的说就是只要事务提交成功，对数据库做的修改就会被永久保存下来，不会因为任何原因再回到原来的状态。

MySQL 是怎么样保证持久性的呢？最简单的做法是在每次事务提交的时候，将该事务涉及修改的数据页全部刷新回磁盘中，可是这么做存在严重的性能问题：
单个事务可能涉及修改多个数据页，并且数据页在物理上并不连续，使用随机IO写入性能太差。
Innodb是以页为单位进行磁盘交互的，一个事务有可能只会修改一个数据页中的几个字节，如果这时候将完整的数据页刷回磁盘的话，很浪费资源。
因此 MySQL 设计出了redo log，当一条记录更新的时候， InnoDB 引擎会先把记录写到 redo log 里面去，同时更新内存，这样就算这条数据更新成功了，完美地解决了性能问题(文件更小并且是顺序IO)。
注意此时数据并没有更新到磁盘上，InnoDB 会在恰当的时候把这条记录更新到磁盘上去。这种先写日志然后再将数据刷盘的机制，有个专有名词——WAL（Write-ahead logging）。

redo log 如何刷到磁盘的呢？

redo log包含两部分：
- 内存中的日志缓冲(redo log buffer)
- 磁盘上的日志文件(redo log file)

每执行一条DML语句，数据库先将记录写入redo log buffer，然后后续某个时间点再一次性将多个操作记录写到redo log file。MySQL 一共支持三种写入redo log file的时机，通过参数 innodb_flush_log_at_trx_commit 进行配置，如下图所示：
图片

## bin log

bin log 是 MySQL 的逻辑日志，由Server层进行记录，用于记录数据库执行的写入性操作(不包括查询)信息，以二进制的形式保存在磁盘中。无论你使用的是任何的存储引擎，mysql数据库都会记录binlog日志

与redo log日志一样，binlog也有自己的刷盘策略，通过sync_binlog参数控制：
- 0 ：每次提交事务前将binlog写入os cache，由操作系统控制什么时候刷到磁盘
- 1 ：采用同步写磁盘的方式来写binlog，不使用os cache来写binlog
- N ：当每进行n次事务提交之后，调用一次fsync() os cache中的binlog强制刷到磁盘

bin log 和 redo log 都用于记录的修改之后的值，那么它们之间究竟有什么区别呢？
redo log 和 binlog 的区别

主要有以下三方面：
- binlog 是 MySQL 的 Server 层实现的，所有的引擎都是可以的。redo log是InnoDB的日志。如果不使用InnoDB引擎，是没有redo log的。
- binlog是逻辑日志，记录的是对哪一个表的哪一行做了什么修改；redo log是物理日志，记录的是对哪个数据页中的哪个记录做了什么修改，可以理解为对磁盘上的哪个数据做了修改。
- redo log 是有固定大小的，所以它的空间会用完，如果用完的话，一定要进行一些写入磁盘的操作才可以继续; binlog 是可以追加写入的，也就是 binlog 没有空间的概念，一直写就行了

## undo log

数据库事务四大特性中有一个是原子性，原子性指对数据库的一系列操作，要么全部成功，要么全部失败，不可能出现部分成功的情况。实际上，原子性底层就是通过undo log实现的。

undo log主要记录了数据的逻辑变化，比如一条UPDATE语句，对应一条相反UPDATE的undo log，一条INSERT语句，对应一条DELETE的undo log，这样在发生错误时，就能回滚到事务之前的数据状态。

undo log 同时也是MVCC(多版本并发控制)实现的关键，这部分公众号之前有讲过，不再赘述。

## 总结

- redo log是InnoDB存储引擎的一种日志，主要作用是崩溃恢复，刷盘策略参数 innodb_flush_log_at_trx_commit 推荐设置成2。
- binlog是MySQL Server层的一种日志，主要作用是归档。
- undo log是InnoDB存储引擎的一种日志，主要作用是回滚。
