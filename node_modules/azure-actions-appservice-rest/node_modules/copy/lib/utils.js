'use strict';

/**
 * Module dependencies
 */

var fs = require('fs');
var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('async-each', 'each');
require('bluebird', 'Promise');
require('extend-shallow', 'extend');
require('file-contents', 'contents');
require('glob-parent');
require('graceful-fs', 'fs');
require('has-glob');
require('is-absolute');
require('matched', 'glob');
require('mkdirp');
require('resolve-dir', 'resolve');
require('to-file');
require = fn;

/**
 * Gets the file stats for a File object.
 *
 * @param  {Object} `file` File object that has a `path` property.
 * @return {Object} `fs.stat` object if successful. Otherwise an empty object.
 */

utils.stat = function(file) {
  try {
    return fs.lstatSync(file.path);
  } catch (err) {}
  return {};
};

/**
 * Checks if the file is a directory using `fs.lstatSync`.
 *
 * @param  {String|Object} `file` filepath as a string or a file object with a `path` property.
 * @return {Boolean} Returns `true` when the filepath is a directory.
 */

utils.isDirectory = function(file) {
  if (typeof file === 'string') {
    file = {path: file}
  }

  var stat = utils.stat(file);
  if (stat.isDirectory) {
    return stat.isDirectory();
  }
  return false;
};

/**
 * Get the base filepath from a glob.
 *
 * @param {Array|String} `patterns`
 * @return {String}
 */

utils.parent = function(patterns) {
  if (Array.isArray(patterns)) {
    return utils.globParent(patterns[0]);
  }
  return utils.globParent(patterns);
};

/**
 * Cast `val` to an array.
 *
 * @param {any} val
 * @return {Array}
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
