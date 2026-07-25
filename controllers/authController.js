const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { success, error } = require('../utils/apiResponse');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Admin login
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find admin and include password for comparison
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return error(res, 401, 'Invalid credentials');
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return error(res, 401, 'Invalid credentials');
    }

    const token = generateToken(admin._id);

    return success(res, 200, 'Login successful', {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get admin profile
 * @route   GET /api/auth/profile
 * @access  Admin
 */
exports.getProfile = async (req, res, next) => {
  try {
    return success(res, 200, 'Profile retrieved successfully', {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (err) {
    next(err);
  }
};
