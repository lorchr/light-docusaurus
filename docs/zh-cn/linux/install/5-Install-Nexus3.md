## 1. 安装 Nexus3

- https://www.sonatype.com/download-oss-sonatype
- https://help.sonatype.com/repomanager3/product-information/system-requirements#SystemRequirements-Linux
- https://help.sonatype.com/repomanager3/download/download-archives---repository-manager-3

### 1. 安装

```shell
# 下载安装包
wget https://download.sonatype.com/nexus/3/nexus-3.2.0-01-unix.tar.gz -O /usr/local/nexus/nexus-3.2.0-01-unix.tar.gz

# 创建安装目录
mkdir /usr/local/nexus/

# 解压安装包
tar -zxvf nexus-3.2.0-01-unix.tar.gz -C /usr/local/nexus/

# 设置 NEXUS3 运行用户为 root
vim /usr/local/nexus/nexus-3.2.0-01/bin/nexus.rc
run_as_user="root"

# 修改 NEXUS3 启动时要使用的 JDK 版本
vim /usr/local/nexus/nexus-3.2.0-01/bin/nexus
INSTALL4J_JAVA_HOME_OVERRIDE=/usr/local/java/jdk1.8.0/

# 修改 NEXUS3 默认端口 (可选)
vim /usr/local/nexus/nexus-3.2.0-01/etc/nexus-default.properties
application-port=18081

# 关闭防火墙，并开启远程访问端口 18081
firewall-cmd --zone=public --add-port=18081/tcp --permanent
firewall-cmd reload
firewall-cmd --list-all

# 创建用户并授权（跳过）
adduser nexus
passwd nexus
chown -R nexus /usr/local/java
chown -R nexus /usr/local/nexus
```

### 2. 注册为服务

新建一个`nexus.service`文件：

> vim /usr/lib/systemd/system/nexus.service

```shell
[Unit]
Description=nexus
After=network.target

[Service]
Type=forking
# Nexus的执行文件
ExecStart=/usr/local/nexus/nexus-3.2.0-01/bin/nexus start
ExecStop=/usr/local/nexus/nexus-3.2.0-01/bin/nexus stop
User=root
Restart=on-abort

[Install]
WantedBy=multi-user.target
```

### 3. 启动

```shell
# 重启守护进程
systemctl daemon-reload

# 启动 NEXUS3
systemctl enable nexus && systemctl start nexus

# 查看状态
systemctl status nexus

# 新版本查看密码，老版本默认（admin/admin123）
cat /usr/local/nexus/sonatype-work/nexus3/admin.password

# 查看开机自启
systemctl list-unit-files | grep nexus

# 关闭开机自启
systemctl disable nexus
```

访问Web页面: http://192.168.137.102:18081/
- admin/admin123

### 4. 仓库地址

| 序号 | 类型   | 种类   | URL                                        | 备注       |
| ---- | ------ | ------ | ------------------------------------------ | ---------- |
| 1    | Maven  | Proxy  | https://repo1.maven.org/maven2/            | 中央仓库   |
| 2    | Maven  | Proxy  | https://maven.aliyun.com/repository/public | 阿里云仓库 |
| 3    | Maven  | Hosted |                                            | 本地仓库   |
| -    | -      | -      | -                                          | -          |
| 1    | NPM    | Proxy  | https://registry.npmjs.org                 | 中央仓库   |
| 2    | NPM    | Proxy  | https://registry.npm.tabao.org             | 淘宝仓库   |
| 3    | NPM    | Proxy  | https://registry.npmmirror.com             | 淘宝仓库   |
| 4    | NPM    | Hosted |                                            | 本地仓库   |
| -    | -      | -      | -                                          | -          |
| 1    | Docker | Group  | http-18083                                 | 组合       |
| 2    | Docker | Proxy  | https://registry-1.docker.io               | 中央仓库   |
| 3    | Docker | Proxy  | https://registry.cn-hangzhou.aliyuncs.com  | 阿里云仓库 |
| 4    | Docker | Hosted | http-18082                                 | 本地仓库   |

**Docker仓库需要配置http地址**，并重新加载
vim /etc/docker/daemon.json
```json
{
  "registry-mirrors": ["https://rv4ppfhe.mirror.aliyuncs.com"],
  "exec-opts": ["native.cgroupdriver=systemd"],
  "insecure-registries": [
        "192.168.137.102:5000",
        "192.168.137.102:5080",
        "192.168.137.102:18082"
  ]
}
```

### 5. 测试

```shell
# 重启Docker
systemctl daemon-reload && service docker restart

# 查看配置的地址是否生效
docker info

# 登录仓库
docker login 192.168.137.102:18082

# 拉取测试镜像
docker pull alpine

# 重新打Tag
docker tag alpine:latest 192.168.137.102:18082/pi-diginn/alpine:latest

# 推送到私服
docker push 192.168.137.102:18082/pi-diginn/alpine:latest

# 从私服拉取镜像 走Group代理
docker pull 192.168.137.102:18083/pi-diginn/alpine:latest
```

### 使用Docker搭建

- https://help.sonatype.com/repomanager3/nexus-repository-administration/formats/docker-registry/docker-repository-reverse-proxy-strategies

```shell
docker run -d \
    -p 8081:8081 \
    -p 8082:8082 \
    -p 8083:8083 \
    -v /data/nexus-data:/nexus-data \
    -v /etc/hosts:/etc/hosts \
    -v /etc/localtime:/etc/localtime \
    --restart unless-stopped \
    --name nexus \ 
    sonatype/nexus3

https://blog.51cto.com/215687833/5051848
```

- [安装](https://www.cnblogs.com/hahaha111122222/p/13099635.html)
- [安装](https://hazx.hmacg.cn/server/nexus-docker-proxy.html)
- [安装](https://zhang.ge/5139.html)
- [清理镜像](https://dylanyang.top/post/2020/06/23/nexus-3.x%E6%B8%85%E7%90%86docker%E9%95%9C%E5%83%8F/)
