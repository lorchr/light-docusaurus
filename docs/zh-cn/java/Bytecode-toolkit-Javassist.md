- [字节码操作的手术刀-Javassist](https://mp.weixin.qq.com/s/nsfnraqeR4LW9cr1VLfpwQ)

## Javassist
前面文章介绍的 `ASM` 入门门槛还是挺高的，需要跟底层的字节码指令打交道，优点是小巧、性能好。`Javassist` 是一个性能比 `ASM` 稍差但是使用起来简单很多的字节码操作库，不需要了解字节码指令，由东京工业大学的数学和计算机科学系的教授 `Shigeru Chiba` 开发.

[`Javassist`](http://www.javassist.org/)是可以动态编辑`Java`字节码的类库。它可以在`Java`程序运行时定义一个新的类，并加载到`JVM`中；还可以在`JVM`加载时修改一个类文件。`Javassist`使用户不必关心字节码相关的规范也是可以编辑类文件的。

### Javassist作用
- `动态代理` Javassist可以在运行时生成代理类，从而实现AOP编程，比如在方法调用前后增加日志、权限控制等功能。

- `动态生成类` Javassist可以在运行时动态地生成新的类，这个特性在一些框架中被广泛使用。

- `类文件编辑` Javassist可以在运行时修改类的字节码，从而实现一些功能，比如动态修改类的字段、方法等。

- `字节码分析` Javassist可以对字节码进行分析，提取类的结构信息，比如类名、字段、方法等。

### 核心 API
图片

在 Javassist 中每个需要编辑的 class 都对应一个 `CtClass`，`CtClass` 的含义是编译时的类`（"compile time class"）`，这些类会存储在 `ClassPool` 中，`ClassPool` 是一个容器，存储了一系列 `CtClass` 对象。

`Javassist` 的 API 与 Java 反射 API 比较相似，Java 类包含的字段、方法在 `Javassist` 中分别对应 `CtField` 和 `CtMethod`，通过 `CtClass` 对象就可以给类新增字段、修改方法了。

图片

### CtMethod
对应一个 `class` 文件，`CtMethod` 对应一个方法，`ClassPool` 是 `CtClass` 的集合。

CtClass 的 `writeFile` 可以将生成的 class 文件输出到指定目录中。新建一个 Hello 类可以用下面的代码：
```java
ClassPool cp = ClassPool.getDefault();
CtClass ct = cp.makeClass("ya.me.Hello");
ct.writeFile("./out");
```

运行上面的代码，out 目录下就生成了一个 Hello 类，内容如下：
```java
package ya.me;

public class Hello {
    public Hello() {
    }
}
```

给已有类新增方法 有一个空的 MyMain 类，如下所示：

```java
public class MyMain {

}
```

接下来用 Javassist 给它新增一个 foo 方法。

```java
ClassPool cp = ClassPool.getDefault();
cp.insertClassPath("/path/to/MyMain.class");
CtClass ct = cp.get("MyMain");
CtMethod method = new CtMethod(
        CtClass.voidType,
        "foo",
        new CtClass[]{CtClass.intType, CtClass.intType},
        ct);
method.setModifiers(Modifier.PUBLIC);
ct.addMethod(method);
ct.writeFile("./out");
```

查看生成 MyMain 类可以看到生成了 foo 方法

```java
public void foo(int var1, int var2) {
}
```

### 修改方法体
CtMethod 提供了几个实用的方法来修改方法体：

- setBody 方法来替换整个方法体，setBody 方法接收一段源代码字符串，Javassist 会将这段源码字符串编译为字节码，替换原有的方法体。
- insertBefore、insertAfter：在方法开始和结束插入语句。

```java
public int foo(int a, int b) {
    return a + b;
}
```

比如想把 foo 方法体修改为 "return 0;"，可以这么修改：

```java
...
CtMethod method = ct.getMethod("foo", "(II)I");
method.setBody("return 0;");
...
```

生成的修改过的 foo 方法如下：

```java
public int foo(int var1, int var2) {
    return 0;
}
```

如果想把 foo 方法体的 a + b; 修改为 "a * b"，是不是可以用下面的代码：

```java
method.setBody("return a * b;")
```

运行报错，提示找不到字段 a：

```java
Exception in thread "main" javassist.CannotCompileException: [source error] no such field: a
	at javassist.CtBehavior.setBody(CtBehavior.java:474)
	at javassist.CtBehavior.setBody(CtBehavior.java:440)
	at JavassistTest2.main(JavassistTest2.java:17)
Caused by: compile error: no such field: a
```

这是因为源代码在 javac 编译以后，局部变量名字都被抹去了，只留下了类型和局部变量表的位置，比如上面的 a 和 b 对应局部变量表 1 和 2 的位置，位置 0 由 this 占用。

在 Javassist 中访问方法参数使用 `$0`` $1` ...，而不是直接使用变量名，把上面的代码改为：

```java
method.setBody("return $1 * $2;");
```

生成新的 MyMain 类中 foo 方法已经变

```java
public int foo(int var1, int var2) {
    return var1 * var2;
}
```

除了方法的参数，Javassist 定义了以 $ 开头的特殊标识符，如下表所示：

下面来逐一介绍

| 符号               | 含义                                          |
| ------------------ | --------------------------------------------- |
| `$0` `$1` `$2` ... | `this` 和方法参数                             |
| `$args`            | 方法参数数组，类型为`Object[]`                |
| `?`                | 所有参数，`foo(?)`相当于`foo($1, $2,...)`     |
| `$cflow(...)`      | control flow变量                              |
| `$r`               | 返回结果的类型，用于强制类型转换              |
| `$w`               | 包装器类型，用于强制类型转换                  |
| `$_`               | 返回值                                        |
| `$sig`             | 类型为`java.lang.Class`的参数类型数组           |
| `$type`            | 一个`java.lang.Class`对象，表示返回值类型       |
| `$class`           | 一个`java.lang.Class`对象，表示当前正在修改的类 |

- `$0` `$1` `$2` ... 方法参数
- `$0` 等价于 this，如果是静态方法 $0 不可用，从 $1 开始依次表示方法参数
- `$args` 参数
- `$args`变量表示所有参数的数组，它是一个 Object 类型的数组，如果参数中有原始类型，会被转为对应的对象类型，比如上面 foo(int a, int b) 对应的 $args 为

```java
new Object[]{ new Integer(a), new Integer(b) }
```

- `?` 参数 `?` 参数表示所有的参数的展开，参数直接用逗号分隔，

```java
foo(?)
```

相当于：

```java
foo($1, $2, ...)
```

- `$cflow` $cflow 是 "control flow" 的缩写，这是一个只读的属性，表示某方法递归调用的深度。一个典型的使用场景是监控某递归方法执行的时间，只想记录一次最顶层调用的时间，可以使用 `$cflow` 来判断当前递归调用的深度，如果不是最顶层调用忽略记录时间。

比如下面的计算 fibonacci 的方法：
```java
public long fibonacci(int n) {
    if (n <= 1) return n;
    else return fibonacci(n-1) + fibonacci(n-2);
}
```

如果只想在第一次调用的时候执行打印，可以用下面的的代码：
```java
CtMethod method = ct.getMethod("fibonacci", "(I)J");
method.useCflow("fibonacci");
method.insertBefore(
        "if ($cflow(fibonacci) == 0) {" +
            "System.out.println(\"fibonacci init \" + $1);" +
        "}"
);
```

执行生成的 MyMain，可以看到只输出了一次打印：

```shell
java -cp /path/to/javassist.jar:. MyMain
fibonacci init 10
```

- `$_` 参数 CtMethod 的 insertAfter() 方法在目标方法的末尾插入一段代码。$_ 来表示方法的返回值，在 insertAfter 方法可以引用。比如下面的代码：
method.insertAfter("System.out.println(\"result: \"  + $_);");

查看反编译生成的 class 文件：
```java
public int foo(int a, int b) {
    int var4 = a + b;
    System.out.println(var4);
    return var4;
}
```

细心的读者看到这里会有疑问，如果是方法异常退出，它的方法返回值是什么呢？假如 foo 代码如下：
```java
public int foo(int a, int b) {
    int c = 1 / 0;
    return a + b;
}
```

执行上的改写后，反编译以后代码如下：
```java
public int foo(int a, int b) {
    int c = 1 / 0;
    int var5 = a + b;
    System.out.println(var5);
    return var5;
}
```

这种情况下，代码块抛出异常，是无法执行插入的语句的。如果想代码抛出异常的时候也能执行，就需要把 insertAfter 的第二个参数 asFinally 设置为 true：
```java
method.insertAfter("System.out.println(\"result: \"  + $_);", true);
```

执行输出结果如下，可以看到已经输出了 "result: 0"
```java
result: 0
Exception in thread "main" java.lang.ArithmeticException: / by zero
        at MyMain.foo(MyMain.java:9)
        at MyMain.main(MyMain.java:6)
```
还有几个 Javassist 提供的内置变量（$r等），用的非常少，这里不再介绍，具体可以查看 [javassist 的官网](http://www.javassist.org/)。

## 小结
本文的内容主要介绍了 `Javassist` 这个非常广泛的字节码改写工具，详细介绍了它们的 `API` 和常见使用场景，后续的文章我们将讲述`ASM`和`Javassist`的一些实际的应用。