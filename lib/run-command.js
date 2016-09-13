'use strict';

var Promise = require('bluebird');
var NodeGit = require("nodegit");
var Tentacles = require('tentacles');
var Context = require('./context');

var conf = require('rc')('gitter-workflow', {
  accessToken: '',
  workflowLabels: [
    'prioritised',
    'ready',
    'in progress',
    'pending review',
    'needs rework',
    'review complete',
    'develop',
    'staging'
  ],
  lifecycleLabels: [
    'in_develop',
    'in_staging',
    'in_production'
  ]
}, { });

module.exports = function(fn) {
  return function(argv) {
    return Promise.resolve(NodeGit.Repository.open("."))
      .bind({
        conf: conf
      })
      .then(function(repository) {
        this.repository = repository;
        return repository.head();
      })
      .then(function(ref) {
        this.branch = ref.shorthand();
        return this.repository.getRemote('origin');
      })
      .then(function(remote) {
        var remoteUrl = remote.url();
        var repoUrl = remoteUrl.split(':')[1];
        repoUrl = repoUrl.replace(/\.git$/, '');
        this.repoUrl = repoUrl;
        this.github = new Tentacles({ accessToken: conf.accessToken });

        return fn(argv, new Context(this));
      })
      .catch(function(err) {
        console.log(err);
        console.log(err.stack);
        process.exit(1);
      })

  }
}
