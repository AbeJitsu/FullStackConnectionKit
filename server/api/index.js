// server/api/index.js

const { createApp } = require('../src/serverConfig');

const app = createApp();

// Serverless-compatible handler
const serverlessHandler = async (req, res) => {
  await app(req, res);
};

// Export the serverless handler for Vercel, otherwise export the app
module.exports = process.env.VERCEL ? serverlessHandler : app;
