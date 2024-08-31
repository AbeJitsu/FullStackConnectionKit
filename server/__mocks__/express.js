// __mocks__/express.js
const mockRouter = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  use: jest.fn(),
};

const express = jest.fn(() => ({
  use: jest.fn(),
  get: jest.fn(),
  options: jest.fn(),
}));

express.Router = jest.fn(() => mockRouter);

module.exports = express;
