"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[1919],{85919:(n,t,i)=>{i.r(t),i.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>a,frontMatter:()=>r,metadata:()=>o,toc:()=>g});var e=i(85893),s=i(11151);const r={},l=void 0,o={id:"zh-cn/git/Git-Base",title:"Git-Base",description:"1. \u672c\u5730\u4e0eGithub",source:"@site/docs/zh-cn/git/1-Git-Base.md",sourceDirName:"zh-cn/git",slug:"/zh-cn/git/Git-Base",permalink:"/light-docusaurus/docs/zh-cn/git/Git-Base",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/git/1-Git-Base.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{},sidebar:"troch",previous:{title:"Git",permalink:"/light-docusaurus/docs/category/git"},next:{title:"Github-Actions-Getting-Start",permalink:"/light-docusaurus/docs/zh-cn/git/Github-Actions-Getting-Start"}},c={},g=[{value:"1. \u672c\u5730\u4e0eGithub",id:"1-\u672c\u5730\u4e0egithub",level:2}];function h(n){const t={code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,s.ah)(),...n.components};return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)(t.h2,{id:"1-\u672c\u5730\u4e0egithub",children:"1. \u672c\u5730\u4e0eGithub"}),"\n",(0,e.jsxs)(t.ol,{children:["\n",(0,e.jsx)(t.li,{children:"\u521d\u59cb\u5316\u672c\u5730Git\u4ed3\u5e93"}),"\n"]}),"\n",(0,e.jsx)(t.pre,{children:(0,e.jsx)(t.code,{className:"language-shell",children:'# \u521d\u59cb\u5316Git\u4ed3\u5e93\ngit init\n\n# \u8bbe\u7f6e\u7528\u6237\u4fe1\u606f\ngit config user.name "Hui Liu"\ngit config user.email "whitetulips@163.com"\n\n# \u7f16\u5199gitignore\nvim .gitignore\n\n# \u6dfb\u52a0\u6587\u4ef6\ngit add .\n\n# \u63d0\u4ea4\ngit commit -m "Init commit"\n'})}),"\n",(0,e.jsxs)(t.ol,{start:"2",children:["\n",(0,e.jsx)(t.li,{children:"\u63a8\u9001\u5230\u65b0\u5efaGithub\u4ed3\u5e93"}),"\n"]}),"\n",(0,e.jsx)(t.pre,{children:(0,e.jsx)(t.code,{className:"language-shell",children:"# \u65b0\u5efa\u4ed3\u5e93 https://github.com/new\ngit remote add origin git@github.com:lorchr/torch-web.git\ngit branch -M main\ngit push -u origin main\n"})}),"\n",(0,e.jsxs)(t.ol,{start:"3",children:["\n",(0,e.jsx)(t.li,{children:"\u63a8\u9001\u5230\u5df2\u6709Gitee\u4ed3\u5e93"}),"\n"]}),"\n",(0,e.jsx)(t.pre,{children:(0,e.jsx)(t.code,{className:"language-shell",children:"# \u6dfb\u52a0\u65b0\u7684\u4ed3\u5e93\u5730\u5740\u6e90\ngit remote add           gitee git@gitee.com:lorchr/torch-web.git\ngit remote set-url --add gitee git@gitee.com:lorchr/torch-web.git\n\n# \u66f4\u65b0\u5230\u5f53\u524d\u5206\u652f\uff0c\u5141\u8bb8\u4e24\u8fb9\u6709\u65e0\u5173\u7684\u63d0\u4ea4\u8bb0\u5f55\ngit pull gitee main --allow-unrelated-histories\n# git push gitee local_branch:remote_branch\ngit push gitee main:main\n"})}),"\n",(0,e.jsxs)(t.ol,{start:"4",children:["\n",(0,e.jsx)(t.li,{children:"\u5176\u4ed6\u64cd\u4f5c"}),"\n"]}),"\n",(0,e.jsx)(t.pre,{children:(0,e.jsx)(t.code,{className:"language-shell",children:"# \u67e5\u770b\u63d0\u4ea4\u8bb0\u5f55\ngit log -10 main\n\n# \u67e5\u770bgit\u72b6\u6001\ngit status\n\n# \u5408\u5e76\u5206\u652f\ngit merge <another-branch>\n"})}),"\n",(0,e.jsxs)(t.ol,{start:"5",children:["\n",(0,e.jsx)(t.li,{children:"\u4ee3\u7406\u914d\u7f6e"}),"\n"]}),"\n",(0,e.jsx)(t.pre,{children:(0,e.jsx)(t.code,{className:"language-shell",children:"# \u8bbe\u7f6eHttp\u4ee3\u7406\ngit config --global http.proxy http://ip:port\n\n# \u8bbe\u7f6eHttp\u4ee3\u7406\uff0c\u5e26\u8eab\u4efd\u8ba4\u8bc1\ngit config --global http.proxy http://username:password@ip:port\n\n# \u53d6\u6d88Http\u4ee3\u7406\ngit config --global --unset http.proxy\n\n# \u83b7\u53d6\u5f53\u524dHttp\u4ee3\u7406\ngit config --global --get http.proxy\n\n\n# \u8bbe\u7f6eHttps\u4ee3\u7406\ngit config --global https.proxy http://ip:port\n\n# \u8bbe\u7f6eHttps\u4ee3\u7406\uff0c\u5e26\u8eab\u4efd\u8ba4\u8bc1\ngit config --global https.proxy http://username:password@ip:port\n\n# \u53d6\u6d88Https\u4ee3\u7406\ngit config --global --unset https.proxy\n\n# \u83b7\u53d6\u5f53\u524dHttps\u4ee3\u7406\ngit config --global --get https.proxy\n\n\n# \u672c\u5730\u8bbe\u7f6e\ngit config --global http.proxy http://127.0.0.1:4780\ngit config --global https.proxy http://127.0.0.1:4780\n\ngit config --global --get http.proxy\ngit config --global --get https.proxy\n\ngit config --global --unset http.proxy\ngit config --global --unset https.proxy\n"})}),"\n",(0,e.jsxs)(t.ol,{start:"6",children:["\n",(0,e.jsx)(t.li,{children:"\u4fee\u6539\u63d0\u4ea4\u8bb0\u5f55"}),"\n"]}),"\n",(0,e.jsx)(t.p,{children:"\u5355\u6761\u4fee\u6539"}),"\n",(0,e.jsx)(t.pre,{children:(0,e.jsx)(t.code,{className:"language-shell",children:'# \u66ff\u6362\u7528\u6237\u540d\u3001\u90ae\u7bb1\u4fe1\u606f\ngit commit --amend --author="{username} <{email}>" --no-edit\n\n# \u5982\u679c\u5df2\u7ecf\u4fee\u6539\u4e86\u4ed3\u5e93\u7684\u7528\u6237\u4fe1\u606f\uff0c\u76f4\u63a5\u6267\u884c\u547d\u4ee4\u91cd\u7f6e\ngit commit --amend --reset-author --no-edit\n\n# \u4fee\u6539\u5e76\u5f3a\u5236\u63d0\u4ea4\ngit commit --amend --author="xxx <xxx@163.com>" --no-edit\ngit push --force\n'})}),"\n",(0,e.jsxs)(t.p,{children:["\u6279\u91cf\u4fee\u6539\u811a\u672c  ",(0,e.jsx)(t.code,{children:"git-filter-branch.sh"})]}),"\n",(0,e.jsx)(t.pre,{children:(0,e.jsx)(t.code,{className:"language-shell",children:'git filter-branch --commit-filter \'\n    if [ "$GIT_AUTHOR_NAME" = "xxx" ];\n    then\n            GIT_AUTHOR_NAME="xxx";\n            GIT_AUTHOR_EMAIL="xxx@163.com";\n            git commit-tree "$@";\n    else\n            git commit-tree "$@";\n    fi\' HEAD\n'})}),"\n",(0,e.jsx)(t.pre,{children:(0,e.jsx)(t.code,{className:"language-shell",children:"# \u6e05\u7406\u7f13\u5b58\ngit filter-branch -f --index-filter 'git rm --cached --ignore-unmatch Rakefile' HEAD\n\n# \u5f3a\u5236\u63d0\u4ea4\ngit push --force\n"})}),"\n",(0,e.jsxs)(t.ol,{start:"7",children:["\n",(0,e.jsx)(t.li,{children:"\u5220\u9664\u63d0\u4ea4\u8bb0\u5f55"}),"\n"]}),"\n",(0,e.jsxs)(t.ul,{children:["\n",(0,e.jsxs)(t.li,{children:[(0,e.jsx)(t.code,{children:"git reset"})," \uff1a\u56de\u6eda\u5230\u67d0\u6b21\u63d0\u4ea4\u3002"]}),"\n",(0,e.jsxs)(t.li,{children:[(0,e.jsx)(t.code,{children:"git reset --soft"}),"\uff1a\u6b64\u6b21\u63d0\u4ea4\u4e4b\u540e\u7684\u4fee\u6539\u4f1a\u88ab\u9000\u56de\u5230\u6682\u5b58\u533a\u3002"]}),"\n",(0,e.jsxs)(t.li,{children:[(0,e.jsx)(t.code,{children:"git reset --hard"}),"\uff1a\u6b64\u6b21\u63d0\u4ea4\u4e4b\u540e\u7684\u4fee\u6539\u4e0d\u505a\u4efb\u4f55\u4fdd\u7559\uff0c",(0,e.jsx)(t.code,{children:"git status"})," \u67e5\u770b\u5de5\u4f5c\u533a\u662f\u6ca1\u6709\u8bb0\u5f55\u7684\u3002"]}),"\n"]}),"\n",(0,e.jsx)(t.pre,{children:(0,e.jsx)(t.code,{className:"language-shell",children:"# \u67e5\u770bcommitlog\ngit log\n\n# \u56de\u9000\u81f3\u67d0\u6b21\u63d0\u4ea4\ngit reset --hard commit_id\n\n# \u63a8\u9001\u81f3Github\ngit push origin HEAD --force\n"})})]})}function a(n={}){const{wrapper:t}={...(0,s.ah)(),...n.components};return t?(0,e.jsx)(t,{...n,children:(0,e.jsx)(h,{...n})}):h(n)}},11151:(n,t,i)=>{i.d(t,{ah:()=>r});var e=i(67294);const s=e.createContext({});function r(n){const t=e.useContext(s);return e.useMemo((()=>"function"==typeof n?n(t):{...t,...n}),[t,n])}}}]);