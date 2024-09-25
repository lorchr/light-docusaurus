# 使用 Docker Compose 私有部署 GitLab 超简单

在这篇文章里，我将介绍

* 怎样使用 `docker-compose` 来部署一个私有部署的 GitLab 实例 
* 设置域名反向代理 
* 配置 `gitlab-runner` 实自动化流水线 
* 配置备份与恢复 


### 配置要求 

目前版本的 `gitlab-ce` 需要 4-6GB 的 RAM 来运行，建议配置 8GB 以上的服务器。


### 安装 Docker 与 docker-compose 

Docker 是一种开源的容器化平台，可以打包应用程序和其依赖项到容器中，使应用程序更加可靠和可重复地运行。如果你还没有安装 docker，请参考它[官方文档](https://docs.docker.com/engine/install/)来安装。


安装好 Docker 以后我们还需要安装 `docker-compose`，`docker-compose` 是一个用于定义和运行多容器 Docker 应用程序的工具。使用 Compose，我们可以使用 YAML 文件配置应用程序的服务。然后，通过单个命令，您可以从配置中创建并启动所有服务。这样易于我们后期对容器进行更新和维护。请参考它[官方文档](https://docs.docker.com/compose/install/)来安装。


### 使用 docker-compose 来部署 GitLab 

我们只需要编写一个`docker-compose.yml`文件，就可以轻松地完成 GitLab 容器部署。

下面我们来看看这个`docker-compose.yml`文件应该怎样编写。

#### docker-compose.yml 

我们先在服务器上建一个叫gitlab-ce的项目目录，然后在这个目录中创建一个`docker-compose.yml`文件。请参考下面的`docker-compose.`yml文件中的注释来配置你的 GitLab。

```yaml
web:
  image: 'gitlab/gitlab-ce:latest' # 使用 gitlab-ce 的官方景象 https://hub.docker.com/r/gitlab/gitlab-ce/
  restart: always
  hostname: 'hostname.example.com' # 域名
  container_name: gitlab # 容器名称
  environment:
    # GitLab 配置项，可参考官方文档 https://docs.gitlab.com/omnibus/settings/README.html
    GITLAB_OMNIBUS_CONFIG: |
      # 外部域名
      external_url 'https://hostname.example.com'

      # 时区
      gitlab_rails['time_zone'] = 'Beijing'

      # 备份配置 https://docs.gitlab.com/omnibus/settings/backups.html，这里不能设置自动备份，后面我将介绍怎么在容器外设置自动备份。
      gitlab_rails['backup_keep_time'] = 604800 # 备份保留的时间，单位秒，这里设置为一周

      # 异地备份配置 https://docs.gitlab.com/ee/raketasks/backup_restore.html#uploading-backups-to-a-remote-cloud-storage
      # 我们可以使用阿里云OSS或者其他所支持的备份方案对 GitLab 进行导地备份
      gitlab_rails['backup_upload_connection'] = {
        'provider' => 'aliyun',
        'aliyun_accesskey_id' => '<填写你的 accesskey id>',
        'aliyun_accesskey_secret' => '<填写你的 accesskey secret>',
        'aliyun_oss_endpoint' => 'http://end_point.aliyuncs.com',
        'aliyun_oss_bucket' => '<填写你的 bucket_name>',
        'aliyun_oss_location' => 'location'
      }
      gitlab_rails['backup_upload_remote_directory'] = 'gitlab'

      # 配置 stmp/email 邮件设置 https://docs.gitlab.com/omnibus/settings/smtp.html
      gitlab_rails['smtp_enable'] = true
      gitlab_rails['smtp_address'] = 'smtp.mail.example.com'
      gitlab_rails['smtp_port'] = 465
      gitlab_rails['smtp_user_name'] = 'your@example.com'
      gitlab_rails['smtp_password'] = 'your_email_password'
      gitlab_rails['smtp_authentication'] = 'login'
      gitlab_rails['smtp_tls'] = true
      gitlab_rails['gitlab_email_from'] = 'your@example.com'

      # GitLab 景象中自带一个 Nginx，但是我希望能使用外部的 Nginx 来进行反向代理配置，这样更加灵活，所以在这里禁用掉自带的 Nginx HTTPS 配置，仅使用 80 在主机上提供 HTTP 访问
      nginx['listen_port'] = 80
      nginx['listen_https'] = false

      # 强制 https
      # 虽然禁用掉了内置 Nginx 的 HTTPS，我们还是需要在 GitLab 上设置 HTTP 请求转 HTTPS，HTTPS 的反向代理将由外部 Nginx 来完成
      nginx['proxy_set_headers'] = {
        "X-Forwarded-Proto" => "https",
        "X-Forwarded-Ssl" => "on"
      }
  # 映射端口
  ports:
    - '10080:80' # 我们将在主机内使用 10080 端口访问容器内的 80 端口。部署完成以后可以使用 curl http://127.0.0.1:10080 来查看是否部署成功。
    # - '10443:443'
    # - '10022:22'
  # 挂载数据到主机
  volumes:
    # GitLab 配置文件
    - '<host_path_for_gitlab>/config:/etc/gitlab'
    # 日志文件
    - '<host_path_for_gitlab>/log:/var/log/gitlab'
    # 数据文件，其中包含备份文件
    - '<host_path_for_gitlab>/data:/var/opt/gitlab'
```


#### 执行部署 

在编写好上面的`docker-compose.yml`文件以后，我们就可以在项目目录下执行下面的命令来部署 GitLab 了。

```bash
bash docker-compose up -d 
```

GitLab 部署的过程很慢，可能需要5到10分钟。运行好上面的命令以后，我们可以再运行下面这个命令来检查部署的状态：

```bash
bash docker ps | grep 'gitlab' 
```


当我们看到STATUS为healthy时，说明 GitLab 已经部署完成了。



| STATUS | EXPLAIN |
|----|----|
| Up (starting) | 容器刚刚启动，如果此时访问gitlab会收到502的错误信息。 |
| Up (healthy) | 启动完成。 |
| Up (unhealthy) | 发生了错误。 |


### 配置域名反向代理以及 HTTPS 

#### 域名解析 

请先添加一条域名A解析记录，将域名解析到服务器的 IP 地址上。

#### Nginx 配置 

然后在服务器上[安装 Nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)，并在`/etc/nginx/conf.d`目录下创建一个配置文件`gitlab.conf`。

```bash
server {
    listen 80;
    server_name <YOUR_DOMAIN>; # 你的域名
    location / {
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass http://127.0.0.1:10080/; # 你的 gitlab-ce 容器监听的端口
    }
    # 配置日志
    access_log  /var/log/nginx/gitlab_access.log;
    error_log   /var/log/nginx/gitlab_error.log;
}
```

#### 启用 Nginx 配置 

```bash
# 测试配置
nginx -t

# 测试显示`successful`以后更新配置
nginx -s reload
```


#### **使用 Let's Encrypt! (Certbot/SSL) 配置 HTTPS**

此时我们已经完成 HTTP 80 端口的反向代理设置，但由我面上面设置的 GitLab 需要使用 HTTPS 来访问，我们还需要为 Nginx 配置 HTTPS。

这里我建议使用 Let's Encrypt 来配置 HTTPS，因为它是免费的，而且配置过程也比较简单，可以在服务器上自动部署和更新 SSL 证书。


#### **安装 Certbot**

Certbot 是 Let's Encrypt 官方提供的命令行工具，可以帮助我们自动部署和更新 SSL 证书。请根据[官方指南](https://certbot.eff.org/instructions)安装 Certbot。通常 Linux 系统的包管理器中都已经包含了 Certbot。以 Ubuntu 为例：


```bash
# https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04
sudo apt install certbot python3-certbot-nginx
```


#### **使用 Certbot 部署 SSL 证书**

请在终端运行下面这个命令来部署 SSL 证书：

```javascript
certbot
```

看到提示以后输入你之前在 Nginx 中配置的域名的编号。然后 Certbot 会自动为你配置 SSL 证书。

非常简单。


到此，你的 GitLab 应该已经完成部署了。你可以在浏览器中输入你的域名来访问 GitLab 了。


### 配置 GitLab Runner 

GitLab Runner 是 GitLab 流水线的客户端，我们也可以使用 docker-compose 来进行配置和部署。你可以参考下面这个`docker-compose.yaml`来配置：

```yaml
version: "3.5"

services:

  runner:
    image: gitlab/gitlab-runner:latest
    container_name: gitlab-runner
    restart: always
    volumes:
      - "/etc/gitlab-runner:/etc/gitlab-runner" # 挂载配置文件
      - "/var/run/docker.sock:/var/run/docker.sock" # 如果你希望在 runner 中调用主机的 docker engine，可以在这里配置映射
```


runner 部署好以后就参照官方文档来[注册 runner 到 gitlab](https://docs.gitlab.com/runner/register/#docker)即可。

```yaml
docker exec -it gitlab-runner gitlab-runner register
```


### **配置 Gitlab 数据备份**

#### **备份密钥**

**重要!**

GitLab 会在初次运行时在配置文件夹中生成密钥文件`gitlab-secrets.json`，请在第一时间进行备份。如果丢失可能无法恢复项目数据。

万一你要是弄丢了这个密钥，请参照[官方文档](https://docs.gitlab.com/ee/raketasks/backup_restore.html#when-the-secrets-file-is-lost)看看有没有补救的方案。

在上文的 `docker-compose.yml` 文件中的 `volumes` 节点里，已经配置了 GitLab 的配置文件夹。

#### **备份数据**

我们可以运行下面这个命令来对 GitLab 进行备份。

```yaml
docker exec -it gitlab /opt/gitlab/bin/gitlab-rake gitlab:backup:create 
```


备份文件将被生成在配置文件夹中的backups文件夹中，见docker-compose.yml文件中的volumes。

#### **设置自动备份**

GitLab 的镜像中没有设置自动备份的功能，但我们可以在 docker host 中设置一个 cron job 来实现自动备份。

```yaml
# 创建一个 cron job
crontab -e
```


```yaml
# 配置 cron job
30 23 * * * docker exec gitlab /opt/gitlab/bin/gitlab-rake gitlab:backup:create
```


这样就可以在每天的 23:30 自动备份 GitLab 数据了。

关于 Cron Job 的配置，请参考[这篇文章](https://www.runoob.com/w3cnote/linux-crontab-tasks.html)。

也可以到[crontab.guru](https://crontab.guru/)这个网站来生成配置。


### **更新 GitLab**

使用 docker-compose 来部署容器的好此就是它更新和维护非常简单，你只需要运行下面两行命令就能轻松的更新 GitLab：


```yaml
docker-compose pull # 拉取最新的镜像
docker-compose up -d # 重启容器
```


### **从备份恢复 GitLab**

```yaml
docker exec -it <GITLAB_CONTAINER_NAME> gitlab-backup restore BACKUP=<BACK_UP_FILENAME>
```



***


### **更新Gitlab配置**

使用你喜欢的文本编辑器打开`/etc/gitlab/gitlab.rb`，更新下面的值。

* 替换`external_url`为`https`协议 
* 把`gitlab_workhorse['listen_network']`从 `"unix"` 改成 `"tcp"`
* 把`gitlab_workhorse['listen_addr']`从`"000"`改成`"127.0.0.1:8181"` 除了root，
* 把`web_server['external_users']`改成运行caddy的用户 
* 把`nginx['enable'] = "true"`改成`nginx['enable'] = "false"` 
* 保存并退出配置文件，然后运行`gitlab-ctl reconfigure`使配置生效


### **更新Caddyfile**

将gitlab.example.com指向你的FQDN。

#### **Caddyfile**

**代理到http**

```javascript
https://gitlab.example.com {
    log git.access.log 
    errors git.errors.log {
        404 /opt/gitlab/embedded/service/gitlab-rails/public/404.html
        422 /opt/gitlab/embedded/service/gitlab-rails/public/422.html
        500 /opt/gitlab/embedded/service/gitlab-rails/public/500.html
        502 /opt/gitlab/embedded/service/gitlab-rails/public/502.html
    }

    proxy / http://127.0.0.1:8181 {
        fail_timeout 300s
        transparent
        header_upstream X-Forwarded-Ssl on
    }
}
```

**代理到socket文件**

```javascript
https://gitlab.domain.tld {

    errors {
        404 /opt/gitlab/embedded/service/gitlab-rails/public/404.html
        422 /opt/gitlab/embedded/service/gitlab-rails/public/422.html
        500 /opt/gitlab/embedded/service/gitlab-rails/public/500.html
        502 /opt/gitlab/embedded/service/gitlab-rails/public/502.html
    }

    proxy / unix:/home/git/gitlab/tmp/sockets/gitlab.socket {
        fail_timeout 300s

        transparent
    }
}
```


* **[使用 Docker Compose 私有部署 GitLab 超简单](https://atlassc.net/2022/02/24/self-managed-gitlab-with-docker-compose)**
* **[Gitlab的Caddy配置](https://dengxiaolong.com/caddy/zh/example.gitlab.html)**