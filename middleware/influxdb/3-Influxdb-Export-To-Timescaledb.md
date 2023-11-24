## 使用`outflux` 导入`influxdb`的数据到`timescaledb`
`influxdb` 以及 `timescaledb` 都是不错的时序数据库，`timescaledb` 团队提供了直接从 `influxdb` 导入

## 1. 环境准备
`docker-compose` 文件
```yaml
version: "3"
services:
    timescaledb:
      image: timescale/timescaledb-postgis:latest-pg10
      ports:
      - "5432:5432"
      environment:
      - "POSTGRES_PASSWORD=dalong"
    influxdb:
      image: influxdb
      ports: 
      - "8086:8086"
```

## 2. Influxdb 数据导入
下载测试数据
注意需要在容器中操作 `docker-compose exec influxdb sh`

```shell
wget https://timescaledata.blob.core.windows.net/datasets/outflux_taxi.txt
```

导入

```shell
influx -import -path=./outflux_taxi.txt -database=outflux_tutorial
```

## 3. Schema 迁移

```shell
./outflux schema-transfer outflux_tutorial taxi --input-server=http://localhost:8086 --output-conn="dbname=postgres user=postgres password=dalong"
```

效果

```shell
2019/04/12 11:03:55 Selected input database: outflux_tutorial
2019/04/12 11:03:55 Overriding PG environment variables for connection with: dbname=postgres user=postgres password=dalong
2019/04/12 11:03:55 pipe_taxi starting execution
2019/04/12 11:03:55 Discovering influx schema for measurement: taxi
2019/04/12 11:03:55 Discovered: DataSet { Name: taxi, Columns: [Column { Name: time, DataType: IDRFTimestamp} Column { Name: location_id, DataType: IDRFString} Column { Name: rating, DataType: IDRFString} Column { Name: vendor, DataType: IDRFString} Column { Name: fare, DataType: IDRFDouble}Column { Name: mta_tax, DataType: IDRFDouble} Column { Name: tip, DataType: IDRFDouble} Column { Name: tolls, DataType: IDRFDouble}], Time Column: time }
2019/04/12 11:03:55 Selected Schema Strategy: CreateIfMissing
2019/04/12 11:03:55 existing hypertable 'taxi' is partitioned properly
2019/04/12 11:03:55 No data transfer will occur
2019/04/12 11:03:55 Schema Transfer complete in: 0.079 seconds
```

## 4. 数据迁移

```shell
./outflux migrate outflux_tutorial taxi --input-server=http://localhost:8086 --output-conn="dbname=postgres user=postgres password=dalong" --schema-strategy=DropAndCreate
```

效果

```shell
2019/04/12 11:04:33 All pipelines scheduled
2019/04/12 11:04:33 Overriding PG environment variables for connection with: dbname=postgres user=postgres password=dalong
2019/04/12 11:04:33 pipe_taxi starting execution
2019/04/12 11:04:33 Discovering influx schema for measurement: taxi
2019/04/12 11:04:33 Discovered: DataSet { Name: taxi, Columns: [Column { Name: time, DataType: IDRFTimestamp} Column { Name: location_id, DataType: IDRFString} Column { Name: rating, DataType: IDRFString} Column { Name: vendor, DataType: IDRFString} Column { Name: fare, DataType: IDRFDouble}Column { Name: mta_tax, DataType: IDRFDouble} Column { Name: tip, DataType: IDRFDouble} Column { Name: tolls, DataType: IDRFDouble}], Time Column: time }
2019/04/12 11:04:33 Selected Schema Strategy: DropAndCreate
2019/04/12 11:04:33 Table taxi exists, dropping it
2019/04/12 11:04:33 Executing: DROP TABLE taxi
2019/04/12 11:04:33 Table taxi ready to be created
2019/04/12 11:04:33 Creating table with:
 CREATE TABLE "taxi"("time" TIMESTAMP, "location_id" TEXT, "rating" TEXT, "vendor" TEXT, "fare" FLOAT, "mta_tax" FLOAT, "tip" FLOAT, "tolls" FLOAT
)
2019/04/12 11:04:33 Preparing TimescaleDB extension:
CREATE EXTENSION IF NOT EXISTS timescaledb
2019/04/12 11:04:33 Creating hypertable with: SELECT create_hypertable('"taxi"', 'time');
2019/04/12 11:04:33 Starting extractor 'pipe_taxi_ext' for measure: taxi
2019/04/12 11:04:33 Starting data ingestor 'pipe_taxi_ing'
2019/04/12 11:04:33 pipe_taxi_ext: Extracting data from database 'outflux_tutorial'
2019/04/12 11:04:33 pipe_taxi_ext: SELECT "time", "location_id", "rating", "vendor", "fare", "mta_tax", "tip", "tolls"
FROM "taxi"
2019/04/12 11:04:33 pipe_taxi_ext:Pulling chunks with size 15000
2019/04/12 11:04:33 Will batch insert 8000 rows at once. With commit strategy: CommitOnEachBatch
2019/04/12 11:04:33 pipe_taxi_ext: Extracted 185 rows from Influx
2019/04/12 11:04:33 pipe_taxi_ing: Complete. Inserted 185 rows.
2019/04/12 11:04:33 All pipelines finished
2019/04/12 11:04:33 Migration execution time: 0.094 seconds
```

## 5. 参考资料
- https://blog.51cto.com/rongfengliang/3124713
- https://docs.timescale.com/v1.2/tutorials/outflux
- https://docs.influxdata.com/influxdb/v1.7/introduction/getting-started/
- https://blog.timescale.com/migrate-outflux-a-smart-way-out-of-influxdb/
