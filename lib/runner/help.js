var fs = require('fs')
var pt = require('path')

var help = function (e, cmd, argv, clt) {
  var cmds = []
  for(var key in clt.runners) {
    cmds.push(key)
  }

  var alias = clt.alias || {}

  cmds = cmds.concat(Object.keys(alias))

  cmds.sort()

  console.debug('cmd：', cmd)

  //一般帮助
  var tips = [
    "\n" + clt.description + "\n",
    "\n用法: " + clt.name + " <command> [<argv>]\n",
    "\n可用命令包括:\n",
    "  " + cmds.join(', ').green
  ]

  if(e) {
    if(e.code === 'COMMAND_NOT_FOUND') {
      console.log(cmd.red + ' 不是合法的命令')
      console.debug(e)
    }else{
      argv.debug && e.stack ? console.debug(e.stack) : console.error(e)
    }
    tips.splice(0, 2)
  }else{
    switch(cmd) {
      case undefined:
      case '':
        break;
      case "help":
        tips.unshift('\n显示下面的帮助文字:\n')
        break;
      default:
        if(alias[cmd]) {
          console.log(' ', cmd.green, '是', alias[cmd].green, '的缩写')
          console.log(' ', (clt.name + ' ' + cmd).green, '同', (clt.name + ' ' + alias[cmd]).green)
        }else {
          var runner = clt.getRunner(cmd)
          runner && runner.help && runner.help(argv)
        }
        return
        break;
    }
  }
  console.log(tips.join(''))
}

exports.run = function(argv, clt) {
  var cmd = argv._[1]

  help(null, cmd, argv, clt)
}

exports.help = function(argv, clt, error) {
  help(error, argv._[0], argv, clt)
}
