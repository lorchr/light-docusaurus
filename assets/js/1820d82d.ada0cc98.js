"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[66340],{6136:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>l,contentTitle:()=>i,default:()=>d,frontMatter:()=>r,metadata:()=>t,toc:()=>o});var c=n(74848),a=n(28453);const r={},i=void 0,t={id:"zh-cn/devenv/Docker-Elasticsearch",title:"Docker-Elasticsearch",description:"- Elasticsearch Offical Docker",source:"@site/docs/zh-cn/devenv/16-Docker-Elasticsearch.md",sourceDirName:"zh-cn/devenv",slug:"/zh-cn/devenv/Docker-Elasticsearch",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-Elasticsearch",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/devenv/16-Docker-Elasticsearch.md",tags:[],version:"current",sidebarPosition:16,frontMatter:{},sidebar:"troch",previous:{title:"Docker-InfluxDB",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-InfluxDB"},next:{title:"Docker-EMQX",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-EMQX"}},l={},o=[{value:"1. \u5b89\u88c5Elasticsearch",id:"1-\u5b89\u88c5elasticsearch",level:2},{value:"2. \u914d\u7f6eElasticsearch",id:"2-\u914d\u7f6eelasticsearch",level:2},{value:"\u5f00\u542f\u8ba4\u8bc1",id:"\u5f00\u542f\u8ba4\u8bc1",level:3},{value:"\u5b89\u88c5\u63d2\u4ef6",id:"\u5b89\u88c5\u63d2\u4ef6",level:3},{value:"3. \u96c6\u7fa4\u90e8\u7f72",id:"3-\u96c6\u7fa4\u90e8\u7f72",level:2},{value:"4. \u5b89\u88c5Kibana",id:"4-\u5b89\u88c5kibana",level:2}];function h(e){const s={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,a.R)(),...e.components};return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsx)(s.li,{children:(0,c.jsx)(s.a,{href:"https://www.elastic.co",children:"Elasticsearch Offical Docker"})}),"\n",(0,c.jsx)(s.li,{children:(0,c.jsx)(s.a,{href:"https://www.elastic.co/guide/en/elasticsearch/reference/7.17/docker.html",children:"Elasticsearch Offical Docker"})}),"\n",(0,c.jsx)(s.li,{children:(0,c.jsx)(s.a,{href:"https://hub.docker.com/_/elasticsearch",children:"Elasticsearch"})}),"\n"]}),"\n",(0,c.jsx)(s.h2,{id:"1-\u5b89\u88c5elasticsearch",children:"1. \u5b89\u88c5Elasticsearch"}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-shell",children:'# \u521b\u5efaNetwork\ndocker network create dev\n\n# \u521b\u5efa\u6570\u636e\u5377\ndocker volume create es_data;\n\n# \u521b\u5efa\u6587\u4ef6\u5939\nmkdir -p D:/docker/elasticsearch/{conf,data,logs}\n\n# \u83b7\u53d6\u9ed8\u8ba4\u914d\u7f6e\u6587\u4ef6\ndocker run -d --name elasticsearch_temp elasticsearch:7.17.10 \\\n&& docker cp elasticsearch_temp:/usr/share/elasticsearch/config/elasticsearch.yml D:/docker/elasticsearch/conf/elasticsearch.yml \\\n&& docker stop elasticsearch_temp && docker rm elasticsearch_temp\n\n\n# \u8fd0\u884c\u955c\u50cf Docker\u5b98\u65b9\u955c\u50cf\ndocker run -d \\\n  --publish 9200:9200 \\\n  --publish 9300:9300 \\\n  --volume //d/docker/elasticsearch/data:/usr/share/elasticsearch/data \\\n  --volume //d/docker/elasticsearch/conf/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \\\n  --env "discovery.type=single-node" \\\n  --env ELASTIC_PASSWORD_FILE=/run/secrets/bootstrapPassword.txt \\\n  --net dev \\\n  --restart=no \\\n  --name elasticsearch \\\n  elasticsearch:7.17.10\n\n# \u8fd0\u884c\u955c\u50cf Elastic\u5b98\u65b9\u955c\u50cf\ndocker run -d \\\n  --publish 9200:9200 \\\n  --publish 9300:9300 \\\n  --volume //d/docker/elasticsearch/data:/usr/share/elasticsearch/data \\\n  --volume //d/docker/elasticsearch/conf/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \\\n  --env "discovery.type=single-node" \\\n  --env ELASTIC_PASSWORD_FILE=/run/secrets/bootstrapPassword.txt \\\n  --net dev \\\n  --restart=no \\\n  --name elasticsearch \\\n  docker.elastic.co/elasticsearch/elasticsearch:7.17.10\n'})}),"\n",(0,c.jsx)(s.h2,{id:"2-\u914d\u7f6eelasticsearch",children:"2. \u914d\u7f6eElasticsearch"}),"\n",(0,c.jsxs)(s.p,{children:["\u914d\u7f6e\u6587\u4ef6\u8def\u5f84 ",(0,c.jsx)(s.code,{children:"/usr/share/elasticsearch/config/"})]}),"\n",(0,c.jsxs)(s.ul,{children:["\n",(0,c.jsx)(s.li,{children:"elasticsearch.yml   # Es\u914d\u7f6e"}),"\n",(0,c.jsx)(s.li,{children:"jvm.options         # JVM\u914d\u7f6e"}),"\n",(0,c.jsx)(s.li,{children:"log4j2.properties   # \u65e5\u5fd7\u914d\u7f6e"}),"\n"]}),"\n",(0,c.jsx)(s.h3,{id:"\u5f00\u542f\u8ba4\u8bc1",children:"\u5f00\u542f\u8ba4\u8bc1"}),"\n",(0,c.jsxs)(s.p,{children:["Docker\u5b89\u88c5Es\u9ed8\u8ba4\u662f\u4e0d\u5f00\u542f\u8ba4\u8bc1\u7684\uff0c\u9700\u8981",(0,c.jsx)(s.a,{href:"https://www.elastic.co/guide/en/elasticsearch/reference/7.17/security-minimal-setup.html",children:"\u624b\u52a8\u542f\u7528\u5bc6\u7801\u8ba4\u8bc1"})]}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-shell",children:'# \u8fdb\u5165\u5bb9\u5668\ndocker exec -it -u root elasticsearch /bin/bash\n\n# \u7f16\u8f91\u914d\u7f6e\u6587\u4ef6\nvim /usr/share/elasticsearch/config/elasticsearch.yml\n\n# \u5f00\u542f\u8ba4\u8bc1\ndiscovery.type: single-node # \u5355\u8282\u70b9\u9700\u8981\u6b64\u914d\u7f6e\n\nhttp.cors.enabled: true\nhttp.cors.allow-origin: "*"\nhttp.cors.allow-headers: Authorization,WWW-Authenticate\nxpack.security.enabled: true\nxpack.security.transport.ssl.enabled: false\n\n# \u91cd\u542f\u5bb9\u5668\ndocker restart elasticsearch\n\n# \u8fdb\u5165\u5bb9\u5668\ndocker exec -it -u root elasticsearch /bin/bash\n\n# \u8bbe\u7f6e\u5bc6\u7801\n./bin/elasticsearch-setup-passwords interactive\n# \u9700\u8981\u4f9d\u6b21\u8bbe\u7f6e\u516d\u4e2a\u8d26\u6237\u7684\u5bc6\u7801 \n# elastic apm_system kibana_system \n# logstash_system beats_system remote_monitoring_user\n'})}),"\n",(0,c.jsx)(s.h3,{id:"\u5b89\u88c5\u63d2\u4ef6",children:"\u5b89\u88c5\u63d2\u4ef6"}),"\n",(0,c.jsxs)(s.ol,{children:["\n",(0,c.jsx)(s.li,{children:"\u5b89\u88c5IK\u5206\u8bcd\u5668"}),"\n"]}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-shell",children:"# \u4e0b\u8f7d \u6ce8\u610f  \u9700\u8981\u4e0b\u8f7d\u4e0eES\u7248\u672c\u76f8\u540c\u7684IK\u7248\u672c\nhttps://github.com/medcl/elasticsearch-analysis-ik/releases\nhttps://github.com/ElisaMin/elasticsearch-analysis-ik/releases/tag/7.17.10\nwget https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.17.7/elasticsearch-analysis-ik-7.17.7.zip\n\n# \u5c06\u4e0b\u8f7d\u7684zip\u5305\u89e3\u538b\u5230ES\u7684 plugins/elasticsearch-analysis-ik \u76ee\u5f55\n# \u56e0\u4e3a\u6ca1\u6709 7.17.10\nunzip elasticsearch-analysis-ik-7.17.7.zip -d ./elasticsearch-analysis-ik\n\n# \u4fee\u6539plugin-descriptor.properties\u6587\u4ef6\u91cc\u9762\u7684elasticsearch.version\u5c31\u53ef\u4ee5\nvim plugin-descriptor.properties\nelasticsearch.version=7.17.10\n\n# \u91cd\u542f\u5bb9\u5668\ndocker restart elasticsearch\n\n# \u4e0a\u4f20\ndocker cp C://users/light/Desktop/elasticsearch-analysis-ik elasticsearch:/usr/share/elasticsearch/plugins/elasticsearch-analysis-ik\n\n# \u4e0b\u8f7d\ndocker cp elasticsearch:/usr/share/elasticsearch/plugins/elasticsearch-analysis-ik C://users/light/Desktop/elasticsearch-analysis-ik\n"})}),"\n",(0,c.jsx)(s.h2,{id:"3-\u96c6\u7fa4\u90e8\u7f72",children:"3. \u96c6\u7fa4\u90e8\u7f72"}),"\n",(0,c.jsxs)(s.ol,{children:["\n",(0,c.jsxs)(s.li,{children:["\n",(0,c.jsxs)(s.p,{children:["\u521b\u5efa",(0,c.jsx)(s.code,{children:"docker-compose.yaml"})]}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-yaml",children:'version: \'2.2\'\nservices:\n  es01:\n    image: docker.elastic.co/elasticsearch/elasticsearch:7.5.2\n    container_name: es01\n    environment:\n      - node.name=es01\n      - cluster.name=es-docker-cluster\n      - discovery.seed_hosts=es02,es03\n      - cluster.initial_master_nodes=es01,es02,es03\n      - bootstrap.memory_lock=true\n      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"\n    ulimits:\n      memlock:\n        soft: -1\n        hard: -1\n    volumes:\n      - data01:/usr/share/elasticsearch/data\n    ports:\n      - 9200:9200\n    networks:\n      - elastic\n  es02:\n    image: docker.elastic.co/elasticsearch/elasticsearch:7.5.2\n    container_name: es02\n    environment:\n      - node.name=es02\n      - cluster.name=es-docker-cluster\n      - discovery.seed_hosts=es01,es03\n      - cluster.initial_master_nodes=es01,es02,es03\n      - bootstrap.memory_lock=true\n      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"\n    ulimits:\n      memlock:\n        soft: -1\n        hard: -1\n    volumes:\n      - data02:/usr/share/elasticsearch/data\n    networks:\n      - elastic\n  es03:\n    image: docker.elastic.co/elasticsearch/elasticsearch:7.5.2\n    container_name: es03\n    environment:\n      - node.name=es03\n      - cluster.name=es-docker-cluster\n      - discovery.seed_hosts=es01,es02\n      - cluster.initial_master_nodes=es01,es02,es03\n      - bootstrap.memory_lock=true\n      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"\n    ulimits:\n      memlock:\n        soft: -1\n        hard: -1\n    volumes:\n      - data03:/usr/share/elasticsearch/data\n    networks:\n      - elastic\n\nvolumes:\n  data01:\n    driver: local\n  data02:\n    driver: local\n  data03:\n    driver: local\n\nnetworks:\n  elastic:\n    driver: bridge\n'})}),"\n"]}),"\n",(0,c.jsxs)(s.li,{children:["\n",(0,c.jsx)(s.p,{children:"\u542f\u52a8\u96c6\u7fa4"}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-shell",children:"# \u542f\u52a8\ndocker-compose up\n\n# \u67e5\u770b\u65e5\u5fd7\ndocker logs\n\n# \u505c\u6b62\u96c6\u7fa4\ndocker-compose down\n\n# \u505c\u6b62\u96c6\u7fa4\u5e76\u5220\u9664 volumes\ndocker-compose down -v\n"})}),"\n"]}),"\n",(0,c.jsxs)(s.li,{children:["\n",(0,c.jsx)(s.p,{children:"\u6d4b\u8bd5\u72b6\u6001"}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-shell",children:'curl --user elastic:elastic -X GET "localhost:9200/_cat/nodes?v&pretty"\n'})}),"\n"]}),"\n"]}),"\n",(0,c.jsx)(s.h2,{id:"4-\u5b89\u88c5kibana",children:"4. \u5b89\u88c5Kibana"}),"\n",(0,c.jsx)(s.pre,{children:(0,c.jsx)(s.code,{className:"language-shell",children:"# \u8fd0\u884c\u5bb9\u5668\ndocker run -d \\\n  --publish 5601:5601 \\\n  --publish 9300:9300 \\\n  --net dev \\\n  --restart=no \\\n  --name kibana \\\n  docker.elastic.co/kibana/kibana:7.17.10\n\n# \u542f\u52a8\u5b89\u88c5 Kibana \uff0c\u9700\u8981 \u4eceelasticsearch \u83b7\u53d6 token\ndocker exec -it elasticsearch root /bin/bash\nbin/elasticsearch-create-enrollment-token -s kibana\n"})})]})}function d(e={}){const{wrapper:s}={...(0,a.R)(),...e.components};return s?(0,c.jsx)(s,{...e,children:(0,c.jsx)(h,{...e})}):h(e)}},28453:(e,s,n)=>{n.d(s,{R:()=>i,x:()=>t});var c=n(96540);const a={},r=c.createContext(a);function i(e){const s=c.useContext(r);return c.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function t(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:i(e.components),c.createElement(r.Provider,{value:s},e.children)}}}]);