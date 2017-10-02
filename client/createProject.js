const PrefsInteractor = require('../interactors/PrefsInteractor');
const path = require('path');
const prefs = new PrefsInteractor(`${__dirname}${path.sep}storage.json`);

const loginIfNeeded = require('./login').loginIfNeeded;
const promptAndPerformLogin = require('./login').promptAndPerformLogin;

const prompt = require('prompt');
const post = require('./network').post;
const hasIllegalPathChars = require('../utilities/util').hasIllegalPathChars;

const blue = require('colors').blue;
const red = require('colors').red;

/**
 * @param {object} options
 */
function startCreateProject(options) {
  prompt.message = '';
  prompt.override = options;
  prompt.start();
  prompt.get([
    {
      name: 'id',
      description: 'project ID',
      type: 'string',
      required: true,
      message: 'Project ID is required and cannot contain: " \' ? * . , / \\ or spaces.',
      conform: (id) => {
        return !hasIllegalPathChars(id);
      }
    },
    {
      name: 'remote',
      description: 'remote (Git SSH Uri)',
      type: 'string',
      required: true
    },
    {
      name: 'branch',
      description: 'git branch to clone',
      type: 'string',
      required: true,
      default: 'master'
    }
  ], (err, results) => {
    if (results && results.id) {
      performProjectCreate(results);
    } else {
      console.log();
    }
  });
}

/**
 * @param {object} params
 */
function performProjectCreate(params) {
  console.log(`Creating project ${params.id}...`);
  prefs.getHost().then(host => {
    const uri = `${host}/projects/create`;
    return loginIfNeeded().then(token => {
      return post(uri, params, promptAndPerformLogin, {Token: token.value});
    })
    .then(response => {
      console.log(`Project created at ${blue(response.remote_path)}! 😊\n`)
    });
  })
  .catch(err => {
    if (err.message) {
      err = err.message;
    }
    console.log(red(`Project creation failed 😞  ${err}\n`));
  });
}

/**
 * @param {Command} program
 */
module.exports = function (program) {
  program
  .command('create')
  .description('Creates a new remote project.')
  .option("-i, --id [project-id]", "The new project's identifier.")
  .option("-r, --remote [project-remote]",
      "The SSH Uri of an existing GitHub repo for the project.")
  .option("-b, --branch [remote-branch]",
      "The Git branch to clone from, defaults to master.")
  .action((options) => startCreateProject(options));
};