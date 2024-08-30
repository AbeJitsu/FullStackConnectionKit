// server/src/db/mongoose.js

const mongoose = require('mongoose');
require('dotenv').config();

let connection = null;

const getMongoUri = () => {
  return process.env.SERVER_USE_CLOUD_DB === 'true'
    ? process.env.SERVER_CLOUD_DATABASE_URL
    : process.env.SERVER_LOCAL_DATABASE_URL;
};

const connectDB = async () => {
  if (connection) {
    return connection;
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    autoIndex: false,
    maxPoolSize: 10, // Reduced for serverless environment
    socketTimeoutMS: 45000,
    family: 4,
    bufferCommands: false, // Disable buffering for serverless
  };

  const mongoUri = getMongoUri();

  try {
    connection = await mongoose.connect(mongoUri, options);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connection is open');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(
        'MongoDB disconnected. Connection will be re-established on next request.'
      );
      connection = null;
    });

    // Handle serverless environment cleanup
    if (process.env.VERCEL) {
      process.on('SIGTERM', async () => {
        await mongoose.connection.close();
        console.log(
          'MongoDB connection closed due to serverless function termination'
        );
        connection = null;
      });
    } else {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
      });
    }

    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Let the calling function handle the error
  }
};

module.exports = connectDB;
