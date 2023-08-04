| 序号 | 服务     | IP              | Port              | URL                                     |
| ---- | -------- | --------------- | ----------------- | --------------------------------------- |
| 1    | Gitea    | 192.168.137.101 | 3000              | http://192.168.137.101:3000/            |
| 2    | Mysql    | 192.168.137.101 | 3306              | jdbc:mysql://192.168.137.101:3306/gitea |
| 3    | Jenkins  | 192.168.137.101 | 18080             | http://192.168.137.101:18080/           |
| 4    | Registry | 192.168.137.102 | 5000              | http://192.168.137.102:5000/            |
| 5    | Harbor   | 192.168.137.102 | 5080              | http://192.168.137.102:5080/            |
| 6    | Nexus    | 192.168.137.102 | 18081/18082/18083 | http://192.168.137.102:18081/           |


## 1. 安装 Jenkins

- https://jenkins.io/zh/doc/

### 1. 安装

```shell
# 查看已有的jenkins
rpm -qa | grep jenkins

# rpm卸载
rpm -e jenkins 

# 检查是否卸载成功
rpm -ql jenkins

# 彻底删除残留文件
systemctl stop jenkins
sudo yum -y remove jenkins
sudo rm -rf /var/lib/jenkins
sudo rm -rf /var/cache/jenkins
sudo rm -rf /var/log/jenkins

# 安装Jenkins
rpm -ivh jenkins-2.235.5-1.1.noarch.rpm

# 修改Jenkins配置
vim /etc/sysconfig/jenkins

# 修改内容：
JENKINS_USER="root"
JENKINS_PORT="18080"
JENKINS_JAVA_OPTIONS="-Djava.awt.headless=true -Djavax.net.ssl.trustStore=/etc/pki/ca-trust/extracted/java/cacerts"

# 设置本机jdk路径
which java # /usr/local/java/jdk1.8.0/bin/java
vim /etc/init.d/jenkins
candidates=""内添加java路径

# 设置权限
chown -R root:root /var/lib/jenkins
chown -R root:root /var/log/jenkins
chown -R root:root /var/cache/jenkins

# 重启jenkins
systemctl daemon-reload && systemctl start jenkins
```
登录web页面：http://192.168.137.101:18080
- admin/admin

### 2. 初始化配置 Jenkins

这里登录需要使用到一个管理员密码，我们可以在服务器上使用如下命令获得

> cat /var/lib/jenkins/secrets/initialAdminPassword

1. 更新Jenkins到最新版本
2. 安装插件

| 序号 | 插件                               | 功能     |
| ---- | ---------------------------------- | -------- |
| 1    | Locale                             | 中文     |
| 2    | Localization: Chinese (Simplified) | 中文     |
| 3    | Localization Support               | 中文     |
| 4    | Deploy to container Plugin         | 打包镜像 |
| 5    | Publish over SSH                   | 推送镜像 |
| 6    | Gitea/Gitlab/Gitee/Github          | 代码仓库 |
| 6    | Git                                | 拉取代码 |
| 7    | Git client                         | 拉取代码 |
| 8    | Maven Integration                  | 后端打包 |
| 8    | NodeJS                             | 前端打包 |

**暂时不要替换插件源，进入jenkins直接升级版本，升级到最高版本后，所有插件即可安装**

如果安装很慢，可以先设置国内的插件源

```shell
systemctl stop jenkins
vim /var/lib/jenkins/hudson.model.UpdateCenter.xml

<?xml version='1.1' encoding='UTF-8'?>
<sites>
  <site>
    <id>default</id>
    <url>http://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json</url>
  </site>
</sites>

# 或在页面中Manage Jenkins–>Manage Plugins点击Advanced后拉到最下面，将红色方框内的链接修为
http://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json

# 重启jenkis
systemctl daemon-reload && systemctl start jenkins

# 如果启动报错缺少policycoreutils-python，可以使用下面命令来解决
yum install -y curl policycoreutils-python openssh-server
```

### 3. 安装问题

1. 更新版本

> https://mirrors.tuna.tsinghua.edu.cn/jenkins/war-stable/2.332.4/

下载最新war包。放入/usr/lib/jenkins/替换旧版war

2. 安装jenkins后下载插件报错日志如下:

```shell
sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
        at sun.security.provider.certpath.SunCertPathBuilder.build(SunCertPathBuilder.java:145)
        at sun.security.provider.certpath.SunCertPathBuilder.engineBuild(SunCertPathBuilder.java:131)
        at java.security.cert.CertPathBuilder.build(CertPathBuilder.java:280)
        at sun.security.validator.PKIXValidator.doBuild(PKIXValidator.java:382)
Caused: sun.security.validator.ValidatorException: PKIX path building failed
```

原因:

默认证书有问题

解决:
1. 更新站点

> http://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json

2. 进入jenkins站点更新目录修改默认json配置

```shell
cd /var/lib/jenkins/updates/

# 全局替换default.json里面的下载插件地址:

sed -i 's/http:\/\/updates.jenkins-ci.org\/download/http:\/\/mirrors.tuna.tsinghua.edu.cn\/jenkins/g' default.json
sed -i 's/http:\/\/www.google.com/http:\/\/www.baidu.com/g' default.json
```

3. 查找证书路径:

> find / -type f -name cacerts

找到了上面的地址: /etc/pki/ca-trust/extracted/java/cacerts

4. 修改jenkins配置文件

> vi /etc/sysconfig/jenkins
> JENKINS_JAVA_OPTIONS="-Djava.awt.headless=true -Djavax.net.ssl.trustStore=/etc/pki/ca-trust/extracted/java/cacerts"

5. 重启jenkins生效

