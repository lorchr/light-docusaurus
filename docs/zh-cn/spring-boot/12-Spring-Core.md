## 资源管理
资源管理是Spring的一个核心的基础功能，不过在说Spring的资源管理之前，先来简单说一下Java中的资源管理。

### Java资源管理
Java中的资源管理主要是通过java.net.URL来实现的，通过URL的openConnection方法可以对资源打开一个连接，通过这个连接读取资源的内容。

资源不仅仅指的是网络资源，还可以是本地文件、一个jar包等等。

#### 1、来个Demo
举个例子，比如你想到访问www.baidu.com这个百度首页网络资源，那么此时就可以这么写
```java
public class JavaResourceDemo {

    public static void main(String[] args) throws IOException {
        //构建URL 指定资源的协议为http协议
        URL url = new URL("http://www.baidu.com");
        //打开资源连接
        URLConnection urlConnection = url.openConnection();
        //获取资源输入流
        InputStream inputStream = urlConnection.getInputStream();
        //通过hutool工具类读取流中数据
        String content = IoUtil.read(new InputStreamReader(inputStream));
        System.out.println(content);
    }

}
```

解释一下上面代码的意思：

首先构建一个URL，指定资源的访问协议为http协议
通过URL打开一个资源访问连接，然后获取一个输入流，读取内容
运行结果

图片
成功读取到百度首页的数据。

当然，也可以通过URL访问本地文件资源，在创建URL的时候只需要指定协议类型为file://和文件的路径就行了
```java
URL url = new URL("file://" + "文件的路径");
```

这种方式这里我就不演示了。

其实这种方式实际上最终也是通过FileInputStream来读取文件数据的，不信你可以自己debug试试。

#### 2、原理
每种协议的URL资源都需要一个对应的一个URLStreamHandler来处理。

图片
URLStreamHandler
比如说，`http://`协议有对应的URLStreamHandler的实现，`file://`协议的有对应的URLStreamHandler的实现。

Java除了支持`http://`和`file://`协议之外，还支持其它的协议，如下图所示：

- file
- ftp
- http
- https
- jar
- mailto
- netdoc

图片
对于的URLStreamHandler如下图所示

图片
当在构建URL的时候，会去解析资源的访问协议，根据访问协议找到对应的URLStreamHandler的实现。

当然，除了Java本身支持的协议之外，我们还可以自己去扩展这个协议，大致只需要两步即可：

- 实现URLConnection，可以通过这个连接读取资源的内容
- 实现URLStreamHandler，通过URLStreamHandler可以获取到URLConnection

不过需要注意的是，URLStreamHandler的实现需要放在`sun.net.www.protocol.协议名称`包下，类名必须是`Handler`，这也是为什么截图中的实现类名都叫`Handler`的原因。

当然如果不放在指定的包下也可以，但是需要实现`java.net.URLStreamHandlerFactory`接口。

对于扩展我就不演示了，如果你感兴趣可以自行谷歌一下。

### Spring资源管理
虽然Java提供了标准的资源管理方式，但是Spring并没有用，而是自己搞了一套资源管理方式。

#### 1、资源抽象
在Spring中，资源大致被抽象为两个接口

- Resource：可读资源，可以获取到资源的输入流
- WritableResource：读写资源，除了资源输入流之外，还可以获取到资源的输出流

##### Resource
图片
Resource接口继承了InputStreamSource接口，而InputStreamSource接口可以获取定义了获取输入流的方法

图片

##### WritableResource
图片
WritableResource继承了Resource接口，可以获取到资源的输出流，因为有的资源不仅可读，还可写，就比如一些本地文件的资源，往往都是可读可写的

Resource的实现很多，这里我举几个常见的：

- FileSystemResource：读取文件系统的资源
- UrlResource：前面提到的Java的标准资源管理的封装，底层就是通过URL来访问资源
- ClassPathResource：读取classpath路径下的资源
- ByteArrayResource：读取静态字节数组的数据

比如，想要通过Spring的资源管理方式来访问前面提到百度首页网络资源，就可以这么写
```java
//构建资源
Resource resource = new UrlResource("http://www.baidu.com");
//获取资源输入流
InputStream inputStream = resource.getInputStream();
```
如果是一个本地文件资源，那么除了可以使用UrlResource，也可以使用FileSystemResource，都是可以的。

#### 2、资源加载
虽然Resource有很多实现，但是在实际使用中，可能无法判断使用具体的哪个实现，所以Spring提供了ResourceLoader资源加载器来根据资源的类型来加载资源。

图片
ResourceLoader
通过getResource方法，传入一个路径就可以加载到对应的资源，而这个路径不一定是本地文件，可以是任何可加载的路径。

ResourceLoader有个唯一的实现DefaultResourceLoader

图片
比如对于上面的例子，就可以通过ResourceLoader来加载资源，而不用直接new具体的实现了
```java
//创建ResourceLoader
ResourceLoader resourceLoader = new DefaultResourceLoader();
//获取资源
Resource resource = resourceLoader.getResource("http://www.baidu.com");
```

除了ResourceLoader之外，还有一个ResourcePatternResolver可以加载资源

图片
ResourcePatternResolver继承了ResourceLoader

通过ResourcePatternResolver提供的方法可以看出，他可以加载多个资源，支持使用通配符的方式，比如classpath*:，就可以加载所有classpath的资源。

ResourcePatternResolver只有一个实现PathMatchingResourcePatternResolver

图片
PathMatchingResourcePatternResolver

#### 3、小结
到这就讲完了Spring的资源管理，这里总结一下本节大致的内容

Java的标准资源管理：

- URL
- URLStreamHandler

Spring的资源管理：

- 资源抽象：Resource 、WritableResource
- 资源加载：ResourceLoader 、ResourcePatternResolver

Spring的资源管理在Spring中用的很多，比如在SpringBoot中，application.yml的文件就是通过ResourceLoader加载成Resource，之后再读取文件的内容的。

图片
## 环境
上一节末尾举的例子中提到，SpringBoot配置文件是通过ResourceLoader来加载配置文件，读取文件的配置内容

那么当配置文件都加载完成之后，这个配置应该存到哪里，怎么能够读到呢？

这就引出了Spring框架中的一个关键概念，环境，它其实就是用于管理应用程序配置的。

### 1、Environment
Environment就是环境抽象出来的接口

