'use strict';

var Promise = require('bluebird');

function Context(options) {
  this.conf = options.conf;
  this.repository = options.repository;
  this.branch = options.branch;
  this.repoUrl = options.repoUrl;
  this.github = options.github;
}

Context.prototype.user = function() {
  if (this._userPromise) return this._userPromise;

  this._userPromise = this.github.user.getAuthUser();

  return this._userPromise;
}

Context.prototype.setWorkflowLabel = function(prNumber, labelToAdd) {
  return this.github.issueLabel.listForIssue(this.repoUrl, prNumber)
    .bind(this)
    .then(function(labels) {
      var labelNeedsAdding = true;
      var promises = [];
      var conf = this.conf;
      var github = this.github;
      var repoUrl = this.repoUrl;

      labels.forEach(function(label) {
        if (label.name === labelToAdd) {
          labelNeedsAdding = false;
        } else {
          if (conf.workflowLabels.indexOf(label.name) >= 0) {
            promises.push(github.issueLabel.removeFromIssue(repoUrl, prNumber, label.name));
          }
        }
      });

      if (labelNeedsAdding) {
        promises.push(github.issueLabel.addToIssue(repoUrl, prNumber, [labelToAdd]));
      }

      return Promise.all(promises);
    });
}

Context.prototype.getPullRequestNumber = Promise.method(function(argPullRequestNumber) {
  if (argPullRequestNumber) return argPullRequestNumber;

  return this.github.pullRequest.listForRepo(this.repoUrl, { query: { head: 'troupe:' + this.branch }})
    .bind(this)
    .then(function(repos) {
      if (repos.length === 0) throw new Error('Branch PR not found for ' + this.branch);
      if (repos.length > 1) throw new Error('Multiple branches found for ' + this.branch)

      return repos[0].number;
    })
});

Context.prototype.replaceReactions = Promise.method(function(prNumber, content) {
    var reactionHeaders = {
      headers: {
        Accept: 'application/vnd.github.squirrel-girl-preview'
      }
    };

    return Promise.join(
      this.user(),
      this.github.reaction.listForIssue(this.repoUrl, prNumber, reactionHeaders)
    )
    .bind(this)
    .spread(function(user, reactions) {
      var login = user.login;
      var reactionNeedsAdding = true;
      var promises = [];
      var github = this.github;
      var repoUrl = this.repoUrl;

      reactions.forEach(function(reaction) {
        if (reaction.user.login !== login) return;
        if (reaction.content === content) {
          reactionNeedsAdding = false;
        } else {
          promises.push(github.reaction.deleteById(reaction.id, reactionHeaders));
        }
      });

      if (reactionNeedsAdding) {
        promises.push(github.reaction.createForIssue(repoUrl, prNumber, { content: content }, reactionHeaders))
      }

      return Promise.all(promises);
    })
});

module.exports = Context;
