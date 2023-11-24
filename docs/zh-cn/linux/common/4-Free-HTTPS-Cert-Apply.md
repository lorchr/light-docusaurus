目前来说，网站安装https是大势所趋，几乎每一个网站在建站之初，就会安装好https证书。

## 1. Https 介绍
https（全称：Hyper Text Transfer Protocol over Secure Socket Layer，超文本传输安全协议），是以安全为目标的HTTP通道，是HTTP的扩展（升级版），用于计算机网络的安全通信”——维基百科。

简单理解为：在http的基础上，增加安全套接字层（SSL），既可以变成https，作用就是让网站数据传输更加安全

HTTPS 的整体过程分为证书验证和数据传输阶段，具体的交互过程如下：图片

https证书类型

前面有提到过，https 实际就是增加了安全套接字层（SSL证书）；而不同的SSL证书，其类型和作用也大有不同。

SSL证书的类型主要分为3种：

- 扩展验证型(EV)SSL证书（适用证券、银行等金融机构）
- 组织验证型(OV)SSL证书（适用于电商和大型企业等）
- 域名验证型（DV）SSL证书（适用于普通企业和个人博客）

注：它们的安全程度依次递减。

## 2. 如何免费申请Https证书

这里介绍常用的四种免费证书申请方式。

### 1. [Let’s Encrypt](https://letsencrypt.org/)

Let’s Encrypt 是国外一个公共的免费 SSL 项目，由 Linux 基金会托管，它的来头不小，由 Mozilla、思科、Akamai、IdenTrust 和 EFF 等组织发起，目的就是向网站自动签发和管理免费证书，以便加速互联网由 HTTP 过渡到 HTTPS。

Let’s Encrypt安装部署简单、方便，目前Cpanel、Oneinstack等面板都已经集成了Let’s Encrypt一键申请安装，网上也有不少的利用Let’s Encrypt开源的特性制作的在线免费SSL证书申请网站，总之Let’s Encrypt得到大家的认可。

最后选择Let’s Encrypt，一方面是Let’s Encrypt SSL已经被Firefox、Chrome、IE等浏览器所支持。另一方面，Let’s Encrypt SSL证书下载和安装已经是傻瓜式的简单了。

#### 申请教程

官网使用教程：https://certbot.eff.org/

在界面选择部署到什么web服务上和操作系统是那款后，会自动生成如何安装和使用的步骤流程。

### 2. [Cloudflare](https://www.cloudflare.com/zh-cn/)

cloudflare是一家国外的 CDN 加速服务商，还是很有名气的。提供免费和付费的加速和网站保护服务。cloudflare提供了不同类型的套餐，即使是免费用户，cloudflare 提供的功能也是很全面的。Cloudflare除了提供CDN，也提供免费的SSL证书，使网站http变成https加密。Cloudflare一键设置ssl证书，操作简单，很多站长都使用。CloudFlare提供的免费SSL证书是UniversalSSL，即通用SSL，用户无需向证书发放机构申请和配置证书就可以使用的SSL证书，CloudFlare向所有用户(包括免费用户)提供SSL加密功能。

不过Universal SSL的服务对免费用户有限制，CloudFlare只支持扩展支持Server Name Indication(SNI)协议的现代浏览器，这意味着它不支持IE6及之前版本、运行Android 2.2或更旧版本的Android浏览器。
专属福利
👉点击领取：651页Java面试题库

#### 申请教程

cloudflare注册：https://dash.cloudflare.com/sign-up

添加站点(你的域名）：添加网站，要填写网站根域名，就是你购买域名时的完整域名名称(没有添加任何前缀)图片选择那种套餐(个人使用推荐免费开始)图片它会让你修改dns为CF所提供(就是你到域名服务商那取消掉dns解析，托管到CF 网站)图片
始终https(CF网站默认有提供，但是未启用,不想使用CF的可以上传证书)图片

### 3. [FreeSSL](https://freessl.cn/)

一个提供免费HTTPS证书申请的网站，同一个域名只支持申请20个

#### 申请教程

准备域名，选择供应商图片填写邮箱，选择生成方式图片域名提供商(云平台DNS解析)处配置TXT记录值图片

申请成工，下载证书

证书申请成功，我们可以看到，由于我们生成CSR的方式是离线生成，所以 FreeSSL 并没有返回给您证书的私钥，因为您的私钥在 KeyManager 中，您只需要将证书保存到 KeyManager，KeyManager 会自动为您进行证书私钥匹配，好，保存成功，这样我们就成功申请了一张证书。

安装使用(例如:nginx)

FreeSSL官网提供安装教程：https://blog.freessl.cn/how-do-i-install-an-ssl-certificate-collection/
```shell
server {  
    # 监听 ssl 443 端口
    listen 443 ssl;
    server_name example.com;

    # 开启 ssl
    ssl on;
    # 指定 ssl 证书路径
    ssl_certificate /path/to/example.com.crt;
    # 指定私钥文件路径
    ssl_certificate_key /path/to/example.com.key;
}
```

重新加载证书
```shell
service nginx force-reload
```

### 4. 阿里云(云厂商提供)免费证书

赛门铁克是 SSL/TLS 证书的领先提供商，为全球一百多万台网络服务器提供安全防护。选择赛门铁克后，证书颁发机构 (CA) 将妥善保护您的网站和信誉，让您安枕无忧。免费数字证书，最多保护一个明细子域名，不支持通配符，一个阿云帐户最多签发20张免费证书 保护一个明细域名，例如: mimvp.com，proxy.mimvp.com，blog.mimvp.com，各个明细子域名都算一个域名， 如果每一个明细域名，都需要配置SSL，则需要分别申请多个免费的SSL证书。

#### 申请教程

申请免费DV试用证书文档：https://help.aliyun.com/document_detail/156645.html

打开ssl控制台图片

购买证书

我这里已经购买过了，阿里云免费证书 一个自然年只能买一次，一次有20个针对单个域名申请的机会

1. 提交免费证书申请
2. 点击创建证书
3. 点击证书申请
4. 提交审核
5. 等待证书审核

等待CA中心审核您的证书申请，并在审核通过后为您签发证书。DV证书一般会在2个小时内完成审核和签发。您可以在证书列表中查看证书的状态。证书签发后，证书状态将更新为已签发。

部署到服务器(例子:nginx)

阿里云提供SSL证书安装文档：https://help.aliyun.com/document_detail/109827.htm?spm=a2c4g.11186623.0.0.1d983103a2FKwt#section-ri1-ayr-evy

```shell
#以下属性中，以ssl开头的属性表示与证书配置有关。
server {
    listen 443 ssl;
    #配置HTTPS的默认访问端口为443。
    #如果未在此处配置HTTPS的默认访问端口，可能会造成Nginx无法启动。
    #如果您使用Nginx 1.15.0及以上版本，请使用listen 443 ssl代替listen 443和ssl on。
    server_name yourdomain.com; #需要将yourdomain.com替换成证书绑定的域名。
    root html;
    index index.html index.htm;
    ssl_certificate cert/cert-file-name.pem;  #需要将cert-file-name.pem替换成已上传的证书文件的名称。
    ssl_certificate_key cert/cert-file-name.key; #需要将cert-file-name.key替换成已上传的证书密钥文件的名称。
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    #表示使用的加密套件的类型。
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2; #表示使用的TLS协议的类型。
    ssl_prefer_server_ciphers on;
    location / {
        root html;  #站点目录。
        index index.html index.htm;
    }
}
```
到此，本人最常用的四种免费证书申请方式就记录完毕了。大家根据自己的需求酌情选择使用即可。
