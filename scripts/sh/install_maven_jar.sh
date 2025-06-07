#!/bin/bash

# 检查参数
if [ $# -eq 0 ]; then
    root_dir=$(pwd)
elif [ $# -eq 1 ]; then
    root_dir=$(realpath "$1")
else
    echo "用法: $0 [根目录]"
    echo "示例: $0 ~/my-maven-jars"
    exit 1
fi

# 初始化计数器
declare -i total=0 success=0 fail=0 skip=0

echo "正在扫描目录: $root_dir"
echo "----------------------------------------"

# 使用临时文件避免子shell问题
tmp_file=$(mktemp)
find "$root_dir" -type f \( -name "*.jar" -o -name "*.pom" \) > "$tmp_file"

while read -r file; do
    ((total++))
    
    # 获取文件信息
    file_path=$(realpath "$file")
    file_name=$(basename "$file_path")
    file_ext="${file_name##*.}"
    
    # 分解路径
    version_dir=$(dirname "$file_path")
    version=$(basename "$version_dir")
    
    artifact_dir=$(dirname "$version_dir")
    artifact_id=$(basename "$artifact_dir")
    
    group_dir=$(dirname "$artifact_dir")
    
    # 计算相对于根目录的groupId
    relative_path=${group_dir#$root_dir/}
    group_id=$(echo "$relative_path" | tr '/' '.' | sed 's/^\.*//;s/\.*$//')

    # 确定packaging类型
    case $file_ext in
        "jar") packaging="jar" ;;
        "pom") packaging="pom" ;;
        *) 
            echo "[错误] 不支持的文件类型: $file_ext"
            ((fail++))
            continue
            ;;
    esac

    # 如果是POM文件且存在对应JAR则跳过
    if [ "$packaging" = "pom" ]; then
        jar_pattern="${version_dir}/${file_name%.*}.jar"
        if ls "$jar_pattern" 1> /dev/null 2>&1; then
            echo "[跳过] 发现JAR文件存在，跳过POM安装: ${file_name}"
            ((skip++))
            echo "----------------------------------------"
            continue
        fi
    fi

    # 验证参数
    if [[ -z "$group_id" || -z "$artifact_id" || -z "$version" ]]; then
        echo "[错误] 无效目录结构: $file_path"
        echo "路径应遵循: groupId/artifactId/version/file.{jar|pom}"
        ((fail++))
        echo "----------------------------------------"
        continue
    fi
    
    # 执行安装命令
    echo "[安装] $group_id:$artifact_id:$version ($packaging)"
    mvn -q install:install-file \
        -Dfile="$file_path" \
        -DgroupId="$group_id" \
        -DartifactId="$artifact_id" \
        -Dversion="$version" \
        -Dpackaging="$packaging"
    
    if [ $? -eq 0 ]; then
        echo "[成功] 已安装到本地仓库"
        ((success++))
    else
        echo "[失败] 安装出错"
        ((fail++))
    fi
    echo "----------------------------------------"
done < "$tmp_file"

rm "$tmp_file"

echo "安装完成"
echo "总计发现: $total 个文件"
echo "成功安装: $success 个"
echo "安装失败: $fail 个"
echo "自动跳过: $skip 个"