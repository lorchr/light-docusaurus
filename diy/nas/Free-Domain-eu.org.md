## eu.org 注册免费域名

## 1. 账号注册
1. 访问 [https://eu.org](https://nic.eu.org)
2. 点击 Sign-in or sign-up [here](https://nic.eu.org/arf/)! 
3. 点击 Register 
4. 输入以下信息，并点击 Create
   1. Name      : zhangsan
   2. E-mail    : zhangsan@163.com
   3. Address1  : hubei
   4. Address2  : wuhan
   5. Country   : China
   6. Phone     : 13455559999
   7. 勾选  Private (not shown in the public Whois)
   8. 勾选  I have read and I accept the domain policy
   9. 输入密码  @eu
5.  打开注册邮箱点击验证链接
6.  nic-hdl 即为登录名
7.  登录账号
    1.  在Handle中输入邮箱中 nic-hdl的值  示例: XX1321-FREE
    2.  Password输入密码

## 2. 域名注册
1. 登录账号后点击 New Domain
2. 以下信息必填，其他的可以忽略
   1. Complete domain name： 输入完整的域名 zhangsan.eu.org
   2. Name servers: DNS 验证类型使用默认即可
   3. Name1: henry.ns.cloudflare.com
   4. Name2: margaret.ns.cloudflare.com
3. 点击Submit验证域名是否可用，如果可用会显示以下内容，不可用页面会报错，更换域名再试
   
   ```shell
    ---- Servers and domain names check

    Getting IP for HENRY.NS.CLOUDFLARE.COM: 172.64.33.176 173.245.59.176 108.162.193.176
    Getting IP for HENRY.NS.CLOUDFLARE.COM: 2803:f800:50::6ca2:c1b0 2a06:98c1:50::ac40:21b0 2606:4700:58::adf5:3bb0
    Getting IP for MARGARET.NS.CLOUDFLARE.COM: 172.64.34.107 108.162.194.107 162.159.38.107
    Getting IP for MARGARET.NS.CLOUDFLARE.COM: 2803:f800:50::6ca2:c26b 2a06:98c1:50::ac40:226b 2606:4700:50::a29f:266b

    ---- Checking SOA records for ZHANGSAN.EU.ORG

    SOA from HENRY.NS.CLOUDFLARE.COM at 172.64.33.176: Error: Answer not authoritative (3.319 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 173.245.59.176: Error: Answer not authoritative (4.025 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 108.162.193.176: Error: Answer not authoritative (3.752 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 2803:f800:50::6ca2:c1b0: Error: Answer not authoritative (5.034 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 2a06:98c1:50::ac40:21b0: Error: Answer not authoritative (3.955 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 2606:4700:58::adf5:3bb0: Error: Answer not authoritative (3.628 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 172.64.34.107: Error: Answer not authoritative (3.319 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 108.162.194.107: Error: Answer not authoritative (3.259 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 162.159.38.107: Error: Answer not authoritative (15.269 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 2803:f800:50::6ca2:c26b: Error: Answer not authoritative (4.450 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 2a06:98c1:50::ac40:226b: Error: Answer not authoritative (5.179 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 2606:4700:50::a29f:266b: Error: Answer not authoritative (4.572 ms)

    ---- Checking NS records for ZHANGSAN.EU.ORG

    NS from HENRY.NS.CLOUDFLARE.COM at 172.64.33.176: Error: Answer not authoritative (3.662 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 173.245.59.176: Error: Answer not authoritative (3.609 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 108.162.193.176: Error: Answer not authoritative (3.862 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 2803:f800:50::6ca2:c1b0: Error: Answer not authoritative (4.248 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 2a06:98c1:50::ac40:21b0: Error: Answer not authoritative (4.019 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 2606:4700:58::adf5:3bb0: Error: Answer not authoritative (4.905 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 172.64.34.107: Error: Answer not authoritative (3.430 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 108.162.194.107: Error: Answer not authoritative (3.289 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 162.159.38.107: Error: Answer not authoritative (16.151 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 2803:f800:50::6ca2:c26b: Error: Answer not authoritative (4.653 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 2a06:98c1:50::ac40:226b: Error: Answer not authoritative (3.652 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 2606:4700:50::a29f:266b: Error: Answer not authoritative (4.458 ms)
    
    24 errors(s)
   ```

4. 域名可以注册后，登录[Cloudflare](https://dash.cloudflare.com/)
5. 添加站点，输入注册的域名 zhangsan.eu.org ，一路点击默认项到最后即可
6. 最后会进到 https://dash.cloudflare.com/1111111111/zhangsan.eu.org/nameserver-directions，复制 DNS地址到 eu.org的域名注册页面(上面第二步) Name1 Name2
7. 重新提交即可，显示以下内容表示注册成功，等待1-30天审核，一个账号只能注册4个域名
   
   ```shell
    ---- Servers and domain names check

    Getting IP for HENRY.NS.CLOUDFLARE.COM: 108.162.193.176 173.245.59.176 172.64.33.176
    Getting IP for HENRY.NS.CLOUDFLARE.COM: 2803:f800:50::6ca2:c1b0 2606:4700:58::adf5:3bb0 2a06:98c1:50::ac40:21b0
    Getting IP for MARGARET.NS.CLOUDFLARE.COM: 108.162.194.107 172.64.34.107 162.159.38.107
    Getting IP for MARGARET.NS.CLOUDFLARE.COM: 2803:f800:50::6ca2:c26b 2606:4700:50::a29f:266b 2a06:98c1:50::ac40:226b

    ---- Checking SOA records for ZHANGSAN.EU.ORG

    SOA from HENRY.NS.CLOUDFLARE.COM at 108.162.193.176: serial 2315953318 (5.629 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 173.245.59.176: serial 2315953318 (5.903 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 172.64.33.176: serial 2315953318 (5.889 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 2803:f800:50::6ca2:c1b0: serial 2315953318 (5.863 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 2606:4700:58::adf5:3bb0: serial 2315953318 (6.633 ms)
    SOA from HENRY.NS.CLOUDFLARE.COM at 2a06:98c1:50::ac40:21b0: serial 2315953318 (5.871 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 108.162.194.107: serial 2315953318 (5.651 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 172.64.34.107: serial 2315953318 (5.450 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 162.159.38.107: serial 2315953318 (17.590 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 2803:f800:50::6ca2:c26b: serial 2315953318 (6.143 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 2606:4700:50::a29f:266b: serial 2315953318 (6.091 ms)
    SOA from MARGARET.NS.CLOUDFLARE.COM at 2a06:98c1:50::ac40:226b: serial 2315953318 (5.896 ms)

    ---- Checking NS records for ZHANGSAN.EU.ORG

    NS from HENRY.NS.CLOUDFLARE.COM at 108.162.193.176: ok (5.562 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 173.245.59.176: ok (5.912 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 172.64.33.176: ok (5.594 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 2803:f800:50::6ca2:c1b0: ok (6.680 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 2606:4700:58::adf5:3bb0: ok (7.401 ms)
    NS from HENRY.NS.CLOUDFLARE.COM at 2a06:98c1:50::ac40:21b0: ok (6.292 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 108.162.194.107: ok (5.890 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 172.64.34.107: ok (5.929 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 162.159.38.107: ok (18.566 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 2803:f800:50::6ca2:c26b: ok (6.988 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 2606:4700:50::a29f:266b: ok (5.731 ms)
    NS from MARGARET.NS.CLOUDFLARE.COM at 2a06:98c1:50::ac40:226b: ok (5.599 ms)

    No error, storing for validation...
    Saved as request 20230727162205-arf-23486

    Done
   ```
