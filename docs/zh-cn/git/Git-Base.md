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
