const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createContact, getContacts, updateContactStatus } = require('../controllers/contactController');
const { contactRules } = require('../validators/contactValidator');
const validate = require('../utils/validate');

// Public — submit contact form
router.post('/', contactRules, validate, createContact);

// Admin — view and manage messages
router.get('/', protect, getContacts);
router.put('/:id', protect, updateContactStatus);

module.exports = router;
