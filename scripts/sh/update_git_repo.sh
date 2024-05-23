#!/bin/bash

# 定义更新Git仓库多个分支的函数
function update_git_repo() {
  # 定义选项和它们的短格式和长格式
  short_options="r:b:"
  long_options=("repo:","branches:")

  # 初始化optind（getopts的内部变量）
  OPTIND=1

  # 解析命令行参数
  while getopts ":$short_options" opt; do
    case $opt in
      r | --repo)
        repo_path="$OPTARG"
        ;;
      b | --branches)
        branches=($OPTARG)
        ;;
      \?)
        echo "Invalid option: -$OPTARG" >&2
        return 1
        ;;
      :)
        echo "Option -$OPTARG requires an argument." >&2
        return 1
        ;;
    esac
  done

  # 移除已处理的短选项
  shift $((OPTIND-1))

  # 检查剩余参数数量
#   if [ -z "$branches" ]; then
#     echo "Branches are required (use -b or --branches)." >&2
#     return 1
#   fi

  # 如果没有提供仓库路径，给出错误提示
  if [ -z "$repo_path" ]; then
    echo "Repository path is required." >&2
    return 1
  fi

  # 进入仓库目录
  cd "$repo_path" || { echo "Error: Cannot CD to $repo_path"; return 1; }

  # 如果没有提供分支，就更新当前分支
  if [ -z "$branches" ]; then
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    echo "Updating current branch: $current_branch"
    # 拉取远程分支的最新改动并自动合并
    git pull "$remote_name" "$current_branch" || { echo "Error: Failed to pull updates for branch $current_branch"; return 1; }
    return 0
  fi

  # 设置默认的远程名为origin
  remote_name="origin"

  # 遍历所有分支进行更新
  for branch in "${branches[@]}"; do
    echo -e "\r\nUpdating branch: $branch"
    # 切换到目标分支
    git checkout "$branch" || { echo "Error: Failed to checkout branch $branch"; continue; }
    
    # 拉取远程分支的最新改动并自动合并
    git pull "$remote_name" "$branch" || { echo "Error: Failed to pull updates for branch $branch"; continue; }
  done

  # 返回之前的路径
  cd -
  echo "All specified branches have been updated."
}

# 示例调用，更新多个分支
# update_git_repo -r /path/to/repo.git -b "branch1 branch2 branch3"
# 或者
# update_git_repo --repo /path/to/repo.git --branch "branch1 branch2 branch3"
# 示例调用，不指定分支则更新当前分支
# update_git_repo --repo /path/to/repo.git