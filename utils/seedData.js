/**
 * Database Translation & Details Seeding Script (Static Data Version)
 * 
 * Seeds category and product translations directly using static maps.
 * Enriches specifications and other details using productDetailsMap.
 * 
 * Usage: node utils/seedData.js
 */

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Category = require('../models/Category');

// Hardcoded translations from dynamicTranslations.js
const dynamicTranslations = {
  categories: {
    "Pipes & Pipe Fittings": "الأنابيب ووصلات الأنابيب",
    "Oil Field Equipment": "معدات حقول النفط",
    "Valves": "الصمامات",
    "Mechanical Products": "المنتجات الميكانيكية",
    "Process Control Products": "منتجات التحكم في العمليات",
    "Pneumatic Products": "المنتجات الهوائية",
    "Electrical Products and Accessories": "المنتجات الكهربائية وملحقاتها",
    "Oil & Gas Industry Chemicals": "كيماويات صناعة النفط والغاز",
    "Maritime / Ship Maintenance Chemicals": "كيماويات صيانة السفن / البحرية",
    "Calibration Gas Cylinders": "أسطوانات غاز المعايرة",
    "Flow Meter Products": "منتجات مقياس التدفق",
    "Hydraulic / Solenoid Valve Series": "سلسلة الصمامات الهيدروليكية / اللولبية",
    "PLC and HMI Products": "منتجات PLC و HMI",
    "Sensor Products": "منتجات الاستشعار",
    "Others": "أخرى"
  },
  products: {
    "Stainless Steel Pipes (304, 316)": "أنابيب الصلب المقاوم للصدأ (304، 316)",
    "Cast Iron Pipe": "أنبوب حديد الزهر",
    "UPVC Pipes & Fittings": "أنابيب ووصلات UPVC",
    "Copper Pipes": "أنابيب نحاسية",
    "GI Pipes": "أنابيب الحديد المجلفن",
    "PPR Pipes & Fittings": "أنابيب ووصلات PPR",
    "Pex Pipe": "أنبوب بيكس",
    "Cross Linked Polyethylene Pipe": "أنبوب البولي إيثيلين المتقاطع",
    "Rigid Pipe": "أنبوب صلب",
    "HDPE Pipe": "أنبوب HDPE",
    "Flexi Pipe": "أنبوب مرن",
    "ABS Pipe": "أنبوب ABS",
    "Rainwater Pipe": "أنبوب مياه الأمطار",
    "CPVC Pipes": "أنابيب CPVC",
    "Polyvinyl Chloride (PVC) Pipes": "أنابيب البولي فينيل كلوريد (PVC)",
    "Concrete Pipes": "أنابيب خرسانية",
    "Polybutylene Pipes": "أنابيب البولي بيوتيلين",
    "Hoses": "الخراطيم",
    "Hose Fittings": "وصلات الخراطيم",
    "O-Rings & Seal Rings": "الحلقات المانعة للتسرب",
    "Manifolds": "المشعبات",
    "Manifold Fittings": "وصلات المشعبات",
    "BOP Testing Unit": "وحدة اختبار مانع الانفجار",
    "Air Control Valves": "صمامات التحكم في الهواء",
    "BOP Spare Parts": "قطع غيار مانع الانفجار",
    "Pressure Gauges": "مقاييس الضغط",
    "Pressure Regulators": "منظمات الضغط",
    "Mud Chemicals": "كيماويات الطين",
    "Needle Valves": "الصمامات الإبرية",
    "Safety Clamps": "مشابك السلامة",
    "Wellheads": "رؤوس الآبار",
    "Data Header": "جامع البيانات",
    "Hub Connections": "وصلات المحور",
    "Top Connectors": "الموصلات العلوية",
    "Spools - Drilling, Adapter & Spacer": "البكرات - الحفر والمحول والفاصل",
    "Double Studded Adapter Flanges": "شفة محول مزدوجة المسامير",
    "Cast Steel Gate, Globe and Check Valves": "صمامات البوابة والكرة والفحص من الصلب المصبوب",
    "Forged Steel Gate, Globe and Check Valves": "صمامات البوابة والكرة والفحص من الصلب المطروق",
    "Trunnion Mounted Ball Valve": "صمام كروي مرتكز على محور",
    "Floating Ball Valves": "صمامات كروية عائمة",
    "Steel Lubricated Plug Valves": "صمامات سدادة مشحمة من الصلب",
    "Pressure Seal Cast Steel Valves": "صمامات صلب مصبوب مانعة للتسرب",
    "Duo Check Cast Steel Valves": "صمامات فحص مزدوجة من الصلب المصبوب",
    "Slab Gate Valves": "صمامات البوابة اللوحية",
    "Expanding Gate Valves": "صمامات البوابة المتمددة",
    "Butterfly Valves": "صمامات الفراشة",
    "Instrumentation DBB Valves": "صمامات DBB للأجهزة",
    "Pumps and Valves for Fluid Control": "مضخات وصمامات للتحكم في السوائل",
    "Heat Exchangers and Cooling Systems": "المبادلات الحرارية وأنظمة التبريد",
    "Air Compressor": "ضاغط هواء",
    "Exchangers": "مبادلات",
    "Axial Compressor / Centrifugal Compressor": "ضاغط محوري / ضاغط طرد مركزي",
    "Towers": "أبراج",
    "Pressure Vessels and Expansion Tanks": "أوعية الضغط وخزانات التمدد",
    "Hydronic Balancing Equipment": "معدات الموازنة المائية",
    "Turbine Parts": "أجزاء التوربينات",
    "Boilers": "غلايات",
    "Centrifugal Compressor": "ضاغط طرد مركزي",
    "Heaters": "سخانات",
    "Heat Exchangers": "المبادلات الحرارية",
    "Plate Heat Exchangers": "مبادلات حرارية لوحية",
    "Indirect Air Heaters": "سخانات هواء غير مباشرة",
    "Hybrid, Plate & Shell Heat Exchangers": "مبادلات حرارية هجينة ولوحية وأنبوبية",
    "Cylinder Head": "رأس الأسطوانة",
    "Heavy Vessels & Accessories": "أوعية ثقيلة وملحقاتها",
    "Hydraulic Pumps": "مضخات هيدروليكية",
    "Pressure Vessels": "أوعية الضغط",
    "Steel Conduit and Accessories": "أنابيب صلب وملحقاتها",
    "Spares and Accessories": "قطع غيار وملحقات",
    "Tubular Heat Recuperator": "مسترد حرارة أنبوبي",
    "Inlet Valves": "صمامات السحب",
    "Centrifugal - Non Metallic (Pumps)": "مضخات طرد مركزي - غير معدنية",
    "Hydraulic Motors": "محركات هيدروليكية",
    "Alternators": "مولدات التيار المتردد",
    "Boiler Piping": "أنابيب الغلايات",
    "Chain Drive System": "نظام نقل الحركة بالسلاسل",
    "Coolers": "مبردات",
    "Engine Modules": "وحدات المحرك",
    "Hydraulic Actuators": "مشغلات هيدروليكية",
    "Motors": "محركات",
    "Seal Kits": "أطقم موانع التسرب",
    "Sensors": "مستشعرات",
    "Fin Coils": "ملفات زعانف",
    "Winches and Controls": "روافع وأدوات تحكم",
    "Mixers and Agitators": "خلاطات ومقلبات",
    "Diaphragm": "غشاء",
    "Deep Well Cargo Pumps": "مضخات بضائع للآبار العميقة",
    "Oil Cooler": "مبرد زيت",
    "Cylinder Block": "كتلة الأسطوانة",
    "Purifiers": "أجهزة تنقية",
    "Oil Water Separators": "فواصل الزيت عن الماء",
    "Flares": "مشاعل",
    "Hydraulic Circuit": "دائرة هيدروليكية",
    "Pistons": "مكابس",
    "Skid Mount Packages": "حزم مثبتة على قواعد منزلقة",
    "Valve Spring": "زنبرك الصمام",
    "End Plates": "لوحات طرفية",
    "Auxiliaries": "مساعدات",
    "Pumps": "مضخات",
    "Diving Winches": "روافع غوص",
    "Thrusters": "دفاعات",
    "Analytical Instrumentation": "أجهزة تحليلية",
    "Process Refractometers": "أجهزة قياس الانكسار العملية",
    "Flame & Gas Detection Devices": "أجهزة كشف اللهب والغاز",
    "Flow Measurement Devices": "أجهزة قياس التدفق",
    "Gauges & Switches": "مقاييس ومفاتيح",
    "Heat Trace Products": "منتجات التتبع الحراري",
    "Explosion Protection Devices": "أجهزة الحماية من الانفجار",
    "I/O Signal Conditioners": "مكيفات إشارات الإدخال والإخراج",
    "Level Measurement Devices & Controls": "أجهزة قياس مستوى وأدوات تحكم",
    "Level Sensors & Controls": "مستشعرات مستوى وأدوات تحكم",
    "Indicators": "مؤشرات",
    "Pneumatic Cylinder": "أسطوانة تعمل بالهواء المضغوط",
    "Single Solenoid Valves": "صمامات لولبية أحادية",
    "Double Solenoid Valves": "صمامات لولبية مزدوجة",
    "Vacuum Poppet Valves": "صمامات قرصية تفريغية",
    "Quick Exhaust Valves": "صمامات عادم سريعة",
    "Compact Cylinder": "أسطوانة مدمجة",
    "Single Pilot Valves": "صمامات دليلية أحادية",
    "Double Pilot Valves": "صمامات دليلية مزدوجة",
    "Flow Control Valves": "صمامات التحكم في التدفق",
    "Rodless Cylinder": "أسطوانة بدون قضيب",
    "Water Solenoid Valves": "صمامات لولبية للماء",
    "Steam Solenoid Valves": "صمامات لولبية للبخار",
    "Filters, Regulators": "فلاتر ومنظمات",
    "Guided Cylinder": "أسطوانة موجهة",
    "Grippers (Pick and Place)": "مقابض (للتقاط والوضع)",
    "Air Bellows": "منافيخ هواء",
    "Shock Absorbers": "ممتصات صدمات",
    "Directional Valve Series": "سلسلة الصمامات الاتجاهية",
    "Modular Valve Series": "سلسلة صمامات معيارية",
    "Pressure Valve Series": "سلسلة صمامات الضغط",
    "Proportional Valve Series": "سلسلة صمامات تناسبية",
    "Flow Control Valve Series": "سلسلة صمامات التحكم في التدفق",
    "Cartridge Valve Series": "سلسلة صمامات خرطوشية",
    "Engineering Machinery Valve": "صمام آلات هندسية",
    "Hydraulic Station Series": "سلسلة محطات هيدروليكية",
    "Standard Manifold Blocks": "كتل مشعب قياسية",
    "Fluid Level Indicators": "مؤشرات مستوى السوائل",
    "Hydraulic Cylinder": "أسطوانة هيدروليكية",
    "Hydraulic Power Packs": "حزم طاقة هيدروليكية",
    "Programmable Logic Control (PLC)": "جهاز التحكم المنطقي القابل للبرمجة (PLC)",
    "Human Machine Interface (HMI)": "واجهة بين الإنسان والآلة (HMI)",
    "Inductive Proximity Sensor": "مستشعر تقارب حثي",
    "Capacitive Sensor": "مستشعر سعوي",
    "Photoelectric Sensor": "مستشعر كهروضوئي",
    "Fibre Optic Sensor": "مستشعر ألياف بصرية",
    "Radar Level Sensor": "مستشعر مستوى راداري",
    "Pressure Sensor": "مستشعر الضغط",
    "Temperature Sensor": "مستشعر درجة الحرارة",
    "RTD Sensor": "مستشعر RTD",
    "Pulse Output Flowmeter": "مقياس تدفق بنبض إخراج",
    "Turbine Flowmeter": "مقياس تدفق توربيني",
    "Target Flowmeters": "مقاييس تدفق مستهدفة",
    "Ultrasonic Flowmeter": "مقياس الجريان بالموجات فوق الصوتية",
    "Rotameter": "مقياس الدوران",
    "Watermeter": "عداد مياه",
    "Diesel Flowmeter": "مقياس تدفق الديزل",
    "Wiring Accessories": "ملحقات التمديدات السلكية",
    "Cables and Wires": "كابلات وأسلاك",
    "Cable": "كابل",
    "Overhead Power Line Design": "تصميم خطوط الطاقة الهوائية",
    "Trunking and Ladders": "قنوات وكابلات وسلالم",
    "Busbars": "قضبان التوصيل",
    "PVC Conduit and Accessories": "أنابيب PVC وملحقاتها",
    "Grounding and Lightning Protection Design": "تصميم الحماية من الصواعق والتأريض",
    "Control Cables": "كابلات تحكم",
    "Data Cable": "كابل بيانات",
    "Fibre Optic Cable": "كابل ألياف بصرية",
    "Hazardous Location Electrical Design": "التصميم الكهربائي للأماكن الخطرة",
    "Glands and Lugs": "غدد وعروات",
    "High Temperature Cable": "كابل درجة حرارة عالية",
    "Instrumentation Cable": "كابل أجهزة",
    "Design and Supply of HIPPS Package": "تصميم وتوريد حزمة HIPPS",
    "GI Conduits and Accessories": "أنابيب حديد مجلفن وملحقاتها",
    "Industrial Plugs and Sockets": "مقابس ومآخذ صناعية",
    "Electrical Tools": "أدوات كهربائية",
    "PLC, DCS, ESD": "PLC، DCS، ESD",
    "Flexible Cable": "كابل مرن",
    "Networking Cables": "كابلات شبكات",
    "Burner Management System": "نظام إدارة الحراقات",
    "Multicore Industrial Cables": "كابلات صناعية متعددة النواة",
    "Fire Resistant Cables": "كابلات مقاومة للحريق",
    "Cable Trays": "حوامل الكابلات",
    "SCADA Systems": "أنظمة سكادا",
    "BMS Cable": "كابل BMS",
    "Building Wires (PVC Insulated)": "أسلاك بناء (معزولة بـ PVC)",
    "Coaxial Cables": "كابلات متحدة المحور",
    "Control Room Hot Cut-over": "التحويل الساخن لغرفة التحكم",
    "Solar Cables": "كابلات طاقة شمسية",
    "Earthing and Lightning Protection": "التأريض والحماية من الصواعق",
    "GI Back Boxes": "صناديق خلفية حديد مجلفن",
    "SIL Studies": "دراسات SIL",
    "Cable Join Kit": "طقم ربط الكابلات",
    "PVC Trunking": "قنوات PVC",
    "Circuit": "دائرة كهربائية",
    "Relief Valves": "صمامات تنفيس",
    "Cable Ties": "أربطة الكابلات",
    "Water Heaters": "سخانات مياه",
    "Switches": "مفاتيح",
    "Mobile Instrument Calibration": "معايرة الأدوات المحمولة",
    "Chemical Injection Packages": "حزم حقن المواد الكيميائية",
    "Solar Timer Switches": "مفاتيح توقيت بالطاقة الشمسية",
    "Switchyard": "ساحة مفاتيح",
    "Substation": "محطة فرعية",
    "F&G/SCADA Systems": "أنظمة كشف الغاز والحريق / سكادا",
    "Fire Suppression Systems": "أنظمة إخماد الحرائق",
    "Demulsifiers": "كاسرات الاستحلاب",
    "Foaming Agent": "عامل رغوي",
    "Corrosion Inhibitors": "مثبطات التآكل",
    "Scale Inhibitors": "مثبطات الترسبات",
    "H2S Scavengers": "مزيلات H2S",
    "Water Clarifiers": "منقيات المياه",
    "Rig Cleaning Surfactants": "خافضات التوتر السطحي لتنظيف الحفارات",
    "Wellbore Cleaners": "منظفات آبار النفط",
    "Iron Sulfide and Sludge Control": "التحكم في كبريتيد الحديد والحمأة",
    "Green Solvents": "مذيبات خضراء",
    "Alkylation": "الألكلة",
    "Caustic Soda Flakes": "رقائق الصودا الكاوية",
    "Sodium Hypochlorite": "هيبوكلوريت الصوديوم",
    "Calcium Chloride": "كلوريد الكالسيوم",
    "Hydrogen Peroxide": "بيروكسيد الهيدروجين",
    "Soda Ash": "رماد الصودا",
    "Biocides": "مبيدات حيوية",
    "Surfactants": "خافضات التوتر السطحي",
    "Gelling Agents": "عوامل تبلور",
    "Defoamers": "مزيلات الرغوة",
    "Asphaltene Dissolvers": "مذيبات الإسفلتين",
    "Paraffin Inhibitors": "مثبطات البارافين",
    "Lubricants": "زيوت التشحيم",
    "Ammonium Polysulfide": "بولي كبريتيد الأمونيوم",
    "Hydrochloric Acid": "حمض الهيدروكلوريك",
    "Peracetic Acid": "حمض البيروكسي أسيتيك",
    "Caustic Soda Lye": "غسول الصودا الكاوية",
    "Sodium Carbonate (Na2CO3)": "كربونات الصوديوم",
    "Rust Prime": "أساس مانع للصدأ",
    "RXSOL": "ركسول",
    "Water Treatment Chemicals": "كيماويات معالجة المياه",
    "General Purpose Cleaners": "منظفات عامة",
    "High Purity Calibration Gases": "غازات معايرة عالية النقاء",
    "Methane (CH4)": "الميثان (CH4)",
    "Carbon Monoxide (CO)": "أول أكسيد الكربون (CO)",
    "Nitric Oxide (NO)": "أكسيد النيتريك (NO)",
    "Propane (C3H8)": "البروبان (C3H8)",
    "Flammable Gas": "غاز قابل للاشتعال",
    "Oxygen Gas": "غاز الأكسجين",
    "Multi Mix (Combination)": "خليط متعدد (مزيج)",
    "Hydrogen Sulfide (H2S)": "كبريتيد الهيدروجين (H2S)",
    "Nitrogen Dioxide (NO2)": "ثاني أكسيد النيتروجين (NO2)",
    "Toxic Gas": "غاز سام",
    "Sulfur Dioxide (SO2)": "ثاني أكسيد الكبريت (SO2)",
    "Paint": "دهان",
    "RO Membrane Cleaner": "منظف غشاء التناضح العكسي (RO)",
    "Battery": "بطارية",
    "Thinner": "مخفف دهان",
    "Oil Spill Dispersant": "مشتت التسرب النفطي",
    "Resin": "راتنج",
    "Hypalon Glue": "غراء هيبالون",
    "Tank Cleaners": "منظفات الخزانات",
    "Rust Remover": "مزيل الصدأ",
    "Multi Purpose Cleaner": "منظف متعدد الأغراض",
    "Hydrochloric Acid Solution": "محلول حمض الهيدروكلوريك",
    "Oil & Grease Emulsifier": "مستحلب الزيوت والشحوم"
  }
};

