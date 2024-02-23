- [Offical](https://nginx.org/)
- [Offical Document](https://nginx.org/en/docs/)
- [Docker](https://hub.docker.com/_/nginx)

- [Nginx Proxy Manager](https://nginxproxymanager.com/)
- [Nginx Proxy ManagerGithub](https://github.com/jc21/nginx-proxy-manager)
- [Nginx Proxy Manager Docker](https://hub.docker.com/r/jc21/nginx-proxy-manager)

## 1. Docker安装 Nginx
```shell
# 创建文件夹
mkdir -p //d/docker/nginx/{conf,data,logs,files}

# 获取默认配置文件
docker run -d --name nginx_temp nginx:1.25 \
&& docker cp nginx_temp:/etc/nginx/nginx.conf D:/docker/nginx/conf/nginx.conf.example \
&& docker cp nginx_temp:/etc/nginx/conf.d/ D:/docker/nginx/conf/ \
&& docker stop nginx_temp && docker rm nginx_temp

# 运行容器
docker run -d \
  --publish 30080:80 \
  --publish 30081:81 \
  --publish 30082:82 \
  --publish 30090:90 \
  --publish 30091:91 \
  --publish 30092:92 \
  --publish 30443:443 \
  --volume //d/docker/nginx/data:/usr/share/nginx/html:ro \
  --volume //d/docker/nginx/conf/nginx.conf:/etc/nginx/nginx.conf:ro \
  --volume //d/docker/nginx/conf/conf.d:/etc/nginx/conf.d \
  --volume //d/docker/nginx/logs:/var/log/nginx \
  --volume //d/docker/nginx/files:/usr/share/nginx/files \
  --add-host 'nginx.light.com:192.168.0.21' \
  --add-host 'plmtest.sdlg.cn:192.168.0.21' \
  --net dev \
  --restart=no \
  --name nginx \
  nginx:1.25

docker exec -it -u root nginx /bin/bash

vim /etc/nginx/nginx.conf
vim /etc/nginx/

sed -i "s@http://deb.debian.org/debian@http://mirrors.aliyun.com/debian@g" /etc/apt/sources.list.d/debian.sources
sed -i "s@http://deb.debian.org/debian-security@http://mirrors.aliyun.com/debian@g" /etc/apt/sources.list.d/debian.sources
```

## 2. Docker安装 NPM
```shell
# 运行容器
docker run -d \
  --publish 10080:80 \
  --publish 10081:81 \
  --publish 10443:443 \
  --volume //d/docker/npm/conf/config.json:/app/config/production.json \
  --net dev \
  --restart=no \
  --name nginx-proxy-manager \
  jc21/nginx-proxy-manager:latest

docker run -d \
  --publish 10080:80 \
  --publish 10081:81 \
  --publish 10443:443 \
  --volume //d/docker/npm/data:/data \
  --volume //d/docker/npm/conf/encrypt:/etc/letsencrypt \
  --volume //d/docker/npm/conf/config.json:/app/config/production.json \
  --net dev \
  --restart=no \
  --name nginx-proxy-manager \
  jc21/nginx-proxy-manager:latest
```

[Dashboard](http://localhost:10081)
- Account
  - admin@example.com/ changeme
  - lorch@npm.com / 12345678

## 参考
- [Nginx Proxy Manager](https://nginxproxymanager.com/)
- [Docker Docs](https://docs.docker.com/)
- [Portainer](https://www.portainer.io/)
- [Compose specification - Docker](https://docs.docker.com/compose/compose-file/)
- [Docker Engine installation overview](https://docs.docker.com/engine/install/)
- [portainer-ce 中文版](https://hub.docker.com/r/6053537/portainer-ce)
- [在线 nginx 配置生成工具和 nginx 配置 UI 管理工具](https://sirliu.github.io/2021/8/%E5%9C%A8%E7%BA%BFnginx%E9%85%8D%E7%BD%AE%E7%94%9F%E6%88%90%E5%B7%A5%E5%85%B7%E5%92%8Cnginx%E9%85%8D%E7%BD%AEUI%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7/)
- [Docker 管理面板 Portainer 中文汉化 新增 CE、EE 企业版汉化](https://imnks.com/3406.html)

## 配置文件
1. default.conf

```conf
server {
  listen       80;
  listen  [::]:80;
  server_name  localhost;

  #access_log  /var/log/nginx/host.access.log  main;

  location / {
      root   /usr/share/nginx/html/default;
      index  index.html index.htm;
  }

  #error_page  404              /404.html;

  # redirect server error pages to the static page /50x.html
  #
  error_page   500 502 503 504  /50x.html;
  location = /50x.html {
      root   /usr/share/nginx/html;
  }

  # 图片防盗链
  location ~* \.(gif|jpg|jpeg|png|bmp|swf)$ {
    valid_referers none blocked 192.168.9.21; # 只允许本机IP外链引用
    if ($invalid_referer){
      return 403;
    }
  }

  # proxy the PHP scripts to Apache listening on 127.0.0.1:80
  #
  #location ~ \.php$ {
  #    proxy_pass   http://127.0.0.1;
  #}

  # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
  #
  #location ~ \.php$ {
  #    root           html;
  #    fastcgi_pass   127.0.0.1:9000;
  #    fastcgi_index  index.php;
  #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
  #    include        fastcgi_params;
  #}

  # deny access to .htaccess files, if Apache's document root
  # concurs with nginx's one
  #
  #location ~ /\.ht {
  #    deny  all;
  #}
}
```

2. file.conf

```conf
server {
  listen       81;
  listen  [::]:81;
  server_name  localhost;

  #access_log  /var/log/nginx/host.access.log  main;

  # 安装工具 apt install -y apache2-utils || yum install httpd-tools
  # 生成密码 htpasswd -c -d /etc/nginx/conf.d/pass.db <username>
  location / {
    root                  /usr/share/nginx/files;     # 文件路径
    
    client_max_body_size  2G;                         # 文件大小 0不限制
    charset               utf-8;                      # 中文乱码

    auth_basic            "Auth Required: ";          # 密码认证
    auth_basic_user_file  /etc/nginx/conf.d/pass.db;  # 密码位置 light:blILFEcleKWhE

    autoindex             on;                         # 显示目录
    autoindex_localtime   on;                         # 显示文件时间
    autoindex_exact_size  off;                        # 显示文件大小，off显示可读值 KB MB GB
  }

  error_page 404 /404.html;
    location = /40x.html {
  }

  error_page 500 502 503 504 /50x.html;
    location = /50x.html {
  }

}
```

3. webdav.conf

```conf
server {
  listen      82;
  listen  [::]:82;
  server_name localhost;

  location / {
    root                  /usr/share/nginx/files;     # 需替换为你自己的共享目录

    auth_basic            "Auth Required: ";          # 密码认证
    auth_basic_user_file  /etc/nginx/conf.d/pass.db;  # 密码位置 light:blILFEcleKWhE

    charset               utf-8;                      # 中文乱码
    client_max_body_size  0;                          # 文件大小 0不限制

    autoindex             on;                         # 显示目录
    autoindex_localtime   on;                         # 显示文件时间
    autoindex_exact_size  off;                        # 显示文件大小，off显示可读值 KB MB GB

    # 为各种方法的URI后加上斜杠，解决各平台webdav客户端的兼容性问
    set $dest $http_destination;
    if (-d $request_filename) {
      rewrite ^(.*[^/])$ $1/;
      set $dest $dest/;
    }

    if ($request_method ~ MKCOL) {
      rewrite ^(.*[^/])$ $1/ break;
    }

    # 启用 WebDav 的一些关键字
    dav_methods           PUT DELETE MKCOL COPY MOVE;
    # 启用 WebDav 的一些扩展关键字用于支持应用访问
    # dav_ext_methods       PROPFIND OPTIONS LOCK UNLOCK;

    # 创建文件夹时自动创建路径上不存在的文件夹
    create_full_put_path  on;
    # 设置 WebDav 目录下新增文件的默认权限
    dav_access            user:rw group:rw all:r;
    
  }

}
```

4. servcie.conf

```conf
upstream business_oauth {  
  server 192.168.0.21:31001;   
}

upstream business_demo {  
  server 192.168.0.21:32001;   
}

server {
  listen       90;
  listen  [::]:90;
  server_name  localhost;

  #access_log  /var/log/nginx/host.access.log  main;

  location / {
      root   /usr/share/nginx/html/diginn;
      index  index.html index.htm;
      if (!-e $request_filename) {
        rewrite ^(.*)$ /index.html?s=$1 last;
        break;
      }
  }

  location ^~ /oauth/ {
    proxy_pass              http://business_oauth;
    proxy_http_version      1.1;
    proxy_read_timeout      30s;
    proxy_set_header        Host $http_host;
    proxy_set_header        X-Real-IP $remote_addr;
    proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header        X-NginX-Proxy true;
    proxy_set_header        Upgrade $http_upgrade;
    proxy_set_header        Connection "Upgrade";
  }
  
  # 使用捕获组 $1 来传递剩余路径 /demo/123 -> /123
  location ~ ^/demo(/.*)$ {
    proxy_pass http://business_demo$1;
  }

  #error_page  404              /404.html;

  # redirect server error pages to the static page /50x.html
  #
  error_page   500 502 503 504  /50x.html;
  location = /50x.html {
      root   /usr/share/nginx/html;
  }

  # 图片防盗链
  location ~* \.(gif|jpg|jpeg|png|bmp|swf)$ {
    valid_referers none blocked 192.168.9.21; # 只允许本机IP外链引用
    if ($invalid_referer){
      return 403;
    }
  }

  # proxy the PHP scripts to Apache listening on 127.0.0.1:80
  #
  #location ~ \.php$ {
  #    proxy_pass   http://127.0.0.1;
  #}

  # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
  #
  #location ~ \.php$ {
  #    root           html;
  #    fastcgi_pass   127.0.0.1:9000;
  #    fastcgi_index  index.php;
  #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
  #    include        fastcgi_params;
  #}

  # deny access to .htaccess files, if Apache's document root
  # concurs with nginx's one
  #
  #location ~ /\.ht {
  #    deny  all;
  #}
}
```
