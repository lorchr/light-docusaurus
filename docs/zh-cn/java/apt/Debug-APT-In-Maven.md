- [Maven中调试Annotation Processor](https://www.jianshu.com/p/e18d648012c2)

# Maven中调试Annotation Processor

[TOC]

## 简述

临时写的记录，日后再补充完整；

不涉及处理器如何开发，如有需要可以参考[ANNOTATION PROCESSING 101](http://hannesdorfmann.com/annotation-processing/annotationprocessing101)；

替代方案：用Gradle开发，比maven简单一些，安卓相关的apt教程泛滥；如有需要可以参考[Debugging an Annotation Processor in your project](https://blog.xmartlabs.com/2016/03/28/Debugging-an-Annotator-Processor-in-your-project/)

## 需求

1. maven 项目

2. 开发了编译时注解的注解处理器

3. 需要调试注解处理器

## 问题

1. 注解处理器能否和项目放一起

目前结论：不能，必须另外创建一个Maven项目写注解处理器再`mvn install`到本地供其他项目使用

2. idea与maven远端调试

3. pom如何关联处理器

## idea远端调试

参见[How to debug a Java Annotation Processor using IntelliJ & Maven](http://blog.jensdriller.com/how-to-debug-a-java-annotation-processor-using-intellij/)，该文主要解决了idea如何设置远端调试

### mvnDebug

调试maven项目使用的编译时注解，在Terminal中输入`mvnDebug`相关的指令，比如`mvnDebug clean package`

执行后会立刻挂起，等待调试器attach（可以想象成安卓开发者模式中的调试器）

### Remote调试器

此时在idea的configuration中选中配置的Remote调试器并点击瓢虫按钮就会给`mvnDebug`挂起的任务attach调试器,任务即会开始执行

stackoverflow上有一po较为完整的流程说明

[Debug Java annotation processors using Intellij and Maven](https://stackoverflow.com/questions/31345893/debug-java-annotation-processors-using-intellij-and-maven)

[TODO]

## pom如何关联处理器

这个花费了最多的时间，国内国外各种答案都没有解决，最后慢慢试出来的

1. maven-compiler-plugin配置下jdk版本

```xml

<plugin>

<artifactId>maven-compiler-plugin</artifactId>

<version>3.7.0</version>

<configuration>

<source>1.8</source>

<target>1.8</target>

</configuration>

</plugin>

```

2. 依赖里声明处理器

```xml

<dependencies>

<!-- The annotation processor -->

<dependency>

<groupId>cn.rexih.java</groupId>

<artifactId>test-anno-processor</artifactId>

<version>1.0-SNAPSHOT</version>

</dependency>

</dependencies>

```

​

3. idea -> settings -> Build,Execution,Deployment -> Complier -> Annotation Processors中enable即可，不用做其他事情

4. 不须要参照其他文章去改pom中`execution`、`process`之类的，越改越有问题

## 其他

1. 在目标项目中如何打断点：

>  目标项目需要关联注解处理器源码，如果有source jar就下载source jar，没有的话选择源码；总而言之是在处理器的源码上打断点。

## 参考资料

[Idea远程调试（mvnDebug,Java命令）](http://blog.sina.com.cn/s/blog_6af189790102wh6c.html)

[自定义注解之编译时注解(RetentionPolicy.CLASS)（一） ](https://blog.csdn.net/github_35180164/article/details/52121038)

作者：云佾风徽
链接：https://www.jianshu.com/p/e18d648012c2
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。