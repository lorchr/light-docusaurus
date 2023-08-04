## 1. 安装 Gitea

- https://dl.gitea.io/gitea
- https://www.kernel.org/pub/software/scm/git/git-2.37.2.tar.gz

### 1. 安装

```shell
# 安装依赖
yum install -y \
  git \
  gcc-c++ \
  zlib-devel \
  perl-ExtUtils-MakeMaker \
  sqlite3

# 下载Git
wget https://www.kernel.org/pub/software/scm/git/git-2.37.2.tar.gz -O /usr/local/git/

# 创建安装目录
mkdir /usr/local/gitea

# 创建数据目录并新建数据库
mkdir /usr/local/gitea/data/

# 创建Sqlite数据库存储数据
sqlite3 /usr/local/gitea/data/gitea.db

# 下载Gitea
wget https://dl.gitea.io/gitea/1.8.3/gitea-1.8.3-linux-amd64 -O /usr/local/gitea/gitea

# 修改文件的执行权限
chmod +x /usr/local/gitea/gitea
```

### 2. 注册为服务

新建一个`gitea.service`文件：

> vim /usr/lib/systemd/system/gitea.service

```shell
[Unit]
Description=gitea
After=network.target

[Service]
Type=forking
# Gitea的执行文件
ExecStart=/uar/local/gitea/gitea
User=root
Restart=on-abort

[Install]
WantedBy=multi-user.target
```

### 3. 初始化Gitea

```shell
# 重载daemon，让新的服务文件生效：
systemctl daemon-reload

# 启动gitea服务并设置开机自启
systemctl start gitea && systemctl enable gitea

# 修改conf文件来修改gitea配置
vim /usr/local/gitea/custom/conf/app.ini

# 备份
mv /usr/local/gitea/custom/ /usr/local/gitea/custom.bak
mv /usr/local/gitea/data/ /usr/local/gitea/data.bak
mv /usr/local/gitea/gitea-repositories/ /usr/local/gitea/gitea-repositories.bak

# 恢复
mv /usr/local/gitea/custom.bak/ /usr/local/gitea/custom
mv /usr/local/gitea/data.bak/ /usr/local/gitea/data
mv /usr/local/gitea/gitea-repositories.bak/ /usr/local/gitea/gitea-repositories
```

### 4. 域名访问

如果想用域名访问，可以用Nginx反代。反代配置为：

```conf
# 在配置文件里添加
location /gitea/ {
  proxy_pass http://localhost:3000/
  proxy_redirect off;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

访问Web页面: http://192.168.137.101:3000 
- root/admin

配置数据库等，并**设置管理员账号密码**

> git remote set-url --add origin http://192.168.137.101:3000/root/pi-diginn.git
