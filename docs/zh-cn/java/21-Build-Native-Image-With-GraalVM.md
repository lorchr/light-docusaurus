- [Dubbo 使用 GraalVM 打包 Native Image](https://cn.dubbo.apache.org/zh-cn/docs/references/graalvm/support-graalvm/)
- [SpringBoot3.x原生镜像-Native Image尝鲜](https://vlts.cn/post/spring-boot-native-image-demo)
- [SpringBoot3.x原生镜像-Native Image实践](https://www.cnblogs.com/throwable/p/17644981.html)
- [手把手将你的Java maven项目通过GraalVM打包成windows可执行程序](https://zhuanlan.zhihu.com/p/613341871)
- [Spring Native打包本地镜像的操作方法(无需通过Graal的maven插件buildtools)](https://www.jb51.net/article/273990.htm)

- [Native Images with Spring Boot and GraalVM](https://www.baeldung.com/spring-native-intro)
- [使用 Spring Boot 和 GraalVM 构建原生镜像](https://springdoc.cn/spring-native-intro/)

- [GraalVM Downloads](https://www.graalvm.org/downloads/#)
- [GraalVM Community Edition](https://github.com/graalvm/graalvm-ce-builds/releases)
- [GraalVM Getting Start](https://www.graalvm.org/docs/getting-started/container-images/)
- [Maven plugin for GraalVM Native Image building](https://graalvm.github.io/native-build-tools/latest/maven-plugin.html)
- [Oracle GraalVM Document](https://docs.oracle.com/en/graalvm/enterprise/21/docs/getting-started)

- [Spring Native GraalVM Native Image Support](https://docs.spring.io/spring-native/docs/current/reference/htmlsingle/)
- [With native-image](https://docs.spring.io/spring-native/docs/0.12.x/reference/htmlsingle/#_with_code_native_image_code)
- [Spring Boot GraalVM Native Image Support](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html)
- [Spring-Boot-with-GraalVM](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-with-GraalVM)
- [GraalVM Spring Boot Samples](https://github.com/graalvm/native-build-tools/tree/master/samples)

- [SDKMan](https://sdkman.io/)

## 一、准备

| 组件                      | 版本               | 备注                                                                          |
| ------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| Maven                     | 3.9.6              |                                                                               |
| Jdk                       | graalvm-openjdk-21 |                                                                               |
| Spring Boot               | 3.2.2              |                                                                               |
| sdkman                    | 5.18.2             | JDK和各类SDK包管理工具                                                        |
| Liberica Native Image Kit | 23.1.2.r21-nik     | 可以构建Native Image的JDK                                                     |
| Visual Studio             | 2022               | Windows环境需要 x64 Native Tools Command Prompt for VS 2022 来打包NativeImage |

### 1. 安装 SDKMan 

1. 安装SDKMan

```shell
curl -s "https://get.sdkman.io" | bash

source "$HOME/.sdkman/bin/sdkman-init.sh"

# 验证sdkman版本
sdk version

SDKMAN!
script: 5.18.2
native: 0.4.6

```

2. SDKMan命令示例

```shell
# 可以通过sdk list java查看支持的JDK发行版本：
sdk list java

# 通过shell命令 sdk install java $Identifier 就可以安装对应的JDK发行版。
sdk install java 17.0.8-graalce

# 通过shell命令 sdk uninstall java $Identifier 可以卸载对应的JDK发行版。
sdk uninstall java 17.0.8-graalce

# 通过shell命令 sdk default java $Identifier去 指定默认使用的JDK版本
sdk default java 17.0.8-graalce

# 通过shell命令 sdk current 或者 sdk current java 查看当前正在使用的SDK或者JDK版本
sdk current java

```

### 2. SDKMan 安装 Liberica NIK

`Liberica Native Image Kit`是bellsoft出品的旨在创建高性能原生二进制（Native Binaries）基于JVM编写的应用的工具包，简称为`Liberica NIK`。`Liberica NIK`本质就是把OpenJDK和多种其他工具包一起封装起来的JDK发行版，在Native Image功能应用过程，可以简单把它视为`OpenJDK + GraalVM`的结合体。可以通过`sdk list java`查看相应的JDK版本：

```shell
sdk list java

sdk install java 23.1.2.r21-nik
# 这里最好把此JDK设置为当前系统的默认JDK，否则后面编译镜像时候会提示找不到GraalVM
sdk default java 23.1.2.r21-nik

# 验证jdk版本
java -version

openjdk version "21.0.2" 2024-01-16 LTS
OpenJDK Runtime Environment Liberica-NIK-23.1.2-1 (build 21.0.2+14-LTS)
OpenJDK 64-Bit Server VM Liberica-NIK-23.1.2-1 (build 21.0.2+14-LTS, mixed mode, sharing)

# 通过sdkman验证
sdk current java

Using java version 23.1.2.r21-nik
```

### 3. SDKMan 安装 Maven

```shell
sdk list maven

sdk install maven 3.9.6

sdk current maven

maven -version

```

## 二、编码

### 1. pom.xml

基于Maven新建一个SpringBoot应用，这里已经整理好了一份POM文件，实践过程可以直接用，如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.2.4</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>

	<groupId>com.light</groupId>
	<artifactId>native-image-demo</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>native-image-demo</name>
	<description>Demo project for Spring Boot</description>

	<properties>
		<java.version>21</java.version>
		<maven.compiler.source>21</maven.compiler.source>
		<maven.compiler.target>21</maven.compiler.target>
		<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
			<exclusions>
				<exclusion>
					<groupId>org.apache.tomcat.embed</groupId>
					<artifactId>tomcat-embed-core</artifactId>
				</exclusion>
				<exclusion>
					<groupId>org.apache.tomcat.embed</groupId>
					<artifactId>tomcat-embed-websocket</artifactId>
				</exclusion>
			</exclusions>
		</dependency>

		<dependency>
			<groupId>org.apache.tomcat.experimental</groupId>
			<artifactId>tomcat-embed-programmatic</artifactId>
			<version>10.1.19</version>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<artifactId>maven-compiler-plugin</artifactId>
				<groupId>org.apache.maven.plugins</groupId>
				<configuration>
					<source>${maven.compiler.source}</source>
					<target>${maven.compiler.target}</target>
					<encoding>${project.build.sourceEncoding}</encoding>
				</configuration>
			</plugin>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-install-plugin</artifactId>
			</plugin>
			<plugin>
				<groupId>org.graalvm.buildtools</groupId>
				<artifactId>native-maven-plugin</artifactId>
				<configuration>
					<imageName>native-image-demo</imageName>
				</configuration>
			</plugin>
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
					<mainClass>com.light.nativeimage.NativeImageApplication</mainClass>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>

```

这里把Maven的所有插件都提升到当前最新版本，原生镜像打包的关键插件是`native-maven-plugin`，此插件是跟随`spring-boot-starter-parent`进行版本管理，这里无须指定插件的版本。另外，`tomcat-embed-programmatic` 是一个实验性依赖，可以降低嵌入式Tomcat的内存使用，在生产中应用时候可以暂不启用此特性。

### 2. 启动类 com.light.nativeimage.NativeImageApplication

```java
package com.light.nativeimage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@SpringBootApplication
public class NativeImageApplication {

	public static void main(String[] args) {
		SpringApplication.run(NativeImageApplication.class, args);
	}

	@RequestMapping(path = "/")
	public ResponseEntity<String> index() {
		return ResponseEntity.ok("index");
	}
}

```

## 三、构建、测试与发布(在WSL Ubuntu执行)
三个操作的Maven命令分别是：

- 构建：`mvn -Pnative native:compile`
- 测试：`mvn -PnativeTest test`
- 发布：`mvn -Pnative spring-boot:build-image`，注意此命令会打包镜像并且发布到Docker的官方仓库中

> 虽然 `native:compile` 命令表面意义是编译，但是实际上它就是构建原生镜像的命令

执行构建流程：

```shell
mvn -Pnative native:compile -Dmaven.test.skip=true
```

构建结果如下：

```shell
[INFO] --- native:0.9.28:compile (default-cli) @ native-image-demo ---
[INFO] Found GraalVM installation from PATH variable.
[INFO] [graalvm reachability metadata repository for ch.qos.logback:logback-classic:1.4.14]: Configuration directory not found. Trying latest version.
[INFO] [graalvm reachability metadata repository for ch.qos.logback:logback-classic:1.4.14]: Configuration directory is ch.qos.logback/logback-classic/1.4.1
[INFO] [graalvm reachability metadata repository for com.fasterxml.jackson.core:jackson-databind:2.15.4]: Configuration directory not found. Trying latest version.
[INFO] [graalvm reachability metadata repository for com.fasterxml.jackson.core:jackson-databind:2.15.4]: Configuration directory is com.fasterxml.jackson.core/jackson-databind/2.15.2
[WARNING] Properties file at 'jar:file:///home/light/.m2/repository/org/apache/tomcat/experimental/tomcat-embed-programmatic/10.1.19/tomcat-embed-programmatic-10.1.19.jar!/META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-programmatic/native-image.properties' does not match the recommended 'META-INF/native-image/org.apache.tomcat.experimental/tomcat-embed-programmatic/native-image.properties' layout.
[INFO] Executing: /home/light/.sdkman/candidates/java/current/bin/native-image -cp /home/light/native-image/native-image-demo/target/classes:/home/light/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.4/spring-boot-starter-web-3.2.4.jar:/home/light/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.4/spring-boot-starter-3.2.4.jar:/home/light/.m2/repository/org/springframework/boot/spring-boot/3.2.4/spring-boot-3.2.4.jar:/home/light/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.4/spring-boot-autoconfigure-3.2.4.jar:/home/light/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.4/spring-boot-starter-logging-3.2.4.jar:/home/light/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/home/light/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/home/light/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/home/light/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/home/light/.m2/repository/org/slf4j/jul-to-slf4j/2.0.12/jul-to-slf4j-2.0.12.jar:/home/light/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/home/light/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/home/light/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.4/spring-boot-starter-json-3.2.4.jar:/home/light/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/home/light/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/home/light/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/home/light/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/home/light/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/home/light/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/home/light/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.4/spring-boot-starter-tomcat-3.2.4.jar:/home/light/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.19/tomcat-embed-el-10.1.19.jar:/home/light/.m2/repository/org/springframework/spring-web/6.1.5/spring-web-6.1.5.jar:/home/light/.m2/repository/org/springframework/spring-beans/6.1.5/spring-beans-6.1.5.jar:/home/light/.m2/repository/io/micrometer/micrometer-observation/1.12.4/micrometer-observation-1.12.4.jar:/home/light/.m2/repository/io/micrometer/micrometer-commons/1.12.4/micrometer-commons-1.12.4.jar:/home/light/.m2/repository/org/springframework/spring-webmvc/6.1.5/spring-webmvc-6.1.5.jar:/home/light/.m2/repository/org/springframework/spring-aop/6.1.5/spring-aop-6.1.5.jar:/home/light/.m2/repository/org/springframework/spring-context/6.1.5/spring-context-6.1.5.jar:/home/light/.m2/repository/org/springframework/spring-expression/6.1.5/spring-expression-6.1.5.jar:/home/light/.m2/repository/org/apache/tomcat/experimental/tomcat-embed-programmatic/10.1.19/tomcat-embed-programmatic-10.1.19.jar:/home/light/.m2/repository/org/slf4j/slf4j-api/2.0.12/slf4j-api-2.0.12.jar:/home/light/.m2/repository/org/springframework/spring-core/6.1.5/spring-core-6.1.5.jar:/home/light/.m2/repository/org/springframework/spring-jcl/6.1.5/spring-jcl-6.1.5.jar --no-fallback -o /home/light/native-image/native-image-demo/target/native-image-demo -H:ConfigurationFileDirectories=/home/light/native-image/native-image-demo/target/graalvm-reachability-metadata/5bb38a8addd4b99611ab251c3c0db9044a99ab58/com.fasterxml.jackson.core/jackson-databind/2.15.2,/home/light/native-image/native-image-demo/target/graalvm-reachability-metadata/5bb38a8addd4b99611ab251c3c0db9044a99ab58/ch.qos.logback/logback-classic/1.4.1
Warning: The option '-H:ResourceConfigurationResources=META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-programmatic/tomcat-resource.json' is experimental and must be enabled via '-H:+UnlockExperimentalVMOptions' in the future.
Warning: The option '-H:ReflectionConfigurationResources=META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-programmatic/tomcat-reflection.json' is experimental and must be enabled via '-H:+UnlockExperimentalVMOptions' in the future.
Warning: The option '-H:ReflectionConfigurationResources=META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-el/tomcat-reflection.json' is experimental and must be enabled via '-H:+UnlockExperimentalVMOptions' in the future.
Warning: The option '-H:ResourceConfigurationResources=META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-el/tomcat-resource.json' is experimental and must be enabled via '-H:+UnlockExperimentalVMOptions' in the future.
Warning: Please re-evaluate whether any experimental option is required, and either remove or unlock it. The build output lists all active experimental options, including where they come from and possible alternatives. If you think an experimental option should be considered as stable, please file an issue.
========================================================================================================================
GraalVM Native Image: Generating 'native-image-demo' (executable)...
========================================================================================================================
[1/8] Initializing...                                                                                    (3.7s @ 0.17GB)
 Java version: 21.0.2+14-LTS, vendor version: Liberica-NIK-23.1.2-1
 Graal compiler: optimization level: 2, target machine: x86-64-v3
 C compiler: gcc (linux, x86_64, 11.4.0)
 Garbage collector: Serial GC (max heap size: 80% of RAM)
 2 user-specific feature(s):
 - com.oracle.svm.thirdparty.gson.GsonFeature
 - org.springframework.aot.nativex.feature.PreComputeFieldFeature
------------------------------------------------------------------------------------------------------------------------
 2 experimental option(s) unlocked:
 - '-H:ResourceConfigurationResources' (origin(s): 'META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-el/native-image.properties' in 'file:///home/light/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.19/tomcat-embed-el-10.1.19.jar', 'META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-programmatic/native-image.properties' in 'file:///home/light/.m2/repository/org/apache/tomcat/experimental/tomcat-embed-programmatic/10.1.19/tomcat-embed-programmatic-10.1.19.jar')
 - '-H:ReflectionConfigurationResources' (origin(s): 'META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-el/native-image.properties' in 'file:///home/light/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.19/tomcat-embed-el-10.1.19.jar', 'META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-programmatic/native-image.properties' in 'file:///home/light/.m2/repository/org/apache/tomcat/experimental/tomcat-embed-programmatic/10.1.19/tomcat-embed-programmatic-10.1.19.jar')
------------------------------------------------------------------------------------------------------------------------
Build resources:
 - 8.84GB of memory (75.6% of 11.69GB system memory, determined at start)
 - 20 thread(s) (100.0% of 20 available processor(s), determined at start)
SLF4J(W): No SLF4J providers were found.
SLF4J(W): Defaulting to no-operation (NOP) logger implementation
SLF4J(W): See https://www.slf4j.org/codes.html#noProviders for further details.
[2/8] Performing analysis...  [******]                                                                 (126.9s @ 2.36GB)
GC warning: 91.0s spent in 25 GCs during the last stage, taking up 71.60% of the time.
            Please ensure more than 4.80GB of memory is available for Native Image
            to reduce GC overhead and improve image build time.
   16,213 reachable types   (89.3% of   18,150 total)
   24,547 reachable fields  (64.6% of   37,984 total)
   77,251 reachable methods (62.0% of  124,676 total)
    5,127 types,   544 fields, and 5,506 methods registered for reflection
       62 types,    63 fields, and    55 methods registered for JNI access
        4 native libraries: dl, pthread, rt, z
[3/8] Building universe...                                                                               (4.5s @ 2.30GB)
[4/8] Parsing methods...      [**]                                                                       (3.4s @ 1.85GB)
[5/8] Inlining methods...     [****]                                                                    (11.6s @ 1.44GB)
[6/8] Compiling methods...    [*******]                                                                 (53.6s @ 3.05GB)
[7/8] Layouting methods...    [*******]                                                                 (50.0s @ 1.40GB)
GC warning: 45.8s spent in 2 GCs during the last stage, taking up 91.68% of the time.
            Please ensure more than 5.19GB of memory is available for Native Image
            to reduce GC overhead and improve image build time.
[8/8] Creating image...       [*********]                                                               (86.4s @ 2.08GB)
  37.01MB (47.35%) for code area:    49,258 compilation units
  38.32MB (49.03%) for image heap:  402,774 objects and 298 resources
   2.83MB ( 3.62%) for other data
  78.16MB in total
------------------------------------------------------------------------------------------------------------------------
Top 10 origins of code area:                                Top 10 object types in image heap:
  13.94MB java.base                                           11.16MB byte[] for code metadata
   3.72MB java.xml                                             5.56MB byte[] for java.lang.String
   3.39MB tomcat-embed-programmatic-10.1.19.jar                3.87MB java.lang.Class
   1.99MB jackson-databind-2.15.4.jar                          3.77MB java.lang.String
   1.53MB spring-core-6.1.5.jar                                1.87MB byte[] for embedded resources
   1.47MB svm.jar (Native Image)                               1.36MB com.oracle.svm.core.hub.DynamicHubCompanion
   1.38MB spring-boot-3.2.4.jar                              991.58kB byte[] for reflection metadata
 938.27kB spring-beans-6.1.5.jar                             937.96kB byte[] for general heap data
 927.88kB spring-web-6.1.5.jar                               779.31kB java.lang.String[]
 884.53kB spring-webmvc-6.1.5.jar                            608.72kB java.util.HashMap$Node
   6.57MB for 67 more packages                                 7.49MB for 3514 more object types
Warning: The log4j library has been detected, but the version is unavailable. Due to Log4Shell, please ensure log4j is at version 2.17.1 or later.
------------------------------------------------------------------------------------------------------------------------
Recommendations:
 INIT: Adopt '--strict-image-heap' to prepare for the next GraalVM release.
 HEAP: Set max heap for improved and more predictable memory usage.
 CPU:  Enable more CPU features with '-march=native' for improved performance.
------------------------------------------------------------------------------------------------------------------------
                       155.9s (45.7% of total time) in 62 GCs | Peak RSS: 5.24GB | CPU load: 8.13
------------------------------------------------------------------------------------------------------------------------
Produced artifacts:
 /home/light/native-image/native-image-demo/target/native-image-demo (executable)
========================================================================================================================
Finished generating 'native-image-demo' in 5m 41s.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  09:03 min
[INFO] Finished at: 2024-04-08T11:53:25+08:00
[INFO] ------------------------------------------------------------------------
```

target目录结果：

```shell
tree -L 1 ./target/

./target/
├── classes
├── generated-sources
├── graalvm-reachability-metadata
├── maven-archiver
├── maven-status
├── native-image-demo
├── native-image-demo-0.0.1-SNAPSHOT.jar
├── native-image-demo-0.0.1-SNAPSHOT.jar.original
└── spring-aot
```

其中这个不带`.jar`后缀的就是最终的原生镜像，并且Native Image是不支持跨平台的，它只能在ARM架构的macOS中运行（受限于笔者的编译环境）。可以发现它（见上图中的`target/native-image-demo`，它是一个二进制执行文件）的体积比`executable jar`大好几倍。参照SpringBoot的官方文档，经过AOT编译的SpringBoot应用会生成下面的文件：

- Java源代码
- 字节码（例如动态代理编译后的产物等）
- GraalVM识别的提示文件：
    - 资源提示文件（resource-config.json）
    - 反射提示文件（reflect-config.json）
    - 序列化提示文件（serialization-config.json）
    - Java（动态）代理提示文件（proxy-config.json）
    - JNI提示文件（jni-config.json）

```shell
tree ./spring-aot/main/resources/

./spring-aot/main/resources/
└── META-INF
    └── native-image
        └── com.light
            └── native-image-demo
                ├── native-image.properties
                ├── reflect-config.json
                └── resource-config.json
```

这里的输出非执行包产物基本都在`target/spring-aot`目录下，其他非Spring或者项目源代码相关的产物输出到`graalvm-reachability-metadata`目录中。最后可以验证一下产出的Native Image：

```shell
./target/native-image-demo

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.2.4)

2024-04-08T11:54:49.344+08:00  INFO 2944 --- [native-image-demo] [           main] c.l.nativeimage.NativeImageApplication   : Starting AOT-processed NativeImageApplication using Java 21.0.2 with PID 2944 (/home/light/native-image/native-image-demo/target/native-image-demo started by light in /home/light/native-image/native-image-demo)
2024-04-08T11:54:49.344+08:00  INFO 2944 --- [native-image-demo] [           main] c.l.nativeimage.NativeImageApplication   : No active profile set, falling back to 1 default profile: "default"
2024-04-08T11:54:49.351+08:00  INFO 2944 --- [native-image-demo] [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat initialized with port 8080 (http)
2024-04-08T11:54:49.351+08:00  INFO 2944 --- [native-image-demo] [           main] o.apache.catalina.core.StandardService   : Starting service [Tomcat]
2024-04-08T11:54:49.351+08:00  INFO 2944 --- [native-image-demo] [           main] o.apache.catalina.core.StandardEngine    : Starting Servlet engine: [Apache Tomcat/10.1.19]
2024-04-08T11:54:49.355+08:00  INFO 2944 --- [native-image-demo] [           main] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring embedded WebApplicationContext
2024-04-08T11:54:49.355+08:00  INFO 2944 --- [native-image-demo] [           main] w.s.c.ServletWebServerApplicationContext : Root WebApplicationContext: initialization completed in 11 ms
2024-04-08T11:54:49.371+08:00  INFO 2944 --- [native-image-demo] [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path ''
2024-04-08T11:54:49.371+08:00  INFO 2944 --- [native-image-demo] [           main] c.l.nativeimage.NativeImageApplication   : Started NativeImageApplication in 0.034 seconds (process running for 0.037)


# 测试接口
curl -X GET 'http://localhost:8080/'
index
```

可以看到启动速度达到惊人的毫秒级别，如果应用在生产中应该可以全天候近乎无损发布。当然，理论上Native Image性能也会大幅度提升，但是限于篇幅这里暂时不进行性能测试。

## 四、Windows打包Native Image
- [Installation on Windows Platforms](https://www.graalvm.org/latest/docs/getting-started/windows/)

对于Windows系统，需要安装[GraalVM JDK](https://github.com/graalvm/graalvm-ce-builds/releases)和[Visual Studio](https://visualstudio.microsoft.com/zh-hans/)

### 1. 安装 GraalVM SDK

1. 下载[GraalVM Openjdk 21](https://github.com/graalvm/graalvm-ce-builds/releases)安装包

2. 解压到指定目录并设置环境变量

```shell
JAVA_HOME=D:/Develop/jdk/graalvm-openjdk-21
GRAALVM_HOME=D:/Develop/jdk/graalvm-openjdk-21
```

3. 测试

```shell
PS D:\Workspace\Github\sas-sample> java -version
openjdk version "21.0.2" 2024-01-16
OpenJDK Runtime Environment GraalVM CE 21.0.2+13.1 (build 21.0.2+13-jvmci-23.1-b30)                  
OpenJDK 64-Bit Server VM GraalVM CE 21.0.2+13.1 (build 21.0.2+13-jvmci-23.1-b30, mixed mode, sharing)

```

### 2. 安装 Visual Studio

1. 下载[Visual Studio BuildTools](https://aka.ms/vs/17/release/vs_BuildTools.exe)  [Visual Studio](https://visualstudio.microsoft.com/zh-hans/)

   - [VS 2019 BuildTools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools&rel=16)
   - [VS 2022 BuildTools](https://aka.ms/vs/17/release/vs_BuildTools.exe)
   - [Visual Studio](https://visualstudio.microsoft.com/zh-hans/)

2. 双击安装 Visual Studio BuildTools

3. 在主窗口勾选 `Desktop development with C++`，在侧边栏勾选 `Windows 10 SDK`，点击安装

4. 重启电脑，打开 `Visual Studio Installer`，在 `Installed` Tab页点击 `Modify`，

5. 选择 `Individual Components`，滚动滚轮到下面，确认`Windows 10 SDK`已安装，并确认 `Build Tools` 已安装

6. 选择 `Language`，去掉中文，勾选英文

7. 配置环境变量

```shell
MSVC = C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.39.33519

WK10_INCLUDE = C:\Program Files (x86)\Windows Kits\10\Include\10.0.20348.0
WK10_LIB = C:\Program Files (x86)\Windows Kits\10\Lib\10.0.20348.0
 
## 变量值必须为INCLUDE和LIB
INCLUDE = %WK10_INCLUDE%\ucrt;%WK10_INCLUDE%\um;%WK10_INCLUDE%\shared;%MSVC%\include
LIB = %WK10_LIB%\um\x64;%WK10_LIB%\ucrt\x64;%MSVC%\lib\x64
 
 
# 添加path中指定 MSVC cl.exe路径（X86架构的操作系统，32位，请根据实际情况选择）
C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.39.33519\bin\Hostx86\x86
 
# 添加path中指定 MSVC cl.exe路径（X64架构的操作系统，64位，请根据实际情况选择）
C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.39.33519\bin\Hostx64\x64

```

### 3. 测试

```shell
mvn -Pnative native:compile -Dmaven.test.skip=true
```

```shell
[INFO] --- native-maven-plugin:0.9.28:compile (default-cli) @ native-image-demo ---
[INFO] Found GraalVM installation from GRAALVM_HOME variable.
[INFO] [graalvm reachability metadata repository for ch.qos.logback:logback-classic:1.4.14]: Configuration directory not found. Trying latest version.
[INFO] [graalvm reachability metadata repository for ch.qos.logback:logback-classic:1.4.14]: Configuration directory is ch.qos.logback\logback-classic\1.4.1
[INFO] [graalvm reachability metadata repository for com.fasterxml.jackson.core:jackson-databind:2.15.4]: Configuration directory not found. Trying latest version.
[INFO] [graalvm reachability metadata repository for com.fasterxml.jackson.core:jackson-databind:2.15.4]: Configuration directory is com.fasterxml.jackson.core\jackson-databind\2.1
5.2
[WARNING] Properties file at 'jar:file:///D:/Develop/repository/org/apache/tomcat/experimental/tomcat-embed-programmatic/10.1.19/tomcat-embed-programmatic-10.1.19.jar!/META-INF/nat
ive-image/org.apache.tomcat.embed/tomcat-embed-programmatic/native-image.properties' does not match the recommended 'META-INF/native-image/org.apache.tomcat.experimental/tomcat-emb
ed-programmatic/native-image.properties' layout.
[INFO] Executing: D:\Develop\jdk\graalvm-openjdk-21\bin\native-image.cmd @target\tmp\native-image-17407776575462253203.args
Warning: The option '-H:ResourceConfigurationResources=META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-programmatic/tomcat-resource.json' is experimental and must be ena
bled via '-H:+UnlockExperimentalVMOptions' in the future.
Warning: The option '-H:ReflectionConfigurationResources=META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-programmatic/tomcat-reflection.json' is experimental and must be
 enabled via '-H:+UnlockExperimentalVMOptions' in the future.
Warning: The option '-H:ReflectionConfigurationResources=META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-el/tomcat-reflection.json' is experimental and must be enabled v
ia '-H:+UnlockExperimentalVMOptions' in the future.
Warning: The option '-H:ResourceConfigurationResources=META-INF/native-image/org.apache.tomcat.embed/tomcat-embed-el/tomcat-resource.json' is experimental and must be enabled via '
-H:+UnlockExperimentalVMOptions' in the future.
Warning: Please re-evaluate whether any experimental option is required, and either remove or unlock it. The build output lists all active experimental options, including where the
y come from and possible alternatives. If you think an experimental option should be considered as stable, please file an issue.
========================================================================================================================
GraalVM Native Image: Generating 'native-image-demo' (executable)...
========================================================================================================================
For detailed information and explanations on the build output, visit:
https://github.com/oracle/graal/blob/master/docs/reference-manual/native-image/BuildOutput.md
------------------------------------------------------------------------------------------------------------------------
[1/8] Initializing...                                                                                    (5.7s @ 0.12GB)
 Java version: 21.0.2+13, vendor version: GraalVM CE 21.0.2+13.1
 Graal compiler: optimization level: 2, target machine: x86-64-v3
 C compiler: cl.exe (microsoft, x64, 19.39.33523)
 Garbage collector: Serial GC (max heap size: 80% of RAM)
 2 user-specific feature(s):
 - com.oracle.svm.thirdparty.gson.GsonFeature
 - org.springframework.aot.nativex.feature.PreComputeFieldFeature
------------------------------------------------------------------------------------------------------------------------
 2 experimental option(s) unlocked:
 - '-H:ResourceConfigurationResources' (origin(s): 'META-INF\native-image\org.apache.tomcat.embed\tomcat-embed-el\native-image.properties' in 'file:///D:/Develop/repository/org/apa
che/tomcat/embed/tomcat-embed-el/10.1.19/tomcat-embed-el-10.1.19.jar', 'META-INF\native-image\org.apache.tomcat.embed\tomcat-embed-programmatic\native-image.properties' in 'file://
/D:/Develop/repository/org/apache/tomcat/experimental/tomcat-embed-programmatic/10.1.19/tomcat-embed-programmatic-10.1.19.jar')
 - '-H:ReflectionConfigurationResources' (origin(s): 'META-INF\native-image\org.apache.tomcat.embed\tomcat-embed-el\native-image.properties' in 'file:///D:/Develop/repository/org/a
pache/tomcat/embed/tomcat-embed-el/10.1.19/tomcat-embed-el-10.1.19.jar', 'META-INF\native-image\org.apache.tomcat.embed\tomcat-embed-programmatic\native-image.properties' in 'file:
///D:/Develop/repository/org/apache/tomcat/experimental/tomcat-embed-programmatic/10.1.19/tomcat-embed-programmatic-10.1.19.jar')
------------------------------------------------------------------------------------------------------------------------
Build resources:
 - 11.86GB of memory (75.6% of 15.69GB system memory, determined at start)
 - 20 thread(s) (100.0% of 20 available processor(s), determined at start)
SLF4J(W): No SLF4J providers were found.
SLF4J(W): Defaulting to no-operation (NOP) logger implementation
SLF4J(W): See https://www.slf4j.org/codes.html#noProviders for further details.
[2/8] Performing analysis...  [******]                                                                  (39.8s @ 1.55GB)
   16,163 reachable types   (89.8% of   17,994 total)
   24,546 reachable fields  (64.8% of   37,895 total)
   77,299 reachable methods (62.2% of  124,237 total)
    5,182 types,   539 fields, and 5,523 methods registered for reflection
       77 types,    58 fields, and    68 methods registered for JNI access
        5 native libraries: crypt32, ncrypt, psapi, version, winhttp
[3/8] Building universe...                                                                              (11.6s @ 1.59GB)
[4/8] Parsing methods...      [**]                                                                       (4.3s @ 1.51GB)
[5/8] Inlining methods...     [****]                                                                     (4.2s @ 0.88GB)
[6/8] Compiling methods...    [*****]                                                                   (26.3s @ 2.23GB)
[7/8] Layouting methods...    [***]                                                                      (7.7s @ 3.16GB)
[8/8] Creating image...       [**]                                                                       (4.9s @ 1.58GB)
  37.55MB (50.52%) for code area:    49,338 compilation units
  36.35MB (48.91%) for image heap:  385,481 objects and 268 resources
 437.30kB ( 0.57%) for other data
  74.33MB in total
------------------------------------------------------------------------------------------------------------------------
Top 10 origins of code area:                                Top 10 object types in image heap:
  14.04MB java.base                                           11.21MB byte[] for code metadata
   3.75MB java.xml                                             5.43MB byte[] for java.lang.String
   3.43MB tomcat-embed-programmatic-10.1.19.jar                3.86MB java.lang.Class
   2.00MB jackson-databind-2.15.4.jar                          3.66MB java.lang.String
   1.58MB svm.jar (Native Image)                               1.36MB com.oracle.svm.core.hub.DynamicHubCompanion
   1.54MB spring-core-6.1.5.jar                                1.09MB byte[] for embedded resources
   1.39MB spring-boot-3.2.4.jar                              992.34kB byte[] for reflection metadata
 945.83kB spring-beans-6.1.5.jar                             864.41kB byte[] for general heap data
 936.29kB spring-web-6.1.5.jar                               753.84kB java.lang.String[]
 891.22kB spring-webmvc-6.1.5.jar                            579.38kB c.o.svm.core.hub.DynamicHub$ReflectionMetadata
   6.76MB for 68 more packages                                 6.62MB for 3498 more object types
Warning: The log4j library has been detected, but the version is unavailable. Due to Log4Shell, please ensure log4j is at version 2.17.1 or later.
------------------------------------------------------------------------------------------------------------------------
Recommendations:
 INIT: Adopt '--strict-image-heap' to prepare for the next GraalVM release.
 HEAP: Set max heap for improved and more predictable memory usage.
 CPU:  Enable more CPU features with '-march=native' for improved performance.
------------------------------------------------------------------------------------------------------------------------
                      26.3s (24.2% of total time) in 154 GCs | Peak RSS: 4.36GB | CPU load: 10.02
------------------------------------------------------------------------------------------------------------------------
Produced artifacts:
 D:\Workspace\Github\native-image-demo\target\native-image-demo.exe (executable)
========================================================================================================================
Finished generating 'native-image-demo' in 1m 48s.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  02:00 min
[INFO] Finished at: 2024-04-08T16:52:25+08:00
[INFO] ------------------------------------------------------------------------

```

查看target目录

```shell
dir .\target\

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----          2024/4/8     16:50                classes
d-----          2024/4/8     16:50                generated-sources
d-----          2024/4/8     16:50                generated-test-sources
d-----          2024/4/8     16:50                graalvm-reachability-metadata
d-----          2024/4/8     16:50                maven-archiver
d-----          2024/4/8     16:50                maven-status
d-----          2024/4/8     16:50                spring-aot
d-----          2024/4/8     16:50                surefire-reports
d-----          2024/4/8     16:50                test-classes
d-----          2024/4/8     16:50                test-ids
d-----          2024/4/8     16:50                tmp
-a----          2024/4/8     16:50       18336361 native-image-demo-0.0.1-SNAPSHOT.jar
-a----          2024/4/8     16:50         136578 native-image-demo-0.0.1-SNAPSHOT.jar.original
-a----          2024/4/8     16:52       77938688 native-image-demo.exe

```

## 小结
鉴于SpringBoot3.x的正式版已经推出一段时间，从文档上看，Native Image使用的技术已经相对成熟，可以放心用于生产环境。当然，Native Image目前还存在一些局限性会让一些组件完全无法使用或者部分功能受限（参考[Spring Boot with GraalVM](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-with-GraalVM)），希望这些问题或者局限性有一天能够突破让所有JVM应用迎来一次性能飞跃。

## 常见报错

- [Quarkus初体验--2.9.0.Final版本（Windows10系统 64位）](https://blog.csdn.net/lizhou828/article/details/124764765)
- [SpringBoot3.0 Native构建](https://blog.csdn.net/OpenGao/article/details/128273474)
- [使用GraalVM native-image 编译SpringBoot3全过程](https://blog.csdn.net/qq_27935091/article/details/129981470)

### 1. 在Windows下执行打包报错 `returned non-zero result`

> `Execution of D:\Develop\jdk\graalvm-openjdk-21\bin\native-image.cmd @target\tmp\native-image-11336441505834086013.args returned non-zero result`

参考: https://blog.csdn.net/OpenGao/article/details/128273474

1. 不能使用idea的maven插件进行编译,需要使用 `x86 Native Tools Command Prompt for VS 2022`在项目路径下执行maven操作
```shell
mvn -Pnative native:compile
```

2. 或者修改 `target/tmp/native-image-11336441505834086013.args` 配置文件，将其中的 `\\` 全部改为 `/`，然后再次执行
```shell
D:\Develop\jdk\graalvm-openjdk-21\bin\native-image.cmd @target\tmp\native-image-11336441505834086013.args
```

### 2. `Native-image building on Windows currently only supports target architecture: AMD64 (32-bit architecture x86 unsupported)`

1. Visual Studio 需要语言为英文

参考: https://blog.csdn.net/lizhou828/article/details/124764765

> Error: Native-image building on Windows currently only supports target architecture: AMD64 (32-bit architecture x86 unsupported)
> Error: To prevent native-toolchain checking provide command-line option -H:-CheckToolchain
> Error: Use -H:+ReportExceptionStackTraces to print stacktrace of underlying exception

2. 需要配置Visual Studio环境变量

```shell
MSVC = C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.39.33519

WK10_INCLUDE = C:\Program Files (x86)\Windows Kits\10\Include\10.0.20348.0
WK10_LIB = C:\Program Files (x86)\Windows Kits\10\Lib\10.0.20348.0
 
## 变量值必须为INCLUDE和LIB
INCLUDE = %WK10_INCLUDE%\ucrt;%WK10_INCLUDE%\um;%WK10_INCLUDE%\shared;%MSVC%\include
LIB = %WK10_LIB%\um\x64;%WK10_LIB%\ucrt\x64;%MSVC%\lib\x64
 
 
# 添加path中指定 MSVC cl.exe路径（X86架构的操作系统，32位，请根据实际情况选择）
C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.39.33519\bin\Hostx86\x86
 
# 添加path中指定 MSVC cl.exe路径（X64架构的操作系统，64位，请根据实际情况选择）
C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC\14.39.33519\bin\Hostx64\x64

```

### 3. Error: Main entry point class 'xxx' neither found on classpath: 'yyy' nor modulepath: 'zzz'

1. 见github issue

   - https://github.com/graalvm/native-build-tools/issues/213
   - https://github.com/oracle/graal/issues/6127
   - https://github.com/oracle/graal/issues/7501

2. 实测不能使用execution goal compile-no-fork

```xml
<plugin>
	<groupId>org.graalvm.buildtools</groupId>
	<artifactId>native-maven-plugin</artifactId>
	<!--<executions>
		<execution>
			<id>build-native</id>
			<goals>
				<goal>compile-no-fork</goal>
			</goals>
			<phase>package</phase>
		</execution>
	</executions>-->
	<configuration>
		<imageName>${project.artifactId}</imageName>
		<mainClass>com.light.sas.AuthApplication</mainClass>
		<skipNativeTests>true</skipNativeTests>
		<buildArgs combine.children="append">
			<buildArg>--no-fallback</buildArg>
			<buildArg>--enable-url-protocols=http</buildArg>
			<buildArg>--features=com.light.sas.config.natives.LambdaRegistrationFeature</buildArg>
			<buildArg>--initialize-at-run-time=sun.net.dns.ResolverConfigurationImpl</buildArg>
		</buildArgs>
	</configuration>
</plugin>
```