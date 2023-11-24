- [CompletableFuture进阶篇-外卖商家端API的异步化](https://blog.csdn.net/m0_53157173/article/details/127344842)
- [Spring 在多线程环境下如何确保事务一致性?](https://blog.csdn.net/m0_53157173/article/details/127423286)
- [Spring 在多线程环境下如何确保事务一致性?](https://mp.weixin.qq.com/s/7NcyE4V1kXIIwOK8t6aJLg)

## 问题再现
我先把问题抛出来，大家就明白本文目的在于解决什么样的业务痛点了:
```java
public void removeAuthorityModuleSeq(Integer authorityModuleId, IAuthorityService iAuthorityService, IRoleAuthorityService iRoleAuthorityService) {
    //1.查询出当前资源模块下所有资源,查询出来后进行删除
    deleteAuthoritiesOfCurrentAuthorityModule(authorityModuleId, iAuthorityService, iRoleAuthorityService);
    //2.查询出当前资源模块下所有子模块,递归查询,当删除完所有子模块下的资源后,再删除所有子模块,最终删除当前资源模块
    deleteSonAuthorityModuleUnderCurrentAuthorityModule(authorityModuleId, iAuthorityService, iRoleAuthorityService);
    //3.删除当前资源模块
    removeById(authorityModuleId);
}
```

如果我希望将步骤1和步骤2并行执行，然后确保步骤1和步骤2执行成功后，再执行步骤3，等到步骤3执行完毕后，再提交全部事务，这个需求该如何实现呢？

## 如何解决异步执行
上面需求第一点是: 如何让任务异步并行执行,如何实现二元依赖呢？

说到异步执行，很多小伙伴首先想到Spring中提供的@Async注解，但是Spring提供的异步执行任务能力并不足以解决我们当前的需求。
[Spring异步核心@Async注解的前世今生](https://cjdhy.blog.csdn.net/article/details/126909860)

@Async注解原理简单来说，就是扫描IOC中的bean,给方法上标注有@Async注解的bean进行代理，代理的核心是添加一个MethodInterceptor即AsyncExecutionInterceptor，该方法拦截器负责将方法真正的执行包装为任务，放入线程池中执行。

- [CompletableFuture入门](https://cjdhy.blog.csdn.net/article/details/127381665)
- [CompletableFuture进阶篇-外卖商家端API的异步化](https://blog.csdn.net/m0_53157173/article/details/127344842)
- [CompletableFuture入门篇](https://cjdhy.blog.csdn.net/article/details/127343965)

下面我们先使用CompletableFuture来完成我们第一步需求:
```java
public void removeAuthorityModuleSeq(Integer authorityModuleId, IAuthorityService iAuthorityService, IRoleAuthorityService iRoleAuthorityService) {
    CompletableFuture.runAsync(()->{
        //两个并行执行的任务
        CompletableFuture<Void> future1 = CompletableFuture.runAsync(() ->
                deleteAuthoritiesOfCurrentAuthorityModule(authorityModuleId, iAuthorityService, iRoleAuthorityService),executor);
        CompletableFuture<Void> future2 = CompletableFuture.runAsync(() ->
                deleteSonAuthorityModuleUnderCurrentAuthorityModule(authorityModuleId, iAuthorityService, iRoleAuthorityService), executor);
        //等待两个并行任务执行完后,再执行最后一个步骤
        CompletableFuture.allOf(future1,future2).thenRun(()->removeById(authorityModuleId)); 
    },executor);
}
```

## 多线程环境下如何确保事务一致性
我们已经完成了任务的异步执行化，那么又如何确保多线程环境下的事务一致性问题呢？
```java
public void removeAuthorityModuleSeq(Integer authorityModuleId, IAuthorityService iAuthorityService, IRoleAuthorityService iRoleAuthorityService) {
    CompletableFuture.runAsync(()->{
        //两个并行执行的任务
        CompletableFuture<Void> future1 = CompletableFuture.runAsync(() ->
                deleteAuthoritiesOfCurrentAuthorityModule(authorityModuleId, iAuthorityService, iRoleAuthorityService),executor);
        CompletableFuture<Void> future2 = CompletableFuture.runAsync(() ->
                deleteSonAuthorityModuleUnderCurrentAuthorityModule(authorityModuleId, iAuthorityService, iRoleAuthorityService), executor);
        //等待两个并行任务执行完后,再执行最后一个步骤
        CompletableFuture.allOf(future1,future2).thenRun(()->removeById(authorityModuleId));
    },executor);
}
```
在Spring环境下说到事务控制，大家第一反应就想到使用@Transactional注解解决问题，但是这里显然行不通，为什么行不通呢？

- [事务王国回顾](https://blog.csdn.net/m0_53157173/article/details/125052623)
- [Spring事务管理-上](https://cjdhy.blog.csdn.net/article/details/125130078)
- [Spring事务管理-中](https://cjdhy.blog.csdn.net/article/details/125196276)
- [Spring事务管理-下](https://cjdhy.blog.csdn.net/article/details/125223905)
- [Spring事务扩展篇](https://cjdhy.blog.csdn.net/article/details/125232126)

我还是简单的对Spring事务实现原理进行一番概括:

## 事务王国回顾
事务管理大体分为三个流程：事务创建 ,事务执行,事务结束

事务创建涉及到一些属性的配置,如:

- 事务的隔离级别
- 事务的传播行为
- 事务的超时时间
- 是否为只读事务
- …

由于涉及属性颇多，并且后期还有可能进行扩展，因此必须通过一个类来封装这些属性，在Spring中对应TransactionDefinition。

有了事务相关属性定义后，我们就可以利用TransactionDefinition来创建一个事务了,在Spring中局部事务由PlatformTransactionManager负责管理，创建事务也是由PlatformTransactionManager负责提供:
```java
TransactionStatus getTransaction(@Nullable TransactionDefinition definition) throws TransactionException;
```
如果我们希望追踪事务的状态，例如: 事务已完成,事务回滚等，那么就需要一个事务状态类贯穿当前事务的执行流程，在Spring中由 `TransactionStatus` 负责完成。

对于常见的数据源而言，通常需要记录的事务状态有如下几点:

- 当前事务是否是新事务
- 当前事务是否结束
- 当前事务是否需要回滚(通过标记来判断,因此我也可以在业务流程中手动设置标记为true,来让事务在没有发生异常的情况下进行回滚)
- 当前事务是否设置了回滚点(savePoint)

事务的执行过程就是具体业务代码的执行流程，这里就不多说了。

事务的结束分为两种情况: 需要进行事务回滚或者事务正常提交，如果是事务回滚，还需要判断 `TransactionStatus` 中的savePoint是否被设置了。

## 事务实现方式回顾
Spring中常见的事务实现方式有两种: 编程式和声明式。

> 编程式事务使用是本文重点，因此这里按下不表，我们先来复习一下声明式事务的使用

声明式事务就是使用我们常见的`@Transactional`注解完成的，声明式事务优点就在于让事务代码与业务代码解耦，通过Spring中提供的声明式事务使用，我们也可以发觉我们只需要编写业务代码即可，而事务的管理基本不需要我们操心，Spring就像使用了魔法一样，帮我们自动完成了。

之所以那么神奇，本质还是依靠Spring框架提供的Bean生命周期相关回调接口和AOP结合完成的，简述如下:

- 通过自动代理创建器依次尝试为每个放入容器中的bean尝试进行代理
- 尝试进行代理的过程对于事务管理来说，就是利用事务管理涉及到的增强器advisor，即TransactionAttributeSourceAdvisor
- 判断当前增强器是否能够应用与当前bean上，怎么判断呢？—> advisor内部的pointCut喽 ！
- 如果能够应用，那么好，为当前bean创建代理对象返回，并且往代理对象内部添加一个TransactionInterceptor拦截器。
- 此时我们再从容器中获取，拿到的就是代理对象了，当我们调用代理对象的方法时，首先要经过代理对象内部拦截器链的处理，处理完后，最终才会调用被代理对象的方法。(这里其实就是责任链模式的应用)

对于被事务增强器TransactionAttributeSourceAdvisor代理的bean而言，代理对象内部会存在一个TransactionInterceptor，该拦截器内部构造了一个事务执行的模板流程:
```java
protected Object invokeWithinTransaction(Method method, @Nullable Class<?> targetClass,
   final InvocationCallback invocation) throws Throwable {
  //TransactionAttributeSource内部保存着当前类某个方法对应的TransactionAttribute---事务属性源
  //可以看做是一个存放TransactionAttribute与method方法映射的池子
  TransactionAttributeSource tas = getTransactionAttributeSource();
  //获取当前事务方法对应的TransactionAttribute
  final TransactionAttribute txAttr = (tas != null ? tas.getTransactionAttribute(method, targetClass) : null);
  //定位TransactionManager
  final TransactionManager tm = determineTransactionManager(txAttr);
        .....
        //类型转换为局部事务管理器
  PlatformTransactionManager ptm = asPlatformTransactionManager(tm);
  final String joinpointIdentification = methodIdentification(method, targetClass, txAttr);

  if (txAttr == null || !(ptm instanceof CallbackPreferringPlatformTransactionManager)) {
   //TransactionManager根据TransactionAttribute创建事务后返回
   //TransactionInfo封装了当前事务的信息--包括TransactionStatus
   TransactionInfo txInfo = createTransactionIfNecessary(ptm, txAttr, joinpointIdentification);

   Object retVal;
   try {
    //继续执行过滤器链---过滤链最终会调用目标方法
    //因此可以理解为这里是调用目标方法
    retVal = invocation.proceedWithInvocation();
   }
   catch (Throwable ex) {
    //目标方法抛出异常则进行判断是否需要回滚
    completeTransactionAfterThrowing(txInfo, ex);
    throw ex;
   }
   finally {
       //清除当前事务信息
    cleanupTransactionInfo(txInfo);
   }
            ...
            //正常返回,那么就正常提交事务呗(当然还是需要判断TransactionStatus状态先)
   commitTransactionAfterReturning(txInfo);
   return retVal;
  }
  ...
```
[Spring源码研读](https://blog.csdn.net/m0_53157173/category_11342343.html)

## 编程式事务
还记得本文一开始提出的业务需求吗？

不清楚，可以回看一下，在上文，我们已经解决了任务异步并行执行的难题，下面我们需要解决的就是如何确保Spring在多线程环境下也能保持事务一致性。

通过上文对Spring事务基础和声明式事务的原理回顾，相信大家也发现了，声明式事务并不能解决我们当前的问题，那么就只能求助于编程式事务了。

那么编程式事务是什么样子呢？

- 其实上面TransactionInterceptor给出的那套模板流程，就是编程式事务使用的模范案例，我们可以简化上面的模板流程，简单使用如下:
```java
public class TransactionMain {
    public static void main(String[] args) throws ClassNotFoundException, SQLException {
        test();
    }

    private static void test() {
        DataSource dataSource = getDS();
        JdbcTransactionManager jtm = new JdbcTransactionManager(dataSource);
        //JdbcTransactionManager根据TransactionDefinition信息来进行一些连接属性的设置
        //包括隔离级别和传播行为等
        DefaultTransactionDefinition transactionDef = new DefaultTransactionDefinition();
        //开启一个新事务---此时autocommit已经被设置为了false,并且当前没有事务,这里创建的是一个新事务
        TransactionStatus ts = jtm.getTransaction(transactionDef);
        //进行业务逻辑操作
        try {
            update(dataSource);
            jtm.commit(ts);
        }catch (Exception e){
            jtm.rollback(ts);
            System.out.println("发生异常,我已回滚");
        }
    }

    private static void update(DataSource dataSource) throws Exception {
        JdbcTemplate jt = new JdbcTemplate();
        jt.setDataSource(dataSource);
        jt.update("UPDATE Department SET Dname=\"大忽悠\" WHERE id=6");
        throw new Exception("我是来捣乱的");
    }
}
```

## 利用编程式事务解决问题
我们明白了编程式事务的使用，相信大家也都知道问题如何解决了，下面我给出一份看似正确的解决方案:
```java
package com.user.util;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 多线程事务一致性管理 <br>
 * 声明式事务管理无法完成,此时我们只能采用初期的编程式事务管理才行
 * @author 大忽悠
 * @create 2022/10/19 21:34
 */
@Component
@RequiredArgsConstructor
public class MultiplyThreadTransactionManager {
    /**
     * 如果是多数据源的情况下,需要指定具体是哪一个数据源
     */
    private final DataSource dataSource;

    /**
     * 执行的是无返回值的任务
     * @param tasks 异步执行的任务列表
     * @param executor 异步执行任务需要用到的线程池,考虑到线程池需要隔离,这里强制要求传
     */
    public void runAsyncButWaitUntilAllDown(List<Runnable> tasks, Executor executor) {
        if(executor==null){
            throw new IllegalArgumentException("线程池不能为空");
        }
        DataSourceTransactionManager transactionManager = getTransactionManager();
        //是否发生了异常
        AtomicBoolean ex=new AtomicBoolean();

        List<CompletableFuture> taskFutureList=new ArrayList<>(tasks.size());
        List<TransactionStatus> transactionStatusList=new ArrayList<>(tasks.size());

        tasks.forEach(task->{
            taskFutureList.add(CompletableFuture.runAsync(
                    () -> {
                        try{
                            //1.开启新事务
                            transactionStatusList.add(openNewTransaction(transactionManager));
                            //2.异步任务执行
                            task.run();
                        }catch (Throwable throwable){
                            //打印异常
                            throwable.printStackTrace();
                            //其中某个异步任务执行出现了异常,进行标记
                            ex.set(Boolean.TRUE);
                            //其他任务还没执行的不需要执行了
                            taskFutureList.forEach(completableFuture -> completableFuture.cancel(true));
                        }
                    }
                    , executor)
            );
        });

        try {
            //阻塞直到所有任务全部执行结束---如果有任务被取消,这里会抛出异常滴,需要捕获
            CompletableFuture.allOf(taskFutureList.toArray(new CompletableFuture[]{})).get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }

        //发生了异常则进行回滚操作,否则提交
        if(ex.get()){
            System.out.println("发生异常,全部事务回滚");
            transactionStatusList.forEach(transactionManager::rollback);
        }else {
            System.out.println("全部事务正常提交");
            transactionStatusList.forEach(transactionManager::commit);
        }
    }

    private TransactionStatus openNewTransaction(DataSourceTransactionManager transactionManager) {
        //JdbcTransactionManager根据TransactionDefinition信息来进行一些连接属性的设置
        //包括隔离级别和传播行为等
        DefaultTransactionDefinition transactionDef = new DefaultTransactionDefinition();
        //开启一个新事务---此时autocommit已经被设置为了false,并且当前没有事务,这里创建的是一个新事务
        return transactionManager.getTransaction(transactionDef);
    }

    private DataSourceTransactionManager getTransactionManager() {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

大家思考上面的代码存在问题吗?

测试:
```java
public void test(){
    List<Runnable> tasks=new ArrayList<>();

    tasks.add(()->{
       userMapper.deleteById(26);
    });

    tasks.add(()->{
        signMapper.deleteById(10);
    });

    multiplyThreadTransactionManager.runAsyncButWaitUntilAllDown(tasks, Executors.newCachedThreadPool());
}
```

任务正常都执行完毕，事务进行提交，但是会抛出异常，导致事务回滚:

图片

图片
抓关键字:
```java
No value for key [HikariDataSource (HikariPool-1)] bound to thread [main]
```

解释: 无法在当前线程绑定的threadLocal中寻找到HikariDataSource作为key,对应关联的资源对象ConnectionHolder
这里需要再次回顾一下Spring事务实现的小细节:

一次事务的完成通常都是默认在当前线程内完成的，又因为一次事务的执行过程中，涉及到对当前数据库连接Connection的操作，因此为了避免将Connection在事务执行过程中来回传递，我们可以将Connextion绑定到当前事务执行线程对应的ThreadLocalMap内部，顺便还可以将一些其他属性也放入其中进行保存，在Spring中，负责保存这些ThreadLocal属性的实现类由TransactionSynchronizationManager承担。

TransactionSynchronizationManager类内部默认提供了下面六个ThreadLocal属性，分别保存当前线程对应的不同事务资源:
```java
   //保存当前事务关联的资源--默认只会在新建事务的时候保存当前获取到的DataSource和当前事务对应Connection的映射关系--当然这里Connection被包装为了ConnectionHolder
 private static final ThreadLocal<Map<Object, Object>> resources =
   new NamedThreadLocal<>("Transactional resources");
    //事务监听者--在事务执行到某个阶段的过程中，会去回调监听者对应的回调接口(典型观察者模式的应用)---默认为空集合
 private static final ThreadLocal<Set<TransactionSynchronization>> synchronizations =
   new NamedThreadLocal<>("Transaction synchronizations");
   //见名知意: 存放当前事务名字
 private static final ThreadLocal<String> currentTransactionName =
   new NamedThreadLocal<>("Current transaction name");
   //见名知意: 存放当前事务是否是只读事务
 private static final ThreadLocal<Boolean> currentTransactionReadOnly =
   new NamedThreadLocal<>("Current transaction read-only status");
   //见名知意: 存放当前事务的隔离级别
 private static final ThreadLocal<Integer> currentTransactionIsolationLevel =
   new NamedThreadLocal<>("Current transaction isolation level");
   //见名知意: 存放当前事务是否处于激活状态
 private static final ThreadLocal<Boolean> actualTransactionActive =
   new NamedThreadLocal<>("Actual transaction active");
```

那么上面抛出的异常的原因也就很清楚了，无法在main线程找到当前事务对应的资源，原因如下:

图片

图片
开启新事务时，事务相关资源都被绑定到了thread-cache-pool-1线程对应的threadLocalMap内部，而当执行事务提交代码时，commit内部需要从TransactionSynchronizationManager中获取当前事务的资源，显然我们无法从main线程对应的threadLocalMap中获取到对应的事务资源，这也就是异常抛出的原因。

## 问题分析完了，那么如何解决问题呢？
- 这里给出一个我首先想到的简单粗暴的方法—CopyTransactionResource—将事务资源在两个线程间来回复制

这里给出解决后问题后的代码示例:
```java
package com.user.util;

import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import javax.sql.DataSource;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * 多线程事务一致性管理 <br>
 * 声明式事务管理无法完成,此时我们只能采用初期的编程式事务管理才行
 * @author 大忽悠
 * @create 2022/10/19 21:34
 */
@Component
@RequiredArgsConstructor
public class MultiplyThreadTransactionManager {
    /**
     * 如果是多数据源的情况下,需要指定具体是哪一个数据源
     */
    private final DataSource dataSource;

    /**
     * 执行的是无返回值的任务
     * @param tasks 异步执行的任务列表
     * @param executor 异步执行任务需要用到的线程池,考虑到线程池需要隔离,这里强制要求传
     */
    public void runAsyncButWaitUntilAllDown(List<Runnable> tasks, Executor executor) {
        if(executor==null){
            throw new IllegalArgumentException("线程池不能为空");
        }
        DataSourceTransactionManager transactionManager = getTransactionManager();
        //是否发生了异常
        AtomicBoolean ex=new AtomicBoolean();

        List<CompletableFuture> taskFutureList=new ArrayList<>(tasks.size());
        List<TransactionStatus> transactionStatusList=new ArrayList<>(tasks.size());
        List<TransactionResource> transactionResources=new ArrayList<>(tasks.size());

        tasks.forEach(task->{
            taskFutureList.add(CompletableFuture.runAsync(
                    () -> {
                        try{
                            //1.开启新事务
                            transactionStatusList.add(openNewTransaction(transactionManager));
                            //2.copy事务资源
                         transactionResources.add(TransactionResource.copyTransactionResource());
                            //3.异步任务执行
                            task.run();
                        }catch (Throwable throwable){
                            //打印异常
                            throwable.printStackTrace();
                            //其中某个异步任务执行出现了异常,进行标记
                            ex.set(Boolean.TRUE);
                            //其他任务还没执行的不需要执行了
                            taskFutureList.forEach(completableFuture -> completableFuture.cancel(true));
                        }
                    }
                    , executor)
            );
        });

        try {
            //阻塞直到所有任务全部执行结束---如果有任务被取消,这里会抛出异常滴,需要捕获
            CompletableFuture.allOf(taskFutureList.toArray(new CompletableFuture[]{})).get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }

        //发生了异常则进行回滚操作,否则提交
        if(ex.get()){
            System.out.println("发生异常,全部事务回滚");
            for (int i = 0; i < tasks.size(); i++) {
                transactionResources.get(i).autoWiredTransactionResource();
                transactionManager.rollback(transactionStatusList.get(i));
                transactionResources.get(i).removeTransactionResource();
            }
        }else {
            System.out.println("全部事务正常提交");
            for (int i = 0; i < tasks.size(); i++) {
                transactionResources.get(i).autoWiredTransactionResource();
                transactionManager.commit(transactionStatusList.get(i));
                transactionResources.get(i).removeTransactionResource();
            }
        }
    }

    private TransactionStatus openNewTransaction(DataSourceTransactionManager transactionManager) {
        //JdbcTransactionManager根据TransactionDefinition信息来进行一些连接属性的设置
        //包括隔离级别和传播行为等
        DefaultTransactionDefinition transactionDef = new DefaultTransactionDefinition();
        //开启一个新事务---此时autocommit已经被设置为了false,并且当前没有事务,这里创建的是一个新事务
        return transactionManager.getTransaction(transactionDef);
    }

    private DataSourceTransactionManager getTransactionManager() {
        return new DataSourceTransactionManager(dataSource);
    }

    /**
     * 保存当前事务资源,用于线程间的事务资源COPY操作
     */
    @Builder
    private static class TransactionResource{
        //事务结束后默认会移除集合中的DataSource作为key关联的资源记录
        private  Map<Object, Object> resources = new HashMap<>();

        //下面五个属性会在事务结束后被自动清理,无需我们手动清理
        private  Set<TransactionSynchronization> synchronizations =new HashSet<>();

        private  String currentTransactionName;

        private Boolean currentTransactionReadOnly;

        private Integer currentTransactionIsolationLevel;

        private Boolean actualTransactionActive;

        public static TransactionResource copyTransactionResource(){
            return TransactionResource.builder()
                    //返回的是不可变集合
                    .resources(TransactionSynchronizationManager.getResourceMap())
                    //如果需要注册事务监听者,这里记得修改--我们这里不需要,就采用默认负责--spring事务内部默认也是这个值
                    .synchronizations(new LinkedHashSet<>())
                    .currentTransactionName(TransactionSynchronizationManager.getCurrentTransactionName())
                    .currentTransactionReadOnly(TransactionSynchronizationManager.isCurrentTransactionReadOnly())
                    .currentTransactionIsolationLevel(TransactionSynchronizationManager.getCurrentTransactionIsolationLevel())
                    .actualTransactionActive(TransactionSynchronizationManager.isActualTransactionActive())
                    .build();
        }

        public void autoWiredTransactionResource(){
             resources.forEach(TransactionSynchronizationManager::bindResource);
             //如果需要注册事务监听者,这里记得修改--我们这里不需要,就采用默认负责--spring事务内部默认也是这个值
             TransactionSynchronizationManager.initSynchronization();
             TransactionSynchronizationManager.setActualTransactionActive(actualTransactionActive);
             TransactionSynchronizationManager.setCurrentTransactionName(currentTransactionName);
             TransactionSynchronizationManager.setCurrentTransactionIsolationLevel(currentTransactionIsolationLevel);
             TransactionSynchronizationManager.setCurrentTransactionReadOnly(currentTransactionReadOnly);
        }

        public void removeTransactionResource() {
            //事务结束后默认会移除集合中的DataSource作为key关联的资源记录
            //DataSource如果重复移除,unbindResource时会因为不存在此key关联的事务资源而报错
            resources.keySet().forEach(key->{
                if(!(key instanceof  DataSource)){
                    TransactionSynchronizationManager.unbindResource(key);
                }
            });
        }
    }
}
```

增加异常抛出，测试是否能够保证多线程间的事务一致性:
```java
@SpringBootTest(classes = UserMain.class)
public class Test {
    @Resource
    private UserMapper userMapper;
    @Resource
    private SignMapper signMapper;
    @Resource
    private MultiplyThreadTransactionManager multiplyThreadTransactionManager;

    @SneakyThrows
    @org.junit.jupiter.api.Test
    public void test(){
        List<Runnable> tasks=new ArrayList<>();

        tasks.add(()->{
                userMapper.deleteById(26);
                throw new RuntimeException("我就要抛出异常!");
        });

        tasks.add(()->{
            signMapper.deleteById(10);
        });

        multiplyThreadTransactionManager.runAsyncButWaitUntilAllDown(tasks, Executors.newCachedThreadPool());
    }

}
```

事务都进行了回滚，数据库数据没变。

## 补充说明
> 本节增加时间： 2023 - 09 - 03

此处补充说明一下Spring事务体系获取Connection连接的时机点说明，方便大家遇到问题时排查：
### 事务初次开启时：
1. 尝试根据TransactionDefinition开启或者复用一个事务

```java
public final TransactionStatus getTransaction(@Nullable TransactionDefinition definition) throws TransactionException {
    TransactionDefinition def = (definition != null ? definition : TransactionDefinition.withDefaults());
    // 尝试获取已经存在的事务连接
    Object transaction = doGetTransaction();
    ...
    // 如果存在已经建立好的事务连接,那么根据传播行为决定下一步需要怎么做,可以是复用,可以是挂起等待,等等...
    if (isExistingTransaction(transaction)) {
        // Existing transaction found -> check propagation behavior to find out how to behave.
        return handleExistingTransaction(def, transaction, debugEnabled);
    }
    ...
    // 如果当前事务传播行为为MANDATORY,则要求事务开启前必须存在一个事务连接,否则抛出异常
    if (def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_MANDATORY) {
        throw new IllegalTransactionStateException("No existing transaction found for transaction marked with propagation 'mandatory'");
    }
    else if (
        // 当前存在事务,则直接复用当前事务,如果不存在事务,则新建一个事务
        def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRED ||
        // 如果当前存事务,则把当前事务挂起,否则新建事务
        def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_REQUIRES_NEW ||
        // 如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则执行与PROPAGATION_REQUIRED类似的操作
        def.getPropagationBehavior() == TransactionDefinition.PROPAGATION_NESTED) {
            // 将TransactionSynchronizationManager存储的当前线程的相关事务资源信息进行保存
            SuspendedResourcesHolder suspendedResources = suspend(null);
            ....
            try {
                // 开启新的事务
                return startTransaction(def, transaction, debugEnabled, suspendedResources);
            }
            catch (RuntimeException | Error ex) {
            // 恢复事务资源信息
            resume(null, suspendedResources);
                throw ex;
            }
    } else {
        ...
        // 当前传播行为在没有事务存在时,直接运行，此处会创建一个空事务
        boolean newSynchronization = (getTransactionSynchronization() == SYNCHRONIZATION_ALWAYS);
        return prepareTransactionStatus(def, null, true, newSynchronization, debugEnabled, null);
    }
}
```

2. 尝试从当前线程事务上下文中获取已经存在的ConnectionHolder
```java
@Override
protected Object doGetTransaction() {
    DataSourceTransactionObject txObject = new DataSourceTransactionObject();
    txObject.setSavepointAllowed(isNestedTransactionAllowed());
    // 尝试根据DataSource作为key,从当前线程的ThreadLocal中获取对应的connection
    ConnectionHolder conHolder = (ConnectionHolder) TransactionSynchronizationManager.getResource(obtainDataSource());
    // 如果此时不存在事务上下文,即不存在已经建立的事务连接,上面返回的conHolder为null
    txObject.setConnectionHolder(conHolder, false);
    return txObject;
}
```

3. 判断是否存在已经建立好的事务连接
```java
protected boolean isExistingTransaction(Object transaction) {
    DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
    // 判断是否存在已经建立好的事务连接
    return (txObject.hasConnectionHolder() && txObject.getConnectionHolder().isTransactionActive());
}
```

4. 开启一段新的事务
```java
private TransactionStatus startTransaction(TransactionDefinition definition, Object transaction,
        boolean debugEnabled, @Nullable SuspendedResourcesHolder suspendedResources) {
    boolean newSynchronization = (getTransactionSynchronization() != SYNCHRONIZATION_NEVER);
    DefaultTransactionStatus status = newTransactionStatus(
    definition, transaction, true, newSynchronization, debugEnabled, suspendedResources);
    // 开启事务
    doBegin(transaction, definition);
    // 初始化当前线程事务上下文信息
    prepareSynchronization(status, definition);
    return status;
}

// 初始化好当前线程的事务上下文信息
protected void prepareSynchronization(DefaultTransactionStatus status, TransactionDefinition definition) {
    if (status.isNewSynchronization()) {
        TransactionSynchronizationManager.setActualTransactionActive(status.hasTransaction());
        TransactionSynchronizationManager.setCurrentTransactionIsolationLevel(
            definition.getIsolationLevel() != TransactionDefinition.ISOLATION_DEFAULT ? 
            definition.getIsolationLevel() : null);
        TransactionSynchronizationManager.setCurrentTransactionReadOnly(definition.isReadOnly());
        TransactionSynchronizationManager.setCurrentTransactionName(definition.getName());
        TransactionSynchronizationManager.initSynchronization();
    }
}
```

5. 真正建立事务连接
```java
protected void doBegin(Object transaction, TransactionDefinition definition) {
    DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
    Connection con = null;
    try {
        if (!txObject.hasConnectionHolder() ||
                txObject.getConnectionHolder().isSynchronizedWithTransaction()) {
            // 通过DataSource去获取一个事务连接
            Connection newCon = obtainDataSource().getConnection();
            ...
            // 设置到connectionHolder中去
            txObject.setConnectionHolder(new ConnectionHolder(newCon), true);
        }
        // 设置SynchronizedWithTransaction为true,表明当前线程与一个事务上下文绑定成功了
        txObject.getConnectionHolder().setSynchronizedWithTransaction(true);
        // 当前事务连接各种属性设置: 是否只读，是否自动提交
        ...
        // 如果是新连接,则以DataSource作为key,标识当前线程通过当前DataSource建立的一个建立
        // 并将这个映射关系保存到当前线程的事务上下文环境中去
        if (txObject.isNewConnectionHolder()) {
            TransactionSynchronizationManager.bindResource(obtainDataSource(), txObject.getConnectionHolder());
        }
    }
    ...
}
```

## 事务剩余执行过程中获取连接:
1. 借助DataSourceUtils的getConnection方法尝试获取当前线程关联的存活连接,或者新建一个连接
```java
public static Connection doGetConnection(DataSource dataSource) throws SQLException {
    ...
    // 从当前线程threadLocal中尝试获取通过当前传入DataSource已经创建出来的那个事务连接
    ConnectionHolder conHolder = (ConnectionHolder) TransactionSynchronizationManager.getResource(dataSource);
    // 如果连接存在或者当前线程已经开启了一个事务上下文,则直接返回已有的事务连接
    if (conHolder != null && (conHolder.hasConnection() || conHolder.isSynchronizedWithTransaction())) {
        conHolder.requested();
        if (!conHolder.hasConnection()) {
            logger.debug("Fetching resumed JDBC Connection from DataSource");
            // 可能因为异常或者其他问题，导致连接被释放,此时重新获取一个新的连接
            conHolder.setConnection(fetchConnection(dataSource));
        }
        return conHolder.getConnection();
    }
    // 重新获取一个连接
    Connection con = fetchConnection(dataSource);
    // 判断事务同步是否活跃
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
        try {
            // Use same Connection for further JDBC actions within the transaction.
            // Thread-bound object will get removed by synchronization at transaction completion.
            // 将新的连接设置到ConnectionHolder中
            ConnectionHolder holderToUse = conHolder;
            if (holderToUse == null) {
                holderToUse = new ConnectionHolder(con);
            } else {
                holderToUse.setConnection(con);
            }
            holderToUse.requested();
            TransactionSynchronizationManager.registerSynchronization(
                new ConnectionSynchronization(holderToUse, dataSource));
            // 重新设置当前线程与一个事务上下文关联
            holderToUse.setSynchronizedWithTransaction(true);
            // 如果connectionHolder与一开始的不相等,则重新设置
            if (holderToUse != conHolder) {
                TransactionSynchronizationManager.bindResource(dataSource, holderToUse);
            }
        } catch (RuntimeException ex) {
            // Unexpected exception from external delegation call -> close Connection and rethrow.
            releaseConnection(con, dataSource);
            throw ex;
        }
    }
    return con;
}
```

## 其实我们本文给出的copy事务资源的方案和上面出现的suspend挂起当前事务和resume恢复当前事务的思想是一致的:
### 1. 挂起当前事务
```java
@Nullable
protected final SuspendedResourcesHolder suspend(@Nullable Object transaction) throws TransactionException {
    //被挂起的事务是否还处于活跃状态
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
        //首先暂停与当前线程相关的所有TransactionSynchronization
        List<TransactionSynchronization> suspendedSynchronizations = doSuspendSynchronization();
        try {
            Object suspendedResources = null;
            if (transaction != null) {
                //暂停目标事务
                suspendedResources = doSuspend(transaction);
            }
            //清空TransactionSynchronizationManager关于当前线程的一些事务记录
            String name = TransactionSynchronizationManager.getCurrentTransactionName();
            TransactionSynchronizationManager.setCurrentTransactionName(null);
            boolean readOnly = TransactionSynchronizationManager.isCurrentTransactionReadOnly();
            TransactionSynchronizationManager.setCurrentTransactionReadOnly(false);
            Integer isolationLevel = TransactionSynchronizationManager.getCurrentTransactionIsolationLevel();
            TransactionSynchronizationManager.setCurrentTransactionIsolationLevel(null);
            boolean wasActive = TransactionSynchronizationManager.isActualTransactionActive();
            TransactionSynchronizationManager.setActualTransactionActive(false);
            //SuspendedResourcesHolder保存被挂起的事务的所有信息状态，方便日后恢复使用
            return new SuspendedResourcesHolder(
                suspendedResources, suspendedSynchronizations, name, readOnly, isolationLevel, wasActive);
        } catch (RuntimeException | Error ex) {
            // doSuspend failed - original transaction is still active...
            doResumeSynchronization(suspendedSynchronizations);
            throw ex;
        }
    }
    else if (transaction != null) {
        // Transaction active but no synchronization active.
        Object suspendedResources = doSuspend(transaction);
        return new SuspendedResourcesHolder(suspendedResources);
    } else {
        // Neither transaction nor synchronization active.
        return null;
    }
}

@Override
protected Object doSuspend(Object transaction) {
    //解除当前transaction对于ConnectionHolder的绑定关系
    DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
    txObject.setConnectionHolder(null);
    //解除TransactionSynchronizationManager与ConnectionHolder资源的绑定关系，然后返回对应的ConnectionHolder资源
    return TransactionSynchronizationManager.unbindResource(obtainDataSource());
}
```

### 2. 恢复被挂起的事务
```java
protected final void resume(@Nullable Object transaction, @Nullable SuspendedResourcesHolder resourcesHolder) throws TransactionException {
    //SuspendedResourcesHolder保存了事务被挂起前的状态，这里只需要从中读取然后进行恢复即可
    if (resourcesHolder != null) {
        //suspendedResources就是上面解绑的ConnectionHolder
        Object suspendedResources = resourcesHolder.suspendedResources;
        if (suspendedResources != null) {
            //恢复事务，就是重新绑定一下ConnectionHolder
            doResume(transaction, suspendedResources);
        }
        List<TransactionSynchronization> suspendedSynchronizations = resourcesHolder.suspended
        Synchronizations;
        if (suspendedSynchronizations != null) {
            //设置TransactionSynchronizationManager关于当前事务的相关状态
            TransactionSynchronizationManager.setActualTransactionActive(resourcesHolder.wasActive);
            TransactionSynchronizationManager.setCurrentTransactionIsolationLevel(resourcesHolder.isolationLevel);
            TransactionSynchronizationManager.setCurrentTransactionReadOnly(resourcesHolder.readOnly);
            TransactionSynchronizationManager.setCurrentTransactionName(resourcesHolder.name);
            //恢复suspendedSynchronizations
            doResumeSynchronization(suspendedSynchronizations);
        }
    }
}

protected void doResume(@Nullable Object transaction, Object suspendedResources) {
    //就是再绑定一下ConnectionHolder
    TransactionSynchronizationManager.bindResource(obtainDataSource(), suspendedResources);
}
```

## 疑问解答

## newTransaction 和 newSynchronization 标记的联系
关于这两个标记的含义在之前事务文章包括本文中都没有特别进行区分，这里详细说明一下二者之间
的联系和区别。
- transactionSynchronization 表示当前事务是否需要同步支持，这里同步指是否使用ThreadLocal保
存当前事务执行上下文的事务资源信息 , 包括在事务执行过程中各个同步通知点是否进行回调通知也区域于该标志是否为真

```java
public abstract class TransactionSynchronizationManager {
    private static final ThreadLocal<Map<Object, Object>> resources =
    new NamedThreadLocal<>("Transactional resources");
    private static final ThreadLocal<Set<TransactionSynchronization>> synchronizations =
    new NamedThreadLocal<>("Transaction synchronizations");
    private static final ThreadLocal<String> currentTransactionName =
    new NamedThreadLocal<>("Current transaction name");
    private static final ThreadLocal<Boolean> currentTransactionReadOnly =
    new NamedThreadLocal<>("Current transaction read-only status");
    private static final ThreadLocal<Integer> currentTransactionIsolationLevel =
    new NamedThreadLocal<>("Current transaction isolation level");
    private static final ThreadLocal<Boolean> actualTransactionActive =
    new NamedThreadLocal<>("Actual transaction active");
    ...
}
```

该标志存在三个取值:

- `SYNCHRONIZATION_ALWAYS`: 不管是正常事务执行，还是无需事务执行，还是嵌套事务执行，使用开启事务同步功能
- `SYNCHRONIZATION_ON_ACTUAL_TRANSACTION`: 对于无需事务执行的场景，则不开启事务同步功能
- `SYNCHRONIZATION_NEVER`: 不管什么场景都不开启事务同步功能

该标记保存在AbstractPlatformTransactionManager类中，默认值为始终开启:
```java
private int transactionSynchronization = SYNCHRONIZATION_ALWAYS;
```

- newSynchronization保存在DefaultTransactionStatus中，用于表示当前事务是否需要事务同步功能支持，该值默认只有true or false ， 具体取值取决于当前事务传播行为。
- newTransaction保存在DefaultTransactionStatus中，用于表示当前事务是否为新事务，只有当前无需事务支持或者为嵌套事务的内事务时，该值才会为false,否则大部分情况下都为true，具体取值还是取决于当前事务传播行为。
  - 只有该值为true时，才会执行连接建立，事务提交，事务回滚，释放连接资源等操作
  - 当前没有事务的情况下，并且当前事务传播行为不要求运行在事务状态下时，会创建一个空事务运行

下面结合事务的传播行为看看以上两个标记分别会取何值:

- `PROPAGATION_REQUIRED`: 如果当前存在一个事务,则加入当前事务,如果不存在任何事务,则创建一个新的事务。总之,要至少确保在一个事务中运行。并且此传播行为也是默认的事务传播行为。
  - 存在事务: `newTransaction = false` , `newSynchronization = transactionSynchronization != SYNCHRONIZATION_NEVER`
  - 不存在事务: `newTransaction = true` , `newSynchronization = transactionSynchronization != SYNCHRONIZATION_NEVER`

- `PROPAGATION_SUPPORTS`: 如果当前存在一个事务,则加入当前事务,如果不存在事务，则直接执行。对于一些查询方法来说，PROPAGATION_SUPPORTS通过是比较合适的传播行为选择。
  - 存在事务: `newTransaction = false` , `newSynchronization = transactionSynchronization != SYNCHRONIZATION_NEVER`
  - 不存在事务: `newTransaction = false` , `newSynchronization = transactionSynchronization == SYNCHRONIZATION_ALWAYS`

- `PROPAGATION_MANDATORY`: 强制要求当前存在一个事务,如果不存在，则抛出异常。如果某个方法需要事务支持，但自身又不管理事务提交或者回滚，那么比较适合
PROPAGATION_MANDATORY。
  - 存在事务: `newTransaction = false` , `newSynchronization = transactionSynchronization != SYNCHRONIZATION_NEVER`
  - 不存在事务: 抛出异常

- `PROPAGATION_REQUIRES_NEW`: 不管当前是否存在事务,都会创建新的事务。如果当前存在事务，会将当前事务挂起。
  - 存在事务: `newTransaction = true` , `newSynchronization = transactionSynchronization != SYNCHRONIZATION_NEVER`
  - 不存在事务: `newTransaction = true` , `newSynchronization = transactionSynchronization != SYNCHRONIZATION_NEVER`

- `PROPAGATION_NOT_SUPPORTED`: 不支持当前事务，而是在没有事务的情况下才会执行,如果当前存在事务，当前事务会被挂起
  - 存在事务: `newTransaction = false` , `newSynchronization = transactionSynchronization == SYNCHRONIZATION_ALWAYS`
  - 不存在事务: `newTransaction = true` , `newSynchronization = transactionSynchronization == SYNCHRONIZATION_ALWAYS`

- `PROPAGATION_NEVER`: 永远不需要当前存在事务,如果存在事务，则抛出异常。
  - 存在事务: 抛出异常
  - 不存在事务: `newTransaction = true` , `newSynchronization = transactionSynchronization == SYNCHRONIZATION_ALWAYS`

- PROPAGATION_NESTED：如果存在当前事务，则在当前事务的一个嵌套事务中执行，否则与PROPAGATION_REQUIRED行为类似，即创建新事务，在新创建的事务中执行。
  - 存在事务:
    - 支持savepoint: `newTransaction = false` , `newSynchronization = false`
    - 不支持savepoint,采用嵌套commit/rollback调用: `newTransaction = true` , `newSynchronization = transactionSynchronization != SYNCHRONIZATION_NEVER`
  - 不存在事务: `newTransaction = true` , `newSynchronization = transactionSynchronization != SYNCHRONIZATION_NEVER`

当前不存在事务时，对于需要无事务运行的传播行为，会将`newTransaction`标记设置为`true`，来创建一个空事务。

> 本文包括整个事务系列文章对这两个标记都没有进行详细说明，大家看完本节后，可再次阅读相关文章或者源码进行回看。

## 连接是否会被释放，是否影响主线程事务属性


### 第一个问题: 事务提交或者回滚的时候是否会释放连接
答:
- 事务提交或者回滚最终都会调用cleanupAfterCompletion方法清理事务相关资源信息，该方法中会完成连接的释放逻辑

```java
private void cleanupAfterCompletion(DefaultTransactionStatus status) {
    //记录事务进行的状态为已完成
    status.setCompleted();
    // 清理与当前事务相关的TransactionSynchronization
    if (status.isNewSynchronization()) {
        TransactionSynchronizationManager.clear();
    }
    //释放事务资源,并解除TransactionSynchronizationManager的资源绑定
    //对于DataSourceTransactionManager来说是关闭数据库连接，然后解除Datasource对资源的绑定
    if (status.isNewTransaction()) {
        doCleanupAfterCompletion(status.getTransaction());
    }
    //如果之前有挂起的事务，恢复挂起的事务
    if (status.getSuspendedResources() != null) {
        if (status.isDebug()) {
            logger.debug("Resuming suspended transaction after completion of inner transaction");
        }
        Object transaction = (status.hasTransaction() ? status.getTransaction() : null);
        resume(transaction, (SuspendedResourcesHolder) status.getSuspendedResources());
    }
}
```
> 相关标记判断的含义此处不再多说，大家先自行回忆，忘记了，再回看上个问题进行复习

doCleanupAfterCompletion函数负责完成连接相关属性的重置与连接释放:
```java
protected void doCleanupAfterCompletion(Object transaction) {
    DataSourceTransactionObject txObject = (DataSourceTransactionObject) transaction;
    // Remove the connection holder from the thread, if exposed.
    // 当前ConnectioHolder如果内部还持有Connection,则进行资源解绑,接触<DataSource,Connection>映射关系
    if (txObject.isNewConnectionHolder()) {
        TransactionSynchronizationManager.unbindResource(obtainDataSource());
    }
    // Reset connection.
    // 重置链接相关属性 -- txObject中保存中开启当前事务前，该连接相关属性设置
    Connection con = txObject.getConnectionHolder().getConnection();
    try {
        // 恢复先前该连接的相关属性设置
        if (txObject.isMustRestoreAutoCommit()) {
            con.setAutoCommit(true);
        }
        DataSourceUtils.resetConnectionAfterTransaction(
            con, txObject.getPreviousIsolationLevel(), txObject.isReadOnly());
    } catch (Throwable ex) {
        logger.debug("Could not reset JDBC Connection after transaction", ex);
    }
    // 释放连接
    if (txObject.isNewConnectionHolder()) {
        if (logger.isDebugEnabled()) {
            logger.debug("Releasing JDBC Connection [" + con + "] after transaction");
        }
        DataSourceUtils.releaseConnection(con, this.dataSource);
    }
    // 清空ConnectionHolder中保存的相关连接信息
    txObject.getConnectionHolder().clear();
}
```

releaseConnection函数真正负责完成连接释放逻辑:
```java
public static void doReleaseConnection(@Nullable Connection con, @Nullable DataSource dataSource) throws SQLException {
    if (con == null) {
        return;
    }
    if (dataSource != null) {
        // <datasource,connectionholder> 根据数据源作为key,取出当前线程通过该数据源建立的连接
        // 如果是newTransaction=false的场景,那么会跳过doCleanupAfterCompletion函数一开始的解绑行为
        // 此时还是可以根据DataSource取出对应的connectionHolder的
        ConnectionHolder conHolder = (ConnectionHolder) TransactionSynchronizationManager.getR
        esource(dataSource);
        if (conHolder != null && connectionEquals(conHolder, con)) {
            // It's the transactional Connection: Don't close it.
            // 递减connectionHolder内部的引用计数，当为0的时候,将connectionHolder与connection解绑
            // 但是connection连接不主动关闭
            conHolder.released();
            return;
        }
    }
    // 正常情况下,newTransaction=true时关闭连接
    doCloseConnection(con, dataSource);
}
```

connectionHolder的释放连接方法:
```java
public void released() {
    // 递减引用计数
    super.released();
    // 引用计数为0并且内部持有connection的前提下
    if (!isOpen() && this.currentConnection != null) {
        if (this.connectionHandle != null) {
            this.connectionHandle.releaseConnection(this.currentConnection);
        }
        // 接触connectionHolder与connection的绑定关系
        this.currentConnection = null;
    }
}
```

正常情况下，会在事务提交或者回滚时释放连接:
```java
public static void doCloseConnection(Connection con, @Nullable DataSource dataSource) throws SQLException {
    if (!(dataSource instanceof SmartDataSource) || ((SmartDataSource) dataSource).shouldClose(con)) {
        con.close();
    }
}
```

### 问题二: MultiplyThreadTransactionManager通过开辟子线程依次执行各个子任务，最后在所有子任务
执行完毕后，依次提交或者回滚每个子事务，提交和回滚过程中需要将子线程事务信息copy到主线程的threadLocal中，此时如果主线程也需要事务管理，同样需要使用threadlocal,是否存在问题 ?

- 保险起见，可以在最后依次提交或者回滚每个子事务前，保存主线程的相关事务上下文信
息，最后再进行恢复即可
```java
TransactionResource transactionResource = TransactionResource.copyTransactionResource();
TransactionSynchronizationManager.clear();
TransactionSynchronizationManager.unbindResource(dataSource);
for (int i = 0; i < tasks.size(); i++) {
    transactionResources.get(i).autoWiredTransactionResource();
    transactionManager.rollback(transactionStatusList.get(i));
    transactionResources.get(i).removeTransactionResource();
}
transactionResource.autoWiredTransactionResource();
```

## 小结
本文给出的只是一个方法，为了实现多线程事务一致性，我们还有很多方法，例如和本文一样的思想，直接利用JDBC提供的API来手动控制事务提交和回滚，或者可以尝试采用分布式事务的思路来解决问题。

大家之所以会被这个问题难住，主要是因为对Spring框架提供的便捷声明式事务支持中毒太深，以至于脑海中对事务的认知完全停留在`@Transactional`注解的层面，多了解底层基础设施，才能做到遇事不慌。
