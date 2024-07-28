[基于openssl工具完成自建CA以及为server,client颁发证书](https://blog.csdn.net/weixin_42700740/article/details/117527769)

# 基于openssl工具完成自建CA以及为server,client颁发证书

## **一.openssl简介**

  openssl 是目前最流行的 SSL **密码库工具**，其提供了一个通用、健壮、功能完备的工具套件，用以支持SSL/TLS 协议的实现。\n官网：[openssl官网](https://www.openssl.org/source/)

### **1.1 主要构成部分**

```javascript
1.密码算法库(对称加密、非对称加密、HASH运算等)
2.密钥和证书封装管理功能(证书申请、颁发、撤销)
3.SSL通信API接口(https通信SSL接口)
```

### **1.2 openssl用途**

```javascript
1.建立 RSA、DH、DSA key 参数
2.建立 X.509 证书、证书签名请求(CSR)和CRLs(证书撤销列表)
3.计算消息摘要HASH
4.使用各种 Cipher加密/解密
5.SSL/TLS 客户端以及服务器的测试
6.处理S/MIME 或者加密邮件
```

### **1.3 证书、密钥、CSR请求文件、CRL列表 查看命令**

证书查看：

```javascript
openssl x509 -in cert.crt -noout -text
```

私钥查看：

```javascript
openssl rsa -text -in server.key
```

公钥查看：

```javascript
openssl rsa -pubin -in pcapubkey.pem -text -noout
```

CSR查看：

```javascript
openssl req -text -in server.csr -noout
```

CRL列表查看：

```javascript
openssl crl -in testca.crl -text -noout
```

## **二.RSA密钥操作**

### **2.1密钥生成**

默认情况下，openssl 输出格式为 PKCS#1-PEM\n生成RSA私钥(无加密)：

```javascript
openssl genrsa -out rsa_private.key 2048
```

生成RSA公钥：

```javascript
openssl rsa -in rsa_private.key -pubout -out rsa_public.key
```

生成RSA私钥(使用aes256加密)：

```javascript
openssl genrsa -aes256 -passout pass:123456 -out rsa_aes_private.key 2048
```

其中 passout 代替shell 进行密码输入，否则会提示输入密码；\n生成加密后的内容如：

```javascript
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-256-CBC,5584D000DDDD53DD5B12AE935F05A007
Base64 Encoded Data
-----END RSA PRIVATE KEY-----
```

此时若生成公钥，需要提供密码

```javascript
openssl rsa -in rsa_aes_private.key -passin pass:111111 -pubout -out rsa_public.key
```

其中 passin 代替shell 进行密码输入，否则会提示输入密码；

将需要输入密码使用的.key私钥文件转成不需要输入密码的.key文件（其实就是使用passin将密码提前输入了）：

```javascript
openssl rsa -in client.key -passin pass:222222 -out client.key
```

从证书中提取私钥：

```javascript
openssl x509 -in rca.cer -pubkey -noout > rcapubkey.pem
```

### **2.2 转换命令**

私钥转非加密：

```javascript
openssl rsa -in rsa_aes_private.key -passin pass:111111 -out rsa_private.key
```

私钥转加密：

```javascript
openssl rsa -in rsa_private.key -aes256 -passout pass:111111 -out rsa_aes_private.key
```

私钥PEM转DER：

```javascript
openssl rsa -in rsa_private.key -outform der-out rsa_aes_private.der
```

\-inform和-outform 参数制定输入输出格式，由der转pem格式同理。

pem转crt格式：

```javascript
openssl x509 -in fullchain.pem -out fullchain.crt
```

pem转key格式：

```javascript
openssl rsa -in privkey.pem -out privkey.key
```

查看私钥明细（使用-pubin参数可查看公钥明细）：

```javascript
openssl rsa -in rsa_private.key -noout -text
```

私钥PKCS#1转PKCS#8

```javascript
openssl pkcs8 -topk8 -in rsa_private.key -passout pass:111111 -out pkcs8_private.key
```

其中-passout指定了密码，输出的pkcs8格式密钥为加密形式，pkcs8默认采用des3 加密算法，内容如下：

```javascript
-----BEGIN ENCRYPTED PRIVATE KEY-----
Base64 Encoded Data
-----END ENCRYPTED PRIVATE KEY-----
```

使用-nocrypt参数可以输出无加密的pkcs8密钥，如下：

```javascript
-----BEGIN PRIVATE KEY-----
Base64 Encoded Data
-----END PRIVATE KEY-----
```

### **2.3 使用公私钥进行密码学运算**

1\.私钥的生成

```javascript
openssl genras -out private.pem 2048
```

2\.使用私钥生成公钥

```javascript
openssl rsa -in ./private.pem -pubout -out public.pem
```

3\.使用公钥对文件进行加密

```javascript
openssl rsautl -encrypt -in ./a.txt -inkey public.pem -pubin -out message.en
```

4\.使用私钥对加密文件进行解密

```javascript
openssl rsautl -decrypt -in ./message.en -inkey private.pem -out message.txt
```

5\.使用私钥对文件进行签名

```javascript
openssl dgst -sign private.pem -md5 -out message.sign a.txt
```

6\.使用公钥对签名后的文件进行验签

```javascript
openssl dgst -verify public.pem -md5 -signature message.sign a.txt
```

7\.摘要算法

```javascript
openssl dgst -sha1 file.txt		//只计算摘要，不导出文件
openssl sha1 file.txt			//只计算摘要，不导出文件
openssl sha1 -out digest.txt file.txt	//导出文件
```

## **三.生成自签名证书**

### **3.1 生成 RSA 私钥和自签名证书**

```javascript
openssl req -newkey rsa:2048 -nodes -keyout rsa_private.key -x509 -days 365 -out cert.crt
```

  其中req是证书请求的子命令，-newkey rsa:2048 -keyout private_key.pem 表示生成私钥(PKCS8格式)，-nodes 表示私钥不加密，若不带参数将提示输入密码；-x509表示输出证书，-days365 为有效期，此后根据提示输入证书拥有者信息；\n若执行自动输入，可使用-subj选项：

```javascript
openssl req -newkey rsa:2048 -nodes -keyout rsa_private.key \
  -x509 -days 365 -out cert.crt \
  -subj "/C=CN/ST=GD/L=SZ/O=vihoo/OU=dev/CN=vivo.com/emailAddress=yy@vivo.com"
```

### **3.2 使用 已有RSA 私钥生成自签名证书**

```javascript
openssl req -new -x509 -days 365 -key rsa_private.key -out cert.crt
```

\-new 指生成证书请求，加上-x509 表示直接输出证书，-key 指定私钥文件，其余选项与上述命令相同。

## **四.生成签名请求及CA 签名**

### **4.1 使用 RSA私钥生成 CSR 签名请求**

```javascript
openssl genrsa -aes256 -passout pass:111111 -out server.key 2048
openssl req -new -key server.key -out server.csr
```

此后输入密码、server证书信息完成，也可以命令行指定各类参数

```javascript
openssl req -new -key server.key -passin pass:111111 -out server.csr -subj "/C=CN/ST=GD/L=SZ/O=vihoo/OU=dev/CN=vivo.com/emailAddress=yy@vivo.com"
```

\*\*\* 此时生成的 csr签名请求文件可提交至 CA进行签发 \*\*\*

### **4.2 查看CSR 的细节**

```javascript
cat server.csr
-----BEGIN CERTIFICATE REQUEST-----
Base64EncodedData
-----END CERTIFICATE REQUEST-----
openssl req -noout -text -in server.csr
```

### **4.3 使用 CA 证书及CA密钥 对请求签发证书进行签发，生成 x509证书**

```javascript
openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey ca.key -passin pass:111111 -CAcreateserial -out server.crt
```

其中 CAxxx 选项用于指定CA 参数输入

## **五.证书查看及转换**

查看证书细节：

```javascript
openssl x509 -in cert.crt -noout -text
```

转换证书编码格式：

```javascript
openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
```

合成 pkcs#12 证书(含私钥)

将 pem 证书和私钥转 pkcs#12 证书 ：

```javascript
openssl pkcs12 -export -in server.crt -inkey server.key -passin pass:111111 -password pass:111111 -out server.p12
```

其中-export指导出pkcs#12 证书，-inkey 指定了私钥文件，-passin 为私钥(文件)密码(nodes为无加密)，-password 指定 p12文件的密码(导入导出)。

将 pem 证书和私钥/CA 证书 合成pkcs#12 证书：

```javascript
openssl pkcs12 -export -in server.crt -inkey server.key -passin pass:111111 \
-chain -CAfile ca.crt -password pass:111111 -out server-all.p12
```

其中-chain指示同时添加证书链，-CAfile 指定了CA证书，导出的p12文件将包含多个证书。(其他选项：-name可用于指定server证书别名；-caname用于指定ca证书别名)

pcks#12 提取PEM文件(含私钥) ：

```javascript
openssl pkcs12 -in server.p12 -password pass:111111 -passout pass:111111 -out out/server.pem
```

其中-password 指定 p12文件的密码(导入导出)，-passout指输出私钥的加密密码(nodes为无加密)。

导出的文件为pem格式，同时包含证书和私钥(pkcs#8)：

```javascript
Bag Attributes
localKeyID: 97 DD 46 3D 1E 91 EF 01 3B 2E 4A 75 81 4F 11 A6 E7 	1F 79 40 
subject=/C=CN/ST=GD/L=SZ/O=vihoo/OU=dev/CN=vihoo.com/emailAddress=yy@vihoo.com
issuer=/C=CN/ST=GD/L=SZ/O=viroot/OU=dev/CN=viroot.com/emailAddress=yy@viroot.com
-----BEGIN CERTIFICATE-----
MIIDazCCAlMCCQCIOlA9/dcfEjANBgkqhkiG9w0BAQUFADB5MQswCQYDVQQGEwJD
1LpQCA+2B6dn4scZwaCD
-----END CERTIFICATE-----
Bag Attributes
localKeyID: 97 DD 46 3D 1E 91 EF 01 3B 2E 4A 75 81 4F 11 A6 E7 1F 79 40 
Key Attributes: <No Attributes>
-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDC/6rAc1YaPRNf
K9ZLHbyBTKVaxehjxzJHHw==
-----END ENCRYPTED PRIVATE KEY-----
```

仅提取私钥：

```javascript
 openssl pkcs12 -in server.p12 -password pass:111111 -passout pass:111111 -nocerts -out out/key.pem
```

仅提取证书(所有证书)：

```javascript
 openssl pkcs12 -in server.p12 -password pass:111111 -nokeys -out out/key.pem
```

仅提取ca证书：

```javascript
openssl pkcs12 -in server-all.p12 -password pass:111111 -nokeys -cacerts -out out/cacert.pem 
```

仅提取server证书：

```javascript
openssl pkcs12 -in server-all.p12 -password pass:111111 -nokeys -clcerts -out out/cert.pem 
```

## **六.基于OPENSSL自建CA，同时为server,client颁发证书**

### **6.1 自建CA**

  在进行https通信时需要做双向认证，我们可以利用自己建立的测试CA来为服务器端颁发服务器数字证书，为客户端（浏览器）生成文件形式的数字证书（可以同时利用openssl生成客户端私钥）。

#### **6.1.1 1 创建CA需要用到的目录和文件**

随便找个目录比如/home，在该目录下创建自建CA所需要用的文件夹：

```javascript
mkdir testca
cd testca
mkdir newcerts private conf    //创建证书、私钥、配置文件夹备用
chmod g-rwx,o-rwx private      //设置private文件夹的操作权限，为group和other均可读写、执行
echo "01" > serial             //用于存放下一个证书的序列号
touch index.txt					//用于存放证书信息数据库
mkdir newcerts private conf    //创建证书、私钥、配置文件夹备用
chmod g-rwx,o-rwx private  	 //设置private文件夹的操作权限，为group和other均可读写、执行
echo "01" > serial            	 //用于存放下一个证书的序列号
touch index.txt					//用于存放证书信息数据库
```

说明：\n  testca为待建CA的主目录。其中newcerts子目录将存放CA签署（颁发）过的数字证书（证书备份目录）。而private目录用于存放CA的**私钥**。目录conf只是用于存放一些简化参数用的**配置文件**。\n  文件serial和index.txt分别用于存放下一个证书的序列号和证书信息数据库。当然，偷懒起见，可以只用按照本文操作即可，不一定需要关心各个目录和文件的作用。

#### **6.1.2 生成CA的私钥和自签名证书（即根证书,自建CA需要生成私钥和CA证书）**

创建文件：（在conf文件夹下：）\ngedit gentestca.conf\n文件内容如下：

```javascript
####################################
[ req ]
default_keyfile = /home/testca/private/cakey.pem		#需要修改为自己的实际路径
default_md = md5
prompt = no
distinguished_name = ca_distinguished_name
x509_extensions = ca_extensions

[ ca_distinguished_name ]
organizationName = TestOrg          				 #可以自定义CA的信息
organizationalUnitName  = TestDepartment  		 #可以自定义CA的信息
commonName = TestCA								#可以自定义CA的信息
emailAddress = ca_admin@testorg.com   			#可以自定义CA的信息

[ ca_extensions ]
basicConstraints = CA:true
########################################
```

 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/newCodeMoreWhite.png)

进入testca目录下然后执行命令如下（生成X509的CA证书）：

```javascript
openssl req -x509 -newkey rsa:2048 -out cacert.pem -outform PEM -days 2190 -config "/home/testca/conf/gentestca.conf"
```

执行过程中需要输入CA私钥的保护密码，假设我们输入密码：123456。\n简单解释：CA使用自己的私钥cakey.pem（在gentestca.conf文件中指定）按照gentestca.conf文件中的规则自签名生成证书。

可以用如下命令查看一下CA自己证书的内容：

```javascript
openssl x509 -in cacert.pem -text -noout
```

#### **6.1.3 创建一个配置文件，以便后续CA日常操作中使用（为其他请求签发证书时的配置）：**

在conf文件夹下创建文件：

```javascript
gedit testca.conf
```

文件内容如下：

```javascript
####################################
[ ca ]
default_ca      = testca                   # 按需修改

[ testca ]										 # 按需修改
dir            	= /home/testca   		# top dir，按实际给出
database       	= $dir/index.txt          # index file.
new_certs_dir  	= $dir/newcerts           # new certs dir

certificate    		= $dir/cacert.pem         	# The CA cert
serial         		= $dir/serial             		# serial no file
private_key    	= $dir/private/cakey.pem  	# CA private key
RANDFILE       	= $dir/private/.rand      	# random number file

default_days   = 365                     	# how long to certify for
default_crl_days= 30                     	# how long before next CRL
default_md     = md5                    	 # message digest method to use
unique_subject = no                      	# Set to 'no' to allow creation of
                                     			# several ctificates with same subject.
policy         = policy_any              	# default policy

[ policy_any ]
countryName             = optional
stateOrProvinceName     = optional
localityName            = optional
organizationName        = optional
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional
 
########################################
```

 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/newCodeMoreWhite.png)

### **6.2 CA的常规操作**

  在我们自建CA完成之后，就相当于有了一个证书颁发机构，可以执行如下的一些常规操作：

#### **6.2.1 根据证书申请请求签发证书(为其他请求签发证书)**

  假设收到一个证书请求文件名为req.pem，文件格式应该是PKCS#10格式（标准证书请求格式）。\n首先可以查看一下证书请求的内容，执行命令：

```javascript
openssl req -in req.pem -text -noout
```

  将看到证书请求的内容，包括请求者唯一的名字（DN）、公钥信息（可能还有一组扩展的可选属性）。

执行签发命令：

```javascript
openssl ca -in req.pem -out cert.pem -config "/home/testca/conf/testca.conf"
```

  执行过程中会要求输入访问CA的私钥密码（刚才设置的123456）。\n  签发命令简单解释：实际上就是请求方将自己的请求文件req.pem发给CA，CA按照之前写好的配置文件testca.conf中的规则给请求方生成证书cert.pem。

  完成上一步后，签发好的证书就是cert.pem，另外/home/testca/newcerts里也会有一个相同的证书副本（文件名为证书序列号）。

你可以执行以下语句来查看生成的证书的内容：

```javascript
openssl x509 -in cert.pem -text -noout
```

#### **6.2.2 吊销证书（作废证书）**

  一般由于用户私钥泄露等情况才需要吊销一个未过期的证书。（当然我们用本测试CA时其时很少用到该命令，除非专门用于测试吊销证书的情况）\n假设需要被吊销的证书文件为cert.pem，则执行以下命令吊销证书：

```javascript
openssl ca -revoke cert.pem -config "$HOME/testca/conf/testca.conf"
```

#### **6.2.3 生成证书吊销列表文件（CRL）**

  准备公开被吊销的证书列表时，可以生成证书吊销列表（CRL），执行命令如下：

```javascript
openssl ca -gencrl -out testca.crl -config "$HOME/testca/conf/testca.conf"
```

  还可以添加-crldays和-crlhours参数来说明下一个吊销列表将在多少天后（或多少小时候）发布。

  可以用以下命令检查testca.crl的内容：

```javascript
openssl crl -in testca.crl -text -noout
```

### **6.3 CA为server签发证书**

任意路径下创建一个文件夹server:

```javascript
mkdir sever
```

生成server的私钥server.key及证书申请的请求文件serverreq.pem：

```javascript
openssl req -newkey rsa:1024 -keyout server.key -out serverreq.pem -subj "/O=ServerCom/OU=ServerOU/CN=server"
```

设置私钥保护密码为：111111\n解释：server生成请求文件serverreq.pem之后就可以将这个文件发送给CA申请证书了，操作如下：

提交serverreq.pem向CA申请证书并生成证书server.crt：

```javascript
openssl ca -in serverreq.pem -out server.crt -config "/home/testca/conf/testca.conf"
```

解释：可以看出-in表示提交给CA的文件，就是申请文件，-out表示输出文件就是server的证书server.crt，其中生成证书的规则-config是按照之前CA定义的testca.conf文件，这里路径不要写错。\n至此，server证书申请成功，可以看到共有三个文件：\n ![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/6c1ec74b4c40da60fd11b2a44e517661.png)\n同时，在CA目录下newcerts目录下也生成了该证书的备份：01.pem，这和备份的内容和生成的证书server.crt完全一致。

### **6.4 CA为client签发证书**

client的证书生成方式和server完全一致，这里就不在赘述。

### **6.5 server和client基于证书完成https通信**

  https通信需要完成证书验证，我们在上面以及自建了CA，并为server和client颁发了证书，因此可以基于证书验证实现https通信测试了。具体代码设计可见下一篇博客。

## **五. 感谢支持**

    完结撒花！密码学实属复杂深奥的问题，不仅在原理上难以理解，在代码实现上更是难的一批，写这篇文章花了我很大精力。希望看到这里的小伙伴能点个关注，我后续会持续更新更多关于密码学原理分析和实现，也欢迎大家广泛交流。\n    码字实属不易，如果本文对你有10分帮助，就赏个10分把，感谢各位大佬支持！