图片
Environment继承PropertyResolver
```java
public interface PropertyResolver {

    boolean containsProperty(String key);

    String getProperty(String key);

    <T> T getProperty(String key, Class<T> targetType);

    <T> T getRequiredProperty(String key, Class<T> targetType) throws IllegalStateException;

    String resolvePlaceholders(String text);

}
```
如上是PropertyResolver提供的部分方法，这里简单说一下上面方法的作用

- `getProperty(String key)`，很明显是通过配置的key获取对应的value值
- `getProperty(String key, Class<T> targetType)`，这是获取配置，并转换成对应的类型，比如你获取的是个字符串的"true"，这里就可以给你转换成布尔值的true，具体的底层实现留到下一节讲
- `resolvePlaceholders(String text)`，这类方法可以处理${...}占位符，也就是先取出${...}占位符中的key，然后再通过key获取到值

所以Environment主要有一下几种功能：

- 根据key获取配置
- 获取到指定类型的配置
- 处理占位符
来个demo

先在application.yml的配置文件中加入配置

图片
测试代码如下
```java
@SpringBootApplication
public class EnvironmentDemo {

    public static void main(String[] args) {
        ConfigurableApplicationContext applicationContext = SpringApplication.run(EnvironmentDemo.class, args);

        //从ApplicationContext中获取到ConfigurableEnvironment
        ConfigurableEnvironment environment = applicationContext.getEnvironment();

        //获取name属性对应的值
        String name = environment.getProperty("name");
        System.out.println("name = " + name);
    }

}
```
启动应用，获取到ConfigurableEnvironment对象，再获取到值

ConfigurableEnvironment是Environment子接口，通过命名也可以知道，他可以对Environment进行一些功能的配置。

运行结果：
```shell
name = 三友的java日记
```

#### 2、配置属性源PropertySource
PropertySource是真正存配置的地方，属于配置的来源，它提供了一个统一的访问接口，使得应用程序可以以统一的方式获取配置获取到属性。

图片
PropertySource
来个简单demo
```java
public class PropertySourceDemo {

    public static void main(String[] args) {

        Map<String, Object> source = new HashMap<>();
        source.put("name", "三友的java日记");

        PropertySource<Map<String, Object>> propertySource = new MapPropertySource("myPropertySource", source);

        Object name = propertySource.getProperty("name");

        System.out.println("name = " + name);
    }

}
```

简单说一下上面代码的意思

- 首先创建了一个map，就是配置来源，往里面添加了一个配置key-value
- 创建了一个PropertySource，使用的实现是MapPropertySource，需要传入配置map，所以最终获取到属性不用想就知道是从map中获取的
- 最后成获取到属性

图片
除了MapPropertySource之外，还有非常多的实现

图片
PropertySource实现
比如CommandLinePropertySource，它其实就封装了通过命令启动时的传递的配置参数

既然PropertySource才是真正存储配置的地方，那么Environment获取到的配置真正也就是从PropertySource获取的，并且他们其实是一对多的关系

图片
其实很好理解一对多的关系，因为一个应用程序的配置可能来源很多地方，比如在SpringBoot环境底下，除了我们自定义的配置外，还有比如系统环境配置等等，这些都可以通过Environment获取到

当从Environment中获取配置的时候，会去遍历所有的PropertySource，一旦找到配置key对应的值，就会返回

所以，如果有多个PropertySource都含有同一个配置项的话，也就是配置key相同，那么获取到的配置是从排在前面的PropertySource的获取的

这就是为什么，当你在配置文件配置username属性时获取到的却是系统变量username对应的值，因为系统的PropertySource排在配置文件对应的PropertySource之前

#### 3、SpringBoot是如何解析配置文件
SpringBoot是通过PropertySourceLoader来解析配置文件的

图片
load方法的第二个参数就是我们前面提到的资源接口Resource

通过Resource就可以获取到配置文件的输入流，之后就可以读取到配置文件的内容，再把配置文件解析成多个PropertySource，之后把PropertySource放入到Environment中，这样我们就可以通过Environment获取到配置文件的内容了。

PropertySourceLoader默认有两个实现，分别用来解析properties和yml格式的配置文件

图片
此时，上面的图就可以优化成这样

图片

## 类型转换
在上一节介绍Environment时提到了它的`getProperty(String key, Class<T> targetType)`可以将配置的字符串转换成对应的类型，那么他是如何转换的呢？

这就跟本文要讲的Spring类型转换机制有关了

### 1、类型转换API
Spring类型转换主要涉及到以下几个api：

- PropertyEditor
- Converter
- GenericConverter
- ConversionService
- TypeConverter

接下来我会来详细介绍这几个api的原理和他们之间的关系。

#### 1.1、PropertyEditor
PropertyEditor并不是Spring提供的api，而是JDK提供的api，他的主要作用其实就是将String类型的字符串转换成Java对象属性值。
```java
public interface PropertyEditor {

    void setValue(Object value);

    Object getValue();

    String getAsText();

    void setAsText(String text) throws java.lang.IllegalArgumentException;
    
}
```
就拿项目中常用的@Value来举例子，当我们通过@Value注解的方式将配置注入到字段时，大致步骤如下图所示：

图片
- 取出@Value配置的key
- 根据@Value配置的key调用Environment的resolvePlaceholders(String text)方法，解析占位符，找到配置文件中对应的值
- 调用PropertyEditor将对应的值转换成注入的属性字段类型，比如注入的字段类型是数字，那么就会将字符串转换成数字

在转换的过程中，Spring会先调用PropertyEditor的setAsText方法将字符串传入，然后再调用getValue方法获取转换后的值。

Spring提供了很多PropertyEditor的实现，可以实现字符串到多种类型的转换

图片
在这么多实现中，有一个跟我们前面提到的Resource有关的实现ResourceEditor，它是将字符串转换成Resource对象

图片
ResourceEditor
也就是说，可以直接通过@Value的方式直接注入一个Resource对象，就像下面这样
```java
@Value("http://www.baidu.com")
private Resource resource;
```
其实归根到底，底层也是通过ResourceLoader来加载的，这个结论是不变的。

所以，如果你想知道@Value到底支持注入哪些字段类型的时候，看看PropertyEditor的实现就可以了，当然如果Spring自带的都不满足你的要求，你可以自己实现PropertyEditor，比如把String转成Date类型，Spring就不支持。

#### 1.2、Converter
由于PropertyEditor局限于字符串的转换，所以Spring在后续的版本中提供了叫Converter的接口，他也用于类型转换的，相比于PropertyEditor更加灵活、通用

图片
Converter
Converter是个接口，泛型S是被转换的对象类型，泛型T是需要被转成的类型。

同样地，Spring也提供了很多Converter的实现

