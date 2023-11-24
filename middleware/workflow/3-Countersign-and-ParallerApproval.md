- [flowable 中级 - 1. 多任务实现会签、或签](https://segmentfault.com/a/1190000042668271)

## 1、简介
做工作流，基本会遇到会签、或签的需求。而flowable是通过多任务方式来实现的

## 2、主要实现方式
在流程运行到任务节点时不是按照默认规则只生成一条任务记录，而是根据需要同时生成多条任务记录，甚至生成的多条任务都能分别对应到指定的各个审批人。而不再需要领取。这种就叫多任务

简述下这里面用到了核心流程


要实现多任务，则需要对 需要的任务节点需要做相关处理

下面介绍了解到两种方式处理

### 2.1 xml方式
此种方式是直接通过在xml的相应节点来定义多任务,这种官方有大量的xml 例子

[【官方】多任务的xml](https://github.com/flowable/flowable-engine/tree/main/modules/flowable-engine/src/test/resources/org/flowable/engine/test/bpmn/multiinstance)

使用flowable 官方的套件来配置多任务的交互见面大概如下(图片来源于网上)：

最终对应到实际的核心xml详细如下 (下面xml不严格对应上图)
```xml
<bpmn2:userTask id="Activity_1g65lke" name="审批啊14" flowable:assignee="${approver}" flowable:candidateGroups="2317,2347" flowable:category="CHECK">
    <bpmn2:extensionElements>
        <flowable:executionListener class="***.listens.MultiInstanceListen" event="start" />
    </bpmn2:extensionElements>
    <bpmn2:incoming>Flow_1666168081285</bpmn2:incoming>
    <bpmn2:outgoing>Flow_03sldqb</bpmn2:outgoing>

    <bpmn2:multiInstanceLoopCharacteristics flowable:collection="Activity_1g65lke_approverList" flowable:elementVariable="approver">
        <bpmn2:completionCondition>${nrOfCompletedInstances>=1}</bpmn2:completionCondition>
    </bpmn2:multiInstanceLoopCharacteristics>

</bpmn2:userTask>
```
如果你不是用的官方的UI来生成的xml, 那么你的自己想办法也需要构造出上面的xml

### 2.2 java类后端处理
此种方式是我在调研时看到的，我并未尝试过，不太切合我们的需求，但是也是一种方式

此种方式就是运行到相应节点，后端通过调用api来生成多任务所需要的一切

这边就不放核心代码了，直接可以点击网友已经做好的整理

[activiti多实例设置(会签/或签)](https://blog.csdn.net/qq_34758074/article/details/103330904)

## 3、核心参数解释
上面应该能看到我们需要配置一些东西才能支持多任务。这里详细说下相关参数及重要点

### 3.1 相关参数
1. isSequential: 表示并行，还是顺序。(xml跟配图可能有出入)
2. loop cardinality：循环基数。可选项。可以直接填整数，表示会签、或签的人数 - (会创建基数个任务实例)
  - 使用该参数只能保证生成相应的任务，但是生成的任务没有assign
  - 该参数跟下面 collection 二选一就行
3. flowable:collection: 此种方式是表示的会签、或签的具体人。这里xml只需要约定好固定的格式 即可。比如 - flowable:collection="Activity_1g65lke_approverList"
4. flowable:elementVariable: 元素变量, 这里xml只需要约定好固定的格式 即可 - flowable:elementVariable="approver"
5. completionCondition：完成条件。这个条件控制着这里是会签、或签如何才能算完成。
   - nrOfCompletedInstances: 完成的任务实例数
   - nrOfInstances: 总共生成的任务实例数(根据会签、或签指定的人数生成相应的任务数)
   - nrOfActiveInstance: 未完成实例的数目
   - loopCounter: 循环计数器，办理人在列表中的索引

参考配置
- 当是或签时，直接固定配置： ${nrOfCompletedInstances>=1} 即可
- 当是会签时，固定配置： ${nrOfCompletedInstances==nrOfInstances} 即可

​

### 3.2 重要点
1. 在会签、或签节点增加 multiInstanceLoopCharacteristics 相应的标签
2. 指定生成的任务数。这里更建议使用 collection。 因为它可以相关配置做到 给生成的任务实例时就有assign
3. 任务标签上属性 flowable:assignee="${approver}" 必须固定这么指定，否则创建的多任务记录里面 assign还是没值

   - 属性assignee 取 Element varible的值，比如Element varible设置为approver，Assignents就设置为${approver}
4. 如果节点是审批节点，那么一定需要在用户任务节点 的 extensionElements下添加 监听器
5. 完成条件。放在后文单独讲

## 4、collection 赋值
### 4.1 使用原因

首先我们为什么要使用 collection 再次简单说下，通过上面的配置，当指定了 collection 的流程变量后，在引擎自动生成多任务时每个任务的assign都有值了。就不再需要增加业务逻辑处理(遍历多任务后然后拿到审批人，依次给每个任务塞 处理人)

### 4.1 如何赋值
做下来觉得最难的地方就是 collection 赋值的问题。思路线索很多，但是都存在问题

### 4.2 处理方式
#### 4.2.1 官方
首先说还是说官方的例子 [点击查看MultiInstanceTest](https://github.com/flowable/flowable-engine/blob/main/modules/flowable-engine/src/test/java/org/flowable/engine/test/bpmn/multiinstance/MultiInstanceTest.java)

里面竟然是通过在发起流程就指定了审批人。这种也太DEMO了点。审批人即使是配置时固定的人，在开始发起流程就有知道审批人，那么就需要去解析xml, 找到相应节点的审批人。这种一开始只被我用来做最后的打算

官方还给出另一种表达式方案 [点击查看multiinstancemodel.bpmn](https://github.com/flowable/flowable-engine/blob/main/modules/flowable-bpmn-converter/src/test/resources/multiinstancemodel.bpmn)
```xml
    <endEvent id="sid-194696BA-1A7D-47D7-95A9-A77390D25048"></endEvent>
    <userTask id="userTask1" name="User task 1" flowable:async="true" flowable:exclusive="false">
      <multiInstanceLoopCharacteristics isSequential="false" flowable:elementVariable="participant">
        <extensionElements>
          <flowable:collection flowable:class="org.flowable.engine.test.bpmn.multiinstance.JSONCollectionHandler">
            <flowable:string>
              <![CDATA[[
                   {
                     "principalType" : "User",
                     "role" : "PotentialOwner",
                     "principal" : "wfuser1",
                     "version" : 1
                   },
                   {
                     "principalType" : "User",
                     "role" : "PotentialOwner",
                     "principal" : "wfuser2",
                     "version" : 1
                   }
                 ]]]>
            </flowable:string>
          </flowable:collection>
        </extensionElements>
      </multiInstanceLoopCharacteristics>
    </userTask>
```
然后这种方式我是各种尝试，但是在流程走到该节点就出现解析不成功问题

最后我也查到了这种方式的来源是这篇帖子 [Multi-instance collection syntax proposal](https://forum.flowable.org/t/multi-instance-collection-syntax-proposal/615) 有更感兴趣的可以去看看

#### 4.2.2 事件
在尝试使用上面方式失败后，我开始尝试用监听事件的方式来赋值collection 。

我尝试过 `FlowableEngineEventType.ACTIVITY_STARTED` 事件 , `FlowableEngineEventType.TASK_CREATED` 事件

但是发现都不行，他们都是在多任务已经创建完后才会执行相关的事件方法。这个时候已经生成的多个任务，但是它们的assign都是空的

#### 4.2.3 执行监听器
我在网上查询方案，终于在一篇文中 [activiti多实例设置(会签/或签)](https://blog.csdn.net/qq_34758074/article/details/103330904) 看到能在任务创建前赋值collection 的可能。

然后我根据这个信息查到配置执行监听器最终做到在正确时机给 collection 赋值

首先，需要在xml需要添加监听器 (完整可以看看上面的xml)
```xml
<flowable:executionListener class="***.listens.MultiInstanceListen" event="start" />
```
然后看看实现

```java
/**
 *  多任务监听，主要是把 多人任务xml设置的集合给填充掉
 */
@Component
@Slf4j
public class MultiInstanceListen implements ExecutionListener {

    @Override
    public void notify(DelegateExecution execution) {
        FlowElement element = execution.getCurrentFlowElement();
        if (element instanceof UserTask) {
            UserTask userTask = (UserTask) element;
            List<String> candidateGroups = userTask.getCandidateGroups();

            // 多任务时，每个任务都会执行一次这个监听器，所以更新、插入操作需要小心，避免重复操作
            Object flag = execution.getVariable(userTask.getId().concat("_approverList"));
            if (flag==null) {
                log.info("candidateGroups value: {}", candidateGroups.toString());
                // 设置 setVariableLocal 会导致找不到 assigneeList 变量
                // userTask.getId() 就是节点定义ID，拼上它，可以解决一个流程里面多个审批节点问题
                execution.setVariable(userTask.getId().concat("_approverList"), candidateGroups);
            }
        }
    }
}
```
通过此方式，就会在创建多任务之前执行该监听器，从而让 **_approverList集合存放在流程变量中

#### 4.2.4 groovy script
在查找解决方案的过程中，发现camunda 提供groovy script方式来解决 collection 赋值的问题

它还是需要给任务配置一个 执行监听器(executionListener),然后再配合上 groovy script
```xml
<bpmn:extensionElements>
        <camunda:executionListener event="start">
          <camunda:script scriptFormat="groovy">def userList = ['user1', 'user2', 'user3'];execution.setVariable("assigneeList", userList);</camunda:script>
        </camunda:executionListener>
</bpmn:extensionElements>
```

不过这种方式是被前端控制，如果审批人后续有更复杂的变动(带有业务逻辑)，这是就不建议继续在前端做

不过这也是一种方式，而且flowable好像也支持，不过这种方式我还没有试验过

参考链接：[基于camunda如何实现会签：camunda会签流程配置与原理解析](https://blog.csdn.net/wxz258/article/details/118055189)

## 5、审批完成条件
最开始 做的时候 觉得完成条件(completionCondition)简单拿到几个内置变量来比较下就行了，直接在xml里面配置完成就行

结果还是发现自己轻率了，因为需要有个一票否决的东西。不管会签、或签只有人有点了拒绝，直接走到结束节点。

直接到节点结束，这个可以通过 网关 + 到结束节点的线条 (线条条件) 就可以实现

但是怎么让会签只要有一个人拒绝后，就马上让其他任务完结？

这个我去找了网上资料查询，得到启示—直接可以配置调用后端的服务方法，完成条件完全由后端控制
```xml
<multiInstanceLoopCharacteristics flowable:collection="Activity_14ked1m_approverList" flowable:elementVariable="approver">
    <completionCondition>${multiInstance.accessCondition(execution)}</completionCondition>
</multiInstanceLoopCharacteristics>
```

相关java代码如下，主要是控制 方法的返回bool值来控制该节点是否走完

```java
package com.xxx.bpm.core.biz.config.multiTask;

import lombok.extern.slf4j.Slf4j;
import org.flowable.bpmn.model.ExtensionAttribute;
import org.flowable.bpmn.model.FlowElement;
import org.flowable.bpmn.model.UserTask;
import org.flowable.engine.delegate.DelegateExecution;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.List;

/**
 * 对应多任务(审批节点)xml里面的 <completionCondition>${multiInstance.accessCondition(execution)}</completionCondition>
 */
@Slf4j
@Component(value = "multiInstance")
public class MultiInstanceCompleteTask implements Serializable {

    public boolean accessCondition(DelegateExecution execution) {
        log.info("审批的条件处理");
        // 会签、还是或签，默认或签
        boolean flag = false;
        FlowElement element = execution.getCurrentFlowElement();
        if (element instanceof UserTask) {
            UserTask userTask = (UserTask) element;

            // 获取时会签还是或签
            List<ExtensionAttribute> checkType = userTask.getAttributes().get("checkType");
            if (checkType != null) {
                ExtensionAttribute extensionAttribute = checkType.get(0);
                if (extensionAttribute.getValue().equals("AND")) {
                    flag = true;
                }
            }
        }

        //否决判断，一票否决
        if (execution.getVariable("agree") != null && execution.getVariable("agree").equals("false")) {
            //输出方向为拒绝
            execution.setVariable("agree", "false");
            //一票否决其他实例没必要做，结束
            return true;
        }

        //获取所有的实例数
        int AllInstance = (int) execution.getVariable("nrOfInstances");
        // 已经完成的实例数
        int completedInstance = (int) execution.getVariable("nrOfCompletedInstances");

        if (flag) {
            // 会签
            if (AllInstance == completedInstance) {
                //输出方向为赞同
                execution.setVariable("agree", "true");
                return true;
            }
        } else {
            // 或签
            if (completedInstance >= 1) {
                execution.setVariable("agree", "true");
                return true;
            }
        }
        return false;
    }

}
```
