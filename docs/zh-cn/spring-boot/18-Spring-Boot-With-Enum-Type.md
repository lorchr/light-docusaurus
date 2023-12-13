- [看看人家在接口中使用枚举类型的方式，那叫一个优雅！](https://mp.weixin.qq.com/s/7hL52VFpxJaufhA78R4UGQ)

# 一、概览
枚举作为 Java 5 的重要特征，相信大家并不陌生，但在实际开发过程中，当 name 和 ordrial 发生变化时，
如果处理不当非常容易引起系统bug。这种兼容性bug非常难以定位，需要从框架层次进行避免，而非仅靠开发人员的主观意识。

## 1.1 背景
枚举很好用，特别是提供的 name 和 ordrial 特性，但这点对重构造成了一定影响，比如：

1. 某个枚举值业务语义发生变化，需要将其进行 rename 操作，以更好的表达新业务语义
2. 新增、删除或者为了展示调整了枚举定义顺序

这些在业务开发中非常常见，使用 IDE 的 refactor 功能可以快速且准确的完成重构工作。但，如果系统将这些暴露出去或者存储到数据库等存储引擎就变得非常麻烦，不管是 name 还是 ordrial 的变更都会产生兼容性问题。

对此，最常见的解决方案便是放弃使用 name 和 ordrial，转而使用控制能力更强的 code。

## 1.2 目标
提供一组工具，以方便的基于 code 使用枚举，快速完成对现有框架的集成：

1. 完成与 Spring MVC 的集成，基于 code 使用枚举；加强返回值，以对象的方式进行返回，信息包括 code、name、description
2. 提供统一的枚举字典，自动扫描系统中的枚举并将其以 restful 的方式暴露给前端
3. 使用 code 进行数据存储操作，避免重构的影响

# 二、定义枚举

## 2.1 枚举类通用接口定义
```java
package com.light.cloud.common.core.enums;

import org.apache.commons.lang3.StringUtils;

import java.util.Objects;

/**
 * 枚举基类
 * <table>
 *   <tr>
 *     <th>name</th>
 *     <th>code</th>
 *     <th>value</th>
 *     <th>desc</th>
 *     <th>ordinal</th>
 *   </tr>
 *   <tr>
 *     <td>枚举项的名称，通过 {@link Enum#name()}方法获取</td>
 *     <td>枚举项的标识，通常为数字或简单字符串</td>
 *     <td>枚举项的值，可以为字符串、对象、方法引用、Lambda表达式等</td>
 *     <td>枚举项的中文简述，用于页面展示</td>
 *     <td>枚举项的排序号，通过 {@link Enum#ordinal()}方法获取</td>
 *   </tr>
 * </table>
 *
 * @author Hui Liu
 * @date 2022/7/27
 */
public interface BaseEnum<T> {

    /**
     * 获取枚举项的标识，通常为数字或简单字符串
     *
     * @return 当前枚举项的标识
     */
    T getCode();

    /**
     * 获取枚举项的中文简述，用于页面展示
     *
     * @return 当前枚举项的描述信息
     */
    String getDesc();

    /**
     * 获取枚举项的值，可以为字符串、对象、方法引用、Lambda表达式等
     *
     * @return 当前枚举的值
     */
    default Object getValue() {
        return getCode();
    }

    /**
     * 判断枚举值是否与给定值相等
     *
     * @param code 枚举标识
     * @return 当前枚举的标识与所给标识相同则返回 true， 否则返回 false
     */
    default boolean eqCode(T code) {
        return Objects.nonNull(code) && Objects.equals(this.getCode(), code);
    }

    /**
     * 判断枚举简述是否与给定值相等
     *
     * @param desc 枚举项的中文简述
     * @return 当前枚举的简述与所给简述相同则返回 true， 否则返回 false
     */
    default boolean eqDesc(String desc) {
        return StringUtils.equals(this.getDesc(), desc);
    }

    /**
     * 判断枚举值是否与给定值相等
     *
     * @param code 枚举标识的字符串形式
     * @return 当前枚举的标识与所给标识相同则返回 true， 否则返回 false
     */
    default boolean matchCode(String code) {
        return StringUtils.equals(String.valueOf(this.getCode()), code);
    }

}
```

## 2.2 枚举类定义
```java
package com.light.cloud.common.core.enums;

import java.util.Objects;

/**
 * 枚举类-表示是否等两个值的场景
 *
 * @author Hui Liu
 * @date 2022/7/27
 */
public enum YesNoEnum implements BaseEnum<Integer> {

    YES(1, "是"),

    NO(0, "否"),
    ;

    final Integer code;

    final String desc;

    YesNoEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    @Override
    public Integer getCode() {
        return code;
    }

    @Override
    public String getDesc() {
        return desc;
    }

    public static YesNoEnum ofCode(Integer code) {
        if (Objects.isNull(code)) {
            return null;
        }
        for (YesNoEnum yesNoEnum : YesNoEnum.values()) {
            if (yesNoEnum.getCode().equals(code)) {
                return yesNoEnum;
            }
        }
        return null;
    }
}
```

# 三、枚举直接序列化处理
## 3.1 Jackson序列化定义

## 3.2 枚举类加载缓存
有了统一的 `BaseEnum` 最大的好处便是可以进行统一管理，对于统一管理，第一件事便是找到并注册所有的 BaseEnum。

1. 首先通过 Spring 的 `ResourcePatternResolver` 根据配置的 `basePackage` 对classpath进行扫描
2. 扫描结果以`Resource`来表示，通过 `MetadataReader` 读取 `Resource` 信息，并将其解析为 `ClassMetadata`
3. 获得 `ClassMetadata` 之后，找出实现 `BaseEnum` 的类
4. 将 `BaseEnum` 实现类注册到两个 `Map` 中进行缓存

```java
package com.light.cloud.common.web.enums;

import com.light.cloud.common.core.constant.BaseConstant;
import com.light.cloud.common.core.enums.BaseEnum;

import jakarta.annotation.PostConstruct;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import org.apache.commons.lang3.StringUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.core.type.ClassMetadata;
import org.springframework.core.type.classreading.MetadataReader;
import org.springframework.core.type.classreading.MetadataReaderFactory;
import org.springframework.core.type.classreading.SimpleMetadataReaderFactory;

import java.io.IOException;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 枚举类注册
 *
 * @author Hui Liu
 * @date 2023/2/24
 */
@Slf4j
@Getter
public class CommonEnumRegistry {

    private static final String DEFAULT_RESOURCE_PATTERN = "**/*.class";

    private static final String BASE_ENUM_CLASS_NAME = BaseEnum.class.getName();

    private final Map<String, List<BaseEnum<?>>> nameEnumMap = new LinkedHashMap<>();

    private final Map<Class<?>, List<BaseEnum<?>>> classEnumMap = new LinkedHashMap<>();

    @Value("${light.cloud.web.enum-packages:''}")
    private String basePackage;

    @Autowired
    private ResourceLoader resourceLoader;

    @PostConstruct
    public void initEnumMap() {
        if (StringUtils.isBlank(basePackage)) {
            return;
        }
        ResourcePatternResolver resourcePatternResolver = ResourcePatternUtils.getResourcePatternResolver(this.resourceLoader);
        MetadataReaderFactory metadataReaderFactory = new SimpleMetadataReaderFactory();

        String[] packagePaths = basePackage.split(BaseConstant.COMMA);
        for (String packagePath : packagePaths) {
            processPackage(resourcePatternResolver, metadataReaderFactory, packagePath);
        }

    }

    public void processPackage(ResourcePatternResolver resourcePatternResolver,
                               MetadataReaderFactory metadataReaderFactory, String packagePath) {
        try {
            packagePath = this.convertPackagePath(packagePath);
            // 对 basePackage 包进行扫描
            String packageSearchPath = ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX +
                    packagePath + DEFAULT_RESOURCE_PATTERN;
            Resource[] resources = resourcePatternResolver.getResources(packageSearchPath);
            for (Resource resource : resources) {
                // 跳过私有类
                if (!resource.isReadable()) {
                    continue;
                }
                try {
                    MetadataReader metadataReader = metadataReaderFactory.getMetadataReader(resource);
                    ClassMetadata classMetadata = metadataReader.getClassMetadata();

                    String[] interfaceNames = classMetadata.getInterfaceNames();
                    // 实现 BASE_ENUM_CLASS_NAME 接口
                    if (Arrays.asList(interfaceNames).contains(BASE_ENUM_CLASS_NAME)) {
                        String className = classMetadata.getClassName();

                        // 加载 clazz
                        Class<?> clazz = Class.forName(className);
                        if (clazz.isEnum() && BaseEnum.class.isAssignableFrom(clazz)) {

                            Object[] enumConstants = clazz.getEnumConstants();
                            List<BaseEnum<?>> baseEnums = Arrays.stream(enumConstants)
                                    .filter(e -> e instanceof BaseEnum)
                                    .map(e -> (BaseEnum<?>) e)
                                    .collect(Collectors.toList());

                            String key = this.convertKeyFromClassName(clazz.getSimpleName());

                            this.nameEnumMap.put(key, baseEnums);
                            this.classEnumMap.put(clazz, baseEnums);
                        }
                    }
                } catch (Throwable ex) {
                    // ignore
                    log.error("Enum class parse exception.", ex);
                }
            }
        } catch (IOException e) {
            log.error("Failed to load dict by auto register.", e);
        }
    }

    /**
     * 将 . 分隔的报名转换为 / 分隔的包名 <p>
     * com.light.cloud.enums 转换为 com/light/cloud/enums/
     *
     * @param basePackage 以 . 分隔的包名
     * @return 以 / 分隔的包名
     */
    private String convertPackagePath(String basePackage) {
        String result = basePackage.replace(BaseConstant.DOT, BaseConstant.SLASH);
        return result + BaseConstant.SLASH;
    }

    /**
     * 将大驼峰类名转换为小驼峰类名，并删除Enum后缀
     *
     * @param className 类名 YesNoEnum
     * @return yesNo
     */
    private String convertKeyFromClassName(String className) {
        if (className.toLowerCase().endsWith("enum")) {
            className = className.substring(0, className.length() - 4);
        }
        return Character.toLowerCase(className.charAt(0)) + className.substring(1);
    }

}
```

在需要 `BaseEnum` 时，只需注入 `CommonEnumRegistry` Bean 便可以方便的获得 `BaseEnum` 的具体实现。

## 3.3 普通参数处理器
Web 层是最常见的接入点，对于 BaseEnum 我们倾向于：

1. 参数使用 code 来表示，避免 name、ordrial 变化导致业务异常
2. 丰富返回值，包括枚举的 code、name、description 等

对于普通参数，比如 `RequestParam` 或 `PathVariable` 直接从 `ConditionalGenericConverter` 进行扩展
- 基于 `CommonEnumRegistry` 提供的 `BaseEnum` 信息，对 `matches` 和 `getConvertibleTypes` 方法进行重写
- 根据目标类型获取所有的 枚举值，并根据 `code` 和 `name` 进行转化

```java
package com.light.cloud.common.web.enums;

import com.light.cloud.common.core.enums.BaseEnum;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.TypeDescriptor;
import org.springframework.core.convert.converter.ConditionalGenericConverter;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Spring MVC 存在两种参数转化扩展：
 * <p>
 * 对于普通参数，比如 RequestParam 或 PathVariable 直接从 ConditionalGenericConverter 进行扩展
 * 基于 CommonEnumRegistry 提供的 BaseEnum 信息，对 matches 和 getConvertibleTypes方法进行重写
 * 根据目标类型获取所有的 枚举值，并根据 code 和 name 进行转化
 * <p>
 * 对于 Json 参数，需要对 Json 框架进行扩展（以 Jackson 为例）
 * 遍历 CommonEnumRegistry 提供的所有 BaseEnum，依次进行注册
 * 从 Json 中读取信息，根据 code 和 name 转化为确定的枚举值
 *
 * @author Hui Liu
 * @date 2023/2/24
 */
public class CommonEnumConverter implements ConditionalGenericConverter {

    @Autowired
    private CommonEnumRegistry enumRegistry;

    @Override
    public boolean matches(TypeDescriptor sourceType, TypeDescriptor targetType) {
        Class<?> type = targetType.getType();
        return enumRegistry.getClassEnumMap().containsKey(type);
    }

    @Override
    public Set<ConvertiblePair> getConvertibleTypes() {
        return enumRegistry.getClassEnumMap().keySet().stream()
                .map(clazz -> new ConvertiblePair(String.class, clazz))
                .collect(Collectors.toSet());
    }

    @Override
    public Object convert(Object source, TypeDescriptor sourceType, TypeDescriptor targetType) {
        List<BaseEnum<?>> baseEnums = this.enumRegistry.getClassEnumMap().get(targetType.getType());
        return baseEnums.stream()
                .filter(baseEnum -> baseEnum.matchCode(String.valueOf(source)))
                .findFirst()
                .orElse(null);
    }

}
```

## 3.4 Json参数处理器
对于 Json 参数，需要对 Json 框架进行扩展（以 Jackson 为例）
- 遍历 `CommonEnumRegistry` 提供的所有 `BaseEnum`，依次进行注册
- 从 Json 中读取信息，根据 code 和 name 转化为确定的枚举值

## 3.5 Json序列化、反序列化配置

```java
// region 枚举类注册

@Bean
public CommonEnumRegistry commonEnumRegistry() {
    return new CommonEnumRegistry();
}

@Bean
public CommonEnumConverter commonEnumConverter() {
    return new CommonEnumConverter();
}

@Bean
public Jackson2ObjectMapperBuilderCustomizer commonEnumBuilderCustomizer(CommonEnumRegistry enumRegistry) {
    return builder -> {
        Map<Class<?>, List<BaseEnum<?>>> classDict = enumRegistry.getClassEnumMap();
        classDict.forEach((clazz, baseEnums) -> {
            builder.deserializerByType(clazz, new CommonEnumJsonDeserializer(baseEnums));
            builder.serializerByType(clazz, new CommonEnumJsonSerializer());
        });
    };
}

// endregion
```

## 3.6 Json序列化类

```java
package com.light.cloud.common.web.enums;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.light.cloud.common.core.enums.BaseEnum;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * 枚举序列化类
 *
 * @author Hui Liu
 * @date 2023/2/24
 */
public class CommonEnumJsonSerializer extends JsonSerializer<BaseEnum<?>> {

    @Override
    public void serialize(BaseEnum<?> baseEnum, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        Map<String,Object> resultMap = new HashMap<>(4);
        resultMap.put("code", baseEnum.getCode());
        resultMap.put("desc", baseEnum.getDesc());
        jsonGenerator.writeObject(resultMap);
    }
}
```

## 3.7 Json反序列化类

```java
package com.light.cloud.common.web.enums;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.light.cloud.common.core.enums.BaseEnum;

import java.io.IOException;
import java.util.List;

/**
 * 枚举反序列化类
 *
 * @author Hui Liu
 * @date 2023/2/24
 */
public class CommonEnumJsonDeserializer extends JsonDeserializer<BaseEnum<?>> {

    private final List<BaseEnum<?>> baseEnums;

    public CommonEnumJsonDeserializer(List<BaseEnum<?>> baseEnums) {
        this.baseEnums = baseEnums;
    }

    @Override
    public BaseEnum<?> deserialize(JsonParser jsonParser, DeserializationContext deserializationContext)
            throws IOException, JacksonException {
        String value = jsonParser.readValueAs(String.class);
        return baseEnums.stream()
                .filter(baseEnum -> baseEnum.matchCode(value))
                .findFirst()
                .orElse(null);
    }

}
```

# 四、枚举注解序列化处理
## 4.1 序列化注解

```java
package com.light.cloud.common.web.jackson.annotation;

import com.fasterxml.jackson.annotation.JacksonAnnotationsInside;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.light.cloud.common.core.enums.BaseEnum;
import com.light.cloud.common.web.jackson.serializer.EnumDeserializer;
import com.light.cloud.common.web.jackson.serializer.EnumSerializer;

import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 枚举序列化注解
 *<pre>
 *     {@code
 *      @EnumSerialize(type = YesNoEnum.class, field = "deletedDesc")
 *      private Integer deleted;
 *      }
 *</pre>
 *
 * @author Hui Liu
 * @date 2022/8/1
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@JacksonAnnotationsInside
@JsonSerialize(using = EnumSerializer.class)
//@JsonDeserialize(using = EnumDeserializer.class)
public @interface EnumSerialize {

    /**
     * 枚举类型
     */
    Class<? extends BaseEnum<?>> type();

    /**
     * 枚举描述解析到的字段名称 默认 字段名 + Desc
     */
    String field() default "";

}
```

## 4.2 注解处理类-序列化类

```java
package com.light.cloud.common.web.jackson.serializer;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.BeanProperty;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.ContextualSerializer;
import com.fasterxml.jackson.databind.type.SimpleType;
import com.light.cloud.common.core.enums.BaseEnum;
import com.light.cloud.common.core.exception.BizException;
import com.light.cloud.common.core.tool.ReflectionTool;
import com.light.cloud.common.web.jackson.annotation.EnumSerialize;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.util.Objects;

/**
 * 枚举序列化工具
 *
 * @author Hui Liu
 * @date 2022/8/1
 */
public class EnumSerializer extends JsonSerializer<Object> implements ContextualSerializer {

    private Class<? extends BaseEnum<?>> type;

    private String field;

    public EnumSerializer() {
    }

    public EnumSerializer(Class<? extends BaseEnum<?>> type, String field) {
        this.type = type;
        this.field = field;
    }

    @Override
    public void serialize(Object value, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        String currentFieldName = jsonGenerator.getOutputContext().getCurrentName();
        jsonGenerator.writeObject(value);

        // 序列化枚举
        if (type.isEnum()) {
            if (StringUtils.isBlank(field)) {
                field = currentFieldName + "Desc";
            }
            BaseEnum<?>[] enumConstants = type.getEnumConstants();
            for (BaseEnum<?> enumConstant : enumConstants) {
                if (enumConstant.getCode().equals(value)) {
                    jsonGenerator.writeObjectField(field, enumConstant.getDesc());
                }
            }
        }
    }

    @Override
    public JsonSerializer<?> createContextual(SerializerProvider serializerProvider, BeanProperty beanProperty) throws JsonMappingException {
        // 空值直接跳过
        if (Objects.nonNull(beanProperty)) {
            // 只序列化基础类型
            if (ReflectionTool.isPrimitiveOrString(beanProperty.getType().getRawClass())) {
                EnumSerialize enumSerialize = beanProperty.getAnnotation(EnumSerialize.class);
                if (Objects.isNull(enumSerialize)) {
                    enumSerialize = beanProperty.getContextAnnotation(EnumSerialize.class);
                }
                if (Objects.nonNull(enumSerialize)) {
                    // 讲注解参数传入到序列化器中
                    return new EnumSerializer(enumSerialize.type(), enumSerialize.field());
                } else {
                    throw BizException.throwException("未找到注解 @EnumSerialize");
                }
            }
            return serializerProvider.findValueSerializer(beanProperty.getType(), beanProperty);
        }
        return serializerProvider.findNullKeySerializer(SimpleType.constructUnsafe(String.class), beanProperty);
    }

}
```

## 4.3 注解处理类-反序列化类

```java
package com.light.cloud.common.web.jackson.serializer;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.BeanProperty;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.deser.ContextualDeserializer;
import com.fasterxml.jackson.databind.type.SimpleType;
import com.light.cloud.common.core.enums.BaseEnum;
import com.light.cloud.common.core.exception.BizException;
import com.light.cloud.common.core.tool.ReflectionTool;
import com.light.cloud.common.web.jackson.annotation.EnumSerialize;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.util.Objects;

/**
 * Enum反序列化
 *
 * @author Hui Liu
 * @date 2022/8/1
 */
@Slf4j
public class EnumDeserializer extends JsonDeserializer<BaseEnum<?>> implements ContextualDeserializer {

    private Class<? extends BaseEnum<?>> type;

    private String field;

    public EnumDeserializer() {
    }

    public EnumDeserializer(Class<? extends BaseEnum<?>> type, String field) {
        this.type = type;
        this.field = field;
    }

    @Override
    public BaseEnum<?> deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JsonProcessingException {
        try {
            if (type.isEnum() && Objects.nonNull(jsonParser) && StringUtils.isNotBlank(jsonParser.getText())) {
                String code = jsonParser.getText();
                BaseEnum<?>[] baseEnums = type.getEnumConstants();
                for (BaseEnum<?> baseEnum : baseEnums) {
                    if (StringUtils.equals(String.valueOf(baseEnum.getCode()), code)) {
                        return baseEnum;
                    }
                }
                return null;
            }
        } catch (Exception e) {
            log.error("反序列化失败，原始值: {}", jsonParser.getText(), e);
        }
        return null;
    }

    @Override
    public JsonDeserializer<?> createContextual(DeserializationContext context, BeanProperty beanProperty) throws JsonMappingException {
        // 空值直接跳过
        if (Objects.nonNull(beanProperty)) {
            // 只序列化基础类型
            if (ReflectionTool.isPrimitiveOrString(beanProperty.getType().getRawClass())) {
                EnumSerialize enumSerialize = beanProperty.getAnnotation(EnumSerialize.class);
                if (Objects.isNull(enumSerialize)) {
                    enumSerialize = beanProperty.getContextAnnotation(EnumSerialize.class);
                }
                if (Objects.nonNull(enumSerialize)) {
                    // 讲注解参数传入到序列化器中
                    return new EnumDeserializer(enumSerialize.type(), enumSerialize.field());
                } else {
                    throw BizException.throwException("未找到注解 @EnumSerialize");
                }
            }
            return context.findContextualValueDeserializer(beanProperty.getType(), beanProperty);
        }
        return context.findNonContextualValueDeserializer(SimpleType.constructUnsafe(String.class));
    }

}
```

# 五、持久层处理
## 5.1 Mybatis序列化
MyBatis 作为最流行的 ORM 框架，提供了 TypeHandler 用于处理自定义的类型扩展。

`YesNoEnumTypeHandler` 通过 `@MappedTypes(YesNoEnum.class)` 对其进行标记，
以告知框架该 `Handler` 是用于 `YesNoEnum` 类型的转换。
### 5.1.1 转换器抽象接口

```java
package com.light.cloud.common.orm.mybatis.typehandler;

import com.light.cloud.common.core.enums.BaseEnum;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Objects;

/**
 * Mybatis 枚举处理器
 *
 * @author Hui Liu
 * @date 2023/2/24
 */
public abstract class CommonEnumTypeHandler<E extends Enum<E> & BaseEnum<?>> extends BaseTypeHandler<E> {

    /**
     * 枚举的类型
     */
    private Class<E> type;

    /**
     * 枚举的项
     */
    private E[] enums;

    /**
     * 空构造必须有，否则会报 Not found method exception
     */
    public CommonEnumTypeHandler() {
    }

    /**
     * 设置配置文件设置的转换类以及枚举类内容，供其他方法更便捷高效的实现
     * @param type 配置文件中设置的转换类
     */
    public CommonEnumTypeHandler(Class<E> type) {
        if (Objects.isNull(type)) {
            throw new IllegalArgumentException("Type argument cannot be null.");
        }
        this.type = type;
        this.enums = type.getEnumConstants();
        if (Objects.isNull(this.enums)) {
            throw new IllegalArgumentException(type.getSimpleName() + " does not represent an enum type.");
        }
    }

    @Override
    public void setNonNullParameter(PreparedStatement preparedStatement, int i, E parameter,
                                    JdbcType jdbcType) throws SQLException {
        if (Objects.isNull(jdbcType)) {
            preparedStatement.setString(1, String.valueOf(parameter.getCode()));
        } else {
            preparedStatement.setObject(i, parameter.getCode(), jdbcType.TYPE_CODE);
        }
    }

    @Override
    public E getNullableResult(ResultSet resultSet, String columnName) throws SQLException {
        String code = resultSet.getString(columnName);
        if (resultSet.wasNull()) {
            return null;
        } else {
            return locateEnumStatus(code);
        }
    }

    @Override
    public E getNullableResult(ResultSet resultSet, int columnIndex) throws SQLException {
        String code = resultSet.getString(columnIndex);
        if (resultSet.wasNull()) {
            return null;
        } else {
            return locateEnumStatus(code);
        }
    }

    @Override
    public E getNullableResult(CallableStatement callableStatement, int columnIndex) throws SQLException {
        String code = callableStatement.getString(columnIndex);
        if (callableStatement.wasNull()) {
            return null;
        } else {
            return locateEnumStatus(code);
        }
    }

    /**
     * 枚举类型转换，由于构造函数获取了枚举的子类 enums，让遍历更加高效快捷
     * <p>
     *
     * @param code 数据库中存储的自定义code属性
     * @return code 对应的枚举项
     */
    private E locateEnumStatus(String code) {
        return Arrays.stream(enums)
                .filter(commonEnum -> commonEnum.matchCode(code))
                .findFirst()
                .orElse(null);
    }
}
```

### 5.1.2 YesNoEnum配置类

```java
package com.light.cloud.common.orm.mybatis.typehandler;

import com.light.cloud.common.core.enums.YesNoEnum;
import org.apache.ibatis.type.MappedTypes;

/**
 * 是否类型枚举处理
 *
 * @author Hui Liu
 * @date 2023/2/24
 */
@MappedTypes(YesNoEnum.class)
public class YesNoEnumTypeHandler extends CommonEnumTypeHandler<YesNoEnum> {

    public YesNoEnumTypeHandler() {
        super(YesNoEnum.class);
    }

}
```

### 5.1.3 配置

```yaml application.yaml
mybatis:
  type-handlers-package: com.light.cloud.common.orm.mybatis.typehandler
```

## 5.2 Jpa序列化
随着 Spring data 越来越流行，JPA 又焕发出新的活力，JPA 提供 `AttributeConverter` 以对属性转换进行自定义。

### 5.2.1 转换器抽象接口

```java
package com.light.cloud.common.orm.jpa;

import com.light.cloud.common.core.enums.BaseEnum;
import jakarta.persistence.AttributeConverter;

import java.util.Arrays;
import java.util.List;

public abstract class CommonEnumAttributeConverter<E extends Enum<E> & BaseEnum<?>>
        implements AttributeConverter<E, String> {

    private final List<E> baseEnums;

    public CommonEnumAttributeConverter(E[] baseEnum) {
        this(Arrays.asList(baseEnum));
    }

    public CommonEnumAttributeConverter(List<E> baseEnums) {
        this.baseEnums = baseEnums;
    }

    @Override
    public String convertToDatabaseColumn(E e) {
        return String.valueOf(e.getCode());
    }

    @Override
    public E convertToEntityAttribute(String code) {
        return (E) baseEnums.stream()
                .filter(commonEnum -> commonEnum.matchCode(code))
                .findFirst()
                .orElse(null);
    }
}
```

### 5.2.2 YesNoEnum配置类

```java
public class JpaYesNoEnumConverter extends CommonEnumAttributeConverter<YesNoEnum> {
    public JpaYesNoEnumConverter() {
        super(YesNoEnum.values());
    }
}
```

### 5.2.3 使用示例

```java
@Entity
@Data
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Convert(converter = JpaYesNoEnumConverter.class)
    private YesNoEnum deleted;
}
```

# 六、测试
## 6.1 测试实体类

```java
package com.light.cloud.service.demo.web.entity;

import com.light.cloud.common.core.enums.YesNoEnum;
import com.light.cloud.common.web.jackson.annotation.DecimalSerialize;
import com.light.cloud.common.web.jackson.annotation.EnumSerialize;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 用户信息
 *
 * @author Hui Liu
 * @date 2022/8/2
 */
@Data
public class CommonEntity implements Serializable {

    private static final long serialVersionUID = -1L;

    private Long id;

    @DecimalSerialize
    private BigDecimal decimal;

    @EnumSerialize(type = YesNoEnum.class)
    private Integer deleted;

    private YesNoEnum status;

}
```

## 6.2 测试接口

```java
package com.light.cloud.service.demo.web.controller;

import com.light.cloud.common.core.enums.BaseEnum;
import com.light.cloud.common.core.enums.YesNoEnum;
import com.light.cloud.common.web.entity.response.Result;
import com.light.cloud.common.web.enums.CommonEnumRegistry;
import com.light.cloud.service.demo.web.entity.CommonEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.tags.Tags;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 枚举测试类
 *
 * @author Hui Liu
 * @date 2023/2/24
 */
@RestController
@RequestMapping("enum")
@Tags(value = {
        @Tag(name = "枚举测试")
})
public class EnumTestController {

    @Resource
    private CommonEnumRegistry commonEnumRegistry;

    @GetMapping("deserialize")
    @Operation(summary = "【1.0.0】-【枚举】-【简单反序列化】", description ="Hui Liu")
    public Result<String> deserialize(YesNoEnum status) {
        return Result.success(status.getCode() + "  " + status.getDesc());
    }

    @GetMapping("serialize")
    @Operation(summary = "【1.0.0】-【枚举】-【简单序列化】", description ="Hui Liu")
    public Result<YesNoEnum> serialize() {
        return Result.success(YesNoEnum.YES);
    }

    @PostMapping("object/deserialize")
    @Operation(summary = "【1.0.0】-【枚举】-【对象反序列化】", description ="Hui Liu")
    public Result<String> objectDeserialize(@Validated @RequestBody CommonEntity commonEntity) {
        YesNoEnum status = commonEntity.getStatus();
        return Result.success(status.getCode() + "  " + status.getDesc());
    }

    @GetMapping("object/serialize")
    @Operation(summary = "【1.0.0】-【枚举】-【对象序列化】", description ="Hui Liu")
    public Result<CommonEntity> objectSerialize() {
        CommonEntity commonEntity = new CommonEntity();
        commonEntity.setStatus(YesNoEnum.NO);
        return Result.success(commonEntity);
    }

    @PostMapping("annotation/deserialize")
    @Operation(summary = "【1.0.0】-【枚举】-【反序列化注解】", description ="Hui Liu")
    public Result<CommonEntity> annotationDeserialize(@Validated @RequestBody CommonEntity commonEntity) {
        return Result.success(commonEntity);
    }

    @GetMapping("annotation/serialize")
    @Operation(summary = "【1.0.0】-【枚举】-【序列化注解】", description ="Hui Liu")
    public Result<CommonEntity> annotationSerialize() {
        CommonEntity commonEntity = new CommonEntity();
        commonEntity.setDeleted(YesNoEnum.NO.getCode());
        return Result.success(commonEntity);
    }

    @GetMapping("items")
    @Operation(summary = "【1.0.0】-【枚举】-【获取指定枚举的所有选项】", description ="Hui Liu")
    public Result<List<BaseEnum<?>>> items(String name) {
        List<BaseEnum<?>> baseEnums = commonEnumRegistry.getNameEnumMap().get(name);
        return Result.success(baseEnums);
    }
}
```

## 6.3 测试脚本

```http request
###
GET http://localhost:10020/demo/enum/deserialize?status=1

###
GET http://localhost:10020/demo/enum/serialize

###
POST http://localhost:10020/demo/enum/object/deserialize
Content-Type: application/json

{
  "status": 1
}

###
GET http://localhost:10020/demo/enum/object/serialize

###
POST http://localhost:10020/demo/enum/annotation/deserialize
Content-Type: application/json

{
  "deleted": 0
}

###
GET http://localhost:10020/demo/enum/annotation/serialize

###
GET http://localhost:10020/demo/enum/items?name=yesNoEnum

```
