const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');
const git = require("simple-git");

const defaultRateLimitWindowMs = require(
    '../utilities/util').defaultRateLimitWindowMs;
const createRateLimiter = require('../utilities/util').createRateLimiter;
const Runner = require('../utilities/Runner');
const hasIllegalPathChars = require('../utilities/util').hasIllegalPathChars;

let childProcessMap = new Map();

/**
 * @param {PrefsInteractor} prefs
 * @param {string} projectId
 * @returns {Promise.<string>}
 */
async function getProjectPath(prefs, projectId) {
  return prefs.getProjectsFolder().then(projectsFolder => {
    const dest = `${projectsFolder}${path.sep}${projectId}`;
    return new Promise((resolve, reject) => {
      if (fs.existsSync(dest)) {
        resolve(dest);
      } else {
        let error = new Error(`No project exists with the ID ${projectId}`);
        error.status = 400;
        reject(error);
      }
    });
  });
}

/**
 * @param {string} p
 */
const getDirs = p => fs.readdirSync(p).filter(
    f => fs.statSync(path.join(p, f)).isDirectory());

/**
 * @param {string} root
 * @returns {Promise.<string>}
 */
async function getProjectRunner(root) {
  return new Promise((resolve, reject) => {
    const binWwwPath = `${root}${path.sep}bin${path.sep}www`;
    const appJsPath = `${root}${path.sep}app.js`;
    if (fs.existsSync(binWwwPath)) {
      resolve(binWwwPath);
    } else if (fs.existsSync(appJsPath)) {
      resolve(appJsPath);
    } else {
      reject(new Error('No runner file detected for this project.'));
    }
  });
}

/**
 * Creates a new project, cloning it to the nodedeploy-server.
 */
router.post('/create',
    createRateLimiter(defaultRateLimitWindowMs / 2, 2000, 2000, 4000),
    function (req, res, next) {
      const id = req.body.id;
      if (hasIllegalPathChars(id)) {
        res.sendError(
            'Project ID cannot contain: " \' ? * . , / \\ or spaces.');
        return;
      }

      const remote = req.body.remote;
      let branch = req.body.branch;
      if (!branch) {
        branch = 'master';
      }

      req.prefs.getProjectsFolder().then(projectsFolder => {

        const dest = `${projectsFolder}${path.sep}${id}`;
        if (fs.existsSync(dest)) {
          res.sendError(`A project by ID ${id} already exists.`);
          return;
        }
        fs.mkdirSync(dest);

        git(projectsFolder).clone(remote, dest, ['-b', branch],
            function (err) {
              if (err) {
                next(err);
                return;
              }
              console.log(`Project ${id} created by IP ${req.ip}`);
              res.sendSuccess({remote_path: dest});
            });

      })
      .catch(next);
    });

/**
 * Updates an existing project, pulling changes down .
 */
router.post('/update/:id',
    createRateLimiter(defaultRateLimitWindowMs / 2, 2000, 2000, 4000),
    function (req, res, next) {
      const id = req.params.id;
      let branch = req.query.branch;
      if (!branch) {
        branch = 'master';
      }
      getProjectPath(req.prefs, id).then(dest => {
        git(dest).pull('origin', branch, (err) => {
          if (err) {
            next(err);
            return;
          }
          console.log(`Project ${id} updated by IP ${req.ip}`);
          res.sendSuccess();
        });
      })
      .catch(next);
    });

/**
 * Lists projects that exist on the nodedeploy-server.
 */
router.get('/list',
    createRateLimiter(defaultRateLimitWindowMs / 2, 2000, 2000, 4000),
    function (req, res, next) {
      req.prefs.getProjectsFolder().then(projectsFolder => {
        // TODO hide folders that aren't actually from Node Deploy
        res.sendSuccess({ids: getDirs(projectsFolder)});
      })
      .catch(next);
    });

/**
 * Runs an existing project, executing the runner.
 */
router.post('/start/:id',
    createRateLimiter(defaultRateLimitWindowMs / 2, 2000, 2000, 4000),
    function (req, res, next) {
      const id = req.params.id;
      if (childProcessMap.has(id)) {
        childProcessMap.get(id).stop();
      }
      let projectPath;
      getProjectPath(req.prefs, id).then(dest => {
        projectPath = dest;
        return getProjectRunner(dest);
      })
      .then(runnerPath => {
        let runner = new Runner(`${projectPath}${path.sep}${id}.log`,
            runnerPath);
        childProcessMap.set(id, runner);
        runner.start();
        console.log(`Project ${id} ran by IP ${req.ip}`);
        res.sendSuccess();
      })
      .catch(next);
    });

/**
 * Stops an existing project that is currently running.
 */
router.post('/stop/:id',
    createRateLimiter(defaultRateLimitWindowMs / 2, 2000, 2000, 4000),
    function (req, res) {
      const id = req.params.id;
      if (childProcessMap.has(id)) {
        childProcessMap.get(id).stop();
        childProcessMap.delete(id);
      } else {
        res.sendError(`Project ${id} is not running.`, 404);
      }
    });

/**
 * Destroys a project, removing it from the nodedeploy-server.
 */
router.post('/destroy/:id',
    createRateLimiter(defaultRateLimitWindowMs / 2, 5, 2000, 10),
    function (req, res, next) {
      const id = req.params.id;
      getProjectPath(req.prefs, id).then(dest => {
        fs.unlinkSync(dest);
        console.log(`Project ${id} was destroyed by IP ${req.ip}`);
        res.sendSuccess();
      })
      .catch(next);
    });

module.exports = router;