function notAuthenticated(res) {
  res.sendError('Not authorized.', 401);
}

/**
 * Does authentication checks for all incoming requests.
 */
module.exports = function (req, res, next) {
  if (req.path.startsWith('/auth')) {
    next();
    return;
  }

  const token = req.header('Token');
  if (!token) {
    console.log(`IP ${req.ip} made a request without a Token header.`);
    notAuthenticated(res);
    return;
  }

  req.auth.validateToken(token)
  .then(() => next())
  .catch((err) => {
    console.log(`Token validation for ${req.ip}: ${err.message}`);
    next(err);
  });
};
