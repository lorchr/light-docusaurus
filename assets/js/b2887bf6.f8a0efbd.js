"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[4e3],{87896:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>r,default:()=>x,frontMatter:()=>d,metadata:()=>t,toc:()=>h});var s=i(85893),l=i(11151);const d={},r=void 0,t={id:"compare/Different-Between-LVS-Nginx",title:"Different-Between-LVS-Nginx",description:"- \u8d1f\u8f7d\u5747\u8861\u4e4bLVS\u4e0eNginx\u5bf9\u6bd4",source:"@site/middleware/compare/5-Different-Between-LVS-Nginx.md",sourceDirName:"compare",slug:"/compare/Different-Between-LVS-Nginx",permalink:"/light-docusaurus/middleware/compare/Different-Between-LVS-Nginx",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/middleware/compare/5-Different-Between-LVS-Nginx.md",tags:[],version:"current",lastUpdatedBy:"Lorchr",lastUpdatedAt:1705891060,formattedLastUpdatedAt:"2024\u5e741\u670822\u65e5",sidebarPosition:5,frontMatter:{},sidebar:"middleware",previous:{title:"Different-Between-Kafka-RabbitMQ-RocketMQ-Pulasr",permalink:"/light-docusaurus/middleware/compare/Different-Between-Kafka-RabbitMQ-RocketMQ-Pulasr"},next:{title:"Mysql",permalink:"/light-docusaurus/middleware/category/mysql"}},c={},h=[{value:"\u4e3a\u4ec0\u4e48\u56db\u518c\u6bd4\u4e03\u5c42\u6548\u7387\u9ad8?",id:"\u4e3a\u4ec0\u4e48\u56db\u518c\u6bd4\u4e03\u5c42\u6548\u7387\u9ad8",level:2},{value:"Nginx\u7279\u70b9",id:"nginx\u7279\u70b9",level:2},{value:"\u6b63\u5411\u4ee3\u7406\u4e0e\u53cd\u5411\u4ee3\u7406",id:"\u6b63\u5411\u4ee3\u7406\u4e0e\u53cd\u5411\u4ee3\u7406",level:3},{value:"\u8d1f\u8f7d\u5747\u8861",id:"\u8d1f\u8f7d\u5747\u8861",level:3},{value:"\u52a8\u9759\u5206\u79bb",id:"\u52a8\u9759\u5206\u79bb",level:3},{value:"Nginx\u7684\u4f18\u52bf",id:"nginx\u7684\u4f18\u52bf",level:2},{value:"\u53ef\u64cd\u4f5c\u6027\u5927",id:"\u53ef\u64cd\u4f5c\u6027\u5927",level:3},{value:"\u7f51\u7edc\u4f9d\u8d56\u5c0f",id:"\u7f51\u7edc\u4f9d\u8d56\u5c0f",level:3},{value:"\u5b89\u88c5\u7b80\u5355",id:"\u5b89\u88c5\u7b80\u5355",level:3},{value:"\u652f\u6301\u5065\u5eb7\u68c0\u67e5\u4ee5\u53ca\u8bf7\u6c42\u91cd\u53d1",id:"\u652f\u6301\u5065\u5eb7\u68c0\u67e5\u4ee5\u53ca\u8bf7\u6c42\u91cd\u53d1",level:3},{value:"LVS \u7684\u4f18\u52bf",id:"lvs-\u7684\u4f18\u52bf",level:2},{value:"\u6297\u8d1f\u8f7d\u80fd\u529b\u5f3a",id:"\u6297\u8d1f\u8f7d\u80fd\u529b\u5f3a",level:3},{value:"\u914d\u7f6e\u6027\u4f4e",id:"\u914d\u7f6e\u6027\u4f4e",level:3},{value:"\u5de5\u4f5c\u7a33\u5b9a",id:"\u5de5\u4f5c\u7a33\u5b9a",level:3},{value:"\u65e0\u6d41\u91cf",id:"\u65e0\u6d41\u91cf",level:3},{value:"\u7ad9\u5728\u5de8\u4eba\u7684\u80a9\u8180\u4e0a",id:"\u7ad9\u5728\u5de8\u4eba\u7684\u80a9\u8180\u4e0a",level:2}];function a(e){const n={a:"a",h2:"h2",h3:"h3",img:"img",li:"li",p:"p",strong:"strong",ul:"ul",...(0,l.ah)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://www.cnblogs.com/Courage129/p/14383897.html",children:"\u8d1f\u8f7d\u5747\u8861\u4e4bLVS\u4e0eNginx\u5bf9\u6bd4"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://mp.weixin.qq.com/s/S04oXkOGvmAH5tDzSLTnbA",children:"\u8d1f\u8f7d\u5747\u8861 LVS vs Nginx \u5bf9\u6bd4\uff01\u8fd8\u50bb\u50bb\u5206\u4e0d\u6e05\uff1f"})}),"\n"]}),"\n",(0,s.jsx)(n.p,{children:"\u4eca\u5929\u603b\u7ed3\u4e00\u4e0b\u8d1f\u8f7d\u5747\u8861\u4e2dLVS\u4e0eNginx\u7684\u533a\u522b,\u597d\u51e0\u7bc7\u535a\u6587\u4e00\u5f00\u59cb\u5c31\u8bf4LVS\u662f\u5355\u5411\u7684,Nginx\u662f\u53cc\u5411\u7684,\u6211\u4e2a\u4eba\u8ba4\u4e3a\u8fd9\u662f\u4e0d\u51c6\u786e\u7684,LVS\u4e09\u79cd\u6a21\u5f0f\u4e2d,\u867d\u7136DR\u6a21\u5f0f\u4ee5\u53caTUN\u6a21\u5f0f\u53ea\u6709\u8bf7\u6c42\u7684\u62a5\u6587\u7ecf\u8fc7Director,\u4f46\u662fNAT\u6a21\u5f0f,Real Server\u56de\u590d\u7684\u62a5\u6587\u4e5f\u4f1a\u7ecf\u8fc7Director Server\u5730\u5740\u91cd\u5199:"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:i(88948).Z+"",width:"1080",height:"427"})}),"\n",(0,s.jsx)(n.p,{children:"\u9996\u5148\u8981\u6e05\u695a\u7684\u4e00\u70b9\u662f,LVS\u662f\u4e00\u4e2a\u56db\u5c42\u7684\u8d1f\u8f7d\u5747\u8861\u5668,\u867d\u7136\u662f\u56db\u5c42,\u4f46\u5e76\u6ca1\u6709TCP\u63e1\u624b\u4ee5\u53ca\u5206\u624b,\u53ea\u662f\u5077\u7aa5\u4e86IP\u7b49\u4fe1\u606f,\u800cNginx\u662f\u4e00\u4e2a\u4e03\u5c42\u7684\u8d1f\u8f7d\u5747\u8861\u5668,\u6240\u4ee5\u6548\u7387\u52bf\u5fc5\u6bd4\u56db\u5c42\u7684LVS\u4f4e\u5f88\u591a,\u4f46\u662f\u53ef\u64cd\u4f5c\u6027\u6bd4LVS\u9ad8,\u540e\u9762\u6240\u6709\u7684\u8ba8\u8bba\u90fd\u662f\u57fa\u4e8e\u8fd9\u4e2a\u533a\u522b\u3002"}),"\n",(0,s.jsx)(n.h2,{id:"\u4e3a\u4ec0\u4e48\u56db\u518c\u6bd4\u4e03\u5c42\u6548\u7387\u9ad8",children:"\u4e3a\u4ec0\u4e48\u56db\u518c\u6bd4\u4e03\u5c42\u6548\u7387\u9ad8?"}),"\n",(0,s.jsx)(n.p,{children:"\u56db\u5c42\u662fTCP\u5c42\uff0c\u4f7f\u7528IP+\u7aef\u53e3\u56db\u5143\u7ec4\u7684\u65b9\u5f0f\u3002\u53ea\u662f\u4fee\u6539\u4e0bIP\u5730\u5740\uff0c\u7136\u540e\u8f6c\u53d1\u7ed9\u540e\u7aef\u670d\u52a1\u5668\uff0cTCP\u4e09\u6b21\u63e1\u624b\u662f\u76f4\u63a5\u548c\u540e\u7aef\u8fde\u63a5\u7684\u3002\u53ea\u4e0d\u8fc7\u5728\u540e\u7aef\u673a\u5668\u4e0a\u770b\u5230\u7684\u90fd\u662f\u4e0e\u4ee3\u7406\u673a\u7684IP\u7684established\u800c\u5df2,LVS\u4e2d\u6ca1\u6709\u63e1\u624b\u3002"}),"\n",(0,s.jsx)(n.p,{children:"7\u5c42\u4ee3\u7406\u5219\u5fc5\u987b\u8981\u5148\u548c\u4ee3\u7406\u673a\u4e09\u6b21\u63e1\u624b\u540e\uff0c\u624d\u80fd\u5f97\u52307\u5c42\uff08HTT\u5c42\uff09\u7684\u5177\u4f53\u5185\u5bb9\uff0c\u7136\u540e\u518d\u8f6c\u53d1\u3002\u610f\u601d\u5c31\u662f\u4ee3\u7406\u673a\u5fc5\u987b\u8981\u4e0eclient\u548c\u540e\u7aef\u7684\u673a\u5668\u90fd\u8981\u5efa\u7acb\u8fde\u63a5\u3002\u663e\u7136\u6027\u80fd\u4e0d\u884c\uff0c\u4f46\u80dc\u5728\u4e8e\u4e03\u5c42\uff0c\u4eba\u5de5\u53ef\u64cd\u4f5c\u6027\u9ad8,\u80fd\u5199\u66f4\u591a\u7684\u8f6c\u53d1\u89c4\u5219\u3002"}),"\n",(0,s.jsx)(n.h2,{id:"nginx\u7279\u70b9",children:"Nginx\u7279\u70b9"}),"\n",(0,s.jsx)(n.p,{children:"Nginx \u4e13\u4e3a\u6027\u80fd\u4f18\u5316\u800c\u5f00\u53d1\uff0c\u6027\u80fd\u662f\u5176\u6700\u91cd\u8981\u7684\u8981\u6c42\uff0c\u5341\u5206\u6ce8\u91cd\u6548\u7387\uff0c\u6709\u62a5\u544a Nginx \u80fd\u652f\u6301\u9ad8\u8fbe 50000 \u4e2a\u5e76\u53d1\u8fde\u63a5\u6570\u3002"}),"\n",(0,s.jsx)(n.p,{children:"\u53e6\u5916\uff0cNginx \u7cfb\u5217\u9762\u8bd5\u9898\u548c\u7b54\u6848\u5168\u90e8\u6574\u7406\u597d\u4e86\uff0c\u5fae\u4fe1\u641c\u7d22Java\u6280\u672f\u6808\uff0c\u5728\u540e\u53f0\u53d1\u9001\uff1a\u9762\u8bd5\uff0c\u53ef\u4ee5\u5728\u7ebf\u9605\u8bfb\u3002"}),"\n",(0,s.jsx)(n.h3,{id:"\u6b63\u5411\u4ee3\u7406\u4e0e\u53cd\u5411\u4ee3\u7406",children:"\u6b63\u5411\u4ee3\u7406\u4e0e\u53cd\u5411\u4ee3\u7406"}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"\u6b63\u5411\u4ee3\u7406"})," \uff1a\u5c40\u57df\u7f51\u4e2d\u7684\u7535\u8111\u7528\u6237\u60f3\u8981\u76f4\u63a5\u8bbf\u95ee\u670d\u52a1\u5668\u662f\u4e0d\u53ef\u884c\u7684\uff0c\u670d\u52a1\u5668\u53ef\u80fdHold\u4e0d\u4f4f,\u53ea\u80fd\u901a\u8fc7\u4ee3\u7406\u670d\u52a1\u5668\u6765\u8bbf\u95ee\uff0c\u8fd9\u79cd\u4ee3\u7406\u670d\u52a1\u5c31\u88ab\u79f0\u4e3a\u6b63\u5411\u4ee3\u7406,\u7279\u70b9\u662f\u5ba2\u6237\u7aef\u77e5\u9053\u81ea\u5df1\u8bbf\u95ee\u7684\u662f\u4ee3\u7406\u670d\u52a1\u5668\u3002"]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:i(27746).Z+"",width:"1028",height:"661"})}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"\u53cd\u5411\u4ee3\u7406"})," \uff1a\u5ba2\u6237\u7aef\u65e0\u6cd5\u611f\u77e5\u4ee3\u7406\uff0c\u56e0\u4e3a\u5ba2\u6237\u7aef\u8bbf\u95ee\u7f51\u7edc\u4e0d\u9700\u8981\u914d\u7f6e\uff0c\u53ea\u8981\u628a\u8bf7\u6c42\u53d1\u9001\u5230\u53cd\u5411\u4ee3\u7406\u670d\u52a1\u5668\uff0c\u7531\u53cd\u5411\u4ee3\u7406\u670d\u52a1\u5668\u53bb\u9009\u62e9\u76ee\u6807\u670d\u52a1\u5668\u83b7\u53d6\u6570\u636e\uff0c\u7136\u540e\u518d\u8fd4\u56de\u5230\u5ba2\u6237\u7aef\u3002"]}),"\n",(0,s.jsx)(n.p,{children:"\u6b64\u65f6\u53cd\u5411\u4ee3\u7406\u670d\u52a1\u5668\u548c\u76ee\u6807\u670d\u52a1\u5668\u5bf9\u5916\u5c31\u662f\u4e00\u4e2a\u670d\u52a1\u5668\uff0c\u66b4\u9732\u7684\u662f\u4ee3\u7406\u670d\u52a1\u5668\u5730\u5740\uff0c\u9690\u85cf\u4e86\u771f\u5b9e\u670d\u52a1\u5668 IP \u5730\u5740\u3002"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:i(36676).Z+"",width:"941",height:"611"})}),"\n",(0,s.jsx)(n.h3,{id:"\u8d1f\u8f7d\u5747\u8861",children:"\u8d1f\u8f7d\u5747\u8861"}),"\n",(0,s.jsx)(n.p,{children:"\u5ba2\u6237\u7aef\u53d1\u9001\u591a\u4e2a\u8bf7\u6c42\u5230\u670d\u52a1\u5668\uff0c\u670d\u52a1\u5668\u5904\u7406\u8bf7\u6c42\uff0c\u6709\u4e00\u4e9b\u53ef\u80fd\u8981\u4e0e\u6570\u636e\u5e93\u8fdb\u884c\u4ea4\u4e92\uff0c\u670d\u52a1\u5668\u5904\u7406\u5b8c\u6bd5\u4e4b\u540e\uff0c\u518d\u5c06\u7ed3\u679c\u8fd4\u56de\u7ed9\u5ba2\u6237\u7aef\u3002"}),"\n",(0,s.jsx)(n.p,{children:"\u666e\u901a\u8bf7\u6c42\u548c\u54cd\u5e94\u8fc7\u7a0b\u5982\u4e0b\u56fe\uff1a"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:i(14402).Z+"",width:"750",height:"437"})}),"\n",(0,s.jsx)(n.p,{children:"\u4f46\u662f\u968f\u7740\u4fe1\u606f\u6570\u91cf\u589e\u957f\uff0c\u8bbf\u95ee\u91cf\u548c\u6570\u636e\u91cf\u589e\u957f\uff0c\u5355\u53f0\u7684Server\u4ee5\u53caDatabase\u5c31\u6210\u4e86\u7cfb\u7edf\u7684\u74f6\u9888,\u8fd9\u79cd\u67b6\u6784\u65e0\u6cd5\u6ee1\u8db3\u65e5\u76ca\u589e\u957f\u7684\u9700\u6c42,\u8fd9\u65f6\u5019\u8981\u4e48\u63d0\u5347\u5355\u673a\u7684\u6027\u80fd,\u8981\u4e48\u589e\u52a0\u670d\u52a1\u5668\u7684\u6570\u91cf\u3002"}),"\n",(0,s.jsx)(n.p,{children:"\u5173\u4e8e\u63d0\u5347\u6027\u80fd,\u8fd9\u513f\u5c31\u4e0d\u8d58\u8ff0,\u63d0\u63d0\u5982\u4f55\u589e\u52a0\u670d\u52a1\u5668\u7684\u6570\u91cf\uff0c\u6784\u5efa\u96c6\u7fa4\uff0c\u5c06\u8bf7\u6c42\u5206\u53d1\u5230\u5404\u4e2a\u670d\u52a1\u5668\u4e0a\uff0c\u5c06\u539f\u6765\u8bf7\u6c42\u96c6\u4e2d\u5230\u5355\u4e2a\u670d\u52a1\u5668\u7684\u60c5\u51b5\u6539\u4e3a\u8bf7\u6c42\u5206\u53d1\u5230\u591a\u4e2a\u670d\u52a1\u5668\uff0c\u4e5f\u5c31\u662f\u6211\u4eec\u8bf4\u7684\u8d1f\u8f7d\u5747\u8861\u3002"}),"\n",(0,s.jsx)(n.p,{children:"\u56fe\u89e3\u8d1f\u8f7d\u5747\u8861\uff1a"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:i(16138).Z+"",width:"931",height:"452"})}),"\n",(0,s.jsxs)(n.p,{children:["\u5173\u4e8e\u670d\u52a1\u5668\u5982\u4f55\u62c6\u5206\u7ec4\u5efa\u96c6\u7fa4,\u53c2\u8003:",(0,s.jsx)(n.a,{href:"https://www.cnblogs.com/Courage129/p/14344151.html",children:"Redis\u96c6\u7fa4\u62c6\u5206\u539f\u5219\u4e4bAKF"}),",\u8fd9\u513f\u4e3b\u8981\u8bb2\u8bb2\u8d1f\u8f7d\u5747\u8861,\u4e5f\u5c31\u662f\u56fe\u4e0a\u7684Proxy,\u53ef\u4ee5\u662fLVS,\u4e5f\u53ef\u4ee5\u662fNginx\u3002\u5047\u8bbe\u6709 15 \u4e2a\u8bf7\u6c42\u53d1\u9001\u5230\u4ee3\u7406\u670d\u52a1\u5668\uff0c\u90a3\u4e48\u7531\u4ee3\u7406\u670d\u52a1\u5668\u6839\u636e\u670d\u52a1\u5668\u6570\u91cf(\u8bf7\u6c42\u5177\u4f53\u5206\u914d\u7b56\u7565,\u53ef\u4ee5\u53c2\u8003",(0,s.jsx)(n.a,{href:"https://www.cnblogs.com/Courage129/p/14334400.html",children:"LVS\u8d1f\u8f7d\u5747\u8861\u7406\u8bba\u4ee5\u53ca\u7b97\u6cd5\u6982\u8981"}),"\u540e\u9762\u7684\u8d1f\u8f7d\u5747\u8861\u8c03\u5ea6\u7b97\u6cd5)\uff0c\u8fd9\u513f\u5047\u5982\u662f\u5e73\u5747\u5206\u914d\uff0c\u90a3\u4e48\u6bcf\u4e2a\u670d\u52a1\u5668\u5904\u7406 5 \u4e2a\u8bf7\u6c42\uff0c\u8fd9\u4e2a\u8fc7\u7a0b\u5c31\u53eb\u505a\u8d1f\u8f7d\u5747\u8861\u3002"]}),"\n",(0,s.jsx)(n.h3,{id:"\u52a8\u9759\u5206\u79bb",children:"\u52a8\u9759\u5206\u79bb"}),"\n",(0,s.jsx)(n.p,{children:"\u4e3a\u4e86\u52a0\u5feb\u7f51\u7ad9\u7684\u89e3\u6790\u901f\u5ea6\uff0c\u53ef\u4ee5\u628a\u52a8\u6001\u9875\u9762\u548c\u9759\u6001\u9875\u9762\u4ea4\u7ed9\u4e0d\u540c\u7684\u670d\u52a1\u5668\u6765\u89e3\u6790\uff0c\u52a0\u5feb\u89e3\u6790\u7684\u901f\u5ea6\uff0c\u964d\u4f4e\u7531\u5355\u4e2a\u670d\u52a1\u5668\u7684\u538b\u529b\u3002"}),"\n",(0,s.jsx)(n.p,{children:"\u52a8\u9759\u5206\u79bb\u4e4b\u524d\u7684\u72b6\u6001"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:i(80530).Z+"",width:"768",height:"404"})}),"\n",(0,s.jsx)(n.p,{children:"\u52a8\u9759\u5206\u79bb\u4e4b\u540e"}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.img,{alt:"img",src:i(70807).Z+"",width:"730",height:"518"})}),"\n",(0,s.jsxs)(n.p,{children:["\u5149\u770b\u4e24\u5f20\u56fe\u53ef\u80fd\u6709\u4eba\u4e0d\u7406\u89e3\u8fd9\u6837\u505a\u7684\u610f\u4e49\u662f\u4ec0\u4e48,\u6211\u4eec\u5728\u8fdb\u884c\u6570\u636e\u8bf7\u6c42\u65f6,\u4ee5\u6dd8\u5b9d\u8d2d\u7269\u4e3a\u4f8b,\u5546\u54c1\u8be6\u60c5\u9875\u6709\u5f88\u591a\u4e1c\u897f\u662f\u52a8\u6001\u7684,\u968f\u7740\u767b\u5f55\u4eba\u5458\u7684\u4e0d\u540c\u800c\u6539\u53d8,\u4f8b\u5982\u7528\u6237ID,\u7528\u6237\u5934\u50cf,\u4f46\u662f\u6709\u4e9b\u5185\u5bb9\u662f\u9759\u6001\u7684,\u4f8b\u5982\u5546\u54c1\u8be6\u60c5\u9875,\u90a3\u4e48\u6211\u4eec\u53ef\u4ee5\u901a\u8fc7CDN(",(0,s.jsx)(n.a,{href:"https://www.cnblogs.com/Courage129/p/14363627.html",children:"\u5168\u5c40\u8d1f\u8f7d\u5747\u8861\u4e0eCDN\u5185\u5bb9\u5206\u53d1"}),")\u5c06\u9759\u6001\u8d44\u6e90\u90e8\u7f72\u5728\u7528\u6237\u8f83\u8fd1\u7684\u670d\u52a1\u5668\u4e2d,\u7528\u6237\u6570\u636e\u4fe1\u606f\u5b89\u5168\u6027\u8981\u66f4\u9ad8,\u53ef\u4ee5\u653e\u5728\u67d0\u5904\u96c6\u4e2d,\u8fd9\u6837\u76f8\u5bf9\u4e8e\u5c06\u8bf4\u6709\u6570\u636e\u653e\u5728\u4e00\u8d77,\u80fd\u5206\u62c5\u4e3b\u670d\u52a1\u5668\u7684\u538b\u529b,\u4e5f\u80fd\u52a0\u901f\u5546\u54c1\u8be6\u60c5\u9875\u7b49\u5185\u5bb9\u4f20\u8f93\u901f\u5ea6\u3002"]}),"\n",(0,s.jsx)(n.h2,{id:"nginx\u7684\u4f18\u52bf",children:"Nginx\u7684\u4f18\u52bf"}),"\n",(0,s.jsx)(n.h3,{id:"\u53ef\u64cd\u4f5c\u6027\u5927",children:"\u53ef\u64cd\u4f5c\u6027\u5927"}),"\n",(0,s.jsx)(n.p,{children:"Nginx\u662f\u4e00\u4e2a\u5e94\u7528\u5c42\u7684\u7a0b\u5e8f,\u6240\u4ee5\u7528\u6237\u53ef\u64cd\u4f5c\u6027\u7684\u7a7a\u95f4\u5927\u5f97\u591a,\u53ef\u4ee5\u4f5c\u4e3a\u7f51\u9875\u9759\u6001\u670d\u52a1\u5668\uff0c\u652f\u6301 Rewrite \u91cd\u5199\u89c4\u5219\uff1b\u652f\u6301 GZIP \u538b\u7f29\uff0c\u8282\u7701\u5e26\u5bbd\uff1b\u53ef\u4ee5\u505a\u7f13\u5b58\uff1b\u53ef\u4ee5\u9488\u5bf9 http \u5e94\u7528\u672c\u8eab\u6765\u505a\u5206\u6d41\u7b56\u7565\uff0c\u9759\u6001\u5206\u79bb\uff0c\u9488\u5bf9\u57df\u540d\u3001\u76ee\u5f55\u7ed3\u6784\u7b49\u76f8\u6bd4\u4e4b\u4e0b LVS \u5e76\u4e0d\u5177\u5907\u8fd9\u6837\u7684\u529f\u80fd\uff0c\u6240\u4ee5 nginx \u5355\u51ed\u8fd9\u70b9\u53ef\u4ee5\u5229\u7528\u7684\u573a\u5408\u5c31\u8fdc\u591a\u4e8e LVS \u4e86\uff1b\u4f46 nginx \u6709\u7528\u7684\u8fd9\u4e9b\u529f\u80fd\u4f7f\u5176\u53ef\u8c03\u6574\u5ea6\u8981\u9ad8\u4e8e LVS\uff0c\u6240\u4ee5\u7ecf\u5e38\u8981\u53bb\u89e6\u78b0\uff0c\u4eba\u4e3a\u51fa\u73b0\u95ee\u9898\u7684\u51e0\u7387\u4e5f\u5c31\u5927"}),"\n",(0,s.jsx)(n.h3,{id:"\u7f51\u7edc\u4f9d\u8d56\u5c0f",children:"\u7f51\u7edc\u4f9d\u8d56\u5c0f"}),"\n",(0,s.jsx)(n.p,{children:"nginx \u5bf9\u7f51\u7edc\u7684\u4f9d\u8d56\u8f83\u5c0f\uff0c\u7406\u8bba\u4e0a\u53ea\u8981 ping \u5f97\u901a\uff0c\u7f51\u9875\u8bbf\u95ee\u6b63\u5e38\uff0cnginx \u5c31\u80fd\u8fde\u5f97\u901a\uff0cnginx \u540c\u65f6\u8fd8\u80fd\u533a\u5206\u5185\u5916\u7f51\uff0c\u5982\u679c\u662f\u540c\u65f6\u62e5\u6709\u5185\u5916\u7f51\u7684\u8282\u70b9\uff0c\u5c31\u76f8\u5f53\u4e8e\u5355\u673a\u62e5\u6709\u4e86\u5907\u4efd\u7ebf\u8def\uff1bLVS \u5c31\u6bd4\u8f83\u4f9d\u8d56\u4e8e\u7f51\u7edc\u73af\u5883\uff0c\u76ee\u524d\u6765\u770b\u670d\u52a1\u5668\u5728\u540c\u4e00\u7f51\u6bb5\u5185\u5e76\u4e14 LVS \u4f7f\u7528 direct \u65b9\u5f0f\u5206\u6d41\uff0c\u6548\u679c\u8f83\u80fd\u5f97\u5230\u4fdd\u8bc1\u3002\u53e6\u5916\u6ce8\u610f\uff0cLVS \u9700\u8981\u5411\u6258\u7ba1\u5546\u81f3\u5c11\u7533\u8bf7\u591a\u4e8e\u4e00\u4e2a ip \u6765\u505a visual ip"}),"\n",(0,s.jsx)(n.h3,{id:"\u5b89\u88c5\u7b80\u5355",children:"\u5b89\u88c5\u7b80\u5355"}),"\n",(0,s.jsx)(n.p,{children:"nginx \u5b89\u88c5\u548c\u914d\u7f6e\u6bd4\u8f83\u7b80\u5355\uff0c\u6d4b\u8bd5\u8d77\u6765\u4e5f\u5f88\u65b9\u4fbf\uff0c\u56e0\u4e3a\u5b83\u57fa\u672c\u80fd\u628a\u9519\u8bef\u7528\u65e5\u5fd7\u6253\u5370\u51fa\u6765\u3002LVS \u7684\u5b89\u88c5\u548c\u914d\u7f6e\u3001\u6d4b\u8bd5\u5c31\u8981\u82b1\u6bd4\u8f83\u957f\u7684\u65f6\u95f4\uff0c\u56e0\u4e3a\u540c\u4e0a\u6240\u8ff0\uff0cLVS \u5bf9\u7f51\u7edc\u4f9d\u8d56\u6027\u6bd4\u8f83\u5927\uff0c\u5f88\u591a\u65f6\u5019\u4e0d\u80fd\u914d\u7f6e\u6210\u529f\u90fd\u662f\u56e0\u4e3a\u7f51\u7edc\u95ee\u9898\u800c\u4e0d\u662f\u914d\u7f6e\u95ee\u9898\uff0c\u51fa\u4e86\u95ee\u9898\u8981\u89e3\u51b3\u4e5f\u76f8\u5e94\u7684\u4f1a\u9ebb\u70e6\u7684\u591a"}),"\n",(0,s.jsx)(n.p,{children:"nginx \u4e5f\u540c\u6837\u80fd\u627f\u53d7\u5f88\u9ad8\u8d1f\u8f7d\u4e14\u7a33\u5b9a\uff0c\u4f46\u8d1f\u8f7d\u5ea6\u548c\u7a33\u5b9a\u5ea6\u5dee LVS \u8fd8\u6709\u51e0\u4e2a\u7b49\u7ea7\uff1anginx \u5904\u7406\u6240\u6709\u6d41\u91cf\u6240\u4ee5\u53d7\u9650\u4e8e\u673a\u5668 IO \u548c\u914d\u7f6e\uff1b\u672c\u8eab\u7684 bug \u4e5f\u8fd8\u662f\u96be\u4ee5\u907f\u514d\u7684\uff1bnginx \u6ca1\u6709\u73b0\u6210\u7684\u53cc\u673a\u70ed\u5907\u65b9\u6848\uff0c\u6240\u4ee5\u8dd1\u5728\u5355\u673a\u4e0a\u8fd8\u662f\u98ce\u9669\u6bd4\u8f83\u5927\uff0c\u5355\u673a\u4e0a\u7684\u4e8b\u60c5\u5168\u90fd\u5f88\u96be\u8bf4"}),"\n",(0,s.jsx)(n.h3,{id:"\u652f\u6301\u5065\u5eb7\u68c0\u67e5\u4ee5\u53ca\u8bf7\u6c42\u91cd\u53d1",children:"\u652f\u6301\u5065\u5eb7\u68c0\u67e5\u4ee5\u53ca\u8bf7\u6c42\u91cd\u53d1"}),"\n",(0,s.jsx)(n.p,{children:"nginx \u53ef\u4ee5\u68c0\u6d4b\u5230\u670d\u52a1\u5668\u5185\u90e8\u7684\u6545\u969c\uff08\u5065\u5eb7\u68c0\u67e5\uff09\uff0c\u6bd4\u5982\u6839\u636e\u670d\u52a1\u5668\u5904\u7406\u7f51\u9875\u8fd4\u56de\u7684\u72b6\u6001\u7801\u3001\u8d85\u65f6\u7b49\u7b49\uff0c\u5e76\u4e14\u4f1a\u628a\u8fd4\u56de\u9519\u8bef\u7684\u8bf7\u6c42\u91cd\u65b0\u63d0\u4ea4\u5230\u53e6\u4e00\u4e2a\u8282\u70b9\u3002\u76ee\u524d LVS \u4e2d ldirectd \u4e5f\u80fd\u652f\u6301\u9488\u5bf9\u670d\u52a1\u5668\u5185\u90e8\u7684\u60c5\u51b5\u6765\u76d1\u63a7\uff0c\u4f46 LVS \u7684\u539f\u7406\u4f7f\u5176\u4e0d\u80fd\u91cd\u53d1\u8bf7\u6c42\u3002\u6bd4\u5982\u7528\u6237\u6b63\u5728\u4e0a\u4f20\u4e00\u4e2a\u6587\u4ef6\uff0c\u800c\u5904\u7406\u8be5\u4e0a\u4f20\u7684\u8282\u70b9\u521a\u597d\u5728\u4e0a\u4f20\u8fc7\u7a0b\u4e2d\u51fa\u73b0\u6545\u969c\uff0cnginx \u4f1a\u628a\u4e0a\u4f20\u5207\u5230\u53e6\u4e00\u53f0\u670d\u52a1\u5668\u91cd\u65b0\u5904\u7406\uff0c\u800c LVS \u5c31\u76f4\u63a5\u65ad\u6389\u4e86\u3002"}),"\n",(0,s.jsx)(n.h2,{id:"lvs-\u7684\u4f18\u52bf",children:"LVS \u7684\u4f18\u52bf"}),"\n",(0,s.jsx)(n.h3,{id:"\u6297\u8d1f\u8f7d\u80fd\u529b\u5f3a",children:"\u6297\u8d1f\u8f7d\u80fd\u529b\u5f3a"}),"\n",(0,s.jsx)(n.p,{children:"\u56e0\u4e3a LVS \u5de5\u4f5c\u65b9\u5f0f\u7684\u903b\u8f91\u662f\u975e\u5e38\u7b80\u5355\u7684\uff0c\u800c\u4e14\u5de5\u4f5c\u5728\u7f51\u7edc\u7684\u7b2c 4 \u5c42\uff0c\u4ec5\u4f5c\u8bf7\u6c42\u5206\u53d1\u7528\uff0c\u6ca1\u6709\u6d41\u91cf\uff0c\u6240\u4ee5\u5728\u6548\u7387\u4e0a\u57fa\u672c\u4e0d\u9700\u8981\u592a\u8fc7\u8003\u8651\u3002LVS \u4e00\u822c\u5f88\u5c11\u51fa\u73b0\u6545\u969c\uff0c\u5373\u4f7f\u51fa\u73b0\u6545\u969c\u4e00\u822c\u4e5f\u662f\u5176\u4ed6\u5730\u65b9\uff08\u5982\u5185\u5b58\u3001CPU \u7b49\uff09\u51fa\u73b0\u95ee\u9898\u5bfc\u81f4 LVS \u51fa\u73b0\u95ee\u9898"}),"\n",(0,s.jsx)(n.h3,{id:"\u914d\u7f6e\u6027\u4f4e",children:"\u914d\u7f6e\u6027\u4f4e"}),"\n",(0,s.jsx)(n.p,{children:"\u8fd9\u901a\u5e38\u662f\u4e00\u5927\u52a3\u52bf\u540c\u65f6\u4e5f\u662f\u4e00\u5927\u4f18\u52bf\uff0c\u56e0\u4e3a\u6ca1\u6709\u592a\u591a\u7684\u53ef\u914d\u7f6e\u7684\u9009\u9879\uff0c\u6240\u4ee5\u9664\u4e86\u589e\u51cf\u670d\u52a1\u5668\uff0c\u5e76\u4e0d\u9700\u8981\u7ecf\u5e38\u53bb\u89e6\u78b0\u5b83\uff0c\u5927\u5927\u51cf\u5c11\u4e86\u4eba\u4e3a\u51fa\u9519\u7684\u51e0\u7387"}),"\n",(0,s.jsx)(n.h3,{id:"\u5de5\u4f5c\u7a33\u5b9a",children:"\u5de5\u4f5c\u7a33\u5b9a"}),"\n",(0,s.jsx)(n.p,{children:"\u56e0\u4e3a\u5176\u672c\u8eab\u6297\u8d1f\u8f7d\u80fd\u529b\u5f88\u5f3a\uff0c\u6240\u4ee5\u7a33\u5b9a\u6027\u9ad8\u4e5f\u662f\u987a\u7406\u6210\u7ae0\u7684\u4e8b\uff0c\u53e6\u5916\u5404\u79cd LVS \u90fd\u6709\u5b8c\u6574\u7684\u53cc\u673a\u70ed\u5907\u65b9\u6848\uff0c\u6240\u4ee5\u4e00\u70b9\u4e0d\u7528\u62c5\u5fc3\u5747\u8861\u5668\u672c\u8eab\u4f1a\u51fa\u4ec0\u4e48\u95ee\u9898\uff0c\u8282\u70b9\u51fa\u73b0\u6545\u969c\u7684\u8bdd\uff0cLVS \u4f1a\u81ea\u52a8\u5224\u522b\uff0c\u6240\u4ee5\u7cfb\u7edf\u6574\u4f53\u662f\u975e\u5e38\u7a33\u5b9a\u7684"}),"\n",(0,s.jsx)(n.h3,{id:"\u65e0\u6d41\u91cf",children:"\u65e0\u6d41\u91cf"}),"\n",(0,s.jsx)(n.p,{children:"LVS \u4ec5\u4ec5\u5206\u53d1\u8bf7\u6c42\uff0c\u800c\u6d41\u91cf\u5e76\u4e0d\u4ece\u5b83\u672c\u8eab\u51fa\u53bb\uff0c\u6240\u4ee5\u53ef\u4ee5\u5229\u7528\u5b83\u8fd9\u70b9\u6765\u505a\u4e00\u4e9b\u7ebf\u8def\u5206\u6d41\u4e4b\u7528\u3002\u6ca1\u6709\u6d41\u91cf\u540c\u65f6\u4e5f\u4fdd\u4f4f\u4e86\u5747\u8861\u5668\u7684 IO \u6027\u80fd\u4e0d\u4f1a\u53d7\u5230\u5927\u6d41\u91cf\u7684\u5f71\u54cd"}),"\n",(0,s.jsx)(n.p,{children:"LVS \u57fa\u672c\u4e0a\u80fd\u652f\u6301\u6240\u6709\u5e94\u7528\uff0c\u56e0\u4e3a LVS \u5de5\u4f5c\u5728\u7b2c 4 \u5c42\uff0c\u6240\u4ee5\u5b83\u53ef\u4ee5\u5bf9\u51e0\u4e4e\u6240\u6709\u5e94\u7528\u505a\u8d1f\u8f7d\u5747\u8861\uff0c\u5305\u62ec http\u3001\u6570\u636e\u5e93\u3001\u804a\u5929\u5ba4\u7b49\u3002"}),"\n",(0,s.jsx)(n.h2,{id:"\u7ad9\u5728\u5de8\u4eba\u7684\u80a9\u8180\u4e0a",children:"\u7ad9\u5728\u5de8\u4eba\u7684\u80a9\u8180\u4e0a"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://www.jianshu.com/p/3ed7575c8c47",children:"LVS \u4e0e Nginx \u533a\u522b"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://www.cnblogs.com/Courage129/p/14333019.html",children:"LVS\u8d1f\u8f7d\u5747\u8861NAT\u6a21\u5f0f\u539f\u7406\u4ecb\u7ecd\u4ee5\u53ca\u914d\u7f6e\u5b9e\u6218"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://www.cnblogs.com/Courage129/p/14334382.html",children:"LVS\u8d1f\u8f7d\u5747\u8861IP\u96a7\u9053\u6a21\u5f0f\u539f\u7406\u4ecb\u7ecd\u4ee5\u53ca\u914d\u7f6e\u5b9e\u6218"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://www.cnblogs.com/Courage129/p/14332902.html",children:"LVS\u8d1f\u8f7d\u5747\u8861\u4e4bDR\u6a21\u5f0f\u539f\u7406\u4ecb\u7ecd"})}),"\n",(0,s.jsx)(n.li,{children:(0,s.jsx)(n.a,{href:"https://www.cnblogs.com/Courage129/p/14334400.html",children:"LVS\u8d1f\u8f7d\u5747\u8861\u7406\u8bba\u4ee5\u53ca\u7b97\u6cd5\u6982\u8981"})}),"\n"]})]})}function x(e={}){const{wrapper:n}={...(0,l.ah)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},88948:(e,n,i)=>{i.d(n,{Z:()=>s});const s=i.p+"assets/images/5-1-ec0ec97d156dfc72eb93bee6de5e51d1.png"},27746:(e,n,i)=>{i.d(n,{Z:()=>s});const s=i.p+"assets/images/5-2-e6ff9a1d03cf51d9e683aff91dfe65d7.png"},36676:(e,n,i)=>{i.d(n,{Z:()=>s});const s=i.p+"assets/images/5-3-86d41b602d5b747dc3569255dc4b637f.png"},14402:(e,n,i)=>{i.d(n,{Z:()=>s});const s=i.p+"assets/images/5-4-97c29e0d0e13df56335d24f37147661e.png"},16138:(e,n,i)=>{i.d(n,{Z:()=>s});const s=i.p+"assets/images/5-5-c0b3ecc9198bbf245f16682983712ba9.png"},80530:(e,n,i)=>{i.d(n,{Z:()=>s});const s=i.p+"assets/images/5-6-34bd791fd1abe598152591158319f700.png"},70807:(e,n,i)=>{i.d(n,{Z:()=>s});const s=i.p+"assets/images/5-7-30a7a3d439ce83d64477c42826e6d993.png"},11151:(e,n,i)=>{i.d(n,{ah:()=>d});var s=i(67294);const l=s.createContext({});function d(e){const n=s.useContext(l);return s.useMemo((()=>"function"==typeof e?e(n):{...n,...e}),[n,e])}}}]);