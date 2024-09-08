- [如何创建自签名的 SSL 证书](https://www.cnblogs.com/happy-8090/articles/11830636.html)
- [自签名文件的生成过程](https://todocoder.com/posts/015.html)

## 先把用到的命令行放上来方便备查：
如不需要私钥密码，则删掉 -des3 参数即可

### 自签名：
```bash
# 1.生成私钥
$ openssl genrsa -out server.key 2048

# 2.生成 CSR (Certificate Signing Request)
$ openssl req -subj "/C=CN/ST=Tianjin/L=Tianjin/O=Mocha/OU=Mocha Software/CN=test1.sslpoc.com/emailAddress=test@mochasoft.com.cn" -new -key server.key -out server.csr

# 3.生成自签名证书
$ openssl x509 -req -days 3650 -in server.csr -signkey server.key -out server.crt

```

### 私有 CA 签名：
```bash
# 1.创建 CA 私钥
$ openssl genrsa -out ca.key 2048

# 2.生成 CA 的自签名证书
$ openssl req -subj "/C=CN/ST=Tianjin/L=Tianjin/O=Mocha/OU=Mocha Software/CN=Server CA/emailAddress=test@mochasoft.com.cn" -new -x509 -days 3650 -key ca.key -out ca.crt

# 3.生成需要颁发证书的私钥
$ openssl genrsa -out server.key 2048

# 4.生成要颁发证书的证书签名请求，证书签名请求当中的 Common Name 必须区别于 CA 的证书里面的 Common Name
$ openssl req -subj "/C=CN/ST=Tianjin/L=Tianjin/O=Mocha/OU=Mocha Software/CN=test2.sslpoc.com/emailAddress=test@mochasoft.com.cn" -new -key server.key -out server.csr

# 5.用 2 创建的 CA 证书给 4 生成的 签名请求 进行签名
$ openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
```

注：

- 指定证书数据内容
    ```bash
    -subj /C=CN/ST=Guangdong/L=Shenzhen/O=PAX/OU=Common Software/CN=Server CA/emailAddress=qiaojx@paxsz.com
    ```

- 去掉 key 加密的输入提示：去掉 -des3
- 不提问：使用 -batch 参数

## 一、概述
本文非常简单地展示了 SSL 的实现，以及整个过程中，证书所扮演的角色。

### 1、什么是证书及证书的作用
普通的 Web 传输，通过 Internet 发送未加密的数据。这样的话，任何人使用恰当的工具都可以窥视通讯数据的内容。很明显，这会导致出现一些问题，尤其对于有安全和隐私比较敏感的场景，如：信用卡数据、银行交易信息。SSL（Secure Socket Layer）用于加密在 Web Server 与 Web Client（最常见的是 Browser） 之间传递的数据流。
　　
　　SSL 使用非对称加密算法（Asymmetric Cryptography），通常指 PKI（Public Key Cryptography）。使用 PKI 创建两个秘钥，一个公钥，一个私钥。使用任何一个 Key 做的加密，必须使用另外一个进行解密。这样的话，使用服务器私钥加密的数据，只能通过其对应的公钥进行解密，以确保数据是来自服务器。
　　
　　为什么使用 SSL 处理数据需要证书？其实从技术角度来说，证书并不是必需的，数据很安全，而且不容易被第三方解密。但是，证书对于通讯过程，扮演着至关重要的角色。证书通过可信的 CA 签名，以确保证书的持有者与其对外所宣称的身份一致。使用未经认证签名的证书，数据可以被加密，但是与你通讯的一方，可能并不如你想。没有证书的话，伪装攻击（Impersonation Attacks）会变得更为普遍。


### 2、证书的三个作用
- 加密通信
- 身份验证（验证对方确实是对方声称的对象）
- 数据完整性（无法被修改，修改了会被知）

### 3、自签名证书及自签名类型
当由于某种原因（如：不想通过 CA 购买证书，或者仅是用于测试等情况），无法正常获取 CA 签发的证书。这时可以生成一个自签名证书。使用这个临时证书的时候，会在客户端浏览器报一个错误，签名证书授权未知或不可信（signing certificate authority is unknown and not trusted.）。

- 自签名证书
- 私有CA签名的证书

自签名证书的 Issuer 和 Subject 是一样的

区别：
　　自签名的证书无法被吊销，CA 签名的证书可以被吊销。
　　能不能吊销证书的区别在于：如果你的私钥被黑客获取，如果证书不能被吊销，则黑客可以伪装成你与用户进行通信。
　　如果你的规划需要创建多个证书，那么使用 私有 CA 的方法比较合适，因为只要给所有的客户端都安装了 CA 的证书，那么以该证书签名过的证书，客户端都是信任的，也就是安装一次就够了。
　　如果你直接用自签名证书，你需要给所有的客户端安装该证书才会被信任，如果你需要第二个证书，则还的挨个给所有的客户端安装证书2才会被信任。

## 二、自签名证书
### 第一步：生成私钥
openssl工具集用于生成 RSA Private Key 和 CSR (Certificate Signing Request)，也能用于生成自签名证书，用于测试目的或内部使用。
　　第一步创建 RSA Private Key。这个秘钥：

- 1024 bit RSA key
- 使用 3DES 加密
- 使用 PEM 格式存储，ASCII，可读

命令行：
```bash
$ openssl genrsa -des3 -out server.key 1024
```

执行结果：
```bash
Generating RSA private key, 1024 bit long modulus
.........................................................++++++
........++++++
e is 65537 (0x10001)
Enter PEM pass phrase:
Verifying password - Enter PEM pass phrase:
```

### 第二步：从秘钥中删除 Passphrase
我们之前生成的私钥，是带有 passphrase 的。这带来一个副作用，就是需要在使用过程中输入密码。这对于一些特定场景来说会带来一些问题。比如：Apache 的自动启动过程，或者一些工具，甚至有没有提供输入 passphrase 的机会。其实是可以将 3DES 的加密从秘钥中移除的，这样，使用的过程中就不再需要输入 passphrase。这也带来另一个问题，如果其他人获取到了未加密的私钥，对应的证书也需要被吊销，以避免带来危害。
　　使用以下命令行来从秘钥中移除 pass-phrase：
```bash
$ cp server.key server.key.org
$ openssl rsa -in server.key.org -out server.key
```

新创建的 server.key 文件中，不再包含 passphrase。
```bash
-rw-r--r-- 1 root root 745 Jun 29 12:19 server.csr
-rw-r--r-- 1 root root 891 Jun 29 13:22 server.key
-rw-r--r-- 1 root root 963 Jun 29 13:22 server.key.org
```

### 第三步：生成 CSR (Certificate Signing Request)
一旦私钥生成，CSR (Certificate Signing Request) 就可以被生成了。CSR 可以用于以下两种用途中的任何一种：

理想地，将 CSR 发送到 CA，例如： Thawte、Verisign，会做身份验证，并颁发签名证书
对 CSR 进行自签名
本文的下一部分演示就是演示 CSR 进行自签名的方式。

生成 CSR 的过程中，会提示输入一些信息，这些是证书的 X.509 属性。其中一个提示是 Common Name (e.g., YOUR name)，这个非常重要，这一项会填入 FQDN：(Fully Qualified Domain Name)完全合格域名/全称域名，这个 FQDN 会被 SSL 保护。如果要被保护的网站是 https://public.akadia.com，那么输入 public.akadia.com。
　　用于生成 CSR 的命令行如下：
```bash
$ openssl req -new -key server.key -out server.csr
```

执行过程界面如下：
```bash
Country Name (2 letter code) [GB]:CH
State or Province Name (full name) [Berkshire]:Bern
Locality Name (eg, city) [Newbury]:Oberdiessbach
Organization Name (eg, company) [My Company Ltd]:Akadia AG
Organizational Unit Name (eg, section) []:Information Technology
Common Name (eg, your name or your server's hostname) []:public.akadia.com
Email Address []:martin dot zahn at akadia dot ch
Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```

### 第四步：生成自签名证书
当由于某种原因（如：不想通过 CA 购买证书，或者仅是用于测试等情况），无法正常获取 CA 签发的证书。这时可以生成一个自签名证书。使用这个临时证书的时候，会在客户端浏览器报一个错误，签名证书授权未知或不可信（signing certificate authority is unknown and not trusted.）。

生成一个可以使用 365 天的临时证书，使用如下命令行：
```bash
$ openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

执行结果：
```bash
Signature ok
subject=/C=CH/ST=Bern/L=Oberdiessbach/O=Akadia AG/OU=Information
Technology/CN=public.akadia.com/Email=martin dot zahn at akadia dot ch
Getting Private key
```

## 三、创建私有 CA ，然后用该 CA 给证书进行签名
### 第一步：创建 CA 私钥
```bash
$ openssl genrsa -des3 -out ca.key 4096
```

### 第二步：生成 CA 的自签名证书
```bash
$ openssl req -new -x509 -days 365 -key ca.key -out ca.crt
```

其实 CA 证书就是一个自签名证书

### 第三步：生成需要颁发证书的私钥
```bash
$ openssl genrsa -des3 -out server.key 4096
```

### 第四步：生成要颁发证书的证书签名请求
```bash
$ openssl req -new -key server.key -out server.csr
```

这里注意：证书签名请求当中的 Common Name 必须区别于 CA 的证书里面的 Common Name

### 第五步：用第二步创建的 CA 证书给第四步生成的签名请求进行签名
```bash
$ openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
```

## 四、生成证书链多级证书
1、生成根 CA 并自签（Common Name 填 RootCA）
```bash
$ openssl genrsa -des3 -out keys/RootCA.key 2048
$ openssl req -new -x509 -days 3650 -key keys/RootCA.key -out keys/RootCA.crt
```

2、生成二级 CA（Common Name 填 SecondCA）
```bash
$ openssl genrsa -des3 -out keys/secondCA.key 2048
$ openssl rsa -in keys/secondCA.key -out keys/secondCA.key
$ openssl req -new -days 3650 -key keys/secondCA.key -out keys/secondCA.csr
$ openssl ca -extensions v3_ca -in keys/secondCA.csr -config /etc/pki/tls/openssl.cnf -days 3650 -out keys/secondCA.crt -cert keys/RootCA.crt -keyfile keys/RootCA.key
```

3、生成三级 CA（Common Name 填 ThirdCA）
```bash
$ openssl genrsa -des3 -out keys/thirdCA.key 2048
$ openssl rsa -in keys/thirdCA.key -out keys/thirdCA.key
$ openssl req -new -days 3650 -key keys/thirdCA.key -out keys/thirdCA.csr
$ openssl ca -extensions v3_ca -in keys/thirdCA.csr -config /etc/pki/tls/openssl.cnf -days 3650 -out keys/thirdCA.crt -cert keys/secondCA.crt -keyfile keys/secondCA.key
```

4、使用三级 CA 签发服务器证书
```bash
$ openssl genrsa -des3 -out keys/server.key 2048
$ openssl rsa -in keys/server.key -out keys/server.key
$ openssl req -new -days 3650 -key keys/server.key -out keys/server.csr
$ openssl ca -in keys/server.csr -config /etc/pki/tls/openssl.cnf -days 3650 -out keys/server.crt -cert keys/thirdCA.crt -keyfile keys/thirdCA.key
```

注：

指定证书数据内容
-subj /C=CN/ST=Guangdong/L=Shenzhen/O=PAX/OU=Common Software/CN=Server CA/emailAddress=qiaojx@paxsz.com
去掉 key 加密的输入提示：去掉 -des3
不提问：使用 -batch 参数

## 五、吊销证书（作废证书）
首先
```bash
$ echo 00 > /etc/pki/CA/crlnumber
```

一般由于用户私钥泄露等情况才需要吊销一个未过期的证书。（当然我们用本测试 CA 时其时很少用到该命令，除非专门用于测试吊销证书的情况）
假设需要被吊销的证书文件为 cert.pem，则执行以下命令吊销证书：
```bash
$ openssl ca -revoke cert.pem -config /etc/pki/tls/openssl.cnf
```

生成证书吊销列表文件（CRL）
准备公开被吊销的证书列表时，可以生成证书吊销列表（CRL），执行命令如下：
```bash
$ openssl ca -gencrl -out testca.crl -config /etc/pki/tls/openssl.cnf
```

还可以添加 -crldays 和 -crlhours 参数来说明下一个吊销列表将在多少天后（或多少小时候）发布。

可以用以下命令检查 testca.crl 的内容：
```bash
$ openssl crl -in testca.crl -text -noout
```

作者：舌尖上的大胖
链接：https://www.jianshu.com/p/e5f46dcf4664
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。