// Hardcoded parts of productDetailsMap
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
  "Air Control Valves": {
    features: ["Regulates airflow for precise control", "Ensures long-term reliability", "Available in various sizes and configurations", "Facilitates efficient pneumatic system operation", "Easy installation and maintenance"]
  },
  "BOP Spare Parts": {
    features: ["Essential for maintaining BOP functionality", "Ensures readiness for critical operations", "Wide range available for different models", "Reliable quality for long-term performance", "Facilitates rapid maintenance and repairs"]
  },
  "Pressure Gauges": {
    features: ["Includes 2-inch 1502 hammer union", "Shock-resistant gauge with internal dampening", "Available in 40MPa, 60MPa, psi, kPa, & bar", "Clear polymer lens for accurate readings", "Liquid-filled to minimize vibration & wear", "Operating temperature: -50°C to +65°C"]
  },
  "Pressure Regulators": {
    features: ["Controls and stabilizes fluid pressure", "Ensures consistent system operation", "Durable construction for reliable performance", "Available in various pressure ranges", "Facilitates precise pressure adjustment"]
  },
  "Needle Valves": {
    features: ["Precice flow control for fluid systems", "Durable construction ensures reliability", "Available in various sizes and materials", "Facilitates fine adjustments in flow", "Easy installation and operation"]
  },
  "Safety Clamps": {
    features: ["Ensures secure pipe and tooling", "Vital for wellbore safety procedures", "Durable construction for reliable performance", "Available in various sizes and configurations", "Facilitates quick and safe operation"]
  },
  "Wellheads": {
    features: ["Critical component for oil extraction", "Safely controls pressure at the well", "Robust construction ensures reliability", "Available in various sizes and configurations", "Facilitates efficient well operation"]
  },
  "Data Header": {
    features: ["Collects and distributes oilfield supplies well data", "Essential for monitoring and analysis", "Robust construction ensures reliability", "Available in various configurations", "Facilitates efficient data management"]
  },
  "Hub Connections": {
    features: ["Facilitates secure attachment of components", "Ensures reliable transmission of forces", "Robust construction for durability", "Available in various sizes and types", "Essential for safe and efficient operations"]
  },
  "Top Connectors": {
    features: ["Facilitates secure connection at the top", "Ensures reliable transmission of loads", "Essential for safe and efficient operations"],
    specifications: "Sizes: 2-1/16 in through 7-1/16 in | Pressure Ratings: 2,000 psi through 20,000 psi"
  },
  "Spools - Drilling, Adapter & Spacer": {
    features: ["Essential for well control operations", "Facilitates seamless equipment integration", "Robust construction ensures reliability", "Available in various configurations", "Enables efficient drilling processes"]
  },
  "Double Studded Adapter Flanges": {
    features: ["Facilitates connection between equipment", "Allows versatile wellhead configurations", "Robust construction ensures reliability", "Available in various sizes, pressure ratings", "Essential for well control operations"]
  },
  "Cast Steel Gate, Globe and Check Valves": {
    specifications: "Design Standards: API 600, API 6D, ASME B16.34, API 603 | Sizes: 2 in to 72 in | Pressure Class: 150# to 2500# | Ends: RF, RTJ or BWE, (ASME B16.5, MSS-SP-44, B16.47)",
    materials: ["WCA, WCB, WCC, LCB, LCC", "WC1, WC5, WC6, WC9, LC2, LC3, C5, C12, C12A", "CF8, CF8M, CF8C, CF10, CG8M", "CE8MN, CD6MN, CD3MN", "Monel M30C, M35-1, CZ100", "Inconel CY40, (Inconel 600)", "CW2M (Hastelloy C4)", "N12MV (Hastelloy B)", "CW12MW (Former Hastelloy C-276)", "CW6M (New Hastelloy C-276)", "CU5MCuC (Incoloy 825)", "N7M (Hastelloy B2)", "CW6MC (Inconel 625)", "Aluminium Bronze (95500, 95600, 9580)"],
    features: ["Low fugitive emissions control", "NACE Service either MR-01-75 or MR-01-03", "By-Pass", "Lantern rings", "Grease injectors", "Damper and Counterweights for Check valves", "Chain-wheel, Gear operation", "Electric, Pneumatic or Hydraulic Actuation"]
  },
  "Forged Steel Gate, Globe and Check Valves": {
    specifications: "Design Standards: API 602 | Sizes: 1/4 in to 2 in | Pressure Class: 800#, 1500# & 2500# | Ends: FNPT, SWE, RF, RTJ & BWE",
    materials: ["A105, LF2, LF3", "F1, F11, F22, F5, F5a, F9", "F304, F316, F304L, F316L", "F51, F55", "Inconel", "Incoloy", "Monel"],
    features: ["T & Y Patterns", "Bolted & Welded Bonnet", "Low fugitive emissions control", "NACE Service either MR-01-75 or MR-01-03"]
  },
  "Trunnion Mounted Ball Valve": {
    specifications: "Design Standards: API 6D | Sizes: 2 in to 60 in | Pressure Class: 150, 300, 600, 900, 1500 & 2500# | Ends: RF, RTJ or BWE, (ASME B16.5, MSS-SP-44, B16.47)",
    materials: ["A105 or WCB", "LF2, LF3 or LCB, LCC", "F316, F347 or CF8M, CF8C", "F51 or CD3MN", "F55 or CD3MWCuN"],
    features: ["Bolted Body or Welded Body", "Anti-Static design", "Blow-out proof stem", "Double block and bleed (DBB)", "Fire-Safe design to API 6FA / API 607", "Self-relieving seats or double piston seats", "Cavity relief valve for liquid service"]
  },
  "Floating Ball Valves": {
    specifications: "Design Standards: API 6D or API 608 | Sizes: 1/2 in to 8 in | Pressure Class: 150, 300, 600# | Ends: RF, RTJ or BWE, (ASME B16.5)",
    materials: ["A105 or WCB", "LF2, LF3 or LCB, LCC", "F316, F347 or CF8M, CF8C", "F51 or CD3MN", "F55 or CD3MWCuN"],
    features: ["Split body or end entry", "Anti-static design", "Blow-out proof stem", "Fire-Safe design to API 6FA / API 607", "Locking device optional"]
  },
  "Steel Lubricated Plug Valves": {
    specifications: "Design Standards: API 6D or API 599 | Sizes: 1/2 in to 36 in | Pressure Class: 150, 300, 600, 900, 1500 & 2500# | Ends: RF, RTJ or BWE, (ASME B16.5)",
    materials: ["A105 or WCB", "LF2 or LCB, LCC", "F316 or CF8M", "Super Duplex Steel"],
    features: ["Regular, Short or Venturi patterns", "Metal-to-metal seating with sealant injection", "Self-cleaning action on plug rotation", "Fire-safe design API 6FA / API 607", "Locking device optional"]
  },
  "Pressure Seal Cast Steel Valves": {
    specifications: "Design Standards: ASME B16.34 | Sizes: 2 in to 24 in | Pressure Class: 600, 900, 1500 & 2500# | Ends: BW or RTJ / RF",
    materials: ["WCB, WCC, LCB, LCC", "WC6, WC9, C5, C12, C12A", "CF8M, CF8C"],
    features: ["Pressure seal bonnet design", "Flexible wedge for gate valves", "Stellite hardfacing on seats", "Low fugitive emissions control"]
  },
  "Duo Check Cast Steel Valves": {
    specifications: "Design Standards: API 594 | Sizes: 2 in to 60 in | Pressure Class: 150, 300, 600, 900, 1500 & 2500# | Ends: Wafer, Lug or Flanged",
    materials: ["WCB, LCB, LCC", "CF8, CF8M, CF3, CF3M", "Duplex and Super Duplex Steel"],
    features: ["Dual plate spring loaded design", "Low pressure drop across valve", "Resilient or Metal seating", "Compact face-to-face dimensions"]
  },
  "Slab Gate Valves": {
    specifications: "Design Standards: API 6D | Sizes: 2 in to 48 in | Pressure Class: 150, 300, 600, 900, 1500 & 2500# | Ends: RF, RTJ or BWE",
    materials: ["WCB, LCB, LCC", "CF8, CF8M, CF3, CF3M", "Duplex Steel"],
    features: ["Through-conduit slab gate", "Double block and bleed (DBB)", "Bi-directional sealing", "Cavity pressure relief", "Seats with thermoplastic inserts"]
  },
  "Expanding Gate Valves": {
    specifications: "Design Standards: API 6D or API 6A | Sizes: 2 in to 24 in | Pressure Class: 150, 300, 600, 900, 1500 & 2500# | Ends: RF, RTJ or BWE",
    materials: ["WCB, LCB, LCC", "CF8, CF8M", "Duplex Steel"],
    features: ["Mechanical expanding gate design", "Positive tight seal under low/high pressure", "Double block and bleed (DBB)", "Ideal for abrasive media"]
  },
  "Butterfly Valves": {
    specifications: "Design Standards: API 609, ASME B16.34 | Sizes: 2 in to 80 in | Pressure Class: 150, 300, 600# | Ends: Wafer, Lug or Flanged",
    materials: ["WCB, LCB, LCC", "CF8, CF8M, CF3, CF3M", "Aluminium Bronze", "Duplex Steel"],
    features: ["Triple offset geometry", "Zero-leakage bi-directional shutoff", "Metal-to-metal seating", "Laminated seal ring on disc", "Fire-safe design to API 607"]
  },
  "Instrumentation DBB Valves": {
    specifications: "Design Standards: ASME B16.34, MSS-SP-99 | Sizes: 1/2 in to 2 in | Pressure Class: 150# to 2500# (up to 6000 psi) | Ends: NPT, Socket Weld, Flanged",
    materials: ["A105, LF2", "F316, F316L", "Duplex Steel", "Monel", "Hastelloy"],
    features: ["Double block and bleed in single body", "Reduced installation space and leakage paths", "Ball or needle valve configurations", "Anti-blowout stem design", "Fire-safe design optional"]
  }
};

