"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[52203],{30173:(e,n,l)=>{l.r(n),l.d(n,{assets:()=>c,contentTitle:()=>s,default:()=>a,frontMatter:()=>t,metadata:()=>r,toc:()=>h});var i=l(74848),d=l(28453);const t={},s=void 0,r={id:"influxdb/Influxdb-Retention-Policy",title:"Influxdb-Retention-Policy",description:"- Influx Sql\u7cfb\u5217\u6559\u7a0b\u4e8c\uff1aretention policy \u4fdd\u5b58\u7b56\u7565",source:"@site/middleware/influxdb/2-Influxdb-Retention-Policy.md",sourceDirName:"influxdb",slug:"/influxdb/Influxdb-Retention-Policy",permalink:"/light-docusaurus/middleware/influxdb/Influxdb-Retention-Policy",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/middleware/influxdb/2-Influxdb-Retention-Policy.md",tags:[],version:"current",lastUpdatedBy:"Lorchr",lastUpdatedAt:1714193875e3,sidebarPosition:2,frontMatter:{},sidebar:"middleware",previous:{title:"Influxdb-DownSample",permalink:"/light-docusaurus/middleware/influxdb/Influxdb-DownSample"},next:{title:"Influxdb-Export-To-Timescaledb",permalink:"/light-docusaurus/middleware/influxdb/Influxdb-Export-To-Timescaledb"}},c={},h=[{value:"I. \u57fa\u672c\u64cd\u4f5c",id:"i-\u57fa\u672c\u64cd\u4f5c",level:2},{value:"1. \u521b\u5efaretention policy",id:"1-\u521b\u5efaretention-policy",level:3},{value:"2. \u7b56\u7565\u67e5\u770b",id:"2-\u7b56\u7565\u67e5\u770b",level:3},{value:"3. \u4fee\u6539\u4fdd\u5b58\u7b56\u7565",id:"3-\u4fee\u6539\u4fdd\u5b58\u7b56\u7565",level:3},{value:"4. \u5220\u9664\u4fdd\u5b58\u7b56\u7565",id:"4-\u5220\u9664\u4fdd\u5b58\u7b56\u7565",level:3},{value:"II. \u8fdb\u9636\u8bf4\u660e",id:"ii-\u8fdb\u9636\u8bf4\u660e",level:2},{value:"1. \u4fdd\u5b58\u65f6\u95f4",id:"1-\u4fdd\u5b58\u65f6\u95f4",level:3},{value:"2. \u5206\u7247\u65f6\u95f4",id:"2-\u5206\u7247\u65f6\u95f4",level:3},{value:"3. \u526f\u672c",id:"3-\u526f\u672c",level:3},{value:"4. \u573a\u666f\u8bf4\u660e",id:"4-\u573a\u666f\u8bf4\u660e",level:3},{value:"II. \u5176\u4ed6",id:"ii-\u5176\u4ed6",level:2},{value:"0. \u7cfb\u5217\u535a\u6587",id:"0-\u7cfb\u5217\u535a\u6587",level:3},{value:"1. \u53c2\u8003\u535a\u6587",id:"1-\u53c2\u8003\u535a\u6587",level:3}];function o(e){const n={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,d.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.51cto.com/u_3408236/5818050",children:"Influx Sql\u7cfb\u5217\u6559\u7a0b\u4e8c\uff1aretention policy \u4fdd\u5b58\u7b56\u7565"})}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"retention policy\u8fd9\u4e2a\u4e1c\u897f\u76f8\u6bd4\u8f83\u4e8e\u4f20\u7edf\u7684\u5173\u7cfb\u578b\u6570\u636e\u5e93(\u6bd4\u5982mysql)\u800c\u8a00\uff0c\u662f\u4e00\u4e2a\u6bd4\u8f83\u65b0\u7684\u4e1c\u897f\uff0c\u5728\u5c06\u8868\u4e4b\u524d\uff0c\u6709\u5fc5\u8981\u6765\u770b\u4e00\u4e0b\u4fdd\u5b58\u7b56\u7565\u6709\u4ec0\u4e48\u7528\uff0c\u4ee5\u53ca\u53ef\u4ee5\u600e\u4e48\u7528"}),"\n",(0,i.jsx)(n.h2,{id:"i-\u57fa\u672c\u64cd\u4f5c",children:"I. \u57fa\u672c\u64cd\u4f5c"}),"\n",(0,i.jsx)(n.h3,{id:"1-\u521b\u5efaretention-policy",children:"1. \u521b\u5efaretention policy"}),"\n",(0,i.jsx)(n.p,{children:"\u200b\u200bretention policy\u200b\u200b\u4f9d\u6258\u4e8edatabase\u5b58\u5728\uff0c\u4e5f\u5c31\u662f\u8bf4\u4fdd\u5b58\u7b56\u7565\u521b\u5efa\u65f6\uff0c\u9700\u8981\u6307\u5b9a\u5177\u4f53\u7684\u6570\u636e\u5e93\uff0c\u8bed\u6cd5\u5982\u4e0b"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"CREATE RETENTION POLICY <retention_policy_name> ON <database_name> DURATION <duration> REPLICATION <n> [SHARD DURATION <duration>] [DEFAULT]\n"})}),"\n",(0,i.jsx)(n.p,{children:"\u521b\u5efa\u8bed\u53e5\u4e2d\uff0c\u6709\u51e0\u4e2a\u5730\u65b9\u9700\u8981\u989d\u5916\u6ce8\u610f\u4e00\u4e0b"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"\u200b\u200bretention_policy_name\u200b\u200b: \u7b56\u7565\u540d\uff08\u81ea\u5b9a\u4e49\u7684\uff09"}),"\n",(0,i.jsx)(n.li,{children:"\u200b\u200bdatabase_name\u200b\u200b: \u4e00\u4e2a\u5fc5\u987b\u5b58\u5728\u7684\u6570\u636e\u5e93\u540d"}),"\n",(0,i.jsx)(n.li,{children:"\u200b\u200bduration\u200b\u200b: \u5b9a\u4e49\u7684\u6570\u636e\u4fdd\u5b58\u65f6\u95f4\uff0c\u6700\u4f4e\u4e3a1h\uff0c\u5982\u679c\u8bbe\u7f6e\u4e3a0\uff0c\u8868\u793a\u6570\u636e\u6301\u4e45\u4e0d\u5931\u6548\uff08\u9ed8\u8ba4\u7684\u7b56\u7565\u5c31\u662f\u8fd9\u6837\u7684\uff09"}),"\n",(0,i.jsx)(n.li,{children:"\u200b\u200bREPLICATION\u200b\u200b: \u5b9a\u4e49\u6bcf\u4e2apoint\u4fdd\u5b58\u7684\u526f\u672c\u6570\uff0c\u9ed8\u8ba4\u4e3a1"}),"\n",(0,i.jsx)(n.li,{children:"\u200b\u200bdefault\u200b\u200b: \u8868\u793a\u5c06\u8fd9\u4e2a\u521b\u5efa\u7684\u4fdd\u5b58\u7b56\u7565\u8bbe\u7f6e\u4e3a\u9ed8\u8ba4\u7684"}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:"\u4e0b\u9762\u662f\u4e00\u4e2a\u5b9e\u9645\u7684case\uff0c\u521b\u5efa\u4e00\u4e2a\u6570\u636e\u4fdd\u5b58\u4e00\u5e74\u7684\u7b56\u7565"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'create retention policy "1Y" on test duration 366d replication 1\n'})}),"\n",(0,i.jsx)(n.h3,{id:"2-\u7b56\u7565\u67e5\u770b",children:"2. \u7b56\u7565\u67e5\u770b"}),"\n",(0,i.jsx)(n.p,{children:"\u4e0a\u9762\u6f14\u793a\u7684case\u4e2d\uff0c\u5df2\u7ecf\u6709\u5982\u4f55\u67e5\u770b\u4e00\u4e2a\u6570\u636e\u5e93\u7684\u4fdd\u5b58\u7b56\u7565\u4e86"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"show retention policies on <database name>\n"})}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"show retention policies on test\n"})}),"\n",(0,i.jsx)(n.h3,{id:"3-\u4fee\u6539\u4fdd\u5b58\u7b56\u7565",children:"3. \u4fee\u6539\u4fdd\u5b58\u7b56\u7565"}),"\n",(0,i.jsx)(n.p,{children:"\u4fee\u6539\u4e00\u4e2a\u5df2\u7ecf\u5b58\u5728\u7684\u4fdd\u5b58\u7b56\u7565\uff0c\u8bed\u6cd5\u5982\u4e0b"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"ALTER RETENTION POLICY <retention_policy_name> ON <database_name> DURATION <duration> REPLICATION <n> SHARD DURATION <duration> DEFAULT\n"})}),"\n",(0,i.jsx)(n.p,{children:"\u4e0a\u9762\u7684\u5b9a\u4e49\u548c\u524d\u9762\u521b\u5efa\u57fa\u672c\u4e00\u81f4\uff0c\u4e0b\u9762\u7ed9\u51fa\u4e00\u4e2acase"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'alter retention policy "1Y" on test duration 365d replication 2 default\n'})}),"\n",(0,i.jsx)(n.h3,{id:"4-\u5220\u9664\u4fdd\u5b58\u7b56\u7565",children:"4. \u5220\u9664\u4fdd\u5b58\u7b56\u7565"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:"DROP RETENTION POLICY <retention_policy_name> ON <database_name>\n"})}),"\n",(0,i.jsx)(n.p,{children:"\u5f53\u5982\u4e0b\u9762\u7684case\uff0c\u5220\u9664\u4e86\u9ed8\u8ba4\u7684\u7b56\u7565\u4e4b\u540e\uff0c\u4f1a\u53d1\u73b0\u5c45\u7136\u6ca1\u6709\u4e86\u9ed8\u8ba4\u7684\u4fdd\u5b58\u7b56\u7565\u4e86\uff0c\u8fd9\u4e2a\u65f6\u5019\u53ef\u80fd\u9700\u8981\u6ce8\u610f\u4e0b\uff0c\u624b\u52a8\u6307\u5b9a\u4e00\u4e2a"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'drop retention policy "1Y" on test\n'})}),"\n",(0,i.jsx)(n.h2,{id:"ii-\u8fdb\u9636\u8bf4\u660e",children:"II. \u8fdb\u9636\u8bf4\u660e"}),"\n",(0,i.jsx)(n.p,{children:"\u524d\u9762\u867d\u7136\u4ecb\u7ecd\u4e86\u4fdd\u5b58\u7b56\u7565\u7684\u589e\u5220\u6539\u67e5\uff0c\u4f46\u662f\u8fd9\u4e2a\u4e1c\u897f\u7a76\u7adf\u6709\u4ec0\u4e48\u7528\uff0c\u53c8\u53ef\u4ee5\u600e\u4e48\u7528\u5462\uff1f"}),"\n",(0,i.jsx)(n.p,{children:"\u770b\u4e00\u4e0b\u524d\u9762\u67e5\u770b\u4fdd\u5b58\u7b56\u7565\u7684\u56fe"}),"\n",(0,i.jsx)(n.pre,{children:(0,i.jsx)(n.code,{className:"language-shell",children:'create retention policy "1Y" on test duration 366d replication 1\n\nshow retention policies on test\n'})}),"\n",(0,i.jsxs)(n.p,{children:["\u4ece\u524d\u9762\u7684\u67e5\u770b\uff0c\u53ef\u4ee5\u770b\u5230\u4fdd\u5b58\u7b56\u7565\u4e3b\u8981\u6709\u4e09\u4e2a\u5173\u952e\u4fe1\u606f\uff0c",(0,i.jsx)(n.code,{children:"\u200b\u200b\u6570\u636e\u4fdd\u5b58\u65f6\u95f4\u200b\u200b\u200b"}),", \u200b",(0,i.jsx)(n.code,{children:"\u200b\u6570\u636e\u5206\u7247\u65f6\u95f4"}),"\u200b\u200b\u200b, ",(0,i.jsx)(n.code,{children:"\u200b\u200b\u526f\u672c\u6570\u200b\u200b"})]}),"\n",(0,i.jsx)(n.h3,{id:"1-\u4fdd\u5b58\u65f6\u95f4",children:"1. \u4fdd\u5b58\u65f6\u95f4"}),"\n",(0,i.jsx)(n.p,{children:"duration \u8fd9\u4e00\u5217\uff0c\u8868\u793a\u7684\u5c31\u662f\u8fd9\u4e2a\u7b56\u7565\u5b9a\u4e49\u7684\u6570\u636e\u4fdd\u5b58\u65f6\u95f4"}),"\n",(0,i.jsx)(n.p,{children:"\u56e0\u4e3a\u6211\u4eec\u77e5\u9053\u6bcf\u6761\u8bb0\u5f55\u90fd\u6709\u4e00\u4e2atime\u8868\u660e\u8fd9\u6761\u8bb0\u5f55\u7684\u65f6\u95f4\u6233\uff0c\u5982\u679c\u5f53\u524d\u65f6\u95f4\u4e0e\u8fd9\u6761\u8bb0\u5f55\u7684time\u4e4b\u95f4\u5dee\u503c\uff0c\u5927\u4e8eduration\uff0c\u90a3\u4e48\u8fd9\u6761\u6570\u636e\u5c31\u4f1a\u88ab\u5220\u9664\u6389"}),"\n",(0,i.jsx)(n.p,{children:"\u6ce8\u610f"}),"\n",(0,i.jsxs)(n.p,{children:["\u9ed8\u8ba4\u7684\u4fdd\u5b58\u7b56\u7565 ",(0,i.jsx)(n.code,{children:"\u200b\u200bautogen"}),"\u200b\u200b \u200b\u4e2d\u7684 \u200b",(0,i.jsx)(n.code,{children:"\u200bduraitnotallow=0\u200b"}),"\u200b\uff0c\u8fd9\u91cc\u8868\u793a\u8fd9\u6761\u6570\u636e\u4e0d\u4f1a\u88ab\u5220\u9664"]}),"\n",(0,i.jsx)(n.h3,{id:"2-\u5206\u7247\u65f6\u95f4",children:"2. \u5206\u7247\u65f6\u95f4"}),"\n",(0,i.jsxs)(n.p,{children:["\u7b80\u5355\u7406\u89e3\u4e3a\u6bcf\u4e2a\u5206\u7247\u7684\u65f6\u95f4\u8de8\u5ea6\uff0c\u6bd4\u5982\u4e0a\u9762\u7684",(0,i.jsx)(n.code,{children:"\u200b\u200b1_d\u200b"}),"\u200b\u8fd9\u4e2a\u7b56\u7565\u4e2d\uff0c\u6570\u636e\u4fdd\u5b58\u6700\u8fd124\u5c0f\u65f6\u7684\uff0c\u6bcf\u4e2a\u5c0f\u65f6\u4e00\u4e2a\u5206\u7ec4"]}),"\n",(0,i.jsx)(n.p,{children:"\u6211\u4eec\u5728\u521b\u5efa\u6570\u636e\u7b56\u7565\u7684\u65f6\u5019\uff0c\u5927\u591a\u65f6\u5019\u90fd\u6ca1\u6709\u6307\u5b9a\u8fd9\u4e2a\u503c\uff0c\u7cfb\u7edf\u7ed9\u51fa\u7684\u65b9\u6848\u5982\u4e0b"}),"\n",(0,i.jsxs)(n.table,{children:[(0,i.jsx)(n.thead,{children:(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.th,{children:"Retention Policy\u2019s DURATION"}),(0,i.jsx)(n.th,{children:"Shard Group Duration"})]})}),(0,i.jsxs)(n.tbody,{children:[(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"< 2 days"})}),(0,i.jsx)(n.td,{children:"1 hour"})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:">= 2 days and <= 6 months"})}),(0,i.jsx)(n.td,{children:"1 day"})]}),(0,i.jsxs)(n.tr,{children:[(0,i.jsx)(n.td,{children:(0,i.jsx)(n.code,{children:"> 6 months"})}),(0,i.jsx)(n.td,{children:"7 days"})]})]})]}),"\n",(0,i.jsx)(n.h3,{id:"3-\u526f\u672c",children:"3. \u526f\u672c"}),"\n",(0,i.jsx)(n.p,{children:"\u526f\u672c\u8fd9\u4e2a\u6307\u5b9a\u4e86\u6570\u636e\u6709\u591a\u5c11\u4e2a\u72ec\u7acb\u7684\u5907\u4efd\u5b58\u5728"}),"\n",(0,i.jsx)(n.h3,{id:"4-\u573a\u666f\u8bf4\u660e",children:"4. \u573a\u666f\u8bf4\u660e"}),"\n",(0,i.jsxs)(n.p,{children:["\u4e86\u89e3\u4e0a\u9762\u7684\u51e0\u4e2a\u53c2\u6570\u4e4b\u540e\uff0c\u53ef\u4ee5\u9884\u89c1\u4fdd\u5b58\u7b56\u7565\u6709\u4e2a\u597d\u7684\u5730\u65b9\u5728\u4e8e\u5220\u9664\u8fc7\u671f\u6570\u636e\uff0c\u6bd4\u5982\u4f7f\u7528influx\u6765\u5b58\u65e5\u5fd7\uff0c\u6211\u53ea\u5e0c\u671b\u67e5\u770b\u6700\u8fd1\u4e00\u4e2a\u6708\u7684\u6570\u636e\uff0c\u8fd9\u4e2a\u65f6\u5019\u6307\u5b9a\u4e00\u4e2a",(0,i.jsx)(n.code,{children:"\u200b\u200bduration"}),"\u200b\u200b\u65f6\u95f4\u4e3a30\u5929\u7684\u4fdd\u5b58\u7b56\u7565\uff0c\u7136\u540e\u6dfb\u52a0\u6570\u636e\u65f6\uff0c\u6307\u5b9a\u8fd9\u4e2a\u4fdd\u5b58\u7b56\u7565\uff0c\u5c31\u4e0d\u9700\u8981\u81ea\u5df1\u6765\u5173\u5fc3\u65e5\u5fd7\u5220\u9664\u7684\u95ee\u9898\u4e86"]}),"\n",(0,i.jsx)(n.h2,{id:"ii-\u5176\u4ed6",children:"II. \u5176\u4ed6"}),"\n",(0,i.jsx)(n.h3,{id:"0-\u7cfb\u5217\u535a\u6587",children:"0. \u7cfb\u5217\u535a\u6587"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.hhui.top/hexblog/2019/07/18/190718-Influx-Sql%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E4%B8%80%EF%BC%9Adatabase-%E6%95%B0%E6%8D%AE%E5%BA%93/",children:"\u200b190718-Influx Sql\u7cfb\u5217\u6559\u7a0b\u4e00\uff1adatabase \u6570\u636e\u5e93\u200b\u200b"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.hhui.top/hexblog/2019/07/17/190717-Influx-Sql%E7%B3%BB%E5%88%97%E6%95%99%E7%A8%8B%E9%9B%B6%EF%BC%9A%E5%AE%89%E8%A3%85%E5%8F%8Ainflux-cli%E4%BD%BF%E7%94%A8%E5%A7%BF%E5%8A%BF%E4%BB%8B%E7%BB%8D/",children:"\u200b190717-Influx Sql\u7cfb\u5217\u6559\u7a0b\u96f6\uff1a\u5b89\u88c5\u53cainflux-cli\u4f7f\u7528\u59ff\u52bf\u4ecb\u7ecd\u200b\u200b"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.hhui.top/hexblog/2019/05/09/190509-InfluxDb%E4%B9%8B%E6%97%B6%E9%97%B4%E6%88%B3%E6%98%BE%E7%A4%BA%E4%B8%BA%E6%97%A5%E6%9C%9F%E6%A0%BC%E5%BC%8F/",children:"\u200b190509-InfluxDb\u4e4b\u65f6\u95f4\u6233\u663e\u793a\u4e3a\u65e5\u671f\u683c\u5f0f\u200b\u200b"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.hhui.top/hexblog/2019/05/06/190506-InfluxDB%E4%B9%8B%E9%85%8D%E7%BD%AE%E4%BF%AE%E6%94%B9/",children:"\u200b190506-InfluxDB\u4e4b\u914d\u7f6e\u4fee\u6539\u200b\u200b"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.hhui.top/hexblog/2019/05/05/190505-InfluxDB%E4%B9%8B%E6%9D%83%E9%99%90%E7%AE%A1%E7%90%86/",children:"\u200b190505-InfluxDB\u4e4b\u6743\u9650\u7ba1\u7406\u200b\u200b"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.hhui.top/hexblog/2018/07/27/180727-%E6%97%B6%E5%BA%8F%E6%95%B0%E6%8D%AE%E5%BA%93InfluxDB%E4%B9%8B%E5%A4%87%E4%BB%BD%E5%92%8C%E6%81%A2%E5%A4%8D%E7%AD%96%E7%95%A5/",children:"\u200b180727-\u65f6\u5e8f\u6570\u636e\u5e93InfluxDB\u4e4b\u5907\u4efd\u548c\u6062\u590d\u7b56\u7565\u200b\u200b"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.hhui.top/hexblog/2018/07/26/180726-InfluxDB%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5%E5%B0%8F%E7%BB%93/",children:"\u200b180726-InfluxDB\u57fa\u672c\u6982\u5ff5\u5c0f\u7ed3\u200b\u200b"})}),"\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://blog.hhui.top/hexblog/2018/07/25/180725-InfluxDB-v1.6.0%E5%AE%89%E8%A3%85%E5%92%8C%E7%AE%80%E5%8D%95%E4%BD%BF%E7%94%A8%E5%B0%8F%E7%BB%93/",children:"\u200b180725-InfluxDB-v1.6.0\u5b89\u88c5\u548c\u7b80\u5355\u4f7f\u7528\u5c0f\u7ed3\u200b\u200b"})}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"1-\u53c2\u8003\u535a\u6587",children:"1. \u53c2\u8003\u535a\u6587"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:(0,i.jsx)(n.a,{href:"https://docs.influxdata.com/influxdb/v1.7/query_language/database_management/#create-retention-policies-with-create-retention-policy",children:"\u200bDatabase management using InfluxQL\u200b\u200b"})}),"\n",(0,i.jsxs)(n.li,{children:[(0,i.jsx)(n.a,{href:"https://liuyueyi.github.io/hexblog",children:"\u200b\u200b\u4e00\u7070\u7070Blog\u200b\u200b"}),"\uff1a ",(0,i.jsx)(n.a,{href:"https://liuyueyi.github.io/hexblog",children:"https://liuyueyi.github.io/hexblog"})]}),"\n"]})]})}function a(e={}){const{wrapper:n}={...(0,d.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(o,{...e})}):o(e)}},28453:(e,n,l)=>{l.d(n,{R:()=>s,x:()=>r});var i=l(96540);const d={},t=i.createContext(d);function s(e){const n=i.useContext(t);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:s(e.components),i.createElement(t.Provider,{value:n},e.children)}}}]);