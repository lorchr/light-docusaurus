
## 准备
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

## 编码

### 1. 添加依赖及插件

1. 添加graalvm依赖

```xml
<!-- GraalVM 打包 -->
<dependency>
    <groupId>org.graalvm.sdk</groupId>
    <artifactId>graal-sdk</artifactId>
    <scope>provided</scope>
</dependency>
<!-- optional: 注意需要从 spring boot starter web 中移除 tomcat 依赖 -->
<dependency>
    <groupId>org.apache.tomcat.experimental</groupId>
    <artifactId>tomcat-embed-programmatic</artifactId>
</dependency>
<!-- 反射依赖 -->
<dependency>
    <groupId>org.reflections</groupId>
    <artifactId>reflections</artifactId>
</dependency>
```

2. 添加依赖

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <!-- 在进行AOT编译时跳过测试 -->
    <configuration>
        <skip>true</skip>
    </configuration>
</plugin>
<!-- 指定goal打包aot -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <executions>
        <execution>
            <id>process-aot</id>
            <goals>
                <goal>process-aot</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <mainClass>com.light.sas.AuthApplication</mainClass>
        <excludes>
            <exclude>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
            </exclude>
        </excludes>
    </configuration>
</plugin>

<!-- 打包native image插件 -->
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
    <extensions>true</extensions>
    <executions>
        <execution>
            <id>add-reachability-metadata</id>
            <goals>
                <goal>add-reachability-metadata</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <fallback>false</fallback>
        <!-- 打包目标镜像的名称 -->
        <imageName>${project.artifactId}</imageName>
        <!-- 项目启动类名称 -->
        <mainClass>com.light.sas.AuthApplication</mainClass>
        <!-- 本地测试执行不支持 Mockito，需要跳过测试 -->
        <skipNativeTests>true</skipNativeTests>
        <metadataRepository>
            <enabled>true</enabled>
        </metadataRepository>
        <!-- 打包扩展参数 -->
        <buildArgs combine.children="append">
            <buildArg>--verbose</buildArg>
            <buildArg>--native-image-info</buildArg>
            <buildArg>--no-fallback</buildArg>
            <buildArg>--enable-url-protocols=http</buildArg>
            <!-- 添加代码中添加的Feature -->
            <buildArg>--features=com.light.sas.config.natives.LambdaRegistrationFeature</buildArg>
            <buildArg>--initialize-at-run-time=sun.net.dns.ResolverConfigurationImpl</buildArg>
            <!-- 运行时初始化的类，通常是反射类 -->
            <buildArg>
                --initialize-at-build-time=org.slf4j.LoggerFactory,ch.qos.logback,org.springframework.core.annotation.AnnotationUtils,org.springframework.util.PropertyPlaceholderHelper,org.springframework.util.ClassUtils,org.springframework.core.annotation.PackagesAnnotationFilter,org.springframework.core.annotation.AnnotationTypeMappings,org.springframework.core.annotation.AnnotationFilter$1,org.springframework.core.annotation.AnnotationFilter$2,org.springframework.core.NativeDetector,org.springframework.core.annotation.MergedAnnotations$Search,org.springframework.core.io.support.PathMatchingResourcePatternResolver,org.springframework.core.SpringProperties,org.springframework.core.annotation.AttributeMethods,org.springframework.core.annotation.AnnotationFilter,org.springframework.util.AntPathMatcher,org.apache.commons.logging.LogAdapter,org.springframework.core.annotation.TypeMappedAnnotations,org.springframework.util.ReflectionUtils,org.springframework.util.AntPathMatcher$AntPathStringMatcher,org.springframework.core.annotation.RepeatableContainers$StandardRepeatableContainers,org.springframework.core.annotation.TypeMappedAnnotation,org.apache.commons.logging.LogAdapter$Slf4jLocationAwareLog,org.springframework.context.index.CandidateComponentsIndexLoader,org.springframework.core.annotation.AnnotationsScanner,org.springframework.core.annotation.AnnotationTypeMapping,org.springframework.util.ConcurrentReferenceHashMap,org.springframework.beans.BeanUtils,org.springframework.context.annotation.ConfigurationClassUtils,org.springframework.core.KotlinDetector,org.springframework.core.annotation.MergedAnnotationCollectors
            </buildArg>
        </buildArgs>
    </configuration>
</plugin>
```

3. 完整pom文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>sas-37-native-image</artifactId>
    <packaging>jar</packaging>

    <name>37-auth-server-native-image</name>
    <description>Authentication Server Native Image</description>

    <parent>
        <groupId>org.light.sas</groupId>
        <artifactId>sas-sample</artifactId>
        <version>2024.0.0</version>
    </parent>

    <properties>
        <java.version>21</java.version>
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
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-ldap</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-cas</artifactId>
            <exclusions>
                <!-- 与 spring-security-saml2-service-provider 的依赖版本冲突 -->
                <exclusion>
                    <groupId>org.bouncycastle</groupId>
                    <artifactId>bcprov-jdk15on</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-authorization-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-saml2-service-provider</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <!-- 引入分布式session -->
        <dependency>
            <groupId>org.springframework.session</groupId>
            <artifactId>spring-session-data-redis</artifactId>
        </dependency>
        <!-- 提供对Java8的特性与Java8时间相关序列化支持 -->
        <dependency>
            <groupId>com.fasterxml.jackson.datatype</groupId>
            <artifactId>jackson-datatype-jsr310</artifactId>
        </dependency>

        <!-- 登录页面 确认页面 -->
        <!--<dependency>
            <groupId>org.webjars</groupId>
            <artifactId>webjars-locator-core</artifactId>
        </dependency>-->
        <dependency>
            <groupId>org.webjars</groupId>
            <artifactId>bootstrap</artifactId>
        </dependency>

        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-generator</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.velocity</groupId>
            <artifactId>velocity-engine-core</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>core</artifactId>
        </dependency>
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>javase</artifactId>
        </dependency>
        <!-- 图片验证码 -->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
        </dependency>

        <!-- GraalVM 打包 -->
        <dependency>
            <groupId>org.graalvm.sdk</groupId>
            <artifactId>graal-sdk</artifactId>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.apache.tomcat.experimental</groupId>
            <artifactId>tomcat-embed-programmatic</artifactId>
        </dependency>
        <dependency>
            <groupId>org.reflections</groupId>
            <artifactId>reflections</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <parameters>true</parameters>
                    <source>${maven.compiler.source}</source>
                    <target>${maven.compiler.target}</target>
                    <encoding>${project.build.sourceEncoding}</encoding>
                    <compilerArgs>--enable-preview</compilerArgs>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <!-- 在进行AOT编译时跳过测试 -->
                <configuration>
                    <skip>true</skip>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <id>process-aot</id>
                        <goals>
                            <goal>process-aot</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <mainClass>com.light.sas.AuthApplication</mainClass>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.graalvm.buildtools</groupId>
                <artifactId>native-maven-plugin</artifactId>
                <extensions>true</extensions>
                <executions>
                    <execution>
                        <id>add-reachability-metadata</id>
                        <goals>
                            <goal>add-reachability-metadata</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <fallback>false</fallback>
                    <imageName>${project.artifactId}</imageName>
                    <mainClass>com.light.sas.AuthApplication</mainClass>
                    <!-- 本地测试执行不支持 Mockito，需要跳过测试 -->
                    <skipNativeTests>true</skipNativeTests>
                    <metadataRepository>
                        <enabled>true</enabled>
                    </metadataRepository>
                    <buildArgs combine.children="append">
                        <buildArg>--verbose</buildArg>
                        <buildArg>--native-image-info</buildArg>
                        <buildArg>--no-fallback</buildArg>
                        <buildArg>--enable-url-protocols=http</buildArg>
                        <buildArg>--features=com.light.sas.config.natives.LambdaRegistrationFeature</buildArg>
                        <buildArg>--initialize-at-run-time=sun.net.dns.ResolverConfigurationImpl</buildArg>
                        <buildArg>
                            --initialize-at-build-time=org.slf4j.LoggerFactory,ch.qos.logback,org.springframework.core.annotation.AnnotationUtils,org.springframework.util.PropertyPlaceholderHelper,org.springframework.util.ClassUtils,org.springframework.core.annotation.PackagesAnnotationFilter,org.springframework.core.annotation.AnnotationTypeMappings,org.springframework.core.annotation.AnnotationFilter$1,org.springframework.core.annotation.AnnotationFilter$2,org.springframework.core.NativeDetector,org.springframework.core.annotation.MergedAnnotations$Search,org.springframework.core.io.support.PathMatchingResourcePatternResolver,org.springframework.core.SpringProperties,org.springframework.core.annotation.AttributeMethods,org.springframework.core.annotation.AnnotationFilter,org.springframework.util.AntPathMatcher,org.apache.commons.logging.LogAdapter,org.springframework.core.annotation.TypeMappedAnnotations,org.springframework.util.ReflectionUtils,org.springframework.util.AntPathMatcher$AntPathStringMatcher,org.springframework.core.annotation.RepeatableContainers$StandardRepeatableContainers,org.springframework.core.annotation.TypeMappedAnnotation,org.apache.commons.logging.LogAdapter$Slf4jLocationAwareLog,org.springframework.context.index.CandidateComponentsIndexLoader,org.springframework.core.annotation.AnnotationsScanner,org.springframework.core.annotation.AnnotationTypeMapping,org.springframework.util.ConcurrentReferenceHashMap,org.springframework.beans.BeanUtils,org.springframework.context.annotation.ConfigurationClassUtils,org.springframework.core.KotlinDetector,org.springframework.core.annotation.MergedAnnotationCollectors
                        </buildArg>
                    </buildArgs>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

### 2. 添加 native-image 配置文件

在项目的resource目录下新建 `MATE-INF/native-image` 目录，用于存放 native-image 配置文件

1. 项目基础配置 `com/light/sas/sas-37-native-image/native-image.properties`

```properties
Args=-H:Class=com.light.sas.AuthApplication \
--report-unsupported-elements-at-runtime \
--no-fallback \
--install-exit-handlers \
--enable-url-protocols=http \
--features=com.light.sas.config.natives.LambdaRegistrationFeature \
--initialize-at-build-time=org.slf4j.LoggerFactory,ch.qos.logback,org.springframework.core.annotation.AnnotationUtils,org.springframework.util.PropertyPlaceholderHelper,org.springframework.util.ClassUtils,org.springframework.core.annotation.PackagesAnnotationFilter,org.springframework.core.annotation.AnnotationTypeMappings,org.springframework.core.annotation.AnnotationFilter$1,org.springframework.core.annotation.AnnotationFilter$2,org.springframework.core.NativeDetector,org.springframework.core.annotation.MergedAnnotations$Search,org.springframework.core.io.support.PathMatchingResourcePatternResolver,org.springframework.core.SpringProperties,org.springframework.core.annotation.AttributeMethods,org.springframework.core.annotation.AnnotationFilter,org.springframework.util.AntPathMatcher,org.apache.commons.logging.LogAdapter,org.springframework.core.annotation.TypeMappedAnnotations,org.springframework.util.ReflectionUtils,org.springframework.util.AntPathMatcher$AntPathStringMatcher,org.springframework.core.annotation.RepeatableContainers$StandardRepeatableContainers,org.springframework.core.annotation.TypeMappedAnnotation,org.apache.commons.logging.LogAdapter$Slf4jLocationAwareLog,org.springframework.context.index.CandidateComponentsIndexLoader,org.springframework.core.annotation.AnnotationsScanner,org.springframework.core.annotation.AnnotationTypeMapping,org.springframework.util.ConcurrentReferenceHashMap,org.springframework.beans.BeanUtils,org.springframework.context.annotation.ConfigurationClassUtils,org.springframework.core.KotlinDetector,org.springframework.core.annotation.MergedAnnotationCollectors \
-H:ResourceConfigurationFiles=target/classes/META-INF/native-image/resource-config.json
```

2. JNI配置 `jni-config.json`

```json
[
  {
    "name": "sun.net.dns.ResolverConfigurationImpl",
    "fields": [
      {
        "name": "os_searchlist"
      },
      {
        "name": "os_nameservers"
      }
    ]
  },
  {
    "name": "java.lang.Boolean",
    "methods": [
      {
        "name": "getBoolean",
        "parameterTypes": [
          "java.lang.String"
        ]
      }
    ]
  },
  {
    "name": "sun.management.VMManagementImpl",
    "fields": [
      {
        "name": "compTimeMonitoringSupport"
      },
      {
        "name": "currentThreadCpuTimeSupport"
      },
      {
        "name": "objectMonitorUsageSupport"
      },
      {
        "name": "otherThreadCpuTimeSupport"
      },
      {
        "name": "remoteDiagnosticCommandsSupport"
      },
      {
        "name": "synchronizerUsageSupport"
      },
      {
        "name": "threadAllocatedMemorySupport"
      },
      {
        "name": "threadContentionMonitoringSupport"
      }
    ]
  }
]
```

3. 代理配置 `proxy-config.json`

```json
[
  {
    "interfaces": [
      "java.lang.reflect.GenericArrayType",
      "org.springframework.core.SerializableTypeWrapper$SerializableTypeProxy",
      "java.io.Serializable"
    ]
  },
  {
    "interfaces": [
      "java.lang.reflect.ParameterizedType",
      "org.springframework.core.SerializableTypeWrapper$SerializableTypeProxy",
      "java.io.Serializable"
    ]
  },
  {
    "interfaces": [
      "java.lang.reflect.TypeVariable",
      "org.springframework.core.SerializableTypeWrapper$SerializableTypeProxy",
      "java.io.Serializable"
    ]
  },
  {
    "interfaces": [
      "java.lang.reflect.WildcardType",
      "org.springframework.core.SerializableTypeWrapper$SerializableTypeProxy",
      "java.io.Serializable"
    ]
  }
]
```

4. 资源文件配置 `resource-config.json`

```json
{
  "resources" : {
    "includes" : [
      {"pattern": "opensaml-core:^*.xml$"},
      {"pattern": "opensaml-saml-impl:^*.xml$"},
      {"pattern": "opensaml-soap-impl:^*.xml$"}
    ],
    "excludes" : [ ]
  },
  "bundles": [
    {
      "name": "org.apache.xml.security.resource.xmlsecurity",
      "locales": ["", "en"]
    }
  ]
}
```

5. 序列化配置 `serialization-config.json`

```json
{
  "types": [
    {
      "name": "com.light.sas.entity.OAuth2BasicUser"
    },
    {
      "name": "com.light.sas.model.security.CustomGrantedAuthority"
    },
    {
      "name": "java.lang.Boolean"
    },
    {
      "name": "java.lang.Integer"
    },
    {
      "name": "java.lang.Long"
    },
    {
      "name": "java.lang.Number"
    },
    {
      "name": "java.lang.String"
    },
    {
      "name": "java.lang.String$CaseInsensitiveComparator"
    },
    {
      "name": "java.net.URL"
    },
    {
      "name": "java.time.Instant"
    },
    {
      "name": "java.time.LocalDateTime"
    },
    {
      "name": "java.time.Ser"
    },
    {
      "name": "java.util.ArrayList"
    },
    {
      "name": "java.util.Arrays$ArrayList"
    },
    {
      "name": "java.util.Collections$EmptyList"
    },
    {
      "name": "java.util.Collections$EmptyMap"
    },
    {
      "name": "java.util.Collections$EmptySet"
    },
    {
      "name": "java.util.Collections$UnmodifiableCollection"
    },
    {
      "name": "java.util.Collections$UnmodifiableList"
    },
    {
      "name": "java.util.Collections$UnmodifiableMap"
    },
    {
      "name": "java.util.Collections$EmptySet"
    },
    {
      "name": "java.util.Collections$UnmodifiableRandomAccessList"
    },
    {
      "name": "java.util.Collections$UnmodifiableRandomAccessList"
    },
    {
      "name": "java.util.Collections$SingletonList"
    },
    {
      "name": "java.util.HashMap"
    },
    {
      "name": "java.util.HashSet"
    },
    {
      "name": "java.util.ImmutableCollections$SetN"
    },
    {
      "name": "java.util.ImmutableCollections$Set12"
    },
    {
      "name": "java.util.LinkedHashMap"
    },
    {
      "name": "java.util.LinkedHashSet"
    },
    {
      "name": "java.util.Locale"
    },
    {
      "name": "java.util.TreeMap"
    },
    {
      "name": "org.springframework.security.authentication.AbstractAuthenticationToken"
    },
    {
      "name": "org.springframework.security.authentication.UsernamePasswordAuthenticationToken"
    },
    {
      "name": "org.springframework.security.core.context.SecurityContextImpl"
    },
    {
      "name": "org.springframework.security.ldap.userdetails.InetOrgPerson"
    },
    {
      "name": "org.springframework.security.ldap.userdetails.LdapUserDetailsImpl"
    },
    {
      "name": "org.springframework.security.ldap.userdetails.Person"
    },
    {
      "name": "org.springframework.security.oauth2.core.AbstractOAuth2Token"
    },
    {
      "name": "org.springframework.security.oauth2.core.AuthorizationGrantType"
    },
    {
      "name": "org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse"
    },
    {
      "name": "org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest"
    },
    {
      "name": "org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationResponse"
    },
    {
      "name": "org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationResponseType"
    },
    {
      "name": "org.springframework.security.oauth2.core.endpoint.OAuth2DeviceAuthorizationResponse"
    },
    {
      "name": "org.springframework.security.oauth2.core.OAuth2Error"
    },
    {
      "name": "org.springframework.security.oauth2.core.oidc.OidcIdToken"
    },
    {
      "name": "org.springframework.security.oauth2.core.oidc.OidcUserInfo"
    },
    {
      "name": "org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser"
    },
    {
      "name": "org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority"
    },
    {
      "name": "org.springframework.security.oauth2.core.user.DefaultOAuth2User"
    },
    {
      "name": "org.springframework.security.oauth2.core.user.OAuth2UserAuthority"
    },
    {
      "name": "org.springframework.security.saml2.provider.service.authentication.DefaultSaml2AuthenticatedPrincipal"
    },
    {
      "name": "org.springframework.security.web.authentication.WebAuthenticationDetails"
    },
    {
      "name": "org.springframework.security.web.savedrequest.DefaultSavedRequest"
    },
    {
      "name": "com.nimbusds.jose.shaded.gson.internal.LinkedTreeMap"
    }
  ],
  "lambdaCapturingTypes": [
  ],
  "proxies": [
  ]
}
```

### 3. 现有类改造
在配置类及启动类添加 `proxyBeanMethods = false` 属性

```java
@Configuration(proxyBeanMethods = false)

