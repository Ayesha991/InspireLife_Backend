/**
 * Database Product and Category Pruning Script
 * 
 * Rules:
 * 1. Remove products whose name does not exactly match the image filename in Cloudinary.
 * 2. Remove products with mock/AI/placeholder images.
 * 3. Resolve repeated images: If multiple products share the same image:
 *    - If one product has an exact name match with the image filename, keep it and delete the others.
 *    - If none have an exact name match, delete all of them.
 * 4. Remove categories that do not contain a single remaining product.
 * 5. Update productCount for remaining categories.
 * 
 * Usage: node utils/pruneProducts.js [--execute]
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

const isExecute = process.argv.includes('--execute');

function standardize(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getFilename(url) {
  if (!url) return '';
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const dotIndex = lastPart.lastIndexOf('.');
    if (dotIndex !== -1) {
      return lastPart.substring(0, dotIndex);
    }
    return lastPart;
  } catch (e) {
    return '';
  }
}

async function prune() {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<password>') || process.env.MONGO_URI.includes('xxxxx')) {
      console.error('❌ Error: MONGO_URI contains placeholder values.');
      return;
    }

    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    const products = await Product.find({});
    console.log(`📦 Loaded ${products.length} products from database.`);

    const toDelete = new Set();
    const reasons = {};

    // Step 1 & 2: Clean check (Mock images, mismatches)
    for (const p of products) {
      const pIdStr = p._id.toString();
      
      if (!p.image) {
        toDelete.add(pIdStr);
        reasons[pIdStr] = 'No image URL';
        continue;
      }

      const imgLower = p.image.toLowerCase();
      if (imgLower.includes('unsplash.com') || imgLower.includes('placeholder') || /mock|ai/i.test(imgLower)) {
        toDelete.add(pIdStr);
        reasons[pIdStr] = `Mock/AI or Placeholder image: ${p.image}`;
        continue;
      }

      const filename = getFilename(p.image);
      const stdName = standardize(p.productName);
      const stdFilename = standardize(filename);

      if (stdName !== stdFilename) {
        toDelete.add(pIdStr);
        reasons[pIdStr] = `Name mismatch (Name: "${p.productName}" vs Img filename: "${filename}")`;
      }
    }

    // Step 3: Handle repeated/duplicate images
    const imageGroups = {};
    for (const p of products) {
      const pIdStr = p._id.toString();
      if (toDelete.has(pIdStr)) continue; // Already marked for deletion

      if (!imageGroups[p.image]) {
        imageGroups[p.image] = [];
      }
      imageGroups[p.image].push(p);
    }

    for (const [imgUrl, group] of Object.entries(imageGroups)) {
      if (group.length > 1) {
        console.log(`\n⚠️ Repeated image URL found: ${imgUrl}`);
        let keepProduct = null;

        // Check if any product in group matches the filename exactly
        for (const p of group) {
          const filename = getFilename(p.image);
          if (standardize(p.productName) === standardize(filename)) {
            keepProduct = p;
            break;
          }
        }

        if (!keepProduct) {
          console.log(`   ❌ No exact filename match exists. Flagging all ${group.length} products for deletion.`);
          for (const p of group) {
            const pIdStr = p._id.toString();
            toDelete.add(pIdStr);
            reasons[pIdStr] = `Repeated image with no exact filename match: ${imgUrl}`;
          }
        } else {
          console.log(`   ✅ Keeping exact match: "${keepProduct.productName}"`);
          for (const p of group) {
            const pIdStr = p._id.toString();
            if (pIdStr !== keepProduct._id.toString()) {
              toDelete.add(pIdStr);
              reasons[pIdStr] = `Repeated image (Exact match goes to "${keepProduct.productName}")`;
            }
          }
        }
      }
    }

    // Print summary of what will be deleted
    console.log(`\n📋 --- PRODUCTS TO DELETE SUMMARY (${toDelete.size} products) ---`);
    for (const pId of toDelete) {
      const p = products.find(x => x._id.toString() === pId);
      console.log(`🗑️  Product: "${p.productName}" | Reason: ${reasons[pId]}`);
    }

    if (isExecute) {
      const deleteIds = Array.from(toDelete);
      if (deleteIds.length > 0) {
        const prodDeleteRes = await Product.deleteMany({ _id: { $in: deleteIds } });
        console.log(`\n✅ Deleted ${prodDeleteRes.deletedCount} products from database.`);
      }

      // Step 4: Category Cleaning
      const remainingProducts = await Product.find({});
      const activeCategories = new Set(remainingProducts.map(p => p.category.trim()));

      const categories = await Category.find({});
      let deletedCats = 0;

      for (const cat of categories) {
        if (!activeCategories.has(cat.name.trim())) {
          console.log(`🗑️  Deleting empty category: "${cat.name}"`);
          await Category.deleteOne({ _id: cat._id });
          deletedCats++;
        } else {
          // Recalculate count
          const count = remainingProducts.filter(p => p.category.trim() === cat.name.trim()).length;
          cat.productCount = count;
          await cat.save();
        }
      }
      console.log(`✅ Deleted ${deletedCats} empty categories and updated remaining counts.`);
    } else {
      console.log('\n💡 DRY RUN COMPLETE. Run with --execute flag to apply deletions to the database.');
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  } catch (err) {
    console.error('❌ Pruning failed:', err);
    try { await mongoose.disconnect(); } catch(e) {}
  }
}

prune();
