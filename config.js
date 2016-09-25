var fs = require('fs')
var pt = require('path')

/**
 * JSON 文件配置
 * @param  {String} path 配置文件存放地址
 * @constructor
 */
var Config = function(path) {
  var that = this
  this.path = path

  try{
    JSON.parse(fs.readFileSync(this.path, 'utf8'))
  }catch(e) {
    fs.writeFileSync(this.path, '{}', 'utf8')
    this.config = this.get()
  }

  // fs.watch(this.path, function(eventType, filename) {
  //   that.config = that.get()
  // })
}

Object.assign(Config.prototype, {
  set: function(key, value) {
    if(!key) {
      throw new Error('need a key for the value')
    }

    var keys = parseKeyPath(key)
    var lastKey = keys.pop()
    var conf = this.get(keys.join('.'))
    conf[lastKey] = value

    this._save()
  },

  get: function(key) {
    var config
    var keys

    if(this.config){
      config = this.config
    }else {
      config = JSON.parse(fs.readFileSync(this.path, 'utf8'))
      this.config = config
    }
    if(key) {
      keys = parseKeyPath(key)
      return keys.reduce(function(val, _key) {
        return val[_key]
      }, config)
    }else {
      return config
    }
  },

  remove: function(key) {
    if(!key) {
      throw new Error('plese remove a key of config')
    }
    var keys = parseKeyPath(key)
    var lastKey = keys.pop()
    var conf = this.get(keys.join('.'))
    delete conf[lastKey]

    this._save()
  },

  _save: function() {
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 2), 'utf8')
  }
})

var keyPathReg = /(?:\.|\[)/g, bra = /\]/g

//将 keyPath 转为数组形式
//path.key, path[key] --> ['path', 'key']
function parseKeyPath(keyPath){
  return keyPath.replace(bra, '').split(keyPathReg)
}

module.exports = Config
