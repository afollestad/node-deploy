const PrefsInteractor = require('../interactors/PrefsInteractor');
const path = require('path');
const prefs = new PrefsInteractor(`${__dirname}${path.sep}storage.json`);
const git = require("simple-git");

const loginIfNeeded = require('./login').loginIfNeeded;
const promptAndPerformLogin = require('./login').promptAndPerformLogin;
const post = require('./network').post;

const blue = require('colors').blue;
const red = require('colors').red;

/**
 * @param {string} id
 * @param {string} msg
 * @param {string} branch
 * @param {boolean} deploying
 */
exports.performer = async (id, msg, branch, deploying = false) => {
  if (!msg) {
    msg = 'Committed by afollestad/node-deploy';
  }
  if (!branch) {
    branch = 'master';
  }
  console.log(`Committing local changes... "${msg}"`);
  return new Promise((resolve, reject) => {
    git(process.cwd()).commit(msg, {'-a': null}, (err) => {
      if (err) {
        console.log(red(`Failed to commit 😞  ${err}\n`));
        return;
      }

      console.log(`Pushing changes to ${branch}...`);
      git(process.cwd()).push('origin', branch, (err) => {
        if (err) {
          console.log(red(`Failed to push 😞  ${err}\n`));
          return;
        }

        if (deploying) {
          console.log(`Deploying project ${blue(id)}...`);
        } else {
          console.log(`Updating project ${blue(id)}...`);
        }

        prefs.getHost().then(host => {
          const uri = `${host}/projects/update/${id}?branch=${branch}`;
          return loginIfNeeded().then(token => {
            return post(uri, {}, promptAndPerformLogin, {Token: token.value});
          })
          .then(() => {
            if (!deploying) {
              console.log(`Project ${blue(id)} updated! 😊\n`)
            }
            resolve();
          });
        })
        .catch(err => {
          reject(new Error(red(`Project updating failed 😞  ${err}\n`)));
        });
      });
    });
  });
};

/**
 * @param {Command} program
 */
exports.attach = (program) => {
  program
  .command('update [id]')
  .description('Updates a remote project by pulling down changes.')
  .option("-b, --branch [remote-branch]",
      "The Git branch to pull changes from, defaults to master.")
  .option("-m, --message [commit-message]",
      "The message used to commit changes to Git.")
  .action((id, params) => {
    exports.performer(id, params.message, params.branch)
    .catch(err => {
      if (err.message) {
        console.log(err.message);
      } else {
        console.log(err);
      }
    });
  });
};