"use strict";(self.webpackChunklight_docusaurus=self.webpackChunklight_docusaurus||[]).push([[2672],{3905:(t,e,n)=>{n.d(e,{Zo:()=>s,kt:()=>I});var r=n(67294);function a(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function g(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?i(Object(n),!0).forEach((function(e){a(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function l(t,e){if(null==t)return{};var n,r,a=function(t,e){if(null==t)return{};var n,r,a={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(a[n]=t[n]);return a}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(a[n]=t[n])}return a}var m=r.createContext({}),o=function(t){var e=r.useContext(m),n=e;return t&&(n="function"==typeof t?t(e):g(g({},e),t)),n},s=function(t){var e=o(t.components);return r.createElement(m.Provider,{value:e},t.children)},u="mdxType",p={inlineCode:"code",wrapper:function(t){var e=t.children;return r.createElement(r.Fragment,{},e)}},c=r.forwardRef((function(t,e){var n=t.components,a=t.mdxType,i=t.originalType,m=t.parentName,s=l(t,["components","mdxType","originalType","parentName"]),u=o(n),c=a,I=u["".concat(m,".").concat(c)]||u[c]||p[c]||i;return n?r.createElement(I,g(g({ref:e},s),{},{components:n})):r.createElement(I,g({ref:e},s))}));function I(t,e){var n=arguments,a=e&&e.mdxType;if("string"==typeof t||a){var i=n.length,g=new Array(i);g[0]=c;var l={};for(var m in e)hasOwnProperty.call(e,m)&&(l[m]=e[m]);l.originalType=t,l[u]="string"==typeof t?t:a,g[1]=l;for(var o=2;o<i;o++)g[o]=n[o];return r.createElement.apply(null,g)}return r.createElement.apply(null,n)}c.displayName="MDXCreateElement"},88959:(t,e,n)=>{n.r(e),n.d(e,{assets:()=>m,contentTitle:()=>g,default:()=>p,frontMatter:()=>i,metadata:()=>l,toc:()=>o});var r=n(87462),a=(n(67294),n(3905));const i={},g=void 0,l={unversionedId:"zh-cn/spring-boot/file/Image-Add-Watermark",id:"zh-cn/spring-boot/file/Image-Add-Watermark",title:"Image-Add-Watermark",description:"-",source:"@site/docs/zh-cn/spring-boot/file/Image-Add-Watermark.md",sourceDirName:"zh-cn/spring-boot/file",slug:"/zh-cn/spring-boot/file/Image-Add-Watermark",permalink:"/light-docusaurus/docs/zh-cn/spring-boot/file/Image-Add-Watermark",draft:!1,editUrl:"https://github.com/lorchr/light-docusaurus/tree/main/docs/zh-cn/spring-boot/file/Image-Add-Watermark.md",tags:[],version:"current",frontMatter:{}},m={},o=[{value:"1. \u83b7\u53d6\u539f\u56fe\u7247\u5bf9\u8c61\u4fe1\u606f",id:"1-\u83b7\u53d6\u539f\u56fe\u7247\u5bf9\u8c61\u4fe1\u606f",level:2},{value:"1.1 \u8bfb\u53d6\u672c\u5730\u56fe\u7247",id:"11-\u8bfb\u53d6\u672c\u5730\u56fe\u7247",level:3},{value:"1.2 \u8bfb\u53d6\u7f51\u7edc\u56fe\u7247",id:"12-\u8bfb\u53d6\u7f51\u7edc\u56fe\u7247",level:3},{value:"2.\u6dfb\u52a0\u6c34\u5370",id:"2\u6dfb\u52a0\u6c34\u5370",level:2},{value:"Font \u5b57\u4f53\u8bf4\u660e\uff1a",id:"font-\u5b57\u4f53\u8bf4\u660e",level:3},{value:"\u5982\u4f55\u786e\u5b9a\u6c34\u5370\u4f4d\u7f6e \uff1f",id:"\u5982\u4f55\u786e\u5b9a\u6c34\u5370\u4f4d\u7f6e-",level:3},{value:"3. \u83b7\u53d6\u76ee\u6807\u56fe\u7247",id:"3-\u83b7\u53d6\u76ee\u6807\u56fe\u7247",level:2},{value:"4.\u5b8c\u6210\u4ee3\u7801",id:"4\u5b8c\u6210\u4ee3\u7801",level:2},{value:"1. \u6dfb\u52a0\u56fe\u7247\u6c34\u5370\u65b9\u6cd5\uff1a",id:"1-\u6dfb\u52a0\u56fe\u7247\u6c34\u5370\u65b9\u6cd5",level:2},{value:"2. \u5b8c\u6210\u4ee3\u7801",id:"2-\u5b8c\u6210\u4ee3\u7801",level:2},{value:"3.\u4ee3\u7801\u6267\u884c\u6548\u679c",id:"3\u4ee3\u7801\u6267\u884c\u6548\u679c",level:2}],s={toc:o},u="wrapper";function p(t){let{components:e,...n}=t;return(0,a.kt)(u,(0,r.Z)({},s,n,{components:e,mdxType:"MDXLayout"}),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://csdn.net/qq_26383975/article/details/125996277"})),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://mp.weixin.qq.com/s/Q3mea4QBRZ8ckn6u2uZaHg"},"Java\u5b9e\u73b0\u6dfb\u52a0\u6587\u5b57\u6c34\u5370\u3001\u56fe\u7247\u6c34\u5370\u529f\u80fd\u5b9e\u6218"))),(0,a.kt)("p",null,"\u672c\u6587\u4ecb\u7ecdjava\u5b9e\u73b0\u5728\u56fe\u7247\u4e0a\u52a0\u6587\u5b57\u6c34\u5370\u7684\u65b9\u6cd5\uff0c\u6c34\u5370\u53ef\u4ee5\u662f\u56fe\u7247\u6216\u8005\u6587\u5b57\uff0c\u64cd\u4f5c\u65b9\u4fbf\u3002"),(0,a.kt)("p",null,"java\u5b9e\u73b0\u7ed9\u56fe\u7247\u6dfb\u52a0\u6c34\u5370\u5b9e\u73b0\u6b65\u9aa4\uff1a"),(0,a.kt)("p",null,"\uff081\uff09\u83b7\u53d6\u539f\u56fe\u7247\u5bf9\u8c61\u4fe1\u606f\uff08\u672c\u5730\u56fe\u7247\u6216\u7f51\u7edc\u56fe\u7247\uff09\n\uff082\uff09\u6dfb\u52a0\u6c34\u5370\uff08\u8bbe\u7f6e\u6c34\u5370\u989c\u8272\u3001\u5b57\u4f53\u3001\u5750\u6807\u7b49\uff09\n\uff083\uff09\u5904\u7406\u8f93\u51fa\u76ee\u6807\u56fe\u7247"),(0,a.kt)("h1",{id:"java\u5b9e\u73b0\u7ed9\u56fe\u7247\u6dfb\u52a0\u6587\u5b57\u6c34\u5370"},"java\u5b9e\u73b0\u7ed9\u56fe\u7247\u6dfb\u52a0\u6587\u5b57\u6c34\u5370"),(0,a.kt)("h2",{id:"1-\u83b7\u53d6\u539f\u56fe\u7247\u5bf9\u8c61\u4fe1\u606f"},"1. \u83b7\u53d6\u539f\u56fe\u7247\u5bf9\u8c61\u4fe1\u606f"),(0,a.kt)("p",null,"\u7b2c\u4e00\u6b65\uff1a\u83b7\u53d6\u9700\u8981\u5904\u7406\u7684\u56fe\u7247"),(0,a.kt)("p",null,"\u83b7\u53d6\u56fe\u7247\u7684\u65b9\u5f0f\uff0c\u901a\u5e38\u7531\u4e24\u79cd\uff1a\n\u4e00\u79cd\u662f\u901a\u8fc7\u4e0b\u8f7d\u5230\u672c\u5730\uff0c\u4ece\u672c\u5730\u8bfb\u53d6\uff08\u672c\u5730\u56fe\u7247\uff09\uff1b\n\u53e6\u5916\u4e00\u79cd\u662f\u901a\u8fc7\u7f51\u7edc\u5730\u5740\u8fdb\u884c\u8bfb\u53d6\uff08\u7f51\u7edc\u56fe\u7247\uff09"),(0,a.kt)("h3",{id:"11-\u8bfb\u53d6\u672c\u5730\u56fe\u7247"},"1.1 \u8bfb\u53d6\u672c\u5730\u56fe\u7247"),(0,a.kt)("p",null,"\u56fe\u7247"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-java"},'\u901a\u8fc7\u4ee3\u7801\u5b9e\u73b0\u8bfb\u53d6\u672c\u5730\u76ee\u5f55\uff08F:\\image\\1.png\uff09\u4e0b\u56fe\u7247\uff0c\u4ee3\u7801\u5982\u4e0b\uff1a\n// \u8bfb\u53d6\u539f\u56fe\u7247\u4fe1\u606f \u5f97\u5230\u6587\u4ef6\nFile srcImgFile = new File("F:/image/1.png");\n//\u5c06\u6587\u4ef6\u5bf9\u8c61\u8f6c\u5316\u4e3a\u56fe\u7247\u5bf9\u8c61\nImage srcImg = ImageIO.read(srcImgFile);\n//\u83b7\u53d6\u56fe\u7247\u7684\u5bbd\nint srcImgWidth = srcImg.getWidth(null);\n//\u83b7\u53d6\u56fe\u7247\u7684\u9ad8\nint srcImgHeight = srcImg.getHeight(null);\nSystem.out.println("\u56fe\u7247\u7684\u5bbd:"+srcImgWidth);\nSystem.out.println("\u56fe\u7247\u7684\u9ad8:"+srcImgHeight);\n')),(0,a.kt)("p",null,"\u4ee3\u7801\u6548\u679c\u5982\u4e0b\uff1a\n\u56fe\u7247"),(0,a.kt)("h3",{id:"12-\u8bfb\u53d6\u7f51\u7edc\u56fe\u7247"},"1.2 \u8bfb\u53d6\u7f51\u7edc\u56fe\u7247"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-java"},'//\u521b\u5efa\u4e00\u4e2aURL\u5bf9\u8c61,\u83b7\u53d6\u7f51\u7edc\u56fe\u7247\u7684\u5730\u5740\u4fe1\u606f\nURL url = new URL("https://pngimg.com/distr/img/ukraine.png");\n//\u5c06URL\u5bf9\u8c61\u8f93\u5165\u6d41\u8f6c\u5316\u4e3a\u56fe\u7247\u5bf9\u8c61 (url.openStream()\u65b9\u6cd5\uff0c\u83b7\u5f97\u4e00\u4e2a\u8f93\u5165\u6d41)\nImage srcImg = ImageIO.read(url.openStream());\n//\u83b7\u53d6\u56fe\u7247\u7684\u5bbd\nint srcImgWidth = srcImg.getWidth(null);\n//\u83b7\u53d6\u56fe\u7247\u7684\u9ad8\nint srcImgHeight = srcImg.getHeight(null);\nSystem.out.println("\u56fe\u7247\u7684\u5bbd:"+srcImgWidth);\nSystem.out.println("\u56fe\u7247\u7684\u9ad8:"+srcImgHeight);\n')),(0,a.kt)("p",null,"\u4ee3\u7801\u6548\u679c\u5982\u4e0b\uff1a"),(0,a.kt)("p",null,"\u56fe\u7247"),(0,a.kt)("h2",{id:"2\u6dfb\u52a0\u6c34\u5370"},"2.\u6dfb\u52a0\u6c34\u5370"),(0,a.kt)("p",null,"\u901a\u8fc7\u4e0a\u9762\u7684\u6b65\u9aa4\uff0c\u6211\u4eec\u5df2\u7ecf\u83b7\u53d6\u5230\u4e86\u539f\u59cb\u56fe\u7247\u4fe1\u606f\uff0c\u4e0b\u9762\u9700\u8981\u521b\u5efa\u4e00\u4e2a\u753b\u7b14\u8fdb\u884c\u6c34\u5370\u7684\u6dfb\u52a0\u3002\u6c34\u5370\u5305\u542b\u6587\u5b57\u6c34\u5370\u3001\u56fe\u7247\u6c34\u5370\u3002"),(0,a.kt)("p",null,"\u753b\u7b14\u53ef\u4ee5\u8bbe\u7f6e\u6c34\u5370\u989c\u8272\u3001\u5b57\u4f53\u5927\u5c0f\u3001\u5b57\u4f53\u6837\u5f0f\u7b49\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-java"},'BufferedImage bufImg = new BufferedImage(srcImgWidth, srcImgHeight, BufferedImage.TYPE_INT_RGB);\n// \u52a0\u6c34\u5370\n//\u521b\u5efa\u753b\u7b14\nGraphics2D g = bufImg.createGraphics();\n//srcImg \u4e3a\u4e0a\u9762\u83b7\u53d6\u5230\u7684\u539f\u59cb\u56fe\u7247\u7684\u56fe\u7247\u5bf9\u8c61\ng.drawImage(srcImg, 0, 0, srcImgWidth, srcImgHeight, null);\n//\u6839\u636e\u56fe\u7247\u7684\u80cc\u666f\u8bbe\u7f6e\u6c34\u5370\u989c\u8272\ng.setColor(new Color(255,255,255,128));\n//\u8bbe\u7f6e\u5b57\u4f53  \u753b\u7b14\u5b57\u4f53\u6837\u5f0f\u4e3a\u5fae\u8f6f\u96c5\u9ed1\uff0c\u52a0\u7c97\uff0c\u6587\u5b57\u5927\u5c0f\u4e3a60pt\ng.setFont(new Font("\u5fae\u8f6f\u96c5\u9ed1", Font.BOLD, 60));\n//\u8bbe\u7f6e\u6c34\u5370\u7684\u5750\u6807\n//int x=200;\n//int y=200;\nint x=(srcImgWidth - getWatermarkLength(waterMarkContent, g)) / 2;\nint y=srcImgHeight / 2;\n//\u753b\u51fa\u6c34\u5370 \u7b2c\u4e00\u4e2a\u53c2\u6570\u662f\u6c34\u5370\u5185\u5bb9\uff0c\u7b2c\u4e8c\u4e2a\u53c2\u6570\u662fx\u8f74\u5750\u6807\uff0c\u7b2c\u4e09\u4e2a\u53c2\u6570\u662fy\u8f74\u5750\u6807\ng.drawString("\u56fe\u7247\u6765\u6e90\uff1ahttps://image.baidu.com/", x, y);\ng.dispose();\n')),(0,a.kt)("p",null,"getWatermarkLength\u65b9\u6cd5\u7528\u4e8e\u8ba1\u7b97\u6c34\u5370\u5185\u5bb9\u7684\u957f\u5ea6\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-java"},"    /**\n     * \u83b7\u53d6\u6c34\u5370\u6587\u5b57\u7684\u957f\u5ea6\n     * @param waterMarkContent\n     * @param g\n     * @return\n     */\n    public static int getWatermarkLength(String waterMarkContent, Graphics2D g) {\n        return g.getFontMetrics(g.getFont()).charsWidth(waterMarkContent.toCharArray(), 0, waterMarkContent.length());\n    }\n")),(0,a.kt)("h3",{id:"font-\u5b57\u4f53\u8bf4\u660e"},"Font \u5b57\u4f53\u8bf4\u660e\uff1a"),(0,a.kt)("p",null,"Font \u7c7b\u7684\u6784\u9020\u51fd\u6570\u4e3a\uff1a",(0,a.kt)("inlineCode",{parentName:"p"},"public Font(String familyName, int style, int size)"),"\n\u53c2\u6570\u8bf4\u660e\uff1a\u7b2c\u4e00\u4e2a\u53c2\u6570\u4e3a\u5b57\u4f53\u7c7b\u578b\uff0c\u7b2c\u4e8c\u4e2a\u53c2\u6570\u4e3a\u5b57\u4f53\u98ce\u683c\uff0c\u7b2c\u4e09\u4e2a\u53c2\u6570\u4e3a\u5b57\u4f53\u5927\u5c0f\n\u5b57\u4f53\u7684\u98ce\u683c\u6709\uff1a"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"Font.PLAIN\uff08\u666e\u901a\uff09"),(0,a.kt)("li",{parentName:"ul"},"Font.BOLD\uff08\u52a0\u7c97\uff09"),(0,a.kt)("li",{parentName:"ul"},"Font.ITALIC\uff08\u659c\u4f53\uff09"),(0,a.kt)("li",{parentName:"ul"},"Font.BOLD+Font.ITALIC\uff08\u7c97\u659c\u4f53\uff09")),(0,a.kt)("p",null,"size\u5b57\u4f53\u5927\u5c0f \u9ed8\u8ba4\u5355\u4f4d\u662fpt(\u78c5)\uff0c\u6570\u5b57\u8d8a\u5927\uff0c\u5b57\u5c31\u8d8a\u5927"),(0,a.kt)("p",null,"\u9700\u8981\u6ce8\u610f\u662f \u6c34\u5370\u5750\u6807\u4f4d\u7f6e\u3002\u8bbe\u7f6e\u4e0d\u5f53\uff0c\u5c31\u770b\u4e0d\u5230\u6c34\u5370\u6548\u679c\u3002"),(0,a.kt)("h3",{id:"\u5982\u4f55\u786e\u5b9a\u6c34\u5370\u4f4d\u7f6e-"},"\u5982\u4f55\u786e\u5b9a\u6c34\u5370\u4f4d\u7f6e \uff1f"),(0,a.kt)("p",null,"\u65b9\u6cd5\u4e00\uff1a\u8bbe\u7f6e\u56fa\u5b9a\u503c"),(0,a.kt)("ol",null,(0,a.kt)("li",{parentName:"ol"},"\u9996\u5148\uff0c\u6211\u4eec\u8981\u77e5\u9053\u56fe\u7247\u4e0a\u7684\u5750\u6807\u7684\u8868\u793a\u6cd5\u3002\u5177\u4f53\u5982\u4e0b\uff1a"),(0,a.kt)("li",{parentName:"ol"},"\u5c06\u56fe\u7247\u4fdd\u5b58\u5230\u672c\u5730\uff0c\u7136\u540e\u9009\u4e2d\u56fe\u7247\u70b9\u51fb\u53f3\u952e\uff0c\u7f16\u8f91\uff0c\u9009\u62e9\u201c\u753b\u56fe\u201d\u8f6f\u4ef6\u6253\u5f00"),(0,a.kt)("li",{parentName:"ol"},"\u5c06\u9f20\u6807\u79fb\u52a8\u5230\u60f3\u8981\u6dfb\u52a0\u6c34\u5370\u7684\u4f4d\u7f6e\uff0c\u5de6\u4e0b\u89d2\u53ef\u4ee5\u770b\u5230\u9f20\u6807\u70b9\u51fb\u4f4d\u7f6e\u5bf9\u5e94\u7684\u5750\u6807\u503c\uff0c\u62ff\u5230\u8fd9\u4e2a\u5750\u6807\u503c\u5199\u5165\u7a0b\u5e8f\u5373\u53ef")),(0,a.kt)("p",null,"\u65b9\u6cd5\u4e8c\uff1a\u6839\u636e\u539f\u56fe\u5927\u5c0f\u8fdb\u884c\u8bbe\u7f6e\uff0c\u5982\u653e\u7f6e\u5728\u539f\u56fe\u7684\u4e2d\u95f4\u4f4d\u7f6e"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"x\u8f74\u5750\u6807\uff1a(\u539f\u59cb\u56fe\u7684\u5bbd\u5ea6 - \u6c34\u5370\u7684\u5bbd\u5ea6) / 2"),(0,a.kt)("li",{parentName:"ul"},"y\u8f74\u5750\u6807\uff1a(\u539f\u59cb\u56fe\u7684\u9ad8\u5ea6 - \u6c34\u5370\u7684\u9ad8\u5ea6) / 2")),(0,a.kt)("h2",{id:"3-\u83b7\u53d6\u76ee\u6807\u56fe\u7247"},"3. \u83b7\u53d6\u76ee\u6807\u56fe\u7247"),(0,a.kt)("p",null,"\u7ecf\u8fc7\u4e0a\u9762\u7684\u64cd\u4f5c\u540e\uff0c\u6211\u4eec\u7684\u56fe\u7247\u6dfb\u52a0\u6587\u5b57\u5c31\u5df2\u7ecf\u5904\u7406\u5b8c\u6210\u4e86\u3002\u4f46\u4ed6\u73b0\u5728\u8fd8\u4fdd\u5b58\u5728Java\u5bf9\u8c61\u4e2d\u3002"),(0,a.kt)("p",null,"\u6211\u4eec\u60f3\u8981\u770b\u5f97\u5230\u6548\u679c\uff0c\u9700\u8981\u8fdb\u884c\u5904\u7406\uff0c\u4fdd\u5b58\u56fe\u7247\u5230\u672c\u5730\u3002"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-java"},'//\u5f85\u5b58\u50a8\u7684\u5730\u5740\nString tarImgPath="F:/image/t.png";\n// \u8f93\u51fa\u56fe\u7247\nFileOutputStream outImgStream = new FileOutputStream(tarImgPath);\nImageIO.write(bufImg, "png", outImgStream);\nSystem.out.println("\u6dfb\u52a0\u6c34\u5370\u5b8c\u6210");\noutImgStream.flush();\noutImgStream.close();\n')),(0,a.kt)("p",null,"\u6267\u884c\u6548\u679c\uff1a\n\u6267\u884c\uff0c\u76ee\u6807\u76ee\u5f55\u4e0b\u591a\u4e86\u4e00\u4e2at.png\u7684\u56fe\u7247\uff1a\n\u56fe\u7247\nt.png\u6253\u5f00\u53ef\u4ee5\u770b\u5230\u6dfb\u52a0\u7684\u6587\u5b57\u6c34\u5370\uff0c\u6c34\u5370\u6dfb\u52a0\u6210\u529f\uff1a"),(0,a.kt)("p",null,"\u56fe\u7247"),(0,a.kt)("h2",{id:"4\u5b8c\u6210\u4ee3\u7801"},"4.\u5b8c\u6210\u4ee3\u7801"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-java"},'package com.example.listdemo.utils;\nimport javax.imageio.ImageIO;\nimport java.awt.*;\nimport java.awt.image.BufferedImage;\nimport java.io.File;\nimport java.io.FileOutputStream;\nimport java.io.IOException;\n/**\n * \u56fe\u7247\u6dfb\u52a0\u6c34\u5370\n * @author qzz\n */\npublic class ImageUtils {\n    public static void main(String[] args) throws IOException {\n        // \u8bfb\u53d6\u539f\u56fe\u7247\u4fe1\u606f \u5f97\u5230\u6587\u4ef6\uff08\u672c\u5730\u56fe\u7247\uff09\n        File srcImgFile = new File("F:/image/1.png");\n        //\u5c06\u6587\u4ef6\u5bf9\u8c61\u8f6c\u5316\u4e3a\u56fe\u7247\u5bf9\u8c61\n        Image srcImg = ImageIO.read(srcImgFile);\n        //\u83b7\u53d6\u56fe\u7247\u7684\u5bbd\n        int srcImgWidth = srcImg.getWidth(null);\n        //\u83b7\u53d6\u56fe\u7247\u7684\u9ad8\n        int srcImgHeight = srcImg.getHeight(null);\n        System.out.println("\u56fe\u7247\u7684\u5bbd:"+srcImgWidth);\n        System.out.println("\u56fe\u7247\u7684\u9ad8:"+srcImgHeight);\n        //\u521b\u5efa\u4e00\u4e2aURL\u5bf9\u8c61,\u83b7\u53d6\u7f51\u7edc\u56fe\u7247\u7684\u5730\u5740\u4fe1\u606f\uff08\u7f51\u7edc\u56fe\u7247\uff09\n//        URL url = new URL("https://pngimg.com/distr/img/ukraine.png");\n//        //\u5c06URL\u5bf9\u8c61\u8f93\u5165\u6d41\u8f6c\u5316\u4e3a\u56fe\u7247\u5bf9\u8c61 (url.openStream()\u65b9\u6cd5\uff0c\u83b7\u5f97\u4e00\u4e2a\u8f93\u5165\u6d41)\n//        Image srcImg = ImageIO.read(url.openStream());\n//        //\u83b7\u53d6\u56fe\u7247\u7684\u5bbd\n//        int srcImgWidth = srcImg.getWidth(null);\n//        //\u83b7\u53d6\u56fe\u7247\u7684\u9ad8\n//        int srcImgHeight = srcImg.getHeight(null);\n//        System.out.println("\u56fe\u7247\u7684\u5bbd:"+srcImgWidth);\n//        System.out.println("\u56fe\u7247\u7684\u9ad8:"+srcImgHeight);\n        BufferedImage bufImg = new BufferedImage(srcImgWidth, srcImgHeight, BufferedImage.TYPE_INT_RGB);\n        // \u52a0\u6c34\u5370\n        //\u521b\u5efa\u753b\u7b14\n        Graphics2D g = bufImg.createGraphics();\n        //\u7ed8\u5236\u539f\u59cb\u56fe\u7247\n        g.drawImage(srcImg, 0, 0, srcImgWidth, srcImgHeight, null);\n        //-------------------------\u6587\u5b57\u6c34\u5370 start----------------------------\n        //\u6839\u636e\u56fe\u7247\u7684\u80cc\u666f\u8bbe\u7f6e\u6c34\u5370\u989c\u8272\n        g.setColor(new Color(255,255,255,128));\n        //\u8bbe\u7f6e\u5b57\u4f53  \u753b\u7b14\u5b57\u4f53\u6837\u5f0f\u4e3a\u5fae\u8f6f\u96c5\u9ed1\uff0c\u52a0\u7c97\uff0c\u6587\u5b57\u5927\u5c0f\u4e3a60pt\n        g.setFont(new Font("\u5fae\u8f6f\u96c5\u9ed1", Font.BOLD, 60));\n        //\u6c34\u5370\u5185\u5bb9\n        String waterMarkContent="\u56fe\u7247\u6765\u6e90\uff1ahttps://image.baidu.com/";\n        //\u8bbe\u7f6e\u6c34\u5370\u7684\u5750\u6807(\u4e3a\u539f\u56fe\u7247\u4e2d\u95f4\u4f4d\u7f6e)\n        int x=(srcImgWidth - getWatermarkLength(waterMarkContent, g)) / 2;\n        int y=srcImgHeight / 2;\n        //\u753b\u51fa\u6c34\u5370 \u7b2c\u4e00\u4e2a\u53c2\u6570\u662f\u6c34\u5370\u5185\u5bb9\uff0c\u7b2c\u4e8c\u4e2a\u53c2\u6570\u662fx\u8f74\u5750\u6807\uff0c\u7b2c\u4e09\u4e2a\u53c2\u6570\u662fy\u8f74\u5750\u6807\n        g.drawString(waterMarkContent, x, y);\n        g.dispose();\n        //-------------------------\u6587\u5b57\u6c34\u5370 end----------------------------\n        //\u5f85\u5b58\u50a8\u7684\u5730\u5740\n        String tarImgPath="F:/image/t.png";\n        // \u8f93\u51fa\u56fe\u7247\n        FileOutputStream outImgStream = new FileOutputStream(tarImgPath);\n        ImageIO.write(bufImg, "png", outImgStream);\n        System.out.println("\u6dfb\u52a0\u6c34\u5370\u5b8c\u6210");\n        outImgStream.flush();\n        outImgStream.close();\n    }\n    \n    /**\n     * \u83b7\u53d6\u6c34\u5370\u6587\u5b57\u7684\u957f\u5ea6\n     * @param waterMarkContent\n     * @param g\n     * @return\n     */\n    public static int getWatermarkLength(String waterMarkContent, Graphics2D g) {\n        return g.getFontMetrics(g.getFont()).charsWidth(waterMarkContent.toCharArray(), 0, waterMarkContent.length());\n    }\n}\n')),(0,a.kt)("h1",{id:"java\u5b9e\u73b0\u7ed9\u56fe\u7247\u6dfb\u52a0\u56fe\u7247\u6c34\u5370"},"java\u5b9e\u73b0\u7ed9\u56fe\u7247\u6dfb\u52a0\u56fe\u7247\u6c34\u5370"),(0,a.kt)("p",null,"\u4e0b\u8f7d\u6c34\u5370\u56fe\u7247\u5230\u672c\u5730\uff1a"),(0,a.kt)("h2",{id:"1-\u6dfb\u52a0\u56fe\u7247\u6c34\u5370\u65b9\u6cd5"},"1. \u6dfb\u52a0\u56fe\u7247\u6c34\u5370\u65b9\u6cd5\uff1a"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-java"},'// \u6c34\u5370\u6587\u4ef6\nString waterMarkImage="F:/image/s.png";\nImage srcWaterMark = ImageIO.read(new File(waterMarkImage));\n//\u83b7\u53d6\u6c34\u5370\u56fe\u7247\u7684\u5bbd\u5ea6\nint widthWaterMark= srcWaterMark.getWidth(null);\n//\u83b7\u53d6\u6c34\u5370\u56fe\u7247\u7684\u9ad8\u5ea6\nint heightWaterMark = srcWaterMark.getHeight(null);\n//\u8bbe\u7f6e alpha \u900f\u660e\u5ea6\uff1aalpha \u5fc5\u987b\u662f\u8303\u56f4 [0.0, 1.0] \u4e4b\u5185\uff08\u5305\u542b\u8fb9\u754c\u503c\uff09\u7684\u4e00\u4e2a\u6d6e\u70b9\u6570\u5b57\ng.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_ATOP, 0.9f));\n//\u7ed8\u5236\u6c34\u5370\u56fe\u7247  \u5750\u6807\u4e3a\u4e2d\u95f4\u4f4d\u7f6e\ng.drawImage(srcWaterMark, (srcImgWidth - widthWaterMark) / 2,\n        (srcImgHeight - heightWaterMark) / 2, widthWaterMark, heightWaterMark, null);\n// \u6c34\u5370\u6587\u4ef6\u7ed3\u675f\ng.dispose();\n')),(0,a.kt)("h2",{id:"2-\u5b8c\u6210\u4ee3\u7801"},"2. \u5b8c\u6210\u4ee3\u7801"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-java"},'package com.example.listdemo.utils;\nimport javax.imageio.ImageIO;\nimport java.awt.*;\nimport java.awt.image.BufferedImage;\nimport java.io.File;\nimport java.io.FileOutputStream;\nimport java.io.IOException;\n/**\n * \u56fe\u7247\u6dfb\u52a0\u6c34\u5370\n * @author qzz\n */\npublic class ImageUtils {\n    public static void main(String[] args) throws IOException {\n        // \u8bfb\u53d6\u539f\u56fe\u7247\u4fe1\u606f \u5f97\u5230\u6587\u4ef6\uff08\u672c\u5730\u56fe\u7247\uff09\n        File srcImgFile = new File("F:/image/1.png");\n        //\u5c06\u6587\u4ef6\u5bf9\u8c61\u8f6c\u5316\u4e3a\u56fe\u7247\u5bf9\u8c61\n        Image srcImg = ImageIO.read(srcImgFile);\n        //\u83b7\u53d6\u56fe\u7247\u7684\u5bbd\n        int srcImgWidth = srcImg.getWidth(null);\n        //\u83b7\u53d6\u56fe\u7247\u7684\u9ad8\n        int srcImgHeight = srcImg.getHeight(null);\n        System.out.println("\u56fe\u7247\u7684\u5bbd:"+srcImgWidth);\n        System.out.println("\u56fe\u7247\u7684\u9ad8:"+srcImgHeight);\n        //\u521b\u5efa\u4e00\u4e2aURL\u5bf9\u8c61,\u83b7\u53d6\u7f51\u7edc\u56fe\u7247\u7684\u5730\u5740\u4fe1\u606f\uff08\u7f51\u7edc\u56fe\u7247\uff09\n//        URL url = new URL("https://pngimg.com/distr/img/ukraine.png");\n//        //\u5c06URL\u5bf9\u8c61\u8f93\u5165\u6d41\u8f6c\u5316\u4e3a\u56fe\u7247\u5bf9\u8c61 (url.openStream()\u65b9\u6cd5\uff0c\u83b7\u5f97\u4e00\u4e2a\u8f93\u5165\u6d41)\n//        Image srcImg = ImageIO.read(url.openStream());\n//        //\u83b7\u53d6\u56fe\u7247\u7684\u5bbd\n//        int srcImgWidth = srcImg.getWidth(null);\n//        //\u83b7\u53d6\u56fe\u7247\u7684\u9ad8\n//        int srcImgHeight = srcImg.getHeight(null);\n//        System.out.println("\u56fe\u7247\u7684\u5bbd:"+srcImgWidth);\n//        System.out.println("\u56fe\u7247\u7684\u9ad8:"+srcImgHeight);\n        BufferedImage bufImg = new BufferedImage(srcImgWidth, srcImgHeight, BufferedImage.TYPE_INT_RGB);\n        // \u52a0\u6c34\u5370\n        //\u521b\u5efa\u753b\u7b14\n        Graphics2D g = bufImg.createGraphics();\n        //\u7ed8\u5236\u539f\u59cb\u56fe\u7247\n        g.drawImage(srcImg, 0, 0, srcImgWidth, srcImgHeight, null);\n        //-------------------------\u6587\u5b57\u6c34\u5370 start----------------------------\n//        //\u6839\u636e\u56fe\u7247\u7684\u80cc\u666f\u8bbe\u7f6e\u6c34\u5370\u989c\u8272\n//        g.setColor(new Color(255,255,255,128));\n//        //\u8bbe\u7f6e\u5b57\u4f53  \u753b\u7b14\u5b57\u4f53\u6837\u5f0f\u4e3a\u5fae\u8f6f\u96c5\u9ed1\uff0c\u52a0\u7c97\uff0c\u6587\u5b57\u5927\u5c0f\u4e3a60pt\n//        g.setFont(new Font("\u5fae\u8f6f\u96c5\u9ed1", Font.BOLD, 60));\n//        String waterMarkContent="\u56fe\u7247\u6765\u6e90\uff1ahttps://image.baidu.com/";\n//        //\u8bbe\u7f6e\u6c34\u5370\u7684\u5750\u6807(\u4e3a\u539f\u56fe\u7247\u4e2d\u95f4\u4f4d\u7f6e)\n//        int x=(srcImgWidth - getWatermarkLength(waterMarkContent, g)) / 2;\n//        int y=srcImgHeight / 2;\n//        //\u753b\u51fa\u6c34\u5370 \u7b2c\u4e00\u4e2a\u53c2\u6570\u662f\u6c34\u5370\u5185\u5bb9\uff0c\u7b2c\u4e8c\u4e2a\u53c2\u6570\u662fx\u8f74\u5750\u6807\uff0c\u7b2c\u4e09\u4e2a\u53c2\u6570\u662fy\u8f74\u5750\u6807\n//        g.drawString(waterMarkContent, x, y);\n//        g.dispose();\n        //-------------------------\u6587\u5b57\u6c34\u5370 end----------------------------\n        //-------------------------\u56fe\u7247\u6c34\u5370 start----------------------------\n        // \u6c34\u5370\u6587\u4ef6\n        String waterMarkImage="F:/image/s.png";\n        Image srcWaterMark = ImageIO.read(new File(waterMarkImage));\n        //\u83b7\u53d6\u6c34\u5370\u56fe\u7247\u7684\u5bbd\u5ea6\n        int widthWaterMark= srcWaterMark.getWidth(null);\n        //\u83b7\u53d6\u6c34\u5370\u56fe\u7247\u7684\u9ad8\u5ea6\n        int heightWaterMark = srcWaterMark.getHeight(null);\n        //\u8bbe\u7f6e alpha \u900f\u660e\u5ea6\uff1aalpha \u5fc5\u987b\u662f\u8303\u56f4 [0.0, 1.0] \u4e4b\u5185\uff08\u5305\u542b\u8fb9\u754c\u503c\uff09\u7684\u4e00\u4e2a\u6d6e\u70b9\u6570\u5b57\n        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_ATOP, 0.9f));\n        //\u7ed8\u5236\u6c34\u5370\u56fe\u7247  \u5750\u6807\u4e3a\u4e2d\u95f4\u4f4d\u7f6e\n        g.drawImage(srcWaterMark, (srcImgWidth - widthWaterMark) / 2,\n                (srcImgHeight - heightWaterMark) / 2, widthWaterMark, heightWaterMark, null);\n        // \u6c34\u5370\u6587\u4ef6\u7ed3\u675f\n        g.dispose();\n        //-------------------------\u56fe\u7247\u6c34\u5370 end----------------------------\n        //\u5f85\u5b58\u50a8\u7684\u5730\u5740\n        String tarImgPath="F:/image/t.png";\n        // \u8f93\u51fa\u56fe\u7247\n        FileOutputStream outImgStream = new FileOutputStream(tarImgPath);\n        ImageIO.write(bufImg, "png", outImgStream);\n        System.out.println("\u6dfb\u52a0\u6c34\u5370\u5b8c\u6210");\n        outImgStream.flush();\n        outImgStream.close();\n    }\n    \n    /**\n     * \u83b7\u53d6\u6c34\u5370\u6587\u5b57\u7684\u957f\u5ea6\n     * @param waterMarkContent\n     * @param g\n     * @return\n     */\n    public static int getWatermarkLength(String waterMarkContent, Graphics2D g) {\n        return g.getFontMetrics(g.getFont()).charsWidth(waterMarkContent.toCharArray(), 0, waterMarkContent.length());\n    }\n}\n')),(0,a.kt)("h2",{id:"3\u4ee3\u7801\u6267\u884c\u6548\u679c"},"3.\u4ee3\u7801\u6267\u884c\u6548\u679c"))}p.isMDXComponent=!0}}]);