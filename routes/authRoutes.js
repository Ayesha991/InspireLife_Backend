const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { login, getProfile } = require('../controllers/authController');
const { loginRules } = require('../validators/authValidator');
const validate = require('../utils/validate');

// Public — admin login
router.post('/login', loginRules, validate, login);

// Admin — get profile
router.get('/profile', protect, getProfile);

module.exports = router;
