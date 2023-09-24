@echo off
setlocal enabledelayedexpansion

set "portToKill=31888"

for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r "\<%portToKill%\>"') do (
    set "pid=%%a"
    taskkill /f /pid !pid!
    echo Stop process PID: !pid! [Listening port: %portToKill%]
)

endlocal
