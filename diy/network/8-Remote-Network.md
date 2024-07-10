- [ 异地组网（异地访问）方案](https://blog.csdn.net/qq_28768477/article/details/136101622)

## 一、引言

随着远程工作和数字生活的普及，访问家庭网络中的资源如NAS（网络附加存储）变得日益重要。比如过年回老家的时侯，为了在视机上播放某些下载到NAS的电影资源打发无聊的时间，势必需要搭建一个稳定的私有网络访问到NAS。这里浅谈聊一聊三大组网神器。

为了建立一个安全、高效且易于管理的网络环境，许多用户正在考虑使用先进的组网工具。在众多选择中，Tailscale、ZeroTier和Cloudflare Tunnel因其独特的功能和优势而备受关注。它们共同的特点是不完全依赖中继服务，确保了即使在某些情况下中继服务受限或不可用，它们也能保持通信的连通性。

## 二、工具概述

### 1. Tailscale：
- [Tailscale](https://tailscale.com/) 
- [Github](https://github.com/tailscale/tailscale)

特点：强大的网络管理功能，提供简单易用的界面，方便设备管理和策略配置。

优势：实时网络监控和警报功能，及时发现和解决安全问题。

适用场景：企业网络、远程办公、家庭网络管理。

#### 简单使用
1. [注册 Tailscale 账号](https://login.tailscale.com/start)，建议使用微软账号
2. 访问[控制台配置页面](https://login.tailscale.com/admin/settings/keys)，点击 `Generate auth key` 生成认证秘钥，复制秘钥到文本中备用
3. 下载 [Tailscale](https://tailscale.com/download) 客户端并安装到电脑，运行登录账号
4. 手机（或另一台电脑）下载 Tailscale 并安装，使用刚才的秘钥登录（也可以使用账号密码）
5. 手机浏览器访问 `http://laptop.tail5c8063.ts.net:8080`，请求会路由到电脑的 `http://localhost:8080`

### 2. ZeroTier：
- [ZeroTier](https://www.zerotier.com/)

特点：灵活的对等网络架构，全球分布的根服务器。

优势：可以快速建立大规模对等网络，适用于分布式系统、物联网设备和游戏服务器。

适用场景：需要高性能数据传输和扩展的场景。

#### 简单使用
1. [注册 Zerotier 账号](https://my.zerotier.com/)，建议使用微软账号
2. 访问[网络页面](https://my.zerotier.com/network)，点击最上方的 `Create A Network` 创建一个网络
3. 点击网络名称进入该网络的设置，将 `Access Control` 设置为 `Private`，`Name` 可以随意填写，同时记下 `Network ID`
4. 下面来到网段的设置，没有特殊需求的话，在下方任意选择一个即可，如果需要指定网段，可以使用 `Advanced` 模式设置
5. 下载 [Zerotier](https://www.zerotier.com/download/) 客户端并安装到电脑，运行登录账号
6. 手机（或另一台电脑）下载 Zerotier 并安装，使用刚才的秘钥登录（也可以使用账号密码）
7. 在 `Network` - `网络名称` - `Members`下可以，看到注册的节点信息，勾选 `Auth` 下的 `√` 将设备添加到网络中
8. 手机浏览器访问 `http://192.168.194.201:8080`，请求会路由到电脑的 `http://localhost:8080`

### 3. Cloudflare Tunnel：
- [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/)

特点：专注于将本地服务暴露给互联网，提供简单的界面配置和管理隧道。

优势：利用Cloudflare的全球网络和安全防护体系。

适用场景：需要远程访问本地服务或共享资源的用户。

#### 简单使用
1. 登录CF[控制面板](https://dash.cloudflare.com)
2. 选择左侧 `Zero Trust` - `Networks` - `Tunnels` 进入 `Tunnel` 页面
3. 点击 `Create a tunnel`
4. 选择 `Cloudflared`，点击 `Next`
5. 输入任意的 `Tunnel` 名称 `test`，点击 `Next`
6. 下载对应系统的Connector客户端并安装
7. 以管理员权限打开终端，执行命令注册客户端 `cloudflared.exe service install eyJhIjoi...`
8. 注册完后点击 `Next` 配置穿透域名
   - `Subdomain`: `test`
   - `Domain`: `example.com`
   - `Path`: (optional)
   - `Type`: `HTTP`
   - `URL`: `localhost:8080`
9. 配置成功后 `Tunnel` 页面的 `Status` 会变成绿色的 `Healthy`
10. 手机浏览器访问 `https://test.example.com/`，请求会路由到电脑的 `http://localhost:8080`

## 三、比较分析

|                      | Cloudflare DDNS | Cloudflare Tunnel | ZeroTier | Tailscale           |
| -------------------- | --------------- | ----------------- | -------- | ------------------- |
| 是否需要公网IP       | √ IPv4 或 IPv6  | ×                 | ×        | × 可用于加速        |
| 是否需要域名         | √               | √                 | ×        | ×                   |
| 是否需要安装服务端   | ×               | √                 | √        | √                   |
| 是否需要安装客户端   | ×               | ×                 | √        | √                   |
| 网速限制             | √               | √                 | √ 付费   | √ 付费/自建服务解锁 |
| 节点数量限制         | ×               | ×                 | √ 付费   | √ 付费/自建服务解锁 |
| 是否可以通过域名访问 | √               | √                 | ×        | √                   |
| 服务端主动访问客户端 | ×               | ×                 | √        | √                   |
| 安全性保障           | 低 自建防火墙   | 高                | 高       | 高                  |
| 按节点/端口暴露      | 节点            | 端口              | 节点     | 节点                |
| 操作便利性           | 低              | 中                | 中       | 高                  |
| 年花费（按最低算）   | 10 购买域名     | 10 购买域名       | 0        | 0                   |

功能：Tailscale和ZeroTier更侧重于构建和管理对等网络，而Cloudflare Tunnel则专注于服务暴露。

性能：三者性能均佳，但ZeroTier的对等网络架构在处理大规模数据传输时可能表现更优。

安全性：Tailscale和ZeroTier采用加密通信和身份验证，Cloudflare Tunnel则利用Cloudflare的安全体系。

易用性：Tailscale因其直观界面和管理功能而受到好评，ZeroTier设置相对复杂，而Cloudflare Tunnel提供直观的隧道配置界面。

成本：Tailscale和ZeroTier提供免费基础服务，高级功能或大规模部署可能需要付费。Cloudflare Tunnel需要Cloudflare账户和可能的额外费用。

## 四、与其他工具的对比

花生壳和NAT123：国内服务器节点多，响应速度快，但免费版有带宽和端口限制。

Cpolar: 国内服务器节点多，响应速度快，但免费版有带宽和端口限制。

FRP：需要公网IP和开通端口，适合有公网IP的用户。

## 五、总结

Tailscale、ZeroTier和Cloudflare Tunnel各有优势，选择哪个工具取决于用户的实际需求。
- Tailscale适合需要强大网络管理和安全性的场景；
- ZeroTier适用于需要高性能数据传输的场景；
- Cloudflare Tunnel则适合需要将本地服务暴露给互联网的用户。
 
考虑到入手难度和灵活性，Tailscale和ZeroTier可能是更好的选择，特别是考虑到它们可以自己搭建国内中继服务器，并且得到了许多路由器的支持。
