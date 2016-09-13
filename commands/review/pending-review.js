'use strict';

var runCommand = require('../../lib/run-command');

exports.command = 'request'

exports.describe = 'Set PR as pending-review'

exports.builder = {};

exports.handler = runCommand(function (argv, context, conf) {
  return context.getPullRequestNumber(argv.pr)
    .then(function(prNumber) {
      return context.setWorkflowLabel(prNumber, 'pending review');
    });
});
