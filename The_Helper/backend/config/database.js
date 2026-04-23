const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create geospatial indexes
    mongoose.connection.db.collection('hospitals').createIndex({ location: '2dsphere' });
    mongoose.connection.db.collection('pharmacies').createIndex({ location: '2dsphere' });
    mongoose.connection.db.collection('sosalerts').createIndex({ location: '2dsphere' });
    
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
