const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transport with Hostinger SMTP
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Verify SMTP connection on startup
 */
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('✅ SMTP Server Ready to send emails');
  }
});

/**
 * Send Email helper
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.replyTo - Reply-To email (optional)
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email plain text content
 * @param {string} options.html - Email HTML content (optional)
 * @returns {Promise<any>}
 */
const sendEmail = async ({ to, replyTo, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"IPTS Global" <${process.env.SMTP_USER}>`,
      to: to || process.env.ADMIN_EMAIL_NOTIFY,
      replyTo: replyTo,
      subject: subject,
      text: text,
      html: html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = {
  sendEmail,
};
