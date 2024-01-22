## 1. 本地与Github
1. 初始化本地Git仓库
```shell
# 初始化Git仓库
git init

# 设置用户信息
git config user.name "Hui Liu"
git config user.email "whitetulips@163.com"

# 编写gitignore
vim .gitignore

# 添加文件
git add .

# 提交
git commit -m "Init commit"
```

2. 推送到新建Github仓库
```shell
# 新建仓库 https://github.com/new
git remote add origin git@github.com:lorchr/torch-web.git
git branch -M main
git push -u origin main
```

3. 推送到已有Gitee仓库
```shell
# 添加新的仓库地址源
git remote add           gitee git@gitee.com:lorchr/torch-web.git
git remote set-url --add gitee git@gitee.com:lorchr/torch-web.git

# 更新到当前分支，允许两边有无关的提交记录
git pull gitee main --allow-unrelated-histories
# git push gitee local_branch:remote_branch
git push gitee main:main
```

4. 其他操作
```shell
# 查看提交记录
git log -10 main

# 查看git状态
git status

# 合并分支
git merge <another-branch>
```

5. 代理配置
```shell
# 设置Http代理
git config --global http.proxy http://ip:port

# 设置Http代理，带身份认证
git config --global http.proxy http://username:password@ip:port

# 取消Http代理
git config --global --unset http.proxy

# 获取当前Http代理
git config --global --get http.proxy


# 设置Https代理
git config --global https.proxy http://ip:port

# 设置Https代理，带身份认证
git config --global https.proxy http://username:password@ip:port

# 取消Https代理
git config --global --unset https.proxy

# 获取当前Https代理
git config --global --get https.proxy


# 本地设置
git config --global http.proxy http://127.0.0.1:4780
git config --global https.proxy http://127.0.0.1:4780

git config --global --get http.proxy
git config --global --get https.proxy

git config --global --unset http.proxy
git config --global --unset https.proxy
```

6. 修改提交记录

单条修改
```shell
# 替换用户名、邮箱信息
git commit --amend --author="{username} <{email}>" --no-edit

# 如果已经修改了仓库的用户信息，直接执行命令重置
git commit --amend --reset-author --no-edit

# 修改并强制提交
git commit --amend --author="xxx <xxx@163.com>" --no-edit
git push --force
```

批量修改脚本  `git-filter-branch.sh`
```shell
git filter-branch --commit-filter '
    if [ "$GIT_AUTHOR_NAME" = "xxx" ];
    then
            GIT_AUTHOR_NAME="xxx";
            GIT_AUTHOR_EMAIL="xxx@163.com";
            git commit-tree "$@";
    else
            git commit-tree "$@";
    fi' HEAD
```

```shell
# 清理缓存
git filter-branch -f --index-filter 'git rm --cached --ignore-unmatch Rakefile' HEAD

# 强制提交
git push --force
```