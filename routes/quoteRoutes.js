const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createQuote, getQuotes } = require('../controllers/quoteController');
const { quoteRules } = require('../validators/quoteValidator');
const validate = require('../utils/validate');

// Public — submit quote request
router.post('/', quoteRules, validate, createQuote);

// Admin — view all quote requests
router.get('/', protect, getQuotes);

module.exports = router;
