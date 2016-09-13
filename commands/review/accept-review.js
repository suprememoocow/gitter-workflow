'use strict';

var runCommand = require('../../lib/run-command');

exports.command = 'accept'

exports.describe = 'Accept a review'

exports.builder = {};

exports.handler = runCommand(function (argv, context, conf) {
  return context.getPullRequestNumber(argv.pr)
    .bind({
      prNumber: null
    })
    .then(function(prNumber) {
      this.prNumber = prNumber;
      return context.setWorkflowLabel(prNumber, 'review complete');
    })
    .then(function() {
      return context.replaceReactions(this.prNumber, '+1');
    });
});
