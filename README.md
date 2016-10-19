clt
===

Another nodeJs command line tool

安装
----

```
npm i clt --save
```

用法
----

```js
#!/usr/bin/env node

var Clt = require('../')
var pt = require('path')
var pkg = require('../package.json')

var clt = new Clt({
  runnerDir: pt.join(__dirname,  '../cmds'), //runner 存放目录
  name: 'clt', //命令行名称
  description: pkg.description,
  version: pkg.version
})

clt.run()
```

你的命令可以以文件的形式存在在 'runnerDir' 对应的目录中。

Runner
------

一个 'runner' 需要实现 `run` 和 `help` 这两个方法。其中 `run` 方法需要返回一个 'Promise' 对象

默认参数
-------

- `--help -h` 显示帮助。对某个命令使用时将会调用其 'runner' 的 `help` 方法
- `--version -v` 显示当前版本号
- `--debug` 显示使用 `console.debug` 输出的调试信息
- `--no-color` 禁用彩色输出。你可以使用 `console.log(string.red)` 来进行彩色文字的输出。具体可参考 [colors.js]

API
---

请访问 [api.md](./api.md)

LICENSE
-------

MIT

[colors.js]:https://github.com/Marak/colors.js
