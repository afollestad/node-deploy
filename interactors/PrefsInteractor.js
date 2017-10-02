const path = require('path');
const rootPath = require('app-root-path');
const jsonfile = require('jsonfile');
const fs = require('fs');

const Token = require('./Token');
const Credentials = require('./Credentials');

class NoCredentialsError extends Error {
  constructor() {
    super();
    this.message = 'No credentials have been added to the deployment nodedeploy-server.';
    this.code = 403;
  }
}

/**
 * Handles persist storage, no other logic.
 */
class PrefsInteractor {

  constructor(settingsFilePath = null) {
    if (settingsFilePath) {
      this.prefFilePath = settingsFilePath;
    } else {
      this.prefFilePath = `${rootPath.path}${path.sep}settings.json`;
    }
    this.cachedStorage = null;
  }

  /**
   * @returns {Promise.<object>}
   */
  async readAll() {
    let that = this;
    return new Promise((resolve, reject) => {
      if (that.cachedStorage !== null) {
        resolve(that.cachedStorage);
        return;
      }
      fs.exists(that.prefFilePath, function (exists) {
        if (exists !== true) {
          that.cachedStorage = {};
          resolve(that.cachedStorage);
          return;
        }
        jsonfile.readFile(that.prefFilePath, function (err, obj) {
          if (err) {
            reject(err);
            return;
          }
          that.cachedStorage = obj;
          resolve(obj);
        });
      });
    });
  }

  /**
   * @returns {Promise.<object>}
   */
  async writeAll() {
    if (this.cachedStorage === null) {
      this.cachedStorage = {};
    }
    let that = this;
    const toWrite = this.cachedStorage;
    return new Promise((resolve, reject) => {
      jsonfile.writeFile(that.prefFilePath, toWrite, function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(toWrite);
      });
    });
  }

  /**
   *
   * @param {string} name
   * @param {*} value
   * @returns {Promise.<void>}
   */
  async write(name, value) {
    let that = this;
    return this.readAll()
    .then(() => {
      that.cachedStorage[name] = value;
      return that.writeAll();
    });
  }

  /**
   * @param {string} name
   * @param {*?} fallback
   * @returns {Promise.<*>}
   */
  async read(name, fallback) {
    return this.readAll()
    .then((storage) => {
      return new Promise(resolve => {
        let returnValue = storage[name];
        if (!returnValue || returnValue === null) {
          returnValue = fallback;
        }
        resolve(returnValue);
      });
    });
  }

  /**
   * @returns {Promise.<string>}
   */
  async getHost() {
    return this.read('host');
  }

  /**
   * @param {string} host
   * @returns {Promise.<object>}
   */
  async setHost(host) {
    return this.write('host', host);
  }

  /**
   * @returns {Promise.<Token>}
   */
  async getAuthToken() {
    return this.read('auth_token')
    .then(tokenJson => {
      return new Promise((resolve) => {
        if (tokenJson) {
          resolve(new Token(tokenJson));
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * @param {Token} token
   * @returns {Promise.<object>}
   */
  async setAuthToken(token) {
    return this.write('auth_token', token.asJson());
  }

  /**
   * @returns {Promise.<boolean>}
   */
  async hasCredentials() {
    return this.read('credentials')
    .then(credentialsJson => {
      return new Promise((resolve) => {
        resolve(credentialsJson && credentialsJson !== null);
      });
    });
  }

  /**
   * @returns {Promise.<Credentials>}
   */
  async getCredentials() {
    return this.read('credentials')
    .then(credentialsJson => {
      return new Promise((resolve, reject) => {
        if (credentialsJson) {
          resolve(new Credentials(credentialsJson));
        } else {
          reject(new NoCredentialsError());
        }
      });
    });
  }

  /**
   * @param {Credentials} credentials
   * @returns {Promise.<object>}
   */
  async setCredentials(credentials) {
    return this.write('credentials', credentials.asJson());
  }

  /**
   * Lifespan in minutes. Defaults to an hour.
   *
   * @returns {Promise.<number>}
   */
  async getTokenLifespan() {
    return this.read('token_lifespan', 60);
  }

  /**
   * @param {number} lifespan Lifespan in minutes, default is 60 (1 hour).
   * @returns {Promise.<object>}
   */
  async setTokenLifespan(lifespan) {
    return this.write('token_lifespan', lifespan);
  }

  /**
   * @returns {Promise.<string>}
   */
  async getProjectsFolder() {
    return this.read('projects_folder', rootPath.path);
  }

  /**
   * @param {string} path
   * @returns {Promise.<object>}
   */
  async setProjectsFolder(path) {
    return this.write('projects_folder', path);
  }
}

module.exports = PrefsInteractor;