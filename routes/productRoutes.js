const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { createProductRules, updateProductRules } = require('../validators/productValidator');
const validate = require('../utils/validate');

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/related/:slug', getRelatedProducts);
router.get('/:slug', getProductBySlug);
router.get('/', getProducts);

// Admin routes
router.post('/', protect, createProductRules, validate, createProduct);
router.put('/:id', protect, updateProductRules, validate, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
