/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

 module.exports = {
    diy: [
      'README',
      'device-and-software-plan',
      {
        type: 'category',
        label: 'Network',
        link: {
          type: 'generated-index',
          title: 'Network',
          description: 'Network',
          keywords: ['network'],
          image: 'img/docusaurus.png'
        },
        items: [
          'network/Aliyun-Domain-Config',
          'network/Cloudflare-DDNS-Proxy-IPv4',
          'network/Cloudflare-DDNS-Proxy-IPv6',
          'network/Free-Domain-eu.org',
          'network/Internet-Proxy',
        ],
      },
      {
        type: 'category',
        label: 'Android',
        link: {
          type: 'generated-index',
          title: 'Android',
          description: 'Android',
          keywords: ['android'],
          image: 'img/docusaurus.png'
        },
        items: [
          'android/Termux',
          'android/Flash-Reference-XiaoMi',
          'android/Flush-Record-Redmi7a',
          'android/Redmi7a-UbuntuTouch',
          'android/Redmi7a-PostmarketOS',
          'android/Redmi7a-Mobian',
        ],
      },
      {
        type: 'category',
        label: 'NAS',
        link: {
          type: 'generated-index',
          title: 'NAS',
          description: 'NAS',
          keywords: ['nas'],
          image: 'img/docusaurus.png'
        },
        items: [
          'nas/NAS-Reference',
          'nas/Synology-7.2',
          'nas/aria2',
        ],
      },
      {
        type: 'category',
        label: 'Home Assistant',
        link: {
          type: 'generated-index',
          title: 'Home Assistant',
          description: 'Home Assistant',
          keywords: ['home-assistant', 'ha'],
          image: 'img/docusaurus.png'
        },
        items: [
          'ha/LinuxDeploy-Install-HA-Core',
        ],
      },
      {
        type: 'category',
        label: 'Soft Router',
        link: {
          type: 'generated-index',
          title: 'Soft Router',
          description: 'Soft Router',
          keywords: ['soft-router'],
          image: 'img/docusaurus.png'
        },
        items: [
          'soft-router/OpenWrt',
          'soft-router/iKuai',
          'soft-router/iStoreOS',
        ],
      },
      {
        type: 'category',
        label: 'TV Box',
        link: {
          type: 'generated-index',
          title: 'TV Box',
          description: 'TV Box',
          keywords: ['tv-box'],
          image: 'img/docusaurus.png'
        },
        items: [
          'tv-box/HTPC',
        ],
      },
    ],
  };
  