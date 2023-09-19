@echo off
setlocal enabledelayedexpansion

:: InfluxDB连接参数
set INFLUXDB_HOST=localhost
set INFLUXDB_PORT=8088
set INFLUXDB_DATABASE=light
set INFLUXDB_USERNAME=influxdb
set INFLUXDB_PASSWORD=influxdb

:: 备份目录和文件名
set BACKUP_DIR=D:\backup\influxdb\%INFLUXDB_DATABASE%
set DATE=!date:~0,4!-!date:~5,2!-!date:~8,2!
set PREVIOUS_MONTH=!date:~0,4!-!date:~5,2!

:: 创建备份目录（如果不存在）
mkdir "%BACKUP_DIR%\%DATE%"

:: 备份InfluxDB数据库
influxd backup -portable -host "%INFLUXDB_HOST%:%INFLUXDB_PORT" -db %INFLUXDB_DATABASE% "%BACKUP_DIR%\%DATE%\influxdb_backup"

:: 输出备份完成信息（可选）
echo InfluxDB backup completed: "%BACKUP_DIR%\%DATE%\influxdb_backup"

:: 每天的备份完成后，检查是否是本月最后一天，如果是则进行归档为ZIP文件
if "!date:~8,2!"=="01" (
  powershell -command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('%BACKUP_DIR%\%DATE%', '%BACKUP_DIR%\influxdb_backup_%DATE%.zip')"
  rmdir /s /q "%BACKUP_DIR%\%DATE%"
  echo Monthly archive completed: "%BACKUP_DIR%\influxdb_backup_%DATE%.zip"
)

:: 结束批处理脚本
exit
