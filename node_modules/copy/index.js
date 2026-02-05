'use strict';

var path = require('path');
var toDest = require('./lib/dest');
var invalid = require('./lib/invalid');
var utils = require('./lib/utils');
var base = require('./lib/base');

/**
 * Copy a filepath, vinyl file, array of files, or glob of files to the
 * given destination `directory`, with `options` and callback function that
 * exposes `err` and the array of vinyl files that are created by the copy
 * operation.
 *
 * ```js
 * copy('*.js', 'dist', function(err, file) {
 *   // exposes the vinyl `file` created when the file is copied
 * });
 * ```
 * @param {String|Object|Array} `patterns` Filepath(s), vinyl file(s) or glob of files.
 * @param {String} `dir` Destination directory
 * @param {Object|Function} `options` or callback function
 * @param {Function} `cb` Callback function if no options are specified
 * @api public
 */

function copy(patterns, dir, options, cb) {
  if (arguments.length < 3) {
    return invalid.apply(null, arguments);
  }

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = utils.extend({cwd: process.cwd()}, options);
  opts.cwd = path.resolve(opts.cwd);
  patterns = utils.arrayify(patterns);

  if (!utils.hasGlob(patterns)) {
    copyEach(patterns, dir, opts, cb);
    return;
  }

  opts.patterns = patterns;
  if (!opts.srcBase) {
    opts.srcBase = path.resolve(opts.cwd, utils.parent(patterns));
  }

  utils.glob(patterns, opts, function(err, files) {
    if (err) {
      cb(err);
      return;
    }

    copyEach(files, dir, opts, cb);
  });
}

/**
 * Copy an array of files to the given destination `directory`, with
 * `options` and callback function that exposes `err` and the array of
 * vinyl files that are created by the copy operation.
 *
 * ```js
 * copy.each(['foo.txt', 'bar.txt', 'baz.txt'], 'dist', function(err, files) {
 *   // exposes the vinyl `files` created when the files are copied
 * });
 * ```
 * @name .copy.each
 * @param {Array} `files` Filepaths or vinyl files.
 * @param {String} `dir` Destination directory
 * @param {Object|Function} `options` or callback function
 * @param {Function} `cb` Callback function if no options are specified
 * @api public
 */

function copyEach(files, dir, options, cb) {
  if (arguments.length < 3) {
    return invalid.apply(null, arguments);
  }

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = utils.extend({}, options);
  if (typeof opts.cwd === 'undefined') {
    opts.cwd = process.cwd();
  }

  if (!opts.srcBase && opts.patterns) {
    opts.srcBase = path.resolve(opts.cwd, utils.parent(opts.patterns));
  }

  utils.each(files, function(filename, next) {
    var filepath = path.resolve(opts.cwd, filename);
    if (utils.isDirectory(filepath)) {
      next()
      return;
    }
    copyOne(filepath, dir, opts, next);
  }, function(err, arr) {
    if (err) {
      cb(err);
      return;
    }
    cb(null, arr.filter(Boolean));
  });
}

/**
 * Copy a single `file` to the given `dest` directory, using
 * the specified options and callback function.
 *
 * ```js
 * copy.one('foo.txt', 'dist', function(err, file) {
 *   if (err) throw err;
 *   // exposes the vinyl `file` that is created when the file is copied
 * });
 * ```
 * @name .copy.one
 * @param {String|Object} `file` Filepath or vinyl file
 * @param {String} `dir` Destination directory
 * @param {Object|Function} `options` or callback function
 * @param {Function} `cb` Callback function if no options are specified
 * @api public
 */

function copyOne(file, dir, options, cb) {
  if (arguments.length < 3) {
    return invalid.apply(null, arguments);
  }

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  var opts = utils.extend({}, options);
  if (typeof opts.cwd === 'undefined') {
    opts.cwd = process.cwd();
  }
  if (typeof file === 'string') {
    file = path.resolve(opts.cwd, file);
  }

  if (!opts.srcBase && opts.patterns) {
    opts.srcBase = path.resolve(opts.cwd, utils.parent(opts.patterns));
  }

  toDest(dir, file, opts, function(err, out) {
    if (err) {
      cb(err);
      return;
    }

    base(file, out.path, opts, function(err) {
      if (err) {
        cb(err);
        return;
      }

      cb(null, out);
    });
  });
}

/**
 * Expose `copy`
 */

module.exports = copy;
module.exports.one = copyOne;
module.exports.each = copyEach;
