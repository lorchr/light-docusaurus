
## 1. 域名购买
1. 域名搜索 https://wanwang.aliyun.com/domain/searchresult
2. 选择合适的域名 example.com
3. 加入清单，在清单中进行结算
4. 选择年限
5. 添加【持有者信息】（包括邮箱 身份证 手机号 地址等），此步骤需要【注册局核验】
6. 信息核验完毕后购买即可

## 2. ICP备案
1. 进入阿里云`控制台`，点击`ICP备案` https://beian.aliyun.com/pcContainer/formpage

## 3. 开启SSL
1. 进入阿里云`控制台`，点击`SSL证书` `免费证书` https://yundun.console.aliyun.com/
2. 点击`创建证书`，填写相关信息
   1. `证书绑定域名` `fun.example.com` 
   2. `域名验证方式` `手工DNS验证`
3. 在DNS服务商（如：阿里云、Cloudflare等）处添加SSL证书的DNS解析记录
4. 添加完成后点击验证，通过验证即可关闭页面等待生成证书文件

| 配置项目         | 配置项值     |
| ---------------- | ------------ |
| 域名授权验证类型 | DNS          |
| 记录类型         | TXT          |
| 主机记录         | _dnsauth.fun |
| 记录值           | 20230625xxxx |

## 4. 修改DNS
1. 进入阿里云`控制台`，点击`域名`，`域名列表` https://dc.console.aliyun.com/next/index
2. 点击`管理`，找到`DNS修改`，修改为 Cloudflare的DNS
```shell
henry.ns.cloudflare.com
margaret.ns.cloudflare.com
```

| Type | 名称         | 内容         | 代理状态 | TTL  | 备注 |
| ---- | ------------ | ------------ | -------- | ---- | ---- |
| TXT  | _dnsauth.fun | 20230625xxxx | DNS only | Auto | SSL 解析 |
| A    | www          | 127.0.0.1    | Proxied  | Auto | IPv4解析 |
| AAAA | checkip      | ::1          | DNS only | Auto | IPv6解析 |


## 5. Cloudflare DDNS测试
```shell
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/123456789/dns_records?type=AAAA&name=ipv6-ddns.example.com&content=127.0.0.1&page=1&per_page=100&order=type&direction=desc&match=any" \
-H "X-Auth-Email: ipv6-ddns@example.com" \
-H "X-Auth-Key: OdIjAMJqI1Yu-Lg--c5I55AC96WiG20nAXotzGxY" \
-H "Content-Type: application/json" \
-o C://users/example/desktop/tool.json

curl -X PUT "https://api.cloudflare.com/client/v4/zones/123456789/dns_records/asdfghjkl" \
-H "X-Auth-Email: ipv6-ddns@example.com" \
-H "X-Auth-Key: OdIjAMJqI1Yu-Lg--c5I55AC96WiG20nAXotzGxY" \
-H "Content-Type: application/json" \
--data '{"type":"AAAA","name":"ipv6-ddns.example.com","content":"fe80::95c0:8291:b2d4:896a","ttl":120,"proxied":false}' \
-o C://users/example/desktop/ddns.json
```
