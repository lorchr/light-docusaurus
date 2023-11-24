## 自定义SSH登录页提示信息

## 1. 修改 /etc/ssh/sshd_config
1. 修改 `/etc/ssh/sshd_config` ，开启输出 `motd` 信息及 `banner` 信息

```shell
# 打印 /etc/motd 内容
PrintMotd yes
# 打印指定banner文件中的内容
Banner /etc/ssh/banner
```

2. 创建文件 `/etc/ssh/banner`，自定义所需内容即可

```shell
*********************************************************************
*                     Welcome to Redmi7a                            *
*                                                                   *
*           All connections are monitored and recorded              *
*     Disconnect IMMEDIATELY if you are not an authorized user!     *
*********************************************************************
```

3. 确保 PAM 配置正确。编辑 PAM 配置文件：
修改 `/etc/pam.d/sshd`，如果没有下面内容则添加一行
```shell
session    optional     pam_motd.so
```

4. 重启ssh服务

```shell
service ssh restart
# 或
systemctl restart ssh

# 有些机器是sshd
service sshd restart
systemctl restart sshd
```

## 2. 修改 /etc/motd
1. `system_status.sh`： 实时监控服务器状态的脚本。

```shell
#!/bin/bash

while true; do
  clear
  echo "Welcome to Your Server!"
  echo "IP Address: $(hostname -I)"
  echo "CPU Load Average: $(uptime | awk -F 'load average:' '{print $2}')"
  echo "Memory Usage: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
  echo "Disk Usage: $(df -h | awk '$NF=="/"{print $5}')"
  echo "Top 5 CPU-consuming Processes:"
  echo "PID    %CPU    Name"
  ps -eo pid,%cpu,comm --sort=-%cpu | head -n 6
  sleep 5
done
```

2. `update_motd.sh`： 更新 `/etc/motd` 文件的脚本。

```shell
#!/bin/bash

# Function to get CPU load average
get_cpu_load() {
  uptime | awk -F 'load average:' '{print $2}'
}

# Function to get memory usage
get_memory_usage() {
  free -h | awk '/^Mem:/ {print $3 "/" $2}'
}

# Function to get disk usage
get_disk_usage() {
  df -h | awk '$NF=="/"{print $5}'
}

# Function to get top 5 processes by CPU usage
get_top_cpu_processes() {
  ps -eo pid,%cpu,comm --sort=-%cpu | head -n 6
}

# Function to generate welcome message
generate_welcome_message() {
  echo "Welcome to Your Server!"
  echo "IP Address: $(hostname -I)"
  echo "CPU Load Average: $(get_cpu_load)"
  echo "Memory Usage: $(get_memory_usage)"
  echo "Disk Usage: $(get_disk_usage)"
  echo "Top 5 CPU-consuming Processes:"
  echo "PID    %CPU    Name"
  get_top_cpu_processes
}

# Generate the welcome message
welcome_message=$(generate_welcome_message)

# Write the welcome message to /etc/motd
echo "$welcome_message" | sudo tee /etc/motd
```

3. send_email.sh： 发送电子邮件的脚本。此处使用 mail 命令发送邮件，您需要在服务器上配置好邮件发送功能。

```shell
#!/bin/bash

recipient="recipient@example.com"
subject="Server Status Alert"
message="Server status has changed. Please check the server."
mail -s "$subject" "$recipient" <<< "$message"
```

4. send_wechat.sh： 发送微信推送的脚本。此处使用 Server 酱（http://sc.ftqq.com/）来实现微信推送，您需要注册并获取 SCKEY。

```shell
#!/bin/bash

SCKEY="your_serverchan_sckey"
title="Server Status Alert"
content="Server status has changed. Please check the server."
curl -s "https://sc.ftqq.com/$SCKEY.send?text=$title&desp=$content"
```

5. 给脚本赋权
```shell
chmod +x system_status.sh update_motd.sh send_email.sh send_wechat.sh
```

然后，在服务器上配置 `tmux` 或 `screen` 来后台运行 `system_status.sh` 脚本，并在用户登录时运行 `update_motd.sh` 来更新 `/etc/motd` 文件。

