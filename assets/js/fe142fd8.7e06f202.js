"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[277],{3905:(e,t,n)=>{n.d(t,{Zo:()=>s,kt:()=>m});var a=n(67294);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var u=a.createContext({}),p=function(e){var t=a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},s=function(e){var t=p(e.components);return a.createElement(u.Provider,{value:t},e.children)},c="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},k=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,l=e.originalType,u=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),c=p(n),k=r,m=c["".concat(u,".").concat(k)]||c[k]||d[k]||l;return n?a.createElement(m,i(i({ref:t},s),{},{components:n})):a.createElement(m,i({ref:t},s))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var l=n.length,i=new Array(l);i[0]=k;var o={};for(var u in t)hasOwnProperty.call(t,u)&&(o[u]=t[u]);o.originalType=e,o[c]="string"==typeof e?e:r,i[1]=o;for(var p=2;p<l;p++)i[p]=n[p];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}k.displayName="MDXCreateElement"},74469:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>u,contentTitle:()=>i,default:()=>d,frontMatter:()=>l,metadata:()=>o,toc:()=>p});var a=n(87462),r=(n(67294),n(3905));const l={},i=void 0,o={unversionedId:"redis/Risk-Control",id:"redis/Risk-Control",title:"Risk-Control",description:"- \u5199\u4e00\u4e2a\u7b80\u5355\u7684\u98ce\u63a7",source:"@site/middleware/redis/Risk-Control.md",sourceDirName:"redis",slug:"/redis/Risk-Control",permalink:"/light-docusaurus/middleware/redis/Risk-Control",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/middleware/redis/Risk-Control.md",tags:[],version:"current",lastUpdatedBy:"liuhui",lastUpdatedAt:1698312433,formattedLastUpdatedAt:"2023\u5e7410\u670826\u65e5",frontMatter:{},sidebar:"middleware",previous:{title:"RedisConfigBean",permalink:"/light-docusaurus/middleware/redis/RedisConfigBean"},next:{title:"Spring-Boot-RateLimit",permalink:"/light-docusaurus/middleware/redis/Spring-Boot-RateLimit"}},u={},p=[{value:"\u4e00\u3001\u80cc\u666f",id:"\u4e00\u80cc\u666f",level:2},{value:"1. \u4e3a\u4ec0\u4e48\u8981\u505a\u98ce\u63a7?",id:"1-\u4e3a\u4ec0\u4e48\u8981\u505a\u98ce\u63a7",level:3},{value:"2. \u4e3a\u4ec0\u4e48\u8981\u81ea\u5df1\u5199\u98ce\u63a7?",id:"2-\u4e3a\u4ec0\u4e48\u8981\u81ea\u5df1\u5199\u98ce\u63a7",level:3},{value:"3. \u5176\u5b83\u8981\u6c42",id:"3-\u5176\u5b83\u8981\u6c42",level:3},{value:"\u4e8c\u3001\u601d\u8def",id:"\u4e8c\u601d\u8def",level:2},{value:"1. \u98ce\u63a7\u89c4\u5219\u7684\u5b9e\u73b0",id:"1-\u98ce\u63a7\u89c4\u5219\u7684\u5b9e\u73b0",level:3},{value:"2. \u8c03\u7528\u65b9\u5f0f\u7684\u5b9e\u73b0",id:"2-\u8c03\u7528\u65b9\u5f0f\u7684\u5b9e\u73b0",level:3},{value:"\u4e09\u3001\u5177\u4f53\u5b9e\u73b0",id:"\u4e09\u5177\u4f53\u5b9e\u73b0",level:2},{value:"1.\u98ce\u63a7\u8ba1\u6570\u89c4\u5219\u5b9e\u73b0",id:"1\u98ce\u63a7\u8ba1\u6570\u89c4\u5219\u5b9e\u73b0",level:3},{value:"2. \u6ce8\u89e3\u7684\u5b9e\u73b0",id:"2-\u6ce8\u89e3\u7684\u5b9e\u73b0",level:3},{value:"\u56db\u3001\u6d4b\u8bd5\u4e00\u4e0b",id:"\u56db\u6d4b\u8bd5\u4e00\u4e0b",level:2},{value:"1. \u5199\u6cd5",id:"1-\u5199\u6cd5",level:3},{value:"2. Debug\u770b\u770b",id:"2-debug\u770b\u770b",level:3}],s={toc:p},c="wrapper";function d(e){let{components:t,...n}=e;return(0,r.kt)(c,(0,a.Z)({},s,n,{components:t,mdxType:"MDXLayout"}),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://juejin.cn/post/7182774381448282172"},"\u5199\u4e00\u4e2a\u7b80\u5355\u7684\u98ce\u63a7")),(0,r.kt)("li",{parentName:"ul"},(0,r.kt)("a",{parentName:"li",href:"https://mp.weixin.qq.com/s/zcIiXJRBIdq_gTh8FDgYsg"},"\u98ce\u63a7\u7cfb\u7edf\u5c31\u8be5\u8fd9\u4e48\u8bbe\u8ba1\uff08\u4e07\u80fd\u901a\u7528\uff09\uff0c\u7a33\u7684\u4e00\u6279\uff01"))),(0,r.kt)("h2",{id:"\u4e00\u80cc\u666f"},"\u4e00\u3001\u80cc\u666f"),(0,r.kt)("h3",{id:"1-\u4e3a\u4ec0\u4e48\u8981\u505a\u98ce\u63a7"},"1. \u4e3a\u4ec0\u4e48\u8981\u505a\u98ce\u63a7?"),(0,r.kt)("p",null,"\u56fe\u7247\n\u8fd9\u4e0d\u5f97\u62dc\u4ea7\u54c1\u5927\u4f6c\u6240\u8d50"),(0,r.kt)("p",null,"\u76ee\u524d\u6211\u4eec\u4e1a\u52a1\u6709\u4f7f\u7528\u5230\u975e\u5e38\u591a\u7684AI\u80fd\u529b,\u5982ocr\u8bc6\u522b\u3001\u8bed\u97f3\u6d4b\u8bc4\u7b49,\u8fd9\u4e9b\u80fd\u529b\u5f80\u5f80\u90fd\u6bd4\u8f83\u8d39\u94b1\u6216\u8005\u8d39\u8d44\u6e90,\u6240\u4ee5\u5728\u4ea7\u54c1\u5c42\u9762\u4e5f\u5e0c\u671b\u6211\u4eec\u5bf9\u7528\u6237\u7684\u80fd\u529b\u4f7f\u7528\u6b21\u6570\u505a\u4e00\u5b9a\u7684\u9650\u5236,\u56e0\u6b64\u98ce\u63a7\u662f\u5fc5\u987b\u7684!"),(0,r.kt)("h3",{id:"2-\u4e3a\u4ec0\u4e48\u8981\u81ea\u5df1\u5199\u98ce\u63a7"},"2. \u4e3a\u4ec0\u4e48\u8981\u81ea\u5df1\u5199\u98ce\u63a7?"),(0,r.kt)("p",null,"\u90a3\u4e48\u591a\u5f00\u6e90\u7684\u98ce\u63a7\u7ec4\u4ef6,\u4e3a\u4ec0\u4e48\u8fd8\u8981\u5199\u5462?\u662f\u4e0d\u662f\u60f3\u91cd\u590d\u53d1\u660e\u8f6e\u5b50\u5440.\u56fe\u7247"),(0,r.kt)("p",null,"\u8981\u60f3\u56de\u7b54\u8fd9\u4e2a\u95ee\u9898,\u9700\u8981\u5148\u89e3\u91ca\u4e0b\u6211\u4eec\u4e1a\u52a1\u9700\u8981\u7528\u5230\u7684\u98ce\u63a7(\u7b80\u79f0\u4e1a\u52a1\u98ce\u63a7),\u4e0e\u5f00\u6e90\u5e38\u89c1\u7684\u98ce\u63a7(\u7b80\u79f0\u666e\u901a\u98ce\u63a7)\u6709\u4f55\u533a\u522b:"),(0,r.kt)("table",null,(0,r.kt)("thead",{parentName:"table"},(0,r.kt)("tr",{parentName:"thead"},(0,r.kt)("th",{parentName:"tr",align:null},"\u98ce\u63a7\u7cfb\u7edf"),(0,r.kt)("th",{parentName:"tr",align:null},"\u76ee\u7684"),(0,r.kt)("th",{parentName:"tr",align:null},"\u5bf9\u8c61"),(0,r.kt)("th",{parentName:"tr",align:null},"\u89c4\u5219"))),(0,r.kt)("tbody",{parentName:"table"},(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\u4e1a\u52a1\u98ce\u63a7"),(0,r.kt)("td",{parentName:"tr",align:null},"\u5b9e\u73b0\u4ea7\u54c1\u5b9a\u4e49\u7684\u4e00\u4e9b\u9650\u5236\uff0c\u8fbe\u5230\u9650\u5236\u662f\uff0c\u6709\u5177\u4f53\u7684\u4e1a\u52a1\u6d41\u7a0b\uff0c\u5982\u5145\u503cvip\u7b49"),(0,r.kt)("td",{parentName:"tr",align:null},"\u6bd4\u8f83\u590d\u6742\u591a\u53d8\u7684\uff0c\u4f8b\u5982\u9488\u5bf9\u7528\u6237\u8fdb\u884c\u98ce\u63a7\uff0c\u4e5f\u80fd\u9488\u5bf9\u7528\u6237+\u8fde\u63a5\u8fdb\u884c\u98ce\u63a7"),(0,r.kt)("td",{parentName:"tr",align:null},"\u81ea\u7136\u65e5\uff0c\u81ea\u7136\u5c0f\u65f6\u7b49")),(0,r.kt)("tr",{parentName:"tbody"},(0,r.kt)("td",{parentName:"tr",align:null},"\u666e\u901a\u98ce\u63a7"),(0,r.kt)("td",{parentName:"tr",align:null},"\u4fdd\u62a4\u670d\u52a1\u6216\u6570\u636e\uff0c\u62e6\u622a\u5f02\u5e38\u8bf7\u6c42"),(0,r.kt)("td",{parentName:"tr",align:null},"\u63a5\u53e3\u3001\u90e8\u5206\u52a0\u4e0a\u7b80\u5355\u7684\u53c2\u6570"),(0,r.kt)("td",{parentName:"tr",align:null},"\u4e00\u822c\u4f7f\u7528\u6ed1\u52a8\u65f6\u95f4\u7a97\u53e3")))),(0,r.kt)("p",null,"\u56e0\u6b64,\u76f4\u63a5\u4f7f\u7528\u5f00\u6e90\u7684\u666e\u901a\u98ce\u63a7,\u4e00\u822c\u60c5\u51b5\u4e0b\u662f\u65e0\u6cd5\u6ee1\u8db3\u9700\u6c42\u7684"),(0,r.kt)("h3",{id:"3-\u5176\u5b83\u8981\u6c42"},"3. \u5176\u5b83\u8981\u6c42"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"\u652f\u6301\u5b9e\u65f6\u8c03\u6574\u9650\u5236\n\u5f88\u591a\u9650\u5236\u503c\u5728\u9996\u6b21\u8bbe\u7f6e\u7684\u65f6\u5019,\u57fa\u672c\u4e0a\u90fd\u662f\u62cd\u5b9a\u7684\u4e00\u4e2a\u503c,\u540e\u7eed\u9700\u8981\u8c03\u6574\u7684\u53ef\u80fd\u6027\u662f\u6bd4\u8f83\u5927\u7684,\u56e0\u6b64\u53ef\u8c03\u6574\u5e76\u5b9e\u65f6\u751f\u6548\u662f\u5fc5\u987b\u7684")),(0,r.kt)("h2",{id:"\u4e8c\u601d\u8def"},"\u4e8c\u3001\u601d\u8def"),(0,r.kt)("p",null,"\u8981\u5b9e\u73b0\u4e00\u4e2a\u7b80\u5355\u7684\u4e1a\u52a1\u98ce\u63a7\u7ec4\u4ef6,\u8981\u505a\u4ec0\u4e48\u5de5\u4f5c\u5462?"),(0,r.kt)("h3",{id:"1-\u98ce\u63a7\u89c4\u5219\u7684\u5b9e\u73b0"},"1. \u98ce\u63a7\u89c4\u5219\u7684\u5b9e\u73b0"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"\u9700\u8981\u5b9e\u73b0\u7684\u89c4\u5219:")),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"\u81ea\u7136\u65e5\u8ba1\u6570"),(0,r.kt)("li",{parentName:"ul"},"\u81ea\u7136\u5c0f\u65f6\u8ba1\u6570"),(0,r.kt)("li",{parentName:"ul"},"\u81ea\u7136\u65e5+\u81ea\u7136\u5c0f\u65f6\u8ba1\u6570")),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"\u81ea\u7136\u65e5+\u81ea\u7136\u5c0f\u65f6\u8ba1\u6570 \u8fd9\u91cc\u5e76\u4e0d\u80fd\u5355\u7eaf\u5730\u4e32\u8054\u4e24\u4e2a\u5224\u65ad,\u56e0\u4e3a\u5982\u679c\u81ea\u7136\u65e5\u7684\u5224\u5b9a\u901a\u8fc7,\u800c\u81ea\u7136\u5c0f\u65f6\u7684\u5224\u5b9a\u4e0d\u901a\u8fc7\u7684\u65f6\u5019,\u9700\u8981\u56de\u9000,\u81ea\u7136\u65e5\u8ddf\u81ea\u7136\u5c0f\u65f6\u90fd\u4e0d\u80fd\u8ba1\u5165\u672c\u6b21\u8c03\u7528!")),(0,r.kt)("ol",{start:2},(0,r.kt)("li",{parentName:"ol"},"\u8ba1\u6570\u65b9\u5f0f\u7684\u9009\u62e9:")),(0,r.kt)("p",null,"\u76ee\u524d\u80fd\u60f3\u5230\u7684\u4f1a\u6709:"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"mysql+db\u4e8b\u52a1 ",(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},"\u6301\u4e45\u5316\u3001\u8bb0\u5f55\u53ef\u6eaf\u6e90\u3001\u5b9e\u73b0\u8d77\u6765\u6bd4\u8f83\u9ebb\u70e6,\u7a0d\u5fae\u201c\u91cd\u201d\u4e86\u4e00\u70b9"))),(0,r.kt)("li",{parentName:"ul"},"redis+lua ",(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},"\u5b9e\u73b0\u7b80\u5355,redis\u7684\u53ef\u6267\u884clua\u811a\u672c\u7684\u7279\u6027\u4e5f\u80fd\u6ee1\u8db3\u5bf9\u201c\u4e8b\u52a1\u201d\u7684\u8981\u6c42"))),(0,r.kt)("li",{parentName:"ul"},"mysql/redis+\u5206\u5e03\u5f0f\u4e8b\u52a1 ",(0,r.kt)("ul",{parentName:"li"},(0,r.kt)("li",{parentName:"ul"},"\u9700\u8981\u4e0a\u9501,\u5b9e\u73b0\u590d\u6742,\u80fd\u505a\u5230\u6bd4\u8f83\u7cbe\u786e\u7684\u8ba1\u6570,\u4e5f\u5c31\u662f\u771f\u6b63\u7b49\u5230\u4ee3\u7801\u5757\u6267\u884c\u6210\u529f\u4e4b\u540e,\u518d\u53bb\u64cd\u4f5c\u8ba1\u6570")))),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"\u76ee\u524d\u6ca1\u6709\u5f88\u7cbe\u786e\u6280\u672f\u7684\u8981\u6c42,\u4ee3\u4ef7\u592a\u5927,\u4e5f\u6ca1\u6709\u6301\u4e45\u5316\u7684\u9700\u6c42,\u56e0\u6b64\u9009\u7528 ",(0,r.kt)("inlineCode",{parentName:"p"},"redis+lua")," \u5373\u53ef")),(0,r.kt)("h3",{id:"2-\u8c03\u7528\u65b9\u5f0f\u7684\u5b9e\u73b0"},"2. \u8c03\u7528\u65b9\u5f0f\u7684\u5b9e\u73b0"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"\u5e38\u89c1\u7684\u505a\u6cd5 \u5148\u5b9a\u4e49\u4e00\u4e2a\u901a\u7528\u7684\u5165\u53e3")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-java"},"//\u7b80\u5316\u7248\u4ee3\u7801\n@Component\nclass DetectManager {\n    fun matchExceptionally(eventId: String, content: String){\n        //\u8c03\u7528\u89c4\u5219\u5339\u914d\n        val rt = ruleService.match(eventId,content)\n        if (!rt) {\n            throw BaseException(ErrorCode.OPERATION_TOO_FREQUENT)\n        }\n    }\n}\n")),(0,r.kt)("p",null,"\u5728service\u4e2d\u8c03\u7528\u8be5\u65b9\u6cd5"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-java"},'//\u7b80\u5316\u7248\u4ee3\u7801\n@Service\nclass OcrServiceImpl : OcrService {\n\n    @Autowired\n    private lateinit var detectManager: DetectManager\n    \n    /**\n     * \u63d0\u4ea4ocr\u4efb\u52a1\n     * \u9700\u8981\u6839\u636e\u7528\u6237id\u6765\u505a\u6b21\u6570\u9650\u5236\n     */\n    override fun submitOcrTask(userId: String, imageUrl: String): String {\n       detectManager.matchExceptionally("ocr", userId)\n       //do ocr\n    }\n    \n}\n')),(0,r.kt)("p",null,"\u6709\u6ca1\u6709\u66f4\u4f18\u96c5\u4e00\u70b9\u7684\u65b9\u6cd5\u5462? \u7528\u6ce8\u89e3\u53ef\u80fd\u4f1a\u66f4\u597d\u4e00\u70b9(\u4e5f\u6bd4\u8f83\u6709\u4e89\u8bae\u5176\u5b9e,\u8fd9\u8fb9\u5148\u652f\u6301\u5b9e\u73b0)"),(0,r.kt)("p",null,"\u7531\u4e8e\u4f20\u5165\u7684 content \u662f\u8ddf\u4e1a\u52a1\u5173\u8054\u7684,\u6240\u4ee5\u9700\u8981\u901a\u8fc7Spel\u6765\u5c06\u53c2\u6570\u6784\u6210\u5bf9\u5e94\u7684content"),(0,r.kt)("h2",{id:"\u4e09\u5177\u4f53\u5b9e\u73b0"},"\u4e09\u3001\u5177\u4f53\u5b9e\u73b0"),(0,r.kt)("h3",{id:"1\u98ce\u63a7\u8ba1\u6570\u89c4\u5219\u5b9e\u73b0"},"1.\u98ce\u63a7\u8ba1\u6570\u89c4\u5219\u5b9e\u73b0"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"\u81ea\u7136\u65e5/\u81ea\u7136\u5c0f\u65f6")),(0,r.kt)("p",null,"\u81ea\u7136\u65e5/\u81ea\u7136\u5c0f\u65f6\u53ef\u4ee5\u5171\u7528\u4e00\u5957lua\u811a\u672c,\u56e0\u4e3a\u5b83\u4eec\u53ea\u6709key\u4e0d\u540c,\u811a\u672c\u5982\u4e0b:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-lua"},"//lua\u811a\u672c\nlocal currentValue = redis.call('get', KEYS[1]);\nif currentValue ~= false then \n    if tonumber(currentValue) < tonumber(ARGV[1]) then \n        return redis.call('INCR', KEYS[1]);\n    else\n        return tonumber(currentValue) + 1;\n    end;\nelse\n   redis.call('set', KEYS[1], 1, 'px', ARGV[2]);\n   return 1;\nend;\n")),(0,r.kt)("p",null,"\u5176\u4e2d KEYS","[1]"," \u662f\u65e5/\u5c0f\u65f6\u5173\u8054\u7684key,ARGV","[1]","\u662f\u4e0a\u9650\u503c,ARGV","[2]","\u662f\u8fc7\u671f\u65f6\u95f4,\u8fd4\u56de\u503c\u5219\u662f\u5f53\u524d\u8ba1\u6570\u503c+1\u540e\u7684\u7ed3\u679c,(\u5982\u679c\u5df2\u7ecf\u8fbe\u5230\u4e0a\u9650,\u5219\u5b9e\u9645\u4e0a\u4e0d\u4f1a\u8ba1\u6570)"),(0,r.kt)("ol",{start:2},(0,r.kt)("li",{parentName:"ol"},"\u81ea\u7136\u65e5+\u81ea\u7136\u5c0f\u65f6")),(0,r.kt)("p",null,"\u5982\u524d\u6587\u63d0\u5230\u7684,\u4e24\u4e2a\u7684\u7ed3\u5408\u5b9e\u9645\u4e0a\u5e76\u4e0d\u662f\u5355\u7eaf\u7684\u62fc\u51d1,\u9700\u8981\u5904\u7406\u56de\u9000\u903b\u8f91"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-lua"},"//lua\u811a\u672c\nlocal dayValue = 0;\nlocal hourValue = 0;\nlocal dayPass = true;\nlocal hourPass = true;\nlocal dayCurrentValue = redis.call('get', KEYS[1]);\nif dayCurrentValue ~= false then \n    if tonumber(dayCurrentValue) < tonumber(ARGV[1]) then \n        dayValue = redis.call('INCR', KEYS[1]);\n    else\n        dayPass = false;\n        dayValue = tonumber(dayCurrentValue) + 1;\n    end;\nelse\n   redis.call('set', KEYS[1], 1, 'px', ARGV[3]);\n   dayValue = 1;\nend;\n\nlocal hourCurrentValue = redis.call('get', KEYS[2]);\nif hourCurrentValue ~= false then \n    if tonumber(hourCurrentValue) < tonumber(ARGV[2]) then \n        hourValue = redis.call('INCR', KEYS[2]);\n    else\n        hourPass = false;\n        hourValue = tonumber(hourCurrentValue) + 1;\n    end;\nelse\n   redis.call('set', KEYS[2], 1, 'px', ARGV[4]);\n   hourValue = 1;\nend;\n\nif (not dayPass) and hourPass then\n    hourValue = redis.call('DECR', KEYS[2]);\nend;\n\nif dayPass and (not hourPass) then\n    dayValue = redis.call('DECR', KEYS[1]);\nend;\n\nlocal pair = {};\npair[1] = dayValue;\npair[2] = hourValue;\nreturn pair;\n")),(0,r.kt)("p",null,"\u5176\u4e2d KEYS","[1]"," \u662f\u5929\u5173\u8054\u751f\u6210\u7684key, KEYS","[2]"," \u662f\u5c0f\u65f6\u5173\u8054\u751f\u6210\u7684key,ARGV","[1]","\u662f\u5929\u7684\u4e0a\u9650\u503c,ARGV","[2]","\u662f\u5c0f\u65f6\u7684\u4e0a\u9650\u503c,ARGV","[3]","\u662f\u5929\u7684\u8fc7\u671f\u65f6\u95f4,ARGV","[4]","\u662f\u5c0f\u65f6\u7684\u8fc7\u671f\u65f6\u95f4,\u8fd4\u56de\u503c\u540c\u4e0a"),(0,r.kt)("blockquote",null,(0,r.kt)("p",{parentName:"blockquote"},"\u8fd9\u91cc\u7ed9\u7684\u662f\u6bd4\u8f83\u7c97\u7cd9\u7684\u5199\u6cd5,\u4e3b\u8981\u9700\u8981\u8868\u8fbe\u7684\u5c31\u662f,\u8fdb\u884c\u4e24\u4e2a\u6761\u4ef6\u5224\u65ad\u65f6,\u6709\u5176\u4e2d\u4e00\u4e2a\u4e0d\u6ee1\u8db3,\u53e6\u4e00\u4e2a\u90fd\u9700\u8981\u8fdb\u884c\u56de\u9000.")),(0,r.kt)("h3",{id:"2-\u6ce8\u89e3\u7684\u5b9e\u73b0"},"2. \u6ce8\u89e3\u7684\u5b9e\u73b0"),(0,r.kt)("ol",null,(0,r.kt)("li",{parentName:"ol"},"\u5b9a\u4e49\u4e00\u4e2a@Detect\u6ce8\u89e3")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-java"},'@Retention(AnnotationRetention.RUNTIME)\n@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)\nannotation class Detect(\n\n    /**\n     * \u4e8b\u4ef6id\n     */\n    val eventId: String = "",\n\n    /**\n     * content\u7684\u8868\u8fbe\u5f0f\n     */\n    val contentSpel: String = ""\n\n)\n')),(0,r.kt)("p",null,"\u5176\u4e2dcontent\u662f\u9700\u8981\u7ecf\u8fc7\u8868\u8fbe\u5f0f\u89e3\u6790\u51fa\u6765\u7684,\u6240\u4ee5\u63a5\u53d7\u7684\u662f\u4e2aString"),(0,r.kt)("ol",{start:2},(0,r.kt)("li",{parentName:"ol"},"\u5b9a\u4e49@Detect\u6ce8\u89e3\u7684\u5904\u7406\u7c7b")),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-java"},'@Aspect\n@Component\nclass DetectHandler {\n\n    private val logger = LoggerFactory.getLogger(javaClass)\n\n    @Autowired\n    private lateinit var detectManager: DetectManager\n\n    @Resource(name = "detectSpelExpressionParser")\n    private lateinit var spelExpressionParser: SpelExpressionParser\n\n    @Bean(name = ["detectSpelExpressionParser"])\n    fun detectSpelExpressionParser(): SpelExpressionParser {\n        return SpelExpressionParser()\n    }\n\n    @Around(value = "@annotation(detect)")\n    fun operatorAnnotation(joinPoint: ProceedingJoinPoint, detect: Detect): Any? {\n        if (detect.eventId.isBlank() || detect.contentSpel.isBlank()){\n            throw illegalArgumentExp("@Detect config is not available!")\n        }\n        //\u8f6c\u6362\u8868\u8fbe\u5f0f\n        val expression = spelExpressionParser.parseExpression(detect.contentSpel)\n        val argMap = joinPoint.args.mapIndexed { index, any ->\n            "arg${index+1}" to any\n        }.toMap()\n        //\u6784\u5efa\u4e0a\u4e0b\u6587\n        val context = StandardEvaluationContext().apply {\n            if (argMap.isNotEmpty()) this.setVariables(argMap)\n        }\n        //\u62ff\u5230\u7ed3\u679c\n        val content = expression.getValue(context)\n\n        detectManager.matchExceptionally(detect.eventId, content)\n        return joinPoint.proceed()\n    }\n}\n')),(0,r.kt)("p",null,"\u9700\u8981\u5c06\u53c2\u6570\u653e\u5165\u5230\u4e0a\u4e0b\u6587\u4e2d,\u5e76\u8d77\u540d\u4e3aarg1\u3001arg2...."),(0,r.kt)("h2",{id:"\u56db\u6d4b\u8bd5\u4e00\u4e0b"},"\u56db\u3001\u6d4b\u8bd5\u4e00\u4e0b"),(0,r.kt)("h3",{id:"1-\u5199\u6cd5"},"1. \u5199\u6cd5"),(0,r.kt)("p",null,"\u4f7f\u7528\u6ce8\u89e3\u4e4b\u540e\u7684\u5199\u6cd5:"),(0,r.kt)("pre",null,(0,r.kt)("code",{parentName:"pre",className:"language-java"},'//\u7b80\u5316\u7248\u4ee3\u7801\n@Service\nclass OcrServiceImpl : OcrService {\n\n    @Autowired\n    private lateinit var detectManager: DetectManager\n    \n    /**\n     * \u63d0\u4ea4ocr\u4efb\u52a1\n     * \u9700\u8981\u6839\u636e\u7528\u6237id\u6765\u505a\u6b21\u6570\u9650\u5236\n     */\n    @Detect(eventId = "ocr", contentSpel = "#arg1")\n    override fun submitOcrTask(userId: String, imageUrl: String): String {\n       //do ocr\n    }\n    \n}\n')),(0,r.kt)("h3",{id:"2-debug\u770b\u770b"},"2. Debug\u770b\u770b"),(0,r.kt)("ul",null,(0,r.kt)("li",{parentName:"ul"},"\u6ce8\u89e3\u503c\u83b7\u53d6\u6210\u529f"),(0,r.kt)("li",{parentName:"ul"},"\u8868\u8fbe\u5f0f\u89e3\u6790\u6210\u529f")))}d.isMDXComponent=!0}}]);