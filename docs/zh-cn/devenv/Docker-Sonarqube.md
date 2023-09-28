- [SonarQube Offical](https://www.sonarsource.com/products/sonarqube/)
- [SonarQube Docker](https://hub.docker.com/_/sonarqube)
- [Sonar-Scanner-Cli](https://hub.docker.com/r/sonarsource/sonar-scanner-cli)
- [SonarQube Offical Document](https://docs.sonarsource.com/sonarqube/latest/requirements/prerequisites-and-overview/)
- [Sonar-Scanner-Cli Offical Document](https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/)

- https://blog.csdn.net/weixin_45056333/article/details/132319321

## 1. Docker安装
```shell
# 创建文件目录
mkdir -p //d/docker/sonarqube/data
mkdir -p //d/docker/sonarqube/conf
mkdir -p //d/docker/sonarqube/log
mkdir -p //d/docker/sonarqube/extensions/downloads
mkdir -p //d/docker/sonarqube/extensions/plugins

# 创建数据卷
docker vaolume create --name sonarqube_data
docker vaolume create --name sonarqube_conf
docker vaolume create --name sonarqube_log
docker vaolume create --name sonarqube_extensions

# 获取默认配置文件
docker run -d --name sonarqube_temp sonarqube:10.2-community \
&& docker cp sonarqube_temp:/opt/sonarqube/conf/sonar.properties D:/docker/sonarqube/conf/sonar.properties.default \
&& docker stop sonarqube_temp && docker rm sonarqube_temp

# 运行容器
docker run -d \
  --publish 9000:9000 \
  --publish 9001:9001 \
  --publish 9092:9092 \
  --volume //d/docker/sonarqube/data:/opt/sonarqube/data \
  --volume //d/docker/sonarqube/conf:/opt/sonarqube/conf \
  --volume //d/docker/sonarqube/log:/opt/sonarqube/logs \
  --volume //d/docker/sonarqube/extensions:/opt/sonarqube/extensions \
  --env SONAR_JDBC_URL=jdbc:postgresql://postgres:5432/sonarqube?currentSchema=public \
  --env SONAR_JDBC_USERNAME=postgres \
  --env SONAR_JDBC_PASSWORD=postgres \
  --net dev \
  --restart=on-failure:3 \
  --name sonarqube \
  sonarqube:9.9-community

docker exec -it -u root sonarqube /bin/bash

vim /opt/sonarqube/conf/sonar.properties
```

- [Dashboard](http://[localhost:18083](http://localhost:9000))
  - admin/admin (默认)
  - admin/sonarqube

## 2. 项目扫描
### 1. IDEA Plugin SonarAnalyzer
1. SonarQube创建项目，并生成Token `http://localhost:9000/account/security`
2. 安装SonarAnalyzer插件
3. `Settings` - `Tools` - `SonarAnalyzer` 配置Sonarqube server地址以及Token
4. `Settings` - `Tools` - `SonarAnalyzer` - `Project Settings`添加Sonarqube上创建的项目名称 `sonar.projectKey` 
5. 选择插件`SonarAnalyzer` - `分析Project下的文件`
6. 本地分析完毕后，可以在此页面看到服务端的分析任务 `http://localhost:9000/dashboard?id=project_name`

### 2. IDEA Pluin SonarLint
1. SonarQube创建项目，并生成Token `http://localhost:9000/account/security`
2. 安装SonarLint插件
3. `Settings` - `Tools` - `SonarLint` 配置Sonarqube server地址以及Token
4. `Settings` - `Tools` - `SonarLint` - `Project Settings`选择server及Sonarqube上创建的projectKey
5. 配置完成点击`Update Local Storage`更新服务器上的配置信息
6. 右键点击项目根目录，选择`SonarLint` - `Analyze With SonarLint`

### 3. Sonar-Scanner-Cli
```shell
# 简单命令
docker run -it --rm -v /path/to/your/code:/usr/src sonarsource/sonar-scanner-cli

# 完整命令
docker run -it --rm \
    --volume /path/to/your/code:/usr/src \
    -Dsonar.projectKey=your_project_key \
    -Dsonar.sources=. \
    -Dsonar.host.url=http://your_sonarqube_server:9000 \
    -Dsonar.login=your_sonarqube_token \
    --net dev \
    --name sonar-scanner \
    sonarsource/sonar-scanner-cli:5
```

也可以在项目根目录下建`sonar-project.properties`配置文件指定相关参数
```properties
sonar.projectKey=项目key,在SonarQube新建页面时获取 
sonar.projectName=项目名称 
sonar.projectVersion=项目版本 
sonar.sources=源码地址，例如：src 
sonar.java.binaries=二进制代a码地址，例如：./target/classes 
sonar.branch.name=代码分支，例如：master 
sonar.sourceEncoding=源码编码格式，UTF-8 
sonar.host.url=SonarQubet地址，htp:/127.0.0.1:9000 
sonar.login=SonarQube登陆账号，也可以使用sonar.token替换，token在SonarQube创建项目时获取 
sonar.password=SonarQube登陆密码，也可以使用sonar.token替换，token在SonarQubet创建项目时获取 
sonar.language=指定扫描的语言，选填，例如：Java
```

### 4. SonarScanner-For-Maven
- [sonarscanner-for-maven](https://docs.sonarsource.com/sonarqube/9.9/analyzing-source-code/scanners/sonarscanner-for-maven/)

1. maven/conf/settings.xml
```xml
<settings>
    <pluginGroups>
        <pluginGroup>org.sonarsource.scanner.maven</pluginGroup>
    </pluginGroups>
    <profiles>
        <profile>
            <id>sonar</id>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <properties>
                <!-- Optional URL to server. Default value is http://localhost:9000 -->
                <sonar.host.url>
                  http://localhost:9000
                </sonar.host.url>
            </properties>
        </profile>
     </profiles>
</settings>
```

2. pom.xml
```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.sonarsource.scanner.maven</groupId>
      <artifactId>sonar-maven-plugin</artifactId>
    </plugin>
  </plugins>
  <pluginManagement>
    <plugins>
      <plugin>
        <groupId>org.sonarsource.scanner.maven</groupId>
        <artifactId>sonar-maven-plugin</artifactId>
        <version>3.7.0.1746</version>
      </plugin>
    </plugins>
  </pluginManagement>
</build>
```

3. [scripts](http://localhost:9000/dashboard?id=project_name&selectedTutorial=local)
```shell
mvn clean verify sonar:sonar \
  -Dsonar.projectKey=project_name \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=sqp_954d00a0bbe6390cc16300191b1fe82f9e899453
```

## 3. 启动报错
1. 内核参数设置过低
```shell
node validation exception
[1] bootstrap checks failed. You must address the points described in the following [1] lines before starting Elasticsearch.
bootstrap check failure [1] of [1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
ERROR: Elasticsearch did not exit normally - check the logs at /opt/sonarqube/logs/sonarqube.log
```

Linux直接编辑，Windows下编辑WLS(WLS2)配置文件
```shell
sudo vim /etc/sysctl.conf

# 增加以下配置
vm.max_map_count=262144
fs.file-max=65535

# 应用更新
sudo sysctl -p
```
