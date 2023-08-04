## 初始化Vite Vue TS项目
当然！要使用 `Vite 2` 结合 `Vue 3` 和 `TypeScript` 初始化一个 web 工程，请按照以下步骤进行：

### 1. 安装 Node.js
确保你的系统中已安装了 `Node.js` 和 `npm`（Node Package Manager）。你可以从[官方网站](https://nodejs.org/)下载 Node.js

### 2. 安装 Vite CLI
打开终端或命令提示符，并全局安装 `Vite`：
```bash
npm install -g create-vite
```

### 3. 创建 Vite 项目
运行以下命令，创建一个包含 `Vue 3` 和 `TypeScript` 模板的 `Vite` 项目：

```bash
mkdir torch-web
cd torch-web
create-vite ./ --template vue-ts
```

该命令会在当前文件夹下初始化项目，并配置好项目结构和依赖项。

### 4. 安装依赖项
使用 `npm` 安装项目依赖项：
```bash
npm install
```

### 5. 启动开发服务器
现在，启动 `Vite` 开发服务器，即可在浏览器中查看运行 `Vue 3` + `TypeScript` 应用程序：

```bash
npm run dev
```

你的 web 应用程序将默认在 `http://localhost:5173` 上访问。

完成！你现在已经有了一个基本的 `Vite 2` 项目，结合了 `Vue 3` 和 `TypeScript`。你可以开始在 `src` 目录下开发 `Vue` 组件和 `TypeScript` 文件，并且在开发过程中实时看到变化。祝你编码愉快！

## 集成Electron
### 1. 安装 `Electron`
1. 修改`package.json`，添加`electron`依赖
```diff
"devDependencies": {
    "@vitejs/plugin-vue": "^4.2.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.0",
    "vue-tsc": "^1.8.3",
+    "electron": "^24.4.0",
+    "electron-builder": "^23.6.0",
+    "vite-plugin-electron": "^0.11.2",
+    "vite-plugin-electron-renderer": "^0.14.5"
  }
```

2. 执行命令，安装依赖
```shell
npm install
```

### 2. 新建 `Electron` 入口文件
1. 在项目根目录下建`electron`主目录 `electron-main`，并在其中建文件夹 `main.ts`
```typescript
// electron-main/main.ts
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,    // 渲染进程使用Node API 
      contextIsolation: false,  // 是否开启隔离上下文
      preload: path.join(__dirname, "../electron-preload/index.ts"), // 需要引用js文件
    },
  });

  // win.loadFile(path.join(__dirname, '../index.html'));

  // 如果打包了，渲染index.html
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../index.html"));
  } else {
    let url = "http://localhost:5173"; // 本地启动的vue项目路径
    win.loadURL(url);
  }
}

app.whenReady().then(() => {
  createWindow(); // 创建窗口

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 关闭窗口
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```
1. 在项目根目录下建`electron`预加载目录 `electron-preload`，并在其中建文件夹 `index.ts`
```typescript
// electron-preload/index.ts
import os from "os";
console.log("platform", os.platform());
```

### 3. 添加 `Electron` 执行脚本

在 `package.json` 文件中，添加 Electron 相关的启动脚本和构建命令。
```diff
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
+    "electron:dev": "electron ./electron-main/main.ts",
+    "electron:build": "vue-tsc && vite build && electron-builder",
+    "electron:serve": " npm run electron:build && npm run electron:dev"
  }
```

### 4. 更新 `Vite` 配置

在项目的根目录下，打开 `vite.config.js` 文件，并在其中添加以下内容：

```typescript
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 开发调试时，只需要加载 vue 插件即可
  // npm run dev && npm run electron:dev
  plugins: [
    vue()
  ],
  // 打包桌面版 需要额外配置 electron renderer插件
  // npm run electron:build
  // plugins: [
  //   vue(),
  //   electron([
  //     {
  //       // Main-Process entry file of the Electron App.
  //       entry: 'electron-main/main.ts',
  //     },
  //     {
  //       entry: 'electron-preload/index.ts',
  //       onstart(options) {
  //         // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
  //         // instead of restarting the entire Electron App.
  //         options.reload()
  //       },
  //     },
  //   ]),
  //   renderer()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})

```

### 5. 运行 `Electron`

1. 需要调整 `vite.config.js` 的插件配置
```typescript
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 开发调试时，只需要加载 vue 插件即可
  // npm run dev && npm run electron:dev
  plugins: [
    vue()
  ],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
```

2. 启动 Vue + Electron 应用程序：
```shell
# 启动web程序
npm run dev

# 启动桌面程序，访问的是web程序
npm run electron:dev
```

### 6. 添加 `electron-builder` 配置
1. 在项目根目录下建文件 `electron-builder.json5`
```json5
// electron-builder.json5
/**
 * @see https://www.electron.build/configuration/configuration
 */
{
  "$schema": "https://raw.githubusercontent.com/electron-userland/electron-builder/master/packages/app-builder-lib/scheme.json",
  "appId": "YourAppID",
  "asar": true,
  "directories": {
    "output": "release/${version}"
  },
  "files": [
    "dist-electron",
    "dist"
  ],
  "mac": {
    "artifactName": "${productName}_${version}.${ext}",
    "target": [
      "dmg"
    ]
  },
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": [
          "x64"
        ]
      }
    ],
    "artifactName": "${productName}_${version}.${ext}"
  },
  "nsis": {
    "oneClick": false,
    "perMachine": false,
    "allowToChangeInstallationDirectory": true,
    "deleteAppDataOnUninstall": false
  }
}
```

2. 在`package.json`中指定 `main`
```diff
-  "type": "module",
+  "type": "commonjs",
+  "main": "dist-electron/main.js"
```

### 7. 构建安装程序
1. 需要调整 `vite.config.js` 的插件配置
```typescript
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 打包桌面版 需要额外配置 electron renderer插件
  // npm run electron:build
  plugins: [
    vue(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron-main/main.ts',
      },
      {
        entry: 'electron-preload/index.ts',
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete, 
          // instead of restarting the entire Electron App.
          options.reload()
        },
      },
    ]),
    renderer()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
```

2. 执行打包
```shell
# 打包安装包，
npm run electron:build
```

此命令将会在 `dist_electron` 目录下生成用于 Electron 的构建输出文件。

安装包输出在 `release/${version}` 目录下，此路径在 `electron-builder.json5` 中配置

## 最终的`package.json`

**注意：** 
1. 需要将 `"type": "module"` 改为 `"type": "commonjs"`否则打包出来的程序运行会报错
2. 在最后添加上程序的作者、描述、License等信息
```json
{
  "name": "torch-web",
  "private": true,
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "electron:dev": "electron ./electron-main/main.ts",
    "electron:build": "vue-tsc && vite build && electron-builder",
    "electron:serve": " npm run electron:build && npm run electron:dev"
  },
  "dependencies": {
    "vue": "^3.3.4"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.0",
    "vue-tsc": "^1.8.3",
    "electron": "^24.4.0",
    "electron-builder": "^23.6.0",
    "vite-plugin-electron": "^0.11.2",
    "vite-plugin-electron-renderer": "^0.14.5"
  },
  "main": "dist-electron/main.js",
  "description": "https://github.com/lorchr/torch-web",
  "author": "Lorch",
  "license": "Apache-2.0"
}
```

## 直接创建 Vite2 Vue3 TS Electron程序
```shell
# 创建文件夹
mkdir torch-web

cd torch-web

# 初始化项目
npm create electron-vite ./

# 安装依赖
npm install

# 测试
npm run dev
```
 
## 参考文档
- [Electron + Vue3 + TS + Vite项目搭建教程！](https://zhuanlan.zhihu.com/p/521239144)
- [Vue3 + TS + Vite2 + Electron16项目梳理](https://juejin.cn/post/7038467111441661960)