图片
这些主要包括日期类型的转换和String类型转换成其它的类型

#### 1.3、GenericConverter
GenericConverter也是类型转换的接口

图片
这个接口的主要作用是可以处理带有泛型类型的转换，主要的就是面向集合数组转换操作，从Spring默认提供的实现就可以看出

图片
那Converter跟GenericConverter有什么关系呢？

这里我举个例子，假设现在需要将将源集合`Collection<String>`转换成目标集合`Collection<Date>`

图片
假设现在有个String转换成Date类型的Converter，咱就叫StringToDateConverter，那么整个转换过程如下：

- 首先会找到`GenericConverter`的一个实现`CollectionToCollectionConverter`，从名字也可以看出来，是将一个几个转换成另一个集合
- 然后遍历源集合`Collection<String>`，取出元素
- 根据目标集合泛型Date，找到StringToDateConverter，将String转换成Date，将转换的Date存到一个新的集合
- 返回这个新的集合，这样就实现了集合到集合的转换

所以通过这就可以看出Converter和GenericConverter其实是依赖关系

#### 1.4、ConversionService
对于我们使用者来说，不论是Converter还是GenericConverter，其实都是类型转换的，并且类型转换的实现也很多，所以Spring为了方便我们使用Converter还是GenericConverter，提供了一个门面接口ConversionService

图片
ConversionService
我们可以直接通过ConversionService来进行类型转换，而不需要面向具体的Converter或者是GenericConverter

ConversionService有一个基本的实现GenericConversionService

图片
GenericConversionService
同时GenericConversionService还实现了ConverterRegistry的接口

图片
ConverterRegistry提供了对Converter和GenericConverter进行增删改查的方法。

图片
ConverterRegistry
这样就可以往ConversionService中添加Converter或者是GenericConverter了，因为最终还是通过Converter和GenericConverter来实现转换的

但是我们一般不直接用GenericConversionService，而是用DefaultConversionService或者是ApplicationConversionService（SpringBoot环境底下使用）

因为DefaultConversionService和ApplicationConversionService在创建的时候，会添加很多Spring自带的Converter和GenericConverter，就不需要我们手动添加了。

#### 1.5、TypeConverter
TypeConverter其实也是算是一个门面接口，他也定义了转换方法

图片
他是将PropertyEditor和ConversionService进行整合，方便我们同时使用PropertyEditor和ConversionService

convertIfNecessary方法会去调用PropertyEditor和ConversionService进行类型转换，值得注意的是，优先使用PropertyEditor进行转换，如果没有找到对应的PropertyEditor，会使用ConversionService进行转换

TypeConverter有个简单的实现SimpleTypeConverter，这里来个简单的demo
```java
public class TypeConverterDemo {

    public static void main(String[] args) {
        SimpleTypeConverter typeConverter = new SimpleTypeConverter();
        
        //设置ConversionService
        typeConverter.setConversionService(DefaultConversionService.getSharedInstance());

        //将字符串"true"转换成Boolean类型的true
        Boolean b = typeConverter.convertIfNecessary("true", Boolean.class);
        System.out.println("b = " + b);
    }

}
```
这里需要注意，ConversionService需要我们手动设置，但是PropertyEditor不需要，因为SimpleTypeConverter默认会去添加PropertyEditor的实现。

#### 小结
到这就讲完了类型转换的常见的几个api，这里再简单总结一下：

- PropertyEditor：String转换成目标类型
- Converter：用于一个类型转换成另一个类型
- GenericConverter：用于处理泛型的转换，主要用于集合
- ConversionService：门面接口，内部会调用Converter和GenericConverter
- TypeConverter：门面接口，内部会调用PropertyEditor和ConversionService

画张图来总结他们之间的关系

图片
前面在举@Value的例子时说，类型转换是根据PropertyEditor来的，其实只说了一半，因为底层实际上是根据TypeConverter来转换的，所以@Value类型转换时也能使用ConversionService类转换，所以那张图实际上应该这么画才算对

图片

### 2、Environment中到底是如何进行类型转换的？
这里我们回到开头提到的话题，Environment中到底是如何进行类型转换的，让我们看看Environment类的接口体系

Environment有个子接口ConfigurableEnvironment中，前面也提到过

它继承了ConfigurablePropertyResolver接口

图片
而ConfigurablePropertyResolver有一个setConversionService方法

图片
所以从这可以看出，Environment底层实际上是通过ConversionService实现类型转换的

这其实也就造成了一个问题，因为ConversionService和PropertyEditor属于并列关系，那么就会导致Environment无法使用PropertyEditor来进行类型转换，也就会丧失部分Spring提供的类型转换功能，就比如无法通过Environment将String转换成Resource对象，因为Spring没有实现String转换成Resource的Converter

当然你可以自己实现一个String转换成Resource的Converter，然后添加到ConversionService，之后Environment就支持String转换成Resource了。

## 数据绑定
上一节我们讲了类型转换，而既然提到了类型转换，那么就不得不提到数据绑定了，他们是密不可分的，因为在数据绑定时，往往都会伴随着类型转换，

数据绑定的意思就是将一些配置属性跟我们的Bean对象的属性进行绑定。

不知你是否记得，在远古的ssm时代，我们一般通过xml方式声明Bean的时候，可以通过<property/>来设置Bean的属性
```xml
<bean class="com.sanyou.spring.core.basic.User">
    <property name="username" value="三友的java日记"/>
</bean>
```

```java
@Data
public class User {

    private String username;

}
```

然后Spring在创建User的过程中，就会给username属性设置为三友的java日记。

这就是数据绑定，将三友的java日记绑定到username这个属性上。

数据绑定的核心api主要包括以下几个：

- PropertyValues
- BeanWrapper
- DataBinder

### 1、PropertyValues
这里我们先来讲一下PropertyValue（注意没有s）

图片
顾明思议，PropertyValue就是就是封装了属性名和对应的属性值，它就是数据绑定时属性值的来源。

以前面的提到的xml创建Bean为例，Spring在启动的时候会去解析xml中的<property/>标签，然后将name和value封装成PropertyValue

当创建User这个Bean的时候，到了属性绑定的阶段的时候，就会取出PropertyValue，设置到User的username属性上。

而PropertyValues，比PropertyValue多了一个s，也就是复数的意思，所以其实PropertyValues本质上就是PropertyValue的一个集合

图片
因为一个Bean可能有多个属性配置，所以就用PropertyValues来保存。

