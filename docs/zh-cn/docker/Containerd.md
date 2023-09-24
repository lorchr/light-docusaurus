- [Containerd ctr、crictl、nerdctl 客户端命令介绍与实战操作](https://blog.csdn.net/zfw_666666/article/details/126605139)
- [crictl 命令用法及与docker-cli的命令对比](https://www.jianshu.com/p/0f7940258b7a)

## 一、概述
作为接替 Docker 运行时的 Containerd 在早在 `Kubernetes1.7` 时就能直接与 Kubelet 集成使用，只是大部分时候我们因熟悉 Docker，在部署集群时采用了默认的 dockershim。在V1.24起的版本的 kubelet 就彻底移除了dockershim，改为默认使用Containerd了，当然也使用cri-dockerd适配器来将Docker Engine与 Kubernetes 集成。可以参考[官方文档](https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/#docker)：

> https://kubernetes.io/zh-cn/docs/setup/production-environment/container-runtimes/#docker

## 二、Containerd 常见命令操作
> 更换 Containerd 后，以往我们常用的 docker 命令也不再使用，取而代之的分别是crictl和ctr两个命令客户端。

- `crictl`是遵循 CRI 接口规范的一个命令行工具，通常用它来检查和管理kubelet节点上的容器运行时和镜像。
- `ctr`是containerd的一个客户端工具。
- `ctr -v`输出的是containerd的版本，`crictl -v`输出的是当前 k8s 的版本，从结果显而易见你可以认为crictl是用于k8s的。

> 一般来说你某个主机安装了 k8s 后，命令行才会有 crictl 命令。而 ctr 是跟 k8s 无关的，你主机安装了 containerd 服务后就可以操作 ctr 命令。

使用crictl命令之前，需要先配置`/etc/crictl.yaml`如下：
```yaml
runtime-endpoint: unix:///run/containerd/containerd.sock 
image-endpoint: unix:///run/containerd/containerd.sock 
timeout: 10 
debug: false
```

也可以通过命令进行设置：
```shell
crictl config runtime-endpoint unix:///run/containerd/containerd.sock 
crictl config image-endpoint unix:///run/containerd/containerd.sock
```

| 命令                     | docker             | ctr (containerd)               | crictl(kubernates) |
| ------------------------ | ------------------ | ------------------------------ | ------------------ |
| 查看运行的容器           | docker ps          | ctr task ls / ctr container ls | crictl ps          |
| 查看镜像                 | docker images      | ctr image ls                   | crictl images      |
| 查看容器日志             | docker logs        | -                              | crictl logs        |
| 查看容器数据信息         | docker inspect     | ctr container info             | crictl inspect     |
| 查看容器资源             | docker stats       | -                              | crictl stats       |
| 启动/关闭已有的容器       | docker start/stop  | ctr task start/kill            | crictl start/stop  |
| 运行一个新的容器         | docker run         | ctr run                        | - (最小单元为pod)   |
| 打标签                   | docker tag         | ctr image tag                  | -                  |
| 创建一个新的容器         | docker create      | ctr container create           | crictl create      |
| 导入镜像                 | docker load        | ctr image import               | -                  |
| 导出镜像                 | docker save        | ctr image export               | -                  |
| 删除容器                 | docker rm          | ctr container rm               | crictl rm          |
| 删除镜像                 | docker rmi         | ctr image rm                   | crictl rmi         |
| 拉取镜像                 | docker pull        | ctr image pull                 | crictl pull        |
| 推送镜像                 | docker push        | ctr image push                 | -                  |
| 登录或在容器内部执行命令 | docker exec        | -                              | crictl  exec       |
| 清空不用的容器           | docker image prune | -                              | crictl rmi --prune |

更多命令操作，可以直接在命令行输入命令查看帮助。
```shell
docker --help 
ctr --help 
crictl --help
```

由于 Containerd 也有 namespaces 的概念，对于上层编排系统的支持，ctr客户端 主要区分了 3 个命名空间分别是`k8s.io`、`moby`和`default`，以上我们用crictl操作的均在`k8s.io`命名空间，使用ctr看镜像列表就需要加上`-n` 参数。crictl 是只有一个`k8s.io`命名空间，但是没有`-n`参数。

> 【温馨提示】`ctr images pull` 拉取的镜像默认放在`default`，而 `crictl pull` 和 `kubelet` 默认拉取的镜像都在 `k8s.io` 命名空间下。所以通过`ctr`导入镜像的时候特别注意一点，最好指定命名空间。

```shell
# 注意-n不能放在命令最后面，下面几行查看的镜像是一样的 
ctr -n=k8s.io image ls 
ctr -n k8s.io image ls 

# crictl 没有-n参数，操作都在`k8s.io`命名空间下。 
crictl image ls 
crictl images
# crictl image list = ctr -n=k8s.io image list 
# crictl image ls   = ctr -n=k8s.io image ls 
# crictl images     = ctr -n=k8s.io image list 
# crictl images     = ctr -n=k8s.io image ls 

# 使用ctr命令指定命名空间导入镜像 
ctr -n=k8s.io image import dashboard.tar 
# 查看镜像，可以看到可以查询到了
crictl images
```

## 三、containerd 客户端工具 nerdctl
推荐使用 nerdctl，使用效果与 docker 命令的语法一致，github 下载链接：

> https://github.com/containerd/nerdctl/releases

- 精简 (nerdctl--linux-amd64.tar.gz): 只包含 `nerdctl`
- 完整 (nerdctl-full--linux-amd64.tar.gz):包含 `containerd`, `runc`, and `CNI` 等依赖

> `nerdctl`的目标并不是单纯地复制 `docker` 的功能，它还实现了很多 `docker` 不具备的功能，例如延迟拉取镜像（`lazy-pulling`）、镜像加密（`imgcrypt`）等。具体看 nerdctl。


延迟拉取镜像功能可以参考这篇文章：Containerd 使用 Stargz Snapshotter 延迟拉取镜像

> https://icloudnative.io/posts/startup-containers-in-lightning-speed-with-lazy-image-distribution-on-containerd/

### 1）安装 nerdctl（精简版）
```shell
wget https://github.com/containerd/nerdctl/releases/download/v0.22.2/nerdctl-0.22.2-linux-amd64.tar.gz 
# 解压
tar -xf nerdctl-0.22.2-linux-amd64.tar.gz 
ln -s /opt/k8s/nerdctl/nerdctl /usr/local/bin/nerdctl
```

### 2）安装 nerdctl（完整版，这里不装）
```shell
wget https://github.com/containerd/nerdctl/releases/download/v0.22.2/nerdctl-full-0.22.2-linux-amd64.tar.gz
# 解压
tar -xf nerdctl-full-0.16.0-linux-amd64.tar.gz -C /usr/local/
cp /usr/local/lib/systemd/system/*.service /etc/systemd/system/
```

启动服务 `buildkit`
```shell
systemctl enable buildkit containerd --now 
systemctl status buildkit containerd
```

### 3）安装 buildkit 支持构建镜像
buildkit GitHub 地址：

> https://github.com/moby/buildkit


> 使用**精简版 nerdctl 无法直接通过 containerd 构建镜像**，需要与 buildkit 组全使用以实现镜像构建。当然你也可以安装上面的完整 nerdctl；buildkit 项目是 Docker 公司开源出来的一个构建工具包，支持 OCI 标准的镜像构建。它主要包含以下部分:

- 服务端 buildkitd，当前支持 runc 和 containerd 作为 worker，默认是 runc；
- 客户端 buildctl，负责解析 Dockerfile，并向服务端 buildkitd 发出构建请求。

buildkit 是典型的**C/S 架构**，client 和 server 可以不在一台服务器上。而 nerdctl 在构建镜像方面也可以作为 buildkitd 的客户端。
```shell
# https://github.com/moby/buildkit/releases 
wget https://github.com/moby/buildkit/releases/download/v0.10.4/buildkit-v0.10.4.linux-amd64.tar.gz 
tar -xf buildkit-v0.10.4.linux-amd64.tar.gz -C /usr/local/
```

配置 buildkit 的启动文件，可以从这里下载：
```shell
https://github.com/moby/buildkit/tree/master/examples/systemd
```

buildkit 需要配置两个文件

- /usr/lib/systemd/system/buildkit.socket
```shell
cat > /usr/lib/systemd/system/buildkit.socket << EOF
[Unit] 
Description=BuildKit 
Documentation=https://github.com/moby/buildkit

[Socket] 
ListenStream=%t/buildkit/buildkitd.sock 
SocketMode=0660 

[Install] 
WantedBy=sockets.target
EOF
```

- /usr/lib/systemd/system/buildkit.service
```shell
cat > /usr/lib/systemd/system/buildkit.service << EOF 
[Unit] 
Description=BuildKit 
Requires=buildkit.socket 
After=buildkit.socket 
Documentation=https://github.com/moby/buildkit 

[Service] 
# Replace runc build swith containerd builds
ExecStart=/usr/local/bin/buildkitd --addr fd://

[Install] 
WantedBy=multi-user.target 
EOF
```

启动 buildkit
```shell
systemctl daemon-reload 
systemctl enable buildkit --now
```

## 四、实战操作
### 1）修改 containerd 配置文件
```shell
containerd config default > /etc/containerd/config.toml
```
配置如下：
```toml
[plugins."io.containerd.grpc.v1.cri".registry] 
    config_path="" 
    
    [plugins."io.containerd.grpc.v1.cri".registry.auths] 
    
    [plugins."io.containerd.grpc.v1.cri".registry.configs] 
        [plugins."io.containerd.grpc.v1.cri".registry.configs."myharbor-minio.com".tls] 
            insecure_skip_verify=true #跳过认证 
            ca_file="/etc/containerd/myharbor-minio.com/ca.crt" 
        [plugins."io.containerd.grpc.v1.cri".registry.configs."myharbor-minio.com".auth] 
            username="admin" 
            password="Harbor12345" 

        [plugins."io.containerd.grpc.v1.cri".registry.headers] 

        [plugins."io.containerd.grpc.v1.cri".registry.mirrors] 
            [plugins."io.containerd.grpc.v1.cri".registry.mirrors."myharbor-minio.com"] 
                endpoint=["https://myharbor-minio.com"]
```


重启 containerd
```shell
# 重新加载配置 
systemctl daemon-reload 
# 重启containerd 
systemctl restart containerd
```

> **注意：** 这个配置文件是给`crictl`和`kubelet`使用，`ctr`是不可以用这个配置文件的，`ctr` 不使用 CRI，因此它不读取 plugins."io.containerd.grpc.v1.cri"配置。

### 2）ctr 拉取推送镜像
```shell
# 推送镜像到harbor 
ctr --namespace=k8s.io images push myharbor-minio.com/bigdata/minio:2022.8.22-debian-11-r0 --skip-verify --user admin:Harbor12345 

# --namespace=k8s.io 指定命名空间，不是必须，根据环境而定 
# --skip-verify 跳过认证 
# --user指定harbor用户名及密码

# 从harbor拉取镜像
ctr images pull --user admin:Harbor12345 --tlscacert=/etc/containerd/myharbor-minio.com/ca.crt myharbor-minio.com/bigdata/minio:2022.8.22-debian-11-r0
```

不想 `-u user:password` 每次必须使用 `ctr pull`/`ctr push`， 可以使用 `nerdctl`。

### 3）镜像构建
```shell
cat > Dockerfile << EOF 
FROM nginx:alpine 
RUN echo 'Hello Nerdctl From Containerd' > /usr/share/nginx/html/index.html 
EOF
```

然后在文件所在目录执行镜像构建命令：
```shell
# 不加-n指定命名空间，crictl看不到，kubelet也不能使用它，默认在default命名空间下 
nerdctl -n k8s.io build -t nginx:nerctl -f./Dockerfile . 

### 参数解释 
# -t：指定镜像名称 
# . ：当前目录Dockerfile 
# -f：指定Dockerfile路径 
# --no-cache：不缓存
```

### 4）打标签 tag
```shell
# crictl没有tag命令，只能使用nerdctl和ctr，必须指定命名空间，要不然kubelet无法使用。 
ctr -n k8s.io i tag 
nerdctl -n k8s.io tag nginx:nerctl myharbor-minio.com/bigdata/nginx:nerctl 
# ctr -n k8s.io tag nginx:nerctl myharbor-minio.com/bigdata/nginx:nerctl 
# 查看镜像 
nerdctl -n k8s.io images myharbor-minio.com/bigdata/nginx:nerctl
```

### 5）将镜像推送到 Harbor
第一种情况：http方式，配置如下：
```shell
# 以下两个哪个都可以 
# mkdir -p /etc/docker/certs.d/myharbor-minio.com:443 
mkdir -p /etc/containerd/certs.d/myharbor-minio.com:443 
cat > /etc/containerd/certs.d/myharbor-minio.com\:443/hosts.toml << EOF 
server="https://docker.io"

[host."http://myharbor-minio.com:80"] 
    capabilities=["pull","resolve","push"] 
    #skip_verify=true 
    #ca="ca.crt"            # 相对路径 
    #ca="/opt/auth/ca.crt"  # 绝对路径 
    #ca=["/opt/auth/ca.crt"] 
    #ca=["ca.crt"] 
    #client=[["/opt/auth/nginx.cclinux.cn.crt","/opt/auth/nginx.cclinux.cn.key"]] 
EOF
```

第一种情况：https方式，配置如下：
```shell
# 以下两个哪个都可以 
# mkdir -p /etc/docker/certs.d/myharbor-minio.com:443 
mkdir -p /etc/containerd/certs.d/myharbor-minio.com:443 
cat > /etc/containerd/certs.d/myharbor-minio.com\:443/hosts.toml << EOF 
server="https://docker.io" 

[host."https://myharbor-minio.com:443"] 
    capabilities=["pull","resolve","push"] 
    skip_verify=true 
    #ca="ca.crt"            # 相对路径 
    #ca="/opt/auth/ca.crt"  # 绝对路径 
    #ca=["/opt/auth/ca.crt"] 
    ca=["/etc/containerd/myharbor-minio.com/ca.crt"] 
    #client=[["/opt/auth/nginx.cclinux.cn.crt","/opt/auth/nginx.cclinux.cn.key"]] 
EOF
```

通过 nerdctl 登录 harbor
```shell
echo Harbor12345| nerdctl login --username "admin" --password-stdin myharbor-minio.com:443

# nerdctl login --username "admin" --password Harbor12345 myharbor-minio.com:443

# 登出 
# nerdctl logout
```


开始将镜像推送到 harbor
```shell
### 推送到Harbor 
# --insecure-registry       skips verifying HTTPS certs, and allows falling back to plain HTTP 
nerdctl --insecure-registry --namespace=k8s.io push myharbor-minio.com/bigdata/nginx:nerctl 
# ctr --namespace=k8s.io images push myharbor-minio.com/bigdata/nginx:nerctl --skip-verify --user admin:Harbor12345 

# --namespace=k8s.io指定命名空间，跟 -n 一样，不是必须，根据环境而定
# --skip-verify跳过认证 
# --user指定harbor用户名及密码
```

Containerd ctr，crictl，nerdctl 客户端命令介绍与实战操作就到这里了，有疑问的小伙伴欢迎给我留言哦！


## 五、crictl 与 docker-cli命令对比
`crictl` 是 CRI 兼容的容器运行时命令行接口。 你可以使用它来检查和调试 Kubernetes 节点上的容器运行时和应用程序。 `crictl` 和它的源代码在 `cri-tools` 代码库。

crictl 默认连接到`unix:///var/run/dockershim.sock`。 对于其他的运行时，你可以用多种不同的方法设置端点:

- 通过设置参数 `--runtime-endpoint`和 `--image-endpoint`
- 通过设置环境变量 `CONTAINER_RUNTIME_ENDPOINT` 和 `IMAGE_SERVICE_ENDPOINT`
- 通过在配置文件中设置端点`--config=/etc/crictl.yaml`

要查看或编辑当前配置，请查看或编辑 `/etc/crictl.yaml` 的内容。
```shell
[root ~]$ cat /etc/crictl.yaml
runtime-endpoint: unix:///var/run/dockershim.sock
image-endpoint: unix:///var/run/dockershim.sock
timeout: 10
debug: true
```

| crictl            | 描述                                                 |
| ----------------- | ---------------------------------------------------- |
| imagefsinfo       | 返回镜像的文件系统信息                               |
| inspectp          | 显示一个或多个 Pod 的状态                            |
| port-forward      | 转发本地端口到 Pod                                   |
| pods              | 列举 Pod                                             |
| runp              | 运行一个新的 Pod                                     |
| rmp               | 移除一个或多个 Pod                                   |
| stopp             | 停止一个或多个正运行的 Pod                           |
| attach            | 连接到一个运行中的容器                               |
| exec              | 在运行中的容器里运行一个命令                         |
| images            | 列举镜像                                             |
| info              | 显示系统级的信息                                     |
| inspect, inspecti | 返回容器、镜像或者任务的详细信息                     |
| logs              | 获取容器的日志                                       |
| ps                | 列举容器                                             |
| stats             | 实时显示容器的资源使用统计信息                       |
| version           | 显示运行时（Docker、ContainerD、或者其他) 的版本信息 |
| create            | 创建一个新的容器                                     |
| stop (timeout=0)  | 杀死一个或多个正在运行的容器                         |
| pull              | 从镜像仓库拉取镜像或者代码仓库                       |
| rm                | 移除一个或多个容器                                   |
| rmi               | 移除一个或多个镜像                                   |
| run               | 在新容器里运行一个命令                               |
| start             | 启动一个或多个停止的容器                             |
| stop              | 停止一个或多个正运行的容器                           |
| update            | 更新一个或多个容器的配置                             |

## Docker CLI 和 crictl 的映射
以下的映射表格只适用于 `Docker CLI v1.40` 和 `crictl v1.19.0` 版本。 请注意该表格并不详尽。例如，其中不包含 Docker CLI 的实验性命令。

> 说明： 尽管有些命令的输出缺少了一些数据列，CRICTL 的输出格式与 Docker CLI 是类似的。 如果你的脚本程序需要解析命令的输出，请确认检查该特定命令的输出。

| docker cli | crictl            | 描述                                                              | 不支持的功能                                                      |
| ---------- | ----------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| attach     | attach            | 连接到一个运行中的容器                                            | --detach-keys, --sig-proxy                                        |
| exec       | exec              | 在运行中的容器里运行一个命令                                      | --privileged, --user, --detach-keys                               |
| images     | images            | 列举镜像                                                          |
| info       | info              | 显示系统级的信息                                                  |
| inspect    | inspect, inspecti | 返回容器、镜像或者任务的详细信息                                  |
| logs       | logs              | 获取容器的日志                                                    | --details                                                         |
| ps         | ps                | 列举容器                                                          |
| stats      | stats             | 实时显示容器的资源使用统计信息                                    | 列：NET/BLOCK I/O, PIDs                                           |
| version    | version           | 显示运行时（Docker、ContainerD、或者其他) 的版本信息              |
| create     | create            | 创建一个新的容器                                                  |
| kill       | stop (timeout=0)  | 杀死一个或多个正在运行的容器                                      | --signal                                                          |
| pull       | pull              | 从镜像仓库拉取镜像或者代码仓库--all-tags, --disable-content-trust |
| rm         | rm                | 移除一个或多个容器                                                |
| rmi        | rmi               | 移除一个或多个镜像                                                |
| run        | run               | 在新容器里运行一个命令                                            |
| start      | start             | 启动一个或多个停止的容器                                          | --detach-keys                                                     |
| stop       | stop              | 停止一个或多个正运行的容器                                        |
| update     | update            | 更新一个或多个容器的配置                                          | CRI 不支持 --restart、--blkio-weight 以及一些其他的资源限制选项。 |
