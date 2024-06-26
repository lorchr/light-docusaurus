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
      'Boot-U-Disk-By-Ventoy',
      'device-and-software-plan',
      'geek-diyer',
      {
        type: 'category',
        label: 'AIO',
        link: {
          type: 'generated-index',
          title: 'AIO',
          description: 'AIO',
          keywords: ['device', 'esxi', 'pve', 'j4125'],
          image: 'img/docusaurus.png'
        },
        items: [
          {
            type: 'autogenerated',
            dirName: 'aio',
          },
          // 'aio/00-Device-J4125',
          // 'aio/01-Device-J4125-Reference',
        ],
      },
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
          {
            type: 'autogenerated',
            dirName: 'network',
          },
          // 'network/1-Aliyun-Domain-Config',
          // 'network/2-Cloudflare-DDNS-Proxy-IPv4',
          // 'network/3-Cloudflare-DDNS-Proxy-IPv6',
          // 'network/4-Cloudflare-Tunnel-ZeroTrust',
          // 'network/5-Free-Domain-eu.org',
          // 'network/6-Internet-Proxy',
          // 'network/7-About-Network-Share',
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
          {
            type: 'autogenerated',
            dirName: 'android',
          },
          // 'android/1-Termux',
          // 'android/2-Flash-Reference-XiaoMi',
          // 'android/3-Flush-Record-Redmi7a',
          // 'android/4-Redmi7a-UbuntuTouch',
          // 'android/5-Redmi7a-PostmarketOS',
          // 'android/6-Redmi7a-Mobian',
          // 'android/7-Android-NAS',
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
          {
            type: 'autogenerated',
            dirName: 'nas',
          },
          // 'nas/1-NAS-Reference',
          // 'nas/2-Synology-7.2',
          // 'nas/3-Opensource-CloudDriver',
        ],
      },
      {
        type: 'category',
        label: 'Home Assistant',
        link: {
          type: 'generated-index',
          title: 'Home Assistant',
          description: 'Home Assistant',
          keywords: ['homeassistant', 'home-assistant', 'ha'],
          image: 'img/docusaurus.png'
        },
        items: [
          {
            type: 'autogenerated',
            dirName: 'homeassistant',
          },
          // 'homeassistant/0-Install-HA-Core-With-LinuxDeploy',
          // 'homeassistant/1-HA-Install',
          // 'homeassistant/2-HA-Initialization',
          // 'homeassistant/3-HA-Quick-Start',
        ],
      },
      {
        type: 'category',
        label: 'Router',
        link: {
          type: 'generated-index',
          title: 'Router',
          description: 'Router',
          keywords: ['router'],
          image: 'img/docusaurus.png'
        },
        items: [
          {
            type: 'autogenerated',
            dirName: 'router',
          },
          // 'router/1-GM219',
          // 'router/2-H2-2',
          // 'router/3-H2-2-Reset',
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
          {
            type: 'autogenerated',
            dirName: 'soft-router',
          },
          // 'soft-router/0-Install',
          // 'soft-router/1-iKuai',
          // 'soft-router/2-OpenWrt',
          // 'soft-router/3-iStoreOS',
          // 'soft-router/4-MikroTik',
          // 'soft-router/5-RouterOS',
          // 'soft-router/6-PfSense',
          // 'soft-router/7-OpnSense',
          // 'soft-router/20-Compile-OpenWrt-with-Github',
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
          {
            type: 'autogenerated',
            dirName: 'tv-box',
          },
          // 'tv-box/HTPC',
        ],
      },
      {
        type: 'category',
        label: 'Game Box',
        link: {
          type: 'generated-index',
          title: 'Game Box',
          description: 'Game Box',
          keywords: ['game-box'],
          image: 'img/docusaurus.png'
        },
        items: [
          {
            type: 'autogenerated',
            dirName: 'game-box',
          },
          // 'game-box/1-TV-Games',
          // 'game-box/2-Switch',
          // 'game-box/3-PSP',
          // 'game-box/4-XBox',
        ],
      },
    ],
  };
  