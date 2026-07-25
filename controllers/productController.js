const Product = require('../models/Product');
const Category = require('../models/Category');
const { success, error, paginated } = require('../utils/apiResponse');
const generateSlug = require('../utils/slugify');

/**
 * @desc    Get all products (with pagination, search, filtering, sorting)
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};

    // Category filter (by category name or categorySlug)
    if (category) {
      const catSlug = generateSlug(category);
      filter.$or = [
        { category: { $regex: new RegExp(`^${category}$`, 'i') } },
        { categorySlug: catSlug },
      ];
    }

    // Search filter (text search across name, category, description, specs)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchFilter = {
        $or: [
          { productName: searchRegex },
          { category: searchRegex },
          { description: searchRegex },
          { brand: searchRegex },
          { specifications: searchRegex },
        ],
      };

      // Merge with category filter if both present
      if (filter.$or) {
        const categoryFilter = filter.$or;
        delete filter.$or;
        filter.$and = [{ $or: categoryFilter }, searchFilter];
      } else {
        Object.assign(filter, searchFilter);
      }
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'name_asc':
        sortOption = { productName: 1 };
        break;
      case 'name_desc':
        sortOption = { productName: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'featured':
        sortOption = { featured: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return paginated(res, 'Products retrieved successfully', products, {
      currentPage: pageNum,
      totalPages,
      totalProducts: total,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single product by slug
 * @route   GET /api/products/:slug
 * @access  Public
 */
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return error(res, 404, 'Product not found');
    }

    return success(res, 200, 'Product retrieved successfully', product);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 8);
    const products = await Product.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limit);

    return success(res, 200, 'Featured products retrieved successfully', products);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get related products (same category, excluding current)
 * @route   GET /api/products/related/:slug
 * @access  Public
 */
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return error(res, 404, 'Product not found');
    }

    const limit = Math.min(10, parseInt(req.query.limit) || 4);
    const related = await Product.find({
      categorySlug: product.categorySlug,
      _id: { $ne: product._id },
    })
      .limit(limit)
      .sort({ featured: -1, createdAt: -1 });

    return success(res, 200, 'Related products retrieved successfully', related);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Admin
 */
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    // Update category product count
    await Category.findOneAndUpdate(
      { slug: product.categorySlug },
      { $inc: { productCount: 1 } }
    );

    return success(res, 201, 'Product created successfully', product);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return error(res, 404, 'Product not found');
    }

    const oldCategorySlug = product.categorySlug;

    // Update fields
    Object.assign(product, req.body);
    product.updatedAt = Date.now();
    await product.save(); // Triggers pre-save hooks (slug regeneration)

    // If category changed, update counts
    if (oldCategorySlug !== product.categorySlug) {
      await Category.findOneAndUpdate(
        { slug: oldCategorySlug },
        { $inc: { productCount: -1 } }
      );
      await Category.findOneAndUpdate(
        { slug: product.categorySlug },
        { $inc: { productCount: 1 } }
      );
    }

    return success(res, 200, 'Product updated successfully', product);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return error(res, 404, 'Product not found');
    }

    await product.deleteOne();

    // Update category product count
    await Category.findOneAndUpdate(
      { slug: product.categorySlug },
      { $inc: { productCount: -1 } }
    );

    return success(res, 200, 'Product deleted successfully');
  } catch (err) {
    next(err);
  }
};
