'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 * (here, `require` is actually lazy-cache)
 */

require('define-property', 'define');
require('fs-exists-sync', 'exists');
require('file-stat', 'stats');
require('graceful-fs', 'fs');
require('is-buffer');
require('isobject', 'isObject');
require('extend-shallow', 'extend');
require('strip-bom-buffer');
require('strip-bom-string');
require('through2', 'through');
require = fn;

/**
 * Stream byte order marks from a string
 */

utils.stripBom = function(val) {
  if (typeof val === 'string') {
    return utils.stripBomString(val);
  }
  if (utils.isBuffer(val)) {
    return utils.stripBomBuffer(val);
  }
  return val;
};

/**
 * Return true if the given value is a stream.
 */

utils.isStream = function(val) {
  return utils.isObject(val)
    && (typeof val.pipe === 'function')
    && (typeof val.on === 'function');
};

/**
 * Return true if a file exists
 */

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

utils.syncContent = function(file) {
  utils.fileExists(file);

  Object.defineProperty(file, 'content', {
    configurable: true,
    set: function(val) {
      syncContents(this, val);
    },
    get: function() {
      var content;
      if (typeof this._content === 'string') {
        content = this._content;
      } else if (utils.isBuffer(this.contents)) {
        content = this.contents.toString();
      } else {
        content = this.contents;
      }
      return content;
    }
  });
};

utils.syncContents = function(file, options) {
  var opts = utils.extend({}, options);
  utils.syncContent(file);

  Object.defineProperty(file, 'contents', {
    configurable: true,
    set: function(contents) {
      syncContents(this, contents);
    },
    get: function fn() {
      var contents;

      if (utils.isBuffer(this._contents) || utils.isStream(this._contents)) {
        contents = this._contents;
      } else if (opts.read === false || opts.noread === true || !this.exists) {
        contents = null;
      } else if (opts.buffer !== false && this.stat && this.stat.isFile()) {
        contents = utils.stripBom(utils.fs.readFileSync(this.path));
      } else if (this.stat && this.stat.isFile()) {
        contents = utils.fs.createReadStream(this.path);
      }

      syncContents(this, contents);
      return contents;
    }
  });
};

/**
 * Sync the _content and _contents properties on a view to ensure
 * both are set when setting either.
 *
 * @param {Object} `view` instance of a `View`
 * @param {String|Buffer|Stream|null} `contents` contents to set on both properties
 */

function syncContents(file, val) {
  if (typeof val === 'undefined') {
    utils.define(file, '_contents', val);
    utils.define(file, '_content', val);
  }
  if (val === null) {
    file._contents = null;
    file._content = null;
  }
  if (typeof val === 'string') {
    file._contents = new Buffer(val);
    file._content = val;
  }
  if (utils.isBuffer(val)) {
    file._contents = val;
    file._content = val.toString();
  }
  if (utils.isStream(val)) {
    file._contents = val;
    file._content = val;
  }
}

/**
 * Expose utils
 */

module.exports = utils;
