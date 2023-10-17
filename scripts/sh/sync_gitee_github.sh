#!/bin/bash

# 默认值
SOURCE_ADDR="https://gitee.com"
TARGET_ADDR="https://github.com"
SOURCE_REPO=""
TARGET_REPO=""
SYNC_TO_TARGET=true  # 默认为Gitee同步到Github
SOURCE_BRANCH="main"  # 默认Gitee分支
TARGET_BRANCH="main"  # 默认Github分支

# 帮助方法
show_help() {
  echo "使用方法: $0 [选项]"
  echo "选项:"
  echo "  -i, --source <URL>         指定Gitee仓库 URL"
  echo "  -o, --target <URL>         指定Github仓库 URL"
  echo "  -s, --source-branch <branch>  Gitee分支 (默认: main)"
  echo "  -t, --target-branch <branch>  Github分支 (默认: main)"
  echo "  -r, --reverse              反转同步方向 (目标同步到源)"
  echo "  --help                     显示帮助信息"
  exit 0
}

# 获取参数
while getopts "i:o:s:t:r-:" opt; do
  case "$opt" in
    i|source)
      SOURCE_REPO="$OPTARG"
      ;;
    o|target)
      TARGET_REPO="$OPTARG"
      ;;
    s|source-branch)
      SOURCE_BRANCH="$OPTARG"
      ;;
    t|target-branch)
      TARGET_BRANCH="$OPTARG"
      ;;
    r|reverse)
      SYNC_TO_TARGET=false
      ;;
    -)
      case "${OPTARG}" in
        source=*)
          SOURCE_REPO="${OPTARG#*=}"
          ;;
        target=*)
          TARGET_REPO="${OPTARG#*=}"
          ;;
        source-branch=*)
          SOURCE_BRANCH="${OPTARG#*=}"
          ;;
        target-branch=*)
          TARGET_BRANCH="${OPTARG#*=}"
          ;;
        reverse)
          SYNC_TO_TARGET=false
          ;;
        help)
          show_help
          ;;
        *)
          echo "无效选项: --$OPTARG" >&2
          exit 1
          ;;
      esac
      ;;
    *)
      show_help
      ;;
  esac
done

# 检查参数
if [ -z "$SOURCE_REPO" ] || [ -z "$TARGET_REPO" ]; then
  echo "请提供源和目标仓库URL。"
  show_help
fi

# 同步操作
if [ "$SYNC_TO_TARGET" = true ]; then
  # source同步到target
  echo "正在同步 source 到 target (分支: $SOURCE_BRANCH -> $TARGET_BRANCH)..."
  git clone $SOURCE_ADDR/$SOURCE_REPO source_repo
  cd source_repo
  git remote add target $TARGET_ADDR/$TARGET_REPO
  git pull target $TARGET_BRANCH
  git push origin $SOURCE_BRANCH
  cd ..
  rm -rf source_repo
  echo "同步完成：source 到 target"
else
  # target同步到source
  echo "正在同步 target 到 source (分支: $TARGET_BRANCH -> $SOURCE_BRANCH)..."
  git clone $TARGET_ADDR/$TARGET_REPO target_repo
  cd target_repo
  git remote add source $SOURCE_ADDR/$SOURCE_REPO
  git pull source $SOURCE_BRANCH
  git push origin $TARGET_BRANCH
  cd ..
  rm -rf target_repo
  echo "同步完成：target 到 source"
fi
