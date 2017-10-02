const rp = require('request-promise-native');

/**
 * @param {string} uri
 * @param {function} reauther
 * @param {object} headers
 * @returns {Promise.<object>}
 */
exports.get = (uri, reauther, headers = {}) => {
  const options = {
    method: 'GET',
    uri: uri,
    headers: headers,
    json: true
  };
  return rp(options).catch(function (err) {
    if (typeof err === 'object') {
      if (reauther && reauther !== null && err.statusCode && err.statusCode
          === 401) {
        return reauther().then(token => {
          if (token) {
            headers.Token = token.value;
            return exports.get(uri, reauther, headers);
          }
        });
      }
      if (typeof err.error === 'object') {
        err = err.error;
      }
      if (err.code && err.code === 'ECONNREFUSED') {
        err = 'Connection refused. Check the host and port and try again.';
      } else if (err.code && err.code === 'ENOTFOUND') {
        err = 'Server not found. Check the host and try again.';
      } else if (err.error) {
        err = err.error;
      } else {
        err = JSON.stringify(err);
      }
    }
    throw err;
  });
};

/**
 * @param {string} uri
 * @param {object} data
 * @param {function} reauther
 * @param {object} headers
 * @returns {Promise.<object>}
 */
exports.post = (uri, data, reauther, headers = {}) => {
  const options = {
    method: 'POST',
    uri: uri,
    headers: headers,
    body: data,
    json: true
  };
  return rp(options).catch(function (err) {
    if (typeof err === 'object') {
      if (reauther && reauther !== null && err.statusCode && err.statusCode
          === 401) {
        return reauther().then(token => {
          if (token) {
            headers.Token = token.value;
            return exports.post(uri, data, reauther, headers);
          }
        });
      }
      if (typeof err.error === 'object') {
        err = err.error;
      }
      if (err.code && err.code === 'ECONNREFUSED') {
        err = 'Connection refused. Check the host and port and try again.';
      } else if (err.code && err.code === 'ENOTFOUND') {
        err = 'Server not found. Check the host and try again.';
      } else if (err.error) {
        err = err.error;
      } else {
        err = JSON.stringify(err);
      }
    }
    throw err;
  });
};