'use strict';

var runCommand = require('../../lib/run-command');

exports.command = 'reject'

exports.describe = 'Reject a review'

exports.builder = {};

exports.handler = runCommand(function (argv, context, conf) {
  return context.getPullRequestNumber(argv.pr)
    .bind({
      prNumber: null
    })
    .then(function(prNumber) {
      this.prNumber = prNumber;
      return context.setWorkflowLabel(prNumber, 'needs rework');
    })
    .then(function() {
      return context.replaceReactions(this.prNumber, '-1');
    });
});
