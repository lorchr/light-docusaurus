
## 一、背景介绍
我讨厌写一些业务代码, 不仅仅只是因为它们的原始意图并非我设计的, 成功了是产品的功劳, 失败就要代码背锅。 还有一个更重要的原因, 就是重复性的代码太多了, 一个复杂的业务逻辑要找到它的Bug, 也得下一番“苦力”。 这里说的真的是苦力, 而不是脑力, 说明了大部分是低劣的重复劳动, 那有什么好的途径能减少这些重复性劳动呢?

## 二、大名鼎鼎的Lombok了解一下?
Lombok是一款Java代码功能增强库, 在Github上已有9.8k+Star。 它会自动集成到你的编辑器和构建工具中, 从而使你的Java代码更加生动有趣。通过Lombok的注解, 你可以不用再写getter、setter、equals等方法, 只需要加一个@Data注解, Lombok将会在代码编译时为你自动生成, 当然Lombok不仅仅只有一个Data注解, 还有一些其他强大的功能。






- Builder: 基于建造者模式来创建对象，建造者模式加链式调用，能大大简化多属性对象创建方式
- NoArgsConstructor/AllArgsConstructor: 为Class生成无参构造器或者全参数构造器
- Cleanup: 当我们在Java中使用资源时，不可避免地需要在使用后关闭资源。使用@Cleanup注解可以自动生成显式关闭资源的代码块
- val: 能在Java这个强类型语言中也使用弱类型语言的变量定义方式, 其实本质是通过java类型推断来在编译期替换为实际类型
- NonNull: 在方法上使用@NonNull注解可以做非空判断，如果传入空值参数的话会直接抛出NullPointerException。
- ... ...

还有很多很多其他的的功能我就不一一累述了, 其实我在这里拿Lombok来说只是因为它更加的耳熟能详, 市面上还有许许多多的同类框架, 比如对象赋值转换框架Map struct、事件总线EventBus、依赖注入Dagger2以及阿里的ARouter路由框架等等都是依赖于动态生成模板代码的功能特性。

## 三、要不咱也来个'仿制品'?
既然有如此多的利器能解决代码重复冗余的问题, 我们何不效仿着也整一个出来试试? 刚好最近在使用数据持久化框架JPA时, 发现JPA仅默认支持了常用的基础类型对应数据库的Column类型的映射关联, 如Integer、Double、Long、BigDecimal、Float和String等基础类型,
然而处理自定义的对象类型和集合类型时需要扩展AttributeConverter接口来做数据库类型和Java类型的转换映射。 而且每个自定义对象类型都需要我们写一套Converter扩展实现, 为了解决这些重复性的繁琐劳动, 接下来我们要做的就是, 创造一个"自动代码生产器"来帮我们完成这些Converter转换类的编写。






## 四、先准备一下干事的家伙们
### 4.1 JDK 编译时注解处理器 Annotation Processing Tool
编译时注解处理器Annotation Processing Tool 简称APT, 是javac内置的一个用于编译时扫描和处理注解(Annotation)的工具。 简单讲, 在源代码编译阶段, 通过APT我们可以获取源文件内注解(Annotation)相关内容, 然后进行一些额外的扩展。
由于注解处理器可以在程序编译阶段工作, 所以我们可以在编译期间通过注解处理器进行我们需要的操作。 比较常用的用法就是在编译期间获取相关注解数据, 然后动态生成.java源文件, 通常是自动产生一些有规律性的重复代码, 解决了手工编写重复代码的问题, 大大提升编码效率。

### 4.2 JavaPoet 源代码生成器
JavaPoet 是由Square推出的开源Java代码生成框架, 能够提供Java生成源代码文件文件的能力, 通过这种自动化生成代码的方式, 可以让我们用更加简洁优雅的方式要替代繁琐冗杂的重复工作。

JavaPoet框架中核心类说明

Class	功能描述
JavaFile	用于构造输出包含一个顶级类的Java文件, 是对.java文件的抽象定义
TypeSpec	TypeSpec是类/接口/枚举的抽象类型
MethodSpec	MethodSpec是方法/构造函数的抽象定义
FieldSpec	FieldSpec是成员变量/字段的抽象定义
ParameterSpec	ParameterSpec用于创建方法参数
AnnotationSpec	AnnotationSpec用于创建标记注解

