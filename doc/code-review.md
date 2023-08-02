# Code Review

## 为什么要做 CR

目标：

## 如何看待 CR

同理心

## CR 的内容

Runtime 时期的一些问题

## CR List

#### 变量命名

good case

```js
let xxxCount = 10; // 以 count | size | length 作为 suffix 表示 数量
let xxxStr = 'title'; // 以 str | content | text 作为 suffix 表示 string
let isXxx = false; // 以 is 作为 prefix 表示 boolean 值
let xxxObj; // 以 obj 作为 suffix 表示 plain object 值
let xxxMap; // 以 map 作为 suffix 表示 map 值
let xxxSet;
let xxxOptions; // 配置项入参
let xxxProps; // react 组件的 props 入参
let xxxSeconds; // 表示 xxx 持续的 秒数
let xxxTime; // 表示 window.Date 的实例
```

#### 常量命名

```js
// 全大写 + 下划线
let MAX_AGE = 10;
```

#### 函数命名

```js
// 前缀，动词 + 名词
let canXxx; // 判断是否可执行某个动作，返回 boolean
let hasXxx; // 判断是否含有某个值，返回 boolean
let checkXxx; // 判断是否为某个值，返回 boolean
let getXxx; // 获取某个值，返回非 boolean
let setXxx; // 设置某个值
let loadXxx; // 加载某些数据
let normalizeXxx;
let parseXxx;
let createXxx;

// 后缀，名词 + 后缀
let xxxThunk;
let xxxReducer;
let xxxAction;
let xxxListener;
let xxxHandler;
let xxxCallback; //
let xxxPify; // promise 函数
```
