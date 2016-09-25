Object.assign = Object.assign || require('object-assign')
require('es6-promise').polyfill()

var fs = require('fs')
var pt = require('path')
var minimist = require('minimist')

require('colors')

//默认的参数缩写
var baseAlias = {
  help: ['h'],
  //debug: ['d'],
  version: ['v']
}

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
var Clt = function(opts) {
  opts = opts || {}

  Object.assign(this, opts)

  var alias = opts.alias || {}

  var argv = minimist(process.argv.slice(2), {
    //参数缩写
    alias: Object.assign({}, baseAlias, this.optionAlias)
  })

  this.cmd = argv._[0] && (argv._[0] + '')

  //如果有命令缩写，则重新解析一次
  if(alias[this.cmd]) {
    process.argv.splice.apply(process.argv, [2, 1].concat(alias[this.cmd].split(/\s+/)))
    argv = this.argv = minimist(process.argv.slice(2), {
      //参数缩写
      alias: Object.assign({}, baseAlias, this.optionAlias)
    })

    this.cmd = argv._[0] && (argv._[0] + '')
  }

  this.argv = argv
  this.runners = this._getRunners()

  //非 `debug` 模式时, 忽略所有 `console.debug` 输出
  console.debug = function() {
    if(argv.debug) {
      console.log.apply(console, arguments)
    }
  }

  //var stdin = process.openStdin()
  //process.stdin.pipe(process.stdout)

  console.debug(this.argv)
}

Object.assign(Clt.prototype, {
  cmd: '',
  version: '',
  argv: null,
  runner: null,

  alias: null,
  innerRunnerDir: pt.join(__dirname, './runner'),

  run: function(extra) {
    var cmd = this.cmd
    var argv = this.argv
    var err = null
    var runner = null

    if(cmd) {
      runner = this.getRunner(cmd)

      if(!runner) {
        err = new Error('Cannot find command ' + cmd)
        err.code = 'COMMAND_NOT_FOUND'
        runner = this.getRunner('help')
      }

    }else {

      //检查版本
      if(argv.version) {
        console.log(this.version)
        return
      }

      runner = this.getRunner('help')
    }

    this.runner = runner

    //console.debug('runner:', runner)

    //如果 runner 定义了参数缩写, 则重新解析下入参
    if(runner.alias) {
      argv = this.argv = minimist(process.argv.slice(2), {alias: Object.assign({}, baseAlias, this.optionAlias, runner.alias)})
    }

    //报错 || --help || 没传任何有效命令和参数
    if(err || argv.help || !cmd) {
      runner.help && runner.help(argv, this, err)
      return
    }

    if(runner.run) {

      var result = runner.run(argv, this, extra)

      result && result.catch && result.catch(function(err) {
        console.debug(err)
        process.exit(err && err.code || 1)
      })

    }else {
      console.debug(runner.path + ' 没有定义 run 方法')
    }
  },

  /**
   * 获取预定义的命令
   * @private
   * @param  {String} [type=all] 命令类型, inner: cli 内部命令, user: 用户定义的命令
   * @return {Object}      支持的命运列表, 如: {help: { type: 'inner', path: 'path/to/lib/runner' }}
   */
  _getRunners: function(type) {
    var runners = {}
    var that = this
    //内置命令
    if (type !== 'user') {
      fs.readdirSync(this.innerRunnerDir).forEach(function(file) {
        var cmd = pt.basename(file, '.js')
        runners[cmd] = {
          name: cmd,
          path: pt.join(that.innerRunnerDir, file),
          type: 'inner'
        }
      })
    }

    //用户命令
    if (type !== 'inner') {
      fs.readdirSync(this.runnerDir).forEach(function(file) {
        var cmd = pt.basename(file, '.js')
        runners[cmd] = {
          name: cmd,
          path: pt.join(that.runnerDir, file),
          type: 'user'
        }
      })
    }

    return runners
  },
  getRunner: function(cmd) {
    var runner = null
    var conf = this.runners[cmd]

    if(conf) {
      if(conf.run) {

        runner = conf
      }else {
        runner = require(conf.path)
      }
    }
    return runner ? Object.assign({
      cmd: cmd,
      clt: this
    }, runner) : null
  },
  addRunner: function(cmd, runner){
    this.runners[cmd] = runner
  },
  showLoading: function() {
    var procs = ['-', '\\', '|', '/']
    var i = 0

    this._loadingTimer = setInterval(function(){
      process.stdout.write('\b' + procs[i % procs.length])
      i++
    }, 100)
  },
  hideLoading: function() {
    process.stdout.write('\b')
    clearInterval(this._loadingTimer)
  },

  /**
   * 获取用户输入
   * @param  {String} [tip] 输入提示
   * @return {Promise}     resolve(data) “data” 为用户输入结果
   */
  getInput: function(tip) {
    var stdin = process.stdin
    var readline = require('readline')

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    return new Promise(function(resolve, reject) {
      tip = tip || ''

      rl.question(tip, function(text) {
        resolve(text.trim())
        rl.close();
      })

      rl.on('SIGINT', function() {
        rl.close()
        reject()
      })
    })
  }
})

module.exports = Clt
