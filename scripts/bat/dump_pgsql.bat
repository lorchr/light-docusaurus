@echo off
setlocal enabledelayedexpansion

:: PostgreSQL连接参数
set PGSQL_HOST=localhost
set PGSQL_PORT=35432
set PGSQL_USER=postgres
set PGSQL_PASSWORD=postgres
set PGSQL_DATABASE=light

:: 备份目录和文件名
set BACKUP_DIR=D:\backup\pgsql\%PGSQL_DATABASE%
set DATE=!date:~0,4!-!date:~5,2!-!date:~8,2!

:: 创建备份目录（如果不存在）
mkdir "%BACKUP_DIR%\%DATE%"

:: 备份PostgreSQL数据库
pg_dump -h %PGSQL_HOST% -p %PGSQL_PORT% -U %PGSQL_USER% -d %PGSQL_DATABASE% -f "%BACKUP_DIR%\%DATE%\pgsql_backup.sql"

:: 输出备份完成信息（可选）
echo PostgreSQL backup completed: "%BACKUP_DIR%\%DATE%\pgsql_backup.sql"

:: 每天的备份完成后，检查是否是本月最后一天，如果是则进行归档为ZIP文件
if "!date:~8,2!"=="01" (
  powershell -command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('%BACKUP_DIR%\%DATE%', '%BACKUP_DIR%\pgsql_backup_%DATE%.zip')"
  rmdir /s /q "%BACKUP_DIR%\%DATE%"
  echo Monthly archive completed: "%BACKUP_DIR%\pgsql_backup_%DATE%.zip"
)

:: 结束批处理脚本
exit
