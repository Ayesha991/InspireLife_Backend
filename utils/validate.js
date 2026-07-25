const { validationResult } = require('express-validator');
const { error } = require('./apiResponse');

/**
 * Middleware to check express-validator results
 * Place after validator rules in the route chain
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return error(res, 400, messages.join(', '));
  }
  next();
};

module.exports = validate;
