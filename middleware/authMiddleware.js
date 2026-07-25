const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { error } = require('../utils/apiResponse');

/**
 * Protect routes — verify JWT token from Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 401, 'Not authorized — no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Admin.findById(decoded.id).select('-password');

    if (!req.user) {
      return error(res, 401, 'Not authorized — admin not found');
    }

    next();
  } catch (err) {
    return error(res, 401, 'Not authorized — invalid token');
  }
};

module.exports = { protect };
