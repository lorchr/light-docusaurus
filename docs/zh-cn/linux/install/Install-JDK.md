## 1. 安装 JDK

- https://www.oracle.com/java/technologies/oracle-java-archive-downloads.html
- https://www.oracle.com/java/technologies/javase/javase8-archive-downloads.html#license-lightbox
- https://www.oracle.com/java/technologies/javase/javase8u211-later-archive-downloads.html#license-lightbox

```shell
# 查找JDK
rpm -qa | grep java
rpm -qa | grep jdk

# 删除旧的JDK
rpm -e --nodeps java-1.8.0-openjdk-headless-1.8.0.65-3.b17.el7.x86_64
rpm -e --nodeps java-1.8.0-openjdk-1.8.0.65-3.b17.el7.x86_64

# 创建安装目录
mkdir /usr/local/java

# 解压安装文件
tar -zxvf ./jdk-8u221-linux-x64.tar.gz -C /usr/local/java

#设置环境变量
cat >> /etc/profile << EOF
# Java Enviroment
JAVA_HOME=/usr/local/java/jdk1.8.0_221
JRE_HOME=/usr/local/java/jdk1.8.0_221/jre
CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar:$JRE_HOME/lib:$CLASSPATH
PATH=$JAVA_HOME/bin:$PATH
export JAVA_HOME JRE_HOME CLASSPATH PATH
EOF

# 刷新配置
source /etc/profile

# 查看Java版本
java -version
```
