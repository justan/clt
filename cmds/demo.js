exports.run = function(argv, clt) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve()
    }, 2000)
  })
}

exports.alias = {

}

exports.help = function(argv) {
  console.log('这是 demo 命令的帮助')
}
