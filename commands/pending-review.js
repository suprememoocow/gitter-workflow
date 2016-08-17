'use strict';

var runCommand = require('../lib/run-command');

exports.command = 'pending-review'

exports.describe = 'Set PR as pending-review'

exports.builder = function(yargs) {
  return yargs.option('u', {
    alias: 'url',
    describe: 'the URL to make an HTTP request to'
  });
};

exports.handler = runCommand(function (argv, context) {
  return context.github.pullRequest.listForRepo(context.repoUrl, { query: { head: 'troupe:' + context.branch }})
    .then(function(repos) {
      if (repos.length === 0) throw new Error('Branch PR not found for ' + context.branch);
      if (repos.length > 1) throw new Error('Multiple branches found for ' + context.branch)
      console.log(repos[0].number);
    })
});
