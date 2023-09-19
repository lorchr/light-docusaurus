@echo off
setlocal enabledelayedexpansion

:: MySQL连接参数
set MYSQL_HOST=localhost
set MYSQL_PORT=33306
set MYSQL_USER=root
set MYSQL_PASSWORD=root
set MYSQL_DATABASE=light

:: 备份目录和文件名
set BACKUP_DIR=D:\backup\mysql\%MYSQL_DATABASE%
set DATE=!date:~0,4!-!date:~5,2!-!date:~8,2!

:: 创建备份目录（如果不存在）
mkdir "%BACKUP_DIR%\%DATE%"

:: 备份MySQL数据库
mysqldump -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p %MYSQL_PASSWORD% %MYSQL_DATABASE% > "%BACKUP_DIR%\%DATE%\mysql_backup.sql"

:: 输出备份完成信息（可选）
echo MySQL backup completed: "%BACKUP_DIR%\%DATE%\mysql_backup.sql"

:: 每天的备份完成后，检查是否是本月最后一天，如果是则进行归档为ZIP文件
if "!date:~8,2!"=="01" (
  powershell -command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('%BACKUP_DIR%\%DATE%', '%BACKUP_DIR%\mysql_backup_%DATE%.zip')"
  rmdir /s /q "%BACKUP_DIR%\%DATE%"
  echo Monthly archive completed: "%BACKUP_DIR%\mysql_backup_%DATE%.zip"
)

:: 结束批处理脚本
exit
