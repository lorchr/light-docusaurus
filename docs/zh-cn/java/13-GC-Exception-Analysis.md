1. 首先异常gc的情况只出现在一个pod上（系统有多个pod）,在监控系统找到对应的pod，进入pod内部查看问题原因，排查问题一定要冷静
```shell

```

2. 进入pod之后，输入top查看各linux进程对系统资源的使用情况(因我这是事后补稿，资源使用不高，大家看步骤即可)图片
```shell
top c
```

3. 分析资源使用情况在当时的情况下，图片当时我的pid为1的进程cpu上到了130（多核）那我认定就是java应用出问题了，`ctrl+c`退出继续往下走
```shell
 PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND                                                                                                                        
 9922 root      20   0  950540 127556  42288 S 193.8  0.1   1878:46 /usr/local/bin/rke2 server                                                                                                     
 9945 root      20   0  774160  68840  25496 S  12.5  0.1   9:54.76 containerd -c /var/lib/rancher/rke2/agent/etc/containerd/config.toml -a /run/k3s/containerd/containerd.sock --state /run/k3s/+ 
 9995 root      20   0  828864  96708  36368 S   6.2  0.1  21:55.14 kubelet --volume-plugin-dir=/var/lib/kubelet/volumeplugins --file-check-frequency=5s --sync-frequency=30s --address=0.0.0.0 -+ 
12030 root      20   0  165096   3244   1620 S   6.2  0.0   0:13.37 top                                                                                                                            
    1 root      20   0  191808   4808   2628 S   0.0  0.0   1:20.92 /usr/lib/systemd/systemd --switched-root --system --deserialize 22
```

4. 输入`top -H -p pid` 通过此命令可以查看实际占用CPU最高的的线程的id，pid为刚才资源使用高的pid号图片
```shell
top -H -p 1
```

5. 出现具体线程的资源使用情况，表格里的pid代表线程的id，我们称他为tid图片
```shell
 PID USER      PR  NI    VIRT    RES    SHR S %CPU %MEM     TIME+ COMMAND                                                                                                                         
 9937 root      20   0  951076 128088  42296 R 99.9  0.1 122:12.69 rke2                                                                                                                            
 9944 root      20   0  951076 128088  42296 S 80.0  0.1 109:54.66 rke2                                                                                                                            
14452 root      20   0  951076 128088  42296 R 26.7  0.1 112:58.42 rke2                                                                                                                            
 9922 root      20   0  951076 128088  42296 S  0.0  0.1   0:00.05 rke2                                                                                                                            
 9923 root      20   0  951076 128088  42296 S  0.0  0.1   1:06.18 rke2                                                                                                                            
 9924 root      20   0  951076 128088  42296 S  0.0  0.1 118:43.28 rke2                                                                                                                            
 9925 root      20   0  951076 128088  42296 S  0.0  0.1 110:58.90 rke2                                                                                                                            
```

6. 我记得当时的tip为746（上述图片只是我给大家重复步骤），使用命令`printf "%x\n" 746`，将线程tid转换为16进制，图片因为我们线程id号在堆栈里是16进制的所以需要做一个进制转换
```shell
printf "%x\n" 746

2ea
```

7. 输入`jstack pid | grep 2ea > gc.stack`图片解释一下，jstack是jdk给提供的监控调优小工具之一，jstack会生成JVM当前时刻的线程快照，然后我们可以通过它查看某个Java进程内的线程堆栈信息，之后我们把堆栈信息通过管道收集2ea线程的信息，然后将信息生成为`gc.stack`文件，我随便起的，随意
```shell
jstack pid | grep 2ea > gc.stack
```

8. 当时我先`cat gc.stack` 发现数据有点多在容器里看不方便，于是我下载到本地浏览，因为公司对各个机器的访问做了限制，我只能用跳板机先找到一台没用的机器a，把文件下载到a然后我再把a里的文件下载到本地（本地访问跳板机OK），先输入`python -m SimpleHTTPServer 8080`，linux自带python，这个是开启一个简单http服务供外界访问，图片然后登录跳板机，使用curl下载`curl -o http://ip地址/gcInfo.stack` 为方便演示，我在图中把ip换了一个假的图片之后用同样的方法从本地下载跳板机就可以了，记得关闭python开启的建议服务嗷
```shell
curl -o http://192.168.0.100/gc.stack
```

9.  把文件下载到了本地，打开查看编辑器搜索2ea，找到nid为2ea的堆栈信息，图片之后找到对应的impl根据行数分析程序
```shell

```

10. 发现是在文件异步导出excel的时候，导出接口使用了公共列表查询接口，列表接口查询数据最多为分页200一批，而导出数据量每个人的权限几万到十几万不等图片并且该判断方法使用了嵌套循环里判断，且结合业务很容易get不到value，guava下的newArrayList就是返回一个newArrayList（好像不用说这么细 (；一_一 ），在整个方法结束之前，产生的lists生命周期还在所以发生多次gc触发重启之后还影响到了别的pod。然后对代码进行了fix，紧急上线，问题解决~
```shell

```

结束语





刚开始遇到这个情况也是比较害怕，报警直接开始循环了，自己也没有遇到过这种问题，经过这次的经历，自我感觉处理的还好，遇到问题先保证服务是否可用，如果所有pod都出现这个问题是否需要扩容pod或者重启pod，还好这个只是一个pod出现了这个问题，解决完心里也很开心。当时心理历程就是我宁愿犯错也不愿什么都不做，太哈人了 = =，勤能补拙是良训，继续加油~