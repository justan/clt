#!/usr/bin/env node

var Clt = require('../')
var pt = require('path')
var pkg = require('../package.json')

var clt = new Clt({
  runnerDir: pt.join(__dirname,  '../cmds'),
  name: 'clt',
  description: pkg.description,
  version: pkg.version
})

clt.run()
