const fs = require('fs');
const moment = require('moment');
const colors = require('colors');

class Logger {

  /**
   * @param {string} logPath
   */
  constructor(logPath) {
    this.logPath = logPath;
  }

  /**
   * @param {string} tag
   * @param {string} message
   * @param {boolean} error
   * @returns {Promise.<void>}
   */
  async log(tag, message, error = false) {
    tag = moment().format('h:mma MM/DD') + ' ' + tag;
    let fullMsg = `[${tag}]: ${message}`.replace('\n', '');
    return new Promise(resolve => {
      fs.appendFile(this.logPath, `${fullMsg}\n`, function (err) {
        if (error) {
          fullMsg = colors.red(error);
        }
        console.log(fullMsg);
        if (err) {
          console.log('OH NO! Failed to write to log file! ' + err);
        }
        resolve();
      });
    });
  };
}

module.exports = Logger;