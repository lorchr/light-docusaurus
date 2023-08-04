- [Maven Github](https://github.com/apache/maven)
- [Maven Download](https://maven.apache.org/download.cgi)
- [Mvnd Github](https://github.com/apache/maven-mvnd)
- [Mvnd Download](https://downloads.apache.org/maven/mvnd/)

## 1. Maven

1. 设置环境变量
    
    ```bat
    MVN_HOME=D:\\Develop\\apache-maven
    PATH=%MVN_HOME%\bin
    ```

2. 设置Maven配置文件 `conf\settings.xml`

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

3. 常用命令

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

## 2. Mvnd
1. 设置环境变量
    
    ```bat
    MVND_HOME=D:\\Develop\\apache-mvnd
    PATH=%MVND_HOME%\bin
    ```

2. 设置Maven配置文件地址 `conf\mvnd.properties`

    ```properties
    maven.settings=D:\\Develop\\apache-maven\\conf\\settings.xml
    ```

3. 常用命令
    
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

```bat sjv.bat
@echo off
if "%~1" == "17" (
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
)
set "Path=%JAVA_HOME%\bin;%Path%"

@echo on
echo JAVA_HOME %JAVA_HOME%
java -version
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
} Else {
   echo "================================"
   echo "Error No JDK Path For $args[0]"
   echo "================================"
}
$env:Path = $env:JAVA_HOME+'\bin;'+$env:Path

echo "JAVA_HOME $JAVA_HOME"
java -version
```