@SpringBootApplication(proxyBeanMethods = false)
```

### 4. Native配置类

1. Mybatis 配置

```java
package com.light.sas.config.natives;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.logging.LogFactory;
import org.apache.ibatis.annotations.DeleteProvider;
import org.apache.ibatis.annotations.InsertProvider;
import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.annotations.UpdateProvider;
import org.apache.ibatis.cache.decorators.FifoCache;
import org.apache.ibatis.cache.decorators.LruCache;
import org.apache.ibatis.cache.decorators.SoftCache;
import org.apache.ibatis.cache.decorators.WeakCache;
import org.apache.ibatis.cache.impl.PerpetualCache;
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.executor.parameter.ParameterHandler;
import org.apache.ibatis.executor.resultset.ResultSetHandler;
import org.apache.ibatis.executor.statement.BaseStatementHandler;
import org.apache.ibatis.executor.statement.RoutingStatementHandler;
import org.apache.ibatis.executor.statement.StatementHandler;
import org.apache.ibatis.javassist.util.proxy.ProxyFactory;
import org.apache.ibatis.javassist.util.proxy.RuntimeSupport;
import org.apache.ibatis.logging.Log;
import org.apache.ibatis.logging.commons.JakartaCommonsLoggingImpl;
import org.apache.ibatis.logging.jdk14.Jdk14LoggingImpl;
import org.apache.ibatis.logging.log4j2.Log4j2Impl;
import org.apache.ibatis.logging.nologging.NoLoggingImpl;
import org.apache.ibatis.logging.slf4j.Slf4jImpl;
import org.apache.ibatis.logging.stdout.StdOutImpl;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.reflection.TypeParameterResolver;
import org.apache.ibatis.scripting.defaults.RawLanguageDriver;
import org.apache.ibatis.scripting.xmltags.XMLLanguageDriver;
import org.apache.ibatis.session.SqlSessionFactory;

import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.mapper.MapperFactoryBean;
import org.mybatis.spring.mapper.MapperScannerConfigurer;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.beans.PropertyValue;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.aot.BeanFactoryInitializationAotContribution;
import org.springframework.beans.factory.aot.BeanFactoryInitializationAotProcessor;
import org.springframework.beans.factory.aot.BeanRegistrationExcludeFilter;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.ConstructorArgumentValues;
import org.springframework.beans.factory.support.MergedBeanDefinitionPostProcessor;
import org.springframework.beans.factory.support.RegisteredBean;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.core.ResolvableType;
import org.springframework.util.ClassUtils;
import org.springframework.util.ReflectionUtils;

import com.baomidou.mybatisplus.annotation.IEnum;
import com.baomidou.mybatisplus.core.MybatisParameterHandler;
import com.baomidou.mybatisplus.core.MybatisXMLLanguageDriver;
import com.baomidou.mybatisplus.core.conditions.AbstractWrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.handlers.CompositeEnumTypeHandler;
import com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.core.toolkit.support.SerializedLambda;
import com.baomidou.mybatisplus.extension.handlers.FastjsonTypeHandler;
import com.baomidou.mybatisplus.extension.handlers.GsonTypeHandler;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;

/**
 * This configuration will move to mybatis-spring-native.
 */
@Configuration(proxyBeanMethods = false)
@ImportRuntimeHints(MyBatisNativeConfiguration.MyBaitsRuntimeHintsRegistrar.class)
public class MyBatisNativeConfiguration {

    @Bean
    static MyBatisMapperFactoryBeanPostProcessor myBatisMapperFactoryBeanPostProcessor() {
        return new MyBatisMapperFactoryBeanPostProcessor();
    }

    @Bean
    static MyBatisBeanFactoryInitializationAotProcessor myBatisBeanFactoryInitializationAotProcessor() {
        return new MyBatisBeanFactoryInitializationAotProcessor();
    }

    static class MyBaitsRuntimeHintsRegistrar implements RuntimeHintsRegistrar {

        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            Stream.of(RawLanguageDriver.class,
                    // TODO 增加了MybatisXMLLanguageDriver.class
                    XMLLanguageDriver.class, MybatisXMLLanguageDriver.class,
                    RuntimeSupport.class,
                    ProxyFactory.class,
                    Slf4jImpl.class,
                    Log.class,
                    JakartaCommonsLoggingImpl.class,
                    Log4j2Impl.class,
                    Jdk14LoggingImpl.class,
                    StdOutImpl.class,
                    NoLoggingImpl.class,
                    SqlSessionFactory.class,
                    PerpetualCache.class,
                    FifoCache.class,
                    LruCache.class,
                    SoftCache.class,
                    WeakCache.class,
                    //TODO 增加了MybatisSqlSessionFactoryBean.class
                    SqlSessionFactoryBean.class, MybatisSqlSessionFactoryBean.class,
                    ArrayList.class,
                    HashMap.class,
                    TreeSet.class,
                    HashSet.class
            ).forEach(x -> hints.reflection().registerType(x, MemberCategory.values()));
            Stream.of(
                    "org/apache/ibatis/builder/xml/*.dtd",
                    "org/apache/ibatis/builder/xml/*.xsd"
            ).forEach(hints.resources()::registerPattern);

            hints.serialization().registerType(SerializedLambda.class);
            hints.serialization().registerType(SFunction.class);
            hints.serialization().registerType(java.lang.invoke.SerializedLambda.class);
            hints.reflection().registerType(SFunction.class);
            hints.reflection().registerType(SerializedLambda.class);
            hints.reflection().registerType(java.lang.invoke.SerializedLambda.class);

            hints.proxies().registerJdkProxy(StatementHandler.class);
            hints.proxies().registerJdkProxy(Executor.class);
            hints.proxies().registerJdkProxy(ResultSetHandler.class);
            hints.proxies().registerJdkProxy(ParameterHandler.class);

//            hints.reflection().registerType(MybatisPlusInterceptor.class);
            hints.reflection().registerType(AbstractWrapper.class, MemberCategory.values());
            hints.reflection().registerType(LambdaQueryWrapper.class, MemberCategory.values());
            hints.reflection().registerType(LambdaUpdateWrapper.class, MemberCategory.values());
            hints.reflection().registerType(UpdateWrapper.class, MemberCategory.values());
            hints.reflection().registerType(QueryWrapper.class, MemberCategory.values());

            hints.reflection().registerType(BoundSql.class, MemberCategory.DECLARED_FIELDS);
            hints.reflection().registerType(RoutingStatementHandler.class, MemberCategory.DECLARED_FIELDS);
            hints.reflection().registerType(BaseStatementHandler.class, MemberCategory.DECLARED_FIELDS);
            hints.reflection().registerType(MybatisParameterHandler.class, MemberCategory.DECLARED_FIELDS);


            hints.reflection().registerType(IEnum.class, MemberCategory.INVOKE_PUBLIC_METHODS);
            // register typeHandler
            hints.reflection().registerType(CompositeEnumTypeHandler.class, MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS);
            hints.reflection().registerType(FastjsonTypeHandler.class, MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS);
            hints.reflection().registerType(GsonTypeHandler.class, MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS);
            hints.reflection().registerType(JacksonTypeHandler.class, MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS);
            hints.reflection().registerType(MybatisEnumTypeHandler.class, MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS);
        }
    }

    static class MyBatisBeanFactoryInitializationAotProcessor
            implements BeanFactoryInitializationAotProcessor, BeanRegistrationExcludeFilter {

        private final Set<Class<?>> excludeClasses = new HashSet<>();

        MyBatisBeanFactoryInitializationAotProcessor() {
            excludeClasses.add(MapperScannerConfigurer.class);
        }

        @Override
        public boolean isExcludedFromAotProcessing(RegisteredBean registeredBean) {
            return excludeClasses.contains(registeredBean.getBeanClass());
        }

        @Override
        public BeanFactoryInitializationAotContribution processAheadOfTime(ConfigurableListableBeanFactory beanFactory) {
            String[] beanNames = beanFactory.getBeanNamesForType(MapperFactoryBean.class);
            if (beanNames.length == 0) {
                return null;
            }
            return (context, code) -> {
                RuntimeHints hints = context.getRuntimeHints();
                for (String beanName : beanNames) {
                    BeanDefinition beanDefinition = beanFactory.getBeanDefinition(beanName.substring(1));
                    PropertyValue mapperInterface = beanDefinition.getPropertyValues().getPropertyValue("mapperInterface");
                    if (mapperInterface != null && mapperInterface.getValue() != null) {
                        Class<?> mapperInterfaceType = (Class<?>) mapperInterface.getValue();
                        if (mapperInterfaceType != null) {
                            registerReflectionTypeIfNecessary(mapperInterfaceType, hints);
                            hints.proxies().registerJdkProxy(mapperInterfaceType);
                            hints.resources()
                                    .registerPattern(mapperInterfaceType.getName().replace('.', '/').concat(".xml"));
                            registerMapperRelationships(mapperInterfaceType, hints);
                        }
                    }
                }
            };
        }

        private void registerMapperRelationships(Class<?> mapperInterfaceType, RuntimeHints hints) {
            Method[] methods = ReflectionUtils.getAllDeclaredMethods(mapperInterfaceType);
            for (Method method : methods) {
                if (method.getDeclaringClass() != Object.class) {
                    ReflectionUtils.makeAccessible(method);
                    registerSqlProviderTypes(method, hints, SelectProvider.class, SelectProvider::value, SelectProvider::type);
                    registerSqlProviderTypes(method, hints, InsertProvider.class, InsertProvider::value, InsertProvider::type);
                    registerSqlProviderTypes(method, hints, UpdateProvider.class, UpdateProvider::value, UpdateProvider::type);
                    registerSqlProviderTypes(method, hints, DeleteProvider.class, DeleteProvider::value, DeleteProvider::type);
                    Class<?> returnType = MyBatisMapperTypeUtils.resolveReturnClass(mapperInterfaceType, method);
                    registerReflectionTypeIfNecessary(returnType, hints);
                    MyBatisMapperTypeUtils.resolveParameterClasses(mapperInterfaceType, method)
                            .forEach(x -> registerReflectionTypeIfNecessary(x, hints));
                }
            }
        }

        @SafeVarargs
        private <T extends Annotation> void registerSqlProviderTypes(
                Method method, RuntimeHints hints, Class<T> annotationType, Function<T, Class<?>>... providerTypeResolvers) {
            for (T annotation : method.getAnnotationsByType(annotationType)) {
                for (Function<T, Class<?>> providerTypeResolver : providerTypeResolvers) {
                    registerReflectionTypeIfNecessary(providerTypeResolver.apply(annotation), hints);
                }
            }
        }

        private void registerReflectionTypeIfNecessary(Class<?> type, RuntimeHints hints) {
            if (!type.isPrimitive() && !type.getName().startsWith("java")) {
                hints.reflection().registerType(type, MemberCategory.values());
            }
        }

    }

    static class MyBatisMapperTypeUtils {
        private MyBatisMapperTypeUtils() {
            // NOP
        }

        static Class<?> resolveReturnClass(Class<?> mapperInterface, Method method) {
            Type resolvedReturnType = TypeParameterResolver.resolveReturnType(method, mapperInterface);
            return typeToClass(resolvedReturnType, method.getReturnType());
        }

        static Set<Class<?>> resolveParameterClasses(Class<?> mapperInterface, Method method) {
            return Stream.of(TypeParameterResolver.resolveParamTypes(method, mapperInterface))
                    .map(x -> typeToClass(x, x instanceof Class ? (Class<?>) x : Object.class)).collect(Collectors.toSet());
        }

        private static Class<?> typeToClass(Type src, Class<?> fallback) {
            Class<?> result = null;
            if (src instanceof Class<?>) {
                if (((Class<?>) src).isArray()) {
                    result = ((Class<?>) src).getComponentType();
                } else {
                    result = (Class<?>) src;
                }
            } else if (src instanceof ParameterizedType) {
                ParameterizedType parameterizedType = (ParameterizedType) src;
                int index = (parameterizedType.getRawType() instanceof Class
                        && Map.class.isAssignableFrom((Class<?>) parameterizedType.getRawType())
                        && parameterizedType.getActualTypeArguments().length > 1) ? 1 : 0;
                Type actualType = parameterizedType.getActualTypeArguments()[index];
                result = typeToClass(actualType, fallback);
            }
            if (result == null) {
                result = fallback;
            }
            return result;
        }

    }

    static class MyBatisMapperFactoryBeanPostProcessor implements MergedBeanDefinitionPostProcessor, BeanFactoryAware {

        private static final org.apache.commons.logging.Log LOG = LogFactory.getLog(
                MyBatisMapperFactoryBeanPostProcessor.class);

        private static final String MAPPER_FACTORY_BEAN = "org.mybatis.spring.mapper.MapperFactoryBean";

        private ConfigurableBeanFactory beanFactory;

        @Override
        public void setBeanFactory(BeanFactory beanFactory) {
            this.beanFactory = (ConfigurableBeanFactory) beanFactory;
        }

        @Override
        public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
            if (ClassUtils.isPresent(MAPPER_FACTORY_BEAN, this.beanFactory.getBeanClassLoader())) {
                resolveMapperFactoryBeanTypeIfNecessary(beanDefinition);
            }
        }

        private void resolveMapperFactoryBeanTypeIfNecessary(RootBeanDefinition beanDefinition) {
            if (!beanDefinition.hasBeanClass() || !MapperFactoryBean.class.isAssignableFrom(beanDefinition.getBeanClass())) {
                return;
            }
            if (beanDefinition.getResolvableType().hasUnresolvableGenerics()) {
                Class<?> mapperInterface = getMapperInterface(beanDefinition);
                if (mapperInterface != null) {
                    // Exposes a generic type information to context for prevent early initializing
                    ConstructorArgumentValues constructorArgumentValues = new ConstructorArgumentValues();
                    constructorArgumentValues.addGenericArgumentValue(mapperInterface);
                    beanDefinition.setConstructorArgumentValues(constructorArgumentValues);
                    beanDefinition.setTargetType(ResolvableType.forClassWithGenerics(beanDefinition.getBeanClass(), mapperInterface));
                }
            }
        }

        private Class<?> getMapperInterface(RootBeanDefinition beanDefinition) {
            try {
                return (Class<?>) beanDefinition.getPropertyValues().get("mapperInterface");
            } catch (Exception e) {
                LOG.debug("Fail getting mapper interface type.", e);
                return null;
            }
        }

    }

}

