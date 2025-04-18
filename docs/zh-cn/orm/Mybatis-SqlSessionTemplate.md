- [SqlSessionTemplate](https://www.cnblogs.com/wjwjs/p/18605227)


`SqlSessionTemplate` 是 MyBatis 提供的一个非常重要的类，通常在 Spring 与 MyBatis 集成时使用。它用于简化 MyBatis 的 `SqlSession` 操作，并提供了线程安全的封装，以便在 Spring 的环境中高效地执行数据库操作。

## 基本概念
1. `SqlSession`：
    - `SqlSession` 是 MyBatis 提供的核心接口，用于执行 SQL 语句、获取映射器（Mapper）、提交事务等。
    - 但是，由于 `SqlSession` 并不是线程安全的，因此 MyBatis 推荐每次数据库操作都创建一个新的 `SqlSession` 实例。

2. SqlSessionTemplate：
    - `SqlSessionTemplate` 是 MyBatis 的一个线程安全的实现，旨在替代直接使用 `SqlSession`。它在 Spring 中管理 `SqlSession` 的生命周期，确保每个线程都能安全地使用数据库连接。
    - `SqlSessionTemplate` 是 Spring 提供的实现，能够将 `SqlSession` 的管理与事务管理、事务隔离等特性与 Spring 框架紧密集成。

## 工作原理
1. `SqlSessionTemplate` 会自动委托 SQL 执行到一个 `SqlSession` 对象上，并且在执行完毕后会自动关闭 `SqlSession`，确保资源释放。
2. 它支持 Spring 的事务管理，可以通过 Spring 的 `@Transactional` 注解来管理事务，确保在多次数据库操作之间的一致性。

## 主要特性
1. 线程安全：
    - `SqlSessionTemplate` 会自动管理每个线程的 `SqlSession`，确保在多线程环境下每个线程使用的 `SqlSession` 都是独立的。
2. 事务管理：
    - 在 Spring 环境下，`SqlSessionTemplate` 与 Spring 的事务管理机制兼容。它可以通过 Spring 的 `@Transactional` 注解来参与事务管理，保证事务的一致性。
3. 自动关闭资源：
    - `SqlSessionTemplate` 会自动关闭 `SqlSession`，避免了手动关闭 `SqlSession` 的麻烦，减少了资源泄漏的风险。
4. 映射器支持：
    - `SqlSessionTemplate` 提供了与 MyBatis 映射器（Mapper）交互的方法，例如 `selectList`、`insert`、`update` 等，它会自动映射并执行相关 SQL 语句。

## 如何使用 SqlSessionTemplate
1. **配置 SqlSessionTemplate：** 在 Spring 配置中，可以通过 `@Bean` 注解来配置 `SqlSessionTemplate`，它需要传入一个 `SqlSessionFactory`。
```java
@Configuration
@MapperScan("com.example.mapper")  // 扫描 Mapper 接口
public class MyBatisConfig {

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sessionFactoryBean = new SqlSessionFactoryBean();
        sessionFactoryBean.setDataSource(dataSource);
        return sessionFactoryBean.getObject();
    }

    @Bean
    public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }
}
```
 

2. **使用 SqlSessionTemplate 进行数据库操作：** 一旦配置了 `SqlSessionTemplate`，可以通过注入它来执行数据库操作。
```java
@Service
public class UserService {

    @Autowired
    private SqlSessionTemplate sqlSessionTemplate;

    public List<User> getAllUsers() {
        // 使用 SqlSessionTemplate 执行 SQL 查询
        return sqlSessionTemplate.selectList("com.example.mapper.UserMapper.selectAllUsers");
    }

    public int addUser(User user) {
        // 使用 SqlSessionTemplate 执行插入操作
        return sqlSessionTemplate.insert("com.example.mapper.UserMapper.insertUser", user);
    }
}
```
 

3. **映射器方法的使用：** 在 MyBatis 中，通常会创建 Mapper 接口来映射 SQL 操作。`SqlSessionTemplate` 通过自动代理和注入实现 Mapper 接口的方法调用。
```java
@Mapper
public interface UserMapper {
    List<User> selectAllUsers();
    int insertUser(User user);
}
```

4. **事务支持：** 如果你的方法需要事务支持，可以结合 Spring 的 `@Transactional` 注解来实现事务管理。

```java
@Service
@Transactional
public class UserService {

    @Autowired
    private SqlSessionTemplate sqlSessionTemplate;

    public void addUser(User user) {
        sqlSessionTemplate.insert("com.example.mapper.UserMapper.insertUser", user);
        // 在这里可以进行其他数据库操作，Spring 会自动管理事务的提交和回滚
    }
}
```

## 优点
1. 简化代码：`SqlSessionTemplate` 自动管理数据库连接和事务，不需要手动开启、提交或关闭 `SqlSession`。
2. 线程安全：避免了多线程环境中 `SqlSession` 不安全的问题，保证每个线程使用不同的 `SqlSession`。
3. 与 Spring 事务兼容：可以直接与 Spring 的事务机制集成，简化事务管理。

## 总结
`SqlSessionTemplate` 是 Spring 与 MyBatis 集成时使用的一个核心组件，封装了 `SqlSession`，使得在 Spring 环境下操作数据库变得更加简单、线程安全，并且能够很好地与 Spring 的事务管理机制集成。
