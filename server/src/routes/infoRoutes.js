// server/src/routes/infoRoutes.js
const express = require('express');
const router = express.Router();
const infoService = require('../services/infoService');

// Async handler wrapper with logging
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next))
    .catch(next)
    .finally(() => {
      console.log(`${req.method} request to ${req.originalUrl}`, {
        origin: req.headers.origin,
        'user-agent': req.headers['user-agent'],
      });
    });

// Main info route
router.get(
  '/',
  asyncHandler(async (req, res) => {
    console.log(
      'Current environment:',
      process.env.VERCEL ? 'Vercel' : 'Express'
    );
    res.json(infoService.getServerInfo());
  })
);

// Database status route
router.get(
  '/database-status',
  asyncHandler(async (req, res) => {
    res.json(infoService.getDatabaseStatus());
  })
);

// System health check route
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const healthCheck = await infoService.getHealthCheck();
    res.json(healthCheck);
  })
);

// Environment variables route (be cautious with this in production)
router.get(
  '/env',
  asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res
        .status(403)
        .json({ message: 'Access forbidden in production mode' });
    }
    res.json(process.env);
  })
);

module.exports = router;
