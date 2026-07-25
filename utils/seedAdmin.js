/**
 * Admin Seed Script
 *
 * Creates the initial admin user from .env variables.
 * Idempotent — won't create duplicates.
 *
 * Usage: node utils/seedAdmin.js
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Admin = require('../models/Admin');

async function seedAdmin() {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<password>') || process.env.MONGO_URI.includes('xxxxx')) {
      console.error('❌ Seed aborted: MONGO_URI in backend/.env has placeholder credentials.');
      console.error('👉 Update MONGO_URI in backend/.env with your real MongoDB Atlas URI and password.');
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas Connected for admin seed');

    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`⚠️  Admin already exists: ${existingAdmin.email}`);
      await mongoose.disconnect();
      return;
    }

    const admin = await Admin.create({
      name: process.env.ADMIN_NAME || 'IPTS Admin',
      email: process.env.ADMIN_EMAIL || 'info@iptsglobal.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
    });

    console.log(`✅ Admin created: ${admin.email}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Admin seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
