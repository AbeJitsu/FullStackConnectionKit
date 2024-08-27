// api/counter-operations.js
const { connectToDatabase } = require('../server/src/db/mongoose');
const Counter = require('../server/src/models/Counter');
const { sendSSEUpdate } = require('../server/src/utils/sse-manager');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    const { operation, name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Counter name is required' });
    }

    let counter = await Counter.findOne({ name });
    if (!counter) {
      counter = new Counter({ name });
    }

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
      default:
        return res.status(400).json({ message: 'Invalid operation' });
    }

    await counter.save();
    sendSSEUpdate('counter-update', { name, value: counter.value });
    res.json({ message: 'Operation successful', counter });
  } catch (error) {
    console.error('Counter operation error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
