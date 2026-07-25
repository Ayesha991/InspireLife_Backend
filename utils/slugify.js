const slugify = require('slugify');

/**
 * Generate an SEO-friendly slug from a string
 * Example: "Trunnion Mounted Ball Valve" → "trunnion-mounted-ball-valve"
 */
const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

module.exports = generateSlug;
