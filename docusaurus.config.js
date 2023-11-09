// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const npm2yarn = require('@docusaurus/remark-plugin-npm2yarn');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Light Docusaurus',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

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

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'middleware',
        path: 'middleware',
        routeBasePath: 'middleware',
        editUrl: `https://github.com/lorchr/light-docusaurus/tree/main/`,
        remarkPlugins: [npm2yarn],
        editCurrentVersion: true,
        sidebarPath: require.resolve('./sidebarsMiddleware.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      }),
    ],
    [
      'content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'electron',
        path: 'electron',
        routeBasePath: 'electron',
        editUrl: `https://github.com/lorchr/light-docusaurus/tree/main/`,
        remarkPlugins: [npm2yarn],
        editCurrentVersion: true,
        sidebarPath: require.resolve('./sidebarsElectron.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      }),
    ],
    [
      'content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'postman',
        path: 'postman',
        routeBasePath: 'postman',
        editUrl: `https://github.com/lorchr/light-docusaurus/tree/main/`,
        remarkPlugins: [npm2yarn],
        editCurrentVersion: true,
        sidebarPath: require.resolve('./sidebarsPostman.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      }),
    ],
    [
      'content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'diy',
        path: 'diy',
        routeBasePath: 'diy',
        editUrl: `https://github.com/lorchr/light-docusaurus/tree/main/`,
        remarkPlugins: [npm2yarn],
        editCurrentVersion: true,
        sidebarPath: require.resolve('./sidebarsDiy.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      }),
    ],
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/lorchr/light-docusaurus/tree/main/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
          'https://github.com/lorchr/light-docusaurus/tree/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Torch',
        logo: {
          alt: 'Torch Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'troch',
            position: 'left',
            label: 'Torch',
          },
          {
            to: '/blog', 
            label: 'Blog', 
            position: 'left'
          },
          // {
          //   type: 'docSidebar',
          //   sidebarId: 'zh-cn',
          //   position: 'left',
          //   label: 'Torch',
          // },
          // {
          //   to: '/zh-cn',
          //   label: 'Torch', 
          //   position: 'left',
          //   activeBaseRegex: `/zh-cn/`,
          // },
          {
            to: '/middleware', 
            label: 'Middleware', 
            position: 'left',
            activeBaseRegex: `/middleware/`,
          },
          {
            to: '/electron', 
            label: 'Electron', 
            position: 'left',
            activeBaseRegex: `/electron/`,
          },
          {
            to: '/postman', 
            label: 'Postman', 
            position: 'left',
            activeBaseRegex: `/postman/`,
          },
          {
            to: '/diy', 
            label: 'DIY', 
            position: 'left',
            activeBaseRegex: `/diy/`,
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/lorchr/light-docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      docs: {
          // sidebar设置
          sidebar: {
            // 设置sidebar可隐藏
            hideable: true,
            // 自动折叠
            autoCollapseCategories: true,
          }
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Torch',
                to: '/docs/zh-cn',
              },
              {
                label: 'Middleware',
                to: '/middleware',
              },
              {
                label: 'Electron',
                to: '/electron',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/lorchr',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/lorchr',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/lorchr',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'DIY',
                to: '/diy',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/lorchr/light-docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Light-Docusaurus, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      mermaid: {
        theme: {light: 'neutral', dark: 'forest'},
        options: {
          maxTextSize: 5000,
        },
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'TLGHDZ3Y2I',
  
        // Public API key: it is safe to commit it
        apiKey: '0b9a9b1f4fd5fbe9a1962088169c1262',
  
        indexName: 'light-docusaurus',
  
        // Optional: see doc section below
        contextualSearch: true,
  
        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        externalUrlRegex: 'external\\.com|domain\\.com',
  
        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl. You can use regexp or string in the `from` param. For example: localhost:3000 vs myCompany.com/docs
        replaceSearchResultPathname: {
          from: '/docs/', // or as RegExp: /\/docs\//
          to: '/',
        },
  
        // Optional: Algolia search parameters
        searchParameters: {},
  
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',
  
        //... other Algolia params
      },
    }),
};

module.exports = config;
