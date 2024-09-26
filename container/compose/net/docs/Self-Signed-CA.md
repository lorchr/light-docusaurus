### 1. 生成泛域名证书

#### 1. 生成ROOT CA证书

```bash
# 创建证书目录：/root/cert，进入/root/cert 创建 ca.key，密码 123456
openssl genrsa -des3 -out ca.key 2048

# 使用生成的密钥(ca.key)来创建新的根SSL证书。并将其保存为 ca.pem，证书有效期为10年
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.pem

# 可以替换为下面格式，不需要输入信息确认，记录CN即可
# openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.pem -subj "/C=CN/ST=Hubei/L=Wuhan/O=Torch/OU=develop/CN=light"

# 这一行是把 pem 转换成 crt 格式
openssl x509 -outform der -in ca.pem -out ca.crt

```

输出结果

```bash
# 需要输入密码，下面生成 pem 会用到
light@TP862:~/cert$ openssl genrsa -des3 -out ca.key 2048
Enter PEM pass phrase:123456
Verifying - Enter PEM pass phrase:123456

# 提示填写的字段大多都可以直接回车过就行了，只要Common Name字段需要填写内容，这是生成跟证书后导入到系统的证书名称，我填的是light
light@TP862:~/cert$ openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.pem
Enter pass phrase for ca.key:123456
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:Hubei
Locality Name (eg, city) []:Wuhan
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Torch
Organizational Unit Name (eg, section) []:develop
Common Name (e.g. server FQDN or YOUR name) []:light
Email Address []:light@torch.local

```

#### 2. 生产域名证书

```bash
# 创建生成域名ssl证书的前置文件
cat >> caddy.light.local.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName=@alt_names

[alt_names]
DNS.1 = caddy.light.local
EOF

# 生成域名ssl证书秘钥
openssl req -new -sha256 -nodes -out caddy.light.local.csr -newkey rsa:2048 -keyout caddy.light.local.key

# 可以替换为下面格式，不需要输入信息确认，记录CN即可
# openssl req -new -sha256 -nodes -out  caddy.light.local.csr -newkey rsa:2048 -keyout  caddy.light.local.key -subj "/C=CN/ST=Hubei/L=Wuhan/O=Torch/OU=develop/CN=light"

# 通过我们之前创建的根SSL证书 ca.pem, ca.key 颁发，创建出一个 *.light.local 的域名证书。输出是一个名为的证书文件 light.local.crt
openssl x509 -req -in  caddy.light.local.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out  caddy.light.local.crt -days 3650 -sha256 -extfile caddy.light.local.ext


# 创建生成域名ssl证书的前置文件
cat >> keycloak.light.local.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName=@alt_names

[alt_names]
DNS.1 = keycloak.light.local
EOF

# 生成域名ssl证书秘钥
# 可以替换为下面格式，不需要输入信息确认，记录CN即可
openssl req -new -sha256 -nodes -out  keycloak.light.local.csr -newkey rsa:2048 -keyout  keycloak.light.local.key -subj "/C=CN/ST=Hubei/L=Wuhan/O=Torch/OU=develop/CN=light"

# 通过我们之前创建的根SSL证书 ca.pem, ca.key 颁发，创建出一个 *.light.local 的域名证书。输出是一个名为的证书文件 light.local.crt
openssl x509 -req -in  keycloak.light.local.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out  keycloak.light.local.crt -days 3650 -sha256 -extfile keycloak.light.local.ext

```

#### 3. 生产泛域名证书

```bash
# 创建生成域名ssl证书的前置文件
cat >> light.local.ext <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName=@alt_names

[alt_names]
DNS.1 = *.light.local
EOF

# 生成域名ssl证书秘钥
openssl req -new -sha256 -nodes -out light.local.csr -newkey rsa:2048 -keyout light.local.key

# 可以替换为下面格式，不需要输入信息确认，记录CN即可
# openssl req -new -sha256 -nodes -out light.local.csr -newkey rsa:2048 -keyout light.local.key -subj "/C=CN/ST=Hubei/L=Wuhan/O=Torch/OU=develop/CN=light"

# 通过我们之前创建的根SSL证书 ca.pem, ca.key 颁发，创建出一个 *.light.local 的域名证书。输出是一个名为的证书文件 light.local.crt
openssl x509 -req -in light.local.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out light.local.crt -days 3650 -sha256 -extfile light.local.ext

```

输出结果

```bash
light@TP862:~/cert$ openssl req -new -sha256 -nodes -out light.local.csr -newkey rsa:2048 -keyout light.local.key
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:Hubei
Locality Name (eg, city) []:Wuhan
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Torch
Organizational Unit Name (eg, section) []:develop
Common Name (e.g. server FQDN or YOUR name) []:light
Email Address []:light@torch.local

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:123456
An optional company name []:light


light@TP862:~/cert$ openssl x509 -req -in light.local.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out light.local.crt -days 3650 -sha256 -extfile light.local.ext
Certificate request self-signature ok
subject=C = CN, ST = Hubei, L = Wuhan, O = Torch, OU = develop, CN = light, emailAddress = light@torch.local
Enter pass phrase for ca.key:123456
```
