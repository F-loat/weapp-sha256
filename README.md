# weapp-sha256

> 兼容小程序运行环境的 [sha256](https://github.com/cryptocoinjs/sha256) 实现

## 安装

```bash
npm install weapp-sha256 --save
```

## 使用

```js
import sha256 from 'weapp-sha256';

console.log(sha256('hello')); // "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824" <= Hex-encoded; default
console.log(sha256('hello', { asBytes: true }));  // [44,242,77,186,95,176,163,14,38,232,59,42,197,185,226,158,27,22,30,92,31,167,66,94,115,4,51,98,147,139,152,36] <= Array of bytes
```
