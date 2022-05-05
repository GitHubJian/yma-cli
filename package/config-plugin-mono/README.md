# config-plugin-mono

## 背景

针对相对稳定的业务，可以通过 NPM 等形式进行模块拆分，但是对于前期快速迭代，很多业务不太成型，而通过 NPM 拆包又将造成不必要的更新上线成本，多仓库上线更加耗时费力

因此需要考虑对前端代码进行代码库模块拆分，经[详细分析](./doc/analysis.md)后，需要开发一个 mono-repo 方案来满足我们的拆分需求，后续可以进行快速的拆包，进行更加稳定的需求拆解

## 安装

> 安装使用之前，请先了解[规范](./doc/standard.md)

基于 YMA 体系插件

## 配置

### Common

-   package.json

```json
{
    "monoCommon": true,
}
```

-   yma.config.js 配置

```js
module.exports = {
    context: __dirname, // 对于 common 模块，context 必须为 **absoulte path**，必填项
    page: {
        vendors: ['vue'], // 对于 common 模块，其 page 为 必填项，其中第三方依赖必须是 vendors
    },
    plugins: ['yma-config-plugin-mono'],
};
```

### Core

-   package.json

```json
{
    "monoDependencies": {
        "common": "../common"
    }
}
```

-   yma.config.js 配置

```js
module.exports = {
    plugins: ['yma-config-plugin-mono'],
};
```
