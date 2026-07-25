const { body } = require('express-validator');

exports.quoteRules = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('Contact person name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('requestedProducts')
    .trim()
    .notEmpty()
    .withMessage('Requested products are required'),
  body('phone')
    .optional()
    .trim(),
  body('country')
    .optional()
    .trim(),
  body('requirements')
    .optional()
    .trim(),
];
