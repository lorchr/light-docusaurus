"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[53194],{78214:(n,e,s)=>{s.r(e),s.d(e,{assets:()=>d,contentTitle:()=>i,default:()=>h,frontMatter:()=>l,metadata:()=>c,toc:()=>a});var t=s(74848),r=s(28453);const l={},i="\u73af\u5883\u51c6\u5907",c={id:"zh-cn/deploy/Win10-Server",title:"\u73af\u5883\u51c6\u5907",description:"pgsql\u5b89\u88c5",source:"@site/docs/zh-cn/deploy/1-Win10-Server.md",sourceDirName:"zh-cn/deploy",slug:"/zh-cn/deploy/Win10-Server",permalink:"/light-docusaurus/docs/zh-cn/deploy/Win10-Server",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/deploy/1-Win10-Server.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{}},d={},a=[{value:"pgsql\u5b89\u88c5",id:"pgsql\u5b89\u88c5",level:2},{value:"\u5e38\u7528\u547d\u4ee4",id:"\u5e38\u7528\u547d\u4ee4",level:2},{value:"\u8fd0\u884c\u811a\u672c",id:"\u8fd0\u884c\u811a\u672c",level:2},{value:"\u505c\u6b62\u811a\u672c",id:"\u505c\u6b62\u811a\u672c",level:2}];function o(n){const e={a:"a",code:"code",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,r.R)(),...n.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(e.h1,{id:"\u73af\u5883\u51c6\u5907",children:"\u73af\u5883\u51c6\u5907"}),"\n",(0,t.jsx)(e.h2,{id:"pgsql\u5b89\u88c5",children:"pgsql\u5b89\u88c5"}),"\n",(0,t.jsxs)(e.ul,{children:["\n",(0,t.jsx)(e.li,{children:(0,t.jsx)(e.a,{href:"https://www.jb51.net/article/114332.htm",children:"PgSql\u5b89\u88c5"})}),"\n"]}),"\n",(0,t.jsxs)(e.ol,{children:["\n",(0,t.jsxs)(e.li,{children:["\u89e3\u538b\u538b\u7f29\u5305 ",(0,t.jsx)(e.code,{children:"postgresql-12.14-2-windows-x64-binaries.zip"})]}),"\n",(0,t.jsxs)(e.li,{children:["\u5728",(0,t.jsx)(e.code,{children:"pgsql"}),"\u76ee\u5f55\u4e0b\u65b0\u5efa\u4e00\u4e2a",(0,t.jsx)(e.code,{children:"data"}),"\u6587\u4ef6\u5939"]}),"\n",(0,t.jsx)(e.li,{children:"\u914d\u7f6e\u73af\u5883\u53d8\u91cf"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-vbs",metastring:"env.vbs",children:'on error resume next\nset sysenv=CreateObject("WScript.Shell").Environment("system") \'system environment array\nPath = CreateObject("Scripting.FileSystemObject").GetFolder(".").Path \'add variable\nsysenv("PGHOME")="D:\\pgsql"\nsysenv("PGHOST")="localhost"\nsysenv("Path")=sysenv("PGHOME")+"\\bin;"+sysenv("Path")\nsysenv("PGLIB")=sysenv("PGHOME")+"\\lib"\nsysenv("PGDATA")=sysenv("PGHOME")+"\\data"\n \nwscript.echo "PostgreSQL Success"\n'})}),"\n",(0,t.jsxs)(e.ol,{start:"4",children:["\n",(0,t.jsxs)(e.li,{children:["\u6267\u884c\u521d\u59cb\u5316 ",(0,t.jsx)(e.code,{children:"pgsql/bin/initdb.exe"})]}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:"initdb.exe -D D:\\pgsql\\data -E UTF-8 --locale=chs -U postgres -W\n\n-D \u6307\u5b9a\u6570\u636e\u5e93\u7c07\u7684\u5b58\u50a8\u76ee\u5f55\n-E \u6307\u5b9a\u5b57\u7b26\u96c6\u4e3a UTF-8\n--locale \u5173\u4e8e\u533a\u57df\u8bbe\u7f6e chinese-simplified-china\n-U \u9ed8\u8ba4\u7528\u6237 postgres\n-W \u9ed8\u8ba4\u7528\u6237\u5bc6\u7801\n"})}),"\n",(0,t.jsx)(e.h2,{id:"\u5e38\u7528\u547d\u4ee4",children:"\u5e38\u7528\u547d\u4ee4"}),"\n",(0,t.jsxs)(e.ol,{children:["\n",(0,t.jsx)(e.li,{children:"\u521d\u59cb\u5316\u6570\u636e\u5e93"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:"initdb.exe -D D:\\pgsql\\data -E UTF-8 --locale=chs -U postgres -W\n\n"})}),"\n",(0,t.jsx)(e.p,{children:"\u521d\u59cb\u5316\u5b8c\u6210\u540e\uff0c\u4f1a\u5728 data \u76ee\u5f55\u4e0b\u751f\u6210\u914d\u7f6e\u6587\u4ef6 postgresql.conf\uff0c\u53ef\u4ee5\u4fee\u6539\u8fd0\u884c\u7684\u7aef\u53e3"}),"\n",(0,t.jsxs)(e.ol,{start:"2",children:["\n",(0,t.jsx)(e.li,{children:"\u542f\u52a8\u670d\u52a1"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:'pg_ctl start -w -D "D:\\pgsql\\data" -l "D:\\pgsql\\log\\pgsql.log"\n\n-w \u7b49\u5f85\u76f4\u5230\u64cd\u4f5c\u5b8c\u6210\n-D \u6570\u636e\u76ee\u5f55\n-l \u65e5\u5fd7\u6587\u4ef6\u7684\u4f4d\u7f6e\n'})}),"\n",(0,t.jsxs)(e.ol,{start:"3",children:["\n",(0,t.jsx)(e.li,{children:"\u547d\u4ee4\u884c\u767b\u5f55pgsql"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:"psql -p 5433 -U postgres -W\n"})}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-sql",children:"-- \u67e5\u770b\u7248\u672c\nselect version();\n\n-- \u67e5\u770b\u7528\u6237\u540d\u5bc6\u7801\nselect * from pg_authid;\n\n-- \u83b7\u53d6\u6240\u6709\u6570\u636e\u5e93\u4fe1\u606f\nselect * from pg_database order by datname;\n\n-- \u83b7\u53d6\u5f53\u524ddb\u4e2d\u6240\u6709\u7684\u8868\u4fe1\u606f(pg_tables \u662f\u7cfb\u7edf\u89c6\u56fe)\nselect * from pg_tables order by schemaname;\n\n-- \u6bcf\u4e00\u884c\u8868\u793a\u4e00\u4e2a\u8fdb\u7a0b\uff0c\u663e\u793a\u5f53\u524d\u8fde\u63a5\u7684\u4f1a\u8bdd\u7684\u6d3b\u52a8\u8fdb\u7a0b\u7684\u4fe1\u606f\nselect * from pg_stat_activity;\n\n-- \u83b7\u53d6\u6570\u636e\u8868\u540d\u79f0\u7c7b\u578b\u53ca\u6ce8\u91ca\nselect a.attname \"\u5b57\u6bb5\u540d\u79f0\",\n       concat_ws(' ', t.typname, substring(format_type(a.atttypid, a.atttypmod) from '\\(.*\\)' )) \"\u5b57\u6bb5\u7c7b\u578b\",\n       d.description \"\u5b57\u6bb5\u6ce8\u91ca\"\nfrom pg_class c, pg_attribute a, pg_type t, pg_description d\nwhere c.relname = 'tab_name'\n  and a.attnum > 0\n  and a.attrelid = c.oid\n  and a.atttypid = t.oid\n  and d.objoid = a.attrelid\n  and d.objsubid = a.attnum\n"})}),"\n",(0,t.jsxs)(e.ol,{start:"4",children:["\n",(0,t.jsx)(e.li,{children:"\u6ce8\u518c\u4e3a\u670d\u52a1"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:'pg_ctl --help\npg_ctl register -N PostgreSQL -D "D:\\pgsql\\data"\n'})}),"\n",(0,t.jsx)(e.p,{children:"services.msc"}),"\n",(0,t.jsxs)(e.ol,{start:"5",children:["\n",(0,t.jsx)(e.li,{children:"\u542f\u52a8\u670d\u52a1"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:"net start PostgreSQL\n"})}),"\n",(0,t.jsxs)(e.ol,{start:"6",children:["\n",(0,t.jsx)(e.li,{children:"\u505c\u6b62\u670d\u52a1"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:"net stop PostgreSQL\n"})}),"\n",(0,t.jsxs)(e.ol,{start:"7",children:["\n",(0,t.jsx)(e.li,{children:"\u5220\u9664PostgreSQL\u670d\u52a1"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:"pg_ctl unregister -N PostgreSQL\n"})}),"\n",(0,t.jsxs)(e.ol,{start:"5",children:["\n",(0,t.jsx)(e.li,{children:"\u521b\u5efa\u7528\u6237postgres,\u5bc6\u7801\u540c\u6837\u662fpostgres:"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:"net user postgres postgres /add\n"})}),"\n",(0,t.jsxs)(e.ol,{start:"6",children:["\n",(0,t.jsx)(e.li,{children:"\u521b\u5efaPostgreSQL\u7528\u6237\u548c\u5b83\u8981\u627e\u7684\u90a3\u4e2a\u76f8\u7b26"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:"createuser --superuser postgres\n"})}),"\n",(0,t.jsxs)(e.ol,{start:"7",children:["\n",(0,t.jsx)(e.li,{children:"\u67e5\u770b\u7cfb\u7edf\u7528\u6237"}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{children:"net user\n"})}),"\n",(0,t.jsx)(e.h2,{id:"\u8fd0\u884c\u811a\u672c",children:"\u8fd0\u884c\u811a\u672c"}),"\n",(0,t.jsxs)(e.ul,{children:["\n",(0,t.jsx)(e.li,{children:(0,t.jsx)(e.a,{href:"https://www.cnblogs.com/dbei/p/13629742.html"})}),"\n",(0,t.jsx)(e.li,{children:(0,t.jsx)(e.a,{href:"https://blog.csdn.net/nandao158/article/details/129333601"})}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-bat",children:'@echo off\n@rem \u521b\u5efawin\u73af\u5883\u811a\u672c\n%1 mshta vbscript:CreateObject("WScript.Shell").Run("%~s0 ::", 0, FALSE)\n@rem \u5173\u95ed\u9ed1\u7a97\u53e3\n(window.close) && exit\n@rem \u8fd0\u884cjava jar \u5e76\u5c06\u65e5\u5fd7\u8f93\u51fa\u5230 console.log\u4e2d\njava -Xss128k -Xms1g -Xmx1g -jar yunyi-quality-1.0-SNAPSHOT.jar --spring.profiles.active=dev >console.log 2>&1 &\n@rem \u9000\u51fa\nexit\n'})}),"\n",(0,t.jsx)(e.h2,{id:"\u505c\u6b62\u811a\u672c",children:"\u505c\u6b62\u811a\u672c"}),"\n",(0,t.jsxs)(e.ul,{children:["\n",(0,t.jsx)(e.li,{children:(0,t.jsx)(e.a,{href:"https://codeleading.com/article/58065096861/"})}),"\n"]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-bat",children:'@echo off\nrem \u8bbe\u7f6e\u76d1\u542c\u7684\u7aef\u53e3\u53f7\nset port=33333\necho port : %port%\n \nfor /f "usebackq tokens=1-5" %%a in (`netstat -ano ^| findstr %port%`) do (\n\tif [%%d] EQU [LISTENING] (\n\t\tset pid=%%e\n\t)\n)\n \nfor /f "usebackq tokens=1-5" %%a in (`tasklist ^| findstr %pid%`) do (\n\tset image_name=%%a\n)\n \necho now will kill process : pid %pid%, image_name %image_name%\npause\nrem \u6839\u636e\u8fdb\u7a0bID\uff0ckill\u8fdb\u7a0b\ntaskkill /f /pid %pid%\npause\n'})}),"\n",(0,t.jsxs)(e.p,{children:["\u811a\u672c\u6e90\u7801\n-",(0,t.jsx)(e.a,{href:"https://blog.csdn.net/qq_43290318/article/details/126437411"})]}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-bat",children:'@echo off & setlocal EnableDelayedExpansion\nCHCP 65001\nCLS\necho \u8bf7\u8f93\u5165\u7a0b\u5e8f\u6b63\u5728\u8fd0\u884c\u7684\u7aef\u53e3\u53f7\nset /p port=\necho \u627e\u5230\u7684\u8fdb\u7a0b\u8bb0\u5f55\necho =================================================================================\nnetstat -nao|findstr !port!\necho =================================================================================\necho \u56de\u8f66\u8fdb\u884c\u9010\u4e2a\u786e\u8ba4\npause\nfor /f "tokens=2,5" %%i in (\'netstat -nao^|findstr :%%port%%\') do (\n::if "!processed[%%j]!" == "" (\nif not defined processed[%%j] (\nset pname=N/A\nfor /f "tokens=1" %%p in (\'tasklist^|findstr %%j\') do (set pname=%%p)\necho %%i\t%%j\t!pname!\necho \u8f93\u5165Y\u786e\u8ba4Kill\uff0c\u5426\u5219\u8df3\u8fc7\uff0c\u53ef\u56de\u8f66\u8df3\u8fc7\nset flag=N/A\nset /p flag=\nif "!flag!" == "Y" (\ntaskkill /pid %%j -t -f\n) else (\necho \u5df2\u8df3\u8fc7\n)\nset processed[%%j]=1\n)\n)\necho \u7a0b\u5e8f\u7ed3\u675f\npause\n'})}),"\n",(0,t.jsx)(e.p,{children:(0,t.jsx)(e.a,{href:"https://blog.csdn.net/u014641168/article/details/125115035",children:"https://blog.csdn.net/u014641168/article/details/125115035"})})]})}function h(n={}){const{wrapper:e}={...(0,r.R)(),...n.components};return e?(0,t.jsx)(e,{...n,children:(0,t.jsx)(o,{...n})}):o(n)}},28453:(n,e,s)=>{s.d(e,{R:()=>i,x:()=>c});var t=s(96540);const r={},l=t.createContext(r);function i(n){const e=t.useContext(l);return t.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function c(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(r):n.components||r:i(n.components),t.createElement(l.Provider,{value:e},n.children)}}}]);