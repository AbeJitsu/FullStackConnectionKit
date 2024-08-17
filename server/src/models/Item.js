const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot be more than 50 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for efficient querying
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ category: 1 });
itemSchema.index({ price: 1 });
itemSchema.index({ isActive: 1 });

// Virtual for item's URL
itemSchema.virtual('url').get(function () {
  return `/items/${this._id}`;
});

// Method to update quantity
itemSchema.methods.updateQuantity = function (newQuantity) {
  this.quantity = Math.max(0, newQuantity);
  return this.save();
};

// Method to update price
itemSchema.methods.updatePrice = function (newPrice) {
  this.price = Math.max(0, newPrice);
  return this.save();
};

// Method to toggle active status
itemSchema.methods.toggleActive = function () {
  this.isActive = !this.isActive;
  return this.save();
};

// Static method to get total quantity
itemSchema.statics.getTotalQuantity = async function () {
  const result = await this.aggregate([
    { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
  ]);
  return result.length > 0 ? result[0].totalQuantity : 0;
};

// Static method to get items by category
itemSchema.statics.getByCategory = async function (category) {
  return this.find({ category, isActive: true }).sort('name');
};

// Static method to get active items
itemSchema.statics.getActiveItems = async function () {
  return this.find({ isActive: true }).sort('name');
};

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;

// server/src/models/Item.js
