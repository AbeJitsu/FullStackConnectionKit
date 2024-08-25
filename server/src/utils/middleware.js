// utils/middleware.js
const { corsMiddleware } = require('./corsConfig');

const errorHandler = (err, res) => {
  console.error(err);
  res
    .status(500)
    .json({ error: 'Internal Server Error', message: err.message });
};

const applyMiddleware = (handler) => async (req, res) => {
  try {
    await new Promise((resolve) => corsMiddleware(req, res, resolve));
    await handler(req, res);
  } catch (error) {
    errorHandler(error, res);
  }
};

module.exports = { applyMiddleware };
