/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

module.exports = {
  electron: [
    'README',
    {
      type: 'category',
      label: 'Quick Start',
      link: {
        type: 'generated-index',
        title: 'Quick Start',
        description: 'Quick Start',
        keywords: ['quick-start'],
        image: 'img/docusaurus.png'
      },
      items: [
        'quick-start/quick-start',
        'quick-start/vite-vue-ts-electron',
      ],
    },
  ],
};
