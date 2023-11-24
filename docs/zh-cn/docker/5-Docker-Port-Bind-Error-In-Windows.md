Windows Docker 端口占用错误解决

## 1. 错误来源

```
Error invoking remote method ‘docker-start-container’: Error: (HTTP code 500) server error - Ports are not available: exposing port TCP 192.168.0.157:6555 -> 0.0.0.0:0: listen tcp 192.168.0.157:6555: can’t bind on the specified endpoint.
```

或者

```
Error invoking remote method ‘docker-start-container’: error: (http code 500) server error - ports are not available.
```

或者

```
Error invoking remote method ‘docker-start-container’: Error: (HTTP code 500) server error - Ports are not available: listen tcp 0.0.0.0:xxxx: bind: An attempt was made to access a socket in a way forbidden by access permissions.
```

这些都是端口占用的问题，很多时候都是Windows会保留部分tcp端口，这些端口范围内不可用：

Windows 中个东西叫做`TCP 动态端口范围`，这个范围内的端口有时候会被一些服务占用。

在 `Windows Vista（或 Windows Server 2008）`之前，动态端口范围是 `1025` 到 `5000`；
在其之后的版本中，新的默认起始端口为 `49152`，新的默认结束端口为 `65535`。

如果安装了 `Hyper-V`，则 `Hyper-V` 会保留一些随机端口号供 `Windows` 容器主机网络服务使用。
一般情况（正常情况下）`Hyper-V` 会在`TCP 动态端口范围`中预留一些随机的端口号，但是预留的端口号一般都很大，所以即使预留了成百上千个端口，也影响不大。

但是 `Windows` 自动更新有时会出错（万恶的自动更新），把`TCP 动态端口范围`起始端口被重置为 `1024`，导致 `Hyper-V` 在预留端口的时候占用了常用端口号，使得一些常用端口因为被预留而无法使用。

动态端口复用是 操作系统的常见技术

首先无论发送还是接受都需要监听端口

因为发送者的端口一般性无强制要求 只要不是 `80` `443` `3306` `3389` 这类常见端口且有特殊意义端口就行 而且可以随着发送和收到返回后及时关闭方便其他程序进行复用

因此有了这项技术 这也是为什么大部分 http 库和浏览器不需要你指定自己发送端口的原因
同理 Linux 下中也有这项技术。

```bat
# 查看tcp动态端口范围
netsh int ipv4 show dynamicport tcp

# 查看 tcp 端口排除范围
netsh int ipv4 show excludedportrange protocol=tcp
```

## 2. 解决方法
1. 直接重启
    一般重启后Hyper-V的端口分配bug会消除，自然问题也会消失，但这不一定，偶尔会出现重启也解决不了的情况

2. 重新分配Hyper-V端口范围

    简单地重新设置`TCP 动态端口范围`，以便 `Hyper-V` 只保留我们设置的范围内的端口。您可以通过以管理员权限运行以下命令将`TCP 动态端口范围`重置为 `49152–65535`，但如果您认为它太大，也可以将其更改为较小的范围。

    请在命令行中执行下列命令设置动态端口范围：

    ```bat
    netsh int ipv4 set dynamic tcp start=49152 num=16384
    netsh int ipv6 set dynamic tcp start=49152 num=16384
    ```

    然后重启电脑。

3. 不重启让Hyper-V重新随机分配端口
    来自 StackOverflow 的错误解决方案：

    ```bat
    net stop winnat
    docker start container_name
    net start winnat
    ```

    这命令的实质是简化版的重启电脑，让 `Hyper-V` 初始化一些随机端口来保留，如果它仍然没有释放你所需要的端口，你可能需要再次操作。也就是因此，该回答下面有些人回复有用，有些人回复没用，就是因为这种解决方式解决问题的概率非常的随机。

## 3. 参考文章
1. [彻底解决docker在windows上的端口绑定问题](https://cloud.tencent.com/developer/article/2168217)

2. [解决Windows下Docker启动容器时，端口被占用错误](https://www.cnblogs.com/uncmd/p/16056993.html)

3. [Ports are not available: listen tcp 0.0.0.0/50070: bind: An attempt was made to access a socket in a way forbidden by its access permissions](https://stackoverflow.com/questions/65272764/ports-are-not-available-listen-tcp-0-0-0-0-50070-bind-an-attempt-was-made-to) - Stack Overflow

4. [无法启动容器，提示端口无法使用，却查不到哪个进程占用？](https://blog.csdn.net/qq_35996394/article/details/127664847)