"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[9624],{3905:(e,t,n)=>{n.d(t,{Zo:()=>u,kt:()=>d});var r=n(7294);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=r.createContext({}),l=function(e){var t=r.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},u=function(e){var t=l(e.components);return r.createElement(p.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},_=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,p=e.parentName,u=i(e,["components","mdxType","originalType","parentName"]),c=l(n),_=a,d=c["".concat(p,".").concat(_)]||c[_]||m[_]||o;return n?r.createElement(d,s(s({ref:t},u),{},{components:n})):r.createElement(d,s({ref:t},u))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,s=new Array(o);s[0]=_;var i={};for(var p in t)hasOwnProperty.call(t,p)&&(i[p]=t[p]);i.originalType=e,i[c]="string"==typeof e?e:a,s[1]=i;for(var l=2;l<o;l++)s[l]=n[l];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}_.displayName="MDXCreateElement"},2404:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>p,contentTitle:()=>s,default:()=>m,frontMatter:()=>o,metadata:()=>i,toc:()=>l});var r=n(7462),a=(n(7294),n(3905));const o={},s=void 0,i={unversionedId:"nginx/Nginx-log",id:"nginx/Nginx-log",title:"Nginx-log",description:"- \u8fd9\u5957 Nginx \u65e5\u5fd7\u89e3\u51b3\u65b9\u6848\uff0c\u771f\u9999\uff01",source:"@site/middleware/nginx/Nginx-log.md",sourceDirName:"nginx",slug:"/nginx/Nginx-log",permalink:"/light-docusaurus/middleware/nginx/Nginx-log",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/middleware/nginx/Nginx-log.md",tags:[],version:"current",lastUpdatedBy:"liuhui",lastUpdatedAt:1697531923,formattedLastUpdatedAt:"2023\u5e7410\u670817\u65e5",frontMatter:{},sidebar:"middleware",previous:{title:"Nginx-In-Docker",permalink:"/light-docusaurus/middleware/nginx/Nginx-In-Docker"},next:{title:"Ningx",permalink:"/light-docusaurus/middleware/nginx/Ningx"}},p={},l=[],u={toc:l},c="wrapper";function m(e){let{components:t,...n}=e;return(0,a.kt)(c,(0,r.Z)({},u,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://mp.weixin.qq.com/s/V0mjYmB2Dg2wBnlp6kEZlQ"},"\u8fd9\u5957 Nginx \u65e5\u5fd7\u89e3\u51b3\u65b9\u6848\uff0c\u771f\u9999\uff01"))),(0,a.kt)("p",null,"\u6700\u8fd1\u5ba2\u6237\u6709\u4e2a\u65b0\u9700\u6c42\uff0c\u5c31\u662f\u60f3\u67e5\u770b\u7f51\u7ad9\u7684\u8bbf\u95ee\u60c5\u51b5\uff0c\u7531\u4e8e\u7f51\u7ad9\u6ca1\u6709\u505agoogle\u7684\u7edf\u8ba1\u548c\u767e\u5ea6\u7684\u7edf\u8ba1\uff0c\u6240\u4ee5\u8bbf\u95ee\u60c5\u51b5\uff0c\u53ea\u80fd\u901a\u8fc7\u65e5\u5fd7\u67e5\u770b\uff0c\u901a\u8fc7\u811a\u672c\u7684\u5f62\u5f0f\u7ed9\u5ba2\u6237\u5bfc\u51fa\u4e5f\u4e0d\u592a\u5b9e\u9645\uff0c\u7ed9\u5ba2\u6237\u5199\u4e2a\u7b80\u5355\u7684\u9875\u9762\uff0c\u54b1\u4e5f\u505a\u4e0d\u5230"),(0,a.kt)("p",null,"\u6210\u719f\u7684\u65e5\u5fd7\u89e3\u51b3\u65b9\u6848\uff0c\u90a3\u5c31\u662fELK\uff0c\u8fd8\u6709\u73b0\u5728\u6bd4\u8f83\u706b\u7684Loki\uff0c\uff08\u5f53\u7136\u8fd8\u6709\u5f88\u591a\u5176\u4ed6\u89e3\u51b3\u65b9\u6848\uff0c\u6bd4\u5982Splunk\u3001Datadog\u7b49\uff09\uff0c\u90a3\u6211\u4eec\u8fd9\u4e2a\u5c0f\u7f51\u7ad9\uff0c\u5c0f\u4f53\u91cf\uff0c\u5fc5\u7136\u662f\u9009\u62e9Loki\u6765\u505a"),(0,a.kt)("p",null,"\u6240\u4ee5\u8fd9\u6b21\u5c31\u91c7\u7528 ",(0,a.kt)("inlineCode",{parentName:"p"},"Nginx")," + ",(0,a.kt)("inlineCode",{parentName:"p"},"Promtail")," + ",(0,a.kt)("inlineCode",{parentName:"p"},"Loki")," + ",(0,a.kt)("inlineCode",{parentName:"p"},"Grafana")," \u6765\u505a\u4e00\u4e2a\u7b80\u5355\u7684Nginx\u65e5\u5fd7\u5c55\u793a"),(0,a.kt)("p",null,"\u56fe\u7247\nNginx\u7684\u5b89\u88c5\u4e0d\u591a\u8bf4\uff0cPromtail\u548cLoki\u90fd\u9009\u7528\u4e8c\u8fdb\u5236\u7684\u65b9\u5f0f\u8fdb\u884c\u5b89\u88c5\uff0c\u76f4\u63a5\u4e0b\u8f7d\u5bf9\u5e94\u7248\u672c\u7684\u4e8c\u8fdb\u5236\u6587\u4ef6\uff0c\u89e3\u538b\u540e\u6307\u5b9a\u914d\u7f6e\u6587\u4ef6\u542f\u52a8\u5373\u53ef"),(0,a.kt)("p",null,"\u5176\u4e2dpromtail\u914d\u7f6e\u6587\u4ef6\u5982\u4e0b\u914d\u7f6e\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-yaml"},"server:\n  http_listen_port: 9080\n  grpc_listen_port: 0\n\npositions:\n  filename: /tmp/positions.yaml\n\nclients:\n  - url: http://localhost:3100/loki/api/v1/push\n\nscrape_configs:\n- job_name: nginx\n  pipeline_stages:\n  - replace:\n      expression: '(?:[0-9]{1,3}\\.){3}([0-9]{1,3})'\n      replace: '***'\n  static_configs:\n  - targets:\n      - localhost\n    labels:\n      job: nginx_access_log\n      host: expatsxxxxs\n      agent: promtail\n      __path__: /var/log/nginx/expatshxxxxs.access.log\n")),(0,a.kt)("p",null,"\u65e5\u5fd7\u6536\u96c6\u5de5\u4f5c\u5b8c\u6210\u540e\uff0c\u5728Nginx\u4e2d\uff0c\u9700\u8981\u4fee\u6539\u65e5\u5fd7\u683c\u5f0f\uff0c\u4fee\u6539Nginx\u7684\u65e5\u5fd7\u683c\u5f0f\u4e3aJson\u683c\u5f0f\uff0c\u914d\u7f6e\u5982\u4e0b\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'log_format json_analytics escape=json \'{\'\n  \'"msec": "$msec", \' # request unixtime in seconds with a milliseconds resolution\n  \'"connection": "$connection", \' # connection serial number\n  \'"connection_requests": "$connection_requests", \' # number of requests made in connection\n  \'"pid": "$pid", \' # process pid\n  \'"request_id": "$request_id", \' # the unique request id\n  \'"request_length": "$request_length", \' # request length (including headers and body)\n  \'"remote_addr": "$remote_addr", \' # client IP\n  \'"remote_user": "$remote_user", \' # client HTTP username\n  \'"remote_port": "$remote_port", \' # client port\n  \'"time_local": "$time_local", \'\n  \'"time_iso8601": "$time_iso8601", \' # local time in the ISO 8601 standard format\n  \'"request": "$request", \' # full path no arguments if the request\n  \'"request_uri": "$request_uri", \' # full path and arguments if the request\n  \'"args": "$args", \' # args\n  \'"status": "$status", \' # response status code\n  \'"body_bytes_sent": "$body_bytes_sent", \' # the number of body bytes exclude headers sent to a client\n  \'"bytes_sent": "$bytes_sent", \' # the number of bytes sent to a client\n  \'"http_referer": "$http_referer", \' # HTTP referer\n  \'"http_user_agent": "$http_user_agent", \' # user agent\n  \'"http_x_forwarded_for": "$http_x_forwarded_for", \' # http_x_forwarded_for\n  \'"http_host": "$http_host", \' # the request Host: header\n  \'"server_name": "$server_name", \' # the name of the vhost serving the request\n  \'"request_time": "$request_time", \' # request processing time in seconds with msec resolution\n  \'"upstream": "$upstream_addr", \' # upstream backend server for proxied requests\n  \'"upstream_connect_time": "$upstream_connect_time", \' # upstream handshake time incl. TLS\n  \'"upstream_header_time": "$upstream_header_time", \' # time spent receiving upstream headers\n  \'"upstream_response_time": "$upstream_response_time", \' # time spend receiving upstream body\n  \'"upstream_response_length": "$upstream_response_length", \' # upstream response length\n  \'"upstream_cache_status": "$upstream_cache_status", \' # cache HIT/MISS where applicable\n  \'"ssl_protocol": "$ssl_protocol", \' # TLS protocol\n  \'"ssl_cipher": "$ssl_cipher", \' # TLS cipher\n  \'"scheme": "$scheme", \' # http or https\n  \'"request_method": "$request_method", \' # request method\n  \'"server_protocol": "$server_protocol", \' # request protocol, like HTTP/1.1 or HTTP/2.0\n  \'"pipe": "$pipe", \' # "p" if request was pipelined, "." otherwise\n  \'"gzip_ratio": "$gzip_ratio", \'\n  \'"http_cf_ray": "$http_cf_ray",\'\n  \'"geoip_country_code": "$geoip_country_code"\'\n  \'}\';\n')),(0,a.kt)("p",null,"\u914d\u7f6e\u6587\u4ef6\u4e2d\uff0c\u9700\u8981\u6ce8\u610f\u7684\u662f",(0,a.kt)("inlineCode",{parentName:"p"},"geoip"),"\u7684\u914d\u7f6e\uff0c\u9700\u8981\u5728",(0,a.kt)("inlineCode",{parentName:"p"},"nginx"),"\u4e2d\u6dfb\u52a0",(0,a.kt)("inlineCode",{parentName:"p"},"geoip"),"\u6a21\u5757"),(0,a.kt)("p",null,"\u9996\u5148\u901a\u8fc7yum\u5b89\u88c5geoip\u53calib\u5e93"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"yum -y install GeoIP GeoIP-data GeoIP-devel\n")),(0,a.kt)("p",null,"\u4e4b\u540e\uff0c\u91cd\u65b0\u7f16\u8bd1Nginx\uff0c\u901a\u8fc7",(0,a.kt)("inlineCode",{parentName:"p"},"--with-http_geoip_module"),"\u6dfb\u52a0",(0,a.kt)("inlineCode",{parentName:"p"},"nginx"),"\u7684",(0,a.kt)("inlineCode",{parentName:"p"},"geoip"),"\u6a21\u5757"),(0,a.kt)("p",null,"\u7f16\u8bd1\u5b8c\u6210\u540e\uff0c\u5728objs\u76ee\u5f55\u4e0b\u751f\u6210\u65b0\u7684Nginx\u53ef\u6267\u884c\u6587\u4ef6\uff0c\u66ff\u6362\u539f\u5148\u7684\uff0c\u901a\u8fc7kill -USR2\u4fe1\u53f7\uff0c\u5347\u7ea7Nginx"),(0,a.kt)("p",null,"\u6b64\u65f6\u914d\u7f6e\u7684log_format\u4e0d\u4f1a\u518d\u62a5\u9519geoip\u6307\u4ee4\u627e\u4e0d\u5230\uff0c\u914d\u7f6e\u5b8c\u6210\u540e\uff0c\u914d\u7f6e\u7f51\u7ad9\u7684access\u65e5\u5fd7\uff0c\u5f15\u7528\u521a\u624d\u914d\u7f6e\u7684json\u683c\u5f0f\u7684log_format"),(0,a.kt)("p",null,"\u67e5\u770b\u6b64\u65f6\u7684\u65e5\u5fd7\u683c\u5f0f"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json"},'{"msec": "1633430998.322", "connection": "4", "connection_requests": "1", "pid": "29887", "request_id": "40770fec38c2e5a68714df5f7a67283d", "request_length": "392", "remote_addr": "106.19.96.55", "remote_user": "", "remote_port": "43746", "time_local": "05/Oct/2021:18:49:58 +0800", "time_iso8601": "2021-10-05T18:49:58+08:00", "request": "GET / HTTP/2.0", "request_uri": "/", "args": "", "status": "200", "body_bytes_sent": "60949", "bytes_sent": "61222", "http_referer": "https://cn.bing.com/search?q=expat+tourism+agent+in+china&go=Search&qs=n&form=QBRE&sp=-1&pq=expat+tourism+agent+in+chi&sc=0-26&sk=&cvid=8BD2D4B79B3A4FA682571CB5BC7334D4", "http_user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1", "http_x_forwarded_for": "", "http_host": "www.expatsholidays.com", "server_name": "www.expatsholidays.com", "request_time": "0.003", "upstream": "127.0.0.1:9000", "upstream_connect_time": "0.000", "upstream_header_time": "0.002", "upstream_response_time": "0.002", "upstream_response_length": "60991", "upstream_cache_status": "", "ssl_protocol": "TLSv1.2", "ssl_cipher": "ECDHE-RSA-AES128-GCM-SHA256", "scheme": "https", "request_method": "GET", "server_protocol": "HTTP/2.0", "pipe": ".", "gzip_ratio": "", "http_cf_ray": "","geoip_country_code": ""}\n{"msec": "1633430998.709", "connection": "4", "connection_requests": "2", "pid": "29887", "request_id": "430fd53a457ea580c47e9b055da2b4d0", "request_length": "56", "remote_addr": "106.19.96.55", "remote_user": "", "remote_port": "43746", "time_local": "05/Oct/2021:18:49:58 +0800", "time_iso8601": "2021-10-05T18:49:58+08:00", "request": "GET /maps/api/js?ver=5.6.1 HTTP/2.0", "request_uri": "/maps/api/js?ver=5.6.1", "args": "ver=5.6.1", "status": "200", "body_bytes_sent": "41262", "bytes_sent": "41406", "http_referer": "https://www.expatsholidays.com/", "http_user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1", "http_x_forwarded_for": "", "http_host": "www.expatsholidays.com", "server_name": "www.expatsholidays.com", "request_time": "0.000", "upstream": "", "upstream_connect_time": "", "upstream_header_time": "", "upstream_response_time": "", "upstream_response_length": "", "upstream_cache_status": "", "ssl_protocol": "TLSv1.2", "ssl_cipher": "ECDHE-RSA-AES128-GCM-SHA256", "scheme": "https", "request_method": "GET", "server_protocol": "HTTP/2.0", "pipe": ".", "gzip_ratio": "3.06", "http_cf_ray": "","geoip_country_code": ""}\n')),(0,a.kt)("p",null,"\u5df2\u7ecf\u8f6c\u4e3aJSON\u683c\u5f0f\uff0c\u63a5\u7740\u5b89\u88c5grafana\uff0c\u6700\u5feb\u6377\u7684\u65b9\u5f0f\uff0c\u901a\u8fc7docker\u76f4\u63a5\u8d77\u4e00\u4e2a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"docker run -d -p 3000:3000 grafana/grafana\n")),(0,a.kt)("p",null,"\u542f\u52a8\u540e\uff0c\u901a\u8fc7admin/admin\u9ed8\u8ba4\u7528\u6237\u540d\u5bc6\u7801\u767b\u5f55\uff0c\u767b\u9646\u540e\u63d0\u793a\u91cd\u7f6e\u5bc6\u7801\uff0c\u4e4b\u540e\u8fdb\u5165grafana\u754c\u9762"),(0,a.kt)("p",null,"\u6211\u4eec\u76f4\u63a5\u6dfb\u52a0\u6570\u636e\u6e90loki"),(0,a.kt)("p",null,"\u56fe\u7247\n\u5148\u901a\u8fc7explore\u67e5\u8be2\uff0c\u65e5\u5fd7\u662f\u5426\u5b58\u5165loki"),(0,a.kt)("p",null,"\u56fe\u7247\n\u53ef\u4ee5\u770b\u5230\uff0c\u65e5\u5fd7\u5df2\u7ecf\u5b58\u5165loki"),(0,a.kt)("p",null,"\u63a5\u7740\u6dfb\u52a0Dashboard\uff0c\u901a\u8fc7ID\u5bfc\u5165"),(0,a.kt)("p",null,"\u56fe\u7247\n\u5bfc\u5165\u5982\u4e0b"),(0,a.kt)("p",null,"\u56fe\u7247\n\u56fe\u7247\n\u53ef\u4ee5\u770b\u5230\uff0c\u8fd9\u91cc\u5730\u56fe\u6ca1\u5c55\u793a\uff0c\u7f3a\u5c11grafana-worldmap-panel\u63d2\u4ef6\uff0c\u6211\u4eec\u88c5\u4e00\u4e0b\uff0c\u901a\u8fc7\u547d\u4ee4\u884c"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"grafana-cli plugins install grafana-worldmap-panel\n")),(0,a.kt)("p",null,"\u5b89\u88c5\u5b8c\u6210\u540e\uff0c\u91cd\u542fgrafana\uff0c\u91cd\u65b0\u67e5\u770bdashboard"),(0,a.kt)("p",null,"\u56fe\u7247\n\u5730\u56fe\u53ef\u4ee5\u5c55\u793a\uff0c\u8fd9\u91cc\u56e0\u4e3a\u5730\u56fe\u7684\u5730\u5740\u662f\u56fd\u5916\u7684\u5730\u5740\uff0c\u6240\u4ee5\u5730\u56fe\u7684\u56fe\u7247\u65e0\u6cd5\u52a0\u8f7d\uff0c\u53ef\u4ee5\u901a\u8fc7\u53cd\u4ee3\u7684\u65b9\u5f0f\u89e3\u51b3"),(0,a.kt)("p",null,"ok\uff0c\u4eca\u5929\u5185\u5bb9\u5c31\u8fd9\u4e9b\uff0c\u901a\u8fc7\u7b80\u5355\u5feb\u901f\u7684\u65b9\u5f0f\uff0c\u4e3a\u5ba2\u6237\u5448\u73b0\u7f51\u7ad9\u7684\u8be6\u7ec6\u8bbf\u95ee\u60c5\u51b5\uff0cLoki+Grafana\u662f\u7edd\u4f73\u7684\u7ec4\u5408"))}m.isMDXComponent=!0}}]);