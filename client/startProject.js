const PrefsInteractor = require('../interactors/PrefsInteractor');
const path = require('path');
const prefs = new PrefsInteractor(`${__dirname}${path.sep}storage.json`);

const loginIfNeeded = require('./login').loginIfNeeded;
const promptAndPerformLogin = require('./login').promptAndPerformLogin;
const post = require('./network').post;

const blue = require('colors').blue;
const red = require('colors').red;

/**
 * @param {string} id
 * @param {boolean} deploying
 */
exports.performer = async (id, deploying=false) => {
  if (!deploying) {
    console.log(`Starting project ${blue(id)}...`);
  }
  return prefs.getHost().then(host => {
    const uri = `${host}/projects/start/${id}`;
    return loginIfNeeded().then(token => {
      return post(uri, {}, promptAndPerformLogin, {Token: token.value});
    })
    .then(() => {
      if (deploying) {
        console.log(`Project ${blue(id)} deployed! 😊\n`)
      } else {
        console.log(`Project ${blue(id)} started! 😊\n`)
      }
    });
  })
  .catch(err => {
    throw new Error(red(`Project start failed 😞  ${err}\n`));
  });
};

/**
 * @param {Command} program
 */
exports.attach = (program) => {
  program
  .command('start [id]')
  .description('Starts a remote project by executing its runner.')
  .action((id) => {
    exports.performer(id).catch(err => console.log(err.message));
  });
};