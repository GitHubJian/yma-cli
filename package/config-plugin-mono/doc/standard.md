# MONO-REPO

## 规范

我们必须遵循 mono-repo 规范进行文件夹仓库的搭建

## 目录结构

```
.
├── lerna.json
├── package
│   ├── common
│   │   ├── package.json
│   │   ├── src
│   │   │   └── export
│   │   │       ├── base
│   │   │       │   ├── component
│   │   │       │   │   └── nav-bar
│   │   │       │   │       ├── index.ts
│   │   │       │   │       └── main.vue
│   │   │       │   └── index.ts
│   │   │       ├── polyfill
│   │   │       │   └── index.ts
│   │   │       └── util
│   │   │           └── index.ts
│   │   ├── tsconfig.json
│   │   └── yma.config.js
│   └── core
│       ├── package.json
│       ├── src
│       │   └── page
│       │       └── home
│       │           ├── App.vue
│       │           └── index.ts
│       ├── tsconfig.json
│       └── yma.config.js
├── package.json
├── script
│   └── build.sh
├── shims.d.ts
├── tsconfig.json
└── yarn.lock
```

#### Common 规范

-   src/export/\* 的形式进行导出模块维护管理
-   每一个 export/\* 都是是一个导出模块，默认导出为 `index.j|ts`
-   对于第三方应用，必须以 vendors 的形式导出，详见 yma.config.js 中配置
-   package.json 中 monoCommon 必须为 true，不可以存在 monoDependencies

#### Core 规范

-   src/page/\* 的形式进行页面维护
-   每一个 page/\* 都是一个页面，默认导出为 `index.j|ts`
-   package.json 中 monoDependencies 需要配置依赖模块名，`key: path`, 其中 key 必须以 common 文件夹名，path 必须是相对 package.json 的路径
