
## NPM运行的错误
1. `node-sass`安装失败 `https://zhuanlan.zhihu.com/p/656247517`

```shell
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! node-sass@8.0.0 postinstall: `node scripts/build.js`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the node-sass@8.0.0 postinstall script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.
```

遇到`node-sass`安装失败时，可以使用以下命令：
```shell
# 查看本地node版本
node -v

# 安装node-sass 版本号(4.12.0)参考官方对照表
npm install node-sass@^4.12.0 --registry=https://registry.npm.taobao.org --sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
```

`node`版本与`node-sass`版本对照表
- [node-sass github](https://github.com/sass/node-sass)
- [node-sass npm](https://www.npmjs.com/package/node-sass)
