'use strict';

exports.command = 'completion'

exports.describe = 'Generate a completion script'

exports.handler = function (argv) {
  require('yargs').showCompletionScript();
};
