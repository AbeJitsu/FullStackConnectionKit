// server/src/routes/corsTestRoute.js
const express = require('express');
const router = express.Router();
const errorHandler = require('../middleware/errorHandler');

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// CORS test route
router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({
      message: 'CORS GET request successful',
      timestamp: new Date().toISOString(),
      headers: req.headers,
      method: req.method,
    });
  })
);

// Additional route to test CORS with POST method
router.post(
  '/',
  asyncHandler(async (req, res) => {
    res.json({
      message: 'CORS POST request successful',
      timestamp: new Date().toISOString(),
      body: req.body,
      headers: req.headers,
      method: req.method,
    });
  })
);

// Test route for PUT method
router.put(
  '/',
  asyncHandler(async (req, res) => {
    res.json({
      message: 'CORS PUT request successful',
      timestamp: new Date().toISOString(),
      body: req.body,
      headers: req.headers,
      method: req.method,
    });
  })
);

// Test route for DELETE method
router.delete(
  '/',
  asyncHandler(async (req, res) => {
    res.json({
      message: 'CORS DELETE request successful',
      timestamp: new Date().toISOString(),
      headers: req.headers,
      method: req.method,
    });
  })
);

// Test route that intentionally throws an error
router.get(
  '/error',
  asyncHandler(async (req, res) => {
    throw new Error('This is a test error for CORS');
  })
);

// Test route with a delay to simulate slow responses
router.get(
  '/delay',
  asyncHandler(async (req, res) => {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
    res.json({
      message: 'Delayed CORS response successful',
      timestamp: new Date().toISOString(),
    });
  })
);

// Apply error handler to all routes
router.use(errorHandler);

module.exports = router;
// server/src/routes/corsTestRoute.js
