const PrefsInteractor = require('../interactors/PrefsInteractor');
const AuthInteractor = require('../interactors/AuthInteractor');

module.exports = function (req, res, next) {
  res.sendError = function (msg, code = 400) {
    res.status(code);
    res.send({status: 'error', error: msg});
  };
  res.sendSuccess = function (obj) {
    if (!obj) {
      obj = {};
    }
    obj.status = 'success';
    res.send(obj);
  };

  req.prefs = new PrefsInteractor();
  req.auth = new AuthInteractor(req.prefs);

  next();
};