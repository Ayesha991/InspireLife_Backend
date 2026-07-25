const Contact = require('../models/Contact');
const { success, error } = require('../utils/apiResponse');
const { sendEmail } = require('../services/emailService');

/**
 * @desc    Submit a contact message
 * @route   POST /api/contact
 * @access  Public
 */
exports.createContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);

    // Send email notification asynchronously
    sendEmail({
      replyTo: contact.email,
      subject: `New Contact Message from ${contact.name}`,
      text: `Name: ${contact.name}\nEmail: ${contact.email}\nCompany: ${contact.company || 'N/A'}\nPhone: ${contact.phone || 'N/A'}\nCountry: ${contact.country || 'N/A'}\nSubject: ${contact.subject || 'N/A'}\n\nMessage:\n${contact.message}`,
      html: `<h3>New Contact Message</h3>
             <p><strong>Name:</strong> ${contact.name}</p>
             <p><strong>Email:</strong> ${contact.email}</p>
             <p><strong>Company:</strong> ${contact.company || 'N/A'}</p>
             <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
             <p><strong>Country:</strong> ${contact.country || 'N/A'}</p>
             <p><strong>Subject:</strong> ${contact.subject || 'N/A'}</p>
             <p><strong>Message:</strong><br/>${contact.message.replace(/\n/g, '<br/>')}</p>`,
    }).catch(err => console.error('Failed to send contact notification email:', err));

    return success(res, 201, 'Message sent successfully. We will get back to you soon.', {
      id: contact._id,
      name: contact.name,
      email: contact.email,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all contact messages (admin)
 * @route   GET /api/contact
 * @access  Admin
 */
exports.getContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.status = status;

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Contact.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Contact messages retrieved successfully',
      data: contacts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalMessages: total,
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update contact message status
 * @route   PUT /api/contact/:id
 * @access  Admin
 */
exports.updateContactStatus = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return error(res, 404, 'Contact message not found');
    }

    if (req.body.status) {
      contact.status = req.body.status;
      await contact.save();
    }

    return success(res, 200, 'Contact status updated', contact);
  } catch (err) {
    next(err);
  }
};
