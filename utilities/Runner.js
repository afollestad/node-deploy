const execFile = require('child_process').execFile;

const Logger = require('./Logger');

class Runner {

  /**
   * @param {string} logPath
   * @param {string} execPath
   */
  constructor(logPath, execPath) {
    this.logger = new Logger(logPath);
    this.execPath = execPath;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    let that = this;

    this.process = execFile('node', [this.execPath]);
    this.process.stdout.on('data', function (data) {
      that.logger.log('INFO', data);
    });
    this.process.stderr.on('data', function (data) {
      that.logger.log('ERROR', data, true);
    });
    this.process.on('close', function (code) {
      that.isRunning = false;
      that.logger.log('EXIT', `Exit code ${code}.`);
    });
  }

  stop() {
    if (!this.isRunning) {
      return;
    }
    this.process.kill();
    this.isRunning = false;
  }
}

module.exports = Runner;