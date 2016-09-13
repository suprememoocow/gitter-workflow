'use strict';

exports.command = 'review'

exports.desc = 'Review commands'

exports.builder = function (yargs) {
  return yargs
    .option('pr', {
      alias: 'pull-request',
      describe: 'Number of the pull request'
    })
    .commandDir('review')
    .recommendCommands()
    .demand(1)
    .help()
}

exports.handler = function (argv) {}
