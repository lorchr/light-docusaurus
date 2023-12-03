## 1. Spring Security各个项目选择
- [Next Generation OAuth 2.0 Support with Spring Security](https://spring.io/blog/2018/01/30/next-generation-oauth-2-0-support-with-spring-security)
- [Spring Security OAuth 2.0 Roadmap Update](https://spring.io/blog/2019/11/14/spring-security-oauth-2-0-roadmap-update)
- [Announcing the Spring Authorization Server](https://spring.io/blog/2020/04/15/announcing-the-spring-authorization-server)
- [OAuth 2.0 Features Matrix](https://github.com/spring-projects/spring-security/wiki/OAuth-2.0-Features-Matrix)

- [spring-security](https://github.com/spring-projects/spring-security)
- [spring-security Doc](https://docs.spring.io/spring-security/reference/servlet/authorization/index.html)
- [spring-security-samples](https://github.com/spring-projects/spring-security-samples/tree/main/servlet/spring-boot/java/oauth2)

- [spring-authorization-server](https://github.com/spring-projects/spring-authorization-server)
- [spring-authorization-server Doc](https://docs.spring.io/spring-authorization-server/docs/current/reference/html/index.html)
- [stackoverflow](https://stackoverflow.com/questions/tagged/spring-authorization-server)


https://blog.csdn.net/qq_37182370/article/details/124822587

https://www.cnblogs.com/openstack-elk/p/10150356.html

https://blog.51cto.com/u_15882671/5871070
https://my.oschina.net/u/4347688/blog/3561682
http://c.biancheng.net/view/4082.html


## What is the difference between spring-boot-starter-oauth2-client, spring-cloud-starter-oauth2 and spring-security-oauth2
[About spring security artifact choose](https://stackoverflow.com/questions/71081479/what-is-the-difference-between-spring-boot-starter-oauth2-client-spring-cloud-s)

### Question
I am developing a client application for client_credentials grant type flow in OAUTH2.

I am not able to decide on which dependency to use in my project for this purpose among the following.

1. spring-boot-starter-oauth2-client
2. spring-cloud-starter-oauth2
3. spring-security-oauth2

I referred this documentation from spring-projects in which under client-support section it had a table describing the available options. But I am not able to understand which column is referring to which of the above dependencies.

I want to configure a WebClient or RestTemplate which retrieves the OAUTH2 token from the auth-server automatically before accessing a resource-server.

Please guide me in choosing the right artifact for my project.

### Answer
If you are using Spring Boot you should choose `org.springframework.boot:spring-boot-starter-oauth2-client`.

This includes Spring Security's OAuth 2.0 Client support and provides Spring Boot auto-configuration to set up OAuth2/Open ID Connect clients.

You can read about how to configure client in the Spring Boot [reference documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#web.security.oauth2.client).

You can also find additional details in the Spring Security [reference documentation](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html).

If you are not using Spring Boot then you should choose `org.springframework.security:spring-security-oauth2-client`. This also provides Spring Security's latest OAuth 2.0 Client support, but does not include the Spring Boot auto-configuration.

The corresponding documentation is also the Spring Security [reference documentation](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html).

The third dependency you mentioned `org.springframework.security.oauth:spring-security-oauth2` should not be used because it is part of the [legacy Spring Security OAuth](https://spring.io/projects/spring-security-oauth) project, which is now deprecated.
The functionality that this library provided has now been moved into Spring Security.
That is what the [Migration Guide](https://github.com/spring-projects/spring-security/wiki/OAuth-2.0-Features-Matrix#client-support) describes, the migration from the legacy project to the latest Spring Security support.

You should not use the `org.springframework.cloud:spring-cloud-starter-oauth2` at this time, because it relies on the legacy OAuth support.
This is likely to change in the future, as the Spring Cloud team updates to the latest Spring Security support.

