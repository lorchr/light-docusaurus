#!/bin/bash

# 第一部分告警配置
# 获取昨日时间
yesterday=`date -d yesterday +%Y-%m-%d`
# 备份日志
cp ./audit.log ./audit.log.${yesterday}.log
cat /dev/null > ./audit.log
# 分析昨日登录次数
tologin=`grep login audit.log.${yesterday}.log | grep ${yesterday} | wc -l`


# 第二部分与企业微信联动
# 设置企业微信相关信息
# 每个企业都拥有唯一的corpid，获取此信息可在管理后台“我的企业”－“企业信息”下查看“企业ID”（需要有管理员权限）
corpid="xxxxx"

# secret是企业应用里面用于保障数据安全的“钥匙”，每一个应用都有一个独立的访问密钥，为了保证数据的安全，secret务必不能泄漏。secret查看方法：在管理后台->“应用管理”->“应用”->“自建”，点进某个应用，即可看到。
corpsecret="xxxxx"

# 每个应用都有唯一的agentid。在管理后台->“应用管理”->“应用”，点进某个应用，即可看到agentid。
agentid="xxxxx"

# 每个部门都有唯一的id，在管理后台->“通讯录”->“组织架构”->点击某个部门右边的小圆点可以看到
#toparty="PartyID"

# 每个成员都有唯一的userid，即所谓“账号”。在管理后台->“通讯录”->点进某个成员的详情页，可以看到。
userids="xxxxx|xxxxx"

# 获取access_token URL
url="https://qyapi.weixin.qq.com/cgi-bin/gettoken"
 
# access_token是企业后台去企业微信的后台获取信息时的重要票据，由corpid和secret产生。所有接口在通信时都需要携带此信息用于验证接口的访问权限,jq 可通过 yum install jq 安装。
access_token=$(curl -s -G "$url" --data-urlencode "corpid=$corpid" --data-urlencode "corpsecret=$corpsecret" | jq -r .access_token)
 
# 发送的消息
message="{\"touser\" : \"$userids\", \"toparty\" : \"$toparty\", \"msgtype\" : \"text\", \"agentid\" : \"$agentid\", \"text\" : {\"content\" : \"您昨日ssh被登录：$tologin次，请及时处理！\"}}"

curl -s -X POST "https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=$access_token" -d "$message"
