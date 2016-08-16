'use strict';

var NodeGit = require("nodegit");

exports.command = 'pending-review'

exports.describe = 'Set PR as pending-review'

exports.builder = function(yargs) {
  return yargs.option('u', {
    alias: 'url',
    describe: 'the URL to make an HTTP request to'
  });
};

exports.handler = function (argv) {
  NodeGit.Repository.open(".")
    .then(function (repo) {
      console.log(repo);
    })
    .catch(function(err) {
      console.log(err);
    })
};
