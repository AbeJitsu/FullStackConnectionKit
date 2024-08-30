import { shallowMount } from '@vue/test-utils';
import ApiTestsPanel from '@/components/ApiTestsPanel.vue';

describe('ApiTestsPanel.vue', () => {
  let wrapper;
  const mockApiCall = jest.fn();
  const mockApiUrl = 'http://test-api.com';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    wrapper = shallowMount(ApiTestsPanel, {
      propsData: {
        apiCall: mockApiCall,
      },
      data() {
        return {
          apiUrl: mockApiUrl,
        };
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  describe('Database Test', () => {
    it('calls apiCall when testing database connection', async () => {
      mockApiCall.mockResolvedValue({ status: 'connected' });
      await wrapper.vm.testDatabase();
      expect(mockApiCall).toHaveBeenCalledWith(
        'get',
        `${mockApiUrl}/api/info/database-status`
      );
    });

    it('updates databaseStatus and emits event on success', async () => {
      mockApiCall.mockResolvedValue({ status: 'connected' });
      await wrapper.vm.testDatabase();
      expect(wrapper.vm.databaseStatus).toBe('Database is connected');
      expect(wrapper.emitted('database-status')).toBeTruthy();
      expect(wrapper.emitted('database-status')[0]).toEqual([
        'Database is connected',
      ]);
    });

    it('handles error when testing database connection', async () => {
      mockApiCall.mockRejectedValue(new Error('Database error'));
      await wrapper.vm.testDatabase();
      expect(wrapper.vm.databaseStatus).toContain('Database test failed');
    });
  });

  describe('CORS Test', () => {
    it('calls apiCall twice when testing CORS', async () => {
      mockApiCall.mockResolvedValueOnce({ message: 'GET success' });
      mockApiCall.mockResolvedValueOnce({ message: 'POST success' });
      await wrapper.vm.testCORS();
      expect(mockApiCall).toHaveBeenCalledTimes(2);
      expect(mockApiCall).toHaveBeenCalledWith(
        'get',
        `${mockApiUrl}/api/cors-test`
      );
      expect(mockApiCall).toHaveBeenCalledWith(
        'post',
        `${mockApiUrl}/api/cors-test`,
        { test: 'data' }
      );
    });

    it('updates corsStatus and emits event on success', async () => {
      mockApiCall.mockResolvedValueOnce({ message: 'GET success' });
      mockApiCall.mockResolvedValueOnce({ message: 'POST success' });
      await wrapper.vm.testCORS();
      expect(wrapper.vm.corsStatus).toBe(
        'GET: GET success\nPOST: POST success'
      );
      expect(wrapper.emitted('cors-status')).toBeTruthy();
      expect(wrapper.emitted('cors-status')[0]).toEqual([
        'GET: GET success\nPOST: POST success',
      ]);
    });

    it('handles error when testing CORS', async () => {
      mockApiCall.mockRejectedValue(new Error('CORS error'));
      await wrapper.vm.testCORS();
      expect(wrapper.vm.corsStatus).toContain('CORS test failed');
    });
  });

  describe('Counter Operations', () => {
    it('performs counter operation successfully', async () => {
      wrapper.setData({ counterName: 'testCounter' });
      mockApiCall.mockResolvedValue({ counter: { value: 1 } });
      await wrapper.vm.performCounterOperation('increment');
      expect(mockApiCall).toHaveBeenCalledWith(
        'post',
        `${mockApiUrl}/api/counter-operations`,
        {
          operation: 'increment',
          name: 'testCounter',
        }
      );
      expect(wrapper.vm.counterStatus).toBe(
        "Operation 'increment' successful. New value: 1"
      );
    });

    it('handles error in counter operation', async () => {
      wrapper.setData({ counterName: 'testCounter' });
      mockApiCall.mockRejectedValue(new Error('Counter error'));
      await wrapper.vm.performCounterOperation('increment');
      expect(wrapper.vm.counterStatus).toContain('Counter operation failed');
    });

    it('does not perform operation if counter name is empty', async () => {
      await wrapper.vm.performCounterOperation('increment');
      expect(wrapper.vm.counterStatus).toBe('Please enter a counter name');
      expect(mockApiCall).not.toHaveBeenCalled();
    });
  });

  describe('SSE Functionality', () => {
    let mockEventSource;

    beforeEach(() => {
      mockEventSource = {
        close: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      global.EventSource = jest.fn(() => mockEventSource);
    });

    it('starts SSE connection', () => {
      wrapper.vm.startSSE();
      expect(global.EventSource).toHaveBeenCalledWith(`${mockApiUrl}/api/sse`);
      expect(wrapper.vm.eventSource).toBeTruthy();
    });

    it('stops SSE connection', () => {
      wrapper.vm.eventSource = mockEventSource;
      wrapper.vm.stopSSE();
      expect(mockEventSource.close).toHaveBeenCalled();
      expect(wrapper.vm.eventSource).toBeNull();
      expect(wrapper.vm.sseActive).toBe(false);
    });

    it('handles SSE message', () => {
      const mockEvent = { data: JSON.stringify({ test: 'data' }) };
      wrapper.vm.handleSSEMessage(mockEvent);
      expect(wrapper.vm.sseStatus).toContain('Received update');
    });

    it('handles SSE error', async () => {
      const mockError = new Error('SSE Error');
      jest.spyOn(wrapper.vm, 'scheduleReconnect');

      await wrapper.vm.handleSSEError(mockError);

      expect(wrapper.vm.sseStatus).toContain('SSE connection failed');
      expect(wrapper.vm.sseActive).toBe(false);

      // Wait for $nextTick to complete
      await wrapper.vm.$nextTick();

      // Check if scheduleReconnect is called
      expect(wrapper.vm.scheduleReconnect).toHaveBeenCalledTimes(1);
    });

    it('schedules reconnect', () => {
      jest.spyOn(global, 'setTimeout');
      wrapper.vm.scheduleReconnect();
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 5000);
    });

    it('handles SSE open', () => {
      wrapper.vm.handleSSEOpen();
      expect(wrapper.vm.sseActive).toBe(true);
      expect(wrapper.vm.sseStatus).toBe('SSE started');
    });
  });
});
