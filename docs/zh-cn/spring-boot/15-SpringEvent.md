- [Spring的解耦语法糖Event你还不知道吗?](https://blog.csdn.net/weixin_42653522/article/details/117151913)
- [Spring Event 业务解耦神器，大大提高可扩展性，刷爆了！](https://mp.weixin.qq.com/s/K57BtI4fhdzO_-_xQ-jB5g)

## 前言
ApplicationContext 中的事件处理是通过 ApplicationEvent 类和 ApplicationListener 接口提供的。如果将实现了 ApplicationListener 接口的 bean 部署到容器中，则每次将 ApplicationEvent 发布到ApplicationContext 时，都会通知到该 bean，这简直是典型的观察者模式。设计的初衷就是为了系统业务逻辑之间的解耦，提高可扩展性以及可维护性。

### Spring 中提供了以下的事件

| Event                 | Describtion                                                                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ContextRefreshedEvent | ApplicationContext 被初始化或刷新时，该事件被发布。这也可以在 ConfigurableApplicationContext 接口中使用 refresh() 方法来发生                                                 |
| ContextStartedEvent   | 当使用 ConfigurableApplicationContext 接口中的 start() 方法启动 ApplicationContext时，该事件被发布。你可以调查你的数据库，或者你可以在接受到这个事件后重启任何停止的应用程序 |
| ContextStoppedEvent                    | 当使用 ConfigurableApplicationContext 接口中的 stop() 方法停止 ApplicationCoontext时，发布这个事件。你可以在接受到这个事件后做必要的清理的工作 |
| ContextClosedEvent | 使用 ConfigurableApplicationContext 接口中的 close() 方法关闭 ApplicationCoontext时，该事件被发布。一个已关闭的上下文到达生命周期末端;它不能被刷新或重启|
|RequestHandledEvent |这是一个 web-specific 事件,告诉所有 bean HTTP 请求已经被服务 |
|ServletRequestHandledEvent |RequestHandledEvent的一个子类,用于添加特定于Servlet的上下文信息。 |

## ApplicationEvent 与 ApplicationListener 应用
### 实现
1、自定义事件类，基于 ApplicationEvent 实现扩展

```java
public class DemoEvent extends ApplicationEvent {
    private static final long serialVersionUID = -2753705718295396328L;
    private String msg;

    public DemoEvent(Object source, String msg) {
        super(source);
        this.msg = msg;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }
}
```

2、定义 Listener 类，实现 ApplicationListener接口，并且注入到 IOC 中。等发布者发布事件时，都会通知到这个bean，从而达到监听的效果。

```java
@Component
public class DemoListener implements ApplicationListener<DemoEvent> {
    @Override
    public void onApplicationEvent(DemoEvent demoEvent) {
        String msg = demoEvent.getMsg();
        System.out.println("bean-listener 收到了 publisher 发布的消息: " + msg);
    }
}
```

3、要发布上述自定义的 event，需要调用 ApplicationEventPublisher 的 publishEvent 方法，我们可以定义一个实现 ApplicationEventPublisherAware 的类，并注入 IOC来进行调用。

```java
@Component
public class DemoPublisher implements ApplicationEventPublisherAware {

    private ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public void sendMsg(String msg) {
        applicationEventPublisher.publishEvent(new DemoEvent(this, msg));
    }
}
```

4、客户端调用 publisher

```java
@RestController
@RequestMapping("/event")
public class DemoClient implements ApplicationContextAware {
    private ApplicationContext applicationContext;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }

    @GetMapping("/publish")
    public void publish(){
        DemoPublisher bean = applicationContext.getBean(DemoPublisher.class);
        bean.sendMsg("发布者发送消息......");
    }
}
```

输出结果：
```shell
bean-listener 收到了 publisher 发布的消息: 发布者发送消息......
```

### 基于注解
我们可以不用实现 AppplicationListener 接口 ，在方法上使用 @EventListener 注册事件。如果你的方法应该侦听多个事件，并不使用任何参数来定义，可以在 @EventListener 注解上指定多个事件。

重写 DemoListener 类如下：
```java
public class DemoListener {
    @EventListener(value = {DemoEvent.class, TestEvent.class})
    public void processApplicationEvent(DemoEvent event) {
        String msg = event.getMsg();
        System.out.println("bean-listener 收到了 publisher 发布的消息: " + msg);
    }
}
```

### 事件过滤
如果希望通过一定的条件对事件进行过滤，可以使用 @EventListener 的 condition 属性。以下实例中只有 event 的 msg 属性是 my-event 时才会进行调用。
```java
@EventListener(value = {DemoEvent.class, TestEvent.class}, condition = "#event.msg == 'my-event'")
public void processApplicationEvent(DemoEvent event) {
     String msg = event.getMsg();
     System.out.println("bean-listener 收到了 publisher 发布的消息: " + msg);
 }
```

此时，发送符合条件的消息，listener 才会侦听到 publisher 发布的消息。
```shell
bean-listener 收到了 publisher 发布的消息: my-event
```

### 异步事件监听
前面提到的都是同步处理事件，那如果我们希望某个特定的侦听器异步去处理事件，如何做？

使用 @Async 注解可以实现类内方法的异步调用，这样方法在执行的时候，将会在独立的线程中被执行，调用者无需等待它的完成，即可继续其他的操作。

```java
@EventListener
@Async
public void processApplicationEvent(DemoEvent event) {
    String msg = event.getMsg();
    System.out.println("bean-listener 收到了 publisher 发布的消息: " + msg);
}
```
使用异步监听时，有两点需要注意：

- 如果异步事件抛出异常，则不会将其传播到调用方。
- 异步事件监听方法无法通过返回值来发布后续事件，如果需要作为处理结果发布另一个事件，请插入 ApplicationEventPublisher 以手动发布事件

## 好处及应用场景
ApplicationContext 在运行期会自动检测到所有实现了 ApplicationListener 的 bean，并将其作为事件接收对象。当我们与 spring 上下文交互触发 publishEvent 方法时，每个实现了 ApplicationListener 的 bean 都会收到 ApplicationEvent 对象，每个 ApplicationListener 可以根据需要只接收自己感兴趣的事件。

这样做有什么好处呢？

在传统的项目中，各个业务逻辑之间耦合性比较强，controller 和 service 间都是关联关系，然而，使用 ApplicationEvent 监听 publisher 这种方式，类间关系是什么样的？我们不如画张图来看看。

DemoPublisher 和 DemoListener 两个类间并没有直接关联，解除了传统业务逻辑两个类间的关联关系，将耦合降到最小。这样在后期更新、维护时难度大大降低了。

图片
ApplicationEvent 使用观察者模式实现，那什么时候适合使用观察者模式呢？观察者模式也叫 发布-订阅模式，例如，微博的订阅，我们订阅了某些微博账号，当这些账号发布消息时，我们都会收到通知。

总结来说，定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新，从而实现广播的效果。

## 源码阅读
图片
Spring中的事件机制流程

1、ApplicationEventPublisher是Spring的事件发布接口，事件源通过该接口的pulishEvent方法发布事件

2、ApplicationEventMulticaster就是Spring事件机制中的事件广播器，它默认提供一个SimpleApplicationEventMulticaster实现，如果用户没有自定义广播器，则使用默认的。它通过父类AbstractApplicationEventMulticaster的getApplicationListeners方法从事件注册表（事件-监听器关系保存）中获取事件监听器，并且通过invokeListener方法执行监听器的具体逻辑

3、ApplicationListener就是Spring的事件监听器接口，所有的监听器都实现该接口，本图中列出了典型的几个子类。其中RestartApplicationListnener在SpringBoot的启动框架中就有使用

4、在Spring中通常是ApplicationContext本身担任监听器注册表的角色，在其子类AbstractApplicationContext中就聚合了事件广播器ApplicationEventMulticaster和事件监听器ApplicationListnener，并且提供注册监听器的addApplicationListnener方法

通过上图就能较清晰的知道当一个事件源产生事件时，它通过事件发布器ApplicationEventPublisher发布事件，然后事件广播器ApplicationEventMulticaster会去事件注册表ApplicationContext中找到事件监听器ApplicationListnener，并且逐个执行监听器的onApplicationEvent方法，从而完成事件监听器的逻辑。

来到ApplicationEventPublisher 的 publishEvent 方法内部
```java
protected void publishEvent(Object event, @Nullable ResolvableType eventType) {
 if (this.earlyApplicationEvents != null) {
 this.earlyApplicationEvents.add(applicationEvent);
 }
 else {
  // 
  getApplicationEventMulticaster().multicastEvent(applicationEvent, eventType);
 }
}
```

多播事件方法
```java
@Override
public void multicastEvent(final ApplicationEvent event, @Nullable ResolvableType eventType) {
 ResolvableType type = (eventType != null ? eventType : resolveDefaultEventType(event));
 Executor executor = getTaskExecutor();
 // 遍历所有的监听者
 for (ApplicationListener<?> listener : getApplicationListeners(event, type)) {
  if (executor != null) {
   // 异步调用监听器
   executor.execute(() -> invokeListener(listener, event));
  }
  else {
   // 同步调用监听器
   invokeListener(listener, event);
  }
 }
}
```

invokeListener
```java
protected void invokeListener(ApplicationListener<?> listener, ApplicationEvent event) {
 ErrorHandler errorHandler = getErrorHandler();
 if (errorHandler != null) {
  try {
   doInvokeListener(listener, event);
  }
  catch (Throwable err) {
   errorHandler.handleError(err);
  }
 }
 else {
  doInvokeListener(listener, event);
 }
}
```

doInvokeListener
```java
private void doInvokeListener(ApplicationListener listener, ApplicationEvent event) {
 try {
  // 这里是事件发生的地方
  listener.onApplicationEvent(event);
 }
 catch (ClassCastException ex) {
  ......
 }
}
```
点击 ApplicationListener 接口 onApplicationEvent 方法的实现，可以看到我们重写的方法。

图片
## 总结
Spring 使用反射机制，获取了所有继承 ApplicationListener 接口的监听器，在 Spring 初始化时，会把监听器都自动注册到注册表中。

Spring 的事件发布非常简单，我们来总结一下：

- 定义一个继承 ApplicationEvent 的事件
- 定义一个实现 ApplicationListener 的监听器或者使用 @EventListener 监听事件
- 定义一个发送者，调用 ApplicationContext 直接发布或者使用 ApplicationEventPublisher 来发布自定义事件

最后，发布-订阅模式可以很好的将业务逻辑进行解耦（上图验证过），大大提高了可维护性、可扩展性。