> systemctl daemon-reload && systemctl restart jenkins

### 4. 创建构建任务

#### 1. 后端打包任务
1. 创建任务`New Item`，输入任务名称，选择`构建一个Maven项目`，点击确认
2. 描述中输入任务的描述信息: "Spring Boot打包测试"
3. 点击顶部`源码管理`选择 `Git`。
4. `Repository URL`中输入仓库地址 `http://113.57.121.225:3001/wwb/pi-diginn.git`
5. 点击`Credentials`创建凭证（用户名密码，Token，SSH-Key等）
6. `Branches to build`中指定打包的分支
7. `源码库浏览器`选择对应的值`Gitea`，再次输入`Repository URL`
8. `构建环境`选中`Add timestamps to the Console Output`，输出构建日志
9. `Pre-Steps`添加`Invoke top-level Maven targets`打包父工程。POM `pd-parent/pom.xml` Goals `clean install -Dmaven.test.skip=true`
10. `Build`中指定当前构建的项目。POM `pd-service-admin/pom.xml` Goals `clean install -Dmaven.test.skip=true`
11. `Post Steps`添加`Execute Shell`执行后续Shell脚本。选择 `Run only if build succeeds`仅当build成功执行

#### 2. 后端打包脚本

```shell
# 定义变量
API_NAME="pd-service-admin"
API_VERSION="1.0.0"
API_PORT="31114"
EXTERNAL_API_PORT="31114"
IMAGE_NAME="192.168.137.101:5000/$API_NAME:$API_VERSION"
CONTAINER_NAME=$API_NAME:$API_VERSION

# 进入target目录并复制Dockerfile文件
cd $WORKSPACE/$API_NAME/config
cp Dockerfile ../target
cd $WORKSPACE/$API_NAME/target

echo '================构建Docker镜像=============='
docker build -t $IMAGE_NAME .

echo '================推送Docker镜像=============='
docker login --username=admin --password=admin 192.168.137.101:5000
docker push $IMAGE_NAME
docker logout

echo '================删除Docker容器=============='
cid=$(docker ps -a | grep $API_NAME |awk '{print $1}')
if [ x"$cid" != x ]
    then
    docker rm -f $cid
fi

echo '================启动Docker容器=============='
docker run --restart=always --name=$API_NAME -d -p $API_PORT:$EXTERNAL_API_PORT $IMAGE_NAME

echo '================删除Dockerfile=============='
rm -f Dockerfile
```

使用私服仓库的脚本
```shell
# 定义变量
API_NAME="pd-service-admin"
API_VERSION="4.0.0"
API_PORT="31114"
EXTERNAL_API_PORT="31114"
IMAGE_NAME="192.168.137.102:5080/pi-diginn/$API_NAME:$API_VERSION"
CONTAINER_NAME=$API_NAME:$API_VERSION

# 进入target目录并复制Dockerfile文件
cd $WORKSPACE/$API_NAME/config
cp Dockerfile ../target
cd $WORKSPACE/$API_NAME/target

echo '================构建Docker镜像=============='
docker build -t $IMAGE_NAME .

echo '================推送Docker镜像=============='
docker login 192.168.137.102:5080
docker push $IMAGE_NAME
docker logout

echo '================删除Docker容器=============='
cid=$(docker ps -a | grep $API_NAME |awk '{print $1}')
if [ x"$cid" != x ]
    then
    docker rm -f $cid
fi

echo '================启动Docker容器=============='
docker run --restart=always --name=$API_NAME -d -p $API_PORT:$EXTERNAL_API_PORT $IMAGE_NAME

echo '================删除Dockerfile=============='
rm -f Dockerfile
```

#### 3. 前端打包任务
1. 创建任务`New Item`，输入任务名称，选择`Freestyle project`，点击确认
2. 描述中输入任务的描述信息: "Web前端打包测试"
3. 点击顶部`源码管理`选择 `Git`。
4. `Repository URL`中输入仓库地址 `http://113.57.121.225:3001/wwb/pd-diginn-web.git`
5. 点击`Credentials`创建凭证（用户名密码，Token，SSH-Key等）
6. `Branches to build`中指定打包的分支
7. `源码库浏览器`选择对应的值`Gitea`，再次输入`Repository URL`
8. `构建环境`选中`Add timestamps to the Console Output`，输出构建日志
9. `构建环境`选择`Provide Node & npm bin/ folder to PATH`指定使用的Node npm的位置
10. `Build`添加`Execute Shell`执行后续Shell脚本。选择 `Run only if build succeeds`仅当build成功执行

#### 4. 前端打包脚本

```shell
# 查看Node和NPM版本
node -v
npm -v

# 删除之前打包残留
rm -rf ./dist/

# 安装依赖
npm install
npm install 'webpack@^4.0.0' -S

# 执行打包
npm run build

# 删除Nginx目录下的静态文件
rm -rf /usr/local/nginx/html/plum
# 将新的静态文件复制到Nginx目录下
cp -r dist/ /usr/local/nginx/html/plum

# 重启Nginx
systemctl restart nginx
```

使用私服的脚本

```shell
# 查看Node和NPM版本
node -v
npm -v

# 删除之前打包残留
rm -rf ./dist/

# 安装依赖
npm install --registry=http://192.168.137.102:18081/repository/npm-public/
npm install 'webpack@^4.0.0' -S --registry=http://192.168.137.102:18081/repository/npm-public/

# 执行打包
npm run build

# 删除Nginx目录下的静态文件
rm -rf /usr/local/nginx/html/plum

# 将新的静态文件复制到Nginx目录下
cp -r dist/ /usr/local/nginx/html/plum

# 重启Nginx
systemctl restart nginx
```
