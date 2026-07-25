const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDownloads, createDownload, deleteDownload } = require('../controllers/downloadController');

// Public — get all downloads
router.get('/', getDownloads);

// Admin — manage downloads
router.post('/', protect, createDownload);
router.delete('/:id', protect, deleteDownload);

module.exports = router;
