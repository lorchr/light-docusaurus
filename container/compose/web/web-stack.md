
## 一、环境准备

### 1. Keycloak配置

```bash
# ==================== Keycloak ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/keycloak/{data,conf,logs}

# ==================== Keycloak ==================== 

```

### 2. Minio配置

- [Configure NGINX Proxy for MinIO Server](https://min.io/docs/minio/linux/integrations/setup-nginx-proxy-with-minio.html)
- [Configure MinIO for Authentication using Keycloak](https://min.io/docs/minio/linux/operations/external-iam/configure-keycloak-identity-management.html)
- [External Identity Management](https://min.io/docs/minio/linux/operations/external-iam.html?ref=con#minio-external-iam-oidc)
- [OpenID Identity Management Settings](https://min.io/docs/minio/linux/reference/minio-server/settings/iam/openid.html#minio-server-envvar-external-identity-management-openid)

```bash
# ==================== Minio ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/minio/{data,conf,logs}

# 获取默认配置文件
# 见 https://min.io/docs/minio/container/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html#id4

# 复制配置文件
cp ./minio/config.env    D:/docker/develop/web/minio/conf/config.env

# ==================== Minio ==================== 

```

### 3. Gitlab配置

- [0 down time deployment with GITLAB CI/CD && Docker](https://caddy.community/t/0-down-time-deployment-with-gitlab-ci-cd-docker/18698/3)
- [Caddy as a reverse proxy for Docker 87](https://github.com/lucaslorentz/caddy-docker-proxy)
- [Gitlab的Caddy配置](https://dengxiaolong.com/caddy/zh/example.gitlab.html)
- [配置 Nginx 反向代理 GitLab 服务](https://blog.csdn.net/u013670453/article/details/114693147)
- [Use a non-bundled web server](https://docs.gitlab.com/omnibus/settings/nginx.html#use-a-non-bundled-web-server)

```bash
# ==================== Gitlab ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/gitlab/{data,conf,conf/ssl,logs}

# 查看初始密码
cat /etc/gitlab/initial_root_password

# ==================== Gitlab ==================== 

```

### 4. Jenkins配置

```bash
# ==================== Jenkins ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/jenkins/{data,conf,logs}

# ==================== Jenkins ==================== 

```

### 5. SonarQube配置

```bash
# ==================== SonarQube ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/sonarqube/{data,conf,logs,extensions}

# ==================== SonarQube ==================== 

```

### 6. Outline配置

```bash
# ==================== Outline ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/outline/{data,data/uploads,conf,logs}

# ==================== Outline ==================== 

```

**注意**:
1. 在 Keycloak 中注册的账号必须要设置邮箱，没有邮箱的账户会验证失败
2. 使用本地文件系统时，可能不会自动创建 data/uploads 目录，导致文件上传失败，可以手动创建该目录

### 7. Readeck配置

```bash
# ==================== Readeck ==================== 
# 创建文件夹
mkdir -p D:/docker/develop/web/readeck/{data,conf,logs}

# 获取默认配置文件
docker run -d --name readeck_temp codeberg.org/readeck/readeck:0.15.3 \
  && docker cp readeck_temp:/readeck/config.toml  D:/docker/develop/web/readeck/conf/ \
  && docker stop readeck_temp && docker rm readeck_temp

# ==================== Readeck ==================== 

```

## 二、Docker Compose脚本及运行

| 服务      | 端口     | 暴露 | 功能      |
| --------- | -------- | ---- | --------- |
| KeyCloak  | 8080/tcp | -    | 应用入口  |
| Minio     | 9000/tcp | -    | 管理      |
| Minio     | 9001/tcp | -    | 预览链接  |
| Gitlab    | 22/tcp   | 2222 | SSH       |
| Gitlab    | 80/tcp   | -    | HTTP      |
| Gitlab    | 443/tcp  | -    | HTTPS     |
| Gitlab    | 5000/tcp | -    | Registery |
| Gitlab    | 8090/tcp | -    | Pages     |
| Jenkins   | 8080/tcp | -    | 应用入口  |
| Jenkins   | 5000/tcp | -    | 应用入口  |
| SonarQube | 9000/tcp | -    | 应用入口  |
| Outline   | 3000/tcp | -    | 应用入口  |
| Readeck   | 8000/tcp | -    | 应用入口  |

### 1. docker-compose.yaml

```yaml
version: "3"

services:
  
  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: web_keycloak
    hostname: keycloak.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.170
        aliases:
          - keycloak.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - keycloak.web:172.100.0.170
      - minio.web:172.100.0.172
      - gitlab.web:172.100.0.174
      - gitlab-runner.web:172.100.0.175
      - outline.web:172.100.0.176
      - readeck.web:172.100.0.178
    # ports:
    #   - 8080:8080
    expose:
      - 8080
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://pgsql.basic:5432/keycloak
      KC_DB_USER: keycloak
      KC_DB_SCHEMA: public
      KC_DB_PASSWORD: keycloak
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      # 外部访问使用的域名端口信息，与 KC_HOSTNAME_URL 二选一
      # KC_HOSTNAME: keycloak.light.local
      # KC_HOSTNAME_PORT: 443
      
      # 外部访问使用的域名地址，解决初始化403问题
      KC_HOSTNAME_URL: https://keycloak.light.local
      KC_HOSTNAME_ADMIN_URL: https://keycloak.light.local
      
      # 配置上下文地址
      # KEYCLOAK_FRONTEND_URL: https://keycloak.light.local/auth 
      # KC_HTTP_RELATIVE_PATH: /auth
      
      # 禁用HTTPS
      # KC_HOSTNAME_STRICT: false
      # KC_HOSTNAME_STRICT_HTTPS: false
      KC_HTTP_ENABLED: true
      KC_HEALTH_ENABLED: true
      # PROXY_ADDRESS_FORWARDING: true
    ### 日志默认位置 opt/keycloak/data/log
    ###! Docs: https://www.keycloak.org/server/logging#_configuring_the_location_and_name_of_the_log_file
    command: start --spi-login-protocol-openid-connect-legacy-logout-redirect-uri=true --log="console,file"
    restart: unless-stopped
    # depends_on:
    #   - postgres

  minio:
    image: minio/minio:RELEASE.2023-05-18T00-05-36Z
    container_name: web_minio
    hostname: minio.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.172
        aliases:
          - minio.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - keycloak.web:172.100.0.170
      - minio.web:172.100.0.172
      - gitlab.web:172.100.0.174
      - gitlab-runner.web:172.100.0.175
      - outline.web:172.100.0.176
      - readeck.web:172.100.0.178
    # ports:
    #   - 9000:9000
    #   - 9001:9001
    expose:
      - 9000
      - 9001
    volumes:
      - //d/docker/develop/web/minio/data:/mnt/data
      - //d/docker/develop/web/minio/conf/config.env:/etc/minio/config.env
    environment:
      MINIO_CONFIG_ENV_FILE: /etc/minio/config.env
    command: ['server', '/data', '--address', ':9000', '--console-address', ':9001']
    restart: unless-stopped

  gitlab:
    image: gitlab/gitlab-ce:17.1.6-ce.0
    privileged: true
    container_name: web_gitlab
    hostname: gitlab.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.174
        aliases:
          - gitlab.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - keycloak.web:172.100.0.170
      - minio.web:172.100.0.172
      - gitlab.web:172.100.0.174
      - gitlab-runner.web:172.100.0.175
      - outline.web:172.100.0.176
      - readeck.web:172.100.0.178
    ports:
    #   - 80:80 # 注意宿主机和容器内部的端口要一致，否则external_url无法访问
    #   - 443:443
    #   - 22:22
      - 2222:22
    expose:
      - 80
      - 443
      - 22
    environment:
      TZ: Asia/Shanghai
      GITLAB_ROOT_PASSWORD: nJAfvWGS4q1Tw09h=
      GITLAB_OMNIBUS_CONFIG: |
        gitlab_rails['time_zone'] = 'Asia/Shanghai'

        ### 备份配置，这里不能设置自动备份，后面我将介绍怎么在容器外设置自动备份。
        ###! Docs: https://docs.gitlab.com/omnibus/settings/backups.html
        gitlab_rails['backup_keep_time'] = 604800 # 备份保留的时间，单位秒，这里设置为一周

        ### 配置启用、禁用 SSL
        ###! Docs: https://docs.gitlab.com/omnibus/settings/ssl/#configure-https-manually
        # external_url 'http://gitlab.light.local'
        # registry_external_url 'http://gitlab.light.local'
        # letsencrypt['enable'] = false
        # nginx['redirect_http_to_https'] = true
        # nginx['ssl_certificate'] = "/etc/gitlab/ssl/light.local.crt"
        # nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/light.local.key"
        # nginx['ssl_trusted_certificate'] = "/etc/gitlab/ssl/ca.crt"

        ### 配置使用外部 Nginx
        ###! Docs: https://atlassc.net/2022/02/24/self-managed-gitlab-with-docker-compose
        external_url 'https://gitlab.light.local'
        # GitLab 景象中自带一个 Nginx，但是我希望能使用外部的 Nginx 来进行反向代理配置，这样更加灵活，所以在这里禁用掉自带的 Nginx HTTPS 配置，仅使用 80 在主机上提供 HTTP 访问
        nginx['listen_port'] = 80
        nginx['listen_https'] = false
        # 强制 https
        # 虽然禁用掉了内置 Nginx 的 HTTPS，我们还是需要在 GitLab 上设置 HTTP 请求转 HTTPS，HTTPS 的反向代理将由外部 Nginx 来完成
        nginx['proxy_set_headers'] = {
          "X-Forwarded-Proto" => "https",
          "X-Forwarded-Ssl" => "on"
        }

        ### 配置SSH SSH直接映射到物理机
        gitlab_rails['gitlab_ssh_host'] = 'gitlab.light.local'
        gitlab_rails['gitlab_shell_ssh_port'] = 2222
        gitlab_rails['gitlab_shell_git_timeout'] = 800

        ### 配置使用外部 Pgsql
        ###! Docs: https://docs.gitlab.com/omnibus/settings/database.html
        postgresql['enable'] = false
        gitlab_rails['db_adapter'] = "postgresql"
        gitlab_rails['db_encoding'] = "utf-8"
        # gitlab_rails['db_collation'] = nil
        gitlab_rails['db_database'] = "gitlab"
        gitlab_rails['db_username'] = "gitlab"
        gitlab_rails['db_password'] = "gitlab"
        gitlab_rails['db_host'] = "pgsql.basic"
        gitlab_rails['db_port'] = 5432
        gitlab_rails['db_pool'] = 100

        ### 配置使用外部 Redis
        ###! Docs: https://docs.gitlab.com/omnibus/settings/redis.html
        redis['enable'] = false
        gitlab_rails['redis_host'] = 'redis.basic'
        gitlab_rails['redis_port'] = 6379
        # gitlab_rails['redis_password'] = ''

        ### 配置使用外部认证 keyCloak
        ### https://docs.gitlab.com/ee/administration/auth/oidc.html#configure-keycloak
        gitlab_rails['omniauth_providers'] = [
          {
            name: "openid_connect", # do not change this parameter
            label: "Keycloak", # optional label for login button, defaults to "Openid Connect"
            args: {
              name: "openid_connect",
              scope: ["openid", "profile", "email"],
              response_type: "code",
              issuer:  "https://keycloak.light.local/realms/master",
              client_auth_method: "query",
              discovery: true,
              uid_field: "preferred_username",
              pkce: true,
              client_options: {
                identifier: "Gitlab",
                secret: "5e1b5P0QhYHcWh2gyXutXalrTyEQGzrG",
                redirect_uri: "https://gitlab.light.local/users/auth/openid_connect/callback"
              }
            }
          }
        ]
    volumes:
      - //d/docker/develop/web/gitlab/conf:/etc/gitlab
      - //d/docker/develop/web/gitlab/logs:/var/log/gitlab
      - //d/docker/develop/web/gitlab/data:/var/opt/gitlab
    shm_size: '256m'
    restart: unless-stopped
    # depends_on:
    #   - postgres

  # gitlab-runner:
  #   image: 'gitlab/gitlab-runner:latest'
  #   container_name: web_gitlab-runner
  #   hostname: gitlab-runner.web
  #   networks:
  #     default: null
  #     develop:
  #       ipv4_address: 172.100.0.175
  #       aliases:
  #         - gitlab-runner.web
  #   dns:
  #     - 192.168.137.1
  #     - 8.8.8.8
  #   extra_hosts:
  #     - mysql.basic:172.100.0.101
  #     - pgsql.basic:172.100.0.106
  #     - redis.basic:172.100.0.111
  #     - influx.basic:172.100.0.116
  #     - mqtt.basic:172.100.0.121
  #     - keycloak.web:172.100.0.170
  #     - minio.web:172.100.0.172
  #     - gitlab.web:172.100.0.174
  #     - gitlab-runner.web:172.100.0.175
  #     - outline.web:172.100.0.176
  #     - readeck.web:172.100.0.178
  #   volumes:
  #     - '/opt/store/gitlab-runner:/etc/gitlab-runner'
  #     # 这个挂载是将宿主机上的docker socket挂载到了容器内，这样容器内执行的docker命令会被宿主机docker daemon最终执行
  #     - '/var/run/docker.sock:/var/run/docker.sock' 
  #   restart: no

  # jenkins:
  #   image: jenkins/jenkins:jdk21
  #   container_name: web_jenkins
  #   hostname: jenkins.web
  #   networks:
  #     default: null
  #     develop:
  #       ipv4_address: 172.100.0.160
  #       aliases:
  #         - jenkins.web
  #   dns:
  #     - 192.168.137.1
  #     - 8.8.8.8
  #   extra_hosts:
  #     - mysql.basic:172.100.0.101
  #     - pgsql.basic:172.100.0.106
  #     - redis.basic:172.100.0.111
  #     - influx.basic:172.100.0.116
  #     - mqtt.basic:172.100.0.121
  #     - keycloak.web:172.100.0.170
  #     - minio.web:172.100.0.172
  #     - gitlab.web:172.100.0.174
  #     - gitlab-runner.web:172.100.0.175
  #     - outline.web:172.100.0.176
  #     - readeck.web:172.100.0.178
  #   # ports:
  #   #   - 8080:8080
  #   #   - 5000:5000
  #   expose:
  #     - 8080
  #     - 5000
  #   user: root
  #   volumes:
  #     - //d/docker/develop/web/jenkins/data/:/var/jenkins_home
  #   restart: no # unless-stopped

  # sonarqube:
  #   image: sonarqube:lts
  #   container_name: web_sonarqube
  #   hostname: sonarqube.web
  #   networks:
  #     default: null
  #     develop:
  #       ipv4_address: 172.100.0.162
  #       aliases:
  #         - sonarqube.web
  #   dns:
  #     - 192.168.137.1
  #     - 8.8.8.8
  #   extra_hosts:
  #     - mysql.basic:172.100.0.101
  #     - pgsql.basic:172.100.0.106
  #     - redis.basic:172.100.0.111
  #     - influx.basic:172.100.0.116
  #     - mqtt.basic:172.100.0.121
  #     - keycloak.web:172.100.0.170
  #     - minio.web:172.100.0.172
  #     - gitlab.web:172.100.0.174
  #     - gitlab-runner.web:172.100.0.175
  #     - outline.web:172.100.0.176
  #     - readeck.web:172.100.0.178
  #   # ports:
  #   #   - 9000:9000
  #   expose:
  #     - 9000
  #   environment:
  #     - SONAR_JDBC_URL=jdbc:postgresql://pgsql.basic:5432/sonar
  #     - SONAR_JDBC_USERNAME=sonar
  #     - SONAR_JDBC_PASSWORD=sonar
  #   volumes:
  #     - //d/docker/develop/web/sonarqube/conf:/opt/sonarqube/conf
  #     - //d/docker/develop/web/sonarqube/data:/opt/sonarqube/data
  #     - //d/docker/develop/web/sonarqube/extensions:/opt/sonarqube/extensions
  #   restart: no # unless-stopped
  #   # depends_on:
  #   #   - postgres

  outline:
    image: docker.getoutline.com/outlinewiki/outline:latest
    container_name: web_outline
    hostname: outline.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.176
        aliases:
          - outline.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - keycloak.web:172.100.0.170
      - minio.web:172.100.0.172
      - gitlab.web:172.100.0.174
      - gitlab-runner.web:172.100.0.175
      - outline.web:172.100.0.176
      - readeck.web:172.100.0.178
    # ports:
    #   - 3000:3000
    expose:
      - 3000
    volumes:
      - //d/docker/develop/web/outline/data:/var/lib/outline/data
    environment:
      NODE_TLS_REJECT_UNAUTHORIZED: "0"
    command: sh -c "sleep 60 && yarn start --env production-ssl-disabled"
    env_file: ./outline.env
    # depends_on:
    #   - postgres
    #   - redis

  readeck:
    image: codeberg.org/readeck/readeck:latest
    container_name: web_readeck
    hostname: readeck.web
    networks:
      default: null
      develop:
        ipv4_address: 172.100.0.178
        aliases:
          - readeck.web
    dns:
      - 192.168.137.1
      - 8.8.8.8
    extra_hosts:
      - mysql.basic:172.100.0.101
      - pgsql.basic:172.100.0.106
      - redis.basic:172.100.0.111
      - influx.basic:172.100.0.116
      - mqtt.basic:172.100.0.121
      - keycloak.web:172.100.0.170
      - minio.web:172.100.0.172
      - gitlab.web:172.100.0.174
      - gitlab-runner.web:172.100.0.175
      - outline.web:172.100.0.176
      - readeck.web:172.100.0.178
    # ports:
    #   - 8000:8000
    expose:
      - 8000
    volumes:
      - //d/docker/develop/web/readeck/data:/readeck/data
      - //d/docker/develop/web/readeck/conf/config.toml:/readeck/config.toml
    environment:
      # The URL of the instance's database.
      - READECK_DATABASE_SOURCE=postgres://readeck:readeck@pgsql.basic:5432/readeck
      # Defines the application log level. Can be error, warning, info, debug.
      - READECK_LOG_LEVEL=info
      # The IP address on which Readeck listens.
      - READECK_SERVER_HOST=0.0.0.0
      # The TCP port on which Readeck listens. Update container port above to match (right of colon).
      - READECK_SERVER_PORT=8000
      # The URL prefix of Readeck.
      - READECK_SERVER_PREFIX=/
      # A list of hostnames allowed in HTTP requests. Required for reverse proxy configuration.
      - READECK_ALLOWED_HOSTS=readeck.light.local
      # Use the 'X-Forwarded-' headers. Required for reverse proxy configuration.
      - READECK_USE_X_FORWARDED=true
    healthcheck:
      test: ["CMD", "/bin/readeck", "healthcheck", "-config", "config.toml"]
      interval: 30s
      timeout: 2s
      retries: 3
    # depends_on:
    #   - postgres
    #   - redis

networks:
  develop:
    external: true
  proxy-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.77.0.0/16

# volumes:
#   keycloak_data:
#   minio_data:

```

### 2. 启动服务组

```bash
docker compose -f web.yaml -p web up -d

docker compose -f web.yaml -p web down

```

## 三、启动后配置

### 1. KeyCloak配置

#### 1. 导入客户端
1. 浏览器打开 https://keycloak.light.local/admin/master/console/#/master/clients
2. 点击 Import client，依次上传 keycloak文件夹下的 Minio.json Gitlab.json Outline.json 并保存

#### 2. 配置Minio认证

- Client ID: Minio
- Always display in UI: On
- Client authentication: On
- Client Secret: QQO0uOF9w9XAx8BW8JGMR9fdIEXYAwuy
- Authentication flow:
  - Standard flow
  - Direct access grants

1. Root URL: 
   - https://minio.console.light.local/
2. Home URL: 
   - https://minio.console.light.local
3. Valid redirect URIs: 
   - https://minio.console.light.local/*
4. Valid post logout redirect URIs 
   - https://minio.console.light.local/
5. Web origins 
   - https://minio.console.light.local
6. Admin URL: 
   - https://minio.console.light.local

#### 3. 配置Gitlab认证

Client ID: Gitlab
Client authentication: ON
Client Secret: 5e1b5P0QhYHcWh2gyXutXalrTyEQGzrG

1. Root URL: 
   - https://gitlab.light.local/
2. Home URL: 
   - https://gitlab.light.local
3. Valid redirect URIs: 
   - https://gitlab.light.local/*
   - https://gitlab.light.local/users/auth/openid_connect/callback
4. Valid post logout redirect URIs 
   - https://gitlab.light.local/
5. Web origins 
   - https://gitlab.light.local
6. Admin URL: 
   - https://gitlab.light.local


#### 4. 配置Outline认证

Client ID: Outline
Client authentication: ON
Client Secret: twKvRwFbaocqchHv2QeEyUhJZ9edyver

1. Root URL: 
   - https://outline.light.local/
2. Home URL: 
   - https://outline.light.local
3. Valid redirect URIs: 
   - https://outline.light.local/*
   - https://outline.light.local/auth/oidc
   - https://outline.light.local/auth/oidc.callback
4. Valid post logout redirect URIs 
   - https://outline.light.local/
5. Web origins 
   - https://outline.light.local
6. Admin URL: 
   - https://outline.light.local


#### 5. 配置Nextcloud认证

Client ID: Nextcloud
Client authentication: ON
Client Secret: gKy0Ot3Y6msNWqzColMbK3KYy6NRjORf

1. Root URL: 
   - https://nextcloud.light.local/
2. Home URL: 
   - https://nextcloud.light.local
3. Valid redirect URIs: 
   - https://nextcloud.light.local/*
4. Valid post logout redirect URIs 
   - https://nextcloud.light.local/
5. Web origins 
   - https://nextcloud.light.local
6. Admin URL: 
   - https://nextcloud.light.local


7. Advance - Fine grain OpenID Connect configuration
   - ID token signature algorithm: RS256
8. Advance - Advance Settings (可选项，且Social Login 时不能设置此选项)
   - Proof Key for Code Exchange Code Challenge Method: S256

### 2. Gitlab配置

#### 1. 容器配置SSL CA证书

- https://docs.gitlab.com/ee/install/docker/
- https://docs.gitlab.com/omnibus/settings/ssl/#configure-https-manually
- https://docs.gitlab.com/ee/administration/auth/oidc.html#configure-keycloak

集成KeyCloak认证必须使用HTTPS，但自签名的证书 Gitlab 无法识别，需要将CA证书安装到 Gitlab 容器

1. 将预先生成的CA证书、KeyCloak证书放到，配置目录 `D:/docker/develop/web/gitlab/conf`
2. 将CA证书复制到 `/etc/gitlab/ssl/trusted-certs` `/usr/local/share/ca-certificates/` `/opt/gitlab/embedded/ssl/certs`

```bash
# 【无效】 复制 ca.crt 到信任证书目录
cp /etc/gitlab/ssl/ca.crt /etc/gitlab/trusted-certs/ca.crt

# 【有效】 复制 ca.pem 到信任证书目录，注意： 目标文件名称必须为 cacert.pem
cat /etc/gitlab/ssl/ca.pem >> /opt/gitlab/embedded/ssl/certs/cacert.pem

# 【无效】 复制 ca.pem 到待安装证书目录
cp /etc/gitlab/ssl/ca.pem /usr/local/share/ca-certificates/rootCA.crt

```

3. 安装CA证书

```bash
# 查看已安装CA证书
ll /etc/ssl/certs/

# 需要先安装 ca-certificates
# apt install ca-certificates

update-ca-certificates

# 查看已安装CA证书
cat /etc/ssl/certs/ca-certificates.crt

```

4. 测试结果

```bash
# 查看证书
openssl x509 -in /usr/local/share/ca-certificates/ca.crt -text -noout

# 测试
curl -v -I -H GET https://jd.com
curl -v -I -H GET https://keycloak.light.local

```

- [Solution] https://www.cnblogs.com/bfmq/p/15917975.html
- [Solution] https://gitlab.com/gitlab-org/gitlab/-/issues/344077
- https://gitlab.com/gitlab-org/gitlab/-/issues/196193
- https://docs.gitlab.com/omnibus/settings/ssl.html#other-certificate-authorities
- https://forum.gitlab.com/t/500-error-after-keycloak-login-certificate-verify-failed-unable-to-get-local-issuer-certificate/49065
- https://forum.gitlab.com/t/openssl-sslerror-ssl-connect-returned-1-errno-0-state-error-certificate-verify-failed-unable-to-get-local-issuer-certificate/48845

5. 删除CA证书

```bash
rm /usr/local/share/ca-certificates/ca.crt

update-ca-certificates --fresh

```

#### 2. 宿主机（客户端）安装CA证书

见 net-stack 配置

#### 3. Git客户端配置CA证书

1. Git安装证书

```bash
# 防止拉取仓库时报错 SSL certificate problem: unable to get local issuer certificate
git config --global http.sslCAInfo D:/docker/develop/web/gitlab/conf/ssl/root_ca.crt

# 也可以禁用SSL证书校验
git config --global http.sslVerify false

```

#### 4. 配置Keycloak登录

1. 使用 root 账号在 Gitlab 创建用户账号 light
2. 在用户详情 点击 New Identity 新增认证方式
3. Provider 选择 Keycloak, Identifier 输入用户名 light
4. 用户账号使用 Keycloak 登录到 Gitlab

### 3. Minio配置



### 4. Outline配置



### 5. Readeck配置
1. 浏览器访问 https://readeck.light.local 
2. 设置账户密码 root / 12345678

## 四、常见问题

### 1. Outline 登录失败

   - 可以检查是否本机开启了代理，使用 `apt update` 不报错 `connecting to 127.0.0.1:4780` 字样即可

### 2. Gitlab Root用户创建失败（可以在数据库查看users表）

   - 一般是密码包含不识别的特殊字符，建议使用 数字 大小写字母 = 等符号，不要使用@ # & $等符号


