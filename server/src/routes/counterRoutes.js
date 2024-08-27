const express = require('express');
const router = express.Router();
const Counter = require('../models/Counter');
const { broadcastSSEUpdate } = require('../utils/sse-manager');

router.post('/', async (req, res) => {
  try {
    const { operation, name } = req.body;
    let counter = await Counter.findOne({ name });
    if (!counter) {
      counter = new Counter({ name });
    }

    switch (operation) {
      case 'increment':
        counter.value += 1;
        break;
      case 'decrement':
        counter.value = Math.max(0, counter.value - 1);
        break;
      case 'reset':
        counter.value = 0;
        break;
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    await counter.save();
    broadcastSSEUpdate('counter-update', { name, value: counter.value });
    res.json({ message: 'Operation successful', counter });
  } catch (error) {
    console.error('Counter operation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
