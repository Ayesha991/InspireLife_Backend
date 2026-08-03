/**
 * Database Translation & Details Seeding Script
 * 
 * Reads dynamicTranslations.js and productDetails.js from the frontend client,
 * translates and enriches the MongoDB database categories and products.
 * 
 * Usage: node utils/seedData.js
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

const CLIENT_DATA_DIR = path.join(__dirname, '..', '..', 'client', 'src', 'data');
const DYNAMIC_TRANS_PATH = path.join(CLIENT_DATA_DIR, 'dynamicTranslations.js');
const PRODUCT_DETAILS_PATH = path.join(CLIENT_DATA_DIR, 'productDetails.js');

// Simple dictionary for translating common technical specifications terms
function translateSpecs(specs) {
  if (!specs) return '';
  let result = specs;
  const dict = {
    'Design Standards': 'معايير التصميم',
    'Design Standard': 'معيار التصميم',
    'Standards': 'المعايير',
    'Standard': 'المعيار',
    'Sizes': 'الأحجام',
    'Size': 'الحجم',
    'Pressure Class': 'فئة الضغط',
    'Pressure Ratings': 'درجات الضغط',
    'Ends': 'الأطراف',
    'Materials': 'المواد',
    'Features': 'الميزات',
    'Rating': 'التقييم',
    'Class': 'الفئة',
    'to': 'إلى',
    'in': 'بوصة',
    'through': 'إلى'
  };
  Object.entries(dict).forEach(([en, ar]) => {
    // Escape regex characters in key just in case
    const escapedEn = en.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedEn}\\b`, 'gi');
    result = result.replace(regex, ar);
  });
  return result;
}

const vm = require('vm');

// Helper to evaluate ES Module JS object files without requiring them
function parseJSObjectFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  let content = fs.readFileSync(filePath, 'utf8');
  // Match all "export const varName ="
  const matches = [...content.matchAll(/export\s+const\s+(\w+)\s*=/g)];
  if (matches.length === 0) {
    throw new Error(`Could not find any export statement in ${filePath}`);
  }
  
  const varNames = matches.map(m => m[1]);
  // Replace all "export const" with "const"
  let jsCode = content.replace(/export\s+const\s+/g, 'const ');
  // Append an object literal of all exported variables to return it
  jsCode += `\n\n; ({ ${varNames.join(', ')} });`;
  
  try {
    return vm.runInNewContext(jsCode);
  } catch (err) {
    throw new Error(`Failed to parse JS object from ${filePath}: ${err.message}`);
  }
}

async function seedData() {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<password>') || process.env.MONGO_URI.includes('xxxxx')) {
      console.error('❌ Migration aborted: MONGO_URI in backend/.env has placeholder credentials.');
      return;
    }

    // Read client data files
    console.log('📖 Reading client-side translations and product details...');
    const { dynamicTranslations } = parseJSObjectFile(DYNAMIC_TRANS_PATH);
    const { productDetailsMap } = parseJSObjectFile(PRODUCT_DETAILS_PATH);

    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Migrate Categories
    console.log('\n📁 Migrating Categories...');
    const categories = await Category.find();
    let updatedCats = 0;
    
    for (const cat of categories) {
      const nameAr = dynamicTranslations.categories[cat.name] || '';
      cat.nameAr = nameAr;
      // Provide fallback default description translation if needed
      cat.descriptionAr = cat.description ? (dynamicTranslations.categories[cat.description] || '') : '';
      await cat.save();
      updatedCats++;
    }
    console.log(`✅ Successfully updated ${updatedCats} categories with Arabic fields.`);

    // 2. Migrate Products
    console.log('\n📦 Migrating Products...');
    const products = await Product.find();
    let updatedProds = 0;

    for (const prod of products) {
      // Find translations
      const nameAr = dynamicTranslations.products[prod.productName] || '';
      const categoryAr = dynamicTranslations.categories[prod.category] || '';
      
      prod.productNameAr = nameAr;
      prod.categoryAr = categoryAr;

      // Check for specifications & enrichments from productDetailsMap
      const details = productDetailsMap[prod.productName] || productDetailsMap[prod.productName.trim()];
      if (details) {
        if (details.overview) {
          prod.description = details.overview;
          // Look up if overview description has a translation or translate/store it
          prod.descriptionAr = dynamicTranslations.products[details.overview] || '';
        }
        
        if (details.specifications) {
          prod.specifications = details.specifications;
          prod.specificationsAr = translateSpecs(details.specifications);
        }

        if (details.features && details.features.length > 0) {
          prod.features = details.features;
          prod.featuresAr = details.features.map(f => dynamicTranslations.products[f] || f);
        }

        if (details.materials && details.materials.length > 0) {
          prod.materials = details.materials;
          prod.materialsAr = details.materials.map(m => dynamicTranslations.products[m] || m);
        }

        if (details.applications && details.applications.length > 0) {
          prod.applications = details.applications;
          prod.applicationsAr = details.applications.map(a => dynamicTranslations.products[a] || a);
        }
      }

      await prod.save();
      updatedProds++;
    }

    console.log(`✅ Successfully enriched and updated ${updatedProds} products.`);
    console.log('\n🎉 Translation and product enrichment seed complete!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seeding/Migration failed:', err);
    try { await mongoose.disconnect(); } catch(e) {}
    process.exit(1);
  }
}

seedData();
