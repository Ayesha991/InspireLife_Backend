const Quote = require('../models/Quote');
const { success, error } = require('../utils/apiResponse');
const { sendEmail } = require('../services/emailService');

/**
 * @desc    Submit a quote request
 * @route   POST /api/quote
 * @access  Public
 */
exports.createQuote = async (req, res, next) => {
  try {
    const quote = await Quote.create(req.body);

    // Send email notification asynchronously
    sendEmail({
      replyTo: quote.email,
      subject: `New Quote Request from ${quote.companyName}`,
      text: `Company: ${quote.companyName}\nContact Person: ${quote.contactPerson}\nEmail: ${quote.email}\nPhone: ${quote.phone || 'N/A'}\nCountry: ${quote.country || 'N/A'}\n\nRequested Products:\n${quote.requestedProducts}\n\nRequirements:\n${quote.requirements || 'N/A'}`,
      html: `<h3>New Quote Request</h3>
             <p><strong>Company:</strong> ${quote.companyName}</p>
             <p><strong>Contact Person:</strong> ${quote.contactPerson}</p>
             <p><strong>Email:</strong> ${quote.email}</p>
             <p><strong>Phone:</strong> ${quote.phone || 'N/A'}</p>
             <p><strong>Country:</strong> ${quote.country || 'N/A'}</p>
             <p><strong>Requested Products:</strong><br/>${quote.requestedProducts.replace(/\n/g, '<br/>')}</p>
             <p><strong>Requirements:</strong><br/>${(quote.requirements || 'N/A').replace(/\n/g, '<br/>')}</p>`,
    }).catch(err => console.error('Failed to send quote notification email:', err));

    return success(res, 201, 'Quote request submitted successfully. Our team will respond promptly.', {
      id: quote._id,
      companyName: quote.companyName,
      contactPerson: quote.contactPerson,
      email: quote.email,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all quote requests (admin)
 * @route   GET /api/quote
 * @access  Admin
 */
exports.getQuotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [quotes, total] = await Promise.all([
      Quote.find().sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Quote.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Quote requests retrieved successfully',
      data: quotes,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalQuotes: total,
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
};
