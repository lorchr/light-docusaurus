"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[9934],{3905:(e,n,t)=>{t.d(n,{Zo:()=>u,kt:()=>h});var r=t(67294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var l=r.createContext({}),s=function(e){var n=r.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},u=function(e){var n=s(e.components);return r.createElement(l.Provider,{value:n},e.children)},m="mdxType",d={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},p=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,i=e.originalType,l=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),m=s(t),p=o,h=m["".concat(l,".").concat(p)]||m[p]||d[p]||i;return t?r.createElement(h,a(a({ref:n},u),{},{components:t})):r.createElement(h,a({ref:n},u))}));function h(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var i=t.length,a=new Array(i);a[0]=p;var c={};for(var l in n)hasOwnProperty.call(n,l)&&(c[l]=n[l]);c.originalType=e,c[m]="string"==typeof e?e:o,a[1]=c;for(var s=2;s<i;s++)a[s]=t[s];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}p.displayName="MDXCreateElement"},38055:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>a,default:()=>d,frontMatter:()=>i,metadata:()=>c,toc:()=>s});var r=t(87462),o=(t(67294),t(3905));const i={},a=void 0,c={unversionedId:"zh-cn/devenv/Docker-MinIO",id:"zh-cn/devenv/Docker-MinIO",title:"Docker-MinIO",description:"- MinIO Offical",source:"@site/docs/zh-cn/devenv/Docker-MinIO.md",sourceDirName:"zh-cn/devenv",slug:"/zh-cn/devenv/Docker-MinIO",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-MinIO",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/devenv/Docker-MinIO.md",tags:[],version:"current",frontMatter:{},sidebar:"troch",previous:{title:"Docker-EMQX",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-EMQX"},next:{title:"Docker-Elasticsearch",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-Elasticsearch"}},l={},s=[{value:"1. Docker\u5b89\u88c5",id:"1-docker\u5b89\u88c5",level:2},{value:"config.env",id:"configenv",level:2}],u={toc:s},m="wrapper";function d(e){let{components:n,...t}=e;return(0,o.kt)(m,(0,r.Z)({},u,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://min.io"},"MinIO Offical")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://min.io/docs/minio/container/index.html"},"MinIO Offical Docker")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("a",{parentName:"li",href:"https://hub.docker.com/r/minio/minio"},"MinIO Docker")," ")),(0,o.kt)("h2",{id:"1-docker\u5b89\u88c5"},"1. Docker\u5b89\u88c5"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-shell"},'docker run -d \\\n  --publish 9000:9000 \\\n  --publish 9001:9001 \\\n  --volume //d/docker/minio/data:/data \\\n  --env MINIO_ROOT_USER=minioaccess \\\n  --env MINIO_ROOT_PASSWORD=miniosecret \\\n  --env MINIO_SERVER_URL=http://minio.example.net:9000 \\\n  --net dev \\\n  --restart=on-failure:3 \\\n  --name minio \\\n  minio/minio:RELEASE.2023-05-18T00-05-36Z server /data --console-address ":9001"\n\n# \u521b\u5efaNetwork\ndocker network create dev\n\n# \u521b\u5efa\u6570\u636e\u5377\ndocker volume create minio_data;\n\n# \u83b7\u53d6\u9ed8\u8ba4\u914d\u7f6e\u6587\u4ef6\n# \u89c1 https://min.io/docs/minio/container/operations/install-deploy-manage/deploy-minio-single-node-single-drive.html#id4\n\n# \u8fd0\u884c\u5bb9\u5668\ndocker run -d \\\n  --publish 9000:9000 \\\n  --publish 9001:9001 \\\n  --volume //d/docker/minio/data:/data \\\n  --volume //d/docker/minio/conf/config.env:/etc/minio/config.env \\\n  --env MINIO_CONFIG_ENV_FILE=/etc/minio/config.env \\\n  --net dev \\\n  --restart=on-failure:3 \\\n  --name minio \\\n  minio/minio:RELEASE.2023-05-18T00-05-36Z server /data --console-address ":9001"\n\ndocker exec -it -u root minio /bin/bash\n\ndocker container restart minio\n')),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},"Account",(0,o.kt)("ul",{parentName:"li"},(0,o.kt)("li",{parentName:"ul"},"minioaccess/miniosecret")))),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"http://localhost:9001"},"Console Dashboard")),(0,o.kt)("h2",{id:"configenv"},"config.env"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-conf"},'# MINIO_ROOT_USER and MINIO_ROOT_PASSWORD sets the root account for the MinIO server.\n# This user has unrestricted permissions to perform S3 and administrative API operations on any resource in the deployment.\n# Omit to use the default values \'minioadmin:minioadmin\'.\n# MinIO recommends setting non-default values as a best practice, regardless of environment\n\nMINIO_ROOT_USER=minioaccess\nMINIO_ROOT_PASSWORD=miniosecret\n\n# MINIO_VOLUMES sets the storage volume or path to use for the MinIO server.\n\nMINIO_VOLUMES="/mnt/data"\n\n# MINIO_SERVER_URL sets the hostname of the local machine for use with the MinIO Server\n# MinIO assumes your network control plane can correctly resolve this hostname to the local machine\n\n# Uncomment the following line and replace the value with the correct hostname for the local machine and port for the MinIO server (9000 by default).\n\n# MINIO_SERVER_URL="http://minio.example.net:9000"\n')))}d.isMDXComponent=!0}}]);