- [Gitea Offical](https://about.gitea.com/)
- [Gitea Offical Document](https://docs.gitea.com/)
- [Gitea Docker](https://hub.docker.com/r/gitea/gitea)
- [Gitea Runer Docker](https://hub.docker.com/r/gitea/act_runner)

## 1. Docker安装
```shell
# 创建Network
docker network create dev

# 创建数据卷
docker volume create mysql_data;

# 创建文件夹
mkdir -p //d/docker/gitea/{data,conf,logs,runner,runner/data}

# 运行容器
docker run -d \
  --publish 30000:3000 \
  --publish 22222:2222 \
  --volume //d/docker/gitea/data:/var/lib/gitea \
  --volume //d/docker/gitea/conf:/etc/gitea \
  --net dev \
  --restart=on-failure:3 \
  --name gitea \
  gitea/gitea:1.21.1-rootless

# 创建Runner配置文件
docker pull gitea/act_runner::0.2.6
docker run --entrypoint="" --rm -it \
  gitea/act_runner:0.2.6 act_runner generate-config > D:/docker/gitea/runner/config.yaml

# 获取Token 去页面复制token即可
# http://localhost:3000/admin/actions/runners
# http://localhost:3000/<org>/settings/actions/runners
# http://localhost:3000/<owner>/<repo>/settings/actions/runners

# 运行Runner
docker run -d \
    --volume //d/docker/gitea/runner/config.yaml:/config.yaml \
    --volume //d/docker/gitea/runner/data:/data \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --env CONFIG_FILE=/config.yaml \
    --env GITEA_INSTANCE_URL=http://192.168.179.168:3000 \
    --env GITEA_RUNNER_REGISTRATION_TOKEN=jkgwO4IflKldE6cSdkd8TxB0sYzK5LcvuSpC2pl5 \
    --env GITEA_RUNNER_NAME=gitea_runner \
    --env GITEA_RUNNER_LABELS=global \
    --net dev \
    --restart=on-failure:3 \
    --name gitea_runner \
    gitea/act_runner:0.2.6
```

- [Dashboard](http://localhost:3000)


## Runner配置
### Runner级别
您可以在不同级别上注册Runner，它可以是：

- 实例级别：Runner将为实例中的所有存储库运行Job。
- 组织级别：Runner将为组织中的所有存储库运行Job。
- 存储库级别：Runner将为其所属的存储库运行Job。

请注意，即使存储库具有自己的存储库级别Runner，它仍然可以使用实例级别或组织级别Runner。未来的版本可能提供更多对此进行更好控制的选项。

### 获取注册令牌

Runner级别决定了从哪里获取注册令牌。

- 实例级别：管理员设置页面，例如 `<your_gitea.com>/admin/actions/runners`。
- 组织级别：组织设置页面，例如 `<your_gitea.com>/<org>/settings/actions/runners`。
- 存储库级别：存储库设置页面，例如 `<your_gitea.com>/<owner>/<repo>/settings/actions/runners`。

如果您无法看到设置页面，请确保您具有正确的权限并且已启用 Actions。

注册令牌的格式是一个随机字符串 `D0gvfu2iHfUjNqCYVljVyRV14fISpJxxxxxxxxxx`。

注册令牌也可以通过 Gitea 的 [命令行](https://docs.gitea.com/zh-cn/administration/command-line#actions-generate-runner-token) 获得:

### 命令行获取令牌 
```shell
actions generate-runner-token
```

生成一个供 `Runner` 使用的新令牌，用于向服务器注册。

选项：
```shell
--scope {owner}[/{repo}]，-s {owner}[/{repo}]：限制 Runner 的范围，没有范围表示该 Runner 可用于所有仓库，但你也可以将其限制为特定的仓库或所有者。
```

要注册全局 Runner：
```shell
gitea actions generate-runner-token
```

要注册特定组织的 Runner，例如 org：
```shell
gitea actions generate-runner-token -s org
```

要注册特定仓库的 Runner，例如 username/test-repo：
```shell
gitea actions generate-runner-token -s username/test-repo
```
