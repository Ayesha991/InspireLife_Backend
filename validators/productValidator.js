const { body } = require('express-validator');

exports.createProductRules = [
  body('productName')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('description')
    .optional()
    .trim(),
  body('image')
    .optional()
    .trim(),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

exports.updateProductRules = [
  body('productName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];