```

2. Lambda表达式注入到GraalVM中

```java
package com.light.sas.config.natives;

import java.util.ArrayList;
import java.util.List;

import org.graalvm.nativeimage.hosted.Feature;
import org.graalvm.nativeimage.hosted.RuntimeSerialization;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AssignableTypeFilter;
import org.springframework.core.type.filter.TypeFilter;
import org.springframework.util.ClassUtils;

import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.core.toolkit.support.SerializedLambda;
import com.baomidou.mybatisplus.extension.service.IService;
import com.light.sas.AuthApplication;

/**
 * lambda 表达式注入到graal中
 */
public class LambdaRegistrationFeature implements Feature {

    /**
     * 找到某个包下面指定的父类的所有子类
     *
     * @param packageName 包名
     * @param superClass  父类
     * @return 子类集合
     */
    public static List<Class<?>> findClasses(String packageName, Class<?> superClass) {
        ClassPathScanningCandidateComponentProvider scanner = new ClassPathScanningCandidateComponentProvider(false);
        TypeFilter filter = new AssignableTypeFilter(superClass);

        scanner.addIncludeFilter(filter);

        List<Class<?>> classes = new ArrayList<>();
        String basePackage = ClassUtils.convertClassNameToResourcePath(packageName);
        for (BeanDefinition candidate : scanner.findCandidateComponents(basePackage)) {
            try {
                Class<?> clazz = Class.forName(candidate.getBeanClassName());
                classes.add(clazz);
            } catch (ClassNotFoundException e) {
                // 处理异常
                throw new RuntimeException(e);
            }
        }

        return classes;
    }

    @Override
    public void duringSetup(DuringSetupAccess access) {
        // 扫描指定包下IService的字类（实现类），然后全部注册到graalvm Lambda 序列化中
        LambdaRegistrationFeature.findClasses("com.light.sas", IService.class)
                .forEach(RuntimeSerialization::registerLambdaCapturingClass);
        // 这里需要将lambda表达式所使用的成员类都注册上来,具体情况视项目情况而定,一般扫描@Controller和@Service的会多点.
        RuntimeSerialization.registerLambdaCapturingClass(AuthApplication.class);
        RuntimeSerialization.register(SerializedLambda.class, SFunction.class);
    }

}

```

3. Security资源文件 反射类配置

```java
package com.light.sas.config.natives;

import java.util.Arrays;
import java.util.concurrent.Callable;
import java.util.stream.Stream;

import org.springframework.aot.hint.BindingReflectionHintsRegistrar;
import org.springframework.aot.hint.ExecutableMode;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.ReflectionHints;
import org.springframework.aot.hint.ResourceHints;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.TypeReference;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;
import org.springframework.security.cas.jackson2.CasJackson2Module;
import org.springframework.security.jackson2.CoreJackson2Module;
import org.springframework.security.jackson2.SecurityJackson2Modules;
import org.springframework.security.jackson2.SimpleGrantedAuthorityMixin;
import org.springframework.security.ldap.jackson2.LdapJackson2Module;
import org.springframework.security.oauth2.client.jackson2.OAuth2ClientJackson2Module;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
import org.springframework.security.saml2.jackson2.Saml2Jackson2Module;
import org.springframework.security.web.jackson2.WebJackson2Module;
import org.springframework.security.web.jackson2.WebServletJackson2Module;
import org.springframework.security.web.server.jackson2.WebServerJackson2Module;
import org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod;
import org.thymeleaf.expression.Lists;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.light.sas.controller.AuthorizationController;

import static org.springframework.aot.hint.MemberCategory.DECLARED_FIELDS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_DECLARED_CONSTRUCTORS;
import static org.springframework.aot.hint.MemberCategory.INVOKE_DECLARED_METHODS;

/**
 * 认证服务 整合Spring Data Redis后自定义核心services保存客户端、认证、授权确认信息至Redis打包本机镜像配置类
 *
 * <a href="https://github.com/spring-projects/spring-authorization-server/issues/1380">AOT Configuration</a>
 * <a href="https://github.com/spring-projects/spring-authorization-server/issues/1314">AOT Configuration</a>
 */
@Configuration(proxyBeanMethods = false)
@ImportRuntimeHints(SecurityRegistrationConfig.SecurityJackson2ModulesRegistration.class)
public class SecurityRegistrationConfig {

    static class SecurityJackson2ModulesRegistration implements RuntimeHintsRegistrar {

        private final BindingReflectionHintsRegistrar bindingRegistrar = new BindingReflectionHintsRegistrar();

        /**
         * @see SecurityJackson2Modules#getModules(ClassLoader)
         */
        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            try {
                Stream.of(CoreJackson2Module.class,
                        CasJackson2Module.class,
                        WebJackson2Module.class,
                        WebServerJackson2Module.class,
                        WebServletJackson2Module.class,
                        OAuth2ClientJackson2Module.class,
                        JavaTimeModule.class,
                        LdapJackson2Module.class,
                        Saml2Jackson2Module.class
                ).forEach(x -> hints.reflection().registerType(x, MemberCategory.values()));

                // Thymeleaf
                hints.reflection().registerTypes(
                        Arrays.asList(
                                TypeReference.of(Lists.class),
                                TypeReference.of(AuthorizationGrantType.class),
                                TypeReference.of(AuthorizationController.ScopeWithDescription.class)
                        ), builder ->
                                builder.withMembers(MemberCategory.DECLARED_FIELDS,
                                        MemberCategory.INVOKE_DECLARED_CONSTRUCTORS, MemberCategory.INVOKE_DECLARED_METHODS)
                );

                ReflectionHints reflection = hints.reflection();
                reflection.registerMethod(Callable.class.getMethod("call"), ExecutableMode.INVOKE);
                reflection.registerType(Class.forName("org.springframework.web.servlet.handler.AbstractHandlerMethodMapping$EmptyHandler"), INVOKE_DECLARED_METHODS);
                reflection.registerType(ServletInvocableHandlerMethod.class, DECLARED_FIELDS, INVOKE_DECLARED_CONSTRUCTORS, INVOKE_DECLARED_METHODS);

                // Security Jackson Modules
                reflection.registerType(CoreJackson2Module.class, DECLARED_FIELDS, INVOKE_DECLARED_CONSTRUCTORS, INVOKE_DECLARED_METHODS);
                reflection.registerType(WebJackson2Module.class, DECLARED_FIELDS, INVOKE_DECLARED_CONSTRUCTORS, INVOKE_DECLARED_METHODS);
                reflection.registerType(WebServerJackson2Module.class, DECLARED_FIELDS, INVOKE_DECLARED_CONSTRUCTORS, INVOKE_DECLARED_METHODS);
                reflection.registerType(WebServletJackson2Module.class, DECLARED_FIELDS, INVOKE_DECLARED_CONSTRUCTORS, INVOKE_DECLARED_METHODS);
                reflection.registerType(OAuth2ClientJackson2Module.class, DECLARED_FIELDS, INVOKE_DECLARED_CONSTRUCTORS, INVOKE_DECLARED_METHODS);

                // 核心service使用反射的类
                bindingRegistrar.registerReflectionHints(reflection, OAuth2TokenFormat.class);
                bindingRegistrar.registerReflectionHints(reflection, OAuth2AuthorizationRequest.class);
                bindingRegistrar.registerReflectionHints(reflection, SimpleGrantedAuthorityMixin.class);

                // Jackson Mixins registration
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.jackson2.SimpleGrantedAuthorityMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.jackson2.UnmodifiableListDeserializer"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.jackson2.UnmodifiableMapDeserializer"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.jackson2.UnmodifiableSetDeserializer"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.jackson2.UsernamePasswordAuthenticationTokenMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.jackson2.UsernamePasswordAuthenticationTokenDeserializer"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.web.jackson2.WebAuthenticationDetailsMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.ClientRegistrationMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.DefaultOAuth2UserMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.DefaultOidcUserMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OAuth2AccessTokenMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OAuth2AuthenticationExceptionMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OAuth2AuthenticationTokenMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OAuth2AuthorizedClientMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OAuth2AuthorizationRequestMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OAuth2ErrorMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OAuth2RefreshTokenMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OAuth2UserAuthorityMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OidcIdTokenMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OidcUserAuthorityMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.client.jackson2.OidcUserInfoMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.server.authorization.jackson2.OAuth2AuthorizationRequestDeserializer"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.server.authorization.jackson2.OAuth2TokenFormatMixin"));
                bindingRegistrar.registerReflectionHints(reflection, Class.forName("org.springframework.security.oauth2.server.authorization.jackson2.UnmodifiableMapDeserializer"));

                // Resources hints
                ResourceHints resources = hints.resources();
                resources.registerPattern("org/springframework/security/oauth2/server/authorization/oauth2-authorization-schema.sql");
                resources.registerPattern("org/springframework/security/oauth2/server/authorization/oauth2-authorization-consent-schema.sql");
                resources.registerPattern("org/springframework/security/oauth2/server/authorization/client/oauth2-registered-client-schema.sql");
            } catch (ClassNotFoundException | NoSuchMethodException e) {
                throw new RuntimeException(e);
            }
        }
    }

}

```

4. SAML2资源文件 反射类配置

```java
package com.light.sas.config.natives;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.aot.hint.TypeReference;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;

/**
 * SAML2 适配Native配置文件
 * <a href="https://github.com/spring-projects/spring-security/issues/11984">Saml2 Native Demo</a>
 */
@Configuration(proxyBeanMethods = false)
@ImportRuntimeHints(Saml2RegistrationConfig.Saml2HintsRegistrar.class)
public class Saml2RegistrationConfig {

    static class Saml2HintsRegistrar implements RuntimeHintsRegistrar {

        /**
         * @param hints       the hints contributed so far for the deployment unit
         * @param classLoader the classloader, or {@code null} if even the system ClassLoader isn't accessible
         * @see org.springframework.security.aot.hint.CoreSecurityRuntimeHints
         */
        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            // 1. 注册本地的 SAML2 证书文件
            hints.resources()
                    .registerPattern("credentials/rp-certificate.crt")
                    .registerPattern("credentials/rp-private.key")
                    .registerPattern("credentials/keycloak/keycloak.crt")
                    .registerPattern("credentials/keycloak/keystore.jks");

            // 2. 注册 Locale 国际化语言配置
            hints.resources()
                    // 注意需要在resource-config.json中配置locale为en，默认的en_US找不到
                    .registerResourceBundle("org.apache.xml.security.resource.xmlsecurity")
                    .registerResourceBundle("org/apache/xml/security/resource/xmlsecurity");

            // 3. 注册 OpenSAML 配置文件
            OPENSAML_CORE_RESOURCES.forEach(hints.resources()::registerPattern);
            OPENSAML_SAML_RESOURCES.forEach(hints.resources()::registerPattern);
            OPENSAML_SOAP_RESOURCES.forEach(hints.resources()::registerPattern);
            OPENSAML_XMLSEC_RESOURCES.forEach(hints.resources()::registerPattern);

            // 4. 注册 OpenSAML 反射类
            List<TypeReference> coreTypes = OPENSAML_CORE_CLASSES.stream().map(TypeReference::of).collect(Collectors.toList());
            hints.reflection()
                    .registerTypes(coreTypes, builder -> builder.withMembers(MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS));

            List<TypeReference> samlTypes = OPENSAML_SAML_CLASSES.stream().map(TypeReference::of).collect(Collectors.toList());
            hints.reflection()
                    .registerTypes(samlTypes, builder -> builder.withMembers(MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS));

            List<TypeReference> soapTypes = OPENSAML_SOAP_CLASSES.stream().map(TypeReference::of).collect(Collectors.toList());
            hints.reflection()
                    .registerTypes(soapTypes, builder -> builder.withMembers(MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS));

