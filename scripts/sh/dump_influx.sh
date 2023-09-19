#!/bin/bash

# InfluxDB连接参数
INFLUXDB_HOST="localhost"
INFLUXDB_PORT=8088 # RPC端口默认8088 不是HTTP端口
INFLUXDB_DATABASE="light"
INFLUXDB_USERNAME="influxdb"
INFLUXDB_PASSWORD="influxdb"

# 备份目录和文件名
BACKUP_DIR="/usr/local/backup/influxdb/$INFLUXDB_DATABASE"
MONTH=$(date +"%Y-%m")
ARCHIVE_FILENAME="influxdb_backup_$MONTH.tar.gz"
# 计算上个月的日期
PREVIOUS_MONTH=$(date -d "last month" +"%Y-%m")

# 创建备份目录（如果不存在）
mkdir -p "$BACKUP_DIR/$MONTH"

# 获取当前日期和时间（用于备份文件命名）
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

# 使用 influxd backup 命令备份数据库
influxd backup -portable -host "$INFLUXDB_HOST:$INFLUXDB_PORT" -db "$INFLUXDB_DATABASE"  "$BACKUP_DIR/$MONTH/$DATE"

# 每天的备份完成后，检查是否是本月最后一天，如果是则进行归档
if [ $(date +"%d") -eq $(date -d tomorrow +"%d") ]; then
  # 压缩备份文件为tar.gz
  tar -zcvf "$BACKUP_DIR/$ARCHIVE_FILENAME" -C "$BACKUP_DIR/$MONTH" .

  # 删除原始备份文件
  rm -rf "$BACKUP_DIR/$MONTH"

  # 输出归档完成信息（可选）
  echo "Monthly archive completed: $BACKUP_DIR/$ARCHIVE_FILENAME"

  # 删除上个月的归档文件
  if [ -e "$BACKUP_DIR/influxdb_backup_$PREVIOUS_MONTH.tar.gz" ]; then
    rm "$BACKUP_DIR/influxdb_backup_$PREVIOUS_MONTH.tar.gz"
    echo "Deleted previous month's archive: $BACKUP_DIR/influxdb_backup_$PREVIOUS_MONTH.tar.gz"
  fi
fi
