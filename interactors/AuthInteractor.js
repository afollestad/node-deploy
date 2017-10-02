const moment = require('moment');
const uuidv1 = require('uuid/v1');
const Token = require('./Token');

class InvalidTokenError extends Error {
  constructor() {
    super();
    this.message = 'Invalid auth token';
    this.code = 401;
  }
}

class ExpiredTokenError extends Error {
  constructor() {
    super();
    this.message = 'Expired auth token';
    this.code = 401;
  }
}

class InvalidCredentialsError extends Error {
  constructor() {
    super();
    this.message = 'Invalid username or password.';
    this.code = 401;
  }
}

class AuthInteractor {

  /**
   * @param {PrefsInteractor} prefsInteractor
   */
  constructor(prefsInteractor) {
    this.prefs = prefsInteractor;
  }

  /**
   * @param {string} token
   * @returns {Promise.<boolean>}
   */
  async validateToken(token) {
    return this.prefs.getAuthToken()
    .then(storedToken => {
      return new Promise((resolve, reject) => {
        const now = moment().valueOf();
        if (!storedToken || token !== storedToken.value) {
          reject(new InvalidTokenError());
        } else if (storedToken.expiry <= now) {
          reject(new ExpiredTokenError());
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   *
   * @param {string} username
   * @param {string} password
   * @returns {Promise.<Token>}
   */
  async generateToken(username, password) {
    return this.prefs.getCredentials()
    .then(credentials => {
      if (credentials.user !== username || credentials.pass !== password) {
        throw new InvalidCredentialsError();
      }
      return this.prefs.getTokenLifespan()
      .then(lifespan => {
        const token = new Token({
          value: uuidv1(),
          expiry: moment().add(lifespan, 'minutes').valueOf()
        });
        return this.prefs.setAuthToken(token)
        .then(() => {
          return new Promise(resolve => {
            resolve(token);
          });
        });
      });
    });
  }
}

module.exports = AuthInteractor;