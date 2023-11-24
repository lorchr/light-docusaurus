- [Nginx学习（在 Docker 中使用 Nginx）](https://www.jianshu.com/p/4c8661657866)

## 1. 安装Nginx
使用 docker pull nginx 下载最新的 Nginx Docker 镜像。
下载完毕后，使用 docker run -d -p 80:80 --name nginx nginx，即可启动 Nginx 容器。其中，-p 80:80 表示将容器的 80 端口映射到 主机的 80 端口；--name nginx 表示将容器命名为“nginx”。

这时候，访问主机 ip，可以看到 Nginx 的欢迎页，说明已经运行成功。

## 2. Nginx 配置
Nginx 的默认配置文件是 `/etc/nginx/nginx.conf`。
使用 `docker exec -it nginx /bin/sh` 命令，进入 `nginx` 容器的命令行，然后进入 `/etc/nginx` 目录，查看 `nginx.conf` 文件。

以下是该文件内容及注释：
```conf
# 设置运行 nginx 的用户为 nginx 用户
user  nginx;

# 根据系统资源情况自动设置 worker 进程数量
worker_processes  auto;

# 指定错误日志的位置和日志级别为 notice
error_log  /var/log/nginx/error.log notice;

# 指定 nginx 的主进程 ID 存储位置
pid        /var/run/nginx.pid;

# events 块定义了事件模型和连接数配置
events {
    # 每个 worker 进程的最大连接数
    worker_connections  1024;
}

# http 块是 nginx 配置的主要部分，包含了 http 相关的配置
http {
    # 引入 mime.types 文件，该文件定义了 MIME 类型映射
    include       /etc/nginx/mime.types;

    # 设置默认 MIME 类型为 application/octet-stream
    default_type  application/octet-stream;

    # 设置日志格式 main，记录客户端访问日志
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    # 指定访问日志的存储位置和使用的日志格式
    access_log  /var/log/nginx/access.log  main;

    # 开启 sendfile 功能，提高文件传输性能
    sendfile        on;

    # 如果客户端连接非常快速，则可能启用 tcp_nopush，否则请注释掉此行
    # tcp_nopush     on;

    # 客户端与服务器之间的连接保持时间，超过这个时间将会自动关闭连接
    keepalive_timeout  65;

    # 如果需要开启 gzip 压缩功能，可以去掉此行的注释
    #gzip  on;

    # 引入 /etc/nginx/conf.d/ 目录下的所有 .conf 配置文件
    include /etc/nginx/conf.d/*.conf;
}
```

根据上述配置，可以在 `/etc/nginx/conf.d` 文件夹下，找到所有的 nginx 配置文件。默认情况下，该文件夹中只有一个 `default.conf` 文件，查看之：
```conf
# cat default.conf
# 定义一个HTTP服务器块，监听80端口，并且同时监听IPv4和IPv6地址的80端口
server {
    listen       80;
    listen  [::]:80;
    # 服务器名为localhost，即请求的域名为localhost时，会使用该server块的配置
    server_name  localhost;

    # 注释掉以下access_log配置，表示不记录访问日志
    #access_log  /var/log/nginx/host.access.log  main;

    # 配置根目录和默认的索引文件
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    # 注释掉以下error_page配置，表示不自定义错误页
    #error_page  404              /404.html;

    # 配置5xx错误码的错误页
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # 注释掉以下配置，表示不使用代理将PHP脚本传递给Apache服务器
    #
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;
    #}

    # 配置FastCGI服务器，将PHP脚本传递给监听在127.0.0.1:9000的FastCGI服务器
    #
    #location ~ \.php$ {
    #    root           html;
    #    fastcgi_pass   127.0.0.1:9000;
    #    fastcgi_index  index.php;
    #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
    #    include        fastcgi_params;
    #}

    # 注释掉以下配置，表示禁止访问.htaccess文件
    #
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```
可以看到，这里配置了 http 的监听端口，和一些跳转规则。

### 2.1 http 块配置
Nginx 的配置分为多个块，其中 http 块是其中的主要部分，包含了 http 的相关配置。

http 块主要可以设置以下参数：

- include：可以引入其他配置文件。例如，`include /etc/nginx/mime.types`; 表示引入了 `/etc/nginx/mime.types` 文件，其中包含了支持的文件类型。
- default_type: 指定默认的Content-Type，当请求的资源没有明确指定Content-Type时，将使用该默认类型。
- log_format: 定义日志格式，可以自定义日志输出的格式，可以使用预定义的变量来包含特定信息，例如`$remote_addr`表示客户端IP地址，`$request`表示请求内容，等等。
- access_log: 配置访问日志的路径和格式。可以指定日志输出到文件，也可以将日志重定向到标准输出流。
- error_log: 配置错误日志的路径和日志级别。可以指定日志输出到文件，也可以将日志重定向到标准错误流。
- sendfile: 是否开启sendfile指令。当该指令开启时，nginx会尝试使用sendfile系统调用来直接传输文件，提高文件传输效率。
- tcp_nopush: 开启后，允许发送TCP_NODELAY选项来减少网络传输延迟。
- keepalive_timeout: 配置HTTP keep-alive连接的超时时间。如果一个客户端在这个时间内没有发送新的请求，连接将被关闭。
- gzip: 配置gzip压缩。开启后，nginx会对响应的内容进行gzip压缩，减少传输数据量，提高性能。
- server: 用于配置一个虚拟主机（Server Block），包含了服务器的监听端口、域名、请求处理等配置。一个http块可以包含多个server块，用于配置多个虚拟主机。
- location: 用于配置请求处理的规则。location块可以根据URL路径或正则表达式来匹配请求，并指定相应的处理逻辑，例如反向代理、重定向、文件处理等。
- upstream: 配置代理服务器的集群。upstream指令用于定义一组后端服务器，并可以指定负载均衡算法来分配请求。

### 2.2 http - server 块配置
在 Nginx 的 http 配置中，可以包含多个 server 配置。如下：
```conf
http {
    # server块1
    server {
        # 该server块的配置
    }
    # server块2
    server {
        # 该server块的配置
    }
}
```
其中，server 块的主要参数包含：

- listen: 配置服务器监听的端口号和IP地址。可以通过listen指令指定多个端口号和IP地址，比如listen 80;表示监听80端口，默认监听所有可用IP地址。
- server_name: 配置服务器的域名或IP地址。可以配置多个域名，用空格隔开。当请求的Host头部与server_name中的某个域名匹配时，该server块将会处理该请求。
- add_header: 用于设置响应头信息。
- location: 用于配置请求处理的规则。location块可以根据URL路径或正则表达式来匹配请求，并指定相应的处理逻辑，例如反向代理、重定向、文件处理等。
- access_log和error_log: 配置访问日志和错误日志的路径和格式。
- try_files: 配置文件搜索顺序。当请求的文件不存在时，可以通过try_files指令指定多个备用文件，服务器会按照指定的顺序查找并返回第一个存在的文件。
- gzip: 配置gzip压缩。开启后，nginx会对响应的内容进行gzip压缩，减少传输数据量，提高性能。

例如，上述提到过的 default.conf 文件，主要内容如下：

```conf
# 定义一个HTTP服务器块，监听80端口，并且同时监听IPv4和IPv6地址的80端口
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    # 注释掉以下access_log配置，表示不记录访问日志
    #access_log  /var/log/nginx/host.access.log  main;

    # 配置根目录和默认的索引文件
    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    # 注释掉以下error_page配置，表示不自定义错误页
    #error_page  404              /404.html;

    # 配置5xx错误码的错误页
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
```
该配置定义了一个名为 localhost 的 server，监听本机 80 端口。

### 2.3 http - server - location 配置
- location 配置是Nginx中用来匹配请求URI（Uniform Resource Identifier）并指定如何处理请求的指令。在Nginx配置文件中，location 块用于根据不同的 URI 路径来定义不同的行为，如代理请求、重定向、设置缓存等。

#### 配置类型

location 块有不同的匹配类型：

- 普通匹配：使用前缀匹配或完全匹配来匹配请求URI。
例如 `location /example`：匹配以/example开头的URI路径。
- `=`：精准匹配。
例如 `location = /path/to/resource`，只有当请求的URI完全等于 `/path/to/resource` 时，该 location 块才会生效。
- `~`：正则表达式匹配。
例如 `location ~ ^/images/.*\.jpg$`：匹配以 `/images/` 开头且以 `.jpg` 结尾的URI路径。
- `~*`：不区分大小写的正则表达式匹配。
例如 `location ~* \.jpg$`：会匹配以 .jpg 结尾的URI，不区分大小写。
- `^~`：优先匹配。
例如 `location ^~ /static/`：匹配以 `/static/` 开头的URI路径，该匹配的优先级高于其他匹配。

#### 配置块参数

location 配置块中可以配置一些参数，常见的如下：

- root：指定location块的根目录，用于确定请求资源的实际文件路径。例如：root /usr/share/nginx/html;
- alias：类似于root，但是可以将URI路径替换为指定的路径，不包括location路径。例如：alias /path/to/files;
- try_files：定义尝试查找文件的顺序，用于处理静态文件请求。例如：try_files $uri $uri/ /index.html;
- proxy_pass：将请求代理到指定的后端服务。例如：proxy_pass http://backend_server;
- rewrite：重写URI，可用于重定向或修改请求URI。例如：rewrite ^/oldpath/(.*)$ /newpath/$1 permanent;
- auth_basic：启用基本的HTTP身份验证。例如：auth_basic "Restricted Area";
- if：条件判断，根据条件执行不同的指令。注意if指令有一些限制和陷阱，建议谨慎使用。
- limit_rate：限制请求速率，用于限制客户端访问速度。例如：limit_rate 100k;
- expires：设置缓存过期时间，用于控制静态资源的缓存时间。例如：expires 1d;
- add_header：添加自定义HTTP响应头。例如：add_header X-MyHeader "My Custom Header";
- proxy_set_header：设置代理请求头。例如：proxy_set_header X-Real-IP $remote_addr;
- proxy_redirect：修改代理请求的重定向头。例如：proxy_redirect off;
- proxy_pass_header：设置代理响应的头信息。例如：proxy_pass_header Server;

下面是一个简单的Nginx配置示例：
```conf
# 定义一个HTTP服务器块，监听80端口，并且设置主机名为example.com
server {
    listen 80;              # 监听80端口
    server_name example.com; # 设置主机名为example.com

    # 处理请求根路径的配置
    location / {
        root /usr/share/nginx/html; # 设置根目录为/usr/share/nginx/html
        index index.html;           # 设置默认的索引文件为index.html
    }

    # 处理以/images/开头的请求路径
    location /images/ {
        alias /var/www/images/;     # 将URI路径替换为/var/www/images/
    }

    # 处理以/api/开头且以.json结尾的请求路径
    location ~ ^/api/.*\.json$ {
        proxy_pass http://backend_server; # 将请求代理到后端服务器backend_server
    }
}
```

### 2.4 http - server - upstream 配置
upstream 块用于定义一组后端服务器，用于负载均衡或代理请求。
例如：
```conf
upstream my_backend {
    server backend_server1:8000;   # 定义第一个后端服务器，格式为 server [IP或域名]:端口
    server backend_server2:8000;   # 定义第二个后端服务器，可以配置多个服务器
    server unix:/tmp/backend.sock; # 也可以使用Unix Socket代替IP和端口
    weight=1;                      # 设置服务器的权重，默认为1，负载均衡时会根据权重分配请求
    max_fails=3;                   # 设置请求失败次数的阈值，默认为1，超过阈值后服务器被认为不可用
    fail_timeout=10s;              # 设置服务器的失败超时时间，默认为10秒
    backup;                        # 设置服务器为备份服务器，在其他服务器不可用时使用
    down;                          # 设置服务器为暂时不可用状态，不会分配请求给该服务器
}
```
在 upstream 块中，可以配置多个后端服务器，Nginx 会根据负载均衡算法将请求分发给这些后端服务器。
需要注意的是，如果是在 Docker 中运行的 Nginx，则这里的 server 字段可以配置为 容器名称:端口号，如 `ixiaoniu:8080`。

在定义了 upstream 块后，便可以在 location 块中通过 proxy_pass 指令将请求代理到定义的 upstream 块中的后端服务器：
```conf
location / {
    proxy_pass http://my_backend; # 将请求代理到名为 my_backend 的 upstream 块中定义的后端服务器
}
```

## 3. 一些常用命令
- `docker exec -it nginx /bin/bash`：进入在 Docker 中运行的 Nginx 容器命令行。
- `nginx -v`：显示 Nginx 版本。
- `nginx -t`：测试 Nginx 配置文件是否有错误。
- `nginx -s reload`：重新加载配置。