## 五、Jpa Conversion Tool 的诞生

### step 1. 首先我们一起来看看AttributeConverter的源码结构

```java
public interface AttributeConverter<X,Y> {

    /**
     * Converts the value stored in the entity attribute into the 
     * data representation to be stored in the database.
     *
     * @param attribute  the entity attribute value to be converted
     * @return  the converted data to be stored in the database 
     *          column
     */
    public Y convertToDatabaseColumn (X attribute);

    /**
     * Converts the data stored in the database column into the 
     * value to be stored in the entity attribute.
     * Note that it is the responsibility of the converter writer to
     * specify the correct <code>dbData</code> type for the corresponding 
     * column for use by the JDBC driver: i.e., persistence providers are 
     * not expected to do such type conversion.
     *
     * @param dbData  the data from the database column to be 
     *                converted
     * @return  the converted value to be stored in the entity 
     *          attribute
     */
    public X convertToEntityAttribute (Y dbData);
}
```

AttributeConverter本身是一个抽象接口, 里面的泛型类型X为实体类的字段类型, 而Y则是数据库的Column类型, 在这个接口里面仅仅定义了两个方式需要子类去继承实现。 JPA在执行数据库持久化时会根据Entity中的变量类型去匹配查找出对应的Converter, 然后执行convertToDatabaseColumn方法把成员变量转换为数据库支持类型再进行存储操作, 而在读取数据库数据时又会调用convertToEntityAttribute来把数据库中保存的数据映射转换为Entity中的变量类型并进行反射赋值处理。 这样就建立起了Entity与Database之间的数据关联。

### step 2. 构造通用的Converter基类来统一处理类型转换功能

```java
public abstract class AbstractJsonConverter<T> implements AttributeConverter<T, String> {

protected static ObjectMapper objectMapper;

@Autowired
public void setObjectMapper(ObjectMapper objectMapper) {
AbstractJsonConverter.objectMapper = objectMapper;
}

@Override
public String convertToDatabaseColumn(T attribute) {
objectMapper.setConfig(objectMapper.getSerializationConfig().without(SerializationFeature.FAIL_ON_EMPTY_BEANS));
ObjectWriter writer = objectMapper.writerFor(getJsonType());
try {
return writer.writeValueAsString(attribute);
} catch (JsonProcessingException e) {
e.printStackTrace();
return null;
}
}

@Override
public T convertToEntityAttribute(String dbData) {
ObjectReader reader = objectMapper.readerFor(getJsonType());
try {
return dbData == null ? null : reader.readValue(dbData);
} catch (IOException e) {
e.printStackTrace();
return null;
}
}

/**
* 获取子类中 Json 转换的 TypeReference
*
* @return TypeReference<T>
  */
  protected TypeReference<T> getJsonType() {
  Type[] actualTypeArguments = ((ParameterizedType) (getClass().getGenericSuperclass())).getActualTypeArguments();
  if (actualTypeArguments != null && actualTypeArguments.length > 0) {
  return new TypeReference<T>() {
  @Override
  public Type getType() {
  return actualTypeArguments[0];
  }

  };
  }

    return null;
}
}
```

我们这里的AbstractJsonConverter继承至AttributeConverter并指定了数据库类型为String, 而实体字段为任意泛型类型。这样我们就能随意指定实体类型了, 更加的灵活使用。 当我们需要使用的时候, 我们仅仅需要指定泛型类型即可。

## step 3. AnnotationProcessor编译时注解处理器扫描
前面的准备代码工作已经完成了, 现在就是我们的主角AnnotationProcessor登场了, 它是用来扫描出所有需要生成Converter的target类, 并使用JavaPoet来动态生成代码片段。这里有两个关键类需要注意, 一个是标记性自定义注解JsonAutoConverter, 只有在类上使用此注解的Class才会被AnnotationProcessor扫描到并进行处理, 还有一个就是我们Processor的实现类JsonConvertProcessor, 这个是用来处理扫描出的目标类, 并为之生成Converter源代码文件

