const mongoose = require('mongoose');
const generateSlug = require('../utils/slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    nameAr: {
      type: String,
      default: '',
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
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
    productCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before saving
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = generateSlug(this.name);
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
