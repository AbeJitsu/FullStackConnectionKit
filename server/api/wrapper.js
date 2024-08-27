// api/wrapper.js
const { applyMiddleware } = require('../utils/middleware');

const createHandler = (handler) => {
  return applyMiddleware(async (req, res) => {
    // Your serverless function logic here
    await handler(req, res);
  });
};

module.exports = { createHandler };
