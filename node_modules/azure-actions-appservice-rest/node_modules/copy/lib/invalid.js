'use strict';

/**
 * Handle errors for invalid arguments
 *
 * @param {String} `src`
 * @param {String} `dest`
 * @param {Object} `options`
 * @param {Function} `cb` (if async)
 */

function invalidArgs(src, dest, options, cb) {
  // get the callback so we can give the correct errors
  // when src or dest is missing
  if (typeof dest === 'function') cb = dest;
  if (typeof src === 'function') cb = src;
  if (typeof cb !== 'function') {
    throw new TypeError('expected callback to be a function');
  }
  if (typeof src !== 'string') {
    return cb(new TypeError('expected "src" to be a string'));
  }
  if (typeof dest !== 'string') {
    return cb(new TypeError('expected "dest" to be a string'));
  }
}

module.exports = invalidArgs;
