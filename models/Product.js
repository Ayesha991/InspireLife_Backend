const mongoose = require('mongoose');
const generateSlug = require('../utils/slugify');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    categorySlug: {
      type: String,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    gallery: {
      type: [String],
      default: [],
    },
    datasheet: {
      type: String,
      default: '',
    },
    // Raw specifications string from CSV
    specifications: {
      type: String,
      default: '',
    },
    // Structured specifications for frontend display (admin-enrichable)
    specDetails: [
      {
        label: { type: String },
        value: { type: String },
      },
    ],
    features: {
      type: [String],
      default: [],
    },
    applications: {
      type: [String],
      default: [],
    },
    industries: {
      type: [String],
      default: [],
    },
    materials: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search across multiple fields
productSchema.index({
  productName: 'text',
  category: 'text',
  description: 'text',
  brand: 'text',
  specifications: 'text',
});

// Auto-generate slug before saving
productSchema.pre('save', async function (next) {
  if (this.isModified('productName') || !this.slug) {
    let baseSlug = generateSlug(this.productName);
    let slug = baseSlug;
    let counter = 1;

    // Handle duplicate slugs
    while (await mongoose.models.Product.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  if (this.isModified('category') || !this.categorySlug) {
    this.categorySlug = generateSlug(this.category);
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);
