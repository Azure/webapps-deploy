'use strict';

var path = require('path');
var utils = require('./utils');

/**
 * async
 */

function recurse(cwd, callback) {
  var arr = [];

  function lookup(dir, cb) {
    var file = { path: dir, cwd: dir };

    utils.contents.async(file, function(err, res) {
      if (err) {
        cb(err);
        return;
      }

      arr.push(res);

      if (res.stat === null) {
        // temporary. errors are currently silenced in file-stat,
        // once that's updated we'll remove this
        try {
          utils.fs.readdirSync(res.path);
        } catch (err) {
          cb(err);
          return;
        }
      } else if (res.stat && res.stat.isDirectory()) {
        utils.fs.readdir(res.path, function(err, files) {
          if (err) {
            cb(err);
            return;
          }

          res.files = files;
          utils.each(files, function(filename, next) {
            lookup(path.join(dir, filename), next);
          }, cb);
        });
      } else {
        cb();
      }
    });
  }

  lookup(cwd, function(err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null, arr);
  });
}

/**
 * sync
 */

recurse.sync = function(cwd) {
  var files = [];

  function lookup(dir) {
    var file = { path: dir, cwd: dir };

    utils.contents.sync(file);
    files.push(file);

    if (file.stat && file.stat.isDirectory()) {
      file.files = utils.fs.readdirSync(file.path);
      for (var i = 0; i < file.files.length; i++) {
        lookup(path.join(dir, file.files[i]));
      }
    }
  }
  lookup(cwd);
  return files;
};

/**
 * promise
 */

recurse.promise = function(dir, files) {
  files = files || [];

  var readdir = utils.Promise.promisify(utils.fs.readdir);
  return readdir(dir)
    .reduce(function(acc, filename) {
      var filepath = path.join(dir, filename);
      var file = { path: filepath, cwd: dir};
      utils.contents.sync(file);

      if (file.stat && file.stat.isDirectory()) {
        return recurse.promise(file.path, acc);
      }
      return acc.concat(file);
    }, files);
};

/**
 * Expose `recurse`
 */

module.exports = recurse;
