@echo off
setlocal enabledelayedexpansion

:: InfluxDB连接参数
set INFLUXDB_HOST=localhost
set INFLUXDB_PORT=8088
set INFLUXDB_DATABASE=light
set INFLUXDB_USERNAME=influxdb
set INFLUXDB_PASSWORD=influxdb

:: 备份目录和文件名
set BACKUP_DIR=C:\backup\influxdb\%INFLUXDB_DATABASE%
for /f "delims=" %%a in ('wmic OS Get localdatetime ^| find "."') do set DT=%%a
set YEAR=%DT:~0,4%
set MONTH=%DT:~4,2%
set ARCHIVE_FILENAME=influxdb_backup_%YEAR%-%MONTH%.zip

:: 计算上个月的日期
set /a "PREVIOUS_MONTH=1%MONTH%-101"
if %MONTH%==01 (
    set /a "PREVIOUS_YEAR=%YEAR%-1"
    set "PREVIOUS_MONTH=12"
) else (
    set "PREVIOUS_YEAR=%YEAR%"
)
if %PREVIOUS_MONTH% lss 10 set "PREVIOUS_MONTH=0%PREVIOUS_MONTH%"

:: 创建备份目录（如果不存在）
mkdir "%BACKUP_DIR%\%YEAR%-%MONTH%"

:: 获取当前日期和时间（用于备份文件命名） 2023-09-15_15-26
set DATE=%YEAR%-%MONTH%-%DT:~6,2%_%DT:~8,2%-%DT:~10,2%

:: 使用 influxd backup 命令备份数据库
influxd backup -portable -host %INFLUXDB_HOST%:%INFLUXDB_PORT% -db %INFLUXDB_DATABASE% "%BACKUP_DIR%\%YEAR%-%MONTH%\%DATE%"

:: 每天的备份完成后，检查是否是本月最后一天，如果是则进行归档
set /a "NEXT_MONTH=1%MONTH%-99"
if %NEXT_MONTH% lss 10 set "NEXT_MONTH=0%NEXT_MONTH%"
set "NEXT_MONTH_YEAR=%YEAR%"
if %NEXT_MONTH%==13 (
    set /a "NEXT_MONTH=01"
    set /a "NEXT_MONTH_YEAR=%YEAR%+1"
)
if "%DATE:~8,2%"=="01" (
    :: 压缩备份文件为zip
    powershell -nologo -noprofile -command "& {Add-Type -A System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('%BACKUP_DIR%\%YEAR%-%MONTH%', '%BACKUP_DIR%\%ARCHIVE_FILENAME%');}"

    :: 删除原始备份文件夹
    rmdir /s /q "%BACKUP_DIR%\%YEAR%-%MONTH%"

    :: 输出归档完成信息（可选）
    echo Monthly archive completed: %BACKUP_DIR%\%ARCHIVE_FILENAME%

    :: 删除上个月的归档文件
    if exist "%BACKUP_DIR%\influxdb_backup_%PREVIOUS_YEAR%-%PREVIOUS_MONTH%.zip" (
        del "%BACKUP_DIR%\influxdb_backup_%PREVIOUS_YEAR%-%PREVIOUS_MONTH%.zip"
        echo Deleted previous month's archive: %BACKUP_DIR%\influxdb_backup_%PREVIOUS_YEAR%-%PREVIOUS_MONTH%.zip
    )
)
