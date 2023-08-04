# Dev Environment

# 0. 软件列表
1. IDEA             zhile.io
2. DBeaver
3. MobaxTerm
4. VS Code
5. Maven            mvnrepository.com
6. JDK
7. Git
8. U Tools
9. Docker
10. Chrome
11. 企业微信\钉钉
12. FoxMail

# 1. IDEA
[IDEA](devenv/IDEA.md ':include')

# 2. Git
```shell

git config --global user.name "lorchr"
git config --global user.email "lorchr@163.com"

ssh-keygen -t rsa -C "lorchr@163.com"
cat /c/Users/lorchr/.ssh/id_rsa.pub

git init
git add .
git commit -m "Init project"
git remote add origin https://cloud.com/lorchr/spring-cloud-samples.git
git branch --set-upstream-to=origin/master master
git push -u origin master
```

常用操作
```shell
-- 克隆仓库
git clone http://github.com/lorchr/spring-cloud-samples.git

-- 查看远程仓库地址
git remote -v

-- 移除远程仓库
git remote rm origin

-- 添加新的远程仓库地址
git remote add           cloud https://gitee.com/lorchr/spring-cloud-samples.git
git remote set-url --add origin http://github.com/lorchr/spring-cloud-samples.git
git push -u cloud master

# 提交
git push 仓库别名 分支 --allow-unrelated-histories
# 检出
git pull 仓库别名 分支 --allow-unrelated-histories
```

# 3. WSL Docker
[WSL Docker](devenv/WSL-Docker.md ':include')

# 4. Mysql
[Mysql](devenv/Docker-Mysql.md ':include')

# 5. Pgsql
[Pgsql](devenv/Docker-Pgsql.md ':include')

# 6. Redis
[Redis](devenv/Docker-Redis.md ':include')

# 7. InfluxDB
[InfluxDB](devenv/Docker-InfluxDB.md ':include')

# 8. EMQX
[EMQX](devenv/Docker-EMQX.md ':include')

# 9. Elasticsearch
[Elasticsearch](devenv/Docker-Elasticsearch.md ':include')

# 10. Node Red
[Node Red](devenv/Docker-Node-Red.md ':include')

# 11. Windows下Docker端口被占用的问题
[Docker port bind error in Windows](devenv/Docker-Port-Bind-Error-In-Windows.md ':include')
