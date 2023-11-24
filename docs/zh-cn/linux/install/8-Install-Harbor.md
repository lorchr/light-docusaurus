## 1. 安装 Harbor 私服

- https://goharbor.io/
- https://github.com/goharbor/harbor/releases

### 1. 安装

```shell
# 创建安装目录
mkdir /usr/local/harbor

# 下载安装包
wget https://github.com/goharbor/harbor/releases/download/v1.10.13-rc1/harbor-offline-installer-v1.10.13-rc1.tgz -O /usr/local/harbor/harbor-offline-installer-v1.10.13-rc1.tgz

# 解压安装包
tar xzvf /usr/local/harbor/harbor-offline-installer-v1.10.13-rc1.tgz -C /usr/local/harbor/

# 备份配置文件
cp harbor.yml harbor.yml.bak

# 新建配置文件
vim harbor.md

# 配置文件重命名
mv harbor.md harbor.yml
```

### 2. 初始化配置
```yaml
# 服务的名称或ip
# hostname: harbor.light.com
hostname: 192.168.137.102

# 启动端口
http:
  port: 5080

# 初始密码
harbor_admin_password: Harbor12345

# 默认使用内置postgresql 用户为 root
database:
  password: root123
  max_idle_conns: 50
  max_open_conns: 100

# 数据卷volume
data_volume: /data

# 日志配置
log:
  level: info
  local:
    rotate_count: 50
    rotate_size: 200M
    location: /usr/local/harbor/log

# jobservice的最大工作线程
jobservice:
  max_job_workers: 2

# Web hook 任务的最大重试次数
notification:
  webhook_job_max_retry: 2

# 禁用 chart
chart:
  absolute_url: disabled
```

执行简单安装
> /usr/local/harbor/harbor/install.sh

访问Web页面: http://192.168.137.102:5080
- admin/Harbor12345

### 3. 使用

```shell
# 创建用户
hliu/Liuhui1993

# 创建项目 关联用户
pi-diginn

# 镜像命名格式 参考推送镜像命令 harbor-server/PROJECT/IMAGE[:TAG]
192.168.137.102:5080/pi-diginn/pd-service-admin:4.0.0 # 合法命名
192.168.137.102:5080/pd-service-admin:4.0.0           # 非法命名

docker login --username=hliu --password=Liuhui1993 192.168.137.102:5080
docker push 192.168.137.102:5080/pi-diginn/pd-service-admin:4.0.0
docker logout
```

卸载Harbor

> cd /usr/local/harbor/harbor/
> docker-compose stop
