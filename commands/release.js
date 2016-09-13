'use strict';

exports.command = 'release'

exports.desc = 'Release commands'

exports.builder = function (yargs) {
  return yargs
    .commandDir('release')
    .recommendCommands()
    .demand(1)
    .help()
}

exports.handler = function (argv) {}
