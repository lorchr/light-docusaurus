- [Influx Sql系列教程二：retention policy 保存策略](https://blog.51cto.com/u_3408236/5818050)

retention policy这个东西相比较于传统的关系型数据库(比如mysql)而言，是一个比较新的东西，在将表之前，有必要来看一下保存策略有什么用，以及可以怎么用

## I. 基本操作
### 1. 创建retention policy
​​retention policy​​依托于database存在，也就是说保存策略创建时，需要指定具体的数据库，语法如下
```shell
CREATE RETENTION POLICY <retention_policy_name> ON <database_name> DURATION <duration> REPLICATION <n> [SHARD DURATION <duration>] [DEFAULT]
```
创建语句中，有几个地方需要额外注意一下

- ​​retention_policy_name​​: 策略名（自定义的）
- ​​database_name​​: 一个必须存在的数据库名
- ​​duration​​: 定义的数据保存时间，最低为1h，如果设置为0，表示数据持久不失效（默认的策略就是这样的）
- ​​REPLICATION​​: 定义每个point保存的副本数，默认为1
- ​​default​​: 表示将这个创建的保存策略设置为默认的

下面是一个实际的case，创建一个数据保存一年的策略
```shell
create retention policy "1Y" on test duration 366d replication 1
```

### 2. 策略查看
上面演示的case中，已经有如何查看一个数据库的保存策略了
```shell
show retention policies on <database name>
```

```shell
show retention policies on test
```

### 3. 修改保存策略
修改一个已经存在的保存策略，语法如下
```shell
ALTER RETENTION POLICY <retention_policy_name> ON <database_name> DURATION <duration> REPLICATION <n> SHARD DURATION <duration> DEFAULT
```

上面的定义和前面创建基本一致，下面给出一个case
```shell
alter retention policy "1Y" on test duration 365d replication 2 default
```

### 4. 删除保存策略
```shell
DROP RETENTION POLICY <retention_policy_name> ON <database_name>
```
当如下面的case，删除了默认的策略之后，会发现居然没有了默认的保存策略了，这个时候可能需要注意下，手动指定一个

```shell
drop retention policy "1Y" on test
```

## II. 进阶说明
前面虽然介绍了保存策略的增删改查，但是这个东西究竟有什么用，又可以怎么用呢？

看一下前面查看保存策略的图
```shell
create retention policy "1Y" on test duration 366d replication 1

show retention policies on test
```

从前面的查看，可以看到保存策略主要有三个关键信息，`​​数据保存时间​​​`, ​`​数据分片时间`​​​, `​​副本数​​`

### 1. 保存时间
duration 这一列，表示的就是这个策略定义的数据保存时间

因为我们知道每条记录都有一个time表明这条记录的时间戳，如果当前时间与这条记录的time之间差值，大于duration，那么这条数据就会被删除掉

注意

默认的保存策略 `​​autogen`​​ ​中的 ​`​duraitnotallow=0​`​，这里表示这条数据不会被删除

### 2. 分片时间
简单理解为每个分片的时间跨度，比如上面的`​​1_d​`​这个策略中，数据保存最近24小时的，每个小时一个分组

我们在创建数据策略的时候，大多时候都没有指定这个值，系统给出的方案如下

| Retention Policy’s DURATION | Shard Group Duration |
| --------------------------- | -------------------- |
| < 2 days                    | 1 hour               |
| >= 2 days and <= 6 months   | 1 day                |
| > 6 months                  | 7 days               |

### 3. 副本
副本这个指定了数据有多少个独立的备份存在

### 4. 场景说明
了解上面的几个参数之后，可以预见保存策略有个好的地方在于删除过期数据，比如使用influx来存日志，我只希望查看最近一个月的数据，这个时候指定一个`​​duration`​​时间为30天的保存策略，然后添加数据时，指定这个保存策略，就不需要自己来关心日志删除的问题了

## II. 其他
### 0. 系列博文
- [​190718-Influx Sql系列教程一：database 数据库​​](https://blog.hhui.top/hexblog/2019/07/18/190718-Influx-Sql%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B8%80%EF%BC%9Adatabase-%E6%95%B0%E6%8D%AE%E5%BA%93/)
- [​190717-Influx Sql系列教程零：安装及influx-cli使用姿势介绍​​](https://blog.hhui.top/hexblog/2019/07/17/190717-Influx-Sql%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E9%9B%B6%EF%BC%9A%E5%AE%89%E8%A3%85%E5%8F%8Ainflux-cli%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF%E4%BB%8B%E7%BB%8D/)
- [​190509-InfluxDb之时间戳显示为日期格式​​](https://blog.hhui.top/hexblog/2019/05/09/190509-InfluxDb%E4%B9%8B%E6%97%B6%E9%97%B4%E6%88%B3%E6%98%BE%E7%A4%BA%E4%B8%BA%E6%97%A5%E6%9C%9F%E6%A0%BC%E5%BC%8F/)
- [​190506-InfluxDB之配置修改​​](https://blog.hhui.top/hexblog/2019/05/06/190506-InfluxDB%E4%B9%8B%E9%85%8D%E7%BD%AE%E4%BF%AE%E6%94%B9/)
- [​190505-InfluxDB之权限管理​​](https://blog.hhui.top/hexblog/2019/05/05/190505-InfluxDB%E4%B9%8B%E6%9D%83%E9%99%90%E7%AE%A1%E7%90%86/)
- [​180727-时序数据库InfluxDB之备份和恢复策略​​](https://blog.hhui.top/hexblog/2018/07/27/180727-%E6%97%B6%E5%BA%8F%E6%95%B0%E6%8D%AE%E5%BA%93InfluxDB%E4%B9%8B%E5%A4%87%E4%BB%BD%E5%92%8C%E6%81%A2%E5%A4%8D%E7%AD%96%E7%95%A5/)
- [​180726-InfluxDB基本概念小结​​](https://blog.hhui.top/hexblog/2018/07/26/180726-InfluxDB%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E5%B0%8F%E7%BB%93/)
- [​180725-InfluxDB-v1.6.0安装和简单使用小结​​](https://blog.hhui.top/hexblog/2018/07/25/180725-InfluxDB-v1.6.0%E5%AE%89%E8%A3%85%E5%92%8C%E7%AE%80%E5%8D%95%E4%BD%BF%E7%94%A8%E5%B0%8F%E7%BB%93/)

### 1. 参考博文
- [​Database management using InfluxQL​​](https://docs.influxdata.com/influxdb/v1.7/query_language/database_management/#create-retention-policies-with-create-retention-policy)
- [​​一灰灰Blog​​](https://liuyueyi.github.io/hexblog)： https://liuyueyi.github.io/hexblog
