"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[8725],{3905:(e,t,r)=>{r.d(t,{Zo:()=>m,kt:()=>p});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function i(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),b=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):c(c({},t),e)),r},m=function(e){var t=b(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,m=i(e,["components","mdxType","originalType","parentName"]),u=b(r),s=a,p=u["".concat(l,".").concat(s)]||u[s]||d[s]||o;return r?n.createElement(p,c(c({ref:t},m),{},{components:r})):n.createElement(p,c({ref:t},m))}));function p(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,c=new Array(o);c[0]=s;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i[u]="string"==typeof e?e:a,c[1]=i;for(var b=2;b<o;b++)c[b]=r[b];return n.createElement.apply(null,c)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},1608:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>l,contentTitle:()=>c,default:()=>d,frontMatter:()=>o,metadata:()=>i,toc:()=>b});var n=r(7462),a=(r(7294),r(3905));const o={},c=void 0,i={unversionedId:"zh-cn/devenv/Docker-RabbitMQ",id:"zh-cn/devenv/Docker-RabbitMQ",title:"Docker-RabbitMQ",description:"- RabbitMQ Offical",source:"@site/docs/zh-cn/devenv/Docker-RabbitMQ.md",sourceDirName:"zh-cn/devenv",slug:"/zh-cn/devenv/Docker-RabbitMQ",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-RabbitMQ",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/devenv/Docker-RabbitMQ.md",tags:[],version:"current",frontMatter:{},sidebar:"troch",previous:{title:"Docker-Kafka",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-Kafka"},next:{title:"Docker-RocketMQ",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-RocketMQ"}},l={},b=[{value:"1. Docker\u5b89\u88c5",id:"1-docker\u5b89\u88c5",level:2},{value:"2. \u64cd\u4f5c",id:"2-\u64cd\u4f5c",level:2},{value:"1. \u91cd\u7f6eRabbitMQ\u961f\u5217",id:"1-\u91cd\u7f6erabbitmq\u961f\u5217",level:3},{value:"2. \u4ea4\u6362\u673a\u70b9\u51fb\u62a5\u9519 Management API returned status code 500",id:"2-\u4ea4\u6362\u673a\u70b9\u51fb\u62a5\u9519-management-api-returned-status-code-500",level:3}],m={toc:b},u="wrapper";function d(e){let{components:t,...r}=e;return(0,a.kt)(u,(0,n.Z)({},m,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://www.rabbitmq.com/"},"RabbitMQ Offical")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://hub.docker.com/_/rabbitmq"},"RabbitMQ Docker")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://www.rabbitmq.com/documentation.html"},"RabbitMQ Offical Document"))),(0,a.kt)("h2",{id:"1-docker\u5b89\u88c5"},"1. Docker\u5b89\u88c5"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"# \u521b\u5efaNetwork\ndocker network create dev\n\n# \u83b7\u53d6\u9ed8\u8ba4\u914d\u7f6e\u6587\u4ef6\ndocker run -d --env RABBITMQ_DEFAULT_USER=rabbitmq --env RABBITMQ_DEFAULT_PASS=rabbitmq --env RABBITMQ_DEFAULT_VHOST=vh1 --name rabbitmq_temp rabbitmq:3.12-management \\\n&& docker cp rabbitmq_temp:/etc/rabbitmq/conf.d/10-defaults.conf  D:/docker/rabbitmq/conf/conf.d/10-defaults.conf \\\n&& docker cp rabbitmq_temp:/etc/rabbitmq/enabled_plugins  D:/docker/rabbitmq/conf/enabled_plugins \\\n&& docker stop rabbitmq_temp && docker rm rabbitmq_temp\n\n# \u8fd0\u884c\u5bb9\u5668\ndocker run -d \\\n  --publish 5672:5672 \\\n  --publish 15672:15672 \\\n  --publish 25672:25672 \\\n  --publish 61613:61613 \\\n  --publish 1883:1883 \\\n  --volume //d/docker/rabbitmq/data:/var/lib/rabbitmq \\\n  --volume //d/docker/rabbitmq/conf/conf.d:/etc/rabbitmq/conf.d \\\n  --volume //d/docker/rabbitmq/conf/enabled_plugins:/etc/rabbitmq/enabled_plugins \\\n  --volume //d/docker/rabbitmq/log:/var/log/rabbitmq \\\n  --env RABBITMQ_DEFAULT_USER=rabbitmq \\\n  --env RABBITMQ_DEFAULT_PASS=rabbitmq \\\n  --env RABBITMQ_DEFAULT_VHOST=vh1 \\\n  --hostname rabbitmq \\\n  --net dev \\\n  --restart=no \\\n  --name rabbitmq \\\n  rabbitmq:3-management\n\ndocker exec -it -u root rabbitmq /bin/bash\n# \u542f\u7528management\u63d2\u4ef6 web\u7ba1\u7406\u9875\u9762\nrabbitmq-plugins enable rabbitmq-management\n")),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"http://localhost:15672"},"Dashboard")),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Account",(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},"rabbitmq / rabbitmq")))),(0,a.kt)("h2",{id:"2-\u64cd\u4f5c"},"2. \u64cd\u4f5c"),(0,a.kt)("h3",{id:"1-\u91cd\u7f6erabbitmq\u961f\u5217"},"1. \u91cd\u7f6eRabbitMQ\u961f\u5217"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"rabbitmqctl stop_app\nrabbitmqctl reset\nrabbitmqctl start_app\n")),(0,a.kt)("h3",{id:"2-\u4ea4\u6362\u673a\u70b9\u51fb\u62a5\u9519-management-api-returned-status-code-500"},"2. \u4ea4\u6362\u673a\u70b9\u51fb\u62a5\u9519 Management API returned status code 500"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"# \u8fdb\u5165\u5bb9\u5668\ndocker exec -it root rabbitmq /bin/bash\n\n# \u4fee\u6539\u914d\u7f6e\ncd /etc/rabbitmq/conf.d\necho management_agent.disable_metrics_collector = false > management_agent.disable_metrics_collector.conf\n\n# \u91cd\u542f\u5bb9\u5668\ndocker restart rabbitmq\n")))}d.isMDXComponent=!0}}]);