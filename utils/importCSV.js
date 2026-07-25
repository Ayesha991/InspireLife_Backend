/**
 * CSV Import Script — IPTS Products
 *
 * Reads IPTS_Products_List_by_Category.csv and imports into MongoDB.
 * Creates Product documents and Category documents.
 * Idempotent — checks if products already exist before importing.
 *
 * Usage: node utils/importCSV.js
 */

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');
const generateSlug = require('./slugify');

const CSV_PATH = path.join(__dirname, '..', 'IPTS_Products_List_by_Category.csv');

/**
 * Strip BOM and normalize header keys
 */
function cleanKey(key) {
  return key.replace(/^\uFEFF/, '').trim();
}

async function importCSV() {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<password>') || process.env.MONGO_URI.includes('xxxxx')) {
      console.error('❌ Import aborted: MONGO_URI in backend/.env has placeholder credentials.');
      console.error('👉 Update MONGO_URI in backend/.env with your real MongoDB Atlas URI and password.');
      return;
    }
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas Connected for import');

    // Check if products already exist
    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Database already contains ${existingCount} products.`);
      console.log('   To re-import, drop the products collection first.');
      console.log('   Skipping import.');
      await mongoose.disconnect();
      return;
    }

    // Parse CSV
    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH)
        .pipe(
          csv({
            mapHeaders: ({ header }) => cleanKey(header),
          })
        )
        .on('data', (row) => {
          const category = (row['Category'] || '').trim();
          const productName = (row['Product / Item'] || '').trim();
          const specifications = (row['Specifications / Notes'] || '').trim();

          if (category && productName) {
            rows.push({ category, productName, specifications });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📄 Parsed ${rows.length} products from CSV`);

    if (rows.length === 0) {
      console.log('⚠️  No products found in CSV. Check file format.');
      await mongoose.disconnect();
      return;
    }

    // ── Create Products ──
    const products = [];
    const slugTracker = {}; // Track slug uniqueness

    for (const row of rows) {
      let baseSlug = generateSlug(row.productName);
      let slug = baseSlug;

      // Handle duplicate slugs (some product names may repeat across categories)
      if (slugTracker[slug]) {
        slugTracker[slug]++;
        slug = `${baseSlug}-${slugTracker[slug]}`;
      } else {
        slugTracker[slug] = 1;
      }

      products.push({
        productName: row.productName,
        slug,
        category: row.category,
        categorySlug: generateSlug(row.category),
        specifications: row.specifications,
        description: '',
        image: '',
        gallery: [],
        datasheet: '',
        specDetails: [],
        features: [],
        applications: [],
        industries: [],
        materials: [],
        brand: '',
        featured: false,
      });
    }

    // Bulk insert products (bypass pre-save hooks since we already generated slugs)
    await Product.insertMany(products);
    console.log(`✅ Imported ${products.length} products`);

    // ── Create Categories ──
    const categoryMap = {};
    for (const row of rows) {
      if (!categoryMap[row.category]) {
        categoryMap[row.category] = 0;
      }
      categoryMap[row.category]++;
    }

    const categories = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      slug: generateSlug(name),
      description: '',
      image: '',
      productCount: count,
    }));

    await Category.insertMany(categories);
    console.log(`✅ Created ${categories.length} categories:`);
    categories.forEach((cat) => {
      console.log(`   • ${cat.name} (${cat.productCount} products) → /${cat.slug}`);
    });

    console.log('\n🎉 Import complete!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Import failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

importCSV();
