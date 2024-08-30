// __mocks__/mongoose.js
const mockSchema = {
  index: jest.fn().mockReturnThis(),
  virtual: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
};

const mongoose = {
  Schema: jest.fn().mockImplementation(() => mockSchema),
  model: jest.fn().mockReturnValue({}),
  connect: jest.fn().mockResolvedValue(),
};

module.exports = mongoose;
