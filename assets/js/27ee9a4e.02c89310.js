"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[8302],{63980:(s,n,i)=>{i.r(n),i.d(n,{assets:()=>r,contentTitle:()=>h,default:()=>o,frontMatter:()=>t,metadata:()=>a,toc:()=>d});var e=i(85893),l=i(11151);const t={},h=void 0,a={id:"homeassistant/Install-HA-In-PVE-And-Exsi",title:"Install-HA-In-PVE-And-Exsi",description:"- Offical",source:"@site/diy/homeassistant/Install-HA-In-PVE-And-Exsi.md",sourceDirName:"homeassistant",slug:"/homeassistant/Install-HA-In-PVE-And-Exsi",permalink:"/light-docusaurus/diy/homeassistant/Install-HA-In-PVE-And-Exsi",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/diy/homeassistant/Install-HA-In-PVE-And-Exsi.md",tags:[],version:"current",lastUpdatedBy:"liuhui",lastUpdatedAt:1703833110,formattedLastUpdatedAt:"2023\u5e7412\u670829\u65e5",frontMatter:{},sidebar:"diy",previous:{title:"Install-HA-Core-With-LinuxDeploy",permalink:"/light-docusaurus/diy/homeassistant/Install-HA-Core-With-LinuxDeploy"},next:{title:"Router",permalink:"/light-docusaurus/diy/category/router"}},r={},d=[{value:"\u5b89\u88c5\u7cfb\u7edf",id:"\u5b89\u88c5\u7cfb\u7edf",level:2},{value:"\u5f00\u59cb\u4f7f\u7528",id:"\u5f00\u59cb\u4f7f\u7528",level:2},{value:"\u5b98\u65b9\u63d2\u4ef6\u5e02\u573a",id:"\u5b98\u65b9\u63d2\u4ef6\u5e02\u573a",level:3},{value:"\u5b89\u88c5\u9700\u77e5",id:"\u5b89\u88c5\u9700\u77e5",level:4},{value:"\u63a8\u8350\u5b89\u88c5\u7684\u63d2\u4ef6\u5217\u8868",id:"\u63a8\u8350\u5b89\u88c5\u7684\u63d2\u4ef6\u5217\u8868",level:4},{value:"HACS(Home Assistant Community Store) \u63d2\u4ef6",id:"hacshome-assistant-community-store-\u63d2\u4ef6",level:3},{value:"\u5b89\u88c5HACS \u793e\u533a\u63d2\u4ef6\u5546\u5e97",id:"\u5b89\u88c5hacs-\u793e\u533a\u63d2\u4ef6\u5546\u5e97",level:4},{value:"\u5b89\u88c5\u63d2\u4ef6",id:"\u5b89\u88c5\u63d2\u4ef6",level:4},{value:"\u914d\u7f6e",id:"\u914d\u7f6e",level:2},{value:"\u81ea\u52a8\u5316",id:"\u81ea\u52a8\u5316",level:2},{value:"\u811a\u672c",id:"\u811a\u672c",level:2},{value:"\u4eea\u8868\u76d8",id:"\u4eea\u8868\u76d8",level:2},{value:"\u8bed\u97f3\u52a9\u624b",id:"\u8bed\u97f3\u52a9\u624b",level:2}];function c(s){const n={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",pre:"pre",ul:"ul",...(0,l.ah)(),...s.components};return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)(n.ul,{children:["\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://www.home-assistant.io",children:"Offical"})}),"\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://github.com/home-assistant/operating-system",children:"Offical Github"})}),"\n"]}),"\n",(0,e.jsx)(n.h2,{id:"\u5b89\u88c5\u7cfb\u7edf",children:"\u5b89\u88c5\u7cfb\u7edf"}),"\n",(0,e.jsxs)(n.ul,{children:["\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://www.home-assistant.io/installation/generic-x86-64",children:"Offical Install Document For Generic X86"})}),"\n"]}),"\n",(0,e.jsxs)(n.ol,{children:["\n",(0,e.jsx)(n.li,{children:"\u8fdb\u5165BIOS\uff0c\u542f\u7528 UEFI \u5f15\u5bfc\u6a21\u5f0f\uff0c\u7981\u7528\u5b89\u5168\u542f\u52a8"}),"\n",(0,e.jsxs)(n.li,{children:["\u4e0b\u8f7d\u5e76\u542f\u52a8",(0,e.jsx)(n.a,{href:"https://www.balena.io/etcher",children:"Balena Etcher"})]}),"\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://github.com/home-assistant/operating-system/releases/download/11.1/haos_generic-x86-64-11.1.img.xz",children:"\u4e0b\u8f7dHA\u955c\u50cf"})}),"\n",(0,e.jsx)(n.li,{children:"\u5c06\u5f15\u5bfcU\u76d8\u63d2\u5165X86\u673a\u5668\uff0c\u8fdb\u5165BIOS\u9009\u62e9U\u76d8\u542f\u52a8\uff0c\u6309\u7167\u6307\u5bfc\u8fdb\u884c\u5b89\u88c5"}),"\n",(0,e.jsxs)(n.li,{children:["\u5b89\u88c5\u5b8c\u6210\u540e\u7528\u6d4f\u89c8\u5668\u8bbf\u95ee: ",(0,e.jsx)(n.code,{children:"http://X.X.X.X:8123"})," \u8fdb\u5165HA\u4e3b\u9875"]}),"\n"]}),"\n",(0,e.jsx)(n.h2,{id:"\u5f00\u59cb\u4f7f\u7528",children:"\u5f00\u59cb\u4f7f\u7528"}),"\n",(0,e.jsxs)(n.ul,{children:["\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://www.home-assistant.io/getting-started/onboarding/",children:"Onboarding Home Assistant"})}),"\n"]}),"\n",(0,e.jsx)(n.h3,{id:"\u5b98\u65b9\u63d2\u4ef6\u5e02\u573a",children:"\u5b98\u65b9\u63d2\u4ef6\u5e02\u573a"}),"\n",(0,e.jsx)(n.h4,{id:"\u5b89\u88c5\u9700\u77e5",children:"\u5b89\u88c5\u9700\u77e5"}),"\n",(0,e.jsxs)(n.ol,{children:["\n",(0,e.jsx)(n.li,{children:"\u542f\u7528\u63d2\u4ef6\u9700\u8981\u5f00\u542f\u9ad8\u7ea7\u6a21\u5f0f\uff0c\u5728\u3010\u8d26\u6237\u3011-\u3010\u9ad8\u7ea7\u6a21\u5f0f\u3011\u4e2d\u5f00\u542f"}),"\n",(0,e.jsx)(n.li,{children:"\u5b98\u65b9\u63d2\u4ef6\u5728\u3010\u914d\u7f6e\u3011-\u3010\u52a0\u8f7d\u9879\u3011\u4e2d\u5b89\u88c5"}),"\n",(0,e.jsx)(n.li,{children:"\u5b89\u88c5\u5b8c\u6210\u540e\u68c0\u67e5\u63d2\u4ef6\u7684\u3010\u914d\u7f6e\u3011Tab\u9875\u662f\u5426\u6709\u9700\u8981\u914d\u7f6e\u7684\u9879\u76ee"}),"\n",(0,e.jsx)(n.li,{children:"\u542f\u52a8\u524d\u53ef\u5c06\u9664\u4e86\u3010\u81ea\u52a8\u66f4\u65b0\u3011\u5916\u7684\u6240\u6709\u529f\u80fd\u52fe\u9009\uff0c\u4f8b\u5982\u3010\u81ea\u52a8\u542f\u52a8\u3011\u3001\u3010\u5b88\u62a4\u8fdb\u7a0b\u3011\u3001\u3010\u663e\u793a\u5728\u5230\u5de6\u4fa7\u83dc\u5355\u680f\u3011"}),"\n"]}),"\n",(0,e.jsx)(n.h4,{id:"\u63a8\u8350\u5b89\u88c5\u7684\u63d2\u4ef6\u5217\u8868",children:"\u63a8\u8350\u5b89\u88c5\u7684\u63d2\u4ef6\u5217\u8868"}),"\n",(0,e.jsxs)(n.ol,{children:["\n",(0,e.jsx)(n.li,{children:"Terminal     Web\u7aef\u547d\u4ee4\u884c"}),"\n",(0,e.jsx)(n.li,{children:"Samba Share  \u5c40\u57df\u7f51\u6587\u4ef6\u5171\u4eab"}),"\n",(0,e.jsx)(n.li,{children:"File Editor  \u53ef\u89c6\u5316\u6587\u672c\u7f16\u8f91\u5668"}),"\n",(0,e.jsx)(n.li,{children:"Mosquitto    MQTT\u670d\u52a1\u7aef"}),"\n",(0,e.jsx)(n.li,{children:"Node-Red     \u81ea\u52a8\u5316\u811a\u672c\u7f16\u8f91"}),"\n",(0,e.jsx)(n.li,{children:"ESP Home     \u901a\u8fc7YAML \u63a7\u5236\u7ba1\u7406\u4f20\u611f\u5668"}),"\n"]}),"\n",(0,e.jsx)(n.h3,{id:"hacshome-assistant-community-store-\u63d2\u4ef6",children:"HACS(Home Assistant Community Store) \u63d2\u4ef6"}),"\n",(0,e.jsx)(n.h4,{id:"\u5b89\u88c5hacs-\u793e\u533a\u63d2\u4ef6\u5546\u5e97",children:"\u5b89\u88c5HACS \u793e\u533a\u63d2\u4ef6\u5546\u5e97"}),"\n",(0,e.jsxs)(n.ol,{children:["\n",(0,e.jsxs)(n.li,{children:["\u6253\u5f00Terminal\uff0c\u6267\u884c\u4e0b\u9762\u7684\u547d\u4ee4","\n",(0,e.jsx)(n.pre,{children:(0,e.jsx)(n.code,{className:"language-shell",children:"# \u5b98\u65b9\u5730\u5740\nwget -O - https://get.hacs.xyz | bash -\n# \u56fd\u5185\u52a0\u901f\u5730\u5740\nwget -O - https://hacs.vip/get | bash -\n# \u56fd\u5185\u52a0\u901f\u5730\u5740\nwget -O - https://hacs.vip/get | HUB_DOMAIN=ghproxy.com/github.com bash -\n# cdn\u4ee3\u7406\u5730\u5740 \u4e0d\u53ef\u7528\nwget -O - https://cdn.jsdelivr.net/gh/hasscc/get@main/get | HUB_DOMAIN=ghproxy.com/github.com DOMAIN=hacs REPO_PATH=hacs-china/integration ARCHIVE_TAG=china bash -\n"})}),"\n"]}),"\n",(0,e.jsx)(n.li,{children:"\u5728\u3010\u914d\u7f6e\u3011-\u3010\u96c6\u6210\u3011\u4e2d\u641c\u7d22\u3010HACS\u3011"}),"\n"]}),"\n",(0,e.jsx)(n.h4,{id:"\u5b89\u88c5\u63d2\u4ef6",children:"\u5b89\u88c5\u63d2\u4ef6"}),"\n",(0,e.jsxs)(n.ol,{children:["\n",(0,e.jsx)(n.li,{children:"Xiaomi MIot Auto"}),"\n",(0,e.jsx)(n.li,{children:"Tuya"}),"\n",(0,e.jsx)(n.li,{children:"Yeelight"}),"\n",(0,e.jsx)(n.li,{children:"Zigbee"}),"\n",(0,e.jsx)(n.li,{children:"Homekit"}),"\n",(0,e.jsx)(n.li,{children:"Mushroom"}),"\n"]}),"\n",(0,e.jsx)(n.h2,{id:"\u914d\u7f6e",children:"\u914d\u7f6e"}),"\n",(0,e.jsxs)(n.ul,{children:["\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://www.home-assistant.io/docs/configuration/",children:"Configuration.yaml"})}),"\n"]}),"\n",(0,e.jsx)(n.h2,{id:"\u81ea\u52a8\u5316",children:"\u81ea\u52a8\u5316"}),"\n",(0,e.jsxs)(n.ul,{children:["\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://www.home-assistant.io/docs/automation/",children:"Automating Home Assistant"})}),"\n"]}),"\n",(0,e.jsx)(n.h2,{id:"\u811a\u672c",children:"\u811a\u672c"}),"\n",(0,e.jsxs)(n.ul,{children:["\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://www.home-assistant.io/docs/scripts/",children:"Script Syntax"})}),"\n"]}),"\n",(0,e.jsx)(n.h2,{id:"\u4eea\u8868\u76d8",children:"\u4eea\u8868\u76d8"}),"\n",(0,e.jsxs)(n.ul,{children:["\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://www.home-assistant.io/dashboards/",children:"Dashboards"})}),"\n"]}),"\n",(0,e.jsx)(n.h2,{id:"\u8bed\u97f3\u52a9\u624b",children:"\u8bed\u97f3\u52a9\u624b"}),"\n",(0,e.jsxs)(n.ul,{children:["\n",(0,e.jsx)(n.li,{children:(0,e.jsx)(n.a,{href:"https://www.home-assistant.io/voice_control/",children:"Assist - Talking to Home Assistant"})}),"\n"]})]})}function o(s={}){const{wrapper:n}={...(0,l.ah)(),...s.components};return n?(0,e.jsx)(n,{...s,children:(0,e.jsx)(c,{...s})}):c(s)}},11151:(s,n,i)=>{i.d(n,{ah:()=>t});var e=i(67294);const l=e.createContext({});function t(s){const n=e.useContext(l);return e.useMemo((()=>"function"==typeof s?s(n):{...n,...s}),[n,s])}}}]);