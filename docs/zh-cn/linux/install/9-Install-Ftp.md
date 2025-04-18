- [Debian简单配置FTP](https://blog.csdn.net/weixin_45051519/article/details/135746441)
- [linux下ftp连接：530 Permission denied](https://blog.csdn.net/bamuta/article/details/7821607)
- [Ubuntu中安装配置和卸载FTP](https://www.cnblogs.com/jikexianfeng/p/5862167.html)
- [Ubuntu中安装配置和卸载FTP](http://zyjustin9.iteye.com/blog/2178943)

## Debian简单配置FTP服务器

### 1、安装ftp
```bash
apt install -y ftp vsftpd
```

### 2、创建ftp共享路径
```bash
# 创建路径
mkdir /ftp 

# 给予权限
chmod 777 /ftp 
```

### 3、修改配置文件

```bash
vim /etc/vsftpd.conf

listen=YES          # 监听ipv4端口
listen_ipv6=NO      # 关闭监听ipv6
anonymous_enable=NO # 禁止匿名登录
write_enable=YES    #是否允许上传文件，不开启会报 550 permission denied  
local_enable=YES    # 是否允许本地用户访问  
local_umask=022     # 上传写入权限（反掩）
local_root=/ftp     # 登录根路径

#anon_upload_enable=YES         # 匿名上传允许，默认是NO  
#anon_mkdir_write_enable=YES    # 匿名创建文件夹允

chroot_local_user=YES           # 用于指定用户列表文件中的用户是否允许切换到上级目录。默认值为NO。  
chroot_list_enable=YES          # 设置是否启用chroot_list_file配置项指定的用户列表文件。默认值为NO。  
chroot_list_file=/etc/vsftpd.chroot_list
```

### 4、创建ftp测试用户
要允许用户访问FTP服务器，我们需要创建一个帐户。打开终端并输入以下命令：
```bash
adduser ftpuser
```

这将创建一个名为ftpuser的用户。你会被提示输入新用户的密码和其他信息。

为了让用户能够访问FTP服务器，你需要将其添加到FTP用户组中。输入以下命令：
```bash
usermod -a -G ftp ftpuser
```

现在用户已经可以访问FTP服务器并上传/下载文件了。

### 5、启动ftp服务
```bash
systemctl start vsftpd

service vsftp start

```

这将启动vsftpd服务。你可以使用以下命令检查服务的状态：
```bash
systemctl status vsftpd

```

如果服务正在运行，你会看到输出显示Active: active (running)。

如下：
```bash
service vsftpd restart
● vsftpd.service - vsftpd FTP server
     Loaded: loaded (/lib/systemd/system/vsftpd.service; enabled; preset: enabled)
     Active: active (running) since Sun 2024-08-25 15:50:16 CST; 12min ago
    Process: 2334227 ExecStartPre=/bin/mkdir -p /var/run/vsftpd/empty (code=exited, status=0/SUCCESS)
   Main PID: 2334229 (vsftpd)
      Tasks: 1 (limit: 9257)
     Memory: 888.0K
        CPU: 81ms
     CGroup: /system.slice/vsftpd.service
             └─2334229 /usr/sbin/vsftpd /etc/vsftpd.conf

Aug 25 15:50:16 pve systemd[1]: Starting vsftpd.service - vsftpd FTP server...
Aug 25 15:50:16 pve systemd[1]: Started vsftpd.service - vsftpd FTP server.
Aug 25 15:50:46 pve vsftpd[2334279]: pam_listfile(vsftpd:auth): Refused user root for service vsftpd
```

### 6、测试FTP服务器
现在FTP服务器已经启动，我们可以使用ftp客户端测试它。打开另一个终端窗口并输入以下命令：
```bash
ftp 100.76.204.59 21
```

这将连接到运行在本地计算机上的FTP服务器。如果连接成功，你将看到以下输出：
```bash
$ ftp 192.168.66.150 21
Connected to 192.168.66.150.
220 (vsFTPd 3.0.3)
Name (192.168.66.150:light): ftpuser
331 Please specify the password.
Password:
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp>

```

可以使用以下命令上传文件：
```bash
put /path/to/local/file /remote/file/name
```

使用以下命令下载文件：

```bash
get /remote/file/name /path/to/local/file
```

客户端下载文件如下：

```bash
busybox ftpget -u ftpuser -p 123456 192.168.66.150 /tmp/test.py /tmp/test.py 
```


## Ubuntu中安装配置和卸载FTP

转载：http://zyjustin9.iteye.com/blog/2178943

### 一.安装
1. 用apt-get工具安装vsftpd：
```bash
$ sudo apt-get install vsftpd  
```

2. 检查FTP端口是否已经打开
```bash
$ netstat -tnl
```

或者直接在浏览器里输入 ftp://服务器IP

3. 开启、停止、重启vsftpd服务的命令：
```bash
service vsftpd start | stop | restart  
```

### 二.配置
1. 修改配置文件
```bash
vim /etc/vsftpd.conf  
```

主要配置：

```bash
listen=YES                 # 服务器监听  
local_enable=YES         # 是否允许本地用户访问  
write_enable=YES         # 是否允许上传文件，不开启会报 550 permission denied  
anonymous_enable=NO     # 匿名访问允许，默认不要开启，  
#anon_upload_enable=YES # 匿名上传允许，默认是NO  
#anon_mkdir_write_enable=YES # 匿名创建文件夹允许  
```

用户访问目录的权限设置：
在默认配置下，本地用户登入FTP后可以使用cd命令切换到其他目录，这样会对系统带来安全隐患。可以通过以下三条配置文件来控制用户切换目录。
```bash
chroot_local_user=YES       # 用于指定用户列表文件中的用户是否允许切换到上级目录。默认值为NO。  
chroot_list_enable=YES      # 设置是否启用chroot_list_file配置项指定的用户列表文件。默认值为NO。  
chroot_list_file=/etc/vsftpd.chroot_list      
# 禁用的列表名单，格式为一行一个用户，用于指定用户列表文件，该文件用于控制哪些用户可以切换到用户家目录的上级目录。  
```

通过搭配能实现以下几种效果：
```bash
(1).当chroot_list_enable=YES，chroot_local_user=YES时，在/etc/vsftpd.chroot_list文件中列出的用户，可以切换到其他目录；未在文件中列出的用户，不能切换到其他目录。  
(2).当chroot_list_enable=YES，chroot_local_user=NO时，在/etc/vsftpd.chroot_list文件中列出的用户，不能切换到其他目录；未在文件中列出的用户，可以切换到其他目录。  
(3).当chroot_list_enable=NO，chroot_local_user=YES时，所有的用户均不能切换到其他目录。  
(4).当chroot_list_enable=NO，chroot_local_user=NO时，所有的用户均可以切换到其他目录。  
```

其他配置解释：
```bash
local_umask=022             # FTP上本地的文件权限，默认是077  
dirmessage_enable=YES       # 进入文件夹允许  
xferlog_enable=YES          # ftp 日志记录允许  
connect_from_port_20=YES    # 启用20号端口作为数据传送的端口  
xferlog_enable=yes          # 激活上传和下传的日志  
xferlog_std_format=yes      # 使用标准的日志格式  
ftpd_banner=XXXXX           # 欢迎信息  
```

相关链接：
[vsftpd配置文件详解](http://www.cnblogs.com/acpp/archive/2010/02/08/1666054.html)

2. 重启vsftpd服务

```bash
/etc/init.d/vsftpd restart
# 或
service vsftpd restart
# 或
systemctl restart vsftpd

```

注：修改配置文件后一定要重启服务才能生效
 
### 三.FTP增加删除用户
1. 增加用户

```bash
# 创建目录
mkdir -p /ftp

# 创建用户
sudo useradd -g ftp -d /ftp -m ftpuser

# 设置用户口令
sudo passwd ftppass  

# 编辑 `/etc/vsftpd.chroot_list` 文件，将ftp的帐户名添加进去，保存退出
vim /etc/vsftpd.chroot_list

# 重新启动vsftpd，修改用户权限文件 `vsftpf.chroot_list` 文件后一定要重启服务才能生效
service vsftpd restart

```
注:
- `-g`：用户所在的组 
- `-d`：表示创建用户的自己目录的位置给予指定 
- `-m`：不建立默认的自家目录，也就是说在 `/home` 下没有自己的目录

2. 增加用户

```bash
# 删除用户
userdel ftpuser

```

### 四.卸载
```bash
apt-get remove -y --purge vsftpd
```

注:
  - `--purge` 选项表示彻底删除改软件和相关文件
