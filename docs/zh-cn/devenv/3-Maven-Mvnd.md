- [Maven Github](https://github.com/apache/maven)
- [Maven Download](https://maven.apache.org/download.cgi)
- [Mvnd Github](https://github.com/apache/maven-mvnd)
- [Mvnd Download](https://downloads.apache.org/maven/mvnd/)

## 1. Maven

### 1. 设置环境变量
    
```bat
MVN_HOME=D:\\Develop\\apache-maven
PATH=%MVN_HOME%\bin
```

### 2. 设置Maven配置文件 `conf\settings.xml`

```xml
<localRepository>D:\Develop\repository</localRepository>

<servers>
    <!--
    <server>
        <id>deploymentRepo</id>
        <username>repouser</username>
        <password>repopwd</password>
    </server>
    <server>
        <id>siteServer</id>
        <privateKey>/path/to/private/key</privateKey>
        <passphrase>optional; leave empty if not used.</passphrase>
    </server>
    -->
</servers>
<mirrors>
    <mirror>
        <id>Aliyun-Central</id>
        <mirrorOf>central</mirrorOf>
        <name>Aliyun public</name>
        <url>https://maven.aliyun.com/repository/public</url>
    </mirror> 
</mirrors>
<profiles>
    <profile>
        <id>jdk-17</id>
        <properties>
            <maven.compiler.source>17</maven.compiler.source>
            <maven.compiler.target>17</maven.compiler.target>
            <maven.compiler.compilerVersion>17</maven.compiler.compilerVersion>
        </properties>
    </profile>
    <profile>    
    <id>java-8</id>    
    <activation>    
        <activeByDefault>true</activeByDefault>    
        <jdk>1.8</jdk>    
    </activation>
    <properties>    
        <maven.compiler.source>1.8</maven.compiler.source>    
        <maven.compiler.target>1.8</maven.compiler.target>    
        <maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>    
    </properties>    
    </profile>
    <profile>
    <id>aliyun</id>
    <repositories>
        <repository>
        <id>aliyun.public</id>
        <url>https://maven.aliyun.com/repository/public</url>
        </repository>
        <repository>
            <id>jitpack.io</id>
            <url>https://jitpack.io</url>
        </repository>
    </repositories>
    </profile>
</profiles>

<activeProfiles>
    <activeProfile>aliyun</activeProfile>
</activeProfiles>
```

### 3. 常用命令

```shell
# 查看版本
mvn -v

# 打包
mvn clean -U -Dmaven.test.skip=true package

# 打包安装到本地
mvn clean package -T 1C -Dmaven.test.skip=true  -Dmaven.compile.fork=true

# 部署
mvn deploy

# 部署单个jar
mvn deploy:deploy-file -DgroupId=<group-id> \
-DartifactId=<artifact-id> \
-Dversion=<version> \
-Dpackaging=<type-of-packaging> \
-Dfile=<path-to-file> \
-DrepositoryId=<id-to-map-on-server-section-of-settings.xml> \
-Durl=<url-of-the-repository-to-deploy>
```

### 4. 项目版本控制

```shell
# 设置新版本号
mvn versions:set -DnewVersion="1.1.0-SNAPSHOT"

# 回退到旧版本号
mvn versions:revert

# 确认提交新版本号
mvn versions:commit
```

| 参数                   | 默认值                | 说明                                              |
| ---------------------- | --------------------- | ------------------------------------------------- |
| allowSnapshots         | false                 | 是否更新-snapshot快照版                           |
| artifactld             | ${project.artifactld} | 指定artifactld                                    |
| generateBackupPoms     | true                  | 是否生成备份文件用于回退版本号                    |
| groupld                | ${project.groupld}    | 指定groupld                                       |
| newVersion             |                       | 设置的新版本号                                    |
| nextSnapshot           | false                 | 更新版本号为下一个快照版本号                      |
| oldVersion             | ${project.version}    | 指定需要更新的版本号可以使用缺省"*                |
| processAllModules      | false                 | 是否更新目录下所有模块无论是否声明父子节点        |
| processDependencies    | true                  | 是否更新依赖其的版本号                            |
| processParent          | true                  | 是否更新父节点的版本号                            |
| processPlugins         | true                  | 是否更新插件中的版本号                            |
| processProject         | true                  | 是否更新模块自身的版本号                          |
| removeSnapshot         | false                 | 移除snapshot快照版本，使之为release稳定版         |
| updateMatchingVersions | true                  | 是否更新在子模块中显式指定的匹配版本(如/项目版本) |

## 2. Mvnd
### 1. 设置环境变量
    
```bat
MVND_HOME=D:\\Develop\\apache-mvnd
PATH=%MVND_HOME%\bin
```

### 2. 设置Maven配置文件地址 `conf\mvnd.properties`

```properties
maven.settings=D:\\Develop\\apache-maven\\conf\\settings.xml
```

### 3. 常用命令

```shell
echo %JAVA_HOME%
java -version
set PATH "D:\Develop\Java\jdk-17\bin";%PATH%
set JAVA_HOME "D:\Develop\Java\jdk-17"

# 查看版本
mvnd -v

# 打包
mvnd -Dmaven.compiler.release=8 compile             # 指定jdk版本
mvnd clean -U -Dmaven.test.skip=true package        # 并行
mvnd clean -U -Dmaven.test.skip=true package -T1    # 串行

# 打包安装到本地
mvnd clean install -Dquickly
```

## 3. Windows切换JDK版本

- https://stackoverflow.com/questions/26993101/switching-between-different-jdk-versions-in-windows

```bat jenv.bat
@echo off
setlocal

if "%~1" == "17" (
    REM 切换到选择的 JDK 版本
    set "JAVA_HOME=D:\Develop\Java\jdk-17"
) else if "%~1" == "11" (
    set "JAVA_HOME=D:\Develop\Java\jdk-11"
) else if "%~1" == "8" (
    set "JAVA_HOME=D:\Develop\Java\jdk1.8"
) else (
    @echo on
    echo "================================"
    echo "Error No JDK Path For %~1"
    echo "================================"
    exit /b 1
)

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    REM 管理员权限：更新系统环境变量 PATH 来切换 JDK 版本 setx /?
    setx Path "%JAVA_HOME%\bin;%Path%" /M
) else (
    REM 非管理员权限：临时切换
    set "Path=%JAVA_HOME%\bin;%Path%"
)

@echo on
echo JAVA_HOME %JAVA_HOME%
java -version

endlocal
```

```ps1 jenv.ps1
If($args[0] -eq "17")
{
    $env:JAVA_HOME = 'D:\Develop\Java\jdk-17'
} ElseIf($args[0] -eq "11")
{
    $env:JAVA_HOME = 'D:\Develop\Java\jdk-11'
} ElseIf($args[0] -eq "8")
{
    $env:JAVA_HOME = 'D:\Develop\Java\jdk1.8'
} Else 
{
   echo "================================"
   echo "Error No JDK Path For $args[0]"
   echo "================================"
   exit /b 1
}
$env:Path = $env:JAVA_HOME+'\bin;'+$env:Path

echo "JAVA_HOME $JAVA_HOME"
java -version
```
