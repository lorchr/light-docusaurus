@echo off
REM 设置窗口标题
title app

REM 查找并终止 Spring Boot 应用的进程
echo Stopping Spring Boot application...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    set PID=%%a
    taskkill /PID %%a /F
)

REM 保持窗口打开（可选）
pause
