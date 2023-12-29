- [Docusaurus 官网](https://docusaurus.io/)
- [Docusaurus 中文网](https://www.docusaurus.cn/)
- [Docusaurus Github](https://github.com/facebook/docusaurus)

## 1. 环境
- Node.js 16.14+

```shell
node -v

npm -v
```

## 2. 初始化
```shell
npx create-docusaurus@latest light-docusaurus classic --typescript

# 或者
npm init docusaurus ./light-docusaurus classic --typescript
```

## 3. 运行
```shell
npm run start
```

## 4. 打包
```shell
npm run build
```

## 5. 推送仓库
```shell
git init
git config user.name "Hui Liu"
git config user.email "whitetuips@163.com"

git add .
git commit -m "Init commit"
git branch -M main
git remote add origin git@github.com:lorchr/light-docusaurusy.git
git push -u origin main
```

## 6. 部署站点
1. 修改 `docusaurus.config.js`
```js
const config = {
  // ...

  // Set the production url of your site here
  url: 'https://lorchr.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/light-docusaurus/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'lorchr', // Usually your GitHub org/user name.
  projectName: 'light-docusaurus', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: true, // Set value true or false, not undefined

  // ...
```

2. 配置秘钥
```shell
# 生成秘钥 https://docs.github.com/cn/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
#   在 `GitHub 主页` -> `个人头像` -> `Settings` -> `Developer settings` -> `Personal access tokens` 进行生成或更新

# 配置秘钥 https://github.com/lorchr/light-docusaurus/settings/secrets/actions
#   `代码仓库`->`Settinigs`->`Secrets and variables`->`Actions`->`New repository secret`填上对应的`key-value`

ACCESS_TOKEN = asdfghjkl
```

3. 添加 github action files
```yaml .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
    # Review gh actions docs if you want to further define triggers, paths, etc
    # https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#on

permissions:
  contents: write

jobs:
  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: yarn
          cache-dependency-path: './package-lock.json'

      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Build website
        run: yarn build

      # Popular action to deploy to GitHub Pages:
      # Docs: https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-docusaurus
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.ACCESS_TOKEN }}
          # Build output to publish to the `gh-pages` branch:
          publish_dir: ./build
          # The following lines assign commit authorship to the official
          # GH-Actions bot for deploys to `gh-pages` branch:
          # https://github.com/actions/checkout/issues/13#issuecomment-724415212
          # The GH actions bot is used by default if you didn't specify the two fields.
          # You can swap them out with your own user credentials.
          user_name: github-actions[bot]
          user_email: 41898282+github-actions[bot]@users.noreply.github.com
```

```yaml .github/workflows/test-deploy.yml
name: Test deployment

on:
  pull_request:
    branches:
      - main
    # Review gh actions docs if you want to further define triggers, paths, etc
    # https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#on

jobs:
  test-deploy:
    name: Test deployment
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: yarn
          cache-dependency-path: './package-lock.json'

      - name: Install dependencies
        run: yarn install --frozen-lockfile
      - name: Test build website
        run: yarn build
```

## 7. 升级
1. 修改 `package.json`，配置`docusaurus`版本

所有docusaurus开头的都需要升级
```json
{
  "dependencies": {
    "@docusaurus/core": "current",
    "@docusaurus/preset-classic": "current",
    // ...
  }
}
```

2. 安装升级
```shell
# https://www.npmjs.com/
# 安装升级
npm install

# 检查版本
npx docusaurus --version

# 或者一键升级
yarn upgrade @docusaurus/core@latest @docusaurus/plugin-content-blog@latest @docusaurus/plugin-content-docs@latest @docusaurus/plugin-content-pages@latest @docusaurus/plugin-sitemap@latest @docusaurus/preset-classic@latest @docusaurus/remark-plugin-npm2yarn@latest @docusaurus/theme-live-codeblock@latest @docusaurus/theme-mermaid@latest @docusaurus/theme-search-algolia@latest @docusaurus/module-type-aliases@latest

npm uninstall -g @docusaurus/core @docusaurus/plugin-content-blog @docusaurus/plugin-content-docs @docusaurus/plugin-content-pages @docusaurus/plugin-sitemap @docusaurus/preset-classic @docusaurus/remark-plugin-npm2yarn @docusaurus/theme-live-codeblock @docusaurus/theme-mermaid @docusaurus/theme-search-algolia @docusaurus/module-type-aliases
```

3. 运行
```shell
# 安装 docusaurus
npm install --save docusaurus

# 安装 node依赖
rm -rf node_modules
npm install
```

4. 安装插件
```shell
# 代理 设置 获取 取消
npm config set proxy=http://localhost:4780
npm config get proxy
npm config delete proxy

# 镜像站 设置 获取 取消
npm config set registry=https://registry.npm.taobao.org
npm config get registry
npm config delete registry

# 安装插件
# 文档插件 博客插件 页面插件
npm install --save @docusaurus/plugin-content-docs
npm install --save @docusaurus/plugin-content-blog
npm install --save @docusaurus/plugin-content-pages
# 站点地图 方便algoia爬取数据
npm install --save @docusaurus/plugin-sitemap

# Algoia 搜索支持
npm install --save @docusaurus/theme-search-algolia
# Mermaid markdown绘图支持
npm install --save @docusaurus/theme-mermaid
# 可交互的代码块
npm install --save @docusaurus/theme-live-codeblock
```

## Yarn
```shell
# 安装
npm install -g yarn

# 配置淘宝源
yarn config set registry https://registry.npm.taobao.org -g
yarn config set sass_binary_site https://cdn.npm.taobao.org/dist/node-sass -g


yarn --version

yarn config list
yarn config get <key>
yarn config delete <key>
yarn config set <key> <value> [-g|--global]
```


```shell
安装yarn 
npm install -g yarn

安装成功后，查看版本号： 
yarn --version

创建文件夹 yarn 
md yarn

进入yarn文件夹 
cd yarn

初始化项目 
yarn init // 同npm init，执行输入信息后，会生成package.json文件

yarn的配置项： 
yarn config list // 显示所有配置项
yarn config get <key> //显示某配置项
yarn config delete <key> //删除某配置项
yarn config set <key> <value> [-g|--global] //设置配置项

安装包：
yarn install //安装package.json里所有包，并将包及它的所有依赖项保存进yarn.lock
yarn install --flat //安装一个包的单一版本
yarn install --force //强制重新下载所有包
yarn install --production //只安装dependencies里的包
yarn install --no-lockfile //不读取或生成yarn.lock
yarn install --pure-lockfile //不生成yarn.lock

添加包（会更新package.json和yarn.lock）：

yarn add [package] // 在当前的项目中添加一个依赖包，会自动更新到package.json和yarn.lock文件中
yarn add [package]@[version] // 安装指定版本，这里指的是主要版本，如果需要精确到小版本，使用-E参数
yarn add [package]@[tag] // 安装某个tag（比如beta,next或者latest）
//不指定依赖类型默认安装到dependencies里，你也可以指定依赖类型：

yarn add --dev/-D // 加到 devDependencies
yarn add --peer/-P // 加到 peerDependencies
yarn add --optional/-O // 加到 optionalDependencies
//默认安装包的主要版本里的最新版本，下面两个命令可以指定版本：

yarn add --exact/-E // 安装包的精确版本。例如yarn add foo@1.2.3会接受1.9.1版，但是yarn add foo@1.2.3 --exact只会接受1.2.3版
yarn add --tilde/-T // 安装包的次要版本里的最新版。例如yarn add foo@1.2.3 --tilde会接受1.2.9，但不接受1.3.0

发布包
yarn publish
移除一个包 
yarn remove <packageName>：移除一个包，会自动更新package.json和yarn.lock
更新一个依赖 
yarn upgrade 用于更新包到基于规范范围的最新版本
运行脚本 
yarn run 用来执行在 package.json 中 scripts 属性下定义的脚本
显示某个包的信息 
yarn info <packageName> 可以用来查看某个模块的最新版本信息

缓存 
yarn cache 
yarn cache list # 列出已缓存的每个包 
yarn cache dir # 返回 全局缓存位置 
yarn cache clean # 清除缓存
```