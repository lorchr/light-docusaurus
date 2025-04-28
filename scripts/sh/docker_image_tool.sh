#!/bin/bash
# 名称: docker_image_tool.sh
# 描述: Docker镜像导出/导入一体化工具
# 用法: 
#   导出镜像: ./docker_image_tool.sh export [输出目录] (默认输出目录为 ./docker_images)
#   导入镜像: ./docker_image_tool.sh import <镜像目录路径>

# 定义颜色常量
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # 恢复默认颜色

########################################
# 导出镜像函数
# 参数: $1=输出目录
########################################
export_images() {
  local output_dir="${1:-images}"

  echo -e "${GREEN}[INFO] 开始导出镜像到目录: ${output_dir}${NC}"
  mkdir -p "$output_dir" || {
    echo -e "${RED}[ERROR] 无法创建目录: ${output_dir}${NC}"
    exit 1
  }

  # 获取有效镜像列表
  local image_list
  image_list=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "<none>:<none>")

  if [[ -z "$image_list" ]]; then
    echo -e "${YELLOW}[WARN] 没有找到需要导出的镜像${NC}"
    exit 0
  fi

  # 进度计数器
  local total=$(echo "$image_list" | wc -l)
  local count=0

  echo "$image_list" | while read -r image; do
    ((count++))
    filename=$(echo "$image" | sed 's/[\/:]/_/g').tar
    echo -e "${GREEN}[INFO] (${count}/${total}) 正在导出: ${image} -> ${filename}${NC}"
    docker save -o "${output_dir}/${filename}" "$image" || {
      echo -e "${RED}[ERROR] 导出失败: ${image}${NC}"
      rm -f "${output_dir}/${filename}"  # 删除不完整的文件
    }
  done

  echo -e "${GREEN}[SUCCESS] 所有镜像导出完成 (共 ${total} 个)${NC}"
}

########################################
# 导入镜像函数
# 参数: $1=输入目录
########################################
import_images() {
  local input_dir="$1"

  # 参数检查
  if [[ ! -d "$input_dir" ]]; then
    echo -e "${RED}[ERROR] 镜像目录不存在: ${input_dir}${NC}"
    exit 1
  fi

  # 检查Docker是否可用
  if ! command -v docker &>/dev/null; then
    echo -e "${RED}[ERROR] Docker 未安装或不可用${NC}"
    exit 1
  fi

  # 查找所有tar文件
  local file_list
  file_list=$(find "$input_dir" -type f -name "*.tar")
  if [[ -z "$file_list" ]]; then
    echo -e "${YELLOW}[WARN] 未找到任何.tar镜像文件${NC}"
    exit 0
  fi

  local total=$(echo "$file_list" | wc -l)
  local count=0

  echo "$file_list" | while read -r file; do
    ((count++))
    echo -e "${GREEN}[INFO] (${count}/${total}) 正在导入: $(basename "$file")${NC}"
    docker load -i "$file" || echo -e "${RED}[ERROR] 导入失败: ${file}${NC}"
  done

  echo -e "${GREEN}[SUCCESS] 所有镜像导入完成 (共 ${total} 个)${NC}"
}

########################################
# 主逻辑
########################################
case "$1" in
  export)
    export_images "$2"
    ;;
  import)
    if [[ -z "$2" ]]; then
      echo -e "${RED}[ERROR] 导入模式需要指定镜像目录路径${NC}"
      echo "用法: $0 import <镜像目录路径>"
      exit 1
    fi
    import_images "$2"
    ;;
  *)
    echo "Docker镜像管理工具"
    echo "用法:"
    echo "  导出镜像: $0 export [输出目录] (默认: ./docker_images)"
    echo "  导入镜像: $0 import <镜像目录路径>"
    exit 1
    ;;
esac
