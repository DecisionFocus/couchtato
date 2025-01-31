const log4js = require('log4js'),
  hasher = require('node-object-hash')({ coerce: false }).hash;

/**
 * class Util
 * Util is exposed to couchtato.js task functions.
 *
 * @param {Object} stat: initial stat, used to initialise reportable page and document counts to zero
 * @param {Array} queue: an array of documents waiting to be updated in CouchDB
 * @param {Object} driver: the database driver used by Couchtato, exposed via Util to allow further database operation from task functions
 */
function Util(stat, queue, driver) {
  this.stat = stat || {};
  this.queue = queue || [];
  this.driver = driver;
  log4js.configure({
    appenders: {
      fileAppender: { type: 'file', filename: 'couchtato.log' , level :"INFO"}
    },
    categories: {
      default: { appenders: ['fileAppender'], level: 'DEBUG' }
    }
  });
  this.logger = log4js.getLogger('');

  this.auditItems = [];
  this.hasher = hasher;
}

/**
 * Add a document to the audit array
 *
 * @param {Object} doc: Any document formatted as an object
 */
Util.prototype.audit = function (doc) {
  this.auditItems.push(doc);
};

/**
 * Calculate hash using: https://github.com/SkeLLLa/node-object-hash
 *
 * @param {Object} doc: object to calculate hash for
 */
Util.prototype.hash = function (doc) {
  return this.hasher(doc);
};

/**
 * Increment stat count for existing key.
 * For new key, stat count will be set to increment value.
 *
 * @param {String} key: stat key
 * @param {Number} increment: increment value
 */
Util.prototype.increment = function (key, increment) {
  if (this.stat[key]) {
    this.stat[key] += increment;
  } else {
    this.stat[key] = increment;
  }
};

/**
 * Increment stat count by 1.
 *
 * @param {String} key: stat key
 */
Util.prototype.count = function (key) {
  this.increment(key, 1);
};

/**
 * Queue document for saving, increment save counter.
 *
 * @param {Object} doc: CouchDB document
 */
Util.prototype.save = function (doc) {
  this.count('_couchtato_save');
  this.queue.push(doc);
};

/**
 * Mark and queue document for deletion, increment delete counter.
 *
 * @param {Object} doc: CouchDB document
 */
Util.prototype.remove = function (doc) {
  this.count('_couchtato_remove');

  doc._deleted = true;
  this.queue.push(doc);
};

/**
 * Log message in file.
 *
 * @param {String} message: the message to log
 */
Util.prototype.log = function (message) {
  this.logger.info(message);
};

/**
 * Get stat object containing counts.
 *
 * @return stat object
 */
Util.prototype.getStat = function () {
  return this.stat;
};

/**
 * Get stat object containing counts.
 *
 * @return stat object
 */
Util.prototype.getAudit = function () {
  return this.auditItems;
};

/**
 * Get queue containing docs to be updated.
 *
 * @return queue
 */
Util.prototype.getQueue = function () {
  return this.queue;
};

/**
 * Empty the queue.
 */
Util.prototype.resetQueue = function () {
  this.queue = [];
};

module.exports = Util;
