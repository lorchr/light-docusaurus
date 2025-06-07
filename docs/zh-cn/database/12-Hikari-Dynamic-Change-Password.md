- [HikariDataSource如何动态设置密码](https://zhuanlan.zhihu.com/p/666219586)

## 一、需求背景

在项目中有这样一个需求：Boss要求我们所有的项目需要接入密码服务。但是有这样一个问题，密码服务的密码会不定期的更新，在密码修改时，DBA并不会通知到我，但我这边是有方法可以去调用对方并拿到最新的密码。我需要拿到新的密码去生成新的连接，项目基于SpringBoot+Mybatiss实现，数据源使用的是HikariDataSource。

Ok，废话不多说直接上实现

## 二、定时器方式实现
要实现这个需求，你可以按照以下步骤进行操作：

### 1. 创建一个自定义的数据源类，继承自HikariDataSource，用于动态更新数据库密码。

```java
import com.zaxxer.hikari.HikariDataSource;

public class DynamicDataSource extends HikariDataSource {

    public DynamicDataSource(HikariConfig config) {
        super(config);
    }

    public void updatePassword(String newPassword) {
        setPassword(newPassword);
        // 重新初始化连接池
        this.close();
        this.initialize();
    }
}
```

### 2. 在配置文件中配置初始密码和数据源类型。

```properties
spring.datasource.username=your_username
spring.datasource.password=your_initial_password
spring.datasource.type=com.example.DynamicDataSource
```

### 3. 创建一个类来处理获取最新密码的接口调用。

```java
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PasswordService {

    private RestTemplate restTemplate;

    public PasswordService() {
        this.restTemplate = new RestTemplate();
    }

    public String getLatestPassword() {
        String password = restTemplate.getForObject("http://api.example.com/getPassword", String.class);
        return password;
    }
}
```

### 4. 创建一个定时任务，定时获取最新密码并更新数据源。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PasswordScheduler {

    @Autowired
    private DynamicDataSource dataSource;

    @Autowired
    private PasswordService passwordService;

    @Scheduled(fixedDelay = 60000) // 每隔1分钟执行一次
    public void updatePassword() {
        String newPassword = passwordService.getLatestPassword();
        dataSource.updatePassword(newPassword);
    }
}
```

现在，定时任务会每隔1分钟调用`getLatestPassword`方法获取最新密码，并通过调用`updatePassword`方法来更新数据源的密码。这样，在下次获取数据库连接时，就会使用新的密码来生成连接。

## 三、异常捕获
是的，可以使用异常处理的方式来实现这个需求。以下是一个示例代码：

```java
import com.zaxxer.hikari.HikariDataSource;
 
public class DynamicDataSource extends HikariDataSource {
 
    private String password;
 
    public DynamicDataSource(HikariConfig config) {
        super(config);
    }
 
    @Override
    public Connection getConnection() throws SQLException {
        try {
            return super.getConnection();
        } catch (SQLException e) {
            // 如果密码错误，尝试更新密码并重新获取连接
            if (e.getMessage().contains("Access denied for user")) {
                updatePassword();
                return super.getConnection();
            }
            throw e;
        }
    }
 
    public void setPassword(String password) {
        this.password = password;
    }
 
    private void updatePassword() {
        // 调用获取最新密码的方法，并更新数据源的密码
        String newPassword = passwordService.getLatestPassword();
        setPassword(newPassword);
        // 重新初始化连接池
        this.close();
        this.initialize();
    }
}
```

在上述代码中，我们在 `getConnection` 方法中捕获了 `SQLException` 异常，在异常处理逻辑中判断是否是密码错误导致的异常。如果是密码错误的异常，我们调用 `updatePassword` 方法来获取最新密码并更新数据源，然后重新获取连接。这样，在下次获取数据库连接时，就会使用新的密码来生成连接。

请注意，为了访问 `passwordService`，你需要将 `PasswordService` 声明为一个依赖项，并在 `DynamicDataSource` 类中进行注入。

## 四、连接池动态参数配置
使用连接池的动态参数配置功能可以实现密码的动态更新。以下是一个示例代码，演示如何使用HikariCP连接池的动态参数配置功能：

```java
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
 
public class DynamicDataSource {
 
    private HikariDataSource dataSource;
 
    public void initializeDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydatabase");
        config.setUsername("myuser");
        config.setPassword("mypassword");
 
