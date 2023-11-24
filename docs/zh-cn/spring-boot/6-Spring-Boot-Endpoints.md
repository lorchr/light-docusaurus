## 自定义端点及相关注解

在Spring Framework中，您可以使用注解来定义自定义端点和操作，以扩展Actuator的功能。以下是一些常用的Actuator自定义端点相关注解：

1. @Endpoint：
`@Endpoint` 是一个元注解，用于定义自定义端点。您可以将这个注解添加到您的自定义端点类上，以便将其识别为Actuator端点。

2. @ReadOperation：
`@ReadOperation` 是一个用于定义读取操作的注解。您可以将它添加到自定义端点的方法上，以指定该方法用于提供信息的只读操作。

3. @WriteOperation：
`@WriteOperation` 是一个用于定义写入操作的注解。您可以将它添加到自定义端点的方法上，以指定该方法用于修改或执行某些操作。

4. @EndpointConverter：
`@EndpointConverter` 是一个注解，用于自定义端点转换器。您可以使用它来注册自定义的转换器，从而允许您在端点输出和输入之间进行转换。

5. @EndpointExtension：
`@EndpointExtension` 是一个注解，用于将额外的功能添加到现有的端点。您可以通过它来扩展Actuator中现有端点的功能。

6. @FilteredEndpoint：
`@FilteredEndpoint` 是一个注解，用于定义一个被过滤的端点。当Actuator暴露多个端点时，您可以使用该注解来控制哪些端点应该被包含或排除。

7. @Selector：
`@Selector` 是一个注解，用于定义端点选择器。它允许您根据条件选择是否包含或排除某个端点。

这些注解的使用可以让您在Spring Boot Actuator中创建自定义端点，并且根据需要进行操作。通过使用这些注解，您可以扩展Actuator的功能，提供更多有用的端点和操作，以监控和管理您的Spring Boot应用程序。请注意，在实际编码时，您需要将这些注解与其他相关注解和组件结合使用，以构建完整的自定义端点和操作。

## 使用示例

当然，我可以为您提供一个简单的示例，其中包含了上述提到的所有注解的用法。假设我们要创建一个自定义的Actuator端点，用于管理和显示某个用户的信息。我们将使用Spring Boot来实现这个示例。

首先，我们创建一个自定义的端点类，命名为`UserManagementEndpoint`，并添加`@Endpoint`注解来标识它为一个Actuator端点：

```java
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;

@Endpoint(id = "userManagement")
public class UserManagementEndpoint {
    // Implementation of the custom endpoint and operations will be added here
}
```

接下来，我们为`UserManagementEndpoint`添加读取操作和写入操作。我们假设我们需要通过该端点获取用户信息和修改用户信息。我们将使用`@ReadOperation`和`@WriteOperation`注解来定义这些操作：

```java
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.boot.actuate.endpoint.annotation.WriteOperation;

@Endpoint(id = "userManagement")
public class UserManagementEndpoint {

    // Read operation to get user information
    @ReadOperation
    public String getUserInfo() {
        // Implementation to retrieve user information goes here
        return "User information: {name: John, age: 30}";
    }

    // Write operation to update user information
    @WriteOperation
    public String updateUserInfo(String name, int age) {
        // Implementation to update user information goes here
        return "User information updated: {name: " + name + ", age: " + age + "}";
    }
}
```

然后，我们可能想要为这个自定义端点添加一些额外的功能，例如自定义的转换器和端点选择器。我们可以使用`@EndpointConverter`和`@Selector`注解来实现：

```java
import org.springframework.boot.actuate.endpoint.annotation.*;
import org.springframework.boot.actuate.endpoint.convert.ConversionServiceParameterValueMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.support.ConfigurableConversionService;

@Endpoint(id = "userManagement")
public class UserManagementEndpoint {

    // ... (ReadOperation and WriteOperation methods)

    @Bean
    public UserConverter userConverter() {
        return new UserConverter();
    }

    @EndpointConverter
    public class UserConverter {
        @ReadOperation
        public User convert(String userString) {
            // Custom logic to convert the userString to a User object
            return new User("Jane", 25);
        }
    }

    @Selector
    public boolean isUserManagementEnabled() {
        // Custom logic to determine whether the user management endpoint should be enabled
        return true;
    }
}
```

在上面的示例中，我们添加了一个内部类`UserConverter`并使用`@EndpointConverter`注解来注册它。此转换器用于将返回的用户信息字符串转换为自定义的`User`对象。另外，我们还使用`@Selector`注解来添加一个选择器方法，用于确定是否启用`UserManagementEndpoint`端点。

最后，在Spring Boot应用程序的配置中，我们需要将自定义端点添加到Actuator的端点列表中：

