# 一个基本的 JSBridge Demo

![原理](https://github.com/LiuuY/jsbridge/blob/master/docs.png)

## 原理

原生 WebView 定义两个全局函数：`__CallNative` 和 `__NativeCallback`，分别用于 JS 调用原生，和原生回调。
为了避免冲突和对使用者无感，JSBridge 会对每一次调用生成一个唯一的 `callbackID`，JS 调用原生和原生回调时，都要带着（是不是像 JSONP 😆 ）。
`ActionID` 为调用原生能力的名字。
