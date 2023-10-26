
## 调用HTTPS接口报错
### unable to find valid certification path to requested target
1. 在浏览器 - 不安全 - 证书无效 - 详细信息 - 导出(Base64 ASCII单一证书 pem crt) - test.cer

2. 导入证书到keystore 秘钥 changeit
```shell
# 列出所有的证书
keytool -list -keystore "%JAVA_HOME%/jre/lib/security/cacerts" -storepass changeit
# 删除已存在证书
keytool -delete -alias test -keystore "%JAVA_HOME%/jre/lib/security/cacerts" -storepass changeit
keytool -delete -alias test -keystore "%JAVA_HOME%\lib\security\cacerts" -storepass changeit

# 导入新证书
keytool -import -alias test -keystore "%JAVA_HOME%/jre/lib/security/cacerts" -storepass changeit -trustcacerts -file D://test.cer 
keytool -import -alias test -keystore "%JAVA_HOME%\lib\security\cacerts" -storepass changeit -trustcacerts -file D://test.cer 
```
其中：
- -alias 指定别名(推荐和证书同名)
- -keystore 指定存储文件(此处固定)
- -file 指定证书文件全路径(证书文件所在的目录)
- -storepass 指定keystore 秘钥
- -trustcacerts 信任证书

**注意:** 当切换到 cacerts 文件所在的目录时,才可指定 -keystore cacerts, 否则应该指定全路径;
此时命令行会提示你输入cacerts证书库的密码,敲入changeit即可,这是java中cacerts证书库的默认密码,当然也可自行修改。

3. 查看证书，密钥仍然是changeit
```shell
keytool -list -keystore "%JAVA_HOME%/jre/lib/security/cacerts" -alias test -storepass changeit
```

4. java程序添加信任
```java
public static void main(String[] args) {
    // 信任证书
    System.setProperty("javax.net.ssl.trustStore", "D:/Develop/Java/jdk1.8/jre/lib/security/cacerts");
    System.setProperty("javax.net.ssl.trustStorePassword", "changeit");

    // 发起https调用
}
```
