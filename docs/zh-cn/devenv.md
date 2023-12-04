# Dev Environment

# 0. 软件列表
1. [InteliJ IDEA](https://www.jetbrains.com/zh-cn/idea/download/) [Zhile](https://zhile.io)
2. [DBeaver](https://dbeaver.io/) [Zhile](https://zhile.io)
3. [MobaxTerm](https://mobaxterm.mobatek.net/) [savet-Gitee](https://gitee.com/savet/windows_bats.git) [flygon2018-Github](https://github.com/flygon2018/MobaXterm-keygen/tree/master)
4. [VS Code](https://code.visualstudio.com/)
5. [Maven](https://maven.apache.org/index.html) [Repository](https://mvnrepository.com)
6. [JDK](https://openjdk.org/) [JDK8](https://jdk.java.net/java-se-ri/8-MR5) [JDK21](https://jdk.java.net/21/)
7. [Git](https://git-scm.com/) [Download](https://git-scm.com/download/win)
8. [U Tools](https://www.u.tools/)
9. [Docker](https://www.docker.com/) [DockerHub](https://hub.docker.com/)
10. [Chrome](https://www.google.cn/chrome/index.html)
11. [企业微信](https://work.weixin.qq.com/) [钉钉](https://www.dingtalk.com/)
12. [FoxMail](https://www.foxmail.com/)
13. [我们所向往的](https://wmsxwd-c.men)
14. [wkhtmltopdf](https://wkhtmltopdf.org/)

# 1. IDEA
[IDEA](devenv/2-IDEA.md ':include')

# 2. Git
```shell

git config --global user.name "lorchr"
git config --global user.email "lorchr@163.com"
git config --global core.longpaths true

ssh-keygen -t rsa -C "lorchr@163.com"
cat /c/Users/lorchr/.ssh/id_rsa.pub

git init
git add .
git commit -m "Init project"
git remote add origin https://cloud.com/lorchr/spring-cloud-samples.git
git branch --set-upstream-to=origin/master master
git push -u origin master
```

常用操作
```shell
-- 克隆仓库
git clone https://github.com/lorchr/spring-cloud-samples.git

-- 查看远程仓库地址
git remote -v

-- 移除远程仓库
git remote rm origin

-- 添加新的远程仓库地址
git remote add           cloud https://gitee.com/lorchr/spring-cloud-samples.git
git remote set-url --add origin https://github.com/lorchr/spring-cloud-samples.git
git push -u cloud master

# 提交
git push 仓库别名 分支 --allow-unrelated-histories
# 检出
git pull 仓库别名 分支 --allow-unrelated-histories
```

# 3. WSL Docker
[WSL Docker](devenv/1-WSL-Docker.md ':include')

# 4. Mysql
[Mysql](devenv/10-Docker-Mysql.md ':include')

# 5. Pgsql
[Pgsql](devenv/11-Docker-Pgsql.md ':include')

# 6. Redis
[Redis](devenv/14-Docker-Redis.md ':include')

# 7. InfluxDB
[InfluxDB](devenv/15-Docker-InfluxDB.md ':include')

# 8. EMQX
[EMQX](devenv/17-Docker-EMQX.md ':include')

# 9. Elasticsearch
[Elasticsearch](devenv/16-Docker-Elasticsearch.md ':include')

# 10. Nodered
[Node Red](devenv/24-Docker-Nodered.md ':include')

## Crack
### 1. MobaXterm
1. 在官网下载 community 版本的zip客户端
2. 下载 `MobaXterm-Keygen.py` 脚本，保存到 MobaXterm 解压目录
   - `python ./MobaXterm-Keygen.py subject mobaxterm_version`
3. 执行命令 `python ./MobaXterm-Keygen.py "Light" 23.2`

#### 示例
```shell
# Usage:
    MobaXterm-Keygen.py <UserName> <Version>

    <UserName>:      The Name licensed to
    <Version>:       The Version of MobaXterm
                     Example:    10.9

# EXAMPLE:
PS C:\Users\DoubleSine\Github\MobaXterm-Keygen> .\MobaXterm-Keygen.py "DoubleSine" 10.9
[*] Success!
[*] File generated: C:\Users\DoubleSine\Github\MobaXterm-Keygen\Custom.mxtpro
[*] Please move or copy the newly-generated file to MobaXterm\'s installation path.

# Then copy Custom.mxtpro to C:\Program Files (x86)\Mobatek\MobaXterm.
```


### 2. DBeaver
1. 在官网下载 UE 版zip客户端,
2. [破解插件](https://zhile.io/2019/05/09/dbeaver-ue-license-crack.html)[下载](https://pan.baidu.com/s/1Ci_g6SHRaYL923FnH6zX1g?pwd=hvx1)
3. 破解`22.0`版本，修改`dbeaver.ini`文件
4. 打开程序，使用激活码激活
4. 破解`23.2`版本，修改`dbeaver.ini`文件
5. 打开`23.2`程序使用即可（破解`22.0`后自动激活，不需要再次输入激活码）

#### DBeaver 22.0 配置
```ini
-vm
D:\Develop\Jdk\jdk-17\bin
-startup
plugins/org.eclipse.equinox.launcher_1.6.400.v20210924-0641.jar
--launcher.library
plugins/org.eclipse.equinox.launcher.win32.win32.x86_64_1.2.400.v20211117-0650
-vmargs
-XX:+IgnoreUnrecognizedVMOptions
--add-modules=ALL-SYSTEM
-Dosgi.requiredJavaVersion=11
-Xms128m
-Xmx2048m
-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT
-Ddbeaver.distribution.type=zip
-javaagent:D:\Develop\database\dbeaver-agent\dbeaver-agent-zhile.jar
;-Dlm.debug.mode=true
```

#### DBeaver 22.0 激活码
```shell
aYhAFjjtp3uQZmeLzF3S4H6eTbOgmru0jxYErPCvgmkhkn0D8N2yY6ULK8oT3fnpoEu7GPny7csN
sXL1g+D+8xR++/L8ePsVLUj4du5AMZORr2xGaGKG2rXa3NEoIiEAHSp4a6cQgMMbIspeOy7dYWX6
99Fhtpnu1YBoTmoJPaHBuwHDiOQQk5nXCPflrhA7lldA8TZ3dSUsj4Sr8CqBQeS+2E32xwSniymK
7fKcVX75qnuxhn7vUY7YL2UY7EKeN/AZ+1NIB6umKUODyOAFIc8q6zZT8b9aXqXVzwLJZxHbEgcO
8lsQfyvqUgqD6clzvFry9+JwuQsXN0wW26KDQA==
```

#### DBeaver 23.2 配置
```ini
-vm 
D:\Develop\jdk\jdk-17\bin
-vmargs
-XX:+IgnoreUnrecognizedVMOptions
-Dosgi.requiredJavaVersion=17
--add-modules=ALL-SYSTEM
--add-opens=java.base/java.io=ALL-UNNAMED
--add-opens=java.base/java.lang=ALL-UNNAMED
--add-opens=java.base/java.lang.reflect=ALL-UNNAMED
--add-opens=java.base/java.net=ALL-UNNAMED
--add-opens=java.base/java.nio=ALL-UNNAMED
--add-opens=java.base/java.nio.charset=ALL-UNNAMED
--add-opens=java.base/java.text=ALL-UNNAMED
--add-opens=java.base/java.time=ALL-UNNAMED
--add-opens=java.base/java.util=ALL-UNNAMED
--add-opens=java.base/java.util.concurrent=ALL-UNNAMED
--add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED
--add-opens=java.base/jdk.internal.vm=ALL-UNNAMED
--add-opens=java.base/jdk.internal.misc=ALL-UNNAMED
--add-opens=java.base/sun.nio.ch=ALL-UNNAMED
--add-opens=java.base/sun.security.ssl=ALL-UNNAMED
--add-opens=java.base/sun.security.action=ALL-UNNAMED
--add-opens=java.base/sun.security.util=ALL-UNNAMED
--add-opens=java.security.jgss/sun.security.jgss=ALL-UNNAMED
--add-opens=java.security.jgss/sun.security.krb5=ALL-UNNAMED
-Xms128m
-Xmx2048m
-Ddbeaver.distribution.type=zip
-javaagent:D:\Develop\database\dbeaver-agent\dbeaver-agent-zhile.jar
-Dlm.debug.mode=true
```

### 3. IDEA
1. 官网下载zip包
2. [破解插件](https://zhile.io/2021/11/29/ja-netfilter-javaagent-lib.html) [源码](https://gitee.com/ja-netfilter/ja-netfilter/releases)
下载从[热心大佬](https://jetbra.in/s) 网站 [下载](https://gateway.ipfs.io/ipfs/bafybeia4nrbuvpfd6k7lkorzgjw3t6totaoko7gmvq5pyuhl2eloxnfiri/files/jetbra-ded4f9dc4fcb60294b21669dafa90330f2713ce4.zip)
3. 修改 `idea64.exe.vmoptions`
4. 打开程序，粘贴复制的[激活码](https://jetbra.in/s)

#### idea64.exe.vmoptions
```
-Xms128m
-Xmx2048m
-XX:ReservedCodeCacheSize=512m
-XX:+UseG1GC
-XX:SoftRefLRUPolicyMSPerMB=50
-XX:CICompilerCount=2
-XX:+HeapDumpOnOutOfMemoryError
-XX:-OmitStackTraceInFastThrow
-XX:+IgnoreUnrecognizedVMOptions
-XX:CompileCommand=exclude,com/intellij/openapi/vfs/impl/FilePartNodeRoot,trieDescend
-ea
-Dsun.io.useCanonCaches=false
-Dsun.java2d.metal=true
-Djbr.catch.SIGABRT=true
-Djdk.http.auth.tunneling.disabledSchemes=""
-Djdk.attach.allowAttachSelf=true
-Djdk.module.illegalAccess.silent=true
-Dkotlinx.coroutines.debug=off
-javaagent:D:\Develop\idea\jetbra\ja-netfilter.jar=jetbrains
--add-opens=java.base/jdk.internal.org.objectweb.asm=ALL-UNNAMED
--add-opens=java.base/jdk.internal.org.objectweb.asm.tree=ALL-UNNAMED
```

### 4. jRebel
**仅对：** `jRebel 2022.4.1`版本及以下有效
1. 生成guid `https://www.guidgen.com/`
2. 激活URL  `https://jrebel.qekang.com/{GUID}`
3. 配置jrebal
   1. `https://jrebel.qekang.com/f7525a23-45ba-417b-ac37-a72b36bc88a5`
   2. `369950806@qq.com`
4. 激活成功后设置为离线模式
