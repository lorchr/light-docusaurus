## 1. 安装 NodeJS

全局设置配置nodejs，起名jenkins-nodes12.18

```shell
# 下载安装包
wget https://nodejs.org/dist/v12.18.0/node-v12.18.0-linux-x64.tar.gz

# 创建安装目录
mkdir /usr/local/node

# 解压
tar -zxvf node-v12.18.0-linux-x64.tar.gz -C /usr/local/node/

# 设置环境变量
cat >> /etc/profile << EOF
# Node Enviroment
NODE_HOME=/usr/local/node/node-v12.18.0-linux-x64
PATH=$NODE_HOME/bin:$PATH
export NODE_HOME PATH
EOF

# 刷新配置
source /etc/profile

# 重命名
mv node-v12.18.0-linux-x64 jenkins-nodes12.18
```
