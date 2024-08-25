// server/src/routes/sseRoute.js
const express = require('express');
const router = express.Router();
const { handleSSEConnection } = require('../utils/sse-manager');

router.get('/', (req, res) => {
  handleSSEConnection(req, res);
});

module.exports = router;
