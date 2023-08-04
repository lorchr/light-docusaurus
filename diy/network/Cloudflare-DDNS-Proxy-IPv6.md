[基于 Cloudflare DNS API 部署 IPv6 DDNS](https://zhuanlan.zhihu.com/p/69379645)
[利用Cloudflare + Python 免费开启(IPV4/IPV6)DDNS](https://blog.csdn.net/qq_36350600/article/details/113465378)
[cloudflare动态域名解析-并实现自定义内外网混合动态域名DDNS脚本](https://blog.csdn.net/m0_57690774/article/details/128345106)
[阿里云域名使用cloudflare的DNS解析隐藏真实IP](https://blog.csdn.net/HunterKM/article/details/90719473)

## 一、前言
随着国内 IPv6 网络的普及，现在普通家庭宽带基本上都能拿到公网 IPv6 地址了。

有了公网 IPv6 地址，也就可以在家里搭一个对外的服务了。

和以前的公网 IPv4 地址一样，家庭宽带的公网 IPv6 地址也不是固定的。所以我们必须把动态的 IPv6 地址映射到一个静态的域名上，也就是使用 DDNS 服务。

本文将介绍如何利用 Cloudflare DNS API 来实现 IPv6 DDNS。

> ⚠️ 注意
• 由于网络环境及 Cloudflare DNS API 随时可能发生变化，所以本文中的方法不保证长期有效（更新于 2019 年 6 月 16 日）。

## 二、示例环境
- 操作系统：CentOS 7.5.1804
- DDNS 域名：ipv6-ddns.example.com
- 裸域名：example.com

## 三、操作步骤
### 3.1 获取裸域名的 Zone ID 及 API Token
- 添加站点 点击上方导航栏`Add site` -> 输入 `example.com` -> `Add site`

- 获取ZoneId 在域名控制面板右下方的 API 一栏可直接获取到 Zone ID。

- API Token 则需要点击该栏下方的「Get your API Token」，然后输入密码（可能还要验证码）确认才可获取。如下图：
    `Create Token` -> `Edit Zone DNS` `Use template` -> `Zone Resources` `Specific zone` `example.com`-> `Continue to summary` -> `Create Token`
- 验证API Token
```shell
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer OdIjAMJqI1Yu-Lg--c5I55AC96WiG20nAXotzGxY" \
     -H "Content-Type:application/json"
```

> 说明
• 请妥善保管 API Token，防止泄露。

### 3.2 添加子域名的 AAAA 记录
点击域名控制面板的「DNS」选项卡，如下图：￼


然后在 DNS Records 这一栏的下方按下图提示添加相应的记录：

| Type | Name      | IPv4 address | TTL  | Proxy status |
| ---- | --------- | ------------ | ---- | ------------ |
| AAAA | ipv6-ddns | ::1          | Auto | DNS only     |

1、记录类型选择「AAAA」，也就是 IPv6 地址记录。
2、Name 一栏填写子域名。例如 DDNS 域名是 ipv6-ddns.example.com 的话这里就填写 ipv6-ddns。
3、IPv6 address 一栏填写 ::1 即可。
4、TTL 选择 「2 minutes」或者Auto。
5、由于这里不使用 CDN 功能，所以需要点击一下橙色的云图标让其变为灰色。
6、点击「Add Record」即可添加记录。

### 3.3 查询刚才添加的 AAAA 记录的 ID
按以下格式执行命令：
```shell
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/<刚才获取的 Zone ID>/dns_records?type=AAAA&name=<DDNS 域名>&content=127.0.0.1&page=1&per_page=100&order=type&direction=desc&match=any" \
    -H "X-Auth-Email: <Cloudflare 账号的邮箱地址>" \
    -H "X-Auth-Key: <刚才获取的 API Key>" \
    -H "Content-Type: application/json" \
    | python -m tool.json
```
例如
```shell
curl -s -X GET "https://api.cloudflare.com/client/v4/zones/12345678901234567890/dns_records?type=AAAA&name=ipv6-ddns.dyndns.com&content=127.0.0.1&page=1&per_page=100&order=type&direction=desc&match=any" \
    -H "X-Auth-Email: mail@example.com" \
    -H "X-Auth-Key: 11111111111111111111" \
    -H "Content-Type: application/json" \
    | python -m tool.json
```
运行结果

```json
{
    "errors": [],
    "messages": [],
    "result": [
        {
            "content": "::1",
            "created_on": "2019-06-14T19:01:14.374270Z",
            "id": "22222222222222222222",    ← 22222222222222222222 就是刚才添加 AAAA 记录的 ID，请记下
            "locked": false,
            "meta": {
                "auto_added": false,
                "managed_by_apps": false,
                "managed_by_argo_tunnel": false
            },
            "modified_on": "2019-06-14T19:01:14.374270Z",
            "name": "ipv6-ddns.example.com",
            "proxiable": true,
            "proxied": false,
            "ttl": 120,
            "type": "AAAA",
            "zone_id": "12345678901234567890",
            "zone_name": "example.com"
        }
    ],
    "result_info": {
        "count": 1,
        "page": 1,
        "per_page": 100,
        "total_count": 1,
        "total_pages": 1
    },
    "success": true
}
```
命令执行后会返回一段 JSON，找到 DDNS 域名对应的那个 Object，其中 id 的值就是刚才添加的 AAAA 记录的 ID。

### 3.4 创建 DDNS 脚本
请按实际情况修改以下内容，完成后粘贴到命令行窗口中按回车即可。
```shell
cat << EOF > /etc/ipv6-ddns.sh 
#!/bin/sh
sleep 10
IP6=\`ip -6 addr show dev <拥有公网 IPv6 地址的接口名> | grep global | awk '{print \$2}' | awk -F "/" '{print \$1}'\`
[ -z \$IP6 ] && exit
curl -X PUT "https://api.cloudflare.com/client/v4/zones/<刚才获取的 Zone ID>/dns_records/<刚才获取的 AAAA 记录 ID>" -H "X-Auth-Email: <Cloudflare 账号的邮箱地址>" -H "X-Auth-Key: <刚才获取的 API Key>" -H "Content-Type: application/json" --data '{"type":"AAAA","name":"<DDNS 域名>","content":"'"\${IP6}"'","ttl":120,"proxied":false}'
EOF
chmod +x /etc/ipv6-ddns.sh 
```
例如
```shell
cat << EOF > /etc/ipv6-ddns.sh 
#!/bin/sh
sleep 10
IP6=\`ip -6 addr show dev eth0 | grep global | awk '{print \$2}' | awk -F "/" '{print \$1}'\`
[ -z \$IP6 ] && exit
curl -X PUT "https://api.cloudflare.com/client/v4/zones/12345678901234567890/dns_records/22222222222222222222" -H "X-Auth-Email: mail@example.com" -H "X-Auth-Key: 11111111111111111111" -H "Content-Type: application/json" --data '{"type":"AAAA","name":"ipv6-ddns.example.com","content":"'"\${IP6}"'","ttl":120,"proxied":false}'
EOF
chmod +x /etc/ipv6-ddns.sh 
```

### 3.5 试运行 DDNS 脚本
执行以下命令：
```shell
/etc/ipv6-ddns.sh | python -m json.tool
```
稍等片刻。如果执行结果中出现 "success":true 的话，说明域名的 AAAA 记录已经更新成功。例如：
```shell
{
    "errors": [],
    "messages": [],
    "result": {
        "content": "1234:5678:9012:3456:7890:1234:5678:9012",
        "created_on": "2019-06-14T22:20:51.008287Z",
        "id": "22222222222222222222",
        "locked": false,
        "meta": {
            "auto_added": false,
            "managed_by_apps": false,
            "managed_by_argo_tunnel": false
        },
        "modified_on": "2019-06-14T22:20:51.008287Z",
        "name": "ipv6-ddns.example.com",
        "proxiable": true,
        "proxied": false,
        "ttl": 120,
        "type": "AAAA",
        "zone_id": "12345678901234567890",
        "zone_name": "example.com"
    },
    "success": true    ← 更新成功
}
```
### 3.6 添加计划任务
下面我们设定每分钟执行一次 DDNS 脚本。

执行以下命令：
```
crontab -e
```
然后请在命令行窗口中按下 O（大写），将以下内容直接粘贴到命令行窗口中，再按下 ESC ，最后输入 :wq 按回车。
```shell
* * * * * /etc/ipv6-ddns.sh > /dev/null 2>&1
```