            List<TypeReference> xmlsecTypes = OPENSAML_XMLSEC_CLASSES.stream().map(TypeReference::of).collect(Collectors.toList());
            hints.reflection()
                    .registerTypes(xmlsecTypes, builder -> builder.withMembers(MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS));

        }

    }

    // region source files
    public static final List<String> OPENSAML_CORE_RESOURCES = List.of(
            "default-config.xml",
            "schema-config.xml"
    );

    public static final List<String> OPENSAML_SAML_RESOURCES = List.of(
            "saml1-assertion-config.xml",
            "saml1-metadata-config.xml",
            "saml1-protocol-config.xml",
            "saml2-assertion-config.xml",
            "saml2-assertion-delegation-restriction-config.xml",
            "saml2-ecp-config.xml",
            "saml2-metadata-algorithm-config.xml",
            "saml2-metadata-attr-config.xml",
            "saml2-metadata-config.xml",
            "saml2-metadata-idp-discovery-config.xml",
            "saml2-metadata-query-config.xml",
            "saml2-metadata-reqinit-config.xml",
            "saml2-metadata-ui-config.xml",
            "saml2-metadata-rpi-config.xml",
            "saml2-protocol-config.xml",
            "saml2-protocol-thirdparty-config.xml",
            "saml2-req-attr-config.xml",
            "saml2-protocol-aslo-config.xml",
            "saml2-channel-binding-config.xml",
            "saml-ec-gss-config.xml"
    );

    public static final List<String> OPENSAML_SOAP_RESOURCES = List.of(
            "soap11-config.xml",
            "wsaddressing-config.xml",
            "wsfed11-protocol-config.xml",
            "wspolicy-config.xml",
            "wssecurity-config.xml",
            "wstrust-config.xml"
    );
    public static final List<String> OPENSAML_XMLSEC_RESOURCES = List.of(
            "signature-config.xml",
            "encryption-config.xml"
    );


    // endregion

    // region reflection class

    public static final List<String> OPENSAML_CORE_CLASSES = List.of(
            "com.sun.org.apache.xerces.internal.impl.dv.xs.SchemaDVFactoryImpl",
            "org.apache.xml.security.algorithms.implementations.SignatureBaseRSA$SignatureRSASHA256",
            "org.apache.xml.security.transforms.implementations.TransformC14NExclusive",
            "org.apache.xml.security.transforms.implementations.TransformEnvelopedSignature",
            "org.opensaml.security.criteria.UsageCriterion",
            "org.opensaml.security.criteria.KeyLengthCriterion",
            "org.opensaml.security.criteria.KeyNameCriterion",
            "org.opensaml.security.criteria.KeyAlgorithmCriterion",
            "org.opensaml.core.criterion.EntityIdCriterion",
            "org.opensaml.security.x509.X509SubjectKeyIdentifierCriterion",
            "org.opensaml.security.x509.X509DigestCriterion",
            "org.opensaml.security.x509.X509SubjectNameCriterion",
            "org.opensaml.security.criteria.PublicKeyCriterion",
            "org.opensaml.security.x509.X509IssuerSerialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluableUsageCredentialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluableKeyLengthCredentialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluableKeyNameCredentialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluableKeyAlgorithmCredentialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluableEntityIDCredentialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluableX509SubjectKeyIdentifierCredentialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluableX509DigestCredentialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluableX509SubjectNameCredentialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluablePublicKeyCredentialCriterion",
            "org.opensaml.security.credential.criteria.impl.EvaluableX509IssuerSerialCredentialCriterion",
            "org.opensaml.core.xml.schema.impl.XSAnyBuilder",
            "org.opensaml.core.xml.schema.impl.XSAnyMarshaller",
            "org.opensaml.core.xml.schema.impl.XSAnyUnmarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.core.xml.schema.impl.XSBooleanBuilder",
            "org.opensaml.core.xml.schema.impl.XSBooleanMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBooleanUnmarshaller",
            "org.opensaml.core.xml.schema.impl.XSDateTimeBuilder",
            "org.opensaml.core.xml.schema.impl.XSDateTimeMarshaller",
            "org.opensaml.core.xml.schema.impl.XSDateTimeUnmarshaller",
            "org.opensaml.core.xml.schema.impl.XSIntegerBuilder",
            "org.opensaml.core.xml.schema.impl.XSIntegerMarshaller",
            "org.opensaml.core.xml.schema.impl.XSIntegerUnmarshaller",
            "org.opensaml.core.xml.schema.impl.XSQNameBuilder",
            "org.opensaml.core.xml.schema.impl.XSQNameMarshaller",
            "org.opensaml.core.xml.schema.impl.XSQNameUnmarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller"
    );

    public static final List<String> OPENSAML_SAML_CLASSES = List.of(
            "org.opensaml.saml.ext.idpdisco.impl.DiscoveryResponseBuilder",
            "org.opensaml.saml.saml2.metadata.impl.IndexedEndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.IndexedEndpointUnmarshaller",
            "org.opensaml.saml.ext.reqattr.impl.RequestedAttributesBuilder",
            "org.opensaml.saml.ext.reqattr.impl.RequestedAttributesMarshaller",
            "org.opensaml.saml.ext.reqattr.impl.RequestedAttributesUnmarshaller",
            "org.opensaml.saml.ext.saml1md.impl.SourceIDBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.ext.saml2alg.impl.DigestMethodBuilder",
            "org.opensaml.saml.ext.saml2alg.impl.DigestMethodMarshaller",
            "org.opensaml.saml.ext.saml2alg.impl.DigestMethodUnmarshaller",
            "org.opensaml.saml.ext.saml2alg.impl.SigningMethodBuilder",
            "org.opensaml.saml.ext.saml2alg.impl.SigningMethodMarshaller",
            "org.opensaml.saml.ext.saml2alg.impl.SigningMethodUnmarshaller",
            "org.opensaml.saml.ext.saml2aslo.impl.AsynchronousBuilder",
            "org.opensaml.saml.ext.saml2aslo.impl.AsynchronousMarshaller",
            "org.opensaml.saml.ext.saml2aslo.impl.AsynchronousUnmarshaller",
            "org.opensaml.saml.ext.saml2cb.impl.ChannelBindingsBuilder",
            "org.opensaml.saml.ext.saml2cb.impl.ChannelBindingsMarshaller",
            "org.opensaml.saml.ext.saml2cb.impl.ChannelBindingsUnmarshaller",
            "org.opensaml.saml.ext.saml2delrestrict.impl.DelegateBuilder",
            "org.opensaml.saml.ext.saml2delrestrict.impl.DelegateMarshaller",
            "org.opensaml.saml.ext.saml2delrestrict.impl.DelegateUnmarshaller",
            "org.opensaml.saml.ext.saml2delrestrict.impl.DelegationRestrictionTypeBuilder",
            "org.opensaml.saml.ext.saml2delrestrict.impl.DelegationRestrictionTypeMarshaller",
            "org.opensaml.saml.ext.saml2delrestrict.impl.DelegationRestrictionTypeUnmarshaller",
            "org.opensaml.saml.ext.saml2mdattr.impl.EntityAttributesBuilder",
            "org.opensaml.saml.ext.saml2mdattr.impl.EntityAttributesMarshaller",
            "org.opensaml.saml.ext.saml2mdattr.impl.EntityAttributesUnmarshaller",
            "org.opensaml.saml.ext.saml2mdquery.impl.ActionNamespaceBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.ext.saml2mdquery.impl.AttributeQueryDescriptorTypeBuilder",
            "org.opensaml.saml.ext.saml2mdquery.impl.AttributeQueryDescriptorTypeMarshaller",
            "org.opensaml.saml.ext.saml2mdquery.impl.AttributeQueryDescriptorTypeUnmarshaller",
            "org.opensaml.saml.ext.saml2mdquery.impl.AuthnQueryDescriptorTypeBuilder",
            "org.opensaml.saml.ext.saml2mdquery.impl.AuthnQueryDescriptorTypeMarshaller",
            "org.opensaml.saml.ext.saml2mdquery.impl.AuthnQueryDescriptorTypeUnmarshaller",
            "org.opensaml.saml.ext.saml2mdquery.impl.AuthzDecisionQueryDescriptorTypeBuilder",
            "org.opensaml.saml.ext.saml2mdquery.impl.AuthzDecisionQueryDescriptorTypeMarshaller",
            "org.opensaml.saml.ext.saml2mdquery.impl.AuthzDecisionQueryDescriptorTypeUnmarshaller",
            "org.opensaml.saml.ext.saml2mdreqinit.impl.RequestInitiatorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EndpointUnmarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.PublicationBuilder",
            "org.opensaml.saml.ext.saml2mdrpi.impl.PublicationMarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.PublicationUnmarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.PublicationInfoBuilder",
            "org.opensaml.saml.ext.saml2mdrpi.impl.PublicationInfoMarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.PublicationInfoUnmarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.PublicationPathBuilder",
            "org.opensaml.saml.ext.saml2mdrpi.impl.PublicationPathMarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.PublicationPathUnmarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.RegistrationInfoBuilder",
            "org.opensaml.saml.ext.saml2mdrpi.impl.RegistrationInfoMarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.RegistrationInfoUnmarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.RegistrationPolicyBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIUnmarshaller",
            "org.opensaml.saml.ext.saml2mdrpi.impl.UsagePolicyBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.DescriptionBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.DiscoHintsBuilder",
            "org.opensaml.saml.ext.saml2mdui.impl.DiscoHintsMarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.DiscoHintsUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.DisplayNameBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.DomainHintBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.GeolocationHintBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.IPHintBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.InformationURLBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.KeywordsBuilder",
            "org.opensaml.saml.ext.saml2mdui.impl.KeywordsMarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.KeywordsUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.LogoBuilder",
            "org.opensaml.saml.ext.saml2mdui.impl.LogoMarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.LogoUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.PrivacyStatementURLBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIUnmarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.UIInfoBuilder",
            "org.opensaml.saml.ext.saml2mdui.impl.UIInfoMarshaller",
            "org.opensaml.saml.ext.saml2mdui.impl.UIInfoUnmarshaller",
            "org.opensaml.saml.ext.samlec.impl.EncTypeBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.ext.samlec.impl.GeneratedKeyBuilder",
            "org.opensaml.saml.ext.samlec.impl.GeneratedKeyMarshaller",
            "org.opensaml.saml.ext.samlec.impl.GeneratedKeyUnmarshaller",
            "org.opensaml.saml.ext.samlec.impl.SessionKeyBuilder",
            "org.opensaml.saml.ext.samlec.impl.SessionKeyMarshaller",
            "org.opensaml.saml.ext.samlec.impl.SessionKeyUnmarshaller",
            "org.opensaml.saml.ext.samlpthrpty.impl.RespondToBuilder",
            "org.opensaml.saml.saml2.core.impl.NameIDTypeMarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDTypeUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.ActionBuilder",
            "org.opensaml.saml.saml1.core.impl.ActionMarshaller",
            "org.opensaml.saml.saml1.core.impl.ActionUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AdviceBuilder",
            "org.opensaml.saml.saml1.core.impl.AdviceMarshaller",
            "org.opensaml.saml.saml1.core.impl.AdviceUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AssertionArtifactBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AssertionBuilder",
            "org.opensaml.saml.saml1.core.impl.AssertionMarshaller",
            "org.opensaml.saml.saml1.core.impl.AssertionUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AssertionIDReferenceBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AttributeBuilder",
            "org.opensaml.saml.saml1.core.impl.AttributeMarshaller",
            "org.opensaml.saml.saml1.core.impl.AttributeUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AttributeDesignatorBuilder",
            "org.opensaml.saml.saml1.core.impl.AttributeDesignatorMarshaller",
            "org.opensaml.saml.saml1.core.impl.AttributeDesignatorUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AttributeQueryBuilder",
            "org.opensaml.saml.saml1.core.impl.AttributeQueryMarshaller",
            "org.opensaml.saml.saml1.core.impl.AttributeQueryUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AttributeStatementBuilder",
            "org.opensaml.saml.saml1.core.impl.AttributeStatementMarshaller",
            "org.opensaml.saml.saml1.core.impl.AttributeStatementUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AttributeValueBuilder",
            "org.opensaml.core.xml.schema.impl.XSAnyMarshaller",
            "org.opensaml.core.xml.schema.impl.XSAnyUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AudienceBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AudienceRestrictionConditionBuilder",
            "org.opensaml.saml.saml1.core.impl.AudienceRestrictionConditionMarshaller",
            "org.opensaml.saml.saml1.core.impl.AudienceRestrictionConditionUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthenticationQueryBuilder",
            "org.opensaml.saml.saml1.core.impl.AuthenticationQueryMarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthenticationQueryUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthenticationStatementBuilder",
            "org.opensaml.saml.saml1.core.impl.AuthenticationStatementMarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthenticationStatementUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthorityBindingBuilder",
            "org.opensaml.saml.saml1.core.impl.AuthorityBindingMarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthorityBindingUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthorizationDecisionQueryBuilder",
            "org.opensaml.saml.saml1.core.impl.AuthorizationDecisionQueryMarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthorizationDecisionQueryUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthorizationDecisionStatementBuilder",
            "org.opensaml.saml.saml1.core.impl.AuthorizationDecisionStatementMarshaller",
            "org.opensaml.saml.saml1.core.impl.AuthorizationDecisionStatementUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.ConditionsBuilder",
            "org.opensaml.saml.saml1.core.impl.ConditionsMarshaller",
            "org.opensaml.saml.saml1.core.impl.ConditionsUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.ConfirmationMethodBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.DoNotCacheConditionBuilder",
            "org.opensaml.saml.saml1.core.impl.DoNotCacheConditionMarshaller",
            "org.opensaml.saml.saml1.core.impl.DoNotCacheConditionUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.EvidenceBuilder",
            "org.opensaml.saml.saml1.core.impl.EvidenceMarshaller",
            "org.opensaml.saml.saml1.core.impl.EvidenceUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.NameIdentifierBuilder",
            "org.opensaml.saml.saml1.core.impl.NameIdentifierMarshaller",
            "org.opensaml.saml.saml1.core.impl.NameIdentifierUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.RequestBuilder",
            "org.opensaml.saml.saml1.core.impl.RequestMarshaller",
            "org.opensaml.saml.saml1.core.impl.RequestUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.RespondWithBuilder",
            "org.opensaml.core.xml.schema.impl.XSQNameMarshaller",
            "org.opensaml.core.xml.schema.impl.XSQNameUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.ResponseBuilder",
            "org.opensaml.saml.saml1.core.impl.ResponseMarshaller",
            "org.opensaml.saml.saml1.core.impl.ResponseUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.StatusBuilder",
            "org.opensaml.saml.saml1.core.impl.StatusMarshaller",
            "org.opensaml.saml.saml1.core.impl.StatusUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.StatusCodeBuilder",
            "org.opensaml.saml.saml1.core.impl.StatusCodeMarshaller",
            "org.opensaml.saml.saml1.core.impl.StatusCodeUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.StatusMessageBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.SubjectBuilder",
            "org.opensaml.saml.saml1.core.impl.SubjectMarshaller",
            "org.opensaml.saml.saml1.core.impl.SubjectUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.SubjectConfirmationBuilder",
            "org.opensaml.saml.saml1.core.impl.SubjectConfirmationMarshaller",
            "org.opensaml.saml.saml1.core.impl.SubjectConfirmationUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.SubjectConfirmationDataBuilder",
            "org.opensaml.core.xml.schema.impl.XSAnyMarshaller",
            "org.opensaml.core.xml.schema.impl.XSAnyUnmarshaller",
            "org.opensaml.saml.saml1.core.impl.SubjectLocalityBuilder",
            "org.opensaml.saml.saml1.core.impl.SubjectLocalityMarshaller",
            "org.opensaml.saml.saml1.core.impl.SubjectLocalityUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ActionBuilder",
            "org.opensaml.saml.saml2.core.impl.ActionMarshaller",
            "org.opensaml.saml.saml2.core.impl.ActionUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AdviceBuilder",
            "org.opensaml.saml.saml2.core.impl.AdviceMarshaller",
            "org.opensaml.saml.saml2.core.impl.AdviceUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ArtifactBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ArtifactResolveBuilder",
            "org.opensaml.saml.saml2.core.impl.ArtifactResolveMarshaller",
            "org.opensaml.saml.saml2.core.impl.ArtifactResolveUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ArtifactResponseBuilder",
            "org.opensaml.saml.saml2.core.impl.ArtifactResponseMarshaller",
            "org.opensaml.saml.saml2.core.impl.ArtifactResponseUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AssertionBuilder",
            "org.opensaml.saml.saml2.core.impl.AssertionMarshaller",
            "org.opensaml.saml.saml2.core.impl.AssertionUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AssertionIDRefBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AssertionIDRequestBuilder",
            "org.opensaml.saml.saml2.core.impl.AssertionIDRequestMarshaller",
            "org.opensaml.saml.saml2.core.impl.AssertionIDRequestUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AssertionURIRefBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AttributeBuilder",
            "org.opensaml.saml.saml2.core.impl.AttributeMarshaller",
            "org.opensaml.saml.saml2.core.impl.AttributeUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AttributeQueryBuilder",
            "org.opensaml.saml.saml2.core.impl.AttributeQueryMarshaller",
            "org.opensaml.saml.saml2.core.impl.AttributeQueryUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AttributeStatementBuilder",
            "org.opensaml.saml.saml2.core.impl.AttributeStatementMarshaller",
            "org.opensaml.saml.saml2.core.impl.AttributeStatementUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AttributeValueBuilder",
            "org.opensaml.core.xml.schema.impl.XSAnyMarshaller",
            "org.opensaml.core.xml.schema.impl.XSAnyUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AudienceBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AudienceRestrictionBuilder",
            "org.opensaml.saml.saml2.core.impl.AudienceRestrictionMarshaller",
            "org.opensaml.saml.saml2.core.impl.AudienceRestrictionUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthenticatingAuthorityBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnContextBuilder",
            "org.opensaml.saml.saml2.core.impl.AuthnContextMarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnContextUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnContextClassRefBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnContextDeclBuilder",
            "org.opensaml.core.xml.schema.impl.XSAnyMarshaller",
            "org.opensaml.core.xml.schema.impl.XSAnyUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnContextDeclRefBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnQueryBuilder",
            "org.opensaml.saml.saml2.core.impl.AuthnQueryMarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnQueryUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnRequestBuilder",
            "org.opensaml.saml.saml2.core.impl.AuthnRequestMarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnRequestUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnStatementBuilder",
            "org.opensaml.saml.saml2.core.impl.AuthnStatementMarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthnStatementUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthzDecisionQueryBuilder",
            "org.opensaml.saml.saml2.core.impl.AuthzDecisionQueryMarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthzDecisionQueryUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthzDecisionStatementBuilder",
            "org.opensaml.saml.saml2.core.impl.AuthzDecisionStatementMarshaller",
            "org.opensaml.saml.saml2.core.impl.AuthzDecisionStatementUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ConditionsBuilder",
            "org.opensaml.saml.saml2.core.impl.ConditionsMarshaller",
            "org.opensaml.saml.saml2.core.impl.ConditionsUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.EncryptedAssertionBuilder",
            "org.opensaml.saml.saml2.core.impl.EncryptedAssertionMarshaller",
            "org.opensaml.saml.saml2.core.impl.EncryptedAssertionUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.EncryptedAttributeBuilder",
            "org.opensaml.saml.saml2.core.impl.EncryptedAttributeMarshaller",
            "org.opensaml.saml.saml2.core.impl.EncryptedAttributeUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.EncryptedIDBuilder",
            "org.opensaml.saml.saml2.core.impl.EncryptedIDMarshaller",
            "org.opensaml.saml.saml2.core.impl.EncryptedIDUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.EvidenceBuilder",
            "org.opensaml.saml.saml2.core.impl.EvidenceMarshaller",
            "org.opensaml.saml.saml2.core.impl.EvidenceUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ExtensionsBuilder",
            "org.opensaml.saml.saml2.core.impl.ExtensionsMarshaller",
            "org.opensaml.saml.saml2.core.impl.ExtensionsUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.GetCompleteBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.IDPEntryBuilder",
            "org.opensaml.saml.saml2.core.impl.IDPEntryMarshaller",
            "org.opensaml.saml.saml2.core.impl.IDPEntryUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.IDPListBuilder",
            "org.opensaml.saml.saml2.core.impl.IDPListMarshaller",
            "org.opensaml.saml.saml2.core.impl.IDPListUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.IssuerBuilder",
            "org.opensaml.saml.saml2.core.impl.NameIDTypeMarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDTypeUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.KeyInfoConfirmationDataTypeBuilder",
            "org.opensaml.saml.saml2.core.impl.SubjectConfirmationDataMarshaller",
            "org.opensaml.saml.saml2.core.impl.SubjectConfirmationDataUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.LogoutRequestBuilder",
            "org.opensaml.saml.saml2.core.impl.LogoutRequestMarshaller",
            "org.opensaml.saml.saml2.core.impl.LogoutRequestUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.LogoutResponseBuilder",
            "org.opensaml.saml.saml2.core.impl.LogoutResponseMarshaller",
            "org.opensaml.saml.saml2.core.impl.LogoutResponseUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ManageNameIDRequestBuilder",
            "org.opensaml.saml.saml2.core.impl.ManageNameIDRequestMarshaller",
            "org.opensaml.saml.saml2.core.impl.ManageNameIDRequestUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ManageNameIDResponseBuilder",
            "org.opensaml.saml.saml2.core.impl.ManageNameIDResponseMarshaller",
            "org.opensaml.saml.saml2.core.impl.ManageNameIDResponseUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDBuilder",
            "org.opensaml.saml.saml2.core.impl.NameIDTypeMarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDTypeUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDMappingRequestBuilder",
            "org.opensaml.saml.saml2.core.impl.NameIDMappingRequestMarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDMappingRequestUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDMappingResponseBuilder",
            "org.opensaml.saml.saml2.core.impl.NameIDMappingResponseMarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDMappingResponseUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDPolicyBuilder",
            "org.opensaml.saml.saml2.core.impl.NameIDPolicyMarshaller",
            "org.opensaml.saml.saml2.core.impl.NameIDPolicyUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.NewEncryptedIDBuilder",
            "org.opensaml.saml.saml2.core.impl.NewEncryptedIDMarshaller",
            "org.opensaml.saml.saml2.core.impl.NewEncryptedIDUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.NewIDBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.OneTimeUseBuilder",
            "org.opensaml.saml.saml2.core.impl.OneTimeUseMarshaller",
            "org.opensaml.saml.saml2.core.impl.OneTimeUseUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ProxyRestrictionBuilder",
            "org.opensaml.saml.saml2.core.impl.ProxyRestrictionMarshaller",
            "org.opensaml.saml.saml2.core.impl.ProxyRestrictionUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.RequestedAuthnContextBuilder",
            "org.opensaml.saml.saml2.core.impl.RequestedAuthnContextMarshaller",
            "org.opensaml.saml.saml2.core.impl.RequestedAuthnContextUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.RequesterIDBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ResponseBuilder",
            "org.opensaml.saml.saml2.core.impl.ResponseMarshaller",
            "org.opensaml.saml.saml2.core.impl.ResponseUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.ScopingBuilder",
            "org.opensaml.saml.saml2.core.impl.ScopingMarshaller",
            "org.opensaml.saml.saml2.core.impl.ScopingUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.SessionIndexBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.StatusBuilder",
            "org.opensaml.saml.saml2.core.impl.StatusMarshaller",
            "org.opensaml.saml.saml2.core.impl.StatusUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.StatusCodeBuilder",
            "org.opensaml.saml.saml2.core.impl.StatusCodeMarshaller",
            "org.opensaml.saml.saml2.core.impl.StatusCodeUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.StatusDetailBuilder",
            "org.opensaml.saml.saml2.core.impl.StatusDetailMarshaller",
            "org.opensaml.saml.saml2.core.impl.StatusDetailUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.StatusMessageBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.SubjectBuilder",
            "org.opensaml.saml.saml2.core.impl.SubjectMarshaller",
            "org.opensaml.saml.saml2.core.impl.SubjectUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.SubjectConfirmationBuilder",
            "org.opensaml.saml.saml2.core.impl.SubjectConfirmationMarshaller",
            "org.opensaml.saml.saml2.core.impl.SubjectConfirmationUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.SubjectConfirmationDataBuilder",
            "org.opensaml.saml.saml2.core.impl.SubjectConfirmationDataMarshaller",
            "org.opensaml.saml.saml2.core.impl.SubjectConfirmationDataUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.SubjectLocalityBuilder",
            "org.opensaml.saml.saml2.core.impl.SubjectLocalityMarshaller",
            "org.opensaml.saml.saml2.core.impl.SubjectLocalityUnmarshaller",
            "org.opensaml.saml.saml2.core.impl.TerminateBuilder",
            "org.opensaml.saml.saml2.core.impl.TerminateMarshaller",
            "org.opensaml.saml.saml2.core.impl.TerminateUnmarshaller",
            "org.opensaml.saml.saml2.ecp.impl.RelayStateBuilder",
            "org.opensaml.saml.saml2.ecp.impl.RelayStateMarshaller",
            "org.opensaml.saml.saml2.ecp.impl.RelayStateUnmarshaller",
            "org.opensaml.saml.saml2.ecp.impl.RequestAuthenticatedBuilder",
            "org.opensaml.saml.saml2.ecp.impl.RequestAuthenticatedMarshaller",
            "org.opensaml.saml.saml2.ecp.impl.RequestAuthenticatedUnmarshaller",
            "org.opensaml.saml.saml2.ecp.impl.RequestBuilder",
            "org.opensaml.saml.saml2.ecp.impl.RequestMarshaller",
            "org.opensaml.saml.saml2.ecp.impl.RequestUnmarshaller",
            "org.opensaml.saml.saml2.ecp.impl.ResponseBuilder",
            "org.opensaml.saml.saml2.ecp.impl.ResponseMarshaller",
            "org.opensaml.saml.saml2.ecp.impl.ResponseUnmarshaller",
            "org.opensaml.saml.saml2.ecp.impl.SubjectConfirmationBuilder",
            "org.opensaml.saml.saml2.ecp.impl.SubjectConfirmationMarshaller",
            "org.opensaml.saml.saml2.ecp.impl.SubjectConfirmationUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AdditionalMetadataLocationBuilder",
            "org.opensaml.saml.saml2.metadata.impl.AdditionalMetadataLocationMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AdditionalMetadataLocationUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AffiliateMemberBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AffiliationDescriptorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.AffiliationDescriptorMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AffiliationDescriptorUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.ArtifactResolutionServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.IndexedEndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.IndexedEndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AssertionConsumerServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.IndexedEndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.IndexedEndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AssertionIDRequestServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AttributeAuthorityDescriptorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.AttributeAuthorityDescriptorMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AttributeAuthorityDescriptorUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AttributeConsumingServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.AttributeConsumingServiceMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AttributeConsumingServiceUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AttributeProfileBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AttributeServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AuthnAuthorityDescriptorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.AuthnAuthorityDescriptorMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AuthnAuthorityDescriptorUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AuthnQueryServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.AuthzServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.CompanyBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.ContactPersonBuilder",
            "org.opensaml.saml.saml2.metadata.impl.ContactPersonMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.ContactPersonUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EmailAddressBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EncryptionMethodBuilder",
            "org.opensaml.xmlsec.encryption.impl.EncryptionMethodMarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptionMethodUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EntitiesDescriptorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EntitiesDescriptorMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EntitiesDescriptorUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EntityDescriptorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EntityDescriptorMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EntityDescriptorUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.ExtensionsBuilder",
            "org.opensaml.saml.saml2.metadata.impl.ExtensionsMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.ExtensionsUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.GivenNameBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.IDPSSODescriptorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.IDPSSODescriptorMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.IDPSSODescriptorUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.KeyDescriptorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.KeyDescriptorMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.KeyDescriptorUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.ManageNameIDServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.NameIDFormatBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.NameIDMappingServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.OrganizationBuilder",
            "org.opensaml.saml.saml2.metadata.impl.OrganizationMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.OrganizationUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.OrganizationDisplayNameBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.OrganizationNameBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.OrganizationURLBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedURIUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.PDPDescriptorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.PDPDescriptorMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.PDPDescriptorUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.RequestedAttributeBuilder",
            "org.opensaml.saml.saml2.metadata.impl.RequestedAttributeMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.RequestedAttributeUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.SPSSODescriptorBuilder",
            "org.opensaml.saml.saml2.metadata.impl.SPSSODescriptorMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.SPSSODescriptorUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.ServiceDescriptionBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.ServiceNameBuilder",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.LocalizedNameUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.SingleLogoutServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.SingleSignOnServiceBuilder",
            "org.opensaml.saml.saml2.metadata.impl.EndpointMarshaller",
            "org.opensaml.saml.saml2.metadata.impl.EndpointUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.SurNameBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.saml.saml2.metadata.impl.TelephoneNumberBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller"
    );
    public static final List<String> OPENSAML_SOAP_CLASSES = List.of(
            "org.opensaml.soap.soap11.impl.BodyBuilder",
            "org.opensaml.soap.soap11.impl.BodyMarshaller",
            "org.opensaml.soap.soap11.impl.BodyUnmarshaller",
            "org.opensaml.soap.soap11.impl.DetailBuilder",
            "org.opensaml.soap.soap11.impl.DetailMarshaller",
            "org.opensaml.soap.soap11.impl.DetailUnmarshaller",
            "org.opensaml.soap.soap11.impl.EnvelopeBuilder",
            "org.opensaml.soap.soap11.impl.EnvelopeMarshaller",
            "org.opensaml.soap.soap11.impl.EnvelopeUnmarshaller",
            "org.opensaml.soap.soap11.impl.FaultActorBuilder",
            "org.opensaml.core.xml.schema.impl.XSURIMarshaller",
            "org.opensaml.core.xml.schema.impl.XSURIUnmarshaller",
            "org.opensaml.soap.soap11.impl.FaultBuilder",
            "org.opensaml.soap.soap11.impl.FaultMarshaller",
            "org.opensaml.soap.soap11.impl.FaultUnmarshaller",
            "org.opensaml.soap.soap11.impl.FaultCodeBuilder",
            "org.opensaml.core.xml.schema.impl.XSQNameMarshaller",
            "org.opensaml.core.xml.schema.impl.XSQNameUnmarshaller",
            "org.opensaml.soap.soap11.impl.FaultStringBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.soap.soap11.impl.HeaderBuilder",
            "org.opensaml.soap.soap11.impl.HeaderMarshaller",
            "org.opensaml.soap.soap11.impl.HeaderUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.ActionBuilder",
            "org.opensaml.soap.wsaddressing.impl.ActionMarshaller",
            "org.opensaml.soap.wsaddressing.impl.ActionUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.AddressBuilder",
            "org.opensaml.soap.wsaddressing.impl.AddressMarshaller",
            "org.opensaml.soap.wsaddressing.impl.AddressUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.EndpointReferenceBuilder",
            "org.opensaml.soap.wsaddressing.impl.EndpointReferenceMarshaller",
            "org.opensaml.soap.wsaddressing.impl.EndpointReferenceUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.FaultToBuilder",
            "org.opensaml.soap.wsaddressing.impl.FaultToMarshaller",
            "org.opensaml.soap.wsaddressing.impl.FaultToUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.FromBuilder",
            "org.opensaml.soap.wsaddressing.impl.FromMarshaller",
            "org.opensaml.soap.wsaddressing.impl.FromUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.MessageIDBuilder",
            "org.opensaml.soap.wsaddressing.impl.MessageIDMarshaller",
            "org.opensaml.soap.wsaddressing.impl.MessageIDUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.MetadataBuilder",
            "org.opensaml.soap.wsaddressing.impl.MetadataMarshaller",
            "org.opensaml.soap.wsaddressing.impl.MetadataUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.ProblemActionBuilder",
            "org.opensaml.soap.wsaddressing.impl.ProblemActionMarshaller",
            "org.opensaml.soap.wsaddressing.impl.ProblemActionUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.ProblemHeaderQNameBuilder",
            "org.opensaml.soap.wsaddressing.impl.ProblemHeaderQNameMarshaller",
            "org.opensaml.soap.wsaddressing.impl.ProblemHeaderQNameUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.ProblemIRIBuilder",
            "org.opensaml.soap.wsaddressing.impl.ProblemIRIMarshaller",
            "org.opensaml.soap.wsaddressing.impl.ProblemIRIUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.ReferenceParametersBuilder",
            "org.opensaml.soap.wsaddressing.impl.ReferenceParametersMarshaller",
            "org.opensaml.soap.wsaddressing.impl.ReferenceParametersUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.RelatesToBuilder",
            "org.opensaml.soap.wsaddressing.impl.RelatesToMarshaller",
            "org.opensaml.soap.wsaddressing.impl.RelatesToUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.ReplyToBuilder",
            "org.opensaml.soap.wsaddressing.impl.ReplyToMarshaller",
            "org.opensaml.soap.wsaddressing.impl.ReplyToUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.RetryAfterBuilder",
            "org.opensaml.soap.wsaddressing.impl.RetryAfterMarshaller",
            "org.opensaml.soap.wsaddressing.impl.RetryAfterUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.SoapActionBuilder",
            "org.opensaml.soap.wsaddressing.impl.SoapActionMarshaller",
            "org.opensaml.soap.wsaddressing.impl.SoapActionUnmarshaller",
            "org.opensaml.soap.wsaddressing.impl.ToBuilder",
            "org.opensaml.soap.wsaddressing.impl.ToMarshaller",
            "org.opensaml.soap.wsaddressing.impl.ToUnmarshaller",
            "org.opensaml.soap.wsfed.impl.AddressBuilder",
            "org.opensaml.soap.wsfed.impl.AddressMarshaller",
            "org.opensaml.soap.wsfed.impl.AddressUnmarshaller",
            "org.opensaml.soap.wsfed.impl.AppliesToBuilder",
            "org.opensaml.soap.wsfed.impl.AppliesToMarshaller",
            "org.opensaml.soap.wsfed.impl.AppliesToUnmarshaller",
            "org.opensaml.soap.wsfed.impl.EndPointReferenceBuilder",
            "org.opensaml.soap.wsfed.impl.EndPointReferenceMarshaller",
            "org.opensaml.soap.wsfed.impl.EndPointReferenceUnmarshaller",
            "org.opensaml.soap.wsfed.impl.RequestSecurityTokenResponseBuilder",
            "org.opensaml.soap.wsfed.impl.RequestSecurityTokenResponseMarshaller",
            "org.opensaml.soap.wsfed.impl.RequestSecurityTokenResponseUnmarshaller",
            "org.opensaml.soap.wsfed.impl.RequestedSecurityTokenBuilder",
            "org.opensaml.soap.wsfed.impl.RequestedSecurityTokenMarshaller",
            "org.opensaml.soap.wsfed.impl.RequestedSecurityTokenUnmarshaller",
            "org.opensaml.soap.wspolicy.impl.AllBuilder",
            "org.opensaml.soap.wspolicy.impl.AllMarshaller",
            "org.opensaml.soap.wspolicy.impl.AllUnmarshaller",
            "org.opensaml.soap.wspolicy.impl.AppliesToBuilder",
            "org.opensaml.soap.wspolicy.impl.AppliesToMarshaller",
            "org.opensaml.soap.wspolicy.impl.AppliesToUnmarshaller",
            "org.opensaml.soap.wspolicy.impl.ExactlyOneBuilder",
            "org.opensaml.soap.wspolicy.impl.ExactlyOneMarshaller",
            "org.opensaml.soap.wspolicy.impl.ExactlyOneUnmarshaller",
            "org.opensaml.soap.wspolicy.impl.PolicyAttachmentBuilder",
            "org.opensaml.soap.wspolicy.impl.PolicyAttachmentMarshaller",
            "org.opensaml.soap.wspolicy.impl.PolicyAttachmentUnmarshaller",
            "org.opensaml.soap.wspolicy.impl.PolicyBuilder",
            "org.opensaml.soap.wspolicy.impl.PolicyMarshaller",
            "org.opensaml.soap.wspolicy.impl.PolicyUnmarshaller",
            "org.opensaml.soap.wspolicy.impl.PolicyReferenceBuilder",
            "org.opensaml.soap.wspolicy.impl.PolicyReferenceMarshaller",
            "org.opensaml.soap.wspolicy.impl.PolicyReferenceUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.BinarySecurityTokenBuilder",
            "org.opensaml.soap.wssecurity.impl.BinarySecurityTokenMarshaller",
            "org.opensaml.soap.wssecurity.impl.BinarySecurityTokenUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.CreatedBuilder",
            "org.opensaml.soap.wssecurity.impl.CreatedMarshaller",
            "org.opensaml.soap.wssecurity.impl.CreatedUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.EmbeddedBuilder",
            "org.opensaml.soap.wssecurity.impl.EmbeddedMarshaller",
            "org.opensaml.soap.wssecurity.impl.EmbeddedUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.EncryptedHeaderBuilder",
            "org.opensaml.soap.wssecurity.impl.EncryptedHeaderMarshaller",
            "org.opensaml.soap.wssecurity.impl.EncryptedHeaderUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.ExpiresBuilder",
            "org.opensaml.soap.wssecurity.impl.ExpiresMarshaller",
            "org.opensaml.soap.wssecurity.impl.ExpiresUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.IterationBuilder",
            "org.opensaml.soap.wssecurity.impl.IterationMarshaller",
            "org.opensaml.soap.wssecurity.impl.IterationUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.KeyIdentifierBuilder",
            "org.opensaml.soap.wssecurity.impl.KeyIdentifierMarshaller",
            "org.opensaml.soap.wssecurity.impl.KeyIdentifierUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.NonceBuilder",
            "org.opensaml.soap.wssecurity.impl.NonceMarshaller",
            "org.opensaml.soap.wssecurity.impl.NonceUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.PasswordBuilder",
            "org.opensaml.soap.wssecurity.impl.PasswordMarshaller",
            "org.opensaml.soap.wssecurity.impl.PasswordUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.ReferenceBuilder",
            "org.opensaml.soap.wssecurity.impl.ReferenceMarshaller",
            "org.opensaml.soap.wssecurity.impl.ReferenceUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.SaltBuilder",
            "org.opensaml.soap.wssecurity.impl.SaltMarshaller",
            "org.opensaml.soap.wssecurity.impl.SaltUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.SecurityBuilder",
            "org.opensaml.soap.wssecurity.impl.SecurityMarshaller",
            "org.opensaml.soap.wssecurity.impl.SecurityUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.SecurityTokenReferenceBuilder",
            "org.opensaml.soap.wssecurity.impl.SecurityTokenReferenceMarshaller",
            "org.opensaml.soap.wssecurity.impl.SecurityTokenReferenceUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.SignatureConfirmationBuilder",
            "org.opensaml.soap.wssecurity.impl.SignatureConfirmationMarshaller",
            "org.opensaml.soap.wssecurity.impl.SignatureConfirmationUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.TimestampBuilder",
            "org.opensaml.soap.wssecurity.impl.TimestampMarshaller",
            "org.opensaml.soap.wssecurity.impl.TimestampUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.TransformationParametersBuilder",
            "org.opensaml.soap.wssecurity.impl.TransformationParametersMarshaller",
            "org.opensaml.soap.wssecurity.impl.TransformationParametersUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.UsernameBuilder",
            "org.opensaml.soap.wssecurity.impl.UsernameMarshaller",
            "org.opensaml.soap.wssecurity.impl.UsernameUnmarshaller",
            "org.opensaml.soap.wssecurity.impl.UsernameTokenBuilder",
            "org.opensaml.soap.wssecurity.impl.UsernameTokenMarshaller",
            "org.opensaml.soap.wssecurity.impl.UsernameTokenUnmarshaller",
            "org.opensaml.soap.wstrust.impl.AllowPostdatingBuilder",
            "org.opensaml.soap.wstrust.impl.AllowPostdatingMarshaller",
            "org.opensaml.soap.wstrust.impl.AllowPostdatingUnmarshaller",
            "org.opensaml.soap.wstrust.impl.AuthenticationTypeBuilder",
            "org.opensaml.soap.wstrust.impl.AuthenticationTypeMarshaller",
            "org.opensaml.soap.wstrust.impl.AuthenticationTypeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.AuthenticatorBuilder",
            "org.opensaml.soap.wstrust.impl.AuthenticatorMarshaller",
            "org.opensaml.soap.wstrust.impl.AuthenticatorUnmarshaller",
            "org.opensaml.soap.wstrust.impl.BinaryExchangeBuilder",
            "org.opensaml.soap.wstrust.impl.BinaryExchangeMarshaller",
            "org.opensaml.soap.wstrust.impl.BinaryExchangeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.BinarySecretBuilder",
            "org.opensaml.soap.wstrust.impl.BinarySecretMarshaller",
            "org.opensaml.soap.wstrust.impl.BinarySecretUnmarshaller",
            "org.opensaml.soap.wstrust.impl.CancelTargetBuilder",
            "org.opensaml.soap.wstrust.impl.CancelTargetMarshaller",
            "org.opensaml.soap.wstrust.impl.CancelTargetUnmarshaller",
            "org.opensaml.soap.wstrust.impl.CanonicalizationAlgorithmBuilder",
            "org.opensaml.soap.wstrust.impl.CanonicalizationAlgorithmMarshaller",
            "org.opensaml.soap.wstrust.impl.CanonicalizationAlgorithmUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ChallengeBuilder",
            "org.opensaml.soap.wstrust.impl.ChallengeMarshaller",
            "org.opensaml.soap.wstrust.impl.ChallengeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ClaimsBuilder",
            "org.opensaml.soap.wstrust.impl.ClaimsMarshaller",
            "org.opensaml.soap.wstrust.impl.ClaimsUnmarshaller",
            "org.opensaml.soap.wstrust.impl.CodeBuilder",
            "org.opensaml.soap.wstrust.impl.CodeMarshaller",
            "org.opensaml.soap.wstrust.impl.CodeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.CombinedHashBuilder",
            "org.opensaml.soap.wstrust.impl.CombinedHashMarshaller",
            "org.opensaml.soap.wstrust.impl.CombinedHashUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ComputedKeyAlgorithmBuilder",
            "org.opensaml.soap.wstrust.impl.ComputedKeyAlgorithmMarshaller",
            "org.opensaml.soap.wstrust.impl.ComputedKeyAlgorithmUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ComputedKeyBuilder",
            "org.opensaml.soap.wstrust.impl.ComputedKeyMarshaller",
            "org.opensaml.soap.wstrust.impl.ComputedKeyUnmarshaller",
            "org.opensaml.soap.wstrust.impl.DelegatableBuilder",
            "org.opensaml.soap.wstrust.impl.DelegatableMarshaller",
            "org.opensaml.soap.wstrust.impl.DelegatableUnmarshaller",
            "org.opensaml.soap.wstrust.impl.DelegateToBuilder",
            "org.opensaml.soap.wstrust.impl.DelegateToMarshaller",
            "org.opensaml.soap.wstrust.impl.DelegateToUnmarshaller",
            "org.opensaml.soap.wstrust.impl.EncryptWithBuilder",
            "org.opensaml.soap.wstrust.impl.EncryptWithMarshaller",
            "org.opensaml.soap.wstrust.impl.EncryptWithUnmarshaller",
            "org.opensaml.soap.wstrust.impl.EncryptionAlgorithmBuilder",
            "org.opensaml.soap.wstrust.impl.EncryptionAlgorithmMarshaller",
            "org.opensaml.soap.wstrust.impl.EncryptionAlgorithmUnmarshaller",
            "org.opensaml.soap.wstrust.impl.EncryptionBuilder",
            "org.opensaml.soap.wstrust.impl.EncryptionMarshaller",
            "org.opensaml.soap.wstrust.impl.EncryptionUnmarshaller",
            "org.opensaml.soap.wstrust.impl.EntropyBuilder",
            "org.opensaml.soap.wstrust.impl.EntropyMarshaller",
            "org.opensaml.soap.wstrust.impl.EntropyUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ForwardableBuilder",
            "org.opensaml.soap.wstrust.impl.ForwardableMarshaller",
            "org.opensaml.soap.wstrust.impl.ForwardableUnmarshaller",
            "org.opensaml.soap.wstrust.impl.IssuedTokensBuilder",
            "org.opensaml.soap.wstrust.impl.IssuedTokensMarshaller",
            "org.opensaml.soap.wstrust.impl.IssuedTokensUnmarshaller",
            "org.opensaml.soap.wstrust.impl.IssuerBuilder",
            "org.opensaml.soap.wstrust.impl.IssuerMarshaller",
            "org.opensaml.soap.wstrust.impl.IssuerUnmarshaller",
            "org.opensaml.soap.wstrust.impl.KeyExchangeTokenBuilder",
            "org.opensaml.soap.wstrust.impl.KeyExchangeTokenMarshaller",
            "org.opensaml.soap.wstrust.impl.KeyExchangeTokenUnmarshaller",
            "org.opensaml.soap.wstrust.impl.KeySizeBuilder",
            "org.opensaml.soap.wstrust.impl.KeySizeMarshaller",
            "org.opensaml.soap.wstrust.impl.KeySizeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.KeyTypeBuilder",
            "org.opensaml.soap.wstrust.impl.KeyTypeMarshaller",
            "org.opensaml.soap.wstrust.impl.KeyTypeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.KeyWrapAlgorithmBuilder",
            "org.opensaml.soap.wstrust.impl.KeyWrapAlgorithmMarshaller",
            "org.opensaml.soap.wstrust.impl.KeyWrapAlgorithmUnmarshaller",
            "org.opensaml.soap.wstrust.impl.LifetimeBuilder",
            "org.opensaml.soap.wstrust.impl.LifetimeMarshaller",
            "org.opensaml.soap.wstrust.impl.LifetimeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.OnBehalfOfBuilder",
            "org.opensaml.soap.wstrust.impl.OnBehalfOfMarshaller",
            "org.opensaml.soap.wstrust.impl.OnBehalfOfUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ParticipantBuilder",
            "org.opensaml.soap.wstrust.impl.ParticipantMarshaller",
            "org.opensaml.soap.wstrust.impl.ParticipantUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ParticipantsBuilder",
            "org.opensaml.soap.wstrust.impl.ParticipantsMarshaller",
            "org.opensaml.soap.wstrust.impl.ParticipantsUnmarshaller",
            "org.opensaml.soap.wstrust.impl.PrimaryBuilder",
            "org.opensaml.soap.wstrust.impl.PrimaryMarshaller",
            "org.opensaml.soap.wstrust.impl.PrimaryUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ProofEncryptionBuilder",
            "org.opensaml.soap.wstrust.impl.ProofEncryptionMarshaller",
            "org.opensaml.soap.wstrust.impl.ProofEncryptionUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ReasonBuilder",
            "org.opensaml.soap.wstrust.impl.ReasonMarshaller",
            "org.opensaml.soap.wstrust.impl.ReasonUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RenewTargetBuilder",
            "org.opensaml.soap.wstrust.impl.RenewTargetMarshaller",
            "org.opensaml.soap.wstrust.impl.RenewTargetUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RenewingBuilder",
            "org.opensaml.soap.wstrust.impl.RenewingMarshaller",
            "org.opensaml.soap.wstrust.impl.RenewingUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestKETBuilder",
            "org.opensaml.soap.wstrust.impl.RequestKETMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestKETUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenBuilder",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenCollectionBuilder",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenCollectionMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenCollectionUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenResponseBuilder",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenResponseMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenResponseUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenResponseCollectionBuilder",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenResponseCollectionMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestSecurityTokenResponseCollectionUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestTypeBuilder",
            "org.opensaml.soap.wstrust.impl.RequestTypeMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestTypeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedAttachedReferenceBuilder",
            "org.opensaml.soap.wstrust.impl.RequestedAttachedReferenceMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedAttachedReferenceUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedProofTokenBuilder",
            "org.opensaml.soap.wstrust.impl.RequestedProofTokenMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedProofTokenUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedSecurityTokenBuilder",
            "org.opensaml.soap.wstrust.impl.RequestedSecurityTokenMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedSecurityTokenUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedTokenCancelledBuilder",
            "org.opensaml.soap.wstrust.impl.RequestedTokenCancelledMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedTokenCancelledUnmarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedUnattachedReferenceBuilder",
            "org.opensaml.soap.wstrust.impl.RequestedUnattachedReferenceMarshaller",
            "org.opensaml.soap.wstrust.impl.RequestedUnattachedReferenceUnmarshaller",
            "org.opensaml.soap.wstrust.impl.SignChallengeBuilder",
            "org.opensaml.soap.wstrust.impl.SignChallengeMarshaller",
            "org.opensaml.soap.wstrust.impl.SignChallengeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.SignChallengeResponseBuilder",
            "org.opensaml.soap.wstrust.impl.SignChallengeResponseMarshaller",
            "org.opensaml.soap.wstrust.impl.SignChallengeResponseUnmarshaller",
            "org.opensaml.soap.wstrust.impl.SignWithBuilder",
            "org.opensaml.soap.wstrust.impl.SignWithMarshaller",
            "org.opensaml.soap.wstrust.impl.SignWithUnmarshaller",
            "org.opensaml.soap.wstrust.impl.SignatureAlgorithmBuilder",
            "org.opensaml.soap.wstrust.impl.SignatureAlgorithmMarshaller",
            "org.opensaml.soap.wstrust.impl.SignatureAlgorithmUnmarshaller",
            "org.opensaml.soap.wstrust.impl.StatusBuilder",
            "org.opensaml.soap.wstrust.impl.StatusMarshaller",
            "org.opensaml.soap.wstrust.impl.StatusUnmarshaller",
            "org.opensaml.soap.wstrust.impl.TokenTypeBuilder",
            "org.opensaml.soap.wstrust.impl.TokenTypeMarshaller",
            "org.opensaml.soap.wstrust.impl.TokenTypeUnmarshaller",
            "org.opensaml.soap.wstrust.impl.UseKeyBuilder",
            "org.opensaml.soap.wstrust.impl.UseKeyMarshaller",
            "org.opensaml.soap.wstrust.impl.UseKeyUnmarshaller",
            "org.opensaml.soap.wstrust.impl.ValidateTargetBuilder",
            "org.opensaml.soap.wstrust.impl.ValidateTargetMarshaller",
            "org.opensaml.soap.wstrust.impl.ValidateTargetUnmarshaller"
    );
    public static final List<String> OPENSAML_XMLSEC_CLASSES = List.of(
            "org.opensaml.xmlsec.encryption.impl.AgreementMethodBuilder",
            "org.opensaml.xmlsec.encryption.impl.AgreementMethodMarshaller",
            "org.opensaml.xmlsec.encryption.impl.AgreementMethodUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.CarriedKeyNameBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.CipherDataBuilder",
            "org.opensaml.xmlsec.encryption.impl.CipherDataMarshaller",
            "org.opensaml.xmlsec.encryption.impl.CipherDataUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.CipherReferenceBuilder",
            "org.opensaml.xmlsec.encryption.impl.CipherReferenceMarshaller",
            "org.opensaml.xmlsec.encryption.impl.CipherReferenceUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.CipherValueBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.ConcatKDFParamsBuilder",
            "org.opensaml.xmlsec.encryption.impl.ConcatKDFParamsMarshaller",
            "org.opensaml.xmlsec.encryption.impl.ConcatKDFParamsUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.DHKeyValueBuilder",
            "org.opensaml.xmlsec.encryption.impl.DHKeyValueMarshaller",
            "org.opensaml.xmlsec.encryption.impl.DHKeyValueUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.DataReferenceBuilder",
            "org.opensaml.xmlsec.encryption.impl.DataReferenceMarshaller",
            "org.opensaml.xmlsec.encryption.impl.DataReferenceUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.DerivedKeyBuilder",
            "org.opensaml.xmlsec.encryption.impl.DerivedKeyMarshaller",
            "org.opensaml.xmlsec.encryption.impl.DerivedKeyUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.DerivedKeyNameBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptedDataBuilder",
            "org.opensaml.xmlsec.encryption.impl.EncryptedDataMarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptedDataUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptedKeyBuilder",
            "org.opensaml.xmlsec.encryption.impl.EncryptedKeyMarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptedKeyUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptionMethodBuilder",
            "org.opensaml.xmlsec.encryption.impl.EncryptionMethodMarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptionMethodUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptionPropertiesBuilder",
            "org.opensaml.xmlsec.encryption.impl.EncryptionPropertiesMarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptionPropertiesUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptionPropertyBuilder",
            "org.opensaml.xmlsec.encryption.impl.EncryptionPropertyMarshaller",
            "org.opensaml.xmlsec.encryption.impl.EncryptionPropertyUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.GeneratorBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.IterationCountBuilder",
            "org.opensaml.core.xml.schema.impl.XSIntegerMarshaller",
            "org.opensaml.core.xml.schema.impl.XSIntegerUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.KANonceBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.KeyDerivationMethodBuilder",
            "org.opensaml.xmlsec.encryption.impl.KeyDerivationMethodMarshaller",
            "org.opensaml.xmlsec.encryption.impl.KeyDerivationMethodUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.KeyLengthBuilder",
            "org.opensaml.core.xml.schema.impl.XSIntegerMarshaller",
            "org.opensaml.core.xml.schema.impl.XSIntegerUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.KeyReferenceBuilder",
            "org.opensaml.xmlsec.encryption.impl.KeyReferenceMarshaller",
            "org.opensaml.xmlsec.encryption.impl.KeyReferenceUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.KeySizeBuilder",
            "org.opensaml.core.xml.schema.impl.XSIntegerMarshaller",
            "org.opensaml.core.xml.schema.impl.XSIntegerUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.MGFBuilder",
            "org.opensaml.xmlsec.encryption.impl.MGFMarshaller",
            "org.opensaml.xmlsec.encryption.impl.MGFUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.MasterKeyNameBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.OAEPparamsBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.OriginatorKeyInfoBuilder",
            "org.opensaml.xmlsec.encryption.impl.OriginatorKeyInfoMarshaller",
            "org.opensaml.xmlsec.encryption.impl.OriginatorKeyInfoUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.OtherSourceBuilder",
            "org.opensaml.xmlsec.encryption.impl.OtherSourceMarshaller",
            "org.opensaml.xmlsec.encryption.impl.OtherSourceUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.PBKDF2ParamsBuilder",
            "org.opensaml.xmlsec.encryption.impl.PBKDF2ParamsMarshaller",
            "org.opensaml.xmlsec.encryption.impl.PBKDF2ParamsUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.PBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.PRFBuilder",
            "org.opensaml.xmlsec.encryption.impl.PRFMarshaller",
            "org.opensaml.xmlsec.encryption.impl.PRFUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.PgenCounterBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.PublicBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.QBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.RecipientKeyInfoBuilder",
            "org.opensaml.xmlsec.encryption.impl.RecipientKeyInfoMarshaller",
            "org.opensaml.xmlsec.encryption.impl.RecipientKeyInfoUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.ReferenceListBuilder",
            "org.opensaml.xmlsec.encryption.impl.ReferenceListMarshaller",
            "org.opensaml.xmlsec.encryption.impl.ReferenceListUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.SaltBuilder",
            "org.opensaml.xmlsec.encryption.impl.SaltMarshaller",
            "org.opensaml.xmlsec.encryption.impl.SaltUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.SeedBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.SpecifiedBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.encryption.impl.TransformsBuilder",
            "org.opensaml.xmlsec.encryption.impl.TransformsMarshaller",
            "org.opensaml.xmlsec.encryption.impl.TransformsUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.DEREncodedKeyValueBuilder",
            "org.opensaml.xmlsec.signature.impl.DEREncodedKeyValueMarshaller",
            "org.opensaml.xmlsec.signature.impl.DEREncodedKeyValueUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.DSAKeyValueBuilder",
            "org.opensaml.xmlsec.signature.impl.DSAKeyValueMarshaller",
            "org.opensaml.xmlsec.signature.impl.DSAKeyValueUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.DigestMethodBuilder",
            "org.opensaml.xmlsec.signature.impl.DigestMethodMarshaller",
            "org.opensaml.xmlsec.signature.impl.DigestMethodUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.ECKeyValueBuilder",
            "org.opensaml.xmlsec.signature.impl.ECKeyValueMarshaller",
            "org.opensaml.xmlsec.signature.impl.ECKeyValueUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.ExponentBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.GBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.JBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.KeyInfoBuilder",
            "org.opensaml.xmlsec.signature.impl.KeyInfoMarshaller",
            "org.opensaml.xmlsec.signature.impl.KeyInfoUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.KeyInfoReferenceBuilder",
            "org.opensaml.xmlsec.signature.impl.KeyInfoReferenceMarshaller",
            "org.opensaml.xmlsec.signature.impl.KeyInfoReferenceUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.KeyNameBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.KeyValueBuilder",
            "org.opensaml.xmlsec.signature.impl.KeyValueMarshaller",
            "org.opensaml.xmlsec.signature.impl.KeyValueUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.MgmtDataBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.ModulusBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.NamedCurveBuilder",
            "org.opensaml.xmlsec.signature.impl.NamedCurveMarshaller",
            "org.opensaml.xmlsec.signature.impl.NamedCurveUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.PBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.PGPDataBuilder",
            "org.opensaml.xmlsec.signature.impl.PGPDataMarshaller",
            "org.opensaml.xmlsec.signature.impl.PGPDataUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.PGPKeyIDBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.PGPKeyPacketBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.PgenCounterBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.PublicKeyBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.QBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.RSAKeyValueBuilder",
            "org.opensaml.xmlsec.signature.impl.RSAKeyValueMarshaller",
            "org.opensaml.xmlsec.signature.impl.RSAKeyValueUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.RetrievalMethodBuilder",
            "org.opensaml.xmlsec.signature.impl.RetrievalMethodMarshaller",
            "org.opensaml.xmlsec.signature.impl.RetrievalMethodUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.SPKIDataBuilder",
            "org.opensaml.xmlsec.signature.impl.SPKIDataMarshaller",
            "org.opensaml.xmlsec.signature.impl.SPKIDataUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.SPKISexpBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.SeedBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.SignatureBuilder",
            "org.opensaml.xmlsec.signature.impl.SignatureMarshaller",
            "org.opensaml.xmlsec.signature.impl.SignatureUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.TransformBuilder",
            "org.opensaml.xmlsec.signature.impl.TransformMarshaller",
            "org.opensaml.xmlsec.signature.impl.TransformUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.TransformsBuilder",
            "org.opensaml.xmlsec.signature.impl.TransformsMarshaller",
            "org.opensaml.xmlsec.signature.impl.TransformsUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.X509CRLBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.X509CertificateBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.X509DataBuilder",
            "org.opensaml.xmlsec.signature.impl.X509DataMarshaller",
            "org.opensaml.xmlsec.signature.impl.X509DataUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.X509DigestBuilder",
            "org.opensaml.xmlsec.signature.impl.X509DigestMarshaller",
            "org.opensaml.xmlsec.signature.impl.X509DigestUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.X509IssuerNameBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.X509IssuerSerialBuilder",
            "org.opensaml.xmlsec.signature.impl.X509IssuerSerialMarshaller",
            "org.opensaml.xmlsec.signature.impl.X509IssuerSerialUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.X509SKIBuilder",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryMarshaller",
            "org.opensaml.core.xml.schema.impl.XSBase64BinaryUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.X509SerialNumberBuilder",
            "org.opensaml.xmlsec.signature.impl.X509SerialNumberMarshaller",
            "org.opensaml.xmlsec.signature.impl.X509SerialNumberUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.X509SubjectNameBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.XPathBuilder",
            "org.opensaml.core.xml.schema.impl.XSStringMarshaller",
            "org.opensaml.core.xml.schema.impl.XSStringUnmarshaller",
            "org.opensaml.xmlsec.signature.impl.YBuilder",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryMarshaller",
            "org.opensaml.xmlsec.signature.impl.CryptoBinaryUnmarshaller"
    );

    // endregion

}

