# 合法的第三方依赖

## Usage

```js
const LegalDepsWebpackPlugin = new LegalDepsWebpackPlugin({
    // 若本地安装的非 dayjs@1.0.0 版本，打包构建会报错
    dayjs: '1.0.0',
});
```
