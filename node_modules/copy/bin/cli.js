#!/usr/bin/env node

var copy = require('..');
var log = require('log-ok');
var argv = process.argv.slice(2);
var dir = argv.pop();
var patterns = argv;

if (!patterns || !dir) {
  console.log('Usage: copy <patterns> <dir>');
} else {
  copy(patterns, dir, function(err, files) {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    files.forEach(function(file) {
      log(file.relative);
    });
    process.exit(0);
  });
}
