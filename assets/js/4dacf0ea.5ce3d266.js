"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[17787],{47934:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>d,frontMatter:()=>s,metadata:()=>o,toc:()=>h});var i=t(74848),c=t(28453);const s={},r=void 0,o={id:"zh-cn/spring-security/oauth2/Wechat-Login",title:"Wechat-Login",description:"- \u5fae\u4fe1Web\u767b\u5f55",source:"@site/docs/zh-cn/spring-security/oauth2/7-Wechat-Login.md",sourceDirName:"zh-cn/spring-security/oauth2",slug:"/zh-cn/spring-security/oauth2/Wechat-Login",permalink:"/light-docusaurus/docs/zh-cn/spring-security/oauth2/Wechat-Login",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/spring-security/oauth2/7-Wechat-Login.md",tags:[],version:"current",sidebarPosition:7,frontMatter:{},sidebar:"troch",previous:{title:"Windows-Authentication",permalink:"/light-docusaurus/docs/zh-cn/spring-security/oauth2/Windows-Authentication"},next:{title:"Wecom-Login",permalink:"/light-docusaurus/docs/zh-cn/spring-security/oauth2/Wecom-Login"}},l={},h=[{value:"\u73af\u5883\u51c6\u5907",id:"\u73af\u5883\u51c6\u5907",level:2},{value:"1. \u51c6\u5907\u4e00\u4e2a\u5185\u7f51\u7a7f\u900f",id:"1-\u51c6\u5907\u4e00\u4e2a\u5185\u7f51\u7a7f\u900f",level:3},{value:"2. \u7533\u8bf7\u4e00\u4e2a\u5fae\u4fe1\u5f00\u653e\u5e73\u53f0\u8d26\u53f7",id:"2-\u7533\u8bf7\u4e00\u4e2a\u5fae\u4fe1\u5f00\u653e\u5e73\u53f0\u8d26\u53f7",level:3},{value:"\u5fae\u4fe1\u7f51\u9875\u6388\u6743",id:"\u5fae\u4fe1\u7f51\u9875\u6388\u6743",level:2},{value:"\u5fae\u4fe1\u626b\u7801\u767b\u5f55",id:"\u5fae\u4fe1\u626b\u7801\u767b\u5f55",level:2}];function a(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,c.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html",children:"\u5fae\u4fe1Web\u767b\u5f55"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html",children:"\u5fae\u4fe1\u7f51\u9875\u6388\u6743"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.csdn.net/xue317378914/article/details/115318810",children:"\u5fae\u4fe1\u5f00\u653e\u5e73\u53f0\u5f00\u53d1\u7b2c\u4e09\u65b9\u6388\u6743\u767b\u9646\uff1a\u5fae\u4fe1\u626b\u7801\u767b\u5f55"})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"\u73af\u5883\u51c6\u5907",children:"\u73af\u5883\u51c6\u5907"}),"\n",(0,i.jsx)(n.h3,{id:"1-\u51c6\u5907\u4e00\u4e2a\u5185\u7f51\u7a7f\u900f",children:"1. \u51c6\u5907\u4e00\u4e2a\u5185\u7f51\u7a7f\u900f"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://cpolar.com",children:"CPolar"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://dashboard.cpolar.com/get-started",children:"CPolar Get Started"})}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"\u5f00\u53d1\u5fae\u4fe1\u76f8\u5173\u7684\u5e94\u7528\u90fd\u9700\u8981\u641e\u4e00\u4e2a\u5185\u7f51\u7a7f\u900f\uff0c\u5728\u6211\u5f80\u671f\u7684\u6587\u7ae0\u90fd\u6709\u4ecb\u7ecd\u3002\u641e\u4e00\u4e2a\u6620\u5c04\u57df\u540d\u51fa\u6765\uff0c\u5c31\u50cf\u4e0b\u9762\u8fd9\u6837\uff1a"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"http://invybj.natappfree.cc -> 127.0.0.1:8082 \n"})}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"invybj.natappfree.cc"}),"\u4f1a\u6620\u5c04\u5230\u6211\u672c\u5730\u76848082\u7aef\u53e3\uff0c\u4e5f\u5c31\u662f\u6211\u672c\u5730\u8981\u5f00\u53d1\u5e94\u7528\u7684\u7aef\u53e3\u3002"]}),"\n",(0,i.jsx)(n.h3,{id:"2-\u7533\u8bf7\u4e00\u4e2a\u5fae\u4fe1\u5f00\u653e\u5e73\u53f0\u8d26\u53f7",children:"2. \u7533\u8bf7\u4e00\u4e2a\u5fae\u4fe1\u5f00\u653e\u5e73\u53f0\u8d26\u53f7"}),"\n",(0,i.jsx)(n.h2,{id:"\u5fae\u4fe1\u7f51\u9875\u6388\u6743",children:"\u5fae\u4fe1\u7f51\u9875\u6388\u6743"}),"\n",(0,i.jsx)(n.h2,{id:"\u5fae\u4fe1\u626b\u7801\u767b\u5f55",children:"\u5fae\u4fe1\u626b\u7801\u767b\u5f55"})]})}function d(e={}){const{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},28453:(e,n,t)=>{t.d(n,{R:()=>r,x:()=>o});var i=t(96540);const c={},s=i.createContext(c);function r(e){const n=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:r(e.components),i.createElement(s.Provider,{value:n},e.children)}}}]);