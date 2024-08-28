// api/counter-operations.js
const mongoose = require('mongoose');
const Counter = require('../src/models/Counter');
const connectDB = require('../src/db/mongoose');

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

const handleCounterOperation = async (operation, name) => {
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
      throw new Error('Invalid operation');
  }

  await counter.save();
  return counter;
};

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    const { operation, name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Counter name is required' });
    }

    const counter = await handleCounterOperation(operation, name);
    res.json({ message: 'Operation successful', counter });
  } catch (error) {
    console.error('Counter operation error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
