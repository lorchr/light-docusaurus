- [Docsify 官网](https://docsify.js.org)
- [Docsify Github](https://github.com/docsifyjs/docsify/)

## 1. 环境

:::tip 运行要求
node版本需要 `> 12.x`
:::

```shell
node -v

npm -v

```

## 2. 安装

```shell
# 全局安装 docsify-cli
npm install -g docsify-cli
```

## 3. 初始化

```shell
# 创建项目文件夹，初始化为docsify项目
mkdir light-docsify && cd light-docsify
docsify init ./docs
```

## 4. 运行

```shell
docsify serve ./docs
```

## 5. 推送仓库

```shell
git init
git config user.name "Hui Liu"
git config user.email "whitetulips@163.com"

git add .
git commit -m "Init commit"
git branch -M main
git remote add origin git@github.com:lorchr/light-docsify.git
git push -u origin main
```

## 6. 部署站点
- [deploy](https://docsify.js.org/#/deploy)
  - [Github Pages](https://docsify.js.org/#/deploy?id=github-pages)
  - [Gitlab Pages](https://docsify.js.org/#/deploy?id=gitlab-pages)
  - [Firebase-Hosting](https://docsify.js.org/#/deploy?id=firebase-hosting)
  - [VPS](https://docsify.js.org/#/deploy?id=vps)
  - [Netlify](https://docsify.js.org/#/deploy?id=netlify)
  - [Vercel](https://docsify.js.org/#/deploy?id=vercel)
  - [AWS-Amplify](https://docsify.js.org/#/deploy?id=aws-amplify)
  - [Docker](https://docsify.js.org/#/deploy?id=docker)

点击进入项目的Settings页面`https://github.com/lorchr/light-docsify/settings/pages`

`Settings` -> `Pages` -> `Build and deployment`

- Source : Deploy from a branch
- Branch : Main docs
- Save and visit `https://lorchr.github.io/light-docsify`

## 7. 问题
1. 集成其他的文档
   
   ```json
   // 集成官方文档及其导航栏时，不需要此项设置
   alias: {
        // '/.*/_sidebar.md': '/_sidebar.md', //防止意外回退
      },
   ```

2. 部署到Github Pages

    ```conf
    // 本地运行调试
    basePath: "/",

    // 部署到Github Pages
    basePath: "https://lorchr.github.io/light-docsify/",
    ```
