@echo off
setlocal enabledelayedexpansion

REM Java进程的名称
set "processName=java.exe"  
set "searchString=%1"

for /f "tokens=1 delims=," %%a in ('tasklist /nh /fi "imagename eq %processName%"') do (
    set "taskName=%%a"
    echo !taskName!
    REM 移除任务名称周围的引号
    set "taskName=!taskName:~1,-1!"  
    REM 检查任务名称是否包含搜索字符串
    echo !taskName! | findstr /i /c:"%searchString%" >nul

    if !errorlevel!==0 (
        taskkill /f /im "!taskName!"
        echo 已终止进程: !taskName!
    )
)

endlocal