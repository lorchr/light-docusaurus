"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[9726],{45808:(n,e,r)=>{r.r(e),r.d(e,{assets:()=>h,contentTitle:()=>t,default:()=>d,frontMatter:()=>a,metadata:()=>s,toc:()=>l});var i=r(85893),c=r(11151);const a={},t=void 0,s={id:"zh-cn/java/Java-Concurrent-Semaphore",title:"Java-Concurrent-Semaphore",description:"- Java\u5e76\u53d1\u7cfb\u5217[6]----Semaphore\u6e90\u7801\u5206\u6790",source:"@site/docs/zh-cn/java/3-Java-Concurrent-Semaphore.md",sourceDirName:"zh-cn/java",slug:"/zh-cn/java/Java-Concurrent-Semaphore",permalink:"/light-docusaurus/docs/zh-cn/java/Java-Concurrent-Semaphore",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/java/3-Java-Concurrent-Semaphore.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{},sidebar:"troch",previous:{title:"Java-Concurrent-ReentrantLock",permalink:"/light-docusaurus/docs/zh-cn/java/Java-Concurrent-ReentrantLock"},next:{title:"Java-Concurrent-CountDownlatch",permalink:"/light-docusaurus/docs/zh-cn/java/Java-Concurrent-CountDownlatch"}},h={},l=[{value:"1\u3001\u83b7\u53d6\u8bb8\u53ef\u8bc1",id:"1\u83b7\u53d6\u8bb8\u53ef\u8bc1",level:2},{value:"2\u3001\u91ca\u653e\u8bb8\u53ef\u8bc1",id:"2\u91ca\u653e\u8bb8\u53ef\u8bc1",level:2},{value:"3\u3001\u52a8\u624b\u5199\u4e2a\u8fde\u63a5\u6c60",id:"3\u52a8\u624b\u5199\u4e2a\u8fde\u63a5\u6c60",level:2}];function o(n){const e={a:"a",code:"code",h2:"h2",img:"img",li:"li",p:"p",pre:"pre",ul:"ul",...(0,c.ah)(),...n.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(e.ul,{children:["\n",(0,i.jsx)(e.li,{children:(0,i.jsx)(e.a,{href:"https://cnblogs.com/liuyun1995/p/8474026.html",children:"Java\u5e76\u53d1\u7cfb\u5217[6]----Semaphore\u6e90\u7801\u5206\u6790"})}),"\n",(0,i.jsx)(e.li,{children:(0,i.jsx)(e.a,{href:"https://mp.weixin.qq.com/s/gfrnrGEfqkA1MpGq8aAnAQ",children:"\u301096\u671f\u3011Java\u5e76\u53d1\u7cfb\u5217 | Semaphore\u6e90\u7801\u5206\u6790"})}),"\n"]}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.code,{children:"Semaphore"}),"(\u4fe1\u53f7\u91cf)\u662fJUC\u5305\u4e2d\u6bd4\u8f83\u5e38\u7528\u5230\u7684\u4e00\u4e2a\u7c7b\uff0c\u5b83\u662fAQS\u5171\u4eab\u6a21\u5f0f\u7684\u4e00\u4e2a\u5e94\u7528\uff0c\u53ef\u4ee5\u5141\u8bb8\u591a\u4e2a\u7ebf\u7a0b\u540c\u65f6\u5bf9\u5171\u4eab\u8d44\u6e90\u8fdb\u884c\u64cd\u4f5c\uff0c\u5e76\u4e14\u53ef\u4ee5\u6709\u6548\u7684\u63a7\u5236\u5e76\u53d1\u6570\uff0c\u5229\u7528\u5b83\u53ef\u4ee5\u5f88\u597d\u7684\u5b9e\u73b0\u6d41\u91cf\u63a7\u5236\u3002"]}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.code,{children:"Semaphore"}),"\u63d0\u4f9b\u4e86\u4e00\u4e2a\u8bb8\u53ef\u8bc1\u7684\u6982\u5ff5\uff0c\u53ef\u4ee5\u628a\u8fd9\u4e2a\u8bb8\u53ef\u8bc1\u770b\u4f5c\u516c\u5171\u6c7d\u8f66\u8f66\u7968\uff0c\u53ea\u6709\u6210\u529f\u83b7\u53d6\u8f66\u7968\u7684\u4eba\u624d\u80fd\u591f\u4e0a\u8f66\uff0c\u5e76\u4e14\u8f66\u7968\u662f\u6709\u4e00\u5b9a\u6570\u91cf\u7684\uff0c\u4e0d\u53ef\u80fd\u6beb\u65e0\u9650\u5236\u7684\u53d1\u4e0b\u53bb\uff0c\u8fd9\u6837\u5c31\u4f1a\u5bfc\u81f4\u516c\u4ea4\u8f66\u8d85\u8f7d\u3002\u6240\u4ee5\u5f53\u8f66\u7968\u53d1\u5b8c\u7684\u65f6\u5019(\u516c\u4ea4\u8f66\u4ee5\u6ee1\u8f7d)\uff0c\u5176\u4ed6\u4eba\u5c31\u53ea\u80fd\u7b49\u4e0b\u4e00\u8d9f\u8f66\u4e86\u3002\u5982\u679c\u4e2d\u9014\u6709\u4eba\u4e0b\u8f66\uff0c\u90a3\u4e48\u4ed6\u7684\u4f4d\u7f6e\u5c06\u4f1a\u7a7a\u95f2\u51fa\u6765\uff0c\u56e0\u6b64\u5982\u679c\u8fd9\u65f6\u5176\u4ed6\u4eba\u60f3\u8981\u4e0a\u8f66\u7684\u8bdd\u5c31\u53c8\u53ef\u4ee5\u83b7\u5f97\u8f66\u7968\u4e86\u3002"]}),"\n",(0,i.jsxs)(e.p,{children:["\u5229\u7528",(0,i.jsx)(e.code,{children:"Semaphore"}),"\u53ef\u4ee5\u5b9e\u73b0\u5404\u79cd\u6c60\uff0c\u6211\u4eec\u5728\u672c\u7bc7\u672b\u5c3e\u5c06\u4f1a\u52a8\u624b\u5199\u4e00\u4e2a\u7b80\u6613\u7684\u6570\u636e\u5e93\u8fde\u63a5\u6c60\u3002\u9996\u5148\u6211\u4eec\u6765\u770b\u4e00\u4e0b",(0,i.jsx)(e.code,{children:"Semaphore"}),"\u7684\u6784\u9020\u5668\u3002"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:"//\u6784\u9020\u56681\npublic Semaphore(int permits) {\n    sync = new NonfairSync(permits);\n}\n\n//\u6784\u9020\u56682\npublic Semaphore(int permits, boolean fair) {\n    sync = fair ? new FairSync(permits) : new NonfairSync(permits);\n}\n"})}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.code,{children:"Semaphore"}),"\u63d0\u4f9b\u4e86\u4e24\u4e2a\u5e26\u53c2\u6784\u9020\u5668\uff0c\u6ca1\u6709\u63d0\u4f9b\u65e0\u53c2\u6784\u9020\u5668\u3002\u8fd9\u4e24\u4e2a\u6784\u9020\u5668\u90fd\u5fc5\u987b\u4f20\u5165\u4e00\u4e2a\u521d\u59cb\u7684\u8bb8\u53ef\u8bc1\u6570\u91cf\uff0c\u4f7f\u7528\u6784\u9020\u56681\u6784\u9020\u51fa\u6765\u7684\u4fe1\u53f7\u91cf\u5728\u83b7\u53d6\u8bb8\u53ef\u8bc1\u65f6\u4f1a\u91c7\u7528\u975e\u516c\u5e73\u65b9\u5f0f\u83b7\u53d6\uff0c\u4f7f\u7528\u6784\u9020\u56682\u53ef\u4ee5\u901a\u8fc7\u53c2\u6570\u6307\u5b9a\u83b7\u53d6\u8bb8\u53ef\u8bc1\u7684\u65b9\u5f0f(\u516c\u5e73or\u975e\u516c\u5e73)\u3002"]}),"\n",(0,i.jsx)(e.p,{children:"Semaphore\u4e3b\u8981\u5bf9\u5916\u63d0\u4f9b\u4e86\u4e24\u7c7bAPI\uff0c\u83b7\u53d6\u8bb8\u53ef\u8bc1\u548c\u91ca\u653e\u8bb8\u53ef\u8bc1\uff0c\u9ed8\u8ba4\u7684\u662f\u83b7\u53d6\u548c\u91ca\u653e\u4e00\u4e2a\u8bb8\u53ef\u8bc1\uff0c\u4e5f\u53ef\u4ee5\u4f20\u5165\u53c2\u6570\u6765\u540c\u65f6\u83b7\u53d6\u548c\u91ca\u653e\u591a\u4e2a\u8bb8\u53ef\u8bc1\u3002\u5728\u672c\u7bc7\u4e2d\u6211\u4eec\u53ea\u8bb2\u6bcf\u6b21\u83b7\u53d6\u548c\u91ca\u653e\u4e00\u4e2a\u8bb8\u53ef\u8bc1\u7684\u60c5\u51b5\u3002"}),"\n",(0,i.jsx)(e.h2,{id:"1\u83b7\u53d6\u8bb8\u53ef\u8bc1",children:"1\u3001\u83b7\u53d6\u8bb8\u53ef\u8bc1"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:"//\u83b7\u53d6\u4e00\u4e2a\u8bb8\u53ef\u8bc1(\u54cd\u5e94\u4e2d\u65ad)\npublic void acquire() throws InterruptedException {\n    sync.acquireSharedInterruptibly(1);\n}\n\n//\u83b7\u53d6\u4e00\u4e2a\u8bb8\u53ef\u8bc1(\u4e0d\u54cd\u5e94\u4e2d\u65ad)\npublic void acquireUninterruptibly() {\n    sync.acquireShared(1);\n}\n\n//\u5c1d\u8bd5\u83b7\u53d6\u8bb8\u53ef\u8bc1(\u975e\u516c\u5e73\u83b7\u53d6)\npublic boolean tryAcquire() {\n    return sync.nonfairTryAcquireShared(1) >= 0;\n}\n\n//\u5c1d\u8bd5\u83b7\u53d6\u8bb8\u53ef\u8bc1(\u5b9a\u65f6\u83b7\u53d6)\npublic boolean tryAcquire(long timeout, TimeUnit unit) throws InterruptedException {\n    return sync.tryAcquireSharedNanos(1, unit.toNanos(timeout));\n}\n"})}),"\n",(0,i.jsxs)(e.p,{children:["\u4e0a\u9762\u7684API\u662f",(0,i.jsx)(e.code,{children:"Semaphore"}),"\u63d0\u4f9b\u7684\u9ed8\u8ba4\u83b7\u53d6\u8bb8\u53ef\u8bc1\u64cd\u4f5c\u3002\u6bcf\u6b21\u53ea\u83b7\u53d6\u4e00\u4e2a\u8bb8\u53ef\u8bc1\uff0c\u8fd9\u4e5f\u662f\u73b0\u5b9e\u751f\u6d3b\u4e2d\u8f83\u5e38\u9047\u5230\u7684\u60c5\u51b5\u3002\u9664\u4e86\u76f4\u63a5\u83b7\u53d6\u8fd8\u63d0\u4f9b\u4e86\u5c1d\u8bd5\u83b7\u53d6\uff0c\u76f4\u63a5\u83b7\u53d6\u64cd\u4f5c\u5728\u5931\u8d25\u4e4b\u540e\u53ef\u80fd\u4f1a\u963b\u585e\u7ebf\u7a0b\uff0c\u800c\u5c1d\u8bd5\u83b7\u53d6\u5219\u4e0d\u4f1a\u3002\u53e6\u5916\u8fd8\u9700\u6ce8\u610f\u7684\u662f",(0,i.jsx)(e.code,{children:"tryAcquire"}),"\u65b9\u6cd5\u662f\u4f7f\u7528\u975e\u516c\u5e73\u65b9\u5f0f\u5c1d\u8bd5\u83b7\u53d6\u7684\u3002\u5728\u5e73\u65f6\u6211\u4eec\u6bd4\u8f83\u5e38\u7528\u5230\u7684\u662f",(0,i.jsx)(e.code,{children:"acquire"}),"\u65b9\u6cd5\u53bb\u83b7\u53d6\u8bb8\u53ef\u8bc1\u3002\u4e0b\u9762\u6211\u4eec\u5c31\u6765\u770b\u770b\u5b83\u662f\u600e\u6837\u83b7\u53d6\u7684\u3002\u53ef\u4ee5\u770b\u5230acquire\u65b9\u6cd5\u91cc\u9762\u76f4\u63a5\u5c31\u662f\u8c03\u7528",(0,i.jsx)(e.code,{children:"sync.acquireSharedInterruptibly"}),"\uff0c\u8fd9\u4e2a\u65b9\u6cd5\u662f",(0,i.jsx)(e.code,{children:"AQS"}),"\u91cc\u9762\u7684\u65b9\u6cd5\uff0c\u6211\u4eec\u7b80\u5355\u8bb2\u4e00\u4e0b\u3002"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:"//\u4ee5\u53ef\u4e2d\u65ad\u6a21\u5f0f\u83b7\u53d6\u9501(\u5171\u4eab\u6a21\u5f0f)\npublic final void acquireSharedInterruptibly(int arg) throws InterruptedException {\n    //\u9996\u5148\u5224\u65ad\u7ebf\u7a0b\u662f\u5426\u4e2d\u65ad, \u5982\u679c\u662f\u5219\u629b\u51fa\u5f02\u5e38\n    if (Thread.interrupted()) {\n        throw new InterruptedException();\n    }\n    //1.\u5c1d\u8bd5\u53bb\u83b7\u53d6\u9501\n    if (tryAcquireShared(arg) < 0) {\n        //2. \u5982\u679c\u83b7\u53d6\u5931\u8d25\u5219\u8fdb\u4eba\u8be5\u65b9\u6cd5\n        doAcquireSharedInterruptibly(arg);\n    }\n}\n"})}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.code,{children:"acquireSharedInterruptibly"}),"\u65b9\u6cd5\u9996\u5148\u5c31\u662f\u53bb\u8c03\u7528",(0,i.jsx)(e.code,{children:"tryAcquireShared"}),"\u65b9\u6cd5\u53bb\u5c1d\u8bd5\u83b7\u53d6\uff0c",(0,i.jsx)(e.code,{children:"tryAcquireShared"}),"\u5728",(0,i.jsx)(e.code,{children:"AQS"}),"\u91cc\u9762\u662f\u62bd\u8c61\u65b9\u6cd5\uff0c",(0,i.jsx)(e.code,{children:"FairSync"}),"\u548c",(0,i.jsx)(e.code,{children:"NonfairSync"}),"\u8fd9\u4e24\u4e2a\u6d3e\u751f\u7c7b\u5b9e\u73b0\u4e86\u8be5\u65b9\u6cd5\u7684\u903b\u8f91\u3002",(0,i.jsx)(e.code,{children:"FairSync"}),"\u5b9e\u73b0\u7684\u662f\u516c\u5e73\u83b7\u53d6\u7684\u903b\u8f91\uff0c\u800c",(0,i.jsx)(e.code,{children:"NonfairSync"}),"\u5b9e\u73b0\u7684\u975e\u516c\u5e73\u83b7\u53d6\u7684\u903b\u8f91\u3002"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:"abstract static class Sync extends AbstractQueuedSynchronizer {\n    //\u975e\u516c\u5e73\u65b9\u5f0f\u5c1d\u8bd5\u83b7\u53d6\n    final int nonfairTryAcquireShared(int acquires) {\n        for (;;) {\n            //\u83b7\u53d6\u53ef\u7528\u8bb8\u53ef\u8bc1\n            int available = getState();\n            //\u83b7\u53d6\u5269\u4f59\u8bb8\u53ef\u8bc1\n            int remaining = available - acquires;\n            //1.\u5982\u679cremaining\u5c0f\u4e8e0\u5219\u76f4\u63a5\u8fd4\u56deremaining\n            //2.\u5982\u679cremaining\u5927\u4e8e0\u5219\u5148\u66f4\u65b0\u540c\u6b65\u72b6\u6001\u518d\u8fd4\u56deremaining\n            if (remaining < 0 || compareAndSetState(available, remaining)) {\n                return remaining;\n            }\n        }\n    }\n}\n\n//\u975e\u516c\u5e73\u540c\u6b65\u5668\nstatic final class NonfairSync extends Sync {\n    private static final long serialVersionUID = -2694183684443567898L;\n\n    NonfairSync(int permits) {\n        super(permits);\n    }\n\n    //\u5c1d\u8bd5\u83b7\u53d6\u8bb8\u53ef\u8bc1\n    protected int tryAcquireShared(int acquires) {\n        return nonfairTryAcquireShared(acquires);\n    }\n}\n\n//\u516c\u5e73\u540c\u6b65\u5668\nstatic final class FairSync extends Sync {\n    private static final long serialVersionUID = 2014338818796000944L;\n\n    FairSync(int permits) {\n        super(permits);\n    }\n\n    //\u5c1d\u8bd5\u83b7\u53d6\u8bb8\u53ef\u8bc1\n    protected int tryAcquireShared(int acquires) {\n        for (;;) {\n            //\u5224\u65ad\u540c\u6b65\u961f\u5217\u524d\u9762\u6709\u6ca1\u6709\u4eba\u6392\u961f\n            if (hasQueuedPredecessors()) {\n                //\u5982\u679c\u6709\u7684\u8bdd\u5c31\u76f4\u63a5\u8fd4\u56de-1\uff0c\u8868\u793a\u5c1d\u8bd5\u83b7\u53d6\u5931\u8d25\n                return -1;\n            }\n            //\u83b7\u53d6\u53ef\u7528\u8bb8\u53ef\u8bc1\n            int available = getState();\n            //\u83b7\u53d6\u5269\u4f59\u8bb8\u53ef\u8bc1\n            int remaining = available - acquires;\n            //1.\u5982\u679cremaining\u5c0f\u4e8e0\u5219\u76f4\u63a5\u8fd4\u56deremaining\n            //2.\u5982\u679cremaining\u5927\u4e8e0\u5219\u5148\u66f4\u65b0\u540c\u6b65\u72b6\u6001\u518d\u8fd4\u56deremaining\n            if (remaining < 0 || compareAndSetState(available, remaining)) {\n                return remaining;\n            }\n        }\n    }\n}\n"})}),"\n",(0,i.jsxs)(e.p,{children:["\u8fd9\u91cc\u9700\u8981\u6ce8\u610f\u7684\u662f",(0,i.jsx)(e.code,{children:"NonfairSync"}),"\u7684",(0,i.jsx)(e.code,{children:"tryAcquireShared"}),"\u65b9\u6cd5\u76f4\u63a5\u8c03\u7528\u7684\u662f",(0,i.jsx)(e.code,{children:"nonfairTryAcquireShared"}),"\u65b9\u6cd5\uff0c\u8fd9\u4e2a\u65b9\u6cd5\u662f\u5728\u7236\u7c7b",(0,i.jsx)(e.code,{children:"Sync"}),"\u91cc\u9762\u7684\u3002\u975e\u516c\u5e73\u83b7\u53d6\u9501\u7684\u903b\u8f91\u662f\u5148\u53d6\u51fa\u5f53\u524d\u540c\u6b65\u72b6\u6001(\u540c\u6b65\u72b6\u6001\u8868\u793a\u8bb8\u53ef\u8bc1\u4e2a\u6570)\uff0c\u5c06\u5f53\u524d\u540c\u6b65\u72b6\u6001\u51cf\u53bb\u53c2\u5165\u7684\u53c2\u6570\uff0c\u5982\u679c\u7ed3\u679c\u4e0d\u5c0f\u4e8e0\u7684\u8bdd\u8bc1\u660e\u8fd8\u6709\u53ef\u7528\u7684\u8bb8\u53ef\u8bc1\uff0c\u90a3\u4e48\u5c31\u76f4\u63a5\u4f7f\u7528",(0,i.jsx)(e.code,{children:"CAS"}),"\u64cd\u4f5c\u66f4\u65b0\u540c\u6b65\u72b6\u6001\u7684\u503c\uff0c\u6700\u540e\u4e0d\u7ba1\u7ed3\u679c\u662f\u5426\u5c0f\u4e8e0\u90fd\u4f1a\u8fd4\u56de\u8be5\u7ed3\u679c\u503c\u3002"]}),"\n",(0,i.jsxs)(e.p,{children:["\u8fd9\u91cc\u6211\u4eec\u8981\u4e86\u89e3",(0,i.jsx)(e.code,{children:"tryAcquireShared"}),"\u65b9\u6cd5\u8fd4\u56de\u503c\u7684\u542b\u4e49\uff0c\u8fd4\u56de\u8d1f\u6570\u8868\u793a\u83b7\u53d6\u5931\u8d25\uff0c\u96f6\u8868\u793a\u5f53\u524d\u7ebf\u7a0b\u83b7\u53d6\u6210\u529f\u4f46\u540e\u7eed\u7ebf\u7a0b\u4e0d\u80fd\u518d\u83b7\u53d6\uff0c\u6b63\u6570\u8868\u793a\u5f53\u524d\u7ebf\u7a0b\u83b7\u53d6\u6210\u529f\u5e76\u4e14\u540e\u7eed\u7ebf\u7a0b\u4e5f\u80fd\u591f\u83b7\u53d6\u3002\u6211\u4eec\u518d\u6765\u770b",(0,i.jsx)(e.code,{children:"acquireSharedInterruptibly"}),"\u65b9\u6cd5\u7684\u4ee3\u7801\u3002"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:"//\u4ee5\u53ef\u4e2d\u65ad\u6a21\u5f0f\u83b7\u53d6\u9501(\u5171\u4eab\u6a21\u5f0f)\npublic final void acquireSharedInterruptibly(int arg) throws InterruptedException {\n    //\u9996\u5148\u5224\u65ad\u7ebf\u7a0b\u662f\u5426\u4e2d\u65ad, \u5982\u679c\u662f\u5219\u629b\u51fa\u5f02\u5e38\n    if (Thread.interrupted()) {\n        throw new InterruptedException();\n    }\n    //1.\u5c1d\u8bd5\u53bb\u83b7\u53d6\u9501\n    //\u8d1f\u6570\uff1a\u8868\u793a\u83b7\u53d6\u5931\u8d25\n    //\u96f6\u503c\uff1a\u8868\u793a\u5f53\u524d\u7ebf\u7a0b\u83b7\u53d6\u6210\u529f, \u4f46\u662f\u540e\u7ee7\u7ebf\u7a0b\u4e0d\u80fd\u518d\u83b7\u53d6\u4e86\n    //\u6b63\u6570\uff1a\u8868\u793a\u5f53\u524d\u7ebf\u7a0b\u83b7\u53d6\u6210\u529f, \u5e76\u4e14\u540e\u7ee7\u7ebf\u7a0b\u540c\u6837\u53ef\u4ee5\u83b7\u53d6\u6210\u529f\n    if (tryAcquireShared(arg) < 0) {\n        //2. \u5982\u679c\u83b7\u53d6\u5931\u8d25\u5219\u8fdb\u4eba\u8be5\u65b9\u6cd5\n        doAcquireSharedInterruptibly(arg);\n    }\n}\n"})}),"\n",(0,i.jsxs)(e.p,{children:["\u5982\u679c\u8fd4\u56de\u7684",(0,i.jsx)(e.code,{children:"remaining < 0"}),"\u7684\u8bdd\u5c31\u4ee3\u8868\u83b7\u53d6\u5931\u8d25\uff0c\u56e0\u6b64",(0,i.jsx)(e.code,{children:"tryAcquireShared(arg) < 0"}),"\u5c31\u4e3a",(0,i.jsx)(e.code,{children:"true"}),"\uff0c\u6240\u4ee5\u63a5\u4e0b\u6765\u5c31\u4f1a\u8c03\u7528",(0,i.jsx)(e.code,{children:"doAcquireSharedInterruptibly"}),"\u65b9\u6cd5\uff0c\u8fd9\u4e2a\u65b9\u6cd5\u6211\u4eec\u5728\u8bb2AQS\u7684\u65f6\u5019\u8bb2\u8fc7\uff0c\u5b83\u4f1a\u5c06\u5f53\u524d\u7ebf\u7a0b\u5305\u88c5\u6210\u7ed3\u70b9\u653e\u5165\u540c\u6b65\u961f\u5217\u5c3e\u90e8\uff0c\u5e76\u4e14\u6709\u53ef\u80fd\u6302\u8d77\u7ebf\u7a0b\u3002\u8fd9\u4e5f\u662f\u5f53remaining\u5c0f\u4e8e0\u65f6\u7ebf\u7a0b\u4f1a\u6392\u961f\u963b\u585e\u7684\u539f\u56e0\u3002"]}),"\n",(0,i.jsxs)(e.p,{children:["\u800c\u5982\u679c\u8fd4\u56de\u7684",(0,i.jsx)(e.code,{children:"remaining>=0"}),"\u7684\u8bdd\u5c31\u4ee3\u8868\u5f53\u524d\u7ebf\u7a0b\u83b7\u53d6\u6210\u529f\uff0c\u56e0\u6b64",(0,i.jsx)(e.code,{children:"tryAcquireShared(arg) < 0"}),"\u5c31\u4e3a",(0,i.jsx)(e.code,{children:"flase"}),"\uff0c\u6240\u4ee5\u5c31\u4e0d\u4f1a\u518d\u53bb\u8c03\u7528",(0,i.jsx)(e.code,{children:"doAcquireSharedInterruptibly"}),"\u65b9\u6cd5\u963b\u585e\u5f53\u524d\u7ebf\u7a0b\u4e86\u3002"]}),"\n",(0,i.jsxs)(e.p,{children:["\u4ee5\u4e0a\u662f\u975e\u516c\u5e73\u83b7\u53d6\u7684\u6574\u4e2a\u903b\u8f91\uff0c\u800c\u516c\u5e73\u83b7\u53d6\u65f6\u4ec5\u4ec5\u662f\u5728\u6b64\u4e4b\u524d\u5148\u53bb\u8c03\u7528",(0,i.jsx)(e.code,{children:"hasQueuedPredecessors"}),"\u65b9\u6cd5\u5224\u65ad\u540c\u6b65\u961f\u5217\u662f\u5426\u6709\u4eba\u5728\u6392\u961f\uff0c\u5982\u679c\u6709\u7684\u8bdd\u5c31\u76f4\u63a5",(0,i.jsx)(e.code,{children:"return -1"}),"\u8868\u793a\u83b7\u53d6\u5931\u8d25\uff0c\u5426\u5219\u624d\u7ee7\u7eed\u6267\u884c\u4e0b\u9762\u548c\u975e\u516c\u5e73\u83b7\u53d6\u4e00\u6837\u7684\u6b65\u9aa4\u3002"]}),"\n",(0,i.jsx)(e.h2,{id:"2\u91ca\u653e\u8bb8\u53ef\u8bc1",children:"2\u3001\u91ca\u653e\u8bb8\u53ef\u8bc1"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:"//\u91ca\u653e\u4e00\u4e2a\u8bb8\u53ef\u8bc1\npublic void release() {\n    sync.releaseShared(1);\n}\n"})}),"\n",(0,i.jsx)(e.p,{children:"\u8c03\u7528release\u65b9\u6cd5\u662f\u91ca\u653e\u4e00\u4e2a\u8bb8\u53ef\u8bc1\uff0c\u5b83\u7684\u64cd\u4f5c\u5f88\u7b80\u5355\uff0c\u5c31\u8c03\u7528\u4e86AQS\u7684releaseShared\u65b9\u6cd5\uff0c\u6211\u4eec\u6765\u770b\u770b\u8fd9\u4e2a\u65b9\u6cd5\u3002"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:"//\u91ca\u653e\u9501\u7684\u64cd\u4f5c(\u5171\u4eab\u6a21\u5f0f)\npublic final boolean releaseShared(int arg) {\n    //1.\u5c1d\u8bd5\u53bb\u91ca\u653e\u9501\n    if (tryReleaseShared(arg)) {\n        //2.\u5982\u679c\u91ca\u653e\u6210\u529f\u5c31\u5524\u9192\u5176\u4ed6\u7ebf\u7a0b\n        doReleaseShared();\n        return true;\n    }\n    return false;\n}\n"})}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.code,{children:"AQS"}),"\u7684",(0,i.jsx)(e.code,{children:"releaseShared"}),"\u65b9\u6cd5\u9996\u5148\u8c03\u7528",(0,i.jsx)(e.code,{children:"tryReleaseShared"}),"\u65b9\u6cd5\u5c1d\u8bd5\u91ca\u653e\u9501\uff0c\u8fd9\u4e2a\u65b9\u6cd5\u7684\u5b9e\u73b0\u903b\u8f91\u5728\u5b50\u7c7b",(0,i.jsx)(e.code,{children:"Sync"}),"\u91cc\u9762\u3002"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:'abstract static class Sync extends AbstractQueuedSynchronizer {\n    ...\n    //\u5c1d\u8bd5\u91ca\u653e\u64cd\u4f5c\n    protected final boolean tryReleaseShared(int releases) {\n        for (;;) {\n            //\u83b7\u53d6\u5f53\u524d\u540c\u6b65\u72b6\u6001\n            int current = getState();\n            //\u5c06\u5f53\u524d\u540c\u6b65\u72b6\u6001\u52a0\u4e0a\u4f20\u5165\u7684\u53c2\u6570\n            int next = current + releases;\n            //\u5982\u679c\u76f8\u52a0\u7ed3\u679c\u5c0f\u4e8e\u5f53\u524d\u540c\u6b65\u72b6\u6001\u7684\u8bdd\u5c31\u62a5\u9519\n            if (next < current) {\n                throw new Error("Maximum permit count exceeded");\n            }\n            //\u4ee5CAS\u65b9\u5f0f\u66f4\u65b0\u540c\u6b65\u72b6\u6001\u7684\u503c, \u66f4\u65b0\u6210\u529f\u5219\u8fd4\u56detrue, \u5426\u5219\u7ee7\u7eed\u5faa\u73af\n            if (compareAndSetState(current, next)) {\n                return true;\n            }\n        }\n    }\n    ...\n}\n'})}),"\n",(0,i.jsxs)(e.p,{children:["\u53ef\u4ee5\u770b\u5230",(0,i.jsx)(e.code,{children:"tryReleaseShared"}),"\u65b9\u6cd5\u91cc\u9762\u91c7\u7528for\u5faa\u73af\u8fdb\u884c\u81ea\u65cb\uff0c\u9996\u5148\u83b7\u53d6\u540c\u6b65\u72b6\u6001\uff0c\u5c06\u540c\u6b65\u72b6\u6001\u52a0\u4e0a\u4f20\u5165\u7684\u53c2\u6570\uff0c\u7136\u540e\u4ee5",(0,i.jsx)(e.code,{children:"CAS"}),"\u65b9\u5f0f\u66f4\u65b0\u540c\u6b65\u72b6\u6001\uff0c\u66f4\u65b0\u6210\u529f\u5c31\u8fd4\u56detrue\u5e76\u8df3\u51fa\u65b9\u6cd5\uff0c\u5426\u5219\u5c31\u7ee7\u7eed\u5faa\u73af\u76f4\u5230\u6210\u529f\u4e3a\u6b62\uff0c\u8fd9\u5c31\u662f",(0,i.jsx)(e.code,{children:"Semaphore"}),"\u91ca\u653e\u8bb8\u53ef\u8bc1\u7684\u6d41\u7a0b\u3002"]}),"\n",(0,i.jsx)(e.h2,{id:"3\u52a8\u624b\u5199\u4e2a\u8fde\u63a5\u6c60",children:"3\u3001\u52a8\u624b\u5199\u4e2a\u8fde\u63a5\u6c60"}),"\n",(0,i.jsxs)(e.p,{children:[(0,i.jsx)(e.code,{children:"Semaphore"}),"\u4ee3\u7801\u5e76\u6ca1\u6709\u5f88\u590d\u6742\uff0c\u5e38\u7528\u7684\u64cd\u4f5c\u5c31\u662f\u83b7\u53d6\u548c\u91ca\u653e\u4e00\u4e2a\u8bb8\u53ef\u8bc1\uff0c\u8fd9\u4e9b\u64cd\u4f5c\u7684\u5b9e\u73b0\u903b\u8f91\u4e5f\u90fd\u6bd4\u8f83\u7b80\u5355\uff0c\u4f46\u8fd9\u5e76\u4e0d\u59a8\u788d",(0,i.jsx)(e.code,{children:"Semaphore"}),"\u7684\u5e7f\u6cdb\u5e94\u7528\u3002\u4e0b\u9762\u6211\u4eec\u5c31\u6765\u5229\u7528",(0,i.jsx)(e.code,{children:"Semaphore"}),"\u5b9e\u73b0\u4e00\u4e2a\u7b80\u5355\u7684\u6570\u636e\u5e93\u8fde\u63a5\u6c60\uff0c\u901a\u8fc7\u8fd9\u4e2a\u4f8b\u5b50\u5e0c\u671b\u8bfb\u8005\u4eec\u80fd\u66f4\u52a0\u6df1\u5165\u7684\u638c\u63e1",(0,i.jsx)(e.code,{children:"Semaphore"}),"\u7684\u8fd0\u7528\u3002"]}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:'public class ConnectPool {\n\n    //\u8fde\u63a5\u6c60\u5927\u5c0f\n    private int size;\n    //\u6570\u636e\u5e93\u8fde\u63a5\u96c6\u5408\n    private Connect[] connects;\n    //\u8fde\u63a5\u72b6\u6001\u6807\u5fd7\n    private boolean[] connectFlag;\n    //\u5269\u4f59\u53ef\u7528\u8fde\u63a5\u6570\n    private volatile int available;\n    //\u4fe1\u53f7\u91cf\n    private Semaphore semaphore;\n\n    //\u6784\u9020\u5668\n    public ConnectPool(int size) {  \n        this.size = size;\n        this.available = size;\n        semaphore = new Semaphore(size, true);\n        connects = new Connect[size];\n        connectFlag = new boolean[size];\n        initConnects();\n    }\n\n    //\u521d\u59cb\u5316\u8fde\u63a5\n    private void initConnects() {\n        //\u751f\u6210\u6307\u5b9a\u6570\u91cf\u7684\u6570\u636e\u5e93\u8fde\u63a5\n        for(int i = 0; i < this.size; i++) {\n            connects[i] = new Connect();\n        }\n    }\n\n    //\u83b7\u53d6\u6570\u636e\u5e93\u8fde\u63a5\n    private synchronized Connect getConnect(){  \n        for(int i = 0; i < connectFlag.length; i++) {\n            //\u904d\u5386\u96c6\u5408\u627e\u5230\u672a\u4f7f\u7528\u7684\u8fde\u63a5\n            if(!connectFlag[i]) {\n                //\u5c06\u8fde\u63a5\u8bbe\u7f6e\u4e3a\u4f7f\u7528\u4e2d\n                connectFlag[i] = true;\n                //\u53ef\u7528\u8fde\u63a5\u6570\u51cf1\n                available--;\n                System.out.println("\u3010"+Thread.currentThread().getName()+"\u3011\u4ee5\u83b7\u53d6\u8fde\u63a5      \u5269\u4f59\u8fde\u63a5\u6570\uff1a" + available);\n                //\u8fd4\u56de\u8fde\u63a5\u5f15\u7528\n                return connects[i];\n            }\n        }\n        return null;\n    }\n\n    //\u83b7\u53d6\u4e00\u4e2a\u8fde\u63a5\n    public Connect openConnect() throws InterruptedException {\n        //\u83b7\u53d6\u8bb8\u53ef\u8bc1\n        semaphore.acquire();\n        //\u83b7\u53d6\u6570\u636e\u5e93\u8fde\u63a5\n        return getConnect();\n    }\n\n    //\u91ca\u653e\u4e00\u4e2a\u8fde\u63a5\n    public synchronized void release(Connect connect) {  \n        for(int i = 0; i < this.size; i++) {\n            if(connect == connects[i]){\n                //\u5c06\u8fde\u63a5\u8bbe\u7f6e\u4e3a\u672a\u4f7f\u7528\n                connectFlag[i] = false;\n                //\u53ef\u7528\u8fde\u63a5\u6570\u52a01\n                available++;\n                System.out.println("\u3010"+Thread.currentThread().getName()+"\u3011\u4ee5\u91ca\u653e\u8fde\u63a5      \u5269\u4f59\u8fde\u63a5\u6570\uff1a" + available);\n                //\u91ca\u653e\u8bb8\u53ef\u8bc1\n                semaphore.release();\n            }\n        }\n    }\n\n    //\u5269\u4f59\u53ef\u7528\u8fde\u63a5\u6570\n    public int available() {\n        return available;\n    }\n\n}\n'})}),"\n",(0,i.jsx)(e.p,{children:"\u6d4b\u8bd5\u4ee3\u7801\uff1a"}),"\n",(0,i.jsx)(e.pre,{children:(0,i.jsx)(e.code,{className:"language-java",children:"public class TestThread extends Thread {\n\n    private static ConnectPool pool = new ConnectPool(3);\n\n    @Override\n    public void run() {\n        try {\n            Connect connect = pool.openConnect();\n            Thread.sleep(100);  //\u4f11\u606f\u4e00\u4e0b\n            pool.release(connect);\n        } catch (InterruptedException e) {\n            e.printStackTrace();\n        }\n    }\n\n    public static void main(String[] args) {\n        for(int i = 0; i < 10; i++) {\n            new TestThread().start();\n        }\n    }\n\n}\n"})}),"\n",(0,i.jsx)(e.p,{children:"\u6d4b\u8bd5\u7ed3\u679c\uff1a"}),"\n",(0,i.jsx)(e.p,{children:(0,i.jsx)(e.img,{alt:"img",src:r(76905).Z+"",width:"343",height:"448"})}),"\n",(0,i.jsxs)(e.p,{children:["\u6211\u4eec\u4f7f\u7528\u4e00\u4e2a\u6570\u7ec4\u6765\u5b58\u653e\u6570\u636e\u5e93\u8fde\u63a5\u7684\u5f15\u7528\uff0c\u5728\u521d\u59cb\u5316\u8fde\u63a5\u6c60\u7684\u65f6\u5019\u4f1a\u8c03\u7528",(0,i.jsx)(e.code,{children:"initConnects"}),"\u65b9\u6cd5\u521b\u5efa\u6307\u5b9a\u6570\u91cf\u7684\u6570\u636e\u5e93\u8fde\u63a5\uff0c\u5e76\u5c06\u5b83\u4eec\u7684\u5f15\u7528\u5b58\u653e\u5230\u6570\u7ec4\u4e2d\uff0c\u6b64\u5916\u8fd8\u6709\u4e00\u4e2a\u76f8\u540c\u5927\u5c0f\u7684\u6570\u7ec4\u6765\u8bb0\u5f55\u8fde\u63a5\u662f\u5426\u53ef\u7528\u3002"]}),"\n",(0,i.jsxs)(e.p,{children:["\u6bcf\u5f53\u5916\u90e8\u7ebf\u7a0b\u8bf7\u6c42\u83b7\u53d6\u4e00\u4e2a\u8fde\u63a5\u65f6\uff0c\u9996\u5148\u8c03\u7528",(0,i.jsx)(e.code,{children:"semaphore.acquire()"}),"\u65b9\u6cd5\u83b7\u53d6\u4e00\u4e2a\u8bb8\u53ef\u8bc1\uff0c\u7136\u540e\u5c06\u8fde\u63a5\u72b6\u6001\u8bbe\u7f6e\u4e3a\u4f7f\u7528\u4e2d\uff0c\u6700\u540e\u8fd4\u56de\u8be5\u8fde\u63a5\u7684\u5f15\u7528\u3002\u8bb8\u53ef\u8bc1\u7684\u6570\u91cf\u7531\u6784\u9020\u65f6\u4f20\u5165\u7684\u53c2\u6570\u51b3\u5b9a\uff0c\u6bcf\u8c03\u7528\u4e00\u6b21",(0,i.jsx)(e.code,{children:"semaphore.acquire()"}),"\u65b9\u6cd5\u8bb8\u53ef\u8bc1\u6570\u91cf\u51cf1\uff0c\u5f53\u6570\u91cf\u51cf\u4e3a0\u65f6\u8bf4\u660e\u5df2\u7ecf\u6ca1\u6709\u8fde\u63a5\u53ef\u4ee5\u4f7f\u7528\u4e86\uff0c\u8fd9\u65f6\u5982\u679c\u5176\u4ed6\u7ebf\u7a0b\u518d\u6765\u83b7\u53d6\u5c31\u4f1a\u88ab\u963b\u585e\u3002"]}),"\n",(0,i.jsxs)(e.p,{children:["\u6bcf\u5f53\u7ebf\u7a0b\u91ca\u653e\u4e00\u4e2a\u8fde\u63a5\u7684\u65f6\u5019\u4f1a\u8c03\u7528",(0,i.jsx)(e.code,{children:"semaphore.release()"}),"\u5c06\u8bb8\u53ef\u8bc1\u91ca\u653e\uff0c\u6b64\u65f6\u8bb8\u53ef\u8bc1\u7684\u603b\u91cf\u53c8\u4f1a\u589e\u52a0\uff0c\u4ee3\u8868\u53ef\u7528\u7684\u8fde\u63a5\u6570\u589e\u52a0\u4e86\uff0c\u90a3\u4e48\u4e4b\u524d\u88ab\u963b\u585e\u7684\u7ebf\u7a0b\u5c06\u4f1a\u9192\u6765\u7ee7\u7eed\u83b7\u53d6\u8fde\u63a5\uff0c\u8fd9\u65f6\u518d\u6b21\u83b7\u53d6\u5c31\u80fd\u591f\u6210\u529f\u83b7\u53d6\u8fde\u63a5\u4e86\u3002"]}),"\n",(0,i.jsx)(e.p,{children:"\u6d4b\u8bd5\u793a\u4f8b\u4e2d\u521d\u59cb\u5316\u4e86\u4e00\u4e2a3\u4e2a\u8fde\u63a5\u7684\u8fde\u63a5\u6c60\uff0c\u6211\u4eec\u4ece\u6d4b\u8bd5\u7ed3\u679c\u4e2d\u53ef\u4ee5\u770b\u5230\uff0c\u6bcf\u5f53\u7ebf\u7a0b\u83b7\u53d6\u4e00\u4e2a\u8fde\u63a5\u5269\u4f59\u7684\u8fde\u63a5\u6570\u5c06\u4f1a\u51cf1\uff0c\u7b49\u5230\u51cf\u4e3a0\u65f6\u5176\u4ed6\u7ebf\u7a0b\u5c31\u4e0d\u80fd\u518d\u83b7\u53d6\u4e86\uff0c\u6b64\u65f6\u5fc5\u987b\u7b49\u5f85\u4e00\u4e2a\u7ebf\u7a0b\u5c06\u8fde\u63a5\u91ca\u653e\u4e4b\u540e\u624d\u80fd\u7ee7\u7eed\u83b7\u53d6\u3002\u53ef\u4ee5\u770b\u5230\u5269\u4f59\u8fde\u63a5\u6570\u603b\u662f\u57280\u52303\u4e4b\u95f4\u53d8\u52a8\uff0c\u8bf4\u660e\u6211\u4eec\u8fd9\u6b21\u7684\u6d4b\u8bd5\u662f\u6210\u529f\u7684\u3002"})]})}function d(n={}){const{wrapper:e}={...(0,c.ah)(),...n.components};return e?(0,i.jsx)(e,{...n,children:(0,i.jsx)(o,{...n})}):o(n)}},76905:(n,e,r)=>{r.d(e,{Z:()=>i});const i="data:image/png;base64,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"},11151:(n,e,r)=>{r.d(e,{ah:()=>a});var i=r(67294);const c=i.createContext({});function a(n){const e=i.useContext(c);return i.useMemo((()=>"function"==typeof n?n(e):{...e,...n}),[e,n])}}}]);