jest.mock('mongoose');
jest.mock('../../src/serverConfig');
jest.mock('../../src/utils/sse-manager');
jest.mock('../../src/utils/middleware');
jest.mock('../../src/models/Item', () => ({}));
jest.mock('../../src/models/Counter', () => ({}));
jest.mock('../../src/db/mongoose', () => ({
  connectToDatabase: jest.fn().mockResolvedValue(),
}));

const mongoose = require('mongoose');
const { createApp } = require('../../src/serverConfig');
const { handleSSEConnection } = require('../../src/utils/sse-manager');
const { applyMiddleware } = require('../../src/utils/middleware');
const { connectToDatabase } = require('../../src/db/mongoose');

describe('API Index Handler', () => {
  let wrappedHandler;
  let mockApp;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockApp = jest.fn((req, res) => res.status(200).send('OK'));
    createApp.mockReturnValue(mockApp);
    handleSSEConnection.mockImplementation((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' });
      res.write('data: connected\n\n');
      res.end();
    });
    applyMiddleware.mockImplementation((handler) => handler);

    mockReq = { url: '/api/test' };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      writeHead: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    jest.isolateModules(() => {
      wrappedHandler = require('../../api/index');
    });
  });

  test('should connect to the database on module import', () => {
    expect(connectToDatabase).toHaveBeenCalled();
  });

  test('should create an app using createApp', () => {
    expect(createApp).toHaveBeenCalled();
  });

  test('should apply middleware to the handler', () => {
    expect(applyMiddleware).toHaveBeenCalledWith(expect.any(Function));
  });

  test('should handle SSE requests', async () => {
    mockReq.url = '/api/sse';
    await wrappedHandler(mockReq, mockRes);
    expect(handleSSEConnection).toHaveBeenCalledWith(mockReq, mockRes);
  });

  test('should handle non-SSE requests using the Express app', async () => {
    await wrappedHandler(mockReq, mockRes);
    expect(mockApp).toHaveBeenCalledWith(mockReq, mockRes);
  });
});
