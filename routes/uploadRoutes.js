const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { isCloudinaryConfigured } = require('../config/cloudinary');
const { success, error } = require('../utils/apiResponse');

/**
 * @desc    Upload product image to Cloudinary (or local fallback)
 * @route   POST /api/upload
 * @access  Admin (protected)
 */
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return error(res, 400, 'Please select an image file to upload');
    }

    let imageUrl = req.file.path;

    // If local fallback storage was used, convert filepath to HTTP URL
    if (!isCloudinaryConfigured()) {
      const filename = req.file.filename;
      const protocol = req.protocol;
      const host = req.get('host');
      imageUrl = `${protocol}://${host}/uploads/products/${filename}`;
    }

    return success(res, 200, 'Image uploaded successfully', {
      imageUrl,
      storage: isCloudinaryConfigured() ? 'cloudinary' : 'local',
      public_id: req.file.filename || req.file.public_id,
    });
  } catch (err) {
    return error(res, 500, err.message || 'Error uploading image');
  }
});

module.exports = router;
