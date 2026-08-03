const mongoose = require('mongoose');
const generateSlug = require('../utils/slugify');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    productNameAr: {
      type: String,
      default: '',
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
    categoryAr: {
      type: String,
      default: '',
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
    descriptionAr: {
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
    specificationsAr: {
      type: String,
      default: '',
    },
    // Structured specifications for frontend display (admin-enrichable)
    specDetails: [
      {
        label: { type: String },
        labelAr: { type: String },
        value: { type: String },
        valueAr: { type: String },
      },
    ],
    features: {
      type: [String],
      default: [],
    },
    featuresAr: {
      type: [String],
      default: [],
    },
    applications: {
      type: [String],
      default: [],
    },
    applicationsAr: {
      type: [String],
      default: [],
    },
    industries: {
      type: [String],
      default: [],
    },
    industriesAr: {
      type: [String],
      default: [],
    },
    materials: {
      type: [String],
      default: [],
    },
    materialsAr: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      default: '',
    },
    brandAr: {
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
  productNameAr: 'text',
  category: 'text',
  categoryAr: 'text',
  description: 'text',
  descriptionAr: 'text',
  brand: 'text',
  brandAr: 'text',
  specifications: 'text',
  specificationsAr: 'text',
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
