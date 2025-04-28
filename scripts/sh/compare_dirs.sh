#!/bin/bash

# 检查参数数量
if [ $# -ne 2 ]; then
    echo "Usage: $0 <directory1> <directory2>"
    exit 1
fi

dir1="$1"
dir2="$2"

# 验证目录是否存在
if [ ! -d "$dir1" ]; then
    echo "错误：目录 '$dir1' 不存在。"
    exit 1
fi
if [ ! -d "$dir2" ]; then
    echo "错误：目录 '$dir2' 不存在。"
    exit 1
fi

# 创建临时文件
list1=$(mktemp)
list2=$(mktemp)
trap 'rm -f "$list1" "$list2"' EXIT  # 确保退出时删除临时文件

# 生成相对路径列表并排序（处理常规文件名）
(cd "$dir1" && find . -type f | sort > "$list1")
(cd "$dir2" && find . -type f | sort > "$list2")

# 找出差异文件
only_in_dir1=$(comm -23 "$list1" "$list2")
only_in_dir2=$(comm -13 "$list1" "$list2")

# 输出结果
if [ -z "$only_in_dir1" ] && [ -z "$only_in_dir2" ]; then
    echo "两个目录中的文件完全一致。"
else
    [ -n "$only_in_dir1" ] && echo "仅在 '$dir1' 中存在的文件：" && echo "$only_in_dir1"
    [ -n "$only_in_dir2" ] && echo "仅在 '$dir2' 中存在的文件：" && echo "$only_in_dir2"
fi
