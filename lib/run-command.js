'use strict';

var Promise = require('bluebird');
var NodeGit = require("nodegit");
var Tentacles = require('tentacles');

var conf = require('rc')('gitter-workflow', {
  accessToken: ''
}, { });

module.exports = function(fn) {
  return function(argv) {
    return Promise.resolve(NodeGit.Repository.open("."))
      .bind({ })
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

        return fn(argv, this);
      })
      .catch(function(err) {
        console.log(err);
        process.exit(1);
      })

  }
}
