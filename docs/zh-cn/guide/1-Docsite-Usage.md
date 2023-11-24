## 1. 安装

- [Docsite官网](https://docsite.js.org)
- [Docsite Github](https://github.com/txd-team/docsite)
- [Docsify官网](https://docsify.js.org)
- [Valine官网](https://valine.js.org)

```shell
# node版本需要 > 6.x  <= 10.x
node -v
npm -v

# 全局安装Docsite
npm install -g docsite
```

## 2. 运行
```shell
# 初始化项目
docsite init <project_name>

# 示例
cd /home/lorchr/ && docsite init light-docs
# 或
mkdir ./light-docs && cd ./light-docs && docsite init

# 预览
docsite start

# 打包
docsite build
```

## 3. 配置
### 1. 修改网站路由搜索引擎 `site.js`

```shell
{
  rootPath: '/light-docs', // 发布到服务器的根目录，需以/开头但不能有尾/，如果只有/，请填写空字符串
  port: 8080, // 本地开发服务器的启动端口
  domain: 'site.lorchr.top', // 站点部署域名，无需协议和path等
  defaultSearch: 'baidu', // 默认搜索引擎，baidu或者google
  defaultLanguage: 'zh-cn',
}
```

### 2. 修改网站标题等信息 `docsite.config.yml`

```yaml
pages:
 # key is the dirname of pages in src/pages
 home:
  # 首页配置
  zh-cn:
   title: 'Light Docs'
   keywords: '关键词1，关键词2'
   description: '页面内容简介'
  # home config
  en-us:
   title: 'Light Docs'
   keywords: 'keyword1,keyword2'
   description: 'page description'
 docs:
  # 社区页配置
  zh-cn:
   title: 'Light Documentation'
   keywords: '关键词1，关键词2'
   description: '页面内容简介'
  # community page config
  en-us:
   title: 'Light Documentation'
   keywords: 'keyword1,keyword2'
   description: 'page description'
 blog:
  # 博客列表页配置
  zh-cn:
   title: 'Light Blog'
   keywords: '关键词1，关键词2'
   description: '页面内容简介'
  en-us:
   # blog list page config
   title: 'Light Blog'
   keywords: 'keyword1,keyword2'
   description: 'page description'
 community:
  # 社区页配置
  zh-cn:
   title: 'Light Community'
   keywords: '关键词1，关键词2'
   description: '页面内容简介'
  # community page config
  en-us:
   title: 'Light Community'
   keywords: 'keyword1,keyword2'
   description: 'page description'
```

## 4. 使用-文档
1. 在`docs/zh-cn`目录下新建一个文件`Docsite-Usage.md`，并书写内容
2. 将该文件复制到`docs/en-us`目录下
3. 配置该文档到待生成的网页中`site_config/docs.js`
```shell
{
  'en-us': {
    sidemenu: [
      {
        title: 'Light Docs',
        children: [
          {
            # 当前文档显示的大纲标题
            title: 'Docsite Usage',
            # 文档的路径
            link: '/en-us/docs/Docsite-Usage.html',
          }
        ]
      }
    ]
  },
  'zh-cn': {
    sidemenu: [
      {
        title: 'Light Docs',
        children: [
          {
            # 当前文档显示的大纲标题
            title: 'Docsite Usage',
            # 文档的路径
            link: '/zh-cn/docs/Docsite-Usage.html',
          }
        ]
      }
    ]
  }
}
```
4. 再次运行`docsite start`

## 5. 使用-博客

## 6. 使用-社区

## 7. 部署

将生成的文档推送到新分支上
```shell
# 创建新分支
git branch site

# 切换分支
git checkout site

# 推送到远程仓库
git push origin site

# 生成ssh秘钥
ssh-keygen -t rsa -C "whitetulips@163.com"
cat ~/.ssh/id_rsa.pub

# 添加Github地址
git remote set-url --add origin https://github.com/lorchr/light-docs.git

# 推送到Github
git push
```

### 1. 部署到服务器
1. 打包文件
> docsite build

2. 提取生成的文件

| 序号 | 文件或文件夹 | 作用       |
| ---- | ------------ | ---------- |
| 1    | build        | js css依赖 |
| 2    | en-us        | 英文文档   |
| 3    | zh-cn        | 中文文档   |
| 4    | img          | 图片       |
| 5    | index.html   | 首页       |
| 6    | 404.html     | 404页      |

3. 将文档上传到服务器

4. 将文档上传到Nginx并配置访问路径

```conf
location /light-docs/ {
  root /home/lorchr/light-docs;
  index index.html;
}

error_page  404  /home/lorchr/light-docs/404.html;
```

### 2. 部署到Github Pages

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [GitHub Actions 官方插件市场](https://github.com/marketplace?type=actions)
- [Awesome-Actions 插件市场](https://github.com/sdras/awesome-actions)
- [阮一峰-rsync 用法教程](https://www.ruanyifeng.com/blog/2020/08/rsync.html)
- [阮一峰-GitHub Actions 入门教程](http://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)
- [阮一峰-GitHub Actions 定时发送天气邮件](http://www.ruanyifeng.com/blog/2019/12/github_actions.html)

1. 编写 `.github/workflows/main.yml`

```yaml
name: Deploy GitHub Pages
# 触发条件：在 push 到 master 分支后
on:
  push:
    branches:
      - master

# 任务
jobs:
  build-and-deploy:
    # 服务器环境：最新版 Ubuntu
    runs-on: ubuntu-latest
    steps:
      # 拉取代码
      - name: Checkout
        uses: actions/checkout@v3
        with:
          # 使用 JamesIves/github-pages-deploy-action@releases/v4 脚本需要的配置
          persist-credentials: false

      # 设置Node环境
      - name: Use Node.js 11.x
        uses: actions/setup-node@v3
        with:
          node-version: '11.x'
          registry-url: 'https://registry.npmjs.org'

      # 1、生成静态文件
      - name: Install And Build
        run: |
          npm install docsite -g
          npm install 
          docsite build

      # 2、复制文件到Dist
      - name: Copy to Dist
        run: |
          echo "========== Copy Files Start =========="
          mkdir         ./dist/
          mv build      ./dist/
          mv en-us      ./dist/
          mv zh-cn      ./dist/
          mv img        ./dist/
          mv 404.html   ./dist/
          mv index.html ./dist/
          echo "========== Copy Files End =========="

      # 3、部署到 GitHub Pages
      - name: Deploy
        # https://github.com/JamesIves/github-pages-deploy-action
        uses: JamesIves/github-pages-deploy-action@releases/v4
        with:
          token: ${{ secrets.ACCESS_TOKEN }}
          # repository-name: lorchr/light-docs
          branch: site
          # npm run build 生成静态资源的路径，比如有的人是 `docs/.vuepress/dist`
          folder: dist
```

2. [生成秘钥](https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
   在 `GitHub 主页` -> `个人头像` -> `Settings` -> `Developer settings` -> `Personal access tokens` 进行生成或更新
3. 配置秘钥
   `代码仓库`->`Settinigs`->`Secrets`->`Actions`->`New repository secret`填上对应的`key-value`
4. 推送代码
5. 在`Actions`中查看执行的结果

### 3. 部署到Gitee Pages
需要上传身份证进行认证，跳过
