#!/bin/bash

# PostgreSQL连接参数
PGSQL_HOST="localhost"
PGSQL_PORT=35432
PGSQL_USER="postgres"
PGSQL_PASSWORD="postgres"
PGSQL_DATABASE="light"

# 备份目录和文件名
BACKUP_DIR="/usr/local/backup/pgsql/$PGSQL_DATABASE"
MONTH=$(date +"%Y-%m")
ARCHIVE_FILENAME="pgsql_backup_$MONTH.tar.gz"
# 计算上个月的日期
PREVIOUS_MONTH=$(date -d "last month" +"%Y-%m")

# 创建备份目录（如果不存在）
mkdir -p "$BACKUP_DIR/$MONTH"

# 备份数据库到指定目录，使用每天的日期作为文件名
DATE=$(date +"%Y-%m-%d")
pg_dump -h "$PGSQL_HOST" -p "$PGSQL_PORT" -U "$PGSQL_USER" -d "$PGSQL_DATABASE" -f "$BACKUP_DIR/$MONTH/db_backup_$DATE.sql"

# 每天的备份完成后，检查是否是本月最后一天，如果是则进行归档
if [ $(date +"%d") -eq $(date -d tomorrow +"%d") ]; then
  # 压缩备份文件为tar.gz
  tar -zcvf "$BACKUP_DIR/$ARCHIVE_FILENAME" "$BACKUP_DIR/$MONTH"

  # 删除原始SQL备份文件
  rm -rf "$BACKUP_DIR/$MONTH"

  # 输出归档完成信息（可选）
  echo "Monthly archive completed: $BACKUP_DIR/$ARCHIVE_FILENAME"
  
  # 删除上个月的归档文件
  if [ -e "$BACKUP_DIR/pgsql_backup_$PREVIOUS_MONTH.tar.gz" ]; then
    rm "$BACKUP_DIR/pgsql_backup_$PREVIOUS_MONTH.tar.gz"
    echo "Deleted previous month's archive: $BACKUP_DIR/pgsql_backup_$PREVIOUS_MONTH.tar.gz"
  fi
fi