最后，您可以通过定时任务工具如 `cron` 来定期运行监控脚本 `system_status.sh`，并在状态发生变化时调用发送邮件脚本 `send_email.sh` 和发送微信脚本 `send_wechat.sh` 进行推送。

6. 登录时执行指定脚本

```shell
# 将以上脚本移动到 `/usr/local/bin/`
sudo cp system_status.sh /usr/local/bin/
sudo cp update_motd.sh /usr/local/bin/
sudo cp send_email.sh /usr/local/bin/
sudo cp send_wechat.sh /usr/local/bin/

# 执行权限
sudo chmod +x /usr/local/bin/system_status.sh
sudo chmod +x /usr/local/bin/update_motd.sh
sudo chmod +x /usr/local/bin/send_email.sh
sudo chmod +x /usr/local/bin/send_wechat.sh

# 添加到bash启动项
vim ~/.bashrc           # 指定用户
vim /etc/bash.bashrc    # 所有用户
# 在末尾添加以下内容
/usr/local/bin/update_motd.sh
```

## 3. 修改 /etc/update-motd.d/
```shell
# 列出所有的配置文件
ls -l
00-header
10-uname 
50-landscape-sysinfo 
91-release-upgrade 
98-reboot-required
10-help-text 
90-updates-available 
98-fsck-at-reboot


vim 50-landscape-sysinfo
/usr/bin/landscape-sysinfo
```

## 4. 使用GPT提供的脚本
SSH登录的欢迎页面显示如下内容
1. 制造商
2. 处理器
3. 操作系统
4. IP
5. 系统负载 1min 5min 15min  运行时间
6. 内存已用 已用/总容量 (已用百分比) 单位Gi
7. 交换内存 已用/总容量 (已用百分比) 单位Gi
8. 真实内存 已用/总容量 (已用百分比) 单位Gi  
9. 缓存内存 已用 单位Gi
10. 磁盘空间 已用/总容量 (已用百分比) 单位Gi
11. 硬盘使用率 按照 df -h 输出即可 文件系统 类型 容量 已用 可用 已用百分比 挂载点
12. cpu 占用 TOP5进程的详细信息 按top命令的输出格式显示 PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
13. ram 占用 TOP5进程的详细信息 按top命令的输出格式显示 PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
请给出shell脚本

