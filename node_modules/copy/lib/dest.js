'use strict';

var path = require('path');
var utils = require('./utils');

module.exports = function toDest(dir, file, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = utils.extend({overwrite: true}, options);
  opts.cwd = path.resolve(utils.resolve(opts.cwd || '.'));
  if (typeof file === 'string') {
    file = utils.toFile(file, opts);
  }

  var destDir;
  if (typeof dir === 'function') {
    destDir = dir(file);

  } else if (typeof dir === 'string') {
    destDir = dir;

  } else {
    return cb(new TypeError('expected dest to be a string or function.'));
  }

  if (opts.srcBase) {
    file.base = path.resolve(file.cwd, opts.srcBase);
    file.path = path.resolve(file.base, file.relative);
  }

  if (opts.destBase) {
    destDir = path.resolve(opts.destBase, destDir);
  } else if (utils.isAbsolute(destDir)) {
    destDir = path.resolve(opts.cwd, path.resolve(destDir));
  } else {
    destDir = path.join(opts.cwd, destDir);
  }

  // update file path with destination directory
  if (opts.flatten === true || typeof file.path === 'undefined') {
    file.path = path.join(destDir, file.basename);
  } else {
    file.path = path.resolve(destDir, file.relative);
  }

  // update file extension
  if (typeof opts.ext === 'string') {
    if (opts.ext !== '' && opts.ext.charAt(0) !== '.') {
      opts.ext = '.' + opts.ext;
    }
    file.extname = opts.ext;
  }

  file.dest = file.path;
  cb(null, file);
};

function isRelative(dest) {
  return path.relative(process.cwd(), path.resolve(dest)) === dest;
}
