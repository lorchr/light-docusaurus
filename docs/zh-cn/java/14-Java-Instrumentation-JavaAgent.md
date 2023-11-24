- [字节码调试的入口 —— JVM 的寄生插件 javaagent 那些事](https://mp.weixin.qq.com/s/fBVUU_kZU5LirIhSAihhoA)

## Java Instrumentation 包
### Java Instrumentation 概述
Java Instrumentation 这个技术看起来非常神秘，很少有书会详细介绍。但是有很多工具是基于 Instrumentation 来实现的：

- APM 产品: pinpoint、skywalking、newrelic、听云的 APM 产品等都基于 Instrumentation 实现
- 热部署工具：Intellij idea 的 HotSwap、Jrebel 等
- Java 诊断工具：Arthas、Btrace 等

由于对字节码修改功能的巨大需求，JDK 从 JDK5 版本开始引入了`java.lang.instrument` 包。它可以通过 `addTransformer` 方法设置一个 `ClassFileTransformer`，可以在这个 `ClassFileTransformer` 实现类的转换。

JDK 1.5 支持静态 `Instrumentation`，基本的思路是在 JVM 启动的时候添加一个代理（javaagent），每个代理是一个 jar 包，其 `MANIFEST.MF` 文件里指定了代理类，这个代理类包含一个 `premain` 方法。JVM 在类加载时候会先执行代理类的 premain 方法，再执行 Java 程序本身的 main 方法，这就是 `premain` 名字的来源。在 `premain` 方法中可以对加载前的 class 文件进行修改。这种机制可以认为是虚拟机级别的 AOP，无需对原有应用做任何修改，就可以实现类的动态修改和增强。

从 JDK 1.6 开始支持更加强大的动态 `Instrument`，在JVM 启动后通过 `Attach API` 远程加载，后面会详细介绍。

本文会分为 `javaagent` 和动态 `Attach` 两个部分来介绍

### Java Instrumentation 核心方法
Instrumentation 是 java.lang.instrument 包下的一个接口，这个接口的方法提供了注册类文件转换器、获取所有已加载的类等功能，允许我们在对已加载和未加载的类进行修改，实现 AOP、性能监控等功能。

常用的方法如下：
```java
/**
 * 为 Instrumentation 注册一个类文件转换器，可以修改读取类文件字节码
 */
void addTransformer(ClassFileTransformer transformer, boolean canRetransform);

/**
 * 对JVM已经加载的类重新触发类加载
 */
void retransformClasses(Class<?>... classes) throws UnmodifiableClassException;

/**
 * 获取当前 JVM 加载的所有类对象
 */
Class[] getAllLoadedClasses()
```

它的 addTransformer 给 Instrumentation 注册一个 transformer，transformer 是 ClassFileTransformer 接口的实例，这个接口就只有一个 transform 方法，调用 addTransformer 设置 transformer 以后，后续JVM 加载所有类之前都会被这个 transform 方法拦截，这个方法接收原类文件的字节数组，返回转换过的字节数组，在这个方法中可以做任意的类文件改写。

下面是一个空的 ClassFileTransformer 的实现：
```java
public class MyClassTransformer implements ClassFileTransformer {
    @Override
    public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classBytes) throws IllegalClassFormatException {
        // 在这里读取、转换类文件
        return classBytes;
    }
}
```

接下来我们来介绍本文的主角之一 javaagent。

## Javaagent 介绍
Javaagent 是一个特殊的 jar 包，它并不能单独启动的，而必须依附于一个 JVM 进程，可以看作是 JVM 的一个寄生插件，使用 Instrumentation 的 API 用来读取和改写当前 JVM 的类文件。

### Agent 的两种使用方式
它有两种使用方式：

- 在 JVM 启动的时候加载，通过 javaagent 启动参数 java -javaagent:myagent.jar MyMain，这种方式在程序 main 方法执行之前执行 agent 中的 premain 方法
- 在 JVM 启动后 Attach，通过 Attach API 进行加载，这种方式会在 agent 加载以后执行 agentmain 方法 premain 和 agentmain 方法签名如下：
```java
public static void premain(String agentArgument, Instrumentation instrumentation) throws Exception

public static void agentmain(String agentArgument, Instrumentation instrumentation) throws Exception
```

这两个方法都有两个参数

- 第一个 `agentArgument` 是 `agent` 的启动参数，可以在 JVM 启动命令行中设置，比如java `-javaagent:<jarfile>=appId:agent-demo,agentType:singleJar test.jar`的情况下 `agentArgument` 的值为 "`appId:agent-demo,agentType:singleJar`"。

- 第二个 instrumentation 是 `java.lang.instrument.Instrumentation` 的实例，可以通过 `addTransformer` 方法设置一个 `ClassFileTransformer`。

第一种 premain 方式的加载时序如下：

图片

### Agent 打包
为了能够以 javaagent 的方式运行 `premain` 和 `agentmain` 方法，我们需要将其打包成 jar 包，并在其中的 MANIFEST.MF 配置文件中，指定 `Premain-class` 等信息，一个典型的生成好的 `MANIFEST.MF` 内容如下

下面是一个可以帮助生成上面 `MANIFEST.MF` 的 maven 配置
```xml
<build>
  <finalName>my-javaagent</finalName>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-jar-plugin</artifactId>
      <configuration>
        <archive>
          <manifestEntries>
            <Agent-Class>me.geek01.javaagent.AgentMain</Agent-Class>
            <Premain-Class>me.geek01.javaagent.AgentMain</Premain-Class>
            <Can-Redefine-Classes>true</Can-Redefine-Classes>
            <Can-Retransform-Classes>true</Can-Retransform-Classes>
          </manifestEntries>
        </archive>
      </configuration>
    </plugin>
  </plugins>
</build>
```

### Agent 使用方式一：JVM 启动参数
下面使用 javaagent 实现简单的函数调用栈跟踪，以下面的代码为例：
```java
public class MyTest {
    public static void main(String[] args) {
        new MyTest().foo();
    }
    public void foo() {
        bar1();
        bar2();
    }

    public void bar1() {
    }

    public void bar2() {
    }
}
```

通过 javaagent 启动参数的方式在每个函数进入和结束时都打印一行日志，实现调用过程的追踪的效果。

核心的方法 instrument 的逻辑如下：
```java
public static class MyMethodVisitor extends AdviceAdapter {

    @Override
    protected void onMethodEnter() {
        // 在方法开始处插入 <<<enter xxx
        mv.visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
        mv.visitLdcInsn("<<<enter " + this.getName());
        mv.visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println", "(Ljava/lang/String;)V", false);
        super.onMethodEnter();
    }

    @Override
    protected void onMethodExit(int opcode) {
        super.onMethodExit(opcode);
        // 在方法结束处插入 <<<exit xxx
        mv.visitFieldInsn(GETSTATIC, "java/lang/System", "out", "Ljava/io/PrintStream;");
        mv.visitLdcInsn(">>>exit " + this.getName());
        mv.visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println", "(Ljava/lang/String;)V", false);
    }
}
```

把 agent 打包生成 my-trace-agent.jar，添加 agent 启动 MyTest 类
```java
java -javaagent:/path_to/my-trace-agent.jar MyTest
```

可以看到输出结果如下：
```shell
<<<enter main
<<<enter foo
<<<enter bar1
>>>exit bar1
<<<enter bar2
>>>exit bar2
>>>exit foo
>>>exit main
```

通过上面的方式，我们在不修改 MyTest 类源码的情况下实现了调用链跟踪的效果。更加健壮和完善的调用链跟踪实现会在后面的 APM 章节详细介绍。

### Agent 使用方式二：Attach API 使用
在 JDK5 中，开发者只能 JVM 启动时指定一个 javaagent 在 premain 中操作字节码，Instrumentation 也仅限于 main 函数执行前，这样的方式存在一定的局限性。从 JDK6 开始引入了动态 Attach Agent 的方案，除了在命令行中指定 javaagent，现在可以通过 Attach API 远程加载。我们常用的 jstack、arthas 等工具都是通过 Attach 机制实现的。

接下来我们会结合跨进程通信中的信号和 Unix 域套接字来看 JVM Attach API 的实现原理

#### JVM Attach API 基本使用
下面以一个实际的例子来演示动态 Attach API 的使用，代码中有一个 main 方法，每隔 3s 输出 foo 方法的返回值 100，接下来动态 Attach 上 MyTestMain 进程，修改 foo 的字节码，让 foo 方法返回 50。

```java
public class MyTestMain {
    public static void main(String[] args) throws InterruptedException {
        while (true) {
            System.out.println(foo());
            TimeUnit.SECONDS.sleep(3);
        }
    }

    public static int foo() {
        return 100; // 修改后 return 50;
    }
}
```
步骤如下：

1. 编写 Attach Agent，对 foo 方法做注入，完整的代码见：github.com/arthur-zhan…

动态 Attach 的 agent 与通过 JVM 启动 javaagent 参数指定的 agent jar 包的方式有所不同，动态 Attach 的 agent 会执行 agentmain 方法，而不是 premain 方法。
```java
public class AgentMain {
    public static void agentmain(String agentArgs, Instrumentation inst) throws ClassNotFoundException, UnmodifiableClassException {
        System.out.println("agentmain called");
        inst.addTransformer(new MyClassFileTransformer(), true);
        Class classes[] = inst.getAllLoadedClasses();
        for (int i = 0; i < classes.length; i++) {
            if (classes[i].getName().equals("MyTestMain")) {
                System.out.println("Reloading: " + classes[i].getName());
                inst.retransformClasses(classes[i]);
                break;
            }
        }
    }
}
```

2. 因为是跨进程通信，Attach 的发起端是一个独立的 java 程序，这个 java 程序会调用 VirtualMachine.attach 方法开始和目标 JVM 进行跨进程通信。
```java
public class MyAttachMain {
    public static void main(String[] args) throws Exception {
        VirtualMachine vm = VirtualMachine.attach(args[0]);
        try {
            vm.loadAgent("/path/to/agent.jar");
        } finally {
            vm.detach();
        }
    }
}
```

使用 jps 查询到 MyTestMain 的进程 id，
```shell
java -cp /path/to/your/tools.jar:. MyAttachMain pid
```

可以看到 MyTestMain 的输出的 foo 方法已经返回了 50。
```shell
java -cp . MyTestMain

100
100
100
agentmain called
Reloading: MyTestMain
50
50
50
```

### JVM Attach 过程分析
执行 MyAttachMain，当指定一个不存在的 JVM 进程时，会出现如下的错误：
```shell
java -cp /path/to/your/tools.jar:. MyAttachMain 1234
Exception in thread "main" java.io.IOException: No such process
	at sun.tools.attach.LinuxVirtualMachine.sendQuitTo(Native Method)
	at sun.tools.attach.LinuxVirtualMachine.<init>(LinuxVirtualMachine.java:91)
	at sun.tools.attach.LinuxAttachProvider.attachVirtualMachine(LinuxAttachProvider.java:63)
	at com.sun.tools.attach.VirtualMachine.attach(VirtualMachine.java:208)
	at MyAttachMain.main(MyAttachMain.java:8)
```

可以看到 `VirtualMachine.attach` 最终调用了 `sendQuitTo` 方法，这是一个 native 的方法，底层就是发送了 SIGQUIT 信号给目标 JVM 进程。

前面信号部分我们介绍过，JVM 对 SIGQUIT 的默认行为是 dump 当前的线程堆栈，那为什么调用 VirtualMachine.attach 没有输出调用栈堆栈呢？

对于 Attach 的发起方，假设目标进程为 12345，这部分的详细的过程如下：

1. Attach 端检查临时文件目录是否有 .java_pid12345 文件

这个文件是一个 UNIX 域套接字文件，由 Attach 成功以后的目标 JVM 进程生成。如果这个文件存在，说明正在 Attach 中，可以用这个 socket 进行下一步的通信。如果这个文件不存在则创建一个 .attach_pid12345 文件，这部分的伪代码如下：
```java
String tmpdir = "/tmp";
File socketFile = new File(tmpdir,  ".java_pid" + pid);
if (socketFile.exists()) {
    File attachFile = new File(tmpdir, ".attach_pid" + pid);
    createAttachFile(attachFile.getPath());
}
```

2. Attach 端检查如果没有 .java_pid12345 文件，创建完 .attach_pid12345 文件以后发送 SIGQUIT 信号给目标 JVM。然后每隔 200ms 检查一次 socket 文件是否已经生成，5s 以后还没有生成则退出，如果有生成则进行 socket 通信

3. 对于目标 JVM 进程而言，它的 Signal Dispatcher 线程收到 SIGQUIT 信号以后，会检查 .attach_pid12345 文件是否存在。

- 目标 JVM 如果发现 .attach_pid12345 不存在，则认为这不是一个 attach 操作，执行默认行为，输出当前所有线程的堆栈
- 目标 JVM 如果发现 .attach_pid12345 存在，则认为这是一个 attach 操作，会启动 Attach Listener 线程，负责处理 Attach 请求，同时创建名为 .java_pid12345 的 socket 文件，监听 socket。源码中 `/hotspot/src/share/vm/runtime/os.cpp` 这一部分处理的逻辑如下：
```cpp
#define SIGBREAK SIGQUIT

static void signal_thread_entry(JavaThread* thread, TRAPS) {
  while (true) {
    int sig;
    {
    switch (sig) {
      case SIGBREAK: { 
        // Check if the signal is a trigger to start the Attach Listener - in that
        // case don't print stack traces.
        if (!DisableAttachMechanism && AttachListener::is_init_trigger()) {
          continue;
        }
        ...
        // Print stack traces
    }
}
```

AttachListener 的 is_init_trigger 在 .attach_pid12345 文件存在的情况下会新建 .java_pid12345 套接字文件，同时监听此套接字，准备 Attach 端发送数据。

那 Attach 端和目标进程用 socket 传递了什么信息呢？可以通过 strace 的方式看到 Attach 端究竟往 socket 里面写了什么：
```shell
sudo strace -f java -cp /usr/local/jdk/lib/tools.jar:. MyAttachMain 12345  2> strace.out

...
5841 [pid  3869] socket(AF_LOCAL, SOCK_STREAM, 0) = 5
5842 [pid  3869] connect(5, {sa_family=AF_LOCAL, sun_path="/tmp/.java_pid12345"}, 110)      = 0
5843 [pid  3869] write(5, "1", 1)            = 1
5844 [pid  3869] write(5, "\0", 1)           = 1
5845 [pid  3869] write(5, "load", 4)         = 4
5846 [pid  3869] write(5, "\0", 1)           = 1
5847 [pid  3869] write(5, "instrument", 10)  = 10
5848 [pid  3869] write(5, "\0", 1)           = 1
5849 [pid  3869] write(5, "false", 5)        = 5
5850 [pid  3869] write(5, "\0", 1)           = 1
5855 [pid  3869] write(5, "/home/ya/agent.jar"..., 18 <unfinished ...>
```

可以看到往 socket 写入的内容如下：
```shell
1
\0
load
\0
instrument
\0
false
\0
/home/ya/agent.jar
\0
```

数据之间用 `\0` 字符分隔，第一行的 1 表示协议版本，接下来是发送指令 "`load instrument false /home/ya/agent.jar`" 给目标 JVM，目标 JVM 收到这些数据以后就可以加载相应的 agent jar 包进行字节码的改写。

如果从 socket 的角度来看，`VirtualMachine.attach` 方法相当于三次握手建连，`VirtualMachine.loadAgent` 则是握手成功之后发送数据，`VirtualMachine.detach` 相当于四次挥手断开连接。

这个过程如下图所示：

图片

## 小结
本文讲解了 javaagent，一起来回顾一下要点：

- 第一，javaagent 是一个使用 instrumentation 的 API 用来改写类文件的 jar 包，可以看作是 JVM 的一个寄生插件。
- 第二，javaagent 有两个重要的入口类：Premain-Class 和 Agent-Class，分别对应入口函数 premain 和 agentmain，其中 agentmain 可以采用远程 attach API 的方式远程挂载另一个 JVM 进程。
