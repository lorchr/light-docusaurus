"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[4663],{51652:(e,n,l)=>{l.r(n),l.d(n,{assets:()=>c,contentTitle:()=>d,default:()=>t,frontMatter:()=>r,metadata:()=>a,toc:()=>h});var i=l(85893),s=l(11151);const r={},d=void 0,a={id:"redis/Lua-In-Redis",title:"Lua-In-Redis",description:"- Redis\u4e2d\u4f7f\u7528Lua\u811a\u672c",source:"@site/middleware/redis/10-Lua-In-Redis.md",sourceDirName:"redis",slug:"/redis/Lua-In-Redis",permalink:"/light-docusaurus/middleware/redis/Lua-In-Redis",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/middleware/redis/10-Lua-In-Redis.md",tags:[],version:"current",lastUpdatedBy:"liuhui",lastUpdatedAt:1703833110,formattedLastUpdatedAt:"2023\u5e7412\u670829\u65e5",sidebarPosition:10,frontMatter:{},sidebar:"middleware",previous:{title:"Risk-Control",permalink:"/light-docusaurus/middleware/redis/Risk-Control"},next:{title:"Lettuce-RedisCommandTimeoutException",permalink:"/light-docusaurus/middleware/redis/Lettuce-RedisCommandTimeoutException"}},c={},h=[{value:"\u4e00\u3001\u7b80\u4ecb",id:"\u4e00\u7b80\u4ecb",level:2},{value:"Redis\u4e2d\u4e3a\u4ec0\u4e48\u5f15\u5165Lua\u811a\u672c\uff1f",id:"redis\u4e2d\u4e3a\u4ec0\u4e48\u5f15\u5165lua\u811a\u672c",level:3},{value:"Redis\u610f\u8bc6\u5230\u4e0a\u8ff0\u95ee\u9898\u540e\uff0c\u57282.6\u7248\u672c\u63a8\u51fa\u4e86 lua \u811a\u672c\u529f\u80fd\uff0c\u5141\u8bb8\u5f00\u53d1\u8005\u4f7f\u7528Lua\u8bed\u8a00\u7f16\u5199\u811a\u672c\u4f20\u5230Redis\u4e2d\u6267\u884c\u3002\u4f7f\u7528\u811a\u672c\u7684\u597d\u5904\u5982\u4e0b:",id:"redis\u610f\u8bc6\u5230\u4e0a\u8ff0\u95ee\u9898\u540e\u572826\u7248\u672c\u63a8\u51fa\u4e86-lua-\u811a\u672c\u529f\u80fd\u5141\u8bb8\u5f00\u53d1\u8005\u4f7f\u7528lua\u8bed\u8a00\u7f16\u5199\u811a\u672c\u4f20\u5230redis\u4e2d\u6267\u884c\u4f7f\u7528\u811a\u672c\u7684\u597d\u5904\u5982\u4e0b",level:3},{value:"\u4ec0\u4e48\u662fLua\uff1f",id:"\u4ec0\u4e48\u662flua",level:3},{value:"\u4e8c\u3001Redis\u4e2dLua\u7684\u5e38\u7528\u547d\u4ee4",id:"\u4e8credis\u4e2dlua\u7684\u5e38\u7528\u547d\u4ee4",level:2},{value:"2.1 EVAL\u547d\u4ee4",id:"21-eval\u547d\u4ee4",level:3},{value:"2.2 SCRIPT LOAD\u547d\u4ee4 \u548c EVALSHA\u547d\u4ee4",id:"22-script-load\u547d\u4ee4-\u548c-evalsha\u547d\u4ee4",level:3},{value:"2.3 SCRIPT EXISTS \u547d\u4ee4",id:"23-script-exists-\u547d\u4ee4",level:3},{value:"2.4 SCRIPT FLUSH \u547d\u4ee4",id:"24-script-flush-\u547d\u4ee4",level:3},{value:"2.5 SCRIPT KILL \u547d\u4ee4",id:"25-script-kill-\u547d\u4ee4",level:3},{value:"\u4e09\u3001Redis\u6267\u884cLua\u811a\u672c\u6587\u4ef6",id:"\u4e09redis\u6267\u884clua\u811a\u672c\u6587\u4ef6",level:2},{value:"3.1 \u7f16\u5199Lua\u811a\u672c\u6587\u4ef6",id:"31-\u7f16\u5199lua\u811a\u672c\u6587\u4ef6",level:3},{value:"3.2 \u6267\u884cLua\u811a\u672c\u6587\u4ef6",id:"32-\u6267\u884clua\u811a\u672c\u6587\u4ef6",level:3},{value:"\u56db\u3001\u5b9e\u4f8b\uff1a\u4f7f\u7528Lua\u63a7\u5236IP\u8bbf\u95ee\u9891\u7387",id:"\u56db\u5b9e\u4f8b\u4f7f\u7528lua\u63a7\u5236ip\u8bbf\u95ee\u9891\u7387",level:2},{value:"\u4e94\u3001\u603b\u7ed3",id:"\u4e94\u603b\u7ed3",level:2},{value:"\u53c2\u8003\u8d44\u6599",id:"\u53c2\u8003\u8d44\u6599",level:2}];function u(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",section:"section",strong:"strong",sup:"sup",ul:"ul",...(0,s.ah)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://www.cnblogs.com/shoshana-kong/p/15014249.html",children:"Redis\u4e2d\u4f7f\u7528Lua\u811a\u672c"})}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"\u4e00\u7b80\u4ecb",children:"\u4e00\u3001\u7b80\u4ecb"}),"\n",(0,i.jsx)(n.h3,{id:"redis\u4e2d\u4e3a\u4ec0\u4e48\u5f15\u5165lua\u811a\u672c",children:"Redis\u4e2d\u4e3a\u4ec0\u4e48\u5f15\u5165Lua\u811a\u672c\uff1f"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Redis\u662f\u9ad8\u6027\u80fd\u7684",(0,i.jsx)(n.code,{children:"key-value"}),"\u5185\u5b58\u6570\u636e\u5e93\uff0c\u5728\u90e8\u5206\u573a\u666f\u4e0b\uff0c\u662f\u5bf9\u5173\u7cfb\u6570\u636e\u5e93\u7684\u826f\u597d\u8865\u5145\u3002"]}),"\n",(0,i.jsx)(n.li,{children:"Redis\u63d0\u4f9b\u4e86\u975e\u5e38\u4e30\u5bcc\u7684\u6307\u4ee4\u96c6\uff0c\u5b98\u7f51\u4e0a\u63d0\u4f9b\u4e86200\u591a\u4e2a\u547d\u4ee4\u3002\u4f46\u662f\u67d0\u4e9b\u7279\u5b9a\u9886\u57df\uff0c\u9700\u8981\u6269\u5145\u82e5\u5e72\u6307\u4ee4\u539f\u5b50\u6027\u6267\u884c\u65f6\uff0c\u4ec5\u4f7f\u7528\u539f\u751f\u547d\u4ee4\u4fbf\u65e0\u6cd5\u5b8c\u6210\u3002"}),"\n",(0,i.jsx)(n.li,{children:"Redis \u4e3a\u8fd9\u6837\u7684\u7528\u6237\u573a\u666f\u63d0\u4f9b\u4e86 lua \u811a\u672c\u652f\u6301\uff0c\u7528\u6237\u53ef\u4ee5\u5411\u670d\u52a1\u5668\u53d1\u9001 lua \u811a\u672c\u6765\u6267\u884c\u81ea\u5b9a\u4e49\u52a8\u4f5c\uff0c\u83b7\u53d6\u811a\u672c\u7684\u54cd\u5e94\u6570\u636e\u3002Redis \u670d\u52a1\u5668\u4f1a\u5355\u7ebf\u7a0b\u539f\u5b50\u6027\u6267\u884c lua \u811a\u672c\uff0c\u4fdd\u8bc1 lua \u811a\u672c\u5728\u5904\u7406\u7684\u8fc7\u7a0b\u4e2d\u4e0d\u4f1a\u88ab\u4efb\u610f\u5176\u5b83\u8bf7\u6c42\u6253\u65ad\u3002"}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"redis\u610f\u8bc6\u5230\u4e0a\u8ff0\u95ee\u9898\u540e\u572826\u7248\u672c\u63a8\u51fa\u4e86-lua-\u811a\u672c\u529f\u80fd\u5141\u8bb8\u5f00\u53d1\u8005\u4f7f\u7528lua\u8bed\u8a00\u7f16\u5199\u811a\u672c\u4f20\u5230redis\u4e2d\u6267\u884c\u4f7f\u7528\u811a\u672c\u7684\u597d\u5904\u5982\u4e0b",children:"Redis\u610f\u8bc6\u5230\u4e0a\u8ff0\u95ee\u9898\u540e\uff0c\u57282.6\u7248\u672c\u63a8\u51fa\u4e86 lua \u811a\u672c\u529f\u80fd\uff0c\u5141\u8bb8\u5f00\u53d1\u8005\u4f7f\u7528Lua\u8bed\u8a00\u7f16\u5199\u811a\u672c\u4f20\u5230Redis\u4e2d\u6267\u884c\u3002\u4f7f\u7528\u811a\u672c\u7684\u597d\u5904\u5982\u4e0b:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"\u51cf\u5c11\u7f51\u7edc\u5f00\u9500\u3002\u53ef\u4ee5\u5c06\u591a\u4e2a\u8bf7\u6c42\u901a\u8fc7\u811a\u672c\u7684\u5f62\u5f0f\u4e00\u6b21\u53d1\u9001\uff0c\u51cf\u5c11\u7f51\u7edc\u65f6\u5ef6\u3002"}),"\n",(0,i.jsx)(n.li,{children:"\u539f\u5b50\u64cd\u4f5c\u3002Redis\u4f1a\u5c06\u6574\u4e2a\u811a\u672c\u4f5c\u4e3a\u4e00\u4e2a\u6574\u4f53\u6267\u884c\uff0c\u4e2d\u95f4\u4e0d\u4f1a\u88ab\u5176\u4ed6\u8bf7\u6c42\u63d2\u5165\u3002\u56e0\u6b64\u5728\u811a\u672c\u8fd0\u884c\u8fc7\u7a0b\u4e2d\u65e0\u9700\u62c5\u5fc3\u4f1a\u51fa\u73b0\u7ade\u6001\u6761\u4ef6\uff0c\u65e0\u9700\u4f7f\u7528\u4e8b\u52a1\u3002"}),"\n",(0,i.jsx)(n.li,{children:"\u590d\u7528\u3002\u5ba2\u6237\u7aef\u53d1\u9001\u7684\u811a\u672c\u4f1a\u6c38\u4e45\u5b58\u5728redis\u4e2d\uff0c\u8fd9\u6837\u5176\u4ed6\u5ba2\u6237\u7aef\u53ef\u4ee5\u590d\u7528\u8fd9\u4e00\u811a\u672c\uff0c\u800c\u4e0d\u9700\u8981\u4f7f\u7528\u4ee3\u7801\u5b8c\u6210\u76f8\u540c\u7684\u903b\u8f91\u3002"}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"\u4ec0\u4e48\u662flua",children:"\u4ec0\u4e48\u662fLua\uff1f"}),"\n",(0,i.jsx)(n.p,{children:"Lua\u662f\u4e00\u79cd\u8f7b\u91cf\u5c0f\u5de7\u7684\u811a\u672c\u8bed\u8a00\uff0c\u7528\u6807\u51c6C\u8bed\u8a00\u7f16\u5199\u5e76\u4ee5\u6e90\u4ee3\u7801\u5f62\u5f0f\u5f00\u653e\u3002"}),"\n",(0,i.jsx)(n.p,{children:"\u5176\u8bbe\u8ba1\u76ee\u7684\u5c31\u662f\u4e3a\u4e86\u5d4c\u5165\u5e94\u7528\u7a0b\u5e8f\u4e2d\uff0c\u4ece\u800c\u4e3a\u5e94\u7528\u7a0b\u5e8f\u63d0\u4f9b\u7075\u6d3b\u7684\u6269\u5c55\u548c\u5b9a\u5236\u529f\u80fd\u3002\u56e0\u4e3a\u5e7f\u6cdb\u7684\u5e94\u7528\u4e8e\uff1a\u6e38\u620f\u5f00\u53d1\u3001\u72ec\u7acb\u5e94\u7528\u811a\u672c\u3001Web \u5e94\u7528\u811a\u672c\u3001\u6269\u5c55\u548c\u6570\u636e\u5e93\u63d2\u4ef6\u7b49\u3002"}),"\n",(0,i.jsxs)(n.p,{children:["\u6bd4\u5982\uff1aLua\u811a\u672c\u7528\u5728\u5f88\u591a\u6e38\u620f\u4e0a\uff0c\u4e3b\u8981\u662fLua\u811a\u672c\u53ef\u4ee5\u5d4c\u5165\u5230\u5176\u4ed6\u7a0b\u5e8f\u4e2d\u8fd0\u884c\uff0c\u6e38\u620f\u5347\u7ea7\u7684\u65f6\u5019\uff0c\u53ef\u4ee5\u76f4\u63a5\u5347\u7ea7\u811a\u672c\uff0c\u800c\u4e0d\u7528\u91cd\u65b0\u5b89\u88c5\u6e38\u620f\u3002\nLua\u811a\u672c\u7684\u57fa\u672c\u8bed\u6cd5\u53ef\u53c2\u8003\uff1a",(0,i.jsx)(n.a,{href:"https://www.runoob.com/lua/lua-tutorial.html/",children:"\u83dc\u9e1f\u6559\u7a0b"})]}),"\n",(0,i.jsx)(n.h2,{id:"\u4e8credis\u4e2dlua\u7684\u5e38\u7528\u547d\u4ee4",children:"\u4e8c\u3001Redis\u4e2dLua\u7684\u5e38\u7528\u547d\u4ee4"}),"\n",(0,i.jsx)(n.p,{children:"\u547d\u4ee4\u4e0d\u591a\uff0c\u5c31\u4e0b\u9762\u8fd9\u51e0\u4e2a\uff1a"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"EVAL"}),"\n",(0,i.jsx)(n.li,{children:"EVALSHA"}),"\n",(0,i.jsx)(n.li,{children:"SCRIPT LOAD - SCRIPT EXISTS"}),"\n",(0,i.jsx)(n.li,{children:"SCRIPT FLUSH"}),"\n",(0,i.jsx)(n.li,{children:"SCRIPT KILL"}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"21-eval\u547d\u4ee4",children:"2.1 EVAL\u547d\u4ee4"}),"\n",(0,i.jsxs)(n.p,{children:["\u547d\u4ee4\u683c\u5f0f\uff1a",(0,i.jsx)(n.code,{children:"EVAL script numkeys key [key \u2026] arg [arg \u2026]"})]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"script"})," \u53c2\u6570\u662f\u4e00\u6bb5 Lua5.1 \u811a\u672c\u7a0b\u5e8f\u3002\u811a\u672c\u4e0d\u5fc5(\u4e5f\u4e0d\u5e94\u8be5",(0,i.jsx)(n.sup,{children:(0,i.jsx)(n.a,{href:"#user-content-fn-1",id:"user-content-fnref-1","data-footnote-ref":!0,"aria-describedby":"footnote-label",children:"1"})}),")\u5b9a\u4e49\u4e3a\u4e00\u4e2a Lua \u51fd\u6570"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"numkeys"})," \u6307\u5b9a\u540e\u7eed\u53c2\u6570\u6709\u51e0\u4e2akey\uff0c\u5373\uff1akey [key \u2026]\u4e2dkey\u7684\u4e2a\u6570\u3002\u5982\u6ca1\u6709key\uff0c\u5219\u4e3a0"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"key [key \u2026]"})," \u4ece EVAL \u7684\u7b2c\u4e09\u4e2a\u53c2\u6570\u5f00\u59cb\u7b97\u8d77\uff0c\u8868\u793a\u5728\u811a\u672c\u4e2d\u6240\u7528\u5230\u7684\u90a3\u4e9b Redis \u952e(key)\u3002\u5728Lua\u811a\u672c\u4e2d\u901a\u8fc7KEYS[1], KEYS[2]\u83b7\u53d6\u3002"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"arg [arg \u2026]"})," \u9644\u52a0\u53c2\u6570\u3002\u5728Lua\u811a\u672c\u4e2d\u901a\u8fc7ARGV[1],ARGV[2]\u83b7\u53d6\u3002"]}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'# \u4f8b1\uff1anumkeys=1\uff0ckeys\u6570\u7ec4\u53ea\u67091\u4e2a\u5143\u7d20key1\uff0carg\u6570\u7ec4\u65e0\u5143\u7d20\n127.0.0.1:6379> EVAL "return KEYS[1]" 1 key1\n"key1"\n\n# \u4f8b2\uff1anumkeys=0\uff0ckeys\u6570\u7ec4\u65e0\u5143\u7d20\uff0carg\u6570\u7ec4\u5143\u7d20\u4e2d\u67091\u4e2a\u5143\u7d20value1\n127.0.0.1:6379> EVAL "return ARGV[1]" 0 value1\n"value1"\n\n# \u4f8b3\uff1anumkeys=2\uff0ckeys\u6570\u7ec4\u6709\u4e24\u4e2a\u5143\u7d20key1\u548ckey2\uff0carg\u6570\u7ec4\u5143\u7d20\u4e2d\u6709\u4e24\u4e2a\u5143\u7d20first\u548csecond \n#      \u5176\u5b9e{KEYS[1],KEYS[2],ARGV[1],ARGV[2]}\u8868\u793a\u7684\u662fLua\u8bed\u6cd5\u4e2d\u201c\u4f7f\u7528\u9ed8\u8ba4\u7d22\u5f15\u201d\u7684table\u8868\uff0c\n#      \u76f8\u5f53\u4e8ejava\u4e2d\u7684map\u4e2d\u5b58\u653e\u56db\u6761\u6570\u636e\u3002Key\u5206\u522b\u4e3a\uff1a1\u30012\u30013\u30014\uff0c\u800c\u5bf9\u5e94\u7684value\u624d\u662f\uff1aKEYS[1]\u3001KEYS[2]\u3001ARGV[1]\u3001ARGV[2]\n#      \u4e3e\u6b64\u4f8b\u5b50\u4ec5\u4e3a\u8bf4\u660eeval\u547d\u4ee4\u4e2d\u53c2\u6570\u7684\u5982\u4f55\u4f7f\u7528\u3002\u9879\u76ee\u4e2d\u7f16\u5199Lua\u811a\u672c\u6700\u597d\u9075\u4ecekey\u3001arg\u7684\u89c4\u8303\u3002\n127.0.0.1:6379> eval "return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}" 2 key1 key2 first second \n1) "key1"\n2) "key2"\n3) "first"\n4) "second"\n\n\n# \u4f8b4\uff1a\u4f7f\u7528\u4e86redis\u4e3alua\u5185\u7f6e\u7684redis.call\u51fd\u6570\n#      \u811a\u672c\u5185\u5bb9\u4e3a\uff1a\u5148\u6267\u884cSET\u547d\u4ee4\uff0c\u5728\u6267\u884cEXPIRE\u547d\u4ee4\n#      numkeys=1\uff0ckeys\u6570\u7ec4\u6709\u4e00\u4e2a\u5143\u7d20userAge\uff08\u4ee3\u8868redis\u7684key\uff09\n#      arg\u6570\u7ec4\u5143\u7d20\u4e2d\u6709\u4e24\u4e2a\u5143\u7d20\uff1a10\uff08\u4ee3\u8868userAge\u5bf9\u5e94\u7684value\uff09\u548c60\uff08\u4ee3\u8868redis\u7684\u5b58\u6d3b\u65f6\u95f4\uff09\n127.0.0.1:6379> EVAL "redis.call(\'SET\', KEYS[1], ARGV[1]);redis.call(\'EXPIRE\', KEYS[1], ARGV[2]); return 1;" 1 userAge 10 60\n(integer) 1\n127.0.0.1:6379> get userAge\n"10"\n127.0.0.1:6379> ttl userAge\n(integer) 44\n'})}),"\n",(0,i.jsxs)(n.p,{children:["\u901a\u8fc7\u4e0a\u9762\u7684\u4f8b4\uff0c\u6211\u4eec\u53ef\u4ee5\u53d1\u73b0\uff0c\u811a\u672c\u4e2d\u4f7f\u7528",(0,i.jsx)(n.code,{children:"redis.call()"}),"\u53bb\u8c03\u7528redis\u7684\u547d\u4ee4\u3002\n\u5728 Lua \u811a\u672c\u4e2d\uff0c\u53ef\u4ee5\u4f7f\u7528\u4e24\u4e2a\u4e0d\u540c\u51fd\u6570\u6765\u6267\u884c Redis \u547d\u4ee4\uff0c\u5b83\u4eec\u5206\u522b\u662f\uff1a ",(0,i.jsx)(n.code,{children:"redis.call()"})," \u548c ",(0,i.jsx)(n.code,{children:"redis.pcall()"})]}),"\n",(0,i.jsx)(n.p,{children:"\u8fd9\u4e24\u4e2a\u51fd\u6570\u7684\u552f\u4e00\u533a\u522b\u5728\u4e8e\u5b83\u4eec\u4f7f\u7528\u4e0d\u540c\u7684\u65b9\u5f0f\u5904\u7406\u6267\u884c\u547d\u4ee4\u6240\u4ea7\u751f\u7684\u9519\u8bef\uff0c\u5dee\u522b\u5982\u4e0b\uff1a"}),"\n",(0,i.jsxs)(n.p,{children:["\u9519\u8bef\u5904\u7406\n\u5f53 ",(0,i.jsx)(n.code,{children:"redis.call()"})," \u5728\u6267\u884c\u547d\u4ee4\u7684\u8fc7\u7a0b\u4e2d\u53d1\u751f\u9519\u8bef\u65f6\uff0c\u811a\u672c\u4f1a\u505c\u6b62\u6267\u884c\uff0c\u5e76\u8fd4\u56de\u4e00\u4e2a\u811a\u672c\u9519\u8bef\uff0c\u9519\u8bef\u7684\u8f93\u51fa\u4fe1\u606f\u4f1a\u8bf4\u660e\u9519\u8bef\u9020\u6210\u7684\u539f\u56e0\uff1a"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"127.0.0.1:6379> lpush foo a\n(integer) 1\n\n127.0.0.1:6379> eval \"return redis.call('get', 'foo')\" 0\n(error) ERR Error running script (call to f_282297a0228f48cd3fc6a55de6316f31422f5d17): ERR Operation against a key holding the wrong kind of value\n"})}),"\n",(0,i.jsxs)(n.p,{children:["\u548c ",(0,i.jsx)(n.code,{children:"redis.call()"})," \u4e0d\u540c\uff0c ",(0,i.jsx)(n.code,{children:"redis.pcall()"})," \u51fa\u9519\u65f6\u5e76\u4e0d\u5f15\u53d1(raise)\u9519\u8bef\uff0c\u800c\u662f\u8fd4\u56de\u4e00\u4e2a\u5e26 err \u57df\u7684 Lua \u8868(table)\uff0c\u7528\u4e8e\u8868\u793a\u9519\u8bef\uff1a"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"127.0.0.1:6379> EVAL \"return redis.pcall('get', 'foo')\" 0\n(error) ERR Operation against a key holding the wrong kind of value\n"})}),"\n",(0,i.jsx)(n.h3,{id:"22-script-load\u547d\u4ee4-\u548c-evalsha\u547d\u4ee4",children:"2.2 SCRIPT LOAD\u547d\u4ee4 \u548c EVALSHA\u547d\u4ee4"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"SCRIPT LOAD"})," \u547d\u4ee4\u683c\u5f0f\uff1a",(0,i.jsx)(n.code,{children:"SCRIPT LOAD script"})]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"EVALSHA"})," \u547d\u4ee4\u683c\u5f0f\uff1a",(0,i.jsx)(n.code,{children:"EVALSHA sha1 numkeys key [key \u2026] arg [arg \u2026]"})]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["\u8fd9\u4e24\u4e2a\u547d\u4ee4\u653e\u5728\u4e00\u8d77\u8bb2\u7684\u539f\u56e0\u662f\uff1a",(0,i.jsx)(n.code,{children:"EVALSHA"})," \u547d\u4ee4\u4e2d\u7684sha1\u53c2\u6570\uff0c\u5c31\u662f",(0,i.jsx)(n.code,{children:"SCRIPT LOAD"})," \u547d\u4ee4\u6267\u884c\u7684\u7ed3\u679c\u3002"]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.code,{children:"SCRIPT LOAD"})," \u5c06\u811a\u672c ",(0,i.jsx)(n.code,{children:"script"})," \u6dfb\u52a0\u5230Redis\u670d\u52a1\u5668\u7684\u811a\u672c\u7f13\u5b58\u4e2d\uff0c\u5e76\u4e0d\u7acb\u5373\u6267\u884c\u8fd9\u4e2a\u811a\u672c\uff0c\u800c\u662f\u4f1a\u7acb\u5373\u5bf9\u8f93\u5165\u7684\u811a\u672c\u8fdb\u884c\u6c42\u503c\u3002\u5e76\u8fd4\u56de\u7ed9\u5b9a\u811a\u672c\u7684 SHA1 \u6821\u9a8c\u548c\u3002\u5982\u679c\u7ed9\u5b9a\u7684\u811a\u672c\u5df2\u7ecf\u5728\u7f13\u5b58\u91cc\u9762\u4e86\uff0c\u90a3\u4e48\u4e0d\u6267\u884c\u4efb\u4f55\u64cd\u4f5c\u3002"]}),"\n",(0,i.jsxs)(n.p,{children:["\u5728\u811a\u672c\u88ab\u52a0\u5165\u5230\u7f13\u5b58\u4e4b\u540e\uff0c\u5728\u4efb\u4f55\u5ba2\u6237\u7aef\u901a\u8fc7EVALSHA\u547d\u4ee4\uff0c\u53ef\u4ee5\u4f7f\u7528\u811a\u672c\u7684 SHA1 \u6821\u9a8c\u548c\u6765\u8c03\u7528\u8fd9\u4e2a\u811a\u672c\u3002\u811a\u672c\u53ef\u4ee5\u5728\u7f13\u5b58\u4e2d\u4fdd\u7559\u65e0\u9650\u957f\u7684\u65f6\u95f4\uff0c\u76f4\u5230\u6267\u884c",(0,i.jsx)(n.code,{children:"SCRIPT FLUSH"}),"\u4e3a\u6b62\u3002"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'## SCRIPT LOAD\u52a0\u8f7d\u811a\u672c\uff0c\u5e76\u5f97\u5230sha1\u503c\n127.0.0.1:6379> SCRIPT LOAD "redis.call(\'SET\', KEYS[1], ARGV[1]);redis.call(\'EXPIRE\', KEYS[1], ARGV[2]); return 1;"\n"6aeea4b3e96171ef835a78178fceadf1a5dbe345"\n\n## EVALSHA\u4f7f\u7528sha1\u503c\uff0c\u5e76\u62fc\u88c5\u548cEVAL\u7c7b\u4f3c\u7684numkeys\u548ckey\u6570\u7ec4\u3001arg\u6570\u7ec4\uff0c\u8c03\u7528\u811a\u672c\u3002\n127.0.0.1:6379> EVALSHA 6aeea4b3e96171ef835a78178fceadf1a5dbe345 1 userAge 10 60\n(integer) 1\n127.0.0.1:6379> get userAge\n"10"\n127.0.0.1:6379> ttl userAge\n(integer) 43\n'})}),"\n",(0,i.jsx)(n.h3,{id:"23-script-exists-\u547d\u4ee4",children:"2.3 SCRIPT EXISTS \u547d\u4ee4"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["\u547d\u4ee4\u683c\u5f0f\uff1a",(0,i.jsx)(n.code,{children:"SCRIPT EXISTS sha1 [sha1 \u2026]"})]}),"\n",(0,i.jsx)(n.li,{children:"\u4f5c\u7528\uff1a\u7ed9\u5b9a\u4e00\u4e2a\u6216\u591a\u4e2a\u811a\u672c\u7684 SHA1 \u6821\u9a8c\u548c\uff0c\u8fd4\u56de\u4e00\u4e2a\u5305\u542b 0 \u548c 1 \u7684\u5217\u8868\uff0c\u8868\u793a\u6821\u9a8c\u548c\u6240\u6307\u5b9a\u7684\u811a\u672c\u662f\u5426\u5df2\u7ecf\u88ab\u4fdd\u5b58\u5728\u7f13\u5b58\u5f53\u4e2d"}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe345\n1) (integer) 1\n127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe346\n1) (integer) 0\n127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe345 6aeea4b3e96171ef835a78178fceadf1a5dbe366\n1) (integer) 1\n2) (integer) 0\n"})}),"\n",(0,i.jsx)(n.h3,{id:"24-script-flush-\u547d\u4ee4",children:"2.4 SCRIPT FLUSH \u547d\u4ee4"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["\u547d\u4ee4\u683c\u5f0f\uff1a",(0,i.jsx)(n.code,{children:"SCRIPT FLUSH"})]}),"\n",(0,i.jsx)(n.li,{children:"\u4f5c\u7528\uff1a\u6e05\u9664Redis\u670d\u52a1\u7aef\u6240\u6709 Lua \u811a\u672c\u7f13\u5b58"}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe345\n1) (integer) 1\n127.0.0.1:6379> SCRIPT FLUSH\nOK\n127.0.0.1:6379> SCRIPT EXISTS 6aeea4b3e96171ef835a78178fceadf1a5dbe345\n1) (integer) 0\n"})}),"\n",(0,i.jsx)(n.h3,{id:"25-script-kill-\u547d\u4ee4",children:"2.5 SCRIPT KILL \u547d\u4ee4"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["\u547d\u4ee4\u683c\u5f0f\uff1a",(0,i.jsx)(n.code,{children:"SCRIPT KILL"})]}),"\n",(0,i.jsx)(n.li,{children:"\u4f5c\u7528\uff1a\u6740\u6b7b\u5f53\u524d\u6b63\u5728\u8fd0\u884c\u7684 Lua \u811a\u672c\uff0c\u5f53\u4e14\u4ec5\u5f53\u8fd9\u4e2a\u811a\u672c\u6ca1\u6709\u6267\u884c\u8fc7\u4efb\u4f55\u5199\u64cd\u4f5c\u65f6\uff0c\u8fd9\u4e2a\u547d\u4ee4\u624d\u751f\u6548\u3002 \u8fd9\u4e2a\u547d\u4ee4\u4e3b\u8981\u7528\u4e8e\u7ec8\u6b62\u8fd0\u884c\u65f6\u95f4\u8fc7\u957f\u7684\u811a\u672c\uff0c\u6bd4\u5982\u4e00\u4e2a\u56e0\u4e3a BUG \u800c\u53d1\u751f\u65e0\u9650 loop \u7684\u811a\u672c\uff0c\u8bf8\u5982\u6b64\u7c7b\u3002"}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:["\u5047\u5982\u5f53\u524d\u6b63\u5728\u8fd0\u884c\u7684\u811a\u672c\u5df2\u7ecf\u6267\u884c\u8fc7\u5199\u64cd\u4f5c\uff0c\u90a3\u4e48\u5373\u4f7f\u6267\u884c",(0,i.jsx)(n.code,{children:"SCRIPT KILL"}),"\uff0c\u4e5f\u65e0\u6cd5\u5c06\u5b83\u6740\u6b7b\uff0c\u56e0\u4e3a\u8fd9\u662f\u8fdd\u53cd Lua \u811a\u672c\u7684\u539f\u5b50\u6027\u6267\u884c\u539f\u5219\u7684\u3002\u5728\u8fd9\u79cd\u60c5\u51b5\u4e0b\uff0c\u552f\u4e00\u53ef\u884c\u7684\u529e\u6cd5\u662f\u4f7f\u7528",(0,i.jsx)(n.code,{children:"SHUTDOWN NOSAVE"}),"\u547d\u4ee4\uff0c\u901a\u8fc7\u505c\u6b62\u6574\u4e2a Redis \u8fdb\u7a0b\u6765\u505c\u6b62\u811a\u672c\u7684\u8fd0\u884c\uff0c\u5e76\u9632\u6b62\u4e0d\u5b8c\u6574(half-written)\u7684\u4fe1\u606f\u88ab\u5199\u5165\u6570\u636e\u5e93\u4e2d\u3002"]}),"\n",(0,i.jsx)(n.h2,{id:"\u4e09redis\u6267\u884clua\u811a\u672c\u6587\u4ef6",children:"\u4e09\u3001Redis\u6267\u884cLua\u811a\u672c\u6587\u4ef6"}),"\n",(0,i.jsx)(n.p,{children:"\u5728\u7b2c\u4e8c\u7ae0\u4e2d\u4ecb\u7ecd\u7684\u547d\u4ee4\uff0c\u662f\u5728redis\u5ba2\u6237\u7aef\u4e2d\u4f7f\u7528\u547d\u4ee4\u8fdb\u884c\u64cd\u4f5c\u3002\u8be5\u7ae0\u8282\u4ecb\u7ecd\u7684\u662f\u76f4\u63a5\u6267\u884c Lua \u7684\u811a\u672c\u6587\u4ef6\u3002"}),"\n",(0,i.jsx)(n.h3,{id:"31-\u7f16\u5199lua\u811a\u672c\u6587\u4ef6",children:"3.1 \u7f16\u5199Lua\u811a\u672c\u6587\u4ef6"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-lua",children:"local key = KEYS[1]\nlocal val = redis.call(\"GET\", key);\n\nif val == ARGV[1]\nthen\n    redis.call('SET', KEYS[1], ARGV[2])\n    return 1\nelse\n    return 0\nend\n"})}),"\n",(0,i.jsx)(n.h3,{id:"32-\u6267\u884clua\u811a\u672c\u6587\u4ef6",children:"3.2 \u6267\u884cLua\u811a\u672c\u6587\u4ef6"}),"\n",(0,i.jsxs)(n.p,{children:["\u6267\u884c\u547d\u4ee4\uff1a ",(0,i.jsx)(n.code,{children:"redis-cli -a \u5bc6\u7801 --eval Lua\u811a\u672c\u8def\u5f84 key [key \u2026] ,  arg [arg \u2026]"}),"\n\u5982\uff1a",(0,i.jsx)(n.code,{children:"redis-cli -a 123456 --eval ./Redis_CompareAndSet.lua userName , zhangsan lisi"})]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.strong,{children:"\u6ce8\u610f"})}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"--eval"}),"\u800c\u4e0d\u662f\u547d\u4ee4\u6a21\u5f0f\u4e2d\u7684 ",(0,i.jsx)(n.code,{children:"eval"})," \uff0c\u4e00\u5b9a\u8981\u6709\u524d\u7aef\u7684\u4e24\u4e2a-"]}),"\n",(0,i.jsxs)(n.li,{children:["\u811a\u672c\u8def\u5f84\u540e\u7d27\u8ddf",(0,i.jsx)(n.code,{children:"key [key \u2026]"}),"\uff0c\u76f8\u6bd4\u547d\u4ee4\u884c\u6a21\u5f0f\uff0c\u5c11\u4e86",(0,i.jsx)(n.code,{children:"numkeys"}),"\u8fd9\u4e2akey\u6570\u91cf\u503c"]}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.code,{children:"key [key \u2026]"})," \u548c ",(0,i.jsx)(n.code,{children:"arg [arg \u2026]"})," \u4e4b\u95f4\u7684 ",(0,i.jsx)(n.code,{children:","})," \uff0c\u82f1\u6587\u9017\u53f7\u524d\u540e\u5fc5\u987b\u6709\u7a7a\u683c\uff0c\u5426\u5219\u6b7b\u6d3b\u90fd\u62a5\u9519"]}),"\n"]}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'## Redis\u5ba2\u6237\u7aef\u6267\u884c\n127.0.0.1:6379> set userName zhangsan \nOK\n127.0.0.1:6379> get userName\n"zhangsan"\n\n## linux\u670d\u52a1\u5668\u6267\u884c\n## \u7b2c\u4e00\u6b21\u6267\u884c\uff1acompareAndSet\u6210\u529f\uff0c\u8fd4\u56de1\n## \u7b2c\u4e8c\u6b21\u6267\u884c\uff1acompareAndSet\u5931\u8d25\uff0c\u8fd4\u56de0\n[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_CompareAndSet.lua userName , zhangsan lisi\n(integer) 1\n[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_CompareAndSet.lua userName , zhangsan lisi\n(integer) 0\n'})}),"\n",(0,i.jsx)(n.h2,{id:"\u56db\u5b9e\u4f8b\u4f7f\u7528lua\u63a7\u5236ip\u8bbf\u95ee\u9891\u7387",children:"\u56db\u3001\u5b9e\u4f8b\uff1a\u4f7f\u7528Lua\u63a7\u5236IP\u8bbf\u95ee\u9891\u7387"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"\u9700\u6c42\uff1a\u5b9e\u73b0\u4e00\u4e2a\u8bbf\u95ee\u9891\u7387\u63a7\u5236\uff0c\u67d0\u4e2aIP\u5728\u77ed\u65f6\u95f4\u5185\u9891\u7e41\u8bbf\u95ee\u9875\u9762\uff0c\u9700\u8981\u8bb0\u5f55\u5e76\u68c0\u6d4b\u51fa\u6765\uff0c\u5c31\u53ef\u4ee5\u901a\u8fc7Lua\u811a\u672c\u9ad8\u6548\u7684\u5b9e\u73b0\u3002"}),"\n",(0,i.jsx)(n.li,{children:"\u8bf4\u660e\uff1a\u672c\u5b9e\u4f8b\u9488\u5bf9\u56fa\u5b9a\u7a97\u53e3\u7684\u8bbf\u95ee\u9891\u7387\uff0c\u800c\u52a8\u6001\u7684\u975e\u6ed1\u52a8\u7a97\u53e3\u3002\u5373\uff1a\u5982\u679c\u89c4\u5b9a\u4e00\u5206\u949f\u5185\u8bbf\u95ee10\u6b21\uff0c\u8bb0\u4e3a\u8d85\u9650\u3002\u5728\u672c\u5b9e\u4f8b\u4e2d\u524d\u4e00\u5206\u949f\u7684\u6700\u540e\u4e00\u79d2\u8bbf\u95ee9\u6b21\uff0c\u4e0b\u4e00\u5206\u949f\u7684\u7b2c1\u79d2\u53c8\u8bbf\u95ee9\u6b21\uff0c\u4e0d\u8ba1\u4e3a\u8d85\u9650\u3002"}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"\u811a\u672c\u5982\u4e0b\uff1a"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"local visitNum = redis.call('incr', KEYS[1])\n\nif visitNum == 1 then\n    redis.call('expire', KEYS[1], ARGV[1])\nend\n\nif visitNum > tonumber(ARGV[2]) then\n    return 0\nend\n\nreturn 1;\n"})}),"\n",(0,i.jsx)(n.p,{children:"\u6f14\u793a\u5982\u4e0b\uff1a"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"## LimitIP:127.0.0.1\u4e3akey\uff0c 10 3\u8868\u793a\uff1a\u540c\u4e00IP\u572810\u79d2\u5185\u6700\u591a\u8bbf\u95ee\u4e09\u6b21\n## \u524d\u4e09\u6b21\u8fd4\u56de1\uff0c\u4ee3\u8868\u672a\u88ab\u9650\u5236\uff1b\u7b2c\u56db\u3001\u4e94\u6b21\u8fd4\u56de0\uff0c\u4ee3\u8868127.0.0.1\u8fd9\u4e2aip\u5df2\u88ab\u62e6\u622a\n[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3\n (integer) 1\n[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3\n (integer) 1\n[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3\n (integer) 1\n[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3\n (integer) 0\n[root@vm01 learn_lua]# redis-cli -a 123456 --eval Redis_LimitIpVisit.lua LimitIP:127.0.0.1 , 10 3\n (integer) 0\n"})}),"\n",(0,i.jsx)(n.h2,{id:"\u4e94\u603b\u7ed3",children:"\u4e94\u3001\u603b\u7ed3"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"\u901a\u8fc7\u4e0a\u9762\u4e00\u7cfb\u5217\u7684\u4ecb\u7ecd\uff0c\u5bf9Lua\u811a\u672c\u3001Lua\u57fa\u7840\u8bed\u6cd5\u6709\u4e86\u4e00\u5b9a\u4e86\u89e3\uff0c\u540c\u65f6\u4e5f\u5b66\u4f1a\u5728Redis\u4e2d\u5982\u4f55\u53bb\u4f7f\u7528Lua\u811a\u672c\u53bb\u5b9e\u73b0Redis\u547d\u4ee4\u65e0\u6cd5\u5b9e\u73b0\u7684\u573a\u666f"}),"\n",(0,i.jsx)(n.li,{children:"\u56de\u5934\u518d\u601d\u8003\u6587\u7ae0\u5f00\u5934\u63d0\u5230\u7684Redis\u4f7f\u7528Lua\u811a\u672c\u7684\u51e0\u4e2a\u4f18\u70b9\uff1a\u51cf\u5c11\u7f51\u7edc\u5f00\u9500\u3001\u539f\u5b50\u6027\u3001\u590d\u7528"}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"\u672c\u6587\u5df2\u7b80\u5355\u4ecb\u7ecd\u4e86Redis\u4e2d\u5982\u4f55\u4f7f\u7528Lua\u811a\u672c\uff0c\u4ee5\u53ca\u51e0\u4e2a\u5c0f\u5b9e\u4f8b\u5e94\u7528\u3002 \u5728\u4e0b\u4e00\u7bc7\u4e2d\u4f1a\u4ecb\u7ecd\u771f\u5b9e\u9879\u76ee\u4e2d\u7684\u201c\u7b54\u9898\u7ea2\u5305\u96e8\u62a2\u593a\u201d\u7684\u5b9e\u4f8b \u548c \u9879\u76ee\u4e2d\u662f\u5982\u4f55\u4f7f\u7528Lua\u89e3\u51b3\u95ee\u9898\u3002\u656c\u8bf7\u671f\u5f85\uff01\uff01\uff01"}),"\n",(0,i.jsx)(n.h2,{id:"\u53c2\u8003\u8d44\u6599",children:"\u53c2\u8003\u8d44\u6599"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://www.runoob.com/lua/lua-data-types.html",children:"\u83dc\u9e1f\u6559\u7a0b -> Lua\u6559\u7a0b"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"http://redisdoc.com/script/eval.html",children:"Redis\u5b98\u65b9\u547d\u4ee4\u53c2\u8003"})}),"\n",(0,i.jsx)(n.li,{children:"\u300aRedis\u8bbe\u8ba1\u4e0e\u5b9e\u73b0\u300b-\u9ec4\u5065\u5b8f\u8457"}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://juejin.cn/book/6844733724618129422/section/6844733724723003406#heading-0",children:"Redis \u6df1\u5ea6\u5386\u9669\uff1a\u6838\u5fc3\u539f\u7406\u4e0e\u5e94\u7528\u5b9e\u8df5"})}),"\n"]}),"\n",(0,i.jsxs)(n.section,{"data-footnotes":!0,className:"footnotes",children:[(0,i.jsx)(n.h2,{className:"sr-only",id:"footnote-label",children:"Footnotes"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{id:"user-content-fn-1",children:["\n",(0,i.jsxs)(n.p,{children:["\u6839\u636e\u300aRedis\u8bbe\u8ba1\u4e0e\u5b9e\u73b0\u300b\u4e2d\u7b2c20\u7ae0\u7684\u5185\u5bb9\uff0cRedis\u670d\u52a1\u7aef\u4f1a\u5c06\u811a\u672c\u4e2d\u7684\u5177\u4f53\u5185\u5bb9\u5c01\u88c5\u5230\u4ee5 \u201cf_40\u4f4dsha\u503c\u201d\u547d\u540d\u7684\u51fd\u6570\u4e2d\uff0c\u76f8\u5f53\u4e8e \u201cf_40\u4f4dsha\u503c\u201d\u662f\u51fd\u6570\u540d\uff0c\u811a\u672c\u5185\u5bb9\u662f\u51fd\u6570\u4f53 ",(0,i.jsx)(n.a,{href:"#user-content-fnref-1","data-footnote-backref":"","aria-label":"Back to reference 1",className:"data-footnote-backref",children:"\u21a9"})]}),"\n"]}),"\n"]}),"\n"]})]})}function t(e={}){const{wrapper:n}={...(0,s.ah)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(u,{...e})}):u(e)}},11151:(e,n,l)=>{l.d(n,{ah:()=>r});var i=l(67294);const s=i.createContext({});function r(e){const n=i.useContext(s);return i.useMemo((()=>"function"==typeof e?e(n):{...n,...e}),[n,e])}}}]);