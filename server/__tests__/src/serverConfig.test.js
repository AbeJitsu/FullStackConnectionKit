const { createApp } = require('../../src/serverConfig');

// Mocks
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    options: jest.fn(),
  };
  const mockExpress = jest.fn(() => mockApp);
  mockExpress.Router = jest.fn(() => ({}));
  mockExpress.json = jest.fn(() => 'jsonMiddleware');
  return mockExpress;
});
jest.mock('cors', () => jest.fn(() => 'corsMiddleware'));
jest.mock('../../src/utils/corsConfig', () => ({
  corsConfig: {},
  validateCorsSetup: jest.fn(),
}));
jest.mock('../../src/middleware/errorHandler', () => 'errorHandlerMiddleware');
jest.mock('../../src/utils/middleware', () => ({
  applyMiddleware: jest.fn(),
}));
jest.mock('../../src/routes/infoRoutes', () => 'infoRoutes');
jest.mock('../../src/routes/itemRoutes', () => 'itemRoutes');
jest.mock('../../src/routes/sseRoute', () => 'sseRoute');
jest.mock('../../src/routes/counterRoutes', () => 'counterRoutes');
jest.mock('../../src/routes/corsTestRoute', () => 'corsTestRoute');
jest.mock('../../api/counter-operations', () => 'counterOperations');

describe('serverConfig', () => {
  let mockApp;
  let express;
  let cors;
  let originalEnv;
  let originalVercel;
  let originalVercelEnv;

  beforeAll(() => {
    express = require('express');
    mockApp = express();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    cors = require('cors');
    originalEnv = process.env.NODE_ENV;
    originalVercel = process.env.VERCEL;
    originalVercelEnv = process.env.VERCEL_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.VERCEL = originalVercel;
    process.env.VERCEL_ENV = originalVercelEnv;
  });

  test('createApp should set up the Express app correctly', () => {
    const app = createApp();

    expect(express).toHaveBeenCalled();
    expect(cors).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('corsMiddleware');
    expect(mockApp.options).toHaveBeenCalledWith('*', 'corsMiddleware');
    expect(express.json).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('jsonMiddleware');

    const { applyMiddleware } = require('../../src/utils/middleware');
    expect(applyMiddleware).toHaveBeenCalledWith(mockApp);

    expect(mockApp.use).toHaveBeenCalledWith('/api/info', 'infoRoutes');
    expect(mockApp.use).toHaveBeenCalledWith('/api/items', 'itemRoutes');
    expect(mockApp.use).toHaveBeenCalledWith('/api/sse', 'sseRoute');
    expect(mockApp.use).toHaveBeenCalledWith('/api/cors-test', 'corsTestRoute');

    expect(mockApp.get).toHaveBeenCalledWith(
      '/api/info/database-status',
      expect.any(Function)
    );
    expect(mockApp.use).toHaveBeenCalledWith('errorHandlerMiddleware');
    expect(app).toBe(mockApp);
  });

  test('createApp should use production counter operations when in production', () => {
    process.env.NODE_ENV = 'production';
    createApp();
    expect(mockApp.use).toHaveBeenCalledWith(
      '/api/counter-operations',
      'counterOperations'
    );
  });

  test('createApp should use production counter operations when in Vercel production', () => {
    process.env.NODE_ENV = 'development';
    process.env.VERCEL = '1';
    process.env.VERCEL_ENV = 'production';
    createApp();
    expect(mockApp.use).toHaveBeenCalledWith(
      '/api/counter-operations',
      'counterOperations'
    );
  });

  test('createApp should use development counter routes when not in production', () => {
    process.env.NODE_ENV = 'development';
    process.env.VERCEL = undefined;
    process.env.VERCEL_ENV = undefined;
    createApp();
    expect(mockApp.use).toHaveBeenCalledWith(
      '/api/counter-operations',
      'counterRoutes'
    );
  });
});
