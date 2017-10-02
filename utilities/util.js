const RateLimit = require('express-rate-limit');

/**
 * @param {number} windowMs
 * @param {number} delayAfterCount
 * @param {number} delayMs
 * @param {number} maxCount
 * @returns {RateLimit}
 */
exports.createRateLimiter = (windowMs, delayAfterCount, delayMs, maxCount) => {
  let options = {
    windowMs: windowMs,
    delayAfter: delayAfterCount,
    delayMs: delayMs,
    max: maxCount,
    message: "Too many requests from your IP address."
  };
  options.handler = function (req, res, /*next*/) {
    if (options.headers) {
      res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000));
    }
    res.sendError(options.message, 429);
  };
  return new RateLimit(options);
};

// 1 hour
exports.defaultRateLimitWindowMs = 1000 * 60 * 60;

/**
 * @param {string} id
 * @returns boolean
 */
exports.hasIllegalPathChars = (id) => {
  return id.indexOf(' ') !== -1
      || id.indexOf('"') !== -1
      || id.indexOf('\'') !== -1
      || id.indexOf('?') !== -1
      || id.indexOf('*') !== -1
      || id.indexOf('.') !== -1
      || id.indexOf(',') !== -1
      || id.indexOf('/') !== -1
      || id.indexOf('\\') !== -1;
};