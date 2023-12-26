import * as fs from "fs";
import * as pt from "path";
import * as readline from "readline";
import minimist from "minimist";

import "colors";

//默认的参数缩写
var baseAlias = {
  help: ["h"],
  //debug: ['d'],
  version: ["v"],
};

// 支持 ts 扩展名，在某些开发状态有用
const JS_EXT = [".js", ".mjs", ".cjs", ".ts"];

/**
 * 命令行工具构造函数
 * @constructor
 * @param {Object} opts 参数项. 会 merge 到实例对象中
 * @param {String} opts.runnerDir runner 存放目录
 * @param {String} [opts.name] 改命令行工具名, 默认显示在帮助中
 * @param {String} [opts.description] 当前工具描述, 默认显示在帮助中
 * @param {String} [opts.version] 当前版本 `--version` 时显示
 * @param {Object} [opts.optionAlias] 参数缩写. 如: `{  help: ['h'] }`
 * @param {Object} [opts.alias] 命令缩写映射. 如存在 alias `{ ll: 'ls -l' }` 时, `clt ll` 等效于 `clt ls -l`
 */
export default class Clt {
  cmd = "";
  version = "";
  argv = null;
  runners = {};
  runner = null;

  alias = null;
  innerRunnerDir = new URL("./runner", import.meta.url).pathname;
  constructor(opts) {
    opts = opts || {};

    Object.assign(this, opts);

    var alias = opts.alias || {};

    var argv = minimist(process.argv.slice(2), {
      //参数缩写
      alias: Object.assign({}, baseAlias, this.optionAlias),
    });

    this.cmd = argv._[0] && argv._[0] + "";

    //如果有命令缩写，则重新解析一次
    if (alias[this.cmd]) {
      process.argv.splice.apply(
        process.argv,
        [2, 1].concat(alias[this.cmd].split(/\s+/))
      );
      argv = this.argv = minimist(process.argv.slice(2), {
        //参数缩写
        alias: Object.assign({}, baseAlias, this.optionAlias),
      });

      this.cmd = argv._[0] && argv._[0] + "";
    }

    this.argv = argv;
    this.runners = this._getRunners();

    //非 `debug` 模式时, 忽略所有 `console.debug` 输出
    console.debug = function () {
      if (argv.debug) {
        console.log.apply(console, arguments);
      }
    };

    //var stdin = process.openStdin()
    //process.stdin.pipe(process.stdout)

    console.debug(this.argv);
  }

  async run(extra) {
    var cmd = this.cmd;
    var argv = this.argv;
    var err = null;
    var runner = null;

    if (cmd) {
      runner = await this.getRunner(cmd);

      if (!runner) {
        err = new Error("Cannot find command " + cmd);
        err.code = "COMMAND_NOT_FOUND";
        runner = await this.getRunner("help");
      }
    } else {
      //检查版本
      if (argv.version) {
        console.log(this.version);
        return;
      }

      runner = await this.getRunner("help");
    }

    this.runner = runner;

    //console.debug('runner:', runner)

    //如果 runner 定义了参数缩写, 则重新解析下入参
    if (runner.alias) {
      argv = this.argv = minimist(process.argv.slice(2), {
        alias: Object.assign({}, baseAlias, this.optionAlias, runner.alias),
      });
    }

    //报错 || --help || 没传任何有效命令和参数
    if (err || argv.help || !cmd) {
      runner.help && runner.help(argv, this, err);
      return;
    }

    if (runner.run) {
      try {
        await runner.run(argv, this, extra);
      } catch (err) {
        console.debug(err);
        process.exit((err && err.code) || 1);
      }
    } else {
      console.debug(runner.path + " 没有定义 run 方法");
    }
  }

  /**
   * 获取预定义的命令
   * @private
   * @param  {String} [type=all] 命令类型, inner: cli 内部命令, user: 用户定义的命令
   * @return {Object}      支持的命运列表, 如: {help: { type: 'inner', path: 'path/to/lib/runner' }}
   */
  _getRunners(type) {
    var runners = {};
    var that = this;
    //内置命令
    if (type !== "user") {
      fs.readdirSync(this.innerRunnerDir).forEach(function (file) {
        if (JS_EXT.includes(pt.extname(file)) && !file.endsWith(".d.ts")) {
          var cmd = pt.basename(file, pt.extname(file));
          runners[cmd] = {
            name: cmd,
            path: pt.join(that.innerRunnerDir, file),
            type: "inner",
          };
        }
      });
    }

    //用户命令
    if (type !== "inner") {
      fs.readdirSync(this.runnerDir).forEach(function (file) {
        if (JS_EXT.includes(pt.extname(file)) && !file.endsWith(".d.ts")) {
          var cmd = pt.basename(file, pt.extname(file));
          runners[cmd] = {
            name: cmd,
            path: pt.join(that.runnerDir, file),
            type: "user",
          };
        }
      });
    }

    return runners;
  }
  /**
   * 获取一个 `runner` 对象
   * @param  {String} cmd 命令名称
   * @return {Object}     runner
   */
  async getRunner(cmd) {
    var runner = null;
    var conf = this.runners[cmd];

    if (conf) {
      if (conf.run) {
        runner = conf;
      } else {
        runner = await import(conf.path);
      }
    }
    return runner
      ? Object.assign(
          {
            cmd: cmd,
            clt: this,
          },
          runner
        )
      : null;
  }
  /**
   * 添加一个 'runner'.
   * 除了在 'runnerDir' 重定义 'runner', 你也可以是所有该方法定义一个 'runner'
   * @param  {String} cmd    命令名称
   * @param  {Object} runner runner 预定义对象
   */
  addRunner(cmd, runner) {
    this.runners[cmd] = runner;
  }
  /**
   * 显示 loading. 重写该方法可以自定义 loading
   * @return {[type]} [description]
   */
  showLoading() {
    var procs = ["-", "\\", "|", "/"];
    var i = 0;

    this._loadingTimer = setInterval(function () {
      process.stdout.write("\b" + procs[i % procs.length]);
      i++;
    }, 100);
  }
  /**
   * 隐藏loading. 如果有自定义 loading 则需要同时定义响应的 `hideLoading` 方法
   * @return {[type]} [description]
   */
  hideLoading() {
    process.stdout.write("\b");
    clearInterval(this._loadingTimer);
  }

  /**
   * 获取用户输入
   * @param  {String} [tip] 输入提示
   * @return {Promise} resolve(data) “data” 为用户输入结果
   */
  getInput(tip) {
    var stdin = process.stdin;

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(function (resolve, reject) {
      tip = tip || "";

      rl.question(tip, function (text) {
        resolve(text.trim());
        rl.close();
      });

      rl.on("SIGINT", function () {
        rl.close();
        reject();
      });
    });
  }
}
