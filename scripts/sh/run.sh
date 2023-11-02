#!/bin/bash

# 默认值
# default_jvm_opts="-Xms512m -Xmx2G -XX:NewRatio=2 -XX:SurvivorRatio=8 -XX:+PrintGCDetails -XX:+UseSerialGC"
jvm_opts=""
jar_name=""
port=""
profile=""
log_file="$jar_name.log"
pid=""

# 函数：输出脚本用法
help() {
    echo "Usage:  $0 {start|stop|restart|status|info|debug} -n jar_name [-o jvm_opts] [-P port] [-p profile] [-l log_file]"
    echo "        ./run.sh debug -o        "-Xms512m" -n     message.jar -p        dev -P     8080 -l    message.log"
    echo "        ./run.sh debug --options "-Xms512m" --name message.jar --profile dev --port 8080 --log message.log"
    echo "        ./run.sh debug --options="-Xms512m" --name=message.jar --profile=dev --port=8080 --log=message.log"
    echo
    echo "        ./run.sh info    -o      "-Xms512m" -n     message.jar -p        dev -P     8080 -l    message.log"
    echo "        ./run.sh status  -o      "-Xms512m" -n     message.jar -p        dev -P     8080 -l    message.log"
    echo "        ./run.sh start   -o      "-Xms512m" -n     message.jar -p        dev -P     8080 -l    message.log"
    echo "        ./run.sh stop    -o      "-Xms512m" -n     message.jar -p        dev -P     8080 -l    message.log"
    echo "        ./run.sh restart -o      "-Xms512m" -n     message.jar -p        dev -P     8080 -l    message.log"
}

# 函数：测试参数解析
debug() {
    echo "parse params: jvm_opts: $jvm_opts, jar_name: $jar_name, port: $port, profile: $profile, log_file: $log_file"
    if [ -n "$jar_name" ]; then
        local pid1=$(pgrep -f "$jar_name")
        echo "$jar_name PID1 : $pid1"
        local pid2=`ps -ef | grep $jar_name | grep "java" | grep -v "grep" | awk '{print $2}'`
        echo "$jar_name PID2 : $pid2"
        local pid3=`ps -ef | grep $jar_name | grep "java" | grep -v "grep" | grep -v kill | awk '{print $2}'`
        echo "$jar_name PID3 : $pid3"
    fi
}

# 函数：获取服务器信息
info() {
    echo "****************** System information ******************"
    echo "*  `head -n 1 /etc/issue` "
    echo "*  `uname -a`"
    echo "*  "
    echo "*  JAVA_HOME = $JAVA_HOME "
    echo "*  `java -version` "
    echo  "****************** 系   统   信   息  ******************"
}

# 函数：获取Spring Boot应用的PID
check_pid() {
    local pid=""
    pid=`ps -ef | grep $jar_name | grep "java" | grep -v "grep" | grep -v "$$" | awk '{print $2}'`
    echo "$pid"
}

# 函数：启动Spring Boot应用
start() {
    local pid=$(check_pid)
    if [ -n "$pid" ]; then
        echo "Spring Boot application is already running with PID $pid."
        cmd=$(cat /proc/$pid/cmdline 2>/dev/null | tr '\0' ' ')
        if [ -n "$cmd" ]; then
            echo "Command line parameters: $cmd"
        fi
    else
        start_cmd="java"
        [ -n "$jvm_opts" ] && start_cmd="$start_cmd $jvm_opts"
        start_cmd="$start_cmd -jar $jar_name"
        [ -n "$port" ] && start_cmd="$start_cmd --server.port=$port"
        [ -n "$profile" ] && start_cmd="$start_cmd --spring.profiles.active=$profile"

        echo "Starting Spring Boot application..."
        nohup $start_cmd > $log_file 2>&1 &
        echo "Application started. View log with: tail -f $log_file"
    fi
}

# 函数：停止Spring Boot应用
stop() {
    local pid=$(check_pid)
    echo "PID : $pid"
    if [ -n "$pid" ]; then
        echo "Stopping Spring Boot application with PID $pid..."
        # pkill -F "$jar_name"
        kill -15 "$pid"
        echo "Application stopped gracefully."
    else
        echo "Spring Boot application is not running."
    fi

    sleep 5

    local pid=$(check_pid)
    if [ -n "$pid" ]; then
        kill -9 "$pid"
        echo "Application stopped forcibly."
    fi
}

# 函数：重启Spring Boot应用
restart() {
    stop
    start
}

# 函数：查看Spring Boot应用状态
status() {
    local pid=""
    local cmd=""
    pid=`ps -ef | grep $jar_name | grep java | grep -v "grep" | grep -v "$$" | awk '{print $2}'`
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

# 函数：解析命令行参数
parse_params() {
    while getopts ":o:n:P:p:l:-:" opt; do
        case $opt in
            o)
                jvm_opts="$OPTARG"
                ;;
            n)
                jar_name="$OPTARG"
                ;;
            P)
                port="$OPTARG"
                ;;
            p)
                profile="$OPTARG"
                ;;
            l)
                log_file="$OPTARG"
                ;;
            -)
                case "${OPTARG}" in
                    options)
                        jvm_opts="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        echo "Parsing option: '--${OPTARG}', value: '${jvm_opts}'" >&2;
                        ;;
                    name)
                        jar_name="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        ;;
                    port)
                        port="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        ;;
                    profile)
                        profile="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        ;;
                    log)
                        log_file="${!OPTIND}"; OPTIND=$(( $OPTIND + 1 ))
                        ;;
                    
                    options=*)
                        jvm_opts="${OPTARG#*=}"
                        local opt_name=${OPTARG%=$jvm_opts}
                        echo "Parsing option: '--${opt_name}', value: '${jvm_opts}'" >&2
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
                        log_file="${OPTARG#*=}"
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
}

# 根据第一个参数执行相应的操作
case "$1" in
    help)
        help
        ;;
    debug)
        shift # 移除函数名部分，否则参数中包含函数名，无法解析
        parse_params "$@"
        debug
        ;;
    info)
        shift
        parse_params "$@"
        info
        ;;
    start)
        shift
        parse_params "$@"
        start
        ;;
    stop)
        shift
        parse_params "$@"
        stop
        ;;
    restart)
        shift
        parse_params "$@"
        restart
        ;;
    status)
        shift
        parse_params "$@"
        status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|info|debug} -n jar_name [-o jvm_opts] [-P port] [-p profile] [-l log_file]"
        exit 1
        ;;
esac
