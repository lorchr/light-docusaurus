"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[27808],{33196:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>o,contentTitle:()=>i,default:()=>d,frontMatter:()=>r,metadata:()=>h,toc:()=>A});var s=t(74848),c=t(28453);const r={},i=void 0,h={id:"zh-cn/spring-authorization-server/SAS-Vue-Authorization-Code",title:"SAS-Vue-Authorization-Code",description:"- Spring Authorization Server\u5165\u95e8 (\u5341\u4e03) Vue\u9879\u76ee\u4f7f\u7528\u6388\u6743\u7801\u6a21\u5f0f\u5bf9\u63a5\u8ba4\u8bc1\u670d\u52a1",source:"@site/docs/zh-cn/spring-authorization-server/17-SAS-Vue-Authorization-Code.md",sourceDirName:"zh-cn/spring-authorization-server",slug:"/zh-cn/spring-authorization-server/SAS-Vue-Authorization-Code",permalink:"/light-docusaurus/docs/zh-cn/spring-authorization-server/SAS-Vue-Authorization-Code",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/spring-authorization-server/17-SAS-Vue-Authorization-Code.md",tags:[],version:"current",sidebarPosition:17,frontMatter:{},sidebar:"troch",previous:{title:"SAS-Spring-Cloud-Gateway",permalink:"/light-docusaurus/docs/zh-cn/spring-authorization-server/SAS-Spring-Cloud-Gateway"},next:{title:"SAS-Vue-PKCE",permalink:"/light-docusaurus/docs/zh-cn/spring-authorization-server/SAS-Vue-PKCE"}},o={},A=[{value:"\u4e00\u3001Vue\u5355\u9875\u9762\u9879\u76ee\u4f7f\u7528\u6388\u6743\u7801\u6a21\u5f0f\u5bf9\u63a5\u6d41\u7a0b\u8bf4\u660e",id:"\u4e00vue\u5355\u9875\u9762\u9879\u76ee\u4f7f\u7528\u6388\u6743\u7801\u6a21\u5f0f\u5bf9\u63a5\u6d41\u7a0b\u8bf4\u660e",level:2},{value:"\u4e8c\u3001Vue\u9879\u76ee\u4e2d\u4fee\u6539\u5185\u5bb9",id:"\u4e8cvue\u9879\u76ee\u4e2d\u4fee\u6539\u5185\u5bb9",level:2},{value:"1. \u5b89\u88c5<code>crypto-js</code>\u4f9d\u8d56",id:"1-\u5b89\u88c5crypto-js\u4f9d\u8d56",level:3},{value:"2. TypeScript\u4e0b\u989d\u5916\u6dfb\u52a0<code>@types/crypto-js</code>\u4f9d\u8d56",id:"2-typescript\u4e0b\u989d\u5916\u6dfb\u52a0typescrypto-js\u4f9d\u8d56",level:3},{value:"3. \u7f16\u5199\u516c\u5171\u65b9\u6cd5",id:"3-\u7f16\u5199\u516c\u5171\u65b9\u6cd5",level:3},{value:"1. \u751f\u6210\u968f\u673a\u5b57\u7b26\u4e32",id:"1-\u751f\u6210\u968f\u673a\u5b57\u7b26\u4e32",level:4},{value:"2. \u7f16\u5199base64\u52a0\u5bc6\u65b9\u6cd5",id:"2-\u7f16\u5199base64\u52a0\u5bc6\u65b9\u6cd5",level:4},{value:"3. \u7f16\u5199\u83b7\u53d6\u5730\u5740\u680f\u53c2\u6570\u65b9\u6cd5",id:"3-\u7f16\u5199\u83b7\u53d6\u5730\u5740\u680f\u53c2\u6570\u65b9\u6cd5",level:4},{value:"4. \u7f16\u5199\u8bf7\u6c42Token\u65b9\u6cd5",id:"4-\u7f16\u5199\u8bf7\u6c42token\u65b9\u6cd5",level:4},{value:"5. \u5728\u73af\u5883\u53d8\u91cf\u914d\u7f6e\u6587\u4ef6\u4e2d\u6dfb\u52a0\u914d\u7f6e",id:"5-\u5728\u73af\u5883\u53d8\u91cf\u914d\u7f6e\u6587\u4ef6\u4e2d\u6dfb\u52a0\u914d\u7f6e",level:4},{value:"4. \u521b\u5efa\u5904\u7406\u56de\u8c03\u7684\u9875\u9762<code>OAuthRedirect.vue</code>",id:"4-\u521b\u5efa\u5904\u7406\u56de\u8c03\u7684\u9875\u9762oauthredirectvue",level:3},{value:"1. \u6211\u8fd9\u91cc\u662f\u5c06\u83b7\u53d6\u5230\u7684token\u76f4\u63a5\u5b58\u50a8\u5728<code>localStorage</code>\u4e2d\u4e86\uff0c\u5982\u679c\u6709\u9700\u8981\u4e5f\u53ef\u4ee5\u66f4\u6362\u5b58\u50a8\u4f4d\u7f6e\u3001\u5b58\u50a8\u683c\u5f0f\u7b49",id:"1-\u6211\u8fd9\u91cc\u662f\u5c06\u83b7\u53d6\u5230\u7684token\u76f4\u63a5\u5b58\u50a8\u5728localstorage\u4e2d\u4e86\u5982\u679c\u6709\u9700\u8981\u4e5f\u53ef\u4ee5\u66f4\u6362\u5b58\u50a8\u4f4d\u7f6e\u5b58\u50a8\u683c\u5f0f\u7b49",level:4},{value:"2. \u6dfb\u52a0\u8def\u7531",id:"2-\u6dfb\u52a0\u8def\u7531",level:4},{value:"\u4e09\u3001\u8ba4\u8bc1\u670d\u52a1\u4fee\u6539\u5185\u5bb9",id:"\u4e09\u8ba4\u8bc1\u670d\u52a1\u4fee\u6539\u5185\u5bb9",level:2},{value:"1. \u5728\u6570\u636e\u5e93\u4e2d\u6dfb\u52a0\u5bf9\u5e94\u5ba2\u6237\u7aef\u7684\u56de\u8c03\u5730\u5740",id:"1-\u5728\u6570\u636e\u5e93\u4e2d\u6dfb\u52a0\u5bf9\u5e94\u5ba2\u6237\u7aef\u7684\u56de\u8c03\u5730\u5740",level:3},{value:"\u56db\u3001\u6d4b\u8bd5",id:"\u56db\u6d4b\u8bd5",level:2},{value:"\u4e94\u3001\u6700\u540e",id:"\u4e94\u6700\u540e",level:2},{value:"\u516d\u3001\u9644\u5f55",id:"\u516d\u9644\u5f55",level:2}];function a(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,c.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://juejin.cn/post/7279052777888890921",children:"Spring Authorization Server\u5165\u95e8 (\u5341\u4e03) Vue\u9879\u76ee\u4f7f\u7528\u6388\u6743\u7801\u6a21\u5f0f\u5bf9\u63a5\u8ba4\u8bc1\u670d\u52a1"})}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"\u4e00vue\u5355\u9875\u9762\u9879\u76ee\u4f7f\u7528\u6388\u6743\u7801\u6a21\u5f0f\u5bf9\u63a5\u6d41\u7a0b\u8bf4\u660e",children:"\u4e00\u3001Vue\u5355\u9875\u9762\u9879\u76ee\u4f7f\u7528\u6388\u6743\u7801\u6a21\u5f0f\u5bf9\u63a5\u6d41\u7a0b\u8bf4\u660e"}),"\n",(0,s.jsx)(n.p,{children:"\u4ee5\u4e0b\u6d41\u7a0b\u6458\u6284\u81ea\u5b98\u7f51"}),"\n",(0,s.jsx)(n.p,{children:"\u5728\u672c\u4f8b\u4e2d\u4e3a\u6388\u6743\u4ee3\u7801\u6d41\u7a0b\u3002 \u6388\u6743\u7801\u6d41\u7a0b\u7684\u6b65\u9aa4\u5982\u4e0b\uff1a"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"\u5ba2\u6237\u7aef\u901a\u8fc7\u91cd\u5b9a\u5411\u5230\u6388\u6743\u7aef\u70b9\u6765\u53d1\u8d77 OAuth2 \u8bf7\u6c42\u3002"}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"\u5982\u679c\u7528\u6237\u672a\u901a\u8fc7\u8eab\u4efd\u9a8c\u8bc1\uff0c\u6388\u6743\u670d\u52a1\u5668\u5c06\u91cd\u5b9a\u5411\u5230\u767b\u5f55\u9875\u9762\u3002 \u8eab\u4efd\u9a8c\u8bc1\u540e\uff0c\u7528\u6237\u5c06\u518d\u6b21\u91cd\u5b9a\u5411\u56de\u6388\u6743\u7aef\u70b9\u3002"}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsx)(n.p,{children:"\u5982\u679c\u7528\u6237\u672a\u540c\u610f\u6240\u8bf7\u6c42\u7684\u8303\u56f4\u5e76\u4e14\u9700\u8981\u540c\u610f\uff0c\u5219\u4f1a\u663e\u793a\u540c\u610f\u9875\u9762\u3002"}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["\u4e00\u65e6\u7528\u6237\u540c\u610f\uff0c\u6388\u6743\u670d\u52a1\u5668\u4f1a\u751f\u6210\u4e00\u4e2a",(0,s.jsx)(n.code,{children:"authorization_code"}),"\u5e76\u901a\u8fc7",(0,s.jsx)(n.code,{children:"redirect_uri"}),"\u91cd\u5b9a\u5411\u56de\u5ba2\u6237\u7aef\u3002"]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["\u5ba2\u6237\u7aef\u901a\u8fc7\u67e5\u8be2\u53c2\u6570\u83b7\u53d6",(0,s.jsx)(n.code,{children:"authorization_code"}),"\u5e76\u5411",(0,s.jsx)(n.a,{href:"https://docs.spring.io/spring-authorization-server/docs/current/reference/html/protocol-endpoints.html#oauth2-token-endpoint",children:"Token Endpoint"}),"\u53d1\u8d77\u8bf7\u6c42\u3002"]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h2,{id:"\u4e8cvue\u9879\u76ee\u4e2d\u4fee\u6539\u5185\u5bb9",children:"\u4e8c\u3001Vue\u9879\u76ee\u4e2d\u4fee\u6539\u5185\u5bb9"}),"\n",(0,s.jsxs)(n.h3,{id:"1-\u5b89\u88c5crypto-js\u4f9d\u8d56",children:["1. \u5b89\u88c5",(0,s.jsx)(n.code,{children:"crypto-js"}),"\u4f9d\u8d56"]}),"\n",(0,s.jsxs)(n.p,{children:["\u5df2\u5b89\u88c5\u53ef\u4ee5\u5ffd\u7565\uff0c\u8be5\u4f9d\u8d56\u662f\u4e3a\u4e86\u8ba1\u7b97",(0,s.jsx)(n.code,{children:"Code Challenge"}),"\u548c",(0,s.jsx)(n.code,{children:"base64"}),"\u52a0\u5bc6\u4f7f\u7528"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-shell",children:"npm install crypto-js\n"})}),"\n",(0,s.jsxs)(n.h3,{id:"2-typescript\u4e0b\u989d\u5916\u6dfb\u52a0typescrypto-js\u4f9d\u8d56",children:["2. TypeScript\u4e0b\u989d\u5916\u6dfb\u52a0",(0,s.jsx)(n.code,{children:"@types/crypto-js"}),"\u4f9d\u8d56"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-shell",children:"npm install @types/crypto-js\n"})}),"\n",(0,s.jsx)(n.h3,{id:"3-\u7f16\u5199\u516c\u5171\u65b9\u6cd5",children:"3. \u7f16\u5199\u516c\u5171\u65b9\u6cd5"}),"\n",(0,s.jsx)(n.h4,{id:"1-\u751f\u6210\u968f\u673a\u5b57\u7b26\u4e32",children:"1. \u751f\u6210\u968f\u673a\u5b57\u7b26\u4e32"}),"\n",(0,s.jsx)(n.p,{children:"generateCodeVerifier \u51fd\u6570\u4e3b\u8981\u662f\u4e3a\u4e86\u7ed9PKCE\u6d41\u7a0b\u4f7f\u7528\uff0c\u4e0b\u7bc7\u6587\u7ae0\u4e2d\u4f1a\u8bf4\u660e\uff0c\u8fd9\u91cc\u501f\u7528\u4e00\u4e0b\u751f\u6210state\uff0c\u56e0\u4e3a\u672c\u8d28\u4e0a\u662f\u751f\u6210\u968f\u673a\u5b57\u7b26\u4e32"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"/**\n * \u751f\u6210 CodeVerifier\n *\n * return CodeVerifier\n */\nexport function generateCodeVerifier() {\n    return generateRandomString(32)\n}\n\n/**\n * \u751f\u6210\u968f\u673a\u5b57\u7b26\u4e32\n * @param length \u968f\u673a\u5b57\u7b26\u4e32\u7684\u957f\u5ea6\n * @returns \u968f\u673a\u5b57\u7b26\u4e32\n */\nexport function generateRandomString(length: number) {\n    let text = ''\n    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'\n    for (let i = 0; i < length; i++) {\n        text += possible.charAt(Math.floor(Math.random() * possible.length))\n    }\n    return text\n}\n"})}),"\n",(0,s.jsx)(n.h4,{id:"2-\u7f16\u5199base64\u52a0\u5bc6\u65b9\u6cd5",children:"2. \u7f16\u5199base64\u52a0\u5bc6\u65b9\u6cd5"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"/**\n * \u5c06\u5b57\u7b26\u4e32\u52a0\u5bc6\u4e3aBase64\u683c\u5f0f\u7684\n * @param str \u5c06\u8981\u8f6c\u4e3abase64\u7684\u5b57\u7b26\u4e32\n * @returns \u8fd4\u56debase64\u683c\u5f0f\u7684\u5b57\u7b26\u4e32\n */\nexport function base64Str(str: string) {\n    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));\n}\n"})}),"\n",(0,s.jsx)(n.h4,{id:"3-\u7f16\u5199\u83b7\u53d6\u5730\u5740\u680f\u53c2\u6570\u65b9\u6cd5",children:"3. \u7f16\u5199\u83b7\u53d6\u5730\u5740\u680f\u53c2\u6570\u65b9\u6cd5"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"/**\n * \u6839\u636e\u53c2\u6570name\u83b7\u53d6\u5730\u5740\u680f\u7684\u53c2\u6570\n * @param name \u5730\u5740\u680f\u53c2\u6570\u7684key\n * @returns key\u5bf9\u7528\u7684\u503c\n */\nexport function getQueryString(name: string) {\n    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')\n\n    const r = window.location.search.substr(1).match(reg)\n\n    if (r != null) {\n        return decodeURIComponent(r[2])\n    }\n\n    return null\n}\n"})}),"\n",(0,s.jsx)(n.h4,{id:"4-\u7f16\u5199\u8bf7\u6c42token\u65b9\u6cd5",children:"4. \u7f16\u5199\u8bf7\u6c42Token\u65b9\u6cd5"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"/**\n * \u4ece\u8ba4\u8bc1\u670d\u52a1\u83b7\u53d6AccessToken\n * @param data \u83b7\u53d6token\u5165\u53c2\n * @returns \u8fd4\u56deAccessToken\u5bf9\u8c61\n */\nexport function getToken(data: any) {\n    const headers: any = {\n        'Content-Type': 'application/x-www-form-urlencoded'\n    }\n    // \u8fd9\u91cc\u8fd9\u4e48\u5199\u662f\u4e3a\u4e86\u517c\u5bb9PKCE\u4e0e\u6388\u6743\u7801\u6a21\u5f0f\n    if (data.client_secret) {\n        // \u8bbe\u7f6e\u5ba2\u6237\u7aef\u7684basic\u8ba4\u8bc1\n        headers.Authorization = `Basic ${base64Str(`${data.client_id}:${data.client_secret}`)}`\n        // \u79fb\u9664\u5165\u53c2\u4e2d\u7684key\n        delete data.client_id\n        delete data.client_secret\n    }\n    // \u53ef\u4ee5\u8bbe\u7f6e\u4e3aAccessToken\u7684\u7c7b\u578b\n    return loginRequest.post<any>({\n        url: '/oauth2/token',\n        data,\n        headers\n    })\n}\n"})}),"\n",(0,s.jsx)(n.h4,{id:"5-\u5728\u73af\u5883\u53d8\u91cf\u914d\u7f6e\u6587\u4ef6\u4e2d\u6dfb\u52a0\u914d\u7f6e",children:"5. \u5728\u73af\u5883\u53d8\u91cf\u914d\u7f6e\u6587\u4ef6\u4e2d\u6dfb\u52a0\u914d\u7f6e"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"# \u8ba4\u8bc1\u670d\u52a1\u5730\u5740(token\u7b7e\u53d1\u5730\u5740)\nVITE_OAUTH_ISSUER=http://127.0.0.1:8080\n# \u6388\u6743\u7801\u6d41\u7a0b\u4f7f\u7528\u7684\u5ba2\u6237\u7aefId\nVITE_OAUTH_CLIENT_ID=messaging-client\n# \u6388\u6743\u7801\u6d41\u7a0b\u4f7f\u7528\u7684\u5ba2\u6237\u7aef\u79d8\u94a5\nVITE_OAUTH_CLIENT_SECRET=123456\n# \u6388\u6743\u7801\u6a21\u5f0f\u4f7f\u7528\u7684\u56de\u8c03\u5730\u5740\nVITE_OAUTH_REDIRECT_URI=http://127.0.0.1:5173/OAuth2Redirect\n"})}),"\n",(0,s.jsxs)(n.h3,{id:"4-\u521b\u5efa\u5904\u7406\u56de\u8c03\u7684\u9875\u9762oauthredirectvue",children:["4. \u521b\u5efa\u5904\u7406\u56de\u8c03\u7684\u9875\u9762",(0,s.jsx)(n.code,{children:"OAuthRedirect.vue"})]}),"\n",(0,s.jsx)(n.p,{children:"\u9875\u9762\u52a0\u8f7d\u65f6\u4f1a\u5c1d\u8bd5\u4ece\u5730\u5740\u680f\u83b7\u53d6\u53c2\u6570code\uff0c\u5982\u679c\u80fd\u83b7\u53d6\u5230\u8bf4\u660e\u662f\u4ece\u8ba4\u8bc1\u670d\u52a1\u56de\u8c03\u8fc7\u6765\u7684\uff0c\u6267\u884c\u6362\u53d6token\u6d41\u7a0b\uff0c\u5982\u679c\u6ca1\u6709\u83b7\u53d6\u5230code\u8bf4\u660e\u9700\u8981\u53d1\u8d77\u6388\u6743\u7533\u8bf7\u3002"}),"\n",(0,s.jsxs)(n.h4,{id:"1-\u6211\u8fd9\u91cc\u662f\u5c06\u83b7\u53d6\u5230\u7684token\u76f4\u63a5\u5b58\u50a8\u5728localstorage\u4e2d\u4e86\u5982\u679c\u6709\u9700\u8981\u4e5f\u53ef\u4ee5\u66f4\u6362\u5b58\u50a8\u4f4d\u7f6e\u5b58\u50a8\u683c\u5f0f\u7b49",children:["1. \u6211\u8fd9\u91cc\u662f\u5c06\u83b7\u53d6\u5230\u7684token\u76f4\u63a5\u5b58\u50a8\u5728",(0,s.jsx)(n.code,{children:"localStorage"}),"\u4e2d\u4e86\uff0c\u5982\u679c\u6709\u9700\u8981\u4e5f\u53ef\u4ee5\u66f4\u6362\u5b58\u50a8\u4f4d\u7f6e\u3001\u5b58\u50a8\u683c\u5f0f\u7b49"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"<script setup lang=\"ts\">\nimport router from '../../router'\nimport { getToken } from '@/api/Login'\nimport { createDiscreteApi } from 'naive-ui'\nimport { generateCodeVerifier } from '@/util/pkce'\nimport { getQueryString } from '@/util/GlobalUtils'\n\nconst { message } = createDiscreteApi(['message'])\n\n// \u751f\u6210state\nlet state: string = generateCodeVerifier()\n\n// \u83b7\u53d6\u5730\u5740\u680f\u6388\u6743\u7801\nconst code = getQueryString('code')\n\nif (code) {\n  // \u4ece\u7f13\u5b58\u4e2d\u83b7\u53d6 codeVerifier\n  const state = localStorage.getItem('state')\n  // \u6821\u9a8cstate\uff0c\u9632\u6b62cors\n  const urlState = getQueryString('state')\n  if (urlState !== state) {\n    message.warning('state\u6821\u9a8c\u5931\u8d25.')\n  } else {\n    // \u4ece\u7f13\u5b58\u4e2d\u83b7\u53d6 codeVerifier\n    getToken({\n      grant_type: 'authorization_code',\n      client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,\n      client_secret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,\n      redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,\n      code,\n      state\n    })\n      .then((res: any) => {\n        localStorage.setItem('accessToken', JSON.stringify(res))\n        router.push({ path: '/' })\n      })\n      .catch((e) => {\n        message.warning(`\u8bf7\u6c42token\u5931\u8d25\uff1a${e.data.error || e.message || e.statusText}`)\n      })\n  }\n} else {\n  // \u7f13\u5b58state\n  localStorage.setItem('state', state)\n  window.location.href = `${import.meta.env.VITE_OAUTH_ISSUER}/oauth2/authorize?client_id=${\n    import.meta.env.VITE_OAUTH_CLIENT_ID\n  }&response_type=code&scope=openid%20profile%20message.read%20message.write&redirect_uri=${\n    import.meta.env.VITE_OAUTH_REDIRECT_URI\n  }&state=${state}`\n}\n<\/script>\n<template>\u52a0\u8f7d\u4e2d...</template>\n"})}),"\n",(0,s.jsx)(n.h4,{id:"2-\u6dfb\u52a0\u8def\u7531",children:"2. \u6dfb\u52a0\u8def\u7531"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"{\n    path: '/OAuth2Redirect',\n    name: 'OAuth2Redirect',\n    component: () => import('../views/login/OAuthRedirect.vue')\n}\n"})}),"\n",(0,s.jsx)(n.h2,{id:"\u4e09\u8ba4\u8bc1\u670d\u52a1\u4fee\u6539\u5185\u5bb9",children:"\u4e09\u3001\u8ba4\u8bc1\u670d\u52a1\u4fee\u6539\u5185\u5bb9"}),"\n",(0,s.jsx)(n.h3,{id:"1-\u5728\u6570\u636e\u5e93\u4e2d\u6dfb\u52a0\u5bf9\u5e94\u5ba2\u6237\u7aef\u7684\u56de\u8c03\u5730\u5740",children:"1. \u5728\u6570\u636e\u5e93\u4e2d\u6dfb\u52a0\u5bf9\u5e94\u5ba2\u6237\u7aef\u7684\u56de\u8c03\u5730\u5740"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsxs)(n.li,{children:["\u91cd\u8981\uff1a\u4f8b\u5982\u6587\u4e2d\u7684\u5c31\u9700\u8981\u7ed9\u5ba2\u6237\u7aefmessaging-client\u6dfb\u52a0\u4e00\u4e2a\u56de\u8c03\u5730\u5740",(0,s.jsx)(n.a,{href:"http://127.0.0.1:5173/OAuth2Redirect",children:"http://127.0.0.1:5173/OAuth2Redirect"})]}),"\n",(0,s.jsxs)(n.li,{children:["\u91cd\u8981\uff1a\u4f8b\u5982\u6587\u4e2d\u7684\u5c31\u9700\u8981\u7ed9\u5ba2\u6237\u7aefmessaging-client\u6dfb\u52a0\u4e00\u4e2a\u56de\u8c03\u5730\u5740",(0,s.jsx)(n.a,{href:"http://127.0.0.1:5173/OAuth2Redirect",children:"http://127.0.0.1:5173/OAuth2Redirect"})]}),"\n",(0,s.jsxs)(n.li,{children:["\u91cd\u8981\uff1a\u4f8b\u5982\u6587\u4e2d\u7684\u5c31\u9700\u8981\u7ed9\u5ba2\u6237\u7aefmessaging-client\u6dfb\u52a0\u4e00\u4e2a\u56de\u8c03\u5730\u5740",(0,s.jsx)(n.a,{href:"http://127.0.0.1:5173/OAuth2Redirect",children:"http://127.0.0.1:5173/OAuth2Redirect"})]}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"\u7ecf\u8fc7\u4ee5\u4e0a\u914d\u7f6e\u6388\u6743\u7801\u6a21\u5f0f\u7684\u5bf9\u63a5\u5c31\u5b8c\u6210\u4e86\uff0c\u63a5\u4e0b\u6765\u5c31\u53ef\u4ee5\u6d4b\u8bd5\u4e86\uff0c\u5728\u9996\u9875\u6216\u8005\u9700\u8981\u89e6\u53d1\u767b\u5f55\u7684\u5730\u65b9\u6dfb\u52a0\u4e00\u4e2a\u6309\u94ae\uff0c\u70b9\u51fb\u8df3\u8f6c\u5230/OAuth2Redirect\u4e4b\u540e\u4f1a\u81ea\u52a8\u5f15\u5bfc\u53d1\u8d77\u6388\u6743\u7533\u8bf7\u6d41\u7a0b\u3002"}),"\n",(0,s.jsx)(n.h2,{id:"\u56db\u6d4b\u8bd5",children:"\u56db\u3001\u6d4b\u8bd5"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:t(2024).A+"",width:"1920",height:"935"})}),"\n",(0,s.jsx)(n.p,{children:"\u70b9\u51fb\u540e\u8df3\u8f6c\u81f3\u56de\u8c03\u9875\u9762"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:t(65695).A+"",width:"1920",height:"935"})}),"\n",(0,s.jsxs)(n.p,{children:["\u56de\u8c03\u9875\u9762\u53d1\u73b0\u5730\u5740\u680f\u6ca1\u6709",(0,s.jsx)(n.code,{children:"code"}),"\u5f15\u5bfc\u53d1\u8d77\u6388\u6743\u7533\u8bf7"]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:t(28046).A+"",width:"1916",height:"895"})}),"\n",(0,s.jsx)(n.p,{children:"\u8ba4\u8bc1\u670d\u52a1\u68c0\u6d4b\u5230\u6ca1\u6709\u767b\u5f55\uff0c\u8df3\u8f6c\u81f3\u767b\u5f55\u9875"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:t(83381).A+"",width:"1920",height:"935"})}),"\n",(0,s.jsx)(n.p,{children:"\u767b\u5f55\u6210\u529f\u540e\u53d1\u73b0\u9700\u8981\u6388\u6743\u786e\u8ba4\uff0c\u8df3\u8f6c\u81f3\u6388\u6743\u786e\u8ba4\u9875\u9762"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:t(19708).A+"",width:"1920",height:"938"})}),"\n",(0,s.jsxs)(n.p,{children:["\u6388\u6743\u6210\u529f\u540e\u643a\u5e26",(0,s.jsx)(n.code,{children:"token"}),"\u91cd\u5b9a\u5411\u81f3\u56de\u8c03\u5730\u5740\uff0c\u56de\u8c03\u9875\u6839\u636e",(0,s.jsx)(n.code,{children:"code"}),"\u6362\u53d6",(0,s.jsx)(n.code,{children:"token"}),"\uff0c\u83b7\u53d6",(0,s.jsx)(n.code,{children:"token"}),"\u6210\u529f\u540e\u5b58\u50a8\u5e76\u8fd4\u56de\u9996\u9875"]}),"\n",(0,s.jsx)(n.h2,{id:"\u4e94\u6700\u540e",children:"\u4e94\u3001\u6700\u540e"}),"\n",(0,s.jsx)(n.p,{children:"\u5b9e\u9645\u4e0a\u771f\u6b63\u5bf9\u63a5\u8981\u5199\u7684\u4ee3\u7801\u5e76\u4e0d\u591a\uff0c\u903b\u8f91\u4e5f\u4e0d\u590d\u6742\uff0c\u6211\u8fd9\u91cc\u5199\u7684\u6bd4\u8f83\u7b80\u5355\uff0c\u5e76\u4e14\u5ba2\u6237\u7aefid\u548c\u79d8\u94a5\u90fd\u662f\u653e\u5728\u524d\u7aef\u7684\uff0c\u8bfb\u8005\u53ef\u4ee5\u5b58\u653e\u5728\u4e00\u4e9b\u66f4\u5b89\u5168\u7684\u5730\u65b9\uff0c\u6216\u52a0\u5bc6\uff0c\u6216\u4ece\u540e\u7aef\u83b7\u53d6\u5bc6\u6587\u7b49\uff0c\u5982\u679c\u5927\u5bb6\u53d1\u73b0\u6709\u4ec0\u4e48\u95ee\u9898\u53ef\u4ee5\u5728\u8bc4\u8bba\u6307\u6b63\uff0c\u8c22\u8c22"}),"\n",(0,s.jsx)(n.h2,{id:"\u516d\u9644\u5f55",children:"\u516d\u3001\u9644\u5f55"}),"\n",(0,s.jsxs)(n.p,{children:["\u4ee3\u7801\u4ed3\u5e93\u5730\u5740\uff1a",(0,s.jsx)(n.a,{href:"https://gitee.com/vains-Sofia/authorization-example",children:"Gitee"})]})]})}function d(e={}){const{wrapper:n}={...(0,c.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},2024:(e,n,t)=>{t.d(n,{A:()=>s});const s=t.p+"assets/images/17-1-e95ec06faa17098c76ac463ceb344fd4.awebp"},65695:(e,n,t)=>{t.d(n,{A:()=>s});const s="data:;base64,UklGRpoSAABXRUJQVlA4II4SAADwmQGdASqAB6cDPpFGnk0lo6KiIDkoCLASCWlu/HyZ5evFwUArYWeA53zdLfUz8gD1x/Vc/0OTHrp74/F/7WkqnD9MHezKlOWfz/vQP7v0I+oGtXUA/zn6GH/N9wHtr+t/YS/XPrQekoAXogFfUdZNtgKsm2wFWTbYCrJtsBVk22AqybbAVZNtgKsm2wFWTbYCrJtsBVk22AqybbAVZNtgKsm2wFWTbYCrJtsBVk2y6e2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snH8RsBPOOFFaMDo4OtKB20qBZLteLk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfasU6jaXupO2VfEhAXFNWRsQEtvbuoBOpU15tza8XJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkR8RuTkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77Y4QASJMQASLECRAJxABJ/FPAjYCUIphnk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHrCmCUEmFMXbgBKFmTi4OEBmWfA7wcIq6AismnQiE+8cbyw4CFu2PO5TPiFlm10JgQy/xjRyEkWHKG2+E98YZF7owCg7Xi5OQ99snIe+2TkPfbJyHvtk5D32ych77ZOQ99snIe+2TkPfbJyHvtk5D32ycKdQdv4Q79MQAA/v8DOOuJepIAABwkgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAX9e54XQstz9iqW6uIh9GDksDTj/vPTpeEfwsX5B1Hi/9jEtx6aFJebY/xkfo71pj7RI9LMXCgAm3mh6WLBy8Uw0+xBUrjnihLpPVzfM96ICfGnweqBZC/uL7A8fyCcKIUAK0weW4r3QDhhsVfJzrOf7TK+/aOY5odaDyIDP1kDLceFc3DGU6H2OyBEaBemcFauVd+OvAV8USj7TDy1HGiqB6XYgoDJ1YjkQAACoV0KX4K+B0NJAuinzovt1tROuA/UVdynU1AIr5XwDGQ/rspJbvnmiPlzqbxdt+vpUrF9fwSXDMVPO+WKekTRbtcic0AmSqILC796p/1N3zsgiYmESJrCY68An78OJIR4Z3GfdzCOdPirExLO5+YSy5Vx6t/91T1Hawq4GrOI3eHFIk0v97r/wsjH6R1dhP8rchdCfPjpa0UilTPOQ9Z+ldebT+PYM7V0loujoZnem7B8uboZgvVISp2Xg2lUVpSgROVkN5hUIXmD5OxIrm5PZ2t56r+A9/Ez8R2vGVN/A2fZdxG/EiE/V2oo+peI7/k1NG8YqBX/YL4nh6t7tBYREHB8os/wBU655J+lugghIfz91ZRKIpYuHjrU4RVjaUZZVOxXL++PvX2OcFEWvZH0TVDO1rJb4NfPPHqF1z8h+9962H0I/6eP+6G6koV3H3+HvERUvwSf8PYSzZIIULjm3hd8cZtw2h5fBEvwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAECEieL6U699+BLB95VXM0Zxrft1LGtK7ZshdMt2+FbbMTlNviCN6/jtmK9juO5dnzbkT0fzH1MiUPjcEIiLF7z/G5d2cIYmVSD3chuHoooRiTDTHd2Jo2XXivYyjSoJclSqjAkSlmwL9f6mfhzvNl4JbhH4QgO9fqAAAVFXaeMGUmPmsfQcYh1SuDmat+E2Nv8HFei/N2dg7X5B+pdRPsxhEHmVfcFvbvVZoo+PB5U7vt88JDJB6seHXYiQ2h2w1QfdXbxcdmlBhCjB/oXQ8R0UYWegDAL0raOWG1swaOJioztrdHQwPa1o/ZTSUmAMUBf1UYH3GdxYytilkG93I6P/s7oKQ1lBeYtVyf0+dnDvKZhNmX7jYgfhaEWhLFW/zfZ6sBgSLOQBxeDTakq7+HylFvkSruij28NIVc2C43lne9rzujO4ahgGuSmbl0hFfSiXGB4tY7pSFwwqoi/4OjSPw2y7JTimVEc+9RObFvmgh8T6Th+9jOwN/nWWRbfzY2akn46sZdAYl4drHO3i/9robR2Zhe+NQg/dJUC7cGo4AceK+1FV7T4E5gc5yk1pNPmAsUATyajz2Q7+ooPtVk5XgSx2g+6qYf5GghQcf4+jXPAnRCwlyQlU5c6EE8gYwrSC6YQUedl+FT5LD9NtzUk7u/EY0wgGAMqHey2s+dP7EcooDLYzXO/A5myiHJKacmYt5C01OXAOCg4X4laQAvm0kfOparGVsm0eIoCtcdncOf9+l8CHi0MkSxt8ntz5NwaM9l21nOkQc4jFGd9E3XnGCFJM+9kC+VRNnY7VnJMBLrjuzlM03nhAOXy3VSXfVaADA4UtZ3NfJyyF4asgfTrgs/cnF2uusVIWgM7Dg6FDw1aN4Ixxx34BMH4AfQobDWUGv5pm6xHG6sjy+O3ZUHiN3ZnvESvdemKJ4lfUufQHhTjZMmOSegTd3Sp4HsNYZQa21BwxIvJuGF9KTrQ/7xReUtJJm6oPzuLAAAAAAAA"},28046:(e,n,t)=>{t.d(n,{A:()=>s});const s=t.p+"assets/images/17-3-caa82344a838677c11871fde6d53b394.awebp"},83381:(e,n,t)=>{t.d(n,{A:()=>s});const s=t.p+"assets/images/17-4-33ee88dbd5a8d544e48f424a39deef05.awebp"},19708:(e,n,t)=>{t.d(n,{A:()=>s});const s=t.p+"assets/images/17-5-91597aec32c7e798048977a2e186eb75.awebp"},28453:(e,n,t)=>{t.d(n,{R:()=>i,x:()=>h});var s=t(96540);const c={},r=s.createContext(c);function i(e){const n=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function h(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(c):e.components||c:i(e.components),s.createElement(r.Provider,{value:n},e.children)}}}]);