```

5. 由于SAML2暂不支持Native，很多类都要手动注入，添加测试类来读取xml文件中配置的类名

```java
package com.light.sas;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import javax.xml.parsers.SAXParser;
import javax.xml.parsers.SAXParserFactory;

import org.junit.jupiter.api.Test;
import org.w3c.dom.Element;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import lombok.Data;
import lombok.Getter;

import com.light.sas.config.natives.Saml2RegistrationConfig;

/**
 * https://blog.csdn.net/qq_43757965/article/details/127700222
 */
public class SamlReflectionClassTests {

    public static final String TEMPLATE = """
                "%s",\r\n"%s",\r\n"%s",
                """;

    /**
     * @see org.opensaml.core.xml.config.XMLConfigurator#initializeObjectProviders(Element)
     * @see org.opensaml.core.xml.config.XMLConfigurator#createClassInstance(org.w3c.dom.Element)
     */
    @Test
    public void test() throws Exception {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();

        // Saml2HintsConfig.OPENSAML_CORE_CLASSES
        parseResources(classLoader, Saml2RegistrationConfig.OPENSAML_CORE_RESOURCES);

        // Saml2HintsConfig.OPENSAML_SAML_CLASSES
        parseResources(classLoader, Saml2RegistrationConfig.OPENSAML_SAML_RESOURCES);

        // Saml2HintsConfig.OPENSAML_SOAP_CLASSES
        parseResources(classLoader, Saml2RegistrationConfig.OPENSAML_SOAP_RESOURCES);

        // Saml2HintsConfig.OPENSAML_XMLSEC_CLASSES
        parseResources(classLoader, Saml2RegistrationConfig.OPENSAML_XMLSEC_RESOURCES);
    }