        dataSource = new HikariDataSource(config);
    }
 
    public void updatePassword(String newPassword) {
        HikariConfig config = dataSource.getHikariConfig();
        config.setPassword(newPassword);
 
        // 关闭数据源
        dataSource.close();
 
        // 使用新的配置重新初始化数据源
        dataSource = new HikariDataSource(config);
    }
 
    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
}
```

在上述代码中，我们首先创建一个 `HikariConfig` 对象，并设置连接池的初始配置，包括数据库连接的 URL、用户名和密码。然后，我们使用这个配置对象来创建 `HikariDataSource` 对象，即数据库连接池。

当密码发生变化时，我们可以通过调用 `getHikariConfig` 方法获取到当前连接池的配置对象。然后，我们可以更新配置对象的密码属性，设置为新的密码。接下来，我们关闭数据源，然后使用新的配置对象重新初始化数据源。这样，连接池就会使用新的密码配置来生成连接。

注意，这种方法只适用于支持动态参数配置的连接池实现。对于其他的连接池实现，可以查看对应的文档，了解如何使用其动态参数配置功能来实现密码的动态更新。

## 五、使用监听器
使用监听器来实现密码的动态更新功能，可以通过监听密码变化事件，然后在事件触发时执行相应的更新逻辑。以下是一个示例代码，演示如何使用监听器实现密码的动态更新：
```java
import java.util.ArrayList;
import java.util.List;
 
public class PasswordChangeListener {
 
    private List<PasswordChangeListener> listeners;
 
    public PasswordChangeListener() {
        listeners = new ArrayList<>();
    }
 
    public void addListener(PasswordChangeListener listener) {
        listeners.add(listener);
    }
 
    public void removeListener(PasswordChangeListener listener) {
        listeners.remove(listener);
    }
 
    public void notifyPasswordChange(String newPassword) {
        for (PasswordChangeListener listener : listeners) {
            listener.onPasswordChange(newPassword);
        }
    }
 
