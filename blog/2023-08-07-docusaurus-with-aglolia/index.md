---
title: Docusaurus With Algolia
authors: [lorchr]
tags: [docusaurus, algolia, docsearch, crawler]
image: ../img/docusaurus.png
date: 2023-08-07
---

- [Alogolia Offical](https://www.algolia.com/)
- [Alogolia Github](https://github.com/algolia)
- [Algolia Docsearch 开发者试用](https://docsearch.algolia.com/)
- [Algolia Crawler 爬虫](https://crawler.algolia.com/admin/users/login)
- [Algolia DocSearch 插件文档](https://docusaurus.io/zh-CN/docs/search#using-algolia-docsearch)
- [sitemap 插件文档](https://docusaurus.io/zh-CN/docs/api/plugins/@docusaurus/plugin-sitemap)
- [Docusaurus integrate Algolia](https://docusaurus.io/docs/search#using-algolia-docsearch)

## 1. 注册Algolia账号，申请 Docsearch
[Docusaurus集成Algolia](https://docusaurus.io/zh-CN/docs/search#using-algolia-docsearch)
1. 使用Github账号注册[Algolia](https://dashboard.algolia.com/users/sign_in)
2. 去[Docsearch](https://docsearch.algolia.com/)申请，需要填写以下内容
   1. Github pages 地址: https://lorchr.github.io/light-docusaurus/
   2. 邮箱 whitetulips@163.com
   3. 仓库地址 https://github.com/lorchr/light-docusaurus
3. 等待审核，审核通过会收到一封邮件

## 2. 创建 Application 
1. 登录[Algolia官网](https://dashboard.algolia.com/users/sign_in)
2. 创建Application，设置名称，选择免费计划
3. 控制台打开，设置页面，点击 API Keys，记录以下内容
   1. Application ID
   2. Search-Only API Key
   3. Admin API Key

## 3. Web端部署爬虫
1. 在DocSearch审核通过后，建立应用及索引，获取`APPLICAITON_ID`及`API_KEY`
2. 使用Algolia账号登录[Algolia Crawler](https://crawler.algolia.com/admin/users/login)
3. 使用官方模板配置[Docusaurus v3 template](https://docsearch.algolia.com/docs/templates#docusaurus-v3-template)部署爬虫

```js
new Crawler({
  appId: 'TLGHDZ3Y2I',
  apiKey: '0b9a9b1f4fd5fbe9a1962088169c1262',
  rateLimit: 8,
  maxDepth: 10,
  startUrls: ['https://lorchr.github.io/light-docusaurus/'],
  sitemaps: ['https://lorchr.github.io/light-docusaurus/sitemap.xml'],
  ignoreCanonicalTo: true,
  discoveryPatterns: ['https://lorchr.github.io/light-docusaurus/**'],
  actions: [
    {
      indexName: 'light-docusaurus',
      pathsToMatch: ['https://lorchr.github.io/light-docusaurus/**'],
      recordExtractor: ({ $, helpers }) => {
        // priority order: deepest active sub list header -> navbar active item -> 'Documentation'
        const lvl0 =
          $(
            '.menu__link.menu__link--sublist.menu__link--active, .navbar__item.navbar__link--active'
          )
            .last()
            .text() || 'Documentation';

        return helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: '',
              defaultValue: lvl0,
            },
            lvl1: ['header h1', 'article h1'],
            lvl2: 'article h2',
            lvl3: 'article h3',
            lvl4: 'article h4',
            lvl5: 'article h5, article td:first-child',
            lvl6: 'article h6',
            content: 'article p, article li, article td:last-child',
          },
          indexHeadings: true,
          aggregateContent: true,
          recordVersion: 'v3',
        });
      },
    },
  ],
  initialIndexSettings: {
    YOUR_INDEX_NAME: {
      attributesForFaceting: [
        'type',
        'lang',
        'language',
        'version',
        'docusaurus_tag',
      ],
      attributesToRetrieve: [
        'hierarchy',
        'content',
        'anchor',
        'url',
        'url_without_anchor',
        'type',
      ],
      attributesToHighlight: ['hierarchy', 'content'],
      attributesToSnippet: ['content:10'],
      camelCaseAttributes: ['hierarchy', 'content'],
      searchableAttributes: [
        'unordered(hierarchy.lvl0)',
        'unordered(hierarchy.lvl1)',
        'unordered(hierarchy.lvl2)',
        'unordered(hierarchy.lvl3)',
        'unordered(hierarchy.lvl4)',
        'unordered(hierarchy.lvl5)',
        'unordered(hierarchy.lvl6)',
        'content',
      ],
      distinct: true,
      attributeForDistinct: 'url',
      customRanking: [
        'desc(weight.pageRank)',
        'desc(weight.level)',
        'asc(weight.position)',
      ],
      ranking: [
        'words',
        'filters',
        'typo',
        'attribute',
        'proximity',
        'exact',
        'custom',
      ],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: '</span>',
      minWordSizefor1Typo: 3,
      minWordSizefor2Typos: 7,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: 'allOptional',
      separatorsToIndex: '_',
    },
  },
});
```

## 4. 配置 Docusaurus
1. 配置 .env (键值不带双引号)
```bash
APPLICATION_ID=Application ID
API_KEY=Admin API Key # 务必确认, 这是坑点 不要用 'Write API Key' 或者 'Search API Key'
```

2. docusaurus.config.js
```js
module.exports = {
  // ...
  presets: [[
    // ...
    "classic",
    /** @type {import('@docusaurus/preset-classic').Options} */
    ({
      // 这个插件会为你的站点创建一个站点地图
      // 以便搜索引擎的爬虫能够更准确地爬取你的网站
      sitemap: {
        changefreq: "weekly",
        priority: 0.5,
        ignorePatterns: ["/tags/**"],
        filename: "sitemap.xml",
      },
    })
  ]],
  // ...
  themeConfig: {
    // ...
    algolia: {
      appId: 'YOUR_APP_ID', // Application ID
      //  公开 API密钥：提交它没有危险
      apiKey: 'YOUR_SEARCH_API_KEY', //  Search-Only API Key
      indexName: 'YOUR_INDEX_NAME'
    },
  }
}
```

3. docsearch-config.json (爬虫配置文件)

需修改3处:
- index_name
- start_urls
- sitemap_urls

```js
{
  "index_name": "light-docusaurus",
  "start_urls": [
    "https://lorchr.github.io/light-docusaurus/"
  ],
  "sitemap_urls": [
    "https://lorchr.github.io/light-docusaurus/sitemap.xml"
  ],
  "sitemap_alternate_links": true,
  "stop_urls": [
    "/tests"
  ],
  "selectors": {
    "lvl0": {
      "selector": "(//ul[contains(@class,'menu__list')]//a[contains(@class, 'menu__link menu__link--sublist menu__link--active')]/text() | //nav[contains(@class, 'navbar')]//a[contains(@class, 'navbar__link--active')]/text())[last()]",
      "type": "xpath",
      "global": true,
      "default_value": "Documentation"
    },
    "lvl1": "header h1",
    "lvl2": "article h2",
    "lvl3": "article h3",
    "lvl4": "article h4",
    "lvl5": "article h5, article td:first-child",
    "lvl6": "article h6",
    "text": "article p, article li, article td:last-child"
  },
  "strip_chars": " .,;:#",
  "custom_settings": {
    "separatorsToIndex": "_",
    "attributesForFaceting": [
      "language",
      "version",
      "type",
      "docusaurus_tag"
    ],
    "attributesToRetrieve": [
      "hierarchy",
      "content",
      "anchor",
      "url",
      "url_without_anchor",
      "type"
    ]
  },
  "js_render": true,
  "conversation_id": [
    "833762294"
  ],
  "nb_hits": 46250
}
```

## 5. 执行爬虫程序 - docsearch-scraper
### 1. 本地 执行爬虫
前置条件:
- Docker
- jq - 轻量级命令行 JSON 处理器[使用 brew 安装最新版的 jq](https://github.com/stedolan/jq/wiki/Installation#zero-install)


jq安装完成后, 在命令行执行 爬虫脚本
```shell
docker run -it --env-file=.env -e "CONFIG=$(cat docsearch-config.json | jq -r tostring)" algolia/docsearch-scraper
```

等待 容器运行完成, 如下即可

```shell
Getting https://lorchr.github.io/light-docusaurus/docs/react/hooks/custom-hooks from selenium
Getting https://lorchr.github.io/light-docusaurus/docs/react/hooks/useMemo from selenium
Getting https://lorchr.github.io/light-docusaurus/docs/react/hooks/useCallback from selenium
Getting https://lorchr.github.io/light-docusaurus/docs/javascript/versions/es-2016 from selenium
Getting https://lorchr.github.io/light-docusaurus/docs/javascript/versions/es-2015 from selenium
> DocSearch: https://lorchr.github.io/light-docusaurus/docs/plugins-and-libraries/big-screen/ 17 records)
> DocSearch: https://lorchr.github.io/light-docusaurus/docs/server/nginx/nginx-forward-proxy-vs-reverse-proxy/ 8 records)
> DocSearch: https://lorchr.github.io/light-docusaurus/docs/category/caddy/ 3 records)
> DocSearch: https://lorchr.github.io/light-docusaurus/docs/category/nginx/ 5 records)

Nb hits: 1369
```

### 2. GitHub Actions 执行爬虫
在 `.github/workflows/` 文件夹下 创建 `docsearch-scraper.yml`, 用来定义 GitHub Actions 工作流

docsearch-scraper.yml
```yaml
name: DocSearch-Scraper

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest

    steps:
      - name: Sleep for 10 seconds
        run: sleep 10s
        shell: bash

      - name: Checkout repo
        uses: actions/checkout@v3

      - name: Run scraper
        env:
          APPLICATION_ID: ${{ secrets.ALGOLIA_APPLICATION_ID }}
          API_KEY: ${{ secrets.ALGOLIA_API_KEY }}
        run: |
          CONFIG="$(cat docsearch-config.json)"
          docker run -i --rm \
                  -e APPLICATION_ID=$APPLICATION_ID \
                  -e API_KEY=$API_KEY \
                  -e CONFIG="${CONFIG}" \
                  algolia/docsearch-scraper
```

然后在 GitHub 的 Secrets 创建
- APPLICATION_ID
- API_KEY

当使用 Git 推送项目到 GitHub时, Actions就会自动执行 爬虫任务

[在 Docusaurus v2 中使用 Algolia DocSearch搜索功能](https://didilinkin.cn/blog/algoliasearch)