```java
import org.springframework.boot.actuate.endpoint.annotation.Selector;
import org.springframework.boot.actuate.endpoint.web.annotation.WebEndpoint;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.support.DefaultConversionService;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    public UserManagementEndpoint userManagementEndpoint() {
        return new UserManagementEndpoint();
    }
}
```

暴露端点
```yaml
management:
  endpoints:
    web:
      exposure:
        include: userManagement
```

测试访问
```shell
curl -X GET http://localhost:8080/actuator/userManagement

curl -X POST http://localhost:8080/actuator/userManagement -d '{"name": "tom", "age": 10}'
```

现在，您的应用程序就拥有了一个名为`userManagement`的自定义Actuator端点，该端点包含读取和写入操作，并且还注册了自定义的转换器和端点选择器。

请注意，这只是一个简单的示例，实际应用中可能涉及更多复杂的逻辑和功能。在实际开发中，您可以根据需要扩展和调整这个示例来满足您的需求。

## Spring Security OAuth2 为什么从 Endpoints 实现改为 Filter实现
在 Spring Security OAuth2 中，从 endpoints 实现改为 filter 实现，主要是为了更好地与 Spring Security 的整体架构和授权流程进行整合。这个改变是从 Spring Security 5.x 开始引入的。

在过去的版本中，Spring Security OAuth2 是通过一组 Actuator 端点（endpoints）来实现的，这些端点用于处理 OAuth2 的授权请求和令牌管理等功能。虽然这种实现方式在某种程度上是有效的，但它与 Spring Security 的过滤器链不够自然地融合，也存在一些限制和缺点。

改为 filter 实现的主要优势包括：

1. 统一的过滤器链：使用过滤器来处理 OAuth2 的授权请求和令牌管理等操作，可以将 OAuth2 流程与 Spring Security 的过滤器链无缝集成，实现更统一和灵活的授权流程。

2. 更好的定制和扩展性：使用过滤器可以更方便地定制和扩展 OAuth2 的行为。您可以按需添加、移除或替换过滤器，以满足特定的授权需求，并更好地与其他 Spring Security 功能整合。

3. 支持非 Web 应用：过滤器实现的方式不仅适用于传统的 Web 应用程序，还可以用于其他类型的应用程序，例如基于 Spring Security 的 RESTful 服务和无状态服务。

4. 更好的错误处理和异常处理：使用过滤器可以更灵活地处理 OAuth2 相关的错误和异常，提供更合理和友好的错误响应。

总的来说，通过从 endpoints 实现改为 filter 实现，Spring Security OAuth2 可以更好地与 Spring Security 整体融合，提供更灵活、更强大和更一致的授权解决方案。这也是为了使 Spring Security OAuth2 能够适应不断演变的应用场景和需求，并更好地满足开发者的授权和认证需求。

## 使用@Endpoints 注解定义接口的优点和弊端

在 Spring Boot Actuator 中使用 `@Endpoint` 注解定义自定义接口（Endpoint）有其优点和劣势，让我们一起来看看：

**优点：**

1. **简化自定义端点的创建**：使用 `@Endpoint` 注解可以快速定义自定义端点，而不需要编写大量的配置代码。它使得创建自定义的监控和管理端点变得简单和快捷。

2. **集成 Actuator 端点**：通过 `@Endpoint` 注解，您的自定义端点可以无缝集成到 Spring Boot Actuator 暴露的所有端点中。这样，您可以将自定义的管理和监控功能整合到现有的 Actuator 端点中。

3. **便于扩展**：使用 `@Endpoint` 注解，您可以将多个功能相关的端点组织在一个类中。这样，可以更好地组织和管理相关的功能，并且在需要时更容易进行扩展。

**劣势：**

1. **安全性考虑**：通过 `@Endpoint` 注解暴露的自定义端点默认是没有安全性保护的，任何具有访问权限的用户都可以调用这些端点。这可能会导致潜在的安全风险，因为一些敏感操作可能被未授权的用户访问。

2. **端点名称冲突**：如果定义的自定义端点与现有的 Actuator 端点或其他自定义端点具有相同的名称，可能会导致命名冲突并覆盖现有的端点。这可能会导致意外行为和混淆。

3. **与 Spring Security 集成挑战**：如果您正在使用 Spring Security 进行身份验证和授权，那么使用 `@Endpoint` 注解定义的端点需要单独进行安全配置，以确保它们受到适当的保护。

4. **限制于 Web 应用**：`@Endpoint` 注解定义的端点主要适用于 Web 应用程序。如果您的应用程序不是基于 Web 的，那么使用 `@Endpoint` 注解可能不是最佳选择。

**注意**：从 Spring Boot 2.0 开始，推荐使用基于 Filter 的方式来创建自定义端点，而不是使用 `@Endpoint` 注解。Filter 实现更好地与 Spring Security 集成，并提供更好的安全性和灵活性。Filter 实现也更适合用于非 Web 应用程序，因此可以更广泛地应用于各种类型的应用。
