
## 1. InfluxDB备份
```shell
# 备份
influxd backup -portable -db db_name /root/db_influxdb_backup

# 恢复
influxd restore -portable -db db_name -newdb new_db_name /root/db_influxdb_backup
```

## 2. Postgresql备份
```shell
# 备份
cd /home/postgres/postgresql/bin
./pg_dump -h localhost -p 5432 -U postgres db_name > /root/db_pgsql_backup.sql

# 恢复
cd /home/postgres/postgresql/bin
psql -h localhost -p 5432 -U postgres -d db_name < /root/db_pgsql_backup.sql

# pg_restore -U postgres -d db_name /root/db_pgsql_backup.sql
```

## 3. 文件夹备份
```shell
# 备份
cd /root
tar -zcvf ./db_backup.tar.gz ./db_pgsql_backup.sql ./db_influxdb_backup

# 恢复
cd /root
tar -zcvf ./db_backup.tar.gz
```

## 4. 文件传输
```shell
# 下载到本地
scp root@192.168.1.110:/root/db_backup.tar.gz D:/backup/db_backup.tar.gz

# 上传到服务器
scp D:/backup/db_backup.tar.gz root@192.168.1.110:/root/db_backup.tar.gz 
```
