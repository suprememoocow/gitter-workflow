'use strict';

var runCommand = require('../lib/run-command');

exports.command = 'accept-review'

exports.describe = 'Accept a review'

exports.builder = function(yargs) {
  return yargs.option('pr', {
    alias: 'pull-request',
    describe: 'Number of the pull request'
  });
};

exports.handler = runCommand(function (argv, context, conf) {
  return context.getPullRequestNumber(argv.pr)
    .then(function(prNumber) {
      return context.setWorkflowLabel(prNumber, 'review complete');
    });
});
