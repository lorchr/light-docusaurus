https://wvengen.github.io/proguard-maven-plugin/

## 1. 添加maven插件
```xml
<!-- 混淆插件 -->
<!--
    注意事项：
        1. 需要在 spring-boot-maven-plugin之前 否则不能正确的混淆代码
        2. 如果要打包spring boot 可执行jar，不能修改outjar的名称
        3. 因为生成的bean名称都是 a b c 只是包名不同，在向spring注入的时候会报conflict
            - -keep public @org.springframework.stereotype.Component class **
            - 使用 @Component("beanName") 替换 @Component
-->
<plugin>
    <dependencies>
        <dependency>
            <groupId>com.guardsquare</groupId>
            <artifactId>proguard-base</artifactId>
            <version>7.3.2</version>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>com.guardsquare</groupId>
            <artifactId>proguard-core</artifactId>
            <version>9.0.8</version>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
    </dependencies>
    <groupId>com.github.wvengen</groupId>
    <artifactId>proguard-maven-plugin</artifactId>
    <version>2.6.0</version>
    <executions>
        <!-- 以下配置说明执行mvn的package命令时候，会执行proguard-->
        <execution>
            <phase>package</phase>
            <goals>
                <goal>proguard</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <!--proguard版本-->
        <proguardVersion>7.3.2</proguardVersion>
        <!-- 是否混淆 默认是true -->
        <obfuscate>true</obfuscate>
        <!-- 就是输入Jar的名称，我们要知道，代码混淆其实是将一个原始的jar，生成一个混淆后的jar，那么就会有输入输出。 -->
        <injar>${project.build.finalName}.jar</injar>
        <!-- 输出jar名称，输入输出jar同名的时候就是覆盖，也是比较常用的配置。 -->
        <outjar>${project.build.finalName}.jar</outjar>
        <!-- 配置一个文件，通常叫做proguard.cfg,该文件主要是配置options选项，也就是说使用proguard.cfg那么options下的所有内容都可以移到proguard.cfg中 -->
        <proguardInclude>proguard.cfg</proguardInclude>
        <!-- 这是输出路径配置，但是要注意这个路径必须要包括injar标签填写的jar -->
        <outputDirectory>${project.basedir}/target</outputDirectory>
        <!-- 额外的jar包，通常是项目编译所需要的jar -->
        <libs>
            <lib>${java.home}/jmods/</lib>
        </libs>
        <!-- 对输入jar进行过滤比如，如下配置就是对META-INFO文件不处理。 -->
<!--                    <inLibsFilter>!META-INF/**,!META-INF/versions/17/**.class</inLibsFilter>-->
        <!--这里特别重要，此处主要是配置混淆的一些细节选项，比如哪些类不需要混淆，哪些需要混淆-->
        <options>
            <!-- 可以在此处写option标签配置，不过我上面使用了proguardInclude，故而我更喜欢在proguard.cfg中配置 -->
        </options>
        <injarNotExistsSkip>true</injarNotExistsSkip>
    </configuration>
</plugin>
<!-- maven 打包时跳过测试 -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <skip>true</skip>
    </configuration>
</plugin>
<!-- Spring Boot打包 -->
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
    </configuration>
</plugin>
```

## 2. 编写配置文件
```conf
# https://www.guardsquare.com/manual/configuration/usage
# 指定Java的版本 仅针对1.8之前，1.8之后不需要
# -target 1.8
#-verbose
# proguard会对代码进行优化压缩，他会删除从未使用的类或者类成员变量等
-dontshrink
# 是否关闭字节码级别的优化，如果不开启则设置如下配置
-dontoptimize
# 不跳过非公共的类及成员变量
-dontskipnonpubliclibraryclasses
-dontskipnonpubliclibraryclassmembers
# 混淆时允许访问并修改有修饰符的类和成员
-allowaccessmodification
# 对于类成员的命名的混淆采取唯一策略
-useuniqueclassmembernames
# 混淆时不生成大小写混合的类名，默认是可以大小写混合
-dontusemixedcaseclassnames
# 不混淆所有包名 包名混淆后问题太多 如aop拦截处理controller等
-keeppackagenames
# 不混淆文件夹名称
# -keepdirectories
# 混淆类名之后，对使用Class.forName('className')之类的地方进行相应替代
-adaptclassstrings

#忽略warn消息
-ignorewarnings
#忽略note消息
-dontnote **
#打印配置信息
-printconfiguration

# 对异常、注解信息予以保留
-keepattributes Exceptions,InnerClasses,Signature,Deprecated,SourceFile,LineNumberTable,LocalVaribable*Table,*Annotation*,Synthetic,EnclosingMethod
# 此选项将保存接口中的所有原始名称（不混淆）-->
-keepnames interface ** { *; }
# 此选项将保存所有软件包中的所有原始接口文件（不进行混淆）
#-keep interface * extends * { *; }
#保留参数名，因为控制器，或者Mybatis等接口的参数如果混淆会导致无法接受参数，xml文件找不到参数
-keepparameternames
# 保留枚举成员及方法
-keepclassmembers enum * { *; }
# 不混淆get set方法，防止序列化反序列化异常
-keepclassmembers public class * { void set*(***); *** get*(); }
# 不混淆所有类,保存原始定义的注释-
-keepclassmembers class * {
    @org.springframework.context.annotation.Bean *;
    @org.springframework.beans.factory.annotation.Autowired *;
    @org.springframework.beans.factory.annotation.Value *;
    @org.springframework.stereotype.Service *;
    @org.springframework.stereotype.Component *;
}

# 不混淆启动类
-keep public class com.light.cloud.service.demo.ServiceDemoApplication {
        public static void main(java.lang.String[]);
    }

-keep @org.springframework.stereotype.Component class **
-keep @org.springframework.stereotype.Controller class **
-keep @org.springframework.stereotype.Repository class **
-keep @org.springframework.web.bind.annotation.RestController class **
-keep @org.springframework.context.annotation.Configuration class **

# This option will save all original class files (without obfuscate) in service package
# -keep class com.slm.proguard.example.spring.boot.service { *; }
# This option will save all original interfaces files (without obfuscate) in all packages.
-keep interface * extends * { *; }
# This option will save all original defined annotations in all classes in all packages.
-keep class com.light.cloud.service.demo.config.**
-keep class com.fasterxml.jackson.** { *; }
-keep class org.json.JSONObject.** {** put(java.lang.String,java.util.Map);}

-dontwarn com.fasterxml.jackson.databind.**
-dontwarn com.fasterxml.jackson.**
```

