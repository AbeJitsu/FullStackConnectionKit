const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Helper function for error handling
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Get all items with pagination and filtering
router.get(
  '/',
  asyncHandler(async (req, res) => {
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

    res.json({
      items,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  })
);

// Get a single item by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  })
);

// Create a new item
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, description, quantity, price, category } = req.body;

    if (!name || typeof quantity !== 'number' || typeof price !== 'number') {
      return res
        .status(400)
        .json({
          message: 'Name, valid quantity, and valid price are required',
        });
    }

    const newItem = new Item({ name, description, quantity, price, category });
    await newItem.save();
    res.status(201).json(newItem);
  })
);

// Update an item
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, description, quantity, price, category } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description, quantity, price, category },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  })
);

// Delete an item
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  })
);

// Get total quantity of all items
router.get(
  '/total-quantity',
  asyncHandler(async (req, res) => {
    const result = await Item.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);
    const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
    res.json({ totalQuantity });
  })
);

// Get items by category
router.get(
  '/category/:category',
  asyncHandler(async (req, res) => {
    const items = await Item.find({ category: req.params.category });
    res.json(items);
  })
);

// Update item quantity
router.patch(
  '/:id/quantity',
  asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    if (typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  })
);

module.exports = router;
// server/src/routes/ItemRoutes.js
