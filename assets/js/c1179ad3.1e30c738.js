"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[803],{3905:(e,n,a)=>{a.d(n,{Zo:()=>c,kt:()=>m});var l=a(7294);function t(e,n,a){return n in e?Object.defineProperty(e,n,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[n]=a,e}function o(e,n){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);n&&(l=l.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),a.push.apply(a,l)}return a}function r(e){for(var n=1;n<arguments.length;n++){var a=null!=arguments[n]?arguments[n]:{};n%2?o(Object(a),!0).forEach((function(n){t(e,n,a[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(a,n))}))}return e}function p(e,n){if(null==e)return{};var a,l,t=function(e,n){if(null==e)return{};var a,l,t={},o=Object.keys(e);for(l=0;l<o.length;l++)a=o[l],n.indexOf(a)>=0||(t[a]=e[a]);return t}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(l=0;l<o.length;l++)a=o[l],n.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(t[a]=e[a])}return t}var i=l.createContext({}),u=function(e){var n=l.useContext(i),a=n;return e&&(a="function"==typeof e?e(n):r(r({},n),e)),a},c=function(e){var n=u(e.components);return l.createElement(i.Provider,{value:n},e.children)},d="mdxType",s={inlineCode:"code",wrapper:function(e){var n=e.children;return l.createElement(l.Fragment,{},n)}},k=l.forwardRef((function(e,n){var a=e.components,t=e.mdxType,o=e.originalType,i=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),d=u(a),k=t,m=d["".concat(i,".").concat(k)]||d[k]||s[k]||o;return a?l.createElement(m,r(r({ref:n},c),{},{components:a})):l.createElement(m,r({ref:n},c))}));function m(e,n){var a=arguments,t=n&&n.mdxType;if("string"==typeof e||t){var o=a.length,r=new Array(o);r[0]=k;var p={};for(var i in n)hasOwnProperty.call(n,i)&&(p[i]=n[i]);p.originalType=e,p[d]="string"==typeof e?e:t,r[1]=p;for(var u=2;u<o;u++)r[u]=a[u];return l.createElement.apply(null,r)}return l.createElement.apply(null,a)}k.displayName="MDXCreateElement"},4138:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>i,contentTitle:()=>r,default:()=>s,frontMatter:()=>o,metadata:()=>p,toc:()=>u});var l=a(7462),t=(a(7294),a(3905));const o={},r=void 0,p={unversionedId:"zh-cn/spring-boot/SPI",id:"zh-cn/spring-boot/SPI",title:"SPI",description:"\u4eca\u5929\u6765\u8ddf\u5927\u5bb6\u804a\u4e00\u804aJava\u3001Spring\u3001Dubbo\u4e09\u8005SPI\u673a\u5236\u7684\u539f\u7406\u548c\u533a\u522b\u3002",source:"@site/docs/zh-cn/spring-boot/SPI.md",sourceDirName:"zh-cn/spring-boot",slug:"/zh-cn/spring-boot/SPI",permalink:"/light-docusaurus/docs/zh-cn/spring-boot/SPI",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/spring-boot/SPI.md",tags:[],version:"current",frontMatter:{},sidebar:"troch",previous:{title:"Spring Boot",permalink:"/light-docusaurus/docs/category/spring-boot"},next:{title:"Spring-Core",permalink:"/light-docusaurus/docs/zh-cn/spring-boot/Spring-Core"}},i={},u=[{value:"1. \u4ec0\u4e48\u662fSPI",id:"1-\u4ec0\u4e48\u662fspi",level:2},{value:"2. Java SPI\u673a\u5236--ServiceLoader",id:"2-java-spi\u673a\u5236--serviceloader",level:2},{value:"\u4f18\u7f3a\u70b9",id:"\u4f18\u7f3a\u70b9",level:3},{value:"\u4f7f\u7528\u573a\u666f",id:"\u4f7f\u7528\u573a\u666f",level:3},{value:"3. Spring SPI\u673a\u5236--SpringFactoriesLoader",id:"3-spring-spi\u673a\u5236--springfactoriesloader",level:2},{value:"\u4f7f\u7528\u573a\u666f",id:"\u4f7f\u7528\u573a\u666f-1",level:3},{value:"\u4e0eJava SPI\u673a\u5236\u5bf9\u6bd4",id:"\u4e0ejava-spi\u673a\u5236\u5bf9\u6bd4",level:3},{value:"4. Dubbo SPI\u673a\u5236--ExtensionLoader",id:"4-dubbo-spi\u673a\u5236--extensionloader",level:2},{value:"dubbo\u6838\u5fc3\u673a\u5236",id:"dubbo\u6838\u5fc3\u673a\u5236",level:3},{value:"1\u3001\u81ea\u9002\u5e94\u673a\u5236",id:"1\u81ea\u9002\u5e94\u673a\u5236",level:4},{value:"2\u3001IOC\u548cAOP",id:"2ioc\u548caop",level:4},{value:"3\u3001\u81ea\u52a8\u6fc0\u6d3b",id:"3\u81ea\u52a8\u6fc0\u6d3b",level:4},{value:"5. \u603b\u7ed3",id:"5-\u603b\u7ed3",level:2}],c={toc:u},d="wrapper";function s(e){let{components:n,...a}=e;return(0,t.kt)(d,(0,l.Z)({},c,a,{components:n,mdxType:"MDXLayout"}),(0,t.kt)("p",null,"\u4eca\u5929\u6765\u8ddf\u5927\u5bb6\u804a\u4e00\u804aJava\u3001Spring\u3001Dubbo\u4e09\u8005SPI\u673a\u5236\u7684\u539f\u7406\u548c\u533a\u522b\u3002"),(0,t.kt)("p",null,"\u5176\u5b9e\u6211\u4e4b\u524d\u5199\u8fc7\u4e00\u7bc7\u7c7b\u4f3c\u7684\u6587\u7ae0\uff0c\u4f46\u662f\u8fd9\u7bc7\u6587\u7ae0\u4e3b\u8981\u662f\u5256\u6790dubbo\u7684SPI\u673a\u5236\u7684\u6e90\u7801\uff0c\u4e2d\u95f4\u53ea\u662f\u7b80\u5355\u5730\u4ecb\u7ecd\u4e86\u4e00\u4e0bJava\u3001Spring\u7684SPI\u673a\u5236\uff0c\u5e76\u6ca1\u6709\u8fdb\u884c\u6df1\u5165\uff0c\u6240\u4ee5\u672c\u7bc7\u5c31\u6765\u6df1\u5165\u804a\u4e00\u804a\u8fd9\u4e09\u8005\u7684\u539f\u7406\u548c\u533a\u522b\u3002"),(0,t.kt)("h2",{id:"1-\u4ec0\u4e48\u662fspi"},"1. \u4ec0\u4e48\u662fSPI"),(0,t.kt)("p",null,"SPI\u5168\u79f0\u4e3aService Provider Interface\uff0c\u662f\u4e00\u79cd\u52a8\u6001\u66ff\u6362\u53d1\u73b0\u7684\u673a\u5236\uff0c\u4e00\u79cd\u89e3\u8026\u975e\u5e38\u4f18\u79c0\u7684\u601d\u60f3\uff0cSPI\u53ef\u4ee5\u5f88\u7075\u6d3b\u7684\u8ba9\u63a5\u53e3\u548c\u5b9e\u73b0\u5206\u79bb\uff0c\u8ba9api\u63d0\u4f9b\u8005\u53ea\u63d0\u4f9b\u63a5\u53e3\uff0c\u7b2c\u4e09\u65b9\u6765\u5b9e\u73b0\uff0c\u7136\u540e\u53ef\u4ee5\u4f7f\u7528\u914d\u7f6e\u6587\u4ef6\u7684\u65b9\u5f0f\u6765\u5b9e\u73b0\u66ff\u6362\u6216\u8005\u6269\u5c55\uff0c\u5728\u6846\u67b6\u4e2d\u6bd4\u8f83\u5e38\u89c1\uff0c\u63d0\u9ad8\u6846\u67b6\u7684\u53ef\u6269\u5c55\u6027\u3002"),(0,t.kt)("p",null,"\u7b80\u5355\u6765\u8bf4SPI\u662f\u4e00\u79cd\u975e\u5e38\u4f18\u79c0\u7684\u8bbe\u8ba1\u601d\u60f3\uff0c\u5b83\u7684\u6838\u5fc3\u5c31\u662f\u89e3\u8026\u3001\u65b9\u4fbf\u6269\u5c55\u3002"),(0,t.kt)("h2",{id:"2-java-spi\u673a\u5236--serviceloader"},"2. Java SPI\u673a\u5236--ServiceLoader"),(0,t.kt)("p",null,(0,t.kt)("inlineCode",{parentName:"p"},"ServiceLoader")," \u662fJava\u63d0\u4f9b\u7684\u4e00\u79cd\u7b80\u5355\u7684SPI\u673a\u5236\u7684\u5b9e\u73b0\uff0cJava\u7684SPI\u5b9e\u73b0\u7ea6\u5b9a\u4e86\u4ee5\u4e0b\u4e24\u4ef6\u4e8b\uff1a"),(0,t.kt)("p",null,"\u6587\u4ef6\u5fc5\u987b\u653e\u5728META-INF/services/\u76ee\u5f55\u5e95\u4e0b\n\u6587\u4ef6\u540d\u5fc5\u987b\u4e3a\u63a5\u53e3\u7684\u5168\u9650\u5b9a\u540d\uff0c\u5185\u5bb9\u4e3a\u63a5\u53e3\u5b9e\u73b0\u7684\u5168\u9650\u5b9a\u540d\n\u8fd9\u6837\u5c31\u80fd\u591f\u901a\u8fc7 ",(0,t.kt)("inlineCode",{parentName:"p"},"ServiceLoader")," \u52a0\u8f7d\u5230\u6587\u4ef6\u4e2d\u63a5\u53e3\u7684\u5b9e\u73b0\u3002"),(0,t.kt)("p",null,"\u6765\u4e2ademo\n\u7b2c\u4e00\u6b65\uff0c\u9700\u8981\u4e00\u4e2a\u63a5\u53e3\u4ee5\u53ca\u4ed6\u7684\u5b9e\u73b0\u7c7b"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},"public interface LoadBalance {\n}\n\npublic class RandomLoadBalance implements LoadBalance{\n}\n")),(0,t.kt)("p",null,"\u7b2c\u4e8c\u6b65\uff0c\u5728META-INF/services/\u76ee\u5f55\u521b\u5efa\u4e00\u4e2a\u6587\u4ef6\u540dLoadBalance\u5168\u9650\u5b9a\u540d\u7684\u6587\u4ef6\uff0c\u6587\u4ef6\u5185\u5bb9\u4e3aRandomLoadBalance\u7684\u5168\u9650\u5b9a\u540d"),(0,t.kt)("p",null,"\u6d4b\u8bd5\u7c7b\uff1a"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},'public class ServiceLoaderDemo {\n\n  public static void main(String[] args) {\n    ServiceLoader<LoadBalance> loadBalanceServiceLoader = ServiceLoader.load(LoadBalance.class);\n    Iterator<LoadBalance> iterator = loadBalanceServiceLoader.iterator();\n    while (iterator.hasNext()) {\n      LoadBalance loadBalance = iterator.next();\n      System.out.println("\u83b7\u53d6\u5230\u8d1f\u8f7d\u5747\u8861\u7b56\u7565:" + loadBalance);\n    }\n  }\n\n}\n')),(0,t.kt)("p",null,"\u6d4b\u8bd5\u7ed3\u679c\uff1a"),(0,t.kt)("p",null,"\u6b64\u65f6\u5c31\u6210\u529f\u83b7\u53d6\u5230\u4e86\u5b9e\u73b0\u3002"),(0,t.kt)("p",null,"\u5728\u5b9e\u9645\u7684\u6846\u67b6\u8bbe\u8ba1\u4e2d\uff0c\u4e0a\u9762\u8fd9\u6bb5\u6d4b\u8bd5\u4ee3\u7801\u5176\u5b9e\u662f\u6846\u67b6\u4f5c\u8005\u5199\u5230\u6846\u67b6\u5185\u90e8\u7684\uff0c\u800c\u5bf9\u4e8e\u6846\u67b6\u7684\u4f7f\u7528\u8005\u6765\u8bf4\uff0c\u8981\u60f3\u81ea\u5b9a\u4e49LoadBalance\u5b9e\u73b0\uff0c\u5d4c\u5165\u5230\u6846\u67b6\uff0c\u4ec5\u4ec5\u53ea\u9700\u8981\u5199\u63a5\u53e3\u7684\u5b9e\u73b0\u548cspi\u6587\u4ef6\u5373\u53ef\u3002"),(0,t.kt)("p",null,"\u5b9e\u73b0\u539f\u7406\n\u5982\u4e0b\u662fServiceLoader\u4e2d\u4e00\u6bb5\u6838\u5fc3\u4ee3\u7801"),(0,t.kt)("p",null,"\u56fe\u7247\n\u9996\u5148\u83b7\u53d6\u4e00\u4e2afullName\uff0c\u5176\u5b9e\u5c31\u662fMETA-INF/services/\u63a5\u53e3\u7684\u5168\u9650\u5b9a\u540d"),(0,t.kt)("p",null,"\u56fe\u7247\n\u7136\u540e\u901a\u8fc7ClassLoader\u83b7\u53d6\u5230\u8d44\u6e90\uff0c\u5176\u5b9e\u5c31\u662f\u63a5\u53e3\u7684\u5168\u9650\u5b9a\u540d\u6587\u4ef6\u5bf9\u5e94\u7684\u8d44\u6e90\uff0c\u7136\u540e\u4ea4\u7ed9parse\u65b9\u6cd5\u89e3\u6790\u8d44\u6e90"),(0,t.kt)("p",null,"\u56fe\u7247\nparse\u65b9\u6cd5\u5176\u5b9e\u5c31\u662f\u901a\u8fc7IO\u6d41\u8bfb\u53d6\u6587\u4ef6\u7684\u5185\u5bb9\uff0c\u8fd9\u6837\u5c31\u53ef\u4ee5\u83b7\u53d6\u5230\u63a5\u53e3\u7684\u5b9e\u73b0\u7684\u5168\u9650\u5b9a\u540d"),(0,t.kt)("p",null,"\u518d\u540e\u9762\u5176\u5b9e\u5c31\u662f\u901a\u8fc7\u53cd\u5c04\u5b9e\u4f8b\u5316\u5bf9\u8c61\uff0c\u8fd9\u91cc\u5c31\u4e0d\u5c55\u793a\u4e86\u3002"),(0,t.kt)("p",null,"\u6240\u4ee5\u5176\u5b9e\u4e0d\u96be\u53d1\u73b0ServiceLoader\u5b9e\u73b0\u539f\u7406\u6bd4\u8f83\u7b80\u5355\uff0c\u603b\u7ed3\u8d77\u6765\u5c31\u662f\u901a\u8fc7IO\u6d41\u8bfb\u53d6META-INF/services/\u63a5\u53e3\u7684\u5168\u9650\u5b9a\u540d\u6587\u4ef6\u7684\u5185\u5bb9\uff0c\u7136\u540e\u53cd\u5c04\u5b9e\u4f8b\u5316\u5bf9\u8c61\u3002"),(0,t.kt)("h3",{id:"\u4f18\u7f3a\u70b9"},"\u4f18\u7f3a\u70b9"),(0,t.kt)("p",null,"\u7531\u4e8eJava\u7684SPI\u673a\u5236\u5b9e\u73b0\u7684\u6bd4\u8f83\u7b80\u5355\uff0c\u6240\u4ee5\u4ed6\u4e5f\u6709\u4e00\u4e9b\u7f3a\u70b9\u3002"),(0,t.kt)("ul",null,(0,t.kt)("li",{parentName:"ul"},(0,t.kt)("p",{parentName:"li"},"\u7b2c\u4e00\u70b9\u5c31\u662f\u6d6a\u8d39\u8d44\u6e90\uff0c\u867d\u7136\u4f8b\u5b50\u4e2d\u53ea\u6709\u4e00\u4e2a\u5b9e\u73b0\u7c7b\uff0c\u4f46\u662f\u5b9e\u9645\u60c5\u51b5\u4e0b\u53ef\u80fd\u4f1a\u6709\u5f88\u591a\u5b9e\u73b0\u7c7b\uff0c\u800cJava\u7684SPI\u4f1a\u4e00\u80a1\u8111\u5168\u8fdb\u884c\u5b9e\u4f8b\u5316\uff0c\u4f46\u662f\u8fd9\u4e9b\u5b9e\u73b0\u4e86\u4e0d\u4e00\u5b9a\u90fd\u7528\u5f97\u7740\uff0c\u6240\u4ee5\u5c31\u4f1a\u767d\u767d\u6d6a\u8d39\u8d44\u6e90\u3002")),(0,t.kt)("li",{parentName:"ul"},(0,t.kt)("p",{parentName:"li"},"\u7b2c\u4e8c\u70b9\u5c31\u662f\u65e0\u6cd5\u5bf9\u533a\u5206\u5177\u4f53\u7684\u5b9e\u73b0\uff0c\u4e5f\u5c31\u662f\u8fd9\u4e48\u591a\u5b9e\u73b0\u7c7b\uff0c\u5230\u5e95\u8be5\u7528\u54ea\u4e2a\u5b9e\u73b0\u5462\uff1f\u5982\u679c\u8981\u5224\u65ad\u5177\u4f53\u4f7f\u7528\u54ea\u4e2a\uff0c\u53ea\u80fd\u4f9d\u9760\u63a5\u53e3\u672c\u8eab\u7684\u8bbe\u8ba1\uff0c\u6bd4\u5982\u63a5\u53e3\u53ef\u4ee5\u8bbe\u8ba1\u4e3a\u4e00\u4e2a\u7b56\u7565\u63a5\u53e3\uff0c\u53c8\u6216\u8005\u63a5\u53e3\u53ef\u4ee5\u8bbe\u8ba1\u5e26\u6709\u4f18\u5148\u7ea7\u7684\uff0c\u4f46\u662f\u4e0d\u8bba\u600e\u6837\u8bbe\u8ba1\uff0c\u6846\u67b6\u4f5c\u8005\u90fd\u5f97\u5199\u4ee3\u7801\u8fdb\u884c\u5224\u65ad\u3002"))),(0,t.kt)("p",null,"\u6240\u4ee5\u603b\u5f97\u6765\u8bf4\u5c31\u662fServiceLoader\u65e0\u6cd5\u505a\u5230\u6309\u9700\u52a0\u8f7d\u6216\u8005\u6309\u9700\u83b7\u53d6\u67d0\u4e2a\u5177\u4f53\u7684\u5b9e\u73b0\u3002"),(0,t.kt)("h3",{id:"\u4f7f\u7528\u573a\u666f"},"\u4f7f\u7528\u573a\u666f"),(0,t.kt)("p",null,"\u867d\u7136\u8bf4ServiceLoader\u53ef\u80fd\u6709\u4e9b\u7f3a\u70b9\uff0c\u4f46\u662f\u8fd8\u662f\u6709\u4f7f\u7528\u573a\u666f\u7684\uff0c\u6bd4\u5982\u8bf4\uff1a"),(0,t.kt)("ul",null,(0,t.kt)("li",{parentName:"ul"},"\u4e0d\u9700\u8981\u9009\u62e9\u5177\u4f53\u7684\u5b9e\u73b0\uff0c\u6bcf\u4e2a\u88ab\u52a0\u8f7d\u7684\u5b9e\u73b0\u90fd\u9700\u8981\u88ab\u7528\u5230"),(0,t.kt)("li",{parentName:"ul"},"\u867d\u7136\u9700\u8981\u9009\u62e9\u5177\u4f53\u7684\u5b9e\u73b0\uff0c\u4f46\u662f\u53ef\u4ee5\u901a\u8fc7\u5bf9\u63a5\u53e3\u7684\u8bbe\u8ba1\u6765\u89e3\u51b3")),(0,t.kt)("h2",{id:"3-spring-spi\u673a\u5236--springfactoriesloader"},"3. Spring SPI\u673a\u5236--SpringFactoriesLoader"),(0,t.kt)("p",null,"Spring\u6211\u4eec\u90fd\u4e0d\u964c\u751f\uff0c\u4ed6\u4e5f\u63d0\u4f9b\u4e86\u4e00\u79cdSPI\u7684\u5b9e\u73b0SpringFactoriesLoader\u3002"),(0,t.kt)("p",null,"Spring\u7684SPI\u673a\u5236\u7684\u7ea6\u5b9a\u5982\u4e0b\uff1a"),(0,t.kt)("ul",null,(0,t.kt)("li",{parentName:"ul"},"\u914d\u7f6e\u6587\u4ef6\u5fc5\u987b\u5728META-INF/\u76ee\u5f55\u4e0b\uff0c\u6587\u4ef6\u540d\u5fc5\u987b\u4e3aspring.factories"),(0,t.kt)("li",{parentName:"ul"},"\u6587\u4ef6\u5185\u5bb9\u4e3a\u952e\u503c\u5bf9\uff0c\u4e00\u4e2a\u952e\u53ef\u4ee5\u6709\u591a\u4e2a\u503c\uff0c\u53ea\u9700\u8981\u7528\u9017\u53f7\u5206\u5272\u5c31\u884c\uff0c\u540c\u65f6\u952e\u503c\u90fd\u9700\u8981\u662f\u7c7b\u7684\u5168\u9650\u5b9a\u540d\uff0c\u952e\u548c\u503c\u53ef\u4ee5\u6ca1\u6709\u4efb\u4f55\u7c7b\u4e0e\u7c7b\u4e4b\u95f4\u7684\u5173\u7cfb\uff0c\u5f53\u7136\u4e5f\u53ef\u4ee5\u6709\u5b9e\u73b0\u7684\u5173\u7cfb\u3002")),(0,t.kt)("p",null,"\u6240\u4ee5\u4e5f\u53ef\u4ee5\u770b\u51fa\uff0cSpring\u7684SPI\u673a\u5236\u8ddfJava\u7684\u4e0d\u8bba\u662f\u6587\u4ef6\u540d\u8fd8\u662f\u5185\u5bb9\u7ea6\u5b9a\u90fd\u4e0d\u4e00\u6837\u3002"),(0,t.kt)("p",null,"\u6765\u4e2ademo\n\u5728META-INF/\u76ee\u5f55\u4e0b\u521b\u5efaspring.factories\u6587\u4ef6\uff0cLoadBalance\u4e3a\u952e\uff0cRandomLoadBalance\u4e3a\u503c"),(0,t.kt)("p",null,"\u6d4b\u8bd5\uff1a"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},'public class SpringFactoriesLoaderDemo {\n\n  public static void main(String[] args) {\n    List<LoadBalance> loadBalances = SpringFactoriesLoader.loadFactories(LoadBalance.class, MyEnableAutoConfiguration.class.getClassLoader());\n    for (LoadBalance loadBalance : loadBalances) {\n      System.out.println("\u83b7\u53d6\u5230LoadBalance\u5bf9\u8c61:" + loadBalance);\n    }\n  }\n\n}\n')),(0,t.kt)("p",null,"\u8fd0\u884c\u7ed3\u679c\uff1a"),(0,t.kt)("p",null,"\u56fe\u7247\n\u6210\u529f\u83b7\u53d6\u5230\u4e86\u5b9e\u73b0\u5bf9\u8c61\u3002"),(0,t.kt)("p",null,"\u6838\u5fc3\u539f\u7406\n\u5982\u4e0b\u662fSpringFactoriesLoader\u4e2d\u4e00\u6bb5\u6838\u5fc3\u4ee3\u7801"),(0,t.kt)("p",null,"\u56fe\u7247\n\u5176\u5b9e\u4ece\u8fd9\u53ef\u4ee5\u770b\u51fa\uff0c\u8ddfJava\u5b9e\u73b0\u7684\u5dee\u4e0d\u591a\uff0c\u53ea\u4e0d\u8fc7\u8bfb\u7684\u662fMETA-INF/\u76ee\u5f55\u4e0bspring.factories\u6587\u4ef6\u5185\u5bb9\uff0c\u7136\u540e\u89e3\u6790\u51fa\u6765\u952e\u503c\u5bf9\u3002"),(0,t.kt)("h3",{id:"\u4f7f\u7528\u573a\u666f-1"},"\u4f7f\u7528\u573a\u666f"),(0,t.kt)("p",null,"Spring\u7684SPI\u673a\u5236\u5728\u5185\u90e8\u4f7f\u7528\u7684\u975e\u5e38\u591a\uff0c\u5c24\u5176\u5728SpringBoot\u4e2d\u5927\u91cf\u4f7f\u7528\uff0cSpringBoot\u542f\u52a8\u8fc7\u7a0b\u4e2d\u5f88\u591a\u6269\u5c55\u70b9\u90fd\u662f\u901a\u8fc7SPI\u673a\u5236\u6765\u5b9e\u73b0\u7684\uff0c\u8fd9\u91cc\u6211\u4e3e\u4e24\u4e2a\u4f8b\u5b50"),(0,t.kt)("ol",null,(0,t.kt)("li",{parentName:"ol"},"\u81ea\u52a8\u88c5\u914d")),(0,t.kt)("p",null,"\u5728SpringBoot3.0\u4e4b\u524d\u7684\u7248\u672c\uff0c\u81ea\u52a8\u88c5\u914d\u662f\u901a\u8fc7SpringFactoriesLoader\u6765\u52a0\u8f7d\u7684\u3002"),(0,t.kt)("p",null,"\u56fe\u7247\n\u4f46\u662fSpringBoot3.0\u4e4b\u540e\u4e0d\u518d\u4f7f\u7528SpringFactoriesLoader\uff0c\u800c\u662fSpring\u91cd\u65b0\u4eceMETA-INF/spring/\u76ee\u5f55\u4e0b\u7684org.springframework.boot.autoconfigure.AutoConfiguration.imports\u6587\u4ef6\u4e2d\u8bfb\u53d6\u4e86\u3002"),(0,t.kt)("p",null,"\u56fe\u7247\n\u81f3\u4e8e\u5982\u4f55\u8bfb\u53d6\u7684\uff0c\u5176\u5b9e\u731c\u4e5f\u80fd\u731c\u5230\u5c31\u8ddf\u4e0a\u9762SPI\u673a\u5236\u8bfb\u53d6\u7684\u65b9\u5f0f\u5927\u6982\u5dee\u4e0d\u591a\uff0c\u5c31\u662f\u6587\u4ef6\u8def\u5f84\u548c\u540d\u79f0\u4e0d\u4e00\u6837\u3002"),(0,t.kt)("ol",{start:2},(0,t.kt)("li",{parentName:"ol"},"PropertySourceLoader\u7684\u52a0\u8f7d")),(0,t.kt)("p",null,"PropertySourceLoader\u662f\u7528\u6765\u89e3\u6790application\u914d\u7f6e\u6587\u4ef6\u7684\uff0c\u5b83\u662f\u4e00\u4e2a\u63a5\u53e3"),(0,t.kt)("p",null,"\u56fe\u7247\nSpringBoot\u9ed8\u8ba4\u63d0\u4f9b\u4e86 PropertiesPropertySourceLoader \u548c YamlPropertySourceLoader\u4e24\u4e2a\u5b9e\u73b0\uff0c\u5c31\u662f\u5bf9\u5e94properties\u548cyaml\u6587\u4ef6\u683c\u5f0f\u7684\u89e3\u6790\u3002"),(0,t.kt)("p",null,"SpringBoot\u5728\u52a0\u8f7dPropertySourceLoader\u65f6\u5c31\u7528\u4e86SPI\u673a\u5236"),(0,t.kt)("p",null,"\u56fe\u7247"),(0,t.kt)("h3",{id:"\u4e0ejava-spi\u673a\u5236\u5bf9\u6bd4"},"\u4e0eJava SPI\u673a\u5236\u5bf9\u6bd4"),(0,t.kt)("p",null,"\u9996\u5148Spring\u7684SPI\u673a\u5236\u5bf9Java\u7684SPI\u673a\u5236\u5bf9\u8fdb\u884c\u4e86\u4e00\u4e9b\u7b80\u5316\uff0cJava\u7684SPI\u6bcf\u4e2a\u63a5\u53e3\u90fd\u9700\u8981\u5bf9\u5e94\u7684\u6587\u4ef6\uff0c\u800cSpring\u7684SPI\u673a\u5236\u53ea\u9700\u8981\u4e00\u4e2aspring.factories\u6587\u4ef6\u3002"),(0,t.kt)("p",null,"\u5176\u6b21\u662f\u5185\u5bb9\uff0cJava\u7684SPI\u673a\u5236\u6587\u4ef6\u5185\u5bb9\u5fc5\u987b\u4e3a\u63a5\u53e3\u7684\u5b9e\u73b0\u7c7b\uff0c\u800cSpring\u7684SPI\u5e76\u4e0d\u8981\u6c42\u952e\u503c\u5bf9\u5fc5\u987b\u6709\u4ec0\u4e48\u5173\u7cfb\uff0c\u66f4\u52a0\u7075\u6d3b\u3002"),(0,t.kt)("p",null,"\u7b2c\u4e09\u70b9\u5c31\u662fSpring\u7684SPI\u673a\u5236\u63d0\u4f9b\u4e86\u83b7\u53d6\u7c7b\u9650\u5b9a\u540d\u7684\u65b9\u6cd5loadFactoryNames\uff0c\u800cJava\u7684SPI\u673a\u5236\u662f\u6ca1\u6709\u7684\u3002\u901a\u8fc7\u8fd9\u4e2a\u65b9\u6cd5\u83b7\u53d6\u5230\u7c7b\u9650\u5b9a\u540d\u4e4b\u540e\u5c31\u53ef\u4ee5\u5c06\u8fd9\u4e9b\u7c7b\u6ce8\u5165\u5230Spring\u5bb9\u5668\u4e2d\uff0c\u7528Spring\u5bb9\u5668\u52a0\u8f7d\u8fd9\u4e9bBean\uff0c\u800c\u4e0d\u4ec5\u4ec5\u662f\u901a\u8fc7\u53cd\u5c04\u3002"),(0,t.kt)("p",null,"\u4f46\u662fSpring\u7684SPI\u4e5f\u540c\u6837\u6ca1\u6709\u5b9e\u73b0\u83b7\u53d6\u6307\u5b9a\u67d0\u4e2a\u6307\u5b9a\u5b9e\u73b0\u7c7b\u7684\u529f\u80fd\uff0c\u6240\u4ee5\u8981\u60f3\u80fd\u591f\u627e\u5230\u5177\u4f53\u7684\u67d0\u4e2a\u5b9e\u73b0\u7c7b\uff0c\u8fd8\u5f97\u4f9d\u9760\u5177\u4f53\u63a5\u53e3\u7684\u8bbe\u8ba1\u3002"),(0,t.kt)("p",null,"\u6240\u4ee5\u4e0d\u77e5\u9053\u4f60\u6709\u6ca1\u6709\u53d1\u73b0\uff0cPropertySourceLoader\u5b83\u5176\u5b9e\u5c31\u662f\u4e00\u4e2a\u7b56\u7565\u63a5\u53e3\uff0c\u6ce8\u91ca\u4e5f\u6709\u8bf4\uff0c\u6240\u4ee5\u5f53\u4f60\u7684\u914d\u7f6e\u6587\u4ef6\u662fproperties\u683c\u5f0f\u7684\u65f6\u5019\uff0c\u4ed6\u53ef\u4ee5\u627e\u5230\u89e3\u6790properties\u683c\u5f0f\u7684PropertiesPropertySourceLoader\u5bf9\u8c61\u6765\u89e3\u6790\u914d\u7f6e\u6587\u4ef6\u3002"),(0,t.kt)("h2",{id:"4-dubbo-spi\u673a\u5236--extensionloader"},"4. Dubbo SPI\u673a\u5236--ExtensionLoader"),(0,t.kt)("p",null,(0,t.kt)("inlineCode",{parentName:"p"},"ExtensionLoader")," \u662fdubbo\u7684SPI\u673a\u5236\u7684\u5b9e\u73b0\u7c7b\u3002\u6bcf\u4e00\u4e2a\u63a5\u53e3\u90fd\u4f1a\u6709\u4e00\u4e2a\u81ea\u5df1\u7684ExtensionLoader\u5b9e\u4f8b\u5bf9\u8c61\uff0c\u8fd9\u70b9\u8ddfJava\u7684SPI\u673a\u5236\u662f\u4e00\u6837\u7684\u3002"),(0,t.kt)("p",null,"\u540c\u6837\u5730\uff0cDubbo\u7684SPI\u673a\u5236\u4e5f\u505a\u4e86\u4ee5\u4e0b\u51e0\u70b9\u7ea6\u5b9a\uff1a"),(0,t.kt)("p",null,"\u63a5\u53e3\u5fc5\u987b\u8981\u52a0@SPI\u6ce8\u89e3\n\u914d\u7f6e\u6587\u4ef6\u53ef\u4ee5\u653e\u5728",(0,t.kt)("inlineCode",{parentName:"p"},"META-INF/services/"),"\u3001",(0,t.kt)("inlineCode",{parentName:"p"},"META-INF/dubbo/internal/")," \u3001",(0,t.kt)("inlineCode",{parentName:"p"},"META-INF/dubbo/")," \u3001",(0,t.kt)("inlineCode",{parentName:"p"},"META-INF/dubbo/external/"),"\u8fd9\u56db\u4e2a\u76ee\u5f55\u5e95\u4e0b\uff0c\u6587\u4ef6\u540d\u4e5f\u662f\u63a5\u53e3\u7684\u5168\u9650\u5b9a\u540d\n\u5185\u5bb9\u4e3a\u952e\u503c\u5bf9\uff0c\u952e\u4e3a\u77ed\u540d\u79f0\uff08\u53ef\u4ee5\u7406\u89e3\u4e3aspring\u4e2dBean\u7684\u540d\u79f0\uff09\uff0c\u503c\u4e3a\u5b9e\u73b0\u7c7b\u7684\u5168\u9650\u5b9a\u540d\n\u5148\u6765\u4e2ademo\n\u9996\u5148\u5728LoadBalance\u63a5\u53e3\u4e0a@SPI\u6ce8\u89e3"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},"@SPI\npublic interface LoadBalance {\n\n}\n")),(0,t.kt)("p",null,"\u7136\u540e\uff0c\u4fee\u6539\u4e00\u4e0bJava\u7684SPI\u673a\u5236\u6d4b\u8bd5\u65f6\u914d\u7f6e\u6587\u4ef6\u5185\u5bb9\uff0c\u6539\u4e3a\u952e\u503c\u5bf9\uff0c\u56e0\u4e3aDubbo\u7684SPI\u673a\u5236\u4e5f\u53ef\u4ee5\u4eceMETA-INF/services/\u76ee\u5f55\u4e0b\u8bfb\u53d6\u6587\u4ef6\uff0c\u6240\u4ee5\u8fd9\u91cc\u5c31\u6ca1\u91cd\u5199\u6587\u4ef6"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-properties"},"random=com.sanyou.spi.demo.RandomLoadBalance\n")),(0,t.kt)("p",null,"\u6d4b\u8bd5\u7c7b\uff1a"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},'public class ExtensionLoaderDemo {\n\n  public static void main(String[] args) {\n    ExtensionLoader<LoadBalance> extensionLoader = ExtensionLoader.getExtensionLoader(LoadBalance.class);\n    LoadBalance loadBalance = extensionLoader.getExtension("random");\n    System.out.println("\u83b7\u53d6\u5230random\u952e\u5bf9\u5e94\u7684\u5b9e\u73b0\u7c7b\u5bf9\u8c61\uff1a" + loadBalance);\n  }\n\n}\n')),(0,t.kt)("p",null,"\u901a\u8fc7ExtensionLoader\u7684getExtension\u65b9\u6cd5\uff0c\u4f20\u5165\u77ed\u540d\u79f0\uff0c\u8fd9\u6837\u5c31\u53ef\u4ee5\u7cbe\u786e\u5730\u627e\u5230\u77ed\u540d\u79f0\u5bf9\u7684\u5b9e\u73b0\u7c7b\u3002"),(0,t.kt)("p",null,"\u6240\u4ee5\u4ece\u8fd9\u53ef\u4ee5\u770b\u51faDubbo\u7684SPI\u673a\u5236\u89e3\u51b3\u4e86\u524d\u9762\u63d0\u5230\u7684\u65e0\u6cd5\u83b7\u53d6\u6307\u5b9a\u5b9e\u73b0\u7c7b\u7684\u95ee\u9898\u3002"),(0,t.kt)("p",null,"\u6d4b\u8bd5\u7ed3\u679c\uff1a"),(0,t.kt)("p",null,"\u56fe\u7247\ndubbo\u7684SPI\u673a\u5236\u9664\u4e86\u89e3\u51b3\u4e86\u65e0\u6cd5\u83b7\u53d6\u6307\u5b9a\u5b9e\u73b0\u7c7b\u7684\u95ee\u9898\uff0c\u8fd8\u63d0\u4f9b\u4e86\u5f88\u591a\u989d\u5916\u7684\u529f\u80fd\uff0c\u8fd9\u4e9b\u529f\u80fd\u5728dubbo\u5185\u90e8\u7528\u7684\u975e\u5e38\u591a\uff0c\u63a5\u4e0b\u6765\u5c31\u6765\u8be6\u7ec6\u8bb2\u8bb2\u3002"),(0,t.kt)("h3",{id:"dubbo\u6838\u5fc3\u673a\u5236"},"dubbo\u6838\u5fc3\u673a\u5236"),(0,t.kt)("h4",{id:"1\u81ea\u9002\u5e94\u673a\u5236"},"1\u3001\u81ea\u9002\u5e94\u673a\u5236"),(0,t.kt)("p",null,"\u81ea\u9002\u5e94\uff0c\u81ea\u9002\u5e94\u6269\u5c55\u7c7b\u7684\u542b\u4e49\u662f\u8bf4\uff0c\u57fa\u4e8e\u53c2\u6570\uff0c\u5728\u8fd0\u884c\u65f6\u52a8\u6001\u9009\u62e9\u5230\u5177\u4f53\u7684\u76ee\u6807\u7c7b\uff0c\u7136\u540e\u6267\u884c\u3002"),(0,t.kt)("p",null,"\u6bcf\u4e2a\u63a5\u53e3\u6709\u4e14\u53ea\u80fd\u6709\u4e00\u4e2a\u81ea\u9002\u5e94\u7c7b\uff0c\u901a\u8fc7ExtensionLoader\u7684getAdaptiveExtension\u65b9\u6cd5\u5c31\u53ef\u4ee5\u83b7\u53d6\u5230\u8fd9\u4e2a\u7c7b\u7684\u5bf9\u8c61\uff0c\u8fd9\u4e2a\u5bf9\u8c61\u53ef\u4ee5\u6839\u636e\u8fd0\u884c\u65f6\u5177\u4f53\u7684\u53c2\u6570\u627e\u5230\u76ee\u6807\u5b9e\u73b0\u7c7b\u5bf9\u8c61\uff0c\u7136\u540e\u8c03\u7528\u76ee\u6807\u5bf9\u8c61\u7684\u65b9\u6cd5\u3002"),(0,t.kt)("p",null,"\u4e3e\u4e2a\u4f8b\u5b50\uff0c\u5047\u8bbe\u4e0a\u9762\u7684LoadBalance\u6709\u4e2a\u81ea\u9002\u5e94\u5bf9\u8c61\uff0c\u90a3\u4e48\u83b7\u53d6\u5230\u8fd9\u4e2a\u81ea\u9002\u5e94\u5bf9\u8c61\u4e4b\u540e\uff0c\u5982\u679c\u5728\u8fd0\u884c\u671f\u95f4\u4f20\u5165\u4e86random\u8fd9\u4e2akey\uff0c\u90a3\u4e48\u8fd9\u4e2a\u81ea\u9002\u5e94\u5bf9\u8c61\u5c31\u4f1a\u627e\u5230random\u8fd9\u4e2akey\u5bf9\u5e94\u7684\u5b9e\u73b0\u7c7b\uff0c\u8c03\u7528\u90a3\u4e2a\u5b9e\u73b0\u7c7b\u7684\u65b9\u6cd5\uff0c\u5982\u679c\u52a8\u6001\u4f20\u5165\u4e86\u5176\u5b83\u7684key\uff0c\u5c31\u8def\u7531\u5230\u5176\u5b83\u7684\u5b9e\u73b0\u7c7b\u3002"),(0,t.kt)("p",null,"\u81ea\u9002\u5e94\u7c7b\u6709\u4e24\u79cd\u65b9\u5f0f\u4ea7\u751f\uff0c\u7b2c\u4e00\u79cd\u5c31\u662f\u81ea\u5df1\u6307\u5b9a\uff0c\u5728\u63a5\u53e3\u7684\u5b9e\u73b0\u7c7b\u4e0a\u52a0@Adaptive\u6ce8\u89e3\uff0c\u90a3\u4e48\u8fd9\u4e2a\u8fd9\u4e2a\u5b9e\u73b0\u7c7b\u5c31\u662f\u81ea\u9002\u5e94\u5b9e\u73b0\u7c7b\u3002"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},"@Adaptive\npublic class RandomLoadBalance implements LoadBalance{\n}\n")),(0,t.kt)("p",null,"\u9664\u4e86\u81ea\u5df1\u4ee3\u7801\u6307\u5b9a\uff0c\u8fd8\u6709\u4e00\u79cd\u5c31\u662fdubbo\u4f1a\u6839\u636e\u4e00\u4e9b\u6761\u4ef6\u5e2e\u4f60\u52a8\u6001\u751f\u6210\u4e00\u4e2a\u81ea\u9002\u5e94\u7c7b\uff0c\u751f\u6210\u8fc7\u7a0b\u6bd4\u8f83\u590d\u6742\uff0c\u8fd9\u91cc\u5c31\u4e0d\u5c55\u5f00\u4e86\u3002"),(0,t.kt)("p",null,"\u81ea\u9002\u5e94\u673a\u5236\u5728Dubbo\u4e2d\u7528\u7684\u975e\u5e38\u591a\uff0c\u800c\u4e14\u5f88\u591a\u90fd\u662f\u81ea\u52a8\u751f\u6210\u7684\uff0c\u5982\u679c\u4f60\u4e0d\u77e5\u9053Dubbo\u7684\u81ea\u9002\u5e94\u673a\u5236\uff0c\u4f60\u5728\u8bfb\u6e90\u7801\u7684\u65f6\u5019\u53ef\u80fd\u90fd\u4e0d\u77e5\u9053\u4e3a\u4ec0\u4e48\u4ee3\u7801\u53ef\u4ee5\u8d70\u5230\u90a3\u91cc\u3002\u3002"),(0,t.kt)("h4",{id:"2ioc\u548caop"},"2\u3001IOC\u548cAOP"),(0,t.kt)("p",null,"\u4e00\u63d0\u5230IOC\u548cAOP\uff0c\u7acb\u9a6c\u60f3\u5230\u7684\u90fd\u662fSpring\uff0c\u4f46\u662fIOC\u548cAOP\u5e76\u4e0d\u662fSpring\u7279\u6709\u7684\u6982\u5ff5\uff0cDubbo\u4e5f\u5b9e\u73b0IOC\u548cAOP\u7684\u529f\u80fd\uff0c\u4f46\u662f\u662f\u4e00\u4e2a\u8f7b\u91cf\u7ea7\u7684\u3002"),(0,t.kt)("ol",null,(0,t.kt)("li",{parentName:"ol"},"\u4f9d\u8d56\u6ce8\u5165")),(0,t.kt)("p",null,"Dubbo\u4f9d\u8d56\u6ce8\u5165\u662f\u901a\u8fc7setter\u6ce8\u5165\u7684\u65b9\u5f0f\uff0c\u6ce8\u5165\u7684\u5bf9\u8c61\u9ed8\u8ba4\u5c31\u662f\u4e0a\u9762\u63d0\u5230\u7684\u81ea\u9002\u5e94\u7684\u5bf9\u8c61\uff0c\u5728Spring\u73af\u5883\u4e0b\u53ef\u4ee5\u6ce8\u5165Spring Bean\u3002"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},"public class RoundRobinLoadBalance implements LoadBalance {\n\n  private LoadBalance loadBalance;\n\n  public void setLoadBalance(LoadBalance loadBalance) {\n    this.loadBalance = loadBalance;\n  }\n\n}\n")),(0,t.kt)("p",null,"\u5982\u4e0a\u4ee3\u7801\uff0cRoundRobinLoadBalance\u4e2d\u6709\u4e00\u4e2asetLoadBalance\u65b9\u6cd5\uff0c\u53c2\u6570LoadBalance\uff0c\u5728\u521b\u5efaRoundRobinLoadBalance\u7684\u65f6\u5019\uff0c\u5728\u975eSpring\u73af\u5883\u5e95\u4e0b\uff0cDubbo\u5c31\u4f1a\u627e\u5230LoadBalance\u81ea\u9002\u5e94\u5bf9\u8c61\u7136\u540e\u901a\u8fc7\u53cd\u5c04\u6ce8\u5165\u3002"),(0,t.kt)("p",null,"\u8fd9\u79cd\u65b9\u5f0f\u5728Dubbo\u4e2d\u4e5f\u5f88\u5e38\u89c1\uff0c\u6bd4\u5982\u5982\u4e0b\u7684\u4e00\u4e2a\u573a\u666f"),(0,t.kt)("p",null,"\u56fe\u7247\n",(0,t.kt)("inlineCode",{parentName:"p"},"RegistryProtocol")," \u4e2d\u4f1a\u6ce8\u5165\u4e00\u4e2aProtocol\uff0c\u5176\u5b9e\u8fd9\u4e2a\u6ce8\u5165\u7684Protocol\u5c31\u662f\u4e00\u4e2a\u81ea\u9002\u5e94\u5bf9\u8c61\u3002"),(0,t.kt)("ol",{start:2},(0,t.kt)("li",{parentName:"ol"},"\u63a5\u53e3\u56de\u8c03")),(0,t.kt)("p",null,"Dubbo\u4e5f\u63d0\u4f9b\u4e86\u4e00\u4e9b\u7c7b\u4f3c\u4e8eSpring\u7684\u4e00\u4e9b\u63a5\u53e3\u7684\u56de\u8c03\u529f\u80fd\uff0c\u6bd4\u5982\u8bf4\uff0c\u5982\u679c\u4f60\u7684\u7c7b\u5b9e\u73b0\u4e86Lifecycle\u63a5\u53e3\uff0c\u90a3\u4e48\u521b\u5efa\u6216\u8005\u9500\u6bc1\u7684\u65f6\u5019\u5c31\u4f1a\u56de\u8c03\u4ee5\u4e0b\u51e0\u4e2a\u65b9\u6cd5"),(0,t.kt)("p",null,"\u56fe\u7247\n\u5728dubbo3.x\u7684\u67d0\u4e2a\u7248\u672c\u4e4b\u540e\uff0cdubbo\u63d0\u4f9b\u4e86\u66f4\u591a\u63a5\u53e3\u56de\u8c03\uff0c\u6bd4\u5982\u8bf4ExtensionPostProcessor\u3001ExtensionAccessorAware\uff0c\u547d\u540d\u8ddfSpring\u7684\u975e\u5e38\u76f8\u4f3c\uff0c\u4f5c\u7528\u4e5f\u5dee\u4e0d\u591a\u3002"),(0,t.kt)("ol",{start:3},(0,t.kt)("li",{parentName:"ol"},"\u81ea\u52a8\u5305\u88c5")),(0,t.kt)("p",null,"\u81ea\u52a8\u5305\u88c5\u5176\u5b9e\u5c31\u662faop\u7684\u529f\u80fd\u5b9e\u73b0\uff0c\u5bf9\u76ee\u6807\u5bf9\u8c61\u8fdb\u884c\u4ee3\u7406\uff0c\u5e76\u4e14\u8fd9\u4e2aaop\u529f\u80fd\u5728\u9ed8\u8ba4\u60c5\u51b5\u4e0b\u5c31\u662f\u5f00\u542f\u7684\u3002"),(0,t.kt)("p",null,"\u5728Dubbo\u4e2dSPI\u63a5\u53e3\u7684\u5b9e\u73b0\u4e2d\uff0c\u6709\u4e00\u79cd\u7279\u6b8a\u7684\u7c7b\uff0c\u88ab\u79f0\u4e3aWrapper\u7c7b\uff0c\u8fd9\u4e2a\u7c7b\u7684\u4f5c\u7528\u5c31\u662f\u6765\u5b9e\u73b0AOP\u7684\u3002"),(0,t.kt)("p",null,"\u5224\u65adWrapper\u7c7b\u7684\u552f\u4e00\u6807\u51c6\u5c31\u662f\u8fd9\u4e2a\u7c7b\u4e2d\u5fc5\u987b\u8981\u6709\u8fd9\u4e48\u4e00\u4e2a\u6784\u9020\u53c2\u6570\uff0c\u8fd9\u4e2a\u6784\u9020\u65b9\u6cd5\u7684\u53c2\u6570\u53ea\u6709\u4e00\u4e2a\uff0c\u5e76\u4e14\u53c2\u6570\u7c7b\u578b\u5c31\u662f\u63a5\u53e3\u7684\u7c7b\u578b\uff0c\u5982\u4e0b\u4ee3\u7801\uff1a"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},"public class RoundRobinLoadBalance implements LoadBalance {\n\n  private final LoadBalance loadBalance;\n\n  public RoundRobinLoadBalance(LoadBalance loadBalance) {\n    this.loadBalance = loadBalance;\n  }\n\n}\n")),(0,t.kt)("p",null,"\u6b64\u65f6RoundRobinLoadBalance\u5c31\u662f\u4e00\u4e2aWrapper\u7c7b\u3002"),(0,t.kt)("p",null,"\u5f53\u901a\u8fc7random\u83b7\u53d6RandomLoadBalance\u76ee\u6807\u5bf9\u8c61\u65f6\uff0c\u90a3\u4e48\u9ed8\u8ba4\u60c5\u51b5\u4e0b\u5c31\u4f1a\u5bf9RandomLoadBalance\u8fdb\u884c\u5305\u88c5\uff0c\u771f\u6b63\u83b7\u53d6\u5230\u7684\u5176\u5b9e\u662fRoundRobinLoadBalance\u5bf9\u8c61\uff0cRoundRobinLoadBalance\u5185\u90e8\u5f15\u7528\u7684\u5bf9\u8c61\u662fRandomLoadBalance\u3002"),(0,t.kt)("p",null,(0,t.kt)("em",{parentName:"p"},"\u6d4b\u8bd5\u4e00\u4e0b ")),(0,t.kt)("p",null,"\u5728\u914d\u7f6e\u6587\u4ef6\u4e2d\u52a0\u5165"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-properties"},"roundrobin=com.sanyou.spi.demo.RoundRobinLoadBalance\n")),(0,t.kt)("p",null,"\u6d4b\u8bd5\u7ed3\u679c"),(0,t.kt)("p",null,"\u56fe\u7247\n\u4ece\u7ed3\u679c\u53ef\u4ee5\u770b\u51fa\uff0c\u867d\u7136\u6307\u5b9a\u4e86random\uff0c\u4f46\u662f\u5b9e\u9645\u83b7\u53d6\u5230\u7684\u662fRoundRobinLoadBalance\uff0c\u800cRoundRobinLoadBalance\u5185\u90e8\u5f15\u7528\u4e86RandomLoadBalance\u3002"),(0,t.kt)("p",null,"\u5982\u679c\u6709\u5f88\u591a\u7684\u5305\u88c5\u7c7b\uff0c\u90a3\u4e48\u5c31\u4f1a\u5f62\u6210\u4e00\u4e2a\u8d23\u4efb\u94fe\u6761\uff0c\u4e00\u4e2a\u5957\u4e00\u4e2a\u3002"),(0,t.kt)("p",null,"\u6240\u4ee5dubbo\u7684aop\u8ddfspring\u7684aop\u5b9e\u73b0\u662f\u4e0d\u4e00\u6837\u7684\uff0cspring\u7684aop\u5e95\u5c42\u662f\u57fa\u4e8e\u52a8\u6001\u4ee3\u7406\u6765\u7684\uff0c\u800cdubbo\u7684aop\u5176\u5b9e\u7b97\u662f\u9759\u6001\u4ee3\u7406\uff0cdubbo\u4f1a\u5e2e\u4f60\u81ea\u52a8\u7ec4\u88c5\u8fd9\u4e2a\u4ee3\u7406\uff0c\u5f62\u6210\u4e00\u6761\u8d23\u4efb\u94fe\u3002"),(0,t.kt)("p",null,"\u5230\u8fd9\u5176\u5b9e\u6211\u4eec\u5df2\u7ecf\u77e5\u9053\uff0cdubbo\u7684spi\u63a5\u53e3\u7684\u5b9e\u73b0\u7c7b\u5df2\u7ecf\u6709\u4e24\u79cd\u7c7b\u578b\u4e86\uff1a"),(0,t.kt)("ul",null,(0,t.kt)("li",{parentName:"ul"},"\u81ea\u9002\u5e94\u7c7b"),(0,t.kt)("li",{parentName:"ul"},"Wrapper\u7c7b")),(0,t.kt)("p",null,"\u9664\u4e86\u8fd9\u4e24\u79cd\u7c7b\u578b\uff0c\u5176\u5b9e\u8fd8\u6709\u4e00\u79cd\uff0c\u53eb\u505a\u9ed8\u8ba4\u7c7b\uff0c\u5c31\u662f@SPI\u6ce8\u89e3\u7684\u503c\u5bf9\u5e94\u7684\u5b9e\u73b0\u7c7b\uff0c\u6bd4\u5982"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},'@SPI("random")\npublic interface LoadBalance {\n\n}\n')),(0,t.kt)("p",null,"\u6b64\u65f6random\u8fd9\u4e2akey\u5bf9\u5e94\u7684\u5b9e\u73b0\u7c7b\u5c31\u662f\u9ed8\u8ba4\u5b9e\u73b0\uff0c\u901a\u8fc7getDefaultExtension\u8fd9\u4e2a\u65b9\u6cd5\u5c31\u53ef\u4ee5\u83b7\u53d6\u5230\u9ed8\u8ba4\u5b9e\u73b0\u5bf9\u8c61\u3002"),(0,t.kt)("h4",{id:"3\u81ea\u52a8\u6fc0\u6d3b"},"3\u3001\u81ea\u52a8\u6fc0\u6d3b"),(0,t.kt)("p",null,"\u6240\u8c13\u7684\u81ea\u52a8\u6fc0\u6d3b\uff0c\u5c31\u662f\u6839\u636e\u4f60\u7684\u5165\u53c2\uff0c\u52a8\u6001\u5730\u9009\u62e9\u4e00\u6279\u5b9e\u73b0\u7c7b\u8fd4\u56de\u7ed9\u4f60\u3002"),(0,t.kt)("p",null,"\u81ea\u52a8\u6fc0\u6d3b\u7684\u5b9e\u73b0\u7c7b\u4e0a\u9700\u8981\u52a0\u4e0aActivate\u6ce8\u89e3\uff0c\u8fd9\u91cc\u5c31\u53c8\u5b66\u4e60\u4e86\u4e00\u79cd\u5b9e\u73b0\u7c7b\u7684\u5206\u7c7b\u3002"),(0,t.kt)("pre",null,(0,t.kt)("code",{parentName:"pre",className:"language-java"},"@Activate\npublic interface RandomLoadBalance {\n\n}\n")),(0,t.kt)("p",null,"\u6b64\u65f6RandomLoadBalance\u5c31\u5c5e\u4e8e\u53ef\u4ee5\u88ab\u81ea\u52a8\u6fc0\u6d3b\u7684\u7c7b\u3002"),(0,t.kt)("p",null,"\u83b7\u53d6\u81ea\u52a8\u6fc0\u6d3b\u7c7b\u7684\u65b9\u6cd5\u662fgetActivateExtension\uff0c\u6240\u4ee5\u6839\u636e\u8fd9\u4e2a\u65b9\u6cd5\u7684\u5165\u53c2\uff0c\u53ef\u4ee5\u52a8\u6001\u9009\u62e9\u4e00\u6279\u5b9e\u73b0\u7c7b\u3002"),(0,t.kt)("p",null,"\u81ea\u52a8\u6fc0\u6d3b\u8fd9\u4e2a\u673a\u5236\u5728Dubbo\u4e00\u4e2a\u6838\u5fc3\u7684\u4f7f\u7528\u573a\u666f\u5c31\u662fFilter\u8fc7\u6ee4\u5668\u94fe\u4e2d\u3002"),(0,t.kt)("p",null,"Filter\u662fdubbo\u4e2d\u7684\u4e00\u4e2a\u6269\u5c55\u70b9\uff0c\u53ef\u4ee5\u5728\u8bf7\u6c42\u53d1\u8d77\u524d\u6216\u8005\u662f\u54cd\u5e94\u83b7\u53d6\u4e4b\u540e\u5c31\u884c\u62e6\u622a\uff0c\u4f5c\u7528\u6709\u70b9\u50cfSpring MVC\u4e2d\u7684HandlerInterceptor\u3002"),(0,t.kt)("p",null,"\u56fe\u7247Filter\u7684\u4e00\u4e9b\u5b9e\u73b0\u7c7b"),(0,t.kt)("p",null,"\u5982\u4e0aFilter\u6709\u5f88\u591a\u5b9e\u73b0\uff0c\u6240\u4ee5\u4e3a\u4e86\u80fd\u591f\u533a\u5206Filter\u7684\u5b9e\u73b0\u662f\u4f5c\u7528\u4e8eprovider\u7684\u8fd8\u662fconsumer\u7aef\uff0c\u6240\u4ee5\u5c31\u53ef\u4ee5\u7528\u81ea\u52a8\u6fc0\u6d3b\u7684\u673a\u5236\u6765\u6839\u636e\u5165\u53c2\u6765\u52a8\u6001\u9009\u62e9\u4e00\u6279Filter\u5b9e\u73b0\u3002"),(0,t.kt)("p",null,"\u6bd4\u5982\u8bf4ConsumerContextFilter\u8fd9\u4e2aFilter\u5c31\u4f5c\u7528\u4e8eConsumer\u7aef\u3002"),(0,t.kt)("p",null,"\u56fe\u7247ConsumerContextFilter"),(0,t.kt)("h2",{id:"5-\u603b\u7ed3"},"5. \u603b\u7ed3"),(0,t.kt)("p",null,"\u901a\u8fc7\u4ee5\u4e0a\u5206\u6790\u53ef\u4ee5\u770b\u51fa\uff0c\u5b9e\u73b0SPI\u673a\u5236\u7684\u6838\u5fc3\u539f\u7406\u5c31\u662f\u901a\u8fc7IO\u6d41\u8bfb\u53d6\u6307\u5b9a\u6587\u4ef6\u7684\u5185\u5bb9\uff0c\u7136\u540e\u89e3\u6790\uff0c\u6700\u540e\u52a0\u5165\u4e00\u4e9b\u81ea\u5df1\u7684\u7279\u6027\u3002"),(0,t.kt)("p",null,"\u6700\u540e\u603b\u7684\u6765\u8bf4\uff0cJava\u7684SPI\u5b9e\u73b0\u7684\u6bd4\u8f83\u7b80\u5355\uff0c\u5e76\u6ca1\u6709\u4ec0\u4e48\u5176\u5b83\u529f\u80fd\uff1bSpring\u5f97\u76ca\u4e8e\u81ea\u8eab\u7684ioc\u548caop\u7684\u529f\u80fd\uff0c\u6240\u4ee5\u4e5f\u6ca1\u6709\u5b9e\u73b0\u592a\u590d\u6742\u7684SPI\u673a\u5236\uff0c\u4ec5\u4ec5\u662f\u5bf9Java\u505a\u4e86\u4e00\u70b9\u7b80\u5316\u548c\u4f18\u5316\uff1b\u4f46\u662fdubbo\u7684SPI\u673a\u5236\u4e3a\u4e86\u6ee1\u8db3\u81ea\u8eab\u6846\u67b6\u7684\u4f7f\u7528\u8981\u6c42\uff0c\u5b9e\u73b0\u7684\u529f\u80fd\u5c31\u6bd4\u8f83\u591a\uff0c\u4e0d\u4ec5\u5c06ioc\u548caop\u7684\u529f\u80fd\u96c6\u6210\u5230SPI\u673a\u5236\u4e2d\uff0c\u8fd8\u63d0\u4f9b\u6ce8\u5165\u81ea\u9002\u5e94\u548c\u81ea\u52a8\u6fc0\u6d3b\u7b49\u529f\u80fd\u3002"),(0,t.kt)("p",null,(0,t.kt)("a",{parentName:"p",href:"https://mp.weixin.qq.com/s/yU_TD1h24IsxRg1UsF6FLQ"},"SPI")))}s.isMDXComponent=!0}}]);