### 2、BeanWrapper
BeanWrapper其实就数据绑定的核心api了，因为在Spring中涉及到数据绑定都是通过BeanWrapper来完成的，比如前面提到的Bean的属性的绑定，就是通过BeanWrapper来的

BeanWrapper是一个接口，他有一个唯一的实现BeanWrapperImpl。

图片
先来个demo
```java
public class BeanWrapperDemo {

    public static void main(String[] args) {
        //创建user对象
        User user = new User();

        //创建BeanWrapper对象，把需要进行属性绑定的user对象放进去
        BeanWrapper beanWrapper = new BeanWrapperImpl(user);

        //进行数据绑定，将三友的java日记这个属性值赋值到username这个属性上
        beanWrapper.setPropertyValue(new PropertyValue("username", "三友的java日记"));

        System.out.println("username = " + user.getUsername());
    }

}
```

结果

图片
成功获取到，说明设置成功

BeanWrapperImpl也间接实现了TypeConverter接口

图片
当然底层还是通过前面提到的ConversionService和PropertyEditor实现的

所以当配置的类型跟属性的类型不同时，就可以对配置的类型进行转换，然后再绑定到属性上

这里简单说一下数据绑定和@Value的异同，因为这两者看起来好像是一样的，但实际还是有点区别的

相同点：
- 两者都会涉及到类型转换，@Value和数据绑定都会将值转换成目标属性对应的类型，并且都是通过TypeConverter来转换的

不同点：
1. 发生时机不同，@Value比数据绑定更早，当@Value都注入完成之后才会发生数据绑定(属性赋值)
2. 属性赋值方式不同，@Value是通过反射来的，而是数据绑定是通过setter方法来的，如果没有setter方法，属性是没办法绑定的

### 3、DataBinder
DataBinder也是用来进行数据绑定的，它的底层也是间接通过BeanWrapper来实现的数据绑定的

图片
但是他相比于BeanWrapper多了一些功能，比如在数据绑定之后，可以对数据校验，比如可以校验字段的长度等等

说到数据校验，是不是想到了SpringMVC中的参数校验，通过@Valid配合一些诸如@NotBlank、@NotNull等注解，实现优雅的参数校验。

其实SpringMVC的参数校验就是通过DataBinder来的，所以DataBinder其实在SpringMVC中用的比较多，但是在Spring中确用的很少。

如果你有兴趣，可以翻一下SpringMVC中关于请求参数处理的HandlerMethodArgumentResolver的实现，里面有的实现会用到DataBinder（WebDataBinder）来进行数据请求参数跟实体类的数据绑定、类型转换、数据校验等等。

> 不知道你有没有注意过，平时写接口的时候，前端传来的参数String类型的时间字符串无法通过Spring框架本身转换成Date类型，有部分原因就是前面提到的Spring没有相关的Converter实现

总的来说，数据绑定在xml配置和SpringMVC中用的比较多的，并且数据绑定也是Spring Bean生命周期中一个很重要的环节。

## 泛型处理
Spring为了方便操作和处理泛型类型，提供了一个强大的工具类——ResolvableType。

泛型处理其实是一块相对独立的东西，因为它就只是一个工具类，只还不过这个工具类在Spring中却是无处不在！

ResolvableType提供了有一套灵活的API，可以在运行时获取和处理泛型类型等信息。

图片
ResolvableType
接下来就通过一个案例，来看一看如何通过ResolvableType快速简单的获取到泛型的

首先我声明了一个MyMap类，继承HashMap，第一个泛型参数是Integer类型，第二个泛型参数是List类型，List的泛型参数又是String

```java
public class MyMap extends HashMap<Integer, List<String>> {

}
```
接下来就来演示一下如何获取到HashMap的泛型参数以及List的泛型参数

第一步，先来通过ResolvableType#forClass方法创建一个MyMap类型对应的ResolvableType
```java
//创建MyMap对应的ResolvableType
ResolvableType myMapType = ResolvableType.forClass(MyMap.class);
```

因为泛型参数是在父类HashMap中，所以我们得获取到父类HashMap对应的ResolvableType，通过ResolvableType#getSuperType()方法获取
```java
//获取父类HashMap对应的ResolvableType
ResolvableType hashMapType = myMapType.getSuperType();
```

接下来需要获取HashMap的泛型参数对应的ResolvableType类型，可以通过ResolvableType#getGeneric(int... indexes)就可以获取指定位置的泛型参数ResolvableType，方法参数就是指第几个位置的泛型参数，从0开始

比如获取第一个位置的对应的ResolvableType类型
```java
//获取第一个泛型参数对应的ResolvableType
ResolvableType firstGenericType = hashMapType.getGeneric(0);
```

现在有了第一个泛型参数的ResolvableType类型，只需要通过ResolvableType#resolve()方法就可以获取到ResolvableType类型对应的class类型，这样就可以获取到一个泛型参数的class类型
```java
//获取第一个泛型参数对应的ResolvableType对应的class类型，也就是Integer的class类型
Class<?> firstGenericClass = firstGenericType.resolve();
```

如果你想获取到HashMap第二个泛型参数的泛型类型，也就是List泛型类型就可以这么写
```java
//HashMap第二个泛型参数的对应的ResolvableType，也就是List<String>
ResolvableType secondGenericType = hashMapType.getGeneric(1);
//HashMap第二个泛型参数List<String>的第一个泛型类型String对应的ResolvableType
ResolvableType secondFirstGenericType = secondGenericType.getGeneric(0);
//这样就获取到了List<String>的泛型类型String
Class<?> secondFirstGenericClass = secondFirstGenericType.resolve();
```

从上面的演示下来可以发现，其实每变化一步，其实就是获取对应泛型或者是父类等等对应的ResolvableType，父类或者是泛型参数又可能有泛型之类的，只需要一步一步获取就可以了，当需要获取到具体的class类型的时候，通过ResolvableType#resolve()方法就行了。

除了上面提到的通过ResolvableType#forClass方法创建ResolvableType之外，还可以通过一下几个方法创建：

- forField(Field field)：获取字段类型对应的ResolvableType
- forMethodReturnType(Method method)：获取方法返回值类型对应的ResolvableType
- forMethodParameter(Method method, int parameterIndex)：获取方法某个位置方法参数对应的ResolvableType
- forConstructorParameter(Constructor<?> constructor, int parameterIndex)：获取构造方法某个构造参数对应的ResolvableType
通过上面解释可以看出，对于一个类方法参数，方法返回值，字段等等都可以获取到对应的ResolvableType

## 国际化
国际化（Internationalization，简称i18n）也是Spring提供的一个核心功能，它其实也是一块相对独立的功能。

