"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[87229],{6684:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>c,contentTitle:()=>r,default:()=>p,frontMatter:()=>t,metadata:()=>a,toc:()=>o});var l=i(74848),s=i(28453);const t={},r=void 0,a={id:"zh-cn/spring-boot/file/File-Upload-Split-Continue-on-Break",title:"File-Upload-Split-Continue-on-Break",description:"\u5404\u4f4d\u770b\u5b98\u5927\u5bb6\u597d\uff0c\u4eca\u5929\u7ed9\u5927\u5bb6\u5206\u4eab\u7684\u53c8\u662f\u4e00\u7bc7\u5b9e\u6218\u6587\u7ae0\uff0c\u5e0c\u671b\u5927\u5bb6\u80fd\u591f\u559c\u6b22\u3002",source:"@site/docs/zh-cn/spring-boot/file/1-File-Upload-Split-Continue-on-Break.md",sourceDirName:"zh-cn/spring-boot/file",slug:"/zh-cn/spring-boot/file/File-Upload-Split-Continue-on-Break",permalink:"/light-docusaurus/docs/zh-cn/spring-boot/file/File-Upload-Split-Continue-on-Break",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/spring-boot/file/1-File-Upload-Split-Continue-on-Break.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{},sidebar:"troch",previous:{title:"ApiKey-design",permalink:"/light-docusaurus/docs/zh-cn/spring-boot/ApiKey-design"},next:{title:"File-Upload-Split-Continue-on-Break-With-MinIO",permalink:"/light-docusaurus/docs/zh-cn/spring-boot/file/File-Upload-Split-Continue-on-Break-With-MinIO"}},c={},o=[{value:"\u5f00\u5473\u83dc",id:"\u5f00\u5473\u83dc",level:2},{value:"RandomAccessFile",id:"randomaccessfile",level:3},{value:"API",id:"api",level:3},{value:"\u4e3b\u83dc",id:"\u4e3b\u83dc",level:2},{value:"\u6587\u4ef6\u5206\u5757",id:"\u6587\u4ef6\u5206\u5757",level:3},{value:"\u65ad\u70b9\u7eed\u4f20\u3001\u6587\u4ef6\u79d2\u4f20",id:"\u65ad\u70b9\u7eed\u4f20\u6587\u4ef6\u79d2\u4f20",level:3},{value:"\u5206\u5757\u4e0a\u4f20\u3001\u6587\u4ef6\u5408\u5e76",id:"\u5206\u5757\u4e0a\u4f20\u6587\u4ef6\u5408\u5e76",level:3}];function d(e){const n={blockquote:"blockquote",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",ul:"ul",...(0,s.R)(),...e.components};return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(n.p,{children:"\u5404\u4f4d\u770b\u5b98\u5927\u5bb6\u597d\uff0c\u4eca\u5929\u7ed9\u5927\u5bb6\u5206\u4eab\u7684\u53c8\u662f\u4e00\u7bc7\u5b9e\u6218\u6587\u7ae0\uff0c\u5e0c\u671b\u5927\u5bb6\u80fd\u591f\u559c\u6b22\u3002"}),"\n",(0,l.jsx)(n.h2,{id:"\u5f00\u5473\u83dc",children:"\u5f00\u5473\u83dc"}),"\n",(0,l.jsx)(n.p,{children:"\u6700\u8fd1\u63a5\u5230\u4e00\u4e2a\u65b0\u7684\u9700\u6c42\uff0c\u9700\u8981\u4e0a\u4f202G\u5de6\u53f3\u7684\u89c6\u9891\u6587\u4ef6\uff0c\u7528\u6d4b\u8bd5\u73af\u5883\u7684OSS\u8bd5\u4e86\u4e00\u4e0b\uff0c\u4e0a\u4f20\u9700\u8981\u5341\u51e0\u5206\u949f\uff0c\u518d\u8003\u8651\u5230\u516c\u53f8\u7684\u8d44\u6e90\u95ee\u9898\uff0c\u679c\u65ad\u653e\u5f03\u8be5\u65b9\u6848\u3002"}),"\n",(0,l.jsx)(n.p,{children:"\u4e00\u63d0\u5230\u5927\u6587\u4ef6\u4e0a\u4f20\uff0c\u6211\u6700\u5148\u60f3\u5230\u7684\u5c31\u662f\u5404\u79cd\u7f51\u76d8\u4e86\uff0c\u73b0\u5728\u5927\u5bb6\u90fd\u559c\u6b22\u5c06\u81ea\u5df1\u6536\u85cf\u7684\u300c\u5c0f\u7535\u5f71\u300d\u4e0a\u4f20\u5230\u7f51\u76d8\u8fdb\u884c\u4fdd\u5b58\u3002\u7f51\u76d8\u4e00\u822c\u90fd\u652f\u6301\u65ad\u70b9\u7eed\u4f20\u548c\u6587\u4ef6\u79d2\u4f20\u529f\u80fd\uff0c\u51cf\u5c11\u4e86\u7f51\u7edc\u6ce2\u52a8\u548c\u7f51\u7edc\u5e26\u5bbd\u5bf9\u6587\u4ef6\u7684\u9650\u5236\uff0c\u5927\u5927\u63d0\u9ad8\u4e86\u7528\u6237\u4f53\u9a8c\uff0c\u8ba9\u4eba\u7231\u4e0d\u91ca\u624b\u3002"}),"\n",(0,l.jsx)(n.p,{children:"\u8bf4\u5230\u8fd9\uff0c\u5927\u5bb6\u5148\u6765\u4e86\u89e3\u4e00\u4e0b\u8fd9\u51e0\u4e2a\u6982\u5ff5\uff1a"}),"\n",(0,l.jsxs)(n.ul,{children:["\n",(0,l.jsx)(n.li,{children:"\u300c\u6587\u4ef6\u5206\u5757\u300d\uff1a\u5c06\u5927\u6587\u4ef6\u62c6\u5206\u6210\u5c0f\u6587\u4ef6\uff0c\u5c06\u5c0f\u6587\u4ef6\u4e0a\u4f20\\\u4e0b\u8f7d\uff0c\u6700\u540e\u518d\u5c06\u5c0f\u6587\u4ef6\u7ec4\u88c5\u6210\u5927\u6587\u4ef6\uff1b"}),"\n",(0,l.jsx)(n.li,{children:"\u300c\u65ad\u70b9\u7eed\u4f20\u300d\uff1a\u5728\u6587\u4ef6\u5206\u5757\u7684\u57fa\u7840\u4e0a\uff0c\u5c06\u6bcf\u4e2a\u5c0f\u6587\u4ef6\u91c7\u7528\u5355\u72ec\u7684\u7ebf\u7a0b\u8fdb\u884c\u4e0a\u4f20\\\u4e0b\u8f7d\uff0c\u5982\u679c\u78b0\u5230\u7f51\u7edc\u6545\u969c\uff0c\u53ef\u4ee5\u4ece\u5df2\u7ecf\u4e0a\u4f20\\\u4e0b\u8f7d\u7684\u90e8\u5206\u5f00\u59cb\u7ee7\u7eed\u4e0a\u4f20\\\u4e0b\u8f7d\u672a\u5b8c\u6210\u7684\u90e8\u5206\uff0c\u800c\u6ca1\u6709\u5fc5\u8981\u4ece\u5934\u5f00\u59cb\u4e0a\u4f20\\\u4e0b\u8f7d\uff1b"}),"\n",(0,l.jsx)(n.li,{children:"\u300c\u6587\u4ef6\u79d2\u4f20\u300d\uff1a\u8d44\u6e90\u670d\u52a1\u5668\u4e2d\u5df2\u7ecf\u5b58\u5728\u8be5\u6587\u4ef6\uff0c\u5176\u4ed6\u4eba\u4e0a\u4f20\u65f6\u76f4\u63a5\u8fd4\u56de\u8be5\u6587\u4ef6\u7684URI\u3002"}),"\n"]}),"\n",(0,l.jsx)(n.h3,{id:"randomaccessfile",children:"RandomAccessFile"}),"\n",(0,l.jsxs)(n.p,{children:["\u5e73\u65f6\u6211\u4eec\u90fd\u4f1a\u4f7f\u7528 ",(0,l.jsx)(n.code,{children:"FileInputStream"}),"\uff0c",(0,l.jsx)(n.code,{children:"FileOutputStream"}),"\uff0c",(0,l.jsx)(n.code,{children:"FileReader"}),"\u4ee5\u53ca",(0,l.jsx)(n.code,{children:"FileWriter"}),"\u7b49IO\u6d41\u6765\u8bfb\u53d6\u6587\u4ef6\uff0c\u4eca\u5929\u6211\u4eec\u6765\u4e86\u89e3\u4e00\u4e0b",(0,l.jsx)(n.code,{children:"RandomAccessFile"}),"\u3002"]}),"\n",(0,l.jsx)(n.p,{children:"\u5b83\u662f\u4e00\u4e2a\u76f4\u63a5\u7ee7\u627fObject\u7684\u72ec\u7acb\u7684\u7c7b\uff0c\u5e95\u5c42\u5b9e\u73b0\u4e2d\u5b83\u5b9e\u73b0\u7684\u662fDataInput\u548cDataOutput\u63a5\u53e3\u3002\u8be5\u7c7b\u652f\u6301\u968f\u673a\u8bfb\u53d6\u6587\u4ef6\uff0c\u968f\u673a\u8bbf\u95ee\u6587\u4ef6\u7c7b\u4f3c\u4e8e\u6587\u4ef6\u7cfb\u7edf\u4e2d\u5b58\u50a8\u7684\u5927\u5b57\u8282\u6570\u7ec4\u3002"}),"\n",(0,l.jsx)(n.p,{children:"\u5b83\u7684\u5b9e\u73b0\u57fa\u4e8e\u300c\u6587\u4ef6\u6307\u9488\u300d\uff08\u4e00\u79cd\u6e38\u6807\u6216\u8005\u6307\u5411\u9690\u542b\u6570\u7ec4\u7684\u7d22\u5f15\uff09\uff0c\u6587\u4ef6\u6307\u9488\u53ef\u4ee5\u901a\u8fc7getFilePointer\u65b9\u6cd5\u8bfb\u53d6\uff0c\u4e5f\u53ef\u4ee5\u901a\u8fc7seek\u65b9\u6cd5\u8bbe\u7f6e\u3002"}),"\n",(0,l.jsx)(n.p,{children:"\u8f93\u5165\u65f6\u4ece\u6587\u4ef6\u6307\u9488\u5f00\u59cb\u8bfb\u53d6\u5b57\u8282\uff0c\u5e76\u4f7f\u6587\u4ef6\u6307\u9488\u8d85\u8fc7\u8bfb\u53d6\u7684\u5b57\u8282\uff0c\u5982\u679c\u5199\u5165\u8d85\u8fc7\u9690\u542b\u6570\u7ec4\u5f53\u524d\u7ed3\u5c3e\u7684\u8f93\u51fa\u64cd\u4f5c\u4f1a\u5bfc\u81f4\u6269\u5c55\u6570\u7ec4\u3002\u8be5\u7c7b\u6709\u56db\u79cd\u6a21\u5f0f\u53ef\u4f9b\u9009\u62e9\uff1a"}),"\n",(0,l.jsxs)(n.ul,{children:["\n",(0,l.jsx)(n.li,{children:"r\uff1a \u4ee5\u53ea\u8bfb\u65b9\u5f0f\u6253\u5f00\u6587\u4ef6\uff0c\u5982\u679c\u6267\u884c\u5199\u5165\u64cd\u4f5c\u4f1a\u629b\u51faIOException;"}),"\n",(0,l.jsx)(n.li,{children:"rw\uff1a \u4ee5\u8bfb\u3001\u5199\u65b9\u5f0f\u6253\u5f00\u6587\u4ef6\uff0c\u5982\u679c\u6587\u4ef6\u4e0d\u5b58\u5728\uff0c\u5219\u5c1d\u8bd5\u521b\u5efa\u6587\u4ef6\uff1b"}),"\n",(0,l.jsx)(n.li,{children:"rws\uff1a \u4ee5\u8bfb\u3001\u5199\u65b9\u5f0f\u6253\u5f00\u6587\u4ef6\uff0c\u8981\u6c42\u5bf9\u6587\u4ef6\u5185\u5bb9\u6216\u5143\u6570\u636e\u7684\u6bcf\u6b21\u66f4\u65b0\u90fd\u540c\u6b65\u5199\u5165\u5e95\u5c42\u5b58\u50a8\u8bbe\u5907\uff1b"}),"\n",(0,l.jsx)(n.li,{children:"rwd\uff1a \u4ee5\u8bfb\u3001\u5199\u65b9\u5f0f\u6253\u5f00\u6587\u4ef6\uff0c\u8981\u6c42\u5bf9\u6587\u4ef6\u5185\u5bb9\u7684\u6bcf\u6b21\u66f4\u65b0\u90fd\u540c\u6b65\u5199\u5165\u5e95\u5c42\u5b58\u50a8\u8bbe\u5907\uff1b"}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"\u5728rw\u6a21\u5f0f\u4e0b\uff0c\u9ed8\u8ba4\u662f\u4f7f\u7528buffer\u7684\uff0c\u53ea\u6709cache\u6ee1\u7684\u6216\u8005\u4f7f\u7528RandomAccessFile.close()\u5173\u95ed\u6d41\u7684\u65f6\u5019\u624d\u771f\u6b63\u7684\u5199\u5230\u6587\u4ef6\u3002"}),"\n",(0,l.jsx)(n.h3,{id:"api",children:"API"}),"\n",(0,l.jsxs)(n.p,{children:["1\u3001",(0,l.jsx)(n.code,{children:"void seek(long pos)"}),"\uff1a\u8bbe\u7f6e\u4e0b\u4e00\u6b21\u8bfb\u53d6\u6216\u5199\u5165\u65f6\u7684\u6587\u4ef6\u6307\u9488\u504f\u79fb\u91cf\uff0c\u901a\u4fd7\u70b9\u8bf4\u5c31\u662f\u6307\u5b9a\u4e0b\u6b21\u8bfb\u6587\u4ef6\u6570\u636e\u7684\u4f4d\u7f6e\u3002"]}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsx)(n.p,{children:"\u275d\n\u504f\u79fb\u91cf\u53ef\u4ee5\u8bbe\u7f6e\u5728\u6587\u4ef6\u672b\u5c3e\u4e4b\u5916\uff0c\u53ea\u6709\u5728\u504f\u79fb\u91cf\u8bbe\u7f6e\u8d85\u51fa\u6587\u4ef6\u672b\u5c3e\u540e\uff0c\u624d\u80fd\u901a\u8fc7\u5199\u5165\u66f4\u6539\u6587\u4ef6\u957f\u5ea6\uff1b\n\u275e"}),"\n"]}),"\n",(0,l.jsxs)(n.p,{children:["2\u3001",(0,l.jsx)(n.code,{children:"native long getFilePointer()"}),"\uff1a\u8fd4\u56de\u5f53\u524d\u6587\u4ef6\u7684\u5149\u6807\u4f4d\u7f6e\uff1b"]}),"\n",(0,l.jsxs)(n.p,{children:["3\u3001",(0,l.jsx)(n.code,{children:"native long length()"}),"\uff1a\u8fd4\u56de\u5f53\u524d\u6587\u4ef6\u7684\u957f\u5ea6\uff1b"]}),"\n",(0,l.jsx)(n.p,{children:"4\u3001\u300c\u8bfb\u300d\u65b9\u6cd5"}),"\n",(0,l.jsx)(n.p,{children:"5\u3001\u300c\u5199\u300d\u65b9\u6cd5"}),"\n",(0,l.jsxs)(n.p,{children:["6\u3001",(0,l.jsx)(n.code,{children:"readFully(byte[] b)"}),"\uff1a\u8fd9\u4e2a\u65b9\u6cd5\u7684\u4f5c\u7528\u5c31\u662f\u5c06\u6587\u672c\u4e2d\u7684\u5185\u5bb9\u586b\u6ee1\u8fd9\u4e2a\u7f13\u51b2\u533ab\u3002\u5982\u679c\u7f13\u51b2b\u4e0d\u80fd\u88ab\u586b\u6ee1\uff0c\u90a3\u4e48\u8bfb\u53d6\u6d41\u7684\u8fc7\u7a0b\u5c06\u88ab\u963b\u585e\uff0c\u5982\u679c\u53d1\u73b0\u662f\u6d41\u7684\u7ed3\u5c3e\uff0c\u90a3\u4e48\u4f1a\u629b\u51fa\u5f02\u5e38\uff1b"]}),"\n",(0,l.jsxs)(n.p,{children:["7\u3001",(0,l.jsx)(n.code,{children:"FileChannel getChannel()"}),"\uff1a\u8fd4\u56de\u4e0e\u6b64\u6587\u4ef6\u5173\u8054\u7684\u552f\u4e00FileChannel\u5bf9\u8c61\uff1b"]}),"\n",(0,l.jsxs)(n.p,{children:["8\u3001",(0,l.jsx)(n.code,{children:"int skipBytes(int n)"}),"\uff1a\u8bd5\u56fe\u8df3\u8fc7n\u4e2a\u5b57\u8282\u7684\u8f93\u5165\uff0c\u4e22\u5f03\u8df3\u8fc7\u7684\u5b57\u8282\uff1b"]}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsx)(n.p,{children:"\u275d\nRandomAccessFile\u7684\u7edd\u5927\u591a\u6570\u529f\u80fd\uff0c\u5df2\u7ecf\u88abJDK1.4\u7684NIO\u7684\u300c\u5185\u5b58\u6620\u5c04\u300d\u6587\u4ef6\u53d6\u4ee3\u4e86\uff0c\u5373\u628a\u6587\u4ef6\u6620\u5c04\u5230\u5185\u5b58\u540e\u518d\u64cd\u4f5c\uff0c\u7701\u53bb\u4e86\u9891\u7e41\u78c1\u76d8io\u3002\n\u275e"}),"\n"]}),"\n",(0,l.jsx)(n.h2,{id:"\u4e3b\u83dc",children:"\u4e3b\u83dc"}),"\n",(0,l.jsx)(n.p,{children:"\u603b\u7ed3\u7ecf\u9a8c\uff0c\u7825\u783a\u524d\u884c\uff1a\u4e4b\u524d\u7684\u5b9e\u6218\u6587\u7ae0\u4e2d\u8fc7\u591a\u7684\u7c98\u8d34\u4e86\u6e90\u7801\uff0c\u5f71\u54cd\u4e86\u5404\u4f4d\u5c0f\u4f19\u4f34\u7684\u9605\u8bfb\u611f\u53d7\u3002\u7ecf\u8fc7\u5927\u4f6c\u7684\u70b9\u62e8\uff0c\u4ee5\u540e\u5c06\u5c55\u793a\u90e8\u5206\u5173\u952e\u4ee3\u7801\uff0c\u4f9b\u5404\u4f4d\u8d4f\u6790\uff0c\u6e90\u7801\u53ef\u5728\u300c\u540e\u53f0\u300d\u83b7\u53d6\u3002"}),"\n",(0,l.jsx)(n.h3,{id:"\u6587\u4ef6\u5206\u5757",children:"\u6587\u4ef6\u5206\u5757"}),"\n",(0,l.jsx)(n.p,{children:"\u6587\u4ef6\u5206\u5757\u9700\u8981\u5728\u524d\u7aef\u8fdb\u884c\u5904\u7406\uff0c\u53ef\u4ee5\u5229\u7528\u5f3a\u5927\u7684js\u5e93\u6216\u8005\u73b0\u6210\u7684\u7ec4\u4ef6\u8fdb\u884c\u5206\u5757\u5904\u7406\u3002\u9700\u8981\u786e\u5b9a\u5206\u5757\u7684\u5927\u5c0f\u548c\u5206\u5757\u7684\u6570\u91cf\uff0c\u7136\u540e\u4e3a\u6bcf\u4e00\u4e2a\u5206\u5757\u6307\u5b9a\u4e00\u4e2a\u7d22\u5f15\u503c\u3002"}),"\n",(0,l.jsx)(n.p,{children:"\u4e3a\u4e86\u9632\u6b62\u4e0a\u4f20\u6587\u4ef6\u7684\u5206\u5757\u4e0e\u5176\u5b83\u6587\u4ef6\u6df7\u6dc6\uff0c\u91c7\u7528\u6587\u4ef6\u7684md5\u503c\u6765\u8fdb\u884c\u533a\u5206\uff0c\u8be5\u503c\u4e5f\u53ef\u4ee5\u7528\u6765\u6821\u9a8c\u670d\u52a1\u5668\u4e0a\u662f\u5426\u5b58\u5728\u8be5\u6587\u4ef6\u4ee5\u53ca\u6587\u4ef6\u7684\u4e0a\u4f20\u72b6\u6001\u3002"}),"\n",(0,l.jsxs)(n.ul,{children:["\n",(0,l.jsx)(n.li,{children:"\u5982\u679c\u6587\u4ef6\u5b58\u5728\uff0c\u76f4\u63a5\u8fd4\u56de\u6587\u4ef6\u5730\u5740\uff1b"}),"\n",(0,l.jsx)(n.li,{children:"\u5982\u679c\u6587\u4ef6\u4e0d\u5b58\u5728\uff0c\u4f46\u662f\u6709\u4e0a\u4f20\u72b6\u6001\uff0c\u5373\u90e8\u5206\u5206\u5757\u4e0a\u4f20\u6210\u529f\uff0c\u5219\u8fd4\u56de\u672a\u4e0a\u4f20\u7684\u5206\u5757\u7d22\u5f15\u6570\u7ec4\uff1b"}),"\n",(0,l.jsx)(n.li,{children:"\u5982\u679c\u6587\u4ef6\u4e0d\u5b58\u5728\uff0c\u4e14\u4e0a\u4f20\u72b6\u6001\u4e3a\u7a7a\uff0c\u5219\u6240\u6709\u5206\u5757\u5747\u9700\u8981\u4e0a\u4f20\u3002"}),"\n"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-java",children:'fileRederInstance.readAsBinaryString(file);\nfileRederInstance.addEventListener("load", (e) => {\n    let fileBolb = e.target.result;\n    fileMD5 = md5(fileBolb);\n    const formData = new FormData();\n    formData.append("md5", fileMD5);\n    axios\n        .post(http + "/fileUpload/checkFileMd5", formData)\n        .then((res) => {\n            if (res.data.message == "\u6587\u4ef6\u5df2\u5b58\u5728") {\n                //\u6587\u4ef6\u5df2\u5b58\u5728\u4e0d\u8d70\u540e\u9762\u5206\u7247\u4e86\uff0c\u76f4\u63a5\u8fd4\u56de\u6587\u4ef6\u5730\u5740\u5230\u524d\u53f0\u9875\u9762\n                success && success(res);\n            } else {\n                //\u6587\u4ef6\u4e0d\u5b58\u5728\u5b58\u5728\u4e24\u79cd\u60c5\u51b5\uff0c\u4e00\u79cd\u662f\u8fd4\u56dedata\uff1anull\u4ee3\u8868\u672a\u4e0a\u4f20\u8fc7 \u4e00\u79cd\u662fdata:[xx\uff0cxx] \u8fd8\u6709\u54ea\u51e0\u7247\u672a\u4e0a\u4f20\n                if (!res.data.data) {\n                    //\u8fd8\u6709\u51e0\u7247\u672a\u4e0a\u4f20\u60c5\u51b5\uff0c\u65ad\u70b9\u7eed\u4f20\n                    chunkArr = res.data.data;\n                }\n                readChunkMD5();\n            }\n        })\n        .catch((e) => {});\n});\n'})}),"\n",(0,l.jsx)(n.p,{children:"\u5728\u8c03\u7528\u4e0a\u4f20\u63a5\u53e3\u524d\uff0c\u901a\u8fc7slice\u65b9\u6cd5\u6765\u53d6\u51fa\u7d22\u5f15\u5728\u6587\u4ef6\u4e2d\u5bf9\u5e94\u4f4d\u7f6e\u7684\u5206\u5757\u3002"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-java",children:"const getChunkInfo = (file, currentChunk, chunkSize) => {\n       //\u83b7\u53d6\u5bf9\u5e94\u4e0b\u6807\u4e0b\u7684\u6587\u4ef6\u7247\u6bb5\n       let start = currentChunk * chunkSize;\n       let end = Math.min(file.size, start + chunkSize);\n       //\u5bf9\u6587\u4ef6\u5206\u5757\n       let chunk = file.slice(start, end);\n       return { start, end, chunk };\n   };\n"})}),"\n",(0,l.jsx)(n.p,{children:"\u4e4b\u540e\u8c03\u7528\u4e0a\u4f20\u63a5\u53e3\u5b8c\u6210\u4e0a\u4f20\u3002"}),"\n",(0,l.jsx)(n.h3,{id:"\u65ad\u70b9\u7eed\u4f20\u6587\u4ef6\u79d2\u4f20",children:"\u65ad\u70b9\u7eed\u4f20\u3001\u6587\u4ef6\u79d2\u4f20"}),"\n",(0,l.jsx)(n.p,{children:"\u540e\u7aef\u57fa\u4e8espring boot\u5f00\u53d1\uff0c\u4f7f\u7528redis\u6765\u5b58\u50a8\u4e0a\u4f20\u6587\u4ef6\u7684\u72b6\u6001\u548c\u4e0a\u4f20\u6587\u4ef6\u7684\u5730\u5740\u3002"}),"\n",(0,l.jsx)(n.p,{children:"\u5982\u679c\u6587\u4ef6\u5b8c\u6574\u4e0a\u4f20\uff0c\u8fd4\u56de\u6587\u4ef6\u8def\u5f84\uff1b\u90e8\u5206\u4e0a\u4f20\u5219\u8fd4\u56de\u672a\u4e0a\u4f20\u7684\u5206\u5757\u6570\u7ec4\uff1b\u5982\u679c\u672a\u4e0a\u4f20\u8fc7\u8fd4\u56de\u63d0\u793a\u4fe1\u606f\u3002"}),"\n",(0,l.jsxs)(n.blockquote,{children:["\n",(0,l.jsx)(n.p,{children:"\u275d\n\u5728\u4e0a\u4f20\u5206\u5757\u65f6\u4f1a\u4ea7\u751f\u4e24\u4e2a\u6587\u4ef6\uff0c\u4e00\u4e2a\u662f\u6587\u4ef6\u4e3b\u4f53\uff0c\u4e00\u4e2a\u662f\u4e34\u65f6\u6587\u4ef6\u3002\u4e34\u65f6\u6587\u4ef6\u53ef\u4ee5\u770b\u505a\u662f\u4e00\u4e2a\u6570\u7ec4\u6587\u4ef6\uff0c\u4e3a\u6bcf\u4e00\u4e2a\u5206\u5757\u5206\u914d\u4e00\u4e2a\u503c\u4e3a127\u7684\u5b57\u8282\u3002\n\u275e"}),"\n"]}),"\n",(0,l.jsx)(n.p,{children:"\u6821\u9a8cMD5\u503c\u65f6\u4f1a\u7528\u5230\u4e24\u4e2a\u503c\uff1a"}),"\n",(0,l.jsxs)(n.ul,{children:["\n",(0,l.jsx)(n.li,{children:"\u6587\u4ef6\u4e0a\u4f20\u72b6\u6001\uff1a\u53ea\u8981\u8be5\u6587\u4ef6\u4e0a\u4f20\u8fc7\u5c31\u4e0d\u4e3a\u7a7a\uff0c\u5982\u679c\u5b8c\u6574\u4e0a\u4f20\u5219\u4e3atrue\uff0c\u90e8\u5206\u4e0a\u4f20\u8fd4\u56defalse\uff1b"}),"\n",(0,l.jsx)(n.li,{children:"\u6587\u4ef6\u4e0a\u4f20\u5730\u5740\uff1a\u5982\u679c\u6587\u4ef6\u5b8c\u6574\u4e0a\u4f20\uff0c\u8fd4\u56de\u6587\u4ef6\u8def\u5f84\uff1b\u90e8\u5206\u4e0a\u4f20\u8fd4\u56de\u4e34\u65f6\u6587\u4ef6\u8def\u5f84\u3002"}),"\n"]}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-java",children:'/**\n * \u6821\u9a8c\u6587\u4ef6\u7684MD5\n **/\npublic Result checkFileMd5(String md5) throws IOException {\n    //\u6587\u4ef6\u662f\u5426\u4e0a\u4f20\u72b6\u6001\uff1a\u53ea\u8981\u8be5\u6587\u4ef6\u4e0a\u4f20\u8fc7\u8be5\u503c\u4e00\u5b9a\u5b58\u5728\n    Object processingObj = stringRedisTemplate.opsForHash().get(UploadConstants.FILE_UPLOAD_STATUS, md5);\n    if (processingObj == null) {\n        return Result.ok("\u8be5\u6587\u4ef6\u6ca1\u6709\u4e0a\u4f20\u8fc7");\n    }\n    boolean processing = Boolean.parseBoolean(processingObj.toString());\n    //\u5b8c\u6574\u6587\u4ef6\u4e0a\u4f20\u5b8c\u6210\u65f6\u4e3a\u6587\u4ef6\u7684\u8def\u5f84\uff0c\u5982\u679c\u672a\u5b8c\u6210\u8fd4\u56de\u4e34\u65f6\u6587\u4ef6\u8def\u5f84\uff08\u4e34\u65f6\u6587\u4ef6\u76f8\u5f53\u4e8e\u6570\u7ec4\uff0c\u4e3a\u6bcf\u4e2a\u5206\u5757\u5206\u914d\u4e00\u4e2a\u503c\u4e3a127\u7684\u5b57\u8282\uff09\n    String value = stringRedisTemplate.opsForValue().get(UploadConstants.FILE_MD5_KEY + md5);\n    //\u5b8c\u6574\u6587\u4ef6\u4e0a\u4f20\u5b8c\u6210\u662ftrue\uff0c\u672a\u5b8c\u6210\u8fd4\u56defalse\n    if (processing) {\n        return Result.ok(value,"\u6587\u4ef6\u5df2\u5b58\u5728");\n    } else {\n        File confFile = new File(value);\n        byte[] completeList = FileUtils.readFileToByteArray(confFile);\n        List<Integer> missChunkList = new LinkedList<>();\n        for (int i = 0; i < completeList.length; i++) {\n            if (completeList[i] != Byte.MAX_VALUE) {\n                //\u7528\u7a7a\u683c\u8865\u9f50\n                missChunkList.add(i);\n            }\n        }\n        return Result.ok(missChunkList,"\u8be5\u6587\u4ef6\u4e0a\u4f20\u4e86\u4e00\u90e8\u5206");\n    }\n}\n'})}),"\n",(0,l.jsx)(n.p,{children:"\u8bf4\u5230\u8fd9\uff0c\u4f60\u80af\u5b9a\u4f1a\u95ee\uff1a\u5f53\u8fd9\u4e2a\u6587\u4ef6\u7684\u6240\u6709\u5206\u5757\u4e0a\u4f20\u5b8c\u6210\u4e4b\u540e\uff0c\u8be5\u600e\u4e48\u5f97\u5230\u5b8c\u6574\u7684\u6587\u4ef6\u5462\uff1f\u63a5\u4e0b\u6765\u6211\u4eec\u5c31\u8bf4\u4e00\u4e0b\u5206\u5757\u5408\u5e76\u7684\u95ee\u9898\u3002"}),"\n",(0,l.jsx)(n.h3,{id:"\u5206\u5757\u4e0a\u4f20\u6587\u4ef6\u5408\u5e76",children:"\u5206\u5757\u4e0a\u4f20\u3001\u6587\u4ef6\u5408\u5e76"}),"\n",(0,l.jsx)(n.p,{children:"\u4e0a\u8fb9\u6211\u4eec\u63d0\u5230\u4e86\u5229\u7528\u6587\u4ef6\u7684md5\u503c\u6765\u7ef4\u62a4\u5206\u5757\u548c\u6587\u4ef6\u7684\u5173\u7cfb\uff0c\u56e0\u6b64\u6211\u4eec\u4f1a\u5c06\u5177\u6709\u76f8\u540cmd5\u503c\u7684\u5206\u5757\u8fdb\u884c\u5408\u5e76\uff0c\u7531\u4e8e\u6bcf\u4e2a\u5206\u5757\u90fd\u6709\u81ea\u5df1\u7684\u7d22\u5f15\u503c\uff0c\u6240\u4ee5\u6211\u4eec\u4f1a\u5c06\u5206\u5757\u6309\u7d22\u5f15\u50cf\u63d2\u5165\u6570\u7ec4\u4e00\u6837\u5206\u522b\u63d2\u5165\u6587\u4ef6\u4e2d\uff0c\u5f62\u6210\u5b8c\u6574\u7684\u6587\u4ef6\u3002"}),"\n",(0,l.jsx)(n.p,{children:"\u5206\u5757\u4e0a\u4f20\u65f6\uff0c\u8981\u548c\u524d\u7aef\u7684\u5206\u5757\u5927\u5c0f\u3001\u5206\u5757\u6570\u91cf\u3001\u5f53\u524d\u5206\u5757\u7d22\u5f15\u7b49\u5bf9\u5e94\u597d\uff0c\u4ee5\u5907\u6587\u4ef6\u5408\u5e76\u65f6\u4f7f\u7528\uff0c\u6b64\u5904\u6211\u4eec\u91c7\u7528\u7684\u662f\u300c\u78c1\u76d8\u6620\u5c04\u300d\u7684\u65b9\u5f0f\u6765\u5408\u5e76\u6587\u4ef6\u3002"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-java",children:' //\u8bfb\u64cd\u4f5c\u548c\u5199\u64cd\u4f5c\u90fd\u662f\u5141\u8bb8\u7684\nRandomAccessFile tempRaf = new RandomAccessFile(tmpFile, "rw");\n//\u5b83\u8fd4\u56de\u7684\u5c31\u662fnio\u901a\u4fe1\u4e2d\u7684file\u7684\u552f\u4e00channel\nFileChannel fileChannel = tempRaf.getChannel();\n\n//\u5199\u5165\u8be5\u5206\u7247\u6570\u636e   \u5206\u7247\u5927\u5c0f * \u7b2c\u51e0\u5757\u5206\u7247\u83b7\u53d6\u504f\u79fb\u91cf\nlong offset = CHUNK_SIZE * multipartFileDTO.getChunk();\n//\u5206\u7247\u6587\u4ef6\u5927\u5c0f\nbyte[] fileData = multipartFileDTO.getFile().getBytes();\n//\u5c06\u6587\u4ef6\u7684\u533a\u57df\u76f4\u63a5\u6620\u5c04\u5230\u5185\u5b58\nMappedByteBuffer mappedByteBuffer = fileChannel.map(FileChannel.MapMode.READ_WRITE, offset, fileData.length);\nmappedByteBuffer.put(fileData);\n// \u91ca\u653e\nFileMD5Util.freedMappedByteBuffer(mappedByteBuffer);\nfileChannel.close();\n'})}),"\n",(0,l.jsx)(n.p,{children:"\u6bcf\u5f53\u5b8c\u6210\u4e00\u6b21\u5206\u5757\u7684\u4e0a\u4f20\uff0c\u8fd8\u9700\u8981\u53bb\u68c0\u67e5\u6587\u4ef6\u7684\u4e0a\u4f20\u8fdb\u5ea6\uff0c\u770b\u6587\u4ef6\u662f\u5426\u4e0a\u4f20\u5b8c\u6210\u3002"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-java",children:'RandomAccessFile accessConfFile = new RandomAccessFile(confFile, "rw");\n//\u628a\u8be5\u5206\u6bb5\u6807\u8bb0\u4e3a true \u8868\u793a\u5b8c\u6210\naccessConfFile.setLength(multipartFileDTO.getChunks());\naccessConfFile.seek(multipartFileDTO.getChunk());\naccessConfFile.write(Byte.MAX_VALUE);\n\n//completeList \u68c0\u67e5\u662f\u5426\u5168\u90e8\u5b8c\u6210,\u5982\u679c\u6570\u7ec4\u91cc\u662f\u5426\u5168\u90e8\u90fd\u662f(\u5168\u90e8\u5206\u7247\u90fd\u6210\u529f\u4e0a\u4f20)\nbyte[] completeList = FileUtils.readFileToByteArray(confFile);\nbyte isComplete = Byte.MAX_VALUE;\nfor (int i = 0; i < completeList.length && isComplete == Byte.MAX_VALUE; i++) {\n    //\u4e0e\u8fd0\u7b97, \u5982\u679c\u6709\u90e8\u5206\u6ca1\u6709\u5b8c\u6210\u5219 isComplete \u4e0d\u662f Byte.MAX_VALUE\n    isComplete = (byte) (isComplete & completeList[i]);\n}\naccessConfFile.close();\n'})}),"\n",(0,l.jsx)(n.p,{children:"\u7136\u540e\u66f4\u65b0\u6587\u4ef6\u7684\u4e0a\u4f20\u8fdb\u5ea6\u5230Redis\u4e2d\u3002"}),"\n",(0,l.jsx)(n.pre,{children:(0,l.jsx)(n.code,{className:"language-java",children:'//\u66f4\u65b0redis\u4e2d\u7684\u72b6\u6001\uff1a\u5982\u679c\u662ftrue\u7684\u8bdd\u8bc1\u660e\u662f\u5df2\u7ecf\u8be5\u5927\u6587\u4ef6\u5168\u90e8\u4e0a\u4f20\u5b8c\u6210\nif (isComplete == Byte.MAX_VALUE) {\n    stringRedisTemplate.opsForHash().put(UploadConstants.FILE_UPLOAD_STATUS, multipartFileDTO.getMd5(), "true");\n    stringRedisTemplate.opsForValue().set(UploadConstants.FILE_MD5_KEY + multipartFileDTO.getMd5(), uploadDirPath + "/" + fileName);\n} else {\n    if (!stringRedisTemplate.opsForHash().hasKey(UploadConstants.FILE_UPLOAD_STATUS, multipartFileDTO.getMd5())) {\n        stringRedisTemplate.opsForHash().put(UploadConstants.FILE_UPLOAD_STATUS, multipartFileDTO.getMd5(), "false");\n    }\n    if (!stringRedisTemplate.hasKey(UploadConstants.FILE_MD5_KEY + multipartFileDTO.getMd5())) {\n        stringRedisTemplate.opsForValue().set(UploadConstants.FILE_MD5_KEY + multipartFileDTO.getMd5(), uploadDirPath + "/" + fileName + ".conf");\n    }\n}\n'})})]})}function p(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,l.jsx)(n,{...e,children:(0,l.jsx)(d,{...e})}):d(e)}},28453:(e,n,i)=>{i.d(n,{R:()=>r,x:()=>a});var l=i(96540);const s={},t=l.createContext(s);function r(e){const n=l.useContext(t);return l.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),l.createElement(t.Provider,{value:n},e.children)}}}]);