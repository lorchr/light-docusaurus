[Docusaurus 官网](https://docusaurus.io/)
[Docusaurus 中文网](https://www.docusaurus.cn/)
[Docusaurus Github](https://github.com/facebook/docusaurus)

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

# 配置秘钥
#   `代码仓库`->`Settinigs`->`Secrets`->`Actions`->`New repository secret`填上对应的`key-value`

ACCESS_TOKEN = Ds1aH2d6sa2219Ssa
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
# 安装升级
npm install

# 检查版本
npx docusaurus --version

# 或者一键升级
yarn upgrade @docusaurus/core@latest @docusaurus/preset-classic@latest
```