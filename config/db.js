const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<password>') || process.env.MONGO_URI.includes('xxxxx')) {
      console.error('❌ MongoDB Connection Error: MONGO_URI in backend/.env contains placeholder values (<password> or xxxxx).');
      console.error('👉 Please replace <password> and cluster address in backend/.env with your actual MongoDB Atlas URI.');
      process.exit(1);
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    cachedConnection = conn;
    console.log(`✅ MongoDB Connected to Atlas: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
