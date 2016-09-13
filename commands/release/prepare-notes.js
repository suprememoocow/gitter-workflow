'use strict';

var Promise = require('bluebird');
var runCommand = require('../../lib/run-command');
var shell = require('../../lib/shell-promise');
var _ = require('lodash');

exports.command = 'prepare-notes'

exports.describe = 'Prepare release notes'

exports.builder = {};

exports.handler = runCommand(function (argv, context) {
  return shell('git fetch origin refs/notes/*:refs/notes/*')
    .then(function() {
      return shell('git log master..HEAD --show-notes=pull_request_number --pretty=format:commit:%H%nsubject:%s%npr:%N')
    })
    .then(function(stdout) {
      var commits = [];
      var commit;

      var lines = stdout.split(/\n+/);

      lines.forEach(function(line) {
        if (line.indexOf('commit:') === 0) {
          var sha = line.substring('commit:'.length);
          commit = {
            sha: sha
          };
          commits.push(commit);
        } else if (line.indexOf('subject:') === 0) {
          commit.subject = line.substring('subject:'.length)
        } else if (line.indexOf('pr:') === 0) {
          commit.pr = line.substring('pr:'.length)
        }
      });

      var prs = commits.map(function(commit) {
        if (commit.pr) {
          return commit.pr;
        }

        if (commit.subject.indexOf('Merge pull request #') === 0) {
          return commit.subject.substring('Merge pull request #'.length).split(/\s+/)[0];
        }
      }).filter(Boolean);

      prs = _.uniq(prs);
      prs.sort();

      return Promise.map(prs, function(prNumber) {
        return context.github.pullRequest.get(context.repoUrl, prNumber)
          .then(function(pullRequest) {
            return context.github.issueLabel.listForIssue(context.repoUrl, prNumber)
              .then(function(labels) {
                pullRequest.labels = labels;
                return pullRequest;
              });
          })
      }, { concurrency: 1 });
    })
    .then(function(pullRequests) {
      console.log("| PR | Title | Author | Changes | Changed Files |");
      console.log("|----|-------|--------|---------|---------------|");

      var labelMap = {};

      pullRequests.forEach(function(pullRequest) {
        var number = pullRequest.number;
        var title = pullRequest.title;
        var user = pullRequest.user.login;
        var additions = pullRequest.additions;
        var deletions = pullRequest.deletions;
        var changed_files = pullRequest.changed_files;

        console.log("| #" + number + " | " + title + " | @" + user + " | +" + additions + " -" + deletions + " | " + changed_files + " |");

        var labels = pullRequest.labels.map(function(label) {
          return label.name;
        })
        .filter(function(name) {
          var conf = context.conf;
          if (conf.workflowLabels.indexOf(name) >= 0) return;
          if (conf.lifecycleLabels.indexOf(name) >= 0) return;
          if (name === 'auto-deploy') return;

          return true;
        });

        if (!labels.length) {
          labels.push('n/a')
        }

        labels.forEach(function(name) {
          if (labelMap[name]) {
            labelMap[name]++;
          } else {
            labelMap[name] = 1;
          }
        })
      });


      console.log('');

      console.log("| Label | Pull Requests |");
      console.log("|-------|---------------|");

      Object.keys(labelMap).forEach(function(name) {
        var labelCount = labelMap[name];
        var labelLink;
        if (name === 'n/a') {
          labelLink = 'n/a';
        } else {
          labelLink = '[' + name + '](https://github.com/' + context.repoUrl + '/labels/' + name + ')'
        }
        console.log("| " + labelLink + " | " + labelCount + "|");
      })

    })
});
