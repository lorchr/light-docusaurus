"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[7922],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>d});var a=n(7294);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,l=function(e,t){if(null==e)return{};var n,a,l={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(l[n]=e[n]);return l}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(l[n]=e[n])}return l}var m=a.createContext({}),o=function(e){var t=a.useContext(m),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=o(e.components);return a.createElement(m.Provider,{value:t},e.children)},k="mdxType",s={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},N=a.forwardRef((function(e,t){var n=e.components,l=e.mdxType,r=e.originalType,m=e.parentName,u=p(e,["components","mdxType","originalType","parentName"]),k=o(n),N=l,d=k["".concat(m,".").concat(N)]||k[N]||s[N]||r;return n?a.createElement(d,i(i({ref:t},u),{},{components:n})):a.createElement(d,i({ref:t},u))}));function d(e,t){var n=arguments,l=t&&t.mdxType;if("string"==typeof e||l){var r=n.length,i=new Array(r);i[0]=N;var p={};for(var m in t)hasOwnProperty.call(t,m)&&(p[m]=t[m]);p.originalType=e,p[k]="string"==typeof e?e:l,i[1]=p;for(var o=2;o<r;o++)i[o]=n[o];return a.createElement.apply(null,i)}return a.createElement.apply(null,n)}N.displayName="MDXCreateElement"},1268:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>m,contentTitle:()=>i,default:()=>s,frontMatter:()=>r,metadata:()=>p,toc:()=>o});var a=n(7462),l=(n(7294),n(3905));const r={},i=void 0,p={unversionedId:"mysql/Mysql-Optimize",id:"mysql/Mysql-Optimize",title:"Mysql-Optimize",description:"- SELECT COUNT(*) \u4f1a\u9020\u6210\u5168\u8868\u626b\u63cf",source:"@site/middleware/mysql/Mysql-Optimize.md",sourceDirName:"mysql",slug:"/mysql/Mysql-Optimize",permalink:"/light-docusaurus/middleware/mysql/Mysql-Optimize",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/middleware/mysql/Mysql-Optimize.md",tags:[],version:"current",lastUpdatedBy:"liuhui",lastUpdatedAt:1697531923,formattedLastUpdatedAt:"2023\u5e7410\u670817\u65e5",frontMatter:{},sidebar:"middleware",previous:{title:"Mysql-Install-On-Windows",permalink:"/light-docusaurus/middleware/mysql/Mysql-Install-On-Windows"},next:{title:"Mysql-Store-Function-Procedure",permalink:"/light-docusaurus/middleware/mysql/Mysql-Store-Function-Procedure"}},m={},o=[{value:"\u524d\u8a00",id:"\u524d\u8a00",level:2},{value:"SQL \u9009\u7528\u7d22\u5f15\u7684\u6267\u884c\u6210\u672c\u5982\u4f55\u8ba1\u7b97",id:"sql-\u9009\u7528\u7d22\u5f15\u7684\u6267\u884c\u6210\u672c\u5982\u4f55\u8ba1\u7b97",level:2},{value:"\u5b9e\u4f8b\u8bf4\u660e",id:"\u5b9e\u4f8b\u8bf4\u660e",level:2},{value:"\u603b\u7ed3",id:"\u603b\u7ed3",level:2}],u={toc:o},k="wrapper";function s(e){let{components:t,...n}=e;return(0,l.kt)(k,(0,a.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("a",{parentName:"li",href:"https://mp.weixin.qq.com/s/b289PKFdEEIjn4cbgGGyzA"},"SELECT COUNT(*) \u4f1a\u9020\u6210\u5168\u8868\u626b\u63cf"))),(0,l.kt)("h2",{id:"\u524d\u8a00"},"\u524d\u8a00"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"SELECT COUNT(*)"),"\u4f1a\u4e0d\u4f1a\u5bfc\u81f4\u5168\u8868\u626b\u63cf\u5f15\u8d77\u6162\u67e5\u8be2\u5462\uff1f"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"SELECT COUNT(*) FROM SomeTable;\n")),(0,l.kt)("p",null,"\u7f51\u4e0a\u6709\u4e00\u79cd\u8bf4\u6cd5\uff0c\u9488\u5bf9\u65e0 ",(0,l.kt)("inlineCode",{parentName:"p"},"where_clause")," \u7684 ",(0,l.kt)("inlineCode",{parentName:"p"},"COUNT(*)"),"\uff0cMySQL \u662f\u6709\u4f18\u5316\u7684\uff0c\u4f18\u5316\u5668\u4f1a\u9009\u62e9\u6210\u672c\u6700\u5c0f\u7684\u8f85\u52a9\u7d22\u5f15\u67e5\u8be2\u8ba1\u6570\uff0c\u5176\u5b9e\u53cd\u800c\u6027\u80fd\u6700\u9ad8\uff0c\u8fd9\u79cd\u8bf4\u6cd5\u5bf9\u4e0d\u5bf9\u5462"),(0,l.kt)("p",null,"\u9488\u5bf9\u8fd9\u4e2a\u7591\u95ee\uff0c\u6211\u9996\u5148\u53bb\u751f\u4ea7\u4e0a\u627e\u4e86\u4e00\u4e2a\u5343\u4e07\u7ea7\u522b\u7684\u8868\u4f7f\u7528  EXPLAIN \u6765\u67e5\u8be2\u4e86\u4e00\u4e0b\u6267\u884c\u8ba1\u5212"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"EXPLAIN SELECT COUNT(*) FROM SomeTable;\n")),(0,l.kt)("p",null,"\u7ed3\u679c\u5982\u4e0b\n| key      | key_len | ref  | rows     | Extra       |\n| -------- | ------- | ---- | -------- | ----------- |\n| idx_name | 2       | None | 12737926 | Using index |"),(0,l.kt)("p",null,(0,l.kt)("strong",{parentName:"p"},"\u5982\u56fe\u6240\u793a:")," \u53d1\u73b0\u786e\u5b9e\u6b64\u6761\u8bed\u53e5\u5728\u6b64\u4f8b\u4e2d\u7528\u5230\u7684\u5e76\u4e0d\u662f\u4e3b\u952e\u7d22\u5f15\uff0c\u800c\u662f\u8f85\u52a9\u7d22\u5f15\uff0c\u5b9e\u9645\u4e0a\u5728\u6b64\u4f8b\u4e2d\u6211\u8bd5\u9a8c\u4e86\uff0c\u4e0d\u7ba1\u662f ",(0,l.kt)("inlineCode",{parentName:"p"},"COUNT(1)"),"\uff0c\u8fd8\u662f ",(0,l.kt)("inlineCode",{parentName:"p"},"COUNT(*)"),"\uff0cMySQL \u90fd\u4f1a\u7528\u6210\u672c\u6700\u5c0f \u7684\u8f85\u52a9\u7d22\u5f15\u67e5\u8be2\u65b9\u5f0f\u6765\u8ba1\u6570\uff0c\u4e5f\u5c31\u662f\u4f7f\u7528 ",(0,l.kt)("inlineCode",{parentName:"p"},"COUNT(*)")," \u7531\u4e8e MySQL \u7684\u4f18\u5316\u5df2\u7ecf\u4fdd\u8bc1\u4e86\u5b83\u7684\u67e5\u8be2\u6027\u80fd\u662f\u6700\u597d\u7684\uff01\u968f\u5e26\u63d0\u4e00\u53e5\uff0c",(0,l.kt)("inlineCode",{parentName:"p"},"COUNT(*)"),"\u662f SQL92 \u5b9a\u4e49\u7684\u6807\u51c6\u7edf\u8ba1\u884c\u6570\u7684\u8bed\u6cd5\uff0c\u5e76\u4e14\u6548\u7387\u9ad8\uff0c\u6240\u4ee5\u8bf7\u76f4\u63a5\u4f7f\u7528",(0,l.kt)("inlineCode",{parentName:"p"},"COUNT(*)"),"\u67e5\u8be2\u8868\u7684\u884c\u6570\uff01"),(0,l.kt)("p",null,"\u6240\u4ee5\u8fd9\u79cd\u8bf4\u6cd5\u786e\u5b9e\u662f\u5bf9\u7684\u3002\u4f46\u6709\u4e2a\u524d\u63d0\uff0c\u5728 MySQL 5.6 \u4e4b\u540e\u7684\u7248\u672c\u4e2d\u624d\u6709\u8fd9\u79cd\u4f18\u5316\u3002"),(0,l.kt)("p",null,"\u90a3\u4e48\u8fd9\u4e2a\u6210\u672c\u6700\u5c0f\u8be5\u600e\u4e48\u5b9a\u4e49\u5462\uff0c\u6709\u65f6\u5019\u5728 WHERE \u4e2d\u6307\u5b9a\u4e86\u591a\u4e2a\u6761\u4ef6\uff0c\u4e3a\u5565\u6700\u7ec8 MySQL \u6267\u884c\u7684\u65f6\u5019\u5374\u9009\u62e9\u4e86\u53e6\u4e00\u4e2a\u7d22\u5f15\uff0c\u751a\u81f3\u4e0d\u9009\u7d22\u5f15\uff1f"),(0,l.kt)("p",null,"\u672c\u6587\u5c06\u4f1a\u7ed9\u4f60\u7b54\u6848\uff0c\u672c\u6587\u5c06\u4f1a\u4ece\u4ee5\u4e0b\u4e24\u65b9\u9762\u6765\u5206\u6790"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"SQL \u9009\u7528\u7d22\u5f15\u7684\u6267\u884c\u6210\u672c\u5982\u4f55\u8ba1\u7b97"),(0,l.kt)("li",{parentName:"ul"},"\u5b9e\u4f8b\u8bf4\u660e")),(0,l.kt)("h2",{id:"sql-\u9009\u7528\u7d22\u5f15\u7684\u6267\u884c\u6210\u672c\u5982\u4f55\u8ba1\u7b97"},"SQL \u9009\u7528\u7d22\u5f15\u7684\u6267\u884c\u6210\u672c\u5982\u4f55\u8ba1\u7b97"),(0,l.kt)("p",null,"\u5c31\u5982\u524d\u6587\u6240\u8ff0\uff0c\u5728\u6709\u591a\u4e2a\u7d22\u5f15\u7684\u60c5\u51b5\u4e0b\uff0c \u5728\u67e5\u8be2\u6570\u636e\u524d\uff0cMySQL \u4f1a\u9009\u62e9\u6210\u672c\u6700\u5c0f\u539f\u5219\u6765\u9009\u62e9\u4f7f\u7528\u5bf9\u5e94\u7684\u7d22\u5f15\uff0c\u8fd9\u91cc\u7684\u6210\u672c\u4e3b\u8981\u5305\u542b\u4e24\u4e2a\u65b9\u9762\u3002"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},"IO \u6210\u672c: \u5373\u4ece\u78c1\u76d8\u628a\u6570\u636e\u52a0\u8f7d\u5230\u5185\u5b58\u7684\u6210\u672c\uff0c\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u8bfb\u53d6\u6570\u636e\u9875\u7684 IO \u6210\u672c\u662f 1\uff0cMySQL \u662f\u4ee5\u9875\u7684\u5f62\u5f0f\u8bfb\u53d6\u6570\u636e\u7684\uff0c\u5373\u5f53\u7528\u5230\u67d0\u4e2a\u6570\u636e\u65f6\uff0c\u5e76\u4e0d\u4f1a\u53ea\u8bfb\u53d6\u8fd9\u4e2a\u6570\u636e\uff0c\u800c\u4f1a\u628a\u8fd9\u4e2a\u6570\u636e\u76f8\u90bb\u7684\u6570\u636e\u4e5f\u4e00\u8d77\u8bfb\u5230\u5185\u5b58\u4e2d\uff0c\u8fd9\u5c31\u662f\u6709\u540d\u7684\u7a0b\u5e8f\u5c40\u90e8\u6027\u539f\u7406\uff0c\u6240\u4ee5 MySQL \u6bcf\u6b21\u4f1a\u8bfb\u53d6\u4e00\u6574\u9875\uff0c\u4e00\u9875\u7684\u6210\u672c\u5c31\u662f 1\u3002\u6240\u4ee5 IO \u7684\u6210\u672c\u4e3b\u8981\u548c\u9875\u7684\u5927\u5c0f\u6709\u5173"),(0,l.kt)("li",{parentName:"ul"},"CPU \u6210\u672c\uff1a\u5c06\u6570\u636e\u8bfb\u5165\u5185\u5b58\u540e\uff0c\u8fd8\u8981\u68c0\u6d4b\u6570\u636e\u662f\u5426\u6ee1\u8db3\u6761\u4ef6\u548c\u6392\u5e8f\u7b49 CPU \u64cd\u4f5c\u7684\u6210\u672c\uff0c\u663e\u7136\u5b83\u4e0e\u884c\u6570\u6709\u5173\uff0c\u9ed8\u8ba4\u60c5\u51b5\u4e0b\uff0c\u68c0\u6d4b\u8bb0\u5f55\u7684\u6210\u672c\u662f 0.2\u3002")),(0,l.kt)("h2",{id:"\u5b9e\u4f8b\u8bf4\u660e"},"\u5b9e\u4f8b\u8bf4\u660e"),(0,l.kt)("p",null,"\u4e3a\u4e86\u6839\u636e\u4ee5\u4e0a\u4e24\u4e2a\u6210\u672c\u6765\u7b97\u51fa\u4f7f\u7528\u7d22\u5f15\u7684\u6700\u7ec8\u6210\u672c\uff0c\u6211\u4eec\u5148\u51c6\u5907\u4e00\u4e2a\u8868\uff08\u4ee5\u4e0b\u64cd\u4f5c\u57fa\u4e8e MySQL 5.7.18\uff09"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"CREATE TABLE `person` (  \n  `id` bigint(20) NOT NULL AUTO_INCREMENT,  \n  `name` varchar(255) NOT NULL,  \n  `score` int(11) NOT NULL,  \n  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  \n  PRIMARY KEY (`id`),  \n  KEY `name_score` (`name`(191),`score`),  \n  KEY `create_time` (`create_time`)  \n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;  \n")),(0,l.kt)("p",null,"\u8fd9\u4e2a\u8868\u9664\u4e86\u4e3b\u952e\u7d22\u5f15\u4e4b\u5916\uff0c\u8fd8\u6709\u53e6\u5916\u4e24\u4e2a\u7d22\u5f15, name_score \u53ca create_time\u3002\u7136\u540e\u6211\u4eec\u5728\u6b64\u8868\u4e2d\u63d2\u5165 10 w \u884c\u6570\u636e\uff0c\u53ea\u8981\u5199\u4e00\u4e2a\u5b58\u50a8\u8fc7\u7a0b\u8c03\u7528\u5373\u53ef\uff0c\u5982\u4e0b:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"CREATE PROCEDURE insert_person()  \nbegin  \n    declare c_id integer default 1;  \n    while c_id<=100000 do  \n    insert into person values(c_id, concat('name',c_id), c_id+100, date_sub(NOW(), interval c_id second));  \n    set c_id=c_id+1;  \n    end while;  \nend  \n")),(0,l.kt)("p",null,"\u63d2\u5165\u4e4b\u540e\u6211\u4eec\u73b0\u5728\u4f7f\u7528 EXPLAIN \u6765\u8ba1\u7b97\u4e0b\u7edf\u8ba1\u603b\u884c\u6570\u5230\u5e95\u4f7f\u7528\u7684\u662f\u54ea\u4e2a\u7d22\u5f15"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"EXPLAIN SELECT COUNT(*) FROM person;\n")),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"id"),(0,l.kt)("th",{parentName:"tr",align:null},"select_type"),(0,l.kt)("th",{parentName:"tr",align:null},"table"),(0,l.kt)("th",{parentName:"tr",align:null},"partitions"),(0,l.kt)("th",{parentName:"tr",align:null},"type"),(0,l.kt)("th",{parentName:"tr",align:null},"possible_keys"),(0,l.kt)("th",{parentName:"tr",align:null},"key"),(0,l.kt)("th",{parentName:"tr",align:null},"key_len"),(0,l.kt)("th",{parentName:"tr",align:null},"ref"),(0,l.kt)("th",{parentName:"tr",align:null},"rows"),(0,l.kt)("th",{parentName:"tr",align:null},"filtered"),(0,l.kt)("th",{parentName:"tr",align:null},"Extra"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"1"),(0,l.kt)("td",{parentName:"tr",align:null},"SIMPLE"),(0,l.kt)("td",{parentName:"tr",align:null},"person"),(0,l.kt)("td",{parentName:"tr",align:null},"NULL"),(0,l.kt)("td",{parentName:"tr",align:null},"index"),(0,l.kt)("td",{parentName:"tr",align:null},"NULL"),(0,l.kt)("td",{parentName:"tr",align:null},"create_time"),(0,l.kt)("td",{parentName:"tr",align:null},"4"),(0,l.kt)("td",{parentName:"tr",align:null},"NULL"),(0,l.kt)("td",{parentName:"tr",align:null},"100264"),(0,l.kt)("td",{parentName:"tr",align:null},"100.00"),(0,l.kt)("td",{parentName:"tr",align:null},"Using index")))),(0,l.kt)("p",null,"\u4ece\u7ed3\u679c\u4e0a\u770b\u5b83\u9009\u62e9\u4e86 ",(0,l.kt)("inlineCode",{parentName:"p"},"create_time")," \u8f85\u52a9\u7d22\u5f15\uff0c\u663e\u7136 MySQL \u8ba4\u4e3a\u4f7f\u7528\u6b64\u7d22\u5f15\u8fdb\u884c\u67e5\u8be2\u6210\u672c\u6700\u5c0f\uff0c\u8fd9\u4e5f\u662f\u7b26\u5408\u6211\u4eec\u7684\u9884\u671f\uff0c\u4f7f\u7528\u8f85\u52a9\u7d22\u5f15\u6765\u67e5\u8be2\u786e\u5b9e\u662f\u6027\u80fd\u6700\u9ad8\u7684\uff01"),(0,l.kt)("p",null,"\u6211\u4eec\u518d\u6765\u770b\u4ee5\u4e0b SQL \u4f1a\u4f7f\u7528\u54ea\u4e2a\u7d22\u5f15"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"SELECT * FROM person WHERE NAME >'name84059' AND create_time>'2020-05-23 14:39:18';\n")),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"id"),(0,l.kt)("th",{parentName:"tr",align:null},"select_type"),(0,l.kt)("th",{parentName:"tr",align:null},"table"),(0,l.kt)("th",{parentName:"tr",align:null},"partitions"),(0,l.kt)("th",{parentName:"tr",align:null},"type"),(0,l.kt)("th",{parentName:"tr",align:null},"possible_keys"),(0,l.kt)("th",{parentName:"tr",align:null},"key"),(0,l.kt)("th",{parentName:"tr",align:null},"key_len"),(0,l.kt)("th",{parentName:"tr",align:null},"ref"),(0,l.kt)("th",{parentName:"tr",align:null},"rows"),(0,l.kt)("th",{parentName:"tr",align:null},"filtered"),(0,l.kt)("th",{parentName:"tr",align:null},"Extra"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"1"),(0,l.kt)("td",{parentName:"tr",align:null},"SIMPLE"),(0,l.kt)("td",{parentName:"tr",align:null},"person"),(0,l.kt)("td",{parentName:"tr",align:null},"NULL"),(0,l.kt)("td",{parentName:"tr",align:null},"ALL"),(0,l.kt)("td",{parentName:"tr",align:null},"name score.create time"),(0,l.kt)("td",{parentName:"tr",align:null},"NULL"),(0,l.kt)("td",{parentName:"tr",align:null},"NULL"),(0,l.kt)("td",{parentName:"tr",align:null},"NULL"),(0,l.kt)("td",{parentName:"tr",align:null},"100264"),(0,l.kt)("td",{parentName:"tr",align:null},"12.65"),(0,l.kt)("td",{parentName:"tr",align:null},"Using where")))),(0,l.kt)("p",null,"\u7528\u4e86\u5168\u8868\u626b\u63cf\uff01\u7406\u8bba\u4e0a\u5e94\u8be5\u7528 ",(0,l.kt)("inlineCode",{parentName:"p"},"name_score")," \u6216\u8005 ",(0,l.kt)("inlineCode",{parentName:"p"},"create_time")," \u7d22\u5f15\u624d\u5bf9\uff0c\u4ece ",(0,l.kt)("inlineCode",{parentName:"p"},"WHERE")," \u7684\u67e5\u8be2\u6761\u4ef6\u6765\u770b\u786e\u5b9e\u90fd\u80fd\u547d\u4e2d\u7d22\u5f15\uff0c\u90a3\u662f\u5426\u662f\u4f7f\u7528 ",(0,l.kt)("inlineCode",{parentName:"p"},"SELECT *")," \u9020\u6210\u7684\u56de\u8868\u4ee3\u4ef7\u592a\u5927\u6240\u81f4\u5462\uff0c\u6211\u4eec\u6539\u6210\u8986\u76d6\u7d22\u5f15\u7684\u5f62\u5f0f\u8bd5\u4e00\u4e0b"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"SELECT create_time FROM person WHERE NAME >'name84059' AND create_time > '2020-05-23 14:39:18';\n")),(0,l.kt)("p",null,"\u7ed3\u679c MySQL \u4f9d\u7136\u9009\u62e9\u4e86\u5168\u8868\u626b\u63cf\uff01\u8fd9\u5c31\u6bd4\u8f83\u6709\u610f\u601d\u4e86\uff0c\u7406\u8bba\u4e0a\u91c7\u7528\u4e86\u8986\u76d6\u7d22\u5f15\u7684\u65b9\u5f0f\u8fdb\u884c\u67e5\u627e\u6027\u80fd\u80af\u5b9a\u662f\u6bd4\u5168\u8868\u626b\u63cf\u66f4\u597d\u7684\uff0c\u4e3a\u5565 MySQL \u9009\u62e9\u4e86\u5168\u8868\u626b\u63cf\u5462\uff0c\u65e2\u7136\u5b83\u8ba4\u4e3a\u5168\u8868\u626b\u63cf\u6bd4\u4f7f\u7528\u8986\u76d6\u7d22\u5f15\u7684\u5f62\u5f0f\u6027\u80fd\u66f4\u597d\uff0c\u90a3\u6211\u4eec\u5206\u522b\u7528\u8fd9\u4e24\u8005\u6267\u884c\u6765\u6bd4\u8f83\u4e0b\u67e5\u8be2\u65f6\u95f4\u5427"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"-- \u5168\u8868\u626b\u63cf\u6267\u884c\u65f6\u95f4: 4.0 ms  \nSELECT create_time FROM person WHERE NAME >'name84059' AND create_time>'2020-05-23 14:39:18';\n  \n-- \u4f7f\u7528\u8986\u76d6\u7d22\u5f15\u6267\u884c\u65f6\u95f4: 2.0 ms  \nSELECT create_time FROM person force index(create_time) WHERE NAME >'name84059' AND create_time>'2020-05-23 14:39:18';\n")),(0,l.kt)("p",null,"\u4ece\u5b9e\u9645\u6267\u884c\u7684\u6548\u679c\u770b\u4f7f\u7528\u8986\u76d6\u7d22\u5f15\u67e5\u8be2\u6bd4\u4f7f\u7528\u5168\u8868\u626b\u63cf\u6267\u884c\u7684\u65f6\u95f4\u5feb\u4e86\u4e00\u500d\uff01\u8bf4\u660e MySQL \u5728\u67e5\u8be2\u524d\u505a\u7684\u6210\u672c\u4f30\u7b97\u4e0d\u51c6\uff01\u6211\u4eec\u5148\u6765\u770b\u770b MySQL \u505a\u5168\u8868\u626b\u63cf\u7684\u6210\u672c\u6709\u591a\u5c11\u3002"),(0,l.kt)("p",null,"\u524d\u9762\u6211\u4eec\u8bf4\u4e86\u6210\u672c\u4e3b\u8981 IO \u6210\u672c\u548c CPU \u6210\u672c\u6709\u5173\uff0c\u5bf9\u4e8e\u5168\u8868\u626b\u63cf\u6765\u8bf4\u4e5f\u5c31\u662f\u5206\u522b\u548c\u805a\u7c07\u7d22\u5f15\u5360\u7528\u7684\u9875\u9762\u6570\u548c\u8868\u4e2d\u7684\u8bb0\u5f55\u6570\u3002\u6267\u884c\u4ee5\u4e0b\u547d\u4ee4"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"SHOW TABLE STATUS LIKE 'person';\n")),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"table_name"),(0,l.kt)("th",{parentName:"tr",align:null},"Engine"),(0,l.kt)("th",{parentName:"tr",align:null},"Version"),(0,l.kt)("th",{parentName:"tr",align:null},"Row_format"),(0,l.kt)("th",{parentName:"tr",align:null},"Rows"),(0,l.kt)("th",{parentName:"tr",align:null},"Avg_row_length"),(0,l.kt)("th",{parentName:"tr",align:null},"Data_length"),(0,l.kt)("th",{parentName:"tr",align:null},"Max_data_length"),(0,l.kt)("th",{parentName:"tr",align:null},"Index_length"),(0,l.kt)("th",{parentName:"tr",align:null},"Data free"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"person"),(0,l.kt)("td",{parentName:"tr",align:null},"InnoDB"),(0,l.kt)("td",{parentName:"tr",align:null},"10"),(0,l.kt)("td",{parentName:"tr",align:null},"Dynamic"),(0,l.kt)("td",{parentName:"tr",align:null},"100264"),(0,l.kt)("td",{parentName:"tr",align:null},"57"),(0,l.kt)("td",{parentName:"tr",align:null},"5783552"),(0,l.kt)("td",{parentName:"tr",align:null},"0"),(0,l.kt)("td",{parentName:"tr",align:null},"8421376"),(0,l.kt)("td",{parentName:"tr",align:null},"4194304")))),(0,l.kt)("p",null,"\u53ef\u4ee5\u53d1\u73b0"),(0,l.kt)("ol",null,(0,l.kt)("li",{parentName:"ol"},"\u884c\u6570\u662f ",(0,l.kt)("inlineCode",{parentName:"li"},"100264"),"\uff0c\u6211\u4eec\u4e0d\u662f\u63d2\u5165\u4e86 ",(0,l.kt)("inlineCode",{parentName:"li"},"10 w")," \u884c\u7684\u6570\u636e\u4e86\u5417\uff0c\u600e\u4e48\u7b97\u51fa\u7684\u6570\u636e\u53cd\u800c\u591a\u4e86\uff0c\u5176\u5b9e\u8fd9\u91cc\u7684\u8ba1\u7b97\u662f\u4f30\u7b97 \uff0c\u4e5f\u6709\u53ef\u80fd\u8fd9\u91cc\u7684\u884c\u6570\u7edf\u8ba1\u51fa\u6765\u6bd4 ",(0,l.kt)("inlineCode",{parentName:"li"},"10 w")," \u5c11\u4e86\uff0c\u4f30\u7b97\u65b9\u5f0f\u6709\u5174\u8da3\u5927\u5bb6\u53bb\u7f51\u4e0a\u67e5\u627e\uff0c\u8fd9\u91cc\u4e0d\u662f\u672c\u6587\u91cd\u70b9\uff0c\u5c31\u4e0d\u5c55\u5f00\u4e86\u3002\u5f97\u77e5\u884c\u6570\uff0c\u90a3\u6211\u4eec\u77e5\u9053 CPU \u6210\u672c\u662f ",(0,l.kt)("inlineCode",{parentName:"li"},"100264 * 0.2 = 20052.8"),"\u3002"),(0,l.kt)("li",{parentName:"ol"},"\u6570\u636e\u957f\u5ea6\u662f ",(0,l.kt)("inlineCode",{parentName:"li"},"5783552"),"\uff0cInnoDB \u6bcf\u4e2a\u9875\u9762\u7684\u5927\u5c0f\u662f ",(0,l.kt)("inlineCode",{parentName:"li"},"16 KB"),"\uff0c\u53ef\u4ee5\u7b97\u51fa\u9875\u9762\u6570\u91cf\u662f ",(0,l.kt)("inlineCode",{parentName:"li"},"353"),"\u3002")),(0,l.kt)("p",null,"\u4e5f\u5c31\u662f\u8bf4\u5168\u8868\u626b\u63cf\u7684\u6210\u672c\u662f ",(0,l.kt)("inlineCode",{parentName:"p"},"20052.8 + 353 = 20406"),"\u3002"),(0,l.kt)("p",null,"\u8fd9\u4e2a\u7ed3\u679c\u5bf9\u4e0d\u5bf9\u5462\uff0c\u6211\u4eec\u53ef\u4ee5\u7528\u4e00\u4e2a\u5de5\u5177\u9a8c\u8bc1\u4e00\u4e0b\u3002\u5728 MySQL 5.6 \u53ca\u4e4b\u540e\u7684\u7248\u672c\u4e2d\uff0c\u6211\u4eec\u53ef\u4ee5\u7528 optimizer trace \u529f\u80fd\u6765\u67e5\u770b\u4f18\u5316\u5668\u751f\u6210\u8ba1\u5212\u7684\u6574\u4e2a\u8fc7\u7a0b \uff0c\u5b83\u5217\u51fa\u4e86\u9009\u62e9\u6bcf\u4e2a\u7d22\u5f15\u7684\u6267\u884c\u8ba1\u5212\u6210\u672c\u4ee5\u53ca\u6700\u7ec8\u7684\u9009\u62e9\u7ed3\u679c\uff0c\u6211\u4eec\u53ef\u4ee5\u4f9d\u8d56\u8fd9\u4e9b\u4fe1\u606f\u6765\u8fdb\u4e00\u6b65\u4f18\u5316\u6211\u4eec\u7684 SQL\u3002"),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"optimizer_trace")," \u529f\u80fd\u4f7f\u7528\u5982\u4e0b"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-sql"},"SET optimizer_trace=\"enabled=on\";  \nSELECT create_time FROM person WHERE NAME >'name84059' AND create_time > '2020-05-23 14:39:18';  \nSELECT * FROM information_schema.OPTIMIZER_TRACE;  \nSET optimizer_trace=\"enabled=off\";\n")),(0,l.kt)("p",null,"\u6267\u884c\u4e4b\u540e\u6211\u4eec\u4e3b\u8981\u89c2\u5bdf\u4f7f\u7528 ",(0,l.kt)("inlineCode",{parentName:"p"},"name_score"),"\uff0c",(0,l.kt)("inlineCode",{parentName:"p"},"create_time")," \u7d22\u5f15\u53ca\u5168\u8868\u626b\u63cf\u7684\u6210\u672c\u3002"),(0,l.kt)("p",null,"\u5148\u6765\u770b\u4e0b\u4f7f\u7528 ",(0,l.kt)("inlineCode",{parentName:"p"},"name_score")," \u7d22\u5f15\u6267\u884c\u7684\u7684\u9884\u4f30\u6267\u884c\u6210\u672c:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-json"},'{  \n    "index": "name_score",  \n    "ranges": [  \n      "name84059 <= name"  \n    ],  \n    "index_dives_for_eq_ranges": true,  \n    "rows": 25372,  \n    "cost": 30447  \n}\n')),(0,l.kt)("p",null,"\u53ef\u4ee5\u770b\u5230\u6267\u884c\u6210\u672c\u4e3a ",(0,l.kt)("inlineCode",{parentName:"p"},"30447"),"\uff0c\u9ad8\u4e8e\u6211\u4eec\u4e4b\u524d\u7b97\u51fa\u6765\u7684\u5168\u8868\u626b\u63cf\u6210\u672c\uff1a",(0,l.kt)("inlineCode",{parentName:"p"},"20406"),"\u3002\u6240\u4ee5\u6ca1\u9009\u62e9\u6b64\u7d22\u5f15\u6267\u884c"),(0,l.kt)("p",null,"\u6ce8\u610f\uff1a\u8fd9\u91cc\u7684 ",(0,l.kt)("inlineCode",{parentName:"p"},"30447")," \u662f\u67e5\u8be2\u4e8c\u7ea7\u7d22\u5f15\u7684 ",(0,l.kt)("inlineCode",{parentName:"p"},"IO \u6210\u672c"),"\u548c ",(0,l.kt)("inlineCode",{parentName:"p"},"CPU \u6210\u672c"),"\u4e4b\u548c\uff0c\u518d\u52a0\u4e0a\u56de\u8868\u67e5\u8be2\u805a\u7c07\u7d22\u5f15\u7684 ",(0,l.kt)("inlineCode",{parentName:"p"},"IO \u6210\u672c"),"\u548c ",(0,l.kt)("inlineCode",{parentName:"p"},"CPU \u6210\u672c"),"\u4e4b\u548c\u3002"),(0,l.kt)("p",null,"\u518d\u6765\u770b\u4e0b\u4f7f\u7528 ",(0,l.kt)("inlineCode",{parentName:"p"},"create_time")," \u7d22\u5f15\u6267\u884c\u7684\u7684\u9884\u4f30\u6267\u884c\u6210\u672c:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-json"},'{  \n    "index": "create_time",  \n    "ranges": [  \n      "0x5ec8c516 < create_time"  \n    ],  \n    "index_dives_for_eq_ranges": true,  \n    "rows": 50132,  \n    "cost": 60159,  \n    "cause": "cost"  \n}\n')),(0,l.kt)("p",null,"\u53ef\u4ee5\u770b\u5230\u6210\u672c\u662f ",(0,l.kt)("inlineCode",{parentName:"p"},"60159"),",\u8fdc\u5927\u4e8e\u5168\u8868\u626b\u63cf\u6210\u672c ",(0,l.kt)("inlineCode",{parentName:"p"},"20406"),"\uff0c\u81ea\u7136\u4e5f\u6ca1\u9009\u62e9\u6b64\u7d22\u5f15\u3002"),(0,l.kt)("p",null,"\u518d\u6765\u770b\u8ba1\u7b97\u51fa\u7684\u5168\u8868\u626b\u63cf\u6210\u672c\uff1a"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-json"},'{  \n    "considered_execution_plans": [  \n      {  \n        "plan_prefix": [  \n        ],  \n        "table": "`person`",  \n        "best_access_path": {  \n          "considered_access_paths": [  \n            {  \n              "rows_to_scan": 100264,  \n              "access_type": "scan",  \n              "resulting_rows": 100264,  \n              "cost": 20406,  \n              "chosen": true  \n            }  \n          ]  \n        },  \n        "condition_filtering_pct": 100,  \n        "rows_for_plan": 100264,  \n        "cost_for_plan": 20406,  \n        "chosen": true  \n      }  \n    ]  \n}\n')),(0,l.kt)("p",null,"\u6ce8\u610f\u770b ",(0,l.kt)("inlineCode",{parentName:"p"},"cost\uff1a20406"),"\uff0c\u4e0e\u6211\u4eec\u4e4b\u524d\u7b97\u51fa\u6765\u7684\u5b8c\u5168\u4e00\u6837\uff01\u8fd9\u4e2a\u503c\u5728\u4ee5\u4e0a\u4e09\u8005\u7b97\u51fa\u7684\u6267\u884c\u6210\u672c\u4e2d\u6700\u5c0f\uff0c\u6240\u4ee5\u6700\u7ec8 MySQL \u9009\u62e9\u4e86\u7528\u5168\u8868\u626b\u63cf\u7684\u65b9\u5f0f\u6765\u6267\u884c\u6b64 SQL\u3002"),(0,l.kt)("p",null,"\u5b9e\u9645\u4e0a ",(0,l.kt)("inlineCode",{parentName:"p"},"optimizer trace")," \u8be6\u7ec6\u5217\u51fa\u4e86\u8986\u76d6\u7d22\u5f15\uff0c\u56de\u8868\u7684\u6210\u672c\u7edf\u8ba1\u60c5\u51b5\uff0c\u6709\u5174\u8da3\u7684\u53ef\u4ee5\u53bb\u7814\u7a76\u4e00\u4e0b\u3002"),(0,l.kt)("p",null,"\u4ece\u4ee5\u4e0a\u5206\u6790\u53ef\u4ee5\u770b\u51fa\uff0c MySQL \u9009\u62e9\u7684\u6267\u884c\u8ba1\u5212\u672a\u5fc5\u662f\u6700\u4f73\u7684\uff0c\u539f\u56e0\u6709\u633a\u591a\uff0c\u5c31\u6bd4\u5982\u4e0a\u6587\u8bf4\u7684\u884c\u6570\u7edf\u8ba1\u4fe1\u606f\u4e0d\u51c6\uff0c\u518d\u6bd4\u5982 MySQL \u8ba4\u4e3a\u7684\u6700\u4f18\u8ddf\u6211\u4eec\u8ba4\u4e3a\u4e0d\u4e00\u6837\uff0c\u6211\u4eec\u53ef\u4ee5\u8ba4\u4e3a\u6267\u884c\u65f6\u95f4\u77ed\u7684\u662f\u6700\u4f18\u7684\uff0c\u4f46 MySQL \u8ba4\u4e3a\u7684\u6210\u672c\u5c0f\u672a\u5fc5\u610f\u5473\u7740\u6267\u884c\u65f6\u95f4\u77ed\u3002"),(0,l.kt)("h2",{id:"\u603b\u7ed3"},"\u603b\u7ed3"),(0,l.kt)("p",null,"\u672c\u6587\u901a\u8fc7\u4e00\u4e2a\u4f8b\u5b50\u6df1\u5165\u5256\u6790\u4e86 MySQL \u7684\u6267\u884c\u8ba1\u5212\u662f\u5982\u4f55\u9009\u62e9\u7684\uff0c\u4ee5\u53ca\u4e3a\u4ec0\u4e48\u5b83\u7684\u9009\u62e9\u672a\u5fc5\u662f\u6211\u4eec\u8ba4\u4e3a\u7684\u6700\u4f18\u7684\uff0c\u8fd9\u4e5f\u63d0\u9192\u6211\u4eec\uff0c\u5728\u751f\u4ea7\u4e2d\u5982\u679c\u6709\u591a\u4e2a\u7d22\u5f15\u7684\u60c5\u51b5\uff0c\u4f7f\u7528 WHERE \u8fdb\u884c\u8fc7\u6ee4\u672a\u5fc5\u4f1a\u9009\u4e2d\u4f60\u8ba4\u4e3a\u7684\u7d22\u5f15\uff0c\u6211\u4eec\u53ef\u4ee5\u63d0\u524d\u4f7f\u7528  ",(0,l.kt)("inlineCode",{parentName:"p"},"EXPLAIN"),", ",(0,l.kt)("inlineCode",{parentName:"p"},"optimizer trace")," \u6765\u4f18\u5316\u6211\u4eec\u7684\u67e5\u8be2\u8bed\u53e5\u3002"))}s.isMDXComponent=!0}}]);