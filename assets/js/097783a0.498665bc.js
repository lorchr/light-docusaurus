"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[2338],{37857:(n,e,a)=>{a.r(e),a.d(e,{assets:()=>c,contentTitle:()=>i,default:()=>g,frontMatter:()=>t,metadata:()=>s,toc:()=>p});var o=a(85893),r=a(11151);const t={},i=void 0,s={id:"zh-cn/spring-boot/Obfuscate-Spring-Boot-Application-With-Proguard",title:"Obfuscate-Spring-Boot-Application-With-Proguard",description:"https://wvengen.github.io/proguard-maven-plugin/",source:"@site/docs/zh-cn/spring-boot/5-Obfuscate-Spring-Boot-Application-With-Proguard.md",sourceDirName:"zh-cn/spring-boot",slug:"/zh-cn/spring-boot/Obfuscate-Spring-Boot-Application-With-Proguard",permalink:"/light-docusaurus/docs/zh-cn/spring-boot/Obfuscate-Spring-Boot-Application-With-Proguard",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/spring-boot/5-Obfuscate-Spring-Boot-Application-With-Proguard.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{},sidebar:"troch",previous:{title:"Obfuscate-Spring-Boot-Application-With-Classfinal",permalink:"/light-docusaurus/docs/zh-cn/spring-boot/Obfuscate-Spring-Boot-Application-With-Classfinal"},next:{title:"Spring-Boot-Endpoints",permalink:"/light-docusaurus/docs/zh-cn/spring-boot/Spring-Boot-Endpoints"}},c={},p=[{value:"1. \u6dfb\u52a0maven\u63d2\u4ef6",id:"1-\u6dfb\u52a0maven\u63d2\u4ef6",level:2},{value:"2. \u7f16\u5199\u914d\u7f6e\u6587\u4ef6",id:"2-\u7f16\u5199\u914d\u7f6e\u6587\u4ef6",level:2}];function l(n){const e={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",...(0,r.ah)(),...n.components};return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(e.p,{children:(0,o.jsx)(e.a,{href:"https://wvengen.github.io/proguard-maven-plugin/",children:"https://wvengen.github.io/proguard-maven-plugin/"})}),"\n",(0,o.jsx)(e.h2,{id:"1-\u6dfb\u52a0maven\u63d2\u4ef6",children:"1. \u6dfb\u52a0maven\u63d2\u4ef6"}),"\n",(0,o.jsx)(e.pre,{children:(0,o.jsx)(e.code,{className:"language-xml",children:'\x3c!-- \u6df7\u6dc6\u63d2\u4ef6 --\x3e\n\x3c!--\n    \u6ce8\u610f\u4e8b\u9879\uff1a\n        1. \u9700\u8981\u5728 spring-boot-maven-plugin\u4e4b\u524d \u5426\u5219\u4e0d\u80fd\u6b63\u786e\u7684\u6df7\u6dc6\u4ee3\u7801\n        2. \u5982\u679c\u8981\u6253\u5305spring boot \u53ef\u6267\u884cjar\uff0c\u4e0d\u80fd\u4fee\u6539outjar\u7684\u540d\u79f0\n        3. \u56e0\u4e3a\u751f\u6210\u7684bean\u540d\u79f0\u90fd\u662f a b c \u53ea\u662f\u5305\u540d\u4e0d\u540c\uff0c\u5728\u5411spring\u6ce8\u5165\u7684\u65f6\u5019\u4f1a\u62a5conflict\n            - -keep public @org.springframework.stereotype.Component class **\n            - \u4f7f\u7528 @Component("beanName") \u66ff\u6362 @Component\n--\x3e\n<plugin>\n    <dependencies>\n        <dependency>\n            <groupId>com.guardsquare</groupId>\n            <artifactId>proguard-base</artifactId>\n            <version>7.3.2</version>\n            <scope>runtime</scope>\n            <optional>true</optional>\n        </dependency>\n        <dependency>\n            <groupId>com.guardsquare</groupId>\n            <artifactId>proguard-core</artifactId>\n            <version>9.0.8</version>\n            <scope>runtime</scope>\n            <optional>true</optional>\n        </dependency>\n    </dependencies>\n    <groupId>com.github.wvengen</groupId>\n    <artifactId>proguard-maven-plugin</artifactId>\n    <version>2.6.0</version>\n    <executions>\n        \x3c!-- \u4ee5\u4e0b\u914d\u7f6e\u8bf4\u660e\u6267\u884cmvn\u7684package\u547d\u4ee4\u65f6\u5019\uff0c\u4f1a\u6267\u884cproguard--\x3e\n        <execution>\n            <phase>package</phase>\n            <goals>\n                <goal>proguard</goal>\n            </goals>\n        </execution>\n    </executions>\n    <configuration>\n        \x3c!--proguard\u7248\u672c--\x3e\n        <proguardVersion>7.3.2</proguardVersion>\n        \x3c!-- \u662f\u5426\u6df7\u6dc6 \u9ed8\u8ba4\u662ftrue --\x3e\n        <obfuscate>true</obfuscate>\n        \x3c!-- \u5c31\u662f\u8f93\u5165Jar\u7684\u540d\u79f0\uff0c\u6211\u4eec\u8981\u77e5\u9053\uff0c\u4ee3\u7801\u6df7\u6dc6\u5176\u5b9e\u662f\u5c06\u4e00\u4e2a\u539f\u59cb\u7684jar\uff0c\u751f\u6210\u4e00\u4e2a\u6df7\u6dc6\u540e\u7684jar\uff0c\u90a3\u4e48\u5c31\u4f1a\u6709\u8f93\u5165\u8f93\u51fa\u3002 --\x3e\n        <injar>${project.build.finalName}.jar</injar>\n        \x3c!-- \u8f93\u51fajar\u540d\u79f0\uff0c\u8f93\u5165\u8f93\u51fajar\u540c\u540d\u7684\u65f6\u5019\u5c31\u662f\u8986\u76d6\uff0c\u4e5f\u662f\u6bd4\u8f83\u5e38\u7528\u7684\u914d\u7f6e\u3002 --\x3e\n        <outjar>${project.build.finalName}.jar</outjar>\n        \x3c!-- \u914d\u7f6e\u4e00\u4e2a\u6587\u4ef6\uff0c\u901a\u5e38\u53eb\u505aproguard.cfg,\u8be5\u6587\u4ef6\u4e3b\u8981\u662f\u914d\u7f6eoptions\u9009\u9879\uff0c\u4e5f\u5c31\u662f\u8bf4\u4f7f\u7528proguard.cfg\u90a3\u4e48options\u4e0b\u7684\u6240\u6709\u5185\u5bb9\u90fd\u53ef\u4ee5\u79fb\u5230proguard.cfg\u4e2d --\x3e\n        <proguardInclude>proguard.cfg</proguardInclude>\n        \x3c!-- \u8fd9\u662f\u8f93\u51fa\u8def\u5f84\u914d\u7f6e\uff0c\u4f46\u662f\u8981\u6ce8\u610f\u8fd9\u4e2a\u8def\u5f84\u5fc5\u987b\u8981\u5305\u62ecinjar\u6807\u7b7e\u586b\u5199\u7684jar --\x3e\n        <outputDirectory>${project.basedir}/target</outputDirectory>\n        \x3c!-- \u989d\u5916\u7684jar\u5305\uff0c\u901a\u5e38\u662f\u9879\u76ee\u7f16\u8bd1\u6240\u9700\u8981\u7684jar --\x3e\n        <libs>\n            <lib>${java.home}/jmods/</lib>\n        </libs>\n        \x3c!-- \u5bf9\u8f93\u5165jar\u8fdb\u884c\u8fc7\u6ee4\u6bd4\u5982\uff0c\u5982\u4e0b\u914d\u7f6e\u5c31\u662f\u5bf9META-INFO\u6587\u4ef6\u4e0d\u5904\u7406\u3002 --\x3e\n\x3c!--                    <inLibsFilter>!META-INF/**,!META-INF/versions/17/**.class</inLibsFilter>--\x3e\n        \x3c!--\u8fd9\u91cc\u7279\u522b\u91cd\u8981\uff0c\u6b64\u5904\u4e3b\u8981\u662f\u914d\u7f6e\u6df7\u6dc6\u7684\u4e00\u4e9b\u7ec6\u8282\u9009\u9879\uff0c\u6bd4\u5982\u54ea\u4e9b\u7c7b\u4e0d\u9700\u8981\u6df7\u6dc6\uff0c\u54ea\u4e9b\u9700\u8981\u6df7\u6dc6--\x3e\n        <options>\n            \x3c!-- \u53ef\u4ee5\u5728\u6b64\u5904\u5199option\u6807\u7b7e\u914d\u7f6e\uff0c\u4e0d\u8fc7\u6211\u4e0a\u9762\u4f7f\u7528\u4e86proguardInclude\uff0c\u6545\u800c\u6211\u66f4\u559c\u6b22\u5728proguard.cfg\u4e2d\u914d\u7f6e --\x3e\n        </options>\n        <injarNotExistsSkip>true</injarNotExistsSkip>\n    </configuration>\n</plugin>\n\x3c!-- maven \u6253\u5305\u65f6\u8df3\u8fc7\u6d4b\u8bd5 --\x3e\n<plugin>\n    <groupId>org.apache.maven.plugins</groupId>\n    <artifactId>maven-surefire-plugin</artifactId>\n    <configuration>\n        <skip>true</skip>\n    </configuration>\n</plugin>\n\x3c!-- Spring Boot\u6253\u5305 --\x3e\n<plugin>\n    <groupId>org.springframework.boot</groupId>\n    <artifactId>spring-boot-maven-plugin</artifactId>\n    <executions>\n        <execution>\n            <goals>\n                <goal>repackage</goal>\n            </goals>\n        </execution>\n    </executions>\n    <configuration>\n        <mainClass>com.light.cloud.service.demo.ServiceDemoApplication</mainClass>\n    </configuration>\n</plugin>\n'})}),"\n",(0,o.jsx)(e.h2,{id:"2-\u7f16\u5199\u914d\u7f6e\u6587\u4ef6",children:"2. \u7f16\u5199\u914d\u7f6e\u6587\u4ef6"}),"\n",(0,o.jsx)(e.pre,{children:(0,o.jsx)(e.code,{className:"language-conf",children:"# https://www.guardsquare.com/manual/configuration/usage\n# \u6307\u5b9aJava\u7684\u7248\u672c \u4ec5\u9488\u5bf91.8\u4e4b\u524d\uff0c1.8\u4e4b\u540e\u4e0d\u9700\u8981\n# -target 1.8\n#-verbose\n# proguard\u4f1a\u5bf9\u4ee3\u7801\u8fdb\u884c\u4f18\u5316\u538b\u7f29\uff0c\u4ed6\u4f1a\u5220\u9664\u4ece\u672a\u4f7f\u7528\u7684\u7c7b\u6216\u8005\u7c7b\u6210\u5458\u53d8\u91cf\u7b49\n-dontshrink\n# \u662f\u5426\u5173\u95ed\u5b57\u8282\u7801\u7ea7\u522b\u7684\u4f18\u5316\uff0c\u5982\u679c\u4e0d\u5f00\u542f\u5219\u8bbe\u7f6e\u5982\u4e0b\u914d\u7f6e\n-dontoptimize\n# \u4e0d\u8df3\u8fc7\u975e\u516c\u5171\u7684\u7c7b\u53ca\u6210\u5458\u53d8\u91cf\n-dontskipnonpubliclibraryclasses\n-dontskipnonpubliclibraryclassmembers\n# \u6df7\u6dc6\u65f6\u5141\u8bb8\u8bbf\u95ee\u5e76\u4fee\u6539\u6709\u4fee\u9970\u7b26\u7684\u7c7b\u548c\u6210\u5458\n-allowaccessmodification\n# \u5bf9\u4e8e\u7c7b\u6210\u5458\u7684\u547d\u540d\u7684\u6df7\u6dc6\u91c7\u53d6\u552f\u4e00\u7b56\u7565\n-useuniqueclassmembernames\n# \u6df7\u6dc6\u65f6\u4e0d\u751f\u6210\u5927\u5c0f\u5199\u6df7\u5408\u7684\u7c7b\u540d\uff0c\u9ed8\u8ba4\u662f\u53ef\u4ee5\u5927\u5c0f\u5199\u6df7\u5408\n-dontusemixedcaseclassnames\n# \u4e0d\u6df7\u6dc6\u6240\u6709\u5305\u540d \u5305\u540d\u6df7\u6dc6\u540e\u95ee\u9898\u592a\u591a \u5982aop\u62e6\u622a\u5904\u7406controller\u7b49\n-keeppackagenames\n# \u4e0d\u6df7\u6dc6\u6587\u4ef6\u5939\u540d\u79f0\n# -keepdirectories\n# \u6df7\u6dc6\u7c7b\u540d\u4e4b\u540e\uff0c\u5bf9\u4f7f\u7528Class.forName('className')\u4e4b\u7c7b\u7684\u5730\u65b9\u8fdb\u884c\u76f8\u5e94\u66ff\u4ee3\n-adaptclassstrings\n\n#\u5ffd\u7565warn\u6d88\u606f\n-ignorewarnings\n#\u5ffd\u7565note\u6d88\u606f\n-dontnote **\n#\u6253\u5370\u914d\u7f6e\u4fe1\u606f\n-printconfiguration\n\n# \u5bf9\u5f02\u5e38\u3001\u6ce8\u89e3\u4fe1\u606f\u4e88\u4ee5\u4fdd\u7559\n-keepattributes Exceptions,InnerClasses,Signature,Deprecated,SourceFile,LineNumberTable,LocalVaribable*Table,*Annotation*,Synthetic,EnclosingMethod\n# \u6b64\u9009\u9879\u5c06\u4fdd\u5b58\u63a5\u53e3\u4e2d\u7684\u6240\u6709\u539f\u59cb\u540d\u79f0\uff08\u4e0d\u6df7\u6dc6\uff09--\x3e\n-keepnames interface ** { *; }\n# \u6b64\u9009\u9879\u5c06\u4fdd\u5b58\u6240\u6709\u8f6f\u4ef6\u5305\u4e2d\u7684\u6240\u6709\u539f\u59cb\u63a5\u53e3\u6587\u4ef6\uff08\u4e0d\u8fdb\u884c\u6df7\u6dc6\uff09\n#-keep interface * extends * { *; }\n#\u4fdd\u7559\u53c2\u6570\u540d\uff0c\u56e0\u4e3a\u63a7\u5236\u5668\uff0c\u6216\u8005Mybatis\u7b49\u63a5\u53e3\u7684\u53c2\u6570\u5982\u679c\u6df7\u6dc6\u4f1a\u5bfc\u81f4\u65e0\u6cd5\u63a5\u53d7\u53c2\u6570\uff0cxml\u6587\u4ef6\u627e\u4e0d\u5230\u53c2\u6570\n-keepparameternames\n# \u4fdd\u7559\u679a\u4e3e\u6210\u5458\u53ca\u65b9\u6cd5\n-keepclassmembers enum * { *; }\n# \u4e0d\u6df7\u6dc6get set\u65b9\u6cd5\uff0c\u9632\u6b62\u5e8f\u5217\u5316\u53cd\u5e8f\u5217\u5316\u5f02\u5e38\n-keepclassmembers public class * { void set*(***); *** get*(); }\n# \u4e0d\u6df7\u6dc6\u6240\u6709\u7c7b,\u4fdd\u5b58\u539f\u59cb\u5b9a\u4e49\u7684\u6ce8\u91ca-\n-keepclassmembers class * {\n    @org.springframework.context.annotation.Bean *;\n    @org.springframework.beans.factory.annotation.Autowired *;\n    @org.springframework.beans.factory.annotation.Value *;\n    @org.springframework.stereotype.Service *;\n    @org.springframework.stereotype.Component *;\n}\n\n# \u4e0d\u6df7\u6dc6\u542f\u52a8\u7c7b\n-keep public class com.light.cloud.service.demo.ServiceDemoApplication {\n        public static void main(java.lang.String[]);\n    }\n\n-keep @org.springframework.stereotype.Component class **\n-keep @org.springframework.stereotype.Controller class **\n-keep @org.springframework.stereotype.Repository class **\n-keep @org.springframework.web.bind.annotation.RestController class **\n-keep @org.springframework.context.annotation.Configuration class **\n\n# This option will save all original class files (without obfuscate) in service package\n# -keep class com.slm.proguard.example.spring.boot.service { *; }\n# This option will save all original interfaces files (without obfuscate) in all packages.\n-keep interface * extends * { *; }\n# This option will save all original defined annotations in all classes in all packages.\n-keep class com.light.cloud.service.demo.config.**\n-keep class com.fasterxml.jackson.** { *; }\n-keep class org.json.JSONObject.** {** put(java.lang.String,java.util.Map);}\n\n-dontwarn com.fasterxml.jackson.databind.**\n-dontwarn com.fasterxml.jackson.**\n"})}),"\n",(0,o.jsx)(e.p,{children:"\u914d\u7f6e\u6587\u4ef6\u53c2\u8003"}),"\n",(0,o.jsx)(e.pre,{children:(0,o.jsx)(e.code,{className:"language-conf",children:"# https://medium.com/@ijayakantha/obfuscate-spring-boot-2-applications-with-proguard-a8a76586b11f\n\n-target 1.8 ##Specify the java version number\n-dontshrink ##Default is enabled, here the shrink is turned off, that is, the unused classes/members are not deleted.\n-dontoptimize ##Default is enabled, here to turn off bytecode level optimization\n-useuniqueclassmembernames ## Take a unique strategy for confusing the naming of class members\n-adaptclassstrings ## After confusing the class name, replace it with a place like Class.forName('className')\n-dontnote\n-ignorewarnings ## warnings are ignored\n-dontwarn\n-keep public class * extends org.springframework.boot.web.support.SpringBootServletInitializer\n-keepdirectories ## Keep the package structure\n-keepclasseswithmembers public class * { public static void main(java.lang.String[]);} ##Maintain the class of the main method and its method name\n-keepclassmembers enum * { *; }  ##Reserving enumeration members and methods\n-keepclassmembers class * {\n     @org.springframework.beans.factory.annotation.Autowired *;\n     @org.springframework.beans.factory.annotation.Qualifier *;\n     @org.springframework.beans.factory.annotation.Value *;\n     @org.springframework.beans.factory.annotation.Required *;\n     @org.springframework.context.annotation.Bean *;\n     @org.springframework.context.annotation.Primary *;\n     @org.springframework.boot.context.properties.ConfigurationProperties *;\n     @org.springframework.boot.context.properties.EnableConfigurationProperties *;\n     @javax.inject.Inject *;\n     @javax.annotation.PostConstruct *;\n     @javax.annotation.PreDestroy *;\n}\n-keep @org.springframework.cache.annotation.EnableCaching class *\n-keep @org.springframework.context.annotation.Configuration class *\n-keep @org.springframework.boot.context.properties.ConfigurationProperties class *\n-keep @org.springframework.boot.autoconfigure.SpringBootApplication class *\n\n-allowaccessmodification\n-keepattributes *Annotation*\n-keepdirectories com.jayk.springboot.proguard.obfuscationdemo\n-keepdirectories org.springframework.boot.autoconfigure\n## Do not change names of the getters and setter, if you remove this ##thymeleaf unable to find the getter and setter i.e: ##${greetingDTO.message}\n-keepclassmembers class * {\n    *** get*();\n    void set*(***);\n}\n\n-keepclassmembernames class * {\n     java.lang.Class class$(java.lang.String);\n     java.lang.Class class$(java.lang.String, boolean);\n}\n\n-keepclassmembers enum * {\n     public static **[] values();\n     public static ** valueOf(java.lang.String);\n     public static ** fromValue(java.lang.String);\n}\n\n-keepnames class * implements java.io.Serializable\n-keepclassmembernames public class com.test.blah.config.liquibase.AsyncSpringLiquibase\n-keepclassmembers class * implements java.io.Serializable {\n     static final long serialVersionUID;\n     private static final java.io.ObjectStreamField[] serialPersistentFields;\n     !static !transient <fields>;\n     !private <fields>;\n     !private <methods>;\n     private void writeObject(java.io.ObjectOutputStream);\n     private void readObject(java.io.ObjectInputStream);\n     java.lang.Object writeReplace();\n     java.lang.Object readResolve();\n}\n\n-keepclassmembers class * {\n     @org.springframework.beans.factory.annotation.Autowired <fields>;\n     @org.springframework.beans.factory.annotation.Autowired <methods>;\n     @org.springframework.security.access.prepost.PreAuthorize <methods>;\n}\n\n"})})]})}function g(n={}){const{wrapper:e}={...(0,r.ah)(),...n.components};return e?(0,o.jsx)(e,{...n,children:(0,o.jsx)(l,{...n})}):l(n)}},11151:(n,e,a)=>{a.d(e,{ah:()=>t});var o=a(67294);const r=o.createContext({});function t(n){const e=o.useContext(r);return o.useMemo((()=>"function"==typeof n?n(e):{...e,...n}),[e,n])}}}]);