/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
    {
      type: 'category',
      label: 'Tutorial-Extras',
      link: {
        type: 'generated-index',
        title: 'Tutorial Extras',
        description: 'Tutorial of docusaurus, extra doc.',
        keywords: ['tutorial'],
        image: 'img/docusaurus.png'
      },
      items: [
        'tutorial-extras/manage-docs-versions',
        'tutorial-extras/translate-your-site'
      ],
    },
  ],
  troch: [
    'zh-cn/README',
    {
      type: 'category',
      label: 'Guide',
      link: {
        type: 'generated-index',
        title: 'Guide',
        description: 'Guide',
        keywords: ['guide'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/guide',
        'zh-cn/guide/Docsite-Usage',
        'zh-cn/guide/Docsify-Usage',
        'zh-cn/guide/Docusaurus-Usage',
      ],
    },
    {
      type: 'category',
      label: 'Develop Environment',
      link: {
        type: 'generated-index',
        title: 'Develop Environment',
        description: 'Develop Environment',
        keywords: ['devenv'],
        image: 'img/docusaurus.png'
      },
      items: [
        'zh-cn/devenv',
        'zh-cn/devenv/IDEA',
        'zh-cn/devenv/WSL-Docker',
        'zh-cn/devenv/Maven-Mvnd',
        'zh-cn/devenv/Docker-Mysql',
        'zh-cn/devenv/Docker-Pgsql',
        'zh-cn/devenv/Docker-Mssql',
        'zh-cn/devenv/Docker-Oracle',
        'zh-cn/devenv/Docker-Redis',
        'zh-cn/devenv/Docker-Nginx',
        'zh-cn/devenv/Docker-InfluxDB',
        'zh-cn/devenv/Docker-EMQX',
        'zh-cn/devenv/Docker-MinIO',
        'zh-cn/devenv/Docker-Elasticsearch',
        'zh-cn/devenv/Docker-Kafka',
        'zh-cn/devenv/Docker-RabbitMQ',
        'zh-cn/devenv/Docker-RocketMQ',
        'zh-cn/devenv/Docker-Sonarqube',
        'zh-cn/devenv/Docker-Nodered',
        'zh-cn/devenv/Docker-Chat2DB',
        'zh-cn/devenv/Docker-Port-Bind-Error-In-Windows',
      ],
    },
    {
      type: 'category',
      label: 'Java (JVM)',
      link: {
        type: 'generated-index',
        title: 'Java (JVM)',
        description: 'Java (JVM)',
        keywords: ['java', 'jvm'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/java',
        'zh-cn/java/Bytecode-toolkit-Javassist',
      ],
    },
    {
      type: 'category',
      label: 'Spring Boot',
      link: {
        type: 'generated-index',
        title: 'Spring Boot',
        description: 'Spring Boot',
        keywords: ['spring', 'boot'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/spring-boot',
        'zh-cn/spring-boot/SPI',
        'zh-cn/spring-boot/Spring-Core',
        'zh-cn/spring-boot/Spring-Boot-Endpoints',
        'zh-cn/spring-boot/Spring-Boot-Ip-Address-Parse',
        'zh-cn/spring-boot/Spring-Boot-Ip-Ragion-Parse',
        'zh-cn/spring-boot/Spring-Boot-Unit-Test',
        'zh-cn/spring-boot/Spring-Rate-Limit',
        'zh-cn/spring-boot/Spring-Statemachine',
        'zh-cn/spring-boot/Api-Specification',
        {
          type: 'category',
          label: 'File',
          link: {
            type: 'generated-index',
            title: 'File',
            description: 'File',
            keywords: ['file'],
            image: 'img/docusaurus.png'
          },
          items: [
            'zh-cn/spring-boot/file/PDF-Add-WaterPrint',
            'zh-cn/spring-boot/file/File-Upload-Split-Continue-on-Break',
            'zh-cn/spring-boot/file/File-Upload-Split-Continue-on-Break-With-MinIO',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Spring Cloud',
      link: {
        type: 'generated-index',
        title: 'Spring Cloud',
        description: 'Spring Cloud',
        keywords: ['spring', 'cloud'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/spring-cloud',
        'zh-cn/spring-cloud/Distribute-system-design',
      ],
    },
    {
      type: 'category',
      label: 'Spring Security',
      link: {
        type: 'generated-index',
        title: 'Spring Security',
        description: 'Spring Security',
        keywords: ['spring', 'security'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/spring-security',
        'zh-cn/spring-security/Spring-Security-Dependencies-Choice',
        {
          type: 'category',
          label: 'OAuth2',
          link: {
            type: 'generated-index',
            title: 'OAuth2',
            description: 'OAuth2',
            keywords: ['oauth2'],
            image: 'img/docusaurus.png'
          },
          items: [
            'zh-cn/spring-security/oauth2/OAuth2.1-Endpoints',
            'zh-cn/spring-security/oauth2/Add-Customeized-Grant-Type',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Database',
      link: {
        type: 'generated-index',
        title: 'Database',
        description: 'Database',
        keywords: ['database', 'mysql', 'pgsql', 'oracle', 'microsoft ssqlserver', 'Dameng'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/database',
        'zh-cn/database/PDManer',
      ],
    },
    {
      type: 'category',
      label: 'Git',
      link: {
        type: 'generated-index',
        title: 'Git',
        description: 'Git',
        keywords: ['git', 'github'],
        image: 'img/docusaurus.png'
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'zh-cn/git',
        },
        // 'zh-cn/git/Github-Actions-Getting-Start',
        // 'zh-cn/git/Github-Actions-Compile-OpenWrt-with',
        // 'zh-cn/git/Github-Actions-Webhook',
      ],
    },
    {
      type: 'category',
      label: 'Linux',
      link: {
        type: 'generated-index',
        title: 'Linux',
        description: 'Linux',
        keywords: ['linux'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/linux',
        {
          type: 'category',
          label: 'Common',
          link: {
            type: 'generated-index',
            title: 'Common',
            description: 'Common',
            keywords: ['common'],
            image: 'img/docusaurus.png'
          },
          items: [
            'zh-cn/linux/common/Linux-Command',
            'zh-cn/linux/common/Linux-Command2',
            'zh-cn/linux/common/Ntp-Time-Sync',
            'zh-cn/linux/common/Free-HTTPS-Cert-Apply',
            'zh-cn/linux/common/Customize-SSH-Login-Page',
          ],
        },
        {
          type: 'category',
          label: 'Install',
          link: {
            type: 'generated-index',
            title: 'Install',
            description: 'Install',
            keywords: ['install'],
            image: 'img/docusaurus.png'
          },
          items: [
            'zh-cn/linux/install/Install-JDK',
            'zh-cn/linux/install/Install-Maven',
            'zh-cn/linux/install/Install-NodeJS',
            'zh-cn/linux/install/Install-Gitea',
            'zh-cn/linux/install/Install-Jenkins',
            'zh-cn/linux/install/Install-Nexus3',
            'zh-cn/linux/install/Install-Docker-Registry',
            'zh-cn/linux/install/Install-Harbor',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Docker',
      link: {
        type: 'generated-index',
        title: 'Docker',
        description: 'Docker',
        keywords: ['docker'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/docker',
        'zh-cn/docker/Docker-Install',
        'zh-cn/docker/Docker-Add-Hosts-For-Container',
        'zh-cn/docker/Play-With-Docker',
        'zh-cn/docker/Oracle-Cloud-Free-Tier',
        'zh-cn/docker/Containerd',
      ],
    },
    // {
    //   type: 'autogenerated',
    //   dirName: 'zh-cn/k8s',
    // },
    {
      type: 'category',
      label: 'Kubernetes',
      link: {
        type: 'generated-index',
        title: 'Kubernetes',
        description: 'Kubernetes',
        keywords: ['kubernetes', 'k8s'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/k8s',
        // 'zh-cn/k8s/Build-K8s-Single-Master-Cluster',
        // 'zh-cn/k8s/Build-K8s-Cluster-With-Rancher',
        // 'zh-cn/k8s/Build-K8s-Offline-With-RKE2',
        {
          type: 'autogenerated',
          dirName: 'zh-cn/k8s',
        },
      ],
    },
    {
      type: 'category',
      label: 'Test',
      link: {
        type: 'generated-index',
        title: 'Test',
        description: 'Test',
        keywords: ['test'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/test',
        'zh-cn/test/Jmh',
        'zh-cn/test/Dperf',
      ],
    },
    {
      type: 'category',
      label: 'Others',
      link: {
        type: 'generated-index',
        title: 'Others',
        description: 'Others',
        keywords: ['others'],
        image: 'img/docusaurus.png'
      },
      items: [
        // 'zh-cn/others',
        'zh-cn/others/Apply-EDU-Email',
        'zh-cn/others/Product-Env-Error-Fix',
        'zh-cn/others/Java-Error-Check',
      ],
    },
    'zh-cn/awesome-open-source',
    'zh-cn/windows',
  ],
};

module.exports = sidebars;