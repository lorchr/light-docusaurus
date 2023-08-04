## 1. 安装 Docker Registry 私服

这是最简洁最原始的方式，使用docker官方的提供的registry来搭建私服。优点是纯净、简洁，缺点是没有可视化界面、没有权限验证模块。

### 1. 安装

```shell
# 安装运行 Registry
docker run -d \
  --publish 5000:5000 \ 
  --volume /usr/local/registry/data:/var/lib/registry \
  --privileged=true \
  --restart=always \
  --name registry \
  registry:2

# 测试向私服推送镜像
docker pull alpine
docker tag alpine:latest 192.168.137.102:5000/alpine:latest
docker push 192.168.137.102:5000/alpine:latest

# 跳过Https限制
vim /etc/docker/daemon.json
{
  "registry-mirrors": ["https://rv4ppfhe.mirror.aliyuncs.com"],
  "exec-opts": ["native.cgroupdriver=systemd"],
  "insecure-registries": [
        "192.168.137.101:5000",
        "192.168.137.102:5000"
  ]
}

# 查看所有镜像
curl -X GET http://192.168.137.102:5000/v2/_catalog
# 查看指定镜像的所有版本
curl -X GET http://192.168.137.102:5000/v2/alpine/tags/list
```
访问Web: http://192.168.137.102:5000/v2/

### 2. 登录密码认证(跳过)

```shell
# 停止并删除容器
docker stop registry && docker rm registry

# 创建保存账号密码的文件
mkdir /usr/local/registry/auth
docker run --entrypoint htpasswd registry -Bbn admin admin > /usr/local/registry/auth/htpasswd

# 重新启动容器
docker run -d \
  --publish 5000:5000 \ 
  --volume /usr/local/registry/data:/var/lib/registry \
  --volume /usr/local/registry/auth:/auth \
  --env "REGISTRY_AUTH=htpasswd" \
  --env "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
  --env  REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
  --privileged=true \
  --restart=always \
  --name registry \
  registry:2
```

### 3. 删除已经上传的镜像

1. 打开镜像的存储目录，如有-V操作打开挂载目录也可以，删除镜像文件夹
> docker exec <容器名> rm -rf /var/lib/registry/docker/registry/v2/repositories/<镜像名>

2. 执行垃圾回收操作，注意2.4版本以上的registry才有此功能
> docker exec registry bin/registry garbage-collect /etc/docker/registry/config.yml