// Simple helper to translate technical spec strings to Arabic
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
    const escapedEn = en.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedEn}\\b`, 'gi');
    result = result.replace(regex, ar);
  });
  return result;
}

async function seedData() {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<password>') || process.env.MONGO_URI.includes('xxxxx')) {
      console.error('❌ Migration aborted: MONGO_URI in backend/.env has placeholder credentials.');
      return;
    }

    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Migrate Categories
    console.log('\n📁 Migrating Categories...');
    const categories = await Category.find();
    let updatedCats = 0;
    
    for (const cat of categories) {
      // Find case-insensitive exact translation match
      const matchedKey = Object.keys(dynamicTranslations.categories).find(
        k => k.trim().toLowerCase() === cat.name.trim().toLowerCase()
      );
      const nameAr = matchedKey ? dynamicTranslations.categories[matchedKey] : '';
      
      cat.nameAr = nameAr;
      await cat.save();
      updatedCats++;
    }
    console.log(`✅ Successfully updated ${updatedCats} categories with Arabic fields.`);

    // 2. Migrate Products
    console.log('\n📦 Migrating Products...');
    const products = await Product.find();
    let updatedProds = 0;

    for (const prod of products) {
      // Find product name translation (with case-insensitive trim matching)
      const matchedProdKey = Object.keys(dynamicTranslations.products).find(
        k => k.trim().toLowerCase() === prod.productName.trim().toLowerCase()
      );
      const nameAr = matchedProdKey ? dynamicTranslations.products[matchedProdKey] : '';
      
      // Find category translation (with case-insensitive trim matching)
      const matchedCatKey = Object.keys(dynamicTranslations.categories).find(
        k => k.trim().toLowerCase() === prod.category.trim().toLowerCase()
      );
      const categoryAr = matchedCatKey ? dynamicTranslations.categories[matchedCatKey] : '';

      prod.productNameAr = nameAr || prod.productName; // Fallback to EN if missing
      prod.categoryAr = categoryAr || prod.category;

      // Check specifications & enrichments from productDetailsMap
      const matchedDetailKey = Object.keys(productDetailsMap).find(
        k => k.trim().toLowerCase() === prod.productName.trim().toLowerCase()
      );
      const details = matchedDetailKey ? productDetailsMap[matchedDetailKey] : null;

      if (details) {
        if (details.overview) {
          prod.description = details.overview;
          // Look up if overview description has a translation in products
          const matchedOverviewKey = Object.keys(dynamicTranslations.products).find(
            k => k.trim().toLowerCase() === details.overview.trim().toLowerCase()
          );
          prod.descriptionAr = matchedOverviewKey ? dynamicTranslations.products[matchedOverviewKey] : '';
        }
        
        if (details.specifications) {
          prod.specifications = details.specifications;
          prod.specificationsAr = translateSpecs(details.specifications);
        }

        if (details.features && details.features.length > 0) {
          prod.features = details.features;
          prod.featuresAr = details.features.map(f => {
            const matchedFeatKey = Object.keys(dynamicTranslations.products).find(
              k => k.trim().toLowerCase() === f.trim().toLowerCase()
            );
            return matchedFeatKey ? dynamicTranslations.products[matchedFeatKey] : f;
          });
        }

        if (details.materials && details.materials.length > 0) {
          prod.materials = details.materials;
          prod.materialsAr = details.materials.map(m => {
            const matchedMatKey = Object.keys(dynamicTranslations.products).find(
              k => k.trim().toLowerCase() === m.trim().toLowerCase()
            );
            return matchedMatKey ? dynamicTranslations.products[matchedMatKey] : m;
          });
        }

        if (details.applications && details.applications.length > 0) {
          prod.applications = details.applications;
          prod.applicationsAr = details.applications.map(a => {
            const matchedAppKey = Object.keys(dynamicTranslations.products).find(
              k => k.trim().toLowerCase() === a.trim().toLowerCase()
            );
            return matchedAppKey ? dynamicTranslations.products[matchedAppKey] : a;
          });
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
