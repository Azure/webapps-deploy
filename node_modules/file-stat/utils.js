'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('graceful-fs', 'fs');
require('through2', 'through');
require('fs-exists-sync', 'exists');
require = fn;

utils.fileExists = function(file) {
  if ('exists' in file) return;
  var exists;

  Object.defineProperty(file, 'exists', {
    configurable: true,
    set: function(val) {
      exists = val;
    },
    get: function fn() {
      if (typeof exists === 'boolean') {
        return exists;
      }
      exists = utils.exists(this.path);
      return exists;
    }
  });
};

/**
 * Expose utils
 */

module.exports = utils;