```java
@Documented
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.SOURCE)
public @interface JsonAutoConverter {

/**
* 是否开启自动转换
*
* @return
  */
  boolean autoApply() default true;

}
@AutoService(Processor.class)
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@SupportedAnnotationTypes("com.zhucan.jpa.conversion.annotation.JsonAutoConverter")
public class JsonConvertProcessor extends AbstractProcessor {

    private Filer filer;
    private Messager messager;
    private Elements elementUtils;
    public static final String doc = "\n This codes are generated automatically. Do not modify! \n -.- \n created by zhuCan \n";

    @Override
    public synchronized void init(ProcessingEnvironment processingEnvironment) {
        super.init(processingEnvironment);
        filer = processingEnv.getFiler();
        messager = processingEnvironment.getMessager();
        elementUtils = processingEnvironment.getElementUtils();
    }

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {

        messager.printMessage(Diagnostic.Kind.NOTE, "Processor : " + getClass().getSimpleName());

        Set<? extends Element> elements = roundEnv.getElementsAnnotatedWith(JsonAutoConverter.class);

        elements.forEach(x -> {
            // 被扫描的类的包路径
            PackageElement packageElement = elementUtils.getPackageOf(x);
            String packageName = packageElement.getQualifiedName().toString();

            // 获取类上面的注解
            JsonAutoConverter annotation = x.getAnnotation(JsonAutoConverter.class);

            // 构建类
            TypeSpec clazz = TypeSpec.classBuilder(x.getSimpleName() + "Converter")
                    .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                    .addAnnotation(AnnotationSpec.builder(Converter.class).addMember("autoApply", CodeBlock.builder().add("$L", annotation.autoApply()).build()).build())
                    .addJavadoc(" generator for Json converter " + doc)
                    .superclass(ParameterizedTypeName.get(ClassName.get(AbstractJsonConverter.class),
                            ClassName.get((TypeElement) x)))
                    .build();
            try {
                // 创建java文件
                JavaFile javaFile = JavaFile.builder(packageName, clazz)
                        .build();
                // 写入
                javaFile.writeTo(filer);
            } catch (IOException e) {
                e.printStackTrace();
            }

            // 构建集合转换类
            TypeSpec listClazz = TypeSpec.classBuilder(x.getSimpleName() + "ListConverter")
                    .addModifiers(Modifier.PUBLIC, Modifier.FINAL)
                    .addAnnotation(AnnotationSpec.builder(Converter.class).addMember("autoApply", CodeBlock.builder().add("$L", annotation.autoApply()).build()).build())
                    .addJavadoc(" generator for Json converter " + doc)
                    .superclass(ParameterizedTypeName.get(ClassName.get(AbstractJsonConverter.class),
                            ParameterizedTypeName.get(ClassName.get(List.class), ClassName.get((TypeElement) x))))
                    .build();
            try {
                // 创建java文件
                JavaFile javaFile = JavaFile.builder(packageName, listClazz)
                        .build();
                // 写入
                javaFile.writeTo(filer);
            } catch (IOException e) {
                e.printStackTrace();
            }

        });
        return false;
    }
}
```

下面展示的就是这几个核心处理类的关联关系图




### step 4. 成果检验
在上面所有代码完成了后, 我们就需要来验证下它的效果如何了, 进入项目POM文件所在目录执行Maven代码编译命令 mvn compile -Dmaven.test.skip=true, 然后查看我们编译源文件包, 在/target/generated-sources/annotations/文件夹中能看到一个命名为OrderNoticeEventConverter的文件, 这个就是使用JavaPoet构建而成的Converter源码文件.






我们可以看到这个源文件中, 我们定义了一个Java类, 继承至AbstractJsonConverter基类, 并且指定了需要转换的类型泛型为OrderEvent, Class上面标记的一个Converter注解来开启全局自动类型转换的功能






## 六、后记
其实在各类开发语言平台上面从来都不缺少这些"小技巧", 只是我们平时没有静下心来去发现而已, 只要我们耐心的去往深处挖掘, 发散自己的思维就能找到打开新世界大门的钥匙, 这时我们就能看到不一样的软件世界.

附: 源码地址 https://gitee.com/zhucan123/extension-spring-boot-starter/tree/master/jpa-conversion, 有兴趣的小伙伴们可以参阅下哈