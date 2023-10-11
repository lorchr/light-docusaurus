# Dev Environment

# 0. 软件列表
1. [InteliJ IDEA](https://www.jetbrains.com/zh-cn/idea/download/) [Zhile](https://zhile.io)
2. [DBeaver](https://dbeaver.io/)
3. [MobaxTerm](https://mobaxterm.mobatek.net/)
4. [VS Code](https://code.visualstudio.com/)
5. [Maven](https://maven.apache.org/index.html) [Repository](https://mvnrepository.com)
6. [JDK](https://openjdk.org/) [JDK8](https://jdk.java.net/java-se-ri/8-MR5) [JDK21](https://jdk.java.net/21/)
7. [Git](https://git-scm.com/) [Download](https://git-scm.com/download/win)
8. [U Tools](https://www.u.tools/)
9. [Docker](https://www.docker.com/) [DockerHub](https://hub.docker.com/)
10. [Chrome](https://www.google.cn/chrome/index.html)
11. [企业微信](https://work.weixin.qq.com/) [钉钉](https://www.dingtalk.com/)
12. [FoxMail](https://www.foxmail.com/)
13. [我们所向往的](wmsxwd-c.men)

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

# 10. Nodered
[Node Red](devenv/Docker-Nodered.md ':include')

# 11. Windows下Docker端口被占用的问题
[Docker port bind error in Windows](devenv/Docker-Port-Bind-Error-In-Windows.md ':include')
