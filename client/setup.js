const PrefsInteractor = require('../interactors/PrefsInteractor');
const path = require('path');
const prefs = new PrefsInteractor(`${__dirname}${path.sep}storage.json`);

const prompt = require('prompt');
const post = require('./network').post;

let cachedResults = {};

const blue = require('colors').blue;
const red = require('colors').red;

function startSetup() {
  prompt.message = '';
  prompt.override = cachedResults;
  prompt.start();
  prompt.get([
    {
      name: 'host',
      type: 'string',
      required: true,
      message: 'A host is required.'
    },
    {
      name: 'port',
      type: 'number',
      required: true,
      default: 3333
    },
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
      message: 'A password is required.'
    },
    {
      name: 'confirm_password',
      description: 'confirm password',
      type: 'string',
      hidden: true,
      required: true,
      message: 'Confirmation must match your password.',
      conform: (confirm) => {
        const password = prompt.history('password').value;
        return password === confirm;
      }
    },
    {
      name: 'projects_folder',
      description: 'projects folder (defaults to home folder)',
      type: 'string'
    },
    {
      name: 'token_lifespan',
      description: 'token lifespan (minutes)',
      type: 'number',
      default: 60,
      message: 'Lifespan must be at least 5 minutes and less than a year.',
      conform: (tokenLifespan) => {
        return tokenLifespan > 5
            && tokenLifespan < 525600;
      }
    }
  ], (err, results) => {
    if (results && results.host) {
      cachedResults = results;
      performSetup(results);
    }
  });
}

/**
 * @param {object} params
 */
function performSetup(params) {
  let host = params.host;
  if (!host.startsWith('http')) {
    host = `http://${host}`;
  }
  const fullHost = `${host}:${params.port}`;
  const uri = `${fullHost}/auth/setup`;
  console.log('Performing remote setup...');
  post(uri, params, null).then(response => {
    return prefs.setHost(fullHost).then(() => {
      console.log(
          `\nSetup completed successfully 😊  `
          + `Remote projects folder: ${blue(response.projects_folder)}\n`);
    });
  })
  .catch(err => {
    console.log(red(`\nSetup request failed 😞  ${err}\n`));
  });
}

/**
 * @param {Command} program
 */
module.exports = function (program) {
  program
  .command('setup')
  .description('Start the setup flow to link a remote nodedeploy-server.')
  .action(() => startSetup());
};