const Download = require('../models/Download');
const { success, error } = require('../utils/apiResponse');

/**
 * @desc    Get all downloadable resources
 * @route   GET /api/downloads
 * @access  Public
 */
exports.getDownloads = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const downloads = await Download.find(filter).sort({ createdAt: -1 });
    return success(res, 200, 'Downloads retrieved successfully', downloads);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a download resource
 * @route   POST /api/downloads
 * @access  Admin
 */
exports.createDownload = async (req, res, next) => {
  try {
    const download = await Download.create(req.body);
    return success(res, 201, 'Download resource created successfully', download);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a download resource
 * @route   DELETE /api/downloads/:id
 * @access  Admin
 */
exports.deleteDownload = async (req, res, next) => {
  try {
    const download = await Download.findById(req.params.id);

    if (!download) {
      return error(res, 404, 'Download resource not found');
    }

    await download.deleteOne();
    return success(res, 200, 'Download resource deleted successfully');
  } catch (err) {
    next(err);
  }
};
