- [springdoc-openapi demo](https://github.com/ahuadoreen/studentmanager)
- [springdoc-openapi github](https://github.com/springdoc/springdoc-openapi)
- [springdoc-openapi 官方文档](https://springdoc.org/)
- [Spring Boot 整合 springdoc-openapi](https://blog.csdn.net/wangzhihao1994/article/details/108408595)
- [Swagger3 注解使用（Open API 3）](https://blog.csdn.net/qq_35425070/article/details/105347336)

## 简单集成
### 1. 添加依赖项

```xml
<!-- Springdoc 2.x -->
<!--<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-spring-boot-starter</artifactId>
</dependency>-->

<!-- Springdoc 3.x -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
</dependency>
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
</dependency>
<!--<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-spring-boot-starter</artifactId>
</dependency>-->

```

### 2. 添加配置

```yaml
light:
  cloud:
    # Swagger 文档配置
    openapi:
      enable: true
      profiles: dev,test,nat
      base-group: Light Cloud
      scan-group: Demo Service
      scan-packages: com.light.cloud.service.demo.controller
      description: Light Cloud Restful APIs
      version: 1.0.0
      license-name: Apache License 2.0
      license-url: https://www.apache.org/licenses/LICENSE-2.0
      contact-name: Light Cloud
      contact-email: whitetulips@163.com
      contact-url: https://gitee.com/lorchr/spring-cloud-samples
      terms-of-service-url: https://gitee.com/lorchr/spring-cloud-samples
      internals:
        tencent-sdk:
          group-name: Tencent SDK
          location: com.light.cloud.sdk.tencent.wechat.controller;com.light.cloud.sdk.tencent.wecom.controller
        alibaba-sdk:
          group-name: Alibaba SDK
          location: com.light.cloud.sdk.alibaba.dingtalk.controller
      # Note: 外部接口这部分已经废弃 
      externals:
        classpath-doc:
          group-name: Classpath Doc
          schema: classpath
          location: classpath:openapi.json
        local-doc:
          group-name: Local Doc
          schema: file
          location: D:/openapi.json.txt
        http-doc:
          group-name: HTTP Doc
          schema: http
          uri: localhost:8080
          location: /v3/api-docs
```

### 3. OpenapiProperties 属性定义

```java
package com.light.cloud.common.web.openapi.properties;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

import com.light.cloud.common.core.constant.PlatformConstant;
import lombok.Data;

/**
 * Swagger属性配置
 *
 * @author Hui Liu
 * @date 2022/8/5
 */
@Data
@ConfigurationProperties(prefix = OpenapiProperties.OPENAPI_PREFIX)
public class OpenapiProperties {

    public static final String OPENAPI_PREFIX = "light.cloud.openapi";
    public static final String OPENAPI_ENABLE = "enable";
    public static final String OPENAPI_SCAN_PACKAGES = "light.cloud.openapi.scan-packages";

    private Boolean enable = true;

    private String profiles = "dev,test,nat";

    /**
     * Web模块的名称
     */
    private String baseGroup = PlatformConstant.PLATFORM_NAME;

    /**
     * 扫描的业务服务名称
     */
    private String scanGroup;

    /**
     * 扫描的业务服务包路径 多个异",“分隔
     */
    private String scanPackages;

    /**
     * 服务描述信息
     */
    private String description = "Light Cloud Restful APIs";
    /**
     * 服务版本
     */
    private String version = PlatformConstant.PLATFORM_VERSION;

    /**
     * 证书许可名称
     */
    private String licenseName = "Apache License 2.0";

    /**
     * 证书许可URL
     */
    private String licenseUrl = "https://www.apache.org/licenses/LICENSE-2.0";

    /**
     * 联系人
     */
    private String contactName = PlatformConstant.PLATFORM_NAME;

    /**
     * 联系人URL
     */
    private String contactUrl = "https://gitee.com/lorchr/spring-cloud-samples";

    /**
     * 联系人邮箱地址
     */
    private String contactEmail = "whitetulips@163.com";

    /**
     * 服务条款URL
     */
    private String termsOfServiceUrl = "https://gitee.com/lorchr/spring-cloud-samples";

    /**
     * 依赖的其他公共模块 <p>
     * group-name: 接口文档分组名称 <p>
     * location: 接口文档的包路径 <p>
     */
    private Map<String, RouteDefinition> internals = new HashMap<>(4);

    /**
     * @deprecated 此方式只能实现接口的展示，不能跨服务调用，使用 knife4j aggregation 代替
     * 引用外部的api文件解析生成文档 <p>
     * group-name: 接口文档分组名称 <p>
     * location: 接口文档的包路径 <p>
     *
     * openapi文档地址支持多种格式
     * <ul>
     *     <li>Windows本地文件: file:///D:/openapi.json.txt</li>
     *     <li>Linux本地文件: file://var/lib/openapi.json</li>
     *     <li>Classpath文件: classpath:openapi.json</li>
     *     <li>Http资源文件: http://localhost:8080/v3/api-docs</li>
     *     <li>...</li>
     * </ul>
     */
    private Map<String, RouteDefinition> externals = new HashMap<>(4);

}

```

### 4. RouteDefinition 路由定义

```java
package com.light.cloud.common.web.openapi.properties;

import lombok.Data;

@Data
public class RouteDefinition {

    /**
     * 接口文档分组名称 <p>
     * 认证服务
     */
    private String groupName;

    /**
     * 文档读取协议 http https ftp file ...  <p>
     * http
     */
    private String schema;

    /**
     * 文档读取地址 <p>
     * localhost:8080
     */
    private String uri;

    /**
     * 文档读取位置 <p>
     * /auth/v3/api-docs <p>
     * com.light.cloud.sdk
     */
    private String location;

    /**
     * 服务器地址 <p>
     * http://localhost:8080
     */
    private String serverUrl;

}

```

### 5. OpenapiConfig 配置类

```java
package com.light.cloud.common.web.openapi.config;

import java.util.List;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.google.common.collect.Lists;
import com.light.cloud.common.core.constant.PlatformConstant;
import com.light.cloud.common.web.openapi.processor.OpenapiAdditionalBeanRegistry;
import com.light.cloud.common.web.openapi.properties.OpenapiProperties;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import jakarta.annotation.Resource;

/**
 * Openapi配置类
 *
 * @author Hui Liu
 * @date 2022/7/29
 */
@Configuration
@EnableConfigurationProperties(value = {OpenapiProperties.class})
public class OpenapiConfig {

    @Value("${" + PlatformConstant.SPRING_APPLICATION_NAME + ":'Light Cloud'}")
    private String serviceName;

    @Resource
    private OpenapiProperties openapiProperties;

    @Bean
    public OpenAPI openAPI() {
        // 添加 components 后可以重复引用
        Components components = new Components()
                .addParameters(PlatformConstant.HEADER_CLIENT_ID, clientId())
                .addParameters(PlatformConstant.HEADER_AUTHORIZATION, authorization());
        return new OpenAPI()
                .info(
                        new Info().title(serviceName)
                                .description(openapiProperties.getDescription())
                                .version(openapiProperties.getVersion())
                                .license(new License()
                                        .name(openapiProperties.getLicenseName())
                                        .url(openapiProperties.getLicenseUrl()))
                                .contact(new Contact()
                                        .name(openapiProperties.getContactName())
                                        .email(openapiProperties.getContactEmail())
                                        .url(openapiProperties.getContactUrl()))
                                .termsOfService(openapiProperties.getTermsOfServiceUrl())
                )
                //外部文档
                .externalDocs(new ExternalDocumentation()
                        .description("官方文档").url("https://springdoc.org")
                )
                // webhooks
//                .webhooks(new HashMap<>())
                // 全局统一安全认证配置 一个key对应一个schema（安全配置），
                // 对接口添加 @SecurityRequirement 可使用不同的安全规则
                .schemaRequirement(PlatformConstant.HEADER_AUTHORIZATION, apikeySecuritySchema())
//                .schemaRequirement(PlatformConstant.HEADER_CLIENT_ID, apikeySecuritySchema())
//                .schemaRequirement(HttpHeaders.AUTHORIZATION, oauth2SecuritySchema())
                // 全局安全校验项，也可以在对应的controller上加注解SecurityRequirement
                .addSecurityItem(new SecurityRequirement().addList(PlatformConstant.HEADER_AUTHORIZATION))
                // 组件定义
                .components(components);
    }

    /**
     * 动态注册Swagger文档配置
     */
    @Bean
    public OpenapiAdditionalBeanRegistry openapiAdditionalBeanRegistry() {
        return new OpenapiAdditionalBeanRegistry();
    }


    // region 统一认证配置

    /**
     * Access Token Header接口级授权 <p>
     * https://github.com/springfox/springfox/issues/3477  <p>
     * Note: 使用List注入时无法接收服务内定义的参数，单独注入可以避免这个问题
     */
    @Bean
    public Parameter authorization() {
        Parameter authorization = new Parameter()
                // 参数名
                .name(PlatformConstant.HEADER_AUTHORIZATION)
                // 参数配置
                // 参数描述信息
                .description("认证的 Token。当全局授权（Authorize）后，此处不必填写")
                // 参数类型 QUERY HEADER COOKIE PATH FORM BODY
                .in(ParameterIn.HEADER.toString())
                // 参数数据类型定义
                .schema(new StringSchema())
                // 是否必填
                .required(false);
        return authorization;
    }

    @Bean
    public Parameter clientId() {
        Parameter clientId = new Parameter()
                // 参数名
                .name(PlatformConstant.HEADER_CLIENT_ID)
                // 参数配置
                // 参数描述信息
                .description("ClientId 系统的名称")
                // 参数类型 QUERY HEADER COOKIE PATH FORM BODY
                .in(ParameterIn.HEADER.toString())
                // 参数数据类型定义
                .schema(new StringSchema())
                // 是否必填
                .required(false);
        return clientId;
    }

    /**
     * Access Token Header接口级授权
     * <p>
     * https://github.com/springfox/springfox/issues/3477
     */
    public List<Parameter> openapiParameters() {
        Parameter accessToken = new Parameter()
                // 参数名
                .name(PlatformConstant.HEADER_AUTHORIZATION)
                // 参数配置
                // 参数描述信息
                .description("认证的 Token。当全局授权（Authorize）后，此处不必填写")
                // 参数类型 QUERY HEADER COOKIE PATH FORM BODY
                .in(ParameterIn.HEADER.toString())
                // 是否必填
                .required(false);
        Parameter systemName = new Parameter()
                // 参数名
                .name(PlatformConstant.HEADER_CLIENT_ID)
                // 参数配置
                // 参数描述信息
                .description("ClientId 系统的名称")
                // 参数类型 QUERY HEADER COOKIE PATH FORM BODY
                .in(ParameterIn.HEADER.toString())
                // 是否必填
                .required(false);
        return Lists.newArrayList(accessToken, systemName);
    }

    /**
     * apikey认证
     */
    public SecurityScheme apikeySecuritySchema() {
        return new SecurityScheme()
                // token类型
                .type(SecurityScheme.Type.APIKEY)
                // token名称
                .name(PlatformConstant.HEADER_AUTHORIZATION)
                // token位置
                .in(SecurityScheme.In.HEADER);
    }

    /**
     * http认证
     */
    public SecurityScheme httpSecuritySchema() {
        return new SecurityScheme()
                // token类型
                .type(SecurityScheme.Type.HTTP)
                // token名称
                .name(PlatformConstant.HEADER_AUTHORIZATION)
                // token位置
                .in(SecurityScheme.In.HEADER);
    }

    /**
     * oauth认证
     */
    public SecurityScheme oauth2SecuritySchema() {
        return new SecurityScheme()
                // token类型
                .type(SecurityScheme.Type.OAUTH2)
                .name("OAuth2认证")
                .description("OAuth2认证")
                .flows(new OAuthFlows()
//                        .implicit()
//                        .clientCredentials()
                        .password(new OAuthFlow()
                                .authorizationUrl("/oauth2/authorize")
                                .tokenUrl("/oauth2/token")
                                .refreshUrl("/oauth2/refreshToken")
                                .scopes(scopes()))
                        .authorizationCode(new OAuthFlow()
                                .authorizationUrl("/oauth2/authorize")
                                .tokenUrl("/oauth2/token")
                                .refreshUrl("/oauth2/refreshToken")
                                .scopes(scopes())));
    }

    private Scopes scopes() {
        return new Scopes()
                .addString("global", "accessAnything");
    }

    // endregion

}

```

### 6. SpringDocConfig 配置类

```java
package com.light.cloud.common.web.openapi.config;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.light.cloud.common.core.constant.PlatformConstant;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.customizers.GlobalOpenApiCustomizer;
import org.springdoc.core.customizers.GlobalOperationCustomizer;
import org.springdoc.core.models.GroupedOpenApi;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.CorsEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.web.server.ManagementPortType;
import org.springframework.boot.actuate.endpoint.ExposableEndpoint;
import org.springframework.boot.actuate.endpoint.web.EndpointLinksResolver;
import org.springframework.boot.actuate.endpoint.web.EndpointMapping;
import org.springframework.boot.actuate.endpoint.web.EndpointMediaTypes;
import org.springframework.boot.actuate.endpoint.web.ExposableWebEndpoint;
import org.springframework.boot.actuate.endpoint.web.WebEndpointsSupplier;
import org.springframework.boot.actuate.endpoint.web.annotation.ControllerEndpointsSupplier;
import org.springframework.boot.actuate.endpoint.web.annotation.ServletEndpointsSupplier;
import org.springframework.boot.actuate.endpoint.web.servlet.WebMvcEndpointHandlerMapping;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.web.method.HandlerMethod;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TreeTraversingParser;
import com.fasterxml.jackson.databind.type.MapType;
import com.light.cloud.common.core.constant.BaseConstant;
import com.light.cloud.common.core.enums.ResponseEnum;
import com.light.cloud.common.core.tool.StringTool;
import com.light.cloud.common.web.openapi.properties.OpenapiProperties;
import com.light.cloud.common.web.openapi.properties.RouteDefinition;

import io.swagger.v3.core.util.Json;
import io.swagger.v3.core.util.Yaml;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.Paths;
import io.swagger.v3.oas.models.servers.Server;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;

/**
 * SpringDoc配置类
 *
 * @author Hui Liu
 * @date 2022/7/29
 */
@Slf4j
@Configuration
public class SpringDocConfig {

    @Value(("${server.servlet.context-path:}"))
    private String contextPath;

    public static final String BASE_PACKAGE = "com.light.cloud.common.web.endpoints";

    @Resource
    private Environment environment;

    @Resource
    private OpenapiProperties openapiProperties;

    @Resource
    private List<Parameter> openapiParameters;

    private CustomOperationCustomizer customOperationCustomizer = new CustomOperationCustomizer();

    private CustomOpenApiCustomizer customOpenApiCustomizer = new CustomOpenApiCustomizer();

    /**
     * 添加分组
     *
     * @return
     */
    @Bean("platformApi")
    public GroupedOpenApi platformApi() {
        boolean isOpen = true;
        String profileStr = openapiProperties.getProfiles();
        if (StringUtils.isNotBlank(profileStr)) {
            List<String> profileList = Arrays.stream(profileStr.split(BaseConstant.COMMA))
                    .map(String::trim).collect(Collectors.toList());
            Profiles profiles = Profiles.of(profileList.toArray(new String[0]));
            isOpen = environment.acceptsProfiles(profiles);
        }
        return GroupedOpenApi.builder()
                .group(openapiProperties.getBaseGroup())
                // 扫描该包下的所有需要在Swagger中展示的API，@Hidden 注解标注的除外
                .packagesToScan(BASE_PACKAGE)
                // 添加全局参数
                .addOperationCustomizer(customOperationCustomizer)
                // 添加统一的上下文地址 contextPath
//                .addOpenApiCustomizer(customOpenApiCustomizer)
                .build();
    }

    @Bean("serviceApi")
    public GroupedOpenApi serviceApi() {
        boolean isOpen = true;
        String profileStr = openapiProperties.getProfiles();
        if (StringUtils.isNotBlank(profileStr)) {
            List<String> profileList = Arrays.stream(profileStr.split(BaseConstant.COMMA))
                    .map(String::trim).collect(Collectors.toList());
            Profiles profiles = Profiles.of(profileList.toArray(new String[0]));
            isOpen = environment.acceptsProfiles(profiles);
        }
        return GroupedOpenApi.builder()
                .group(openapiProperties.getScanGroup())
                // 扫描该包下的所有需要在Swagger中展示的API， @Hidden 注解标注的除外
                .packagesToScan(openapiProperties.getScanPackages())
                // 添加全局参数
                .addOperationCustomizer(customOperationCustomizer)
                // 添加统一的上下文地址 contextPath
//                .addOpenApiCustomizer(customOpenApiCustomizer)
                .build();
    }

    // region 动态注册Swagger文档配置
//    /**
//     * 动态注册Swagger文档配置
//     */
//    @Bean
//    public OpenapiAdditionalBeanRegistry openapiAdditionalBeanRegistry() {
//        return new OpenapiAdditionalBeanRegistry();
//    }

    /**
     * 注册项目模块内部的接口文档
     */
    public void registerInternalOpenApis(ConfigurableListableBeanFactory beanFactory) {
        Map<String, GroupedOpenApi> openApis = internalOpenApis();
        for (Map.Entry<String, GroupedOpenApi> entry : openApis.entrySet()) {
            String docName = entry.getKey();
            GroupedOpenApi openApi = entry.getValue();
            beanFactory.registerSingleton(docName + "InternalApi", openApi);
        }
    }

    /**
     * 注册项目模块外部的接口文档
     *
     * @deprecated 此方式只能实现接口的展示，不能跨服务调用，使用 knife4j aggregation 代替
     */
    public void registerExternalOpenApis(ConfigurableListableBeanFactory beanFactory) {
        Map<String, GroupedOpenApi> openApis = externalOpenApis();
        for (Map.Entry<String, GroupedOpenApi> entry : openApis.entrySet()) {
            String docName = entry.getKey();
            GroupedOpenApi openApi = entry.getValue();
            beanFactory.registerSingleton(docName + "ExternalApi", openApi);
        }
    }

    /**
     * 解析项目模块内部的接口文档
     *
     * @return key-组名称 value-Api文档对象
     */
    public Map<String, GroupedOpenApi> internalOpenApis() {
        Map<String, RouteDefinition> internals = openapiProperties.getInternals();
        if (MapUtils.isEmpty(internals)) {
            return Collections.emptyMap();
        }
        Map<String, GroupedOpenApi> openApiMap = new HashMap<>(internals.size());
        for (Map.Entry<String, RouteDefinition> entry : internals.entrySet()) {
            String entityKey = entry.getKey();
            RouteDefinition route = entry.getValue();
            String groupName = StringUtils.isBlank(route.getGroupName()) ? parseGroupName(entityKey) : route.getGroupName();
            String scanPackage = route.getLocation();

            GroupedOpenApi openApi = GroupedOpenApi.builder()
                    .group(groupName)
                    // 扫描该包下的所有需要在Swagger中展示的API，@Hidden 注解标注的除外
                    .packagesToScan(scanPackage)
                    // 添加全局参数
                    .addOperationCustomizer(customOperationCustomizer)
                    // 添加统一的上下文地址 contextPath
//                    .addOpenApiCustomizer(customOpenApiCustomizer)
                    .build();

            openApiMap.put(entityKey, openApi);
        }
        return openApiMap;
    }

    /**
     * 解析项目模块外部的接口文档
     *
     * @return key-组名称 value-Api文档对象
     * @deprecated 此方式只能实现接口的展示，不能跨服务调用，使用 knife4j aggregation 代替
     */
    public Map<String, GroupedOpenApi> externalOpenApis() {
        Map<String, RouteDefinition> externals = openapiProperties.getExternals();
        if (MapUtils.isEmpty(externals)) {
            return Collections.emptyMap();
        }
        Map<String, GroupedOpenApi> openApiMap = new HashMap<>(externals.size());
        for (Map.Entry<String, RouteDefinition> entry : externals.entrySet()) {
            String entityKey = entry.getKey();
            RouteDefinition route = entry.getValue();
            String groupName = StringUtils.isBlank(route.getGroupName()) ? parseGroupName(entityKey) : route.getGroupName();
            String resourcePath = buildUrl(route.getSchema().toLowerCase(), route.getUri(), route.getLocation());
            Map<String, Object> apiSpecMap = getResourceAsMap(resourcePath);

            GroupedOpenApi openApi = GroupedOpenApi.builder()
                    .group(groupName)
                    // 扫描该包下的所有需要在Swagger中展示的API，@Hidden 注解标注的除外
//                    .packagesToScan(scanPackage)
                    // 添加全局参数
                    .addOperationCustomizer(customOperationCustomizer)
                    // 添加统一的上下文地址 contextPath
                    .addOpenApiCustomizer(new FileOpenApiCustomizer(apiSpecMap, route.getServerUrl()))
                    .build();

            openApiMap.put(entityKey, openApi);
        }
        return openApiMap;
    }

    private String parseGroupName(String entityKey) {
        String[] strings = StringUtils.splitByCharacterTypeCamelCase(entityKey);
        return Arrays.stream(strings).map(s -> StringTool.toUpperCamelCase(s, null))
                .collect(Collectors.joining(BaseConstant.SPACE));
    }

    private String buildUrl(String schema, String uri, String path) {
        if (StringUtils.equalsAny(schema, "http", "https")) {
            return schema + "://" + uri + "/" + path;
        } else if (StringUtils.equalsAny(schema, "ftp", "sftp")) {
            return schema + "://" + uri + "/" + path;
        } else if (StringUtils.equalsAny(schema, "classpath")) {
            return path;
        } else if (StringUtils.equalsAny(schema, "file")) {
            String osName = System.getProperty("os.name").toLowerCase();
            if (osName.startsWith("windows")) {
                return schema + ":///" + uri + "/" + path;
            } else if (osName.startsWith("linux")) {
                return schema + ":/" + uri + "/" + path;
            }
        }
        throw new UnsupportedOperationException("Unsupported schema: " + schema);
    }

    private Map<String, Object> getResourceAsMap(String resourcePath) {
        try {
            // 支持 classpath:  file:// http: ftp:// 等协议
            org.springframework.core.io.Resource resource = new PathMatchingResourcePatternResolver()
                    .getResource(resourcePath);
            byte[] bytes = resource.getContentAsByteArray();
            if (ArrayUtils.isNotEmpty(bytes)) {
                String content = new String(bytes, StandardCharsets.UTF_8);

                Map<String, Object> apiSpecMap = null;
                if (resourcePath.endsWith(BaseConstant.DOT_YAML) || resourcePath.endsWith(BaseConstant.DOT_YML)) {
                    apiSpecMap = yamlToMap(content, Map.class);
                } else {
                    apiSpecMap = jsonToMap(content, Map.class, String.class, Object.class);
                }
                return apiSpecMap;
            }
        } catch (Exception ex) {
            log.error(ex.getMessage());
        }
        return null;
    }

    // endregion

    // region 可解决Spring 6.x 与Swagger 3.0.0 不兼容问题

    /**
     * 增加如下配置可解决Spring 6.x 与Swagger 3.0.0 不兼容问题
     **/
    @Bean
    public WebMvcEndpointHandlerMapping webEndpointServletHandlerMapping(WebEndpointsSupplier webEndpointsSupplier,
                                                                         ServletEndpointsSupplier servletEndpointsSupplier,
                                                                         ControllerEndpointsSupplier controllerEndpointsSupplier,
                                                                         EndpointMediaTypes endpointMediaTypes,
                                                                         CorsEndpointProperties corsProperties,
                                                                         WebEndpointProperties webEndpointProperties,
                                                                         Environment environment) {
        List<ExposableEndpoint<?>> allEndpoints = new ArrayList();
        Collection<ExposableWebEndpoint> webEndpoints = webEndpointsSupplier.getEndpoints();
        allEndpoints.addAll(webEndpoints);
        allEndpoints.addAll(servletEndpointsSupplier.getEndpoints());
        allEndpoints.addAll(controllerEndpointsSupplier.getEndpoints());
        String basePath = webEndpointProperties.getBasePath();
        EndpointMapping endpointMapping = new EndpointMapping(basePath);
        boolean shouldRegisterLinksMapping = this.shouldRegisterLinksMapping(webEndpointProperties, environment, basePath);
        return new WebMvcEndpointHandlerMapping(endpointMapping, webEndpoints,
                endpointMediaTypes, corsProperties.toCorsConfiguration(),
                new EndpointLinksResolver(allEndpoints, basePath), shouldRegisterLinksMapping);
    }

    private boolean shouldRegisterLinksMapping(WebEndpointProperties webEndpointProperties,
                                               Environment environment,
                                               String basePath) {
        return webEndpointProperties.getDiscovery().isEnabled()
                && (org.springframework.util.StringUtils.hasText(basePath)
                || ManagementPortType.get(environment).equals(ManagementPortType.DIFFERENT));
    }

    // endregion


    // region 全局参数及上下文处理

    /**
     * 添加全局的请求头参数，并为所有接口添加context-path
     */
    // @Bean
    public OpenApiCustomizer customerGlobalOpenApiCustomizer() {
        return openApi -> {
            Paths paths = openApi.getPaths();
            String[] pathSet = paths.keySet().toArray(new String[0]);
            for (String path : pathSet) {
                PathItem pathItem = paths.get(path);
                // 添加全局的请求头参数
                pathItem.readOperations().forEach(operation -> {
                    // 引用在 OpenAPI 中定义的 components
                    operation.addParametersItem(new HeaderParameter().$ref("#/components/parameters/" + PlatformConstant.HEADER_CLIENT_ID))
                            .addParametersItem(new HeaderParameter().$ref("#/components/parameters/" + PlatformConstant.HEADER_AUTHORIZATION));
                });
                // 为接口添加 context-path
                paths.put(contextPath + path, pathItem);
                paths.remove(path);
            }
        };
    }


    public class CustomOperationCustomizer implements GlobalOperationCustomizer {
        @Override
        public Operation customize(Operation operation, HandlerMethod handlerMethod) {
            for (Parameter parameter : openapiParameters) {
                operation.addParametersItem(parameter);
            }
            return operation;
        }
    }

    public class CustomOpenApiCustomizer implements GlobalOpenApiCustomizer {

        @Override
        public void customise(OpenAPI openApi) {
            if (StringUtils.isBlank(contextPath)) {
                return;
            }
            Paths paths = openApi.getPaths();
            // To avoid ConcurrentModificationException
            String[] keySet = paths.keySet().toArray(new String[0]);
            for (String key : keySet) {
                if (key.startsWith(contextPath)) {
                    continue;
                }
                PathItem pathItem = paths.get(key);
                // add contextPath to the individual operation
                paths.put(contextPath + key, pathItem);
                paths.remove(key);
            }

//            Server server = openApi.getServers().get(0);
//            // Add the basePath to the server entry
//            server.setUrl(server.getUrl());
        }
    }

    /**
     * @see <a href="https://stackoverflow.com/questions/71156280/how-can-i-add-custom-json-object-to-openapi-spec-generated-by-springboot-springd">How can I add custom json object to Openapi spec generated by SpringBoot SpringDoc?</a>
     * @see <a href="https://github.com/springdoc/springdoc-openapi/issues/705">Programatically schemas added are not showed in the generated openapi </a>
     * @see <a href="https://github.com/springdoc/springdoc-openapi/issues/1703">How to refresh the API</a>
     */
    public class FileOpenApiCustomizer implements GlobalOpenApiCustomizer {

        private Map<String, Object> apiSpecMap;
        private List<String> serverUrls;

        public FileOpenApiCustomizer(Map<String, Object> apiSpecMap, String serverUrls) {
            this.apiSpecMap = apiSpecMap;
            if (StringUtils.isNotBlank(serverUrls)) {
                this.serverUrls = Arrays.stream(serverUrls.split(",")).toList();
            }
        }

        @Override
        public void customise(OpenAPI openApi) {
            if (StringUtils.isBlank(contextPath)) {
                contextPath = "";
            }
            // add external info to api
            Map<String, Object> extensions = new HashMap<>();
            extensions.put("external", "https://lorchr.github.io/light-docusaurus");
            openApi.setExtensions(extensions);

            // 添加server信息，发送请求是 curl脚本会生成新的url
            if (CollectionUtils.isNotEmpty(serverUrls)) {
                List<Server> servers = serverUrls.stream().map(url -> {
                    Server server = new Server();
                    server.setUrl(url);
                    return server;
                }).collect(Collectors.toList());
                openApi.setServers(servers);
            }

            Map<String, Object> pathMap = (Map<String, Object>) apiSpecMap.get("paths");
            Paths paths = openApi.getPaths();
            // Note: 如果此处不清空，其他接口的数据也会显示到当前的接口集中
            paths.clear();
            for (Map.Entry<String, Object> entry : pathMap.entrySet()) {
                String key = entry.getKey();
                Map<String, Object> valueMap = (Map<String, Object>) entry.getValue();
                PathItem pathItem = jsonToBean(beanToJson(valueMap), PathItem.class);
//                for (Map.Entry<String, Object> innerEntry : valueMap.entrySet()) {
//                    String innerKey = innerEntry.getKey();
//                    Object innerValue = innerEntry.getValue();
//                    Operation operation = jsonToBean(JsonTool.beanToJson(innerValue), Operation.class);
//                    if (PathItem.HttpMethod.POST.name().equalsIgnoreCase(innerKey)) {
//                        pathItem.setPost(operation);
//                    } else if (PathItem.HttpMethod.GET.name().equalsIgnoreCase(innerKey)) {
//                        pathItem.setGet(operation);
//                    } else if (PathItem.HttpMethod.PUT.name().equalsIgnoreCase(innerKey)) {
//                        pathItem.setPut(operation);
//                    } else if (PathItem.HttpMethod.PATCH.name().equalsIgnoreCase(innerKey)) {
//                        pathItem.setPatch(operation);
//                    } else if (PathItem.HttpMethod.DELETE.name().equalsIgnoreCase(innerKey)) {
//                        pathItem.setDelete(operation);
//                    } else if (PathItem.HttpMethod.HEAD.name().equalsIgnoreCase(innerKey)) {
//                        pathItem.setHead(operation);
//                    } else if (PathItem.HttpMethod.OPTIONS.name().equalsIgnoreCase(innerKey)) {
//                        pathItem.setOptions(operation);
//                    } else if (PathItem.HttpMethod.TRACE.name().equalsIgnoreCase(innerKey)) {
//                        pathItem.setTrace(operation);
//                    }
//                }
                paths.addPathItem(key, pathItem);
            }

//            String openapi = (String) apiSpecMap.get("openapi");
//            List<Object> info = (List<Object>) apiSpecMap.get("info");
//            Map<String, Object> externalDocs = (Map<String, Object>) apiSpecMap.get("externalDocs");
//            List<Object> servers = (List<Object>) apiSpecMap.get("servers");
//            List<Object> tags = (List<Object>) apiSpecMap.get("tags");
//            Map<String, Object> paths = (Map<String, Object>) apiSpecMap.get("paths");
//            List<Object> security = (List<Object>) apiSpecMap.get("security");
//            Map<String, Object> components = (Map<String, Object>) apiSpecMap.get("components");

            Components components = openApi.getComponents();
            Map<String, Object> componentMap = (Map<String, Object>) apiSpecMap.get("components");
            Map<String, Object> schemaMap = (Map<String, Object>) componentMap.get("schemas");
            for (Map.Entry<String, Object> entry : schemaMap.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();

                Schema schema = jsonToBean(beanToJson(value), Schema.class);
                components.addSchemas(key, schema);
            }
        }
    }

    // endregion


    /**
     * 使用Swagger时，最好使用自带的 {@link io.swagger.v3.core.util.Json} {@link io.swagger.v3.core.util.Yaml}解析类
     *
     * @param content json字符串
     * @param clazz   目标对象类型
     * @return clazz 类型对象
     */
    public <T> T jsonToBean(String content, Class<T> clazz) {
        try {
            return Json.mapper().readValue(content, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public Map jsonToMap(String content, Class<? extends Map> mapType,
                         Class<String> keyType, Class<Object> valueType) {
        try {
            ObjectMapper mapper = Json.mapper();
            MapType type = mapper.getTypeFactory()
                    .constructMapType(mapType, keyType, valueType);
            return mapper.readValue(content, type);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public String beanToJson(Object bean) {
        try {
            return Json.mapper().writeValueAsString(bean);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public <T> T yamlToBean(String content, Class<T> clazz) {
        try {
            return Yaml.mapper().readValue(content, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Jackson yaml不支持带锚点的yaml文档解析：
     *
     * @see <a href="https://stackoverflow.com/questions/40074700/jackson-yaml-support-for-anchors-and-references">Jackson YAML: support for anchors and references</a>
     * @see <a href="https://github.com/FasterXML/jackson-dataformats-text/issues/98">Jackson Yaml anchors/references Support</a>
     */
    public static <K, V> Map<K, V> yamlToMap(String content, Class<? extends Map> mapType,
                                             Class<K> keyType, Class<V> valueType) {
        try {
            ObjectMapper mapper = Yaml.mapper();
            final JsonNode rootNode = mapper.readTree(content);

            MapType type = mapper.getTypeFactory()
                    .constructMapType(mapType, keyType, valueType);
            TreeTraversingParser treeTraversingParser = new TreeTraversingParser(rootNode);
            return mapper.readValue(treeTraversingParser, type);
        } catch (Exception e) {
            log.error(ResponseEnum.YAML_PARSE_ERROR.getDesc(), e);
        }
        return null;
    }

    /**
     * 使用 snakeyaml 可以支持锚点
     */
    public Map yamlToMap(String content, Class<? extends Map> mapType) {
        org.yaml.snakeyaml.Yaml yaml = new org.yaml.snakeyaml.Yaml();
        return yaml.loadAs(content, mapType);
    }

    public String beanToYaml(Object bean) {
        try {
            return Yaml.mapper().writeValueAsString(bean);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

}

```

### 7.OpenapiAdditionalBeanRegistry 动态注册类

```java
package com.light.cloud.common.web.openapi.processor;

import jakarta.servlet.http.HttpServletRequest;
import org.springdoc.core.properties.SpringDocConfigProperties;
import org.springframework.beans.BeansException;
import org.springframework.beans.PropertyValues;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.InstantiationAwareBeanPostProcessor;

import com.light.cloud.common.web.openapi.config.SpringDocConfig;
import jakarta.annotation.Resource;

/**
 * Swagger 额外Bean的手动注册
 *
 * @see springfox.documentation.spring.web.plugins.DocumentationPluginsManager
 * @see org.springdoc.core.providers.SpringDocProviders
 * @see org.springdoc.core.configuration.SpringDocConfiguration#springDocProviders(java.util.Optional, java.util.Optional, java.util.Optional, java.util.Optional, java.util.Optional, java.util.Optional, java.util.Optional, org.springdoc.core.providers.ObjectMapperProvider)
 * @see org.springframework.web.servlet.DispatcherServlet#doDispatch(jakarta.servlet.http.HttpServletRequest, jakarta.servlet.http.HttpServletResponse)
 * @see org.springdoc.webmvc.ui.SwaggerConfigResource#openapiJson(HttpServletRequest)
 * @author Hui Liu
 * @date 2022/9/27
 */
public class OpenapiAdditionalBeanRegistry implements InstantiationAwareBeanPostProcessor, BeanFactoryAware {

    @Resource
    private SpringDocConfig springDocConfig;

    @Resource
    private SpringDocConfigProperties springDocConfigProperties;

    private ConfigurableListableBeanFactory beanFactory;

    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        if (beanFactory instanceof ConfigurableListableBeanFactory) {
            this.beanFactory = (ConfigurableListableBeanFactory) beanFactory;
        }
    }

    @Override
    public PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) throws BeansException {
        // springfox 切入点
//        if ("documentationPluginsManager".equals(beanName)) {
//            springDocConfig.registerOpenApis(beanFactory);
//        }
        // springdoc 切入点
        if ("springDocProviders".equals(beanName)) {
            springDocConfig.registerInternalOpenApis(beanFactory);
            // Note: 接口废弃，外部接口调用使用 knife4j-aggregation
            springDocConfig.registerExternalOpenApis(beanFactory);

            // 禁用缓存，会自动加载新的文档
            SpringDocConfigProperties.Cache cache = springDocConfigProperties.getCache();
            if (!cache.isDisabled()) {
                cache.setDisabled(Boolean.TRUE);
                springDocConfigProperties.setCache(cache);
            }
        }
        return InstantiationAwareBeanPostProcessor.super.postProcessProperties(pvs, bean, beanName);
    }

}

```

## 聚合Api文档

### 1. 添加依赖项

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-aggregation-spring-boot-starter</artifactId>
</dependency>
```

### 2. 添加配置

```yaml
# 使用 knife4j aggregation 实现外部接口的展示和调用
knife4j:
  enable-aggregation: true
  cloud:
    enable: true
    routes:
      - name: 权限管理
        uri: 192.168.3.49:80
        location: /oauth/v3/api-docs
      - name: 系统管理
        uri: 192.168.3.49:80
        location: /system/v3/api-docs
```

### 3. RouteProxyFilter 路由过滤器

```java
package com.light.cloud.common.web.openapi.aggregation.filter;

import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.StrUtil;

import com.fasterxml.jackson.core.type.TypeReference;
import com.github.xiaoymin.knife4j.aggre.core.pojo.SwaggerRoute;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.stream.JsonReader;
import com.light.cloud.common.core.tool.JsonTool;
import com.light.cloud.common.web.openapi.aggregation.RouteDispatcher;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

/***
 * @see com.github.xiaoymin.knife4j.aggre.spring.configuration.Knife4jAggregationAutoConfiguration
 * @see com.github.xiaoymin.knife4j.aggre.core.filter.Knife4jRouteProxyFilter
 * @since  2.0.8
 * @author <a href="mailto:xiaoymin@foxmail.com">xiaoymin@foxmail.com</a>
 * 2020/10/29 20:06
 */
public class RouteProxyFilter implements Filter {

    private final RouteDispatcher routeDispatcher;
    private final Gson gson = new GsonBuilder().create();

    Logger logger = LoggerFactory.getLogger(RouteProxyFilter.class);

    public RouteProxyFilter(RouteDispatcher routeDispatcher) {
        this.routeDispatcher = routeDispatcher;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        String uri = request.getRequestURI();
        // Note: 有些版本的前端代码中Header名称 knife4j-gateway-request 存在拼写错误
        if (routeDispatcher.checkRoute(request.getHeader(RouteDispatcher.ROUTE_PROXY_HEADER_NAME))) {
            if (StrUtil.endWith(uri, RouteDispatcher.OPENAPI_GROUP_INSTANCE_ENDPOINT)) {
                String group = request.getParameter("group");
                SwaggerRoute swaggerRoute = routeDispatcher.getRoute(group);
                writeRouteResponse(response, null, swaggerRoute == null ? "" : swaggerRoute.getContent());
                // 响应当前服务disk-实例
            } else {
                if (logger.isDebugEnabled()) {
                    logger.debug("Current Request URI:{},Proxy Request", uri);
                }
                routeDispatcher.execute(request, response);
            }
        } else {
            // go on
            if (StrUtil.endWith(uri, RouteDispatcher.OPENAPI_GROUP_ENDPOINT)) {
                // 响应当前服务聚合结构
                ContentCachingResponseWrapper responseWrapper = response instanceof ContentCachingResponseWrapper ?
                        (ContentCachingResponseWrapper) response : new ContentCachingResponseWrapper(response);
                filterChain.doFilter(request, responseWrapper);
                String result = new String(responseWrapper.getContentAsByteArray());
                writeRouteResponse(response, result, gson.toJson(routeDispatcher.getRoutes()));
            } else if (StrUtil.endWith(uri, RouteDispatcher.OPENAPI_GROUP_INSTANCE_ENDPOINT)) {
                // 响应当前服务disk-实例
                String group = request.getParameter("group");
                SwaggerRoute swaggerRoute = routeDispatcher.getRoute(group);
                writeRouteResponse(response, null, swaggerRoute == null ? "" : swaggerRoute.getContent());
            } else if (uri.endsWith("/webjars/js/app.b0c0d7df.js")) {
                // Note: 修复 openapi 3.0 兼容性问题
                ContentCachingResponseWrapper responseWrapper = response instanceof ContentCachingResponseWrapper ?
                        (ContentCachingResponseWrapper) response : new ContentCachingResponseWrapper(response);
                filterChain.doFilter(request, responseWrapper);
                String result = new String(responseWrapper.getContentAsByteArray());
                String newResult = result.replace("url:re.a.getValue(e,\"url\",\"\",!0)", "url:re.a.getValue(e,\"url\",\"\",!0),header:re.a.getValue(e,\"header\",\"\",!0)")
                        .replace("url:re.a.getValue(t,\"url\",\"\",!0)", "url:re.a.getValue(t,\"url\",\"\",!0),header:re.a.getValue(t,\"header\",\"\",!0)")
                        .replace("t.servicePath=re.a.getValue(e,\"servicePath\",null,!0)", "t.servicePath=re.a.getValue(e,\"servicePath\",null,!0),t.header=re.a.getValue(e,\"header\",null,!0)");
                byte[] bytes = newResult.getBytes(StandardCharsets.UTF_8);
                responseWrapper.setContentLengthLong(bytes.length);
                responseWrapper.setContentLength(bytes.length);
                responseWrapper.setBufferSize(bytes.length);
                responseWrapper.getOutputStream().write(bytes);
                responseWrapper.copyBodyToResponse();
            } else {
                filterChain.doFilter(servletRequest, servletResponse);
            }
        }
    }

    /**
     * 响应服务端的内容
     * @param response 响应流
     * @param content 内容
     * @throws IOException 异常
     */
    protected void writeRouteResponse(HttpServletResponse response, String result, String content) throws IOException {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        if (StringUtils.isNotBlank(result)) {
            Map<String, Object> resultMap = JsonTool.jsonToMap(result, Map.class, String.class, Object.class);
            List<Map<String, Object>> routes = JsonTool.jsonToBean(content, new TypeReference<List<Map<String, Object>>>() {
            });
            if (CollectionUtils.isNotEmpty(routes)) {
                // 添加外部文档
                List<Map<String, Object>> urls = (List<Map<String, Object>>) resultMap.getOrDefault("urls", new ArrayList<>());
                for (Map<String, Object> route : routes) {
                    route.put("url", routeDispatcher.getRootPath() + route.get("location"));
                    urls.add(route);
                }
                // 移除单独的文档配置
                // resultMap.remove("url");
                resultMap.put("urls", urls);
                bytes = JsonTool.beanToJson(resultMap).getBytes(StandardCharsets.UTF_8);
            }
        }
        ServletOutputStream outputStream = response.getOutputStream();
        outputStream.write(bytes);
        outputStream.flush();
        outputStream.close();
    }
    @Override
    public void destroy() {

    }

}

```

### 4. SecurityBasicAuthFilter 认证过滤器

```java
package com.light.cloud.common.web.openapi.aggregation.filter;

import com.github.xiaoymin.knife4j.aggre.core.pojo.BasicAuth;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Base64;

/***
 * @see com.github.xiaoymin.knife4j.aggre.spring.configuration.Knife4jAggregationAutoConfiguration
 * @see com.github.xiaoymin.knife4j.aggre.core.filter.Knife4jSecurityBasicAuthFilter
 * @since  2.0.9
 * @author <a href="mailto:xiaoymin@foxmail.com">xiaoymin@foxmail.com</a>
 * 2020/11/25 19:55
 */
public class SecurityBasicAuthFilter implements Filter {

    Logger logger = LoggerFactory.getLogger(SecurityBasicAuthFilter.class);
    /***
     * basic auth验证
     */
    public static final String SwaggerBootstrapUiBasicAuthSession = "Knife4jAggregationBasicAuthSession";

    /***
     * 是否开启basic验证,默认不开启
     */
    /**
     * 文档Basic保护
     */
    private BasicAuth basicAuth;

    public SecurityBasicAuthFilter(BasicAuth basicAuth) {
        this.basicAuth = basicAuth;
    }

    protected String decodeBase64(String source) {
        String decodeStr = null;
        if (source != null) {
            // BASE64Decoder decoder=new BASE64Decoder();
            try {
                // byte[] bytes=decoder.decodeBuffer(source);
                byte[] bytes = Base64.getDecoder().decode(source);
                decodeStr = new String(bytes);
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        }
        return decodeStr;
    }
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest servletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        // 针对swagger资源请求过滤
        if (basicAuth != null && basicAuth.isEnable()) {
            // 判断Session中是否存在
            Object swaggerSessionValue = servletRequest.getSession().getAttribute(SwaggerBootstrapUiBasicAuthSession);
            if (swaggerSessionValue != null) {
                chain.doFilter(request, response);
            } else {
                // 匹配到,判断auth
                // 获取请求头Authorization
                String auth = servletRequest.getHeader("Authorization");
                if (auth == null || "".equals(auth)) {
                    writeForbiddenCode(httpServletResponse);
                    return;
                }
                String userAndPass = decodeBase64(auth.substring(6));
                String[] upArr = userAndPass.split(":");
                if (upArr.length != 2) {
                    writeForbiddenCode(httpServletResponse);
                } else {
                    String iptUser = upArr[0];
                    String iptPass = upArr[1];
                    // 匹配服务端用户名及密码
                    if (iptUser.equals(basicAuth.getUsername()) && iptPass.equals(basicAuth.getPassword())) {
                        servletRequest.getSession().setAttribute(SwaggerBootstrapUiBasicAuthSession, basicAuth.getUsername());
                        chain.doFilter(request, response);
                    } else {
                        writeForbiddenCode(httpServletResponse);
                        return;
                    }
                }
            }
        } else {
            chain.doFilter(request, response);
        }
    }

    @Override
    public void destroy() {

    }

    private void writeForbiddenCode(HttpServletResponse httpServletResponse) throws IOException {
        httpServletResponse.setStatus(401);
        httpServletResponse.setHeader("WWW-Authenticate", "Basic realm=\"input OpenAPI userName & password \"");
        httpServletResponse.getWriter().write("You do not have permission to access this resource");
    }

}


```

### 5. RouteDispatcher 路由分发器

```java
package com.light.cloud.common.web.openapi.aggregation;


import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.io.IoUtil;
import cn.hutool.core.lang.Assert;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import com.github.xiaoymin.knife4j.aggre.core.RouteCache;
import com.github.xiaoymin.knife4j.aggre.core.RouteRepository;
import com.github.xiaoymin.knife4j.aggre.core.RouteResponse;
import com.github.xiaoymin.knife4j.aggre.core.common.ExecutorEnum;
import com.github.xiaoymin.knife4j.aggre.core.common.RouteUtils;
import com.github.xiaoymin.knife4j.aggre.core.pojo.BasicAuth;
import com.github.xiaoymin.knife4j.aggre.core.pojo.HeaderWrapper;
import com.github.xiaoymin.knife4j.aggre.core.pojo.SwaggerRoute;
import com.light.cloud.common.web.openapi.aggregation.executor.ApacheClientExecutor;
import com.light.cloud.common.web.openapi.aggregation.executor.OkHttpClientExecutor;
import com.light.cloud.common.web.openapi.aggregation.executor.RouteExecutor;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.Part;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.URI;
import java.util.*;

/***
 * @see com.github.xiaoymin.knife4j.aggre.core.RouteDispatcher
 * @since  2.0.8
 * @author <a href="mailto:xiaoymin@foxmail.com">xiaoymin@foxmail.com</a>
 * 2020/10/29 20:08
 */
public class RouteDispatcher {

    /**
     * header
     */
    public static final String ROUTE_PROXY_HEADER_NAME = "knife4j-gateway-request";
    public static final String ROUTE_PROXY_HEADER_BASIC_NAME = "knife4j-gateway-basic-request";
    public static final String OPENAPI_GROUP_ENDPOINT = "/swagger-config";
    public static final String OPENAPI_GROUP_INSTANCE_ENDPOINT = "/swagger-instance";
    public static final String ROUTE_BASE_PATH = "/";

    Logger logger = LoggerFactory.getLogger(com.github.xiaoymin.knife4j.aggre.core.RouteDispatcher.class);
    /**
     * current project contextPath
     */
    private String rootPath;

    private RouteRepository routeRepository;

    private RouteExecutor routeExecutor;

    private RouteCache<String, SwaggerRoute> routeCache;

    private Set<String> ignoreHeaders = new HashSet<>();

    public RouteDispatcher(RouteRepository routeRepository, RouteCache<String, SwaggerRoute> routeRouteCache,
                           ExecutorEnum executorEnum, String rootPath) {
        this.routeRepository = routeRepository;
        this.routeCache = routeRouteCache;
        this.rootPath = rootPath;
        initExecutor(executorEnum);
        ignoreHeaders.addAll(Arrays.asList(new String[]{
                "host", "content-length", ROUTE_PROXY_HEADER_NAME, ROUTE_PROXY_HEADER_BASIC_NAME, "Request-Origion", "language", "knife4j-gateway-code"
        }));
    }

    private void initExecutor(ExecutorEnum executorEnum) {
        if (executorEnum == null) {
            throw new IllegalArgumentException("ExecutorEnum can not be empty");
        }
        switch (executorEnum) {
            case APACHE:
                this.routeExecutor = new ApacheClientExecutor();
                break;
            case OKHTTP:
                this.routeExecutor = new OkHttpClientExecutor();
                break;
            default:
                throw new UnsupportedOperationException("UnSupported ExecutorType:" + executorEnum.name());
        }
    }

    public boolean checkRoute(String header) {
        if (StrUtil.isNotBlank(header)) {
            SwaggerRoute swaggerRoute = routeRepository.getRoute(header);
            if (swaggerRoute != null) {
                return StrUtil.isNotBlank(swaggerRoute.getUri());
            }
        }
        return false;
    }

    public void execute(HttpServletRequest request, HttpServletResponse response) {
        try {
            RouteRequestContext routeContext = new RouteRequestContext();
            this.buildContext(routeContext, request);
            RouteResponse routeResponse = routeExecutor.executor(routeContext);
            writeResponseStatus(routeResponse, response);
            writeResponseHeader(routeResponse, response);
            writeBody(routeResponse, response);
        } catch (Exception e) {
            logger.error("has Error:{}", e.getMessage());
            logger.error(e.getMessage(), e);
            // write Default
            writeDefault(request, response, e.getMessage());
        }
    }

    protected void writeDefault(HttpServletRequest request, HttpServletResponse response, String errMsg) {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        try {
            PrintWriter printWriter = response.getWriter();
            Map<String, String> map = new HashMap<>();
            map.put("message", errMsg);
            map.put("code", "500");
            map.put("path", request.getRequestURI());
            new JSONObject(map).write(printWriter);
            printWriter.close();
        } catch (IOException e) {
            // ignore
        }
    }

    /**
     * Write Http Status Code
     *
     * @param routeResponse routeResponse
     * @param response      response
     */
    protected void writeResponseStatus(RouteResponse routeResponse, HttpServletResponse response) {
        if (routeResponse != null) {
            response.setStatus(routeResponse.getStatusCode());
        }
    }

    /**
     * Write Response Header
     *
     * @param routeResponse route instance
     * @param response Servlet Response
     */
    protected void writeResponseHeader(RouteResponse routeResponse, HttpServletResponse response) {
        if (routeResponse != null) {
            if (CollectionUtil.isNotEmpty(routeResponse.getHeaders())) {
                for (HeaderWrapper header : routeResponse.getHeaders()) {
                    if (!StrUtil.equalsIgnoreCase(header.getName(), "Transfer-Encoding")) {
                        response.addHeader(header.getName(), header.getValue());
                    }
                }
            }
            if (logger.isDebugEnabled()) {
                logger.debug("Content-Type:{},Charset-Encoding:{}", routeResponse.getContentType(), routeResponse.getCharsetEncoding());
            }
            response.setContentType(routeResponse.getContentType());
            if (routeResponse.getContentLength() > 0) {
                response.setContentLengthLong(routeResponse.getContentLength());
            }
            response.setCharacterEncoding(routeResponse.getCharsetEncoding().displayName());
        }
    }

    /**
     * Write Body
     *
     * @param routeResponse route
     * @param response Servlet Response
     */
    protected void writeBody(RouteResponse routeResponse, HttpServletResponse response) throws IOException {
        if (routeResponse != null) {
            if (routeResponse.success()) {
                InputStream inputStream = routeResponse.getBody();
                if (inputStream != null) {
                    int read = -1;
                    byte[] bytes = new byte[1024 * 1024];
                    ServletOutputStream outputStream = response.getOutputStream();
                    while ((read = inputStream.read(bytes)) != -1) {
                        outputStream.write(bytes, 0, read);
                    }
                    IoUtil.close(inputStream);
                    IoUtil.close(outputStream);
                }
            } else {
                String text = routeResponse.text();
                if (StrUtil.isNotBlank(text)) {
                    PrintWriter printWriter = response.getWriter();
                    printWriter.write(text);
                    printWriter.close();
                }
            }

        }
    }

    /**
     * Build Context of Route
     * @param routeRequestContext Route Context
     * @param request Servlet Request
     */
    protected void buildContext(RouteRequestContext routeRequestContext, HttpServletRequest request) throws IOException {
        // Whether Basic
        String basicHeader = request.getHeader(ROUTE_PROXY_HEADER_BASIC_NAME);
        if (StrUtil.isNotBlank(basicHeader)) {
            BasicAuth basicAuth = routeRepository.getAuth(basicHeader);
            if (basicAuth != null) {
                // add Basic header
                routeRequestContext.addHeader("Authorization", RouteUtils.authorize(basicAuth.getUsername(),
                        basicAuth.getPassword()));
            }
        }
        SwaggerRoute swaggerRoute = getRoute(request.getHeader(ROUTE_PROXY_HEADER_NAME));
        // String uri="http://knife4j.xiaominfo.com";
        String uri = swaggerRoute.getUri();
        String fromUri = request.getRequestURI();
        // get project servlet.contextPath
        if (StrUtil.isNotBlank(this.rootPath) && !StrUtil.equals(this.rootPath, ROUTE_BASE_PATH)) {
            fromUri = fromUri.replaceFirst(this.rootPath, "");
            // 此处需要追加一个请求头basePath，因为父项目设置了context-path
            routeRequestContext.addHeader("X-Forwarded-Prefix", this.rootPath);
        }
        // 判断servicePath
        if (StrUtil.isNotBlank(swaggerRoute.getServicePath()) && !StrUtil.equals(swaggerRoute.getServicePath(),
                ROUTE_BASE_PATH)) {
            if (StrUtil.startWith(fromUri, swaggerRoute.getServicePath())) {
                // 实际在请求时,剔除servicePath,否则会造成404
                fromUri = fromUri.replaceFirst(swaggerRoute.getServicePath(), "");
            }
        }
        if (StrUtil.isNotBlank(swaggerRoute.getLocation())) {
            if (swaggerRoute.getLocation().indexOf(fromUri) == -1) {
                logger.debug("location:{},fromURI:{}", swaggerRoute.getLocation(), fromUri);
                // 当前路径是请求非获取OpenAPI实例路径地址，判断debugURL
                if (StrUtil.isNotBlank(swaggerRoute.getDebugUrl())) {
                    // 设置为调试地址
                    uri = swaggerRoute.getDebugUrl();
                }
            }
        }
        if (logger.isDebugEnabled()) {
            logger.debug("Debug URI:{},fromURI:{}", uri, fromUri);
        }
        Assert.notEmpty(uri, "Uri is Empty");
        StringBuilder requestUrlBuilder = new StringBuilder();
        requestUrlBuilder.append(uri);
        requestUrlBuilder.append(fromUri);
        // String requestUrl=uri+fromUri;
        String requestUrl = requestUrlBuilder.toString();
        String host = URI.create(uri).getHost();
        if (logger.isDebugEnabled()) {
            logger.debug("目标请求Url:{},请求类型:{},Host:{}", requestUrl, request.getMethod(), host);
        }
        routeRequestContext.setOriginalUri(fromUri);
        routeRequestContext.setUrl(requestUrl);
        routeRequestContext.setMethod(request.getMethod());
        Enumeration<String> enumeration = request.getHeaderNames();
        while (enumeration.hasMoreElements()) {
            String key = enumeration.nextElement();
            String value = request.getHeader(key);
            if (!ignoreHeaders.contains(key.toLowerCase())) {
                routeRequestContext.addHeader(key, value);
            }
        }
        routeRequestContext.addHeader("Host", host);
        Enumeration<String> params = request.getParameterNames();
        while (params.hasMoreElements()) {
            String name = params.nextElement();
            String value = request.getParameter(name);
            // logger.info("param-name:{},value:{}",name,value);
            routeRequestContext.addParam(name, value);
        }
        // 增加文件，sinc 2.0.9
        String contentType = request.getContentType();
        if ((!StringUtils.isEmpty(contentType)) &&
                contentType.contains("multipart/form-data")) {
            try {
                Collection<Part> parts = request.getParts();
                if (CollectionUtil.isNotEmpty(parts)) {
                    Map<String, String> paramMap = routeRequestContext.getParams();
                    parts.forEach(part -> {
                        String key = part.getName();
                        if (!paramMap.containsKey(key)) {
                            routeRequestContext.addPart(part);
                        }
                    });
                }
            } catch (ServletException e) {
                // ignore
                logger.warn("get part error,message:" + e.getMessage());
            }
        }
        routeRequestContext.setRequestContent(request.getInputStream());
    }

    public SwaggerRoute getRoute(String header) {
        // 去除缓存机制，由于Eureka以及Nacos设立了心跳检测机制，服务在多节点部署时，节点ip可能存在变化,导致调试最终转发给已经下线的服务
        // since 2.0.9
        SwaggerRoute swaggerRoute = routeRepository.getRoute(header);
        return swaggerRoute;
    }

    public List<SwaggerRoute> getRoutes() {
        return routeRepository.getRoutes();
    }

    public String getRootPath() {
        return rootPath;
    }
}

```

### 6. RouteRequestContext 路由上下文

```java
package com.light.cloud.common.web.openapi.aggregation;

import com.github.xiaoymin.knife4j.aggre.core.pojo.BasicAuth;
import com.github.xiaoymin.knife4j.aggre.core.pojo.HeaderWrapper;
import jakarta.servlet.http.Part;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/***
 *
 * @since  2.0.8
 * @author <a href="mailto:xiaoymin@foxmail.com">xiaoymin@foxmail.com</a>
 * 2020/10/29 20:34
 */
public class RouteRequestContext {

    /**
     * 当前请求的接口地址
     */
    private String originalUri;
    /**
     * 请求接口
     */
    private String url;
    /**
     * 请求类型
     */
    private String method;
    /**
     * 请求头
     */
    private List<HeaderWrapper> headers = new ArrayList<>();
    /**
     * 查询参数
     */
    private Map<String, String> params = new HashMap<>();
    /**
     * 文件
     */
    private List<Part> parts = new ArrayList<>();

    /**
     * 请求内容
     */
    private InputStream requestContent;

    /**
     * 请求长度
     */
    private Long contentLength;
    /**
     * Basic验证
     */
    private BasicAuth basicAuth;

    /**
     * 添加请求头
     * @param key 请求头
     * @param value 值
     */
    public void addHeader(String key, String value) {
        this.headers.add(new HeaderWrapper(key, value));
    }

    /**
     * 添加params参数
     * @param name 参数名称
     * @param value 参数值
     */
    public void addParam(String name, String value) {
        this.params.put(name, value);
    }

    /**
     * 增加文件参数
     * @param part  文件
     */
    public void addPart(Part part) {
        this.parts.add(part);
    }

    public BasicAuth getBasicAuth() {
        return basicAuth;
    }

    public void setBasicAuth(BasicAuth basicAuth) {
        this.basicAuth = basicAuth;
    }

    public String getOriginalUri() {
        return originalUri;
    }

    public void setOriginalUri(String originalUri) {
        this.originalUri = originalUri;
    }

    public Long getContentLength() {
        return contentLength;
    }

    public void setContentLength(Long contentLength) {
        this.contentLength = contentLength;
    }

    public Map<String, String> getParams() {
        return params;
    }

    public void setParams(Map<String, String> params) {
        this.params = params;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public List<HeaderWrapper> getHeaders() {
        return headers;
    }

    public void setHeaders(List<HeaderWrapper> headers) {
        this.headers = headers;
    }

    public InputStream getRequestContent() {
        return requestContent;
    }

    public void setRequestContent(InputStream requestContent) {
        this.requestContent = requestContent;
    }

    public List<Part> getParts() {
        return parts;
    }

    public void setParts(List<Part> parts) {
        this.parts = parts;
    }
}

```

### 7. RouteExecutor 路由执行器

```java
package com.light.cloud.common.web.openapi.aggregation.executor;

import com.github.xiaoymin.knife4j.aggre.core.RouteResponse;
import com.light.cloud.common.web.openapi.aggregation.RouteRequestContext;

/***
 * @see com.github.xiaoymin.knife4j.aggre.core.RouteExecutor
 * @since  2.0.8
 * @author <a href="mailto:xiaoymin@foxmail.com">xiaoymin@foxmail.com</a>
 * 2020/10/29 20:33
 */
public interface RouteExecutor {

    /**
     * 执行器
     * @param routeContext 请求上下文
     * @return 响应对象
     */
    RouteResponse executor(RouteRequestContext routeContext);
}


```

### 8. OkHttpClientExecutor 路由执行器 OkHttp 实现

```java
package com.light.cloud.common.web.openapi.aggregation.executor;


import com.github.xiaoymin.knife4j.aggre.core.RouteResponse;
import com.light.cloud.common.web.openapi.aggregation.RouteRequestContext;

/***
 * @see com.github.xiaoymin.knife4j.aggre.core.executor.OkHttpClientExecutor
 * @since  2.0.8
 * @author <a href="mailto:xiaoymin@foxmail.com">xiaoymin@foxmail.com</a>
 * 2020/10/29 20:40
 */
public class OkHttpClientExecutor implements RouteExecutor {

    @Override
    public RouteResponse executor(RouteRequestContext routeContext) {
        return null;
    }
}
```

### 9. ApacheClientExecutor 路由执行器 Apache 实现

```java
package com.light.cloud.common.web.openapi.aggregation.executor;

import cn.hutool.core.collection.CollectionUtil;
import com.github.xiaoymin.knife4j.aggre.core.RouteResponse;
import com.github.xiaoymin.knife4j.aggre.core.executor.ApacheClientResponse;
import com.github.xiaoymin.knife4j.aggre.core.executor.DefaultClientResponse;
import com.github.xiaoymin.knife4j.aggre.core.ext.PoolingConnectionManager;
import com.github.xiaoymin.knife4j.aggre.core.pojo.HeaderWrapper;
import com.light.cloud.common.web.openapi.aggregation.RouteRequestContext;
import jakarta.servlet.http.Part;
import org.apache.http.Header;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.conn.HttpHostConnectException;
import org.apache.http.entity.BasicHttpEntity;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/***
 * @see com.github.xiaoymin.knife4j.aggre.core.executor.ApacheClientExecutor
 * 基于HttpClient组件的转发策略
 * @since  2.0.8
 * @author <a href="mailto:xiaoymin@foxmail.com">xiaoymin@foxmail.com</a>
 * 2020/10/29 20:35
 */
public class ApacheClientExecutor extends PoolingConnectionManager implements RouteExecutor {

    Logger logger = LoggerFactory.getLogger(com.github.xiaoymin.knife4j.aggre.core.executor.ApacheClientExecutor.class);

    private HttpUriRequest buildRequest(RouteRequestContext routeContext) {
        RequestBuilder builder = RequestBuilder.create(routeContext.getMethod());
        if (logger.isDebugEnabled()) {
            logger.debug("ApacheClient Uri:{}", routeContext.getUrl());
        }
        builder.setUri(routeContext.getUrl());
        if (CollectionUtil.isNotEmpty(routeContext.getHeaders())) {
            // 构建Header
            for (HeaderWrapper headerWrapper : routeContext.getHeaders()) {
                builder.addHeader(headerWrapper.getName(), headerWrapper.getValue());
            }
        }
        if (CollectionUtil.isNotEmpty(routeContext.getParams())) {
            // 构建Params
            for (Map.Entry<String, String> entry : routeContext.getParams().entrySet()) {
                builder.addParameter(entry.getKey(), entry.getValue());
            }
        }
        if (routeContext.getRequestContent() != null) {
            // 文件请求是否为空 since 2.0.9
            if (CollectionUtil.isNotEmpty(routeContext.getParts())) {
                MultipartEntityBuilder partFileBuilder = MultipartEntityBuilder.create();
                partFileBuilder.setCharset(StandardCharsets.UTF_8);
                partFileBuilder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
                // 从请求头获取context-type
                Header header = builder.getFirstHeader("content-type");
                if (header != null) {
                    // 赋值
                    partFileBuilder.setContentType(ContentType.parse(header.getValue()));
                }
                for (Part part : routeContext.getParts()) {
                    try {
                        partFileBuilder.addBinaryBody(part.getName(), part.getInputStream(), ContentType.MULTIPART_FORM_DATA, part.getSubmittedFileName());// 文件流
                    } catch (IOException e) {
                        logger.warn("add part file error,message:" + e.getMessage());
                    }
                }
                builder.setEntity(partFileBuilder.build());
            } else {
                // 普通请求，构建请求体
                BasicHttpEntity basicHttpEntity = new BasicHttpEntity();
                basicHttpEntity.setContent(routeContext.getRequestContent());
                // if the entity contentLength isn't set, transfer-encoding will be set
                // to chunked in org.apache.http.protocol.RequestContent. See gh-1042
                builder.setEntity(basicHttpEntity);
            }
        }
        builder.setConfig(getRequestConfig());
        return builder.build();
    }

    @Override
    public RouteResponse executor(RouteRequestContext routeContext) {
        RouteResponse routeResponse = null;
        try {
            // 判断当前接口是否需要执行basic
            CloseableHttpResponse closeableHttpResponse = getClient().execute(buildRequest(routeContext));
            routeResponse = new ApacheClientResponse(closeableHttpResponse);
        } catch (Exception e) {
            logger.error("Executor Failed,message:" + e.getMessage(), e);
            // 当前异常有可能是服务下线导致
            if (e instanceof HttpHostConnectException) {
                // 服务下线，连接失败
                routeResponse = new DefaultClientResponse(routeContext.getOriginalUri(), e.getMessage(), 504);
            } else {
                routeResponse = new DefaultClientResponse(routeContext.getOriginalUri(), e.getMessage());
            }
        }
        return routeResponse;
    }

}

```

### 10. AggregationConfig
**注意** 因为使用了knif4j集成依赖的一些实体对象，所以需要手动排除 `Knife4jAggregationAutoConfiguration` 配置类
```java
package com.light.cloud.common.web.openapi.aggregation.config;

import cn.hutool.core.util.StrUtil;
import com.github.xiaoymin.knife4j.aggre.core.RouteCache;
import com.github.xiaoymin.knife4j.aggre.core.RouteRepository;
import com.github.xiaoymin.knife4j.aggre.core.cache.RouteInMemoryCache;
import com.github.xiaoymin.knife4j.aggre.core.common.ExecutorEnum;
import com.github.xiaoymin.knife4j.aggre.core.pojo.BasicAuth;
import com.github.xiaoymin.knife4j.aggre.core.pojo.SwaggerRoute;
import com.github.xiaoymin.knife4j.aggre.repository.CloudRepository;
import com.github.xiaoymin.knife4j.aggre.repository.DiskRepository;
import com.github.xiaoymin.knife4j.aggre.repository.EurekaRepository;
import com.github.xiaoymin.knife4j.aggre.repository.NacosRepository;
import com.github.xiaoymin.knife4j.aggre.spring.configuration.HttpConnectionSetting;
import com.github.xiaoymin.knife4j.aggre.spring.configuration.Knife4jAggregationProperties;
import com.github.xiaoymin.knife4j.aggre.spring.support.CloudSetting;
import com.github.xiaoymin.knife4j.aggre.spring.support.DiskSetting;
import com.github.xiaoymin.knife4j.aggre.spring.support.EurekaSetting;
import com.github.xiaoymin.knife4j.aggre.spring.support.NacosSetting;
import com.light.cloud.common.web.openapi.aggregation.RouteDispatcher;
import com.light.cloud.common.web.openapi.aggregation.filter.RouteProxyFilter;
import com.light.cloud.common.web.openapi.aggregation.filter.SecurityBasicAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.filter.OrderedFormContentFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.Objects;

/**
 * @see com.github.xiaoymin.knife4j.aggre.spring.configuration.Knife4jAggregationAutoConfiguration
 */
@Configuration
@EnableConfigurationProperties({Knife4jAggregationProperties.class, HttpConnectionSetting.class,
        DiskSetting.class, CloudSetting.class, EurekaSetting.class,
        NacosSetting.class, BasicAuth.class})
@ConditionalOnProperty(name = "knife4j.enable-aggregation", havingValue = "true")
public class AggregationConfig {

    final Environment environment;

    @Autowired
    public AggregationConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    public RouteCache<String, SwaggerRoute> routeCache() {
        return new RouteInMemoryCache();
    }

    @Bean(initMethod = "start", destroyMethod = "close")
    @ConditionalOnProperty(name = "knife4j.cloud.enable", havingValue = "true")
    public CloudRepository cloudRepository(@Autowired Knife4jAggregationProperties knife4jAggregationProperties) {
        return new CloudRepository(knife4jAggregationProperties.getCloud());
    }

    @Bean(initMethod = "start", destroyMethod = "close")
    @ConditionalOnProperty(name = "knife4j.eureka.enable", havingValue = "true")
    public EurekaRepository eurekaRepository(@Autowired Knife4jAggregationProperties knife4jAggregationProperties) {
        return new EurekaRepository(knife4jAggregationProperties.getEureka());
    }

    @Bean(initMethod = "start", destroyMethod = "close")
    @ConditionalOnProperty(name = "knife4j.nacos.enable", havingValue = "true")
    public NacosRepository nacosRepository(@Autowired Knife4jAggregationProperties knife4jAggregationProperties) {
        return new NacosRepository(knife4jAggregationProperties.getNacos());
    }

    @Bean
    @ConditionalOnProperty(name = "knife4j.disk.enable", havingValue = "true")
    public DiskRepository diskRepository(@Autowired Knife4jAggregationProperties knife4jAggregationProperties) {
        return new DiskRepository(knife4jAggregationProperties.getDisk());
    }

    @Bean
    public RouteDispatcher routeDispatcher(@Autowired RouteRepository routeRepository,
                                           @Autowired RouteCache<String, SwaggerRoute> routeCache) {
        // 获取当前项目的contextPath
        String contextPath = Objects.toString(environment.getProperty("server.servlet.context-path"), "");
        if (StrUtil.isBlank(contextPath)) {
            contextPath = "/";
        }
        if (StrUtil.isNotBlank(contextPath) && !StrUtil.equals(contextPath, RouteDispatcher.ROUTE_BASE_PATH)) {
            // 判断是否/开头
            if (!StrUtil.startWith(contextPath, RouteDispatcher.ROUTE_BASE_PATH)) {
                contextPath = RouteDispatcher.ROUTE_BASE_PATH + contextPath;
            }
        }
        return new RouteDispatcher(routeRepository, routeCache, ExecutorEnum.APACHE, contextPath);
    }

    /**
     * 注意过滤器的顺序，如果此过滤器在鉴权过滤器后方，会导致转发失败
     * @param routeDispatcher
     * @return
     */
    @Bean
    public FilterRegistrationBean routeProxyFilter(@Autowired RouteDispatcher routeDispatcher) {
        FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean();
        filterRegistrationBean.setFilter(new RouteProxyFilter(routeDispatcher));
        filterRegistrationBean.setOrder(OrderedFormContentFilter.DEFAULT_ORDER + 1);
        filterRegistrationBean.setEnabled(true);
        filterRegistrationBean.addUrlPatterns("/*");
        return filterRegistrationBean;
    }

    @Bean
    @ConditionalOnProperty(name = "knife4j.basic-auth.enable", havingValue = "true")
    public FilterRegistrationBean routeBasicFilter(@Autowired Knife4jAggregationProperties knife4jAggregationProperties) {
        FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean();
        filterRegistrationBean.setFilter(new SecurityBasicAuthFilter(knife4jAggregationProperties.getBasicAuth()));
        filterRegistrationBean.setOrder(10);
        filterRegistrationBean.setEnabled(true);
        filterRegistrationBean.addUrlPatterns("/*");
        return filterRegistrationBean;
    }
}

```


## 前端改造
- knife4j-openapi3-spring-boot-starter 4.5.0
- knife4j-openapi3-ui 4.4.0
- knife4j-openapi3-ui 4.5.0

因为 knife4j 进行聚合后进行接口调试，需要根据 `knife4j-gateway-request` Header头进行路由，改造的主要目的是将这个参数添加到请求中

有些版本，如: `knife4j-openapi3-ui 4.1.0` 此属性拼写错误 `knfie4j-gateway-request`
### 1.准备工作
#### 1. 下载前端源码

```shell
git clone -b v4.5.0 https://github.com/xiaoymin/knife4j
```

#### 2. 修改前端代理 `D:\Workspace\Github\knife4j\knife4j-vue\vue.config.js`

```js
proxy: {
    "/": {
    //target: 'http://localhost:8990/',
    target: 'http://localhost:31112/system/',
    /* target: 'http://knife4j.xiaominfo.com/', */
    ws: true,
    changeOrigin: true
    }
}
```

### 2. 前端源码改造测试
#### 1. 修改接口调用 `D:\Workspace\Github\knife4j\knife4j-vue\src\core\Knife4jAsync.js`
将后台返回的 header 值设置到前端缓存的分组实例对象中，以便调用时读取
```js
/**
 * 解析springdoc-OpenAPI
 * @param {*} data
 */
SwaggerBootstrapUi.prototype.analysisSpringDocOpenApiGroupSuccess = function (data) {
  var that = this;
  var t = typeof data;
  var groupData = null;
  if (t == 'string') {
    // groupData = JSON.parse(data)
    groupData = KUtils.json5parse(data);
  } else {
    groupData = data;
  }
  that.log('响应分组json数据');
  that.log(groupData);
  var serviceOptions = [];
  var allGroupIds = [];
  var groupUrls = KUtils.getValue(groupData, 'urls', [], true);
  var newGroupData = [];
  if (KUtils.arrNotEmpty(groupUrls)) {
    groupUrls.forEach(gu => {
      var newGroup = {
        name: KUtils.getValue(gu, 'name', 'default', true),
        url: KUtils.getValue(gu, 'url', '', true),
        header: KUtils.getValue(gu, 'header', '', true),                  // Add Line
        location: KUtils.getValue(gu, 'url', '', true),
        swaggerVersion: '3.0.3',
        tagSort: KUtils.getValue(groupData, 'tagsSorter', 'order', true),
        operationSort: KUtils.getValue(groupData, 'operationsSorter', 'order', true),
        servicePath: KUtils.getValue(gu, 'servicePath', null, true),
        contextPath: KUtils.getValue(gu, 'contextPath', null, true)
      };
      newGroupData.push(newGroup);
    })
  } else {
    // https://gitee.com/xiaoym/knife4j/issues/I5L440#note_12238431
    // 如果开发者没有创建bean对象，urls对象为空，取而代之的是直接返回url
    newGroupData.push({
      name: KUtils.getValue(groupData, 'name', 'default', true),
      url: KUtils.getValue(groupData, 'url', '', true),
      location: KUtils.getValue(groupData, 'url', '', true),
      swaggerVersion: '3.0.3',
      tagSort: KUtils.getValue(groupData, 'tagsSorter', 'order', true),
      operationSort: KUtils.getValue(groupData, 'operationsSorter', 'order', true),
      servicePath: KUtils.getValue(groupData, 'servicePath', null, true),
      contextPath: KUtils.getValue(groupData, 'contextPath', null, true)
    })
  }
  newGroupData.forEach(function (group) {
    var g = new SwaggerBootstrapUiInstance(
      KUtils.toString(group.name, '').replace(/\//g, '-'),
      group.location,
      group.swaggerVersion
    );
    console.log("groupInfo", group);                                // Add Line
    console.log("desktop", that.desktop);                           // Add Line
    console.log("desktopCode", that.desktopCode);                   // Add Line
    g.url = group.url.replace("/system", "");                       // Add Line
    g.header = KUtils.getValue(group, 'header', '', true),          // Add Line
    g.desktop = that.desktop;
    g.desktopCode = that.desktopCode;
    //排序规则2022.12.6
    g.tagSort = group.tagSort;
    g.operationSort = group.operationSort;
    //增加basePath，主要是网关聚合的场景
    g.servicePath = KUtils.getValue(group, 'servicePath', null, true);
    g.contextPath = KUtils.getValue(group, 'contextPath', null, true);
    // g.url='/test/json';
    var newUrl = '';
    // 此处需要判断basePath路径的情况
    if (group.url != null && group.url != undefined && group.url != '') {
      newUrl = group.url;
    } else {
      newUrl = group.location;
    }
    g.extUrl = newUrl;
    if (that.validateExtUrl == '') {
      that.validateExtUrl = g.extUrl;
    }
    // 判断当前分组url是否存在basePath
    if (
      group.basePath != null &&
      group.basePath != undefined &&
      group.basePath != ''
    ) {
      g.baseUrl = group.basePath;
    }
    // 赋值查找缓存的id
    if (that.cacheApis.length > 0) {
      var cainstance = null;
      that.cacheApis.forEach(ca => {
        if (ca.id == g.groupId) {
          cainstance = ca;
        }
      })
      /*  $.each(that.cacheApis, function (x, ca) {
         if (ca.id == g.groupId) {
           cainstance = ca
         }
       }) */
      if (cainstance != null) {
        g.firstLoad = false;
        // 判断旧版本是否包含updatesApi属性
        if (!cainstance.hasOwnProperty('updateApis')) {
          cainstance['updateApis'] = {};
        }
        g.cacheInstance = cainstance;
        that.log(g);
        // g.groupApis=cainstance.cacheApis;
      } else {
        g.cacheInstance = new SwaggerBootstrapUiCacheApis({
          id: g.groupId,
          name: g.name
        });
      }
    } else {
      g.cacheInstance = new SwaggerBootstrapUiCacheApis({
        id: g.groupId,
        name: g.name
      });
    }
    // 双向绑定
    serviceOptions.push({
      label: g.name,
      value: g.id
    });
    // 增加所有分组id，为afterScript特性
    allGroupIds.push(g.id);
    that.instances.push(g);
  })
  // 赋值分组id
  if (KUtils.arrNotEmpty(that.instances)) {
    that.instances.forEach(inst => {
      inst.allGroupIds = allGroupIds;
    })
  }
  // 初始化所有
  this.serviceOptions = serviceOptions;
  this.store.dispatch('globals/setServiceOptions', serviceOptions);
  // that.$Vue.serviceOptions = serviceOptions;
  if (serviceOptions.length > 0) {
    // that.$Vue.defaultServiceOption = serviceOptions[0].value;
    this.defaultServiceOption = serviceOptions[0].value;
    this.store.dispatch('globals/setDefaultService', serviceOptions[0].value);
  }
}
```

#### 2. `D:\Workspace\Github\knife4j\knife4j-vue\src\views\api\Debug.vue`
将分组实例对象中的header参数设置到请求的 header 中，实现接口的调用
```js
    debugSendRawRequest() {
      // 发送raw类型的请求
      // console("发送raw接口");
      var validateForm = this.validateRawForm();
      if (validateForm.validate) {
        this.debugLoading = true;
        // 发送状态置为已发送请求
        this.debugSend = true;
        // raw类型的请求需要判断是何种类型
        var headers = this.debugHeaders();
        var url = this.debugUrl;
        var methodType = this.debugMethodType.toLowerCase();
        var data = this.rawText;
        var formParams = this.debugRawFormParams();
        // 得到key-value的参数值,对请求类型进行判断，判断是否为path
        if (this.debugPathFlag) {
          const realFormParams = {};
          // 是path类型的接口,需要对地址、参数进行replace处理
          this.debugPathParams.forEach(pathKey => {
            var replaceRege = "{" + pathKey + "}";
            // var value = formParams[pathKey];
            var value = KUtils.getValue(formParams, pathKey, "", true);
            url = url.replace(replaceRege, value);
          });
          for (var key in formParams) {
            // 判断key在debugPath中是否存在
            if (this.debugPathParams.indexOf(key) == -1) {
              // 不存在
              realFormParams[key] = formParams[key];
            }
          }
          // 重新赋值
          formParams = realFormParams;
        }
        var checkResult = this.checkUrlParams(url);
        if (checkResult.result) {
          url = checkResult.url;
          formParams = Object.assign(formParams, checkResult.params);
        }
        var baseUrl = '';
        // 是否启用Host
        if (this.enableHost) {
          baseUrl = this.enableHostText;
        }
        var requestConfig = {
          baseURL: baseUrl,
          url: this.debugCheckUrl(url),
          method: methodType,
          headers: headers,
          params: formParams,
          data: data,
          // Cookie标志
          withCredentials: this.debugSendHasCookie(headers),
          timeout: 0
        }
        // 需要判断是否是下载请求
        // https://gitee.com/xiaoym/knife4j/issues/I1U4LA
        // 判断当前接口规范是OAS3还是Swagger2
        if (this.oas2) {
          // OAS2规范制定了produces的定义,需要判断请求头
          // 需要判断是否是下载请求
          if (this.debugStreamFlag()) {
            // 流请求
            requestConfig = { ...requestConfig, responseType: "blob" };
          }
        } else {
          // 统一追加一个blob类型的响应,在OpenAPI3.0的规范中,没有关于produces的设定，因此无法判断当前请求是否是流的请求
          // https://gitee.com/xiaoym/knife4j/issues/I374SP
          requestConfig = { ...requestConfig, responseType: "blob" };
        }
        // console(headers);
        // console(this.rawText);
        console.log("headers", headers);                              // Add Line
        console.log("formParams", formParams);                        // Add Line
        console.log("requestConfig", requestConfig);                  // Add Line
        requestConfig.url = requestConfig.url.replace("/system", "")  // Add Line
        var startTime = new Date();
        DebugAxios.create()
          .request(requestConfig)
          .then(res => {
            this.debugLoading = false;
            this.handleDebugSuccess(startTime, new Date(), res);
          })
          .catch(err => {
            this.debugLoading = false;
            if (err.response) {
              this.handleDebugError(startTime, new Date(), err.response);
            } else {
              this.$message.error(err.message);
            }
          });
      } else {
        this.$message.info(validateForm.message);
      }
    },
```

改了上面的地方之后，应该就可以成功代理了

### 3. 后端静态文件改造思路

```shell
# 搜索下面方法
analysisSpringDocOpenApiGroupSuccess

# 找到对应的文件
app.5de26223.js   # knife4j-openapi2-ui 4.5.0
app.c31badf5.js   # knife4j-openapi3-ui 4.5.0
app.b0c0d7df.js   # knife4j-openapi3-ui 4.4.0

# 源码中的显眼单词定位 如： that.log('响应分组json数据'); 中的 `响应分组json数据`

# 分别添加获取设置 header 的语句
url:re.a.getValue(e,"url","",!0)
url:re.a.getValue(e,"url","",!0),header:re.a.getValue(e,"header","",!0)

url:re.a.getValue(t,"url","",!0)
url:re.a.getValue(t,"url","",!0),header:re.a.getValue(t,"header","",!0)

t.servicePath=re.a.getValue(e,"servicePath",null,!0)
t.servicePath=re.a.getValue(e,"servicePath",null,!0),t.header=re.a.getValue(e,"header",null,!0)

```

## 问题
### 1. 接口的调用最好使用 `knife4j-gateway-code` 去除当前项目的context-path 否则会出现异常

### 2. 【解决问题一】如果项目本身需要使用聚合接口，需要在所有接口前再添加一次 context-path
```java
@Bean
public OpenAPI openAPI() {
    // 添加 components 后可以重复引用
    Components components = new Components()
            .addParameters(PlatformConstant.HEADER_CLIENT_ID, clientId())
            .addParameters(PlatformConstant.HEADER_AUTHORIZATION, authorization());
    return new OpenAPI()
            .info(
                    new Info().title(serviceName)
                            .description(openapiProperties.getDescription())
                            .version(openapiProperties.getVersion())
                            .license(new License()
                                    .name(openapiProperties.getLicenseName())
                                    .url(openapiProperties.getLicenseUrl()))
                            .contact(new Contact()
                                    .name(openapiProperties.getContactName())
                                    .email(openapiProperties.getContactEmail())
                                    .url(openapiProperties.getContactUrl()))
                            .termsOfService(openapiProperties.getTermsOfServiceUrl())
            )
            //外部文档
            .externalDocs(new ExternalDocumentation()
                    .description("官方文档").url("https://springdoc.org")
            )
            // webhooks
//                .webhooks(new HashMap<>())
            // 全局统一安全认证配置 一个key对应一个schema（安全配置），
            // 对接口添加 @SecurityRequirement 可使用不同的安全规则
            .schemaRequirement(PlatformConstant.HEADER_AUTHORIZATION, apikeySecuritySchema())
//                .schemaRequirement(PlatformConstant.HEADER_CLIENT_ID, apikeySecuritySchema())
//                .schemaRequirement(HttpHeaders.AUTHORIZATION, oauth2SecuritySchema())
            // 全局安全校验项，也可以在对应的controller上加注解SecurityRequirement
            .addSecurityItem(new SecurityRequirement().addList(PlatformConstant.HEADER_AUTHORIZATION))
            // 组件定义
            .components(components);
}

/**
 * 添加全局的请求头参数，并为所有接口添加context-path
 */
@Bean
public OpenApiCustomizer customerGlobalOpenApiCustomizer() {
    return openApi -> {
        Paths paths = openApi.getPaths();
        String[] pathSet = paths.keySet().toArray(new String[0]);
        for (String path : pathSet) {
            PathItem pathItem = paths.get(path);
            // 添加全局的请求头参数
            pathItem.readOperations().forEach(operation -> {
                // 引用在 OpenAPI 中定义的 components
                operation.addParametersItem(new HeaderParameter().$ref("#/components/parameters/" + PlatformConstant.HEADER_CLIENT_ID))
                        .addParametersItem(new HeaderParameter().$ref("#/components/parameters/" + PlatformConstant.HEADER_AUTHORIZATION));
            });
            // 为接口添加 context-path
            paths.put(contextPath + path, pathItem);
            paths.remove(path);
        }
    };
}
```

Note: 这种方式会导致直接调用本地接口（非聚合方式）报错

### 3. 对于项目默认需要Token校验的，可以使用 components 实现参数的复用

### 4. 一个自定义动态注册 RequestMapping 的 Bug
- [Java内存马-SpringMVC篇](https://blog.csdn.net/mole_exp/article/details/123992395)
- [springboot 2.6.x 自定义注册 RequestMapping](https://blog.csdn.net/maple_son/article/details/122572869)

```shell
java.lang.IllegalArgumentException:  Expected lookupPath in request attribute "org.springframework.web.util.UrlPathHelper.PATH".
```

```yaml
spring:
  # Spring MVC 处理映射匹配的默认策略已从AntPathMatcher更改为PathPatternParser。
  # 此处配置为使用AntPathMatcher兼容 swagger 相关的路径匹配
  mvc:
    path-match:
      matching-strategy: ANT_PATH_MATCHER
```