所谓的国际化，其实理解简单点就是对于不同的地区国家，输出的文本内容语言不同。

Spring的国际化其实主要是依赖Java中的国际化和文本处理方式。

### 1、Java中的国际化
#### Locale
Locale是Java提供的一个类，它可以用来标识不同的语言和地区，如en_US表示美国英语，zh_CN表示中国大陆中文等。

图片
目前Java已经穷举了很多国家的地区Locale。

我们可以使用Locale类获取系统默认的Locale，也可以手动设置Locale，以适应不同的语言环境。

#### ResourceBundle
ResourceBundle是一个加载本地资源的一个类，他可以根据传入的Locale不同，加载不同的资源。

来个demo

首先准备资源文件，资源文件通常是.properties文件，文件名命名规则如下：
`basename_lang_country.properties`

basename无所谓，叫什么都可以，而lang和country是从Locale中获取的。

举个例子，我们看看英语地区的Locale

图片
从上图可以看出，英语Locale的lang为en，country为空字符串，那么此时英语地区对应资源文件就可以命名为：
basename_en.properties，由于country为空字符串，可以省略

中国大陆Locale如下图

图片
此时文件就可以命为：basename_zh_CN.properties

好了，现在既然知道了命名规则，我们就创建两个文件，basename就叫message，一个英语，一个中文，放在classpath路径下

中文资源文件：message_zh_CN.properties，内容为：
```properties
name=三友的java日记
```

英文资源文件：message_en.properties，内容为：
```properties
name=sanyou's java diary
```

有了文件之后，就可以通过ResourceBundle#getBundle(String baseName,Locale locale)方法来获取获取ResourceBundle

- 第一个参数baseName就是我们的文件名中的basename，对于我们的demo来说，就是message
- 第二个参数就是地区，根据地区的不同加载不同地区的文件

测试一下
```java
public class ResourceBundleDemo {

    public static void main(String[] args) {

        //获取ResourceBundle，第一个参数baseName就是我们的文件名称，第二个参数就是地区
        ResourceBundle chineseResourceBundle = ResourceBundle.getBundle("message", Locale.SIMPLIFIED_CHINESE);
        //根据name键取值
        String chineseName = chineseResourceBundle.getString("name");
        System.out.println("chineseName = " + chineseName);

        ResourceBundle englishResourceBundle = ResourceBundle.getBundle("message", Locale.ENGLISH);
        String englishName = englishResourceBundle.getString("name");
        System.out.println("englishName = " + englishName);

    }

}
```

运行结果

图片
其实运行结果可以看出，其实是成功获取了，只不过中文乱码了，这主要是因为ResourceBundle底层其实编码是ISO-8859-1，所以会导致乱码。

解决办法最简单就是把中文用Java Unicode序列来表示，之后就可以读出中文了了，比如三友的java日记用Java Unicode序列表示为`\u4e09\u53cb\u7684java\u65e5\u8bb0`

除了这种方式之外，其实还可以继承ResourceBundle内部一个Control类

图片
Control
重写newBundle方法

图片
newBundle
newBundle是创建ResourceBundle对应核心方法，重写的时候你就可以随心所欲让它支持其它编码方式。

有了新的Control之后，获取ResourceBundle时只需要通过ResourceBundle#getBundle(String baseName, Locale targetLocale,Control control)方法指定Control就可以了。

Spring实际上就是通过这种方式扩展，支持不同编码的，后面也有提到。

### MessageFormat
MessageFormat顾明思议就是把消息格式化。它可以接收一条包含占位符的消息模板，并根据`提供的参数`替换`占位符`，生成最终的消息。

MessageFormat对于将动态值插入到消息中非常有用，如欢迎消息、错误消息等。

先来个Demo
```java
public class MessageFormatDemo {

    public static void main(String[] args) {
        String message = MessageFormat.format("你好：{0}", "张三");
        System.out.println("message = " + message);
    }

}
```

解释一下上面这段代码：

- 你好：{0}其实就是前面提到的消息的模板，{0}就是占位符，中间的0代表消息格式化的时候将提供的参数第一个参数替换占位符的值
- 张三就是提供的参数，你可以写很多个，但是我们的demo只会取第一个参数，因为是{0}

所以输出结果为：
```java
message = 你好：张三
```

成功格式化消息。

### 2、Spring国际化
Spring提供了一个国际化接口MessageSource

图片
MessageSource
他有一个基于ResourceBundle + MessageFormat的实现ResourceBundleMessageSource

图片
ResourceBundleMessageSource
他的本质可以在资源文件存储消息的模板，然后通过MessageFormat来替换占位符，MessageSource的getMessage方法就可以传递具体的参数

来个demo

现在模拟登录欢迎语句，对于不同的人肯定要有不同的名字，所以资源文件需要存模板，需要在不同的资源文件加不同的模板

中文资源文件：message_zh_CN.properties
```properties
welcome=您好:{0}
```

英文资源文件：message_en.properties
```properties
welcome=hello:{0}
```

占位符，就是不同人不同名字

测试代码
```java
public class MessageSourceDemo {

    public static void main(String[] args) {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();

        //Spring已经扩展了ResourceBundle的Control，支持资源文件的不同编码方式，但是需要设置一下
        messageSource.setDefaultEncoding("UTF-8");

        //添加 baseName，就是前面提到的文件中的basename
        messageSource.addBasenames("message");

        //中文，传个中文名字
        String chineseWelcome = messageSource.getMessage("welcome", new Object[]{"张三"}, Locale.SIMPLIFIED_CHINESE);
        System.out.println("chineseWelcome = " + chineseWelcome);

        //英文，英语国家肯定是英文名
        String englishWelcome = messageSource.getMessage("welcome", new Object[]{"Bob"}, Locale.ENGLISH);
        System.out.println("englishWelcome = " + englishWelcome);
    }

}
```
运行结果
```java
chineseWelcome = 您好:张三
englishWelcome = hello:Bob
```

成功根据完成不同国家资源的加载和模板消息的格式化。

### 小结
这里来简单总结一下这一小节说的内容

- Locale：不同国家和地区的信息封装
- ResourceBundle：根据不同国家的Locale，加载对应的资源文件，这个资源文件的命名需要遵守basename_lang_country.properties命名规范
- MessageFormat：其实就是一个文本处理的方式，他可以解析模板，根据参数替换模板的占位符
- MessageSource：Spring提供的国际化接口，其实他底层主要是依赖Java的ResourceBundle和MessageFormat，资源文件存储模板信息，MessageFormat根据MessageSource方法的传参替换模板中的占位符

