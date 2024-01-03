- [如何在Spring Boot中优雅的进行参数校验？](https://mp.weixin.qq.com/s/MhcyHtVTmYIbOwIpfPD6NQ)

## 1、前言
在平时的开发工作中，我们通常需要对接口进行参数格式验证。当参数个数较少（个数小于3）时，可以使用`if ... else ...`手动进行参数验证。当参数个数大于3个时，使用`if ... else ...`进行参数验证就会让代码显得臃肿，这个时候推荐使用注解来进行参数验证。

## 2、常用注解
下面列举一些常用的验证注解：

- `@NotNull`：值不能为null；
- `@NotEmpty`：字符串、集合或数组的值不能为空，即长度大于0；
- `@NotBlank`：字符串的值不能为空白，即不能只包含空格；
- `@Size`：字符串、集合或数组的大小是否在指定范围内；
- `@Min`：数值的最小值；
- `@Max`：数值的最大值；
- `@DecimalMin`：数值的最小值，可以包含小数；
- `@DecimalMax`：数值的最大值，可以包含小数；
- `@Digits`：数值是否符合指定的整数和小数位数；
- `@Pattern`：字符串是否匹配指定的正则表达式；
- `@Email`：字符串是否为有效的电子邮件地址；
- `@AssertTrue`：布尔值是否为true；
- `@AssertFalse`：布尔值是否为false；
- `@Future`：日期是否为将来的日期；
- `@Past`：日期是否为过去的日期；

## 3、实现示例
### 3.1 创建项目，添加依赖
本示例中使用的spring boot 版本为2.7.7。

使用IDEA创建一个spring boot项目。在项目的pom.xml文件中添加如下依赖：
```xml
<dependency>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-web</artifactId>
 </dependency>
 <dependency>
     <groupId>org.springframework.boot</groupId>
     <artifactId>spring-boot-starter-validation</artifactId>
 </dependency>
```

### 3.2 创建示例实体类
创建一个User实体类，在实体类中需要对属性进行如下验证：

- name - 用户姓名，不能为空；
- password - 密码，不能为空，长度不能小于6；
- age - 年龄，大于0小于150；
- phone - 手机号，满足手机号格式；

User实体类具体代码如下：
```java
import lombok.Data;
import javax.validation.constraints.*;

@Data
public class User {

@NotBlank(message = "用户姓名不能为空")
private String name;

@NotBlank(message = "密码不能为空")
@Size(min = 6, message = "密码长度不能少于6位")
private String password;

@Min(value = 0, message = "年龄不能小于0岁")
@Max(value = 150, message = "年龄不应超过150岁")
private Integer age;

@Pattern(regexp = "^((13[0-9])|(15[^4])|(18[0-9])|(17[0-9])|(147))\d{8}$", message = "手机号格式不正确")
private String phone;

}
```

### 3.3 创建控制器类
创建一个简单的控制器类，用于演示参数验证功能。

控制器代码如下：
```java
import cn.ddcherry.springboot.demo.util.R;
import cn.ddcherry.springboot.demo.entity.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/user")
public class UserController {

@PostMapping("/save")
public R save(@Valid @RequestBody User user) {
 return R.ok(user);
}
}
```
我们在参数user前添加`@Valid`注解，表示验证该参数。

其中R是封装的一个简易工具类，用于统一返回结果格式。代码如下：
```java
import lombok.Data;
 
import java.io.Serializable;

@Data
public class R<T> implements Serializable {
private int code;
private boolean success;
private T data;
private String msg;

private R(int code, T data, String msg) {
 this.code = code;
 this.data = data;
 this.msg = msg;
 this.success = code == 200;
}

public static <T> R<T> ok(T data) {
 return new R<>(200, data, null);
}

public static <T> R<T> error(String msg) {
 return new R<>(500, null, msg);
}
}
```

### 3.4 定义全局异常处理类
全局异常处理类代码如下：
```java
import cn.ddcherry.springboot.demo.util.R;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

@ExceptionHandler(BindException.class)
public R handleError(BindException e) {
 BindingResult bindingResult = e.getBindingResult();
 return R.error(bindingResult.getFieldError().getDefaultMessage());
}
}
```
我们在全局异常处理类中使用ExceptionHandler捕获BindException异常，获取参数验证异常信息，最后返回统一的异常结果格式。

### 3.5 测试
在接口测试工具中测试接口。

以密码长度不足6位为例，返回的结果如下图所示：

图片

### 3.6 小结
至此，我们就简单地讲述了Spring Boot项目使用@Valid注解进行参数验证的实现步骤。示例的验证逻辑流程如下图所示：

图片

## 4、进阶
### 4.1 `@Valid`与`@Validated`的区别
用于参数校验的注解通常有两个：`@Valid`和`@Validated`。它们的区别有如下几点：

| 区别             | @Valid                             | @Validated                           |
| ---------------- | ---------------------------------- | ------------------------------------ |
| 来源             | @Valid是Java标准注解               | @Validated是Spring框架定义的注解。   |
| 是否支持分组验证 | 不支持                             | 支持                                 |
| 使用位置         | 构造函数、方法、方法参数、成员属性 | 类、方法、方法参数，不能用于成员属性 |
| 是否支持嵌套校验 | 支持                               | 不支持                               |

### 4.2 自定义验证注解
除了框架自带的注解，平时的工作中可能需要我们自定义验证注解处理特定的业务需求。这里汪小成将上面User类中的手机号格式验证改成使用自定义注解的验证方式。

#### 4.2.1 定义注解
```java
@Documented
@Retention(RUNTIME)
@Constraint(validatedBy = {PhoneValidator.class})
@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})
public @interface Phone {

String message() default "手机号格式错误";

Class<?>[] groups() default {};

Class<? extends Payload>[] payload() default {};
}
```
说明：

- `@Constraint(validatedBy = {PhoneValidator.class})`：用于指定验证器类；
- `@Target({METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE})`：指定`@Phone`注解可以作用在方法、字段、构造函数、参数以及类型上；

#### 4.2.2 定义验证器类
```java
public class PhoneValidator implements ConstraintValidator<Phone, String> {
   private static final Logger LOGGER = LoggerFactory.getLogger(PhoneValidator.class);
   private static final String REGEX = "^((13[0-9])|(15[^4])|(18[0-9])|(17[0-9])|(147))\d{8}$";
 
   @Override
   public boolean isValid(String s, ConstraintValidatorContext context) {
     boolean result = false;
     try {
       result = Pattern.matches(REGEX, s);
     } catch (Exception e) {
       LOGGER.error("验证手机号格式时发生异常，异常信息：", e);
     }
     return result;
   }
 }
 ```

#### 4.2.3 使用注解
```java
@Data
 public class User {
 
   // 省略其它代码
 
 - //  @Pattern(regexp = "^((13[0-9])|(15[^4])|(18[0-9])|(17[0-9])|(147))\d{8}$", message = "手机号格式不正确")
 + @Phone
   private String phone;
 
 }
```

这样我们就成功地使用自定义注解`@Phone`验证手机号格式了。

使用自定义注解实现业务验证的一个比较大的优点是可以复用。所有需要进行手机号格式验证的属性，只需要添加上`@Phone`注解就可以了。如果后期我们需要修改手机号的验证规则，只需要修改`PhoneValidator`类中的验证逻辑，就可以作用于所有添加了`@Phone`注解的字段了。
