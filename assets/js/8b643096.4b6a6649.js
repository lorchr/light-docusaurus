"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[6013],{3905:(e,t,n)=>{n.d(t,{Zo:()=>i,kt:()=>m});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),c=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},i=function(e){var t=c(e.components);return r.createElement(p.Provider,{value:t},e.children)},u="mdxType",d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},g=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,p=e.parentName,i=o(e,["components","mdxType","originalType","parentName"]),u=c(n),g=a,m=u["".concat(p,".").concat(g)]||u[g]||d[g]||l;return n?r.createElement(m,s(s({ref:t},i),{},{components:n})):r.createElement(m,s({ref:t},i))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,s=new Array(l);s[0]=g;var o={};for(var p in t)hasOwnProperty.call(t,p)&&(o[p]=t[p]);o.originalType=e,o[u]="string"==typeof e?e:a,s[1]=o;for(var c=2;c<l;c++)s[c]=n[c];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}g.displayName="MDXCreateElement"},4858:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>d,frontMatter:()=>l,metadata:()=>o,toc:()=>c});var r=n(7462),a=(n(7294),n(3905));const l={},s=void 0,o={unversionedId:"zh-cn/devenv/Docker-Pgsql",id:"zh-cn/devenv/Docker-Pgsql",title:"Docker-Pgsql",description:"- Postgres Offical",source:"@site/docs/zh-cn/devenv/Docker-Pgsql.md",sourceDirName:"zh-cn/devenv",slug:"/zh-cn/devenv/Docker-Pgsql",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-Pgsql",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/devenv/Docker-Pgsql.md",tags:[],version:"current",frontMatter:{},sidebar:"troch",previous:{title:"Docker-Mysql",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-Mysql"},next:{title:"Docker-Redis",permalink:"/light-docusaurus/docs/zh-cn/devenv/Docker-Redis"}},p={},c=[{value:"1. Docker\u5b89\u88c5",id:"1-docker\u5b89\u88c5",level:2},{value:"2. Pgsql\u5907\u4efd\u8fd8\u539f",id:"2-pgsql\u5907\u4efd\u8fd8\u539f",level:2},{value:"\u4e00\u3001Windows\u4e0b\u5907\u4efd\u548c\u6062\u590d",id:"\u4e00windows\u4e0b\u5907\u4efd\u548c\u6062\u590d",level:3},{value:"\u4e8c\u3001Linux \u4e0b\u5907\u4efd\u548c\u6062\u590d",id:"\u4e8clinux-\u4e0b\u5907\u4efd\u548c\u6062\u590d",level:3},{value:"SQL\u65b9\u5f0f\u5907\u4efd\u548c\u6062\u590d",id:"sql\u65b9\u5f0f\u5907\u4efd\u548c\u6062\u590d",level:3},{value:"3. \u5e38\u7528\u547d\u4ee4",id:"3-\u5e38\u7528\u547d\u4ee4",level:2}],i={toc:c},u="wrapper";function d(e){let{components:t,...n}=e;return(0,a.kt)(u,(0,r.Z)({},i,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://www.postgresql.org/"},"Postgres Offical")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://hub.docker.com/_/postgres"},"Postgres Docker"))),(0,a.kt)("h2",{id:"1-docker\u5b89\u88c5"},"1. Docker\u5b89\u88c5"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"# \u521b\u5efaNetwork\ndocker network create dev\n\n# \u521b\u5efa\u6570\u636e\u5377\ndocker volume create pgsql_data;\n\n# docker run -i --rm postgres cat /usr/share/postgresql/postgresql.conf.sample >  D:/docker/pgsql/conf/postgresql.conf\n\n# \u83b7\u53d6\u9ed8\u8ba4\u914d\u7f6e\u6587\u4ef6\ndocker run -d --name postgres_temp postgres:15.3 \\\n&& docker cp postgres_temp:/usr/share/postgresql/postgresql.conf.sample D:/docker/pgsql/conf/postgresql.conf \\\n&& docker stop postgres_temp && docker rm postgres_temp\n\n# \u8fd0\u884c\u5bb9\u5668\ndocker run -d \\\n  --publish 5432:5432 \\\n    --volume //d/docker/pgsql/data:/var/lib/postgresql/data \\\n    --volume //d/docker/pgsql/conf/postgresql.conf:/etc/postgresql/postgresql.conf:ro \\\n  --env PGDATA=/var/lib/postgresql/data \\\n  --env POSTGRES_PASSWORD=postgres \\\n  --net dev \\\n  --restart=no \\\n  --name postgres \\\n  postgres:15.3\n\ndocker exec -it -u root postgres /bin/bash\n\ndocker container restart postgres\n")),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Account",(0,a.kt)("ul",{parentName:"li"},(0,a.kt)("li",{parentName:"ul"},"postgres/postgres")))),(0,a.kt)("h2",{id:"2-pgsql\u5907\u4efd\u8fd8\u539f"},"2. Pgsql\u5907\u4efd\u8fd8\u539f"),(0,a.kt)("h3",{id:"\u4e00windows\u4e0b\u5907\u4efd\u548c\u6062\u590d"},"\u4e00\u3001Windows\u4e0b\u5907\u4efd\u548c\u6062\u590d"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u5907\u4efd\u547d\u4ee4")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"pg_dump -h 164.82.233.54 -U postgres test > D:\\postgres.bak\n\n1. pg_dump          \u662f\u5907\u4efd\u6570\u636e\u5e93\u6307\u4ee4\uff1b\n2. 164.82.233.54    \u662f\u6570\u636e\u5e93\u7684 ip \u5730\u5740\uff1b\n3. postgres         \u662f\u6570\u636e\u5e93\u7684\u7528\u6237\u540d\uff1b\n4. test             \u662f\u6570\u636e\u5e93\u540d\uff1b\n5. >                \u610f\u601d\u662f\u5bfc\u51fa\u5230\u6307\u5b9a\u76ee\u5f55\uff1b\n")),(0,a.kt)("ol",{start:2},(0,a.kt)("li",{parentName:"ol"},"\u6062\u590d\u547d\u4ee4")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"psql -h localhost -U postgres -d test < D:\\postgres.bak\n\n1. psql           \u662f\u6062\u590d\u6570\u636e\u5e93\u6307\u4ee4\uff1b\n2. localhost      \u662f\u8981\u6062\u590d\u7684\u6570\u636e\u5e93\u7684 ip \u5730\u5740\uff1b\n3. postgres       \u662f\u6570\u636e\u5e93\u7684\u7528\u6237\u540d\uff1b\n4. test           \u662f\u6570\u636e\u5e93\u540d\uff1b\n5. <              \u610f\u601d\u662f\u5bfc\u51fa\u5230\u6307\u5b9a\u76ee\u5f55\uff1b\n")),(0,a.kt)("h3",{id:"\u4e8clinux-\u4e0b\u5907\u4efd\u548c\u6062\u590d"},"\u4e8c\u3001Linux \u4e0b\u5907\u4efd\u548c\u6062\u590d"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u5907\u4efd")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"/opt/PostgreSQL/9.5/bin/pg_dump -h 164.82.233.54 -U postgres databasename > databasename.bak\n")),(0,a.kt)("ol",{start:2},(0,a.kt)("li",{parentName:"ol"},"\u6062\u590d")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"/opt/PostgreSQL/9.5/bin/psql -h localhost -U postgres -d databasename < databasename.bak\n")),(0,a.kt)("h3",{id:"sql\u65b9\u5f0f\u5907\u4efd\u548c\u6062\u590d"},"SQL\u65b9\u5f0f\u5907\u4efd\u548c\u6062\u590d"),(0,a.kt)("blockquote",null,(0,a.kt)("p",{parentName:"blockquote"},"\u8fd9\u91cc\u6211\u4eec\u7528\u5230\u7684\u5de5\u5177\u662f ",(0,a.kt)("inlineCode",{parentName:"p"},"pg_dump")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"pg_dumpall"),"\n\u8fd9\u79cd\u65b9\u5f0f\u53ef\u4ee5\u5728\u6570\u636e\u5e93\u6b63\u5728\u4f7f\u7528\u7684\u65f6\u5019\u8fdb\u884c\u5b8c\u6574\u4e00\u81f4\u7684\u5907\u4efd\uff0c\u5e76\u4e0d\u963b\u585e\u5176\u5b83\u7528\u6237\u5bf9\u6570\u636e\u5e93\u7684\u8bbf\u95ee\u3002\n\u5b83\u4f1a\u4ea7\u751f\u4e00\u4e2a\u811a\u672c\u6587\u4ef6\uff0c\u91cc\u9762\u5305\u542b\u5907\u4efd\u5f00\u59cb\u65f6\uff0c\u5df2\u521b\u5efa\u7684\u5404\u79cd\u6570\u636e\u5e93\u5bf9\u8c61\u7684 SQL \u8bed\u53e5\u548c\u6bcf\u4e2a\u8868\u4e2d\u7684\u6570\u636e\u3002\n\u53ef\u4ee5\u4f7f\u7528\u6570\u636e\u5e93\u63d0\u4f9b\u7684\u5de5\u5177 ",(0,a.kt)("inlineCode",{parentName:"p"},"pg_dumpall")," \u548c ",(0,a.kt)("inlineCode",{parentName:"p"},"pg_dump")," \u6765\u8fdb\u884c\u5907\u4efd\u3002\n",(0,a.kt)("inlineCode",{parentName:"p"},"pg_dump")," \u53ea\u5907\u4efd\u6570\u636e\u5e93\u96c6\u7fa4\u4e2d\u7684\u67d0\u4e2a\u6570\u636e\u5e93\u7684\u6570\u636e\uff0c\u5b83\u4e0d\u4f1a\u5bfc\u51fa\u89d2\u8272\u548c\u8868\u7a7a\u95f4\u76f8\u5173\u7684\u4fe1\u606f\uff0c\u56e0\u4e3a\u8fd9\u4e9b\u4fe1\u606f\u662f\u6574\u4e2a\u6570\u636e\u5e93\u96c6\u7fa4\u5171\u7528\u7684\uff0c\u4e0d\u5c5e\u4e8e\u67d0\u4e2a\u5355\u72ec\u7684\u6570\u636e\u5e93\u3002\n",(0,a.kt)("inlineCode",{parentName:"p"},"pg_dumpall"),"\uff0c\u5bf9\u96c6\u7c07\u4e2d\u7684\u6bcf\u4e2a\u6570\u636e\u5e93\u8c03\u7528 pg_dump \u6765\u5b8c\u6210\u8be5\u5de5\u4f5c,\u8fd8\u4f1a\u8fd8\u8f6c\u50a8\u5bf9\u6240\u6709\u6570\u636e\u5e93\u516c\u7528\u7684\u5168\u5c40\u5bf9\u8c61\uff08 pg_dump \u4e0d\u4fdd\u5b58\u8fd9\u4e9b\u5bf9\u8c61\uff09\u3002\n\u76ee\u524d\u8fd9\u5305\u62ec\u9002\u6570\u636e\u5e93\u7528\u6237\u548c\u7ec4\u3001\u8868\u7a7a\u95f4\u4ee5\u53ca\u9002\u5408\u6240\u6709\u6570\u636e\u5e93\u7684\u8bbf\u95ee\u6743\u9650\u7b49\u5c5e\u6027\u3002")),(0,a.kt)("p",null,"\u4f8b\u5982\uff0c\u5728\u6211\u7684\u8ba1\u7b97\u673a\u4e0a\uff0c\u53ef\u4f7f\u7528\u5982\u4e0b\u547d\u4ee4\u5bf9\u540d\u4e3a dbname \u7684\u6570\u636e\u5e93\u8fdb\u884c\u5907\u4efd\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"pg_dump \u2013h 127.0.0.1 -p 5432 -U postgres -c -C \u2013f dbname.sql dbname\n")),(0,a.kt)("p",null,"\u4f7f\u7528\u5982\u4e0b\u547d\u4ee4\u53ef\u5bf9\u5168\u90e8 pg \u6570\u636e\u5e93\u8fdb\u884c\u5907\u4efd\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"pg_dumpall \u2013h 127.0.0.1 \u2013p 5432 -U postgres \u2013c -C \u2013f db_bak.sql\n")),(0,a.kt)("p",null,"\u6062\u590d\u65b9\u5f0f\u5f88\u7b80\u5355\u3002\u6267\u884c\u6062\u590d\u547d\u4ee4\u5373\u53ef\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"psql \u2013h 127.0.0.1 -p 5432 -U postgres \u2013f db_bak.sql\n")),(0,a.kt)("h2",{id:"3-\u5e38\u7528\u547d\u4ee4"},"3. \u5e38\u7528\u547d\u4ee4"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u8fde\u63a5\u7ba1\u7406")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sql"},"-- \u67e5\u8be2\u5f53\u524d\u8fde\u63a5\u6570\nSELECT * FROM pg_stat_activity;\n\n-- \u67e5\u770b\u8fc7\u671f\u8fde\u63a5\nSELECT * FROM pg_stat_activity WHERE state = 'idle';\n\n--\u5220\u9664\u8fde\u63a5\uff0c\u62ec\u53f7\u91cc\u4f20pid\nSELECT pg_terminate_backend(151);\n\n-- \u67e5\u770b\u6700\u5927\u8fde\u63a5\u6570\nSHOW max_connections;\n\n-- \u4fee\u6539\u6700\u5927\u8fde\u63a5\u6570\uff0c\u9700\u8981superuser\u6743\u9650\nALTER system SET max_connections = 1000;\n")),(0,a.kt)("ol",{start:2},(0,a.kt)("li",{parentName:"ol"},"\u6570\u636e\u5e93\u64cd\u4f5c")),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sql"},"-- \u67e5\u770b\u6570\u636e\u5e93\u5217\u8868\nSELECT datname FROM pg_database;\n\n-- \u5207\u6362\u5230\u67d0\u4e2a\u6570\u636e\u5e93\n\\c db_name;\n\n-- \u6267\u884c\u6570\u636e\u5e93\u811a\u672c\n\\i /path/to/scripts.sql\n\n-- \u67e5\u8be2\u5f53\u524d\u6570\u636e\u5e93\u4e0b\u7684\u6240\u6709\u6570\u636e\u8868\nSELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';\n\n-- \u5220\u9664\u6570\u636e\u5e93\nDROP DATABASE IF EXISTS \"db_name\";\n\n-- \u521b\u5efa\u6570\u636e\u5e93\nCREATE DATABASE \"db_name\"\n    WITH OWNER = postgres\n    TEMPLATE = template0\n    ENCODING = 'UTF8'\n    TABLESPACE = pg_default\n    CONNECTION LIMIT = -1;\nGRANT ALL ON DATABASE \"db_name\"  TO postgres;\n")))}d.isMDXComponent=!0}}]);