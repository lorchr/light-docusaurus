"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[44030],{4428:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>d,default:()=>i,frontMatter:()=>s,metadata:()=>r,toc:()=>o});var a=t(74848),l=t(28453);const s={},d=void 0,r={id:"pgsql/Parse-Pgsql-DDL",title:"Parse-Pgsql-DDL",description:"\u4eca\u5929\u53c8\u9047\u5230\u4e86\u4e00\u4e2a\u95ee\u9898\uff0c\u5982\u4f55\u83b7\u53d6PostgreSQL\u5bf9\u8c61\u7684DDL\u8bed\u53e5\uff1f\u5728Oracle\u6570\u636e\u5e93\u4e2d\u6211\u4eec\u53ef\u4ee5\u4f7f\u7528dbmsmetadata.getddl\u51fd\u6570\u6765\u5904\u7406\uff0c\u90a3\u4e48\u5982\u4f55\u5728 PG\u4e2d\u5b9e\u73b0\u5b83\u5462\uff1f",source:"@site/middleware/pgsql/4-Parse-Pgsql-DDL.md",sourceDirName:"pgsql",slug:"/pgsql/Parse-Pgsql-DDL",permalink:"/light-docusaurus/middleware/pgsql/Parse-Pgsql-DDL",draft:!1,unlisted:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/middleware/pgsql/4-Parse-Pgsql-DDL.md",tags:[],version:"current",lastUpdatedBy:"Lorchr",lastUpdatedAt:1714193875e3,sidebarPosition:4,frontMatter:{},sidebar:"middleware",previous:{title:"Pgsql-DeadLock",permalink:"/light-docusaurus/middleware/pgsql/Pgsql-DeadLock"},next:{title:"Pgsql-Cluster",permalink:"/light-docusaurus/middleware/pgsql/Pgsql-Cluster"}},c={},o=[{value:"1. \u4f7f\u7528pg_dump\u6765\u83b7\u53d6ddl",id:"1-\u4f7f\u7528pg_dump\u6765\u83b7\u53d6ddl",level:2},{value:"2. \u4f7f\u7528\u7cfb\u7edf\u51fd\u6570",id:"2-\u4f7f\u7528\u7cfb\u7edf\u51fd\u6570",level:2},{value:"3. \u4f7f\u7528pgddl\u63d2\u4ef6",id:"3-\u4f7f\u7528pgddl\u63d2\u4ef6",level:2},{value:"4. \u4f7f\u7528sql\u67e5\u8be2",id:"4-\u4f7f\u7528sql\u67e5\u8be2",level:2},{value:"\u53c2\u8003\u94fe\u63a5",id:"\u53c2\u8003\u94fe\u63a5",level:2}];function p(e){const n={a:"a",code:"code",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",ul:"ul",...(0,l.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(n.p,{children:["\u4eca\u5929\u53c8\u9047\u5230\u4e86\u4e00\u4e2a\u95ee\u9898\uff0c\u5982\u4f55\u83b7\u53d6PostgreSQL\u5bf9\u8c61\u7684DDL\u8bed\u53e5\uff1f\u5728Oracle\u6570\u636e\u5e93\u4e2d\u6211\u4eec\u53ef\u4ee5\u4f7f\u7528",(0,a.jsx)(n.code,{children:"dbms_metadata.get_ddl"}),"\u51fd\u6570\u6765\u5904\u7406\uff0c\u90a3\u4e48\u5982\u4f55\u5728 PG\u4e2d\u5b9e\u73b0\u5b83\u5462\uff1f"]}),"\n",(0,a.jsx)(n.p,{children:"\u83b7\u53d6DDL\u7684\u4e00\u4e9b\u65b9\u6cd5"}),"\n",(0,a.jsx)(n.h2,{id:"1-\u4f7f\u7528pg_dump\u6765\u83b7\u53d6ddl",children:"1. \u4f7f\u7528pg_dump\u6765\u83b7\u53d6ddl"}),"\n",(0,a.jsx)(n.p,{children:"\u4f7f\u7528pg_dump\u83b7\u53d6ddl\u3002\u8fd9\u4e2a\u65b9\u6cd5\u6700\u7b80\u5355\u3002"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-shell",children:'-s, --schema-only            dump only the schema, no data\n-t, --table=PATTERN          dump the specified table(s) only\n\n[postgres@centos8 ~]$ pg_dump -U postgres -h 192.168.56.119 -d postgres -s -t jobs | egrep -v "^--|^$|^SET"  \n'})}),"\n",(0,a.jsx)(n.p,{children:"\u5982\u4e0b\u56fe\u6240\u793a\uff1a\u53ef\u4ee5\u5e2e\u52a9\u6211\u4eec\u663e\u793atable\u7684ddl\uff0c\u6743\u9650\uff0c\u6ce8\u91ca\uff0c\u7d22\u5f15\uff0c\u7ea6\u675f\u4ee5\u53ca\u89e6\u53d1\u5668\u3002"}),"\n",(0,a.jsx)(n.p,{children:"\u5b9e\u9645\u4e0apg_dump\u547d\u4ee4\u884c\u8fd8\u4e0d\u9519\uff0c\u4f46\u9700\u8981\u8f93\u5165\u7684\u5185\u5bb9\u592a\u591a\u4e86\u3002\u53ef\u8003\u8651\u4f7f\u7528PL/Python\u5c06\u903b\u8f91\u5c01\u88c5\u8d77\u6765\uff0c\u6211\u4eec\u5148\u5c1d\u8bd5\u5728\u64cd\u4f5c\u7cfb\u7edf\u4e0a\u4f7f\u7528python\u811a\u672c\u8c03\u7528pg_dump\u3002"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-py",children:'import subprocess\nimport re\np_output = subprocess.check_output(["pg_dump", "\u2013-schema-only", "--dbname=postgres", "\u2013-table=jobs", "--username=postgres"],shell=True)\nregex_pat=r\'(^CREATE TABLE.+?\\);$)\'\nmatches=re.findall(regex_pat, p_output.decode("utf-8"),re.DOTALL|re.MULTILINE)\nddl = matches[0]\nprint(ddl)\n'})}),"\n",(0,a.jsx)(n.p,{children:"\u4e0b\u9762\u662f\u6211\u7528python\u7f16\u5199\u7684\u811a\u672c\uff0c\u4f7f\u7528\u7684\u4e3b\u8981\u662fsubprocess\u6a21\u5757\u7684check_output\u8c03\u7528pg_dump\u547d\u4ee4\u3002\u63a5\u7740\u5c06\u8fd4\u56de\u7684\u5b57\u7b26\u4e32\u4e0e\u6b63\u5219\u8868\u8fbe\u5f0f\u5339\u914d\uff0c\u63d0\u53d6\u521b\u5efa\u8868\u7684\u8bed\u53e5\u3002"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-shell",children:"[postgres@centos8 ~]$ python3 a1.py\nCREATE TABLE public.countries (\n    country_id character(2) NOT NULL,\n    country_name character varying(40),\n    region_id bigint\n);\n"})}),"\n",(0,a.jsx)(n.p,{children:"\u76ee\u524d\u8fd9\u4e2apython\u811a\u672c\u662f\u5199\u6b7b\u7684\uff0c\u6d4b\u8bd5\u529f\u80fd\u53ef\u7528\u3002\u63a5\u4e0b\u6765\u8fd8\u9700\u8981\u5728postgresql\u4e2d\u5b89\u88c5\u63d2\u4ef6plpython3u(python3\u7248\u672c)\uff0c\u521b\u5efapython\u8bed\u6cd5\u7684\u51fd\u6570\u3002"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-sql",children:'postgres=# CREATE EXTENSION IF NOT EXISTS plpython3u ;\nCREATE EXTENSION\n\nCREATE OR REPLACE FUNCTION gel_table_ddl(p_schema VARCHAR,p_database_name VARCHAR,p_table_name VARCHAR)\nRETURNS VARCHAR\nAS $$\nimport subprocess\nimport re\np_output = subprocess.check_output(["pg_dump", "\u2013-schema-only", "--dbname="+p_database_name, "\u2013-table="+p_table_name, "--username="+p_schema],shell=True)\nregex_pat=r\'(^CREATE TABLE.+?\\);$)\'\nmatches=re.findall(regex_pat, p_output.decode("utf-8"),re.DOTALL|re.MULTILINE)\nddl = matches[0]\nreturn ddl\n$$ LANGUAGE plpython3u SECURITY DEFINER;\n'})}),"\n",(0,a.jsx)(n.p,{children:"\u6267\u884c\u7ed3\u679c\u5982\u56fe\u6240\u793a"}),"\n",(0,a.jsx)(n.p,{children:"\u6709\u4e00\u70b9\u8981\u6ce8\u610f\uff0c\u5728\u6211\u7684\u51fd\u6570\u4e2d\u6ca1\u6709\u63d0\u5230\u5bc6\u7801\uff0c\u5bc6\u7801\u5efa\u8bae\u914d\u7f6e. pgpass\u6765\u5b9e\u73b0\u514d\u5bc6\u3002"}),"\n",(0,a.jsx)(n.h2,{id:"2-\u4f7f\u7528\u7cfb\u7edf\u51fd\u6570",children:"2. \u4f7f\u7528\u7cfb\u7edf\u51fd\u6570"}),"\n",(0,a.jsx)(n.p,{children:"PostgreSQL\u81ea\u5e26\u4e86\u4e00\u4e9b\u51fd\u6570\u53ef\u4ee5\u67e5\u770b DDL\u7684\u5b9a\u4e49\uff0c\u4f8b\u5982\uff1a"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsx)(n.li,{children:"pg_get_viewdef"}),"\n",(0,a.jsx)(n.li,{children:"pg_get_constraintdef"}),"\n",(0,a.jsx)(n.li,{children:"pg_get_functiondef"}),"\n",(0,a.jsx)(n.li,{children:"pg_get_indexdef"}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"\u4f46\u5947\u602a\u7684\u662f\u5b83\u7f3a\u5c11\u8868ddl\u5b9a\u4e49\u76f8\u5173\u51fd\u6570\u3002"}),"\n",(0,a.jsxs)(n.p,{children:["\u8be6\u7ec6\u4fe1\u606f\u53ef\u4ee5\u53c2\u8003\uff1a",(0,a.jsx)(n.a,{href:"https://www.postgresql.org/docs/current/functions-info.html",children:"https://www.postgresql.org/docs/current/functions-info.html"})]}),"\n",(0,a.jsx)(n.p,{children:"\u4e0d\u8fc7\u8fd9\u95ee\u9898\u4e5f\u96be\u4e0d\u5012\u4eba\u3002\u5728stackoverflow\n\u53d1\u73b0\u4e00\u4e2a\u811a\u672c\uff0c\u975e\u5e38\u597d\u7528\u3002"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-sql",children:"CREATE OR REPLACE FUNCTION tabledef(oid) RETURNS text\nLANGUAGE sql STRICT AS $$\n/* snatched from https://github.com/filiprem/pg-tools */\nWITH attrdef AS (\n    SELECT\n        n.nspname,\n        c.relname,\n        pg_catalog.array_to_string(c.reloptions || array(select 'toast.' || x from pg_catalog.unnest(tc.reloptions) x), ', ') as relopts,\n        c.relpersistence,\n        a.attnum,\n        a.attname,\n        pg_catalog.format_type(a.atttypid, a.atttypmod) as atttype,\n        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid, true) for 128) FROM pg_catalog.pg_attrdef d\n            WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) as attdefault,\n        a.attnotnull,\n        (SELECT c.collname FROM pg_catalog.pg_collation c, pg_catalog.pg_type t\n            WHERE c.oid = a.attcollation AND t.oid = a.atttypid AND a.attcollation <> t.typcollation) as attcollation,\n        a.attidentity,\n        a.attgenerated\n    FROM pg_catalog.pg_attribute a\n    JOIN pg_catalog.pg_class c ON a.attrelid = c.oid\n    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid\n    LEFT JOIN pg_catalog.pg_class tc ON (c.reltoastrelid = tc.oid)\n    WHERE a.attrelid = $1\n        AND a.attnum > 0\n        AND NOT a.attisdropped\n    ORDER BY a.attnum\n),\ncoldef AS (\n    SELECT\n        attrdef.nspname,\n        attrdef.relname,\n        attrdef.relopts,\n        attrdef.relpersistence,\n        pg_catalog.format(\n            '%I %s%s%s%s%s',\n            attrdef.attname,\n            attrdef.atttype,\n            case when attrdef.attcollation is null then '' else pg_catalog.format(' COLLATE %I', attrdef.attcollation) end,\n            case when attrdef.attnotnull then ' NOT NULL' else '' end,\n            case when attrdef.attdefault is null then ''\n                else case when attrdef.attgenerated = 's' then pg_catalog.format(' GENERATED ALWAYS AS (%s) STORED', attrdef.attdefault)\n                    when attrdef.attgenerated <> '' then ' GENERATED AS NOT_IMPLEMENTED'\n                    else pg_catalog.format(' DEFAULT %s', attrdef.attdefault)\n                end\n            end,\n            case when attrdef.attidentity<>'' then pg_catalog.format(' GENERATED %s AS IDENTITY',\n                    case attrdef.attidentity when 'd' then 'BY DEFAULT' when 'a' then 'ALWAYS' else 'NOT_IMPLEMENTED' end)\n                else '' end\n        ) as col_create_sql\n    FROM attrdef\n    ORDER BY attrdef.attnum\n),\ntabdef AS (\n    SELECT\n        coldef.nspname,\n        coldef.relname,\n        coldef.relopts,\n        coldef.relpersistence,\n        string_agg(coldef.col_create_sql, E',\\n    ') as cols_create_sql\n    FROM coldef\n    GROUP BY\n        coldef.nspname, coldef.relname, coldef.relopts, coldef.relpersistence\n)\nSELECT\n    format(\n        'CREATE%s TABLE %I.%I%s%s%s;',\n        case tabdef.relpersistence when 't' then ' TEMP' when 'u' then ' UNLOGGED' else '' end,\n        tabdef.nspname,\n        tabdef.relname,\n        coalesce(\n            (SELECT format(E'\\n    PARTITION OF %I.%I %s\\n', pn.nspname, pc.relname,\n                pg_get_expr(c.relpartbound, c.oid))\n                FROM pg_class c JOIN pg_inherits i ON c.oid = i.inhrelid\n                JOIN pg_class pc ON pc.oid = i.inhparent\n                JOIN pg_namespace pn ON pn.oid = pc.relnamespace\n                WHERE c.oid = $1),\n            format(E' (\\n    %s\\n)', tabdef.cols_create_sql)\n        ),\n        case when tabdef.relopts <> '' then format(' WITH (%s)', tabdef.relopts) else '' end,\n        coalesce(E'\\nPARTITION BY '||pg_get_partkeydef($1), '')\n    ) as table_create_sql\nFROM tabdef\n$$;\n"})}),"\n",(0,a.jsx)(n.p,{children:"\u6267\u884c\u51fd\u6570\u7ed3\u679c\u5982\u56fe\u6240\u793a\uff1a"}),"\n",(0,a.jsxs)(n.p,{children:["\u82e5\u8981\u83b7\u53d6\u7d22\u5f15\uff0c\u76f4\u63a5\u4f7f\u7528\u7cfb\u7edf\u81ea\u5e26\u7684",(0,a.jsx)(n.code,{children:"pg_get_indexdef"}),"\u51fd\u6570\u3002"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-sql",children:"SELECT pg_get_indexdef('jobs_pkey'::regclass);\n"})}),"\n",(0,a.jsx)(n.h2,{id:"3-\u4f7f\u7528pgddl\u63d2\u4ef6",children:"3. \u4f7f\u7528pgddl\u63d2\u4ef6"}),"\n",(0,a.jsx)(n.p,{children:"\u6700\u540e\u6765\u4ecb\u7ecd\u7684\u662f\u4e00\u6b3e\u63d2\u4ef6\uff0c\u77e5\u9053\u548c\u4f7f\u7528\u5b83\u7684\u4eba\u4e0d\u591a\uff0c\u770b\u4e86\u4e00\u4e0b\u4f5c\u8005\u5199\u7684 roadmap\uff0c\u8fd8\u662f\u5f88\u6709\u52a8\u529b\u7684\u3002\u6211\u6d4b\u8bd5\u4e86\u4e00\u4e0b\uff0c\u5728PostgreSQL 13\u7248\u672c\u4e0a\u4e5f\u53ef\u4ee5\u4f7f\u7528\uff0c\u5c31\u5217\u51fa\u6765\u4f5c\u4e3a\u4e00\u79cd\u9009\u62e9\u3002"}),"\n",(0,a.jsx)(n.p,{children:"\u8981\u4f7f\u7528root\u7528\u6237\u5b89\u88c5\u6b64\u63d2\u4ef6\uff0c\u5e76\u5728\u5b89\u88c5\u65f6\u8bbe\u7f6e\u597d\u73af\u5883\u53d8\u91cf\u3002"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-shell",children:"export PGHOME=/data/postgresql/pgsql\nexport PGDATA=/data/postgresql/pgdata\n\n[root@centos8 pgddl]# make\n[root@centos8 pgddl]# make install\n/usr/bin/mkdir -p '/data/postgresql/pgsql/share/extension'\n/usr/bin/mkdir -p '/data/postgresql/pgsql/share/extension'\n/usr/bin/install -c -m 644 .//ddlx.control '/data/postgresql/pgsql/share/extension/'\n/usr/bin/install -c -m 644  ddlx--0.17.sql '/data/postgresql/pgsql/share/extension/'\n"})}),"\n",(0,a.jsx)(n.p,{children:"\u5728\u5b8c\u6210\u5b89\u88c5\u4e4b\u540e\uff0c\u8fdb\u5165PostgreSQL\u6570\u636e\u5e93\u521b\u5efa\u6269\u5c55\u3002"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-shell",children:"postgres=# CREATE EXTENSION ddlx;\nCREATE EXTENSION\n"})}),"\n",(0,a.jsx)(n.p,{children:"\u6267\u884c\u7ed3\u679c\u5982\u56fe\u6240\u793a\uff0c\u50cfpg_dump\u4e00\u6837\uff0c\u60a8\u4e5f\u53ef\u4ee5\u663e\u793a\u8fd9\u4e2a\u8868\u4e2d\u6240\u6709\u7684\u76f8\u5173\u4fe1\u606f\u3002"}),"\n",(0,a.jsx)(n.p,{children:"\u5982\u679c\u60f3\u8981\u5355\u72ec\u663e\u793a\u5176\u4ed6\u7684\u5bf9\u8c61\uff0c\u53ea\u9700\u8f93\u5165\u4e00\u4e2a\u540d\u5b57\uff0c\u5b83\u4f1a\u81ea\u52a8\u5c06\u8be5\u540d\u5b57\u7684ddl\u5168\u90e8\u5217\u51fa\u6765\u3002"}),"\n",(0,a.jsx)(n.h2,{id:"4-\u4f7f\u7528sql\u67e5\u8be2",children:"4. \u4f7f\u7528sql\u67e5\u8be2"}),"\n",(0,a.jsx)(n.p,{children:"PostgreSQL\u4e2d\u6ca1\u6709\u50cforacle\u4e00\u6837\u83b7\u53d6\u8868ddl\u7684\u51fd\u6570\uff0c\u4e0b\u9762\u63d0\u4f9b\u4e24\u79cd\u65b9\u5f0f\u83b7\u53d6\u8868\u7684ddl\u8bed\u53e5\u3002\u529f\u80fd\u6bd4\u8f83\u7b80\u5355\u4ec5\u5b9e\u73b0\u666e\u901a\u8868\u7684ddl\uff0c\u5982\u9700\u5176\u4ed6\u7c7b\u578b\u7684\u8868\u6216\u5bf9\u8c61\uff0c\u8fd8\u9700\u8981\u8fdb\u884c\u4fee\u6539\u3002"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-sql",children:"SELECT\n'CREATE TABLE ' || table_name || ' (\\n' ||\narray_to_string(\n    array_agg(\n        column_name || ' ' || data_type ||\n        CASE\n            WHEN is_nullable = 'NO' THEN ' NOT NULL'\n            ELSE ''\n        END ||\n        CASE\n            WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default\n            ELSE ''\n        END\n    ),\n    ',\\n'\n) || E'\\n);'\nFROM information_schema.columns\nWHERE table_schema = 'public' -- your schema name\nAND table_name = 'your_table_name' -- your table name\nGROUP BY table_name;\n"})}),"\n",(0,a.jsx)(n.p,{children:"\u76f4\u63a5\u4f7f\u7528SQL\u67e5\u8be2\uff0c\u8bed\u53e5\u5982\u4e0b"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-sql",children:"with t as (\nselect schema_name,table_name,string_agg(column_name||' '||column_type||' '||column_default_value ||' '||column_not_null||chr(10),',') as aaa from(\nSELECT \n      b.nspname as schema_name,\n      b.relname as table_name,\n      a.attname as column_name,\n      pg_catalog.format_type(a.atttypid, a.atttypmod) as column_type,\n      CASE WHEN \n          (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)\n           FROM pg_catalog.pg_attrdef d\n           WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) IS NOT NULL THEN\n          'DEFAULT '|| (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)\n                        FROM pg_catalog.pg_attrdef d\n                        WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef)\n      ELSE\n          ''\n      END as column_default_value,\n      CASE WHEN a.attnotnull = true THEN \n          'NOT NULL'\n      ELSE\n          'NULL'\n      END as column_not_null,\n      a.attnum as attnum,\n      e.max_attnum as max_attnum\n  FROM \n      pg_catalog.pg_attribute a\n      INNER JOIN \n       (SELECT c.oid,\n          n.nspname,\n          c.relname\n        FROM pg_catalog.pg_class c\n             LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace\n        WHERE c.relname ~ ('^('||'\u4fee\u6539\u4e3a\u8981\u83b7\u53d6\u7684\u8868\u540d'||')$')\n          AND pg_catalog.pg_table_is_visible(c.oid)\n        ORDER BY 2, 3) b\n      ON a.attrelid = b.oid\n      INNER JOIN \n       (SELECT \n            a.attrelid,\n            max(a.attnum) as max_attnum\n        FROM pg_catalog.pg_attribute a\n        WHERE a.attnum > 0 \n          AND NOT a.attisdropped\n        GROUP BY a.attrelid) e\n      ON a.attrelid=e.attrelid\n  WHERE a.attnum > 0 \n    AND NOT a.attisdropped\n  ORDER BY a.attnum) as f\nGROUP by schema_name,table_name)\nselect 'create table '||schema_name||'.'||table_name||' ('||aaa||')' from t;\n"})}),"\n",(0,a.jsx)(n.p,{children:"\u6548\u679c"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-sql",children:"                 ?column?                        \n-------------------------------------------------------\n create table public.emp (empno numeric(4,0)  NOT NULL+\n ,ename character varying  NULL                       +\n ,job character varying  NULL                         +\n ,mgr numeric(4,0)  NULL                              +\n ,hiredate date  NULL                                 +\n ,sal numeric(7,2)  NULL                              +\n ,comm numeric(7,2)  NULL                             +\n ,deptno numeric(2,0)  NULL                           +\n )\n(1 row)\n"})}),"\n",(0,a.jsx)(n.p,{children:"\u6539\u5199\u4e3a\u5b58\u50a8\u8fc7\u7a0b"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-sql",children:"create or replace function get_tab_ddl(tab_name varchar)\nreturns text as \n$$\ndeclare \n    --\u5b9a\u4e49\u53d8\u91cf\n    tab_ddl text;\n    curs refcursor;\n    tmp_col record;\n    tab_info record;\nbegin  \n    --\u83b7\u53d6\u8868\u7684pid\u3001schema\u4fe1\u606f\n    open curs for SELECT c.oid,n.nspname,c.relname FROM pg_catalog.pg_class c\n    LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace\n    WHERE c.relname ~ ('^('||tab_name||')$')AND pg_catalog.pg_table_is_visible(c.oid) ORDER BY 2,3;\n    fetch curs into tmp_col;\n    --\u5224\u65ad\u662f\u5426\u5b58\u5728\u8be5\u8868\n    if tmp_col.oid is null then\n        return 'Table \"'||tab_name||'\" was not queried';\n    end if;\n    --\u5982\u8868\u5b58\u5728\uff0c\u83b7\u53d6\u8868\u7684\u5217\u4fe1\u606f\n    FOR tab_info IN \n        SELECT \n            a.attname as col_name,\n            pg_catalog.format_type(a.atttypid, a.atttypmod) as col_type,\n            CASE WHEN \n                (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)\n                 FROM pg_catalog.pg_attrdef d\n                 WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef) IS NOT NULL THEN\n                'DEFAULT '|| (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)\n                              FROM pg_catalog.pg_attrdef d\n                              WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum AND a.atthasdef)\n            ELSE\n                ''\n            END as col_default_value,\n            CASE WHEN a.attnotnull = true THEN \n                'NOT NULL'\n            ELSE\n                'NULL'\n            END as col_not_null,\n            a.attnum as attnum,\n            e.max_attnum as max_attnum\n        FROM \n            pg_catalog.pg_attribute a\n            INNER JOIN \n             (SELECT \n                  a.attrelid,\n                  max(a.attnum) as max_attnum\n              FROM pg_catalog.pg_attribute a\n              WHERE a.attnum > 0 \n                AND NOT a.attisdropped\n              GROUP BY a.attrelid) e\n            ON a.attrelid=e.attrelid\n        WHERE a.attnum > 0 \n          AND a.attrelid=tmp_col.oid\n          AND NOT a.attisdropped\n        ORDER BY a.attnum\n    --\u62fc\u63a5\u4e3addl\u8bed\u53e5\n    LOOP\n        IF tab_info.attnum = 1 THEN\n            tab_ddl:='CREATE TABLE '||tmp_col.nspname||'.'||tmp_col.relname||' (';\n        ELSE\n            tab_ddl:=tab_ddl||',';\n        END IF;\n\n        IF tab_info.attnum <= tab_info.max_attnum THEN\n            tab_ddl:=tab_ddl||chr(10)||'    '||tab_info.col_name||' '||tab_info.col_type||' '||tab_info.col_default_value||' '||tab_info.col_not_null;\n        END IF;\n    END LOOP;\n       tab_ddl:=tab_ddl||');';\n    --\u8f93\u51fa\u7ed3\u679c\n    RETURN tab_ddl;\nend;\n$$ language plpgsql;\n"})}),"\n",(0,a.jsx)(n.p,{children:"\u6548\u679c"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-sql",children:"highgo=# select get_tab_ddl('emp');\n            get_tab_ddl             \n------------------------------------\n CREATE TABLE public.emp (         +\n     empno numeric(4,0)  NOT NULL, +\n     ename character varying  NULL,+\n     job character varying  NULL,  +\n     mgr numeric(4,0)  NULL,       +\n     hiredate date  NULL,          +\n     sal numeric(7,2)  NULL,       +\n     comm numeric(7,2)  NULL,      +\n     deptno numeric(2,0)  NULL);\n(1 row)\n"})}),"\n",(0,a.jsx)(n.h2,{id:"\u53c2\u8003\u94fe\u63a5",children:"\u53c2\u8003\u94fe\u63a5"}),"\n",(0,a.jsxs)(n.ol,{children:["\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"https://stackoverflow.com/questions/1846542/postgresql-get-table-definition-pg-get-tabledef",children:"https://stackoverflow.com/questions/1846542/postgresql-get-table-definition-pg-get-tabledef"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"https://github.com/lacanoid/pgddl",children:"https://github.com/lacanoid/pgddl"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"https://proboscid.wordpress.com/2013/09/06/extracting-create-table-ddl-from-postgresql/",children:"https://proboscid.wordpress.com/2013/09/06/extracting-create-table-ddl-from-postgresql/"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"https://www.postgresql.org/docs/current/functions-info.html",children:"https://www.postgresql.org/docs/current/functions-info.html"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"https://www.modb.pro/db/52345",children:"https://www.modb.pro/db/52345"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.a,{href:"https://www.modb.pro/db/48196",children:"https://www.modb.pro/db/48196"})}),"\n"]})]})}function i(e={}){const{wrapper:n}={...(0,l.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(p,{...e})}):p(e)}},28453:(e,n,t)=>{t.d(n,{R:()=>d,x:()=>r});var a=t(96540);const l={},s=a.createContext(l);function d(e){const n=a.useContext(s);return a.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:d(e.components),a.createElement(s.Provider,{value:n},e.children)}}}]);