## BeanFactory
我们知道Spring的核心就是IOC和AOP，而BeanFactory就是大名鼎鼎的IOC容器，他可以帮我们生产对象。

### 1、BeanFactory接口体系
BeanFactory本身是一个接口

图片
BeanFactory
从上面的接口定义可以看出从可以从BeanFactory获取到Bean。

他也有很多子接口，不同的子接口有着不同的功能

- ListableBeanFactory
- HierarchicalBeanFactory
- ConfigurableBeanFactory
- AutowireCapableBeanFactory

#### ListableBeanFactory

图片
ListableBeanFactory
从提供的方法可以看出，提供了一些获取集合的功能，比如有的接口可能有多个实现，通过这些方法就可以获取这些实现对象的集合。

#### HierarchicalBeanFactory

图片
HierarchicalBeanFactory
从接口定义可以看出，可以获取到父容器，说明BeanFactory有子父容器的概念。

#### ConfigurableBeanFactory

图片
ConfigurableBeanFactory
从命名可以看出，可配置BeanFactory，所以可以对BeanFactory进行配置，比如截图中的方法，可以设置我们前面提到的类型转换的东西，这样在生成Bean的时候就可以类型属性的类型转换了。

#### AutowireCapableBeanFactory

图片
提供了自动装配Bean的实现、属性填充、初始化、处理获取依赖注入对象的功能。

比如@Autowired最终就会调用AutowireCapableBeanFactory#resolveDependency处理注入的依赖。

其实从这里也可以看出，Spring在BeanFactory的接口设计上面还是基于不同的职责进行接口的划分，其实不仅仅是在BeanFactory，前面提到的那些接口也基本符合这个原则。

### 2、BeanDefinition及其相关组件
#### BeanDefinition
BeanDefinition是Spring Bean创建环节中很重要的一个东西，它封装了Bean创建过程中所需要的元信息。
```java
public interface BeanDefinition extends AttributeAccessor, BeanMetadataElement {
    //设置Bean className
    void setBeanClassName(@Nullable String beanClassName);

    //获取Bean className
    @Nullable
    String getBeanClassName();
    
    //设置是否是懒加载
    void setLazyInit(boolean lazyInit);

    //判断是否是懒加载
    boolean isLazyInit();
    
    //判断是否是单例
    boolean isSingleton();

}
```
如上代码是BeanDefinition接口的部分方法，从这方法的定义名称可以看出，一个Bean所创建过程中所需要的一些信息都可以从BeanDefinition中获取，比如这个Bean的class类型，这个Bean是否是懒加载，这个Bean是否是单例的等等，因为有了这些信息，Spring才知道要创建一个什么样的Bean。

读取BeanDefinition
读取BeanDefinition大致分为以下几类

- BeanDefinitionReader
- ClassPathBeanDefinitionScanner

#### BeanDefinitionReader

图片
BeanDefinitionReader
BeanDefinitionReader可以通过loadBeanDefinitions(Resource resource)方法来加载BeanDefinition，方法参数就是我们前面说的资源，比如可以将Bean定义在xml文件中，这个xml文件就是一个资源

BeanDefinitionReader的相关实现：

- XmlBeanDefinitionReader：读取xml配置的Bean
- PropertiesBeanDefinitionReader：读取properties文件配置的Bean，是的，你没看错，Bean可以定义在properties文件配置中
- AnnotatedBeanDefinitionReader：读取通过注解定义的Bean，比如@Lazy注解等等，AnnotatedBeanDefinitionReader不是BeanDefinitionReader的实现，但是作用是一样的

#### ClassPathBeanDefinitionScanner

图片
这个作用就是扫描指定包下通过@Component及其派生注解（@Service等等）注解定义的Bean，其实就是@ComponentScan注解的底层实现

ClassPathBeanDefinitionScanner这个类其实在很多其它框架中都有使用到，因为这个类可以扫描指定包下，生成BeanDefinition，对于那些需要扫描包来生成BeanDefinition来说，用的很多

比如说常见的MyBatis框架，他的注解@MapperScan可以扫描指定包下的Mapper接口，其实他也是通过继承ClassPathBeanDefinitionScanner来扫描Mapper接口的

图片

#### BeanDefinitionRegistry

这个从命名就可以看出，是BeanDefinition的注册中心，也就是用来保存BeanDefinition的。

图片
提供了BeanDefinition的增删查的功能。

讲到这里，就可以用一张图来把前面提到东西关联起来

图片
- 通过BeanDefinitionReader或者是ClassPathBeanDefinitionScanner为每一个Bean生成一个BeanDefinition
- BeanDefinition生成之后，添加到BeanDefinitionRegistry中
- 当从BeanFactory中获取Bean时，会从BeanDefinitionRegistry中拿出需要创建的Bean对应的BeanDefinition，根据BeanDefinition的信息来生成Bean
- 当生成的Bean是单例的时候，Spring会将Bean保存到SingletonBeanRegistry中，也就是平时说的三级缓存中的第一级缓存中，以免重复创建，需要使用的时候直接从SingletonBeanRegistry中查找

### 3、BeanFactory核心实现
前面提到的BeanFactory体系都是一个接口，那么BeanFactory的实现类是哪个类呢？

BeanFactory真正底层的实现类，其实就只有一个，那就是DefaultListableBeanFactory这个类，这个类以及父类真正实现了BeanFactory及其子接口的所有的功能。

图片
并且接口的实现上可以看出，他也实现了BeanDefinitionRegistry，也就是说，在底层的实现上，其实BeanFactory跟BeanDefinitionRegistry的实现是同一个实现类。

上面说了这么多，来个demo
```java
public class BeanFactoryDemo {

    public static void main(String[] args) {
        //创建一个BeanFactory
        DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();

        //创建一个BeanDefinitionReader，构造参数是一个BeanDefinitionRegistry
        //因为DefaultListableBeanFactory实现了BeanDefinitionRegistry，所以直接把beanFactory当做构造参数传过去
        AnnotatedBeanDefinitionReader beanDefinitionReader = new AnnotatedBeanDefinitionReader(beanFactory);

        //读取当前类 BeanFactoryDemo 为一个Bean，让Spring帮我们生成这个Bean
        beanDefinitionReader.register(BeanFactoryDemo.class);

        //从容器中获取注册的BeanFactoryDemo的Bean
        BeanFactoryDemo beanFactoryDemo = beanFactory.getBean(BeanFactoryDemo.class);

        System.out.println("beanFactoryDemo = " + beanFactoryDemo);
    }

}
```

