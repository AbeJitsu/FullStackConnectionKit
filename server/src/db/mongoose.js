// server/src/db/mongoose.js

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    autoIndex: false,
    maxPoolSize: 100,
    socketTimeoutMS: 45000,
    family: 4,
  };

  const mongoUri =
    process.env.SERVER_USE_CLOUD_DB === 'true'
      ? process.env.SERVER_CLOUD_DATABASE_URL
      : process.env.SERVER_LOCAL_DATABASE_URL;

  try {
    await mongoose.connect(mongoUri, options);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connection is open');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000);
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
