const Category = require('../models/Category');
const { success, error } = require('../utils/apiResponse');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return success(res, 200, 'Categories retrieved successfully', categories);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single category by slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (!category) {
      return error(res, 404, 'Category not found');
    }

    return success(res, 200, 'Category retrieved successfully', category);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Admin
 */
exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    return success(res, 201, 'Category created successfully', category);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return error(res, 404, 'Category not found');
    }

    Object.assign(category, req.body);
    await category.save();

    return success(res, 200, 'Category updated successfully', category);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return error(res, 404, 'Category not found');
    }

    await category.deleteOne();
    return success(res, 200, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
};
