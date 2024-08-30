import { getClientInfo } from '@/utils/helpers';

describe('helpers', () => {
  describe('getClientInfo', () => {
    it('returns correct client info', () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true,
      });

      expect(getClientInfo()).toBe('Running on https://example.com');
    });
  });
});
