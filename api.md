# Clt

命令行工具构造函数

**Parameters**

-   `opts` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 参数项. 会 merge 到实例对象中
    -   `opts.runnerDir` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** runner 存放目录
    -   `opts.name` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 改命令行工具名, 默认显示在帮助中
    -   `opts.description` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 当前工具描述, 默认显示在帮助中
    -   `opts.version` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 当前版本 `--version` 时显示
    -   `opts.optionAlias` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 参数缩写. 如: `{  help: ['h'] }`
    -   `opts.alias` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 命令缩写映射. 如存在 alias `{ ll: 'ls -l' }` 时, `clt ll` 等效于 `clt ls -l`

# getRunner

获取一个 `runner` 对象

**Parameters**

-   `cmd` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 命令名称

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** runner

# addRunner

添加一个 'runner'.
除了在 'runnerDir' 重定义 'runner', 你也可以是所有该方法定义一个 'runner'

**Parameters**

-   `cmd` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 命令名称
-   `runner` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** runner 预定义对象

# showLoading

显示 loading. 重写该方法可以自定义 loading

Returns **\[type]** [description]

# hideLoading

隐藏loading. 如果有自定义 loading 则需要同时定义响应的 `hideLoading` 方法

Returns **\[type]** [description]

# getInput

获取用户输入

**Parameters**

-   `tip` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** 输入提示

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** resolve(data) “data” 为用户输入结果
