import axios from 'axios';
import { apiCall, getApiUrl } from '@/services/api';

jest.mock('axios');

describe('api service', () => {
  describe('apiCall', () => {
    it('makes a successful API call', async () => {
      const mockResponse = { data: { success: true } };
      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiCall('get', '/test-url');
      expect(result).toEqual({ success: true });
    });

    it('handles API call errors', async () => {
      const mockError = new Error('API Error');
      mockError.response = { status: 500, data: { error: 'Server Error' } };
      axios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
      });

      await expect(apiCall('get', '/test-url')).rejects.toThrow('API Error');
    });
  });

  describe('getApiUrl', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalCloudUrl = process.env.VUE_APP_API_URL_CLOUD;
    const originalLocalUrl = process.env.VUE_APP_API_URL_LOCAL;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
      process.env.VUE_APP_API_URL_CLOUD = originalCloudUrl;
      process.env.VUE_APP_API_URL_LOCAL = originalLocalUrl;
    });

    it('returns cloud URL in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.VUE_APP_API_URL_CLOUD = 'https://cloud-api.com';
      expect(getApiUrl()).toBe('https://cloud-api.com');
    });

    it('returns local URL in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.VUE_APP_API_URL_LOCAL = 'http://localhost:3000';
      expect(getApiUrl()).toBe('http://localhost:3000');
    });
  });
});
