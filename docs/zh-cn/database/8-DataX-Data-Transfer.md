- [DataX Github](https://github.com/alibaba/DataX)
- [DataX-Web Github](https://github.com/WeiYe-Jing/datax-web)

DataX 是阿里巴巴集团内被广泛使用的离线数据同步工具/平台，实现包括 MySQL、SQL Server、Oracle、PostgreSQL、HDFS、Hive、HBase、OTS、ODPS 等各种异构数据源之间高效的数据同步功能。

## 一、环境要求
- Linux
- [JDK](http://www.oracle.com/technetwork/cn/java/javase/downloads/index.html)  (1.8以上，推荐1.8)
- [Python](https://www.python.org/downloads/)   (2或3都可以)
- [Apache Maven 3.x](https://maven.apache.org/download.cgi)  (Compile DataX)

```shell
# 安装python
apt install -y python3 python-is-python3
```

从 `datax-web/doc/datax-web/datax-python3` 将脚本复制到DataX的安装目录

## 二、DataX的安装 
- [DataX User Guide](https://github.com/alibaba/DataX/blob/master/userGuid.md)

### 1. 使用官方安装包
- [下载地址](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202309/datax.tar.gz)

```shell
# 解压
tar -zxvf datax.tar.gz

# 进入bin目录
cd  datax/bin

# 运行脚本
python datax.py stream2stream.json
```

### 2. 从源码编译
```shell
# 下载源码
git clone https://github.com/alibaba/DataX.git

# 进入源码目录
cd DataX

# 编译打包
mvn -U clean package assembly:assembly -Dmaven.test.skip=true
```

### 3. 测试

`stream2stream.json`
```json
{
  "job": {
    "content": [
      {
        "reader": {
          "name": "streamreader",
          "parameter": {
            "sliceRecordCount": 10,
            "column": [
              {
                "type": "long",
                "value": "10"
              },
              {
                "type": "string",
                "value": "hello，你好，世界-DataX"
              }
            ]
          }
        },
        "writer": {
          "name": "streamwriter",
          "parameter": {
            "encoding": "UTF-8",
            "print": true
          }
        }
      }
    ],
    "setting": {
      "speed": {
        "channel": 5
       }
    }
  }
}
```

测试输出如下
```shell
~/datax/datax/bin$ python datax.py stream2stream.json

DataX (DATAX-OPENSOURCE-3.0), From Alibaba !
Copyright (C) 2010-2017, Alibaba Group. All Rights Reserved.


2024-02-03 14:06:39.422 [main] INFO  MessageSource - JVM TimeZone: GMT+08:00, Locale: zh_CN
2024-02-03 14:06:39.423 [main] INFO  MessageSource - use Locale: zh_CN timeZone: sun.util.calendar.ZoneInfo[id="GMT+08:00",offset=28800000,dstSavings=0,useDaylight=false,transitions=0,lastRule=null]
2024-02-03 14:06:39.430 [main] INFO  VMInfo - VMInfo# operatingSystem class => sun.management.OperatingSystemImpl
2024-02-03 14:06:39.433 [main] INFO  Engine - the machine info  =>

        osInfo: Linux amd64 5.10.16.3-microsoft-standard-WSL2
        jvmInfo:        Oracle Corporation 1.8 25.40-b25
        cpu num:        20

        totalPhysicalMemory:    -0.00G
        freePhysicalMemory:     -0.00G
        maxFileDescriptorCount: -1
        currentOpenFileDescriptorCount: -1

        GC Names        [PS MarkSweep, PS Scavenge]

        MEMORY_NAME                    | allocation_size                | init_size
        PS Eden Space                  | 256.00MB                       | 256.00MB
        Code Cache                     | 240.00MB                       | 2.44MB
        Compressed Class Space         | 1,024.00MB                     | 0.00MB
        PS Survivor Space              | 42.50MB                        | 42.50MB
        PS Old Gen                     | 683.00MB                       | 683.00MB
        Metaspace                      | -0.00MB                        | 0.00MB


2024-02-03 14:06:39.439 [main] INFO  Engine -
{
        "content":[
                {
                        "reader":{
                                "name":"streamreader",
                                "parameter":{
                                        "sliceRecordCount":10,
                                        "column":[
                                                {
                                                        "type":"long",
                                                        "value":"10"
                                                },
                                                {
                                                        "type":"string",
                                                        "value":"hello，你好，世界-DataX"
                                                }
                                        ]
                                }
                        },
                        "writer":{
                                "name":"streamwriter",
                                "parameter":{
                                        "encoding":"UTF-8",
                                        "print":true
                                }
                        }
                }
        ],
        "setting":{
                "speed":{
                        "channel":5
                }
        }
}

2024-02-03 14:06:39.450 [main] INFO  PerfTrace - PerfTrace traceId=job_-1, isEnable=false
2024-02-03 14:06:39.450 [main] INFO  JobContainer - DataX jobContainer starts job.
2024-02-03 14:06:39.450 [main] INFO  JobContainer - Set jobId = 0
2024-02-03 14:06:39.461 [job-0] INFO  JobContainer - jobContainer starts to do prepare ...
2024-02-03 14:06:39.461 [job-0] INFO  JobContainer - DataX Reader.Job [streamreader] do prepare work .
2024-02-03 14:06:39.461 [job-0] INFO  JobContainer - DataX Writer.Job [streamwriter] do prepare work .
2024-02-03 14:06:39.461 [job-0] INFO  JobContainer - jobContainer starts to do split ...
2024-02-03 14:06:39.461 [job-0] INFO  JobContainer - Job set Channel-Number to 5 channels.
2024-02-03 14:06:39.462 [job-0] INFO  JobContainer - DataX Reader.Job [streamreader] splits to [5] tasks.
2024-02-03 14:06:39.462 [job-0] INFO  JobContainer - DataX Writer.Job [streamwriter] splits to [5] tasks.
2024-02-03 14:06:39.477 [job-0] INFO  JobContainer - jobContainer starts to do schedule ...
2024-02-03 14:06:39.480 [job-0] INFO  JobContainer - Scheduler starts [1] taskGroups.
2024-02-03 14:06:39.481 [job-0] INFO  JobContainer - Running by standalone Mode.
2024-02-03 14:06:39.484 [taskGroup-0] INFO  TaskGroupContainer - taskGroupId=[0] start [5] channels for [5] tasks.
2024-02-03 14:06:39.487 [taskGroup-0] INFO  Channel - Channel set byte_speed_limit to -1, No bps activated.
2024-02-03 14:06:39.487 [taskGroup-0] INFO  Channel - Channel set record_speed_limit to -1, No tps activated.
2024-02-03 14:06:39.492 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[3] attemptCount[1] is started
2024-02-03 14:06:39.494 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[4] attemptCount[1] is started
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
2024-02-03 14:06:39.496 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[1] attemptCount[1] is started
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
2024-02-03 14:06:39.498 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[0] attemptCount[1] is started
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
2024-02-03 14:06:39.499 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[2] attemptCount[1] is started
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
10      hello，你好，世界-DataX
2024-02-03 14:06:39.600 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[0] is successed, used[102]ms
2024-02-03 14:06:39.600 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[1] is successed, used[104]ms
2024-02-03 14:06:39.600 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[2] is successed, used[101]ms
2024-02-03 14:06:39.600 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[3] is successed, used[108]ms
2024-02-03 14:06:39.600 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] taskId[4] is successed, used[107]ms
2024-02-03 14:06:39.600 [taskGroup-0] INFO  TaskGroupContainer - taskGroup[0] completed it's tasks.
2024-02-03 14:06:49.490 [job-0] INFO  StandAloneJobContainerCommunicator - Total 50 records, 950 bytes | Speed 95B/s, 5 records/s | Error 0 records, 0 bytes |  All Task WaitWriterTime 0.000s |  All Task WaitReaderTime 0.003s | Percentage 100.00%
2024-02-03 14:06:49.490 [job-0] INFO  AbstractScheduler - Scheduler accomplished all tasks.
2024-02-03 14:06:49.490 [job-0] INFO  JobContainer - DataX Writer.Job [streamwriter] do post work.
2024-02-03 14:06:49.491 [job-0] INFO  JobContainer - DataX Reader.Job [streamreader] do post work.
2024-02-03 14:06:49.491 [job-0] INFO  JobContainer - DataX jobId [0] completed successfully.
2024-02-03 14:06:49.491 [job-0] INFO  HookInvoker - No hook invoked, because base dir not exists or is a file: /home/light/datax/datax/hook
2024-02-03 14:06:49.492 [job-0] INFO  JobContainer -
         [total cpu info] =>
                averageCpu                     | maxDeltaCpu                    | minDeltaCpu
                -1.00%                         | -1.00%                         | -1.00%


         [total gc info] =>
                 NAME                 | totalGCCount       | maxDeltaGCCount    | minDeltaGCCount    | totalGCTime        | maxDeltaGCTime     | minDeltaGCTime
                 PS MarkSweep         | 0                  | 0                  | 0                  | 0.000s             | 0.000s             | 0.000s
                 PS Scavenge          | 0                  | 0                  | 0                  | 0.000s             | 0.000s             | 0.000s

2024-02-03 14:06:49.492 [job-0] INFO  JobContainer - PerfTrace not enable!
2024-02-03 14:06:49.493 [job-0] INFO  StandAloneJobContainerCommunicator - Total 50 records, 950 bytes | Speed 95B/s, 5 records/s | Error 0 records, 0 bytes |  All Task WaitWriterTime 0.000s |  All Task WaitReaderTime 0.003s | Percentage 100.00%
2024-02-03 14:06:49.493 [job-0] INFO  JobContainer -
任务启动时刻                    : 2024-02-03 14:06:39
任务结束时刻                    : 2024-02-03 14:06:49
任务总计耗时                    :                 10s
任务平均流量                    :               95B/s
记录写入速度                    :              5rec/s
读出记录总数                    :                  50
读写失败总数                    :                   0
```

## 三、DataX-Web的安装
- [DataX-Web User Guide](https://github.com/WeiYe-Jing/datax-web/blob/master/userGuid.md)

安装官方文档，只能得到一个很复杂的目录结构，不推荐使用
```shell
git clone https://github.com/WeiYe-Jing/datax-web

cd datax-web

mvn clean install
```

### 1. 配置源码包

主要是修改，`datax-admin` 和 `datax-executor` 两个模块

#### 1. 修改`pom.xml`，添加打包插件，直接打可执行 `fat-jar`
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <source>${java.version}</source>
        <target>${java.version}</target>
    </configuration>
</plugin>
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <!-- 注意：admin 和 executor 启动类名称不一样-->
        <mainClass>com.wugui.datax.admin.DataXAdminApplication</mainClass>
        <includeSystemScope>true</includeSystemScope>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>repackage</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

#### 2. 修改 `application.yml`

指定以下内容:
- 数据传输规则存储数据源
- DataX安装位置
- 数据同步脚本位置
- 应用运行端口
- 日志存储位置

### 2. Bug修复及优化
#### 1. 数据表名称的解析

因为需要兼容多种数据库，框架默认的SQL语句对某些场景不兼容，需要做一些额外的处理。重点是表名称部分。
- Mysql 表名可以直接解析，如果要加符号包裹，只能使用 **`**
- Pgsql 大写的表名需要带上 **"**， 否则会解析为小写
- Oracle 所有的表名都需要使用 **"** 包裹，否则会报错
- SqlServer 对于表名直接解析没有问题，如果要加符号包裹，只能使用 **"**

在 `com.wugui.datax.admin.tool.query.BaseQueryTool` 中增加以下函数，在 `com.wugui.datax.admin.tool.query.BaseQueryTool#getColumnNames` 等出现 `tableName` 的地方，调用 `enhanceTableName()` 对tableName进行处理后在进行后续的查询
```java
/**
 * 处理数据表名称
 * Mysql        `user`
 * Pgsql        "public"."user"
 * Oracle       "user"
 * SqlServer    [dbo].[user] "dbo"."user"
 */
private String enhanceTableName(String tableName) throws SQLException {
    String delimiter = "\"";
    DbType datasourceType = getDatasourceType();
    if (DbType.MYSQL.equals(datasourceType)) {
        delimiter = "`";
    } else if (DbType.POSTGRE_SQL.equals(datasourceType)) {
        delimiter = "\"";
    } else if (DbType.ORACLE.equals(datasourceType)
            || DbType.ORACLE_12C.equals(datasourceType)) {
        delimiter = "\"";
    } else if (DbType.SQL_SERVER.equals(datasourceType)
            || DbType.SQL_SERVER2005.equals(datasourceType)) {
        delimiter = "\"";
    }
    tableName = delimiter + String.join(delimiter + "." + delimiter, tableName.split("\\.")) + delimiter;
    return tableName;
}

/**
 * 获取数据源的类型
 */
public DbType getDatasourceType() throws SQLException {
    DatabaseMetaData metaData = connection.getMetaData();
    // Type: MySQL,                 Version: 8.0.35
    // Type: Microsoft SQL Server,  Version: 15.00.4335
    // Type: PostgreSQL,            Version: 15.3 (Debian 15.3-1.pgdg120+1)
    // Type: Oracle,                Version: Oracle Database 12c Enterprise Edition Release 12.2.0.1.0 - 64bit Production
    String typeName = metaData.getDatabaseProductName();
    String typeVersion = metaData.getDatabaseProductVersion();
    if ("MySQL".equals(typeName)) {
        return DbType.MYSQL;
    } else if ("MARIADB".equals(typeName)) {
        return DbType.MARIADB;
    } else if ("PostgreSQL".equals(typeName)) {
        return DbType.POSTGRE_SQL;
    } else if ("Microsoft SQL Server".equals(typeName)) {
        return DbType.SQL_SERVER;
    } else if ("Microsoft SQL Server".equals(typeName) && typeVersion.contains("2005")) {
        return DbType.SQL_SERVER2005;
    } else if ("Oracle".equals(typeName)) {
        return DbType.ORACLE;
    } else if ("Oracle".equals(typeName) && typeVersion.contains("12c")) {
        return DbType.ORACLE_12C;
    }
    return null;
}
```

| 序号 | 数据库类型 | SQL中的表名               | Json中的表名                      |
| ---- | ---------- | ------------------------- | --------------------------------- |
| 1    | Mysql      | `user`                    | "`user`"                          |
| 2    | Pgsql      | "public"."user"           | "\"public\".\"user\""             |
| 3    | Oracle     | "user"                    | "\"user\""                        |
| 4    | SqlServer  | [dbo].[user] "dbo"."user" | "[dbo].[user]" "\"dbo\".\"user\"" |

#### 2. 生成的json脚本数据表名问题
在生成Json脚本的处理类 `com.wugui.datax.admin.tool.datax.DataxJsonHelper` 中做如下修改，无关代码已省略
```java
public void initReader(DataXJsonBuildDto dataxJsonDto, JobDatasource readerDatasource) {

    // ignore ....
    this.readerTables = dataxJsonDto.getReaderTables().stream()
            .map(tableName -> enhanceTableName(readerDatasource.getDatasource(), tableName))
            .collect(Collectors.toList());
    // ignore ....
}

public void initWriter(DataXJsonBuildDto dataxJsonDto, JobDatasource readerDatasource) {
    // ignore ....
    this.writerTables = dataxJsonDto.getWriterTables().stream()
            .map(tableName -> enhanceTableName(readerDatasource.getDatasource(), tableName))
            .collect(Collectors.toList());
    // ignore ....
}

public String enhanceTableName(String databaseType, String tableName) {
    String leftTag = "";
    String rightTag = "";
    if (JdbcConstants.MYSQL.equals(databaseType)) {
        // Mysql 只能使用 `table_name`
        leftTag = "`";
        rightTag = "`";
    } else if (JdbcConstants.POSTGRESQL.equals(databaseType)) {
        // Pgsql 只能使用 "table_name"
        leftTag = "\"";
        rightTag = "\"";
    } else if (JdbcConstants.ORACLE.equals(databaseType)) {
        // Oracle 只能使用 "table_name"
        leftTag = "\"";
        rightTag = "\"";
    } else if (JdbcConstants.SQL_SERVER.equals(databaseType)) {
        // SQL Server 可以使用 "table_name" 或者 [table_name]
        leftTag = "[";
        rightTag = "]";
    }
    tableName = leftTag + String.join(rightTag + "." + leftTag, tableName.split("\\.")) + rightTag;
    return tableName;
}

```

#### 3. 生成的json脚本限速问题
默认生成的脚本中有限速设置，运行会报错: `在有总bps限速条件下，单个channel的bps值不能为空，也不能为非正数`
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
        // 删除这一行 "byte": 1048576
        "byte": 1048576
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
  }
}
```

## 四、使用DataX在各种数据源之间传输数据
使用步骤:

1. 启动 `datax-admin` 及 `datax-executor` 服务
2. 浏览器访问 `http://localhost:8080/index.html` 页面，登录 `admin` / `123456`
3. 打开【执行器管理】，查看是否存在 `datax执行器`，没有需要检查启动是否异常
4. 打开【项目管理】，新建一个项目
5. 打开【数据源管理】，添加各数据源（数据表结构需要提前创建好）
6. 打开【任务管理-任务构建】或【任务管理-任务批量构建】，来添加数据传输规则
   1. 选择源数据表并勾选所需传输的字段以及查询条件等
   2. 选择目标数据源并勾选所需传输的字段以及前置后置执行的sql语句
   3. 再次确认需要同步的字段列表，字段名称需要相同才能映射
   4. 点击【构建】可以得到json脚本
   5. 点击【选择模板】，选择一个任务模板来创建定时任务
   6. 点击【下一步】即可创建成功
7. 进入【任务管理-任务管理】，对刚才新建的任务做调整，比如任务名称，责任人，Cron表达式，重试次数等
8. 点击行尾的【操作-执行一次】执行任务脚本
9. 点击行尾的【操作-查询日志】查询执行结果及日志
10. 确认没有问题后，切换任务状态为【启动】，任务即可定时执行

下面为各数据源之间数据传输脚本的示例
### 1. Mysql-Pgsql
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "mysqlreader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "`id`",
              "`name`"
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "`test_table1`"
                ],
                "jdbcUrl": [
                  "jdbc:mysql://192.168.3.49:3306/test"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "postgresqlwriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "connection": [
              {
                "table": [
                  "\"public\".\"test_table1\""
                ],
                "jdbcUrl": "jdbc:postgresql://192.168.3.49:5432/test"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 2. Mysql-Oracle
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "mysqlreader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "`id`",
              "`name`"
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "`test_table1`"
                ],
                "jdbcUrl": [
                  "jdbc:mysql://192.168.3.49:3306/test"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "oraclewriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "connection": [
              {
                "table": [
                  "\"test_table1\""
                ],
                "jdbcUrl": "jdbc:oracle:thin:@192.168.3.49:1521/ORCLPDB"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 3. Mysql-SqlServer
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "mysqlreader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "`id`",
              "`name`"
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "`test_table1`"
                ],
                "jdbcUrl": [
                  "jdbc:mysql://192.168.3.49:3306/test"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "sqlserverwriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "[id]",
              "[name]"
            ],
            "connection": [
              {
                "table": [
                  "[dbo].[test_table1]"
                ],
                "jdbcUrl": "jdbc:sqlserver://192.168.3.49:1433;database=test;integratedSecurity=false;encrypt=false"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 4. Pgsql-Mysql
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "postgresqlreader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "\"public\".\"test_table2\""
                ],
                "jdbcUrl": [
                  "jdbc:postgresql://192.168.3.49:5432/test"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "mysqlwriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "`id`",
              "`name`"
            ],
            "connection": [
              {
                "table": [
                  "`test_table2`"
                ],
                "jdbcUrl": "jdbc:mysql://192.168.3.49:3308/test"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 5. Pgsql-Oracle
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "postgresqlreader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "\"public\".\"test_table2\""
                ],
                "jdbcUrl": [
                  "jdbc:postgresql://192.168.3.49:5432/test"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "oraclewriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "connection": [
              {
                "table": [
                  "\"test_table2\""
                ],
                "jdbcUrl": "jdbc:oracle:thin:@192.168.3.49:1521/ORCLPDB"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 6. Pgsql-SqlServer
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "postgresqlreader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "\"public\".\"test_table2\""
                ],
                "jdbcUrl": [
                  "jdbc:postgresql://192.168.3.49:5432/test"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "sqlserverwriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "[id]",
              "[name]"
            ],
            "connection": [
              {
                "table": [
                  "[dbo].[test_table2]"
                ],
                "jdbcUrl": "jdbc:sqlserver://192.168.3.49:1433;database=test;integratedSecurity=false;encrypt=false"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 7. Oracle-Mysql
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "oraclereader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "\"test_table3\""
                ],
                "jdbcUrl": [
                  "jdbc:oracle:thin:@192.168.3.49:1521/ORCLPDB"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "mysqlwriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "`id`",
              "`name`"
            ],
            "connection": [
              {
                "table": [
                  "`test_table3`"
                ],
                "jdbcUrl": "jdbc:mysql://192.168.3.49:3308/test"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 8. Oracle-Pgsql
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "oraclereader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "\"test_table3\""
                ],
                "jdbcUrl": [
                  "jdbc:oracle:thin:@192.168.3.49:1521/ORCLPDB"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "postgresqlwriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "connection": [
              {
                "table": [
                  "\"public\".\"test_table3\""
                ],
                "jdbcUrl": "jdbc:postgresql://192.168.3.49:5432/test"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 9. Oracle-SqlServer
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "oraclereader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "\"test_table3\""
                ],
                "jdbcUrl": [
                  "jdbc:oracle:thin:@192.168.3.49:1521/ORCLPDB"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "sqlserverwriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "[id]",
              "[name]"
            ],
            "connection": [
              {
                "table": [
                  "[dbo].[test_table3]"
                ],
                "jdbcUrl": "jdbc:sqlserver://192.168.3.49:1433;database=test;integratedSecurity=false;encrypt=false"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 10. SqlServer-Mysql
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "sqlserverreader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "[id]",
              "[name]"
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "[dbo].[test_table4]"
                ],
                "jdbcUrl": [
                  "jdbc:sqlserver://192.168.3.49:1433;database=test;integratedSecurity=false;encrypt=false"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "mysqlwriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "`id`",
              "`name`"
            ],
            "connection": [
              {
                "table": [
                  "`test_table4`"
                ],
                "jdbcUrl": "jdbc:mysql://192.168.3.49:3308/test"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 11. SqlServer-Pgsql
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "sqlserverreader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "[id]",
              "[name]"
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "[dbo].[test_table4]"
                ],
                "jdbcUrl": [
                  "jdbc:sqlserver://192.168.3.49:1433;database=test;integratedSecurity=false;encrypt=false"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "postgresqlwriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "`id`",
              "`name`"
            ],
            "connection": [
              {
                "table": [
                  "\"public\".\"test_table4\""
                ],
                "jdbcUrl": "jdbc:postgresql://192.168.3.49:5432/test"
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 12. SqlServer-Oracle
```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "sqlserverreader",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "[id]",
              "[name]"
            ],
            "splitPk": "",
            "connection": [
              {
                "table": [
                  "[dbo].[test_table4]"
                ],
                "jdbcUrl": [
                  "jdbc:sqlserver://192.168.3.49:1433;database=test;integratedSecurity=false;encrypt=false"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "oraclewriter",
          "parameter": {
            "username": "your_username",
            "password": "your_password",
            "column": [
              "\"id\"",
              "\"name\""
            ],
            "connection": [
              {
                "table": [
                  "\"test_table4\""
                ],
                "jdbcUrl": "jdbc:oracle:thin:@192.168.3.49:1521/ORCLPDB"
              }
            ]
          }
        }
      }
    ]
  }
}
```

## 五、常见报错

### 1. 在脚本中设置了dps限速
```shell
2024-02-03 14:30:15 [AnalysisStatistics.analysisStatisticsLog-53] 2024-02-03 14:30:15.011 [job-0] ERROR JobContainer - Exception when job run
2024-02-03 14:30:15 [AnalysisStatistics.analysisStatisticsLog-53] com.alibaba.datax.common.exception.DataXException: Code:[Framework-03], Description:[DataX引擎配置错误，该问题通常是由于DataX安装错误引起，请联系您的运维解决 .].  - 在有总bps限速条件下，单个channel的bps值不能为空，也不能为非正数
2024-02-03 14:30:15 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.common.exception.DataXException.asDataXException(DataXException.java:30) ~[datax-common-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:15 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.job.JobContainer.adjustChannelNumber(JobContainer.java:430) ~[datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:15 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.job.JobContainer.split(JobContainer.java:387) ~[datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:15 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.job.JobContainer.start(JobContainer.java:117) ~[datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:15 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.Engine.start(Engine.java:86) [datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:15 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.Engine.entry(Engine.java:168) [datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:15 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.Engine.main(Engine.java:201) [datax-core-0.0.1-SNAPSHOT.jar:na]
```

解决：
```json
"setting": {
      "speed": {
        "channel": 3,
        // 删除这一行 "byte": 1048576
        "byte": 1048576
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
```

### 2. 目标数据表存在相同主键的数据
```shell
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] 2024-02-03 14:30:59.804 [job-0] ERROR JobContainer - Exception when job run
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] com.alibaba.datax.common.exception.DataXException: Code:[Framework-14], Description:[DataX传输脏数据超过用户预期，该错误通常是由于源端数据存在较多业务脏数据导致，请仔细检查DataX汇报的脏数据日志信息, 或者您可以适当调大脏数据阈值 .].  - 脏数据条数检查不通过，限制是[0]条，但实际上捕获了[4]条.
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.common.exception.DataXException.asDataXException(DataXException.java:30) ~[datax-common-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.util.ErrorRecordChecker.checkRecordLimit(ErrorRecordChecker.java:58) ~[datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.job.scheduler.AbstractScheduler.schedule(AbstractScheduler.java:89) ~[datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.job.JobContainer.schedule(JobContainer.java:535) ~[datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.job.JobContainer.start(JobContainer.java:119) ~[datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.Engine.start(Engine.java:86) [datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.Engine.entry(Engine.java:168) [datax-core-0.0.1-SNAPSHOT.jar:na]
2024-02-03 14:30:59 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.Engine.main(Engine.java:201) [datax-core-0.0.1-SNAPSHOT.jar:na]
```

解决:
删除脏数据，或者增加过滤条件

### 3. 表或视图不存在
```shell
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 2024-02-03 14:22:42.095 [job-0] ERROR JobContainer - Exception when job run
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] com.alibaba.datax.common.exception.DataXException: Code:[DBUtilErrorCode-07], Description:[读取数据库数据失败. 请检查您的配置的 column/table/where/querySql或者向 DBA 寻求帮助.].  - 执行的SQL为: select * from act_evt_log where 1=2 具体错误信息为：java.sql.SQLSyntaxErrorException: ORA-00942: 表或视图不存在
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53]  - java.sql.SQLSyntaxErrorException: ORA-00942: 表或视图不存在
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.T4CTTIoer.processError(T4CTTIoer.java:445)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.T4CTTIoer.processError(T4CTTIoer.java:396)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.T4C8Oall.processError(T4C8Oall.java:879)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.T4CTTIfun.receive(T4CTTIfun.java:450)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.T4CTTIfun.doRPC(T4CTTIfun.java:192)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.T4C8Oall.doOALL(T4C8Oall.java:531)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.T4CStatement.doOall8(T4CStatement.java:193)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.T4CStatement.executeForDescribe(T4CStatement.java:873)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.OracleStatement.executeMaybeDescribe(OracleStatement.java:1167)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.OracleStatement.doExecuteWithTimeout(OracleStatement.java:1289)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.OracleStatement.executeQuery(OracleStatement.java:1491)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at oracle.jdbc.driver.OracleStatementWrapper.executeQuery(OracleStatementWrapper.java:406)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.plugin.rdbms.util.DBUtil.getTableColumnsByConn(DBUtil.java:520)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.plugin.rdbms.writer.util.OriginalConfPretreatmentUtil.dealColumnConf(OriginalConfPretreatmentUtil.java:106)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.plugin.rdbms.writer.util.OriginalConfPretreatmentUtil.dealColumnConf(OriginalConfPretreatmentUtil.java:147)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.plugin.rdbms.writer.util.OriginalConfPretreatmentUtil.doPretreatment(OriginalConfPretreatmentUtil.java:36)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.plugin.rdbms.writer.CommonRdbmsWriter$Job.init(CommonRdbmsWriter.java:41)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.plugin.writer.oraclewriter.OracleWriter$Job.init(OracleWriter.java:43)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.job.JobContainer.initJobWriter(JobContainer.java:704)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.job.JobContainer.init(JobContainer.java:304)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.job.JobContainer.start(JobContainer.java:113)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.Engine.start(Engine.java:86)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.Engine.entry(Engine.java:168)
2024-02-03 14:22:42 [AnalysisStatistics.analysisStatisticsLog-53] 	at com.alibaba.datax.core.Engine.main(Engine.java:201)
```

解决:
通常是上面所说的数据表名格式问题，增加上面的函数即可