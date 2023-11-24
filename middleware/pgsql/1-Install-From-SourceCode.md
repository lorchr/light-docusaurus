在CentOS 7.9上通过源码编译安装 PostgreSQL 12.5 需要执行以下步骤：

1. **安装编译所需的依赖项：**

   首先，确保您的系统已安装以下编译 PostgreSQL 所需的依赖项：

   ```shell
   sudo yum install -y gcc make readline-devel zlib-devel
   ```

2. **下载 PostgreSQL 12.5 源码：**

   前往 PostgreSQL 官方网站下载 PostgreSQL 12.5 的源码压缩包：https://www.postgresql.org/ftp/source/v12.5/postgresql-12.5.tar.gz

   ```shell
   wget https://ftp.postgresql.org/pub/source/v12.5/postgresql-12.5.tar.gz
   ```

3. **解压并编译源码：**

   解压下载的源码文件并进入源码目录：

   ```shell
   tar -xvf postgresql-12.5.tar.gz
   cd postgresql-12.5
   ```

   然后，配置、编译并安装 PostgreSQL：

   ```shell
   ./configure
   make clean
   make
   sudo make install
   ```

4. **创建 PostgreSQL 数据目录和用户：**

   创建一个用于存储 PostgreSQL 数据的目录，并创建一个专用的 PostgreSQL 用户和组：

   ```shell
   sudo mkdir -p /usr/local/pgsql/data
   sudo useradd -m postgres
   sudo passwd postgres
   ```

5. **初始化数据库集群：**

   使用 `initdb` 命令初始化 PostgreSQL 数据库集群。确保使用 postgres 用户身份运行此命令：

   ```shell
   sudo -u postgres /usr/local/pgsql/bin/initdb -D /usr/local/pgsql/data
   ```

6. **启动 PostgreSQL 服务：**

   启动 PostgreSQL 服务：

   ```shell
   sudo -u postgres /usr/local/pgsql/bin/pg_ctl -D /usr/local/pgsql/data -l logfile start
   ```

7. **配置环境变量（可选）：**

   您可以将 PostgreSQL 可执行文件的路径添加到系统的 PATH 变量中，以便更轻松地访问 PostgreSQL 命令：

   ```shell
   echo 'export PATH=$PATH:/usr/local/pgsql/bin' >> ~/.bashrc
   source ~/.bashrc
   ```

8. **测试连接：**

   使用 `psql` 命令测试连接到 PostgreSQL 数据库：

   ```shell
   psql -U postgres
   ```

   这将提示您输入密码。输入之前为 postgres 用户设置的密码，然后应该能够成功连接到 PostgreSQL 数据库。

现在，您已经成功地通过源码编译和安装了 PostgreSQL 12.5，并可以开始使用它。如果需要进一步配置和管理 PostgreSQL，请查看 PostgreSQL 的官方文档和相关资源。
