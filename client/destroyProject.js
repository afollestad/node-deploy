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
function performProjectDestroy(id) {
  console.log(`Destroying project ${id}...`);
  prefs.getHost().then(host => {
    const uri = `${host}/projects/destroy/${id}`;
    return loginIfNeeded().then(token => {
      return post(uri, {}, promptAndPerformLogin, {Token: token.value});
    })
    .then(() => {
      console.log(`Project ${blue(id)} destroyed! 😊\n`)
    });
  })
  .catch(err => {
    console.log(red(`Project destruction failed 😞  ${err}\n`));
  });
}

/**
 * @param {Command} program
 */
module.exports = function (program) {
  program
  .command('destroy [id]')
  .description('Destroys a remote project by removing it from the nodedeploy-server.')
  .action((id) => performProjectDestroy(id));
};