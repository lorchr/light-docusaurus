"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[9529],{24786:(e,n,d)=>{d.r(n),d.d(n,{assets:()=>l,contentTitle:()=>i,default:()=>a,frontMatter:()=>c,metadata:()=>o,toc:()=>t});var r=d(85893),s=d(11151);const c={},i=void 0,o={id:"zh-cn/devenv/Docker-Nodered",title:"Docker-Nodered",description:"- NodeRed Offical",source:"@site/docs/zh-cn/devenv/24-Docker-Nodered.md",sourceDirName:"zh-cn/devenv",slug:"/zh-cn/devenv/Docker-Nodered",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-Nodered",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/devenv/24-Docker-Nodered.md",tags:[],version:"current",sidebarPosition:24,frontMatter:{},sidebar:"troch",previous:{title:"Docker-Chat2DB",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-Chat2DB"},next:{title:"Docker-Sonarqube",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-Sonarqube"}},l={},t=[{value:"Docker\u5b89\u88c5",id:"docker\u5b89\u88c5",level:2},{value:"\u5411MQTT\u4e0a\u4f20\u6570\u636e",id:"\u5411mqtt\u4e0a\u4f20\u6570\u636e",level:2},{value:"\u90e8\u7f72MQTT Broker\u63a5\u6536\u6570\u636e",id:"\u90e8\u7f72mqtt-broker\u63a5\u6536\u6570\u636e",level:2}];function h(e){const n={a:"a",code:"code",h2:"h2",input:"input",li:"li",ol:"ol",pre:"pre",ul:"ul",...(0,s.ah)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"https://nodered.org/docs",children:"NodeRed Offical"})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"https://nodered.org/docs/getting-started/docker",children:"NodeRed Offical Docker"})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"https://hub.docker.com/r/nodered/node-red",children:"NodeRed Docker"})}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"docker\u5b89\u88c5",children:"Docker\u5b89\u88c5"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-shell",children:"# \u521b\u5efaNetwork\ndocker network create dev\n\n# \u521b\u5efa\u6570\u636e\u5377\ndocker volume create nodered_data;\n\n# \u83b7\u53d6\u9ed8\u8ba4\u914d\u7f6e\u6587\u4ef6\n\n# \u8fd0\u884c\u5bb9\u5668\ndocker run -d \\\n  --publish 1880:1880 \\\n  --volume //d/docker/nodered/data:/data \\\n  --net dev \\\n  --restart=on-failure:3 \\\n  --name nodered \\\n  nodered/node-red:3.0\n\n# \u8fdb\u5165\u4ea4\u4e92\u5f0f\u547d\u4ee4\u884c\ndocker exec -it -u root nodered /bin/bash\n"})}),"\n",(0,r.jsx)(n.h2,{id:"\u5411mqtt\u4e0a\u4f20\u6570\u636e",children:"\u5411MQTT\u4e0a\u4f20\u6570\u636e"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"\u8282\u70b9\u7ba1\u7406"})," - ",(0,r.jsx)(n.code,{children:"\u5b89\u88c5"})," - \u641c\u7d22",(0,r.jsx)(n.code,{children:"node-red-contrib-modbus"}),"\u5e76\u5b89\u88c5"]}),"\n",(0,r.jsxs)(n.li,{children:["\u8bbf\u95ee ",(0,r.jsx)(n.a,{href:"http://localhost:1880",children:"Node Red \u63a7\u5236\u53f0"})]}),"\n",(0,r.jsxs)(n.li,{children:["\u5728\u6d41\u7a0b\u4e2d\u6dfb\u52a0 ",(0,r.jsx)(n.code,{children:"mqtt out"})," \u6a21\u5757"]}),"\n",(0,r.jsxs)(n.li,{children:["\u914d\u7f6e ",(0,r.jsx)(n.code,{children:"mqtt out"})]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"\u90e8\u7f72mqtt-broker\u63a5\u6536\u6570\u636e",children:"\u90e8\u7f72MQTT Broker\u63a5\u6536\u6570\u636e"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.code,{children:"\u8282\u70b9\u7ba1\u7406"})," - ",(0,r.jsx)(n.code,{children:"\u5b89\u88c5"})," - \u641c\u7d22",(0,r.jsx)(n.code,{children:"node-red-contrib-aedes"}),"\u5e76\u5b89\u88c5"]}),"\n",(0,r.jsxs)(n.li,{children:["\u5728",(0,r.jsx)(n.code,{children:"\u7f51\u7edc"}),"\u4e2d\u5c06 ",(0,r.jsx)(n.code,{children:"aedes-broker"})," \u62d6\u62fd\u5230\u5de5\u4f5c\u533a\u5e76\u8fdb\u884c\u914d\u7f6e","\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["Connection","\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"name: mqtt-broker"}),"\n",(0,r.jsx)(n.li,{children:"port: 1883"}),"\n",(0,r.jsx)(n.li,{children:"ws bind : port"}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["Security","\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"username:"}),"\n",(0,r.jsx)(n.li,{children:"password:"}),"\n"]}),"\n"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\u5728",(0,r.jsx)(n.code,{children:"\u7f51\u7edc"}),"\u4e2d\u5c06 ",(0,r.jsx)(n.code,{children:"mqtt in"})," \u62d6\u62fd\u5230\u5de5\u4f5c\u533a\u5e76\u8fdb\u884c\u914d\u7f6e","\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Broker: broker.emqx.io:1883"}),"\n",(0,r.jsx)(n.li,{children:"Topic\uff1a test/data"}),"\n",(0,r.jsx)(n.li,{children:"Qos: 1"}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\u5728",(0,r.jsx)(n.code,{children:"mqtt in"})," \u540e\u9762\u52a0\u5165 ",(0,r.jsx)(n.code,{children:"debug"}),"\n",(0,r.jsxs)(n.ol,{className:"contains-task-list",children:["\n",(0,r.jsxs)(n.li,{className:"task-list-item",children:[(0,r.jsx)(n.input,{type:"checkbox",checked:!0,disabled:!0})," ","\u8c03\u8bd5\u7a97\u53e3"]}),"\n",(0,r.jsxs)(n.li,{className:"task-list-item",children:[(0,r.jsx)(n.input,{type:"checkbox",disabled:!0})," ","\u63a7\u5236\u53f0"]}),"\n",(0,r.jsxs)(n.li,{className:"task-list-item",children:[(0,r.jsx)(n.input,{type:"checkbox",checked:!0,disabled:!0})," ","\u8282\u70b9\u72b6\u6001 \u81ea\u52a8\u7684"]}),"\n"]}),"\n"]}),"\n",(0,r.jsxs)(n.li,{children:["\u4f7f\u7528 ",(0,r.jsx)(n.a,{href:"https://mqttx.app/zh/",children:"MQTTX"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\u8fde\u63a5Broker: ",(0,r.jsx)(n.code,{children:"broker.emqx.io:1883"})]}),"\n",(0,r.jsxs)(n.li,{children:["\u53d1\u9001Topic: ",(0,r.jsx)(n.code,{children:"test/data"}),",  msg: ",(0,r.jsx)(n.code,{children:'{"msg": "Hello World"}'})]}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.li,{children:"\u53d1\u9001\u5b8c\u6210\u540e\u5c06\u5728 NodeRed\u7684\u6d41\u7a0b\u754c\u9762\u770b\u5230\u8f93\u51fa\u53c2\u6570\uff0c\u5728debug\u754c\u9762\u4e5f\u4f1a\u6709\u5bf9\u5e94\u7684\u8f93\u51fa"}),"\n"]})]})}function a(e={}){const{wrapper:n}={...(0,s.ah)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(h,{...e})}):h(e)}},11151:(e,n,d)=>{d.d(n,{ah:()=>c});var r=d(67294);const s=r.createContext({});function c(e){const n=r.useContext(s);return r.useMemo((()=>"function"==typeof e?e(n):{...n,...e}),[n,e])}}}]);