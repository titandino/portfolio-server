const jsonToken = require('jsonwebtoken');
const TOKEN_KEY = process.env.TOKEN_KEY || 'testtestmeme';

module.exports = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {
    jsonToken.verify(token, TOKEN_KEY, function(err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
};
