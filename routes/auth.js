const express = require('express');
const router = express.Router();

const Credentials = require('../interactors/Credentials');
const defaultRateLimitWindowMs = require(
    '../utilities/util').defaultRateLimitWindowMs;
const createRateLimiter = require('../utilities/util').createRateLimiter;

/**
 * Does one-time initial account setup; providing credentials, a projects folder,
 * along with the default auth token lifespan.
 */
router.post('/setup',
    createRateLimiter(defaultRateLimitWindowMs, 2, 4000, 10),
    function (req, res, next) {
      req.prefs.hasCredentials()
      .then((hasCredentials) => {
        if (hasCredentials) {
          res.sendError(
              'Credentials have already been setup. Change them from the settings.json file.',
              403);
          return;
        }

        const user = req.body.username;
        const pass = req.body.password;
        const confirm = req.body.confirm_password;
        let projectsFolder = req.body.projects_folder;
        let tokenLifespan = req.body.token_lifespan;

        if (!tokenLifespan) {
          tokenLifespan = 60;
        }
        if (!projectsFolder || projectsFolder.length === 0) {
          projectsFolder = process.env.HOME || process.env.HOMEPATH
              || process.env.USERPROFILE;
        }

        if (!user || !pass || !confirm) {
          res.sendError('Missing parameters.');
          return;
        } else if (pass !== confirm) {
          res.sendError('Password and confirmation didn\'t match.');
          return;
        }

        const credentials = new Credentials({
          user: user,
          pass: pass
        });
        return req.prefs.setCredentials(credentials)
        .then(() => {
          return req.prefs.setTokenLifespan(parseInt(tokenLifespan));
        })
        .then(() => {
          return req.prefs.setProjectsFolder(projectsFolder);
        })
        .then(() => {
          console.log(`Server setup by IP ${req.ip}`);
          res.sendSuccess({projects_folder: projectsFolder});
        });
      }).catch(next);
    });

/**
 * Retrieves an authentication token from a username and password.
 */
router.post('/login',
    createRateLimiter(defaultRateLimitWindowMs / 2, 30, 3000, 60),
    function (req, res, next) {
      const user = req.body.username;
      const pass = req.body.password;

      if (!user || !pass) {
        res.sendError('Missing parameters.');
        return;
      }

      req.auth.generateToken(user, pass)
      .then((token) => {
        console.log(`Token given to IP ${req.ip}`);
        res.sendSuccess({token: token.asJson()});
      })
      .catch(next);
    });

module.exports = router;