简单说一下上面代码的意思

- 创建一个BeanFactory，就是DefaultListableBeanFactory
- 创建一个AnnotatedBeanDefinitionReader，构造参数是一个BeanDefinitionRegistry，因为BeanDefinitionReader需要- 把读出来的BeanDefinition存到BeanDefinitionRegistry中，同时因为DefaultListableBeanFactory实现了BeanDefinitionRegistry，所以直接把beanFactory当做构造参数传过去
- 读取当前类 BeanFactoryDemo 为一个Bean，让Spring帮我们生成这个Bean
- 后面就是获取打印

运行结果

图片
成功获取到我们注册的Bean

### 总结
本节主要讲了实现IOC的几个核心的组件

BeanFactory及其接口体系：

- ListableBeanFactory
- HierarchicalBeanFactory
- ConfigurableBeanFactory
- AutowireCapableBeanFactory

BeanDefinition及其相关组件：

- BeanDefinition
- BeanDefinitionReader和ClassPathBeanDefinitionScanner：读取资源，生成BeanDefinition
- BeanDefinitionRegistry：存储BeanDefinition

BeanFactory核心实现：

- DefaultListableBeanFactory：IOC容器，同时实现了BeanDefinitionRegistry接口

## ApplicationContext
终于讲到了ApplicationContext，因为前面说的那么多其实就是为ApplicationContext做铺垫的

先来看看ApplicationContext的接口

图片
你会惊讶地发现，ApplicationContext继承的几个接口，除了EnvironmentCapable和ApplicationEventPublisher之外，其余都是前面说的。

EnvironmentCapable这个接口比较简单，提供了获取Environment的功能

图片
EnvironmentCapable
说明了可以从ApplicationContext中获取到Environment，所以EnvironmentCapable也算是前面说过了

至于ApplicationEventPublisher我们留到下一节说。

ApplicationContext也继承了ListableBeanFactory和HierarchicalBeanFactory，也就说明ApplicationContext其实他也是一个BeanFactory，所以说ApplicationContext是IOC容器的说法也没什么毛病，但是由于他还继承了其它接口，功能比BeanFactory多多了。

> 所以，ApplicationContext是一个集万千功能为一身的接口，一旦你获取到了ApplicationContext（可以@Autowired注入），你就可以用来获取Bean、加载资源、获取环境，还可以国际化一下，属实是个王炸。

虽然ApplicationContext继承了这些接口，但是ApplicationContext对于接口的实现是通过一种委派的方式，而真正的实现都是我们前面说的那些实现

什么叫委派呢，咱写一个例子你就知道了
```java
public class MyApplicationContext implements ApplicationContext {

    private final ResourcePatternResolver resourcePatternResolver = new PathMatchingResourcePatternResolver();

    @Override
    public Resource[] getResources(String locationPattern) throws IOException {
        return resourcePatternResolver.getResources(locationPattern);
    }
    
}
```
如上，其实是一段伪代码

因为ApplicationContext继承了ResourcePatternResolver接口，所以我实现了getResources方法，但是真正的实现其实是交给变量中的PathMatchingResourcePatternResolver来实现的，这其实就是委派，不直接实现，而是交给其它真正实现了这个接口的类来处理

同理，ApplicationContext对于BeanFactory接口的实现其实最终也是交由DefaultListableBeanFactory来委派处理的。

> 委派这种方式在Spring内部还是用的非常多的，前面提到的某些接口在的实现上也是通过委派的方式来的

ApplicationContext有一个子接口，ConfigurableApplicationContext

图片
从提供的方法看出，就是可以对ApplicationContext进行配置，比如设置Environment，同时也能设置parent，说明了ApplicationContext也有子父的概念

> 我们已经看到了很多以Configurable开头的接口，这就是命名习惯，表示了可配置的意思，提供的都是set、add之类的方法

ApplicationContext的实现很多，但是他有一个非常重要的抽象实现AbstractApplicationContext，因为其它的实现都是继承这个抽象实现

图片
AbstractApplicationContext
这个类主要是实现了一些继承的接口方法，通过委派的方式，比如对于BeanFactory接口的实现

图片
并且AbstractApplicationContext这个类也实现了一个非常核心的refresh方法

图片
所有的ApplicationContext在创建之后必须调用这个refresh方法之后才能使用，至于这个方法干了哪些事，后面有机会再写一篇文章来着重扒一扒。

## 事件
上一小节在说ApplicationContext继承的接口的时候，我们留下了一个悬念，那就是ApplicationEventPublisher的作用，而ApplicationEventPublisher就跟本节要说的事件有关。

Spring事件是一种观察者模式的实现，他的作用主要是用来解耦合的。

当发生了某件事，只要发布一个事件，对这个事件的监听者（观察者）就可以对事件进行响应或者处理。

举个例子来说，假设发生了火灾，可能需要打119、救人，那么就可以基于事件的模型来实现，只需要打119、救人监听火灾的发生就行了，当发生了火灾，通知这些打119、救人去触发相应的逻辑操作。

图片
### 1、什么是Spring Event 事件
Spring Event 事件就是Spring实现了这种事件模型，你只需要基于Spring提供的API进行扩展，就可以轻易地完成事件的发布与订阅

Spring事件相关api主要有以下几个：

- ApplicationEvent
- ApplicationListener
- ApplicationEventPublisher

#### ApplicationEvent
图片
ApplicationEvent
事件的父类，所有具体的事件都得继承这个类，构造方法的参数是这个事件携带的参数，监听器就可以通过这个参数来进行一些业务操作。

#### ApplicationListener
图片
ApplicationListener
事件监听的接口，泛型是需要监听的事件类型，子类需要实现onApplicationEvent，参数就是监听的事件类型，onApplicationEvent方法的实现就代表了对事件的处理，当事件发生时，Spring会回调onApplicationEvent方法的实现，传入发布的事件。

#### ApplicationEventPublisher
图片
ApplicationEventPublisher
上一小节留下来的接口，事件发布器，通过publishEvent方法就可以发布一个事件，然后就可以触发监听这个事件的监听器的回调。

ApplicationContext继承了ApplicationEventPublisher，说明只要有ApplicationContext就可以来发布事件了。

#### 话不多说，上代码
就以上面的火灾为例

创建一个火灾事件类

火灾事件类继承ApplicationEvent
```java
// 火灾事件
public class FireEvent extends ApplicationEvent {

    public FireEvent(String source) {
        super(source);
    }

}
```
创建火灾事件的监听器