    public void parseResources(ClassLoader classLoader, List<String> resources) throws Exception {
        List<ObjectProvider> providerList = new ArrayList<>();
        for (String resource : resources) {
            InputStream inputStream = classLoader.getResourceAsStream(resource);

            // String content = new String(inputStream.readAllBytes());
            List<ObjectProvider> providers = parseXmlDocument(inputStream);
            providerList.addAll(providers);
        }

        providerList.stream().distinct().sorted(Comparator.naturalOrder()).forEach(provider -> {
            System.out.printf((TEMPLATE) + "%n", provider.getBuilderClass(), provider.getMarshallingClass(), provider.getUnmarshallingClass());
        });
    }

    public List<ObjectProvider> parseXmlDocument(InputStream inputStream) throws Exception {
        // 1、调用sax解析工厂对象newInstance方法创建sax解析工厂对象
        SAXParserFactory saxFactory = SAXParserFactory.newInstance();

        // 2、调用sax工厂对象 newSAXParser方法创建sax解析对象
        SAXParser saxParser = saxFactory.newSAXParser();

        // 3、创建自定义解析器对象
        ProviderHandler handler = new ProviderHandler();

        // 4、使用解析对象传入自定义解析器与解析地址解析数据
        saxParser.parse(inputStream, handler);

        // 5、获取数据
        return handler.getList();
    }

