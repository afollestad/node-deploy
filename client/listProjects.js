const PrefsInteractor = require('../interactors/PrefsInteractor');
const path = require('path');
const prefs = new PrefsInteractor(`${__dirname}${path.sep}storage.json`);

const loginIfNeeded = require('./login').loginIfNeeded;
const promptAndPerformLogin = require('./login').promptAndPerformLogin;
const get = require('./network').get;

const blue = require('colors').blue;
const red = require('colors').red;

function performProjectListing() {
  console.log('Retrieving projects...');
  prefs.getHost().then(host => {
    const uri = `${host}/projects/list`;
    return loginIfNeeded().then(token => {
      return get(uri, promptAndPerformLogin, {Token: token.value});
    })
    .then((response) => {
      console.log(`Projects: ${blue(response.ids.join(', '))}\n`);
    });
  })
  .catch(err => {
    console.log(red(`Project updating failed 😞  ${err}\n`));
  });
}

/**
 * @param {Command} program
 */
module.exports = function (program) {
  program
  .command('list')
  .description('Lists all remote projects.')
  .action(() => performProjectListing());
};