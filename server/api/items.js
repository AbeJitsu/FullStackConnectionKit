// server/api/items.js
const mongoose = require('mongoose');
const Item = require('../src/models/Item');
const connectDB = require('../src/db/mongoose');

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  await connectDB();
  isConnected = true;
};

const handleGetItems = async (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const searchQuery = req.query.search || '';
  const category = req.query.category || '';
  const sortBy = req.query.sortBy || 'name';
  const order = req.query.order === 'desc' ? -1 : 1;

  const filter = {};
  if (searchQuery) {
    filter.$or = [
      { name: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
    ];
  }
  if (category) {
    filter.category = category;
  }

  const total = await Item.countDocuments(filter);
  const items = await Item.find(filter)
    .sort({ [sortBy]: order })
    .limit(limit)
    .skip(startIndex);

  return {
    items,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const handleGetItemById = async (id) => {
  const item = await Item.findById(id);
  if (!item) {
    throw new Error('Item not found');
  }
  return item;
};

const handleCreateItem = async (data) => {
  const { name, description, quantity, price, category } = data;
  if (!name || typeof quantity !== 'number' || typeof price !== 'number') {
    throw new Error('Name, valid quantity, and valid price are required');
  }
  const newItem = new Item({ name, description, quantity, price, category });
  await newItem.save();
  return newItem;
};

const handleUpdateItem = async (id, data) => {
  const { name, description, quantity, price, category } = data;
  const item = await Item.findByIdAndUpdate(
    id,
    { name, description, quantity, price, category },
    { new: true, runValidators: true }
  );
  if (!item) {
    throw new Error('Item not found');
  }
  return item;
};

const handleDeleteItem = async (id) => {
  const item = await Item.findByIdAndDelete(id);
  if (!item) {
    throw new Error('Item not found');
  }
  return { message: 'Item deleted successfully' };
};

const handleGetTotalQuantity = async () => {
  return await Item.getTotalQuantity();
};

const handleGetItemsByCategory = async (category) => {
  return await Item.getByCategory(category);
};

const handleUpdateItemQuantity = async (id, quantity) => {
  if (typeof quantity !== 'number') {
    throw new Error('Valid quantity is required');
  }
  const item = await Item.findById(id);
  if (!item) {
    throw new Error('Item not found');
  }
  return await item.updateQuantity(quantity);
};

const itemsHandler = async (req, res) => {
  await connectToDatabase();

  try {
    switch (req.method) {
      case 'GET':
        if (req.query.id) {
          const item = await handleGetItemById(req.query.id);
          res.status(200).json(item);
        } else if (req.query.category) {
          const items = await handleGetItemsByCategory(req.query.category);
          res.status(200).json(items);
        } else if (req.query.totalQuantity) {
          const totalQuantity = await handleGetTotalQuantity();
          res.status(200).json({ totalQuantity });
        } else {
          const items = await handleGetItems(req);
          res.status(200).json(items);
        }
        break;
      case 'POST':
        const newItem = await handleCreateItem(req.body);
        res.status(201).json(newItem);
        break;
      case 'PUT':
        const updatedItem = await handleUpdateItem(req.query.id, req.body);
        res.status(200).json(updatedItem);
        break;
      case 'DELETE':
        const result = await handleDeleteItem(req.query.id);
        res.status(200).json(result);
        break;
      case 'PATCH':
        if (req.query.id && req.body.hasOwnProperty('quantity')) {
          const item = await handleUpdateItemQuantity(
            req.query.id,
            req.body.quantity
          );
          res.status(200).json(item);
        } else {
          res.status(400).json({ error: 'Invalid PATCH request' });
        }
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = itemsHandler;
