- [IDEA下载](https://www.jetbrains.com/idea/download/?section=windows)
- [zhile.io ja-netfilter-javaagent-lib](https://zhile.io/2021/11/29/ja-netfilter-javaagent-lib.html)
- [zhile.io ja-netfilter-for-java17](https://zhile.io/2022/07/27/ja-netfilter-for-java17.html)
- [热心大佬](https://jetbra.in/s)
- [ja-netfilter](https://gitee.com/ja-netfilter/ja-netfilter/releases)
- [Java激活工具](https://gitee.com/javatodolist/java-active)
- [公众号-Java面试那些事儿](http://idea.lanyus.com/)
- [公众号-Java技术栈](https://www.javastack.cn/idea-active/)

## 1. IDEA激活

1. 登录账户试用 jb@163.com
2. 进入程序，`Help` -> `Edit Custom VM Options`
    ```shell
    -javaagent:D:/Develop/IDEA/ja-netfilter/ja-netfilter.jar
    --add-opens=java.base/jdk.internal.org.objectweb.asm=ALL-UNNAMED
    --add-opens=java.base/jdk.internal.org.objectweb.asm.tree=ALL-UNNAMED
    ```
3. 退出登录用户
4. 输入激活码 https://aijihuo.cn/jetbrains-activation-codes.html

## 2. IDEA注释模板

- 模板设置

```java
// 1. 类注释模板
* 
 * TODO
 * 
 * @author Hui Liu
 * @date $date$ $time$
 * @version 1.0.0
 */

// 2. 方法注释模板
*
 * description: $description$
$params$
 * @return $return$
 * @throws $throws$
 * @author Hui Liu
 * @date $date$ $time$
 */
```

- 参数脚本

```groovy
// description
groovyScript("def result=\"${_1}\"; return result + '\\n\\t * '", methodName());
// return
methodReturnType()
// params
groovyScript("def result=''; def params=\"${_1}\".replaceAll('[\\\\[|\\\\]|\\\\s]', '').split(',').toList(); if (params.size()==1 && (params[0]==null || params[0]=='null' || params[0]=='')) { return result; }; for(i = 0; i < params.size(); i++) {result+=' * @param ' + params[i] + ' TODO' + ((i < params.size() - 1) ? '\\n\\t' : '')}; return result;", methodParameters());

groovyScript("
def result='';
def params=\"${_1}\".replaceAll('[\\\\[|\\\\]|\\\\s]', '').split(',').toList(); 
if (params.size()==1 && (params[0]==null || params[0]=='null' || params[0]=='')) { 
    return result;
};
result+='\\n\\t';
for(i = 0; i < params.size(); i++) {
    result+=' * @param ' + params[i] + ' TODO' + ((i < params.size() - 1) ? '\\n\\t' : '')
};
return result;", methodParameters())

groovyScript("if(\"${_1}\".length() == 2) {return '';} else {def result=''; def params=\"${_1}\".replaceAll('[\\\\[|\\\\]|\\\\s]', '').split(',').toList();for(i = 0; i < params.size(); i++) {if(i==0){result+='* @param ' + params[i] + ': '}else{result+='\\n' + ' * @param ' + params[i] + ': '}}; return result;}", methodParameters());


groovyScript("
if(\"${_1}\".length() == 2) {
    return '';
} else {
    def result='';
    def params=\"${_1}\".replaceAll('[\\\\[|\\\\]|\\\\s]', '').split(',').toList();
    for(i = 0; i < params.size(); i++) {
        if(i==0){
            result+='* @param ' + params[i] + ': '
        }else{
            result+='\\n' + ' * @param ' + params[i] + ': '
        }
    }; return result;
}", methodParameters());

// throws
completeSmart()
// date
date()
// time
time()
```
## 3. jRebel激活

[jRebel激活](https://blog.csdn.net/lianghecai52171314/article/details/105637251)

1. 生成guid https://www.guidgen.com/
2. 激活URL  https://jrebel.qekang.com/{GUID}
3. 配置jrebal
   1. https://jrebel.qekang.com/98890f5e-827e-4fff-8758-63d572b5acdd
   2. 369950806@qq.com
4. 激活成功后设置为离线模式

## 4. 常用插件
1. jRebel
2. MyBatisCodeHelper-Pro
3. Translation - 必备的翻译插件
4. CodeGlance - 缩略图
5. Grep Console - 控制台日志 高亮
6. String Manipulation -对字符串的处理
7. GenerateAllSetter - 自动调用所有 Setter 函数（可填充默认值）
8. Maven Helper - 方便maven项目解决jar冲突
9. RestfulToolkit — 快捷跳转Action方法
10. Free Mybatis Plugin , MybatisX
11. EasyCode
12. EasyYapi
13. GeneratrSerialVersionUID
14. JFormDesigner
15. PlantUML Integration
16. ResourceBundle Editor
17. SonarAnalyzer
18. TestMe
19. UML Generator
20. VisualVM Launcher

21. CamelCase - 多种命名格式之间切换
22. Presentation Assistant - 快捷键展示
23. Key promoter X — 会有这个操作的快捷键在界面的右下角进行告知。
24. Codota — 代码智能提示
25. Alibaba Java Code Guidelines — 阿里巴巴 Java 代码规范
26. Rainbow Brackets — 让你的括号变成不一样的颜色，防止错乱括号
27. HighlightBracketPair — 括号开始结尾 高亮显示。
28. google-java-format — 代码自动格式化
29. Leetcode Editor - 可以在IDEA中在线刷题。
30. Statistic — 项目信息统计
31. jclasslib bytecode viewer - 查看字节码
32. Auto filling Java call arguments - 自动补全参数
33. GenerateO2O — 自动填充参数的值
34. FindBugs — 检查代码中的隐患
35. SonarLint — 检查代码中的隐患
36. SequenceDiagram — 调用链路自动生成时序图
37. Stack trace to UML — 根据 JVM 异常堆栈画 UML时序图和通信图
38. Java Stream Debugger — Stream 将操作步骤可视化
39. IDEA QAPlug - 帮助我们提前找到潜在的问题bug
