"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[9244],{3905:(e,a,t)=>{t.d(a,{Zo:()=>f,kt:()=>m});var r=t(7294);function n(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function o(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);a&&(r=r.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,r)}return t}function l(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?o(Object(t),!0).forEach((function(a){n(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function i(e,a){if(null==e)return{};var t,r,n=function(e,a){if(null==e)return{};var t,r,n={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],a.indexOf(t)>=0||(n[t]=e[t]);return n}(e,a);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var k=r.createContext({}),p=function(e){var a=r.useContext(k),t=a;return e&&(t="function"==typeof e?e(a):l(l({},a),e)),t},f=function(e){var a=p(e.components);return r.createElement(k.Provider,{value:a},e.children)},c="mdxType",u={inlineCode:"code",wrapper:function(e){var a=e.children;return r.createElement(r.Fragment,{},a)}},s=r.forwardRef((function(e,a){var t=e.components,n=e.mdxType,o=e.originalType,k=e.parentName,f=i(e,["components","mdxType","originalType","parentName"]),c=p(t),s=n,m=c["".concat(k,".").concat(s)]||c[s]||u[s]||o;return t?r.createElement(m,l(l({ref:a},f),{},{components:t})):r.createElement(m,l({ref:a},f))}));function m(e,a){var t=arguments,n=a&&a.mdxType;if("string"==typeof e||n){var o=t.length,l=new Array(o);l[0]=s;var i={};for(var k in a)hasOwnProperty.call(a,k)&&(i[k]=a[k]);i.originalType=e,i[c]="string"==typeof e?e:n,l[1]=i;for(var p=2;p<o;p++)l[p]=t[p];return r.createElement.apply(null,l)}return r.createElement.apply(null,t)}s.displayName="MDXCreateElement"},9196:(e,a,t)=>{t.r(a),t.d(a,{assets:()=>k,contentTitle:()=>l,default:()=>u,frontMatter:()=>o,metadata:()=>i,toc:()=>p});var r=t(7462),n=(t(7294),t(3905));const o={},l=void 0,i={unversionedId:"kafka/Kafka-1",id:"kafka/Kafka-1",title:"Kafka-1",description:"- Kafka\u5165\u95e8",source:"@site/middleware/kafka/Kafka-1.md",sourceDirName:"kafka",slug:"/kafka/Kafka-1",permalink:"/light-docusaurus/middleware/kafka/Kafka-1",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/middleware/kafka/Kafka-1.md",tags:[],version:"current",lastUpdatedBy:"liuhui",lastUpdatedAt:1697531923,formattedLastUpdatedAt:"2023\u5e7410\u670817\u65e5",frontMatter:{}},k={},p=[{value:"1. Kafka\u7b80\u4ecb",id:"1-kafka\u7b80\u4ecb",level:2},{value:"2.  \u8bbe\u8ba1\u67b6\u6784",id:"2--\u8bbe\u8ba1\u67b6\u6784",level:2},{value:"3. Kafka\u7279\u70b9",id:"3-kafka\u7279\u70b9",level:2},{value:"4. \u4f7f\u7528\u573a\u666f",id:"4-\u4f7f\u7528\u573a\u666f",level:2},{value:"5.  \u5b89\u88c5\u3001\u914d\u7f6e\u548c\u542f\u52a8Kafka",id:"5--\u5b89\u88c5\u914d\u7f6e\u548c\u542f\u52a8kafka",level:2}],f={toc:p},c="wrapper";function u(e){let{components:a,...t}=e;return(0,n.kt)(c,(0,r.Z)({},f,t,{components:a,mdxType:"MDXLayout"}),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"https://mp.weixin.qq.com/s/0UXGVvc4QY1oH00rIKqM9w"},"Kafka\u5165\u95e8"))),(0,n.kt)("h2",{id:"1-kafka\u7b80\u4ecb"},"1. Kafka\u7b80\u4ecb"),(0,n.kt)("p",null,"Apache Kafka \u662fLinkedIn\u516c\u53f8\u5f00\u53d1\u7684\u4e00\u6b3e\u5f00\u6e90\u7684\u9ad8\u541e\u5410\u3001\u5206\u5e03\u5f0f\u7684\u6d88\u606f\u961f\u5217\u7cfb\u7edf\uff0c\u5b83\u5177\u6709\u9ad8\u4f38\u7f29\u6027\u3001\u9ad8\u53ef\u9760\u6027\u548c\u4f4e\u5ef6\u8fdf\u7b49\u7279\u70b9\uff0c\u56e0\u6b64\u5728\u5927\u578b\u6570\u636e\u5904\u7406\u573a\u666f\u4e2d\u5907\u53d7\u9752\u7750\u3002Kafka \u53ef\u4ee5\u5904\u7406\u591a\u79cd\u7c7b\u578b\u7684\u6570\u636e\uff0c\u5982\u4e8b\u4ef6\u3001\u65e5\u5fd7\u3001\u6307\u6807\u7b49\uff0c\u5e7f\u6cdb\u5e94\u7528\u4e8e\u5b9e\u65f6\u6570\u636e\u6d41\u5904\u7406\u3001\u65e5\u5fd7\u6536\u96c6\u3001\u76d1\u63a7\u548c\u5206\u6790\u7b49\u9886\u57df\u3002"),(0,n.kt)("h2",{id:"2--\u8bbe\u8ba1\u67b6\u6784"},"2.  \u8bbe\u8ba1\u67b6\u6784"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},"Producer \uff1a\u6d88\u606f\u751f\u4ea7\u8005\uff0c\u5c31\u662f\u5411 kafka broker \u53d1\u6d88\u606f\u7684\u5ba2\u6237\u7aef\u3002"),(0,n.kt)("li",{parentName:"ul"},"Consumer \uff1a\u6d88\u606f\u6d88\u8d39\u8005\uff0c\u5411 kafka broker \u53d6\u6d88\u606f\u7684\u5ba2\u6237\u7aef\u3002"),(0,n.kt)("li",{parentName:"ul"},"Topic \uff1a\u4e00\u4e2aTopic\u662f\u6d88\u606f\u7684\u5206\u7c7b\u6216\u4e3b\u9898\uff0c\u5b83\u662fKafka\u4e2d\u8fdb\u884c\u6d88\u606f\u53d1\u5e03\u548c\u8ba2\u9605\u7684\u57fa\u672c\u5355\u4f4d\u3002Producer\uff08\u751f\u4ea7\u8005\uff09\u5c06\u6d88\u606f\u53d1\u5e03\u5230\u4e00\u4e2a\u6216\u591a\u4e2aTopic\uff0c\u800cConsumer\uff08\u6d88\u8d39\u8005\uff09\u8ba2\u9605\u4e00\u4e2a\u6216\u591a\u4e2aTopic\u5e76\u6d88\u8d39\u5176\u4e2d\u7684\u6d88\u606f\u3002"),(0,n.kt)("li",{parentName:"ul"},"Consumer Group\uff1a\u8fd9\u662f kafka \u7528\u6765\u5b9e\u73b0\u4e00\u4e2a topic \u6d88\u606f\u7684\u5e7f\u64ad\uff08\u53d1\u7ed9\u6240\u6709\u7684 consumer\uff09\u548c\u5355\u64ad\uff08\u53d1\u7ed9\u4efb\u610f\u4e00\u4e2a consumer\uff09\u7684\u624b\u6bb5\u3002\u4e00\u4e2a topic \u53ef\u4ee5\u6709\u591a\u4e2a Consumer Group\u3002"),(0,n.kt)("li",{parentName:"ul"},"Broker\uff1a\u4e00\u53f0 kafka \u670d\u52a1\u5668\u5c31\u662f\u4e00\u4e2a broker\u3002\u4e00\u4e2a\u96c6\u7fa4\u7531\u591a\u4e2a broker \u7ec4\u6210\u3002\u4e00\u4e2a broker \u53ef\u4ee5\u5bb9\u7eb3\u591a\u4e2a topic\u3002"),(0,n.kt)("li",{parentName:"ul"},"Partition\uff1a\u4e3a\u4e86\u5b9e\u73b0\u6269\u5c55\u6027\uff0c\u4e00\u4e2a\u975e\u5e38\u5927\u7684 topic \u53ef\u4ee5\u5206\u5e03\u5230\u591a\u4e2a broker\u4e0a\uff0c\u6bcf\u4e2a partition \u662f\u4e00\u4e2a\u6709\u5e8f\u7684\u961f\u5217\u3002partition \u4e2d\u7684\u6bcf\u6761\u6d88\u606f\u90fd\u4f1a\u88ab\u5206\u914d\u4e00\u4e2a\u6709\u5e8f\u7684id\uff08offset\uff09\u3002\u5c06\u6d88\u606f\u53d1\u7ed9 consumer\uff0ckafka \u53ea\u4fdd\u8bc1\u6309\u4e00\u4e2a partition \u4e2d\u7684\u6d88\u606f\u7684\u987a\u5e8f\uff0c\u4e0d\u4fdd\u8bc1\u4e00\u4e2a topic \u7684\u6574\u4f53\uff08\u591a\u4e2a partition \u95f4\uff09\u7684\u987a\u5e8f\u3002"),(0,n.kt)("li",{parentName:"ul"},"Offset\uff1akafka \u7684\u5b58\u50a8\u6587\u4ef6\u90fd\u662f\u6309\u7167 offset.kafka \u6765\u547d\u540d\uff0c\u7528 offset \u505a\u540d\u5b57\u7684\u597d\u5904\u662f\u65b9\u4fbf\u67e5\u627e\u3002\u4f8b\u5982\u4f60\u60f3\u627e\u4f4d\u4e8e 2049 \u7684\u4f4d\u7f6e\uff0c\u53ea\u8981\u627e\u5230 2048.kafka \u7684\u6587\u4ef6\u5373\u53ef\u3002\u5f53\u7136 the first offset \u5c31\u662f 00000000000.kafka\u3002")),(0,n.kt)("h2",{id:"3-kafka\u7279\u70b9"},"3. Kafka\u7279\u70b9"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"\u9ad8\u541e\u5410\u91cf\u3001\u4f4e\u5ef6\u8fdf\uff1akafka\u6bcf\u79d2\u53ef\u4ee5\u5904\u7406\u51e0\u5341\u4e07\u6761\u6d88\u606f\uff0c\u5b83\u7684\u5ef6\u8fdf\u6700\u4f4e\u53ea\u6709\u51e0\u6beb\u79d2\uff0c\u6bcf\u4e2atopic\u53ef\u4ee5\u5206\u591a\u4e2apartition, consumer group \u5bf9partition\u8fdb\u884cconsume\u64cd\u4f5c\u3002"),(0,n.kt)("li",{parentName:"ol"},"\u53ef\u6269\u5c55\u6027\uff1akafka\u96c6\u7fa4\u652f\u6301\u70ed\u6269\u5c55"),(0,n.kt)("li",{parentName:"ol"},"\u6301\u4e45\u6027\u3001\u53ef\u9760\u6027\uff1a\u6d88\u606f\u88ab\u6301\u4e45\u5316\u5230\u672c\u5730\u78c1\u76d8\uff0c\u5e76\u4e14\u652f\u6301\u6570\u636e\u5907\u4efd\u9632\u6b62\u6570\u636e\u4e22\u5931"),(0,n.kt)("li",{parentName:"ol"},"\u5bb9\u9519\u6027\uff1a\u5141\u8bb8\u96c6\u7fa4\u4e2d\u8282\u70b9\u5931\u8d25\uff08\u82e5\u526f\u672c\u6570\u91cf\u4e3an,\u5219\u5141\u8bb8n-1\u4e2a\u8282\u70b9\u5931\u8d25\uff09"),(0,n.kt)("li",{parentName:"ol"},"\u9ad8\u5e76\u53d1\uff1a\u652f\u6301\u6570\u5343\u4e2a\u5ba2\u6237\u7aef\u540c\u65f6\u8bfb\u5199")),(0,n.kt)("h2",{id:"4-\u4f7f\u7528\u573a\u666f"},"4. \u4f7f\u7528\u573a\u666f"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"\u65e5\u5fd7\u6536\u96c6\uff1a\u53ef\u4ee5\u7528Kafka\u53ef\u4ee5\u6536\u96c6\u5404\u79cd\u670d\u52a1\u7684log\uff0c\u901a\u8fc7kafka\u4ee5\u7edf\u4e00\u63a5\u53e3\u670d\u52a1\u7684\u65b9\u5f0f\u5f00\u653e\u7ed9\u5404\u79cdconsumer\uff0c\u4f8b\u5982hadoop\u3001HBase\u3001Solr\u7b49\u3002"),(0,n.kt)("li",{parentName:"ol"},"\u6d88\u606f\u7cfb\u7edf\uff1a\u89e3\u8026\u548c\u751f\u4ea7\u8005\u548c\u6d88\u8d39\u8005\u3001\u7f13\u5b58\u6d88\u606f\u7b49\u3002"),(0,n.kt)("li",{parentName:"ol"},"\u7528\u6237\u6d3b\u52a8\u8ddf\u8e2a\uff1aKafka\u7ecf\u5e38\u88ab\u7528\u6765\u8bb0\u5f55web\u7528\u6237\u6216\u8005app\u7528\u6237\u7684\u5404\u79cd\u6d3b\u52a8\uff0c\u5982\u6d4f\u89c8\u7f51\u9875\u3001\u641c\u7d22\u3001\u70b9\u51fb\u7b49\u6d3b\u52a8\uff0c\u8fd9\u4e9b\u6d3b\u52a8\u4fe1\u606f\u88ab\u5404\u4e2a\u670d\u52a1\u5668\u53d1\u5e03\u5230kafka\u7684topic\u4e2d\uff0c\u7136\u540e\u8ba2\u9605\u8005\u901a\u8fc7\u8ba2\u9605\u8fd9\u4e9btopic\u6765\u505a\u5b9e\u65f6\u7684\u76d1\u63a7\u5206\u6790\uff0c\u6216\u8005\u88c5\u8f7d\u5230hadoop\u3001\u6570\u636e\u4ed3\u5e93\u4e2d\u505a\u79bb\u7ebf\u5206\u6790\u548c\u6316\u6398\u3002"),(0,n.kt)("li",{parentName:"ol"},"\u8fd0\u8425\u6307\u6807\uff1aKafka\u4e5f\u7ecf\u5e38\u7528\u6765\u8bb0\u5f55\u8fd0\u8425\u76d1\u63a7\u6570\u636e\u3002\u5305\u62ec\u6536\u96c6\u5404\u79cd\u5206\u5e03\u5f0f\u5e94\u7528\u7684\u6570\u636e\uff0c\u751f\u4ea7\u5404\u79cd\u64cd\u4f5c\u7684\u96c6\u4e2d\u53cd\u9988\uff0c\u6bd4\u5982\u62a5\u8b66\u548c\u62a5\u544a\u3002"),(0,n.kt)("li",{parentName:"ol"},"\u6d41\u5f0f\u5904\u7406\uff1a\u6bd4\u5982spark streaming\u548c Flink\u3002"),(0,n.kt)("li",{parentName:"ol"},"\u7cfb\u7edf\u89e3\u8026\uff1a\u5728\u91cd\u8981\u64cd\u4f5c\u5b8c\u6210\u540e\uff0c\u53d1\u9001\u6d88\u606f\uff0c\u7531\u522b\u7684\u670d\u52a1\u7cfb\u7edf\u6765\u5b8c\u6210\u5176\u4ed6\u64cd\u4f5c"),(0,n.kt)("li",{parentName:"ol"},"\u6d41\u91cf\u524a\u5cf0\uff1a\u4e00\u822c\u7528\u4e8e\u79d2\u6740\u6216\u62a2\u8d2d\u6d3b\u52a8\u4e2d\uff0c\u6765\u7f13\u51b2\u7f51\u7ad9\u77ed\u65f6\u95f4\u5185\u9ad8\u6d41\u91cf\u5e26\u6765\u7684\u538b\u529b"),(0,n.kt)("li",{parentName:"ol"},"\u5f02\u6b65\u5904\u7406\uff1a\u901a\u8fc7\u5f02\u6b65\u5904\u7406\u673a\u5236\uff0c\u53ef\u4ee5\u628a\u4e00\u4e2a\u6d88\u606f\u653e\u5165\u961f\u5217\u4e2d\uff0c\u4f46\u4e0d\u7acb\u5373\u5904\u7406\u5b83\uff0c\u5728\u9700\u8981\u7684\u65f6\u5019\u518d\u8fdb\u884c\u5904\u7406")),(0,n.kt)("h2",{id:"5--\u5b89\u88c5\u914d\u7f6e\u548c\u542f\u52a8kafka"},"5.  \u5b89\u88c5\u3001\u914d\u7f6e\u548c\u542f\u52a8Kafka"),(0,n.kt)("p",null,"\u8981\u5b89\u88c5\u3001\u914d\u7f6e\u548c\u542f\u52a8Kafka\uff0c\u8bf7\u6309\u7167\u4ee5\u4e0b\u6b65\u9aa4\u8fdb\u884c\u64cd\u4f5c\uff1a"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"\u4e0b\u8f7dKafka\uff1a\u4eceApache Kafka\u5b98\u7f51\u4e0b\u8f7d\u6700\u65b0\u7248\u672c\u7684Kafka\uff0c\u5e76\u89e3\u538b\u5230\u672c\u5730\u76ee\u5f55\u3002")),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"\u914d\u7f6eKafka\uff1a\u7f16\u8f91Kafka\u7684\u914d\u7f6e\u6587\u4ef6\uff08config/server.properties\uff09\uff0c\u6839\u636e\u9700\u6c42\u4fee\u6539\u4ee5\u4e0b\u914d\u7f6e\u9879\uff1a"))),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-shell"},"advertised.listeners\uff1aKafka Broker\u7684\u5730\u5740\u548c\u7aef\u53e3\u914d\u7f6e\u3002\nzookeeper.connect\uff1aZooKeeper\u7684\u5730\u5740\u548c\u7aef\u53e3\u914d\u7f6e\u3002\n")),(0,n.kt)("ol",{start:3},(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"\u542f\u52a8ZooKeeper\uff1a\u6253\u5f00\u4e00\u4e2a\u7ec8\u7aef\u7a97\u53e3\uff0c\u542f\u52a8ZooKeeper\u670d\u52a1\u5668\uff1a",(0,n.kt)("inlineCode",{parentName:"p"},"bin/zookeeper-server-start.sh config/zookeeper.properties"))),(0,n.kt)("li",{parentName:"ol"},(0,n.kt)("p",{parentName:"li"},"\u542f\u52a8Kafka Broker\uff1a\u5728\u53e6\u4e00\u4e2a\u7ec8\u7aef\u7a97\u53e3\u4e2d\uff0c\u542f\u52a8Kafka Broker\u670d\u52a1\u5668\uff1a",(0,n.kt)("inlineCode",{parentName:"p"},"bin/kafka-server-start.sh config/server.properties")))))}u.isMDXComponent=!0}}]);