const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');

const Product = require('../models/Product');
const Category = require('../models/Category');

const PRODUCTS_DIR = path.join(__dirname, '../../client/src/assets/products');

async function uploadProductAssets() {
  try {
    console.log('🚀 Starting Cloudinary Product Image Upload...');

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables missing in backend/.env');
    }

    console.log(`Cloudinary Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const allProducts = await Product.find({});
    console.log(`📦 Found ${allProducts.length} total products in database`);

    const categoriesInDir = fs.readdirSync(PRODUCTS_DIR);
    let uploadedCount = 0;
    let updatedCount = 0;

    for (const catDir of categoriesInDir) {
      const fullCatPath = path.join(PRODUCTS_DIR, catDir);
      if (!fs.statSync(fullCatPath).isDirectory()) continue;

      const files = fs.readdirSync(fullCatPath);
      console.log(`\n📁 Processing Category Folder: "${catDir}" (${files.length} files)`);

      for (const file of files) {
        if (!file.match(/\.(png|jpg|jpeg|webp)$/i)) continue;

        const filePath = path.join(fullCatPath, file);
        const fileNameWithoutExt = path.parse(file).name;
        const cleanName = fileNameWithoutExt.replace(/\s+1$/, '').trim();

        // Find matching product in DB
        const product = allProducts.find(p => 
          p.productName.toLowerCase() === fileNameWithoutExt.toLowerCase() ||
          p.productName.toLowerCase() === cleanName.toLowerCase() ||
          p.productName.toLowerCase().replace(/s$/, '') === cleanName.toLowerCase().replace(/s$/, '') ||
          cleanName.toLowerCase().includes(p.productName.toLowerCase()) ||
          p.productName.toLowerCase().includes(cleanName.toLowerCase())
        );

        if (!product) {
          console.warn(`⚠️ No DB match found for image file: "${file}"`);
          continue;
        }

        console.log(`⬆️ Uploading "${file}" for DB Product "${product.productName}"...`);

        // Upload original image to Cloudinary without pre-resizing or compression
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: `ipts/products/${product.categorySlug || 'general'}`,
          public_id: fileNameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          overwrite: true,
          resource_type: 'image'
        });

        uploadedCount++;
        console.log(`   Cloudinary URL: ${uploadResult.secure_url}`);

        // Update Product in MongoDB
        product.image = uploadResult.secure_url;
        await product.save();
        updatedCount++;

        console.log(`   ✅ DB Product "${product.productName}" updated with image URL!`);
      }
    }

    console.log(`\n🎉 Completed! Uploaded ${uploadedCount} images and updated ${updatedCount} products in MongoDB.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Upload script failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

uploadProductAssets();
