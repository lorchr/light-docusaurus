#!/bin/bash

# 初始化变量
APP_NAME=""
PORT=""
PROFILE=""

# 处理命令行参数
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -n|--name)
            APP_NAME="$2"
            shift 2
            ;;
        -P|--port)
            PORT="$2"
            shift 2
            ;;
        -p|--profile)
            PROFILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

start() {
    echo "Starting $APP_NAME..."
    if [ -z "$PORT" ] && [ -z "$PROFILE" ]; then
        nohup java -jar $APP_NAME > /dev/null 2>&1 &
    elif [ -z "$PORT" ]; then
        nohup java -jar $APP_NAME --spring.profiles.active=$PROFILE > /dev/null 2>&1 &
    elif [ -z "$PROFILE" ]; then
        nohup java -jar $APP_NAME --server.port=$PORT > /dev/null 2>&1 &
    else
        nohup java -jar $APP_NAME --server.port=$PORT --spring.profiles.active=$PROFILE > /dev/null 2>&1 &
    fi
    echo "$APP_NAME started."
}

stop() {
    echo "Stopping $APP_NAME..."
    PID=$(pgrep -f $APP_NAME)
    if [ -z "$PID" ]; then
        echo "$APP_NAME is not running."
    else
        kill -9 $PID
        echo "$APP_NAME stopped."
    fi
}

restart() {
    stop
    start
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac

exit 0
