#!/bin/bash

# 指定目标目录
target_directory="D:/workspace/Github"

# 输出文件的名称
output_file="D:/workspace/Result.txt"

# 进入目标目录
cd "$target_directory"

# 清空输出文件（如果存在）
> "$output_file"

# 查找所有的Git仓库并获取(push)的远程URL
find . -type d -name .git | while read gitdir; do
  repo_dir=$(dirname "$gitdir")
  (
    cd "$repo_dir" || exit
    push_url=$(git remote -v | awk '/\(push\)/ { print $2 }')
    if [ -n "$push_url" ]; then
      echo "$push_url" >> "$output_file"
    fi
  )
done

echo "Git仓库的URL已输出到 $output_file 文件中。"

# https://gitee.com/lhwen/crmeb.git
# https://gitee.com/dromara/dante-cloud.git
# https://gitee.com/jackjiang/beautyeye.git
# https://gitee.com/dibo_software/diboot.git
# https://gitee.com/gailunJAVA/dingding-mid-business-java.git
# https://gitee.com/nepxion/Discovery.git
# https://gitee.com/nepxion/DiscoveryPlatform.git
# https://gitee.com/makejava/EasyCode.git
# https://gitee.com/52jian/EasyMedia.git
# https://gitee.com/lemur/easypoi-test.git
# https://gitee.com/pingfanrenbiji/flowable-springboot-demo.git
# https://gitee.com/fluent-mybatis/fluent-mybatis.git
# https://gitee.com/Cwm341638/gb28181-java-sip.git
# https://gitee.com/pnoker/iot-dc3.git
# https://gitee.com/jeecg/jeecg-boot.git
# https://gitee.com/jeecg/jeecgboot-vue3.git
# https://gitee.com/willianfu/jw-workflow-engine.git
# https://gitee.com/willianfu/jw-workflow-engine-server.git
# https://gitee.com/litao851025/lego.git
# https://gitee.com/makunet/maku-admin.git
# https://gitee.com/makunet/maku-boot.git
# https://gitee.com/makunet/maku-form-design.git
# https://gitee.com/dromara/MaxKey.git
# https://gitee.com/baomidou/mybatis-plus-samples.git
# https://gitee.com/mirrors/Nacos.git
# https://gitee.com/only4playgroup/op-system-center.git
# https://gitee.com/banmajio/RTSPtoHTTP-FLV.git
# https://gitee.com/pingfanrenbiji/RuoYi-flowable.git
# https://gitee.com/y_project/RuoYi-Vue.git
# https://gitee.com/dromara/sa-token.git
# https://gitee.com/zhurongsheng/springcloud-gateway-rsa.git
# https://gitee.com/yang-ruyuan/video-system-open.git
# https://gitee.com/pan648540858/wvp-GB28181-pro.git
# https://gitee.com/lhwen/xuanteng.git
# https://gitee.com/xuxueli0323/xxl-job.git

# https://github.com/Activiti/activiti-cloud.git
# https://github.com/Linyuzai/concept.git
# https://github.com/gzzchh/DBE-Agent.git
# https://github.com/gzzchh/de-ag.git
# https://github.com/gzzchh/de-ag.git
# https://github.com/dtm-labs/dtm.git
# https://github.com/alibaba/easyexcel.git
# https://github.com/YoungBear/JavaUtils.git
# https://github.com/babyfish-ct/jimmer.git
# https://github.com/lexburner/longPolling-demo.git
# https://github.com/IcedWatermelonJuice/Online-Player.git
# https://github.com/rakion99/shelter-editor.git
# https://github.com/signalapp/Signal-Server.git
# https://github.com/spring-projects/spring-authorization-server.git
# https://github.com/spring-projects/spring-security-samples.git
# https://github.com/Tom-shushu/work-study.git

# git@codeup.aliyun.com:5f9aba853a5188f27f3f43ba/base/ideasettings.git
# git@codeup.aliyun.com:5f9aba853a5188f27f3f43ba/base/op-archetypes.git
# git@codeup.aliyun.com:5f9aba853a5188f27f3f43ba/base/op-bom.git
# git@codeup.aliyun.com:5f9aba853a5188f27f3f43ba/base/op-codegen-plugin.git
# git@codeup.aliyun.com:5f9aba853a5188f27f3f43ba/base/op-common-starters.git
# git@codeup.aliyun.com:5f9aba853a5188f27f3f43ba/base/op-commons.git
# git@codeup.aliyun.com:5f9aba853a5188f27f3f43ba/base/op-order-commons.git

# git@gitee.com/lorchr/codgen.git
# git@github.com/lorchr/codgen-plugin.git
# git@github.com/lorchr/light-docsify.git
# git@github.com:lorchr/light-docusaurus.git
# git@gitee.com/lorchr/go-samples.git
# git@github.com:lorchr/torch-web.git
# git@gitee.com/lorchr/spring-cloud-samples.git
