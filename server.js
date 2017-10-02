const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const auth = require('./routes/auth');
const projects = require('./routes/projects');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(require('./middleware/UtilMiddleware'));
app.use(require('./middleware/AuthMiddleware'));

// API end points
app.use('/auth', auth);
app.use('/projects', projects);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// noinspection JSUnusedLocalSymbols
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  let code = err.code;
  if (isNaN(code)) {
    code = undefined;
  }
  res.status(err.status || code || 500);
  res.send({status: 'error', error: err.message});
});

module.exports = app;
