- [Flowable Offical](https://www.flowable.com/open-source)
- [Spring Boot + Flowable 工作流引擎](https://blog.csdn.net/qq_39035773/article/details/125414301)
- [Flowable 数据库表结构说明、Flowable 数据字典说明](https://www.cnblogs.com/phyger/p/14067201.html)
- 分享牛Flowable文档汉化：https://github.com/qiudaoke/flowable-userguide
- 猫七姑娘 flowable-6.6.0 运行官方 demo
- 华格瑞沙 https://www.cnblogs.com/yangjiming/p/10938515.html

想必大家再看这篇文章的时候已经对目前主流的 工作流引擎 有所了解了。目前主流的工作流开源框
架也就 Activiti/Camunda/Flowable 这几个了，在我对这三大工作流引擎简单使用了解后，最后选择了
Flowable 来写这篇文章。（有可能是我个人比较喜欢吧！在之前也有考虑过 Camunda，毕竟它更加
的轻巧灵活，他的初衷就是为开发人员设计的“小工具”，但我个人的感觉而言，Camunda 从代码上看
并没有 Activiti 和 Flowable 好，而且他的社区是最不活跃的一个，所以不太建议使用。当然这带了很
多个人主观感受，如有不同意见，欢迎讨论）。
Flowable 项目提供了一组核心的开源业务流程引擎，这些引擎紧凑且高效。它们为开发人员、系统管
理员和业务用户提供了一个工作流和业务流程管理（BPM）平台。它的核心是一个非常快速且经过测
试的动态 BPMN 流程引擎。它基于 Apache2.0 开源协议，有稳定且经过认证的社区。Flowable 可以
嵌入 Java 应用程序中运行，也可以作为服务器、集群运行，更可以提供云服务。
废话不多说我们直接来上手吧！

## 相关依赖
```xml
<!-- 不知道自己项目需要那些依赖的朋友直接引入这个 -->
<!-- <dependency>-->
    <!-- <groupId>org.flowable</groupId>-->
    <!-- <artifactId>flowable-spring-boot-starter</artifactId>-->
    <!-- <version>6.7.2</version>-->
<!-- </dependency>-->

<!-- flowable 执行器（里面包含了引擎启动器等等） -->
<dependency>
    <groupId>org.flowable</groupId>
    <artifactId>flowable-spring-boot-starter-actuator</artifactId>
    <version>6.7.2</version>
</dependency>
```

## 项目
配置文件说明（application-flowable.yml），根据自己的需求进行选择配置就行。（这里只是一部分，
太多了写不赢，所有配置文件引入依赖后在 flowable-spring-boot-autoconfigure-6.7.2.jar!\METAINF\spring-configuration-metadata.json 文件下可以看到所有配置文件以及说明）。
```yaml
# flowable 配置
flowable:
  check-process-definitions: true #是否需要自动部署流程定义。
  async-executor-activate: true # 是否启用异步执行器。
  cmmn:
    async:
      executor:
        async-job-lock-time: 300000 #异步作业在被异步执行器取走后的锁定时间（以毫秒计）。在这段时间内，其它异步执行器不会尝试获取及锁定这个任务。
        default-async-job-acquire-wait-time: 10000 #异步作业获取线程在进行下次获取查询前的等待时间（以毫秒计）。只在当次没有取到新的异步作业，或者只取到很少的异步作业时生效。默认值= 10 秒。
        default-queue-size-full-wait-time: 0 #异步作业（包括定时器作业与异步执行）获取线程在队列满时，等待执行下次查询的等待时间（以毫秒计）。默认值为0（以向后兼容）
        default-timer-job-acquire-wait-time: 1000 #定时器作业获取线程在进行下次获取查询前的等待时间（以毫秒计）。只在当次没有取到新的定时器作业，或者只取到很少的定时器作业时生效。默认值=10秒。
        max-async-jobs-due-per-acquisition: 1 # （译者补）单次查询的异步作业数量。默认值为1，以降低乐观锁异常的可能性。除非你知道自己在做什么，否则请不要修改这个值。
        retry-wait-time: 500 #重试等待时间
        timer-lock-time: 300000 #定时器作业在被异步执行器取走后的锁定时间（以毫秒计）。在这段时间内，其它异步执行器不会尝试获取及锁定这个任务。
    deploy-resources: true #是否部署资源。默认值为 true。
    deployment-name: SpringBootAutoDeployment # CMMN 资源部署的名字。
    enable-safe-xml: true # 在解析 CMMN XML 文件时进行额外检查。参见 https://www.flowable.org/docs/userguide/index.html#advanced.safe.bpmnxml # 不幸的是，部分平台（JDK 6，JBoss）上无法使用这个功能，因此如果你所用的平台在XML解析时不支持StaxSource，需要禁用这个功能。
    enabled: false # 是否启用 CMMN 引擎。
    resource-location: classpath*:/cases/ # CMMN 资源的路径。
    resource-suffixes: # **.cmmn,**.cmmn11,**.cmmn.xml,**.cmmn11.xml # 需要扫描的资源后缀名。
    servlet:
      load-on-startup: -1 # 启动时加载 CMMN servlet。
      name: Flowable CMMN Rest API # CMMN servlet 的名字。
      path: /cmmn-api # CMMN servlet 的 context path。
  content:
    enabled: false # 是否启动 Content 引擎。
    servlet:
      load-on-startup: -1 # 启动时加载 Content servlet。
      name: Flowable Content Rest API # Content servlet 的名字。
      path: /content-api # Content servlet 的 context path。
    storage:
      create-root: true # 如果根路径不存在，是否需要创建？
      root-folder: # 存储 content 文件（如上传的任务附件，或表单文件）的根路径。
  custom-mybatis-mappers: # 需要添加至引擎的自定义 Mybatis 映射的 FQN。
  custom-mybatis-x-m-l-mappers: # 需要添加至引擎的自定义 Mybatis XML 映射的路径。
  database-schema: # 如果数据库返回的元数据不正确，可以在这里设置 schema 用于检测/生成表。
  database-schema-update: true # 数据库 schema 更新策略。
  db-history-used: true # 是否要使用 db 历史。
  deployment-name: SpringBootAutoDeployment # 自动部署的名称。
  dmn:
    deploy-resources: true # 是否部署资源。默认为 true。
    deployment-name: SpringBootAutoDeployment # DMN 资源部署的名字。
    enable-safe-xml: true # 在解析 DMN XML 文件时进行额外检查。参见 https://www.flowable.org/docs/userguide/index.html#advanced.safe.bpmn.xml。不幸的是，部分平台（JDK 6，JBoss ）上无法使用这个功能，因此如果你所用的平台在XML解析时不支持StaxSource，需要禁用这个功能。
    enabled: false # 是否启用 DMN 引擎。
    history-enabled: false # 是否启用 DMN 引擎的历史。
    resource-location: classpath*:/dmn/ # DMN 资源的路径。
    resource-suffixes: # **.dmn,**.dmn.xml,**.dmn11,**.dmn11.xml # 需要扫描的资源后缀名。
    servlet:
      load-on-startup: -1 # 启动时加载 DMN servlet。
      name: Flowable DMN Rest API # DMN servlet 的名字。
      path: /dmn-api # DMN servlet 的 context path。
    strict-mode: true # 如果希望避免抉择表命中策略检查导致失败，可以将本参数设置为 false。如果检查发现了错误，会直接返回错误前一刻的中间结果。
  form:
    deploy-resources: true # 是否部署资源。默认为 true。
    deployment-name: SpringBootAutoDeployment # Form 资源部署的名字。
    enabled: false # 是否启用 Form 引擎。
    resource-location: classpath*:/forms/ # Form 资源的路径。
    resource-suffixes: # **.form # 需要扫描的资源后缀名。
    servlet:
      load-on-startup: -1 # 启动时加载 Form servlet。
      name: Flowable Form Rest API # Form servlet 的名字。
      path: /form-api # Form servlet 的 context path。
  history-level: audit # 要使用的历史级别。
  idm:
    enabled: false # 是否启用IDM引擎。
    ldap:
      attribute:
        email: # 用户 email 的属性名。
        first-name: # 用户名字的属性名。
        group-id: # 用户组 ID 的属性名。
        group-name: # 用户组名的属性名。
        group-type: # 用户组类型的属性名。
        last-name: # 用户姓的属性名。
        user-id: # 用户 ID 的属性名。
      base-dn: # 查找用户与组的 DN（标志名称 distinguished name）。
      cache:
        group-size: -1 # 设置{@link org.flowable.ldap.LDAPGroupCache}的大小。这是 LRU 缓存，用于缓存用户及组，以避免每次都查询 LDAP 系统。
      custom-connection-parameters: # 用于设置所有没有专用 setter 的 LDAP 连接参数。查看 http://docs.oracle.com/javase/tutorial/jndi/ldap/jndi.html 介绍的自定义参数。参数包括配置链接池，安全设置，等等。
      enabled: false # 是否启用 LDAP IDM 服务。
      group-base-dn: # 组查找的 DN。
      initial-context-factory: com.sun.jndi.ldap.LdapCtxFactory # 初始化上下文工厂的类名。
      password: # 连接 LDAP 系统的密码。
      port: -1 # LDAP 系统的端口。
      query:
        all-groups: # 查询所有组所用的语句。
        all-users: # 查询所有用户所用的语句。
        groups-for-user: # 按照指定用户查询所属组所用的语句
        user-by-full-name-like: # 按照给定全名查找用户所用的语句。
        user-by-id: # 按照 userId 查找用户所用的语句。
      search-time-limit: 0 # 查询 LDAP 的超时时间（以毫秒计）。默认值为0，即“一直等待”。
      security-authentication: simple # 连接 LDAP 系统所用的 java.naming.security.authentication 参数的值。
      server: # LDAP 系统的主机名。如 ldap://localhost。
      user: # 连接 LDAP 系统的用户 ID。
      user-base-dn: # 查找用户的 DN。
    password-encoder: # 使用的密码编码类型。
    servlet:
      load-on-startup: -1 # 启动时加载 IDM servlet。
      name: Flowable IDM Rest API # IDM servlet 的名字。
      path: /idm-api # IDM servlet 的 context path。
  mail:
    server:
      default-from: flowable@localhost # 发送邮件时使用的默认发信人地址。
      host: localhost # 邮件服务器。
      password: # 邮件服务器的登录密码。
      port: 1025 # 邮件服务器的端口号。
      use-ssl: false # 是否使用 SSL/TLS 加密 SMTP 传输连接（即 SMTPS/POPS)。
      use-tls: false # 使用或禁用 STARTTLS 加密。
      username: # 邮件服务器的登录用户名。如果为空，则不需要登录。
  process:
    async:
      executor:
        async-job-lock-time: 300000 # 异步作业在被异步执行器取走后的锁定时间（以毫秒计）。在这段时间内，其它异步执行器不会尝试获取及锁定这个任务。
        default-async-job-acquire-wait-time: 10000 # 异步作业获取线程在进行下次获取查询前的等待时间（以毫秒计）。只在当次没有取到新的异步作业，或者只取到很少的异步作业时生效。默认值= 10 秒。
        default-queue-size-full-wait-time: 0 # 异步作业（包括定时器作业与异步执行）获取线目录
        default-queue-size-full-wait-time: 0 # 异步作业（包括定时器作业与异步执行）获取线程在队列满时，等待执行下次查询的等待时间（以毫秒计）。默认值为0（以向后兼容）
        default-timer-job-acquire-wait-time: 10000 # 定时器作业获取线程在进行下次获取查询前的等待时间（以毫秒计）。只在当次没有取到新的定时器作业，或者只取到很少的定时器作业时生效。默认值= 10秒。
        max-async-jobs-due-per-acquisition: 1 # （译者补）单次查询的异步作业数量。默认值为1，以降低乐观锁异常的可能性。除非你知道自己在做什么，否则请不要修改这个值。
        retry-wait-time: 500 # 重试等待时间
        timer-lock-time: 300000 # 定时器作业在被异步执行器取走后的锁定时间（以毫秒计）。在这段时间内，其它异步执行器不会尝试获取及锁定这个任务。
    definition-cache-limit: -1 # 流程定义缓存中保存流程定义的最大数量。默认值为-1（缓存所有流程定义）。
    enable-safe-xml: true # 在解析 BPMN XML 文件时进行额外检查。参见 https://www.flowable.org/docs/userguide/index.html#advanced.safe.bpmn.xml。不幸的是，部分平台（JDK 6，JBoss ）上无法使用这个功能，因此如果你所用的平台在XML解析时不支持StaxSource，需要禁用这个功能。
    servlet:
      load-on-startup: -1 # 启动时加载P rocess servlet。
      name: Flowable BPMN Rest API # Process servlet 的名字。
      path: /process-api # Process servelet 的 context path。
  process-definition-location-prefix: classpath*:/processes/ # 自动部署时查找流程的目录。
  process-definition-location-suffixes: # **.bpmn20.xml,**.bpmn # processDefinitionLocationPrefix路径下需要部署的文件的后缀（扩展名）。

management:
  endpoint:
    flowable:
      # cache:
        # time-to-live: 0ms # 缓存响应的最大时间。
      enabled: true # 是否启用 flowable 端点。
```

到这里你一句代码都不用写直接启动项目，项目启动完成后你会发现你数据库中多了一些以 ACT 开头
的表，这些就是 Flowable 引擎所需要的一些默认引擎支撑表。（有可能根据你引入的版本不同或者依
赖不同所生成的表不同，不需要大惊小怪）。

## 部分核心表说明：
1、Flowable 的所有数据库表都以ACT_开头。第二部分是说明表用途的两字符标示符。服务API的命名也大略符合这个规则。
2、ACT_RE_: 'RE’代表repository。带有这个前缀的表包含“静态”信息，例如流程定义与流程资源（图片、规则等）。
3、ACT_RU_: 'RU’代表 runtime。这些表存储运行时信息，例如流程实例（process instance）、用户任务（user task）、变量（variable）、作业（job）等。Flowable 只在流程实例运行中保存运行时数据，并在流程实例结束时删除记录。这样保证运行时表小和快。
4、ACT_HI_: 'HI’代表history。这些表存储历史数据，例如已完成的流程实例、变量、任务等。
5、ACT_GE_: 通用数据。在多处使用。

1）通用数据表
- act_ge_bytearray：二进制数据表，如流程定义、流程模板、流程图的字节流文件；
- act_ge_property：属性数据表（不常用）；

2）历史表（HistoryService接口操作的表）
- act_hi_actinst：历史节点表，存放流程实例运转的各个节点信息（包含开始、结束等非任务节点）；
- act_hi_attachment：历史附件表，存放历史节点上传的附件信息（不常用）；
- act_hi_comment：历史意见表；
- act_hi_detail：历史详情表，存储节点运转的一些信息（不常用）；
- act_hi_identitylink：历史流程人员表，存储流程各节点候选、办理人员信息，常用于查询某人或部门的已办任务；
- act_hi_procinst：历史流程实例表，存储流程实例历史数据（包含正在运行的流程实例）；
- act_hi_taskinst：历史流程任务表，存储历史任务节点；
- act_hi_varinst：流程历史变量表，存储流程历史节点的变量信息；

3）用户相关表（IdentityService 接口操作的表）
- act_id_group：用户组信息表，对应节点选定候选组信息；
- act_id_info：用户扩展信息表，存储用户扩展信息；
- act_id_membership：用户与用户组关系表；
- act_id_user：用户信息表，对应节点选定办理人或候选人信息；

4）流程定义、流程模板相关表（RepositoryService 接口操作的表）
- act_re_deployment：部属信息表，存储流程定义、模板部署信息；
- act_re_procdef：流程定义信息表，存储流程定义相关描述信息，但其真正内容存储在
- act_ge_bytearray表中，以字节形式存储；
- act_re_model：流程模板信息表，存储流程模板相关描述信息，但其真正内容存储在
- act_ge_bytearray表中，以字节形式存储；

5）流程运行时表（RuntimeService 接口操作的表）
- act_ru_task：运行时流程任务节点表，存储运行中流程的任务节点信息，重要，常用于查询人员或部门的待办任务时使用；
- act_ru_event_subscr：监听信息表，不常用；
- act_ru_execution：运行时流程执行实例表，记录运行中流程运行的各个分支信息（当没有子流程时，其数据与act_ru_task表数据是一一对应的）；
- act_ru_identitylink：运行时流程人员表，重要，常用于查询人员或部门的待办任务时使用；
- act_ru_job：运行时定时任务数据表，存储流程的定时任务信息；
- act_ru_variable：运行时流程变量数据表，存储运行中的流程各节点的变量信息；


## 代码部分
在上面介绍流程引擎相关表的时候有提到几个接口，`HistoryService`、`IdentityService`、
`RepositoryService`、`RuntimeService` 这几个接口就是我们在使用 `Flowable` 流程引擎时最长使用的几个
接口了，也是 `Flowable` 流程引最核心的几个接口了。我们很多时候进行需求开发，都是围绕着这几个
接口开发的，这几个接口已经满足大多数的需求开发了（深度定制除外）。
常用 `Flowable` 流程服务：

```java
package com.light.cloud.flowable;

import java.io.InputStream;
import java.util.Map;

import jakarta.annotation.Resource;

import org.flowable.engine.DynamicBpmnService;
import org.flowable.engine.FormService;
import org.flowable.engine.HistoryService;
import org.flowable.engine.IdentityService;
import org.flowable.engine.ManagementService;
import org.flowable.engine.ProcessEngine;
import org.flowable.engine.ProcessMigrationService;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.RuntimeService;
import org.flowable.engine.TaskService;
import org.flowable.engine.repository.Deployment;
import org.flowable.engine.runtime.ProcessInstance;

/**
 * 流程常用服务引擎
 *
 * @author Hui Liu
 * @date 2023/8/11
 */
public class FlowableServiceFactory {

    public static final String BPMN_FILE_SUFFIX = ".bpmn20.xml";

    /**
     * 提供对流程定义和部署存储库的访问的服务
     */
    @Resource
    protected RepositoryService repositoryService;
    /**
     * 流程执行服务
     */
    @Resource
    protected RuntimeService runtimeService;
    /**
     * 管理用户和组的服务
     */
    @Resource
    protected IdentityService identityService;
    /**
     * 提供访问任务和表单相关操作的服务
     */
    @Resource
    protected TaskService taskService;
    /**
     * 访问表单数据和呈现的表单以启动新流程实例和完成任务
     */
    @Resource
    protected FormService formService;
    /**
     * 服务公开有关正在进行的和过去的流程实例的信息。
     * 这与运行时信息不同，因为运行时信息仅包含任何给定时刻的实际运行时状态，
     * 并且针对运行时流程执行性能进行了优化。
     * 历史信息经过优化，便于查询，并永久保存在持久存储中
     */
    @Resource
    protected HistoryService historyService;
    /**
     * 用于流程引擎上的管理和维护操作的服务。
     * 这些操作通常不会在工作流驱动的应用程序中使用，而是在例如操作控制台中使用
     */
    @Resource
    protected ManagementService managementService;
    /**
     * 提供对公开 BPM 和工作流操作的所有服务的访问
     */
    @Resource
    protected ProcessEngine processEngine;

    @Resource
    protected DynamicBpmnService dynamicBpmnService;

    @Resource
    protected ProcessMigrationService processMigrationService;

    /**
     * 通过 InputStream 流部署流程定义
     *
     * @param name     流程模板文件名字
     * @param tenantId 业务系统标识
     * @param category 流程模板文件类别
     * @param in       流程模板文件流
     * @return 部署流程对象，是流程定义、图像、表单等资源的容器
     */
    public Deployment deploy(String name, String tenantId, String category, InputStream in) {
        return repositoryService.createDeployment()
                .addInputStream(name + BPMN_FILE_SUFFIX, in)
                .name(name)
                .tenantId(tenantId)
                .category(category)
                .deploy();
    }

    /**
     * 启动流程实例
     *
     * @param processDefinitionId 流程定义ID，不能为空.
     * @param variables           流程实例变量。
     * @return 流程实例
     */
    public ProcessInstance startProcessInstanceById(String processDefinitionId, Map<String, Object> variables) {
        return runtimeService.startProcessInstanceById(processDefinitionId, variables);
    }

    /**
     * 任务反签收
     *
     * @param taskId 任务的id，不能为null.
     */
    public void unclaim(String taskId) {
        taskService.unclaim(taskId);
    }

    /**
     * 执行任务
     *
     * @param taskId 任务的id，不能为null.
     */
    public void complete(String taskId) {
        taskService.complete(taskId);
    }

    /**
     * 任务委派
     *
     * @param taskId 任务的id，不能为null.
     * @param userId 被委派人ID.
     */
    public void delegate(String taskId, String userId) {
        taskService.delegateTask(taskId, userId);
    }

    /**
     * 任务移交：将任务的所有权转移给其他用户。
     *
     * @param taskId 任务的id，不能为null.
     * @param userId 接受所有权的人.
     */
    public void setAssignee(String taskId, String userId) {
        taskService.setAssignee(taskId, userId);
    }

    /**
     * 委派任务完成，归还委派人
     *
     * @param taskId 任务的id，不能为null.
     */
    public void resolveTask(String taskId) {
        taskService.resolveTask(taskId);
    }

    /**
     * 任务撤回
     *
     * @param processInstanceId 流程实例ID.
     * @param currentActivityId 当前活动任务ID.
     * @param newActivityId     撤回到达的任务ID.
     */
    public void withdraw(String processInstanceId, String currentActivityId, String newActivityId) {
        runtimeService.createChangeActivityStateBuilder()
                .processInstanceId(processInstanceId)
                .moveActivityIdTo(currentActivityId, newActivityId)
                .changeState();
    }

}
```
