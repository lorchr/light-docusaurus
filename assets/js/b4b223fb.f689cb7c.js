"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[3543],{3905:(e,a,t)=>{t.d(a,{Zo:()=>u,kt:()=>s});var r=t(67294);function n(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function l(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);a&&(r=r.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?l(Object(t),!0).forEach((function(a){n(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):l(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function i(e,a){if(null==e)return{};var t,r,n=function(e,a){if(null==e)return{};var t,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)t=l[r],a.indexOf(t)>=0||(n[t]=e[t]);return n}(e,a);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)t=l[r],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var k=r.createContext({}),p=function(e){var a=r.useContext(k),t=a;return e&&(t="function"==typeof e?e(a):o(o({},a),e)),t},u=function(e){var a=p(e.components);return r.createElement(k.Provider,{value:a},e.children)},f="mdxType",c={inlineCode:"code",wrapper:function(e){var a=e.children;return r.createElement(r.Fragment,{},a)}},m=r.forwardRef((function(e,a){var t=e.components,n=e.mdxType,l=e.originalType,k=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),f=p(t),m=n,s=f["".concat(k,".").concat(m)]||f[m]||c[m]||l;return t?r.createElement(s,o(o({ref:a},u),{},{components:t})):r.createElement(s,o({ref:a},u))}));function s(e,a){var t=arguments,n=a&&a.mdxType;if("string"==typeof e||n){var l=t.length,o=new Array(l);o[0]=m;var i={};for(var k in a)hasOwnProperty.call(a,k)&&(i[k]=a[k]);i.originalType=e,i[f]="string"==typeof e?e:n,o[1]=i;for(var p=2;p<l;p++)o[p]=t[p];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}m.displayName="MDXCreateElement"},58080:(e,a,t)=>{t.r(a),t.d(a,{assets:()=>k,contentTitle:()=>o,default:()=>c,frontMatter:()=>l,metadata:()=>i,toc:()=>p});var r=t(87462),n=(t(67294),t(3905));const l={},o=void 0,i={unversionedId:"kafka/Kafka-7",id:"kafka/Kafka-7",title:"Kafka-7",description:"- Kafka\u7684\u76d1\u63a7\u548c\u6545\u969c\u6062\u590d",source:"@site/middleware/kafka/Kafka-7.md",sourceDirName:"kafka",slug:"/kafka/Kafka-7",permalink:"/light-docusaurus/middleware/kafka/Kafka-7",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/middleware/kafka/Kafka-7.md",tags:[],version:"current",lastUpdatedBy:"liuhui",lastUpdatedAt:1698312433,formattedLastUpdatedAt:"2023\u5e7410\u670826\u65e5",frontMatter:{}},k={},p=[{value:"\u524d\u8a00",id:"\u524d\u8a00",level:2},{value:"\u76d1\u63a7Kafka\u96c6\u7fa4",id:"\u76d1\u63a7kafka\u96c6\u7fa4",level:2},{value:"JMX\u76d1\u63a7\uff1a",id:"jmx\u76d1\u63a7",level:3},{value:"\u7b2c\u4e09\u65b9\u76d1\u63a7\u5de5\u5177\uff1a",id:"\u7b2c\u4e09\u65b9\u76d1\u63a7\u5de5\u5177",level:3},{value:"\u81ea\u5b9a\u4e49\u76d1\u63a7\u811a\u672c\uff1a",id:"\u81ea\u5b9a\u4e49\u76d1\u63a7\u811a\u672c",level:3},{value:"\u96c6\u7fa4\u76d1\u63a7\u6307\u6807\uff1a",id:"\u96c6\u7fa4\u76d1\u63a7\u6307\u6807",level:3},{value:"\u5904\u7406\u6545\u969c\u548c\u5b9e\u73b0\u6062\u590d",id:"\u5904\u7406\u6545\u969c\u548c\u5b9e\u73b0\u6062\u590d",level:2},{value:"\u603b\u7ed3\uff1a",id:"\u603b\u7ed3",level:2}],u={toc:p},f="wrapper";function c(e){let{components:a,...t}=e;return(0,n.kt)(f,(0,r.Z)({},u,t,{components:a,mdxType:"MDXLayout"}),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"https://mp.weixin.qq.com/s/ep5n6Z_kPXhcsj_4p3ZGoQ"},"Kafka\u7684\u76d1\u63a7\u548c\u6545\u969c\u6062\u590d"))),(0,n.kt)("h2",{id:"\u524d\u8a00"},"\u524d\u8a00"),(0,n.kt)("p",null,"\u8bf4\u5b8cKafka\u5728\u4f01\u4e1a\u7ea7\u5e94\u7528\u4e2d\u7684\u4f7f\u7528\u4e4b\u540e\uff0c\u63a5\u4e0b\u6765\u907f\u514d\u4e0d\u4e86\u7684\u8bdd\u9898\u5c31\u662f\u6545\u969c\u76d1\u63a7\u548c\u6062\u590d\u4e86\uff0c\u4eca\u5929\u54b1\u4eec\u4e5f\u6765\u804a\u804a\u8fd9\u4e2a\u8bdd\u9898"),(0,n.kt)("h2",{id:"\u76d1\u63a7kafka\u96c6\u7fa4"},"\u76d1\u63a7Kafka\u96c6\u7fa4"),(0,n.kt)("p",null,"Kafka\u96c6\u7fa4\u7684\u76d1\u63a7\u662f\u786e\u4fdd\u5176\u6b63\u5e38\u8fd0\u884c\u548c\u6027\u80fd\u4f18\u5316\u7684\u5173\u952e\u6b65\u9aa4\u3002\u4e0b\u9762\u5217\u51fa\u4e86\u4e00\u4e9b\u5e38\u7528\u7684\u65b9\u6cd5\u548c\u5de5\u5177\u6765\u76d1\u63a7Kafka\u96c6\u7fa4\uff1a"),(0,n.kt)("h3",{id:"jmx\u76d1\u63a7"},"JMX\u76d1\u63a7\uff1a"),(0,n.kt)("p",null,"Kafka\u63d0\u4f9b\u4e86JMX\uff08Java Management Extensions\uff09\u63a5\u53e3\uff0c\u53ef\u4ee5\u901a\u8fc7JMX\u6765\u76d1\u63a7\u548c\u7ba1\u7406Kafka\u96c6\u7fa4\u3002\u60a8\u53ef\u4ee5\u4f7f\u7528JConsole\u3001Java Mission Control\u7b49\u5de5\u5177\u8fde\u63a5\u5230Kafka Broker\u7684JMX\u7aef\u53e3\uff0c\u5e76\u76d1\u63a7\u5404\u79cd\u5173\u952e\u6307\u6807\uff0c\u5982\u541e\u5410\u91cf\u3001\u5ef6\u8fdf\u3001\u78c1\u76d8\u4f7f\u7528\u7387\u3001\u7f51\u7edc\u8fde\u63a5\u6570\u7b49\u3002\n\u56fe\u7247"),(0,n.kt)("h3",{id:"\u7b2c\u4e09\u65b9\u76d1\u63a7\u5de5\u5177"},"\u7b2c\u4e09\u65b9\u76d1\u63a7\u5de5\u5177\uff1a"),(0,n.kt)("p",null,"\u6709\u8bb8\u591a\u5f00\u6e90\u548c\u5546\u4e1a\u7684\u76d1\u63a7\u5de5\u5177\u53ef\u4ee5\u7528\u6765\u76d1\u63a7Kafka\u96c6\u7fa4\u3002\u4e00\u4e9b\u77e5\u540d\u7684\u5de5\u5177\u5305\u62ec\uff1a"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"Prometheus\uff1a\u4e00\u4e2a\u6d41\u884c\u7684\u5f00\u6e90\u76d1\u63a7\u89e3\u51b3\u65b9\u6848\uff0c\u53ef\u7528\u4e8e\u6536\u96c6\u548c\u5b58\u50a8Kafka\u7684\u6307\u6807\u6570\u636e\uff0c\u914d\u5408Grafana\u8fdb\u884c\u5c55\u793a\u548c\u62a5\u8b66\u3002\n\u56fe\u7247"),(0,n.kt)("li",{parentName:"ol"},"Grafana\uff1a\u4e00\u4e2a\u529f\u80fd\u5f3a\u5927\u7684\u6570\u636e\u53ef\u89c6\u5316\u5e73\u53f0\uff0c\u53ef\u4e0ePrometheus\u7b49\u6570\u636e\u6e90\u96c6\u6210\uff0c\u5e2e\u52a9\u60a8\u521b\u5efa\u81ea\u5b9a\u4e49\u7684Kafka\u76d1\u63a7\u4eea\u8868\u76d8\u3002\n\u56fe\u7247"),(0,n.kt)("li",{parentName:"ol"},"Burrow\uff1a\u4e00\u4e2a\u4e13\u95e8\u7528\u4e8e\u76d1\u63a7Kafka\u6d88\u8d39\u8005\u504f\u79fb\u91cf\u7684\u5de5\u5177\uff0c\u53ef\u53ca\u65f6\u68c0\u6d4b\u6d88\u8d39\u8005\u7ec4\u7684\u504f\u79fb\u91cf\u60c5\u51b5\uff0c\u53d1\u73b0\u6d88\u8d39\u8005\u5ef6\u8fdf\u548c\u504f\u79fb\u91cf\u8d85\u9650\u7b49\u95ee\u9898\u3002\n\u56fe\u7247"),(0,n.kt)("li",{parentName:"ol"},"Confluent Control Center\uff1a\u7531Confluent\u5b98\u65b9\u63d0\u4f9b\u7684\u5546\u4e1a\u76d1\u63a7\u5de5\u5177\uff0c\u63d0\u4f9b\u4e86\u96c6\u4e2d\u5316\u7684Kafka\u96c6\u7fa4\u76d1\u63a7\u3001\u6027\u80fd\u6307\u6807\u548c\u62a5\u8b66\u529f\u80fd\u3002\n\u56fe\u7247")),(0,n.kt)("h3",{id:"\u81ea\u5b9a\u4e49\u76d1\u63a7\u811a\u672c"},"\u81ea\u5b9a\u4e49\u76d1\u63a7\u811a\u672c\uff1a"),(0,n.kt)("p",null,"\u60a8\u8fd8\u53ef\u4ee5\u7f16\u5199\u81ea\u5b9a\u4e49\u7684\u811a\u672c\u6765\u76d1\u63a7Kafka\u96c6\u7fa4\u3002\u901a\u8fc7\u4f7f\u7528Kafka\u7684Java\u5ba2\u6237\u7aef\uff0c\u60a8\u53ef\u4ee5\u7f16\u5199Java\u6216Shell\u811a\u672c\u6765\u6293\u53d6\u548c\u5206\u6790Kafka\u7684\u76f8\u5173\u6307\u6807\u6570\u636e\uff0c\u5e76\u8fdb\u884c\u62a5\u8b66\u6216\u65e5\u5fd7\u8bb0\u5f55\u3002"),(0,n.kt)("h3",{id:"\u96c6\u7fa4\u76d1\u63a7\u6307\u6807"},"\u96c6\u7fa4\u76d1\u63a7\u6307\u6807\uff1a"),(0,n.kt)("p",null,"\u5173\u6ce8\u4ee5\u4e0b\u5173\u952e\u6307\u6807\u53ef\u4ee5\u5e2e\u52a9\u60a8\u6df1\u5165\u4e86\u89e3Kafka\u96c6\u7fa4\u7684\u5065\u5eb7\u72b6\u51b5\u548c\u6027\u80fd\u8868\u73b0\uff1a"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"Broker\u7ea7\u522b\uff1a\u541e\u5410\u91cf\u3001\u5ef6\u8fdf\u3001\u78c1\u76d8\u4f7f\u7528\u7387\u3001\u7f51\u7edc\u8fde\u63a5\u6570\u3001\u65e5\u5fd7\u5927\u5c0f\u7b49\u3002"),(0,n.kt)("li",{parentName:"ol"},"\u4e3b\u9898\u548c\u5206\u533a\u7ea7\u522b\uff1a\u6d88\u606f\u5806\u79ef\u6570\u91cf\u3001\u526f\u672c\u72b6\u6001\u3001ISR\uff08In-Sync Replicas\uff09\u6570\u91cf\u3001Leader\u9009\u4e3e\u6b21\u6570\u7b49\u3002"),(0,n.kt)("li",{parentName:"ol"},"\u6d88\u8d39\u8005\u7ec4\u7ea7\u522b\uff1a\u6d88\u8d39\u8005\u7ec4\u7684\u6d88\u8d39\u901f\u7387\u3001\u504f\u79fb\u91cf\u7684\u63d0\u4ea4\u60c5\u51b5\u3001\u5ef6\u8fdf\u7b49\u3002")),(0,n.kt)("p",null,"\u901a\u8fc7\u7efc\u5408\u4f7f\u7528\u591a\u79cd\u76d1\u63a7\u5de5\u5177\u548c\u65b9\u6cd5\uff0c\u60a8\u53ef\u4ee5\u5168\u9762\u4e86\u89e3Kafka\u96c6\u7fa4\u7684\u72b6\u51b5\uff0c\u53ca\u65f6\u68c0\u6d4b\u5e76\u89e3\u51b3\u6f5c\u5728\u7684\u95ee\u9898\uff0c\u786e\u4fddKafka\u7684\u7a33\u5b9a\u548c\u9ad8\u6027\u80fd\u8fd0\u884c\u3002"),(0,n.kt)("h2",{id:"\u5904\u7406\u6545\u969c\u548c\u5b9e\u73b0\u6062\u590d"},"\u5904\u7406\u6545\u969c\u548c\u5b9e\u73b0\u6062\u590d"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"\u9ad8\u53ef\u7528\u6027\u8bbe\u8ba1 \u4e3a\u786e\u4fddKafka\u96c6\u7fa4\u5bf9\u6545\u969c\u5177\u6709\u9ad8\u53ef\u7528\u6027\uff0c\u63a8\u8350\u91c7\u7528\u4ee5\u4e0b\u7b56\u7565\uff1a"),(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"\u4f7f\u7528\u591a\u4e2aKafka Broker\u6765\u5206\u6563\u6545\u969c\u98ce\u9669\uff0c\u5e76\u4f7f\u7528\u526f\u672c\u673a\u5236\u6765\u4fdd\u969c\u6570\u636e\u7684\u53ef\u9760\u6027\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u8bbe\u7f6e\u9002\u5f53\u7684\u590d\u5236\u56e0\u5b50\uff0c\u786e\u4fdd\u6bcf\u4e2a\u5206\u533a\u90fd\u6709\u8db3\u591f\u6570\u91cf\u7684\u526f\u672c\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u914d\u7f6e\u9002\u5f53\u7684ISR\uff08In-Sync Replicas\uff09\u5927\u5c0f\uff0c\u4ee5\u786e\u4fdd\u5206\u533a\u7684\u53ef\u7528\u6027\u548c\u6570\u636e\u4e00\u81f4\u6027\u3002"))),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"\u76d1\u63a7\u548c\u9519\u8bef\u65e5\u5fd7 \u901a\u8fc7\u76d1\u63a7\u5de5\u5177\u5b9e\u65f6\u76d1\u6d4bKafka\u96c6\u7fa4\uff0c\u5e76\u5b9a\u671f\u68c0\u67e5\u9519\u8bef\u65e5\u5fd7\u3002\u5982\u679c\u53d1\u73b0\u9519\u8bef\u548c\u5f02\u5e38\u60c5\u51b5\uff0c\u53ef\u4ee5\u6839\u636e\u65e5\u5fd7\u4fe1\u606f\u8fdb\u884c\u6545\u969c\u5b9a\u4f4d\u548c\u5904\u7406\u3002\u540c\u65f6\uff0c\u63a8\u8350\u5f00\u542fKafka\u96c6\u7fa4\u7684\u9519\u8bef\u65e5\u5fd7\u8bb0\u5f55\uff0c\u4ee5\u4fbf\u66f4\u597d\u5730\u8ddf\u8e2a\u548c\u5206\u6790\u6545\u969c\u95ee\u9898\u3002")),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"\u5feb\u901f\u6545\u969c\u6062\u590d \u5f53Kafka\u96c6\u7fa4\u51fa\u73b0\u6545\u969c\u65f6\uff0c\u5feb\u901f\u800c\u53ef\u9760\u5730\u8fdb\u884c\u6545\u969c\u6062\u590d\u662f\u81f3\u5173\u91cd\u8981\u7684\u3002\u4e0b\u9762\u662f\u4e00\u4e9b\u6545\u969c\u6062\u590d\u7684\u5173\u952e\u7b56\u7565\uff1a"),(0,n.kt)("ul",{parentName:"li"},(0,n.kt)("li",{parentName:"ul"},"\u5173\u6ce8\u96c6\u7fa4\u4e2d\u7684Leader\u9009\u4e3e\u8fc7\u7a0b\uff0c\u786e\u4fdd\u6bcf\u4e2a\u5206\u533a\u90fd\u6709\u6709\u6548\u7684Leader Broker\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u6ce8\u610f\u5206\u533a\u526f\u672c\u7684\u540c\u6b65\u72b6\u6001\uff0c\u5f53ISR\uff08In-Sync Replicas\uff09\u53d1\u751f\u53d8\u5316\u65f6\u53ca\u65f6\u91c7\u53d6\u63aa\u65bd\u3002"),(0,n.kt)("li",{parentName:"ul"},"\u9488\u5bf9\u4e0d\u540c\u7c7b\u578b\u7684\u6545\u969c\uff0c\u6839\u636e\u5b9e\u9645\u60c5\u51b5\u6267\u884c\u6062\u590d\u6b65\u9aa4\uff0c\u4f8b\u5982Broker\u6545\u969c\u3001\u7f51\u7edc\u6545\u969c\u7b49\u3002"))),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"\u6d4b\u8bd5\u548c\u6f14\u7ec3 \u6301\u7eed\u5bf9Kafka\u96c6\u7fa4\u8fdb\u884c\u6d4b\u8bd5\u548c\u6f14\u7ec3\uff0c\u7279\u522b\u662f\u6545\u969c\u6062\u590d\u65b9\u9762\u7684\u6d4b\u8bd5\u3002\u901a\u8fc7\u6a21\u62df\u4e0d\u540c\u7c7b\u578b\u7684\u6545\u969c\u60c5\u51b5\uff0c\u9a8c\u8bc1\u96c6\u7fa4\u7684\u53ef\u7528\u6027\u548c\u6062\u590d\u80fd\u529b\uff0c\u5e76\u53ca\u65f6\u4fee\u590d\u6f5c\u5728\u7684\u95ee\u9898\u3002"))),(0,n.kt)("h2",{id:"\u603b\u7ed3"},"\u603b\u7ed3\uff1a"),(0,n.kt)("p",null,"Kafka\u662f\u4e00\u4e2a\u5f3a\u5927\u7684\u5206\u5e03\u5f0f\u6d88\u606f\u4e2d\u95f4\u4ef6\u5e73\u53f0\uff0c\u4f46\u5728\u8fd0\u7ef4\u548c\u6545\u969c\u5904\u7406\u65b9\u9762\u9700\u8981\u7279\u522b\u6ce8\u610f\u3002\u901a\u8fc7\u76d1\u63a7Kafka\u96c6\u7fa4\u7684\u5404\u9879\u6307\u6807\u53ca\u65f6\u53d1\u73b0\u9884\u8b66\u9632\u6b62\u6545\u969c\u53d1\u751f\u3002"))}c.isMDXComponent=!0}}]);