配置文件参考

```conf
# https://medium.com/@ijayakantha/obfuscate-spring-boot-2-applications-with-proguard-a8a76586b11f

-target 1.8 ##Specify the java version number
-dontshrink ##Default is enabled, here the shrink is turned off, that is, the unused classes/members are not deleted.
-dontoptimize ##Default is enabled, here to turn off bytecode level optimization
-useuniqueclassmembernames ## Take a unique strategy for confusing the naming of class members
-adaptclassstrings ## After confusing the class name, replace it with a place like Class.forName('className')
-dontnote
-ignorewarnings ## warnings are ignored
-dontwarn
-keep public class * extends org.springframework.boot.web.support.SpringBootServletInitializer
-keepdirectories ## Keep the package structure
-keepclasseswithmembers public class * { public static void main(java.lang.String[]);} ##Maintain the class of the main method and its method name
-keepclassmembers enum * { *; }  ##Reserving enumeration members and methods
-keepclassmembers class * {
     @org.springframework.beans.factory.annotation.Autowired *;
     @org.springframework.beans.factory.annotation.Qualifier *;
     @org.springframework.beans.factory.annotation.Value *;
     @org.springframework.beans.factory.annotation.Required *;
     @org.springframework.context.annotation.Bean *;
     @org.springframework.context.annotation.Primary *;
     @org.springframework.boot.context.properties.ConfigurationProperties *;
     @org.springframework.boot.context.properties.EnableConfigurationProperties *;
     @javax.inject.Inject *;
     @javax.annotation.PostConstruct *;
     @javax.annotation.PreDestroy *;
}
-keep @org.springframework.cache.annotation.EnableCaching class *
-keep @org.springframework.context.annotation.Configuration class *
-keep @org.springframework.boot.context.properties.ConfigurationProperties class *
-keep @org.springframework.boot.autoconfigure.SpringBootApplication class *

-allowaccessmodification
-keepattributes *Annotation*
-keepdirectories com.jayk.springboot.proguard.obfuscationdemo
-keepdirectories org.springframework.boot.autoconfigure
## Do not change names of the getters and setter, if you remove this ##thymeleaf unable to find the getter and setter i.e: ##${greetingDTO.message}
-keepclassmembers class * {
    *** get*();
    void set*(***);
}

-keepclassmembernames class * {
     java.lang.Class class$(java.lang.String);
     java.lang.Class class$(java.lang.String, boolean);
}

-keepclassmembers enum * {
     public static **[] values();
     public static ** valueOf(java.lang.String);
     public static ** fromValue(java.lang.String);
}

-keepnames class * implements java.io.Serializable
-keepclassmembernames public class com.test.blah.config.liquibase.AsyncSpringLiquibase
-keepclassmembers class * implements java.io.Serializable {
     static final long serialVersionUID;
     private static final java.io.ObjectStreamField[] serialPersistentFields;
     !static !transient <fields>;
     !private <fields>;
     !private <methods>;
     private void writeObject(java.io.ObjectOutputStream);
     private void readObject(java.io.ObjectInputStream);
     java.lang.Object writeReplace();
     java.lang.Object readResolve();
}

-keepclassmembers class * {
     @org.springframework.beans.factory.annotation.Autowired <fields>;
     @org.springframework.beans.factory.annotation.Autowired <methods>;
     @org.springframework.security.access.prepost.PreAuthorize <methods>;
}

```