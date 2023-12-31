- [万字长文，讲懂SQL调优，还不会，来找我](https://mp.weixin.qq.com/s/pO1WcM5h6csxNQ7azb0HqA)
- [步步深入：MySQL架构总览->查询执行流程->SQL解析顺序](https://www.cnblogs.com/annsshadow/p/5037667.html)

很多朋友在做数据分析时，分析两分钟，跑数两小时？

在使用SQL过程中不仅要关注数据结果，同样要注意SQL语句的执行效率。

本文涉及三部分：

- SQL介绍
- SQL优化方法
- SQL优化实例

## 1、MySQL的基本架构
### 1）MySQL的基础架构图

![img](img/mysql-3-1.jpg)

左边的client可以看成是客户端，客户端有很多，像我们经常你使用的CMD黑窗口，像我们经常用于学习的WorkBench，像企业经常使用的Navicat工具，它们都是一个客户端。右边的这一大堆都可以看成是Server(MySQL的服务端)，我们将Server在细分为sql层和存储引擎层。

当查询出数据以后，会返回给执行器。执行器一方面将结果写到查询缓存里面，当你下次再次查询的时候，就可以直接从查询缓存中获取到数据了。另一方面，直接将结果响应回客户端。

### 2）查询数据库的引擎

#### ① `show engines;`

| Engine             | Support | Comment                                                        | Transactions | XA  | Savepoints |
| ------------------ | ------- | -------------------------------------------------------------- | ------------ | --- | ---------- |
| ndbcluster         | NO      | Clustered, fault-tolerant tables                               |              |     |            |
| FEDERATED          | NO      | Federated MySQL storage engine                                 |              |     |            |
| MEMORY             | YES     | Hash based, stored in memory, useful for temporary tables      | NO           | NO  | NO         |
| InnoDB             | DEFAULT | Supports transactions, row-level locking, and foreign keys     | YES          | YES | YES        |
| PERFORMANCE_SCHEMA | YES     | Performance Schema                                             | NO           | NO  | NO         |
| MyISAM             | YES     | MyISAM storage engine                                          | NO           | NO  | NO         |
| ndbinfo            | NO      | MySQL Cluster system information storage engine                |              |     |            |
| MRG_MYISAM         | YES     | Collection of identical MyISAM tables                          | NO           | NO  | NO         |
| BLACKHOLE          | YES     | /dev/null storage engine (anything you write to it disappears) | NO           | NO  | NO         |
| CSV                | YES     | CSV storage engine                                             | NO           | NO  | NO         |
| ARCHIVE            | YES     | Archive storage engine                                         | NO           | NO  | NO         |

#### ② `show variables like "%storage_engine%";`

| Variable_name                   | Value     |
| ------------------------------- | --------- |
| default_storage_engine          | InnoDB    |
| default_tmp_storage_engine      | InnoDB    |
| disabled_storage_engines        |           |
| internal_tmp_mem_storage_engine | TempTable |

### 3）指定数据库对象的存储引擎
```sql
create table tb(
    id int(4) auto_increment,
    name varchar(5),
    dept varchar(5),
    primary key(id)
) engine=myISAM auto_increment=1 default charset=utf8;
```

## 2、SQL优化
### 1）为什么需要进行SQL优化？

在进行多表连接查询、子查询等操作的时候，由于你写出的SQL语句欠佳，导致的服务器执行时间太长，我们等待结果的时间太长。基于此，我们需要学习怎么优化SQL。

### 2）mysql的编写过程和解析过程

#### ① 编写过程
```sql
select dinstinct  ..from  ..join ..on ..where ..group by ..having ..order by ..limit ..
```

#### ② 解析过程
```sql
from .. on.. join ..where ..group by ..having ..select dinstinct ..order by ..limit ..
```
这里有一篇文章，详细说明了mysql解析过程：

https://www.cnblogs.com/annsshadow/p/5037667.html

### 3）SQL优化—主要就是优化索引

优化SQL，最重要的就是优化SQL索引。

索引相当于字典的目录。利用字典目录查找汉字的过程，就相当于利用SQL索引查找某条记录的过程。有了索引，就可以很方便快捷的定位某条记录。

#### ① 什么是索引？

索引就是帮助MySQL高效获取数据的一种【数据结构】。索引是一种树结构，MySQL中一般用的是【B+树】。

#### ② 索引图示说明(这里用二叉树来帮助我们理解索引)

树形结构的特点是：子元素比父元素小的，放在左侧；子元素比父元素大的，放在右侧。

这个图示只是为了帮我们简单理解索引的，真实的关于【B+树】的说明，我们会在下面进行说明。

![](img/mysql-3-2.png)

索引是怎么查找数据的呢？两个字【指向】，上图中我们给age列指定了一个索引，即类似于右侧的这种树形结构。mysql表中的每一行记录都有一个硬件地址，例如索引中的age=50，指向的就是源表中该行的标识符(“硬件地址”)。

也就是说，树形索引建立了与源表中每行记录硬件地址的映射关系，当你指定了某个索引，这种映射关系也就建成了，这就是为什么我们可以通过索引快速定位源表中记录的原因。

以 `select * from student where age=33` 查询语句为例。当我们不加索引的时候，会从上到下扫描源表，当扫描到第5行的时候，找到了我们想要找到了元素，一共是查询了5次。

当添加了索引以后，就直接在树形结构中进行查找，33比50小，就从左侧查询到了23，33大于23，就又查询到了右侧，这下找到了33，整个索引结束，一共进行了3次查找。是不是很方便，假如我们此时需要查找age=62，你再想想“添加索引”前后，查找次数的变化情况。

### 4）索引的弊端

1. 当数据量很大的时候，索引也会很大(当然相比于源表来说，还是相当小的)，也需要存放在内存/硬盘中(通常存放在硬盘中)，占据一定的内存空间/物理空间。

2. 索引并不适用于所有情况：a.少量数据；b.频繁进行改动的字段，不适合做索引；c.很少使用的字段，不需要加索引；

3. 索引会提高数据查询效率，但是会降低“增、删、改”的效率。当不使用索引的时候，我们进行数据的增删改，只需要操作源表即可，但是当我们添加索引后，不仅需要修改源表，也需要再次修改索引，很麻烦。尽管是这样，添加索引还是很划算的，因为我们大多数使用的就是查询，“查询”对于程序的性能影响是很大的。

### 5）索引的优势

1. 提高查询效率(降低了IO使用率)。当创建了索引后，查询次数减少了。

2. 降低CPU使用率。比如说【…order by age desc】这样一个操作，当不加索引，会把源表加载到内存中做一个排序操作，极大的消耗了资源。但是使用了索引以后，第一索引本身就小一些，第二索引本身就是排好序的，左边数据最小，右边数据最大。

### 6）B+树图示说明

MySQL中索引使用的就是B+树结构。

![](img/mysql-3-3.jpg)

关于B+树的说明：

首先，Btree一般指的都是【B+树】，数据全部存放在叶子节点中。对于上图来说，最下面的第3层，属于叶子节点，真实数据部份都是存放在叶子节点当中的。

那么对于第1、2层中的数据又是干嘛的呢？答：用于分割指针块儿的，比如说小于26的找P1，介于26-30之间的找P2，大于30的找P3。

其次，三层【B+树】可以存放上百万条数据。这么多数据怎么放的呢？增加“节点数”。图中我们只有三个节点。

最后，【B+树】中查询任意数据的次数，都是n次，n表示的是【B+树】的高度。

## 3、索引的分类与创建

### 1）索引分类

- 单值索引
- 唯一索引
- 复合索引

#### ① 单值索引

利用表中的某一个字段创建单值索引。一张表中往往有多个字段，也就是说每一列其实都可以创建一个索引，这个根据我们实际需求来进行创建。还需要注意的一点就是，一张表可以创建多个“单值索引”。

假如某一张表既有age字段，又有name字段，我们可以分别对age、name创建一个单值索引，这样一张表就有了两个单值索引。

#### ② 唯一索引

也是利用表中的某一个字段创建单值索引，与单值索引不同的是：创建唯一索引的字段中的数据，不能有重复值。像age肯定有很多人的年龄相同，像name肯定有些人是重名的，因此都不适合创建“唯一索引”。像编号id、学号sid，对于每个人都不一样，因此可以用于创建唯一索引。

#### ③ 复合索引

多个列共同构成的索引。比如说我们创建这样一个“复合索引”(name,age)，先利用name进行索引查询，当name相同的时候，我们利用age再进行一次筛选。注意：复合索引的字段并不是非要都用完，当我们利用name字段索引出我们想要的结果以后，就不需要再使用age进行再次筛选了。

### 2）创建索引

#### ① 语法

语法：`create 索引类型 索引名 on 表(字段);`

建表语句如下：

```sql
create table tb(
    id int(4) auto_increment,
    name varchar(5),
    dept varchar(5),
    primary key(id)
) engine=myISAM auto_increment=1 default charset=utf8;
```

查询表结构如下：
```sql
desc tb;
```

| Field | Type       | Null | Key | Default | Extra          |
| ----- | ---------- | ---- | --- | ------- | -------------- |
| id    | int        | NO   | PRI |         | auto_increment |
| name  | varchar(5) | YES  |     |         |                |
| dept  | varchar(5) | YES  |     |         |                |

#### ② 创建索引的第一种方式

1. 创建单值索引
```sql
create index dept_index on tb(dept);
```

2. 创建唯一索引：这里我们假定name字段中的值都是唯一的
```sql
create unique index name_index on tb(name);
```

3. 创建复合索引
```sql
create index dept_name_index on tb(dept,name);
```

#### ③ 创建索引的第二种方式

先删除之前创建的索引以后，再进行这种创建索引方式的测试；
```sql
drop index dept_index on tb;
drop index name_index on tb;
drop index dept_name_index on tb;
```

语法：`alter table 表名 add 索引类型 索引名(字段);`

1. 创建单值索引
```sql
alter table tb add index dept_index(dept);
```

1. 创建唯一索引：这里我们假定name字段中的值都是唯一的
```sql
alter table tb add unique index name_index(name);
```

1. 创建复合索引
```sql
alter table tb add index dept_name_index(dept, name);
```

#### ④ 补充说明

如果某个字段是`primary key`，那么该字段默认就是主键索引。

主键索引和唯一索引非常相似。相同点：该列中的数据都不能有相同值；不同点：主键索引不能有null值，但是唯一索引可以有null值。

### 3）索引删除和索引查询

#### ① 索引删除

语法：`drop index 索引名 on 表名;`

```sql
drop index name_index on tb;
```

#### ② 索引查询

语法：`show index from 表名;`
```sql
show index from tb;
```

结果如下：

| Table | Non_unique | Key_name        | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
| ----- | ---------- | --------------- | ------------ | ----------- | --------- | ----------- | -------- | ------ | ---- | ---------- | ------- | ------------- | ------- | ---------- |
| tb    | 0          | PRIMARY         | 1            | id          | A         | 0           |          |        |      | BTREE      |         |               | YES     |            |
| tb    | 1          | dept_index      | 1            | dept        | A         |             |          |        | YES  | BTREE      |         |               | YES     |            |
| tb    | 1          | dept_name_index | 1            | dept        | A         |             |          |        | YES  | BTREE      |         |               | YES     |            |
| tb    | 1          | dept_name_index | 2            | name        | A         |             |          |        | YES  | BTREE      |         |               | YES     |            |

## 4、SQL性能问题的探索

**人为优化：** 需要我们使用explain分析SQL的执行计划。该执行计划可以模拟SQL优化器执行SQL语句，可以帮助我们了解到自己编写SQL的好坏。

**SQL优化器自动优化：** 最开始讲述MySQL执行原理的时候，我们已经知道MySQL有一个优化器，当你写了一个SQL语句的时候，SQL优化器如果认为你写的SQL语句不够好，就会自动写一个好一些的等价SQL去执行。

SQL优化器自动优化功能【会干扰】我们的人为优化功能。当我们查看了SQL执行计划以后，如果写的不好，我们会去优化自己的SQL。当我们以为自己优化的很好的时候，最终的执行计划，并不是按照我们优化好的SQL语句来执行的，而是有时候将我们优化好的SQL改变了，去执行。

SQL优化是一种概率问题，有时候系统会按照我们优化好的SQL去执行结果(优化器觉得你写的差不多，就不会动你的SQL)。有时候优化器仍然会修改我们优化好的SQL，然后再去执行。

### 1）查看执行计划

语法：`explain + SQL语句`

eg：`explain select * from tb;`

### 2）“执行计划”中需要知道的几个“关键字”

| 字段          | 含义                   |
| ------------- | ---------------------- |
| id            | 编号                   |
| select_type   | 查询类型               |
| table         | 表                     |
| type          | 类型                   |
| possible_keys | 预测用到的索引         |
| key           | 实际使用的索引         |
| key_len       | 实际使用索引的长度     |
| ref           | 表之间的引用           |
| rows          | 通过索引查询到的数据量 |
| Extra         | 额外的信息             |

### 建表语句和插入数据：
```sql
-- 建表语句
create table course
(    
    cid int(3),   
    cname varchar(20),   
    tid int(3)
);

create table teacher
(  
    tid int(3),  
    tname varchar(20),  
    tcid int(3)
);

create table teacherCard
(   
    tcid int(3),  
    tcdesc varchar(200)
);

-- 插入数据
insert into course values(1,'java',1);
insert into course values(2,'html',1);
insert into course values(3,'sql',2);
insert into course values(4,'web',3);

insert into teacher values(1,'tz',1);
insert into teacher values(2,'tw',2);
insert into teacher values(3,'tl',3);

insert into teacherCard values(1,'tzdesc') ;
insert into teacherCard values(2,'twdesc') ;
insert into teacherCard values(3,'tldesc') ;
```

## 5. explain执行计划常用关键字详解
### 1）id关键字的使用说明

#### ① 案例：查询课程编号为2 或 教师证编号为3 的老师信息：
```sql
-- 查看执行计划
explain select t.*
from teacher t,course c,teacherCard tc
where t.tid = c.tid and t.tcid = tc.tcid
and (c.cid = 2 or tc.tcid = 3);
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra                                      |
| --- | ----------- | ----- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ------------------------------------------ |
| 1   | SIMPLE      | t     |            | ALL  |               |     |         |     | 3    | 100.00   |                                            |
| 1   | SIMPLE      | tc    |            | ALL  |               |     |         |     | 3    | 33.33    | Using where; Using join buffer (hash join) |
| 1   | SIMPLE      | c     |            | ALL  |               |     |         |     | 4    | 25.00    | Using where; Using join buffer (hash join) |

接着，在往teacher表中增加几条数据。
```sql
insert into teacher values(4,'ta',4);
insert into teacher values(5,'tb',5);
insert into teacher values(6,'tc',6);
```

再次查看执行计划。
```sql
-- 查看执行计划
explain select t.*
from teacher t,course c,teacherCard tc
where t.tid = c.tid and t.tcid = tc.tcid
and (c.cid = 2 or tc.tcid = 3);
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra                                      |
| --- | ----------- | ----- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ------------------------------------------ |
| 1   | SIMPLE      | tc    |            | ALL  |               |     |         |     | 3    | 100.00   |                                            |
| 1   | SIMPLE      | t     |            | ALL  |               |     |         |     | 6    | 16.67    | Using where; Using join buffer (hash join) |
| 1   | SIMPLE      | c     |            | ALL  |               |     |         |     | 4    | 25.00    | Using where; Using join buffer (hash join) |

表的执行顺序 ，因表数量改变而改变的原因：笛卡尔积。
```shell
a   b   c
2   3   4
最终：2 * 3 * 4  = 6 * 4 = 24
c   b   a
4   3   2
最终：4 * 3 * 2 = 12 * 2 = 24
```

分析：最终执行的条数，虽然是一致的。但是中间过程，有一张临时表是6，一张临时表是12，很明显6 < 12，对于内存来说，数据量越小越好，因此优化器肯定会选择第一种执行顺序。

结论：id值相同，从上往下顺序执行。表的执行顺序因表数量的改变而改变。

#### ② 案例：查询教授SQL课程的老师的描述(desc)
```sql
-- 查看执行计划
explain select tc.tcdesc from teacherCard tc 
where tc.tcid = 
(    
    select t.tcid from teacher t  
    where  t.tid =   
    (select c.tid from course c where c.cname = 'sql')
);
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra       |
| --- | ----------- | ----- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ----------- |
| 1   | PRIMARY     | tc    |            | ALL  |               |     |         |     | 3    | 33.33    | Using where |
| 2   | SUBQUERY    | t     |            | ALL  |               |     |         |     | 6    | 16.67    | Using where |
| 3   | SUBQUERY    | c     |            | ALL  |               |     |         |     | 4    | 25.00    | Using where |

结论：id值不同，id值越大越优先查询。这是由于在进行嵌套子查询时，先查内层，再查外层。

#### ③ 针对②做一个简单的修改
```sql
-- 查看执行计划
explain select t.tname ,tc.tcdesc from teacher t,teacherCard tc 
where t.tcid= tc.tcid
and t.tid = (select c.tid from course c where cname = 'sql') ;
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra                                      |
| --- | ----------- | ----- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ------------------------------------------ |
| 1   | PRIMARY     | t     |            | ALL  |               |     |         |     | 6    | 16.67    | Using where                                |
| 1   | PRIMARY     | tc    |            | ALL  |               |     |         |     | 3    | 33.33    | Using where; Using join buffer (hash join) |
| 2   | SUBQUERY    | c     |            | ALL  |               |     |         |     | 4    | 25.00    | Using where                                |

结论：id值有相同，又有不同。id值越大越优先；id值相同，从上往下顺序执行。

### 2）select_type关键字的使用说明：查询类型

| id  | select_type  |
| --- | ------------ |
| 1   | SIMPLE       |
| 2   | PRIMARY      |
| 3   | SUBQUERY     |
| 4   | DERIVED      |
| 5   | UNION        |
| 6   | UNION RESULT |

#### ① simple：简单查询

不包含子查询，不包含union查询。
```sql
explain select * from teacher;
```

结果如下：

| id  | select_type | table   | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra |
| --- | ----------- | ------- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ----- |
| 1   | SIMPLE      | teacher |            | ALL  |               |     |         |     | 6    | 100.00   |       |

#### ② primary：包含子查询的主查询(最外层)

#### ③ subquery：包含子查询的主查询(非最外层)

#### ④ derived：衍生查询(用到了临时表)

1. 在from子查询中，只有一张表；

2. 在from子查询中，如果table1 union table2，则table1就是derived表；
```sql
explain select  cr.cname    
from ( select * from course where tid = 1  union select * from course where tid = 2 ) cr ;
```
结果如下：

| id  | select_type  | table        | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra           |
| --- | ------------ | ------------ | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | --------------- |
| 1   | PRIMARY      | `<derived2>` |            | ALL  |               |     |         |     | 4    | 100.00   |                 |
| 2   | DERIVED      | course       |            | ALL  |               |     |         |     | 4    | 25.00    | Using where     |
| 3   | UNION        | course       |            | ALL  |               |     |         |     | 4    | 25.00    | Using where     |
| 4   | UNION RESULT | `<union2,3>` |            | ALL  |               |     |         |     |      |          | Using temporary |

#### ⑤ union：union之后的表称之为union表，如上例

#### ⑥ union result：告诉我们，哪些表之间使用了union查询

### 3）type关键字的使用说明：索引类型

system、const只是理想状况，实际上只能优化到 `index` --> `range` --> `ref` 这个级别。要对type进行优化的前提是，你得创建索引。

| system | const | eq_ref | ref | range | index | ALL |
| ------ | ----- | ------ | --- | ----- | ----- | --- |

#### ① system

源表只有一条数据(实际中，基本不可能)；

衍生表只有一条数据的主查询(偶尔可以达到)。

#### ② const

仅仅能查到一条数据的SQL ,仅针对Primary key或unique索引类型有效。
```sql
drop table if exists test01;
create table test01
(   
    tid int(3),  
    tdesc varchar(200),
    PRIMARY KEY(tid)
);

insert into test01 values(1, 'tdesc') ;

explain select tid from test01 where tid =1 ;
```
结果如下：

| id  | select_type | table  | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra       |
| --- | ----------- | ------ | ---------- | ----- | ------------- | ------- | ------- | ----- | ---- | -------- | ----------- |
| 1   | SIMPLE      | test01 |            | const | PRIMARY       | PRIMARY | 4       | const | 1    | 100.00   | Using index |

删除以前的主键索引后，此时我们添加一个其他的普通索引：
```sql
drop index index_name on test01 ;

create index test01_index on test01(tid) ;

-- 再次查看执行计划
explain select tid from test01 where tid =1 ;
```

结果如下：

| id  | select_type | table  | partitions | type | possible_keys | key          | key_len | ref   | rows | filtered | Extra       |
| --- | ----------- | ------ | ---------- | ---- | ------------- | ------------ | ------- | ----- | ---- | -------- | ----------- |
| 1   | SIMPLE      | test01 |            | ref  | test01_index  | test01_index | 4       | const | 1    | 100.00   | Using index |

#### ③ eq_ref

唯一性索引，对于每个索引键的查询，返回匹配唯一行数据（有且只有1个，不能多 、不能0），并且查询结果和数据条数必须一致。

此种情况常见于唯一索引和主键索引。
```sql
delete from teacher where tcid >= 4;
alter table teacherCard add constraint pk_tcid primary key(tcid);
alter table teacher add constraint uk_tcid unique index(tcid) ;
explain select t.tcid from teacher t,teacherCard tc where t.tcid = tc.tcid ;
```

结果如下：

| id  | select_type | table | partitions | type   | possible_keys | key     | key_len | ref          | rows | filtered | Extra                    |
| --- | ----------- | ----- | ---------- | ------ | ------------- | ------- | ------- | ------------ | ---- | -------- | ------------------------ |
| 1   | SIMPLE      | t     |            | index  | uk_tcid       | uk_tcid | 5       |              | 3    | 100.00   | Using where; Using index |
| 1   | SIMPLE      | tc    |            | eq_ref | PRIMARY       | PRIMARY | 4       | light.t.tcid | 1    | 100.00   | Using index              |

总结：以上SQL，用到的索引是t.tcid，即teacher表中的tcid字段；如果teacher表的数据个数和连接查询的数据个数一致（都是3条数据），则有可能满足eq_ref级别；否则无法满足。条件很苛刻，很难达到。

#### ④ ref

非唯一性索引，对于每个索引键的查询，返回匹配的所有行（可以0，可以1，可以多）

准备数据：

```sql
insert into teacher values(4, 'tz', 4);

insert into teacherCard values(4, 'tz222');

select * from teacher;
select * from teacherCard;
```

创建索引，并查看执行计划：
```sql
-- 添加索引
alter table teacher add index index_name (tname) ;
-- 查看执行计划
explain select * from teacher     where tname = 'tz';
```
结果如下：

| id  | select_type | table   | partitions | type | possible_keys | key        | key_len | ref   | rows | filtered | Extra |
| --- | ----------- | ------- | ---------- | ---- | ------------- | ---------- | ------- | ----- | ---- | -------- | ----- |
| 1   | SIMPLE      | teacher |            | ref  | index_name    | index_name | 83      | const | 2    | 100.00   |       |

#### ⑤ range

检索指定范围的行 ,where后面是一个范围查询(`between`, `>`, `<`, `>=`, `in`)

in有时候会失效，从而转为无索引时候的ALL
```sql
-- 添加索引
alter table teacher add index tid_index (tid) ;
-- 查看执行计划：以下写了一种等价SQL写法，查看执行计划
explain select t.* from teacher t where t.tid in (1, 3) ;
explain select t.* from teacher t where t.tid < 3 ;
```

结果如下：

| id  | select_type | table | partitions | type  | possible_keys | key       | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ----- | ---------- | ----- | ------------- | --------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | t     |            | range | tid_index     | tid_index | 5       |     | 2    | 100.00   | Using index condition |

| id  | select_type | table | partitions | type  | possible_keys | key       | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ----- | ---------- | ----- | ------------- | --------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | t     |            | range | tid_index     | tid_index | 5       |     | 2    | 100.00   | Using index condition |

#### ⑥ index

查询全部索引中的数据(扫描整个索引)

#### ⑦ ALL

查询全部源表中的数据(暴力扫描全表)
```sql
show index from course;

create index cid_index on course(cid);

show index from course;

explain select cid from course;

explain select tid from course;
```

结果如下：

```sql
mysql> show index from course;
Empty set (0.00 sec)

mysql> create index cid_index on course(cid);
Query OK, 0 rows affected (0.02 sec)
Records: 0  Duplicates: 0  Warnings: 0

mysql> show index from course;
+--------+------------+-----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| Table  | Non_unique | Key_name  | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment | Index_comment | Visible | Expression |
+--------+------------+-----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
| course |          1 | cid_index |            1 | cid         | A         |           4 |     NULL |   NULL | YES  | BTREE      |         |               | YES     | NULL       |
+--------+------------+-----------+--------------+-------------+-----------+-------------+----------+--------+------+------------+---------+---------------+---------+------------+
1 row in set (0.00 sec)

mysql> explain select cid from course;
+----+-------------+--------+------------+-------+---------------+-----------+---------+------+------+----------+-------------+
| id | select_type | table  | partitions | type  | possible_keys | key       | key_len | ref  | rows | filtered | Extra       |
+----+-------------+--------+------------+-------+---------------+-----------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | course | NULL       | index | NULL          | cid_index | 5       | NULL |    4 |   100.00 | Using index |
+----+-------------+--------+------------+-------+---------------+-----------+---------+------+------+----------+-------------+
1 row in set, 1 warning (0.00 sec)

mysql> explain select tid from course;
+----+-------------+--------+------------+------+---------------+------+---------+------+------+----------+-------+
| id | select_type | table  | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
+----+-------------+--------+------------+------+---------------+------+---------+------+------+----------+-------+
|  1 | SIMPLE      | course | NULL       | ALL  | NULL          | NULL | NULL    | NULL |    4 |   100.00 | NULL  |
+----+-------------+--------+------------+------+---------------+------+---------+------+------+----------+-------+
1 row in set, 1 warning (0.00 sec)
```

注意：cid是索引字段，因此查询索引字段，只需要扫描索引表即可。但是tid不是索引字段，查询非索引字段，需要暴力扫描整个源表，会消耗更多的资源。

### 4）possible_keys和key

possible_keys可能用到的索引。是一种预测，不准。了解一下就好。

key指的是实际使用的索引。
```sql
-- 先给course表的cname字段，添加一个索引
create index cname_index on course(cname);
-- 查看执行计划
explain select t.tname ,tc.tcdesc from teacher t,teacherCard tc
where t.tcid= tc.tcid
and t.tid = (select c.tid from course c where cname = 'sql') ;
```

结果如下：


| id  | select_type | table | partitions | type   | possible_keys     | key         | key_len | ref         | rows | filtered | Extra       |
| --- | ----------- | ----- | ---------- | ------ | ----------------- | ----------- | ------- | ----------- | ---- | -------- | ----------- |
| 1   | PRIMARY     | t     |            | ref    | uk_tcid,tid_index | tid_index   | 5       | const       | 1    | 100.00   | Using where |
| 1   | PRIMARY     | tc    |            | eq_ref | PRIMARY           | PRIMARY     | 4       | test.t.tcid | 1    | 100.00   |             |
| 2   | SUBQUERY    | c     |            | ref    | cname_index       | cname_index | 83      | const       | 1    | 100.00   |             |

有一点需要注意的是：如果`possible_key` / `key` 是NULL，则说明没用索引。

### 5）key_len

索引的长度，用于判断复合索引是否被完全使用(a,b,c)。

#### ① 新建一张新表，用于测试
```sql
--- 创建表
create table test_kl
(  
  name char(20) not null default ''
);

--- 添加索引
alter table test_kl add index index_name(name) ;
--- 查看执行计划
explain select * from test_kl where name ='' ; 
```

结果如下：

| id  | select_type | table   | partitions | type | possible_keys | key        | key_len | ref   | rows | filtered | Extra       |
| --- | ----------- | ------- | ---------- | ---- | ------------- | ---------- | ------- | ----- | ---- | -------- | ----------- |
| 1   | SIMPLE      | test_kl |            | ref  | index_name    | index_name | 80      | const | 1    | 100.00   | Using index |

结果分析：因为我没有设置服务端的字符集，因此默认的字符集使用的是latin1，对于latin1一个字符代表一个字节，因此这列的key_len的长度是20，表示使用了name这个索引。

#### ② 给test_kl表，新增name1列，该列没有设置“not null”

结果如下：

```sql
-- 添加字段
alter table test_kl add column name1 char(20);
-- 添加索引
alter table test_kl add index index_name1(name1);
--- 查看执行计划
explain select * from test_kl where name1 ='' ; 
```

| id  | select_type | table   | partitions | type | possible_keys | key         | key_len | ref   | rows | filtered | Extra |
| --- | ----------- | ------- | ---------- | ---- | ------------- | ----------- | ------- | ----- | ---- | -------- | ----- |
| 1   | SIMPLE      | test_kl |            | ref  | index_name1   | index_name1 | 81      | const | 1    | 100.00   |       |

结果分析：如果索引字段可以为null，则mysql底层会使用1个字节用于标识。

#### ③ 删除原来的索引name和name1，新增一个复合索引
```sql
-- 删除原来的索引name和name1
drop index index_name on test_kl ;
drop index index_name1 on test_kl ;
-- 增加一个复合索引
create index name_name1_index on test_kl(name,name1);
-- 查看执行计划
explain select * from test_kl where name1 = '' ; -- 121
explain select * from test_kl where name = '' ; -- 60
```

结果如下：

| id  | select_type | table   | partitions | type  | possible_keys    | key              | key_len | ref | rows | filtered | Extra                    |
| --- | ----------- | ------- | ---------- | ----- | ---------------- | ---------------- | ------- | --- | ---- | -------- | ------------------------ |
| 1   | SIMPLE      | test_kl |            | index | name_name1_index | name_name1_index | 161     |     | 1    | 100.00   | Using where; Using index |

| id  | select_type | table   | partitions | type | possible_keys    | key              | key_len | ref   | rows | filtered | Extra       |
| --- | ----------- | ------- | ---------- | ---- | ---------------- | ---------------- | ------- | ----- | ---- | -------- | ----------- |
| 1   | SIMPLE      | test_kl |            | ref  | name_name1_index | name_name1_index | 80      | const | 1    | 100.00   | Using index |

结果分析： 对于下面这个执行计划，可以看到我们只使用了复合索引的第一个索引字段name，因此key_len是20，这个很清楚。再看上面这个执行计划，我们虽然仅仅在where后面使用了复合索引字段中的name1字段，但是你要使用复合索引的第2个索引字段，会默认使用了复合索引的第1个索引字段name，由于name1可以是null，因此key_len = 20 + 20 + 1 = 41呀！

#### ④ 再次怎加一个name2字段，并为该字段创建一个索引。

不同的是：该字段数据类型是varchar
```sql
-- 新增一个字段name2，name2可以为null
alter table test_kl add column name2 varchar(20) ; 
-- 给name2字段，设置为索引字段
alter table test_kl add index name2_index(name2) ;
-- 查看执行计划
explain select * from test_kl where name2 = '' ; 
```

结果如下：

| id  | select_type | table   | partitions | type | possible_keys | key         | key_len | ref   | rows | filtered | Extra |
| --- | ----------- | ------- | ---------- | ---- | ------------- | ----------- | ------- | ----- | ---- | -------- | ----- |
| 1   | SIMPLE      | test_kl |            | ref  | name2_index   | name2_index | 83      | const | 1    | 100.00   |       |

结果分析： key_len = 20 + 1 + 2，这个20 + 1我们知道，这个2又代表什么呢？原来varchar属于可变长度，在mysql底层中，用2个字节标识可变长度。

### 6）ref

这里的ref的作用，指明当前表所参照的字段。

注意与type中的ref值区分。在type中，ref只是type类型的一种选项值。
```sql
-- 给course表的tid字段，添加一个索引
create index tid_index on course(tid);
-- 查看执行计划
explain select * from course c,teacher t 
where c.tid = t.tid  
and t.tname = 'tw';
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys        | key        | key_len | ref        | rows | filtered | Extra       |
| --- | ----------- | ----- | ---------- | ---- | -------------------- | ---------- | ------- | ---------- | ---- | -------- | ----------- |
| 1   | SIMPLE      | t     |            | ref  | index_name,tid_index | index_name | 83      | const      | 1    | 100.00   | Using where |
| 1   | SIMPLE      | c     |            | ref  | tid_index            | tid_index  | 5       | test.t.tid | 1    | 100.00   |             |

结果分析： 有两个索引，c表的c.tid引用的是t表的tid字段，因此可以看到显示结果为【数据库名.t.tid】，t表的t.name引用的是一个常量"tw"，因此可以看到结果显示为const，表示一个常量。

### 7）rows(这个目前还是有点疑惑)

被索引优化查询的数据个数 (实际通过索引而查询到的数据个数)
```sql
select * from course;

select * from teacher;

select * from course c, teacher t where c.tid = t.tid and t.tname = 'tz' ;

explain select * from course c,teacher t where c.tid = t.tid and t.tname = 'tz' ;
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys        | key        | key_len | ref        | rows | filtered | Extra       |
| --- | ----------- | ----- | ---------- | ---- | -------------------- | ---------- | ------- | ---------- | ---- | -------- | ----------- |
| 1   | SIMPLE      | t     |            | ref  | index_name,tid_index | index_name | 83      | const      | 2    | 100.00   | Using where |
| 1   | SIMPLE      | c     |            | ref  | tid_index            | tid_index  | 5       | test.t.tid | 1    | 100.00   |             |

### 8）extra

表示其他的一些说明，也很有用。

#### ① using filesort：针对单索引的情况

当出现了这个词，表示你当前的SQL性能消耗较大。表示进行了一次“额外”的排序。常见于order by语句中。

Ⅰ 什么是“额外”的排序？

为了讲清楚这个，我们首先要知道什么是排序。我们为了给某一个字段进行排序的时候，首先你得先查询到这个字段，然后在将这个字段进行排序。

紧接着，我们查看如下两个SQL语句的执行计划。
```sql
-- 新建一张表，建表同时创建索引
create table test02
(   
  a1 char(3),    
  a2 char(3),   
  a3 char(3),   
  index idx_a1(a1),  
  index idx_a2(a2),   
  index idx_a3(a3)
);
-- 查看执行计划
explain select * from test02 where a1 ='' order by a1 ;
explain select * from test02 where a1 ='' order by a2 ; 
```
结果如下：

| id  | select_type | table  | partitions | type | possible_keys | key    | key_len | ref   | rows | filtered | Extra |
| --- | ----------- | ------ | ---------- | ---- | ------------- | ------ | ------- | ----- | ---- | -------- | ----- |
| 1   | SIMPLE      | test02 |            | ref  | idx_a1        | idx_a1 | 13      | const | 1    | 100.00   |       |

| id  | select_type | table  | partitions | type | possible_keys | key    | key_len | ref   | rows | filtered | Extra          |
| --- | ----------- | ------ | ---------- | ---- | ------------- | ------ | ------- | ----- | ---- | -------- | -------------- |
| 1   | SIMPLE      | test02 |            | ref  | idx_a1        | idx_a1 | 13      | const | 1    | 100.00   | Using filesort |

结果分析： 对于第一个执行计划，where后面我们先查询了a1字段，然后再利用a1做了依次排序，这个很轻松。但是对于第二个执行计划，where后面我们查询了a1字段，然而利用的却是a2字段进行排序，此时myql底层会进行一次查询，进行“额外”的排序。

总结：对于单索引，如果排序和查找是同一个字段，则不会出现using filesort；如果排序和查找不是同一个字段，则会出现using filesort；因此where哪些字段，就order by哪些些字段。

#### ② using filesort：针对复合索引的情况

不能跨列(官方术语：最佳左前缀)
```sql
-- 删除test02的索引
drop index idx_a1 on test02;
drop index idx_a2 on test02;
drop index idx_a3 on test02;
-- 创建一个复合索引
alter table test02 add index idx_a1_a2_a3 (a1,a2,a3) ;
-- 查看下面SQL语句的执行计划
explain select * from test02 where a1='' order by a3 ;  -- using filesort
explain select * from test02 where a2='' order by a3 ;  -- using filesort
explain select * from test02 where a1='' order by a2 ;
```
结果如下：

| id  | select_type | table  | partitions | type | possible_keys | key          | key_len | ref   | rows | filtered | Extra                                    |
| --- | ----------- | ------ | ---------- | ---- | ------------- | ------------ | ------- | ----- | ---- | -------- | ---------------------------------------- |
| 1   | SIMPLE      | test02 |            | ref  | idx_a1_a2_a3  | idx_a1_a2_a3 | 13      | const | 1    | 100.00   | Using where; Using index; Using filesort |

| id  | select_type | table  | partitions | type  | possible_keys | key          | key_len | ref | rows | filtered | Extra                                    |
| --- | ----------- | ------ | ---------- | ----- | ------------- | ------------ | ------- | --- | ---- | -------- | ---------------------------------------- |
| 1   | SIMPLE      | test02 |            | index | idx_a1_a2_a3  | idx_a1_a2_a3 | 39      |     | 1    | 100.00   | Using where; Using index; Using filesort |

| id  | select_type | table  | partitions | type | possible_keys | key          | key_len | ref   | rows | filtered | Extra       |
| --- | ----------- | ------ | ---------- | ---- | ------------- | ------------ | ------- | ----- | ---- | -------- | ----------- |
| 1   | SIMPLE      | test02 |            | ref  | idx_a1_a2_a3  | idx_a1_a2_a3 | 13      | const | 1    | 100.00   | Using index |

结果分析： 复合索引的顺序是(a1,a2,a3)，可以看到a1在最左边，因此a1就叫做“最佳左前缀”，如果要使用后面的索引字段，必须先使用到这个a1字段。对于explain1，where后面我们使用a1字段，但是后面的排序使用了a3，直接跳过了a2，属于跨列；对于explain2，where后面我们使用了a2字段，直接跳过了a1字段，也属于跨列；对于explain3，where后面我们使用a1字段，后面使用的是a2字段，因此没有出现【using filesort】。

#### ③ using temporary

当出现了这个词，也表示你当前的SQL性能消耗较大。这是由于当前SQL用到了临时表。一般出现在group by中。
```sql
explain select a1 from test02 where a1 in ('1','2','3') group by a1 ;
explain select a2 from test02 where a1 in ('1','2','3') group by a2 ; --using temporary
```

结果如下：

| id  | select_type | table  | partitions | type  | possible_keys | key          | key_len | ref | rows | filtered | Extra                    |
| --- | ----------- | ------ | ---------- | ----- | ------------- | ------------ | ------- | --- | ---- | -------- | ------------------------ |
| 1   | SIMPLE      | test02 |            | index | idx_a1_a2_a3  | idx_a1_a2_a3 | 39      |     | 1    | 100.00   | Using where; Using index |

| id  | select_type | table  | partitions | type  | possible_keys | key          | key_len | ref | rows | filtered | Extra                                     |
| --- | ----------- | ------ | ---------- | ----- | ------------- | ------------ | ------- | --- | ---- | -------- | ----------------------------------------- |
| 1   | SIMPLE      | test02 |            | index | idx_a1_a2_a3  | idx_a1_a2_a3 | 39      |     | 1    | 100.00   | Using where; Using index; Using temporary |

结果分析： 当你查询哪个字段，就按照那个字段分组，否则就会出现using temporary。

针对using temporary，我们在看一个例子：

using temporary表示需要额外再使用一张表，一般出现在group by语句中。虽然已经有表了，但是不适用，必须再来一张表。

再次来看mysql的编写过程和解析过程。

1. 编写过程
```sql
select dinstinct  ..from  ..join ..on ..where ..group by ..having ..order by ..limit ..
```

2. 解析过程
```sql
from .. on.. join ..where ..group by ..having ..select dinstinct ..order by ..limit ..
```

很显然，where后是group by，然后才是select。基于此，我们再查看如下两个SQL语句的执行计划。
```sql
explain select * from test03 where a2=2 and a4=4 group by a2, a4;
explain select * from test03 where a2=2 and a4=4 group by a3;
```

分析如下： 对于第一个执行计划，where后面是a2和a4，接着我们按照a2和a4分组，很明显这两张表已经有了，直接在a2和a4上分组就行了。但是对于第二个执行计划，where后面是a2和a4，接着我们却按照a3分组，很明显我们没有a3这张表，因此有需要再来一张临时表a3。因此就会出现using temporary。

#### ④ using index

当你看到这个关键词，恭喜你，表示你的SQL性能提升了。

using index称之为“索引覆盖”。

当出现了using index，就表示不用读取源表，而只利用索引获取数据，不需要回源表查询。

只要使用到的列，全部出现在索引中，就是索引覆盖。
```sql
-- 删除test02中的复合索引idx_a1_a2_a3
drop index idx_a1_a2_a3 on test02;
-- 重新创建一个复合索引idx_a1_a2 
create index idx_a1_a2 on test02(a1,a2);
-- 查看执行计划
explain select a1,a3 from test02 where a1='' or a3= '' ;
explain select a1,a2 from test02 where a1='' and a2= '' ;
```
结果如下：

| id  | select_type | table  | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra       |
| --- | ----------- | ------ | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ----------- |
| 1   | SIMPLE      | test02 |            | ALL  | idx_a1_a2     |     |         |     | 1    | 100.00   | Using where |

| id  | select_type | table  | partitions | type | possible_keys | key       | key_len | ref         | rows | filtered | Extra       |
| --- | ----------- | ------ | ---------- | ---- | ------------- | --------- | ------- | ----------- | ---- | -------- | ----------- |
| 1   | SIMPLE      | test02 |            | ref  | idx_a1_a2     | idx_a1_a2 | 26      | const,const | 1    | 100.00   | Using index |

结果分析： 我们创建的是a1和a2的复合索引，对于第一个执行计划，我们却出现了a3，该字段并没有创建索引，因此没有出现using index，而是using where，表示我们需要回表查询。对于第二个执行计划，属于完全的索引覆盖，因此出现了using index。

针对using index，我们在查看一个案例：
```sql
explain select a1,a2 from test02 where a1='' or a2= '' ;
explain select a1,a2 from test02;
```
结果如下：

如果用到了索引覆盖(using index时)，会对possible_keys和key造成影响：

1. 如果没有where，则索引只出现在key中；

2. 如果有where，则索引 出现在key和possible_keys中。

#### ⑤ using where

表示需要【回表查询】，表示既在索引中进行了查询，又回到了源表进行了查询。
```sql
-- 删除test02中的复合索引idx_a1_a2
drop index idx_a1_a2 on test02;
-- 将a1字段，新增为一个索引
create index a1_index on test02(a1);
-- 查看执行计划
explain select a1,a3 from test02 where a1="" and a3="" ;
```
结果如下：

| id  | select_type | table  | partitions | type | possible_keys | key      | key_len | ref   | rows | filtered | Extra                              |
| --- | ----------- | ------ | ---------- | ---- | ------------- | -------- | ------- | ----- | ---- | -------- | ---------------------------------- |
| 1   | SIMPLE      | test02 |            | ref  | a1_index      | a1_index | 13      | const | 1    | 100.00   | Using where |

结果分析： 我们既使用了索引a1，表示我们使用了索引进行查询。但是又对于a3字段，我们并没有使用索引，因此对于a3字段，需要回源表查询，这个时候出现了using where。

#### ⑥ impossible where(了解)

当where子句永远为False的时候，会出现impossible where
```sql
-- 查看执行计划
explain select a1 from test02 where a1="a" and a1="b" ;
```
结果如下：

| id  | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra            |
| --- | ----------- | ----- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ---------------- |
| 1   | SIMPLE      |       |            |      |               |     |         |     |      |          | Impossible WHERE |

## 6、优化示例

### 1）引入案例
```sql
-- 创建新表
create table test03
(  
  a1 int(4) not null,   
  a2 int(4) not null,    
  a3 int(4) not null,   
  a4 int(4) not null
);
-- 创建一个复合索引
create index a1_a2_a3_test03 on test03(a1,a2,a3);
-- 查看执行计划
explain select a3 from test03 where a1=1 and a2=2 and a3=3;
```

结果如下：

| id  | select_type | table  | partitions | type | possible_keys   | key             | key_len | ref               | rows | filtered | Extra       |
| --- | ----------- | ------ | ---------- | ---- | --------------- | --------------- | ------- | ----------------- | ---- | -------- | ----------- |
| 1   | SIMPLE      | test03 |            | ref  | a1_a2_a3_test03 | a1_a2_a3_test03 | 12      | const,const,const | 1    | 100.00   | Using index |

推荐写法： 复合索引顺序和使用顺序一致。

下面看看【不推荐写法】：复合索引顺序和使用顺序不一致。
```sql
-- 查看执行计划
explain select a3 from test03 where a3=1 and a2=2 and a1=3;
```
结果如下：

| id  | select_type | table  | partitions | type | possible_keys   | key             | key_len | ref               | rows | filtered | Extra       |
| --- | ----------- | ------ | ---------- | ---- | --------------- | --------------- | ------- | ----------------- | ---- | -------- | ----------- |
| 1   | SIMPLE      | test03 |            | ref  | a1_a2_a3_test03 | a1_a2_a3_test03 | 12      | const,const,const | 1    | 100.00   | Using index |

结果分析： 虽然结果和上述结果一致，但是不推荐这样写。但是这样写怎么又没有问题呢？这是由于SQL优化器的功劳，它帮我们调整了顺序。

最后再补充一点：对于复合索引，不要跨列使用
```sql
-- 查看执行计划
explain select a3 from test03 where a1=1 and a3=2 group by a3;
```
结果如下：

| id  | select_type | table  | partitions | type | possible_keys   | key             | key_len | ref   | rows | filtered | Extra                    |
| --- | ----------- | ------ | ---------- | ---- | --------------- | --------------- | ------- | ----- | ---- | -------- | ------------------------ |
| 1   | SIMPLE      | test03 |            | ref  | a1_a2_a3_test03 | a1_a2_a3_test03 | 4       | const | 1    | 100.00   | Using where; Using index |

结果分析： a1_a2_a3是一个复合索引，我们使用a1索引后，直接跨列使用了a3，直接跳过索引a2，因此索引a3失效了，当使用a3进行分组的时候，就会出现using where。

### 2）单表优化
```sql
-- 创建新表
create table book
(    
    bid int(4) primary key,      
    name varchar(20) not null,     
    authorid int(4) not null,     
    publicid int(4) not null,    
    typeid int(4) not null 
);
-- 插入数据
insert into book values(1,'tjava',1,1,2) ;
insert into book values(2,'tc',2,1,2) ;
insert into book values(3,'wx',3,2,1) ;
insert into book values(4,'math',4,2,3) ;  

select * from book;
```

结果如下：

| bid | name  | authorid | publicid | typeid |
| --- | ----- | -------- | -------- | ------ |
| 1   | tjava | 1        | 1        | 2      |
| 2   | tc    | 2        | 1        | 2      |
| 3   | wx    | 3        | 2        | 1      |
| 4   | math  | 4        | 2        | 3      |

案例：查询authorid=1且typeid为2或3的bid，并根据typeid降序排列。
```sql
explain 
select bid from book 
where typeid in(2,3) and authorid=1 
order by typeid desc ;    
```
结果如下：

| id  | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra                       |
| --- | ----------- | ----- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | --------------------------- |
| 1   | SIMPLE      | book  |            | ALL  |               |     |         |     | 4    | 25.00    | Using where; Using filesort |

这是没有进行任何优化的SQL，可以看到typ为ALL类型，extra为using filesort，可以想象这个SQL有多恐怖。

优化：添加索引的时候，要根据MySQL解析顺序添加索引，又回到了MySQL的解析顺序，下面我们再来看看MySQL的解析顺序。
```sql
from .. on.. join ..where ..group by ..having ..select dinstinct ..order by ..limit ..
```

#### ① 优化1：基于此，我们进行索引的添加，并再次查看执行计划。
```sql
-- 添加索引
create index typeid_authorid_bid on book(typeid,authorid,bid);
-- 再次查看执行计划
explain 
select bid from book 
where typeid in(2,3) and authorid=1  
order by typeid desc ;
```

结果如下：

| id  | select_type | table | partitions | type  | possible_keys       | key                 | key_len | ref | rows | filtered | Extra                                         |
| --- | ----------- | ----- | ---------- | ----- | ------------------- | ------------------- | ------- | --- | ---- | -------- | --------------------------------------------- |
| 1   | SIMPLE      | book  |            | range | typeid_authorid_bid | typeid_authorid_bid | 8       |     | 2    | 100.00   | Using where; Backward index scan; Using index |

结果分析： 结果并不是和我们想象的一样，还是出现了using where，查看索引长度key_len=8，表示我们只使用了2个索引，有一个索引失效了。

#### ② 优化2：使用了in有时候会导致索引失效，基于此有了如下一种优化思路。

将in字段放在最后面。需要注意一点：每次创建新的索引的时候，最好是删除以前的废弃索引，否则有时候会产生干扰(索引之间)。
```sql
-- 删除以前的索引
drop index typeid_authorid_bid on book;
-- 再次创建索引
create index authorid_typeid_bid on book(authorid,typeid,bid);
-- 再次查看执行计划
explain 
select bid from book 
where authorid=1  and typeid in(2,3) 
order by typeid desc ;
```

结果如下：

| id  | select_type | table | partitions | type  | possible_keys       | key                 | key_len | ref | rows | filtered | Extra                                         |
| --- | ----------- | ----- | ---------- | ----- | ------------------- | ------------------- | ------- | --- | ---- | -------- | --------------------------------------------- |
| 1   | SIMPLE      | book  |            | range | authorid_typeid_bid | authorid_typeid_bid | 8       |     | 2    | 100.00   | Using where; Backward index scan; Using index |

结果分析： 这里虽然没有变化，但是这是一种优化思路。

总结如下：

1. 最佳做前缀，保持索引的定义和使用的顺序一致性

2. 索引需要逐步优化(每次创建新索引，根据情况需要删除以前的废弃索引)

3. 将含In的范围查询，放到where条件的最后，防止失效。

本例中同时出现了Using where（需要回原表）; Using index（不需要回原表）：原因，where authorid=1 and typeid in(2,3)中authorid在索引(authorid,typeid,bid)中，因此不需要回原表（直接在索引表中能查到）；而typeid虽然也在索引(authorid,typeid,bid)中，但是含in的范围查询已经使该typeid索引失效，因此相当于没有typeid这个索引，所以需要回原表（using where）；

例如以下没有了In，则不会出现using where：
```sql
explain select bid from book 
where  authorid=1 and typeid =3
order by typeid desc ;
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys       | key                 | key_len | ref         | rows | filtered | Extra       |
| --- | ----------- | ----- | ---------- | ---- | ------------------- | ------------------- | ------- | ----------- | ---- | -------- | ----------- |
| 1   | SIMPLE      | book  |            | ref  | authorid_typeid_bid | authorid_typeid_bid | 8       | const,const | 1    | 100.00   | Using index |

### 3）两表优化
```sql
-- 创建teacher2新表
create table teacher2
(      
    tid int(4) primary key,     
    cid int(4) not null
);
-- 插入数据
insert into teacher2 values(1,2);
insert into teacher2 values(2,1);
insert into teacher2 values(3,3);
-- 创建course2新表
create table course2
(  
    cid int(4) ,  
    cname varchar(20)
);
-- 插入数据
insert into course2 values(1,'java');
insert into course2 values(2,'python');
insert into course2 values(3,'kotlin');
```

案例：使用一个左连接，查找教java课程的所有信息。
```sql
explain 
select *
from teacher2 t
left outer join course2 c
on t.cid=c.cid 
where c.cname='java';
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra                                      |
| --- | ----------- | ----- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ------------------------------------------ |
| 1   | SIMPLE      | c     |            | ALL  |               |     |         |     | 3    | 33.33    | Using where                                |
| 1   | SIMPLE      | t     |            | ALL  |               |     |         |     | 3    | 33.33    | Using where; Using join buffer (hash join) |

#### ① 优化

对于两张表，索引往哪里加？答：对于表连接，小表驱动大表。索引建立在经常使用的字段上。

为什么小表驱动大表好一些呢？
```sql
-- 小表:10   
-- 大表:300

-- 小表驱动大表
select ...where 小表.x10=大表.x300 ;
for(int i=0;i<小表.length10;i++)
{   
    for(int j=0;j<大表.length300;j++)  
    {       
        ...   
    }
}
-- 大表驱动小表
select ...where 大表.x300=小表.x10 ;
for(int i=0;i<大表.length300;i++)
{  
    for(int j=0;j<小表.length10;j++)   
    {     
        ...   
    }
}
```

分析： 以上2个FOR循环，最终都会循环3000次；但是对于双层循环来说：一般建议，将数据小的循环，放外层。数据大的循环，放内层。不用管这是为什么，这是编程语言的一个原则，对于双重循环，外层循环少，内存循环大，程序的性能越高。

结论：当编写【…on t.cid=c.cid】时，将数据量小的表放左边（假设此时t表数据量小，c表数据量大。）

我们已经知道了，对于两表连接，需要利用小表驱动大表，例如【…on t.cid=c.cid】，t如果是小表(10条)，c如果是大表(300条)，那么t每循环1次，就需要循环300次，即t表的t.cid字段属于，经常使用的字段，因此需要给cid字段添加索引。

更深入的说明： 一般情况下，左连接给左表加索引。右连接给右表加索引。其他表需不需要加索引，我们逐步尝试。
```sql
-- 给左表的字段加索引
create index cid_teacher2 on teacher2(cid);
-- 查看执行计划
explain 
select *
from teacher2 t 
left outer join course2 c
on t.cid=c.cid
where c.cname='java';
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys | key          | key_len | ref         | rows | filtered | Extra       |
| --- | ----------- | ----- | ---------- | ---- | ------------- | ------------ | ------- | ----------- | ---- | -------- | ----------- |
| 1   | SIMPLE      | c     |            | ALL  |               |              |         |             | 3    | 33.33    | Using where |
| 1   | SIMPLE      | t     |            | ref  | cid_teacher2  | cid_teacher2 | 4       | light.c.cid | 1    | 100.00   | Using index |

当然你可以下去接着优化，给cname添加一个索引。索引优化是一个逐步的过程，需要一点点尝试。
```sql
-- 给cname的字段加索引
create index cname_course2 on course2(cname);
-- 查看执行计划
explain
select t.cid,c.cname
from teacher2 t
left outer join course2 c
on t.cid=c.cid 
where c.cname='java';
```

结果如下：

| id  | select_type | table | partitions | type | possible_keys | key           | key_len | ref         | rows | filtered | Extra       |
| --- | ----------- | ----- | ---------- | ---- | ------------- | ------------- | ------- | ----------- | ---- | -------- | ----------- |
| 1   | SIMPLE      | c     |            | ref  | cname_course2 | cname_course2 | 83      | const       | 1    | 100.00   | Using where |
| 1   | SIMPLE      | t     |            | ref  | cid_teacher2  | cid_teacher2  | 4       | light.c.cid | 1    | 100.00   | Using index |

最后补充一个：Using join buffer是extra中的一个选项，表示Mysql引擎使用了“连接缓存”，即MySQL底层动了你的SQL，你写的太差了。

### 4）三表优化

- 大于等于张表，优化原则一样
- 小表驱动大表
- 索引建立在经常查询的字段上

## 7、避免索引失效的一些原则

### ① 复合索引需要注意的点

- 复合索引，不要跨列或无序使用(最佳左前缀)
- 复合索引，尽量使用全索引匹配，也就是说，你建立几个索引，就使用几个索引
### ② 不要在索引上进行任何操作(计算、函数、类型转换)，否则索引失效
```sql
explain select * from book where authorid = 1 and typeid = 2;
explain select * from book where authorid*2 = 1 and typeid = 2 ;
```
结果如下：

| id  | select_type | table | partitions | type | possible_keys       | key                 | key_len | ref         | rows | filtered | Extra |
| --- | ----------- | ----- | ---------- | ---- | ------------------- | ------------------- | ------- | ----------- | ---- | -------- | ----- |
| 1   | SIMPLE      | book  |            | ref  | authorid_typeid_bid | authorid_typeid_bid | 8       | const,const | 1    | 100.00   |       |

| id  | select_type | table | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra       |
| --- | ----------- | ----- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ----------- |
| 1   | SIMPLE      | book  |            | ALL  |               |     |         |     | 4    | 25.00    | Using where |

### ③ 索引不能使用不等于（`!=` `<>`）或`is null` (`is not null`)，否则自身以及右侧所有全部失效(针对大多数情况)。复合索引中如果有>，则自身和右侧索引全部失效。
```sql
-- 针对不是复合索引的情况
explain select * from book where authorid != 1 and typeid =2 ;
explain select * from book where authorid = 1 and typeid !=2 ;
explain select * from book where authorid != 1 and typeid !=2 ;
```

结果如下：

| id  | select_type | table | partitions | type  | possible_keys       | key                 | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ----- | ---------- | ----- | ------------------- | ------------------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | book  |            | range | authorid_typeid_bid | authorid_typeid_bid | 4       |     | 4    | 25.00    | Using index condition |

| id  | select_type | table | partitions | type  | possible_keys                   | key                 | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ----- | ---------- | ----- | ------------------------------- | ------------------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | book  |            | range | authorid_typeid_bid,idx_book_at | authorid_typeid_bid | 8       |     | 2    | 100.00   | Using index condition |

| id  | select_type | table | partitions | type  | possible_keys       | key                 | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ----- | ---------- | ----- | ------------------- | ------------------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | book  |            | range | authorid_typeid_bid | authorid_typeid_bid | 4       |     | 4    | 75.00    | Using index condition |

再观看下面这个案例：
```sql
-- 删除单独的索引
drop index authorid_index on book;
drop index typeid_index on book;
-- 创建一个复合索引
alter table book add index idx_book_at (authorid,typeid);
-- 查看执行计划
explain select * from book where authorid > 1 and typeid = 2 ;
explain select * from book where authorid = 1 and typeid > 2 ;
```

结果如下：


| id  | select_type | table | partitions | type  | possible_keys                   | key                 | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ----- | ---------- | ----- | ------------------------------- | ------------------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | book  |            | range | authorid_typeid_bid,idx_book_at | authorid_typeid_bid | 4       |     | 3    | 25.00    | Using index condition |


| id  | select_type | table | partitions | type  | possible_keys                   | key                 | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ----- | ---------- | ----- | ------------------------------- | ------------------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | book  |            | range | authorid_typeid_bid,idx_book_at | authorid_typeid_bid | 8       |     | 1    | 100.00   | Using index condition |

结论：复合索引中如果有`【>】`，则自身和右侧索引全部失效。

在看看复合索引中有`【<】`的情况：
```sql
explain select * from book where authorid < 1 and typeid = 2 ;
explain select * from book where authorid < 4 and typeid = 2 ;
```

| id  | select_type | table | partitions | type  | possible_keys                   | key                 | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ----- | ---------- | ----- | ------------------------------- | ------------------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | book  |            | range | authorid_typeid_bid,idx_book_at | authorid_typeid_bid | 4       |     | 1    | 25.00    | Using index condition |

| id  | select_type | table | partitions | type  | possible_keys                   | key                 | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ----- | ---------- | ----- | ------------------------------- | ------------------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | book  |            | range | authorid_typeid_bid,idx_book_at | authorid_typeid_bid | 4       |     | 3    | 25.00    | Using index condition |

我们学习索引优化 ，是一个大部分情况适用的结论，但由于SQL优化器等原因 该结论不是100%正确。一般而言， 范围查询（> < in），之后的索引失效。

### ④ SQL优化，是一种概率层面的优化。至于是否实际使用了我们的优化，需要通过explain进行推测。
```sql
-- 删除复合索引
drop index authorid_typeid_bid on book;
-- 为authorid和typeid，分别创建索引
create index authorid_index on book(authorid);
create index typeid_index on book(typeid);
-- 查看执行计划
explain select * from book where authorid = 1 and typeid =2 ;
```
结果如下：

| id  | select_type | table | partitions | type | possible_keys                           | key         | key_len | ref         | rows | filtered | Extra |
| --- | ----------- | ----- | ---------- | ---- | --------------------------------------- | ----------- | ------- | ----------- | ---- | -------- | ----- |
| 1   | SIMPLE      | book  |            | ref  | idx_book_at,authorid_index,typeid_index | idx_book_at | 8       | const,const | 1    | 100.00   |       |


结果分析： 我们创建了两个索引，但是实际上只使用了一个索引。因为对于两个单独的索引，程序觉得只用一个索引就够了，不需要使用两个。

当我们创建一个复合索引，再次执行上面的SQL：

```sql
create index authorid_typeid_index on book(authorid, typeid);
-- 查看执行计划
explain select * from book where authorid = 1 and typeid =2 ;
```
结果如下：

| id  | select_type | table | partitions | type | possible_keys                                                 | key         | key_len | ref         | rows | filtered | Extra |
| --- | ----------- | ----- | ---------- | ---- | ------------------------------------------------------------- | ----------- | ------- | ----------- | ---- | -------- | ----- |
| 1   | SIMPLE      | book  |            | ref  | idx_book_at,authorid_index,typeid_index,authorid_typeid_index | idx_book_at | 8       | const,const | 1    | 100.00   |       |

### ⑤ 索引覆盖，百分之百没问题

### ⑥ like尽量以“常量”开头，不要以’%'开头，否则索引失效
```sql
explain select * from teacher where tname like "%x%" ;
explain select * from teacher  where tname like 'x%';
explain select tname from teacher  where tname like '%x%';
```

结果如下：

| id  | select_type | table   | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra       |
| --- | ----------- | ------- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ----------- |
| 1   | SIMPLE      | teacher |            | ALL  |               |     |         |     | 4    | 25.00    | Using where |

| id  | select_type | table   | partitions | type  | possible_keys | key        | key_len | ref | rows | filtered | Extra                 |
| --- | ----------- | ------- | ---------- | ----- | ------------- | ---------- | ------- | --- | ---- | -------- | --------------------- |
| 1   | SIMPLE      | teacher |            | range | index_name    | index_name | 83      |     | 1    | 100.00   | Using index condition |

| id  | select_type | table   | partitions | type       | possible_keys | key | key_len | ref | rows | filtered | Extra                    |
| --- | ----------- | ------- | ---------- | ---------- | ------------- | --- | ------- | --- | ---- | -------- | ------------------------ |
| 1   | SIMPLE      | teacher | index      | index_name | 83            |     |         |     | 4    | 25.00    | Using where; Using index |


结论如下： like尽量不要使用类似"%x%"情况，但是可以使用"x%"情况。如果非使用 "%x%"情况，需要使用索引覆盖。

### ⑦ 尽量不要使用类型转换（显示、隐式），否则索引失效
```sql
explain select * from teacher where tname = 'abc' ;
explain select * from teacher where tname = 123 ;
```
结果如下：

| id  | select_type | table   | partitions | type | possible_keys | key        | key_len | ref   | rows | filtered | Extra |
| --- | ----------- | ------- | ---------- | ---- | ------------- | ---------- | ------- | ----- | ---- | -------- | ----- |
| 1   | SIMPLE      | teacher |            | ref  | index_name    | index_name | 83      | const | 1    | 100.00   |       |

| id  | select_type | table   | partitions | type | possible_keys | key | key_len | ref | rows | filtered | Extra       |
| --- | ----------- | ------- | ---------- | ---- | ------------- | --- | ------- | --- | ---- | -------- | ----------- |
| 1   | SIMPLE      | teacher |            | ALL  | index_name    |     |         |     | 4    | 25.00    | Using where |

### ⑧ 尽量不要使用or，否则索引失效
```sql
explain select * from teacher where tname ='' and tcid >1 ;
explain select * from teacher where tname ='' or tcid >1 ;
```
结果如下：

| id  | select_type | table   | partitions | type | possible_keys      | key        | key_len | ref   | rows | filtered | Extra       |
| --- | ----------- | ------- | ---------- | ---- | ------------------ | ---------- | ------- | ----- | ---- | -------- | ----------- |
| 1   | SIMPLE      | teacher |            | ref  | uk_tcid,index_name | index_name | 83      | const | 1    | 75.00    | Using where |

| id  | select_type | table   | partitions | type | possible_keys      | key | key_len | ref | rows | filtered | Extra       |
| --- | ----------- | ------- | ---------- | ---- | ------------------ | --- | ------- | --- | ---- | -------- | ----------- |
| 1   | SIMPLE      | teacher |            | ALL  | uk_tcid,index_name |     |         |     | 4    | 55.55    | Using where |

注意：or很猛，会让自身索引和左右两侧的索引都失效。

## 8、一些其他的优化方法

### 1）exists和in的优化

如果主查询的数据集大，则使用i关键字，效率高。

如果子查询的数据集大，则使用exist关键字,效率高。
```sql
select ..from table where exist (子查询) ;
select ..from table where 字段 in  (子查询) ;
```

### 2）order by优化

- IO就是访问硬盘文件的次数
- using filesort 有两种算法：双路排序、单路排序（根据IO的次数）
- MySQL4.1之前默认使用双路排序；双路：扫描2次磁盘(1：从磁盘读取排序字段,对排序字段进行排序(在buffer中进行的排序)2：扫描其他字段)
- MySQL4.1之后默认使用单路排序：只读取一次（全部字段），在buffer中进行排序。但种单路排序会有一定的隐患(不一定真的是“单路/1次IO”，有可能多次IO)。原因：如果数据量特别大，则无法将所有字段的数据一次性读取完毕，因此会进行“分片读取、多次读取”。

- 注意：单路排序 比双路排序 会占用更多的buffer。
- 单路排序在使用时，如果数据大，可以考虑调大buffer的容量大小：
```sql
-- 不一定真的是“单路/1次IO”，有可能多次IO
set max_length_for_sort_data = 1024 
```

如果max_length_for_sort_data值太低，则mysql会自动从 单路->双路(太低：需要排序的列的总大小超过了max_length_for_sort_data定义的字节数)

#### ① 提高order by查询的策略：

- 选择使用单路、双路 ；调整buffer的容量大小
- 避免使用select * …（select后面写所有字段，也比写*效率高）
- 复合索引，不要跨列使用 ，避免using filesort保证全部的排序字段，排序的一致性（都是升序或降序）

篇幅很长，内容较多，建议收藏。
