- [Spring Boot 项目从 18.18M 瘦身到 0.18M](https://www.csdn.net/weixin_39872123/article/details/111036706)
- [把 Spring Boot 项目从 18.18M 瘦身到 0.18M，部署起来真省事](https://mp.weixin.qq.com/s/vNpYprrK4F2r6zoA6_IQyQ)

## 前言

SpringBoot部署起来虽然简单，如果服务器部署在公司内网，速度还行，但是如果部署在公网(阿里云等云服务器上)，部署起来实在头疼：编译出来的 Jar 包很大，如果工程引入了许多开源组件(SpringCloud等)，那就更大了。

这个时候如果想要对线上运行工程有一些微调，则非常痛苦

## 瘦身前的Jar包

Tomcat在部署Web工程的时候，可以进行增量更新，SpringBoot也是可以的～

SpringBoot编译出来的Jar包中，磁盘占用大的，是一些外部依赖库(jar包)，


例如：

进入项目工程根目录，执行 `mvn clean install` 命令，得到的Jar包，用压缩软件打开，目录结构如下：

```shell
./
├── BOOT-INF
│   ├── classes
│   └── lib
├── META-INF
└── org

```

## 解决方法

### 步骤1: 正常编译JAR包，解压出lib文件夹

POM文件如下：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <executions>
                <execution>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
            <configuration>
                <mainClass>com.light.cloud.service.demo.ServiceDemoApplication</mainClass>
                <layout>ZIP</layout>
            </configuration>
        </plugin>
    </plugins>
</build>
```

进入项目根目录，执行命令：`mvn clean install`

将编译后的Jar包解压，拷贝 `BOOT-INF` 目录下的 `lib` 文件夹 到目标路径 `/path/to/lib`；

### 步骤2: 修改pom.xml配置，编译出不带 lib 文件夹的Jar包

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <executions>
                <execution>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
            <configuration>
                <mainClass>com.light.cloud.service.demo.ServiceDemoApplication</mainClass>
                <layout>ZIP</layout>
                <includes> 
                    <include>
                        <groupId>nothing</groupId>
                        <artifactId>nothing</artifactId>
                    </include>  
                </includes>
            </configuration>
        </plugin>
    </plugins>
</build>

```

配置完成后，再次执行编译：`mvn clean install`

生成的 Jar 包体积明显变小，外部的 `jar` 包已经不会被引入了：

```shell
./
├── BOOT-INF
│   └── classes
├── META-INF
└── org

```
### 步骤3: 运行编译后的Jar包

将步骤1 解压出来的lib文件夹、步骤2编译的jar包放在同一个目录, 运行下面命令：

```shell
java -jar -Dloader.path=/path/to/lib cloud-service-demo.jar

```

或者在maven中输入一下命令导出需要用到的jar包

```shell
mvn dependency:copy-dependencies -DoutputDirectory=/path/to/lib -DincludeScope=runtime

```

**备注：**

将`/path/to/`改成实际的路径。`-Dloader.path=lib`文件夹路径 最终目录文件结构是：

```shell
./
├── cloud-service-demo.jar
└── lib
```

### 说明

1、通常，一个工程项目架构确定后，引入的jar包基本上不会变，改变的大部分是业务逻辑；

2、后面如果需要变更业务逻辑，只需要轻量地编译工程，大大提高项目部署的效率。
