const PrefsInteractor = require('../interactors/PrefsInteractor');
const path = require('path');
const prefs = new PrefsInteractor(`${__dirname}${path.sep}storage.json`);

const blue = require('colors').blue;
const red = require('colors').red;
const green = require('colors').green;

const moment = require('moment');
const prompt = require('prompt');
const post = require('./network').post;
const Token = require('../interactors/Token');

/**
 * @returns {Promise.<Token>}
 */
async function needsLogin() {
  return prefs.getAuthToken().then(token => {
    return new Promise(resolve => {
      const now = moment().valueOf();
      if (token && token.expiry > now) {
        resolve(token);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * @returns {Promise.<Token>}
 */
exports.promptAndPerformLogin = () => {
  return prefs.getHost().then(host => {
    return new Promise((resolve, reject) => {
      prompt.message = '';
      prompt.start();
      prompt.get([
        {
          name: 'username',
          type: 'string',
          required: true,
          default: require('os').userInfo().username
        },
        {
          name: 'password',
          type: 'string',
          hidden: true,
          required: true,
          message: 'Password required'
        }
      ], (err, results) => {
        if (results && results.username && results.password) {
          let newToken;
          console.log(`Logging in as ${blue(results.username)}...`);
          post(`${host}/auth/login`, results, null).then(response => {
            newToken = new Token(response.token);
            return prefs.setAuthToken(newToken);
          })
          .then(() => {
            console.log(green('Login successful') + ' 😊');
            resolve(newToken);
          })
          .catch(err => {
            console.log(red(`Login failed 😞  ${err}\n`));
            reject();
          });
        } else {
          console.log();
        }
      });
    });
  });
};

/**
 * @returns {Promise.<Token>}
 */
exports.loginIfNeeded = () => {
  return needsLogin()
  .then((tokenIfValid) => {
    return new Promise(resolve => {
      if (tokenIfValid && tokenIfValid !== null) {
        resolve(tokenIfValid);
        return;
      }
      return exports.promptAndPerformLogin();
    });
  });
};