// api/counter-operations.js
const { connectToDatabase } = require('../utils/db');
const Counter = require('../models/Counter');
const { sendSSEUpdate } = require('../utils/sse-manager');

module.exports = async (req, res) => {
  await connectToDatabase();
  const { operation, name } = req.body;
  let counter = await Counter.getOrCreate(name);

  switch (operation) {
    case 'increment':
      await counter.increment();
      break;
    case 'decrement':
      await counter.decrement();
      break;
    case 'reset':
      await counter.reset();
      break;
  }

  sendSSEUpdate('counter-update', { name, value: counter.value });
  res.json({ message: 'Operation successful', counter });
};

