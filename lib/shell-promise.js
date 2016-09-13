'use strict';

var Promise = require('bluebird');
var onExit = require('signal-exit')
var exec = require('child_process').exec;
var debug = require('debug')('gw:shell');

function shell(shellCommand) {
  debug('shell: %s', shellCommand);
  var remove;

  return new Promise(function(resolve, reject) {
    var childProcess = exec(shellCommand, function(error, stdout, stderr) {
      if (error) {
        return reject(error);
      }

      resolve(stdout);
    });

    remove = onExit(function (code, signal) {
      childProcess.kill(signal);
    });

  })
  .finally(function() {
    if (remove) {
      remove();
    }
  });
}

module.exports = shell;