```shell
#!/bin/bash

# Define a function to display the welcome message
generate_welcome_message() {
    echo "*********************************************************************"
    echo "        欢迎访问 Redmi 7a       |       Welcome login Redmi 7a        "
    # 基础信息
    manufacturer=$(dmidecode -s system-manufacturer)
    cpu=$(cat /proc/cpuinfo | grep "model name" | head -n 1 | awk -F': ' '{print $2}')
    os=$(uname -a | awk '{print $1, $3}')
    ip=$(hostname -I | awk '{print $1}')
    # mac=$(cat /proc/net/arp | sed 1d | awk '{print $4}')
    mac=$(ip link show eth0 | awk '/ether/ {print $2}')
    echo "1. 制造商：${manufacturer:-Qualcomm-Mi}"
    echo "2. 处理器：$cpu"
    echo "3. 操作系统：$os"
    echo "4. IP地址：$ip    MAC：$mac"
    echo ""

    # 获取系统负载和运行时间
    loadavg=$(uptime | awk -F'load average:' '{print $2}')
    uptime_val=$(uptime | awk -F, '{print $1}')
    echo "5. 系统负载 1m，5m，15m：$loadavg"
    echo "  - 运行时间：$uptime_val"

    # 获取内存使用情况
    memory_info=$(free -m | awk 'NR==2 { printf "%.2f/%.2f (%.1f%%)", $3/1024, $2/1024, $3/$2 * 100 }')
    swap_info=$(free -m | awk 'NR==3 { printf "%.2f/%.2f (%.1f%%)", $3/1024, $2/1024, $3/$2 * 100 }')
    real_memory_info=$(free -m | awk 'NR==2 { printf "%.2f/%.2f (%.1f%%)", $3/1024, $2/1024, $3/$2 * 100 }')
    cached_memory=$(free -m | awk 'NR==2 { printf "%.2f", $7/1024 }')
    echo "6. 内存使用情况："
    echo "  - 已用内存：$memory_info"
    echo "  - 交换内存：$swap_info"
    echo "  - 真实内存：${real_memory_info:-N/A}"
    echo "  - 缓存内存：${cached_memory:-N/A}"
    echo ""

    # 获取磁盘空间使用情况
    disk_info=$(df -m | awk '$NF=="/" {printf "%.2f/%.2f（%.1f%% 已用）", $3/1024, $2/1024, $5/100 * 100}')
    echo "7. 磁盘空间使用情况："
    echo "  - 已用磁盘空间：$disk_info"
    echo ""

    # 获取磁盘使用情况的详细信息
    echo "8. 磁盘使用情况："
    # df -h | sed 1d # 删除第一行 sed 1d
    df -h
    echo ""

    # 获取CPU使用率前5的进程信息
    echo "9. CPU占用 - Top5"
    echo "$(top -b -n 1 -o +%CPU | head -n 12 | tail -n 6)"
    echo ""

    # 获取RAM使用率前5的进程信息
    echo "10. Ram占用 - Top5"
    echo "$(top -b -n 1 -o +%MEM | head -n 12 | tail -n 6)"

    echo "*********************************************************************"
}

# 调用函数，在用户登录时显示欢迎页面
welcome_message=$(generate_welcome_message)

# 将内容写入到 /etc/motd
echo "$welcome_message" | sudo tee /etc/motd
```

结果示例
```shell
*********************************************************************
        欢迎访问 Redmi 7a       |       Welcome login Redmi 7a        
1. 制造商：Qualcomm-Mi
2. 处理器：ARMv7 Processor rev 4 (v7l)
3. 操作系统：Linux 4.9.193-perf-gc01f2fd
4. IP地址：192.168.0.101    MAC：02:42:62:fb:97:f6

5. 系统负载 1m，5m，15m： 3.07, 3.08, 2.86
  - 运行时间： 01:52:14 up 1 day
6. 内存使用情况：
  - 已用内存：1.08/1.81 (59.5%)
  - 交换内存：0.36/1.50 (24.1%)
  - 真实内存：1.08/1.81 (59.5%)
  - 缓存内存：0.57

7. 磁盘空间使用情况：
  - 已用磁盘空间：1.91/1.94（100.0% 已用）

8. 磁盘使用情况：
文件系统          容量  已用  可用 已用% 挂载点
/dev/block/loop0  2.0G  2.0G     0  100% /
tmpfs             919M  1.1M  918M    1% /dev
tmpfs             929M     0  929M    0% /dev/shm

9. CPU占用 - Top5
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
13712 root      20   0    9868   1544    996 R  31.8   0.1   0:00.14 top
   69 root      20   0       0      0      0 S   4.5   0.0   0:06.73 rcuop/7
  348 root      20   0       0      0      0 D   4.5   0.0   1:57.45 mmc-cmdqd/0
 1513 aid_sys+  10 -10 1839164 225548 152644 S   4.5  11.9   9:35.61 system_server
    1 root      20   0   40144   2056   1324 S   0.0   0.1   0:04.28 init

10. Ram占用 - Top5
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1513 aid_sys+  10 -10 1839164 225548 152644 S   0.0  11.9   9:35.61 system_server
 1926 aid_sys+  20   0 1538800 103336  51356 S   0.0   5.4   4:17.52 ndroid.systemui
 6757 10171     10 -10 1653820  92516  46928 S   0.0   4.9   0:13.79 .baidu.input_mi
15023 10179     10 -10 1276236  74788  39712 S   0.0   3.9   0:29.51 fik.linuxdeploy
 8568 aid_sys+  20   0 1279624  69744  35912 S   0.0   3.7   0:04.28 iui.powerkeeper
*********************************************************************
```