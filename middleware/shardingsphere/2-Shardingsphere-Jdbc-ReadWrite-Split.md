- [ShardingSphere第10篇：读写分离+分片](http://www.itsoku.com/article/414)
- [中文社区](https://community.sphere-ex.com/)

读写分离是一种数据库部署架构，将数据库拆分为读库和写库，写库负责处理事务性的增删改操作，读库负责处理查询操作，适用于查询多，写入少的应用系统。读写分离将查询请求均匀的分散到多个从库中，可以提升数据库的吞吐量，可以提高系统的可用性，当宕机一台数据库不影响系统的正常运行。

读写分离的实现基于数据的的主从部署架构，一主多从读写分离部署示例：

| 特性       | 定义                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 分布式事务 | 事务能力，是保障数据库完整、安全的关键技术，也是数据库的核心技术之一。ShardingSphere 提供在单机数据库之上的分布式事务能力，可实现跨底层数据源的数据安全。    |
| 数据分片   | 数据分片，是应对海量数据存储与计算的有效手段。ShardingSphere 提供基于底层数据库之上，可计算与存储水平扩展的分布式数据库解决方案。                            |
| 读写分离   | 读写分离，是应对高压力业务访问的手段之一。ShardingSphere 基于对SQL语义理解及底层数据库拓扑感知能力，提供灵活、安全的读写分离能力，且可实现读访问的负载均衡。 |
| 高可用     | 高可用，是对数据存储计算平台的基本要求。ShardingSphere 基于无状态服务，提供高可用计算服务访问；同时可感知并利用底层数据库自身高可用实现整体的高可用能力。    |
| 数据加密   | 数据加密，是保证数据安全的基本手段。ShardingSphere 提供一套完整的、透明化、安全的、低改造成本的数据加密解决方案。                                            |
| 影子库     | 在全链路压测场景下，ShardingSphere 通过影子库功能支持在复杂压测场景下数据隔离，压测获得测试结果可准确反应系统真实容量和性能水平。                            |

## 5.2.1 之前
5.2.1 是最后一个提供 spring-boot-starter 的版本

- https://www.cnblogs.com/zlnp/p/16666428.html
- https://blog.csdn.net/chen_pan_/article/details/134331050
- https://shardingsphere.apache.org/document/5.2.1/cn/user-manual/shardingsphere-jdbc/spring-boot-starter/

### 1. pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.pisx</groupId>
    <artifactId>mes</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>mes_technical_verification</name>
    <description>mes_technical_verification</description>
    
    <properties>
        <java.version>17</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <spring-boot.version>2.6.15</spring-boot.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.4.1</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.2.20</version>
        </dependency>
        <!-- shardingsphere start-->
        <!-- https://mvnrepository.com/artifact/org.apache.shardingsphere/shardingsphere-jdbc-core-spring-boot-starter -->
        <dependency>
            <groupId>org.apache.shardingsphere</groupId>
            <artifactId>shardingsphere-jdbc-core-spring-boot-starter</artifactId>
            <version>5.2.1</version>
        </dependency>
        <dependency>
            <groupId>org.yaml</groupId>
            <artifactId>snakeyaml</artifactId>
            <version>1.33</version>
        </dependency>
        <dependency>
            <groupId>org.glassfish.jaxb</groupId>
            <artifactId>jaxb-runtime</artifactId>
            <version>2.3.8</version>
        </dependency>
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
        </dependency>
        <!-- shardingsphere end-->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>5.8.24</version>
        </dependency>
        <dependency>
            <groupId>com.github.xiaoymin</groupId>
            <artifactId>knife4j-openapi2-spring-boot-starter</artifactId>
            <version>4.3.0</version>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <version>42.7.0</version>
        </dependency>
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc8</artifactId>
        </dependency>
        <dependency>
            <groupId>com.oracle.database.nls</groupId>
            <artifactId>orai18n</artifactId>
        </dependency>
        <dependency>
            <groupId>com.microsoft.sqlserver</groupId>
            <artifactId>mssql-jdbc</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.mariadb.jdbc</groupId>
            <artifactId>mariadb-java-client</artifactId>
        </dependency>

        <dependency>
            <groupId>com.github.gavlyukovskiy</groupId>
            <artifactId>p6spy-spring-boot-starter</artifactId>
            <version>1.8.1</version>
        </dependency>
        <dependency>
            <groupId>org.reflections</groupId>
            <artifactId>reflections</artifactId>
            <version>0.10.2</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>QLExpress</artifactId>
            <version>3.3.2</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.83</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                    <encoding>UTF-8</encoding>
                    <compilerArgs>
                        <!-- 编译是启用参数配置，否则aop无法获取参数名称 -->
                        <arg>-parameters</arg>
                    </compilerArgs>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
                <configuration>
                    <mainClass>com.pisx.mes.MesTechnicalVerificationApplication</mainClass>
                    <skip>true</skip>
                    <image>
                        <name>example.com/library/${project.artifactId}</name>
                        <!-- 是否推送 -->
                        <publish>false</publish>
                    </image>
                    <docker>
                        <!-- 调用远程 docker 进行打包部署 -->
                        <host>tcp://192.168.99.100:2376</host>
                        <tlsVerify>false</tlsVerify>
                        <certPath>/home/user/.minikube/certs</certPath>
                        <publishRegistry>
                            <username>user</username>
                            <password>secret</password>
                        </publishRegistry>
                    </docker>
                </configuration>
                <executions>
                    <execution>
                        <id>repackage</id>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

    <repositories>
        <repository>
            <id>public</id>
            <url>https://maven.aliyun.com/repository/public</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
        <repository>
            <id>central</id>
            <url>https://maven.aliyun.com/repository/central</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
    </repositories>

    <pluginRepositories>
        <pluginRepository>
            <id>public</id>
            <url>https://maven.aliyun.com/repository/public</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </pluginRepository>
        <pluginRepository>
            <id>central</id>
            <url>https://maven.aliyun.com/repository/central</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </pluginRepository>
    </pluginRepositories>

</project>
```

### 2. application.yml
```yaml
# 服务器启动端口
server:
  port: 8080

# spring 配置
spring:
  # shardingsphere 5.3.0之后的数据源配置
  datasource:
    url: jdbc:shardingsphere:classpath:sharding-config.yml
    driver-class-name: org.apache.shardingsphere.driver.ShardingSphereDriver

decorator:
  datasource:
    p6spy:
      log-format: time：%(executionTime) ms | sql：%(sqlSingleLine)

# 接口文档配置
knife4j:
  enable: true
  setting:
    enable-swagger-models: true
    swagger-model-name: Models

mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

```

### 3. application-sharding.yml
```yaml
# 官方最后一个 spring-boot-starter 版本是5.2.1，后续的版本不再提供 spring-boot-starter
# https://shardingsphere.apache.org/document/5.2.1/cn/user-manual/shardingsphere-jdbc/spring-boot-starter/
spring:
  shardingsphere:
    mode:
      type: Standalone
      repository:
        type: JDBC
    props:
      # 打印执行sql
      sql-show: true
      format: true
    # 数据源配置
    datasource:
      names: master_2,slave_2_1,slave_2_2
      master_2:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: org.postgresql.Driver
        jdbc-url: jdbc:postgresql://192.168.3.49:5433/mes_technical
        username: postgres
        password: postgres
      slave_2_1:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: org.postgresql.Driver
        jdbc-url: jdbc:postgresql://192.168.3.49:5434/mes_technical
        username: postgres
        password: postgres
      slave_2_2:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: org.postgresql.Driver
        jdbc-url: jdbc:postgresql://192.168.3.34:5432/mes_technical
        username: postgres
        password: postgres
    rules:
      # 读写分离配置
      readwrite-splitting:
        data-sources:
          master2:
            static-strategy:
              write-data-source-name: master_2
              read-data-source-names: slave_2_1,slave_2_2
            load-balancer-name: round_robin
        load-balancers:
          round_robin:
            type: ROUND_ROBIN

```

### 4. 配置类
- springboot 2.x 的约定配置是 META-INF 下面的的 `spring.factories` 文件中

- springboot 3.x 的约定配置是 META-INF 下面的 spring 文件夹下的 `org.springframework.boot.autoconfigure.AutoConfiguration.imports` 文件中

5.2.1的自动装配逻辑是 spring-boot 2.x 的 `META-INF/spring.factories` 配置，如果是 spring-boot 3.x 需要手动引入自动配置类，在任意的配置类或者启动类上添加
`@Import(value = {ShardingSphereAutoConfiguration.class})` 即可

```java
import org.apache.shardingsphere.spring.boot.ShardingSphereAutoConfiguration;

@Configuration
@Import(value = {ShardingSphereAutoConfiguration.class})
public void ShardingSphereConfig {

}
```

## 5.3.0 以后
ShardingSphere在5.3.0及之后的版本，考虑到维护兼容成本，更加专心于自身功能迭代，移除了Spring Boot Starter，所以只能引入 ShardingSphere-JDBC核心包：

ShardingSphere-JDBC在5.3.0及之后的版本不再提供Spring Boot Starter，所以配置方面有较大的变化，目前只支持Java API和YAML 进行配置。

ShardingSphere 提供了 JDBC 驱动，首先需要在application.yml中配置ShardingSphereDriver 。

- https://www.xdnf.cn/news/1048509.html
- https://gitee.com/pearl-organization/study-sharding-sphere-demo
- https://zhuanlan.zhihu.com/p/650311232
- https://blog.csdn.net/chenming3030/article/details/125090721
- https://blog.csdn.net/hahe2010/article/details/123856481
- https://zhuanlan.zhihu.com/p/667889974
- https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/
- https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/rules/single/
- [SpringBoot集成ShardingJDBC-基于JPA的DB隔离多租户方案](https://java.isture.com/dependencies/shardingsphere/sharding-jdbc-x-tenant.html)

### 1. pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.pisx</groupId>
    <artifactId>mes</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>mes_technical_verification</name>
    <description>mes_technical_verification</description>
    <properties>
        <java.version>17</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <spring-boot.version>2.6.15</spring-boot.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>com.taobao.arthas</groupId>
            <artifactId>arthas-spring-boot-starter</artifactId>
            <version>3.6.7</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-configuration-processor</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.5.4.1</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid-spring-boot-starter</artifactId>
            <version>1.2.20</version>
        </dependency>
        <!-- shardingsphere start-->
        <!-- https://mvnrepository.com/artifact/org.apache.shardingsphere/shardingsphere-jdbc-core -->
        <dependency>
            <groupId>org.apache.shardingsphere</groupId>
            <artifactId>shardingsphere-jdbc-core</artifactId>
            <version>5.4.1</version>
        </dependency>
        <dependency>
            <groupId>org.yaml</groupId>
            <artifactId>snakeyaml</artifactId>
            <version>1.33</version>
        </dependency>
        <dependency>
            <groupId>org.glassfish.jaxb</groupId>
            <artifactId>jaxb-runtime</artifactId>
            <version>2.3.8</version>
        </dependency>
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
        </dependency>
         <!-- shardingsphere end-->
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>5.8.24</version>
        </dependency>
        <dependency>
            <groupId>com.github.xiaoymin</groupId>
            <artifactId>knife4j-openapi2-spring-boot-starter</artifactId>
            <version>4.3.0</version>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <version>42.7.0</version>
        </dependency>
        <dependency>
            <groupId>com.oracle.database.jdbc</groupId>
            <artifactId>ojdbc8</artifactId>
        </dependency>
        <dependency>
            <groupId>com.oracle.database.nls</groupId>
            <artifactId>orai18n</artifactId>
        </dependency>
        <dependency>
            <groupId>com.microsoft.sqlserver</groupId>
            <artifactId>mssql-jdbc</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.mariadb.jdbc</groupId>
            <artifactId>mariadb-java-client</artifactId>
        </dependency>

        <dependency>
            <groupId>com.github.gavlyukovskiy</groupId>
            <artifactId>p6spy-spring-boot-starter</artifactId>
            <version>1.8.1</version>
        </dependency>
        <dependency>
            <groupId>org.reflections</groupId>
            <artifactId>reflections</artifactId>
            <version>0.10.2</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>QLExpress</artifactId>
            <version>3.3.2</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.83</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                    <encoding>UTF-8</encoding>
                    <compilerArgs>
                        <!-- 编译是启用参数配置，否则aop无法获取参数名称 -->
                        <arg>-parameters</arg>
                    </compilerArgs>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <version>${spring-boot.version}</version>
                <configuration>
                    <mainClass>com.pisx.mes.MesTechnicalVerificationApplication</mainClass>
                    <skip>true</skip>
                    <image>
                        <name>example.com/library/${project.artifactId}</name>
                        <!-- 是否推送 -->
                        <publish>false</publish>
                    </image>
                    <docker>
                        <!-- 调用远程 docker 进行打包部署 -->
                        <host>tcp://192.168.99.100:2376</host>
                        <tlsVerify>false</tlsVerify>
                        <certPath>/home/user/.minikube/certs</certPath>
                        <publishRegistry>
                            <username>user</username>
                            <password>secret</password>
                        </publishRegistry>
                    </docker>
                </configuration>
                <executions>
                    <execution>
                        <id>repackage</id>
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

    <repositories>
        <repository>
            <id>public</id>
            <url>https://maven.aliyun.com/repository/public</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
        <repository>
            <id>central</id>
            <url>https://maven.aliyun.com/repository/central</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
    </repositories>

    <pluginRepositories>
        <pluginRepository>
            <id>public</id>
            <url>https://maven.aliyun.com/repository/public</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </pluginRepository>
        <pluginRepository>
            <id>central</id>
            <url>https://maven.aliyun.com/repository/central</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </pluginRepository>
    </pluginRepositories>

</project>
```

### 2. application.yml
```yaml
# 服务器启动端口
server:
  port: 8080

# spring 配置
spring:
  # shardingsphere 5.3.0之后的数据源配置
  datasource:
    url: jdbc:shardingsphere:classpath:sharding-config.yml
    driver-class-name: org.apache.shardingsphere.driver.ShardingSphereDriver

decorator:
  datasource:
    p6spy:
      log-format: time：%(executionTime) ms | sql：%(sqlSingleLine)

# 接口文档配置
knife4j:
  enable: true
  setting:
    enable-swagger-models: true
    swagger-model-name: Models

mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

```

### 3. sharding-config.yml
```yaml
# 5.3.0 之后官方不再提供 spring-boot-starter， 只支持 Java API 和 YAML 配置方式
# https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/
# https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/rules/single/
mode:
  type: Standalone
  repository:
    type: JDBC

# 数据源配置
dataSources:
  master_2:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: org.postgresql.Driver
    jdbcUrl: jdbc:postgresql://192.168.3.49:5433/mes_technical
    username: postgres
    password: postgres
  slave_2_1:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: org.postgresql.Driver
    jdbcUrl: jdbc:postgresql://192.168.3.49:5434/mes_technical
    username: postgres
    password: postgres
  slave_2_2:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: org.postgresql.Driver
    jdbcUrl: jdbc:postgresql://192.168.3.34:5432/mes_technical
    username: postgres
    password: postgres

rules:
  # 读写分离配置
  - !READWRITE_SPLITTING
    dataSources:
      readwrite_ds:
        writeDataSourceName: master_2
        readDataSourceNames:
          - slave_2_1
          - slave_2_2
        # 事务内读请求的路由策略，可选值：PRIMARY（路由至主库）、FIXED（同一事务内路由至固定数据源）、DYNAMIC（同一事务内路由至非固定数据源）。默认值：DYNAMIC
        transactionalReadQueryStrategy: PRIMARY
        # 负载均衡自定义算法名称
        loadBalancerName: round_robin
    loadBalancers:
      # 负载均衡自定义算法名称对应的类型配置
      round_robin:
        type: ROUND_ROBIN
  # 单表规则用于指定哪些单表需要被 ShardingSphere 管理，也可设置默认的单表数据源
  - !SINGLE
    tables:
      # MySQL 风格
      # - ds_0.t_single # 加载指定单表
      # - ds_1.*        # 加载指定数据源中的全部单表
      # - "*.*"         # 加载全部单表
      # PostgreSQL 风格
      # ds_1.public.t_single  # 加载指定单表
      # ds_2.public.*         # 加载指定schema中的全部单表
      # ds_3.*.*              # 加载所有schema下的所有表
      - "*.*.*"               # 加载全部单表
    # 默认数据源，仅在执行 CREATE TABLE 创建单表时有效。缺失值为空，表示随机单播路由。
    defaultDataSource: master_2

props:
  # 是否打印 SQL
  sql-show: true

```

新版本偶现 `TableNotExistsException: Table or view MY_TABLE does not exist`
- https://github.com/apache/shardingsphere/issues/28848
- https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/rules/single/

## 多租户版本 使用 shardingsphere-jdbc 5.4.1
### 1. sharding-config.yml

```yaml
# 5.3.0 之后官方不再提供 spring-boot-starter， 只支持 Java API 和 YAML 配置方式
# https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/
# https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/rules/single/
mode:
  type: Standalone
  repository:
    type: JDBC

# 数据源配置
# https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/data-source/
dataSources:
  master_1:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: org.postgresql.Driver
    jdbcUrl: jdbc:postgresql://192.168.3.49:5433/mes_test
    username: postgres
    password: postgres
  slave_1_1:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: org.postgresql.Driver
    jdbcUrl: jdbc:postgresql://192.168.3.49:5434/mes_test
    username: postgres
    password: postgres
  slave_1_2:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: org.postgresql.Driver
    jdbcUrl: jdbc:postgresql://192.168.3.34:5432/mes_test
    username: postgres
    password: postgres
  master_2:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: org.postgresql.Driver
    jdbcUrl: jdbc:postgresql://192.168.3.49:5433/mes_technical
    username: postgres
    password: postgres
  slave_2_1:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: org.postgresql.Driver
    jdbcUrl: jdbc:postgresql://192.168.3.49:5434/mes_technical
    username: postgres
    password: postgres
  slave_2_2:
    dataSourceClassName: com.zaxxer.hikari.HikariDataSource
    driverClassName: org.postgresql.Driver
    jdbcUrl: jdbc:postgresql://192.168.3.34:5432/mes_technical
    username: postgres
    password: postgres

rules:
  # 读写分离配置
  # https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/rules/readwrite-splitting/
  - !READWRITE_SPLITTING
    dataSources:
      readwrite_1:
        writeDataSourceName: master_1
        readDataSourceNames:
          - slave_1_1
          - slave_1_2
        # 事务内读请求的路由策略，可选值：PRIMARY（路由至主库）、FIXED（同一事务内路由至固定数据源）、DYNAMIC（同一事务内路由至非固定数据源）。默认值：DYNAMIC
        transactionalReadQueryStrategy: PRIMARY
        # 负载均衡自定义算法名称
        loadBalancerName: random
      readwrite_2:
        writeDataSourceName: master_2
        readDataSourceNames:
          - slave_2_1
          - slave_2_2
        # 事务内读请求的路由策略，可选值：PRIMARY（路由至主库）、FIXED（同一事务内路由至固定数据源）、DYNAMIC（同一事务内路由至非固定数据源）。默认值：DYNAMIC
        transactionalReadQueryStrategy: PRIMARY
        # 负载均衡自定义算法名称
        loadBalancerName: round_robin
    loadBalancers:
      # 负载均衡自定义算法名称对应的类型配置
      round_robin:
        type: ROUND_ROBIN
      random:
        type: RANDOM
  # 单表规则用于指定哪些单表需要被 ShardingSphere 管理，也可设置默认的单表数据源
  # https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/rules/single/
  - !SINGLE
    tables:
      # MySQL 风格
      # - ds_0.t_single # 加载指定单表
      # - ds_1.*        # 加载指定数据源中的全部单表
      # - "*.*"         # 加载全部单表
      # PostgreSQL 风格
      # ds_1.public.t_single  # 加载指定单表
      # ds_2.public.*         # 加载指定schema中的全部单表
      # ds_3.*.*              # 加载所有schema下的所有表
      - "*.*.*"               # 加载全部单表
    # 默认数据源，仅在执行 CREATE TABLE 创建单表时有效。缺失值为空，表示随机单播路由。
    # defaultDataSource: master_2
  # 数据分片配置
  # https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/yaml-config/rules/sharding/
  - !SHARDING
    tables:
      pi_object_definition:
        actualDataNodes: readwrite_${1..2}.pi_object_definition
        # 分库策略，不配置使用默认的 defaultDatabaseStrategy
        # databaseStrategy:
        #   hint:
        #     shardingAlgorithmName: tenant
        # 分表策略，不配置使用默认的 defaultTableStrategy
        # tableStrategy:
        #   hint:
        #     shardingAlgorithmName: tenant
    defaultDatabaseStrategy:
      hint:
        shardingAlgorithmName: tenant
#    defaultTableStrategy:
#      none:
    shardingAlgorithms:
      tenant:
        type: CLASS_BASED
        props:
          strategy: HINT
          algorithmClassName: com.pisx.mes.sharding.CustomHintShardingAlgorithm

props:
  # 是否打印 SQL
  sql-show: true
```

### 2. 自定义分片算法

```java
import org.apache.commons.collections4.CollectionUtils;
import org.apache.shardingsphere.sharding.algorithm.sharding.classbased.ClassBasedShardingAlgorithmStrategyType;
import org.apache.shardingsphere.sharding.api.sharding.hint.HintShardingAlgorithm;
import org.apache.shardingsphere.sharding.api.sharding.hint.HintShardingValue;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;

/**
 * 处理多租户之间的数据源切换
 */
@Component
public class CustomHintShardingAlgorithm implements HintShardingAlgorithm<String> {

    // 构建演示用租户与数据源关系配置
    private static Map<String, List<String>> tenantDsMap = new HashMap<>();

    static {
        tenantDsMap.put("default", List.of("readwrite_1"));
        tenantDsMap.put("others", List.of("readwrite_2"));
    }

    @Override
    public Collection<String> doSharding(Collection<String> collection, HintShardingValue<String> hintShardingValue) {
        List<String> result = new ArrayList<>();
        // 从请求头获取租户信息
        ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (Objects.nonNull(requestAttributes)) {
            HttpServletRequest request = requestAttributes.getRequest();
            String tenantCode = request.getHeader("tenantCode");
            result = tenantDsMap.get(tenantCode);
        }
        // 获取失败的处理逻辑
        if (CollectionUtils.isEmpty(result)) {
            result = tenantDsMap.get("default");
        }
        return result;
    }

    @Override
    public void init(Properties props) {
        HintShardingAlgorithm.super.init(props);
    }

    @Override
    public String getType() {
        return ClassBasedShardingAlgorithmStrategyType.HINT.name();
    }
}

```

### 3. 坑点！！！
#### 1. 数据源配置

每个数据源都要单独配置一次，有多少个就要配置多少次
```yaml
master_1:
  dataSourceClassName: com.zaxxer.hikari.HikariDataSource
  driverClassName: org.postgresql.Driver
  jdbcUrl: jdbc:postgresql://192.168.3.49:5433/mes_test
  username: postgres
  password: postgres
```

#### 2. 读写分离和数据分片 (分库分表)一起使用时数据源的配置问题

- [ShardingJdbc5.0.0 hint分片策略配置简化+如何继续集成读写分离](https://community.sphere-ex.com/t/topic/417)
- [Hint question shardingjdbc 5.4.1](https://github.com/apache/shardingsphere/issues/29780)

需要先将各数据源按照主从配置读写分离，组成一个虚拟的数据源，在数据分片中使用这个虚拟数据源作为目标数据源
```yaml
# ...
readwrite_1:
  writeDataSourceName: master_1
  readDataSourceNames:
    - slave_1_1
    - slave_1_2
readwrite_2:
  writeDataSourceName: master_2
  readDataSourceNames:
    - slave_2_1
    - slave_2_2
# ...
```

#### 3. 数据分片数据表配置

每个数据表都要配置一次数据源，有100张表需要配置100次
```yaml
# 数据表
pi_object_definition:
  # 【MUST】数据源使用读写分离聚合出来的虚拟数据源 
  actualDataNodes: readwrite_${1..2}.pi_object_definition
  # 【OPTIONAL】数据库分库策略，不配置默认使用 defaultDatabaseStrategy
  databaseStrategy:
    hint:
      shardingAlgorithmName: tenant
  # 【OPTIONAL】数据表分表策略，不配置默认使用 defaultTableStrategy
  tableStrategy:
    hint:
      shardingAlgorithmName: tenant
```

#### 4. 自定义HINT分片算法

- [强制路由](https://shardingsphere.apache.org/document/5.4.1/cn/user-manual/shardingsphere-jdbc/special-api/sharding/hint/)

使用自定义的HINT分片算法时，需要手动调用 `HintManager`，否则分片算法不会被调用，也就是说所有sql前都要调用，否则不会执行分片策略

```yaml
shardingAlgorithms:
  tenant:
    type: CLASS_BASED
    props:
      strategy: HINT
      algorithmClassName: com.pisx.mes.sharding.CustomHintShardingAlgorithm
```

调用示例
```java
public void hint() {
    try (HintManager hintManager = HintManager.getInstance()) {
        // 参数将被传递到 CustomHintShardingAlgorithm#doSharding() 的 hintShardingValue 参数上
        hintManager.setDatabaseShardingValue("a,b,c");
        callTargetMethod();
    }
}
```
