@echo off
REM 设置窗口标题
title app

REM 设置 Java 路径（如果未设置全局环境变量）
REM set JAVA_HOME=C:\path\to\java
REM set PATH=%JAVA_HOME%\bin;%PATH%

REM 设置 JVM 参数（可选）
set JVM_OPTS=-Xmx4g -Xms1g

REM 启动 Spring Boot 应用
echo Starting Spring Boot application...

java %JVM_OPTS% -jar app.jar

REM 保持窗口打开（可选）
pause