    public void onPasswordChange(String newPassword) {
        // 实现密码更新的逻辑
        // 可以在这里更新数据源的密码配置，并重新初始化连接池
    }
}
```

在上述代码中，我们首先定义了一个 `PasswordChangeListener` 类，用于监听密码变化事件。该类维护了一个监听器列表，用于存储注册的监听器。

当密码发生变化时，我们可以调用 `notifyPasswordChange` 方法，传入新的密码作为参数。然后，该方法会遍历所有注册的监听器，并调用其 `onPasswordChange` 方法，将新的密码传递给监听器。在监听器的 `onPasswordChange` 方法中，可以实现密码更新的逻辑，例如更新数据源的密码配置，并重新初始化连接池。

在应用程序中，我们可以创建一个 `PasswordChangeListener` 对象，并在需要的地方注册监听器。当密码发生变化时，调用 `notifyPasswordChange` 方法即可触发密码变化事件，并执行相应的更新逻辑。

注意，上述代码只是一个示例，实际使用中需要根据具体的技术栈和框架来实现监听器的注册和事件触发逻辑。例如，在使用Spring框架的情况下，可以使用 `ApplicationEvent` 和 `ApplicationListener` 来实现事件监听和触发。

## 六、其他方案
除了定时更新密码和捕获异常更新密码的方案外，还可以考虑其他方案如：

使用分布式配置中心：将密码存储在分布式配置中心（如ZooKeeper、Etcd、Consul等）中，应用程序从配置中心获取密码。当密码发生变化时，可以更新配置中心的密码配置，然后应用程序会自动获取到最新的密码。

## 七、各方案的优劣
### 方案1：定时更新密码

#### 优点：
- 简单直观，容易实现。
- 可以根据需求设置更新密码的时间间隔。

#### 缺点：
- 密码更新可能存在延迟，如果密码在更新之前就过期了，会导致连接失败。
- 密码的更新是定时的，无法实时响应密码的变化。

### 方案2：捕获异常更新密码

#### 优点：
- 可以实时响应密码的变化，一旦密码错误，立即更新密码并重新获取连接。
- 不会存在密码更新延迟的问题。

#### 缺点：
- 对于频繁发生密码错误的情况，可能会有较大的性能开销，因为每次获取连接都要进行密码校验。
- 需要在代码中显式捕获异常并处理，增加了代码的复杂度。

### 方案3：动态参数配置方式：

#### 优点：
- 可以通过代码动态更新密码，实现实时更新密码。

#### 缺点：
- 需要修改代码并重新初始化连接池，可能会影响应用程序的正常运行。

### 方案4：监听器方式：

#### 优点：
- 可以通过代码实现实时更新密码，无需重启应用程序。

#### 缺点：
- 需要注册和管理监听器，需要修改代码，可能会影响应用程序的正常运行。

根据实际需求和情况，选择合适的方案。如果密码的变化不频繁且可以容忍一定的延迟，可以选择定时更新密码的方案。如果密码的变化较为频繁或需要实时响应，可以选择捕获异常更新密码的方案。

## 八、一种根据配置项动态注册Bean的方式

```yaml
spring:
  multi-datasource:
    default-datasource-key: druid_pgsql_master
    datasource:
      - name: druid_pgsql_master
        enable: true
        type: com.alibaba.druid.pool.DruidDataSource
        driver-class-name: org.postgresql.Driver
        url: jdbc:postgresql://localhost:5432/dma?stringtype=unspecified
        username: light
        password: light
        properties:
          initialSize: 6
          minIdle: 8
          maxActive: 10
          connectProperties: config.decrypt=true;config.decrypt.key=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAIw4p2R912r8LJ6zRZJFzlHzssT/nXu33JUoXl6mAAncKXpA36BTwY7GHeW2R3VZC9ZoL5BFBMV7Bhoiwbd/irMCAwEAAQ==
      - name: hikari_pgsql_slave
        enable: true
        type: com.zaxxer.hikari.HikariDataSource
        url: jdbc:postgresql://localhost:5432/dma?stringtype=unspecified
        driverClassName: org.postgresql.Driver
        username: light
        password: light
        properties:
          minimumIdle: 8
          maximumPoolSize: 10
    druid:
      initial-size: 5
      max-active: 10
      min-idle: 10
      max-wait: 10000
      validation-query: SELECT 1
      # 需要密码加密的，需要同时配置解密public key
      connection-properties: config.decrypt=true;config.decrypt.key=MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAIw4p2R912r8LJ6zRZJFzlHzssT/nXu33JUoXl6mAAncKXpA36BTwY7GHeW2R3VZC9ZoL5BFBMV7Bhoiwbd/irMCAwEAAQ==
      filter:
        config:
          enabled: true
      aop-patterns: com.light.cloud.*.service.*
      useGlobalDataSourceStat: true
      filters: config,stat
    hikari:
      minimumIdle: 8
      maximumPoolSize: 10
      idleTimeout: 600000
      maxLifetime: 1800000
      keepaliveTime: 120000
      connectionTimeout: 30000
      connectionTestQuery: SELECT 1
```

```java
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.core.env.Environment;

import java.util.List;

@Deprecated
public class DataSourceBeanFactoryPostProcessor implements BeanFactoryPostProcessor {

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        // 从 Environment 中绑定配置
        Environment env = beanFactory.getBean(Environment.class);
        List<DataSourceProperties> dataSources = Binder.get(env)
                .bind("spring.multi-datasource.datasource", Bindable.listOf(DataSourceProperties.class))
                .orElseThrow(() -> new IllegalStateException("无法绑定数据源配置"));

        // 动态注册每个启用的数据源
        BeanDefinitionRegistry registry = (BeanDefinitionRegistry) beanFactory;
        dataSources.stream()
                .filter(DataSourceProperties::isEnable)
                .forEach(props -> registerDataSource(registry, props));
    }

    private void registerDataSource(BeanDefinitionRegistry registry, DataSourceProperties props) {
        String beanName = props.getName() + "DataSource";
        // 使用 BeanDefinitionBuilder 动态构建 Bean 定义
        BeanDefinitionBuilder builder = BeanDefinitionBuilder
                .genericBeanDefinition(props.getType())
                .addPropertyValue("url", props.getUrl())
                .addPropertyValue("username", props.getUsername())
                .addPropertyValue("password", props.getPassword());

        if (props.getDriverClassName() != null) {
            builder.addPropertyValue("driverClassName", props.getDriverClassName());
        }

        // 注册 Bean 到 Spring 容器
        registry.registerBeanDefinition(beanName, builder.getBeanDefinition());
    }
}

```