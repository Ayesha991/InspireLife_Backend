const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Admin = require('../models/Admin');

async function updatePassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!admin) {
      console.log(`⚠️ Admin not found: ${process.env.ADMIN_EMAIL}`);
      process.exit(1);
    }

    admin.password = process.env.ADMIN_PASSWORD;
    await admin.save(); // This triggers the pre('save') hook to hash it

    console.log(`✅ Admin password updated for: ${admin.email}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Update failed:', err.message);
    process.exit(1);
  }
}

updatePassword();
