const { body } = require('express-validator');

exports.contactRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be under 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters'),
  body('company')
    .optional()
    .trim(),
  body('phone')
    .optional()
    .trim(),
  body('country')
    .optional()
    .trim(),
  body('subject')
    .optional()
    .trim(),
];
