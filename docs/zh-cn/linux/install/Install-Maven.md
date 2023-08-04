## 1. 安装 Maven

- https://maven.apache.org/download.cgi

### 1. 安装

```shell
# 下载安装包
wget https://dlcdn.apache.org/maven/maven-3/3.6.1/binaries/apache-maven-3.6.1-bin.tar.gz -O /usr/local/maven/apache-maven-3.6.1-bin.tar.gz

# 创建目录
mkdir /usr/local/maven

# 解压安装文件
tar -zxvf apache-maven-3.6.1-bin.tar.gz -C /usr/local/maven/

# 设置环境变量
cat >> /etc/profile << EOF
# Maven Enviroment
MVN_HOME=/usr/local/maven/apache-maven-3.6.1/
PATH=$MVN_HOME/bin:$PATH
export MVN_HOME PATH
EOF

# 刷新配置
source /etc/profile

# 查看Maven版本
mvn -v

# 备份配置文件
mv settings.xml settings.xml.bak

# 创建新的配置文件
vim settings.xml
```

### 2. 配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" 
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">

  <localRepository>/usr/local/maven/repository</localRepository>

  <pluginGroups>
  </pluginGroups>

  <proxies>
  </proxies>

  <servers>
    <server>
      <id>maven-releases</id>
      <username>admin</username>
      <password>admin123</password>
    </server>
    <server>
      <id>maven-snapshots</id>
      <username>admin</username>
      <password>admin123</password>
    </server>
  </servers>

  <mirrors>
	  <mirror>
      <id>maven</id>
      <mirrorOf>*</mirrorOf>
      <name>maven</name>
      <url>http://192.168.137.102:18081/repository/maven-public/</url>
    </mirror>
  </mirrors>

  <profiles>
    <profile>
      <id>maven</id>
      <repositories>
        <repository>
          <id>maven</id>
          <name>maven</name>
          <url>http://192.168.137.102:18081/repository/maven-public/</url>
          <releases>
            <enabled>true</enabled>
          </releases>
          <snapshots>
            <enabled>true</enabled>
          </snapshots>
        </repository>
      </repositories>

      <pluginRepositories>
        <pluginRepository>
          <id>maven</id>
          <name>maven</name>
          <url>http://192.168.137.102:18081/repository/maven-public/</url>
          <releases>
            <enabled>true</enabled>
          </releases>
          <snapshots>
            <enabled>true</enabled>
          </snapshots>
        </pluginRepository>
      </pluginRepositories>
    </profile>
  </profiles>

  <activeProfiles>
    <activeProfile>maven</activeProfile>
  </activeProfiles>
</settings>
```