    /**
     * sax需要自己创建解析器类解析对应的文件
     * 创建自定义解析器类继承默认的解析器类
     * 默认解析器类实现了方法但是没有书写任何方法体
     */
    @Getter
    public static class ProviderHandler extends DefaultHandler {

        //在sax解析中是按照标签进行解析
        //起始标签 结束标签  文本标签

        // 创建集合保存所有teacher对象数据
        public List<ObjectProvider> list = new ArrayList<>();

        // 保存每次读取数据的provider对象
        private ObjectProvider provider;

        private String value = "";

        /**
         * 当读取到起始标签时回调的方法
         */
        @Override
        public void startElement(String uri, String localName,
                                 String qName, Attributes attributes) throws SAXException {
            // 当读取到起始标识时创建对象
            if (qName.equals("XMLTooling") || qName.equals("xt:XMLTooling")) {
                // 根节点
            } else if (qName.equals("ObjectProviders") || qName.equals("xt:ObjectProviders")) {
                // 集合起始节点
            } else if (qName.equals("ObjectProvider") || qName.equals("xt:ObjectProvider")) {
                String qualifiedName = attributes.getValue("qualifiedName");
                provider = new ObjectProvider();
                provider.setQualifiedName(qualifiedName.trim());
            } else if (qName.equals("BuilderClass") || qName.equals("xt:BuilderClass")) {
                String className = attributes.getValue("className");
                provider.setBuilderClass(className.trim());
            } else if (qName.equals("MarshallingClass") || qName.equals("xt:MarshallingClass")) {
                String className = attributes.getValue("className");
                provider.setMarshallingClass(className.trim());
            } else if (qName.equals("UnmarshallingClass") || qName.equals("xt:UnmarshallingClass")) {
                String className = attributes.getValue("className");
                provider.setUnmarshallingClass(className.trim());
            }
        }

