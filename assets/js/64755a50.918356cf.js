"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[20072],{35614:(n,e,o)=>{o.r(e),o.d(e,{assets:()=>l,contentTitle:()=>r,default:()=>i,frontMatter:()=>c,metadata:()=>a,toc:()=>d});var t=o(74848),s=o(28453);const c={},r=void 0,a={id:"zh-cn/linux/common/Data-Backup-And-Restore",title:"Data-Backup-And-Restore",description:"1. InfluxDB\u5907\u4efd",source:"@site/docs/zh-cn/linux/common/7-Data-Backup-And-Restore.md",sourceDirName:"zh-cn/linux/common",slug:"/zh-cn/linux/common/Data-Backup-And-Restore",permalink:"/light-docusaurus/docs/zh-cn/linux/common/Data-Backup-And-Restore",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/linux/common/7-Data-Backup-And-Restore.md",tags:[],version:"current",sidebarPosition:7,frontMatter:{},sidebar:"troch",previous:{title:"Customize-SSH-Login-Page",permalink:"/light-docusaurus/docs/zh-cn/linux/common/Customize-SSH-Login-Page"},next:{title:"SSH-Honeypot",permalink:"/light-docusaurus/docs/zh-cn/linux/common/SSH-Honeypot"}},l={},d=[{value:"1. InfluxDB\u5907\u4efd",id:"1-influxdb\u5907\u4efd",level:2},{value:"2. Postgresql\u5907\u4efd",id:"2-postgresql\u5907\u4efd",level:2},{value:"3. \u6587\u4ef6\u5939\u5907\u4efd",id:"3-\u6587\u4ef6\u5939\u5907\u4efd",level:2},{value:"4. \u6587\u4ef6\u4f20\u8f93",id:"4-\u6587\u4ef6\u4f20\u8f93",level:2}];function u(n){const e={code:"code",h2:"h2",pre:"pre",...(0,s.R)(),...n.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(e.h2,{id:"1-influxdb\u5907\u4efd",children:"1. InfluxDB\u5907\u4efd"}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-shell",children:"# \u5907\u4efd\ninfluxd backup -portable -db db_name /root/db_influxdb_backup\n\n# \u6062\u590d\ninfluxd restore -portable -db db_name -newdb new_db_name /root/db_influxdb_backup\n"})}),"\n",(0,t.jsx)(e.h2,{id:"2-postgresql\u5907\u4efd",children:"2. Postgresql\u5907\u4efd"}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-shell",children:"# \u5907\u4efd\ncd /home/postgres/postgresql/bin\n./pg_dump -h localhost -p 5432 -U postgres db_name > /root/db_pgsql_backup.sql\n\n# \u6062\u590d\ncd /home/postgres/postgresql/bin\npsql -h localhost -p 5432 -U postgres -d db_name < /root/db_pgsql_backup.sql\n\n# pg_restore -U postgres -d db_name /root/db_pgsql_backup.sql\n"})}),"\n",(0,t.jsx)(e.h2,{id:"3-\u6587\u4ef6\u5939\u5907\u4efd",children:"3. \u6587\u4ef6\u5939\u5907\u4efd"}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-shell",children:"# \u5907\u4efd\ncd /root\ntar -zcvf ./db_backup.tar.gz ./db_pgsql_backup.sql ./db_influxdb_backup\n\n# \u6062\u590d\ncd /root\ntar -zcvf ./db_backup.tar.gz\n"})}),"\n",(0,t.jsx)(e.h2,{id:"4-\u6587\u4ef6\u4f20\u8f93",children:"4. \u6587\u4ef6\u4f20\u8f93"}),"\n",(0,t.jsx)(e.pre,{children:(0,t.jsx)(e.code,{className:"language-shell",children:"# \u4e0b\u8f7d\u5230\u672c\u5730\nscp root@192.168.1.110:/root/db_backup.tar.gz D:/backup/db_backup.tar.gz\n\n# \u4e0a\u4f20\u5230\u670d\u52a1\u5668\nscp D:/backup/db_backup.tar.gz root@192.168.1.110:/root/db_backup.tar.gz \n"})})]})}function i(n={}){const{wrapper:e}={...(0,s.R)(),...n.components};return e?(0,t.jsx)(e,{...n,children:(0,t.jsx)(u,{...n})}):u(n)}},28453:(n,e,o)=>{o.d(e,{R:()=>r,x:()=>a});var t=o(96540);const s={},c=t.createContext(s);function r(n){const e=t.useContext(c);return t.useMemo((function(){return"function"==typeof n?n(e):{...e,...n}}),[e,n])}function a(n){let e;return e=n.disableParentContext?"function"==typeof n.components?n.components(s):n.components||s:r(n.components),t.createElement(c.Provider,{value:e},n.children)}}}]);