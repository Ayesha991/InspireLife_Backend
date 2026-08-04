/**
 * Database Seeding Script (Filtered Categories & Products Version)
 * 
 * Seeds exact categories and products specified by user requirement into local MongoDB.
 * Dynamically fetches image URLs from Cloudinary and maps them to relevant products.
 * 
 * Usage: node utils/seedData.js
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Filtered Categories & Products Mapping
const productCategoryMapping = {
  "Pipes & Pipe Fittings": [
    "Stainless Steel Pipes",
    "Cast Iron Pipes",
    "UPVC Pipes & Fittings",
    "Copper Pipes",
    "GI Pipes",
    "PPR Pipes & Fittings",
    "PEX Pipes",
    "Cross-Linked Polyethylene Pipe",
    "Rigid Pipes",
    "HDPE Pipe",
    "Flexi Pipes",
    "ABS Pipe",
    "Rainwater Pipe",
    "CPVC Pipes",
    "Polyvinyl Chloride (PVC) Pipes",
    "Concrete Pipes",
    "Polybutylene Pipes"
  ],
  "Oil Field Equipment": [
    "Hoses",
    "Hose Fittings",
    "O-Rings & Seal Rings",
    "Seals, O-Rings and Jointing Accessories",
    "Manifolds",
    "Manifold Fittings",
    "BOP Testing Unit",
    "Air Control Valve",
    "BOP Spare Parts",
    "Mud Chemicals",
    "Safety Clamps",
    "Wellheads",
    "Hub Connections",
    "Double Studded Adapter Flange"
  ],
  "Mechanical Products": [
    "Valves and Fluid-Control Products",
    "Air Compressors",
    "Exchangers",
    "Centrifugal Compressor",
    "Expansion Tanks",
    "Hydronic Balancing Equipment",
    "Turbine Parts",
    "Boilers and Boiler Piping",
    "Heat Exchanger",
    "Plate Heat Exchangers",
    "Hydraulic Pumps and Motors",
    "Pressure Vessels",
    "Mechanical Spare Parts and Accessories",
    "Heat Recuperators",
    "Fin Coils and Coolers",
    "Actuators and Control Components",
    "Winches and Control",
    "Mixers and Agitators",
    "Hydraulic Circuit",
    "Pumps and Pumping Instruments"
  ],
  "Process Control Products": [
    "Heat-Tracing Products",
    "Level Sensors and Controls"
  ],
  "Pneumatic Products": [
    "Pneumatic Cylinders",
    "Solenoid Valves",
    "Flow-Control Valves",
    "Filters and Regulators"
  ],
  "PLC and HMI Products": [
    "Programmable Logic Controllers",
    "Human Machine Interfaces"
  ],
  "Sensor Products": [
    "Pressure Sensors",
    "Temperature Sensors"
  ],
  "Flow Meter Products": [
    "Flowmeters",
    "Water Meters"
  ],
  "Electrical Products and Accessories": [
    "Low-Voltage Cables and Wires",
    "Cable Trays, Ladders and Trunking",
    "PVC and GI Conduits",
    "Control and Instrumentation Cables",
    "Data and Fibre-Optic Cables",
    "Electrical Accessories for Hazardous Locations",
    "Glands, Lugs and Cable Accessories",
    "High-Temperature Cables",
    "Industrial Plugs and Sockets",
    "PLC, DCS and ESD Components",
    "Fire-Resistant Cable",
    "SCADA and Control-System Products",
    "BMS Cables",
    "Solar Cables",
    "Water Heaters"
  ]
};

// Category English to Arabic Translations
const categoryTranslations = {
  "Pipes & Pipe Fittings": "الأنابيب ووصلات الأنابيب",
  "Oil Field Equipment": "معدات حقول النفط",
  "Mechanical Products": "المنتجات الميكانيكية",
  "Process Control Products": "منتجات التحكم في العمليات",
  "Pneumatic Products": "المنتجات الهوائية",
  "PLC and HMI Products": "منتجات PLC و HMI",
  "Sensor Products": "منتجات الاستشعار",
  "Flow Meter Products": "منتجات مقاييس التدفق",
  "Electrical Products and Accessories": "المنتجات الكهربائية وملحقاتها"
};

// Product English to Arabic Translations
const productTranslations = {
  // Pipes & Pipe Fittings
  "Stainless Steel Pipes": "أنابيب الصلب المقاوم للصدأ",
  "Cast Iron Pipes": "أنابيب حديد الزهر",
  "UPVC Pipes & Fittings": "أنابيب ووصلات UPVC",
  "Copper Pipes": "أنابيب نحاسية",
  "GI Pipes": "أنابيب الحديد المجلفن",
  "PPR Pipes & Fittings": "أنابيب ووصلات PPR",
  "PEX Pipes": "أنابيب بيكس",
  "Cross-Linked Polyethylene Pipe": "أنبوب البولي إيثيلين المتقاطع",
  "Rigid Pipes": "أنابيب صلبة",
  "HDPE Pipe": "أنبوب HDPE",
  "Flexi Pipes": "أنابيب مرنة",
  "ABS Pipe": "أنبوب ABS",
  "Rainwater Pipe": "أنبوب مياه الأمطار",
  "CPVC Pipes": "أنابيب CPVC",
  "Polyvinyl Chloride (PVC) Pipes": "أنابيب البولي فينيل كلوريد (PVC)",
  "Concrete Pipes": "أنابيب خرسانية",
  "Polybutylene Pipes": "أنابيب البولي بيوتيلين",

  // Oil Field Equipment
  "Hoses": "الخراطيم",
  "Hose Fittings": "وصلات الخراطيم",
  "O-Rings & Seal Rings": "الحلقات المانعة للتسرب",
  "Seals, O-Rings and Jointing Accessories": "موانع التسرب والحلقات وملحقات التوصيل",
  "Manifolds": "المشعبات",
  "Manifold Fittings": "وصلات المشعبات",
  "BOP Testing Unit": "وحدة اختبار مانع الانفجار",
  "Air Control Valve": "صمام التحكم في الهواء",
  "BOP Spare Parts": "قطع غيار مانع الانفجار",
  "Mud Chemicals": "كيماويات الطين",
  "Safety Clamps": "مشابك السلامة",
  "Wellheads": "رؤوس الآبار",
  "Hub Connections": "وصلات المحور",
  "Double Studded Adapter Flange": "شفة محول مزدوجة المسامير",

  // Mechanical Products
  "Valves and Fluid-Control Products": "صمامات ومنتجات التحكم في السوائل",
  "Air Compressors": "ضواغط الهواء",
  "Exchangers": "المبادلات",
  "Centrifugal Compressor": "ضاغط طرد مركزي",
  "Expansion Tanks": "خزانات التمدد",
  "Hydronic Balancing Equipment": "معدات الموازنة المائية",
  "Turbine Parts": "أجزاء التوربينات",
  "Boilers and Boiler Piping": "الغلايات وأنابيب الغلايات",
  "Heat Exchanger": "مبادل حراري",
  "Plate Heat Exchangers": "مبادلات حرارية لوحية",
  "Hydraulic Pumps and Motors": "مضخات ومحركات هيدروليكية",
  "Pressure Vessels": "أوعية الضغط",
  "Mechanical Spare Parts and Accessories": "قطع غيار ميكانيكية وملحقاتها",
  "Heat Recuperators": "مستردات الحرارة",
  "Fin Coils and Coolers": "ملفات الزعانف والمبردات",
  "Actuators and Control Components": "المشغلات ومكونات التحكم",
  "Winches and Control": "الروافع وأدوات التحكم",
  "Mixers and Agitators": "الخلاطات والمقلبات",
  "Hydraulic Circuit": "الدائرة الهيدروليكية",
  "Pumps and Pumping Instruments": "المضخات وأجهزة الضخ",

  // Process Control Products
  "Heat-Tracing Products": "منتجات التتبع الحراري",
  "Level Sensors and Controls": "مستشعرات مستوى وأدوات تحكم",

  // Pneumatic Products
  "Pneumatic Cylinders": "أسطوانات تعمل بالهواء المضغوط",
  "Solenoid Valves": "صمامات لولبية",
  "Flow-Control Valves": "صمامات التحكم في التدفق",
  "Filters and Regulators": "الفلاتر والمنظمات",

  // PLC and HMI Products
  "Programmable Logic Controllers": "أجهزة التحكم المنطقي القابلة للبرمجة (PLC)",
  "Human Machine Interfaces": "واجهات بين الإنسان والآلة (HMI)",

  // Sensor Products
  "Pressure Sensors": "مستشعرات الضغط",
  "Temperature Sensors": "مستشعرات درجة الحرارة",

  // Flow Meter Products
  "Flowmeters": "مقاييس التدفق",
  "Water Meters": "عدادات المياه",

  // Electrical Products and Accessories
  "Low-Voltage Cables and Wires": "كابلات وأسلاك الجهد المنخفض",
  "Cable Trays, Ladders and Trunking": "حوامل الكابلات والسلالم والقنوات",
  "PVC and GI Conduits": "أنابيب PVC والحديد المجلفن",
  "Control and Instrumentation Cables": "كابلات التحكم والأجهزة",
  "Data and Fibre-Optic Cables": "كابلات البيانات والألياف البصرية",
  "Electrical Accessories for Hazardous Locations": "الملحقات الكهربائية للأماكن الخطرة",
  "Glands, Lugs and Cable Accessories": "الغدد والعروات وملحقات الكابلات",
  "High-Temperature Cables": "كابلات درجات الحرارة العالية",
  "Industrial Plugs and Sockets": "المقابس والمآخذ الصناعية",
  "PLC, DCS and ESD Components": "مكونات PLC و DCS و ESD",
  "Fire-Resistant Cable": "كابلات مقاومة للحريق",
  "SCADA and Control-System Products": "منتجات أنظمة سكادا والتحكم",
  "BMS Cables": "كابلات BMS",
  "Solar Cables": "كابلات الطاقة الشمسية",
  "Water Heaters": "سخانات المياه"
};

// Hardcoded features/specifications for enhanced product display
const productDetailsMap = {
  "Hoses": {
    features: ["Flexible for diverse oilfield supplies tasks", "Durable materials ensure long performance", "Available in various sizes and types", "Resistant to high pressure abrasion", "Easy to install and use efficiently"]
  },
  "Hose Fittings": {
    features: ["Hammer Union fittings for oilfield supplies", "Secure connections prevent leaks", "Various sizes and configurations", "Easy installation with minimal effort", "Compatible with standard hoses", "Durable materials ensure reliability"]
  },
  "O-Rings & Seal Rings": {
    features: ["Seals joints to prevent leaks", "Durable materials ensure long-lasting performance", "Available in various sizes and materials", "Resistant to high pressure and temperature", "Easy to install for tight seals"]
  },
  "Manifolds": {
    features: ["Distributes oilfield supplies fluid to multiple locations", "Versatile design for various oilfield supplies applications", "Robust construction ensures durability", "Available in different sizes and configurations", "Facilitates efficient fluid control systems"]
  },
  "Manifold Fittings": {
    features: ["Connects multiple components in systems", "Durable materials ensure reliable performance", "Available in various sizes and types", "Facilitates efficient fluid distribution", "Easy to install and maintain"]
  },
  "BOP Testing Unit": {
    features: ["Ensures safety through pressure testing", "Compact unit for convenient deployment", "Reliable performance for critical operations", "Adaptable to various well conditions", "Facilitates compliance with industry standards"]
  },
  "Air Control Valve": {
    features: ["Regulates airflow for precise control", "Ensures long-term reliability", "Available in various sizes and configurations", "Facilitates efficient pneumatic system operation", "Easy installation and maintenance"]
  },
  "BOP Spare Parts": {
    features: ["Essential for maintaining BOP functionality", "Ensures readiness for critical operations", "Wide range available for different models", "Reliable quality for long-term performance", "Facilitates rapid maintenance and repairs"]
  },
  "Safety Clamps": {
    features: ["Ensures secure pipe and tooling", "Vital for wellbore safety procedures", "Durable construction for reliable performance", "Available in various sizes and configurations", "Facilitates quick and safe operation"]
  },
  "Wellheads": {
    features: ["Critical component for oil extraction", "Safely controls pressure at the well", "Robust construction ensures reliability", "Available in various sizes and configurations", "Facilitates efficient well operation"]
  },
  "Hub Connections": {
    features: ["Facilitates secure attachment of components", "Ensures reliable transmission of forces", "Robust construction for durability", "Available in various sizes and types", "Essential for safe and efficient operations"]
  },
  "Double Studded Adapter Flange": {
    features: ["Facilitates connection between equipment", "Allows versatile wellhead configurations", "Robust construction ensures reliability", "Available in various sizes, pressure ratings", "Essential for well control operations"]
  }
};

// Fetch non-sample image resources from Cloudinary
async function fetchCloudinaryImages() {
  console.log('☁️  Fetching image URLs from Cloudinary...');
  let allResources = [];
  let nextCursor = null;

  try {
    do {
      const res = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor
      });
      allResources = allResources.concat(res.resources);
      nextCursor = res.next_cursor;
    } while (nextCursor);

    const validImages = allResources.filter(r =>
      !r.public_id.startsWith('samples/') &&
      !r.public_id.startsWith('cld-sample') &&
      !r.public_id.startsWith('ipts/assets/') &&
      !r.public_id.startsWith('ipts/branding/') &&
      r.public_id !== 'sample' &&
      r.public_id !== 'main-sample'
    );

    const cleanStr = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    const imageMapList = validImages.map(img => {
      const parts = img.public_id.split('/');
      const filename = parts[parts.length - 1];
      const cleanFilename = cleanStr(filename.replace(/_[a-z0-9]{6}$/i, ''));
      const fullClean = cleanStr(img.public_id);
      return {
        public_id: img.public_id,
        cleanFilename,
        fullClean,
        url: img.secure_url
      };
    });

    console.log(`✅ Loaded ${imageMapList.length} product & equipment images from Cloudinary.`);
    return imageMapList;
  } catch (err) {
    console.warn('⚠️  Could not fetch Cloudinary images:', err.message);
    return [];
  }
}

// Map product name to the most relevant Cloudinary image URL
function findImageForProduct(prodName, categoryName, imageMapList) {
  if (!imageMapList || imageMapList.length === 0) return '';

  const cleanStr = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetClean = cleanStr(prodName);

  // 1. Exact match on clean filename
  let match = imageMapList.find(img => img.cleanFilename === targetClean);
  if (match) return match.url;

  // 2. Substring match
  match = imageMapList.find(img =>
    img.cleanFilename.length > 3 && (
      img.cleanFilename.includes(targetClean) || targetClean.includes(img.cleanFilename)
    )
  );
  if (match) return match.url;

  // 3. Token similarity match
  const targetWords = prodName.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  let bestScore = 0;
  let bestUrl = null;

  for (const img of imageMapList) {
    let score = 0;
    for (const w of targetWords) {
      if (img.fullClean.includes(w)) {
        score += w.length;
      }
    }
    if (score > bestScore && score >= 4) {
      bestScore = score;
      bestUrl = img.url;
    }
  }

  if (bestUrl) return bestUrl;

  // 4. Category fallback image
  const catClean = cleanStr(categoryName);
  const catMatch = imageMapList.find(img => img.fullClean.includes(catClean));
  return catMatch ? catMatch.url : '';
}

async function seedData() {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/iptsDB';
    console.log(`🔗 Connecting to Local MongoDB at ${dbUri}...`);
    await mongoose.connect(dbUri);
    console.log('✅ Connected to Local MongoDB');

    // 0. Fetch Cloudinary images
    const cloudinaryImages = await fetchCloudinaryImages();

    // 1. Clear previous data
    console.log('\n🗑️ Removing previous categories and products from local DB...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Removed previous local collection data.');

    // 2. Seed Categories
    console.log('\n📁 Seeding Categories...');
    const catMap = {};
    for (const [catName, catNameAr] of Object.entries(categoryTranslations)) {
      const catImage = findImageForProduct(catName, catName, cloudinaryImages);
      const createdCat = await Category.create({
        name: catName,
        nameAr: catNameAr,
        image: catImage,
        description: '',
        descriptionAr: '',
        productCount: 0
      });
      catMap[catName] = createdCat;
    }
    console.log(`✅ Successfully seeded ${Object.keys(catMap).length} categories.`);

    // Build reverse category lookup for products
    const productToCategoryMap = {};
    for (const [catName, prodList] of Object.entries(productCategoryMapping)) {
      for (const prodName of prodList) {
        productToCategoryMap[prodName.toLowerCase().trim()] = catName;
      }
    }

    // 3. Seed Products
    console.log('\n📦 Seeding Products...');
    let createdProds = 0;
    const catCounts = {};

    for (const [catName, prodList] of Object.entries(productCategoryMapping)) {
      const catNameAr = categoryTranslations[catName] || '';

      for (const prodName of prodList) {
        const prodNameAr = productTranslations[prodName] || prodName;
        const prodImage = findImageForProduct(prodName, catName, cloudinaryImages);

        const details = productDetailsMap[prodName] || null;

        let description = '';
        let descriptionAr = '';
        let features = [];
        let featuresAr = [];

        if (details) {
          if (details.overview) {
            description = details.overview;
          }
          if (details.features && details.features.length > 0) {
            features = details.features;
          }
        }

        await Product.create({
          productName: prodName,
          productNameAr: prodNameAr,
          category: catName,
          categoryAr: catNameAr,
          image: prodImage,
          description,
          descriptionAr,
          features,
          featuresAr
        });

        createdProds++;
        catCounts[catName] = (catCounts[catName] || 0) + 1;
      }
    }

    // 4. Update productCount for categories
    for (const [catName, count] of Object.entries(catCounts)) {
      if (catMap[catName]) {
        catMap[catName].productCount = count;
        await catMap[catName].save();
      }
    }

    console.log(`✅ Successfully seeded ${createdProds} products across 9 categories locally with Cloudinary image mapping.`);
    console.log('\n🎉 Local product and category seeding complete!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Local seeding failed:', err);
    try { await mongoose.disconnect(); } catch(e) {}
    process.exit(1);
  }
}

seedData();
