#!/bin/bash

# 定义镜像名称和版本默认值
image_name=""
image_version=""

# 使用getopts来解析选项和参数
while getopts "i:v:-:" opt; do
    case "$opt" in
        i|image)
            image_name="$OPTARG"
            ;;
        v|version)
            image_version="$OPTARG"
            ;;
        -)
            case "${OPTARG}" in
                image=*)
                    image_name="${OPTARG#*=}"
                    ;;
                version=*)
                    image_version="${OPTARG#*=}"
                    ;;
                *)
                    echo "Invalid option: --$OPTARG" >&2
                    exit 1
                    ;;
            esac
            ;;
        *)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

# 检查参数是否已提供
if [ -z "$image_name" ] || [ -z "$image_version" ]; then
    echo "Usage: $0 -i|--image <image_name> -v|--version <version_no>"
    exit 1
fi


# 获取当前日期和时间，用于创建备份文件和标记
timestamp=$(date +%Y%m%d%H%M%S)

# 备份镜像为tar文件
docker save -o "${image_name}_${image_version}_${timestamp}.tar" "${image_name}:${image_version}" || echo "continue execute"

# 构建新的Docker镜像
docker build -t "${image_name}:${image_version}" .

# 推送新的Docker镜像到镜像仓库
docker tag ${image_name}:${image_version} 192.168.0.22:5000/${image_name}:${image_version}
docker push 192.168.0.22:5000/${image_name}:${image_version}

export KUBECONFIG="/root/.kube/config"
export PATH="$PATH:/var/lib/rancher/rke2/bin/"
# 停止之前的部署
kubectl delete -f k8s.yaml || echo "continue execute"

# 等待3秒
sleep 3

# 在Kubernetes上部署应用程序
kubectl apply -f k8s.yaml || echo "continue execute"