        /**
         * 当读取到结束标签时回调的方法
         */
        @Override
        public void endElement(String uri, String localName, String qName) throws SAXException {
            // 当读取到结束标签时将对象加入集合
            if (qName.equals("ObjectProvider") || qName.equals("xt:ObjectProvider")) {
                list.add(provider);
            }
        }

        /**
         * 当读取到文本标签时回调的方法
         */
        @Override
        public void characters(char[] ch, int start, int length) throws SAXException {
            value = new String(ch, start, length);
        }
    }

    @Data
    public static class ObjectProvider implements Comparable<ObjectProvider> {

        private String qualifiedName;

        private String builderClass;

        private String marshallingClass;

        private String unmarshallingClass;

        @Override
        public int compareTo(ObjectProvider obj) {
            return this.builderClass.compareTo(obj.builderClass);
        }

        @Override
        public int hashCode() {
            return this.builderClass.hashCode();
        }

        @Override
        public boolean equals(Object obj) {
            if (obj instanceof ObjectProvider target) {
                return this.builderClass.equals(target.builderClass);
            }
            return false;
        }

    }

}

```

### 5. Dockerfile及Github Action
- https://cr.console.aliyun.com/cn-hangzhou/instance/repositories

1. `Dockerfile`

```dockerfile
FROM maven:3.9-ibm-semeru-21-jammy AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
# 如果使用国内网络环境打包可以使用下边的命令，正在使用的是Github Action打包时使用的，国外环境无影响
# RUN mvn clean package -s settings.xml -DskipTests

FROM eclipse-temurin:21-jre as builder
WORKDIR application
ARG JAR_FILE=/app/target/*.jar
COPY --from=build ${JAR_FILE} application.jar
RUN java -Djarmode=layertools -jar application.jar extract

FROM eclipse-temurin:21-jre
WORKDIR application
COPY --from=builder application/dependencies/ ./
COPY --from=builder application/spring-boot-loader/ ./
COPY --from=builder application/snapshot-dependencies/ ./
COPY --from=builder application/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
EXPOSE 8080
```

2. `DockerImageToACR.yml`

```yaml
# 工作流名称
name: Package Docker Image and push to alibaba ACR

on:
  # 手动触发任务
  workflow_dispatch:

env:
  # 仓库地址
  REGISTRY: registry.cn-guangzhou.aliyuncs.com
  USERNAME: ${{ secrets.ACR_USERNAME }}
  PASSWORD: ${{ secrets.ACR_PASSWORD }}
  IMAGE_NAME: lights/auth-server
  IMAGE_TAG: latest

jobs:
  build:

    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      # This is used to complete the identity challenge
      # with sigstore/fulcio when running outside of PRs.
      id-token: write

    steps:
      # 将远程仓库中的源代码领取到workfile自动化构建脚本运行的服务器
      - name: Checkout repository
        uses: actions/checkout@v4

      # Login against a Docker registry except on PR
      # https://github.com/docker/login-action
      # 用于登录docker以便我们后续上传镜像到自己的镜像仓库
      - name: Login to ${{ env.REGISTRY }}
        if: github.event_name != 'pull_request'
        uses: docker/login-action@65b78e6e13532edd9afa3aa52ac7964289d1a9c1
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ env.USERNAME }}
          password: ${{ env.PASSWORD }}

      # 生成和推送镜像  阿里云镜像仓库推送有问题
      # # https://github.com/docker/build-push-action
      # - name: Build and push Docker image
      #   id: build-and-push # 构建docker镜像，推送到自己的docker镜像仓库
      #   uses: docker/build-push-action@ac9327eae2b366085ac7f6a2d02df8aa8ead720a
      #   with:
      #     registry: ${{ env.REGISTRY }}
      #     username: ${{ secrets.USERMAME }} # 镜像仓库用户名
      #     password: ${{ secrets.PASSWORD }} # 镜像仓库密码
      #     push: ${{ github.event_name != 'pull_request' }}
      #     tags: ${{env.IMAGE_NAME}}:${{env.IMAGE_TAG}}.${{ github.run_id }}.${{ github.run_number }} #动态变量镜像TAG 使用github运行job和jobid设置tag
      #     context: . # 相对以远程仓库根路径的dockerfile的路径
      #     file: ./NetByDocker/Dockerfile # 指定Dockerfile

      # 登录阿里云镜像仓库
      - name: Login Alibaba ACR
        run:
          echo "${{ env.PASSWORD }}" | docker login --username=${{ env.USERNAME }} --password-stdin ${{ env.REGISTRY }}

      - name: Set Jdk21
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '21'
          cache: 'maven'

      - name: Show version
        run:
          docker version

      # 使用Dockerfile构建镜像  ${{env.IMAGE_TAG}}.${{ github.run_id }}.${{ github.run_number }}
      - name: Build the Docker image
        run:
          cd sas-37-native-image && docker build . --file Dockerfile --tag ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{env.IMAGE_TAG}} --tag ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:0.1.${{ github.run_number }}

      # 推送镜像到镜像仓库
      - name: Push to ACR
        run:
          docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{env.IMAGE_TAG}} \
          && docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:0.1.${{ github.run_number }}

      # 列出所有镜像    
      - name: Docker Images List
        run: docker images

```

3. `NativeImageToACR.yml`

```yaml
# 工作流名称
name: Package Native Image and push to alibaba ACR

on:
  # 手动触发任务
  workflow_dispatch:

env:
  # 仓库地址
  REGISTRY: registry.cn-guangzhou.aliyuncs.com
  USERNAME: ${{ secrets.ACR_USERNAME }}
  PASSWORD: ${{ secrets.ACR_PASSWORD }}
  IMAGE_NAME: lights/auth-server-native
  IMAGE_TAG: latest
  DEFAULT_IMAGE_NAME: auth-server-native:2024.0.0

jobs:
  build:

    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      # This is used to complete the identity challenge
      # with sigstore/fulcio when running outside of PRs.
      id-token: write

    steps:
      # 将远程仓库中的源代码领取到workfile自动化构建脚本运行的服务器
      - name: Checkout repository
        uses: actions/checkout@v4

      # Login against a Docker registry except on PR
      # https://github.com/docker/login-action
      # 用于登录docker以便我们后续上传镜像到自己的镜像仓库
      - name: Login to ${{ env.REGISTRY }}
        if: github.event_name != 'pull_request'
        uses: docker/login-action@65b78e6e13532edd9afa3aa52ac7964289d1a9c1
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ env.USERNAME }}
          password: ${{ env.PASSWORD }}

      # 生成和推送镜像  阿里云镜像仓库推送有问题
      # # https://github.com/docker/build-push-action
      # - name: Build and push Docker image
      #   id: build-and-push # 构建docker镜像，推送到自己的docker镜像仓库
      #   uses: docker/build-push-action@ac9327eae2b366085ac7f6a2d02df8aa8ead720a
      #   with:
      #     registry: ${{ env.REGISTRY }}
      #     username: ${{ secrets.USERMAME }} # 镜像仓库用户名
      #     password: ${{ secrets.PASSWORD }} # 镜像仓库密码
      #     push: ${{ github.event_name != 'pull_request' }}
      #     tags: ${{env.IMAGE_NAME}}:${{env.IMAGE_TAG}}.${{ github.run_id }}.${{ github.run_number }} #动态变量镜像TAG 使用github运行job和jobid设置tag
      #     context: . # 相对以远程仓库根路径的dockerfile的路径
      #     file: ./NetByDocker/Dockerfile # 指定Dockerfile

      # 登录阿里云镜像仓库
      - name: Login Alibaba ACR
        run:
          echo "${{ env.PASSWORD }}" | docker login --username=${{ env.USERNAME }} --password-stdin ${{ env.REGISTRY }}

      - name: Set Jdk21
        uses: graalvm/setup-graalvm@v1
        with:
          distribution: 'graalvm'
          java-version: '21'
          cache: 'maven'
          github-token: ${{ secrets.ACCESS_TOKEN }}
          native-image-job-reports: 'true'

      - name: Show version
        run:
          java -version

      # 使用Dockerfile构建镜像  ${{env.IMAGE_TAG}}.${{ github.run_id }}.${{ github.run_number }}
      - name: Build the Docker image
        run:
          # cd sas-37-native-image && mvn -Pnative native:compile
          cd sas-37-native-image && mvn -DskipTests -Pnative spring-boot:build-image

      # 使用"docker tag"命令重命名镜像，并将它通过专有网络地址推送至Registry。
      - name: Push to ACR
        run:
          docker images \
          && docker tag ${{ env.DEFAULT_IMAGE_NAME }} ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{env.IMAGE_TAG}} \
          && docker tag ${{ env.DEFAULT_IMAGE_NAME }} ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:0.1.${{ github.run_number }} \
          && docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{env.IMAGE_TAG}} \
          && docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:0.1.${{ github.run_number }}

      # 列出所有镜像
      - name: Docker Images List
        run: docker images

```

### 6. 前端改造

1. 前端生成验证码 `VerifyCodeImg.vue`

   - https://blog.csdn.net/qq_39719750/article/details/129245069
   - https://xiblogs.top/?id=63
   - https://blog.csdn.net/xi1213/article/details/134176977
   - https://blog.csdn.net/yuanye01/article/details/132416244

```vue
<template>
  <div class="s-canvas">
    <canvas id="s-canvas" :width="contentWidth" :height="contentHeight"></canvas>
  </div>
</template>

<script>
export default {
  name: 's-identify',
  props: {
    identifyCode: {
      type: String,
      default: '1234'
    },
    contentWidth: {
      type: Number,
      default: 130
    },
    contentHeight: {
      type: Number,
      default: 34
    },
    fontSizeMin: {
      type: Number,
      default: 35
    },
    fontSizeMax: {
      type: Number,
      default: 45
    },
    backgroundColorMin: {
      type: Number,
      default: 180
    },
    backgroundColorMax: {
      type: Number,
      default: 240
    },
    colorMin: {
      type: Number,
      default: 50
    },
    colorMax: {
      type: Number,
      default: 160
    },
    lineColorMin: {
      type: Number,
      default: 100
    },
    lineColorMax: {
      type: Number,
      default: 200
    },
    dotColorMin: {
      type: Number,
      default: 0
    },
    dotColorMax: {
      type: Number,
      default: 255
    }
  },

  mounted() {
    this.drawPicture()
  },

  methods: {
    // 生成一个随机数
    randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min)
    },

    // 生成一个随机的颜色
    randomColor(min, max) {
      let r = this.randomNum(min, max)
      let g = this.randomNum(min, max)
      let b = this.randomNum(min, max)
      return 'rgb(' + r + ',' + g + ',' + b + ')'
    },

    // 绘制图片
    drawPicture() {
      let canvas = document.getElementById('s-canvas')
      let ctx = canvas.getContext('2d')
      ctx.textBaseline = 'bottom'
      // 绘制背景
      ctx.fillStyle = this.randomColor(this.backgroundColorMin, this.backgroundColorMax)
      ctx.fillRect(0, 0, this.contentWidth, this.contentHeight)
      // 绘制文字
      for (let i = 0; i < this.identifyCode.length; i++) {
        this.drawText(ctx, this.identifyCode[i], i)
      }
      this.drawLine(ctx)
      this.drawDot(ctx)
    },

    // 绘制文字
    drawText(ctx, text, index) {
      ctx.fillStyle = this.randomColor(this.colorMin, this.colorMax)
      ctx.font = this.randomNum(this.fontSizeMin, this.fontSizeMax) + 'px SimHei'
      let x = (index + 1) * (this.contentWidth / (this.identifyCode.length + 1))
      let y = this.randomNum(this.fontSizeMax, this.contentHeight - 5)
      var deg = this.randomNum(-30, 30)
      // 修改坐标原点和旋转角度
      ctx.translate(x, y)
      ctx.rotate(deg * Math.PI / 180)
      ctx.fillText(text, 0, 0)
      // 恢复坐标原点和旋转角度
      ctx.rotate(-deg * Math.PI / 180)
      ctx.translate(-x, -y)
    },
    
    // 绘制干扰线
    drawLine(ctx) {
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = this.randomColor(this.lineColorMin, this.lineColorMax)
        ctx.beginPath()
        ctx.moveTo(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight))
        ctx.lineTo(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight))
        ctx.stroke()
      }
    },
    
    // 绘制干扰点
    drawDot(ctx) {
      for (let i = 0; i < 30; i++) {
        ctx.fillStyle = this.randomColor(this.dotColorMin, this.dotColorMax)
        ctx.beginPath()
        ctx.arc(this.randomNum(0, this.contentWidth), this.randomNum(0, this.contentHeight), 1, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  },
  watch: {
    identifyCode() {
      this.drawPicture()
    }
  }
}
</script>
```

替换原有标签
```vue
<!-- <n-image @click="getCaptcha" width="130" height="34" :src="captchaImage" preview-disabled /> -->
<s-identify @click="getCaptcha" :contentWidth="130" :contentHeight="34" :identifyCode="captchaCode"/>
```

2. 前端生成二维码

- https://blog.csdn.net/Fantasywt/article/details/129365661
- https://blog.csdn.net/PhoenixGuangyu/article/details/131182749

```shell
# 安装依赖
# npm install -g qrcode
npm install qrcode --save

# 安装类型声明
npm install --save-dev @types/qrcode
```

```vue
<!-- 引入依赖 -->
import QRcode from "qrcode";

<!-- 添加生成二维码的方法 -->
// 生成二维码
const generateQrCode = (text: string) => {
	const qrcodeCanvas = document.getElementById('qrcodeCanvas')
	QRcode.toCanvas(qrcodeCanvas, text,
		{
			margin: 0,
			width: 300 //自定义宽度
		}
	);
	return qrcodeCanvas //记得返回canvas
}

<!-- 在需要生成二维码的位置添加canvas标签 -->
<!-- <div style="margin: 5.305px">
  <n-image width="300" :src="getQrCodeInfo.imageData" preview-disabled />
</div> -->
<canvas id="qrcodeCanvas" ></canvas>
```

## 测试

- 构建：`mvn -Pnative native:compile`
- 测试：`mvn -PnativeTest test`
- 发布：`mvn -Pnative spring-boot:build-image`，注意此命令会打包镜像并且发布到Docker的官方仓库中

> 虽然 `native:compile` 命令表面意义是编译，但是实际上它就是构建原生镜像的命令

```shell
mvn clean -Pnative native:compile

# 打包完成后直接运行即可
.\sas-37-native-image\target\sas-37-native-image.exe
```

## 总结

1. 支持OAuth2认证
2. 支持LDAP认证
3. 不支持SAML2认证


## 参考
- [Spring Security Issue 11984: Add native support for SAML 2.0](https://github.com/spring-projects/spring-security/issues/11984)