打119的火灾事件的监听器：
```java
public class Call119FireEventListener implements ApplicationListener<FireEvent> {

    @Override
    public void onApplicationEvent(FireEvent event) {
        System.out.println("打119");
    }

}
```
救人的火灾事件的监听器：
```java
public class SavePersonFireEventListener implements ApplicationListener<FireEvent> {

    @Override
    public void onApplicationEvent(FireEvent event) {
        System.out.println("救人");
    }

}
```

事件和对应的监听都有了，接下来进行测试：
```java
public class Application {

    public static void main(String[] args) {
        //创建一个Spring容器
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext();
        //将 事件监听器 注册到容器中
        applicationContext.register(Call119FireEventListener.class);
        applicationContext.register(SavePersonFireEventListener.class);
        applicationContext.refresh();

        // 发布着火的事件，触发监听
        applicationContext.publishEvent(new FireEvent("着火了"));
    }

}
```
将两个事件注册到Spring容器中，然后发布FireEvent事件

运行结果：
```java
打119
救人
```
控制台打印出了结果，触发了监听。

如果现在需要对火灾进行救火，那么只需要去监听FireEvent，实现救火的逻辑，注入到Spring容器中，就可以了，其余的代码根本不用动。

### 2、Spring内置的事件
Spring内置的事件很多，这里我罗列几个

| 事件类型              | 触发时机                                                          |
| --------------------- | ----------------------------------------------------------------- |
| ContextRefreshedEvent | 在调用ConfigurableApplicationContext 接口中的refresh()方法时触发  |
| ContextStartedEvent   | 在调用ConfigurableApplicationContext的start()方法时触发           |
| ContextStoppedEvent   | 在调用ConfigurableApplicationContext的stop()方法时触发            |
| ContextClosedEvent    | 当ApplicationContext被关闭时触发该事件，也就是调用close()方法触发 |

在ApplicationContext(Spring容器)启动的过程中，Spring会发布这些事件，如果你需要这Spring容器启动的某个时刻进行什么操作，只需要监听对应的事件即可。

### 3、Spring事件的传播特性
Spring事件的传播是什么意思呢？

前面提到，ApplicationContext有子父容器的概念，而Spring事件的传播就是指当通过子容器发布一个事件之后，不仅可以触发在这个子容器的事件监听器，还可以触发在父容器的这个事件的监听器。

上代码
```java
public class EventPropagateApplication {

    public static void main(String[] args) {

        // 创建一个父容器
        AnnotationConfigApplicationContext parentApplicationContext = new AnnotationConfigApplicationContext();
        //将 打119监听器 注册到父容器中
        parentApplicationContext.register(Call119FireEventListener.class);
        parentApplicationContext.refresh();

        // 创建一个子容器
        AnnotationConfigApplicationContext childApplicationContext = new AnnotationConfigApplicationContext();
        //将 救人监听器 注册到子容器中
        childApplicationContext.register(SavePersonFireEventListener.class);
        childApplicationContext.refresh();

        // 设置一下父容器
        childApplicationContext.setParent(parentApplicationContext);

        // 通过子容器发布着火的事件，触发监听
        childApplicationContext.publishEvent(new FireEvent("着火了"));

    }

}
```
创建了两个容器，父容器注册了打119的监听器，子容器注册了救人的监听器，然后将子父容器通过setParent关联起来，最后通过子容器，发布了着火的事件。

运行结果：
```java
救人
打119
```
从打印的日志，的确可以看出，虽然是子容器发布了着火的事件，但是父容器的监听器也成功监听了着火事件。

而这种传播特性，从源码中也可以看出来

图片
事件传播源码
如果父容器不为空，就会通过父容器再发布一次事件。

#### 传播特性的一个小坑
前面说过，在Spring容器启动的过程，会发布很多事件，如果你需要有相应的扩展，可以监听这些事件。

但是，不知道你有没有遇到过这么一个坑，就是在SpringCloud环境下，你监听这些`Spring事件的监听器`会执行很多次，这其实就是跟传播特性有关。

在SpringCloud环境下，为了使像FeignClient和RibbonClient这些不同服务的配置相互隔离，会为每个FeignClient或者是RibbonClient创建一个Spring容器，而这些容器都有一个公共的父容器，那就是SpringBoot项目启动时创建的容器

图片
假设你监听了容器刷新的ContextRefreshedEvent事件，那么你自己写的监听器就在SpringBoot项目启动时创建的容器中

每个服务的配置容器他也是Spring容器，启动时也会发布ContextRefreshedEvent，那么由于传播特性的关系，你的事件监听器就会触发执行多次

图片
如何解决这个坑呢？

你可以进行判断这些监听器有没有执行过，比如加一个判断的标志；或者是监听类似的事件，比如ApplicationStartedEvent事件，这种事件是在SpringBoot启动中发布的事件，而子容器不是SpringBoot，所以不会多次发这种事件，也就会只执行一次。

## 总结
到这到这整篇文章终于写完了，这里再来简单地回顾一下本文说的几个核心功能：

- 资源管理：对资源进行统一的封装，方便资源读取和管理
- 环境：对容器或者是项目的配置进行管理
- 类型转换：将一种类型转换成另一种类型
- 数据绑定：将数据跟对象的属性进行绑定，绑定之前涉及到类型转换
- 泛型处理：一个操作泛型的工具类，Spring中到处可见
- 国际化：对Java的国际化进行了统一的封装
- BeanFactory：IOC容器
- ApplicationContext：一个集万千功能于一身的王炸接口，也可以说是IOC容器
- 事件：Spring提供的基于观察者模式实现的解耦合利器

当然除了上面，Spring还有很多其它核心功能，就比如AOP、SpEL表达式等等，由于AOP涉及到Bean生命周期，本篇文章也没有涉及到Bean生命周期的讲解，所以这里就不讲了，后面有机会再讲；至于SpEL他是Spring提供的表达式语言，主要是语法，解析语法的一些东西，这里也不讲了。

最后，我怕你文章看得过于入迷，所以再来重复一遍，如果本篇文章对你有所帮助，还请多多点赞、转发、在看，非常感谢！！

图片
哦，真差点就忘了，本文所有demo代码都在这了
```shell
https://github.com/sanyou3/spring-core-basic.git
```

## 参考资料：
[1].《极客时间--小马哥讲Spring核心编程思想》
[2].https://blog.csdn.net/zzuhkp/article/details/119455964 
[3].https://blog.csdn.net/zzuhkp/article/details/119455948
[4].https://blog.csdn.net/u010086122/article/details/81566515
