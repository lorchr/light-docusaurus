"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[9561],{36947:(n,e,i)=>{i.r(e),i.d(e,{assets:()=>d,contentTitle:()=>c,default:()=>u,frontMatter:()=>r,metadata:()=>o,toc:()=>l});var s=i(85893),t=i(11151);const r={},c=void 0,o={id:"zh-cn/spring-security/oauth2/Windows-Authentication",title:"Windows-Authentication",description:"- Spring Boot \u9879\u76ee\u96c6\u6210Windows\u57df\u8d26\u6237\u8ba4\u8bc1",source:"@site/docs/zh-cn/spring-security/oauth2/6-Windows-Authentication.md",sourceDirName:"zh-cn/spring-security/oauth2",slug:"/zh-cn/spring-security/oauth2/Windows-Authentication",permalink:"/light-docusaurus/docs/zh-cn/spring-security/oauth2/Windows-Authentication",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/spring-security/oauth2/6-Windows-Authentication.md",tags:[],version:"current",sidebarPosition:6,frontMatter:{},sidebar:"troch",previous:{title:"Github-Gitee-Login",permalink:"/light-docusaurus/docs/zh-cn/spring-security/oauth2/Github-Gitee-Login"},next:{title:"OAuth2",permalink:"/light-docusaurus/docs/category/oauth2"}},d={},l=[{value:"\u95ee\u9898\u63cf\u8ff0",id:"\u95ee\u9898\u63cf\u8ff0",level:2},{value:"\u539f\u6709\u7cfb\u7edf\u7684\u7528\u6237\u767b\u5f55\u53ca\u8ba4\u8bc1",id:"\u539f\u6709\u7cfb\u7edf\u7684\u7528\u6237\u767b\u5f55\u53ca\u8ba4\u8bc1",level:2},{value:"\u5b9e\u73b0\u65b9\u6848",id:"\u5b9e\u73b0\u65b9\u6848",level:2},{value:"\u5177\u4f53\u5e94\u7528\u8ba4\u8bc1\u8fc7\u7a0b\u5982\u4e0b\u56fe\u6240\u793a",id:"\u5177\u4f53\u5e94\u7528\u8ba4\u8bc1\u8fc7\u7a0b\u5982\u4e0b\u56fe\u6240\u793a",level:2}];function h(n){const e={a:"a",code:"code",h2:"h2",img:"img",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...(0,t.ah)(),...n.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(e.ul,{children:["\n",(0,s.jsx)(e.li,{children:(0,s.jsx)(e.a,{href:"https://blog.csdn.net/zj007ok/article/details/101434566",children:"Spring Boot \u9879\u76ee\u96c6\u6210Windows\u57df\u8d26\u6237\u8ba4\u8bc1"})}),"\n",(0,s.jsx)(e.li,{children:(0,s.jsx)(e.a,{href:"https://docs.spring.io/spring-security-kerberos/reference/samples.html",children:"Spring Security Kerberos Samples"})}),"\n"]}),"\n",(0,s.jsx)(e.h2,{id:"\u95ee\u9898\u63cf\u8ff0",children:"\u95ee\u9898\u63cf\u8ff0"}),"\n",(0,s.jsx)(e.p,{children:"\u5c06\u5df2\u6709\u7684Spring Cloud\u9879\u76ee\u4e0eAD\u57df\u8d26\u6237\u96c6\u6210\uff0c\u8981\u6c42\u5b9e\u73b0\u6548\u679c\u5982\u4e0b"}),"\n",(0,s.jsxs)(e.ol,{children:["\n",(0,s.jsxs)(e.li,{children:["\n",(0,s.jsx)(e.p,{children:"\u7cfb\u7edf\u7528\u6237\u5c31\u662fAd\u57df\u8d26\u6237\uff0c\u4f7f\u7528Ad\u57df\u7528\u6237\u540d\u5bc6\u7801\u767b\u5f55\u3002"}),"\n"]}),"\n",(0,s.jsxs)(e.li,{children:["\n",(0,s.jsx)(e.p,{children:"\u5f53\u7528\u6237\u5728\u516c\u53f8\u5185\u7f51\u65f6\uff0c\u5982\u679c\u6d4f\u89c8\u5668\u5df2\u7ecf\u767b\u5f55\u8fc7\u57df\uff0c\u76f4\u63a5\u8fdb\u5165\u7cfb\u7edf\uff0c\u65e0\u9700\u767b\u5f55\u3002\u5426\u5219\u901a\u8fc7\u6d4f\u89c8\u5668\u7684windows\u8ba4\u8bc1\u7a97\u53e3\u767b\u5f55\u3002\u5c31\u662fIIS\u7684Windows\u8ba4\u8bc1\u6548\u679c\u3002"}),"\n"]}),"\n",(0,s.jsxs)(e.li,{children:["\n",(0,s.jsx)(e.p,{children:"\u5f53\u7528\u6237\u5728\u516c\u53f8\u5916\u7f51\u65f6\uff0c\u901a\u8fc7\u7cfb\u7edf\u539f\u6709\u767b\u5f55\u754c\u9762\u8f93\u5165Ad\u57df\u8d26\u6237\u7528\u6237\u540d\u5bc6\u7801\u767b\u5f55\u3002"}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(e.h2,{id:"\u539f\u6709\u7cfb\u7edf\u7684\u7528\u6237\u767b\u5f55\u53ca\u8ba4\u8bc1",children:"\u539f\u6709\u7cfb\u7edf\u7684\u7528\u6237\u767b\u5f55\u53ca\u8ba4\u8bc1"}),"\n",(0,s.jsx)(e.p,{children:"\u9879\u76ee\u662f\u4e00\u4e2aSpring Cloud\u9879\u76ee\uff0c\u672c\u8eab\u6709\u4e00\u4e2a\u7528\u6237\u670d\u52a1\uff0c\u6839\u636e\u7528\u6237\u540d\u3001\u5bc6\u7801\u53d1\u653e\u52a8\u6001\u4e14\u6709\u65f6\u9650\u7684User-Token\u3002\u5ba2\u6237\u7aef\u6bcf\u6b21\u8bf7\u6c42\u90fd\u5c06User-Token\u5199\u5165\u8bf7\u6c42\u7684Header\u4e2d\uff0c\u670d\u52a1\u7aef\u6839\u636eUser-Token\u5224\u522b\u7528\u6237\uff0c\u8fdb\u884c\u6743\u9650\u63a7\u5236\u3002"}),"\n",(0,s.jsx)(e.h2,{id:"\u5b9e\u73b0\u65b9\u6848",children:"\u5b9e\u73b0\u65b9\u6848"}),"\n",(0,s.jsxs)(e.ol,{children:["\n",(0,s.jsxs)(e.li,{children:["\n",(0,s.jsx)(e.p,{children:"\u539f\u6709\u7684\u7528\u6237\u540d\u5bc6\u7801\u8ba4\u8bc1\u670d\u52a1\u901a\u8fc7\u8fde\u63a5AD\u57df\u670d\u52a1\u5668\u5b9e\u73b0\u7528\u6237\u540d\u5bc6\u7801\u9a8c\u8bc1\uff0c\u4f7f\u7528spring-boot-starter-data-ldap\u5b9e\u73b0\uff08\u7f51\u4e0a\u641c\uff0cmaven\u76f4\u63a5\u4f9d\u8d56\uff0c\u5f88\u7b80\u5355\uff09\u3002"}),"\n"]}),"\n",(0,s.jsxs)(e.li,{children:["\n",(0,s.jsx)(e.p,{children:"\u5185\u7f51\u7684Windows\u8ba4\u8bc1\u6548\u679c\u3002\u636e\u8bf4Waffle\u53ef\u4ee5\u5b9e\u73b0\uff0c\u4f46\u662f\u8d44\u6599\u4e0d\u591a\uff0c\u800c\u4e14\u636e\u8bf4\u8981\u5fc5\u987b\u5b89\u88c5\u5728Windows\u4e2d\uff0c\u5b9e\u9645\u60c5\u51b5\u6211\u4e0d\u4e86\u89e3\u3002\u6211\u7684\u89e3\u51b3\u65b9\u6848\u66f4\u7b80\u5355\uff0c\u5c31\u662f\u76f4\u63a5\u7528.Net\u505a\uff0cIIS\u8bbe\u7f6e\u6210Windows \u8ba4\u8bc1\u3002\u8ba4\u8bc1\u540e\u8c03\u7528\u6211\u672c\u8eab\u7684\u7528\u6237\u670d\u52a1\uff08\u8fd9\u4e2a\u670d\u52a1\u9700\u8981\u670d\u52a1\u95f4\u8ba4\u8bc1\u624d\u80fd\u6267\u884c\uff0c\u5426\u5219\u6709\u5b89\u5168\u9690\u60a3\uff09\uff0c\u7531\u539f\u6709\u7684\u7528\u6237\u670d\u52a1\u751f\u6210Token\uff0c\u518d\u7531IIS\u670d\u52a1\u5668\u8fd4\u56deToken\u3002"}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(e.h2,{id:"\u5177\u4f53\u5e94\u7528\u8ba4\u8bc1\u8fc7\u7a0b\u5982\u4e0b\u56fe\u6240\u793a",children:"\u5177\u4f53\u5e94\u7528\u8ba4\u8bc1\u8fc7\u7a0b\u5982\u4e0b\u56fe\u6240\u793a"}),"\n",(0,s.jsx)(e.p,{children:(0,s.jsx)(e.img,{src:i(51313).Z+"",width:"665",height:"429"})}),"\n",(0,s.jsx)(e.p,{children:(0,s.jsx)(e.strong,{children:"\u6ce8\uff1a"})}),"\n",(0,s.jsxs)(e.ol,{children:["\n",(0,s.jsxs)(e.li,{children:["\n",(0,s.jsx)(e.p,{children:"\u5982\u679c\u7b2c\u4e00\u6b21\u8bf7\u6c42\u8fd4\u56de404\uff0c\u8bf4\u660e\u7528\u6237\u4e0d\u5728\u516c\u53f8\u57df\u5185\uff0c\u76f4\u63a5\u8f6c\u5411\u7cfb\u7edf\u539f\u6709\u767b\u5f55\u754c\u9762\u5373\u53ef\u3002"}),"\n"]}),"\n",(0,s.jsxs)(e.li,{children:["\n",(0,s.jsx)(e.p,{children:"\u6d4f\u89c8\u5668\u8bf7\u6c42IIS\u83b7\u53d6Token\u5fc5\u987b\u91c7\u7528JSONP\u7684Get\u65b9\u6cd5\u5b9e\u73b0\uff0c\u5426\u5219\u53d6\u4e0d\u5230\u3002"}),"\n",(0,s.jsxs)(e.ul,{children:["\n",(0,s.jsxs)(e.li,{children:["\u539f\u7406\uff1a\u666e\u901aAjax\u662f\u57fa\u4e8e",(0,s.jsx)(e.code,{children:"XmlHttpRequest"}),"\u7684\uff0c\u53ea\u4f1a\u8fd4\u56de\u65e0\u6743\u9650\uff0c\u4e0d\u4f1a\u5f39\u51faWindows\u767b\u9646\u7a97\u53e3\u3002JSONP\u672c\u8d28\u662f\u8d44\u6e90\u8bbf\u95ee\u65b9\u5f0f\uff0c\u7c7b\u4f3c\u4e8e\u4e0b\u8f7d\u4e00\u4e2a\u9759\u6001\u8d44\u6e90\uff0c\u6240\u4ee5IIS\u5f53\u4f5c\u8d44\u6e90\u8bbf\u95ee\u5904\u7406\uff0c\u4f1a\u5f39\u51faWindows\u767b\u9646\u7a97\u53e3\u3002"]}),"\n"]}),"\n"]}),"\n"]})]})}function u(n={}){const{wrapper:e}={...(0,t.ah)(),...n.components};return e?(0,s.jsx)(e,{...n,children:(0,s.jsx)(h,{...n})}):h(n)}},51313:(n,e,i)=>{i.d(e,{Z:()=>s});const s=i.p+"assets/images/1-a1eb6f58be47b2cf9294cc17124c46a8.png"},11151:(n,e,i)=>{i.d(e,{ah:()=>r});var s=i(67294);const t=s.createContext({});function r(n){const e=s.useContext(t);return s.useMemo((()=>"function"==typeof n?n(e):{...e,...n}),[e,n])}}}]);