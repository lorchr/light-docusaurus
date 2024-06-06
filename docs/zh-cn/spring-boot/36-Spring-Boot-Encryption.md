- [API接口加解密技术方案（参考HTTPS原理和微信支付）](https://juejin.cn/post/7358368402795692082)
- [优雅的处理 API 接口敏感数据加解密（方案详解）](https://mp.weixin.qq.com/s/DdHNwfaqA1ZkPoP6CYCotQ)

## 一、背景与目标
随着网络技术的快速发展，数据安全问题日益突出。为了防止爬虫、防请求篡改、防请求重放，以及验证数据完整性，本方案结合HTTPS原理和微信支付加解密设计，通过对称加密、非对称加密、签名等技术，为API接口提供加解密设计和落地。

## 二、方案设计
### 对称加密、非对称加密、哈希算法、验签算法

- **对称加密**：采用相同的密钥进行加密和解密。具有加密速度快、计算量小的优点，但密钥的安全传输是问题。在本方案中，对称加密主要用于数据的实际加密传输。
- **非对称加密**：使用一对密钥（公钥和私钥）进行加密和解密。公钥用于加密数据，私钥用于解密数据。非对称加密可以确保密钥的安全传输，但加密速度较慢，不适合长文本加密。在本方案中，非对称加密主要用于对称密钥的加密。
- **哈希算法**：无论用户输入什么长度的原始数据，经过计算后输出的密文都是固定长度的，只要原数据稍有改变，输出的“摘要”便完全不同
- **签名算法**：一般指的是，通过私钥对数据进行签名，然后通过公钥对数据进行验签

### HTTPS原理概述
HTTPS（Hypertext Transfer Protocol Secure）是一种通过计算机网络进行安全通信的传输协议。它利用SSL/TLS协议在HTTP应用层进行通信加密，通过证书进行身份验证，从而确保数据传输的安全性和完整性。

![img](./img/36/36-1.awebp)

### 微信支付加解密原理

- **请求签名**：通过商户API证书私钥，对每一次请求进行RSA-SHA256签名，微信支付进行验签
- **回调验签**：微信支付通过平台证书私钥，对每一次回调进行RSA-SHA256签名，商户接收到请求后，通过平台正式公钥进行验签
- **回调解密**：商户根据配置的apiV3密钥，对加密数据进行AES-256-GCM解密

![img](./img/36/36-2.awebp)

### 接口加解密设计思路

- **密钥交换**：客户端使用服务端的公钥对对称加密的密钥进行加密，然后将密文密钥发送给服务端。服务端使用自己的私钥解密得到对称加密的明文密钥。
- **数据加密**：客户端使用对称加密的明文密钥对接口数据进行加密，然后发送给服务端。服务端使用相同的对称加密密钥对数据进行解密。
- **数据哈希（签名）**：在数据发送前，客户端计算数据的哈希值，并将哈希值作为数据的一部分发送给服务端。服务端收到数据后，使用相同的算法计算哈希值，并与客户端发送的哈希值进行比较，以验证数据的完整性。
- **数据有效性校验**：在数据发送前，客户端将当前时间作为数据的一部分发送给服务端。服务端收到数据后，解密得到参数中的时间，并与服务端当前时间进行比较，以验证请求是否过期，防止请求重放。

## 三、技术实现

- **密钥生成与管理**：通过工具生成非对称密钥对，服务端负责保管私钥。（客户端也可以定期从服务端获取公钥（传输过程中有泄露的风险），并保存到LocalStorage。）
- **加密算法选择**：对称加密算法可选用常用的AES，非对称加密算法可选用常用的RSA。哈希算法可选用SHA-256、MD5，签名算法可选用RSA-SHA256等。根据Hutool加密算法如下：

```java
// 对称密钥
String key = "key";
AES aes = SecureUtil.aes(key.getBytes());
// 加密
String ciphertext = aes.encryptBase64(content);
// 解密
String result = aes.decryptStr(ciphertext);
```

```java
// 非对称公钥
String publicKey = "xxxxxxx";
// 对称密钥
String key = "key";
RSA rsa = new RSA(null, publicKey);
// 对对称密钥进行加密
String ciphertextKey = rsa.encryptBase64(key, KeyType.PublicKey);


// 非对称私钥
String privateKey = "xxxxxxx";
RSA rsa2 = new RSA(privateKey, null);
// 对加密的对称密钥进行解密
String key = rsa2.encryptBase64(ciphertextKey, KeyType.PrivateKey);
```

```java
String data = "测试";
Digester sha256 = new Digester(DigestAlgorithm.SHA256);

System.out.println(sha256.digestHex(data));
```

```java
// 暂不考虑
String publicKey = "xxxxx";
String privateKey = "xxxxx";
String data = "测试";

Sign privateSign = SecureUtil.sign(SignAlgorithm.SHA256withRSA, privateKey, null);
String sign = new String(Base64.getEncoder().encode(privateSign.sign(data)));
System.out.println("签名：" + sign);

Sign publicSign = SecureUtil.sign(SignAlgorithm.SHA256withRSA, null, publicKey);
System.out.println(publicSign.verify(data.getBytes(), Base64.getDecoder().decode(sign.getBytes())));
```

3.  签名规则：

```markdown
等queryString和body参数加密后，将queryString、时间戳、明文对称密钥、body参数按顺序进行拼接，然后通过SHA256算法进行哈希得到签名sign，然后将sign放在header中进行传递
```

4.  参数传递：

```markdown
ek(encryt-key)：xxxxxxx（非对称加密后的对称密钥）
ts：xxxxxxx（时间戳）
sign：xxxxxxx
```

```markdown
将请求参数queryString拼成"param1=value1&param2=value2"格式
将queryString进行对称加密，得到"ciphertext=xxxxx"，并重新拼接到url后面
```


```markdown
query参数可以参考GET请求
body参数可以通过对称加密得到base64密文，直接用body进行传输
例如：url?ciphertext=xxxxx
body：xxxxxxxx
```

5.  后端处理：

```markdown
请求有效验证：获取header中ts参数，得到时间戳并判断时间戳是否超过一定时间；
解密对称密钥：通过私钥解密header中的ek参数，得到明文的对称密钥key；
验签：将queryString、时间戳、明文对称密钥、body参数按顺序进行拼接，然后通过SHA256算法进行哈希得到签名sign，与header中的sign做比较；
解密参数：通过明文对称密钥，分别解密queryString、body参数；
加密响应结果：请求完成后，将响应结果通过对称加密得到base64密文，并返回给客户端
```

## 四、常见问题
```markdown
Q：为什么需要参考HTTPS来设计接口加解密？
A：HTTPS结合了对称加密和非对称加密，安全性更高，同时也能满足效率要求
```

```markdown
Q：如果只使用对称加密有什么问题？
A：客户端是不安全的，很容易暴露密钥，只要一旦暴露，加密就形同虚设
```

```markdown
Q：如果只使用非对称加密有什么问题？
A：1、非对称加密不支持超长文本加密(RSA只支持117字节)；
   2、非对称加密效率太慢
```

```markdown
Q：接口参数已经加密了，是否还有必要签名？
A：有必要，生产环境不是每一个接口都需要加密的。但是每一个接口都需要防篡改、防重放
```

```markdown
Q：签名算法为什么没有采用RSA-SHA256？
A：1、RSA-SHA256签名算法只能私钥签名，公钥验签。
   2、客户端存的是公钥，如果要采用该算法，需要再定义一套非对称密钥，加重了维护成本。
   3、现在采用哈希算法SHA256进行模拟签名，其中混入了明文的对称密钥，也可以防止模拟签名
```

```markdown
Q：用了对称和非对称混合加密，非对称公钥保存在客户端，还是有可能泄露，怎么保证安全？
A：1、前端代码压缩、混淆；
   2、公钥不要直接写到代码里，分段、加密保存；
   3、即使公钥暴露了，对称密钥每次都是新生成的，抓包也拿不到本次请求的对称密钥，也就没有办法对结果解密
```

```markdown
Q：对称和非对称同时使用的话，怎么保证加解密的效率？
A：请求参数和响应结果实际还是通过对称加密，非对称只会对对称密钥进行加解密，所以效率和对称加密差不多
```

```markdown
Q：该方案是否是绝对安全？如果不是，是否有绝对安全的加解密方案？
A：1、不是，如果客户端被破解了，用户可以模拟客户端发起请求
   2、暂时没有，客户端对于互联网都是透明的，只要客户端被破解了，都可以模拟客户端发起请求
```

## 五、安全性分析
本方案结合对称加密和非对称加密的优点，既保证了数据传输的安全性，又提高了加密解密的效率。但是需要考虑客户端公钥的安全性。

- **防篡改**：请求参数都进行了签名，只要客户端公钥不泄露，无法修改请求参数；
- **防爬虫**：请求参数进行了签名和加密，无法模拟客户端请求；响应结果进行了加密，即使抓包拿到了结果，也无法进行解密
- **防重放**：请求头中引入时间戳，并且时间戳也进行了验签，可以防止篡改，每次服务端接收到请求都会验证时间戳的有效性。（短时间内的重放暂时阻止不了，可以考虑在后端在缓存进行验证，但目前业务用不上）

## 六、推荐文章
- [阮一峰-数字签名是什么](https://www.ruanyifeng.com/blog/2011/08/what_is_a_digital_signature.html)
- [微信支付-加密规则](https://pay.weixin.qq.com/docs/merchant/development/interface-rules/signature-generation.html)
- [Hutool-对称加密](https://www.hutool.cn/docs/#/crypto/%E5%AF%B9%E7%A7%B0%E5%8A%A0%E5%AF%86-SymmetricCrypto)
- [Hutool-非对称加密](https://www.hutool.cn/docs/#/crypto/%E9%9D%9E%E5%AF%B9%E7%A7%B0%E5%8A%A0%E5%AF%86-AsymmetricCrypto)
- [Hutool-签名算法](https://www.hutool.cn/docs/#/crypto/%E7%AD%BE%E5%90%8D%E5%92%8C%E9%AA%8C%E8%AF%81-Sign)
