#!/bin/bash

# 默认值
jvm_opts="-Xms512m -Xmx1024m -XX:NewRatio=2 -XX:SurvivorRatio=8 -XX:+PrintGCDetails -XX:+UseSerialGC"
jar_name=""
port=""
profile=""
log_file="$jar_name.log"

# 函数：获取Spring Boot应用的PID
exists() {
    echo "params jvm_opts $jvm_opts jar_name $jar_name port $port profile $profile log_file $log_file"
    local pid=""
    pid=$(pgrep -f "$jar_name")
    echo "$pid"
}

# 函数：启动Spring Boot应用
start() {
    local pid=$(exists)
    if [ -n "$pid" ]; then
        echo "Spring Boot application is already running with PID $pid."
    else
        start_cmd="java"
        [ -n "$jvm_opts" ] && start_cmd="$start_cmd $jvm_opts"
        start_cmd="$start_cmd -jar $jar_name"
        [ -n "$port" ] && start_cmd="$start_cmd --server.port=$port"
        [ -n "$profile" ] && start_cmd="$start_cmd --spring.profiles.active=$profile"

        echo "Starting Spring Boot application..."
        nohup $start_cmd > $log_file 2>&1 &
        echo "Application started. Log: $log_file"
    fi
}

# 函数：停止Spring Boot应用
stop() {
    local pid=$(exists)
    if [ -n "$pid" ]; then
        echo "Stopping Spring Boot application with PID $pid..."
        pkill -F "$jar_name"
        echo "Application stopped."
    else
        echo "Spring Boot application is not running."
    fi
}

# 函数：重启Spring Boot应用
restart() {
    stop
    start
}

# 函数：查看Spring Boot应用状态
status() {
    echo "params jvm_opts $jvm_opts jar_name $jar_name port $port profile $profile log_file $log_file"
    local pid=""
    local cmd=""
    pid=$(pgrep -f "$jar_name")
    # pid=`ps -ef | grep $jar_name | grep -v grep | awk '{print $2}' `
    echo "PID : $pid"  # 添加此行以查看 pid 的值

    if [ -n "$pid" ]; then
        echo "Spring Boot application is running with PID $pid."
        cmd=$(cat /proc/$pid/cmdline 2>/dev/null | tr '\0' ' ')
        if [ -n "$cmd" ]; then
            echo "Command line parameters: $cmd"
        else
            echo "Failed to retrieve command line parameters for PID $pid."
        fi
    else
        echo "Spring Boot application is not running."
    fi
}

# 解析命令行参数
while getopts "o:n:P:p:l:-:" opt; do
    case $opt in
        o|options)
            jvm_opts="$OPTARG"
            echo $jvm_opts
            ;;
        n|name)
            jar_name="$OPTARG"
            echo $jar_name
            ;;
        P|port)
            port="$OPTARG"
            echo $port
            ;;
        p|profile)
            profile="$OPTARG"
            echo $profile
            ;;
        l|log)
            log_file="$OPTARG"
            echo $log_file
            ;;
        -)
            case "${OPTARG}" in
                options=*)
                    jvm_opts="${OPTARG#*=}"
                    ;;
                name=*)
                    jar_name="${OPTARG#*=}"
                    ;;
                port=*)
                    port="${OPTARG#*=}"
                    ;;
                profile=*)
                    profile="${OPTARG#*=}"
                    ;;
                log=*)
                    log="${OPTARG#*=}"
                    ;;
                \?)
                    echo "Invalid option: --$OPTARG" >&2
                    exit 1
                    ;;
            esac
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

# shift $((OPTIND-1))

# 根据第一个参数执行相应的操作
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
    status)
        status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status} -n jar_name [-o jvm_opts] [-P port] [-p profile] [-l log_file]"
        exit 1
        ;;
esac

exit 0
