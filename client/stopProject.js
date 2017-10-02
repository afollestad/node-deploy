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
 */
function performProjectStop(id) {
  console.log(`Stopping project ${blue(id)}...`);
  prefs.getHost().then(host => {
    const uri = `${host}/projects/stop/${id}`;
    return loginIfNeeded().then(token => {
      return post(uri, {}, promptAndPerformLogin, {Token: token.value});
    })
    .then(() => {
      console.log(`Project ${blue(id)} stopped! 😊\n`)
    });
  })
  .catch(err => {
    console.log(red(`Project stop failed 😞  ${err}\n`));
  });
}

/**
 * @param {Command} program
 */
module.exports = function (program) {
  program
  .command('stop [id]')
  .description('Stops a remote project by killing its runner.')
  .action((id) => performProjectStop(id));
};